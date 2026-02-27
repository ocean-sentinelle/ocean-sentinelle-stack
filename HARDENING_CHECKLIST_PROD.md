# Hardening PROD (complément)
- [ ] TLS auto (Caddy) + redirection HTTP->HTTPS
- [ ] Docker logs: limiter taille (log-opts max-size/max-file)
- [ ] Postgres: pas de port exposé, réseau interne uniquement
- [ ] Comptes séparés: readonly vs writer
- [ ] Rotation tokens: WP/GitHub trimestrielle (min) et après incident
- [ ] Audit: table audit_log alimentée (à brancher aux outils MCP dès itération suivante)
