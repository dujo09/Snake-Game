const CELL_SIZE = 25;
const NUMBER_OF_ROWS = 25;
const NUMBER_OF_COLUMNS = 25;
const SNAKE_START_POSITION = { x: 5 * CELL_SIZE, y: 5 * CELL_SIZE };
const SNAKE_START_DIRECTION = { x: 1, y: 0 };
const FOOD_COUNT = 3;

const snakeHead = new Image();
const snakeTail = new Image();
const snakeBodyColor = "rgb(165, 190, 0)";
const foodColor = "rgb(243, 232, 130)";

var gameBoard;
var drawingContext; 

var snakeSegmentsPositions = [];
var currentSnakeDirection;
var newSnakeDirection;

var foodPositions = [];
var score = 0;

var gameLoop;
var gameOverLoop;

window.onload = function() {
    gameBoard = document.getElementById("game-board");
    gameBoard.height = NUMBER_OF_ROWS * CELL_SIZE;
    gameBoard.width = NUMBER_OF_COLUMNS * CELL_SIZE;
    drawingContext = gameBoard.getContext("2d");

    document.getElementById("start-button").addEventListener("click", startGame);
    document.getElementById("game-over-button").addEventListener("click", startGame);
    document.addEventListener("keydown", changeSnakeDirection);

    document.getElementById("main-menu").style.display = "flex";
    document.getElementById("game").style.display = "none";
    document.getElementById("game-over-menu").style.display = "none";

    snakeHead.src = "./assets/snakeHead.png";
    snakeTail.src = "./assets/snakeTail.png";

    setHighscore();
}

function startGame() {
    document.getElementById("game").style.display = "flex";
    document.getElementById("game-over-menu").style.display = "none";
    document.getElementById("main-menu").style.display = "none";

    snakeSegmentsPositions = [
        { ...SNAKE_START_POSITION }, // head
        {                            // tail
            x: SNAKE_START_POSITION.x - SNAKE_START_DIRECTION.x * CELL_SIZE, 
            y: SNAKE_START_POSITION.y - SNAKE_START_DIRECTION.y * CELL_SIZE 
        }
    ];
    currentSnakeDirection = { ...SNAKE_START_DIRECTION };
    newSnakeDirection = { ...currentSnakeDirection };

    foodPositions.length = 0;
    for(let i = 0; i < FOOD_COUNT; ++i) {
        foodPositions.push({ x: 0, y: 0 });
        placeFoodRandom(i);
    }
    
    score = 0;
    document.querySelector("#score").innerHTML = 0;

    const TIME_STEP_MILISECONDS = 100;
    gameLoop = setInterval(updateGame, TIME_STEP_MILISECONDS);
}

function updateGame() {
    if(isGameOver()) {
        setHighscore();
        clearInterval(gameLoop);

        const TIME_STEP_MILISECONDS = 45;
        gameOverLoop = setInterval(renderGameOver, TIME_STEP_MILISECONDS);       
        return;
    }

    eatFood();
    moveSnake();
    
    drawingContext.fillStyle = "rgb(73, 132, 103)";
    drawingContext.fillRect(0, 0, gameBoard.width, gameBoard.height);
    renderFood();
    renderSnake(); 
}

function moveSnake() {
    for(let i = snakeSegmentsPositions.length - 1; i >= 1; --i) {
        snakeSegmentsPositions[i] = { ...snakeSegmentsPositions[i-1] };
    }

    currentSnakeDirection = { ...newSnakeDirection };
    
    snakeSegmentsPositions[0].x += currentSnakeDirection.x * CELL_SIZE;
    snakeSegmentsPositions[0].y += currentSnakeDirection.y * CELL_SIZE;

    snakeSegmentsPositions[0].x %= (CELL_SIZE * NUMBER_OF_COLUMNS);
    snakeSegmentsPositions[0].y %= (CELL_SIZE * NUMBER_OF_ROWS);

    if(snakeSegmentsPositions[0].x < 0) {
        snakeSegmentsPositions[0].x += (CELL_SIZE * NUMBER_OF_COLUMNS);
    }
    if(snakeSegmentsPositions[0].y < 0) {
        snakeSegmentsPositions[0].y += (CELL_SIZE * NUMBER_OF_ROWS);
    }
}

function changeSnakeDirection(e) {
    if((e.code === "ArrowUp" || e.code === "KeyW") && currentSnakeDirection.y == 0) {
        newSnakeDirection.x = 0;
        newSnakeDirection.y = -1;
    } else if((e.code === "ArrowDown" || e.code === "KeyS") && currentSnakeDirection.y == 0) {
        newSnakeDirection.x = 0;
        newSnakeDirection.y = 1;
    } else if((e.code === "ArrowLeft" || e.code === "KeyA") && currentSnakeDirection.x == 0) {
        newSnakeDirection.x = -1;
        newSnakeDirection.y = 0;
    } else if((e.code === "ArrowRight" || e.code === "KeyD") && currentSnakeDirection.x == 0) {
        newSnakeDirection.x = 1;
        newSnakeDirection.y = 0;
    }
}

function isGameOver() {
    for(let i = 1; i < snakeSegmentsPositions.length; ++i) {
        if(arePositionsEqual(snakeSegmentsPositions[0], snakeSegmentsPositions[i])) {
            return true;
        }
    }
    return false;
}

