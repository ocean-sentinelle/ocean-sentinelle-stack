def clamp01(x: float) -> float:
    return max(0.0, min(1.0, x))
def run(payload: dict) -> dict:
    temp, ph, sal = payload["temp_c"], payload["ph_total"], payload["salinity_psu"]
    IT = clamp01((temp - 14.0) / 10.0)
    IA = clamp01((8.1 - ph) / 0.6)
    IS = clamp01((33.0 - sal) / 8.0)
    IExp = clamp01(0.45*IT + 0.35*IA + 0.20*IS)
    IVul = 0.50
    IRisk = clamp01(IExp * IVul)
    return {"site_id":payload["site_id"],"IT":IT,"IA":IA,"IS":IS,"IExp":IExp,"IVul":IVul,"IRisk":IRisk,
            "truth_status":"inferred","confidence":"medium",
            "provenance":{"data_version":"v1.0.0","model_version":"v1.0.0","scenario_version":None,"window_days":payload.get("window_days",30)}}
