const $ = (id) => document.getElementById(id);

let turn = 0;
let currentlyRolling = false;
let whichRolling = [true,true,true,true,true]

let games = [
    new Yahtzee(),
    new Yahtzee()
]

let agentnames = [
    "player",
    "noopponent"
];

//handles switching a die from rolling vs held state
function clickDie(id, byPlayer) {
    let obj = $(id);

    //only change dice rolling state in certain gamestates
    if(games[turn].state == "initial" ||
        currentlyRolling ||
        turn != parseInt(obj.id.charAt(6)) ||
        (byPlayer && agentnames[turn] != "player")
    ) return;

    let rolling = obj.getAttribute("data-rolling") == "true";
    obj.setAttribute("data-rolling", !rolling);
}

function clickRoll(byPlayer) {
    if(games[turn].state == "final" ||
        currentlyRolling ||
        (byPlayer && agentnames[turn] != "player")
    ) return; //no rolling allowed
    
    currentlyRolling = true;

    let whichRolling = [
        $(`player${turn}die0`).getAttribute("data-rolling") == "true",
        $(`player${turn}die1`).getAttribute("data-rolling") == "true",
        $(`player${turn}die2`).getAttribute("data-rolling") == "true",
        $(`player${turn}die3`).getAttribute("data-rolling") == "true",
        $(`player${turn}die4`).getAttribute("data-rolling") == "true"
    ];

    rollDiceAnimation(10, whichRolling);
}

//dice rolling logic and animation
function rollDiceAnimation(timeLeft, whichRolling) {
    //end of animation
    if(timeLeft == 0 || true) {
        currentlyRolling = false;
        games[turn].rollDice(whichRolling);
        reflectDice();
        reflectScore();

        if(agentnames[turn] != "player") {
            agentChoose(games[turn], agentnames[turn]);
        }
        return;
    }

    //randomize dice for animation
    games[turn].setDiceRandomDifferent(whichRolling);
    reflectDice();

    const animationTime = 150;
    //continue rolling animation
    setTimeout(
        () => rollDiceAnimation(timeLeft - 1, whichRolling),
        animationTime -timeLeft*(animationTime*0.9/10)
    )
}

//called when a score is clicked, locks in that score
function clickScore(id, byPlayer) {
    let obj = $(id);

    if(obj.getAttribute("data-clickable") != "true" ||
       games[turn].state == "initial" ||
       turn != parseInt(obj.id.charAt(6))  ||
       (byPlayer && agentnames[turn] != "player")
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

    if(agentnames[turn] == "noopponent") {
        changeTurn();
    } else if(agentnames[turn] != "player") {
        agentChoose(games[turn], agentnames[turn]);
    }
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
        $(`player0score${i}`).innerHTML = games[0].totals[i];
        $(`player1score${i}`).innerHTML = games[1].totals[i];
    }
}

function resetGame() {
    turn = 0;

    games = [
        new Yahtzee(),
        new Yahtzee()
    ]

    //reset all dice rolling states
    for(let i = 0; i < 5; i++) {
        $(`player0die${i}`).setAttribute("data-rolling", true);
        $(`player1die${i}`).setAttribute("data-rolling", true);
    }
    for(let i in games[turn].score) {
        $(`player0score${i}`).innerHTML = "";
        $(`player1score${i}`).innerHTML = "";
    }
    $(`player0button`).disabled = false;
    $(`player1button`).disabled = true;

    reflectScoreTotals();

    agentnames[0] = $(`agentselect0`).value;
    agentnames[1] = $(`agentselect1`).value;

    if(agentnames[turn] != "player") {
        agentChoose(games[turn], agentnames[turn]);
    }
}