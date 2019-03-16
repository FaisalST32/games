
var gridSize = 20;
var difficulty;
var tilesLeft = 0;
var totalMinesToBePlaced;
var uncoveredTiles = [];
var firstUncover = true;
var mineCount = 0;

function onChooseDifficulty(_el){
    difficulty = +_el.id.split('-')[1];
    totalMinesToBePlaced = difficulty * gridSize*gridSize/10;
    hideDifficultyModal();
    generateGrid();
    startTimer();
}

function hideDifficultyModal(){
    var modalEl = document.querySelector('#choose-difficulty-modal');
    modalEl.style.visibility = 'hidden';
}


function onNewGame(){
    window.location.reload();
}

function generateGrid() {
    for (var i = 0; i < gridSize; i++) {
        var rowDiv = document.createElement('div');
        rowDiv.id = 'row-' + i;
        rowDiv.classList.add(['row']);
        document.querySelector('div.container').appendChild(rowDiv);
        for (var j = 0; j < gridSize; j++) {
            var tileDiv = document.createElement('div');
            tileDiv.id = i.toString() + '-' + j.toString();
            tileDiv.classList.add(['tile']);
            var tileHidden = document.createElement('div');
            tileHidden.id = 'hidden-' + i.toString() + '-' + j.toString();
            tileHidden.classList.add(['tile-hidden']);
            tileDiv.appendChild(tileHidden);
            var tileShown = document.createElement('div');
            tileShown.id = 'shown-' + i.toString() + '-' + j.toString();
            tileShown.classList.add(['tile-shown']);
            // tileShown.innerText = 'Hi';
            tileDiv.appendChild(tileShown);
            rowDiv.appendChild(tileDiv);
        }
    }

    document.querySelector('#mines-counter>span').textContent = totalMinesToBePlaced;
    setEventListenersForTiles();

}

function onFirstUncover(){
    populateMines();
    populateCounters();
}

function populateMines(clickedTileElement) {

    var tileCount = 0
    var totalTiles = gridSize * gridSize;
    var clickedTileXCoord = Number(clickedTileElement.id.split('-')[1]);
    var clickedTileYCoord = Number(clickedTileElement.id.split('-')[2]);
    var clickedTileCoords = {x: clickedTileXCoord, y: clickedTileYCoord};
    var mineForbiddenRadius = 4-difficulty;


    for (var i = 0; i < gridSize; i++) {
        for (var j = 0; j < gridSize; j++) {
            var random = Math.ceil(Math.random() * 10);
            var remainingMinesEqualRemainingTiles = totalTiles - tileCount <= totalMinesToBePlaced - mineCount;
            var tile = document.querySelector('#' + 'hidden-' + i.toString() + '-' + j.toString());
            var xVicinity = i-clickedTileCoords.x;
            var yVicinity = j-clickedTileCoords.y;
            var isTileInVicinityOfClickedTile = (Math.abs(xVicinity) < mineForbiddenRadius && Math.abs(yVicinity) < mineForbiddenRadius);
            if (remainingMinesEqualRemainingTiles || ((random <= difficulty && mineCount < totalMinesToBePlaced ) && !isTileInVicinityOfClickedTile)) {
                tile.classList.add(['mine']);
                var mineImage = document.createElement('img');
                mineImage.src = 'mine.png';
                mineImage.style.width = '2em';
                tile.appendChild(mineImage);
                mineCount++;
            }
            tileCount++;
        }
    }

    tilesLeft = gridSize * gridSize - mineCount;
    document.querySelector('#mines-counter>span').textContent = mineCount;
}

function populateCounters() {
    var neighbourTiles = [{ x: -1, y: -1 }, { x: -1, y: 0 }, { x: -1, y: 1 }, { x: 0, y: -1 }, { x: 0, y: 1 }, { x: 1, y: -1 }, { x: 1, y: 0 }, { x: 1, y: 1 },]
    for (var i = 0; i < gridSize; i++) {
        for (var j = 0; j < gridSize; j++) {

            var tileMines = 0;
            var tile = document.querySelector('#' + 'hidden-' + i.toString() + '-' + j.toString());
            if (tile.classList.contains('mine'))
                continue;
            neighbourTiles.forEach((coords) => {
                neighbourTile = document.querySelector('#' + 'hidden-' + (i + coords.x).toString() + '-' + (j + coords.y).toString());
                if (neighbourTile != null && neighbourTile.classList.contains('mine')) {
                    tileMines++
                }
            });
            if (tileMines > 0) {
                tile.textContent = tileMines;
                tile.classList.add(['mine-' + tileMines]);
                tile.classList.add(['mined']);
            }
            else {
                tile.classList.add(['mine-' + tileMines]);
            }
        }
    }
}


