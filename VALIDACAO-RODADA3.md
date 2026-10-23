# Rodada 3 — validação local

23/10/2026. Worktree isolado `julia-nina-proxima-fase`, branch `rodada3/mobile-desafio`,
base de produção `d18783068379fde9b2588b2b13f04237920ecf2f`. Esta rodada é uma prévia;
não foi publicada nem enviada ao GitHub.

## Correções

- Chrome do iPhone: trilha original renderizada em MP3 local, reprodução nativa por gesto,
  `audioSession.type = playback` quando disponível, estado real de reprodução e botão
  de recuperação. Não confunde AudioContext rodando com som audível. Efeitos continuam
  em Web Audio. No iPhone, o controle de volume usa os botões do aparelho.
- Nas fases clássicas, o desbloqueio também configura a sessão de áudio quando suportada
  e tenta retomar um contexto suspenso/interrompido por novo gesto. Jogabilidade preservada.
- Primeira abertura em retrato mostra dica de rotação, com opção de continuar na vertical.
  Girar durante o jogo pausa e limpa entradas; voltar à horizontal exige toque para retomar.
- HUD horizontal tem uma faixa de até 64 px do topo, objetivo completo por toque, três
  corações, contador, onda/etapa e tempo. Consultar o objetivo pausa a simulação.
- Nave com nove adversários em três ondas progressivas, rajadas em padrões diferentes,
  tiros mais rápidos e mira assistida menos forte. Companheira ajuda a atirar, sem escudo
  automático que anule o risco de derrota.
- Três corações, proteção curta após dano, cronômetro por trecho e tela “Fim da missão”.
  Animação de falha, som, tentativa do trecho atual e preservação da personagem escolhida.
- Perigos móveis na casa espacial, bolas atravessando os patins, pontes mais estreitas
  e janela de fisgada variável. Instruções informam tempo e corações antes de começar.
- Removida a piscada rápida dos personagens durante invulnerabilidade; dano tem feedback
  de borda e movimento discreto de câmera, respeitando redução de movimento.

## Evidências executadas

| Verificação | Resultado |
| --- | --- |
| `npm test` | 33/33: combate perdedor/vencedor, três impactos sem escudo escondido, cronômetro, colisões, hazards, música nativa, bloqueio e recuperação, além das invariantes anteriores. |
| `npm run test:e2e` | Percurso completo passou com toque/teclado em 844×390: Sol 3/3, nave 9/9, casa 3/3, Dubai 6/6, pesca 5/5, patins 5/5, aniversário, retomada e offline. Todos com três corações restantes na trajetória ativa automatizada. |
| `npm run test:mobile` | Chrome e WebKit reais emulados com viewport de iPhone: primeira abertura, rotação, HUD <=64 px, objetivo sem consumo de tempo, áudio nativo, interrupção e retomada, reprodução offline e Range de 16 bytes com resposta 206. |
| Derrota no navegador | Nave parada mantendo espaço perde; tela “Fim da missão”, zero corações, objetivos incompletos. Retry reabre só a nave, com Nina e três corações. |
| Bloqueio de áudio simulado | Primeiro `play()` rejeitado: UI informa bloqueio, não declara sucesso e novo toque recupera. Este cenário é contrato simulado, distinto do teste de mídia nativa sem mock. |
| `node scripts/fishing-visual.mjs` | Vara, linha 3D, mordida, fisgada e devolução passaram novamente. |
| `npm run inspect` | Desktop 1440×900, horizontal 844×390 e retrato 390×844, sem overflow de controles ou erros de console/JavaScript. |
| `npm run test:edge` e `npm run test:entry` | Falhas recuperáveis, fases antigas e acesso pela abertura horizontal passaram. |
| Prévia em rede local | Abertura, dica de rotação, música nativa e partida com três corações passaram no navegador acessando o servidor de prévia pela rede. |

## Contrafactual e diagnóstico

Três testes `regressão R3:` foram executados sobre cópia isolada do motor anterior e
**os três falharam**. Na versão atual passam: ficar parado atirando perde, três impactos
esgotam vidas e acabar o tempo encerra a tentativa. `scripts/hud-regression.mjs` permite
usar `STYLE_UNDER_TEST` com o CSS anterior para demonstrar que o HUD antigo ultrapassa 64 px.

A primeira execução da jornada nova perdeu na corrida: o controlador automatizado
saltava cedo demais para blocos móveis. A trajetória de teste passou a saltar no momento
adequado, mantendo os perigos e três corações. Também foi corrigida uma margem de colisão
vertical: pés acima do bloco não podem sofrer dano de uma altura invisível, com regressão própria.
Não houve rerun cego para esconder falhas ou alteração de estado para obter vitória.

## Música e limites de comprovação

- Arquivos originais em `aventura/audio/`; composição em `aventura/score.js` e renderização
  reproduzível com `npm run music` e FFmpeg. Sem API, serviço pago ou gravação de terceiros.
- Reprodução observada por `playback`, `paused`, `readyState` e avanço de `currentTime`;
  a forma de onda MP3 foi decodificada e tem sinal, sem clipping. Exemplo adventure:
  média -20,4 dB e pico -8,3 dB pelo FFmpeg `volumedetect`.
- Cache responde requisições parciais de áudio, inclusive offline. Isso foi exercitado
  no Chrome e no WebKit, além do percurso completo no Chrome.
- Fontes primárias: [WebKit 237322](https://bugs.webkit.org/show_bug.cgi?id=237322) e
  [WebKit 252746](https://bugs.webkit.org/show_bug.cgi?id=252746) descrevem o comportamento
  de áudio ambiente e silencioso. São fundamento técnico, não diagnóstico confirmado do iPhone do usuário.
- Não houve teste físico no Chrome do iPhone, nem confirmação de saída pelos alto-falantes
  ou medição de FPS/bateria em hardware móvel. O WebKit usado é o navegador de teste no Mac.
- A prévia de rede local usa HTTP: permite conferir o jogo e a música no mesmo Wi‑Fi;
  o teste de service worker/offline foi feito em localhost, que é contexto seguro para o navegador.
- “Mais divertido” e dificuldade adequada ainda dependem da rodada real de Nina/Júlia.

## Artefatos locais

`test-results/unit-rodada3.txt`, `jornada-rodada3.txt`, `mobile-rodada3.txt`,
`contrafactual-rodada3.txt`, `contrafactual-hud-rodada3.txt`, `inspecao-rodada3.txt`
e capturas em `test-results/rodada3/`. São ignorados pelo Git.

A pasta de prévia contém apenas arquivos estáticos de execução; não expõe Git, fotos
privadas, ambiente ou credenciais. O link principal continua oferecendo as fases 1–3 e a fase 4.

## Correção do preflight de publicação

A revisão independente encontrou Escape retomando a simulação atrás da dica de rotação.
O atalho agora respeita a dica e o loop de jogo exige que ela esteja oculta.
O teste mobile pressiona Escape em retrato e exige painel pausado e tempo congelado.
Contrafactual isolado com o app anterior falhou: tempo avançou 0,35 s atrás da dica;
o mesmo caso corrigido passou. O fluxo mobile completo foi revalidado em Chrome e WebKit.
