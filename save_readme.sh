#!/usr/bin/env bash
set -euo pipefail

cat > README.md <<'EOF'
# 🛰️ OCÉAN-SENTINELLE (v14.0)
**Plateforme souveraine de surveillance et d’expertise de l’acidification océanique**

## 🌊 Présentation du projet
OCÉAN-SENTINELLE est une infrastructure numérique de confiance conçue pour protéger la filière ostréicole du Bassin d’Arcachon. Face au franchissement de la 7ème limite planétaire (acidification), la mission est de transformer des flux biogéochimiques haute fréquence en **preuves juridiques certifiées**.

Le système surveille en temps réel l’état de saturation de l’aragonite (**Ωarag**), paramètre critique pour la survie du naissain, et génère des rapports d’expertise scellés conformes aux exigences de la DDTM pour les dossiers de Calamités Agricoles.

## 🚀 Architecture technique (stack souveraine)
Infrastructure entièrement conteneurisée sur le serveur **srv1341436**.

- **Backend**: FastAPI (Python 3.10) — moteur de calcul thermodynamique (Skill ΩArag)
- **Frontend**: React 18 + Tailwind CSS — dashboard “Control Tower” (monitoring & archives)
- **Base de données**: PostgreSQL — stockage des séries temporelles (Bouée 13, station 62581)
- **Gateway**: Caddy — reverse proxy + gestion TLS
- **Certification**: LaTeX & pyHanko — génération de PDF scellés PAdES-LTV

## 🔬 Méthodologie : “Modèle d’Hiroshima”
Équation de résilience systémique :

\[
R = H + F + G + S
\]

Hydrodynamique, Filtration bio, Gestion IA, Surveillance.

Cette approche permet de piloter la production ostréicole selon des seuils de bascule physiologiques, notamment **Ωarag < 1,7**.

## ⚖️ Conformité juridique
OCÉAN-SENTINELLE agit comme un **tiers de confiance** :

- **eIDAS**: signature électronique pour l’opposabilité administrative
- **PAdES-LTV**: validation long-terme garantissant l’intégrité de la preuve pendant 30 ans

## 🛠️ Déploiement rapide

```bash
docker compose -f docker-compose.prod.yml up -d --build
```

## 👥 Contact
Administrateur : **admin@oceansentinelle.fr**

> « Ce que l’on ne mesure pas, on ne peut pas le protéger. »
EOF

echo "README.md updated"
