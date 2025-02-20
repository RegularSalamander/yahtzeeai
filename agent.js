const agentInfo = {
    "player": "<b>Player</b>",
    "noopponent": "None",
    "random/random": "<b>Random Random</b> selects dice to roll randomly and selects score randomly.",
    "random/greedy": "<b>Random Greedy</b> selects dice to roll randomly and then selects the highest available score.",
    "best/greedy": "<b>Expected-Best Greedy</b> selects dice to roll to maximize the expected value of the highest available score and then selects the highest available score.",
    "average/greedy": "<b>Expected-Average Greedy</b> selects dice to roll to maximize the expected value of the average of score options and then selects the highest available score."
}

const repeatGame = true;

let gamesCounted = 0;
let averageScore = 0;

const montecarlosearches = 100;

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

    let name1 = name.split("/")[0];
    let name2 = name.split("/")[1];

    if(game.state == "final") {
        if(name2 == "random") {
            let choice = scoreOptions[randint(0, scoreOptions.length-1)];
            clickScore(`player${turn}score${choice}`);
        } else if(name2 == "weighted") {
            clickScore(`player${turn}score${getWeightedRandomScore(game.scoreOptions)}`);
        } else if(name2 == "modweighted") {
            clickScore(`player${turn}score${getWeightedRandomScore(game.scoreOptions, true)}`);
        } else if(name2 == "greedy") {
            clickScore(`player${turn}score${getBestScore(game.scoreOptions)}`);
        }
    } else {
        if(name1 == "random") {
            let toRoll = [false,false,false,false,false]
            for(let i = 0; i < 5; i++) {
                toRoll[i] = Math.random() < 0.5;
            }
            setRolling(toRoll);
            clickRoll();
        } else if(name1 == "best") {
            setRolling(monteCarlo(getMaxOfScore, montecarlosearches));
            clickRoll();
        } else if(name1 == "average") {
            setRolling(monteCarlo(getAverageOfScore, montecarlosearches));
            clickRoll();
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

function getWeightedRandomScore(options, modified) {
    let total = 0;
    let mod = modified ? 1 : 0;

    for(let i in options) {
        if(options[i] != null) {
            total += options[i] + mod;
        }
    }
    let choice = randint(0, total);

    for(let i in options) {
        if(options[i] != null) {
            choice -= options[i] + mod;
            if(choice <= 0) {
                return i;
            }
        }
    }
}

function getMaxOfScore(options) {
    let max = 0;
    for(let i in options)
        if(options[i] != null && options[i] >= max)
            max = options[i];
    return max;
}

function getAverageOfScore(options) {
    let avg = 0;
    let n = 0;
    for(let i in options)
        if(options[i] != null) {
            n++;
            avg = ((avg * (n-1)) + options[i]) / n;
        }
    return avg;
}

function holdChoices() {
    if(arguments.length == 5)
        return arguments;
    if(arguments.length == 4)
        return [holdChoices(...arguments, false), holdChoices(...arguments, true)];
    return [...holdChoices(...arguments, false), ...holdChoices(...arguments, true)]
}

function monteCarlo(func, round1, round2) {
    let simgame = new Yahtzee();
    for(let i in games[turn].score) {
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
            
            score += func(simgame.scoreOptions);
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
    
    if(gamesCounted%100 == 0)
        $(`averagedata2`).innerHTML = `${gamesCounted}    ${Math.round(averageScore*10)/10}`
    $(`averagedata`).innerHTML = `${gamesCounted}    ${Math.round(averageScore*10)/10}`
    setTimeout(resetGame, 0);
}