
var currentPlayer = "X";

var checkedBoxes = [];

var turnCount = 0;

var gameMode = 'PvP';

var model = getModel();

document.querySelectorAll('.box').forEach((value, key) => {
    value.addEventListener("click", () => {
        onCheckBox(value);
    });
});

function onGameModeChange(mode, _el) {
    if (_el.classList.contains('mode-selected'))
        return;
    _el.classList.add('mode-selected');

    if (mode == 'PvP') {
        document.querySelector(`.mode.PvC`).classList.remove('mode-selected');
    }
    else if (mode == 'PvC') {
        document.querySelector(`.mode.PvP`).classList.remove('mode-selected');
    }
    gameMode = mode;
    newGame();
}

function onCheckBox(element) {
    checkedBoxes.push({ box: element.id, player: currentPlayer });

    element.value = currentPlayer;

    element.disabled = "disabled";
    turnCount++;
    var gameStatus = checkWinner();
    switchPlayer();
    if (turnCount % 2 == 1 && gameStatus != 'game over' && gameMode == "PvC")
        computerPlays();
}

function onUncheckBox(element, isImplicit = false) {
    checkedBoxes = checkedBoxes.filter(b => b.box != element.id);
    if (!isImplicit) {
        element.value = '';
        element.removeAttribute("disabled");
        turnCount--;
        switchPlayer();
    }



}

function switchPlayer() {
    currentPlayer = currentPlayer == "X" ? "O" : "X";
    document.querySelector('.current-player').textContent = currentPlayer;
}


function checkWinner(isCheckOnly = false) {
    //debugger;
    if (currentPlayer == "X") {
        var xs = checkedBoxes.filter(item => {
            return item.player == "X";
        }).map(value => {
            return { x: Number(value.box.split("-")[0]), y: Number(value.box.split("-")[1]) }
        });

        return calculateScore(xs, isCheckOnly);
    }
    else if (currentPlayer == "O") {
        var os = checkedBoxes.filter(item => {
            return item.player == "O";
        }).map(value => {
            return { x: Number(value.box.split("-")[0]), y: Number(value.box.split("-")[1]) }
        });

        return calculateScore(os, isCheckOnly);
    }


}


function calculateScore(positions, isCheckOnly) {

    if (positions.filter(i => { return i.x == i.y }).length == 3) {
        if (!isCheckOnly)
            showWinner();
        return 'game over';
    }

    if (positions.filter(i => { return (i.x == 0 && i.y == 2) || (i.x == 1 && i.y == 1) || (i.x == 2 && i.y == 0) }).length == 3) {
        if (!isCheckOnly)
            showWinner();
        return 'game over';
    }

    for (var i = 0; i < 3; i++) {
        var consecutiveHorizontal = positions.filter(p => {
            return p.x == i;
        });
        if (consecutiveHorizontal.length == 3) {
            if (!isCheckOnly)
                showWinner();
            return 'game over';
        }
        var consecutiveVertical = positions.filter(p => {
            return p.y == i;
        });
        if (consecutiveVertical.length == 3) {
            if (!isCheckOnly)
                showWinner();
            return 'game over';
        }
    }
    if (positions.length == 5) {
        if (!isCheckOnly)
            showWinner(true);
        return 'game over';
    }
    return 'game on';
}

function clearBoard() {
    document.querySelectorAll('.box').forEach((value, index) => {
        value.value = '';
        value.removeAttribute("disabled");
        checkedBoxes = [];
        turnCount = 0;
    })
}

function showWinner(noWinner = false) {

    if (noWinner) {
        document.querySelector('.winner-screen .body').innerHTML = 'Its a Draw!';
        document.querySelector('.winner-screen').classList.toggle('fade-in');
        document.querySelector('.winner-screen').classList.toggle('fade-out');
        updateModel('draw');
        return;
    }
    else {
        document.querySelector('.winner-screen .body').innerHTML = 'Player ' + currentPlayer + ' Won!';
        // document.querySelector('.winner-screen').style.display = 'block';
        document.querySelector('.winner-screen').classList.toggle('fade-in');
        document.querySelector('.winner-screen').classList.toggle('fade-out');
        document.querySelector('#score-' + currentPlayer).textContent = Number(document.querySelector('#score-' + currentPlayer).textContent) + 1;
        updateModel('win');
        return;
    }
}


document.querySelectorAll('.okay-button').forEach((value, key) => {
    value.addEventListener('click', () => {
        newGame();
    });
})

function newGame() {
    showLoader();
    clearBoard();
    document.querySelector('.winner-screen').classList.remove('fade-in');
    document.querySelector('.winner-screen').classList.add('fade-out');
    switchPlayer();
    setTimeout(hideLoader, 500);
}

function computerPlays() {

    //debugger;
    var nextBoxCoords = computeFinishingMove();

    if (!nextBoxCoords) {
        nextBoxCoords = computeSavingMove();
    }
    
    if (model.length) {
        if (!nextBoxCoords)
            nextBoxCoords = computeWinningMove();

        if (!nextBoxCoords) {
            nextBoxCoords = computeDrawMove();
        }
    }
    if (!nextBoxCoords) {
        nextBoxCoords = computeRandomMove();
    }

    var nextBox = document.querySelector(`[id='${nextBoxCoords}']`);
    onCheckBox(nextBox);
}

