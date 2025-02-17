const $ = (id) => document.getElementById(id);

let turn = 0;
let currentlyRolling = false;
let whichRolling = [true,true,true,true,true]

let games = [
    new Yahtzee(),
    new Yahtzee()
]

//handles switching a die from rolling vs held state
function clickDie(obj) {
    //only change dice rolling state in certain gamestates
    if(games[turn].state == "initial" ||
        currentlyRolling ||
        turn != parseInt(obj.id.charAt(6))
    ) return;

    let rolling = obj.getAttribute("data-rolling") == "true";
    obj.setAttribute("data-rolling", !rolling);
}

function clickRoll() {
    if(games[turn].state == "final" || currentlyRolling)
        return; //no rolling allowed
    
    currentlyRolling = true;

    let whichRolling = [
        $(`player${turn}die0`).getAttribute("data-rolling") == "true",
        $(`player${turn}die1`).getAttribute("data-rolling") == "true",
        $(`player${turn}die2`).getAttribute("data-rolling") == "true",
        $(`player${turn}die3`).getAttribute("data-rolling") == "true",
        $(`player${turn}die4`).getAttribute("data-rolling") == "true"
    ];

    rollDice(10, whichRolling);
}

//dice rolling logic and animation
function rollDice(timeLeft, whichRolling) {
    //end of animation
    if(timeLeft == 0) {
        currentlyRolling = false;
        games[turn].rollDice(whichRolling);
        reflectDice();
        reflectScore();
        return;
    }

    //randomize dice for animation
    games[turn].setDiceRandomDifferent(whichRolling);
    reflectDice();

    //continue rolling animation
    setTimeout(
        () => rollDice(timeLeft - 1, whichRolling),
        150 -timeLeft*14
    )
}

//called when a score is clicked, locks in that score
function clickScore(obj) {
    if(obj.getAttribute("data-clickable") != "true" ||
       games[turn].state == "initial" ||
       turn != parseInt(obj.id.charAt(6))
    ) return;

    //remove "playerNscore" from beginning of id
    let choice = obj.id.substring(12);

    games[turn].chooseScore(choice);
    changeTurn();
}

//switch turn and all visual states involved
function changeTurn() {
    //reset scoreboard state
    for(let i in games[turn].score) {
        $(`player${turn}score${i}`).setAttribute("data-clickable", false);

        if(games[turn].score[i] == null)
            $(`player${turn}score${i}`).innerHTML = "";
    }

    games[turn].calcScoreTotals();
    reflectScoreTotals();

    //disable controls
    $(`player${turn}button`).disabled = true;

    //actually swap turn
    turn = 1 - turn;

    //allow roll button
    $(`player${turn}button`).disabled = false;

    //reset all dice rolling states
    for(let i = 0; i < 5; i++) {
        $(`player0die${i}`).setAttribute("data-rolling", true);
        $(`player1die${i}`).setAttribute("data-rolling", true);
    }

    games[turn].calcScoreTotals();
    reflectScoreTotals();
}

function reflectDice() {
    for(let i = 0; i < 5; i++) {
        $(`player${turn}die${i}`).firstElementChild.setAttribute("src", `images/${games[turn].dice[i]}.png`);
    }
}

function reflectScore() {
    for(let i in games[turn].score) {
        //scores already placed
        if(games[turn].score[i] != null)
            $(`player${turn}score${i}`).innerHTML = games[turn].score[i];

        //scores that can be placed
        if(games[turn].scoreOptions[i] != null) {
            $(`player${turn}score${i}`).innerHTML = games[turn].scoreOptions[i];
            $(`player${turn}score${i}`).setAttribute("data-clickable", true);
        } else {
            $(`player${turn}score${i}`).setAttribute("data-clickable", false);
        }
    }
}

function reflectScoreTotals(p) {
    for(let i in games[turn].totals) {
        $(`player${turn}score${i}`).innerHTML = games[turn].totals[i];
    }
}