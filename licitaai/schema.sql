-- Tabelas do Licita.AI (SQLite)

CREATE TABLE IF NOT EXISTS usuarios (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    senha_hash TEXT NOT NULL,
    perfil TEXT NOT NULL CHECK (perfil IN ('admin', 'consulta')),
    ativo INTEGER NOT NULL DEFAULT 1,
    tentativas_falhas INTEGER NOT NULL DEFAULT 0,
    bloqueado_ate TEXT,
    criado_em TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Valores guardados em centavos (inteiro) para evitar erro de arredondamento
CREATE TABLE IF NOT EXISTS contratos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    numero TEXT NOT NULL UNIQUE,
    processo_licitatorio TEXT NOT NULL,
    numero_modalidade TEXT,
    modalidade TEXT NOT NULL,
    empresa TEXT NOT NULL,
    cnpj TEXT NOT NULL,
    resumo_objeto TEXT NOT NULL,
    objeto TEXT NOT NULL,
    valor_estimado_centavos INTEGER,
    valor_total_centavos INTEGER NOT NULL CHECK (valor_total_centavos >= 0),
    orgao_gestor TEXT NOT NULL,
    secretario TEXT,
    data_assinatura TEXT NOT NULL,
    data_fim TEXT NOT NULL,
    prazo_vigencia_meses INTEGER,
    criado_em TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    atualizado_em TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_contratos_empresa ON contratos (empresa);
CREATE INDEX IF NOT EXISTS idx_contratos_data_fim ON contratos (data_fim);
