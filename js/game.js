const inputBid = document.querySelector('#bid');
const spanGameResult = document.querySelector('#game-result');
const spanWallet = document.querySelector('#wallet');
const spanGamesTotal = document.querySelector('#games-total');
const spanGamesWon = document.querySelector('#games-won');
const spanGamesLost = document.querySelector('#games-lost');
const playBtn = document.querySelector('#play');


// initial fields and drums values
const initFields = ['mailchimp', 'jenkins', 'grunt', 'the-red-yeti', 'optin-monster'];
const initDrums = [];
for (let i=0; i<3; i++) {
    initDrums.push(initFields);
}


// move all drums to the top
const drums = [...document.querySelectorAll('.drum .drum-wrap')];
const fieldHeight = document.querySelector('.drum .drum-wrap .field').offsetHeight;
const fieldCounter = initFields.length - 1;
drums.forEach(drum => {
    drum.style.transitionDuration = '0s';
    drum.style.top = `-${fieldCounter * fieldHeight}px`;
})


const rollDrums = (fieldCounter) => {
    const drums = [...document.querySelectorAll('.drum .drum-wrap')]
    
    // move all drums to the top
    drums.forEach(drum => {
        drum.style.transitionDuration = '0s';
        drum.style.top = '0px';
    })
    
    // slide drums to last field
    // setTimeout 1ms not to overlap with previous movement
    // setInterval 100ms to slide drums with intervals
    setTimeout(function() {
        const fieldHeight = document.querySelector('.drum .drum-wrap .field').offsetHeight;
        let i = 0;
        const slide = setInterval(function(){
            if (i < drums.length) {
                drums[i].style.transitionDuration = '1s';
                drums[i].style.top = `-${(fieldCounter - 1) * fieldHeight}px`;
                i++;
            } else {
                clearInterval(slide);
                return;
            }
        }, 100);
    }, 1);

}


class Wallet {
    constructor(money) {
        let _money = money;
        this.getWalletValue = () => _money;
        this.canPlay = (value) => _money >= value;
        this.changeWallet = (value, result) => {
            switch (result) {
                case 10:
                case 3:
                    _money += value;
                    break;
                case false:
                    _money -= value;
                    break;
                default:
                    break;
            }
        }
    }
}

class Statistics {
    constructor() {
        this.gameResults = [];
    }
    showGamesStats() {
        
        //count game stats
        let gamesTotal = this.gameResults.length;
        let gamesWon = (this.gameResults.filter(result => result.win)).length;
        let gamesLost = gamesTotal - gamesWon;
        
        return [gamesTotal, gamesWon, gamesLost];
    }
    addGame(win, bid) {
        
        let gameResult = {
            win: win,
            bid: bid
        }

        this.gameResults.push(gameResult);
        this.showGamesStats();
    }
}

class Draw {
    constructor() {
        this.options = initDrums[0];
        let _results = [];
        
        const drums = [...document.querySelectorAll('.drum')];
        
        for (let i=0; i<drums.length; i++) {
            const result = this.drawResult()
            _results.push(result);
        }
        
        this.getDrawResults = () => {
            return _results;
        }
    }
    drawResult() {
        let fields = [];
        
        const generateField = () => {
            return Math.floor(Math.random()*this.options.length);
        }
        for (let i=0; i<this.options.length; i++) {
            const generatedField = generateField();
            fields.push(this.options[generatedField]);
        }
        
        return fields;
    }
}

class Result {
    static moneyWon(result, bid) {
        return result * bid;
    }
    static checkWin(draw) {
        if (draw[0] === draw[1] && draw[1] === draw[2]) {
            return 10;
        }
        else if (draw[0] === draw[1] || draw[0] === draw[2] || draw[1] === draw[2]) {
            return 3;
        }
        else return false;
    }
}

