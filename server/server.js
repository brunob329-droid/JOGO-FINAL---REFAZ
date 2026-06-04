const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');
const db = require('./database');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST']
  }
});

app.use(cors());
app.use(express.json());

const dilemmas = [
  {
    round: 1,
    dilemma: "A Refaz opera com itens em consignação (roupas deixadas com lojas de varejo) e no modelo 'prove em casa' (peças enviadas diretamente aos clientes para teste antes de comprar). O Marketing sugere reconhecer receita no envio dos itens para melhorar o resultado nos números antes da reunião com investidores. Porém, as devoluções são frequentes e o controle físico permanece com terceiros.",
    dialogue: [
      {
        speaker: "Mariana Silva",
        title: "Marketing",
        color: "#ff8a48",
        avatarUrl: "https://api.dicebear.com/7.x/personas/svg?seed=MarianaSilva&backgroundColor=ffc800",
        message: "Vitor, enviamos 800 peças em consignação e 300 no 'prove em casa'. Se reconhecermos receita no envio, mostramos crescimento real de 1.100 peças vendidas. Isso é importante para a conversa com os investidores!"
      },
      {
        speaker: "Renata Lopes",
        title: "Operações",
        color: "#51cf66",
        avatarUrl: "https://api.dicebear.com/7.x/personas/svg?seed=RenataLopes&backgroundColor=51cf66",
        message: "Espera aí, Mariana. 60% daquelas peças de consignação voltaram sem venda. E no 'prove em casa', 120 peças foram devolvidas em 7 dias. Reconhecer receita agora é enganador. Nem sabemos se venderemos."
      },
      {
        speaker: "Vitor Almeida",
        title: "Contador",
        color: "#6d79ff",
        avatarUrl: "https://api.dicebear.com/7.x/personas/svg?seed=VitorAlmeida&backgroundColor=6d79ff",
        message: "Exatamente o ponto. Na consignação, não temos controle físico. No 'prove em casa', o cliente ainda pode devolver. A IFRS 15 é clara: receita só quando o controle é transferido. Vamos ser técnicos aqui."
      },
      {
        speaker: "Mariana Silva",
        title: "Marketing",
        color: "#ff8a48",
        avatarUrl: "https://api.dicebear.com/7.x/personas/svg?seed=MarianaSilva&backgroundColor=ffc800",
        message: "Mas temos dados históricos de taxa de devolução! Podemos estimar com precisão quantas venderemos. Por que não usar isso?"
      }
    ],
    question: "Você, como contador responsável, qual decisão é a mais adequada para reconhecer receitas nas operações de consignação e 'prove em casa'?",
    options: {
      A: { text: "Reconhecer receita apenas quando há confirmação de venda ou transferência efetiva de controle — mantendo os itens como ativos da empresa até esse momento, preservando prudência e representação fidedigna.", score: 100 },
      B: { text: "Reconhecer receita com base em estimativas de devolução histórica, balanceando relevância com incertezas; usar contas de compensação para itens em consignação.", score: 70 },
      C: { text: "Registrar todos os envios como vendas imediatas, reconhecendo receita no ato do envio, priorizando volume e resultado sobre o controle econômico real.", score: 30 }
    }
  },
  {
    round: 2,
    dilemma: "A empresa possui itens especiais no estoque: 7.000 peças doadas (sem custo histórico, 60% desgastadas), 3.000 adquiridas sem nota fiscal (R$ 120.000 estimado), custos de recondicionamento (R$ 15.000), 1.500 peças com baixa venda (R$ 15.000), e coleção 'Verão Sustentável' (R$ 30.000 contábil mas com realização inferior estimada). A pressão é para não fazer ajustes conservadores.",
    dialogue: [
      {
        speaker: "Mariana Silva",
        title: "Marketing",
        color: "#ff8a48",
        avatarUrl: "https://api.dicebear.com/7.x/personas/svg?seed=MarianaSilva&backgroundColor=ffc800",
        message: "Aquelas 1.500 peças que chamam de 'slow movers'? São importantes para variedade no site. E a coleção Verão? Posso fazer uma promoção estratégica para vender. Não ajustem valores agora!"
      },
      {
        speaker: "Renata Lopes",
        title: "Operações",
        color: "#51cf66",
        avatarUrl: "https://api.dicebear.com/7.x/personas/svg?seed=RenataLopes&backgroundColor=51cf66",
        message: "Mas Mariana, metade daquelas peças tem mofo. E as peças doadas sem documentação? Nem sabemos se podemos comprovar a compra. R$ 15.000 em recondicionamento beneficiou principalmente as peças doadas ruins."
      },
      {
        speaker: "Daniela Costa",
        title: "Fundadora",
        color: "#fcc419",
        avatarUrl: "https://api.dicebear.com/7.x/personas/svg?seed=DanielaCosta&backgroundColor=fcc419",
        message: "Pessoal, os investidores querem clareza. Se ajustarmos agora e depois virem que fiz previsões erradas, perdem confiança. Qual é o caminho certo aqui, Vitor?"
      },
      {
        speaker: "Vitor Almeida",
        title: "Contador",
        color: "#6d79ff",
        avatarUrl: "https://api.dicebear.com/7.x/personas/svg?seed=VitorAlmeida&backgroundColor=6d79ff",
        message: "Pelo CPC 16, mensuração de estoque é pelo menor de: custo histórico ou valor realizável líquido. Para doações sem custo, estimamos custo de mercado. Peças desgastadas e com baixa rotatividade precisam de ajuste. É prudência, não pessimismo."
      }
    ],
    question: "Você, como contador, qual decisão é a mais adequada para mensurar e apresentar esses diferentes tipos de estoque?",
    options: {
      A: { text: "Mensurar todos pelo menor valor entre custo (estimado para doações) e valor realizável líquido, incluindo custos de recondicionamento — exercendo prudência sem viés, mesmo que reduza lucro.", score: 100 },
      B: { text: "Usar estimativas de mercado para doações, mas adiar ajustes de valor até venda efetiva para manter resultados — mantendo consistência temporal.", score: 60 },
      C: { text: "Manter todos os valores sem ajuste para preservar o lucro, assumindo que as incertezas se resolverão favoravelmente no futuro.", score: 20 }
    }
  },
  {
    round: 3,
    dilemma: "Com a reunião de investidores em 3 dias, as demonstrações financeiras serão apresentadas. As decisões sobre estoque, receitas em consignação e 'prove em casa' gerarão números distintos conforme a política escolhida. Como contador, você redige as notas explicativas.",
    dialogue: [
      {
        speaker: "Daniela Costa",
        title: "Fundadora",
        color: "#fcc419",
        avatarUrl: "https://api.dicebear.com/7.x/personas/svg?seed=DanielaCosta&backgroundColor=fcc419",
        message: "Vitor, mantenha as notas simples. Os números falam por si. Não precisa de detalhes técnicos que confundam os investidores."
      },
      {
        speaker: "Mariana Silva",
        title: "Marketing",
        color: "#ff8a48",
        avatarUrl: "https://api.dicebear.com/7.x/personas/svg?seed=MarianaSilva&backgroundColor=ffc800",
        message: "Exato. Notas muito detalhadas parecem que estamos escondendo algo. Apenas o essencial, por favor."
      },
      {
        speaker: "Renata Lopes",
        title: "Operações",
        color: "#51cf66",
        avatarUrl: "https://api.dicebear.com/7.x/personas/svg?seed=RenataLopes&backgroundColor=51cf66",
        message: "Discordo. Se não explicarmos as incertezas no estoque e os critérios que usamos, os investidores podem assumir que tudo é certeiro. Depois, quando houver devoluções ou devoluções, questionarão a integridade dos números."
      },
      {
        speaker: "Vitor Almeida",
        title: "Contador",
        color: "#6d79ff",
        avatarUrl: "https://api.dicebear.com/7.x/personas/svg?seed=VitorAlmeida&backgroundColor=6d79ff",
        message: "Renata está certa. IFRS exige divulgação de políticas contábeis, julgamentos e incertezas. Investidores sofisticados esperam transparência. Omitir detalhes é risco legal e de reputação para a empresa."
      },
      {
        speaker: "Mariana Silva",
        title: "Marketing",
        color: "#ff8a48",
        avatarUrl: "https://api.dicebear.com/7.x/personas/svg?seed=MarianaSilva&backgroundColor=ffc800",
        message: "Mas e se isso assusta os investidores? E se decidirem não investir por ler que temos 'muitas incertezas'?"
      },
      {
        speaker: "Vitor Almeida",
        title: "Contador",
        color: "#6d79ff",
        avatarUrl: "https://api.dicebear.com/7.x/personas/svg?seed=VitorAlmeida&backgroundColor=6d79ff",
        message: "Investidores reais preferem empresas transparentes com riscos claros do que empresas que mascaram problemas. Confiança é construída com honestidade, não com omissão."
      }
    ],
    question: "Você, como contador, qual decisão é a mais adequada para comunicar essas escolhas contábeis aos usuários das demonstrações financeiras?",
    options: {
      A: { text: "Divulgar detalhadamente as políticas contábeis, critérios de mensuração, estimativas, julgamentos aplicados e incertezas relevantes — garantindo transparência total e confiança do investidor.", score: 100 },
      B: { text: "Fornecer divulgação mínima sobre estoques e receitas, mencionando apenas valores totais para simplificar a leitura das demonstrações.", score: 50 },
      C: { text: "Omitir detalhes de julgamentos e incertezas, assumindo que os números são suficientes para os investidores tomarem decisões.", score: 10 }
    }
  }
];

