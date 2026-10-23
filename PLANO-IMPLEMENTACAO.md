# Fase 4 — O presente da Nina

## Meta
Entregar uma aventura 3D jogável do começo ao aniversário de oito anos da Júlia,
sem substituir nem quebrar as três fases anteriores. Publicação no GitHub Pages autorizada
pelo usuário em 23/10/2026, depois da segunda rodada.

## Entrega
1. Entrada própria `aventura.html`, acessível também pelo seletor antigo.
2. Three.js local e modelos originais arredondados: meninas, cães, foguete e cenários.
3. Estação Solar: recolher estrelas, embarcar juntas e viajar rumo à Terra.
4. Espaço: pilotar, desviar e vencer aliens com bolhas.
5. Casa espacial: recolher energia, pular obstáculos e voltar ao foguete.
6. Dubai: Burj Khalifa, palmeiras e zumbis de Halloween; bolhas quebram o feitiço.
7. Valdomeira: minijogo de pescaria com janela de acerto visível e soltura dos peixes.
8. Bernardo de Irigoyen: patins em pista junto ao lago, cones e estrelas.
9. Festa: meninas, cinco cães, bolo com oito e dedicatória da Nina.
10. Celular horizontal como alvo principal, analógico/câmera familiares ao Roblox, toque/teclado,
    pausa, música original por cena após gesto, PT/ES, progresso local validado e falhas recuperáveis.

## Arquitetura e custo
Site estático sem API paga, sem imagens pessoais e sem recursos remotos em runtime.
Biblioteca vendorizada com versão e licença. Estado de jogo separado da renderização.
Uma luz com sombras, resolução limitada, geometrias/materiais compartilhados e limpeza de cenas.
Sem multiplayer em rede: uma jogadora guia e a amiga acompanha automaticamente.

## Validação
- Testes determinísticos das condições de vitória, colisão, recuperação, pesca e save.
- Percurso real no Chromium, sem atalhos de vitória: entradas de jogo e estados inspecionados.
- Inspeção visual desktop e celular, teclado/toque, pausa e retomada, PT/ES e offline.
- `git diff --check`, sintaxe e ausência de erros de console.
- Evidências e limitações em `VALIDACAO.md`; não equivalem a teste com crianças.

## Referências e limites
- Three.js: https://threejs.org/manual/pages/creating-a-scene.html e
  https://threejs.org/manual/pages/responsive.html (renderização e responsividade).
- Dubai: https://www.visitdubai.com/en/explore-dubai/dubai-neighbourhoods/downtown-dubai
  (silhueta do Burj Khalifa; ambientação Halloween é ficção).
- Lago fronteiriço: https://misiones.gob.ar/ecologia-superviso-la-busqueda-del-yacare-arrojado-en-el-lago-internacional-en-bernardo-irigoyen/
  (existência/localização; pista e percurso são interpretação lúdica).
- Kirby: https://ec.nintendo.com/NZ/en/titles/70010000046406 e
  Yoshi: https://www.nintendo.com/en-gb/Games/Nintendo-Switch-games/Yoshi-s-Crafted-World-1233953.html
  (cooperação nas descrições oficiais; sem alegar inspeção prática dos jogos).
- Roblox é a referência visual pedida, não plataforma, integração ou asset licenciado.

## Segunda rodada — implementada
- Escolha da líder e ajuda real da companheira, com progresso compatível.
- Movimentos individuais de meninas e cães, nomes em rodízio e articulações.
- Nave orientada para o voo, espaço/botão mantido, tiros com percurso, duas ondas e ataques.
- Zumbis com perseguição, antecipação de bote, salto e recuperação; fonte de Downtown Dubai.
- Pontes, vãos, checkpoints e três pontos de pesca com vara/linha/fisgada/devolução.
- Origem no Sol, antes da Terra.
- Pesquisa registrada em REFERENCIAS-RODADA2.md; evidência em VALIDACAO-RODADA2.md.
