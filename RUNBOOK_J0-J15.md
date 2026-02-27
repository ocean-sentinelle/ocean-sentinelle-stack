# Runbook J0–J15 — MVP Production Minimal (Ocean Sentinel)

## J0–J1 — DNS & accès
- [ ] DNS A/AAAA: oceansentinelle.org + oceansentinelle.fr → VPS
- [ ] SSH: clés uniquement, root off, fail2ban
- [ ] Firewall: ouvrir 80/443, restreindre SSH

## J2 — Déploiement conteneurs
- [ ] Copier .env.prod.example → .env.prod (secrets forts)
- [ ] Lancer: docker compose -f docker-compose.prod.yml --env-file .env.prod up -d
- [ ] Vérifier TLS: https://.../api/health

## J3 — DB & rôles
- [ ] Vérifier extensions pgvector + tables (documents/chunks/embeddings/indicators/audit_log)
- [ ] Créer un compte os_readonly (mot de passe fort, permissions SELECT)

## J4 — Observabilité
- [ ] Activer logs JSON API (déjà intégré) + rotation logs Docker (daemon.json)
- [ ] Définir une rétention (7–14 jours) + export mensuel si besoin

## J5 — Démo end-to-end (sans données externes)
- [ ] Worker: générer sample outputs
- [ ] Skill export_report: produire /app/runtime/report_site_demo_01.md
- [ ] Vérifier conformité (statut vérité + provenance + limites)

## J6–J15 — Durcissement & préparation MVP données
- [ ] Backups: dump Postgres quotidien + test restore
- [ ] Connecteurs MCP read-only: WP/GitHub/logs
- [ ] Préparer 1 corpus doc (public) pour ingestion RAG
- [ ] Définir périmètre site pilote + variables minimales
