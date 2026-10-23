# Segunda rodada — jogabilidade, animação e 3D

Implementada e validada localmente em 23/10/2026 no worktree `julia-nina-proxima-fase`,
branch `fase/nova-fase`. Este é o registro da validação local anterior à publicação. A prévia está no servidor local 4174;
4173 permanece disponível para os scripts de validação.

## Feedbacks atendidos

| Pedido | Resultado verificável |
| --- | --- |
| Escolher Nina ou Júlia | Seleção antes de começar; líder persistida no save, inclusive na retomada. Saves da primeira rodada continuam legíveis. |
| Escolhida na frente, amiga atrás e ajudando | Companheira tem posição própria com atraso e distância; pode recolher estrelas deixadas pela líder, disparar junto e oferecer proteção. Na pesca, fica ao lado para não esconder a ação. |
| Movimentos menos iguais | Ritmos, amplitudes, balanço, olhar e cabelo separados; cotovelos e joelhos articulados, piscadas, poses de salto e direção de movimento. |
| Cães vivos e nomes ocasionais | Marcha fareja, Chucha saltita, Luca explora, Jujuba brinca e Bidu senta; patas, orelhas, cauda e cabeça articuladas. Um nome por vez em rodízio. Chamar a turma provoca aproximação e reação. |
| Nave atira com espaço | Espaço ou E mantidos disparam; botão de toque mantido também. Tiros percorrem o espaço, colidem e reagem ao escudo; não somam ponto no clique. |
| Orientação das meninas na nave | Pilotos virados para o bico e para os adversários; painel à frente e propulsores atrás. Cockpit reconstruído e câmera em ângulo. |
| Aliens ativos | Duas ondas, patrulha, aviso de carga e projéteis que podem atingir uma nave parada; tiros permitem desviar. Segunda onda tem escudo. |
| Zumbis mais divertidos | Perseguem, preparam bote com aviso, avançam e se recuperam; pernas, braços e cabeça animados; depois de libertados, dançam. |
| Dubai mais reconhecível | Burj Khalifa e Dubai Frame, praça com piso, palmeiras, água/fonte animada e decoração de Halloween. É interpretação lúdica. |
| Pescaria com exploração | Pontes estreitas, três vãos para saltar, três pontos de pesca com quotas 2+2+1 e retorno ao checkpoint após queda. |
| Mostrar vara, linha e peixe | Vara articulada na mão, linha 3D, lançamento em arco, boia, ondulações, peixe se aproximando/mordendo, vara vergando, fisgada e devolução. Aproximação suave da câmera. Vitória aguarda a animação do último peixe. |
| Origem no Sol | Abertura e primeiro cenário na estação solar imaginária, com o Sol visível e destino Terra antes da batalha em órbita. |
| Aplicar boas práticas de jogos com IA | Pesquisa em fontes primárias registrada em `REFERENCIAS-RODADA2.md`; estados de comportamento, antecipação de ataque, animação articulada, limite de efeitos e batching de objetos animados. |

## Verificação executada

- `npm test`: **24/24 passaram**. Incluem estados de combate, percurso físico de tiros,
  dano após aviso, escolha/save, ajuda da companheira, limites de projéteis, pontes e saltos,
  pesca em pontos diferentes e espera da animação antes da conclusão.
- Contrafactual: quatro testes com o prefixo `regressão:` foram executados sobre a cópia
  anterior de `core.js`, guardada fora do worktree. **Os quatro falharam** na versão anterior
  e passaram na atual. Resultado em `test-results/contrafactual-rodada2.txt`.
- `npm run test:e2e`: **percurso inteiro passou** com Nina escolhida e entradas reais de
  teclado/toque no Chromium em 844×390, sem alteração do estado nem atalho de vitória.
  Resultado: Sol 3/3 (5 corações), nave 6/6 (4), casa 3/3 (4), Dubai 6/6 (5),
  pesca 5/5 nos três pontos após os três saltos (5), patins 5/5 (5), aniversário,
  retomada e recarga offline. Espaço mantido na nave e multitoque disparar/mover em Dubai.
- `node scripts/fishing-visual.mjs`: **passou**. Verifica vara, 32 segmentos de linha visíveis,
  peixe mordendo, peixe acima da água na fisgada, contagem sem duplicar e devolução.
  Screenshots de lançamento, mordida e fisgada vêm da implementação renderizada.
