# Rodada 3 — celular, som e desafio

## Objetivo
Preservar as fases 1–3 e refinar a fase 4 para uso principal no Chrome do iPhone,
com orientação clara, mais espaço para jogar e risco real de derrota.

## Critérios observáveis
- Primeira abertura em retrato mostra orientação para virar o celular, com opção de continuar.
- Girar durante uma partida pausa; ao voltar, retomada depende de toque e não consome tempo/vidas.
- HUD horizontal compacto, uma faixa no topo; objetivo completo acessível por toque.
- Ativação explícita da música, reprodução nativa após gesto, indicação quando bloqueada e retomada por toque.
- Nave tem três ondas progressivas; ficar parado e manter tiro deve perder, enquanto desviar deve permitir vencer.
- Três corações, proteção curta após dano e ausência de escudo automático que impeça perder.
- Derrota visível, animação de falha e nova tentativa apenas no trecho atual.
- Mais variedade de perigos e animações em corrida/patins; limites e avisos proporcionais à idade.
- Regressão, contrafactual, jornada vencedora e perdedora, pausa, áudio e inspeção visual em mobile.

## Áudio no iPhone
O relato foi Chrome no iPhone. O WebKit documenta diferenças entre Web Audio ambiente
e reprodução de mídia com o aparelho silencioso:
https://bugs.webkit.org/show_bug.cgi?id=237322 e https://bugs.webkit.org/show_bug.cgi?id=252746.
Isso é uma hipótese técnica pertinente, não diagnóstico confirmado do aparelho do usuário.
Usar trilha original local em reprodução de mídia, sessão playback quando disponível,
gesto explícito e recuperação de interrupções. Não confundir AudioContext rodando ou RMS
positivo com prova de áudio audível no aparelho físico.

## Limites
Sem API paga, microfone, dados privados ou serviços externos. Teste automatizado de
Chrome e WebKit não substitui nova conferência no iPhone do usuário. Esta rodada é
preparada localmente para validação antes de uma nova publicação.
