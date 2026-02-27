# VPS Hardening (MVP)
- SSH: clés uniquement, root login off, fail2ban
- Firewall: exposer uniquement 80/443 (et ports admin temporaires)
- Secrets: .env hors repo, tokens à privilèges minimaux, rotation
- Backups: DB quotidien + test restore mensuel
- Monitoring: santé containers + disque + alertes
- WordPress: comptes séparés + app passwords + plugins minimaux + MAJ
