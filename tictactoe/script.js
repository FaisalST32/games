// var automate = false;
var currentPlayer = "X";

var checkedBoxes = [];

var turnCount = 0;

var gameMode = 'PvP';

// var model = getModel();

document.querySelectorAll('.box').forEach((value, key) => {
    value.addEventListener("click", () => {
        onCheckBox(value);
    });
});

// function automateGame(){
//     if(turnCount == 0){
//         var move = computeRandomMove();

//         var el  = document.querySelector(`[id='${move}']`);
    
//         onCheckBox(el);
    
//     }

//     else{
//         computerPlays();

//     }


// }

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
    // if(gameStatus != 'game on' && automate == true){
    //     newGame();
    //     automateGame();
    // }
    switchPlayer();
    if (turnCount % 2 == 1 && gameStatus != 'game over' && gameStatus != 'game drawn' && gameMode == "PvC"){
        computerPlays();
        // if(automate == true)
        // automateGame();
    }
        

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
        return 'game drawn';
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
        //updateModel('draw');
        return;
    }
    else {
        document.querySelector('.winner-screen .body').innerHTML = 'Player ' + currentPlayer + ' Won!';
        // document.querySelector('.winner-screen').style.display = 'block';
        document.querySelector('.winner-screen').classList.toggle('fade-in');
        document.querySelector('.winner-screen').classList.toggle('fade-out');
        document.querySelector('#score-' + currentPlayer).textContent = Number(document.querySelector('#score-' + currentPlayer).textContent) + 1;
        //updateModel('win');
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
    var nextBoxCoords;
    //debugger;

    if(turnCount == 1){
        nextBoxCoords = computeFirstMove();
    }
    if (!nextBoxCoords){
        nextBoxCoords = computeFinishingMove();
    }

    if (!nextBoxCoords) {
        nextBoxCoords = computeSavingMove();
    }
    if (!nextBoxCoords)
        nextBoxCoords = predictTrappingMove();
    
    // if (model.length) {
    //     if (!nextBoxCoords)
    //         nextBoxCoords = computeWinningMove();

    //     if (!nextBoxCoords) {
    //         nextBoxCoords = computeDrawMove();
    //     }
    // }
    if (!nextBoxCoords) {
        nextBoxCoords = computeRandomMove();
    }

    var nextBox = document.querySelector(`[id='${nextBoxCoords}']`);
    onCheckBox(nextBox);
}

function computeFirstMove(){
    var playedMove = checkedBoxes.map(b => b.box)[0];
    var edgeMoves = ['0-1', '1-0', '1-2', '2-1'];
    var cornerMoves = ['0-0', '0-2', '2-0', '2-2'];
    var centerMove = ['1-1'];
    if(edgeMoves.find(m => m == playedMove))
        return edgeMoveResponse(playedMove);
    else if(cornerMoves.find(m => m == playedMove))
        return '1-1';
    else if(centerMove.find(m => m == playedMove))
        return cornerMoves[Math.floor(Math.random()*cornerMoves.length)];
}

