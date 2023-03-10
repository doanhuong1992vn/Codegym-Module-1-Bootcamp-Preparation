let canvas = document.querySelector("canvas");
let context = canvas.getContext("2d");
canvas.width = window.innerWidth / 3;
canvas.height = window.innerHeight * 99.2 / 100;
const CW = canvas.width;
const CH = canvas.height;
let roadBg = document.querySelector("#background");
roadBg.width = CW;
roadBg.height = CH;
let startImg = document.querySelector("#startImg");
startImg.width = CW / 4;
startImg.height = CW / 4;
let logo = document.querySelector("#logo");
logo.width = CW;
logo.height = CH / 10;
let speed = CH * 0.005;
let highScore = [1408];
function Road() {
    this.road = new Image();
    this.road.src = "./image/road.png";
    this.draw = () => context.drawImage(this.road, 0, 0, CW, CH)
}

function RoadLane(y, speed) {
    this.width = CW * 0.02;
    this.height = CH / 13;
    this.x1 = CW * 0.05 + CW * 0.9 / 3 - this.width / 2;
    this.x2 = CW * 0.05 + CW * 0.9 / 3 * 2 - this.width / 2;
    this.y = y;
    this.speed = speed;
    this.setSpeed = speed => this.speed = speed;
    this.move = function () {
        if (this.y >= CH) {
            this.y = -this.height;
        } else {
            this.y += this.speed;
        }
    }
    this.draw = function (speed) {
        this.move();
        this.setSpeed(speed);
        context.fillStyle = "#ffffff";
        context.fillRect(this.x1, this.y, this.width, this.height);
        context.fillRect(this.x2, this.y, this.width, this.height);
    }
}

function Car() {
    this.image = new Image();
    this.image.src = "./image/car.png";
    this.width = CW * 0.11;
    this.height = CH * 0.15;
    this.x = (CW - this.width) / 2;
    this.y = CH - this.height;
    this.speed = 1.5 * speed;
    this.isMovingLeft = false;
    this.isMovingRight = false;
    this.isMovingUp = false;
    this.isMovingDown = false;
    this.setSpeed = speed => {
        if (this.speed < this.width) this.speed = 1.5 * speed
    };
    this.draw = () => context.drawImage(this.image, this.x, this.y, this.width, this.height);
    this.onkeyup = function (event) {
        switch (event.which) {
            case 37:
                this.isMovingLeft = false;
                break;
            case 38:
                this.isMovingUp = false;
                break;
            case 39:
                this.isMovingRight = false;
                break;
            case 40:
                this.isMovingDown = false;
                break;
        }
    }
    this.onkeydown = function (event) {
        switch (event.which) {
            case 37:
                this.isMovingLeft = true;
                break;
            case 38:
                this.isMovingUp = true;
                break;
            case 39:
                this.isMovingRight = true;
                break;
            case 40:
                this.isMovingDown = true;
                break;
        }
    }
    this.move = function () {
        switch (true){
            case (this.isMovingLeft === true):
                this.x -= this.speed;
                break;
            case (this.isMovingRight === true):
                this.x += this.speed;
                break;
            case (this.isMovingUp === true):
                this.y -= this.speed;
                break;
            case (this.isMovingDown === true):
                this.y += this.speed;
                break;
        }
    }
}

function GameBoard() {
    this.car = new Car();
    this.road = new Road();
    this.audioEngine = new Audio("audio/engine.mp3");
    this.audioRelax = new Audio("audio/relax.mp3");
    this.audioBonus = new Audio("audio/bonus.mp3");
    this.audioGameOver = new Audio("audio/game-over.mp3");
    this.score = 0;
    this.getScore = function () {
        this.audioEngine.play();
        this.audioEngine.loop = true;
        this.audioRelax.play();
        this.audioRelax.loop = true;
        this.score += 0.5;
        context.font = `${CW * 0.08}px Georgia`;
        context.fillStyle = "red";
        context.textAlign = "left";
        context.fillText(`${Math.floor(this.score)}`, CW * 0.06, CH * 0.05);
    }
    this.bonus = function () {
        this.audioBonus.play();
        this.score += 100;
    }
    this.getGameOver = function () {
        clearLoopRender();
        this.audioEngine.src = "";
        this.audioRelax.src = "";
        this.audioGameOver.play();
        highScore.push(Math.floor(this.score + 0.5));
        highScore.sort((a, b) => {return b - a});
        document.querySelector("#highScore").innerHTML = `High Score<br>${highScore[0]}`;
        context.font = "75px Georgia";
        context.textAlign = "center";
        context.fillStyle = "red";
        context.fillText(`Game Over`, CW / 2, CH / 2 - 40);
        context.font = "35px Georgia";
        context.fillText(`Your Scores: ${Math.floor(this.score + 0.5)}`, CW / 2, CH / 2 + 40);
        startImg.style.display = "block";
    }
    this.checkCollision = function () {
        if (this.car.x + this.car.width <= 0 || this.car.x >= CW
            || this.car.y + this.car.height <= 0 || this.car.y >= CH) {
            this.getGameOver();
        }
    }
}

