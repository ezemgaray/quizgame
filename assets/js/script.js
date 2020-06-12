var ws;
// var user = {
//     id: "",
//     name: "",

// }
var users = [];
var user = JSON.parse(localStorage.getItem("user")) || {
    id: "",
    name: "",
    image: "",
    countGames: 0,
    win: 0,
    loose: 0,
    currC: 0,
    currW: 0,
    currR: "",
    ratio: 0//(this.countGames == 0) ? 0 : ((this.win / this.countGames) * 100)
}

/**
 * LISTENERS
 */

document.querySelector("#buttonId").addEventListener("click", onSendChat)
function onSendChat(){
    ws.send(`{"to":"quizGame", "user":"${user.name}", "content":"${document.querySelector("#Mensaje").value}", "type":"messageU"}`);
}

window.onbeforeunload = leaveGame;



/**
 * FUNCTIONS
 */

init()


function joinGame() {
    ws = new WebSocket("wss://cloud.achex.ca");
    ws.onopen = function (e) {
        ws.send(`{"setID":"quizGame", "passwd":"12345", "algo": "hola"}`);

    }
    ws.onmessage = function (response) {
        var responseUser = JSON.parse(response.data);
        if(responseUser.auth == "OK"){
            ws.send(`{"to":"quizGame", "user":"${responseUser.SID}", "type":"connect"}`);
            user.id = responseUser.SID;
            localStorage.setItem("user", JSON.stringify(user))
        }

        if (responseUser.type === "messageU"){
            var x = document.createElement("p");
            x.textContent = responseUser.user +": " + responseUser.content;
            document.body.append(x);
        }else if(responseUser.type === "connect"){

            ws.send(`{"to":"quizGame", "userId":"${user.id}", "username":"${user.name}", "type":"name"}`);
            users = [];
        }else if(responseUser.type === "disconnect" && responseUser.name !== user.name){
            ws.send(`{"to":"quizGame", "userId":"${user.id}", "username":"${user.name}", "type":"name"}`);
            users = [];

        }else if(responseUser.type === "name"){
            if(responseUser.name != "" && responseUser.userId != ""){
                users.push({name:responseUser.username, userId:responseUser.userId});
            }
            console.log(users);
        }
    }
    
    // ws.onclose = function (e) {
    //     console.log("onclose")
    // }
}


function init(){
   if(!user.name.length){
      user.name = prompt("Name:");
   }
   joinGame();
}

function leaveGame(){
    user.id = ""
    user.name =""
    ws.send(`{"to":"quizGame", "userId":"", "username":"", "type":"disconnect"}`);
    ws.close();
}

