
function createPlayer(marker, name) {
    const getMarker = function () {
        return marker;
    }
    const getName = function () {
        return name;
    }
    return {getMarker, getName}
}


const gameBoard = (function (){
    const board = Array(3).fill(null).map(() => Array(3).fill(null));

    const setSquare = function (row, col, marker) {
        board[row][col]  = marker;
    }

    const getSquare = function (row, col) {
        return board[row][col];
    }

    const resetBoard = function () {
        for (let i = 0; i < 3; i++) {
            board[i] = Array(3).fill(null);
        }
    };

    const getBoard = function () {
        return board;
    }

    const isSquareEmpty = (row, col) => getSquare(row, col) === null;

    const printBoard = function () {
        console.log(board);
    }

    return {getSquare, setSquare, resetBoard, getBoard, printBoard, isSquareEmpty};
})();

const GameStatus = Object.freeze({
    WIN: 'win',
    TIE: 'tie',
    ONGOING: 'ongoing'
});


const game = (function (gameBoard) {
    let player1, player2, currentPlayer, status;
    const isWinningLine = (a, b, c) => a && a === b && b === c;
    const checkWin = function () {
        let a, b, c;
        for (let i = 0; i < 3; i++) {
            // Checking row i
            a = gameBoard.getSquare(i, 0);
            b = gameBoard.getSquare(i, 1);
            c = gameBoard.getSquare(i, 2);
            if (isWinningLine(a, b, c)) {
                return true;
            }
            a = gameBoard.getSquare(0, i);
            b = gameBoard.getSquare(1, i);
            c = gameBoard.getSquare(2, i);
            // Checking column i
            if (isWinningLine(a, b, c)) {
                return true;
            }
        }
        // Main diagonal
        a = gameBoard.getSquare(0, 0);
        b = gameBoard.getSquare(1, 1);
        c = gameBoard.getSquare(2, 2);
        if (isWinningLine(a, b, c)) {
            return true;
        }
        // Anti-diagonal
        a = gameBoard.getSquare(0, 2);
        b = gameBoard.getSquare(1, 1);
        c = gameBoard.getSquare(2, 0);
        if (isWinningLine(a, b, c)) {
            return true;
        }
    }
    const checkStatus = function () {
        if (checkWin()){
            status = GameStatus.WIN;
            return;
        } else {
            for (let i = 0; i < 3; i++) {
                for (let j = 0; j < 3; j++) {
                    if (gameBoard.isSquareEmpty(i, j)){
                        return;
                    }
                }
            }
            status = GameStatus.TIE;
        }
    }
    const playTurn = function (row, col) {
        if (gameBoard.isSquareEmpty(row, col) && status === GameStatus.ONGOING) {
            let winner_msg = "";
            gameBoard.setSquare(row, col, currentPlayer.getMarker());
            checkStatus();
            if (status === GameStatus.WIN) {
                winner_msg = `${currentPlayer.getName()} playing as ${currentPlayer.getMarker()} won the game!`
                return { status, winner_msg };
            }
            else if (status === GameStatus.TIE) {
                winner_msg = "The game is tied"
                return { status, winner_msg };
            }
            currentPlayer = currentPlayer === player1 ? player2 : player1;
            return { status, winner_msg };
        }
        return null;
    }
    const resetGame = function () {
        currentPlayer = player1;
        status = GameStatus.ONGOING;
        gameBoard.resetBoard();
    }
    const getCurrentPlayer = () => currentPlayer;
    const getStatus = () => status;
    const init = function (p1, p2){
        player1 = p1;
        player2 = p2;
        currentPlayer = player1;
        status = GameStatus.ONGOING;
        gameBoard.resetBoard();
    }
    return {playTurn, resetGame, getCurrentPlayer, getStatus, init};
})(gameBoard);


const displayController = (function(){
    const run = function () {
        const form = document.querySelector(".form");
        form.addEventListener("submit", formSubmit);
        const resetBtn = document.querySelector(".reset-btn");
        resetBtn.addEventListener("click", resetButton);
        const newBtn = document.querySelector(".new-btn");
        newBtn.addEventListener("click", newButton);
        const board = document.querySelector('.board');
        const squares = board.children; // HTMLCollection
        for (let i = 0; i < squares.length; i++) {
            const square = squares[i];
            const row = Math.floor(i / 3);
            const col = i % 3;
            square.addEventListener('click', () => {
                squareClick(row, col);
            });
        }
    }
    function formSubmit(event){
        event.preventDefault();
        const form = event.target;
        const name1 = form.elements['name1'].value;
        const name2 = form.elements['name2'].value;
        const player1 = createPlayer('X', name1);
        const player2 = createPlayer('O', name2);
        game.init(player1, player2);
        const firstElem = document.querySelector(".first");
        firstElem.style.display = 'none';
        const secondElem = document.querySelector(".second");
        secondElem.style.display = 'flex';
        displayBoard();
    }
    function resetButton(event){
        game.resetGame();
        displayBoard();
    }
    function newButton(event){
        const secondElem = document.querySelector(".second");
        secondElem.style.display = 'none';
        const firstElem = document.querySelector(".first");
        firstElem.style.display = 'flex';
    }
    function squareClick(row, col){
        const retVal = game.playTurn(row, col);
        if (retVal){
            displayBoard();
            if (retVal.status != GameStatus.ONGOING) {
                const h2Elem = document.querySelector(".second > h2");
                h2Elem.innerHTML = retVal.winner_msg;
            }
        }
    }
    function displayBoard() {
        const h2Elem = document.querySelector(".second > h2");
        h2Elem.innerHTML = `${game.getCurrentPlayer().getName()}'s turn - playing as ${game.getCurrentPlayer().getMarker()}`;
        const board = document.querySelector('.board');
        const squares = board.children; // HTMLCollection

        for (let i = 0; i < squares.length; i++) {
            const square = squares[i];
            const row = Math.floor(i / 3);
            const col = i % 3;
            square.innerHTML = gameBoard.getSquare(row, col);
        }
    }

    return {run};
})();


displayController.run();