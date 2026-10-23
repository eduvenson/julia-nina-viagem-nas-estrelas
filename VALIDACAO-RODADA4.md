# Rodada 4 — controle, dogs e pista

23/10/2026. Implementação no worktree isolado `julia-nina-proxima-fase`.
Base de produção: `b66b629fc4c32ff33825d3ea86fdbeea84c8891e`.

## Resultado esperado

Nina/Júlia conseguem identificar quem controlam, a amiga continua ajudando sem ficar
empilhada na personagem e os dogs participam com brincadeiras. As fases 1–3 continuam
preservadas. O pedido inclui publicação após validação e preflight independente.

- Nome com VOCÊ/VOS e marca dourada no chão; só a controlada recebe o rótulo.
- Trocar transfere controle para a posição real da amiga; não teleporta as identidades.
- Formação mais espaçada da amiga e escalonada dos dogs, com caminho estreito preservado.
- Brinquedos opcionais: cão corre, busca, retorna com bolinha no focinho; bônus de tempo
  único por brinquedo, sem substituir os objetivos. A ação no Sol chama a busca e a
  proximidade também a dispara nos trechos com brinquedos.
- Cães comemoram com reverência, rolar, girar, pular e dar a patinha; nomes intermitentes.
- Dubai: chapéus inclinados e capas de bruxinha animadas, mantendo as seleções reconhecíveis.
- Patins: rampas lançam a personagem; atravessar os arcos exige altura. Combo até 3 e
  bônus de tempo; sem alterar as cinco estrelas obrigatórias ou os três corações.
- Inclui os ajustes anteriores ainda locais: trilhas com mais ritmo e bateria original,
  botão de troca no canto superior direito e atualização do cache de áudio.

## Evidência

- `npm test`: 40 testes passam, incluindo troca sem teleporte, separação da amiga,
  busca com ida antes da recompensa, bônus sem duplicação, arco com altura e rampa.
- `CORE_UNDER_TEST=/tmp/nina-julia-r4-before/core.mjs node --test --test-name-pattern='regressão R4' tests/round4.test.mjs`:
  as duas regressões falham no motor anterior. Cópia isolada, sem reverter o worktree.
- `node scripts/round4-mobile.mjs`: comandos reais de toque/teclado verificam troca,
  único rótulo controlado, busca e retorno, fantasias e rampa/arco. Sem mutar simulação;
  o save de etapa é usado para inspecionar Dubai/patins.
- `npm run test:e2e`: jornada completa Sol → aniversário, com movimento, combate,
  pescaria, patins, pausa, retomada e offline. Coracões por trecho: 3, 1, 1, 3, 3, 2.
  Após essa execução, a única mudança de motor foi disparar a busca automática por
  proximidade (opcional); validada por teste unitário específico e pelo teste mobile.
- `npm run test:mobile`: Chrome e WebKit passam áudio nativo, rotação/Escape, HUD,
  recuperação, offline/Range e derrota real na nave parada atirando.
- `npm run inspect`: desktop, mobile horizontal e retrato, todos os cenários, sem
  erros JavaScript/console ou overflow dos controles. Capturas da implementação.
- `npm run test:edge` e `npm run test:entry`: passaram erros recuperáveis e entrada
  pelo jogo completo, incluindo seletor das fases clássicas.
- Inspeção mecânica Impeccable: apenas aviso preexistente na faixa da camisa do Brasil;
  mantida porque representa a roupa solicitada. Inspeção visual das capturas de Dubai,
  pista e busca confirma os rótulos e a separação dos atores.
- Trilha battle decodificada por FFmpeg: média -19,7 dB, pico -6,4 dB, sem clipping.

## Referências e limites

Descrições oficiais de [Mario/Cappy](https://supermario.nintendo.com/mario-cappy/) para
papéis distintos e [Minecraft Armored Paws](https://feedback.minecraft.net/hc/en-us/articles/26107776674445-Minecraft-1-20-80-Armored-Paws-Bedrock)
para variedade dos companheiros. Foram consultadas descrições, não sessões jogadas.

Sem teste físico no iPhone ou pesquisa de usabilidade com as crianças; os testes mobile
usam navegadores no Mac com viewport/toque emulados. A diversão e a dificuldade percebidas
continuam dependendo da próxima rodada da Nina. Não foram publicadas fotos privadas.

## Correção do preflight
O revisor reproduziu cancelamento de pesca ao trocar personagem durante o lançamento.
Agora o motor recusa troca em waiting/bite/reeling e o botão mostra “pescando”, desabilitado
até concluir a ação. Teste novo cobre as três fases sem alterar posição ou perder a vara.
Contrafactual isolado contra o candidato anterior falha; o candidato corrigido passa.
O teste mobile também lança, fisga e recolhe um peixe com comandos reais, verificando
a troca bloqueada durante a ação e liberada no fim.
