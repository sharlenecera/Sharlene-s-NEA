// server js file

function createGuid() {
    const firstPart = Math.floor(Math.random() * Math.pow(16,8)).toString(16);
    const secondPart = Math.floor(Math.random() * Math.pow(16,4)).toString(16);
    const thirdPart = Math.floor(Math.random() * Math.pow(16,4)).toString(16);
    const fourthPart = Math.floor(Math.random() * Math.pow(16,4)).toString(16);
    const fifthPart = Math.floor(Math.random() * Math.pow(16,12)).toString(16);
    const guid = firstPart + '-' + secondPart + '-' + thirdPart + '-' + fourthPart + '-' + fifthPart
    return guid;
}

const http = require("http");
const { getuid } = require("process");
const WebSocketServer = require("websocket").server;
let connection = null;
let clients = [];
let games = []

const httpserver = http.createServer((req,res) => {
    console.log("we have received a request");
})

const wss = new WebSocketServer({
    "httpServer": httpserver
})

wss.on("request", request => {
    const connection = request.accept(null, request.origin);

    const clientID = createGuid();
    clients[clientID] = {
        connection: connection
    }
    connection.send(JSON.stringify({ // maybe put this function and the below function into the function when the connection turns on
        method: "connect",
        clientID: clientID
    }));

    connection.on("open", () => console.log("a new connection has opened!"));


    connection.on('message', message => {

        console.log(`received: ${message.utf8Data}`);
        const messageFromClient = JSON.parse(message.utf8Data);
        if(messageFromClient.method === "message"){  // if the data received is a message,
            clients.forEach(eachClient => { // it will be sent to all the clients apart from the one that sent it
                if(eachClient.connection !== connection && eachClient.connection.readyState==1){ //ready state is 1 when a socket is OPEN and ready to communicate
                    eachClient.send(JSON.stringify({
                        type: "message",
                        messageContent: "message from server it was sent"//messageFromClient.messageContent
                    }));
                }
            })
        }

        // homepage / index

        if(messageFromClient.method === "createPrivateGame"){
            const gameID = createGuid();
            const clientID = messageFromClient.clientID;
            games[gameID] = {
                gameID: gameID,
                clients: []
            }

            connection.send(JSON.stringify({
                method: "createPrivateGame",
                game: games[gameID]
            }));
        }

        if(messageFromClient.method === "joinPrivateGame"){
            const gameID = messageFromClient.gameID;
            const clientID = messageFromClient.clientID;
            const game = games[gameID];
            if(game.clients.length >= 10){
                return;
            }
            game.clients.push({
                clientID: clientID
            });

            game.clients.forEach(eachClient => {
                if(eachClient.connection !== connection && eachClient.connection.readyState==1){
                    clients[eachClient.clientID].connection.send(JSON.stringify({
                        method: "joinPrivateGame",
                        game: game
                    }));
                }
            })
        }

        if(messageFromClient.method === "draw"){
            clients.forEach(eachClient => {
                if(eachClient.connection !== connection && eachClient.connection.readyState==1){
                    eachClient.send(JSON.stringify({
                        method: "drawUpdate",
                        game: {
                            gameID: messageFromClient.messageContent.gameID
                        }
                    }));
                }
            })
        }

        // lobby page

        if(messageFromClient.method === "changeNumRounds"){
            clients.forEach(eachClient => {
                if(eachClient.connection !== connection && eachClient.connection.readyState==1){
                    const numRounds = messageFromClient.numRounds;
                    eachClient.send(JSON.stringify({
                        method: "updateNumRounds",
                        numRounds: numRounds
                    }));
                }
            })
        }

        if(messageFromClient.method === "changeRoundLength"){
            clients.forEach(eachClient => {
                if(eachClient.connection !== connection && eachClient.connection.readyState==1){
                    const roundLength = messageFromClient.roundLength;
                    eachClient.send(JSON.stringify({
                        method: "updateRoundLength",
                        roundLength: roundLength
                    }));
                }
            })
        }

        if(messageFromClient.method === "changeUseCustomWords"){
            clients.forEach(eachClient => {
                if(eachClient.connection !== connection && eachClient.connection.readyState==1){
                    const useCustomWords = messageFromClient.useCustomWords;
                    eachClient.send(JSON.stringify({
                        method: "updateUseCustomWords",
                        useCustomWords: useCustomWords
                    }));
                }
            })
        }
        
    
  });
});


httpserver.listen(8080, () => console.log("My server is listening on port 8080"));
