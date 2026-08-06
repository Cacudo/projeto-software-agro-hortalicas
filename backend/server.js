const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();

const app = express();
app.use(cors());
app.use(express.json());

// Conecta ou cria o banco de dados local 'banco.db'
const db = new sqlite3.Database('./banco.db', (err) => {
    if (err) console.error('Erro ao conectar ao banco:', err.message);
    else console.log('Banco de dados SQLite conectado!');
});

// Cria a tabela no banco caso ainda não exista
db.serialize(() => {
    db.run(`
        CREATE TABLE IF NOT EXISTS registromovimento (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            tipo TEXT NOT NULL,
            produto TEXT NOT NULL,
            quantidade REAL NOT NULL,
            valor REAL DEFAULT 0,
            data TEXT NOT NULL
        )
    `);
});

// Rota para cadastrar movimento (Colheita, Venda ou Perda)
app.post('/api/movimentos', (req, res) => {
    const { tipo, produto, quantidade, valor } = req.body;
    const data = new Date().toISOString().split('T')[0];

    const sql = `INSERT INTO registromovimento (tipo, produto, quantidade, valor, data) VALUES (?, ?, ?, ?, ?)`;
    db.run(sql, [tipo, produto, quantidade, valor || 0, data], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ id: this.lastID, mensagem: 'Registro salvo com sucesso!' });
    });
});

// Rota para listar todos os registros
app.get('/api/movimentos', (req, res) => {
    db.all(`SELECT * FROM registromovimento ORDER BY id DESC`, [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

const PORT = 3000;
app.listen(PORT, () => console.log(`Servidor rodando em http://localhost:${PORT}`));