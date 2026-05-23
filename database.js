const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./seguranca_comunidade.db');

db.serialize(() => {
    // Tabela com foco em Auditoria e Modelagem de Dados
    db.run(`CREATE TABLE IF NOT EXISTS relatos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        tipo_golpe TEXT NOT NULL,
        descricao TEXT NOT NULL,
        data_ocorrencia TEXT NOT NULL,
        criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`);
    console.log("➔ Banco de dados e tabela de auditoria criados com sucesso.");
});

module.exports = db;