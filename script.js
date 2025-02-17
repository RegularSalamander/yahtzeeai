const $ = (id) => document.getElementById(id);

let turn = 0;
let diceStates = [
    [1,2,3,4,5],
    [1,2,3,4,5]
];
let scores = {
    "ones": [null, null],
    "twos": [null,null],
    "threes": [null,null],
    "fours": [null,null],
    "fives": [null,null],
    "sixes": [null,null],
    "uppertotal": [null,null],
    "upperbonus": [null,null],
    "threeofakind": [null,null],
    "fourofakind": [null,null],
    "fullhouse": [null,null],
    "smallstraight": [null,null],
    "largestraight": [null,null],
    "yahtzee": [null,null],
    "chance": [null,null],
    "yahtzeebonus": [null,null],
    "lowertotal": [null,null],
    "total": [null,null]
}


function randint(min, max) {
    return Math.floor(Math.random()*max) + min;
}

function clickDie(obj) {
    let rolling = obj.getAttribute("data-rolling") == "true"
    obj.setAttribute("data-rolling", !rolling);
}

function rollDice(player, timeLeft) {
    if(timeLeft == null) timeLeft = 10;

    for(let i = 0; i < 5; i++) {
        if($(`player${player}die${i}`).getAttribute("data-rolling") != "true")
            continue;
        
        let prev = diceStates[player][i];
        let roll;
        do {
            roll = randint(1, 6);
        } while(roll == prev);

        diceStates[player][i] = roll;
        $(`player${player}die${i}`).firstElementChild.setAttribute("src", `images/${roll}.png`);
    }

    if(timeLeft > 0)
        setTimeout(
            () => rollDice(player, timeLeft - 1),
            150 -timeLeft*14
        )
}

function setDiceImgs() {
    for(let player = 1; player <= 2; player++) {
        for(let i = 1; i <= 5; i++) {
            $(`player${player}die${i}`).firstElementChild.setAttribute("src", `images/${diceStates[player-1][i-1]}.png`);
        }
    }
}

function scoreDice(player) {
    let dice = diceStates[player];
    let diceTypes = [0, 0, 0, 0, 0, 0];
    for(let i = 0; i < 5; i++)
        diceTypes[dice[i] - 1]++;
    let diceSum = dice.reduce((x,y) => x+y);

    let scoreOptions = {};
    
    scoreOptions["ones"] = diceTypes[0];
    scoreOptions["twos"] = diceTypes[1]*2;
    scoreOptions["threes"] = diceTypes[2]*3;
    scoreOptions["fours"] = diceTypes[3]*4;
    scoreOptions["fives"] = diceTypes[4]*5;
    scoreOptions["sixes"] = diceTypes[5]*6;

    scoreOptions["threeofakind"] = 0;
    if(Math.max(...diceTypes) >= 3)
        scoreOptions["threeofakind"] = diceSum;

    scoreOptions["fourofakind"] = 0;
    if(Math.max(...diceTypes) >= 4)
        scoreOptions["fourofakind"] = diceSum;

    scoreOptions["fullhouse"] = 0;
    if(diceTypes.indexOf(3) >= 0 && diceTypes.indexOf(2) >= 0)
        scoreOptions["fullhouse"] = 25;

    scoreOptions["smallstraight"] = 0;
    if(
        diceTypes[0] > 0 && diceTypes[1] > 0 && diceTypes[2] > 0 && diceTypes[3] > 0 ||
        diceTypes[1] > 0 && diceTypes[2] > 0 && diceTypes[3] > 0 && diceTypes[4] > 0 ||
        diceTypes[2] > 0 && diceTypes[3] > 0 && diceTypes[4] > 0 && diceTypes[5] > 0
    ) scoreOptions["smallstraight"] = 30;

    scoreOptions["largestraight"] = 0;
    if(
        diceTypes[0] > 0 && diceTypes[1] > 0 && diceTypes[2] > 0 && diceTypes[3] > 0 && diceTypes[4] > 0 ||
        diceTypes[1] > 0 && diceTypes[2] > 0 && diceTypes[3] > 0 && diceTypes[4] > 0 && diceTypes[5] > 0
    ) scoreOptions["largestraight"] = 40;

    scoreOptions["yahtzee"] = 0;
    if(Math.max(...diceTypes) >= 5)
        scoreOptions["yahtzee"] = 50;

    scoreOptions["chance"] = diceSum;

    for(let i in scoreOptions) {
        $(`player${player}score${i}`).innerHTML = scoreOptions[i];
    }
}