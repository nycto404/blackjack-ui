const CARD_SYMBOLS = ["2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K", "A"];
const CARD_TYPES = ["♣", "♦", "♥", "♠"];
const ACE_OF_SPADES = `
.------.
|A     |
|  ♠   |
|     A|
'------'
`;

console.log(ACE_OF_SPADES);

// 1. Choose bet 
// 2. Deal cards when ready (Button)
// 3. Check for Black Jack
// 4. Ask for Insurance if applicable
// 5. Hit, split, double or stand?
// 6. Deal cards to player as wished
// 7. Dealer draws till 17
// 8. Hands are compared
// 9. Payout wins or take bets


// Defining our html elements
const changeBetButton = document.getElementById("change_bet");
const dealButton = document.getElementById("deal_button");
const hitButton = document.getElementById("hit_button");
const doubleButton = document.getElementById("double_button");
const splitButton = document.getElementById("split_button");
const standButton = document.getElementById("stand_button");
// const quitButton = document.getElementById("quit_button");
const resetButton = document.getElementById("reset_button");

const pBalanceLabel = document.getElementById("player_balance");
const dBalanceLabel = document.getElementById("dealer_balance");
const pDiv = document.getElementById("player");
const dDiv = document.getElementById("dealer");
const pHand = document.getElementById("player_hand");
const dHand = document.getElementById("dealer_hand");
const pCardHeader = document.getElementById("player_card_header");
const dCardHeader = document.getElementById("dealer_card_header");
const pHandValue = document.getElementById("player_hand_value");
const dHandValue = document.getElementById("dealer_hand_value");
const history = document.getElementById("history");
const blackJackPara = document.getElementById("blackjack");
const balanceChartCanvas = document.getElementById("balance_chart");

const currentBetLabel = document.getElementById("current_bet");
const newBet = document.getElementById("new_bet");

//const gamePhaseLabel = document.getElementById("game_phase");

// Initial values
let d = null;
let p = null;
let gameCounter = 1;
let games = [];
let balanceHistory = [];
let deck = [];
let blackJack = false;
let winner = "";
let doublePossible = true;
let newCardPossible = true;
let splitPossible = false;
let aceSplit = false;
let bust = false;
let gamePhase = "deal_cards";

// Save default balances on first start
let saveDefaultBalances = () => {
    console.log('saveDefaultBalances')
    if (!localStorage.getItem('playerBalance') || !localStorage.getItem('dealerBalance')) {
        localStorage.setItem('playerBalance', 100);
        localStorage.setItem('dealerBalance', 100);
    }
}

// Save balances to localstorage
let saveBalances = () => {
    console.log('saveBalances')
    localStorage.setItem('playerBalance', p.balance);
    localStorage.setItem('dealerBalance', d.balance);
}

let resetBalances = () => {
    console.log('resetBalances');
    if (confirm('Are you sure you want to reset?')) {
        p.balance = 100;
        d.balance = 100;
        localStorage.setItem('playerBalance', 100);
        localStorage.setItem('dealerBalance', 100);
        updateUI();

    }
    // TODO: Ask for confirmation with alert
}

// Player class
class Player {
    constructor(name, balance, hand, hand_value, bet) {
        this.name = name;
        this.balance = parseInt(balance);
        this.hand = hand;
        this.handValue = hand_value;
        this.bet = bet;
    }
}

// Dealer class
class Dealer {
    constructor(balance, hand, hand_visible, hand_value, hand_value_visible) {
        this.balance = parseInt(balance);
        this.hand = hand;
        this.hand_visible = hand_visible;
        this.handValue = hand_value;
        this.handValueVisible = hand_value_visible;
    }

    // Initialize game
    initializeGame() {
        d.hand = [];
        d.handValue = 0;
        d.handValueVisible = 0;
        p.hand = [];
        p.handValue = 0;
        deck = d.generateDeck();
        blackJack = false;
        winner = "";
        doublePossible = true; // TODO: Maybe put all this stuff also as player attributes in case adding more players later
        newCardPossible = true;
        splitPossible = false;
}

