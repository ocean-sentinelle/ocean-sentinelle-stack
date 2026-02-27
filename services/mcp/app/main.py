from fastapi import FastAPI, Header, HTTPException
import os, yaml, pathlib

app = FastAPI(title="Ocean Sentinel MCP Gateway (bootstrap)", version="0.1.0")
BASE = pathlib.Path("/app/app")
ADMIN_TOKEN = os.getenv("MCP_ADMIN_TOKEN","")

def require_admin(token: str | None):
    if not ADMIN_TOKEN:
        raise HTTPException(500, "MCP_ADMIN_TOKEN not set")
    if token != ADMIN_TOKEN:
        raise HTTPException(401, "unauthorized")

@app.get("/health")
def health():
    return {"status":"ok", "mode":"bootstrap"}

@app.get("/policies")
def policies(x_admin_token: str | None = Header(default=None)):
    require_admin(x_admin_token)
    p = BASE / "policies" / "rbac.yaml"
    return {"rbac": yaml.safe_load(p.read_text(encoding="utf-8"))}

@app.get("/servers")
def servers(x_admin_token: str | None = Header(default=None)):
    require_admin(x_admin_token)
    srv_dir = BASE / "servers"
    return {f.name: f.read_text(encoding="utf-8") for f in srv_dir.glob("*.json")}