function setEventListenersForTiles() {
    document.querySelectorAll('div.row>.tile>.tile-shown').forEach((el, index) => {
        el.addEventListener('click', () => {
            onUncoverTile(el);
        });
    });
    document.querySelectorAll('div.row>.tile>.tile-shown').forEach((el, index) => {
        el.addEventListener('contextmenu', (event) => {
            onFlagTile(event, el);
        });
    });
}

function onUncoverTile(el) {
    //Make sure first click uncovers some area
    if(firstUncover){
        populateMines(el);
        populateCounters();
        firstUncover = false;
    }
    if (el.classList.contains('flag'))
        return;

    uncoverTile(el);

    var neighbourTiles = [{ x: -1, y: -1 }, { x: -1, y: 0 }, { x: -1, y: 1 }, { x: 0, y: -1 }, { x: 0, y: 1 }, { x: 1, y: -1 }, { x: 1, y: 0 }, { x: 1, y: 1 }];
    var emptyTiles = [];
    if (el.previousSibling.classList.contains('mine-0')) {
        emptyTiles.push(el);
        var emptyTilesAdded = 1;

        while (emptyTilesAdded > 0) {
            var length = emptyTiles.length;
            emptyTilesAdded = 0;
            for(var i=0; i<length; i++) {
                neighbourTiles.forEach((coords) => {
                    var xCoord = Number(emptyTiles[i].id.split('-')[1]);
                    var yCoord = Number(emptyTiles[i].id.split('-')[2]);
                    neighbourTile = document.querySelector('#' + 'shown-' + (xCoord + coords.x).toString() + '-' + (yCoord + coords.y).toString());
                    if (neighbourTile != null && neighbourTile.previousSibling.classList.contains('mine-0') && !emptyTiles.includes(neighbourTile)) {
                        emptyTiles.push(neighbourTile);
                        
                        uncoverTile(neighbourTile);
                        emptyTilesAdded++;
                    }
                    else if (neighbourTile != null && (neighbourTile.previousSibling.classList.contains('mined'))){
                        uncoverTile(neighbourTile);
                    }

                })
            }

        }

    }

    if (el.previousSibling.classList.contains('mine')) {
        onGameLost();
    }
    if (tilesLeft == 0) {
        onGameWon();
    }
}

function onFlagTile(event, el) {
    event.preventDefault();


    if (!el.classList.contains('flag') && mineCount != 0) {

        el.classList.add(['flag']);
        var flagImage = document.createElement('img');
        flagImage.src = 'flag.png';
        flagImage.style.width = '2em';
        el.appendChild(flagImage);

        console.log('tile flagged');
        updateMineCount(false)
    }
    else {
        el.classList.remove(['flag']);
        el.removeChild(el.querySelector('img'));
        console.log('tile unflagged');
        updateMineCount(true);
    }

}

function updateMineCount(increase) {
    if (increase)
        mineCount++;
    else
        mineCount--;
    document.querySelector('#mines-counter>span').textContent = mineCount;
}

function uncoverTile(el) {
    if(!uncoveredTiles.includes(el)){
        el.style.display = 'none';
        el.previousSibling.style.display = 'block';
        tilesLeft--;
        uncoveredTiles.push(el);
    }

    else{
        return;
    }

}

//Display Timer 
function startTimer(){
    var basetime = Math.floor(new Date().getTime()/1000);
    timerFn = setInterval(updateTimer, 1000);
    function updateTimer(){
        var minutes = Math.floor((Math.floor(new Date().getTime()/1000) - basetime)/60);
        var seconds = (Math.floor(new Date().getTime()/1000) - basetime)%60;
        document.querySelector('.timer>.minutes').textContent = minutes < 10 ? '0' + minutes : minutes;
        document.querySelector('.timer>.seconds').textContent = seconds < 10 ? '0' + seconds : seconds;
    }
};

function onGameLost(){
    uncoverMinedTiles();
    showGameResultModal('You Lost!');
    stopTimer();
}

function showGameResultModal(resultText){
    var gameResultModalEl = document.querySelector('#game-result-modal');
    gameResultModalEl.querySelector('#game-result-text').innerHTML = resultText;
    gameResultModalEl.style.visibility = 'visible';
}

function uncoverMinedTiles(){
    document.querySelectorAll('div.row>.tile>.tile-hidden.mine').forEach((el, index) => {
        var minedTile = el.nextSibling;
        uncoverTile(minedTile);
    });
    stopTimer();
}

function onGameWon(){
    showGameResultModal('You Won!');
    stopTimer();
}

function stopTimer(){
    clearInterval(timerFn);
}








