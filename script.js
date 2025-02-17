const $ = (id) => document.getElementById(id);

let turn = 0;
let gameState = "initial"
let currentlyRolling = false;
/*
    gamestates:
    - initial: before first roll
    - firstchoice: choose which dice to roll again or choose score
    - secondchoice: choose which dice to roll again or choose score
    - thirdchoice: choose which score to use
*/

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
    "threeofakind": [null,null],
    "fourofakind": [null,null],
    "fullhouse": [null,null],
    "smallstraight": [null,null],
    "largestraight": [null,null],
    "yahtzee": [null,null],
    "chance": [null,null],
    "yahtzeebonus": [null,null]
}
let otherScores = {
    "uppertotal": [0,0],
    "upperbonus": [0,0],
    "lowertotal": [0,0],
    "total": [0,0]
}

//return a random int from min to max inclusive
function randint(min, max) {
    return Math.floor(Math.random()*max) + min;
}

//handles switching a die from rolling vs held state
function clickDie(obj) {
    //only change dice rolling state in certain gamestates
    if(gameState == "initial")
        return;

    //only move your own dice
    if(turn != parseInt(obj.id.charAt(6)))
        return;

    let rolling = obj.getAttribute("data-rolling") == "true"
    obj.setAttribute("data-rolling", !rolling);
}

//dice rolling logic and animation
function rollDice(timeLeft) {
    //start and end of roll
    if(timeLeft == null) { //start roll animation
        // if(gameState == "thirdchoice" || currentlyRolling)
        //     return; //no rolling allowed
        timeLeft = 10;
        currentlyRolling = true;
    } else if(timeLeft == 0) {
        currentlyRolling = false;
        scoreDice();

        //transition states
        if(gameState == "initial")
            gameState = "firstchoice";
        else if(gameState == "firstchoice")
            gameState = "secondchoice";
        else if(gameState == "secondchoice")
            gameState = "thirdchoice";

        return;
    }

    //randomize dice
    setDiceRandom();

    //continue rolling animation
    setTimeout(
        () => rollDice(timeLeft - 1),
        150 -timeLeft*14
    )
}

//randomly set dice, called multiple times in dice rolling animation
//avoids setting dice to previously rolled side to make the animation look smoother,
//but should disable this behavior if the animation is disabled
function setDiceRandom() {
    for(let i = 0; i < 5; i++) {
        if($(`player${turn}die${i}`).getAttribute("data-rolling") != "true")
            continue;
        
        let prev = diceStates[turn][i];
        let roll;
        do {
            roll = randint(1, 6);
        } while(roll == prev);

        diceStates[turn][i] = roll;
        $(`player${turn}die${i}`).firstElementChild.setAttribute("src", `images/${roll}.png`);
    }
}

//set the image attributes to display dice states
function setDiceImgs() {
    for(let i = 0; i < 5; i++) {
        $(`player0die${i}`).firstElementChild.setAttribute("src", `images/${diceStates[0][i]}.png`);
        $(`player1die${i}`).firstElementChild.setAttribute("src", `images/${diceStates[1][i]}.png`);
    }
}

//calculate scores for current player's dice
function scoreDice() {
    let dice = diceStates[turn];
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

    if(scoreOptions["yahtzee"] && scores.yahtzee[turn] > 0) {
        $(`player${turn}scoreyahtzeebonus`).setAttribute("data-clickable", true);
        scoreOptions["yahtzeebonus"] = (scores["yahtzeebonus"][turn] || 0) + 100;
    } else {
        $(`player${turn}scoreyahtzeebonus`).setAttribute("data-clickable", false);
    }

    scoreOptions["chance"] = diceSum;

    for(let i in scoreOptions) {
        if(scores[i][turn] == null)
            $(`player${turn}score${i}`).innerHTML = scoreOptions[i];
    }

    //edge case for yahtzee bonus, can be filled in multiple times so is not null
    if(scoreOptions["yahtzeebonus"])
        $(`player${turn}scoreyahtzeebonus`).innerHTML = scoreOptions["yahtzeebonus"];
}

//called when a score is clicked, locks in that score
function setScore(obj) {
    //only click squares we've allowed
    if(obj.getAttribute("data-clickable") != "true")
        return;

    //must roll dice before choosing a score
    if(gameState == "initial")
        return;

    //must choose a score for your own turn
    if(turn != parseInt(obj.id.charAt(6)))
        return;

    //remove "playerNscore" from beginning of id
    let scoreChoice = obj.id.substring(12);

    scores[scoreChoice][turn] = parseInt(obj.innerHTML);
    changeTurn();
}

//switch turn and all visual states involved
function changeTurn() {
    //lock in scores
    for(let i in scores) {
        $(`player${turn}score${i}`).setAttribute("data-clickable", false);

        if(scores[i][turn] == null)
            $(`player${turn}score${i}`).innerHTML = "";
    }

    //disable controls
    $(`player${turn}button`).disabled = true;

    //actually swap turn
    turn = 1 - turn;

    //make available scores clickable
    for(let i in scores) {
        if(scores[i][turn] == null)
            $(`player${turn}score${i}`).setAttribute("data-clickable", true);
    }

    //allow roll button
    $(`player${turn}button`).disabled = false;

    //reset all dice positions
    for(let i = 0; i < 5; i++) {
        $(`player0die${i}`).setAttribute("data-rolling", true);
        $(`player1die${i}`).setAttribute("data-rolling", true);
    }

    setScoreTotals(0);
    setScoreTotals(1);

    gameState = "initial";
}

function setScoreTotals(p) {
    otherScores["uppertotal"][p] = 
        scores["ones"][p] + scores["twos"][p] + scores["threes"][p] +
        scores["fours"][p] + scores["fives"][p] + scores["sixes"][p];
    otherScores["upperbonus"][p] = otherScores["uppertotal"][p] > 63 ? 35 : 0;

    otherScores["lowertotal"][p] =
        scores["threeofakind"][p] + scores["fourofakind"][p] + scores["fullhouse"][p] +
        scores["smallstraight"][p] + scores["largestraight"][p] + scores["yahtzee"][p] +
        scores["chance"][p] + scores["yahtzeebonus"][p];
    
    otherScores["total"][p] = 
        otherScores["upperbonus"][p] + otherScores["uppertotal"][p] +
        otherScores["lowertotal"][p];
    

    for(let i in otherScores) {
        $(`player${p}score${i}`).innerHTML = otherScores[i][p];
    }
}