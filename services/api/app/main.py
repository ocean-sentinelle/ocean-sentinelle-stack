from fastapi import FastAPI, HTTPException, Query, Request
from fastapi.responses import Response
from datetime import datetime, timedelta, timezone
import math
import os

import psycopg
from psycopg.rows import dict_row

from prometheus_client import CONTENT_TYPE_LATEST, generate_latest

from .logging import log

app = FastAPI(title="Ocean Sentinel API (prod-mvp)", version="0.2.0")


def compute_iob(omega_now: float, omega_24h: float, omega_72h: float) -> dict:
    for name, value in (("omega_now", omega_now), ("omega_24h", omega_24h), ("omega_72h", omega_72h)):
        if not math.isfinite(value):
            raise HTTPException(status_code=400, detail=f"{name} must be a finite number")

    # --- Étape 1 : score de base ---
    if omega_now >= 2.2:
        level = 0
    elif omega_now >= 1.9:
        level = 1
    elif omega_now >= 1.7:
        level = 2
    else:
        level = 3

    # --- Étape 2 : tendances (24h + 72h) ---
    delta_24h = omega_now - omega_24h
    delta_72h = omega_now - omega_72h

    threshold = 0.2
    adjust = 0
    if delta_24h <= -threshold or delta_72h <= -threshold:
        adjust = 1
    elif delta_24h >= threshold and delta_72h >= threshold:
        adjust = -1

    level = max(0, min(3, level + adjust))

    return {
        "iob_level": level,
        "omega_now": omega_now,
        "omega_24h": omega_24h,
        "omega_72h": omega_72h,
        "delta_24h": round(delta_24h, 3),
        "delta_72h": round(delta_72h, 3),
    }


def _get_iob_card_copy(iob_level: int) -> dict:
    if iob_level <= 0:
        return {
            "status": "green",
            "title": "Situation favorable",
            "description": "La saturation est au-dessus des seuils de confort pour la calcification.",
            "action": "Maintenir les procédures usuelles.",
        }
    if iob_level == 1:
        return {
            "status": "yellow",
            "title": "Vigilance",
            "description": "La saturation baisse et peut se rapprocher de seuils plus contraignants.",
            "action": "Surveiller les manipulations sensibles et renforcer le suivi.",
        }
    if iob_level == 2:
        return {
            "status": "orange",
            "title": "Stress potentiel",
            "description": "La saturation approche des seuils contraignants pour la calcification.",
            "action": "Adapter les manipulations sensibles.",
        }
    return {
        "status": "red",
        "title": "Stress élevé",
        "description": "La saturation est sous des seuils critiques pour la calcification.",
        "action": "Réduire les expositions et déclencher les mesures de mitigation.",
    }


def _database_url() -> str:
    dsn = os.getenv("DATABASE_URL")
    if not dsn:
        raise HTTPException(status_code=500, detail="DATABASE_URL is not configured")
    return dsn


def _ensure_aware_utc(dt: datetime) -> datetime:
    if dt.tzinfo is None:
        return dt.replace(tzinfo=timezone.utc)
    return dt.astimezone(timezone.utc)

@app.middleware("http")
async def access_log(request: Request, call_next):
    log("http_request", method=request.method, path=str(request.url.path))
    resp = await call_next(request)
    log("http_response", method=request.method, path=str(request.url.path), status=resp.status_code)
    return resp


@app.get("/metrics")
def metrics():
    return Response(generate_latest(), media_type=CONTENT_TYPE_LATEST)

@app.get("/health")
@app.get("/api/v1/health")
def health():
    return {"status": "ok", "version": "0.2.0"}


@app.get("/api/v1/iob")
def iob(
    omega_now: float = Query(..., description="Ωarag now"),
    omega_24h: float = Query(..., description="Ωarag 24h ago"),
    omega_72h: float = Query(..., description="Ωarag 72h ago"),
):
    return compute_iob(omega_now=omega_now, omega_24h=omega_24h, omega_72h=omega_72h)


