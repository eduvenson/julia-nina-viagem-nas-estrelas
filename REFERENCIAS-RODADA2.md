# Referências aplicadas à segunda rodada

Pesquisa em 23/10/2026, a pedido do usuário. Fontes primárias consultadas por documentação,
não por teste prático dos produtos citados.

## Criação de jogos com IA

[Tutorial oficial da Rosebud](https://lab.rosebud.ai/blog/rosebud-ai-tutorial), publicado
em 02/02/2026: separar personagens, física, comportamento dos inimigos e pontuação em
iterações pequenas e verificáveis. Aplicação: trocar o alvo estático por patrulha, aviso,
ataque e recuperação, cada comportamento com evidência própria. Evitar tratar uma cena
visualmente pronta como prova de que o jogo está divertido. Não foi usado o serviço Rosebud.

## Personagens e animação

[Roblox Creator Hub — Characters](https://create.roblox.com/docs/characters): personagens
com estados próprios, hierarquia de articulações e movimentos como caminhada, salto e
interação. Aplicação: ritmos distintos para Nina/Júlia, inclinação, cabeça, cabelo e ações
da companheira; cães com patas, orelhas, cabeça e cauda animáveis e perfis diferentes.
Os modelos e controladores continuam originais deste projeto; nenhuma integração com Roblox.

[Roblox — Inverse Kinematics](https://create.roblox.com/docs/animation/inverse-kinematics):
as articulações precisam de limites e a pose deve ser validada em movimento. Referência
de critério para impedir articulações absurdas; não é uma alegação de implementação de IK.

## Celular e desempenho

[PlayCanvas — General Guidelines](https://developer.playcanvas.com/user-manual/optimization/guidelines/)
e [Optimization](https://developer.playcanvas.com/user-manual/optimization/): reduzir chamadas
de desenho, reutilizar objetos, limitar luzes/resolução e comparar cenários repetíveis.
Aplicação: geometrias e materiais compartilhados, limites de projéteis/efeitos, uma luz com
sombras e cenário repetível na inspeção. Contagem de chamadas é uma evidência estrutural;
viewport emulado não substitui benchmark de GPU/bateria em aparelho real.

## Critério da rodada

O ganho esperado é observável: escolher a líder; ver a amiga atrás ajudando; identificar
patrulha e aviso antes de sofrer um ataque; disparar com espaço ou manter o botão de toque;
desviar/pular para se proteger; explorar pontes e novos pontos de pesca; perceber cães
com atividades e nomes intermitentes. A confirmação de diversão fica com a rodada de jogo
da Nina e da Júlia, não com os testes automatizados.