function computeWinningMove() {
    var checkedBoxesSimplified = checkedBoxes.map(b => b.box);
    var winningCombinations = model.filter(m => m.result == 'win'
        && m.winner == (turnCount + 1) % 2
        && JSON.stringify(m.pattern.slice(0, turnCount)) == JSON.stringify(checkedBoxesSimplified))
        .sort();

    var winningCount = 0;
    var currentCount = 0;
    var winningCombination;

    for (var i = 0; i < winningCombinations.length; i++) {
        if (isLosingCombination(winningCombinations[i])) {
            continue;
        }
        if (i == 0 || winningCombinations[i - 1] == winningCombinations[i]) {
            currentCount++;
        }
        if (currentCount > winningCount) {
            winningCount = currentCount;
            winningCombination = winningCombinations[i];
        }
    }

    if (winningCombination){
        console.log('Playing Winning Move');
        return winningCombination.pattern[turnCount];
    }
    else
        return '';
}

function computeDrawMove() {
    var checkedBoxesSimplified = checkedBoxes.map(b => b.box);
    var drawingCombinations = model.filter(m => m.result == 'draw'
        && m.winner == -1
        && JSON.stringify(m.pattern.slice(0, turnCount)) == JSON.stringify(checkedBoxesSimplified))
        .sort();
    
    if(!drawingCombinations)
        return '';

    var drawingCount = 0;
    var currentCount = 0;
    var drawingCombination;

    for (var i = 0; i < drawingCombinations.length; i++) {
        if (isLosingCombination(drawingCombinations[i]))
            continue;
        if (i == 0 || drawingCombinations[i - 1] == drawingCombinations[i]) {
            currentCount++;
        }
        if (currentCount > drawingCount) {
            drawingCount = currentCount;
            drawingCombination = drawingCombinations[i];
        }
    }
    
    if (drawingCombination){
        console.log('Playing Drawing Move');
        return drawingCombination.pattern[turnCount];
    }
    else
        return '';
}

function computeRandomMove() {
    var remainingMoves = getRemainingMoves();
    var movesTried = 0;
    var randomMove;
    while(true)
    {
        console.log('Trying Random Move!');
        randomMove = remainingMoves[Math.floor(Math.random() * remainingMoves.length)];
        remainingMoves = remainingMoves.filter(m => m != randomMove);
        movesTried++;
        if(!isLosingMove(randomMove)){
            console.log('Playing Calculated Random Move');
            return randomMove;
        }
        else if (isLosingMove(randomMove) && movesTried != remainingMoves.length){
            console.log('Playing Any Random Move');
            return getRemainingMoves()[Math.floor(Math.random() * remainingMoves.length)];
        }
    }
}

function isLosingCombination(combination) {
    //debugger;
    return !!model.find(m => m.result == 'win'
        && m.winner == (turnCount + 2) % 2 // Check Losing Combination
        && JSON.stringify(m.pattern.slice(0, turnCount+1)) == JSON.stringify(combination.pattern.slice(0, turnCount+1)))
}

function isLosingMove(move){
    var playedMoves = checkedBoxes.map(b => b.box);
    var appendedPlayedMoves = playedMoves.push(move);
    return !!model.find(m => m.result == 'win'
                    && m.winner == (turnCount + 2) % 2 // Check Losing Combination
                    && JSON.stringify(m.pattern.slice(0, turnCount+1)) == JSON.stringify(appendedPlayedMoves))
}

function computeSavingMove() {
    var remainingMoves = getRemainingMoves();
    switchPlayer();
    var savingMoveCoords;
    for (var move of remainingMoves) {
        checkedBoxes.push({ box: move, player: currentPlayer });
        var nextBox = document.querySelector(`[id='${move}']`)
        if (checkWinner(true) == 'game over') { 
            savingMoveCoords = move;
            onUncheckBox(nextBox, true);
            break;
        }
        onUncheckBox(nextBox, true);
    }
    switchPlayer();
    if(savingMoveCoords){
        console.log('Playing Saving Move')
        return savingMoveCoords;
    }
}

function computeFinishingMove() {
    var remainingMoves = getRemainingMoves();
    var finishingMoveCoords;
    for (var move of remainingMoves) {
        checkedBoxes.push({ box: move, player: currentPlayer });
        var nextBox = document.querySelector(`[id='${move}']`)
        if (checkWinner(true) == 'game over') {
            finishingMoveCoords = move;
            onUncheckBox(nextBox, true);
            break;
        }
        onUncheckBox(nextBox, true);
    }
    if(finishingMoveCoords){
        console.log('Playing Finishing Move')
        return finishingMoveCoords;
    }
    else{
        return '';
    }
    
}

function getRemainingMoves() {
    var allMoves = ['0-0', '0-1', '0-2',
        '1-0', '1-1', '1-2',
        '2-0', '2-1', '2-2',]
    var playedMoves = checkedBoxes.map(b => b.box);
    return allMoves.filter(m => !playedMoves.find(move => move == m));
}

function updateModel(result) {
    showLoader();
    var winner = result == 'draw' ? -1 : turnCount % 2;
    model.push({ result: result, winner: winner, pattern: checkedBoxes.map(b => b.box) });
    localStorage.setItem('model', JSON.stringify(model));
    hideLoader();
}

function getModel(){
    return localStorage.getItem('model') ? JSON.parse(localStorage.getItem('model')) : [];
}


function showLoader(){
    document.querySelector('.loader-overlay').style.display = 'block';
}

function hideLoader(){
    document.querySelector('.loader-overlay').style.display = 'none';
}


