//return a random int from min to max inclusive
function randint(min, max) {
    return Math.floor(Math.random()*max) + min;
}

class Yahtzee {
    constructor() {
        this.dice = [6,6,6,6,6];
        this.score = {
            "ones": null,
            "twos": null,
            "threes": null,
            "fours": null,
            "fives": null,
            "sixes": null,
            "threeofakind": null,
            "fourofakind": null,
            "fullhouse": null,
            "smallstraight": null,
            "largestraight": null,
            "yahtzee": null,
            "chance": null,
            "yahtzeebonus": null
        }
        this.totals = {
            "uppertotal": 0,
            "upperbonus": 0,
            "lowertotal": 0,
            "total": 0
        }

        this.state = "initial";
        /*
            gamestates:
            - initial: before first roll
            - first: choose which dice to roll again or choose score
            - second: choose which dice to roll again or choose score
            - final: choose which score to use
        */
    }

    rollDice(whichRolling) {
        if(this.state == "initial") {
            this.setDiceRandom(whichRolling);
            this.state = "first";
        } else if(this.state == "first") {
            this.setDiceRandom(whichRolling);
            this.state = "second";
        } else if(this.state == "second") {
            this.setDiceRandom(whichRolling);
            this.state = "second";
        } else {
            return false;
        }

        this.calcScores();
        return true;
    }

    setDiceManual(arr) {
        this.dice = arr;
    }

    setDiceRandom(whichRolling) {
        for(let i in this.dice) {
            if(!whichRolling[i])
                continue;
            this.dice[i] = randint(1,6);
        }
    }

    setDiceRandomDifferent(whichRolling) {
        for(let i in this.dice) {
            if(!whichRolling[i])
                continue;
            
            let prev = this.dice[i];
            let roll;
            do {
                roll = randint(1, 6);
            } while(roll == prev);
    
            this.dice[i] = roll;
        }
    }

    calcScores() {
        let diceTypes = [0, 0, 0, 0, 0, 0];
        for(let i = 0; i < 5; i++)
            diceTypes[this.dice[i] - 1]++;
        let diceSum = this.dice.reduce((x,y) => x+y);
    
        this.scoreOptions = {};
        
        this.scoreOptions["ones"] = diceTypes[0];
        this.scoreOptions["twos"] = diceTypes[1]*2;
        this.scoreOptions["threes"] = diceTypes[2]*3;
        this.scoreOptions["fours"] = diceTypes[3]*4;
        this.scoreOptions["fives"] = diceTypes[4]*5;
        this.scoreOptions["sixes"] = diceTypes[5]*6;
    
        this.scoreOptions["threeofakind"] = 0;
        if(Math.max(...diceTypes) >= 3)
            this.scoreOptions["threeofakind"] = diceSum;
    
        this.scoreOptions["fourofakind"] = 0;
        if(Math.max(...diceTypes) >= 4)
            this.scoreOptions["fourofakind"] = diceSum;
    
        this.scoreOptions["fullhouse"] = 0;
        if(diceTypes.indexOf(3) >= 0 && diceTypes.indexOf(2) >= 0)
            this.scoreOptions["fullhouse"] = 25;
    
        this.scoreOptions["smallstraight"] = 0;
        if(
            diceTypes[0] > 0 && diceTypes[1] > 0 && diceTypes[2] > 0 && diceTypes[3] > 0 ||
            diceTypes[1] > 0 && diceTypes[2] > 0 && diceTypes[3] > 0 && diceTypes[4] > 0 ||
            diceTypes[2] > 0 && diceTypes[3] > 0 && diceTypes[4] > 0 && diceTypes[5] > 0
        ) this.scoreOptions["smallstraight"] = 30;
    
        this.scoreOptions["largestraight"] = 0;
        if(
            diceTypes[0] > 0 && diceTypes[1] > 0 && diceTypes[2] > 0 && diceTypes[3] > 0 && diceTypes[4] > 0 ||
            diceTypes[1] > 0 && diceTypes[2] > 0 && diceTypes[3] > 0 && diceTypes[4] > 0 && diceTypes[5] > 0
        ) this.scoreOptions["largestraight"] = 40;
    
        this.scoreOptions["yahtzee"] = 0;
        if(Math.max(...diceTypes) >= 5)
            this.scoreOptions["yahtzee"] = 50;
    
        this.scoreOptions["chance"] = diceSum;

        //enable yahtzee bonus only if we have a second yahtzee
        if(this.scoreOptions["yahtzee"] > 0 && this.score["yahtzee"] > 0) {
            this.scoreOptions["yahtzeebonus"] = (this.score["yahtzeebonus"] || 0) + 100;
        }

        for(let i in this.scoreOptions) {
            if(this.score[i] != null && i != "yahtzeebonus") {
                this.scoreOptions[i] = null;
            }
        }
    }

    chooseScore(choice) {
        if(this.state == "initial") return false;
        
        if(this.scoreOptions && this.scoreOptions[choice] != null) {
            this.score[choice] = this.scoreOptions[choice];
        }

        this.state = "initial";
    }

    calcScoreTotals() {
        this.totals["uppertotal"] = 
            this.score["ones"] + this.score["twos"] + this.score["threes"] +
            this.score["fours"] + this.score["fives"] + this.score["sixes"];
        this.totals["upperbonus"] = this.totals["uppertotal"] >= 63 ? 35 : 0;

        this.totals["lowertotal"] =
            this.score["threeofakind"] + this.score["fourofakind"] + this.score["fullhouse"] +
            this.score["smallstraight"] + this.score["largestraight"] + this.score["yahtzee"] +
            this.score["chance"] + this.score["yahtzeebonus"];
        
        this.totals["total"] = 
            this.totals["upperbonus"] + this.totals["uppertotal"] +
            this.totals["lowertotal"];
    }
}