function edgeMoveResponse(playedMove){
    if(playedMove == '1-2') 
        return '0-2';
    else if (playedMove == "0-1") 
        return "0-0";
    else if (playedMove == "1-0") 
        return "2-0";
    else if(playedMove == '2-1') 
        return '2-0';
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

function predictTrappingMove() {
    var checkedBoxesBackup = checkedBoxes.slice();
    var remainingMoves = getRemainingMoves();
    var nextMove;
    var moveFound;
    for(var move of remainingMoves){
        checkedBoxes.push({box: move, player: currentPlayer})
        switchPlayer();

        //Check if the opponent needs to play a saving move

        var savingMove =  computeSavingMove();
        if(savingMove){
            checkedBoxes.push({box: savingMove, player: currentPlayer});
            if(checkTrap() == 'no trap'){
                checkedBoxes.pop();
                switchPlayer();
                nextMove = move;
                break;
            }
            checkedBoxes.pop();
            switchPlayer();
            continue;
        }

        //If no saving move is required, check each position
        else{
            switchPlayer();
            for(var opponentMove of getRemainingMoves()){
                switchPlayer();
                moveFound = true;
                
                checkedBoxes.push({box: opponentMove, player: currentPlayer});
                if(checkTrap() == 'trapped'){
                    moveFound = false;
                    checkedBoxes.pop();
                    switchPlayer();
                    break;
                }
                checkedBoxes.pop();
                switchPlayer();
            }
        }

        checkedBoxes.pop();
        if(moveFound){
            nextMove = move;
            break;
        }
    }
    checkedBoxes = checkedBoxesBackup;
    return nextMove;
}

function checkTrap(){

    var boxes = getRemainingMoves();
    var winningMoveCount = 0;
    for(var freeMove of boxes){
        checkedBoxes.push({box: freeMove, player: currentPlayer});
        var result = checkWinner(true);
        if(result == 'game over')
            winningMoveCount++
        checkedBoxes.pop();
    }
    if(winningMoveCount > 1 && winningMoveCount < boxes.length){
        return 'trapped';
    }
    else{
        return 'no trap';
    }
}

// function computeWinningMove() {
//     var checkedBoxesSimplified = checkedBoxes.map(b => b.box);
//     var winningCombinations = model.filter(m => m.result == 'win'
//         && m.winner == (turnCount + 1) % 2
//         && JSON.stringify(m.pattern.slice(0, turnCount)) == JSON.stringify(checkedBoxesSimplified))
//         .sort();

//     var winningCount = 0;
//     var currentCount = 0;
//     var winningCombination;
    
//     for (var i = 0; i < winningCombinations.length; i++) {
//         if (isLosingCombination(winningCombinations[i])) {
//             continue;
//         }
        
//         if (i == 0 || JSON.stringify(winningCombinations[i - 1]) == JSON.stringify(winningCombinations[i])) {
//             currentCount++;
//         }
//         if (currentCount > winningCount) {
//             winningCount = currentCount;
//             winningCombination = winningCombinations[i];
//         }
//     }

//     if (winningCombination){
//         console.log('Playing Winning Move');
//         return winningCombination.pattern[turnCount];
//     }
//     else
//         return '';
// }

// function computeDrawMove() {
//     var checkedBoxesSimplified = checkedBoxes.map(b => b.box);
//     var drawingCombinations = model.filter(m => m.result == 'draw'
//         && m.winner == -1
//         && JSON.stringify(m.pattern.slice(0, turnCount)) == JSON.stringify(checkedBoxesSimplified))
//         .sort();
    
//     if(!drawingCombinations)
//         return '';

//     var drawingCount = 0;
//     var currentCount = 0;
//     var drawingCombination;

//     for (var i = 0; i < drawingCombinations.length; i++) {
//         if (isLosingCombination(drawingCombinations[i]))
//             continue;
//         if (i == 0 || JSON.stringify(drawingCombinations[i - 1]) == JSON.stringify(drawingCombinations[i])) {
//             currentCount++;
//         }
//         if (currentCount > drawingCount) {
//             drawingCount = currentCount;
//             drawingCombination = drawingCombinations[i];
//         }
//     }
    
//     if (drawingCombination){
//         console.log('Playing Drawing Move');
//         return drawingCombination.pattern[turnCount];
//     }
//     else
//         return '';
// }

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

// function isLosingCombination(combination) {
//     //debugger;


//     return !!model.find(m => m.result == 'win'
//         && m.winner == (turnCount + 2) % 2 // Check Losing Combination
//         && JSON.stringify(m.pattern) == JSON.stringify(combination.pattern))
// }

// function isLosingMove(move){
//     var playedMoves = checkedBoxes.map(b => b.box);
//     var appendedPlayedMoves = playedMoves.push(move);
//     return !!model.find(m => m.result == 'win'
//                     && m.winner == (turnCount + 2) % 2 // Check Losing Combination
//                     && JSON.stringify(m.pattern.slice(0, turnCount+1)) == JSON.stringify(appendedPlayedMoves))
// }



function getRemainingMoves() {
    var allMoves = ['0-0', '0-1', '0-2',
        '1-0', '1-1', '1-2',
        '2-0', '2-1', '2-2',]
    var playedMoves = checkedBoxes.map(b => b.box);
    return allMoves.filter(m => !playedMoves.find(move => move == m));
}

// function updateModel(result) {
//     showLoader();
//     var winner = result == 'draw' ? -1 : turnCount % 2;
//     var boxes = checkedBoxes.map(b => b.box);
//     var box1 = transform90deg(boxes.slice());
//     var box2 = transform90deg(box1.slice());
//     var box3 = transform90deg(box2.slice());

//     model.push({ result: result, winner: winner, pattern: boxes });
//     model.push({ result: result, winner: winner, pattern: box1 });
//     model.push({ result: result, winner: winner, pattern: box2 });
//     model.push({ result: result, winner: winner, pattern: box3 });
//     localStorage.setItem('model', JSON.stringify(model));
//     hideLoader();
// }

// function transform90deg(boxArray) {
//   boxArray[boxArray.indexOf('0-0')] = '0-2n';
//   boxArray[boxArray.indexOf('0-1')] = '1-2n';
//   boxArray[boxArray.indexOf('0-2')] = '2-2n';
//   boxArray[boxArray.indexOf('1-0')] = '0-1n';
//   boxArray[boxArray.indexOf('1-1')] = '1-1n';
//   boxArray[boxArray.indexOf('1-2')] = '2-1n';
//   boxArray[boxArray.indexOf('2-0')] = '0-0n';
//   boxArray[boxArray.indexOf('2-1')] = '1-0n';
//   boxArray[boxArray.indexOf('2-2')] = '2-0n';

//   boxArray = boxArray.map(b => b.replace('n', ''));

//   return boxArray;

// }

// function getModel(){
//     return localStorage.getItem('model') ? JSON.parse(localStorage.getItem('model')) : [];
// }


function showLoader(){
    document.querySelector('.loader-overlay').style.display = 'block';
}

function hideLoader(){
    document.querySelector('.loader-overlay').style.display = 'none';
}


