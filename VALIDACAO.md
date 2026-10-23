# Validação da primeira rodada da aventura 3D

Registro histórico. A versão atual está em [VALIDACAO-RODADA2.md](VALIDACAO-RODADA2.md).

Validada localmente em 23/10/2026, no worktree `julia-nina-proxima-fase`, branch
`fase/nova-fase`, base `e770504`. Implementação local, sem publicação.

## Meta entregue

| Requisito | Implementação e evidência |
| --- | --- |
| Nova fase sem substituir as anteriores | Links na abertura e seletor de `index.html`; teste de entrada pelo fluxo original, com as quatro opções visíveis. |
| 3D real, arte arredondada | Three.js local, geometria de personagens/cães e cenas em `aventura/world.js`; screenshots renderizados, sem mockup. |
| Celular horizontal, navegação familiar | Analógico esquerdo, pulo/ação à direita, câmera por arraste, movimento relativo à câmera; E2E com eventos de toque CDP em 844×390. Manifest próprio com orientação horizontal. |
| Júlia e Nina | Júlia com camisa do Brasil e laço; Nina moreninha clara, cabelo escuro e camisa da Argentina. Inspeção visual na versão atual. |
| Cinco cães | Marcha, Chucha e Luca da Nina; Jujuba amarelo/marrom e Bidu preto da Júlia. Presentes em todos os trechos, inclusive a bordo. |
| Terra e embarque | Três estrelas e chegada ao foguete: 3/3, cinco corações no percurso E2E. |
| Batalha espacial | As duas na mesma nave; seis naves atingidas com bolhas: 6/6, cinco corações. |
| Casa e corrida ao foguete | Diálogo “Vem, Nina!”, três baterias, obstáculos, pulo e aceleração: 3/3, quatro corações. |
| Dubai/Halloween | Burj Khalifa, Dubai Frame, palmeiras, abóboras e seis zumbis; bolhas e dança após o acerto: 6/6, cinco corações. Câmera ajustada e reconferida no enquadramento horizontal. |
| Pesca em Valdomeira | Lançamento, espera, mordida, puxada e soltura; peixes animados. E2E verifica puxada antecipada sem ponto, depois cinco capturas: 5/5, cinco corações. |
| Patins em Bernardo de Irigoyen | Pista junto ao lago, capacetes/proteções, cones, aceleração, cinco estrelas e chegada: 5/5, quatro corações. |
| Final de oito anos | Bolo com vela 8, dedicatória da Nina, cinco cães, confete, replay e retomada do aniversário. |
| Música emocionante por cenário | Cinco temas originais sintetizados localmente: aventura, batalha, corrida, calma e aniversário; reverberação, efeitos, controle de volume. Contexto de áudio ativo e sinal RMS positivo em cada trecho no E2E. |
| Pausa e retomada | Pausa congela movimento; save por trecho validado; recarga reabre o aniversário concluído. |
| PT/ES | Traduções de objetivos, diálogos, ações, ajuda, configurações e final; troca real de idioma no E2E. |
| Offline | Recarga sem rede após instalação do service worker, tanto na raiz quanto em servidor local com prefixo `/julia-nina-viagem-nas-estrelas/`. |
| Falhas recuperáveis | Save inválido, storage negado, WebGL indisponível e falha de módulo exercitados no navegador. |
| Privacidade | Fotos de referência não copiadas ao repositório. Nenhum login, serviço pago, analytics ou envio de dados na nova aventura. |

## Comandos e resultados

- `npm test`: **12/12** testes determinísticos passaram. Cobrem sequência, vínculos dos cães,
  condições de vitória, alcance, duplicação de pontos, colisão/invulnerabilidade, salto, pesca,
  movimento, estados parados e validação do save.
- `npm run test:e2e`: **passou**, percurso completo com entradas reais de toque, sem mutação
  do estado ou atalho de vitória. Exercitou multitoque, câmera, pausa, idioma, áudio, save e offline.
  O diagnóstico `window.aventura.snapshot()` oferece somente cópias para observação.
- `npm run test:edge`: **cinco cenários passaram**: save inválido, storage negado, ausência
  de WebGL, módulo indisponível e fluxo do seletor antigo.
- `npm run inspect`: **sem overflow dos controles e sem erros de JavaScript/console** nos
  oito estados de desktop 1440×900, celular horizontal 844×390 e retrato 390×844.
  Para inspeção dos trechos isolados, este script prepara saves; isso não é a prova do percurso.
- Revalidação dirigida após ajuste final da câmera de Dubai: enquadramento horizontal,
  três disparos/objetivos e ausência de erros confirmados. A alteração foi somente de câmera;
  a lógica do percurso completo permanece a mesma do E2E aprovado.
- Prefixo de publicação simulado localmente: módulos, fonte, service worker e recarga
  offline passaram em `/julia-nina-viagem-nas-estrelas/`.
- `git diff --check` e `node --check` dos módulos e service worker: **passaram**.
- Detector Impeccable: executado com parser degradado; apontou uma animação de largura,
  substituída por `transform: scaleX`. Não equivale a auditoria automática completa de contraste.

Evidências locais, ignoradas pelo Git: `test-results/visual/` (implementação renderizada),
`test-results/journey/` (conclusões alcançadas jogando) e `test-results/inspecao-final.txt`.

## Limites da evidência

- Chromium/Chrome com emulação de viewport e toque, não aparelho físico. Sem afirmar
  benchmark de FPS, autonomia de bateria, compatibilidade completa com Safari/iOS ou teste com crianças.
- Personagens são modelos estilizados originais, não reprodução fotográfica dos rostos.
- A aparência dos três cães da Nina continua provisória. Jujuba/Bidu seguem as cores confirmadas.
- Cenários locais são interpretações lúdicas; o percurso do lago não é uma reconstrução geográfica.
- Uma jogadora controla a líder, a amiga acompanha e é possível alternar a líder. Sem multiplayer em rede.
- Checkpoint no início de cada trecho; não salva a posição/contagem intermediária. Navegadores
  que negam storage mostram aviso e permitem continuar na aba.
- Offline depende da primeira instalação completa do cache. Uma instalação antiga precisa
  carregar a atualização online primeiro. As fases legadas mantêm seu comportamento anterior.
- A avaliação visual é heurística; a escolha de dificuldade e o gosto musical devem ser conferidos com Nina e Júlia.

## Dependências e reprodução

Three.js 0.186.1 e RoundedBoxGeometry vendorizados; licença MIT incluída.
Baloo 2 auto-hospedada, licença OFL incluída. Runtime estático, sem CDN/API externa.
`npm ci && npm run vendor` reproduz as bibliotecas; `npm run serve` inicia o servidor.
Os testes de navegador usam o Chrome instalado (`channel: 'chrome'`).
