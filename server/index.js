// server js file

function createGuid() {
    const firstPart = Math.floor(Math.random() * Math.pow(16, 8)).toString(16);
    const secondPart = Math.floor(Math.random() * Math.pow(16, 4)).toString(16);
    const thirdPart = Math.floor(Math.random() * Math.pow(16, 4)).toString(16);
    const fourthPart = Math.floor(Math.random() * Math.pow(16, 4)).toString(16);
    const fifthPart = Math.floor(Math.random() * Math.pow(16, 12)).toString(16);
    const guid = firstPart + '-' + secondPart + '-' + thirdPart + '-' + fourthPart + '-' + fifthPart
    return guid;
}

//gID = gameID and cID = clientID
function removeClientFromGame(gID, cID) {
    const indexInGameClients = games[gID].clients.findIndex(x => x.clientID === cID);
    games[gID].clients.splice(indexInGameClients, 1);
}

function removeClientFromClients(cID) {
    delete clients[cID];
}

function getWordFromFile(index){
    const node = document.createElement("input");
    node.setAttribute("type", "file");
    node.setAttribute("id", "fileInput");
    node.setAttribute("accept", ".txt");
    node.setAttribute("value", "/words.txt");

    node.style.display = "none";
    document.body.appendChild(node);

    const file = document.getElementById("fileInput");
    console.log(file.files instanceof FileList);

    for(const eachFile of file.files){
        console.log(eachFile.name);
    }
}

// functions ^^

words = ["Stapler", "Desk", "Phone", "Paper", "Light", "Chair", "Notepad", "Binder", "Calculator", "Calendar", "Pens", "Pencils", "Notebook", "Book", "Chairs", "Chairs", "Thermos", "Glue", "Clipboard", "Paperclips", "Chocolate", "Secretary", "Work", "Paperwork", "Workload", "Employee", "Boredom", "Coffee", "Golf", "Laptop", "Sandcastle", "Monday", "Vanilla", "Bamboo", "Sneeze", "Scratch", "Celery", "Hammer", "Frog", "Tennis", "Pants", "Bridge", "Bubblegum", "Bucket", "Skiing", "Sledding", "Snowboarding", "Snowman", "Cream", "Waffle", "Pancakes", "Sundae", "beach", "Sunglasses", "Surfboard", "Watermelon", "Baseball", "Bat", "Ball", "Kiss", "Jellyfish", "Jelly", "Butterfly", "Spider", "Broom", "Spiderweb", "Mummy", "Candy", "Bays", "Squirrels", "Basketball", "Unicorn", "Newspaper", "Girl", "Boy"];
const http = require("http");
// const { getuid } = require("process");
const WebSocketServer = require("websocket").server;
let connection = null;
let clients = {};
let games = {};

const httpserver = http.createServer()

