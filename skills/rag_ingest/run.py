import hashlib
def run(payload: dict) -> dict:
    content = payload["content"]
    h = hashlib.sha1(content.encode("utf-8")).hexdigest()[:10]
    return {"doc_id": payload["doc_id"],
            "chunks":[{"chunk_id": f"{payload['doc_id']}_{h}_0001", "text": content}],
            "truth_status":"inferred","confidence":"medium"}
