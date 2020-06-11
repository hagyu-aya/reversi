'use strict';

window.onload = () => {
    createBoardView();
}

let board;
let playerTurn;
let computerColor;
const OOB = -1;
const NONE = 0;
const WHITE = 1;
const BLACK = 2;

// html上に盤を作る。1回だけ実行される。
function createBoardView() {
    const boardView = document.getElementById('board');
    for(let y = 1; y <= 8; ++y){
        const row = document.createElement('div');
        row.setAttribute('class', 'row');
        boardView.appendChild(row);
        for(let x = 1; x <= 8; ++x){
            const square = document.createElement('div');
            square.setAttribute('class', 'square');
            row.appendChild(square);
            const disc = document.createElement('div');
            disc.setAttribute('class', 'disc none');
            square.onclick = () => {
                tryPutDisc(x, y);
            }
            square.appendChild(disc);
        }
    }
}

function displayMessage(message){
    document.getElementById('message').textContent = message;
}

function resultMessage() {
    const result = countDisc();
    const whiteScore = result[0];
    const blackScore = result[1];
    if(blackScore > whiteScore) {
        return `${blackScore}対${whiteScore}で黒の勝ち！`;
    }
    else if(blackScore === whiteScore) {
        return `${blackScore}対${whiteScore}で引き分け`;
    }
    else {
        return `${blackScore}対${whiteScore}で白の勝ち！`;
    }
}

function displayResult(){
    displayMessage(resultMessage());
}

function reflectDiscsView(){
    for(let y = 1; y <= 8; ++y) {
        for(let x = 1; x <= 8; ++x) {
            setDiscView(x, y, discColorString(board[y][x]));
        }
    }
}

function displayPlacableSquares(playerNum) {
    for(let y = 1; y <= 8; ++y) {
        for(let x = 1; x <= 8; ++x) {
            if(isPlaceable(x, y, playerNum)){
                setDiscView(x, y, discColorString(playerNum) + ' possible');
            }
        }
    }
}

// html上で(x, y) (1-indexed)をdiscColor: strに変更する
function setDiscView(x, y, discColor) {
    const boardView = document.getElementById('board');
    const row = boardView.children[y-1];
    const square = row.children[x-1];
    const disc = square.firstElementChild;
    disc.setAttribute('class', 'disc ' + discColor);
}

// reversiを始める
function startReversi(computer) {
    initBoard();
    playerTurn = BLACK;
    computerColor = computer;
    if(playerTurn === computer){
        computerPlay();
        playerTurn = WHITE;
    }
    reflectDiscsView();
    displayPlacableSquares(playerTurn);
}

// boardを初期化する
function initBoard() {
    let newBoard = new Array(10);
    for(let i = 0; i < 10; ++i) {
        newBoard[i] = new Array(10).fill(OOB);
    }
    for(let y = 1; y <= 8; ++y) {
        for(let x = 1; x <= 8; ++x) {
            newBoard[y][x] = NONE;
        }
    }
    newBoard[4][4] = newBoard[5][5] = WHITE;
    newBoard[4][5] = newBoard[5][4] = BLACK;
    board = newBoard;
}

function computerPlay() {
    if(playerTurn === computerColor){
        const place = randomSelect(computerColor);
        putDisc(place[0], place[1], computerColor);
    }
}

// playerが(x, y)に石を置けるとき、置く
function tryPutDisc(x, y) {
    if(!isPlaceable(x, y, playerTurn)) return;
    displayMessage('');
    putDisc(x, y, playerTurn);
    reflectDiscsView();
    playerTurn = opponentPlayerNum(playerTurn);
    displayPlacableSquares(playerTurn);
    if(!isPlaceableAll(playerTurn)){
        playerTurn = opponentPlayerNum(playerTurn);
        if(!isPlaceableAll(playerTurn)) {
            displayResult();
        }
        else {
            displayMessage('パス');
            displayPlacableSquares(playerTurn);
        }
    }
    else if (playerTurn === computerColor) {
        computerPlay();
        playerTurn = opponentPlayerNum(playerTurn);
        reflectDiscsView();
        displayPlacableSquares(playerTurn);
    }
}

function countReverseDisc(x, y, xDirection, yDirection, playerNum) {
    let xChecking = x + xDirection;
    let yChecking = y + yDirection;
    let count = 0;
    while(board[yChecking][xChecking] === opponentPlayerNum(playerNum)){
        count++;
        xChecking += xDirection;
        yChecking += yDirection;
    }
    if(board[yChecking][xChecking] === playerNum) return count;
    else return 0;
}

function isPlaceable(x, y, playerNum) {
    if(!isValidCoodination(x, y) || board[y][x] != 0) return false;
    let count = 0;
    for(let yDirection = -1; yDirection <= 1; ++yDirection){
        for(let xDirection = -1; xDirection <= 1; ++xDirection){
            if(xDirection === 0 && yDirection === 0) continue;
            count += countReverseDisc(x, y, xDirection, yDirection, playerNum);
        }
    }
    return count > 0;
}

function randomSelect(playerNum) {
    const placable = placeableSquares(playerNum);
    const size = placable.length;
    const randomInt = Math.floor(Math.random() * size);
    return placable[randomInt];
}

function isPlaceableAll(playerNum) {
    return placeableSquares(playerNum).length > 0;
}

// 
function placeableSquares(playerNum) {
    let squares = new Array();
    for(let y = 1; y <= 8; ++y) {
        for(let x = 1; x <= 8; ++x) {
            if(isPlaceable(x, y, playerNum)) squares.push([x, y]);
        }
    }
    return squares;
}

function putDisc(x, y, playerNum) {
    let newBoard = JSON.parse(JSON.stringify(board));
    newBoard[y][x] = playerNum;
    for(let yDirection = -1; yDirection <= 1; ++yDirection){
        for(let xDirection = -1; xDirection <= 1; ++xDirection){
            if(xDirection === 0 && yDirection === 0) continue;
            const count = countReverseDisc(x, y, xDirection, yDirection, playerNum);
            let xChecking = x;
            let yChecking = y;
            for(let i = 0; i < count; ++i) {
                xChecking += xDirection;
                yChecking += yDirection;
                newBoard[yChecking][xChecking] = playerNum;
            }
        }
    }
    board = newBoard;
}

// [白の個数, 黒の個数]
function countDisc(){
    let count = [0, 0];
    for(let y = 1; y <= 8; ++y) {
        for(let x = 1; x <= 8; ++x) {
            if(board[y][x] == WHITE) count[0]++;
            if(board[y][x] == BLACK) count[1]++;
        }
    }
    return count;
}

// x, yが[1, 8]の範囲に収まっているか
function isValidCoodination(x, y) {
    return 1 <= x && x <= 8 && 1 <= y && y <= 8;
}

function opponentPlayerNum(playerNum) {
    if(playerNum === WHITE) return BLACK;
    if(playerNum === BLACK) return WHITE;
}

function discColorString(discColorNum) {
    return (discColorNum === NONE) ? 'none':
           (discColorNum === WHITE) ? 'white':
           (discColorNum === BLACK) ? 'black':
           '';
}