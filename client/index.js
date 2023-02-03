let ws = new WebSocket("ws://localhost:8080");
        
        const eyes = ["eyes_1.png", "eyes_2.png", "eyes_3.png"];
        const mouths = ["mouth_1.png", "mouth_2.png", "mouth_3.png", "mouth_4.png"];
        const bodies = ["body_1.png", "body_2.png", "body_3.png", "body_4.png", "body_5.png", "body_6.png"];


        /*The below functions change the picture between the arrows in the custmoise icon box*/

        function findInStyleList(source,styleList){
            for(let i=0; i<styleList.length; i++){
                if(source === styleList[i]){
                    return i;
                }
            }
            return -1; // if not found, -1 is returned
        }

        function traverse(currentPosition, direction, iconStyles){ // for moving along the circular queues for each of the icon styles 
            const queueLength = iconStyles.length;
            if(direction === "left"){
                if(currentPosition===0){
                    return queueLength-1; // moves pointer to the end of the queue
                }
                return currentPosition -1; // decrements pointer

            }
            else if(direction === "right"){
                if(currentPosition === queueLength-1){
                    return 0; // moves pointer back to start
                }
                return currentPosition +1; // increments pointer
                
            }
        }

        function changeStyle(direction, style){
            let currentImageSource = document.getElementById(style).src;
            let currentImageSourceRoot = null;
            let currentImageSourceFile = null;
            styleList = null;
            //setting styleList variable in terms of which style it is
            if(style==="eyeStyle"){ 
                styleList = eyes;
                currentImageSourceRoot = currentImageSource.substring(0, currentImageSource.length - 10);
                currentImageSourceFile = currentImageSource.substring(currentImageSource.length - 10,currentImageSource.length);
            }
            else if(style === "mouthStyle"){
                styleList = mouths;
                currentImageSourceRoot = currentImageSource.substring(0, currentImageSource.length - 11);
                currentImageSourceFile = currentImageSource.substring(currentImageSource.length - 11,currentImageSource.length);
            }
            else{ //for body style
                styleList = bodies;
                currentImageSourceRoot = currentImageSource.substring(0, currentImageSource.length - 10);
                currentImageSourceFile = currentImageSource.substring(currentImageSource.length - 10,currentImageSource.length);
            }
            let position = findInStyleList(currentImageSourceFile, styleList);

            if(position >=0){
                position = traverse(position, direction, styleList);
                const newSource =  styleList[position];
                document.getElementById(style).src = "images/"+ newSource;
            }
            else{
                console.log("Image index in eyes array not valid, it is less than 0."); // shows error if eyePosition is <0
            }
        }

        function leftEyes() {
            changeStyle("left", "eyeStyle");
        }

        function rightEyes() {
            changeStyle("right", "eyeStyle");
        }

        function leftMouth() {
            changeStyle("left", "mouthStyle");
        }

        function rightMouth() {
            changeStyle("right", "mouthStyle");
        }

        function leftBody() {
            changeStyle("left", "bodyStyle");
        }

        function rightBody() {
            changeStyle("right", "bodyStyle");
        }

        
        /*The below functions are for the play game and play private game buttons*/


        function createGuid() {
        const firstPart = Math.floor(Math.random() * Math.pow(16,8)).toString(16);
        const secondPart = Math.floor(Math.random() * Math.pow(16,4)).toString(16);
        const thirdPart = Math.floor(Math.random() * Math.pow(16,4)).toString(16);
        const fourthPart = Math.floor(Math.random() * Math.pow(16,4)).toString(16);
        const fifthPart = Math.floor(Math.random() * Math.pow(16,12)).toString(16);
        const guid = firstPart + '-' + secondPart + '-' + thirdPart + '-' + fourthPart + '-' + fifthPart
        return guid;
        }

        ws.onmessage = message => {
            const msg = JSON.parse(message.data);
            if(msg.method === "connect"){
                const clientID = msg.clientID;
                localStorage.setItem("clientID", clientID);
            }
            if(msg.method === "createPrivateGame"){
                const game = msg.game;
                localStorage.setItem("game", JSON.stringify(game));
                console.log("game ID set: " + game.gameID);
                window.location.href = "lobby.html";
            }
            if(msg.method === "joinPrivateGame"){
                localStorage.setItem("game", message.data.game);
                window.location.href = "lobby.html";

            }
        }
        
        function playPublicGame() {
            //need to assign gameID in local storage and check which games they can join
            window.location.href = "gamepage.html"; // redirects user to game
        }

        function createPrivateGame(){
            const clientID = localStorage.getItem("clientID");
            if(ws.readyState === 1){
                ws.send(JSON.stringify({
                method: "createPrivateGame",
                clientID: clientID,
                host: clientID
                }));
                localStorage.setItem("isHost", JSON.stringify({
                    isHost: true
                }));
            }
            
        }

        function joinWithCode(){ // called when send message button is clicked
            const joinWithCodeBox = document.getElementById("joinWithCodeBox");
            const joinCode = joinWithCodeBox.value;

            if(message === ""){
                alert("Error. No code entered.");
            }
            else{
                ws.send(JSON.stringify({
                    method: "joinPrivateGame",
                    clientID: clientID,
                    gameID: joinCode
                }));
                messageBox.value = "";
            }
        }
