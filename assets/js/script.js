// var user = {
//     id: "",
//     name: "",

// }
var ws;
var users = [];
var currGame
var answers
let questionCount = 0 // cuenta ascendente de preguntas, al cargar preguntas que manejar el contador por el length del array de preguntas

var globalInterval
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

var anonymousUser = ["quagga", "kiwi", "nyancat", "dragon", "anteater", "blobfish", "chupacabra", "bat", "ifrit", "kraken", "manatee", "ferret", "llama", "koala", "platypus", "wombat", "iguana", "mink", "narwhal", "liger"];

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
elem("#enterGameBtn").addEventListener("click", showQuestions)
elem("#chatInp").onkeyup = e => {
    if (e.keyCode == 13) onSendChat()
}
elem("#buttonId").addEventListener("click", onSendChat);


window.onbeforeunload = leaveGame;

elem("#imgImport").addEventListener("change", () => {
    var info = elem("#imgImportInfo");
    var file = (elem("#imgImport").files[0]);
    console.log(file)
    info.textContent = truncate(file.name, 25, false);
    info.style = "color: #20C868"
    if (file.size > 40000){
        alert("File too big! Max size: 40kb");
        info.textContent = truncate(file.name, 15, false) + " won't be uploaded";
        info.style = "color: #F52631"
    }
});


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
    msgContent.className = `msg__content p-2 pr-3 ${userData.id == user.id ? "self" : ""}`;

    msgContent.innerHTML = `<b>${userData.name}</b><br>${message}`;

    msg.append(msgUser);
    msg.append(msgContent);
    elem(".chat__box").append(msg);
}

function saveUser() {
    user.name = elem("#usernameInp").value

    if (elem("#imgImport").value.length) {

        var file = (elem("#imgImport").files[0]);
        var reader = new FileReader();

        reader.onloadend = function () {
            (file.size < 40000) ? user.image = reader.result: user.image = `https://ssl.gstatic.com/docs/common/profile/${anonymousUser[Math.floor(Math.random() * (anonymousUser.length))]}_lg.png`;
        }

        if (file) {
            reader.readAsDataURL(file);
        } else {
            user.image = "";
        }
    } else {
        user.image = `https://ssl.gstatic.com/docs/common/profile/${anonymousUser[Math.floor(Math.random() * (anonymousUser.length))]}_lg.png`
    }

    if (user.name.length) {
        joinGame();
    }
}

function truncate(str, n, useWordBoundary) {
    if (str.length <= n) {
        return str;
    }

    var subString = str.substr(0, n - 1);
    return (useWordBoundary ? subString.substr(0, subString.lastIndexOf(" ")) : subString) + " (...)";
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
        setTimeout(()=>{
            if(elem("#chat").classList.contains("open")) elem("#chatInp").focus();
        },1000)
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
    let count = 0
    if (globalInterval) {
        clearInterval(globalInterval)
    }
    globalInterval = setInterval(() => {
        elem("#profileRatio").innerText = count + "%"
        if (count >= user.ratio) clearInterval(globalInterval)
        else count++
    }, 11);
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

function getQuestions(amount = 5) {
    axios
        .get("https://opentdb.com/api.php?difficulty=easy&amount=" + amount)
        .then(function (response) {
            currGame = response.data.results
        })
}

function mixAnswers() {
   answers = currGame[questionCount].incorrect_answers
   answers.push(currGame[questionCount].correct_answer)
   answers.sort(() => Math.random() - 0.5)
}

function showQuestions() {
   elem("#questions").classList.toggle("open")
   getQuestions()
   elem("#questions").addEventListener("transitionend", showCountDown)
}

function showCountDown() {
   let countDown = document.createElement("div")
   countDown.className = "countdown"
   let countNumber = document.createElement("span")
   countNumber.className = "countdown__number"
   countNumber.id = "countdownNumber"
   countDown.append(countNumber)
   elem("#questions").append(countDown)

   if (globalInterval) {
      clearInterval(globalInterval)
   }
   let down = 3
   elem("#countdownNumber").innerText = down
   elem("#countdownNumber").dataset.color = down
   globalInterval = setInterval(() => {
      down -= 1
      elem("#countdownNumber").innerText = down
      elem("#countdownNumber").dataset.color = down
      if (!down) {
         clearInterval(globalInterval)
         countDown.remove()
         showQuestion()
      }
   }, 1000);
   elem("#questions").removeEventListener("transitionend", showCountDown)
}

function showQuestion() {

   if (questionCount + 1 > currGame.length) {
      elem("#questions").classList.toggle("open")
      elem("#question").remove()
      recuento()
      questionCount = 0
      return
   }
   mixAnswers()

   if (elem("#question")) elem("#question").remove()
   elem("#questions").innerHTML = elem("#templateQuestion").innerHTML
   //Insert question
   elem("#question .question__category").innerText = currGame[questionCount].category
   elem("#question .question__number").innerText = (questionCount + 1) + "/" + currGame.length
   elem("#question h2").innerHTML = currGame[questionCount].question
   //Adaptar posibles respuestas en base a la api de preguntas.

   setTimeout(function () {
      elem("#question").classList.toggle("open")
      let buttons = elem(".answers button", true)
      let transition = 0.9
      answers.forEach((btn, index) => {
         let button = document.createElement("button")
         button.className = "question__btn btn-grad"
         button.dataset.answers = index
         button.innerHTML = btn
         elem("#question .answers").append(button)
         button.style.animation = `appear ${transition += 0.2}s ease-in-out forwards`
      })
      questionTime()
   }, 200)
   questionCount++
}

function questionTime() {
   let bar = elem(".seconds")
   barW = bar.parentElement.clientWidth
   wPerSecond = barW / 5 // Divido por la cantidad de segundo para responder
   if (globalInterval) {
      clearInterval(globalInterval)
   }
   let sec = 0
   globalInterval = setInterval(() => {
      barW -= wPerSecond
      if (barW < 0) bar.style.width = "0px"
      else bar.style.width = barW + "px"
      sec++

      if (sec > 5) { // si pasa la cantidad de segundos cierra la pregunta
         clearInterval(globalInterval)

         elem("#question").classList.toggle("open")
         setTimeout(function () {

            bar.removeAttribute("style")
            showQuestion()
         }, 700)
      }
   }, 1000);
}

// simulando la seccion al terminar la partida - definir seccion
function recuento() {
   setTimeout(() => {
      alert("estoy en recuento")
   }, 700);
}

function elem(selector, all = false) {
   return all ? document.querySelectorAll(selector) : document.querySelector(selector)
}