function Stone() {
    this.image = new Image()
    this.image.src = "./image/stone.png";
    this.collisionAudio = new Audio("audio/collision.mp3");
    this.width = CW * 0.15;
    this.height = CH * 0.062;
    this.x = Math.floor(Math.random() * (CW - this.width));
    this.y = -this.height;
    this.speed = speed;
    this.setSpeed = speed => this.speed = speed;
    this.move = function () {
        if (this.y >= CH) {
            this.x = Math.floor(Math.random() * (CW - this.width));
            this.y = -this.height;
        } else {
            this.y += this.speed;
        }
    }
    this.checkCollision = function (car, gameBoard) {
        if ((this.x + this.width * 0.25) + this.width * 0.5 >= (car.x + car.width * 0.1)
            && (car.x + car.width * 0.1) + car.width * 0.8 >= (this.x + this.width * 0.25)
            && (this.y + this.height * 0.1) + this.height * 0.8 >= (car.y + car.height * 0.1)
            && (car.y + car.height * 0.1) + car.height * 0.8 >= (this.y + this.height * 0.1)) {
            this.collisionAudio.play();
            car.image.src = "./image/accident1.png";
            gameBoard.getGameOver();
        }
    }
    this.draw = function (car, gameBoard, speed) {
        this.move();
        this.setSpeed(speed);
        context.drawImage(this.image, this.x, this.y, this.width, this.height);
        this.checkCollision(car, gameBoard);
    }
}

function Coin() {
    this.image = new Image();
    this.width = CH * 0.062;
    this.height = CH * 0.062;
    this.x = Math.floor(Math.random() * (CW - this.width));
    this.y = -this.height;
    this.x2 = Math.floor(Math.random() * (CW - this.width));
    this.y2 = this.y - CH;
    this.speed = speed;
    this.image.src = "./image/coin.png";
    this.setSpeed = speed => this.speed = speed;
    this.hide = function () {
        this.x = this.x2;
        this.y = this.y2;
    }
    this.move = function () {
        if (this.y >= CH) {
            this.x = Math.floor(Math.random() * (CW - this.width));
            this.y = -this.height;
        } else {
            this.y += this.speed;
        }
    }
    this.checkCollision = function (car, gameBoard) {
        if (this.x + this.width >= car.x && car.x + car.width >= this.x
            && this.y + this.height >= car.y && car.y + car.height >= this.y) {
            gameBoard.bonus();
            this.hide();
        }
    }
    this.draw = function (car, gameBoard, speed) {
        this.move();
        this.setSpeed(speed);
        context.drawImage(this.image, this.x, this.y, this.width, this.height);
        this.checkCollision(car, gameBoard);
    }
}

let interval, gameBoard;
let stone = [];
let coin = [];
let roadLane = [];
let timeout = [];

function start() {
    gameBoard = new GameBoard();
    stone.push(new Stone());
    roadLane.push(
        new RoadLane(0, speed),
        new RoadLane(2 * CH / 13, speed),
        new RoadLane(4 * CH / 13, speed),
        new RoadLane(6 * CH / 13, speed),
        new RoadLane(8 * CH / 13, speed),
        new RoadLane(10 * CH / 13, speed),
        new RoadLane(12 * CH / 13, speed),
    );
    timeout.push(
        setTimeout(() => coin.push(new Coin()), 2000),
        setTimeout(() => coin.push(new Coin()), 6000),
        setTimeout(() => coin.push(new Coin()), 10000),
        setTimeout(() => coin.push(new Coin()), 14000),
        setTimeout(() => coin.push(new Coin()), 18000),
        setTimeout(() => stone.push(new Stone()), 4000),
        setTimeout(() => stone.push(new Stone()), 8000),
        setTimeout(() => stone.push(new Stone()), 12000),
        setTimeout(() => stone.push(new Stone()), 16000),
    )
    interval = setInterval(function () {
        speed += CH * 0.005 * 0.001;
        gameBoard.road.draw();
        roadLane.forEach(lane => lane.draw(speed))
        coin.forEach(coin => coin.draw(gameBoard.car, gameBoard, speed))
        stone.forEach(stone => stone.draw(gameBoard.car, gameBoard, speed))
        gameBoard.car.draw();
        gameBoard.car.move();
        gameBoard.car.setSpeed(speed);
        gameBoard.checkCollision();
        gameBoard.getScore();
    }, 50);
}

function clearLoopRender() {
    clearInterval(interval);
    timeout.forEach(timeout => clearTimeout(timeout));
}

function reStart() {
    clearLoopRender();
    setTimeout(function () {
        roadBg.style.display = "none";
        startImg.style.display = "none";
    }, 50);
    stone = [];
    coin = [];
    roadLane = [];
    timeout = [];
    speed = CH * 0.005;
    start();
}