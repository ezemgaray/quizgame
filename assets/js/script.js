var ws;
// var user = {
//     id: "",
//     name: "",

// }
var users = [];
var currGame
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

/**
 * LISTENERS
 */

elem("#usernameInp").onkeyup = function (e) {
    if (e.keyCode == 13) saveUser()
}
elem("#usernameBtn").addEventListener("click", saveUser)

document.querySelector("#buttonId").addEventListener("click", onSendChat)

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
            showProfile()
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
        showLogin()
    } else {
        showConfirmUser()
    }
}

function sendUser(user) {
    users = [];
    ws.send(`{"to":"quizGame", "user":${user}, "type":"user"}`);
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

function saveUser() {
<<<<<<< HEAD
   user.name = elem("#usernameInp").value
   if (user.name.length) {
      joinGame();
      showProfile()
   }
}

function showLogin() {
   let register = elem("#login")
   let confirm = elem("#confirm")
   let profile = elem("#profile")
   register.classList.add("d-flex")
   register.classList.remove("d-none")
   confirm.classList.add("d-none")
   confirm.classList.remove("d-flex")
   profile.classList.add("d-none")
   profile.classList.remove("d-flex")
   elem("#usernameInp").focus()
=======
    user.name = elem("#usernameInp").value
    if (user.name.length) {
        joinGame();
    }
}

function showLogin() {
    let register = elem("#login")
    let confirm = elem("#confirm")
    let profile = elem("#profile")
    register.classList.add("d-flex")
    register.classList.remove("d-none")
    confirm.classList.add("d-none")
    confirm.classList.remove("d-flex")
    profile.classList.add("d-none")
    profile.classList.remove("d-flex")
    elem("#usernameInp").focus()

>>>>>>> 19a7fa3c6987043ed3eecec8e5d6ee105918eeca
}

function showConfirmUser() {
    elem("#name-confirm").innerText = `"${user.name}"`
    let register = elem("#login")
    let confirm = elem("#confirm")
    let profile = elem("#profile")
    register.classList.remove("d-flex")
    register.classList.add("d-none")
    confirm.classList.remove("d-none")
    confirm.classList.add("d-flex")
    profile.classList.add("d-none")
    profile.classList.remove("d-flex")
    elem("#confirmN").onclick = showLogin
    elem("#confirmY").onclick = showProfile
}

function showProfile() {
    let register = elem("#login")
    let confirm = elem("#confirm")
    let profile = elem("#profile")
    register.classList.remove("d-flex")
    register.classList.add("d-none")
    confirm.classList.add("d-none")
    confirm.classList.remove("d-flex")
    profile.classList.remove("d-none")
    profile.classList.add("d-flex")
    showProfileData()
}

function showProfileData() {
    elem("#profileUsername").innerText = user.name
    elem("#profileLevel").innerText = user.win
    elem("#profileId").innerText = user.id
    elem("#profileGames").innerText = user.countGames
    setTimeout(function () {
        animaProfileRatio()
        elem("#winGraph").style.height = "80%"
        elem("#looseGraph").style.height = "55%"
    }, 100)
}

function animaProfileRatio() {
    let inter
    let count = 0
    if (!inter) {
        clearInterval(inter)
        inter = setInterval(() => {
            elem("#profileRatio").innerText = count + "%"
            if (count >= user.ratio) clearInterval(inter)
            else count++
        }, 11);
    }
}

function onSendChat() {
    ws.send(`{"to":"quizGame", "user":${JSON.stringify(user)}, "content":"${document.querySelector("#Mensaje").value}", "type":"messageU"}`);
}

function leaveGame() {
    user.id = ""
    user.name = ""
    ws.send(`{"to":"quizGame", "userId":"", "username":"", "type":"disconnect"}`);
    ws.close();
}

function getQuestions(amount = 10) {
    axios
        .get("https://opentdb.com/api.php?amount=" + amount)
        .then(function (response) {
            currGame = response.data.results
        })
}

function questionTime(){
   let clock = document.createElement("div")
   let bar = document.createElement("span")
   clock.appendChild(bar)
   elem("#confirm").appendChild(clock)
   clock.style.cssText="width: 100%; height: 10px"
   bar.style.cssText = "display: inline-block; width: 100%; height: 100%; background-color: #20C868; transition: all 1s linear"

   barW = bar.clientWidth
   wPerSecond = barW / 30
   let time
   if(time){
      clearInterval(time)
   }
   time = setInterval(() => {
      barW -= wPerSecond
      bar.style.width = barW + "px"
      if(barW <= 10) {
         clearInterval(time)
      }
   }, 1000);
}
questionTime()

function elem(selector, all = false) {
    return all ? document.querySelectorAll(selector) : document.querySelector(selector)
}