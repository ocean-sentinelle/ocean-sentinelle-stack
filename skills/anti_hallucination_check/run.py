def run(payload: dict) -> dict:
    evidence = set(payload.get("evidence_ids", []))
    missing = [c for c in payload["claims"] if not evidence]
    if missing:
        return {"status":"needs_review","missing_evidence":missing,"notes":"Ajouter des preuves (IDs) issues RAG/DB."}
    return {"status":"pass","missing_evidence":[],"notes":"OK (bootstrap). Remplacer par un vrai claim-checker."}
