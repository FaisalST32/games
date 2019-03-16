
var currentPlayer = "X";

var checkedBoxes = [];

document.querySelectorAll('.box').forEach((value, key) => {
    value.addEventListener("click", () => {
        onCheckBox(value);
    });
});

function onCheckBox(element) {
    checkedBoxes.push({ box: element.id, player: currentPlayer });

    element.value = currentPlayer;

    element.disabled = "disabled";

    checkWinner();
    switchPlayer();
}

function switchPlayer() {
    currentPlayer = currentPlayer == "X" ? "O" : "X";
    document.querySelector('.current-player').textContent = currentPlayer;
}


function checkWinner() {
    var xs = checkedBoxes.filter(item => {
        return item.player == "X";
    }).map(value => {
        return { x: Number(value.box.split("-")[0]), y: Number(value.box.split("-")[1]) }
    });

    calculateScore(xs);

    var os = checkedBoxes.filter(item => {
        return item.player == "O";
    }).map(value => {
        return { x: Number(value.box.split("-")[0]), y: Number(value.box.split("-")[1]) }
    });

    calculateScore(os);


}


function calculateScore(positions) {

    if(positions.filter(i => {return i.x == i.y}).length == 3){
        showWinner();
        return;
    }

    if(positions.filter(i => {return (i.x == 0 && i.y == 2) || (i.x == 1 && i.y == 1) || (i.x == 2 && i.y == 0)}).length == 3){
        showWinner();
        return;
    }

    for (var i = 0; i < 3; i++) {
        var consecutiveHorizontal = positions.filter(p => {
            return p.x == i;
        });
        if (consecutiveHorizontal.length == 3) {
            showWinner();
            return;
        }
        var consecutiveVertical = positions.filter(p => {
            return p.y == i;
        });
        if (consecutiveVertical.length == 3) {
            showWinner();
            return;
        }

    }

    if(positions.length == 5){
        showWinner(true);
        return;
    }


}

function clearBoard() {
    document.querySelectorAll('.box').forEach((value, index) => {
        value.value = '';
        value.removeAttribute("disabled");
        checkedBoxes = [];
    })
}

function showWinner(noWinner = false) {

    if (noWinner){
        document.querySelector('.winner-screen .body').innerHTML = 'Its a Draw!';
        document.querySelector('.winner-screen').classList.toggle('fade-in');
        document.querySelector('.winner-screen').classList.toggle('fade-out');    }

    else {
        document.querySelector('.winner-screen .body').innerHTML = 'Player ' + currentPlayer + ' Won!';
        // document.querySelector('.winner-screen').style.display = 'block';
        document.querySelector('.winner-screen').classList.toggle('fade-in');
        document.querySelector('.winner-screen').classList.toggle('fade-out');
        document.querySelector('#score-' + currentPlayer).textContent = Number(document.querySelector('#score-' + currentPlayer).textContent) + 1;
    }
}


document.querySelectorAll('.okay-button').forEach((value, key) => {
    value.addEventListener('click', () => {
        newGame();
    });
})

function newGame() {
    clearBoard();
    // document.querySelector('.winner-screen').style.display = 'none';
    document.querySelector('.winner-screen').classList.toggle('fade-in');
    document.querySelector('.winner-screen').classList.toggle('fade-out');

    switchPlayer();
}

document.querySelector('.winner-screen').classList.toggle('fade-in');
document.querySelector('.winner-screen').classList.toggle('fade-out');