    // Generate a new deck of 52 cards 
    generateDeck() {
        let deck = [];
        for (let card = 0; card < CARD_SYMBOLS.length; card++) {
            deck.push(CARD_SYMBOLS[card] + CARD_TYPES[0]);
            deck.push(CARD_SYMBOLS[card] + CARD_TYPES[1]);
            deck.push(CARD_SYMBOLS[card] + CARD_TYPES[2]);
            deck.push(CARD_SYMBOLS[card] + CARD_TYPES[3]);
          }
          console.log("Deck length: " + deck.length);
          //console.log(deck);
          return deck;
    }

    // Draw a random card from the deck
    drawCard(deck) {
        //console.log(deck);
        console.log("Drawing card...")
        let randomIndex = Math.floor(Math.random() * deck.length);
        let randomCard = deck[randomIndex];
        deck.splice(randomIndex, 1); // Remove the card form the deck
        console.log("New deck lenth: " + deck.length);
        return randomCard;
    }

    // Check if splitting is possible
    checkSplitPossible(hand) {
        let splitPossible = false;
        let aceSplit = false;

        // Check if both card symbols are the same
        if (hand[0][0] == hand[1][0]) {
            splitPossible = true;
        } else {
            splitPossible = false;
        }

        // Chech if both card symbols are an ace
        if (hand[0][0] == "A" && hand[1][0] == "A") {
            aceSplit = true;
        } else {
            aceSplit = false;
        }

        // Wrap it in an array to be able to access both values
        return [splitPossible, aceSplit];
    }

    // Calculate the hand value
    calculateHandValue (hand) {
        let handValue = 0;
        let numAces = 0;

        for (let card of hand) {
            let cardValue;
            
            if (card.includes("J") || card.includes("Q") || card.includes("K") || card.includes("10")) {
                cardValue = 10;
                handValue += cardValue;
            } else if (card.includes("A")) {
                numAces++;
                cardValue = 11;
                handValue += cardValue;
            } else {
                cardValue = parseInt(card);
                handValue += cardValue;
            }

        while (handValue > 21 && numAces > 0) {
            handValue -= 10;
            numAces -= 10;
            }
        }
        return handValue;
    }

    // Check if player has black jack
    checkBlackJack(handValue) {
        console.log("Checking for black jack...")
        let blackJack = false;
        if (handValue == 21) {
            blackJack = true;
        } else {
            blackJack = false;
        }
        console.log("Blackjack: " + blackJack);
        return blackJack;
    }

    // Check for bust
    checkBust(handValue) {
        let bust = false;
        if (handValue > 21) {
            console.log("Bust!");
            bust = true;
        } else {
            bust = false;
        }
        return bust;
    }

    // Compare the hands
    compareHands(dealerHandValue, playerHandValue) {
        let winner = "";
        console.log("Compare hands");
        if (dealerHandValue > playerHandValue && dealerHandValue <= 21) {
            winner = "dealer";
            console.info("Dealer wins! Dealer " + dealerHandValue + ":" + playerHandValue + " Player");
        } else if (dealerHandValue == playerHandValue) {
            winner = "draw";
            console.info("It's a draw! Dealer " + dealerHandValue + ":" + playerHandValue + " Player");
        } else if (playerHandValue > 21) {
            winner = "dealer";
            console.info("Player busted!");
            console.info("Dealer wins! Dealer " + dealerHandValue + ":" + playerHandValue + " Player");
        } else if (dealerHandValue > 21) {
            winner = "player";
            console.info("Dealer busted!");
            console.info("Player wins! Dealer " + dealerHandValue + ":" + playerHandValue + " Player");
        } else if (dealerHandValue < playerHandValue && playerHandValue <= 21) {
            winner = "player";
            console.info("Player wins! Dealer " + dealerHandValue + ":" + playerHandValue + " Player");
        }
        console.log(winner);
        return winner;
    }

    cashTransactions(bet, winner, blackJack) {
        console.log(typeof(parseInt(d.balance)));
        if (winner == "dealer") {
            d.balance += bet;
        } else if (winner == "draw") {
            p.balance += bet;
        } else if (winner == "player" && blackJack === false) {
            p.balance += bet*2;
            d.balance -= bet;
        } else if (winner == "player" && blackJack === true) {
            p.balance += bet*2.5;
            d.balance -= bet*1.5;
        }
    }
}

