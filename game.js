const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');
const nextCanvas = document.getElementById('next-canvas');
const nextCtx = nextCanvas.getContext('2d');

const scoreElem = document.getElementById('score');
const levelElem = document.getElementById('level');
const linesElem = document.getElementById('lines');
const hiScoreElem = document.getElementById('hi-score');

const overlay = document.getElementById('game-overlay');
const overlayTitle = document.getElementById('overlay-title');
const overlayMsg = document.getElementById('overlay-msg');

const COLS = 10;
const ROWS = 20;
const BLOCK_SIZE = 30;

ctx.scale(BLOCK_SIZE, BLOCK_SIZE);
nextCtx.scale(BLOCK_SIZE, BLOCK_SIZE);

let score = 0;
let level = 1;
let lines = 0;
let hiScore = localStorage.getItem('tetrisHiScore') || 0;
hiScoreElem.innerText = hiScore;

let gameOver = false;
let paused = false;
let gameStarted = false;

let board = [];
let reqAnimationId = null;
let lastTime = 0;
let dropCounter = 0;
let dropInterval = 1000;

// Tetromino Colors
const COLORS = [
    null,
    '#00FFFF', // I - Cyan
    '#0000FF', // J - Blue
    '#FFA500', // L - Orange
    '#FFFF00', // O - Yellow
    '#00FF00', // S - Green
    '#800080', // T - Purple
    '#FF0000'  // Z - Red
];

// Tetromino Forms
const PIECES = [
    [],
    [ // I (1)
        [0,0,0,0],
        [1,1,1,1],
        [0,0,0,0],
        [0,0,0,0],
    ],
    [ // J (2)
        [2,0,0],
        [2,2,2],
        [0,0,0],
    ],
    [ // L (3)
        [0,0,3],
        [3,3,3],
        [0,0,0],
    ],
    [ // O (4)
        [4,4],
        [4,4],
    ],
    [ // S (5)
        [0,5,5],
        [5,5,0],
        [0,0,0],
    ],
    [ // T (6)
        [0,6,0],
        [6,6,6],
        [0,0,0],
    ],
    [ // Z (7)
        [7,7,0],
        [0,7,7],
        [0,0,0],
    ]
];

const player = {
    pos: {x: 0, y: 0},
    matrix: null,
    nextMatrix: null
};

// --- LOGIC FUNCTIONS ---

function createMatrix(w, h) {
    const matrix = [];
    while (h--) {
        matrix.push(new Array(w).fill(0));
    }
    return matrix;
}

function resetBoard() {
    board = createMatrix(COLS, ROWS);
}

function drawMatrix(matrix, offset, context=ctx) {
    matrix.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value !== 0) {
                context.fillStyle = COLORS[value];
                context.fillRect(x + offset.x, y + offset.y, 1, 1);
                
                // Bevel effect (3D feel) for Retro vibe
                context.strokeStyle = 'rgba(0,0,0,0.5)';
                context.lineWidth = 0.05;
                context.strokeRect(x + offset.x, y + offset.y, 1, 1);
                
                // Highlight top-left
                context.fillStyle = 'rgba(255,255,255,0.3)';
                context.fillRect(x + offset.x, y + offset.y, 1, 0.1);
                context.fillRect(x + offset.x, y + offset.y, 0.1, 1);
                
                // Shadow bottom-right
                context.fillStyle = 'rgba(0,0,0,0.3)';
                context.fillRect(x + offset.x, y + offset.y + 0.9, 1, 0.1);
                context.fillRect(x + offset.x + 0.9, y + offset.y, 0.1, 1);
            }
        });
    });
}

function draw() {
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    drawMatrix(board, {x: 0, y: 0});
    if (player.matrix) {
        drawMatrix(player.matrix, player.pos);
    }
}

function drawNext() {
    nextCtx.fillStyle = '#000';
    nextCtx.fillRect(0, 0, nextCanvas.width, nextCanvas.height);
    if(player.nextMatrix) {
        // center the piece in 4x4 grid
        const offset = {
            x: 2 - player.nextMatrix[0].length / 2,
            y: 2 - player.nextMatrix.length / 2
        };
        drawMatrix(player.nextMatrix, offset, nextCtx);
    }
}

function merge(board, player) {
    player.matrix.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value !== 0) {
                board[y + player.pos.y][x + player.pos.x] = value;
            }
        });
    });
}

function collide(board, player) {
    const [m, o] = [player.matrix, player.pos];
    for (let y = 0; y < m.length; ++y) {
        for (let x = 0; x < m[y].length; ++x) {
            if (m[y][x] !== 0 &&
               (board[y + o.y] && board[y + o.y][x + o.x]) !== 0) {
                return true;
            }
        }
    }
    return false;
}

function playerReset() {
    if(!player.nextMatrix) {
        player.nextMatrix = PIECES[Math.floor(Math.random() * 7) + 1];
    }
    player.matrix = player.nextMatrix;
    player.nextMatrix = PIECES[Math.floor(Math.random() * 7) + 1];
    player.pos.y = 0;
    player.pos.x = (Math.floor(COLS / 2)) - (Math.floor(player.matrix[0].length / 2));
    
    if (collide(board, player)) {
        // Game Over
        gameOver = true;
        AudioSys.gameover();
        showOverlay("GAME OVER", "Aperte ESPAÇO<br><br>para reiniciar");
        cancelAnimationFrame(reqAnimationId);
        
        if(score > hiScore) {
            hiScore = score;
            localStorage.setItem('tetrisHiScore', hiScore);
            hiScoreElem.innerText = hiScore;
        }
    }
    drawNext();
}

