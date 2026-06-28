const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'guardafacil.db');
const db = new sqlite3.Database(dbPath);

db.serialize(() => {
    // Tabela de usuários
    db.run(`
        CREATE TABLE IF NOT EXISTS usuarios (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            matricula TEXT UNIQUE NOT NULL,
            nome TEXT NOT NULL,
            senha TEXT NOT NULL,
            criado_em DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `);

    // Tabela de reservas
    db.run(`
        CREATE TABLE IF NOT EXISTS reservas (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            matricula TEXT NOT NULL,
            nomeUsuario TEXT NOT NULL,
            armario TEXT NOT NULL,
            inicioTimestamp INTEGER NOT NULL,
            duracaoHoras INTEGER NOT NULL,
            status TEXT DEFAULT 'ativa',
            criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (matricula) REFERENCES usuarios(matricula)
        )
    `);

    // Tabela de armários bloqueados (NOVA)
    db.run(`
        CREATE TABLE IF NOT EXISTS armarios_bloqueados (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            armario TEXT UNIQUE NOT NULL,
            bloqueado_em DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `);

    // Insere usuários padrão se não existirem
    db.get("SELECT COUNT(*) as count FROM usuarios", (err, row) => {
        if (err) {
            console.error('Erro ao verificar usuários:', err);
            return;
        }
        if (row.count === 0) {
            db.run("INSERT INTO usuarios (matricula, nome, senha) VALUES (?, ?, ?)", 
                ['20240012', 'Ana Carolina Souza', '123456']);
            db.run("INSERT INTO usuarios (matricula, nome, senha) VALUES (?, ?, ?)", 
                ['20240001', 'João Pedro Lima', 'senha123']);
            console.log('✅ Usuários padrão criados!');
        }
    });
});

module.exports = db;