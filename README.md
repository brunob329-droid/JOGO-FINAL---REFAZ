# Refaz - Dilemas Contábeis Game

Um jogo web interativo baseado no caso de ensino "Refaz - Dilemas Contábeis", focado em contabilidade de estoques e julgamento profissional.

## Funcionalidades

- **Interface do Professor:** Gera código de jogo, inicia e controla rodadas, vê ranking em tempo real, ajusta pontos baseado em justificativas.
- **Interface do Aluno:** Entra com código, responde dilemas com justificativa em 10 minutos, vê feedback e ranking.

## Instalação

1. Instalar dependências do backend: `cd server && npm install`
2. Instalar dependências do frontend: `cd client && npm install`

## Execução

1. Iniciar servidor: `cd server && npm start`
2. Iniciar cliente: `cd client && npm start`

Abra http://localhost:3000 para o jogo.

## Arquitetura

- **Backend:** Node.js, Express, Socket.IO, SQLite
- **Frontend:** React, Socket.IO client
- Comunicação em tempo real via WebSockets