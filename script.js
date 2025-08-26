// Constantes do Jogo
const MAZE_WIDTH = 15;
const MAZE_HEIGHT = 15;
const MAX_WALL_DENSITY = 0.55;
let playerPosition = { x: 1, y: 1 };
let goalPosition = { x: MAZE_WIDTH - 2, y: MAZE_HEIGHT - 2 };
let gameActive = false;
let maze = [];
let moveCount = 0;
let currentLevel = 1;

// Gera a matriz do labirinto (mapa)
function generateMaze() {
    let mazeIsValid = false;
    while (!mazeIsValid) {
        maze = [];
        const wallDensity = getWallDensityForLevel(currentLevel);

        for (let i = 0; i < MAZE_HEIGHT; i++) {
            maze[i] = [];
            for (let j = 0; j < MAZE_WIDTH; j++) {
                if (i === 0 || i === MAZE_HEIGHT - 1 || j === 0 || j === MAZE_WIDTH - 1 || Math.random() < wallDensity) {
                    maze[i][j] = 'wall';
                } else {
                    maze[i][j] = 'path';
                }
            }
        }
        maze[playerPosition.y][playerPosition.x] = 'path';
        maze[goalPosition.y][goalPosition.x] = 'path';
        mazeIsValid = validateMaze();
    }
}

// Retorna a densidade das paredes com base no nível atual
function getWallDensityForLevel(level) {
    const baseDensity = 0.35;
    const densityIncrease = 0.02;
    const newDensity = baseDensity + (level - 1) * densityIncrease;
    return Math.min(newDensity, MAX_WALL_DENSITY);
}

// Valida se o labirinto tem um caminho do início ao fim usando BFS
function validateMaze() {
    const queue = [playerPosition];
    const visited = new Set();
    visited.add(`${playerPosition.x},${playerPosition.y}`);

    while (queue.length > 0) {
        const current = queue.shift();
        if (current.x === goalPosition.x && current.y === goalPosition.y) {
            return true;
        }

        const neighbors = [
            { x: current.x, y: current.y - 1 },
            { x: current.x, y: current.y + 1 },
            { x: current.x - 1, y: current.y },
            { x: current.x + 1, y: current.y }
        ];

        for (const neighbor of neighbors) {
            const posKey = `${neighbor.x},${neighbor.y}`;
            if (neighbor.x >= 0 && neighbor.x < MAZE_WIDTH &&
                neighbor.y >= 0 && neighbor.y < MAZE_HEIGHT &&
                maze[neighbor.y][neighbor.x] === 'path' &&
                !visited.has(posKey)) {

                visited.add(posKey);
                queue.push(neighbor);
            }
        }
    }
    return false;
}

// Renderiza o labirinto no HTML
function renderMaze() {
    const mazeContainer = document.getElementById('maze-container');
    mazeContainer.innerHTML = '';
    mazeContainer.style.gridTemplateColumns = `repeat(${MAZE_WIDTH}, 30px)`;

    for (let i = 0; i < MAZE_HEIGHT; i++) {
        for (let j = 0; j < MAZE_WIDTH; j++) {
            const cell = document.createElement('div');
            cell.classList.add('cell', maze[i][j]);

            if (i === playerPosition.y && j === playerPosition.x) {
                cell.classList.add('player');
            } else if (i === goalPosition.y && j === goalPosition.x) {
                cell.classList.add('goal');
            }
            mazeContainer.appendChild(cell);
        }
    }
    updateCounters();
}

// Lida com a movimentação via teclado
function handleKeyDown(event) {
    if (!gameActive) return;

    let newPosition = { ...playerPosition };

    switch (event.key) {
        case 'ArrowUp':
            newPosition.y--;
            break;
        case 'ArrowDown':
            newPosition.y++;
            break;
        case 'ArrowLeft':
            newPosition.x--;
            break;
        case 'ArrowRight':
            newPosition.x++;
            break;
        default:
            return;
    }

    event.preventDefault();
    movePlayer(newPosition);
}

// Função reutilizável para mover o jogador
function movePlayer(newPosition) {
    if (newPosition.y >= 0 && newPosition.y < MAZE_HEIGHT &&
        newPosition.x >= 0 && newPosition.x < MAZE_WIDTH &&
        maze[newPosition.y][newPosition.x] !== 'wall') {

        if (maze[playerPosition.y][playerPosition.x] !== 'goal') {
            const prevCellIndex = playerPosition.y * MAZE_WIDTH + playerPosition.x;
            document.getElementById('maze-container').children[prevCellIndex].classList.add('visited');
        }

        playerPosition = newPosition;
        moveCount++;
        renderMaze();
        checkWin();
    }
}

// Movimento via botões clicáveis/touch
function move(direction) {
    let simulatedEvent = { key: direction, preventDefault: () => {} };
    handleKeyDown(simulatedEvent);
}

// Atualiza contadores de nível e movimento
function updateCounters() {
    document.getElementById('move-counter').innerText = moveCount;
    document.getElementById('level-counter').innerText = currentLevel;
}

// Verifica se o jogador chegou ao portal
function checkWin() {
    if (playerPosition.x === goalPosition.x && playerPosition.y === goalPosition.y) {
        gameActive = false;
        currentLevel++;
        showEndScreen(true);
    }
}

// Mostra a tela de vitória ou derrota
function showEndScreen(isWinner) {
    const endScreen = document.getElementById('end-screen');
    const endTitle = document.getElementById('end-title');
    const endMessage = document.getElementById('end-message');

    endScreen.classList.remove('hidden');
    document.getElementById('game-info').classList.add('hidden');
    document.getElementById('maze-container').classList.add('hidden');
    document.getElementById('touch-controls').classList.add('hidden');
    window.removeEventListener('keydown', handleKeyDown);

    if (isWinner) {
        endTitle.innerText = "TRANSFERÊNCIA COMPLETA!";
        endMessage.innerText = `Você atingiu o portal em ${moveCount} movimentos. Iniciando Nível ${currentLevel}...`;
    } else {
        endTitle.innerText = "ERRO FATAL";
        endMessage.innerText = "A integridade dos dados foi comprometida. Reinicie a simulação.";
    }
}

// Inicia o jogo
function startGame() {
    gameActive = true;
    moveCount = 0;
    playerPosition = { x: 1, y: 1 };
    goalPosition = { x: MAZE_WIDTH - 2, y: MAZE_HEIGHT - 2 };

    document.getElementById('start-screen').classList.add('hidden');
    document.getElementById('end-screen').classList.add('hidden');
    document.getElementById('game-info').classList.remove('hidden');
    document.getElementById('maze-container').classList.remove('hidden');
    document.getElementById('touch-controls').classList.remove('hidden');

    generateMaze();
    renderMaze();
    window.addEventListener('keydown', handleKeyDown);
}

// Reinicia o jogo
function restartGame() {
    startGame();
}

// Inicializa ao carregar
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('start-screen').classList.remove('hidden');
});
