const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();

const app = express();
const PORT = process.env.PORT || 3000;

// ============================================================
// ✅ CORS CORRIGIDO - Permite qualquer origem
// ============================================================
app.use(cors({
    origin: '*',  // Permite qualquer origem (GitHub Pages, localhost, etc.)
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// Middlewares
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Caminho do banco de dados
const dbPath = path.join(__dirname, 'guardafacil.db');
const db = new sqlite3.Database(dbPath);

// Criar tabelas
db.serialize(() => {
    db.run(`
        CREATE TABLE IF NOT EXISTS usuarios (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            matricula TEXT UNIQUE NOT NULL,
            nome TEXT NOT NULL,
            senha TEXT NOT NULL,
            criado_em DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `);

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

    db.run(`
        CREATE TABLE IF NOT EXISTS armarios_bloqueados (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            armario TEXT UNIQUE NOT NULL,
            bloqueado_em DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `);

    // Inserir usuários padrão
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

// ---------- ROTA RAIZ (TESTE) ----------
app.get('/', (req, res) => {
    res.json({
        message: '🚀 Servidor GuardaFácil rodando!',
        status: 'online',
        cors: 'enabled'
    });
});

// ---------- ROTAS DE USUÁRIO ----------
app.post('/api/login', (req, res) => {
    const { matricula, senha } = req.body;
    console.log('🔑 Tentativa de login:', { matricula, senha });
    db.get(
        "SELECT * FROM usuarios WHERE matricula = ? AND senha = ?",
        [matricula, senha],
        (err, user) => {
            if (err) {
                console.error('Erro no login:', err);
                return res.status(500).json({ error: 'Erro no servidor' });
            }
            if (user) {
                console.log('✅ Login bem-sucedido:', user.matricula);
                res.json({ success: true, user: { matricula: user.matricula, nome: user.nome } });
            } else {
                console.log('❌ Login falhou:', { matricula, senha });
                res.status(401).json({ success: false, error: 'Matrícula ou senha incorretos' });
            }
        }
    );
});

app.post('/api/cadastro', (req, res) => {
    const { matricula, nome, senha } = req.body;
    console.log('📝 Cadastro:', { matricula, nome, senha });
    db.run(
        "INSERT INTO usuarios (matricula, nome, senha) VALUES (?, ?, ?)",
        [matricula, nome, senha],
        function(err) {
            if (err) {
                if (err.message.includes('UNIQUE')) {
                    console.log('❌ Matrícula já existe:', matricula);
                    return res.status(400).json({ success: false, error: 'Matrícula já existe' });
                }
                console.error('Erro no cadastro:', err);
                return res.status(500).json({ success: false, error: 'Erro ao cadastrar' });
            }
            console.log('✅ Cadastro bem-sucedido:', matricula);
            res.json({ success: true, message: 'Usuário cadastrado com sucesso' });
        }
    );
});

app.post('/api/reservas', (req, res) => {
    const { matricula } = req.body;
    db.all(
        "SELECT * FROM reservas WHERE matricula = ? ORDER BY inicioTimestamp DESC",
        [matricula],
        (err, rows) => {
            if (err) return res.status(500).json({ error: 'Erro no servidor' });
            res.json(rows);
        }
    );
});

app.post('/api/reservas/criar', (req, res) => {
    const { matricula, nomeUsuario, armario, inicioTimestamp, duracaoHoras } = req.body;
    db.run(
        `INSERT INTO reservas (matricula, nomeUsuario, armario, inicioTimestamp, duracaoHoras) 
         VALUES (?, ?, ?, ?, ?)`,
        [matricula, nomeUsuario, armario, inicioTimestamp, duracaoHoras],
        function(err) {
            if (err) return res.status(500).json({ error: 'Erro ao criar reserva' });
            res.json({ success: true, id: this.lastID, message: 'Reserva criada com sucesso' });
        }
    );
});

app.delete('/api/reservas/:id', (req, res) => {
    const { id } = req.params;
    db.run(
        "UPDATE reservas SET status = 'cancelada' WHERE id = ?",
        [id],
        function(err) {
            if (err) return res.status(500).json({ error: 'Erro ao cancelar reserva' });
            res.json({ success: true, message: 'Reserva cancelada' });
        }
    );
});

app.post('/api/armarios/disponibilidade', (req, res) => {
    const { armario, inicioTimestamp, duracaoHoras } = req.body;
    const fimTimestamp = inicioTimestamp + (duracaoHoras * 3600000);

    db.get("SELECT 1 FROM armarios_bloqueados WHERE armario = ?", [armario], (err, bloqueado) => {
        if (err) return res.status(500).json({ error: 'Erro no servidor' });
        if (bloqueado) {
            return res.json({ disponivel: false, motivo: 'bloqueado' });
        }

        db.get(
            `SELECT COUNT(*) as count FROM reservas 
             WHERE armario = ? AND status = 'ativa'
             AND inicioTimestamp < ? AND (inicioTimestamp + duracaoHoras * 3600000) > ?`,
            [armario, fimTimestamp, inicioTimestamp],
            (err, row) => {
                if (err) return res.status(500).json({ error: 'Erro no servidor' });
                res.json({ disponivel: row.count === 0 });
            }
        );
    });
});

// ---------- ROTAS ADMIN ----------
app.post('/api/admin/login', (req, res) => {
    const { usuario, senha } = req.body;
    if (usuario === 'admin' && senha === 'admin123') {
        res.json({ success: true, admin: true });
    } else {
        res.status(401).json({ success: false, error: 'Credenciais inválidas' });
    }
});

app.get('/api/admin/usuarios', (req, res) => {
    db.all("SELECT id, matricula, nome, criado_em FROM usuarios", (err, rows) => {
        if (err) return res.status(500).json({ error: 'Erro no servidor' });
        res.json(rows);
    });
});

app.get('/api/admin/reservas', (req, res) => {
    db.all("SELECT * FROM reservas ORDER BY inicioTimestamp DESC", (err, rows) => {
        if (err) return res.status(500).json({ error: 'Erro no servidor' });
        res.json(rows);
    });
});

app.delete('/api/admin/reservas/:id', (req, res) => {
    const { id } = req.params;
    db.run("UPDATE reservas SET status = 'cancelada' WHERE id = ?", [id], function(err) {
        if (err) return res.status(500).json({ error: 'Erro ao cancelar' });
        res.json({ success: true });
    });
});

app.get('/api/admin/armarios/bloqueados', (req, res) => {
    db.all("SELECT armario FROM armarios_bloqueados", (err, rows) => {
        if (err) return res.status(500).json({ error: 'Erro no servidor' });
        res.json(rows.map(r => r.armario));
    });
});

app.post('/api/admin/armarios/bloquear', (req, res) => {
    const { armario } = req.body;
    db.run("INSERT OR IGNORE INTO armarios_bloqueados (armario) VALUES (?)", [armario], function(err) {
        if (err) return res.status(500).json({ error: 'Erro ao bloquear' });
        res.json({ success: true });
    });
});

app.delete('/api/admin/armarios/bloquear/:armario', (req, res) => {
    const { armario } = req.params;
    db.run("DELETE FROM armarios_bloqueados WHERE armario = ?", [armario], function(err) {
        if (err) return res.status(500).json({ error: 'Erro ao desbloquear' });
        res.json({ success: true });
    });
});

// ---------- INICIAR SERVIDOR ----------
app.listen(PORT, () => {
    console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
    console.log(`📡 API disponível em http://localhost:${PORT}/api`);
    console.log(`👑 Admin: usuario=admin, senha=admin123`);
    console.log(`✅ CORS habilitado para todas as origens`);
});