httpserver.listen(8080, () => console.log("My server is listening on port 8080"));

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

    connection.on("close", () => {
        console.log("client disconnected");
    })

    connection.on('message', message => {

        console.log(`received: ${message.utf8Data}`);
        if (message.utf8Data[0] !== "{") {
            return;
        }
        const messageFromClient = JSON.parse(message.utf8Data);

        if (messageFromClient.method === "message") {  // if the data received is a message,
            clients.forEach(eachClient => { // it will be sent to all the clients apart from the one that sent it
                if (eachClient.connection !== connection) { //ready state is 1 when a socket is OPEN and ready to communicate
                    eachClient.send(JSON.stringify({
                        type: "message",
                        messageContent: "message from server it was sent"//messageFromClient.messageContent
                    }));
                }
            })
        }

        // homepage / index ///////////////////////////////////////////////////////////////
        /////////////////////////////////////////////////////////////////////////////////////


        if (messageFromClient.method === "createPrivateGame") {
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
            const con = clients[messageFromClient.clientID].connection;
            const state = con.socket.connecting;
            if (clients[messageFromClient.clientID].connection.socket.connecting == false) {
                connection.send(JSON.stringify({
                    method: "createPrivateGame",
                    gameID: gameID
                }));
            }

        }
        //make a join game function similar to joinPriavteGame


        if (messageFromClient.method === "joinPrivateGame") {
            const gameID = messageFromClient.gameID;
            const game = games[gameID];

            // if invalid gameID
            if (games[gameID] === undefined) {
                clients[messageFromClient.clientID].connection.send(JSON.stringify({
                    method: "joinPrivateGame",
                    result: "fail",
                    reason: "Invalid game code."
                }))
                return;
            }


            //if game full
            if (game.clients.length >= 10) {
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

                client.connection.send(JSON.stringify({
                    method: "joinPrivateGame",
                    result: "success",
                    gameID: gameID
                }));

            })
        }

        // LOBBY PAGE ///////////////////////////////////////////////////////////////////////
        /////////////////////////////////////////////////////////////////////////////////////

        if (messageFromClient.method === "updateClientID") {
            const clientID = messageFromClient.clientID;
            const oldClientID = messageFromClient.oldClientID;
            const gameID = messageFromClient.gameID;

            const client = games[gameID].clients.find(eachClient => eachClient.clientID === oldClientID);
            //changing the client's clientID from the old one to the new one
            client.clientID = clientID;
            removeClientFromClients(oldClientID);
        }

        if (messageFromClient.method === "updatePlayersInLobby") {

            const game = games[messageFromClient.gameID];
            const gameID = messageFromClient.gameID;
            const clientID = messageFromClient.clientID;

            if (messageFromClient.event === "join") {
                //creating new list property called playersInLobby if the first time it's called
                if (games[gameID].playersInLobby === undefined) {
                    games[gameID].playersInLobby = [];
                }
                const clientObj = games[gameID].clients[games[gameID].clients.findIndex(x => x.clientID === clientID)]; // finding index of client in game clients list and assigning the object from the list to a variable
                games[gameID].playersInLobby.push(clientObj);

            }
            else if (messageFromClient.event === "exit") {
                //assuming exit method is only used when there are more than 0 players in playersInLobby list.
                const indexInPlayersList = games[gameID].playersInLobby.findIndex(x => x.clientID === clientID); //returns undefined if not found
                //deleting client from players list:
                games[gameID].playersInLobby.splice(indexInPlayersList, 1);
                //deleting client from game clients list:
                //removeClientFromGame(gameID, clientID); this causes problems later

            }
            // sends the updated playersInLobby list to everyon
            if (games[gameID].playersInLobby.length > 0) {
                game.clients.forEach(eachClient => {
                    const client = clients[eachClient.clientID];
                    client.connection.send(JSON.stringify({
                        method: "updatePlayersInLobby",
                        playersInLobby: games[gameID].playersInLobby
                    }));
                })
            }
        }

        if (messageFromClient.method === "changeNumRounds") {
            const game = games[messageFromClient.gameID];
            game.clients.forEach(eachClient => {
                const client = clients[eachClient.clientID];
                if (client.connection !== connection) {
                    const numRounds = messageFromClient.numRounds;
                    client.connection.send(JSON.stringify({
                        method: "updateNumRounds",
                        numRounds: numRounds
                    }));
                }
            })
        }

        if (messageFromClient.method === "changeRoundLength") {
            const game = games[messageFromClient.gameID];
            game.clients.forEach(eachClient => {
                const client = clients[eachClient.clientID];
                if (client.connection !== connection) {
                    const roundLength = messageFromClient.roundLength;
                    client.connection.send(JSON.stringify({
                        method: "updateRoundLength",
                        roundLength: roundLength
                    }));
                }
            })
        }

        if (messageFromClient.method === "changeUseCustomWords") {
            const game = games[messageFromClient.gameID];
            game.clients.forEach(eachClient => {
                const client = clients[eachClient.clientID];
                if (client.connection !== connection) {
                    const useCustomWords = messageFromClient.useCustomWords;
                    client.connection.send(JSON.stringify({
                        method: "updateUseCustomWords",
                        useCustomWords: useCustomWords
                    }));
                }
            })
        }

        if (messageFromClient.method === "startGame") {
            const gameID = messageFromClient.gameID;

            // adding a game settings object to the game
            games[messageFromClient.gameID].gameSettings = {
                numRounds: messageFromClient.numRounds,
                roundLength: messageFromClient.roundLength,
                useCustomWords: messageFromClient.useCustomWords
            };

            // sending startGame response to everyone
            games[gameID].clients.forEach(eachClient => {
                const numPlayersInLobby = games[gameID].playersInLobby.length; // when people leave, this number goes down so the last person isn't able to "play the game" so I am assigning it to a const
                const client = clients[eachClient.clientID];
                const readyToStart = (numPlayersInLobby === games[gameID].clients.length) && (games[gameID].clients.length > 1);
                client.connection.send(JSON.stringify({
                    method:"startGame",
                    readyToStart: readyToStart,
                    reason: "Cannot start game as either everyone has not joined lobby yet or there is not enough people to start the game (>1)."
                }));
            })

        }

        // GAME PAGE ///////////////////////////////////////////////////////////////////////
        /////////////////////////////////////////////////////////////////////////////////////

        if(messageFromClient.method === "message"){
            const gameID = messageFromClient.gameID;
            const clientID = messageFromClient.clientID;
            games[gameID].clients.forEach(eachClient => {
                const client = clients[clientID];
                client.connection.send(JSON.stringify({
                    method: "message",
                    messageContent: messageFromClient.messageContent
                }));
            });
        }


        /* not completed

        if(messageFromClient.method === "draw"){
            clients.forEach(eachClient => {
                if(eachClient.connection !== connection){
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


    });

});


