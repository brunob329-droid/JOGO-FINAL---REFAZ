import React, { useEffect, useState, useCallback, memo } from 'react';
import { socket } from './socket';

function Teacher() {
  const [gameCode, setGameCode] = useState('');
  const [players, setPlayers] = useState([]);
  const [responses, setResponses] = useState([]);
  const [currentRound, setCurrentRound] = useState(0);
  const [gameStatus, setGameStatus] = useState('waiting');
  const [adjustments, setAdjustments] = useState({});
  const [ranking, setRanking] = useState([]);
  const [message, setMessage] = useState('Crie uma sala e compartilhe o código com os alunos.');
  const [showRankingTeacher, setShowRankingTeacher] = useState(false);
  const [dilemma, setDilemma] = useState(null);

  useEffect(() => {
    const handleNextRound = (data) => {
      setCurrentRound(data.round);
      setDilemma(data.dilemma);
      setResponses([]);
      setMessage(`Rodada ${data.round} iniciada.`);
    };

    const handlePlayerList = (players) => setPlayers(players);
    const handleGameStarted = (data) => {
      setCurrentRound(data.round);
      setDilemma(data.dilemma);
      setGameStatus('active');
      setMessage(`Jogo iniciado: rodada ${data.round}. Acompanhe as respostas à medida que chegam.`);
    };
    const handleResponseReceived = (response) => {
      setResponses((prev) => [...prev, response]);
    };
    const handleRoundSummary = (data) => {
      setRanking(data.ranking);
      setMessage(`Rodada ${data.round} finalizada. Veja o ranking e avance para o próximo desafio.`);
      setResponses([]);
    };
    const handleGameFinished = (data) => {
      setRanking(data.ranking);
      setGameStatus('finished');
      setMessage('Jogo finalizado! Veja o pódio e parabenize os vencedores.');
    };
    const handleShowRanking = () => {
      setShowRankingTeacher(true);
      setTimeout(() => setShowRankingTeacher(false), 10000); // Esconde após 10 segundos
    };

    socket.on('playerList', handlePlayerList);
    socket.on('gameStarted', handleGameStarted);
    socket.on('nextRound', handleNextRound);
    socket.on('responseReceived', handleResponseReceived);
    socket.on('roundSummary', handleRoundSummary);
    socket.on('gameFinished', handleGameFinished);
    socket.on('showRanking', handleShowRanking);

    return () => {
      socket.off('playerList', handlePlayerList);
      socket.off('gameStarted', handleGameStarted);
      socket.off('nextRound', handleNextRound);
      socket.off('responseReceived', handleResponseReceived);
      socket.off('roundSummary', handleRoundSummary);
      socket.off('gameFinished', handleGameFinished);
      socket.off('showRanking', handleShowRanking);
    };
  }, []);

  const createGame = useCallback(() => {
    socket.emit('createGame', (data) => {
      if (data.error) {
        setMessage('Erro ao criar jogo. Tente novamente.');
        return;
      }
      setGameCode(data.code);
      setMessage('Sala criada. Aguarde alunos entrarem e inicie quando estiver pronto.');
    });
  }, []);

  const startGame = useCallback(() => {
    socket.emit('startGame', gameCode);
  }, [gameCode]);

  const handleAdjustment = useCallback((playerId, value) => {
    setAdjustments((prev) => ({ ...prev, [playerId]: Number(value) || 0 }));
  }, []);

  const showRanking = useCallback(() => {
    socket.emit('showRanking', gameCode);
  }, [gameCode]);

  const sendAdjustments = useCallback(() => {
    // Server expects an array of { playerId, adjustment }
    const payload = Object.entries(adjustments).map(([playerId, value]) => ({
      playerId: Number(playerId),
      adjustment: Number(value) || 0
    }));

    socket.emit('adjustScores', { code: gameCode, adjustments: payload });
    setAdjustments({});
  }, [gameCode, adjustments]);

  if (showRankingTeacher) {
    return (
      <div className="teacher-shell">
        <div className="ranking-overlay" onClick={() => setShowRankingTeacher(false)}>
          <section className="panel ranking-panel" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <span className="eyebrow">Ranking Atual</span>
                <h2>Posição dos Alunos</h2>
              </div>
              <button className="secondary" onClick={() => setShowRankingTeacher(false)}>Fechar</button>
            </div>

            <ol className="ranking-list">
              {ranking.map((player, index) => (
                <li key={player.id}>
                  <span>{index + 1}. {player.name}</span>
                  <strong>{player.score} pts</strong>
                </li>
              ))}
            </ol>
          </section>
        </div>
      </div>
    );
  }

  if (!gameCode) {
    return (
      <div className="teacher-shell">
        <section className="panel hero-card">
          <div>
            <span className="eyebrow">Painel do Professor</span>
            <h2>Controle da Sessão de Aprendizagem</h2>
            <p>
              Gerencie a atividade de <strong>dilemas contábeis</strong> em tempo real. Você controlará o fluxo de questões, revisará respostas, ajustará pontuações e acompanhará o ranking dos alunos.
            </p>
          </div>

          <div className="context-introduction">
            <div className="intro-section">
              <h3>📌 Caso: Refaz - Moda Circular</h3>
              <p>
                Startup digital fundada por Daniela Costa que coleta, recondiciona e revende roupas usadas. Com crescimento acelerado, enfrenta desafios críticos de reconhecimento de receita, mensuração de estoques sem custo histórico e pressões de mercado.
              </p>
            </div>

            <div className="intro-section">
              <h3>👥 Stakeholders Envolvidos</h3>
              <ul>
                <li><strong>Vitor Almeida</strong> (Contador) — responsável pelas decisões técnicas sob pressão</li>
                <li><strong>Mariana Silva</strong> (Marketing) — pressiona por reconhecimento otimista</li>
                <li><strong>Renata Lopes</strong> (Operações) — acredita em recuperação de itens</li>
                <li><strong>Investidores</strong> — buscam consistência e transparência nos números</li>
              </ul>
            </div>

            <div className="intro-section">
              <h3>🎯 Fluxo da Atividade</h3>
              <ol style={{ paddingLeft: '28px' }}>
                <li><strong>Criar Sala:</strong> Gere um código e compartilhe com os alunos</li>
                <li><strong>Iniciar Jogo:</strong> Nenhum aluno adicional poderá entrar após o início</li>
                <li><strong>Revisar Respostas:</strong> Veja as escolhas, textos completos e justificativas dos alunos</li>
                <li><strong>Ajustar Pontuações:</strong> Considere argumentação e contexto organizacional</li>
                <li><strong>Mostrar Ranking:</strong> Clique o botão para exibir posições atuais aos alunos</li>
                <li><strong>Avançar:</strong> Confirme e passe para a próxima rodada</li>
              </ol>
            </div>
          </div>

          <button className="primary" onClick={createGame} style={{ width: 'fit-content', marginTop: '20px' }}>
            Criar Nova Sessão
          </button>
        </section>
      </div>
    );
  }

  return (
    <div className="teacher-shell">
      <section className="panel professor-panel">
        <div className="panel-header">
          <div>
            <span className="eyebrow">Painel do Professor</span>
            <h2>Controle da Sessão</h2>
            <p className="section-note">{currentRound ? `Rodada atual: ${currentRound}` : 'Aguardando início da partida'}</p>
          </div>
          <div className="panel-badge">{gameStatus.toUpperCase()}</div>
        </div>

        <div className="panel-grid">
          <div className="info-card">
            <h3>Código da sala</h3>
            <p className="code-display">{gameCode || 'Aguardando...'}</p>
            <button className="primary" onClick={createGame}>Criar Jogo</button>
            {gameCode && gameStatus === 'waiting' && (
              <button className="secondary" onClick={startGame}>Iniciar Jogo</button>
            )}
          </div>

          <div className="info-card">
            <h3>Jogadores conectados</h3>
            <ul className="player-list">
              {players.length === 0 ? <li>Nenhum jogador ainda</li> : players.map((player) => (
                <li key={player.id}>{player.name}</li>
              ))}
            </ul>
          </div>
        </div>

        <div className="message-box">
          <p>{message}</p>
        </div>
      </section>

      <section className="panel responses-panel">
        <div className="panel-header">
          <div>
            <span className="eyebrow">Respostas da rodada</span>
            <h2>Justificativas</h2>
            <p className="dilemma-text">{dilemma?.question || 'Aguardando início da rodada...'}</p>
          </div>
        </div>

        <div className="response-grid">
          {responses.length === 0 ? (
            <div className="empty-state">Aguardando respostas dos alunos...</div>
          ) : responses.map((response) => (
            <div key={`${response.playerId}-${response.choice}`} className="response-card">
              <div className="response-meta">
                <strong>{response.name}</strong>
                <span>Base: {response.baseScore} pts</span>
              </div>
              <div className="response-choice">
                <span className="option-label">Escolha</span>
                <p>{response.choice}: {response.choiceText}</p>
              </div>
              <div className="response-justification">
                <span className="option-label">Justificativa</span>
                <p>{response.justification || 'Sem justificativa fornecida'}</p>
              </div>
              <div className="adjust-controls">
                <label>Ajuste de Pontuação</label>
                <div className="adjustment-input-group">
                  <button 
                    className="adjust-btn decrease" 
                    onClick={() => handleAdjustment(response.playerId, (adjustments[response.playerId] ?? 0) - 5)}
                  >
                    −5
                  </button>
                  <button 
                    className="adjust-btn decrease-small" 
                    onClick={() => handleAdjustment(response.playerId, (adjustments[response.playerId] ?? 0) - 1)}
                  >
                    −1
                  </button>
                  <input
                    type="number"
                    className="adjustment-input"
                    value={adjustments[response.playerId] ?? 0}
                    onChange={(e) => handleAdjustment(response.playerId, e.target.value)}
                    placeholder="0"
                  />
                  <button 
                    className="adjust-btn increase-small" 
                    onClick={() => handleAdjustment(response.playerId, (adjustments[response.playerId] ?? 0) + 1)}
                  >
                    +1
                  </button>
                  <button 
                    className="adjust-btn increase" 
                    onClick={() => handleAdjustment(response.playerId, (adjustments[response.playerId] ?? 0) + 5)}
                  >
                    +5
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="panel-actions">
          <button className="primary" onClick={sendAdjustments} disabled={responses.length === 0}>
            Confirmar Ajustes e Avançar
          </button>          <button className="secondary" onClick={showRanking}>
            Mostrar Ranking aos Alunos
          </button>        </div>
      </section>

      <section className="panel ranking-panel">
        <div className="panel-header">
          <span className="eyebrow">Ranking</span>
          <h2>Posição dos Alunos</h2>
        </div>
        <ol className="ranking-list">
          {ranking.length === 0 ? (
            <li>Nenhum resultado ainda</li>
          ) : ranking.map((player) => (
            <li key={player.id}>
              <span>{player.name}</span>
              <strong>{player.score} pts</strong>
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}

export default memo(Teacher);