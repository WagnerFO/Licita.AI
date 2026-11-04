CREATE TABLE auditoria (
    id BIGSERIAL PRIMARY KEY,
    evento_id UUID NOT NULL,
    entidade VARCHAR(50) NOT NULL,
    entidade_id BIGINT NOT NULL,
    acao VARCHAR(20) NOT NULL CHECK (acao IN ('CRIACAO', 'ATUALIZACAO')),
    campo VARCHAR(60),
    valor_anterior TEXT,
    valor_novo TEXT,
    usuario_email VARCHAR(255) NOT NULL,
    data_hora TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_auditoria_entidade ON auditoria (entidade, entidade_id, data_hora DESC);
CREATE INDEX idx_auditoria_evento ON auditoria (evento_id);