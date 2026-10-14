CREATE TABLE contrato (
    id BIGSERIAL PRIMARY KEY,
    numero VARCHAR(30) NOT NULL UNIQUE,
    processo_licitatorio VARCHAR(30) NOT NULL,
    numero_modalidade VARCHAR(30),
    modalidade VARCHAR(80) NOT NULL,
    empresa VARCHAR(200) NOT NULL,
    cnpj VARCHAR(18) NOT NULL,
    resumo_objeto VARCHAR(200) NOT NULL,
    objeto TEXT NOT NULL,
    valor_estimado NUMERIC(15,2),
    valor_total NUMERIC(15,2) NOT NULL CHECK (valor_total >= 0),
    orgao_gestor VARCHAR(150) NOT NULL,
    secretario VARCHAR(150),
    data_assinatura DATE NOT NULL,
    data_fim DATE NOT NULL,
    prazo_vigencia_meses INTEGER,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT ck_contrato_datas CHECK (data_fim >= data_assinatura),
    CONSTRAINT ck_contrato_prazo CHECK (prazo_vigencia_meses IS NULL OR (prazo_vigencia_meses > 0 AND prazo_vigencia_meses <= 600))
);
CREATE INDEX idx_contrato_empresa ON contrato (empresa);
CREATE INDEX idx_contrato_data_fim ON contrato (data_fim);
CREATE INDEX idx_contrato_processo ON contrato (processo_licitatorio);
