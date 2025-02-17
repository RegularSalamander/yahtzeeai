const repeatGame = true;

let gamesCounted = 0;
let averageScore = 0;

function agentChoose(game, name) {
    if(game.state == "initial") {
        clickRoll();
        return;
    }

    let scoreOptions = [];
    for(let i in game.scoreOptions) {
        if(game.scoreOptions[i] != null)
            scoreOptions.push(i);
    }
    if(scoreOptions.length == 0) {
        scoreAverage(game.totals["total"]);
        return;
    }

    if(name == "random") {
        if(game.state != "final") {
            let toRoll = [false,false,false,false,false]
            for(let i = 0; i < 5; i++) {
                toRoll[i] = Math.random() < 0.5;
            }
            setRolling(toRoll);
            clickRoll();
        } else {
            let choice = scoreOptions[randint(0, scoreOptions.length-1)];
            clickScore(`player${turn}score${choice}`);
        }
    } else if(name == "randombest") {
        if(game.state != "final") {
            let toRoll = [false,false,false,false,false]
            for(let i = 0; i < 5; i++) {
                toRoll[i] = Math.random() < 0.5;
            }
            setRolling(toRoll);
            clickRoll();
        } else {
            chooseBestScore(game.scoreOptions);
        }
    }
}

function setRolling(toSet) {
    let whichRolling = [
        $(`player${turn}die0`).getAttribute("data-rolling") == "true",
        $(`player${turn}die1`).getAttribute("data-rolling") == "true",
        $(`player${turn}die2`).getAttribute("data-rolling") == "true",
        $(`player${turn}die3`).getAttribute("data-rolling") == "true",
        $(`player${turn}die4`).getAttribute("data-rolling") == "true"
    ];

    for(let i = 0; i < 5; i++) {
        if(whichRolling[i] != toSet[i]) {
            clickDie(`player${turn}die${i}`);
        }
    }
}

function chooseBestScore(options) {
    let max = 0;
    let best = "";
    for(let i in options) {
        if(options[i] != null && options[i] >= max) {
            max = options[i];
            best = i;
        }
    }
    clickScore(`player${turn}score${best}`);
}

function scoreAverage(score) {
    if(!repeatGame) return;

    if(gamesCounted == 0)
        averageScore = score;
    else
        averageScore = (averageScore * gamesCounted + score)/(gamesCounted + 1);
    gamesCounted++;
    
    console.log(gamesCounted, averageScore);
    setTimeout(resetGame, 100);
}