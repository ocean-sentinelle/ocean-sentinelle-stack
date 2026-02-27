# Ocean Sentinel — Production Minimal Viable Pack (v2)
Date: 2026-02-17

Ce pack étend le bootstrap v1 pour fournir un **MVP production minimal** :
- Reverse-proxy **Caddy** (TLS automatique Let's Encrypt) pour oceansentinelle.org et oceansentinelle.fr
- Postgres + pgvector + **schéma** (documents, chunks, embeddings, indicators, audit_log)
- Rôles DB : readonly / writer
- Logs structurés (JSON) + **audit log** agentique dans Postgres
- Skill `export_report` : export MD (et gabarit PDF) conforme traçabilité + statut vérité

Priorités: Stabilité > Sécurité > Clarté > Performance > IA avancée

## Démarrage rapide (prod)
1) Copier `.env.prod.example` → `.env.prod` et remplacer secrets + emails/hosts.
2) DNS: pointer A/AAAA de `oceansentinelle.org` et `oceansentinelle.fr` vers le VPS.
3) Lancer :
```bash
docker compose -f docker-compose.prod.yml --env-file .env.prod up -d
```
4) Vérifier :
- https://oceansentinelle.org/api/health
- https://oceansentinelle.org/mcp/health

## Notes sécurité
- MCP admin endpoint protégé par token.
- Par défaut : connecteurs read-only (write sous validation humaine).
- Ne jamais exposer Postgres sur Internet en prod.
