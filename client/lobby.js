let ws = new WebSocket("ws://localhost:8080");
const clientID = localStorage.getItem("clientID");
let game = JSON.parse(localStorage.getItem("game"));
const gameID = game.gameID;
let isHost = JSON.parse(localStorage.getItem("isHost")).isHost;


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
    return form["useCustomWords"].checked;
}

function getSettings() {

    numRounds = form["numRounds"].value;
    roundLength = form["roundLength"].value;
    useCustomWords = form["useCustomWords"].checked; //returns boolean
}

function changeNumRounds() {
    const numRounds = getNumRounds();
    if(ws.readyState === 1){
        ws.send(JSON.stringify({
            method: "changeNumRounds",
            numRounds: numRounds
        }));
    }
}

function changeRoundLength() {
    const roundLength = getRoundLength();
    if(ws.readyState === 1){
        ws.send(JSON.stringify({
            method: "changeRoundLength",
            roundLength: roundLength
        }));
    }
}

function changeUseCustomWords() {
    const useCustomWords = getUseCustomWords();
    if(ws.readyState === 1){
        ws.send(JSON.stringify({
            method: "changeUseCustomWords",
            useCustomWords: useCustomWords
        }));
    }
}

ws.onmessage = message => {
    const msg = JSON.parse(message.data);
    if(msg.method === "joinPrivateGame"){
        const playersDisplay = document.getElementById("playersDisplay");

    }

    // for clients who are not the host:

    if(msg.method === "updateNumRounds"){ //only clients who didnt send the changeNumRounds method are sent this msg (ie. non hosts)
        
    }
}

ws.send(JSON.stringify({
    method: "joinLobby"
}));