function eatFood() {
    for(let i = 0; i < foodPositions.length; ++i) {
        if(arePositionsEqual(snakeSegmentsPositions[0], foodPositions[i])) {
            let newSnakeSegment = { x: foodPositions[i].x, y: foodPositions[i].y };
            snakeSegmentsPositions.push({...newSnakeSegment});

            ++score;
            document.querySelector("#score").innerHTML = score;

            placeFoodRandom(i);
        }
    }
}

function renderSnake() {    
    for(let i = 1; i < snakeSegmentsPositions.length - 1; ++i) {
        drawingContext.fillStyle = snakeBodyColor;
        drawingContext.fillRect(snakeSegmentsPositions[i].x, snakeSegmentsPositions[i].y, CELL_SIZE, CELL_SIZE);
    }

    const secondToLastSegmentPosition = snakeSegmentsPositions[snakeSegmentsPositions.length - 2];
    const tailSegmentPosition = snakeSegmentsPositions[snakeSegmentsPositions.length - 1];
    const snakeTailDirection = { 
        x: secondToLastSegmentPosition.x - tailSegmentPosition.x, 
        y: secondToLastSegmentPosition.y - tailSegmentPosition.y
    }
    snakeTailDirection.x /= CELL_SIZE;
    snakeTailDirection.y /= CELL_SIZE;
    
    if(snakeTailDirection.x > 1) {
        snakeTailDirection.x = -1;
    } else if(snakeTailDirection.x < -1) {
        snakeTailDirection.x = 1;
    }

    if(snakeTailDirection.y > 1) {
        snakeTailDirection.y = -1;
    } else if(snakeTailDirection.y < -1) {
        snakeTailDirection.y = 1;
    }

    const tailAngle = Math.atan2(snakeTailDirection.y, snakeTailDirection.x);
    const snakeTailCenter = { x: tailSegmentPosition.x + CELL_SIZE / 2, y: tailSegmentPosition.y + CELL_SIZE / 2 };
    
    drawingContext.translate(snakeTailCenter.x, snakeTailCenter.y);
    drawingContext.rotate(tailAngle);

    drawingContext.drawImage(snakeTail, -CELL_SIZE / 2, -CELL_SIZE / 2, CELL_SIZE, CELL_SIZE);

    drawingContext.rotate(-tailAngle);
    drawingContext.translate(-snakeTailCenter.x, -snakeTailCenter.y);

    const headAngle = Math.atan2(currentSnakeDirection.y, currentSnakeDirection.x);
    const snakeHeadCenter = { x: snakeSegmentsPositions[0].x + CELL_SIZE / 2, y: snakeSegmentsPositions[0].y + CELL_SIZE / 2 };

    drawingContext.translate(snakeHeadCenter.x, snakeHeadCenter.y);
    drawingContext.rotate(headAngle);

    drawingContext.drawImage(snakeHead, -CELL_SIZE / 2, -CELL_SIZE / 2, CELL_SIZE, CELL_SIZE);

    drawingContext.rotate(-headAngle);
    drawingContext.translate(-snakeHeadCenter.x, -snakeHeadCenter.y);
}

function renderFood() {
   for(let i = 0; i < foodPositions.length; ++i) {    
        drawingContext.fillStyle = foodColor;
        drawingContext.fillRect(foodPositions[i].x, foodPositions[i].y, CELL_SIZE, CELL_SIZE);
    }
}

function renderGameOver() {
    if(snakeSegmentsPositions.length <= 0) {
        document.getElementById("game-over-menu").style.display = "flex";
        clearInterval(gameOverLoop);
        return;
    }
    
    let snakeSegmentPosition = snakeSegmentsPositions.shift();

    drawingContext.fillStyle = "rgb(45, 49, 66)";
    drawingContext.fillRect(snakeSegmentPosition.x, snakeSegmentPosition.y, CELL_SIZE, CELL_SIZE);
}   

function placeFoodRandom(foodIndex) {
    foodPositions[foodIndex].x = Math.floor(Math.random() * NUMBER_OF_COLUMNS) * CELL_SIZE;
    foodPositions[foodIndex].y = Math.floor(Math.random() * NUMBER_OF_ROWS) * CELL_SIZE;

    for(let i = 0; i < snakeSegmentsPositions.length; ++i) {
        if(arePositionsEqual(foodPositions[foodIndex], snakeSegmentsPositions[i])) {
            placeFoodRandom(foodIndex);
        }
    }

    for(let i = 0; i < foodPositions.length; ++i) {
        if(foodIndex == i) {
            continue;
        }
        
        if(arePositionsEqual(foodPositions[foodIndex], foodPositions[i])) {
            placeFoodRandom(foodIndex);
        }
    }
}

function arePositionsEqual(positionA, positionB) {
    return positionA.x == positionB.x && positionA.y == positionB.y;
}

function setHighscore() {
    const highscoreCookieIndex = document.cookie.indexOf("highscore=");
    let highscore = document.cookie.substring(highscoreCookieIndex + 10, document.cookie.length);
    highscore = parseInt(highscore);
    
    if(isNaN(highscore) || score > highscore) {
        highscore = score;
    }

    document.cookie = "highscore=" + highscore;
    document.querySelector("#highscore").innerHTML = highscore;
}
