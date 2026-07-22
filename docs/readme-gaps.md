# Lacunas do README

Cada item abaixo é um artefato que o README precisa e que ainda não existe no
repositório. Enquanto a tarefa está aberta, a posição correspondente no README
fica marcada como `*a preencher*`. Ao fechar uma tarefa, o marcador é
substituído pelo fato real e a linha sai desta lista.

---

- [ ] **Verificação automatizada de acessibilidade**

  **Por que o README precisa:** a tabela de Garantias afirma ausência de
  violações WCAG 2.1 AA nas rotas, nos dois temas, sem comando que prove.

  **O que implementar:** adicionar `@axe-core/playwright` e `playwright` como
  dependências de desenvolvimento e criar `tests/a11y.spec.ts`, que percorre as
  8 rotas (`/`, `/lab/raymarched-forms`, `/lab/fluid`, `/lab/verlet`,
  `/lab/generative`, `/lab/cinematic-scroll`, `/lab/kinetic-type`,
  `/lab/audio-reactive`) nos temas escuro e claro, rodando o axe com as tags
  `wcag2a`, `wcag2aa`, `wcag21a` e `wcag21aa`. O contexto precisa usar
  `reducedMotion: "reduce"`: sem isso, elementos `.reveal` capturados no meio da
  animação de entrada produzem falsos positivos de contraste. Expor como
  `npm run test:a11y`.

  **Critério de conclusão:** `npm run test:a11y` roda contra o build de produção
  e sai com código 0, cobrindo 16 combinações de rota e tema.

---

- [ ] **Teste de laço único de animação**

  **Por que o README precisa:** a tabela de Garantias afirma que cada peça roda
  uma única animação, sem comando que prove. A invariante não é decorativa: um
  `IntersectionObserver` dispara ao observar, e um agendamento descuidado abre um
  segundo laço em paralelo — o defeito não gera erro, apenas dobra o trabalho por
  quadro.

  **O que implementar:** em `tests/raf.spec.ts`, instrumentar
  `window.requestAnimationFrame` via `addInitScript` para contar chamadas, abrir
  cada rota de peça, medir a taxa por segundo em uma janela de 2 s e afirmar o
  número esperado de laços por página (1 para tipografia, fluido, raymarching e
  campo; 2 para verlet, que mantém um laço separado para o cursor).

  **Critério de conclusão:** `npm run test:raf` falha se qualquer peça exceder a
  contagem esperada de laços.

---

- [ ] **Verificação dos cabeçalhos de segurança**

  **Por que o README precisa:** a tabela de Garantias afirma que os cabeçalhos
  declarados em `next.config.ts` chegam às respostas, sem comando que prove.

  **O que implementar:** `tests/headers.spec.ts` sobe o build de produção e
  afirma, para uma rota de página e um asset estático, a presença de
  `Content-Security-Policy`, `X-Content-Type-Options`, `X-Frame-Options`,
  `Referrer-Policy`, `Strict-Transport-Security`, `Permissions-Policy` e
  `Cross-Origin-Opener-Policy` — e que a CSP de produção não contém
  `'unsafe-eval'`, presente apenas em desenvolvimento.

  **Critério de conclusão:** `npm run test:headers` sai com código 0 contra
  `npm run start`.

---

- [ ] **Medição de desempenho reproduzível**

  **Por que o README precisa:** a seção Desempenho está inteira como
  `*a preencher*`. Um projeto cujo argumento é orçamento por quadro precisa
  publicar o número, o método e o hardware.

  **O que implementar:** um script que colete, por peça, o tempo médio e o p95
  de quadro em uma janela fixa, via `performance` no navegador, além do tamanho
  de JavaScript da primeira carga que o `next build` reporta. O script precisa
  registrar o hardware (CPU, GPU, se roda com aceleração) e o navegador usado, e
  gravar o resultado em `docs/benchmarks.md`.

  **Critério de conclusão:** `docs/benchmarks.md` existe com números, hardware e
  o comando que os reproduz; a seção Desempenho do README passa a citá-los.

---

- [ ] **Integração contínua e sinais na primeira dobra**

  **Por que o README precisa:** a primeira dobra não tem badges, porque não
  existe verificação automatizada cujo estado um badge pudesse refletir. Badge
  que não corresponde a um pipeline real é decoração.

  **O que implementar:** um workflow em `.github/workflows/ci.yml` que rode
  `npm ci`, `npm run lint`, `npm run typecheck`, `npm run build` e os testes das
  tarefas acima, em push e pull request. Depois, incluir na primeira dobra do
  README o badge de estado desse workflow.

  **Critério de conclusão:** o workflow aparece verde na aba Actions e o badge da
  primeira dobra reflete o estado real do último push.

---

- [ ] **Teste do determinismo da composição generativa**

  **Por que o README precisa:** a tabela de técnicas afirma que a mesma semente
  reproduz a mesma composição. É a única invariante do projeto que pode ser
  testada como função pura, e hoje não é.

  **O que implementar:** teste de unidade sobre `lib/generative.ts` que chama
  `compose(seed)` duas vezes para um conjunto de sementes e afirma igualdade
  profunda dos módulos gerados, além de afirmar que sementes diferentes produzem
  saídas diferentes.

  **Critério de conclusão:** `npm test` cobre `compose` e falha se o gerador
  deixar de ser determinístico.
