function randint(min, max) {
    return Math.floor(Math.random()*max) + min;
}

function clickDie(obj) {
    let rolling = obj.getAttribute("data-rolling") == "true"
    obj.setAttribute("data-rolling", !rolling);
}

function rollDice(player, timeLeft) {
    if(timeLeft == null) timeLeft = 10;

    for(let i = 1; i <= 5; i++) {
        if(document.getElementById(`player${player}die${i}`).getAttribute("data-rolling") == "true")
            document.getElementById(`player${player}die${i}`).firstElementChild.setAttribute("src", `images/${randint(1,6)}.png`);
    }

    if(timeLeft > 0)
        setTimeout(
            () => rollDice(player, timeLeft - 1),
            50
        )
}