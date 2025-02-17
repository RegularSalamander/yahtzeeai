function agentChoose(game, name) {
    if(name == "random") {
        if(game.state != "final") {
            let toRoll = [false,false,false,false,false]
            for(let i = 0; i < 5; i++) {
                toRoll[i] = Math.random() < 0.5;
            }
            setRolling(toRoll);
            clickRoll();
        } else {
            let options = [];
            for(let i in game.scoreOptions) {
                if(game.scoreOptions[i] != null)
                    options.push(i);
            }
            let choice = options[randint(0, options.length-1)];
            clickScore(`player${turn}score${choice}`);
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