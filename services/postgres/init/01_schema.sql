-- Ocean Sentinel MVP schema (v1.0.0)
-- Tables for RAG + indicators + audit logging

CREATE TABLE IF NOT EXISTS documents (
  id TEXT PRIMARY KEY,
  source TEXT NOT NULL,
  title TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  data_version TEXT NOT NULL DEFAULT 'v1.0.0'
);

CREATE TABLE IF NOT EXISTS chunks (
  id TEXT PRIMARY KEY,
  document_id TEXT NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
  chunk_index INT NOT NULL,
  text TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Embeddings: store as pgvector (dimension left generic; set at ingestion time)
CREATE TABLE IF NOT EXISTS embeddings (
  chunk_id TEXT PRIMARY KEY REFERENCES chunks(id) ON DELETE CASCADE,
  embedding vector,
  model_name TEXT NOT NULL DEFAULT 'unknown',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS indicators (
  id BIGSERIAL PRIMARY KEY,
  zone_id TEXT NOT NULL,
  zone_type TEXT NOT NULL, -- site/bassin/commune
  indicator_id TEXT NOT NULL,
  value DOUBLE PRECISION,
  unit TEXT,
  time_start TIMESTAMPTZ,
  time_end TIMESTAMPTZ,
  time_window TEXT,
  truth_status TEXT NOT NULL CHECK (truth_status IN ('measured','inferred','simulated')),
  confidence TEXT NOT NULL CHECK (confidence IN ('low','medium','high')),
  uncertainty TEXT,
  source_name TEXT,
  source_date TIMESTAMPTZ,
  method_id TEXT,
  method_version TEXT,
  data_version TEXT,
  model_version TEXT,
  scenario_version TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS audit_log (
  id BIGSERIAL PRIMARY KEY,
  ts TIMESTAMPTZ NOT NULL DEFAULT now(),
  actor_id TEXT,
  role TEXT,
  tool TEXT,
  action TEXT,
  resource TEXT,
  status TEXT,
  details JSONB
);

CREATE INDEX IF NOT EXISTS idx_chunks_doc ON chunks(document_id);
CREATE INDEX IF NOT EXISTS idx_indicators_zone ON indicators(zone_id, indicator_id);
CREATE INDEX IF NOT EXISTS idx_audit_ts ON audit_log(ts);