@app.get("/api/v1/iob/card")
def iob_card(
    zone_id: str = Query("62581", description="Zone/site id", alias="zone_id"),
    station_id: str | None = Query(None, description="Alias of zone_id"),
    zone_type: str = Query("site", description="Zone type"),
):
    dsn = _database_url()
    now_utc = datetime.now(timezone.utc)

    resolved_zone_id = station_id or zone_id

    try:
        with psycopg.connect(dsn, row_factory=dict_row) as conn:
            with conn.cursor() as cur:
                cur.execute(
                    """
                    SELECT value, uncertainty, time_end
                    FROM public.indicators
                    WHERE zone_id = %s AND zone_type = %s AND indicator_id = 'omega_arag'
                    ORDER BY time_end DESC
                    LIMIT 1
                    """,
                    (resolved_zone_id, zone_type),
                )
                latest = cur.fetchone()

                if not latest or latest.get("value") is None or latest.get("time_end") is None:
                    return {
                        "zone": resolved_zone_id,
                        "zone_type": zone_type,
                        "timestamp": now_utc.isoformat(),
                        "status": "no_data",
                    }

                latest_ts = _ensure_aware_utc(latest["time_end"])
                omega_now = float(latest["value"])
                unc = latest.get("uncertainty")

                cur.execute(
                    """
                    SELECT
                        percentile_cont(0.5) WITHIN GROUP (ORDER BY value) AS median_24h,
                        MIN(time_end) AS oldest
                    FROM public.indicators
                    WHERE zone_id = %s AND zone_type = %s AND indicator_id = 'omega_arag'
                      AND time_end > (%s - interval '24 hours')
                    """,
                    (resolved_zone_id, zone_type, latest_ts),
                )
                res_24 = cur.fetchone() or {}

                cur.execute(
                    """
                    SELECT
                        percentile_cont(0.5) WITHIN GROUP (ORDER BY value) AS median_72h,
                        MIN(time_end) AS oldest
                    FROM public.indicators
                    WHERE zone_id = %s AND zone_type = %s AND indicator_id = 'omega_arag'
                      AND time_end > (%s - interval '72 hours')
                    """,
                    (resolved_zone_id, zone_type, latest_ts),
                )
                res_72 = cur.fetchone() or {}

                oldest_24 = res_24.get("oldest")
                oldest_72 = res_72.get("oldest")

                history_hours_24 = 0.0
                if oldest_24 is not None:
                    history_hours_24 = (latest_ts - _ensure_aware_utc(oldest_24)).total_seconds() / 3600.0

                history_hours_72 = 0.0
                if oldest_72 is not None:
                    history_hours_72 = (latest_ts - _ensure_aware_utc(oldest_72)).total_seconds() / 3600.0

                median_24h = res_24.get("median_24h")
                median_72h = res_72.get("median_72h")

                omega_24h = float(median_24h) if median_24h is not None else None
                omega_72h = float(median_72h) if median_72h is not None else None

                progress_24 = min(max(history_hours_24 / 24.0, 0.0), 1.0)
                progress_72 = min(max(history_hours_72 / 72.0, 0.0), 1.0)
                reliability = "stable" if progress_72 >= 1.0 else "stabilizing"

                payload = {
                    "zone": f"{resolved_zone_id}",
                    "zone_id": resolved_zone_id,
                    "zone_type": zone_type,
                    "timestamp": latest_ts.isoformat(),
                    "omega_now": round(omega_now, 2),
                    "omega_24h": round(omega_24h, 2) if omega_24h is not None else None,
                    "omega_72h": round(omega_72h, 2) if omega_72h is not None else None,
                    "delta_24h": round(omega_now - omega_24h, 3) if omega_24h is not None else None,
                    "delta_72h": round(omega_now - omega_72h, 3) if omega_72h is not None else None,
                    "unc": float(unc) if unc is not None else None,
                    "status": "active",
                    "history": {
                        "hours": {
                            "h24": round(history_hours_24, 2),
                            "h72": round(history_hours_72, 2),
                        },
                        "progress": {
                            "h24": round(progress_24, 4),
                            "h72": round(progress_72, 4),
                        },
                        "reliability": reliability,
                    },
                }

                iob_24h = omega_24h if omega_24h is not None else omega_now
                iob_72h = omega_72h if omega_72h is not None else omega_now
                iob_res = compute_iob(omega_now=omega_now, omega_24h=iob_24h, omega_72h=iob_72h)
                payload["iob_level"] = iob_res["iob_level"]
                card_copy = _get_iob_card_copy(iob_res["iob_level"])
                payload["risk_status"] = card_copy.get("status")
                for k, v in card_copy.items():
                    if k != "status":
                        payload[k] = v
                payload["history"]["fallback"] = {
                    "omega_24h": "median_window" if omega_24h is not None else "fallback_now",
                    "omega_72h": "median_window" if omega_72h is not None else "fallback_now",
                }

                return payload
    except HTTPException:
        raise
    except Exception as e:
        log("iob_card_error", error=str(e), zone_id=resolved_zone_id)
        raise HTTPException(status_code=500, detail="Internal analysis error")

@app.get("/")
def root():
    return {
        "service": "ocean-sentinel-api",
        "note": "Prod MVP: add endpoints for indicators, RAG retrieval, exports.",
        "truth_rule": "source/date/method/uncertainty/version + measured|inferred|simulated"
    }