class Game {
    constructor(startWallet) {
        this.stats = new Statistics();
        this.wallet = new Wallet(startWallet);
        this.lastDraw = [initFields[initFields.length-1], initFields[initFields.length-1], initFields[initFields.length-1]];
        
        document.querySelector('#play').addEventListener('click', this.startGame.bind(this));
                
        this.drums = [...document.querySelectorAll('.carousel .drum')];
        
        this.render();
    }
    render(drums = initDrums, result = '', gameStats = [0,0,0], bid = 0, wonMoney = 0) {

        playBtn.style.backgroundColor = '#222';
        
        this.drums.forEach((drum, drumIndex) => {
            const fields = [...document.querySelectorAll('#drum-' + (drumIndex + 1) + ' .field')];
            const drumWrap = document.querySelector('#drum-' + (drumIndex + 1) + ' .drum-wrap');
            drumWrap.innerHTML = '';
            
            for(let i=0; i<initFields.length; i++) {
                const newField = document.createElement('div');
//                console.log(drums[drumIndex][i]);
                newField.classList.add('field');
                newField.classList.add(`field-${drums[drumIndex][i]}`);
                newField.innerHTML = `<i class="fab fa-5x fa-${drums[drumIndex][i]}"></i>`;
                drumWrap.appendChild(newField);
            }
        })
        
        if(this.stats.showGamesStats()[0] == 0) {
            spanWallet.textContent = this.wallet.getWalletValue();
            console.log(spanWallet);
            spanGamesTotal.textContent = gameStats[0];
            spanGamesWon.textContent = gameStats[1];
            spanGamesLost.textContent = gameStats[2];
        }
        
        // only if it's not a first game
        if(this.stats.gameResults.length) {
            // setTimeout not to display results before draw
            setTimeout (function(){
                if(result) {
                    result = `You won ${wonMoney}$!`;
                    playBtn.style.backgroundColor = 'darkgreen';
                }
                else {
                    result = `You lost ${bid}$`;
                    playBtn.style.backgroundColor = 'darkred';
                }
                spanWallet.textContent = this.wallet.getWalletValue();
                spanGameResult.textContent = result;
                spanGamesTotal.textContent = gameStats[0];
                spanGamesWon.textContent = gameStats[1];
                spanGamesLost.textContent = gameStats[2];
            }.bind(this), 1200);
        }
    }
    startGame() {
        const bid = Math.floor(inputBid.value);
        
        if (bid == '' || bid < 1) {
            alert('Set your bid properly');
            return;
        }
        
        if(!this.wallet.canPlay(bid)){
            alert('You don\'t have enough money');
            return;
        }
        this.wallet.changeWallet(bid, false);
        
        
        // create a table of last drawn icons
        const drums = [...document.querySelectorAll('.drum-wrap')];
        const icons = [];
        for (let i=0; i<this.lastDraw.length; i++) {
            icons.push(this.lastDraw[i]);
        }
        
        
        // draw new results and push final results to endFields[]
        const draw = new Draw();
        const drawResults = draw.getDrawResults();
        const endFields = [];
        drawResults.forEach((result, index) => {
            endFields.push(drawResults[index][drawResults[index].length-1]);
        });
        
        const result = Result.checkWin(endFields);
        this.stats.addGame(result, bid);
        const gameStats = this.stats.showGamesStats();
        
        let wonMoney = Result.moneyWon(result, bid);
        
        this.wallet.changeWallet(wonMoney, result);
        
        this.render(drawResults, result, gameStats, bid, wonMoney );
        
        
        // insert last draw results to beggining of drum nodes
        drums.forEach((drum, index) => {
            const icon = icons[index];
            const newField = document.createElement('div');
            newField.classList.add('field');
            newField.classList.add(`field-${icon}`);
            newField.innerHTML = `<i class="fab fa-5x fa-${icon}"></i>`;
            drum.insertBefore(newField, drum.childNodes[0]);
        });
        
        
        // roll drums
        const fieldCounter = [...document.querySelectorAll('.drum-wrap .field')].length / 3;
        rollDrums(fieldCounter);
        
        
        // clear lastDraw and push results from current draw
        this.lastDraw.length = 0;
        drawResults.forEach((result, index) => {
            this.lastDraw.push(drawResults[index][drawResults[index].length-1]);
        });
    }
}

let game = new Game(200);