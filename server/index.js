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
// const { getuid } = require("process");
const WebSocketServer = require("websocket").server;
let connection = null;
let clients = {};
let games = {};

const httpserver = http.createServer((req,res) => {
    console.log("we have received a request");
})

const wss = new WebSocketServer({
    "httpServer": httpserver
})

wss.on("")

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
            
            const client = {
                clientID: messageFromClient.clientID,
                playerName: messageFromClient.playerName,
                iconObject: messageFromClient.iconObject
            }
            games[gameID] = {
                gameID: gameID,
                clients: [client] // adds host to clients list when made
            }

            connection.send(JSON.stringify({
                method: "createPrivateGame",
                game: games[gameID]
            }));
        }
        //make a join game function similar to joinPriavteGame
        
        if(messageFromClient.method === "joinPrivateGame"){
            const gameID = messageFromClient.gameID;
            const game = games[gameID];
            
            // if invalid gameID
            if(games[gameID] === undefined){ 
                clients[messageFromClient.clientID].connection.send(JSON.stringify({
                    method: "joinPrivateGame",
                    result: "fail",
                    reason:  "Invalid game code."
                }))
                return;
            }
            

            //if game full
            if(game.clients.length >= 10){
                clients[messageFromClient.clientID].connection.send(JSON.stringify({
                    method: "joinPrivateGame",
                    result: "fail",
                    reason: "Game full."
                }))
                return;
            }
            game.clients.push({
                clientID: messageFromClient.clientID,
                playerName: messageFromClient.playerName,
                iconObject: messageFromClient.iconObject
            });
            
            game.clients.forEach(eachClient => {
                const client = clients[eachClient.clientID];
                /*if(client.connection.readyState==1){
                    client.connection.send(JSON.stringify({
                        method: "joinPrivateGame",
                        result: "success",
                        game: game
                    }));
                }*/
                client.connection.send(JSON.stringify({
                    method: "joinPrivateGame",
                    result: "success",
                    game: game
                }));
            })
        }

        if(messageFromClient.method === "updatePlayersInLobby"){

            const game = games[gameID];
            
            

            if(messageFromClient.event === "join"){
                //creating new list property called playersInLobby if the first time it's called
                if(games[gameID][playersInLobby] === undefined){
                    games[gameID][playersInLobby] = []; 
                }
                const clientObj = games[gameID].clients[games[gameID].clients.findIndex(x => x.clientID === clientID)]; // finding index of client in game clients list and assigning the object from the list to a variable
                games[gameID][playersInLobby].push(clientObj); 
                
            }
            else if(messageFromClient.event === "exit"){
                //assuming exit method is only used when there are more than 0 players in playersInLobby list.
                const indexInPlayersList = games[gameID][playersInLobby].findIndex(x => x.clientID === clientID); //returns undefined if not found
                //deleting client from players list:
                games[gameID][playersInLobby].splice(indexInPlayersList, 1);
                //deleting client from game clients list:
                const indexInGameClients = games[gameID].clients.findIndex(x => x.clientID === clientID);
                games[gameID].clients.splice(indexInGameClients, 1);

            }
            // sends the updated playersInLobby list to everyon
            if(games[gameID][playersInLobby] > 1){
                game.clients.forEach(eachClient => {
                    const client = clients[eachClient.clientID];
                    if(client.connection.readyState==1){
                        client.connection.send(JSON.stringify({
                            method: "updatePlayersInLobby",
                            playersInLobby: games[gameID][playersInLobby]
                        }));
                    }
                })
            }
        }

        /* not completed

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
        */

        // lobby page

        if(messageFromClient.method === "changeNumRounds"){
            const game = games[messageFromClient.gameID];
            game.clients.forEach(eachClient => {
                const client = clients[eachClient.clientID];
                if(client.connection !== connection && client.connection.readyState==1){
                    const numRounds = messageFromClient.numRounds;
                    client.connection.send(JSON.stringify({
                        method: "updateNumRounds",
                        numRounds: numRounds
                    }));
                }
            })
        }

        if(messageFromClient.method === "changeRoundLength"){
            const game = games[messageFromClient.gameID];
            game.clients.forEach(eachClient => {
                const client = clients[eachClient.clientID];
                if(client.connection !== connection && client.connection.readyState==1){
                    const roundLength = messageFromClient.roundLength;
                    client.connection.send(JSON.stringify({
                        method: "updateRoundLength",
                        roundLength: roundLength
                    }));
                }
            })
        }

        if(messageFromClient.method === "changeUseCustomWords"){
            const game = games[messageFromClient.gameID];
            game.clients.forEach(eachClient => {
                const client = clients[eachClient.clientID];
                if(client.connection !== connection && client.connection.readyState==1){
                    const useCustomWords = messageFromClient.useCustomWords;
                    client.connection.send(JSON.stringify({
                        method: "updateUseCustomWords",
                        useCustomWords: useCustomWords
                    }));
                }
            })
        }

        if(messageFromClient.method === "startGame"){

            // adding a game settings object to the game
            games[messageFromClient.gameID].gameSettings = {
                numRounds: messageFromClient.numRounds,
                roundLength: messageFromClient.roundLength,
                useCustomWords: messageFromClient.useCustomWords
            };

            // sending settings to everyone
            /*
            game.clients.forEach(eachClient => {
                const client = clients[eachClient.clientID];
                if(client.connection.readyState==1){
                    
                    client.connection.send(JSON.stringify({
                        
                    }));
            })
            */

        }
        
    
  });
});


httpserver.listen(8080, () => console.log("My server is listening on port 8080"));
