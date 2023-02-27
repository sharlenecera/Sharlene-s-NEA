let ws = new WebSocket("ws://localhost:8080");
const clientID = sessionStorage.getItem("clientID");
let game = JSON.parse(sessionStorage.getItem("game"));
const gameID = game.gameID;
const playerName = sessionStorage.getItem("playerName");
let isHost = JSON.parse(sessionStorage.getItem("isHost")).isHost;


let form = document.getElementById("changeSettings");



/*
let numRounds = 0;
let roundLength = 0;
let useCustomWords = false;*/

function getNumRounds() {
    return form["numRounds"].value;
}

function getRoundLength() {
    return form["roundLength"].value;
}

function getUseCustomWords() {
    return form["useCustomWords"].checked; // returns boolean
}



// the change attribute functions will only be used by host so no one else can change them and the update settings methods are only sent to non-host players.

function changeNumRounds() {
    const numRounds = getNumRounds();
    if(ws.readyState === 1){
        ws.send(JSON.stringify({
            method: "changeNumRounds",
            gameID: gameID,
            numRounds: numRounds
        }));
    }
}

function changeRoundLength() {
    const roundLength = getRoundLength();
    if(ws.readyState === 1){
        ws.send(JSON.stringify({
            method: "changeRoundLength",
            gameID: gameID,
            roundLength: roundLength
        }));
    }
}

function changeUseCustomWords() {
    const useCustomWords = getUseCustomWords();
    if(ws.readyState === 1){
        ws.send(JSON.stringify({
            method: "changeUseCustomWords",
            gameID: gameID,
            useCustomWords: useCustomWords
        }));
    }
}

function updatePlayersInLobby(){
    if(ws.readyState === 1){
        ws.send(JSON.stringify({
            method: "updatePlayersInLobby",
            event: "join",
            clientID: clientID,
            gameID: gameID
        }));
    }
}

function displayPlayersInLobby(playersInLobby){ // playersInLobby is a list of the players joined, sent by server when player joined lobby

    const playersDisplay = document.getElementById("playersDisplay");
    playersInLobby.forEach(player => {
        let iconNode = document.createElement("div");
        iconNode.setAttribute("height", "200px");
        iconNode.setAttribute("width", "200px");
        iconNode.innerHTML = player.playerName;

        let eyeStyle = document.createElement("img");
        eyeStyle.setAttribute("src", player.iconObject.eyeStyle);
        eyeStyle.setAttribute("height", "70px");
        eyeStyle.setAttribute("width", "140px");
        eyeStyle.setAttribute("id", "eyeStyle");
        iconNode.appendChild(eyeStyle);

        let mouthStyle = document.createElement("img");
        mouthStyle.setAttribute("src", player.iconObject.mouthStyle);
        mouthStyle.setAttribute("height", "30px");
        mouthStyle.setAttribute("width", "60px");
        mouthStyle.setAttribute("id", "mouthStyle");
        iconNode.appendChild(mouthStyle);
        
        let bodyStyle = document.createElement("img");
        bodyStyle.setAttribute("src", player.iconObject.bodyStyle);
        bodyStyle.setAttribute("height", "170px");
        bodyStyle.setAttribute("width", "230px");
        bodyStyle.setAttribute("id", "bodyStyle");
        iconNode.appendChild(bodyStyle);


        form.appendChild(iconNode);
    });


}

function startGame(){

    //sends all the game settings to the server
    ws.send(JSON.stringify({
        method: "startGame",
        gameID: gameID,
        numRounds: getNumRounds(),
        roundLength: getRoundLength(),
        useCustomWords: getUseCustomWords()
    }))
}



ws.onmessage = message => {
    const msg = JSON.parse(message.data);

    if(msg.method === "joinPrivateGame"){
        const playersDisplay = document.getElementById("playersDisplay");

    } // idk what this is, shoudlnt be here


    // for clients who are not the host:

    if(msg.method === "updateNumRounds"){ //only clients who didnt send the changeNumRounds method are sent this msg (ie. non hosts)
        form["numRounds"].value = msg.numRounds;
    }

    if(msg.method === "updateRoundLength"){ //only clients who didnt send the changeNumRounds method are sent this msg (ie. non hosts)
        form["roundLength"].value = msg.roundLength;
    }

    if(msg.method === "updateUseCustomWords"){ //only clients who didnt send the changeNumRounds method are sent this msg (ie. non hosts)
        form["useCustomWords"].value = msg.useCustomWords;
    }

    //

    if(msg.method === "updatePlayersInLobby"){ // displays the lobby players each time server updates lobby, ie. when other players call the udpate lobby function
        displayPlayersInLobby(msg.playersInLobby);
    }
}



document.addEventListener("DOMContentLoaded", updatePlayersInLobby())
