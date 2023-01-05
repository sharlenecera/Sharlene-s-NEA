// server js file

const http = require("http");
const WebSocketServer = require("websocket").server;
let connection = null;

const httpserver = http.createServer((req,res) => {
    console.log("we have received a request");
})

const wss = new WebSocketServer({
    "httpServer": httpserver
})

wss.on("request", request => {
    connection = request.accept(null, request.origin);
    connection.on('message', message => {
        console.log(`received: ${message.utf8Data}`);
        const messageFromClient = JSON.parse(message);
        if(messageFromClient.type === "message"){  // if the data received is a message,
            wss.clients.forEach(eachClient => { // it will be sent to all the clients apart from the one that sent it
                if(/*eachClient !== connection &&*/ eachClient.readyState==1){ //ready state is 1 when a socket is OPEN and ready to communicate
                    eachClient.send(JSON.stringify({
                        "type": "message",
                        "messageContent": "message from server it was sent"//messageFromClient.messageContent
                    }));
                }
        })
    }
    
    
  });
});


httpserver.listen(8080, () => console.log("My server is listening on port 8080"));