- `npm run inspect`: **sem erros de JavaScript/console e sem overflow dos controles** nas
  telas desktop 1440×900, celular horizontal 844×390 e retrato 390×844, incluindo a seleção.
  Trechos isolados preparados por save para inspeção, distintos da prova do percurso completo.
- `npm run test:edge`: **cinco cenários passaram**: save inválido, storage bloqueado,
  WebGL ausente, falha no carregamento de módulo e entrada pelo seletor antigo.
- `git diff --check` e sintaxe dos módulos/service worker: **passaram**.

Os testes de toque foram corrigidos após observação dos eventos reais do navegador:
o harness enviava o dedo remanescente no `touchEnd`, soltando o dedo errado. A versão final
libera o dedo correto e verifica movimento/pulo simultâneos e disparo mantido com movimento.
A pesca espera estados e cooldown da simulação; a espera final reconhece o mundo parado
após concluir. Falhas não foram ocultadas com retries.

## 3D e desempenho

Objetos estáticos e animados compartilham geometria/material e instâncias. Hierarquias de
articulação são preservadas; matrizes atualizam as instâncias visíveis. A vara e os 32 segmentos
de linha usam dois conjuntos de instâncias, em vez de uma chamada por segmento. Vetores e
matrizes temporárias são reutilizados. Há limites para tiros, partículas e resolução; uma luz
gera sombras.

As contagens atuais de desenho constam em `test-results/inspecao-rodada2-final.txt`.
São evidência estrutural, não benchmark de FPS em celular físico.

O detector Impeccable foi executado em modo degradado (sem parsers completos). O achado de
“side-tab” na camisa do Brasil corresponde à gola verde do ícone solicitado, não a uma borda
decorativa de card; foi conferido na tela renderizada. Não é uma auditoria completa de contraste.

## Limites

- Chrome/Chromium com viewport e toque emulados; não substitui teste em iPhone/Android físico.
- A rodada de Nina/Júlia valida diversão e dificuldade; os testes automatizados não provam isso.
- Cães da Nina ainda têm aparência provisória. Jujuba amarelo/marrom e Bidu preto seguem as cores confirmadas.
- Arte 3D estilizada original; sem promessa de reprodução fotográfica das crianças.
- Sem multiplayer em rede. Uma jogadora controla a líder e a companheira é local.
- A estação solar é imaginária; os cenários de Dubai e da fronteira não são reconstruções topográficas.
- Fotos privadas continuam fora do repositório. Runtime sem IA remota, analytics ou serviço pago.
- Atualização de scripts/estilos tenta a rede e recorre ao cache offline. Uma aba já aberta
  precisa ser recarregada para receber código novo. O endereço 4174 evita caches da prévia anterior.

## Evidências locais

- `test-results/unit-rodada2.txt`
- `test-results/contrafactual-rodada2.txt`
- `test-results/jornada-rodada2.txt`
- `test-results/inspecao-rodada2-final.txt`
- `test-results/visual/` — incluindo `mobile-choose.png`, `mobile-terra.png`, `mobile-1.png`,
  `fishing-cast.png`, `fishing-bite.png` e `fishing-reel.png`
- `test-results/journey/` — etapas concluídas jogando

Essas evidências locais são ignoradas pelo Git. Testes e scripts permitem reproduzi-las.

## Preparação da publicação

O preflight independente encontrou o link da aventura fora da tela inicial legada no celular
horizontal 844×390. A abertura passou a ter rolagem segura, dimensões compactas nessa
orientação e alvo de toque de pelo menos 44 px. `npm run test:entry` confirma a posição
e o toque real que abre o 3D. O mesmo teste falha sobre o HTML do candidato anterior
(`009fa4647a0fcad35f51631da03646265e28e44e`), sem desfazer o fix no worktree.

`.gitattributes` preserva o whitespace canônico do GLSL embutido no bundle gerado e da
licença OFL original. Código autoral continua verificado normalmente por `git diff --check`.
`npm run vendor` reproduziu os bundles sem diferenças. Qualquer alteração do candidato
após o parecer independente exige novo preflight antes de abrir a PR.