// Change the bet
function changeBet() {
    console.log("changeBet");
    console.log(newBet.value);
    if (newBet.value === "" || isNaN(newBet.value)) {
        alert('Please enter a number!')
    } else {
        gamePhase = "deal_cards";
        p.bet = parseInt(newBet.value);
        updateUI();
    }
}

function dealCards() {
    // Reset the variables before dealing new cards
    d.initializeGame();

    // Remove bet from player balance
    p.balance -= p.bet;

    // Draw the cards
    d.hand.push(d.drawCard(deck));
    p.hand.push(d.drawCard(deck));
    p.hand.push(d.drawCard(deck));
    d.hand.push(d.drawCard(deck));

    console.log("Dealer hand: " + d.hand);
    console.log("Player hand: " + p.hand);

    d.handValue = d.calculateHandValue(d.hand);
    d.handValueVisible = d.calculateHandValue([d.hand[1]]);
    p.handValue = d.calculateHandValue(p.hand);

    console.log("Dealer hand value: " + d.handValue);
    console.log("Dealer hand value visible: " + d.handValueVisible);
    console.log("Player hand value: " + p.handValue);

    updateUI();

    blackJack = d.checkBlackJack(p.handValue);
    // blackJack = true;

    if (blackJack) {
        winner = "player";
        d.cashTransactions(p.bet, winner, blackJack);
        updateUI();
        gamePhase = "deal_cards";
        displayWinner(winner, blackJack);
    } else {
        gamePhase = "user_action";
        updateUI();
    }
}

// If Hit button pressed
function hit() {
    if (newCardPossible == true) {
        console.log("hit");
        doublePossible = false;
        p.hand.push(d.drawCard(deck));
        p.handValue = d.calculateHandValue(p.hand);
        bust = d.checkBust(p.handValue);
        if (bust == true) {
            winner = "dealer";
            console.info("Player busted!");
            console.info("Dealer wins! Dealer " + d.handValue + ":" + p.handValue + " Player");
            d.cashTransactions(p.bet, winner, blackJack);
            updateUI();
            gamePhase = "deal_cards";
            displayWinner(winner, blackJack);
            console.info("---------------------------------------------------------------------------------------------");
            return
        }
    updateUI();
    gamePhase = "user_action";
    return [p.hand, p.handValue];    
    }
}

// If double pressed
function double(d) {
    console.log("double");
    if (doublePossible == true) {
        p.bet *= 2;
        // Remove the other half of the money from the balance
        p.balance -= p.bet / 2;
        console.log("New bet: " + p.bet);
        hit();
        doublePossible = false;
        newCardPossible = false;
        while (d.handValue < 17) {
            d.hand.push(d.drawCard(deck));
            d.handValue = d.calculateHandValue(d.hand);
        }    
        winner = d.compareHands(d.handValue, p.handValue);
        d.cashTransactions(p.bet, winner, blackJack);
        if (bust === false) {
            updateUI();
        }
        gamePhase = "deal_cards";
        p.bet = p.bet/2; // Reversing bet to previous value
        displayWinner(winner, blackJack);
        } else {
        console.log("Doubling not allowed...");
        alert("Double not allowed...")
    }
}

function split() {
    console.log("split");
    alert("Not implemented yet. Coming soon... :)")
}

function stand(d, deck) {
    console.log("stand");
    while (d.handValue < 17) {
        d.hand.push(d.drawCard(deck));
        d.handValue = d.calculateHandValue(d.hand);
    }
    winner = d.compareHands(d.handValue, p.handValue);
    d.cashTransactions(p.bet, winner, blackJack);
    updateUI();
    gamePhase = "deal_cards";
    displayWinner(winner, blackJack);
    console.info("---------------------------------------------------------------------------------------------");
}

function disableButtons() {
    console.log("Disable buttons...")
    changeBetButton.disabled = true;
    dealButton.disabled = true;
    hitButton.disabled = true;
    doubleButton.disabled = true;
    splitButton.disabled = true;
    standButton.disabled = true;
    // quitButton.disabled = true;
}

