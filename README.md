# Retro Tetris (HTML5 + JS)

Um clone retrô do clássico jogo Tetris, totalmente escrito em HTML5, CSS3 e JavaScript Vanilla. 
Com gráficos estilo pixel-art e trilha sonora/feitos criados via AudioContext (Web Audio API).

## 🚀 Como Executar

Não há necessidade de compilar código, instalar pacotes ou rodar servidores. 

1. Baixe os arquivos do projeto.
2. Dê um clique duplo ou abra o arquivo `index.html` em qualquer navegador moderno (Chrome, Firefox, Safari, Edge).
3. Seja feliz!

## 🎮 Controles

- **← / →** : Mover a peça para os lados.
- **↑** : Rotacionar a peça.
- **↓** : Acelerar queda (Soft Drop).
- **Espaço** : Queda instantânea (Hard Drop).
- **P** : Pausar ou despausar o jogo.

## ✨ Features Implementadas

- **Visual Retrô**: Fontes de arcades reais, tema escuro e efeitos de ressalto (bevel) em cada bloquinho para passar o "feeling" tridimensional vintage.
- **Sons 8-bits**: Sistema de áudio sintetizado em tempo real na aba (dispensa uso de mp3).
- **High-Score**: O recorde da máquina fica armazenado no cache local do seu navegador (`localStorage`).
- **Sistema de Níveis**: A cada `10 linhas` limpas, a velocidade do jogo e nível sobem consideravelmente.
- **Preview de Peças**: Uma visualização miniatura mostrando qual bloco será solto em sequência.

## 🛠️ Tecnologias Utilizadas
- **HTML5 Canvas** para renderização.
- **Manipulação Vanilla JS**, arquitetado modularmente (áudio, engine de colisão).
- **CSS Grid/Flexbox** com tipografia carregada via Google Fonts.