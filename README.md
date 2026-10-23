# 🚀 Viagem nas Estrelas · Viaje a las Estrellas

> **100% vibe coded.** Sem framework. Sem npm install. Sem adulto mandando. Só imaginação e estrelas.

---

## 🌍🇧🇷🇦🇷🌎 Feito na divisa do mundo

Este jogo nasceu **exatamente na fronteira entre Brasil e Argentina** — onde duas crianças se encontram toda semana e decidem explorar o universo juntas.

| 👧 Nina | 👧 Julia |
|---|---|
| Bernardo de Irigoyen 🇦🇷 | Barão de Lucena — Valdomeira 🇧🇷 |
| Fala espanhol | Fala português |
| Ama o espaço | Ama o espaço |
| **Co-fundadora do universo** | **Co-fundadora do universo** |

A ideia surgiu numa tarde em que as duas estavam olhando pro céu e perguntaram:  
*"Mas por que Júpiter é tão grande?"*

Esse jogo é a resposta.

---

## 🎮 Jogue agora

👉 **[Clique aqui pra jogar](https://eduvenson.github.io/julia-nina-viagem-nas-estrelas/)**

Funciona em celular, tablet e computador.  
Não precisa instalar nada. É só abrir e voar. 🚀

## Aventura 3D — O presente da Nina

A nova fase está em `aventura.html`, também acessível pela abertura e pelo seletor das fases
anteriores. Criada como presente da Nina para os oito anos da Júlia:

Estação Solar → Terra → batalha espacial → casa espacial → Dubai/Halloween → pescaria em Valdomeira →
patins em Bernardo de Irigoyen → aniversário. As duas e os cinco cães viajam juntos.

Prioridade para **celular na horizontal**: analógico à esquerda, ação e pulo à direita,
arrastar o cenário para girar a câmera. No computador: WASD/setas, espaço e E.
Na nave, espaço também dispara; manter o botão de ação ou a tecla faz tiro contínuo.
O botão de pausa permite ajustar música, efeitos, volume e PT/ES. O progresso é salvo
por trecho, neste navegador; fica disponível offline após a primeira carga completa.

Modelos 3D originais arredondados, navegação em terceira pessoa e trilha original por cena.
Júlia usa Brasil, Nina usa Argentina; Bidu é preto e Jujuba amarelo/marrom.
As fotos privadas de referência não fazem parte dos arquivos do site.

Para rodar localmente, `python3 -m http.server 4173` e abrir
`http://localhost:4173/aventura.html`. Não há build nem dependência remota para jogar.
Three.js e a fonte Baloo estão incluídos com suas licenças.

Desenvolvimento: `npm ci`; `npm test` para as regras do jogo; `npm run test:e2e`,
`npm run test:edge` e `npm run inspect` com o servidor local ativo e Chrome instalado.
`npm run vendor` reproduz os arquivos locais do Three.js. Consulte
[o plano](PLANO-IMPLEMENTACAO.md) e [as evidências atuais](VALIDACAO-RODADA3.md).

---

## ✨ O que é esse jogo?

Uma viagem pelo sistema solar feita **para crianças, por crianças.**

- 🌞 Visita o Sol, a Terra, Marte, Júpiter, Saturno e Netuno
- 🧠 Quiz espacial no final pra testar o que aprendeu
- 🇧🇷🇦🇷 Disponível em **português e espanhol** — a Nina joga em espanhol, a Julia em português
- ⭐ Sistema de XP e conquistas espaciais
- 🎵 Música original: Web Audio nas fases clássicas e reprodução nativa local na aventura 3D
- 📱 Mobile-first, funciona offline depois de carregar

---

## 🛸 Por que "vibe coded"?

Porque foi feito no **feeling**.  
Sem reunião de alinhamento. Sem sprint planning. Sem Jira.  
Só duas crianças numa fronteira, um tio com um computador, e a vontade de transformar curiosidade em jogo.

As fases originais cabem num único `.html`; a aventura 3D tem módulos separados.
Você pode abrir no bloco de notas e entender tudo.  
**Isso é proposital.**

---

## 🌐 Para todas as crianças do mundo

Este jogo é **aberto, gratuito e sem login.**

Se você quiser adaptar pra sua língua, seu país, sua cidade — faz isso.  
Se você quiser adicionar novos planetas, novas perguntas, novos personagens — abre o `.html`, edita, e manda PR.

As únicas regras são:
1. Precisa ser divertido
2. Precisa ser verdadeiro (sem fatos falsos sobre o espaço)
3. Precisa ter o nome de uma criança como autora

---

## 🗺️ Onde fica isso?

```
Brasil 🇧🇷          Argentina 🇦🇷
Valdomeira    ←→    Bernardo de Irigoyen
     |                      |
     └──────── 🚀 ──────────┘
          aqui nasceu o jogo
```

---

## 💜 Créditos

**Design & gameplay:** Nina e Julia  
**Código:** Tio Du (com muita orientação das chefas)  
**Astronomia:** NASA, curiosidade e muita pergunta sem resposta fácil  
**Música:** Web Audio API improvisada às 23h  

---

*Feito com amor na fronteira mais bonita do mundo. 💜*  
*Hecho con amor en la frontera más linda del mundo. 💜*

## Segunda rodada de jogabilidade

Escolha Nina ou Júlia no começo. A amiga acompanha e ajuda; os cães farejam, saltitam,
exploram e brincam, com seus nomes aparecendo em rodízio. Aliens patrulham e atiram,
zumbis avisam antes do bote, e a pescaria exige cruzar pontes e saltar entre plataformas.
A vara, a linha, o peixe mordendo, a fisgada e a devolução são animados em 3D.

`node scripts/fishing-visual.mjs` verifica esses estados renderizados no navegador.
Referências de animação, IA e desempenho: [pesquisa da rodada](REFERENCIAS-RODADA2.md).

## Rodada 3 — celular e desafio

A nova aventura orienta a virar o celular, tem HUD compacto e objetivo completo por toque.
Três corações, cronômetro, perigos móveis e três ondas de naves permitem perder e tentar
o trecho de novo. A companheira ajuda sem fornecer escudo automático.

A trilha original é reproduzida por mídia nativa para melhor compatibilidade no iPhone.
Ative pelo botão de música ou pelo toque inicial; se houver interrupção, use “Toque para ouvir”.
No iPhone, o volume é ajustado pelos botões do aparelho. As fases antigas são preservadas.

`npm run test:mobile` usa Chrome instalado e o WebKit de teste (`npx playwright install webkit`).
`npm run music` renderiza os MP3 originais localmente e requer FFmpeg; não é necessário para jogar.