function displayWinner(winner, blackJack) {
    disableButtons();
    if (blackJack === true) {
        document.body.style.backgroundColor = "green";
    }
    if (winner === "player") {
        pCardHeader.style.backgroundColor = "green"
        dCardHeader.style.backgroundColor = "red"
    } else if (winner === "dealer") {
        pCardHeader.style.backgroundColor = "red"
        dCardHeader.style.backgroundColor = "green"
    } else {
        pCardHeader.style.backgroundColor = "grey"
        dCardHeader.style.backgroundColor = "grey"
    }
    console.log(p.balance, d.balance);
    setTimeout(function() {
        document.body.style.backgroundColor = "";
        pCardHeader.style.backgroundColor = ""
        dCardHeader.style.backgroundColor = ""
        d.initializeGame();
        updateUI();
    }, 1000);
    addStats();
    saveBalances();
    updateBalanceChart();
}

function addStats() {
    games.push(gameCounter++);
    balanceHistory.push(p.balance);
    console.log(games);
    console.log(balanceHistory);

    return [games, balanceHistory];
}

function updateBalanceChart() {
    balanceChart.data.labels = games;
    balanceChart.data.datasets[0].data = balanceHistory;
    balanceChart.update();
}

function quit() {
    console.log("quit");
}

function updateUI() {
    console.log('updateUI');
    pBalanceLabel.textContent = p.balance;
    dBalanceLabel.textContent = d.balance;
    currentBetLabel.textContent = p.bet;
    //gamePhaseLabel.textContent = gamePhase;

    pHand.textContent = p.hand;
    pHandValue.textContent = p.handValue;

    // If winner is defined, show full hand
    if (winner != "") {
        dHand.textContent = d.hand;
        dHandValue.textContent = d.handValue;
        appendHistory();
    } else {
        dHand.textContent = d.hand[1];
        dHandValue.textContent = d.handValueVisible;
    }


    if (gamePhase === "deal_cards") {
        dHand.textContent = "---";
        pHand.textContent = "---";
        changeBetButton.disabled = false;
        dealButton.disabled = false;
        hitButton.disabled = true;
        doubleButton.disabled = true;
        splitButton.disabled = true;
        standButton.disabled = true;
        // quitButton.disabled = false;
        resetButton.disabled = false;
    } else if (gamePhase === "user_action") {
        changeBetButton.disabled = true;
        dealButton.disabled = true;
        hitButton.disabled = false;
        doubleButton.disabled = false;
        resetButton.disabled = true;

        if (d.checkSplitPossible(p.hand)[0] === true) {
            splitButton.disabled = false;
        } else {
            splitButton.disabled = true;
        }
        standButton.disabled = false;
        // quitButton.disabled = false;
    }
}

// Append the history to an <ol>
function appendHistory() {
    li = document.createElement("li");
    li.textContent = "Winner: " + winner.toUpperCase() + " | Bet: " + p.bet + " | Dealer hand: " + d.hand + " | Player hand: " + p.hand + " | Player balance: " + p.balance;
    history.appendChild(li); 
}

let balanceChart = new Chart(balanceChartCanvas, {
    type: "line",
    data: {
        labels: games,
        datasets: [{
            label: "Player balance history",
            data: balanceHistory,
            fill: false,
            borderColor: "rgb(75, 192, 192",
            tension: 0.1
        }]
    },
    options: {}
});

// Eventhandlers
changeBetButton.addEventListener("click", changeBet);
dealButton.addEventListener("click", dealCards);
hitButton.addEventListener("click", hit);
doubleButton.addEventListener("click", function() {
    double(d);
});
splitButton.addEventListener("click", split);
standButton.addEventListener("click", function() {
    stand(d, deck);
});
splitButton.addEventListener("click", split);
// quitButton.addEventListener("click", quit);
resetButton.addEventListener("click", resetBalances);

saveDefaultBalances();
// Create instances of Dealer and Player
d = new Dealer(localStorage.getItem('dealerBalance'), [], [], 0, 0);
p = new Player("", localStorage.getItem('playerBalance'), [], 0, 10);
updateUI();