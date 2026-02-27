# AGENTS.md — Ocean Sentinel (interne)
Date: 2026-02-17

## Priorité
Stabilité > Sécurité > Clarté > Performance > IA avancée

## Règle d’or
Toute valeur/affirmation doit fournir : source • date • méthode • incertitude • version + statut mesuré|inféré|simulé.

## Stack MVP
- WordPress public (.org / .fr)
- Backend (API + worker skills) sur VPS
- Postgres + pgvector (RAG)
- MCP gateway (read-first) + audit (à implémenter)

## Sécurité
- Secrets hors repo (.env), RBAC, write sous validation humaine (H-AI-H)
- Logs structurés

## RAG
- Ingestion versionnée, citations internes, refus si pas de preuve
