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
    connection = request.accept(null, request.origin);
    const clientID = createGuid();
    let clientObject = {
        clientID: clientID,
        method: "connect"
    }
    clients.push(clientObject);

    connection.on("open", () => console.log("a new connection has opened!"));

    connection.send(JSON.stringify({ // maybe put this function and the below function into the function when the connection turns on
        clientID: clientID
    }))


    
    connection.on('message', message => {

        console.log(`received: ${message.utf8Data}`);
        const messageFromClient = JSON.parse(message.utf8Data);
        if(messageFromClient.type === "message"){  // if the data received is a message,
            clients.forEach(eachClient => { // it will be sent to all the clients apart from the one that sent it
                if(/*eachClient.connection !== connection &&*/ eachClient.connection.readyState==1){ //ready state is 1 when a socket is OPEN and ready to communicate
                    eachClient.send(JSON.stringify({
                        "type": "message",
                        "messageContent": "message from server it was sent"//messageFromClient.messageContent
                    }));
                }
            })
        }
        else if(messageFromClient.type === "createGame"){
            const newGame = {
                gameID: messageFromClient.gameID,
                gameClients: [messageFromClient.clientID]
            }
        }
    
  });
});


httpserver.listen(8080, () => console.log("My server is listening on port 8080"));
