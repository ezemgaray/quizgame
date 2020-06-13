// var user = {
//     id: "",
//     name: "",

// }
var ws;
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
elem("#chatBtn").addEventListener("click", showChat)
elem("#profileBtn").addEventListener("click", showProfile)
elem("#rankingBtn").addEventListener("click", showRanking)
elem("#chatSendBtn").addEventListener("click", onSendChat)
elem("#chatInp").onkeyup = e => {
    if (e.keyCode == 13) onSendChat()
}

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
            console.log(response)
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
    ws.onclose = function (e) {
        console.log("onclose")
    }
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

function printMessage(userData, message) {
    if (!(elem("#chat").classList.contains("open"))) elem("#chatNot").classList.remove("d-none");
    var msg = document.createElement("div");
    var msgUser = document.createElement("div");
    var msgContent = document.createElement("div");

    msg.className = `msg ${userData.id == user.id ? "sent" : "received"} mb-2 p-1 d-flex justify-content-around`
    msgUser.classList.add("msg__user");
    msgUser.style = `background-image: url(${userData.image}); background-size: cover;`;;
    msgContent.classList.add("msg__content", "p-1");

    msgContent.textContent = message;

    msg.append(msgUser);
    msg.append(msgContent);
    elem(".chat__box").append(msg);
}

function saveUser() {
    user.name = elem("#usernameInp").value
    var file = (elem("#imgImport").files[0]);
    var reader = new FileReader();

    var toCompress = new Image();
    console.log(compress(elem("#imgImport")))
    reader.onloadend = function () {
        // preview.src = reader.result;
        user.image = reader.result;
        toCompress.src = reader.result;
    }

    if (file) {
        reader.readAsDataURL(file);
    } else {
        user.image = "";
    }

    if (user.name.length && file.size < 40000) {
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
    elem("#confirmY").onclick = joinGame
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
    elem("#ranking").classList.remove("open");
    elem("#chat").classList.remove("open");
    showProfileData()
}

function showProfileData() {
    elem("#profileUsername").innerText = user.name
    elem("#profileLevel").innerText = user.win
    elem("#profileId").innerText = user.id
    elem("#profileGames").innerText = user.countGames
    elem(".profile__container__info--img").style = `background-image: url(${user.image}); background-size: cover;`;
    elem("#profileBtn").style = `background-image: url(${user.image}); background-size: cover;`;
    setTimeout(function () {
        animaProfileRatio()
        elem("#winGraph").style.height = "80%"
        elem("#looseGraph").style.height = "55%"
    }, 100)
    elem(".menu").classList.replace("d-none", "d-flex");
}

function showChat() {
    setTimeout(() => {
        elem("#chat").classList.toggle("open");
        elem("#chatNot").classList.add("d-none");
    }, 200);
    elem("#ranking").classList.remove("open");
}

function showRanking() {
    setTimeout(() => {
        elem("#ranking").classList.toggle("open");
    }, 200);
    elem("#chat").classList.remove("open");
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
    ws.send(`{"to":"quizGame", "user":${JSON.stringify(user)}, "content":"${elem("#chatInp").value}", "type":"messageU"}`);
    elem("#chatInp").value = "";
}

function leaveGame() {
    user.id = ""
    user.name = ""
    user.image = ""
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

function questionTime() {
    let clock = document.createElement("div")
    let bar = document.createElement("span")
    clock.appendChild(bar)
    elem("#confirm").appendChild(clock)
    clock.style.cssText = "width: 100%; height: 10px"
    bar.style.cssText = "display: inline-block; width: 100%; height: 100%; background-color: #20C868; transition: all 1s linear"

    barW = bar.clientWidth
    wPerSecond = barW / 30
    let time
    if (time) {
        clearInterval(time)
    }
    time = setInterval(() => {
        barW -= wPerSecond
        bar.style.width = barW + "px"
        if (barW <= 10) {
            clearInterval(time)
        }
    }, 1000);
}
questionTime()

function elem(selector, all = false) {
    return all ? document.querySelectorAll(selector) : document.querySelector(selector)
}

function compress(source_img_obj, quality, maxWidth, output_format) {
    var mime_type = "image/jpeg";
    if (typeof output_format !== "undefined" && output_format == "png") {
        mime_type = "image/png";
    }
    maxWidth = maxWidth || 1000;
    var natW = source_img_obj.naturalWidth;
    var natH = source_img_obj.naturalHeight;
    var ratio = natH / natW;
    if (natW > maxWidth) {
        natW = maxWidth;
        natH = ratio * maxWidth;
    }
    var cvs = document.createElement('canvas');
    cvs.width = natW;
    cvs.height = natH;
    var ctx = cvs.getContext("2d").drawImage(source_img_obj, 0, 0, natW, natH);
    var newImageData = cvs.toDataURL(mime_type, quality / 100);
    var result_image_obj = new Image();
    result_image_obj.src = newImageData;
    return result_image_obj;
}