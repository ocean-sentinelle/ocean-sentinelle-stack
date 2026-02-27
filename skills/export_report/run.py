from pathlib import Path

def run(payload: dict) -> dict:
    out_path = Path(payload["output_path"])
    out_path.parent.mkdir(parents=True, exist_ok=True)

    lines = []
    lines.append(f"# {payload['title']}\n")
    lines.append(f"**Zone**: {payload['zone_type']} — `{payload['zone_id']}`  ")
    lines.append(f"**Période**: {payload['period']}\n")
    lines.append("## Résultats clés\n")
    for k in payload["key_findings"]:
        lines.append(f"- {k}")
    lines.append("\n## Indicateurs (avec statut de vérité)\n")
    for it in payload["indicators"]:
        v = it.get("value")
        unit = it.get("unit") or ""
        lines.append(f"- **{it['indicator_id']}**: {v} {unit} — *{it['truth_status']}*, confiance *{it['confidence']}*")
        prov = it.get("provenance", {})
        if prov:
            lines.append(f"  - provenance: data={prov.get('data_version')} model={prov.get('model_version')} scenario={prov.get('scenario_version')}")
    lines.append("\n## Limites & incertitudes\n")
    for lim in payload["limitations"]:
        lines.append(f"- {lim}")
    lines.append("\n## Sources\n")
    for s in payload["sources"]:
        sd = s.get("source_date") or "n/a"
        notes = s.get("notes") or ""
        lines.append(f"- {s['source_name']} (date: {sd}) {notes}".rstrip())
    lines.append("\n---\n")
    lines.append("Règle d’or : source • date • méthode • incertitude • version + statut mesuré|inféré|simulé.\n")

    out_path.write_text("\n".join(lines), encoding="utf-8")
    return {"status":"ok", "written_to": str(out_path)}
