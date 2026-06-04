import React, { useState } from 'react';
import Teacher from './Teacher';
import Student from './Student';
import './App.css';

function App() {
  const [role, setRole] = useState(null);

  return (
    <div className="app-shell">
      <header className="hero-panel">
        <div className="hero-copy">
          <span className="eyebrow">Refaz - Dilemas Contábeis</span>
          <h1>Entre Linhas e Decisões Contábeis</h1>
          <p className="hero-description">
            Uma experiência de consultoria estratégica baseada em um caso de ensino sobre mensuração de estoques em uma startup de moda circular.
            Escolha seu papel, conecte-se com o professor e resolva dilemas contábeis com foco em julgamento técnico.
          </p>
        </div>
        {!role ? (
          <div className="role-actions">
            <button className="role-button primary" onClick={() => setRole('teacher')}>
              Professor / Facilitador
            </button>
            <button className="role-button secondary" onClick={() => setRole('student')}>
              Aluno / Jogador
            </button>
          </div>
        ) : (
          <button className="role-button tertiary" onClick={() => setRole(null)}>
            Voltar para seleção
          </button>
        )}
      </header>

      <main className="page-content">
        {role === 'teacher' && <Teacher />}
        {role === 'student' && <Student />}
        {!role && (
          <section className="context-panel">
            <div className="context-card">
              <span className="eyebrow">Consultoria Estratégica</span>
              <h2>Entre Linhas e Decisões Contábeis</h2>
              <p>
                Mensuração de estoques em uma startup de moda circular. O caso apresenta dilemas de doações, aquisições sem comprovação, baixa rotatividade de coleções, consignação, vendas condicionais e custos de frete.
              </p>
              <p>
                Você assume o papel de contador da Refaz, avaliando decisões que impactam resultado, posição patrimonial e credibilidade perante investidores.
              </p>
            </div>
            <div className="context-summary">
              <h3>Resumo do caso</h3>
              <p><strong>Objetivo:</strong> desenvolver julgamento profissional em contextos de incerteza.</p>
              <p><strong>Ambiente:</strong> operação digital de moda circular com estoque heterogêneo, alta pressão e informações incompletas.</p>
              <p><strong>O que você verá:</strong> três dilemas estratégicos, decisões de reconhecimento e mensuração, e desempenho coletivo em ranking.</p>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}

export default App;