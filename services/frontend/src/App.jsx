import React, { useState, useEffect } from 'react';
import { 
  Waves, Activity, Microscope, Database, Lock, ChevronRight, 
  Info, BarChart3, ShieldCheck, Compass, Anchor, Thermometer,
  Wind, Droplet, Menu, X, ArrowRight, Scale
} from 'lucide-react';

/**
 * OCEAN SENTINELLE v8.0 - ÉDITION SOUVERAINE BASSIN D'ARCACHON
 * DESIGN SYSTEM :
 * - Typography: Playfair Display (Titles), Inter (Body), JetBrains Mono (Data)
 * - Palette: Ocean Deep (#0E2A3A), Lagoon (#1F4E5F), Sand (#D9CBB6), Salt (#F4F6F6)
 */

const API_BASE = window.location.origin;

export default function App() {
  const [activeTab, setActiveTab] = useState('bassin');
  const [segment, setSegment] = useState('comprendre');

  // Sync data-segment attribute on <html>
  useEffect(() => {
    document.documentElement.setAttribute('data-segment', segment);
  }, [segment]);

  const [metrics, setMetrics] = useState({
    arag: 1.74,
    ph: 8.06,
    salinity: 28.5,
    temp: 14.2
  });

  const [iobCard, setIobCard] = useState(null);

  useEffect(() => {
    // API live fetch
    const fetchLive = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/v1/metrics/live`);
        if (res.ok) {
          const data = await res.json();
          setMetrics(prev => ({
            ...prev,
            arag: typeof data.arag === 'number' ? data.arag : prev.arag,
            ph: typeof data.ph === 'number' ? data.ph : prev.ph,
            salinity: typeof data.sal === 'number' ? data.sal : prev.salinity,
          }));
        }

        const cardRes = await fetch(`${API_BASE}/api/v1/iob/card`);
        if (cardRes.ok) {
          const card = await cardRes.json();
          setIobCard(card);
          if (typeof card?.omega_now === 'number') {
            setMetrics(prev => ({ ...prev, arag: card.omega_now }));
          }
        }
      } catch (e) { console.error("Sync Error:", e); }
    };
    fetchLive();
    const apiFetch = setInterval(fetchLive, 15000);

    // Simulation du flux biogéochimique
    const simulation = setInterval(() => {
      setMetrics(prev => ({
        ...prev,
        arag: Number((prev.arag + (Math.random() - 0.5) * 0.02).toFixed(2)),
        ph: Number((prev.ph + (Math.random() - 0.5) * 0.01).toFixed(2))
      }));
    }, 4000);

    return () => {
      clearInterval(apiFetch);
      clearInterval(simulation);
    };
  }, []);

  return (
    <div className="min-h-screen">
      {/* INJECTION DES DESIGN TOKENS ET CLASSES UI DANS LE SCOPE */}
      <style>{`
        body {
          font-family: var(--os-font-body);
          background: var(--ui-bg);
          color: var(--ui-text);
        }

        .os-title { font-family: var(--os-font-title); }
        .os-mono { font-family: var(--os-font-mono); }

        .kicker {
          display: inline-flex; align-items: center; gap: .5rem;
          font-family: var(--os-font-mono);
          font-size: .75rem; font-weight: 600; letter-spacing: .08em;
          color: var(--ui-accent); text-transform: uppercase;
        }
        .kicker::before {
          content: ""; width: 8px; height: 8px; border-radius: 999px;
          background: var(--os-sand-200);
          box-shadow: 0 0 0 4px rgba(217,203,182,.30);
        }

        .card-premium {
          background: var(--ui-surface);
          border: 1px solid var(--os-border);
          border-radius: var(--os-r-xl);
          box-shadow: var(--os-shadow);
          padding: 2.5rem;
          transition: all 0.3s ease;
        }
        .card-premium:hover {
          border-color: var(--os-border-strong);
          transform: translateY(-2px);
        }

        .metric-row {
          display: flex; align-items: baseline; justify-content: space-between;
          padding: 1rem 0; border-bottom: 1px solid rgba(244,246,246,0.15);
        }

        .btn-os-primary {
          background: var(--os-ocean-900);
          color: var(--os-salt-50);
          padding: 1rem 1.5rem;
          border-radius: var(--os-r-md);
          font-weight: 650;
          font-size: 0.85rem;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          transition: all 0.2s ease;
        }
        .btn-os-primary:hover {
          background: var(--os-lagoon-700);
          transform: translateY(-1px);
        }

        .nav-link {
          font-size: 0.75rem; font-weight: 650; text-transform: uppercase;
          letter-spacing: 0.15em; color: var(--os-kelp-500);
          transition: color 0.2s ease;
        }
        .nav-link.active { color: var(--ui-text); border-bottom: 2px solid var(--ui-accent); }
      `}</style>

      {/* --- TOPBAR --- */}
      <div className="topbar">
        <div className="container topbar-inner">
          <div className="brand" onClick={() => setActiveTab('bassin')}>
            <div className="brand-mark" />
            <div>
              Ocean Sentinelle<br />
              <small>Bassin d'Arcachon</small>
            </div>
          </div>

          <nav className="nav">
            {[
              { id: 'bassin', label: 'Le Bassin' },
              { id: 'donnees', label: 'Données' },
              { id: 'filiere', label: 'Filière' },
              { id: 'institutions', label: 'Institutions' },
              { id: 'pro', label: 'Espace Pro' }
            ].map(({ id, label }) => (
              <a
                key={id}
                href={`/${id}`}
                className={activeTab === id ? 'active' : ''}
                onClick={(e) => { e.preventDefault(); setActiveTab(id); }}
              >
                {label}
              </a>
            ))}
          </nav>

          <div className="segment-switch" role="group" aria-label="Pilier">
            {['comprendre', 'observer', 'soutenir', 'analyser', 'agir'].map((seg) => (
              <button
                key={seg}
                className="seg-btn"
                aria-pressed={segment === seg}
                onClick={() => setSegment(seg)}
              >
                {seg.charAt(0).toUpperCase() + seg.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* --- RENDERER --- */}
      <div>
        {activeTab === 'bassin' && (
          <div>
            {/* HERO SECTION */}
            <header className="hero">
              <div className="container hero-inner">
                <div>
                  <div className="kicker">Comprendre — Grand Public</div>
                  <h1>Acidification du Bassin d'Arcachon</h1>
                  <p>Le Bassin est un système chimique vivant. Ocean Sentinelle rend visible sa variabilité pour protéger l'ostréiculture et informer le territoire.</p>

                  <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginTop: '18px' }}>
                    <a className="btn btn-primary" href="/comprendre/systeme-carbonate" onClick={(e) => { e.preventDefault(); setActiveTab('donnees'); }}>
                      Découvrir le système carbonate
                    </a>
                    <a className="btn btn-secondary" href="/donnees/indicateurs" onClick={(e) => { e.preventDefault(); setActiveTab('donnees'); }}>
                      Voir les indicateurs
                    </a>
                    <span className="chip"><span className="dot" /> Local • Mesurable • Traçable</span>
                  </div>
                </div>

                <aside className="panel-dark">
                  <h3 style={{ marginTop: 0 }}>Ce que vous verrez ici</h3>
                  <div className="metric"><div className="label">Ωarag</div><div className="value">{metrics.arag.toFixed(2)}</div></div>
                  <div className="metric"><div className="label">Salinité</div><div className="value">{metrics.salinity.toFixed(1)} PSU</div></div>
                  <div className="metric"><div className="label">pH</div><div className="value">{metrics.ph.toFixed(2)}</div></div>

                  <div style={{ marginTop: '14px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: '10px', alignItems: 'baseline' }}>
                      <small>Historique (72h)</small>
                      <small className="os-mono" style={{ opacity: 0.75 }}>
                        {Math.round(((iobCard?.history?.progress?.h72 ?? 0) * 100))}%
                        {iobCard?.history?.reliability ? ` • ${iobCard.history.reliability}` : ''}
                      </small>
                    </div>
                    <div
                      className={`progress-blue progress--${iobCard?.risk_status || 'blue'}`}
                      aria-label="Progression historique 72h"
                    >
                      <span style={{ width: `${Math.round(((iobCard?.history?.progress?.h72 ?? 0) * 100))}%` }} />
                    </div>
                  </div>

                  <p style={{ marginTop: '14px' }}><small>Pas de jargon gratuit : chaque indicateur sert à comprendre et anticiper.</small></p>
                </aside>
              </div>
            </header>

            {/* BENTO GRID SECTIONS */}
            <section className="max-w-7xl mx-auto px-6 pb-40">
              <div className="grid md:grid-cols-3 gap-8">
                <div className="card-premium">
                  <h3 className="os-title text-xl mb-4 font-bold">Le Bassin n'est pas un décor</h3>
                  <p className="text-sm text-[#5F6B6D] leading-relaxed">
                    Lagune semi-fermée, marées atlantiques, apports de la Leyre : la variabilité chimique ici est rapide, extrême et structurante pour le vivant.
                  </p>
                </div>
                <div className="card-premium bg-gradient-to-b from-[#F4F6F6] to-white">
                  <h3 className="os-title text-xl mb-4 font-bold">Pourquoi Ωarag est central</h3>
                  <p className="text-sm text-[#5F6B6D] leading-relaxed">
                    Le pH ne suffit pas. L'indice Ωarag gouverne la thermodynamique de calcification, facteur critique de survie aux premiers stades larvaires.
                  </p>
                </div>
                <div className="card-premium">
                  <h3 className="os-title text-xl mb-4 font-bold">Observer pour agir</h3>
                  <p className="text-sm text-[#5F6B6D] leading-relaxed">
                    Mesures HF, ancrage TA/DIC et calculs rigoureux. Nous transformons la donnée brute en indicateur décisionnel pour l'ostréiculture.
                  </p>
                </div>
              </div>

              {/* SECTION ΩARAG CALL TO ACTION */}
              <div className="mt-20 card-premium flex flex-col md:flex-row justify-between items-center gap-10 border-l-8 border-l-[#1F4E5F]">
                <div className="space-y-4 max-w-2xl text-left">
                  <div className="kicker">Système carbonate</div>
                  <h2 className="os-title text-3xl italic text-[#0E2A3A]">Ωarag : Indicateur décisionnel</h2>
                  <p className="text-sm text-[#5F6B6D]">
                    Conversion des mesures locales (T, S, pH + TA/DIC) en Ωarag avec incertitudes. Nous identifions les fenêtres à risque avant l'observation de mortalité.
                  </p>
                </div>
                <div className="flex gap-4">
                  <button onClick={() => setActiveTab('donnees')} className="btn-os-primary whitespace-nowrap">Ouvrir l'Observatoire</button>
                  <button onClick={() => setActiveTab('filiere')} className="btn-os-primary bg-[#F4F6F6] !text-[#0E2A3A] border border-[#0E2A3A]/10 whitespace-nowrap">Lire la méthode</button>
                </div>
              </div>
            </section>
          </div>
        )}

        {activeTab === 'donnees' && (
          <section className="section">
            <div className="container">
              <div className="card">
                <div className="card-title">
                  <div>
                    <div className="kicker">Observer — Chercheurs</div>
                    <h2>Observations &amp; Métadonnées</h2>
                    <p>Accès aux séries, incertitudes, calibration, provenance. Export reproductible.</p>
                  </div>
                  <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                    <a className="btn btn-secondary" href="/api" onClick={(e) => e.preventDefault()}>API</a>
                    <a className="btn btn-ghost" href="/docs/methodes" onClick={(e) => { e.preventDefault(); setActiveTab('filiere'); }}>Méthodes</a>
                  </div>
                </div>

                <div className="hr" />

                <table className="table">
                  <thead>
                    <tr>
                      <th>Signal</th><th>Fréquence</th><th>QA/QC</th><th>Export</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr><td>Température</td><td>HF</td><td>OK</td><td>CSV/Parquet</td></tr>
                    <tr><td>Salinité</td><td>HF</td><td>OK</td><td>CSV/Parquet</td></tr>
                    <tr><td>pH</td><td>HF</td><td>En cours</td><td>CSV</td></tr>
                    <tr><td>TA/DIC</td><td>LF</td><td>OK</td><td>PDF/JSON</td></tr>
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        )}

        {activeTab === 'filiere' && (
          <section className="section">
            <div className="container grid grid-2">
              <div className="card">
                <div className="kicker">Soutenir — Ostréiculteurs</div>
                <h2 style={{ fontFamily: 'var(--os-font-title)', fontSize: 'var(--os-h2)', fontWeight: 700, color: 'var(--ui-text)', margin: 'var(--os-s1) 0 var(--os-s2)' }}>
                  Votre lecture du risque (simple)
                </h2>
                <p style={{ fontSize: 'var(--os-small)', color: 'var(--ui-muted)', lineHeight: 1.55 }}>
                  Pas de courbes inutiles. Vous voyez l'essentiel : statut, tendance, et quoi faire.
                </p>

                <div className="alert alert--warning" style={{ marginTop: '16px' }}>
                  <div className="icon">!</div>
                  <div>
                    <strong>Risque en hausse (72h)</strong>
                    <small>Ωarag approche du seuil. Surveillez les fenêtres de manipulation du naissain.</small>
                    <div style={{ marginTop: '10px', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                      <a className="btn btn-primary" href="/filiere/guide-actions" onClick={(e) => e.preventDefault()}>Que faire maintenant</a>
                      <a className="btn btn-secondary" href="/pro/alertes" onClick={(e) => { e.preventDefault(); setActiveTab('pro'); }}>Activer les alertes</a>
                    </div>
                  </div>
                </div>
              </div>

              <div className="card card-soft">
                <div className="kicker">Rétention</div>
                <h3>Pourquoi on revient</h3>
                <p>Parce que la page donne une décision claire, tous les jours :</p>
                <ul style={{ margin: 0, paddingLeft: '1.1rem', color: 'var(--ui-muted)' }}>
                  <li>Statut Vert/Orange/Rouge</li>
                  <li>Tendance 24h / 72h</li>
                  <li>Action recommandée</li>
                </ul>
              </div>
            </div>
          </section>
        )}

        {activeTab === 'institutions' && (
          <section className="section">
            <div className="container">
              <div className="card">
                <div className="kicker">Analyser — Institutions</div>
                <h2 style={{ fontFamily: 'var(--os-font-title)', fontSize: 'var(--os-h2)', fontWeight: 700, color: 'var(--ui-text)', margin: 'var(--os-s1) 0 var(--os-s2)' }}>
                  Note de situation (synthèse)
                </h2>
                <p style={{ fontSize: 'var(--os-small)', color: 'var(--ui-muted)', lineHeight: 1.55 }}>
                  Indicateurs agrégés, zones, épisodes marquants, et éléments de compréhension. Lisible en 2 minutes.
                </p>

                <div className="hr" />

                <div className="grid grid-3">
                  <div className="card card-soft">
                    <h3>Épisode</h3>
                    <p><strong>Crue / salinité en baisse</strong><br /><small>Période : —</small></p>
                  </div>
                  <div className="card card-soft">
                    <h3>Impact potentiel</h3>
                    <p><strong>Vulnérabilité larvaire</strong><br /><small>Zones internes à surveiller</small></p>
                  </div>
                  <div className="card card-soft">
                    <h3>Actions</h3>
                    <p><strong>Surveillance renforcée</strong><br /><small>Rapport mensuel disponible</small></p>
                  </div>
                </div>

                <div style={{ marginTop: '18px', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                  <a className="btn btn-primary" href="/institutions/rapports" onClick={(e) => e.preventDefault()}>Rapports</a>
                  <a className="btn btn-secondary" href="/institutions/methodo" onClick={(e) => e.preventDefault()}>Méthodologie</a>
                </div>
              </div>
            </div>
          </section>
        )}

        {activeTab === 'pro' && (
          <section className="section">
            <div className="container">
              <div className="proof">
                <div className="kicker">Agir — Experts / Pros</div>
                <h2>Générer une attestation (preuve)</h2>
                <p>Rapport scellé, traçable, téléchargeable. Workflow H-AI-H (validation humaine) si requis.</p>

                <div className="hr" />

                <div className="meta">
                  <div><strong>Identité exploitant :</strong> SIRET/Kbis (à vérifier)</div>
                  <div><strong>Zone :</strong> concession / polygone</div>
                  <div><strong>Scellement :</strong> SHA-256 + horodatage</div>
                  <div><strong>Signature :</strong> PAdES-LTV (si activé)</div>
                </div>

                <div style={{ marginTop: '18px', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                  <a className="btn btn-primary" href="/pro/generer" onClick={(e) => e.preventDefault()}>Générer mon PDF</a>
                  <a className="btn btn-secondary" href="/pro/coffre-fort" onClick={(e) => e.preventDefault()}>Coffre-fort</a>
                  <a className="btn btn-ghost" href="/cgu" onClick={(e) => e.preventDefault()}>CGU &amp; Responsabilités</a>
                </div>
              </div>
            </div>
          </section>
        )}
      </div>

      {/* --- FOOTER --- */}
      <footer className="bg-[#0E2A3A] text-[#F4F6F6] py-32 px-6">
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 lg:grid-cols-4 gap-20 border-b border-[#F4F6F6]/10 pb-20 mb-10">
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <Waves className="text-[#D9CBB6]" size={20} />
              <span className="text-xl os-title italic font-bold">Ocean Sentinelle</span>
            </div>
            <p className="text-xs leading-relaxed opacity-60 italic max-w-xs">
              Système de surveillance biogéochimique souverain dédié à la résilience des lagunes ostréicoles. Expertise Bassin d'Arcachon.
            </p>
          </div>
          
          <div className="space-y-4">
            <h5 className="os-mono text-[10px] font-bold uppercase tracking-widest text-[#D9CBB6]">Ressources</h5>
            <ul className="text-xs space-y-3 os-mono font-bold opacity-40 uppercase tracking-widest">
              <li className="hover:opacity-100 cursor-pointer transition-opacity">Modèle PyCO2SYS</li>
              <li className="hover:opacity-100 cursor-pointer transition-opacity">Rapports OASU</li>
              <li className="hover:opacity-100 cursor-pointer transition-opacity">Données COAST-HF</li>
            </ul>
          </div>

          <div className="space-y-4">
            <h5 className="os-mono text-[10px] font-bold uppercase tracking-widest text-[#D9CBB6]">Contact</h5>
            <p className="text-xs font-bold os-mono">admin@oceansentinelle.fr</p>
          </div>

          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <ShieldCheck className="text-[#6A8F4E]" size={24} />
              <div className="flex flex-col">
                <span className="text-[10px] os-mono font-bold uppercase">SHA-256 Validated</span>
                <span className="text-[8px] os-mono opacity-40">SRV1341436_INSTANCE</span>
              </div>
            </div>
            <p className="text-[9px] os-mono opacity-40 leading-relaxed uppercase">
              La science appliquée au territoire. <br />
              © 2026 Ocean Sentinelle.
            </p>
          </div>
        </div>
        <div className="text-center os-mono text-[8px] font-bold uppercase tracking-[0.5em] opacity-20">
          European Coastal Climate Observatory • Prototype Edition
        </div>
      </footer>
    </div>
  );
}

// --- SOUS-COMPOSANTS ---

const Zap = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
);

function Archives() {
  const [reports, setReports] = useState([]);
  useEffect(() => {
    fetch(`${API_BASE}/api/v1/reports`).then(r => r.ok ? r.json() : []).then(setReports).catch(() => {});
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-6 pt-32 pb-24 animate-in fade-in duration-700">
      <header className="mb-16 border-l-4 border-[#0E2A3A] pl-8 space-y-4">
        <div className="kicker">Preuves numériques</div>
        <h2 className="text-4xl os-title italic text-[#0E2A3A]">Archives de Preuve</h2>
        <p className="text-[#5F6B6D] text-sm">Conformes PAdES-LTV pour la DDTM</p>
      </header>
      {reports.length === 0 ? (
        <div className="card-premium text-center py-20">
          <Info className="mx-auto mb-8 text-[#D9CBB6]" size={48} />
          <p className="text-[#5F6B6D] italic font-medium">Aucun rapport certifié disponible.</p>
        </div>
      ) : (
        <div className="card-premium overflow-hidden !p-0">
          <table className="w-full text-left">
            <thead className="os-mono text-[10px] font-bold uppercase tracking-widest text-[#5F6B6D] bg-[#F4F6F6]">
              <tr><th className="px-8 py-4">Fichier</th><th className="px-8 py-4">Empreinte</th><th className="px-8 py-4 text-right">Action</th></tr>
            </thead>
            <tbody className="divide-y divide-[#D9CBB6]/20">
              {reports.map((rpt, i) => (
                <tr key={i} className="hover:bg-[#F4F6F6] transition-all">
                  <td className="px-8 py-6"><div className="font-bold text-[#0E2A3A] uppercase">{rpt.filename}</div><div className="os-mono text-[10px] text-[#5F6B6D] mt-1 italic">{rpt.date} • {rpt.size}</div></td>
                  <td className="px-8 py-6 os-mono text-[10px] text-[#5F6B6D] uppercase tracking-tighter"><div className="flex items-center gap-2"><Lock size={12} className="text-[#6A8F4E]" />{rpt.hash}</div></td>
                  <td className="px-8 py-6 text-right"><button onClick={() => window.open(`${API_BASE}/api/v1/reports/download/${rpt.filename}`)} className="btn-os-primary text-[10px]">Télécharger</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}