const games = new Map();

const getPlayerBySocket = (game, socketId) => {
  if (!game) return null;
  return game.gameData.players.find(player => player.socketId === socketId);
};

const buildRoundResponses = (game, round) => {
  return game.gameData.responses
    .filter(response => response.round === round)
    .map(response => ({
      playerId: response.playerId,
      name: game.gameData.players.find(p => p.id === response.playerId)?.name || 'Aluno',
      choice: response.choice,
      justification: response.justification,
      baseScore: response.baseScore,
      adjustedScore: response.adjustedScore
    }));
};

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('createGame', (callback) => {
    const code = uuidv4().substring(0, 6).toUpperCase();
    db.run('INSERT INTO games (code) VALUES (?)', [code], function(err) {
      if (err) return callback({ error: 'Failed to create game' });
      const gameId = this.lastID;
      games.set(code, {
        teacherSocket: socket,
        studentSockets: [],
        gameData: {
          id: gameId,
          code,
          status: 'waiting',
          currentRound: 0,
          players: [],
          responses: []
        }
      });
      socket.join(code);
      callback({ code });
    });
  });

  socket.on('joinGame', (data, callback) => {
    const { code, name } = data;
    const game = games.get(code);
    if (!game) return callback({ error: 'Game not found' });
    if (game.gameData.status !== 'waiting') return callback({ error: 'Game already started' });

    db.run('INSERT INTO players (game_id, name) VALUES (?, ?)', [game.gameData.id, name], function(err) {
      if (err) return callback({ error: 'Failed to join game' });
      const playerId = this.lastID;
      const player = { id: playerId, socketId: socket.id, name, score: 0 };
      game.gameData.players.push(player);
      game.gameData.responses = game.gameData.responses || [];
      game.studentSockets.push(socket);
      socket.join(code);
      socket.data.gameCode = code;
      socket.data.playerId = playerId;
      io.to(code).emit('playerList', game.gameData.players);
      callback({ success: true, players: game.gameData.players });
    });
  });

  socket.on('startGame', (code) => {
    const game = games.get(code);
    if (!game || game.teacherSocket !== socket) return;
    game.gameData.status = 'active';
    game.gameData.currentRound = 1;
    db.run('UPDATE games SET status = ?, current_round = ? WHERE code = ?', ['active', 1, code]);
    io.to(code).emit('gameStarted', { round: 1, dilemma: dilemmas[0] });
  });

  socket.on('submitAnswer', (data) => {
    const { code, choice, justification } = data;
    const game = games.get(code);
    if (!game) return;
    const player = getPlayerBySocket(game, socket.id);
    if (!player) return;

    const round = game.gameData.currentRound;
    const option = dilemmas[round - 1].options[choice] || { text: '', score: 0 };
    const baseScore = option.score;
    const response = {
      playerId: player.id,
      round,
      choice,
      choiceText: option.text,
      justification,
      baseScore,
      adjustedScore: baseScore
    };

    game.gameData.responses.push(response);
    db.run(
      'INSERT INTO responses (game_id, player_id, round_number, choice, justification, base_score, adjusted_score) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [game.gameData.id, player.id, round, choice, justification, baseScore, baseScore]
    );

    if (game.teacherSocket) {
      game.teacherSocket.emit('responseReceived', {
        playerId: player.id,
        name: player.name,
        choice,
        choiceText: option.text,
        justification,
        baseScore
      });
    }
  });

  socket.on('adjustScores', (data) => {
    const { code, adjustments } = data;
    const game = games.get(code);
    if (!game || game.teacherSocket !== socket) return;

    adjustments.forEach((adj) => {
      const player = game.gameData.players.find((p) => p.id === adj.playerId);
      const response = game.gameData.responses.find((r) => r.playerId === adj.playerId && r.round === game.gameData.currentRound);
      if (player && response) {
        const newScore = Math.max(0, response.baseScore + (adj.adjustment || 0));
        response.adjustedScore = newScore;
        player.score += newScore;
        db.run('UPDATE players SET score = ? WHERE id = ?', [player.score, player.id]);
        db.run('UPDATE responses SET adjusted_score = ? WHERE game_id = ? AND player_id = ? AND round_number = ?', [newScore, game.gameData.id, player.id, game.gameData.currentRound]);
      }
    });

    const ranking = [...game.gameData.players].sort((a, b) => b.score - a.score);
    io.to(code).emit('roundSummary', { ranking, round: game.gameData.currentRound });

    if (game.gameData.currentRound < dilemmas.length) {
      game.gameData.currentRound += 1;
      db.run('UPDATE games SET current_round = ? WHERE code = ?', [game.gameData.currentRound, code]);
      io.to(code).emit('nextRound', { round: game.gameData.currentRound, dilemma: dilemmas[game.gameData.currentRound - 1] });
    } else {
      game.gameData.status = 'finished';
      db.run('UPDATE games SET status = ? WHERE code = ?', ['finished', code]);
      io.to(code).emit('gameFinished', { ranking });
    }
  });

  socket.on('showRanking', (code) => {
    const game = games.get(code);
    if (!game || game.teacherSocket !== socket) return;
    const ranking = [...game.gameData.players].sort((a, b) => b.score - a.score);
    io.to(code).emit('showRanking', { ranking });
  });

  socket.on('disconnect', () => {
    const code = socket.data.gameCode;
    if (!code) return;
    const game = games.get(code);
    if (!game) return;
    game.studentSockets = game.studentSockets.filter((s) => s.id !== socket.id);
    game.gameData.players = game.gameData.players.filter((player) => player.socketId !== socket.id);
    io.to(code).emit('playerList', game.gameData.players);
  });
});

server.listen(3001, () => {
  console.log('Server running on port 3001');
});