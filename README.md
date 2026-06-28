# 🔐 GuardaFácil

**Sistema de gestão de armários** desenvolvido como projeto acadêmico para o curso de **Bacharelado em Ciência da Computação** do **Instituto Federal de Educação, Ciência e Tecnologia do Rio Grande do Sul (IFRS) – Campus Ibirubá**.

---

## 📌 Sobre o Projeto

O GuardaFácil é uma plataforma web que permite que alunos reservem armários de forma autônoma e transparente, eliminando a necessidade de controles manuais (planilhas, papel, etc.). O sistema oferece:

- ✅ Login de usuários (alunos) com matrícula e senha
- ✅ Reserva de armários com escolha de data, hora e duração
- ✅ Visualização em tempo real da disponibilidade dos armários
- ✅ Cancelamento de reservas
- ✅ Histórico de reservas anteriores
- ✅ Painel administrativo com:
  - Lista de usuários cadastrados
  - Visualização de todas as reservas
  - Cancelamento de qualquer reserva ativa
  - **Bloqueio/desbloqueio de armários** (impede novas reservas)

---

## 🛠️ Tecnologias Utilizadas

| Camada | Tecnologia |
|--------|------------|
| **Frontend** | HTML5, CSS3, JavaScript (vanilla), Font Awesome |
| **Backend** | Node.js, Express |
| **Banco de Dados** | SQLite (embarcado) |
| **API** | RESTful |

---

## 🚀 Como Executar Localmente

### Pré-requisitos
- [Node.js](https://nodejs.org/) (versão 16 ou superior)
- Git (opcional)

### 1. Clone o repositório
```bash
git clone https://github.com/SEU_USUARIO/guardafacil.git
cd guardafacil

2. Instale as dependências do backend
bash
cd backend
npm install

3. Inicie o servidor
bash
node server.js
O servidor estará rodando em http://localhost:3000

4. Abra o frontend
Navegue até a pasta frontend e abra o arquivo index.html no navegador.

Ou use um servidor como Live Server no VS Code.


🔑 Credenciais de Teste

Usuários comuns
Matrícula	Senha
20240012	123456
20240001	senha123

Administrador

Usuário	Senha
admin	admin123


📁 Estrutura do Projeto
text
guarda-facil/
├── backend/
│   ├── server.js          # API com Express
│   ├── database.js        # Configuração do SQLite
│   ├── package.json       # Dependências do Node.js
│   └── guardafacil.db     # Banco de dados (criado automaticamente)
├── frontend/
│   ├── index.html         # Interface completa
│   └── Logo IFRS.png      # Logo da instituição
└── README.md              # Este arquivo
🌐 Deploy
O projeto pode ser hospedado em duas partes:

Frontend: GitHub Pages
https://SEU_USUARIO.github.io/guardafacil/frontend/

Backend: Render.com (ou Railway, Vercel, etc.)
https://guardafacil-api.onrender.com

👨‍🎓 Contexto Acadêmico
Este projeto foi desenvolvido como parte das atividades práticas da disciplina de Introdução à Computação, integrante da grade curricular do Bacharelado em Ciência da Computação do IFRS – Campus Ibirubá.

📄 Licença
Este projeto é de uso acadêmico e educacional. Todos os direitos reservados.

👥 Equipe
Desenvolvido por estudantes do Bacharelado em Ciência da Computação – IFRS Campus Ibirubá.