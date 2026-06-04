import React, { useEffect, useState, useCallback, useRef, memo } from 'react';
import { socket } from './socket';

const storySummary = [
  'A Refaz é uma startup de moda circular que enfrenta desafios de controle de estoque, doações, consignação e vendas condicionais.',
  'Você atua como contador estratégico, avaliando reconhecimento de receita, mensuração de estoques e impactos de decisões sob pressão de marketing, operações e investidores.',
  'O caso foca em julgamento profissional, relatório transparente e representação fiel da realidade econômica em um ambiente digital.'
];

function Student() {
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [joined, setJoined] = useState(false);
  const [dilemma, setDilemma] = useState(null);
  const [choice, setChoice] = useState('');
  const [justification, setJustification] = useState('');
  const [timeLeft, setTimeLeft] = useState(600);
  const [ranking, setRanking] = useState([]);
  const [showRanking, setShowRanking] = useState(false);
  const [statusMessage, setStatusMessage] = useState('Preencha seus dados, entre na sala e aguarde o início da partida.');
  const [answerSent, setAnswerSent] = useState(false);
  const [visibleCount, setVisibleCount] = useState(0);
  const timeoutsRef = useRef([]);
  // Timing configuration (adjust these values to speed up / slow down reveal)
  const STAGGER_BASE = 40; // ms before first item
  const STAGGER_STEP = 80; // ms between items
  const TRANSITION_MS = 220; // ms animation duration

  useEffect(() => {
    // reveal dialogue entries in a staggered sequence when a new dilemma arrives
    timeoutsRef.current.forEach(t => clearTimeout(t));
    timeoutsRef.current = [];
    setVisibleCount(0);
    if (dilemma && dilemma.dialogue && dilemma.dialogue.length > 0) {
      dilemma.dialogue.forEach((_, i) => {
        const delay = STAGGER_BASE + i * STAGGER_STEP;
        const t = setTimeout(() => setVisibleCount((c) => Math.max(c, i + 1)), delay);
        timeoutsRef.current.push(t);
      });
    }
    return () => {
      timeoutsRef.current.forEach(t => clearTimeout(t));
      timeoutsRef.current = [];
    };
  }, [dilemma]);

  useEffect(() => {
    const handleGameStarted = (data) => {
      setDilemma(data.dilemma);
      setTimeLeft(600);
      setAnswerSent(false);
      setStatusMessage('A rodada começou! Selecione a melhor resposta e justifique seu raciocínio.');
    };
    const handleNextRound = (data) => {
      setDilemma(data.dilemma);
      setChoice('');
      setJustification('');
      setTimeLeft(600);
      setAnswerSent(false);
      setStatusMessage(`Rodada ${data.round} iniciada. Responda com clareza e rapidez.`);
    };
    const handleRoundSummary = (data) => {
      setRanking(data.ranking);
      setStatusMessage('Rodada encerrada. Veja sua posição no ranking enquanto o próximo desafio é preparado.');
      setDilemma(null);
    };
    const handleGameFinished = (data) => {
      setRanking(data.ranking);
      setDilemma(null);
      setStatusMessage('Partida concluída! Veja o pódio e celebre sua ética contábil.');
    };
    const handleShowRanking = (data) => {
      setRanking(data.ranking);
      setShowRanking(true);
      setTimeout(() => setShowRanking(false), 10000); // Mostrar por 10 segundos
    };

    socket.on('gameStarted', handleGameStarted);
    socket.on('nextRound', handleNextRound);
    socket.on('roundSummary', handleRoundSummary);
    socket.on('gameFinished', handleGameFinished);
    socket.on('showRanking', handleShowRanking);

    return () => {
      socket.off('gameStarted', handleGameStarted);
      socket.off('nextRound', handleNextRound);
      socket.off('roundSummary', handleRoundSummary);
      socket.off('gameFinished', handleGameFinished);
      socket.off('showRanking', handleShowRanking);
    };
  }, []);

  useEffect(() => {
    if (timeLeft > 0 && dilemma && !answerSent) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [timeLeft, dilemma, answerSent]);

  const joinGame = useCallback(() => {
    if (!name || !code) {
      setStatusMessage('Informe nome e código de jogo para entrar.');
      return;
    }
    socket.emit('joinGame', { code, name }, (data) => {
      if (data.error) {
        setStatusMessage(data.error);
        return;
      }
      setJoined(true);
      setStatusMessage('Conectado! Aguarde o professor iniciar o jogo.');
    });
  }, [name, code]);

  const submitAnswer = useCallback(() => {
    if (!choice) {
      setStatusMessage('Selecione uma resposta antes de enviar.');
      return;
    }
    socket.emit('submitAnswer', { code, choice, justification });
    setAnswerSent(true);
    setStatusMessage('Resposta enviada! Aguarde resultado da rodada.');
  }, [choice, code, justification]);

  if (!joined) {
    return (
      <div className="student-shell">
        <section className="panel hero-card">
          <div>
            <span className="eyebrow">Consultoria Estratégica Contábil</span>
            <h2>Entre Linhas e Decisões Contábeis: Mensuração de Estoques em Startup de Moda Circular</h2>
            <p>
              Somos consultores para a <strong>Refaz</strong>, uma startup digital de moda circular fundada por Daniela Costa. O negócio coleta, recondição e revende peças usadas com foco em sustentabilidade. Com o crescimento acelerado, decisões contábeis sobre estoques, receita e mensuração se tornaram críticas para relatórios a investidores.
            </p>
          </div>

          <div className="context-introduction">
            <div className="intro-section">
              <h3>📌 O Contexto da Refaz</h3>
              <p>
                Ao final do primeiro exercício social, o estoque físico alcança <strong>10.000 peças</strong> com diversas origens:
              </p>
              <ul>
                <li><strong>7.000 peças por doação</strong> — ampla variação de qualidade (40% como novas, 60% desgastadas)</li>
                <li><strong>3.000 peças de parceiros</strong> — sem documentação formal, valor estimado em R$ 120 mil</li>
                <li><strong>Custos de recondicionamento</strong> — R$ 15 mil em insumos de higienização e preparação</li>
                <li><strong>Itens com baixa perspectiva de venda</strong> — ~1.500 peças armazenadas há meses</li>
                <li><strong>Operações em consignação e "prove em casa"</strong> — itens fora do controle físico</li>
              </ul>
            </div>

            <div className="intro-section">
              <h3>⚖️ O Dilema Profissional</h3>
              <p>
                Vitor Almeida, contador recém-formado, enfrenta múltiplas pressões:
              </p>
              <ul>
                <li><strong>Marketing (Mariana)</strong> pressiona por reconhecimento otimista para manter atratividade da marca</li>
                <li><strong>Operações (Renata)</strong> acredita em recuperação de itens com intervenções adicionais</li>
                <li><strong>Fundadora (Daniela)</strong> busca equilibrar crescimento com transparência para investidores</li>
                <li><strong>Pressões de mercado</strong> — sem diretrizes prévias, as escolhas dependem exclusivamente do julgamento técnico</li>
              </ul>
            </div>

            <div className="intro-section">
              <h3>🎯 Seu Papel</h3>
              <p>
                Como consultor contábil, você analisará <strong>três dilemas críticos</strong> que exigem julgamento profissional, considerando:
              </p>
              <ul>
                <li>Critérios de reconhecimento e desreconhecimento de ativos e receitas (Estrutura Conceitual, CPC)</li>
                <li>Mensuração de estoques sem custo histórico e sob incerteza</li>
                <li>Comunicação transparente aos usuários das demonstrações financeiras</li>
                <li>Equilíbrio entre prudência, representação fidedigna e pressões organizacionais</li>
              </ul>
            </div>
          </div>

          <div className="story-list">
            <strong style={{ color: '#b8c1ff', marginBottom: '12px', display: 'block' }}>✓ Próximos passos:</strong>
            {storySummary.map((item, index) => (
              <div key={index} className="story-item">
                <span>{index + 1}</span>
                <p>{item}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="panel form-panel">
          <span className="eyebrow">Entrar na partida</span>
          <h2>Dados do aluno</h2>
          <input placeholder="Seu nome" value={name} onChange={(e) => setName(e.target.value)} />
          <input placeholder="Código da sala" value={code} onChange={(e) => setCode(e.target.value)} />
          <button className="primary" onClick={joinGame}>Entrar na sala</button>
          <p className="status-text">{statusMessage}</p>
        </section>
      </div>
    );
  }

  if (showRanking) {
    return (
      <div className="student-shell">
        <div className="ranking-overlay" onClick={() => setShowRanking(false)}>
          <section className="panel ranking-panel" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <span className="eyebrow">Ranking Atual</span>
                <h2>Posição dos Alunos</h2>
              </div>
              <button className="secondary" onClick={() => setShowRanking(false)}>Fechar</button>
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

  if (ranking.length > 0 && !dilemma) {
    return (
      <div className="student-shell">
        <section className="panel ranking-card">
          <span className="eyebrow">Pódio Final</span>
          <h2>Classificação</h2>
          <ol className="ranking-list">
            {ranking.map((player, index) => (
              <li key={player.id} className={index === 0 ? 'winner' : ''}>
                <span>{index + 1}. {player.name}</span>
                <strong>{player.score} pts</strong>
              </li>
            ))}
          </ol>
          <p className="status-text">{statusMessage}</p>
        </section>
      </div>
    );
  }

  if (!dilemma) {
    return (
      <div className="student-shell">
        <section className="panel waiting-card">
          <span className="eyebrow">Aguardando</span>
          <h2>Esperando o professor iniciar a próxima rodada</h2>
          <p>{statusMessage}</p>
        </section>
      </div>
    );
  }

  return (
    <div className="student-shell">
      <section className="panel student-panel">
        <div className="panel-header">
          <div>
            <span className="eyebrow">Rodada {dilemma.round}</span>
            <h2>{dilemma.question}</h2>
          </div>
          <div className="timer-box">
            <strong>{Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, '0')}</strong>
            <span className="timer-label">Tempo restante</span>
          </div>
        </div>

        {/* Dialogue between characters (avatars + messages) */}
        {dilemma.dialogue && dilemma.dialogue.length > 0 && (
          <div className="dialogue-panel" style={{ '--dialogue-transition': `${TRANSITION_MS}ms` }}>
            {dilemma.dialogue.map((entry, idx) => {
              const initials = entry.speaker.split(' ').map(n => n[0]).slice(0,2).join('');
              const isVisible = idx < visibleCount;
              return (
                <div
                  key={idx}
                  className={`dialogue-entry ${isVisible ? 'visible' : ''}`}
                  style={{ transitionDelay: `${idx * 80}ms` }}
                >
                  <div className="avatar" style={{ background: entry.color || '#666' }}>
                    {entry.avatar || entry.avatarUrl ? (
                      <img className="avatar-img" src={entry.avatar || entry.avatarUrl} alt={entry.speaker} />
                    ) : (
                      initials
                    )}
                  </div>
                  <div className="dialogue-body">
                    <div className="speaker-meta">
                      <strong className="speaker-name">{entry.speaker}</strong>
                      <span className="speaker-title">{entry.title}</span>
                    </div>
                    <div className="message-bubble">{entry.message}</div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <p className="dilemma-text">{dilemma.dilemma}</p>

        <div className="options-grid">
          {Object.entries(dilemma.options).map(([key, option]) => (
            <button
              key={key}
              className={`option-card ${choice === key ? 'selected' : ''}`}
              onClick={() => setChoice(key)}
              disabled={answerSent}
            >
              <span className="option-label">{key}</span>
              <p>{option.text}</p>
            </button>
          ))}
        </div>

        <textarea
          className="justification-box"
          rows="4"
          placeholder="Explique seu raciocínio aqui..."
          value={justification}
          onChange={(e) => setJustification(e.target.value)}
          disabled={answerSent}
        />

        <div className="student-actions">
          <button className="primary" onClick={submitAnswer} disabled={!choice || answerSent || timeLeft === 0}>
            {answerSent ? 'Resposta enviada' : 'Enviar resposta'}
          </button>
          <p className="status-text">{statusMessage}</p>
        </div>
      </section>
    </div>
  );
}

export default memo(Student);