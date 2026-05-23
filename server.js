const express = require('express');
const cors = require('cors');
const db = require('./database');

const app = express();
app.use(express.json());
app.use(cors());

// ==================== CRIAÇÃO DA TABELA DE FEEDBACKS ====================
// Garante que a tabela de feedbacks exista no SQLite
db.serialize(() => {
    db.run(`
        CREATE TABLE IF NOT EXISTS feedbacks (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            nome TEXT,
            nota INTEGER,
            comentario TEXT,
            criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    `);
});

// ==================== ROTAS DE RELATOS (GOLPES) ====================
app.post('/api/relatos', (req, res) => {
    let { tipo_golpe, descricao, data_ocorrencia } = req.body;
    if (!tipo_golpe || !descricao || !data_ocorrencia) {
        return res.status(400).json({ error: 'Todos os campos são obrigatórios.' });
    }
    tipo_golpe = tipo_golpe.trim();
    descricao = descricao.trim();

    if (descricao.length < 10) {
        return res.status(400).json({ error: 'A descrição precisa ter no mínimo 10 caracteres.' });
    }

    const query = `INSERT INTO relatos (tipo_golpe, descricao, data_ocorrencia) VALUES (?, ?, ?)`;
    db.run(query, [tipo_golpe, descricao, data_ocorrencia], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.status(201).json({ id: this.lastID });
    });
});

app.get('/api/relatos', (req, res) => {
    const query = `SELECT * FROM relatos ORDER BY id DESC`;
    db.all(query, [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.status(200).json(rows);
    });
});

// ==================== NOVO: ROTAS DE FEEDBACKS (AVALIAÇÕES) ====================
// Rota para salvar uma nova avaliação do sistema
app.post('/api/feedbacks', (req, res) => {
    let { nome, nota, comentario } = req.body;
    
    if (!nome || !nota || !comentario) {
        return res.status(400).json({ error: 'Todos os campos do feedback são obrigatórios.' });
    }

    const query = `INSERT INTO feedbacks (nome, nota, comentario) VALUES (?, ?, ?)`;
    db.run(query, [nome.trim(), nota, comentario.trim()], function(err) {
        if (err) {
            console.error(err.message);
            return res.status(500).json({ error: 'Erro ao salvar o feedback.' });
        }
        console.log(`[FEEDBACK] Nova avaliação recebida. ID: ${this.lastID}`);
        res.status(201).json({ message: 'Feedback enviado com sucesso!', id: this.lastID });
    });
});

// Rota para buscar todas as avaliações públicas
app.get('/api/feedbacks', (req, res) => {
    const query = `SELECT * FROM feedbacks ORDER BY id DESC`;
    db.all(query, [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.status(200).json(rows);
    });
});

// ==================== INICIALIZAÇÃO ====================
// ==================== INICIALIZAÇÃO (ATUALIZADO PARA NUVEM) ====================
// O Render vai injetar a porta em process.env.PORT. Se não existir (local), usa a 3000.
const PORT = process.env.PORT || 3000;

app.listen(PORT, '0.0.0.0', () => {
    console.log(`➔ Servidor completo rodando com sucesso!`);
});