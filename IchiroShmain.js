// Game Variables
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Game Objects
const paddle = {
    x: canvas.width / 2 - 50,
    y: canvas.height - 20,
    width: 100,
    height: 10,
    speed: 7,
    dx: 0
};

const ball = {
    x: canvas.width / 2,
    y: canvas.height - 40,
    radius: 8,
    speed: 4,
    dx: 4,
    dy: -4,
    isMoving: false
};

// Game State
let score = 0;
let lives = 3;
let gameRunning = false;
let bricks = [];
let brickRowCount = 4;
let brickColumnCount = 8;
let brickWidth = (canvas.width - 20) / brickColumnCount;
let brickHeight = 20;
let brickPadding = 5;
let brickOffsetTop = 30;
let brickOffsetLeft = 10;

// Input handling
const keys = {};

window.addEventListener('keydown', (e) => {
    keys[e.key] = true;
    if (e.key === ' ') {
        e.preventDefault();
        if (!gameRunning) {
            startGame();
        } else if (!ball.isMoving) {
            ball.isMoving = true;
        }
    }
});

window.addEventListener('keyup', (e) => {
    keys[e.key] = false;
});

// Initialize bricks
function initBricks() {
    bricks = [];
    for (let c = 0; c < brickColumnCount; c++) {
        bricks[c] = [];
        for (let r = 0; r < brickRowCount; r++) {
            bricks[c][r] = {
                x: c * (brickWidth + brickPadding) + brickOffsetLeft,
                y: r * (brickHeight + brickPadding) + brickOffsetTop,
                width: brickWidth,
                height: brickHeight,
                status: 1,
                color: getColorByRow(r)
            };
        }
    }
}

function getColorByRow(row) {
    const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A'];
    return colors[row % colors.length];
}

// Start Game
function startGame() {
    if (!gameRunning) {
        gameRunning = true;
        ball.isMoving = true;
        initBricks();
        document.getElementById('gameOverModal').style.display = 'none';
    }
}

// Draw functions
function drawPaddle() {
    ctx.fillStyle = '#667eea';
    ctx.fillRect(paddle.x, paddle.y, paddle.width, paddle.height);
    ctx.strokeStyle = '#764ba2';
    ctx.lineWidth = 2;
    ctx.strokeRect(paddle.x, paddle.y, paddle.width, paddle.height);
}

function drawBall() {
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
    ctx.fillStyle = '#FFD93D';
    ctx.fill();
    ctx.strokeStyle = '#FFA500';
    ctx.lineWidth = 2;
    ctx.stroke();
}

function drawBricks() {
    for (let c = 0; c < brickColumnCount; c++) {
        for (let r = 0; r < brickRowCount; r++) {
            if (bricks[c][r].status === 1) {
                const brick = bricks[c][r];
                ctx.fillStyle = brick.color;
                ctx.fillRect(brick.x, brick.y, brick.width, brick.height);
                ctx.strokeStyle = '#ffffff';
                ctx.lineWidth = 1;
                ctx.strokeRect(brick.x, brick.y, brick.width, brick.height);
            }
        }
    }
}

function drawScore() {
    document.getElementById('score').textContent = score;
    document.getElementById('lives').textContent = lives;
}

// Update functions
function updatePaddle() {
    if (keys['ArrowLeft'] || keys['a'] || keys['A']) {
        paddle.x = Math.max(0, paddle.x - paddle.speed);
    }
    if (keys['ArrowRight'] || keys['d'] || keys['D']) {
        paddle.x = Math.min(canvas.width - paddle.width, paddle.x + paddle.speed);
    }

    // Keep ball on paddle if not moving
    if (!ball.isMoving) {
        ball.x = paddle.x + paddle.width / 2;
        ball.y = paddle.y - ball.radius;
    }
}

function updateBall() {
    if (!ball.isMoving) return;

    ball.x += ball.dx;
    ball.y += ball.dy;

    // Wall collision (left and right)
    if (ball.x - ball.radius < 0 || ball.x + ball.radius > canvas.width) {
        ball.dx = -ball.dx;
        ball.x = ball.x - ball.radius < 0 ? ball.radius : canvas.width - ball.radius;
    }

    // Wall collision (top)
    if (ball.y - ball.radius < 0) {
        ball.dy = -ball.dy;
        ball.y = ball.radius;
    }

    // Paddle collision
    if (
        ball.y + ball.radius > paddle.y &&
        ball.x > paddle.x &&
        ball.x < paddle.x + paddle.width
    ) {
        ball.dy = -ball.dy;
        ball.y = paddle.y - ball.radius;

        // Add spin based on where the ball hits the paddle
        const hitPos = (ball.x - (paddle.x + paddle.width / 2)) / (paddle.width / 2);
        ball.dx += hitPos * 2;
    }

    // Brick collision
    collisionDetection();

    // Bottom collision (lose life)
    if (ball.y - ball.radius > canvas.height) {
        lives--;
        if (lives <= 0) {
            endGame();
        } else {
            ball.isMoving = false;
            ball.x = paddle.x + paddle.width / 2;
            ball.y = paddle.y - ball.radius;
        }
    }
}

function collisionDetection() {
    for (let c = 0; c < brickColumnCount; c++) {
        for (let r = 0; r < brickRowCount; r++) {
            const brick = bricks[c][r];
            if (brick.status === 1) {
                if (
                    ball.x > brick.x &&
                    ball.x < brick.x + brick.width &&
                    ball.y > brick.y &&
                    ball.y < brick.y + brick.height
                ) {
                    ball.dy = -ball.dy;
                    brick.status = 0;
                    score += 10;

                    // Check if all bricks are destroyed
                    if (checkWin()) {
                        endGame(true);
                    }
                }
            }
        }
    }
}

function checkWin() {
    for (let c = 0; c < brickColumnCount; c++) {
        for (let r = 0; r < brickRowCount; r++) {
            if (bricks[c][r].status === 1) {
                return false;
            }
        }
    }
    return true;
}

// Game over
function endGame(won = false) {
    gameRunning = false;
    ball.isMoving = false;
    const modal = document.getElementById('gameOverModal');
    const title = document.getElementById('gameOverTitle');
    const finalScore = document.getElementById('finalScore');

    if (won) {
        title.textContent = '🎉 You Won!';
    } else {
        title.textContent = '💔 Game Over!';
    }
    finalScore.textContent = score;
    modal.style.display = 'block';
}

// Main game loop
function gameLoop() {
    // Clear canvas
    ctx.fillStyle = '#222';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw grid pattern background
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 0.5;
    for (let i = 0; i <= canvas.width; i += 40) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i, canvas.height);
        ctx.stroke();
    }
    for (let i = 0; i <= canvas.height; i += 40) {
        ctx.beginPath();
        ctx.moveTo(0, i);
        ctx.lineTo(canvas.width, i);
        ctx.stroke();
    }

    if (gameRunning) {
        updatePaddle();
        updateBall();
    } else if (bricks.length === 0) {
        // Show start message
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 24px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Press SPACE to Start', canvas.width / 2, canvas.height / 2);
    }

    drawPaddle();
    drawBall();
    drawBricks();
    drawScore();

    requestAnimationFrame(gameLoop);
}

// Initialize and start
initBricks();
gameLoop();