function updateScore(linesCleared) {
    if (linesCleared > 0) {
        const lineScores = [0, 100, 300, 500, 800];
        score += lineScores[linesCleared] * level;
        lines += linesCleared;
        
        // Level logic: every 10 lines
        level = Math.floor(lines / 10) + 1;
        
        // Speed up: drops counter limit decreases
        dropInterval = Math.max(100, 1000 - (level - 1) * 100);
        
        scoreElem.innerText = score;
        levelElem.innerText = level;
        linesElem.innerText = lines;
        
        AudioSys.clear();
    }
}

function boardSweep() {
    let linesCleared = 0;
    outer: for (let y = ROWS -1; y >= 0; --y) {
        for (let x = 0; x < COLS; ++x) {
            if (board[y][x] === 0) {
                continue outer;
            }
        }

        const row = board.splice(y, 1)[0].fill(0);
        board.unshift(row);
        ++y;
        linesCleared++;
    }
    updateScore(linesCleared);
}

function playerDrop() {
    player.pos.y++;
    if (collide(board, player)) {
        player.pos.y--;
        merge(board, player);
        playerReset();
        boardSweep();
        if(!gameOver) AudioSys.lock();
    }
    dropCounter = 0;
}

function playerHardDrop() {
    while (!collide(board, player)) {
        player.pos.y++;
    }
    player.pos.y--; // Lock at last valid pos
    merge(board, player);
    playerReset();
    boardSweep();
    if(!gameOver) {
        AudioSys.drop();
        AudioSys.lock();
    }
    dropCounter = 0;
}

function playerMove(dir) {
    player.pos.x += dir;
    if (collide(board, player)) {
        player.pos.x -= dir;
    } else {
        AudioSys.move();
    }
}

function rotate(matrix, dir) {
    // Transpose matrix
    for (let y = 0; y < matrix.length; ++y) {
        for (let x = 0; x < y; ++x) {
            [matrix[x][y], matrix[y][x]] = [matrix[y][x], matrix[x][y]];
        }
    }
    // Reverse rows
    if (dir > 0) {
        matrix.forEach(row => row.reverse());
    } else {
        matrix.reverse();
    }
}

function playerRotate(dir) {
    const pos = player.pos.x;
    let offset = 1;
    rotate(player.matrix, dir);
    while (collide(board, player)) {
        player.pos.x += offset;
        offset = -(offset + (offset > 0 ? 1 : -1));
        if (offset > player.matrix[0].length) {
            // failed to rotate, flip back
            rotate(player.matrix, -dir);
            player.pos.x = pos;
            return;
        }
    }
    AudioSys.rotate();
}

function update(time = 0) {
    if (gameOver || paused) return;

    const deltaTime = time - lastTime;
    lastTime = time;

    dropCounter += deltaTime;
    if (dropCounter > dropInterval) {
        playerDrop();
    }

    draw();
    reqAnimationId = requestAnimationFrame(update);
}

function resetGame() {
    resetBoard();
    score = 0;
    level = 1;
    lines = 0;
    dropInterval = 1000;
    gameOver = false;
    paused = false;
    
    scoreElem.innerText = score;
    levelElem.innerText = level;
    linesElem.innerText = lines;
    
    player.nextMatrix = null;
    playerReset();
    
    hideOverlay();
    lastTime = performance.now();
    update();
}

function showOverlay(title, msg) {
    overlayTitle.innerHTML = title;
    overlayMsg.innerHTML = msg;
    overlay.classList.remove('hidden');
}

function hideOverlay() {
    overlay.classList.add('hidden');
}

// --- INPUT HANDLING ---
document.addEventListener('keydown', event => {
    // Prevent default scrolling for arrows and space
    if(["ArrowUp","ArrowDown","ArrowLeft","ArrowRight"," "].includes(event.key)) {
        event.preventDefault();
    }

    if (!gameStarted) {
        if (event.key === ' ') {
            AudioSys.init(); // Initialize audio context on strict interaction
            gameStarted = true;
            resetGame();
        }
        return;
    }

    if (gameOver) {
        if (event.key === ' ') {
            resetGame();
        }
        return;
    }

    if (event.key === 'p' || event.key === 'P') {
        paused = !paused;
        if (paused) {
            showOverlay("PAUSADO", "Aperte P<br><br>para voltar");
        } else {
            hideOverlay();
            lastTime = performance.now();
            update();
        }
        return;
    }

    if (paused) return;

    switch(event.key) {
        case 'ArrowLeft':
            playerMove(-1);
            break;
        case 'ArrowRight':
            playerMove(1);
            break;
        case 'ArrowDown':
            playerDrop();
            AudioSys.move();
            break;
        case 'ArrowUp':
            playerRotate(1);
            break;
        case ' ':
            playerHardDrop();
            break;
    }
});

// Initial drawing state
resetBoard();
draw();
