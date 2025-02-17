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
    console.log(obj.id);
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