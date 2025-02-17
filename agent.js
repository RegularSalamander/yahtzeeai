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
            clickScore(`player${turn}score${getBestScore(game.scoreOptions)}`);
        }
    } else if(name == "expectedbestgreedy") {
        if(game.state != "final") {
            setRolling(bestMonteCarlo(1000));
            clickRoll();
        } else {
            clickScore(`player${turn}score${getBestScore(game.scoreOptions)}`);
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

function getBestScore(options) {
    let max = 0;
    let best = "";
    for(let i in options) {
        if(options[i] != null && options[i] >= max) {
            max = options[i];
            best = i;
        }
    }
    return best;
}

function getMaxOfScore(options) {
    let max = 0;
    for(let i in options)
        if(options[i] != null && options[i] >= max)
            max = options[i];
    return max;
}

function holdChoices() {
    if(arguments.length == 5)
        return arguments;
    if(arguments.length == 4)
        return [holdChoices(...arguments, false), holdChoices(...arguments, true)];
    return [...holdChoices(...arguments, false), ...holdChoices(...arguments, true)]
}

function bestMonteCarlo(round1, round2) {
    let simgame = new Yahtzee();
    for(let i in games[turn]) {
        simgame.score[i] = games[turn].score[i];
    }

    let moves = holdChoices();
    let max = 0;
    let bestMove = 0;
    for(let i in moves) {
        let score = 0;
        
        for(let j = 0; j < round1; j++){
            simgame.setDiceManual([...games[turn].dice]);
            simgame.setDiceRandom(moves[i]);
            simgame.calcScores();
            
            score += getMaxOfScore(simgame.scoreOptions);
        }

        if(score >= max) {
            max = score;
            bestMove = i;
        }
    }

    return moves[bestMove];
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