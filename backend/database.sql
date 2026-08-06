-- Script de referência da estrutura de tabelas
CREATE TABLE IF NOT EXISTS registromovimento (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    tipo TEXT NOT NULL,       -- 'colheita', 'venda' ou 'perda'
    produto TEXT NOT NULL,    -- Ex: 'Alface Crespa'
    quantidade REAL NOT NULL, -- Ex: 10.5
    valor REAL DEFAULT 0,     -- Preço ou custo
    data TEXT NOT NULL
);