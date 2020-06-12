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
    ratio: 0 //(this.countGames == 0) ? 0 : ((this.win / this.countGames) * 100)
}

console.log(user)

/**
 * LISTENERS
 */

document.querySelector("#buttonId").addEventListener("click", onSendChat)

function onSendChat() {
    ws.send(`{"to":"quizGame", "user":${JSON.stringify(user)}, "content":"${document.querySelector("#Mensaje").value}", "type":"messageU"}`);
}

window.onbeforeunload = leaveGame;


/**
 * FUNCTIONS
 */

init();


function joinGame() {
    ws = new WebSocket("wss://cloud.achex.ca");
    ws.onopen = function (e) {
        ws.send(`{"setID":"quizGame", "passwd":"12345"}`);

    }
    ws.onmessage = function (response) {
        let responseUser = JSON.parse(response.data);

        if (responseUser.auth == "OK") {
            ws.send(`{"to":"quizGame", "user":"${responseUser.SID}", "type":"connect"}`);
            user.id = responseUser.SID;
            localStorage.setItem("user", JSON.stringify(user))
        }

        switch (responseUser.type) {
            case "connect":
                sendUser(JSON.stringify(user))
                break
            case "messageU":
                printMessage(responseUser.user, responseUser.content)
                break
            case "disconnect":
                sendUser(JSON.stringify(user))
                break
            case "user":
                printUsers(responseUser.user)
                break
        }
    }
    // ws.onclose = function (e) {
    //     console.log("onclose")
    // }
}

function init() {
    if (!user.name.length || !user.name) {
        user.name = prompt("Name:");
    }
    joinGame();
}

function sendUser(user) {
    ws.send(`{"to":"quizGame", "user":${user}, "type":"user"}`);
    users = [];
}

function printUsers(userData) {
    if (userData.name != "" && userData.id != "") {
        users.push({
            name: userData.name,
            userId: userData.id
        });
    }
    console.log(users);
}

function printMessage(user, message) {
    var x = document.createElement("p");
    x.textContent = user.name + ": " + message;
    document.body.append(x);
}

function leaveGame() {
    user.id = ""
    user.name = ""
    ws.send(`{"to":"quizGame", "userId":"", "username":"", "type":"disconnect"}`);
    ws.close();
}