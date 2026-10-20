ALTER TABLE usuario
    ADD COLUMN tentativas_falhas INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN bloqueado_ate TIMESTAMP NULL;
