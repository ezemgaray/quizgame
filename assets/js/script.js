// var user = {
//     id: "",
//     name: "",

// }
var ws;
var users = [];
var currGame
var answers
var selectedAnswers = []
let questionCount = 0 // cuenta ascendente de preguntas, al cargar preguntas que manejar el contador por el length del array de preguntas
let correctAnswers = 0;
let wrongAnswers = 0;
// let totalExperience = 0;

let answerTime = 10; //time to answer the question
let nQuestions = 5; //number of questions

var globalInterval
var user = JSON.parse(localStorage.getItem("user")) || {
    id: "",
    name: "",
    image: "",
    countGames: 0,
    win: 0,
    loose: 0,
    totalC: 0,
    totalW: 0,
    currR: "",
    ratio: 0, //(this.countGames == 0) ? 0 : ((this.win / this.countGames) * 100)
    level: 0,
    experience: 0
}

var anonymousUser = ["quagga", "kiwi", "nyancat", "dragon", "anteater", "blobfish", "chupacabra", "bat", "ifrit", "kraken", "manatee", "ferret", "llama", "koala", "platypus", "wombat", "iguana", "mink", "narwhal", "liger"];

/**
 * LISTENERS
 */

elem("#usernameInp").onkeyup = function (e) {
    if (e.keyCode == 13) saveUser()
}
elem("#usernameBtn").addEventListener("click", saveUser)
elem("#chatBtn").addEventListener("click", () => showChat("small"))
elem("#chatBtn2").addEventListener("click", () => showChat("big"))
elem("#profileBtn").addEventListener("click", showProfile)
elem("#rankingBtn").addEventListener("click", () => showRanking("small"))
elem("#rankingBtn2").addEventListener("click", () => showRanking("big"))
elem("#chatSendBtn").addEventListener("click", () => onSendChat("small"))
elem("#chatSendBtn2").addEventListener("click", () => onSendChat("big"))
elem("#enterGameBtn").addEventListener("click", showQuestions)
elem("#chatInp").onkeyup = e => {
    if (e.keyCode == 13) onSendChat("small");
}
elem("#chatInp2").onkeyup = e => {
    if (e.keyCode == 13) onSendChat("big");
}
elem("#buttonId").addEventListener("click", onSendChat);
elem("#winGraph").addEventListener("mouseover", ()=>showData("winGraph"));
elem("#winGraph").addEventListener("mouseout", ()=>showData("winGraph"));
elem("#winGraph").addEventListener("mousemove", (e)=>moveData(e));
elem("#looseGraph").addEventListener("mouseover", ()=>showData("looseGraph"));
elem("#looseGraph").addEventListener("mouseout", ()=>showData("looseGraph"));
elem("#looseGraph").addEventListener("mousemove", (e)=>moveData(e));
elem("#profileRatio").addEventListener("mouseover", ()=>showData("profileRatio"));
elem("#profileRatio").addEventListener("mouseout", ()=>showData("profileRatio"));
elem("#profileRatio").addEventListener("mousemove", (e)=>moveData(e, "profileRatio"));


window.onbeforeunload = leaveGame;

elem("#imgImport").addEventListener("change", () => {
    var info = elem("#imgImportInfo");
    var file = (elem("#imgImport").files[0]);
    console.log(file)
    info.textContent = truncate(file.name, 25, false);
    info.style = "color: #20C868"
    if (file.size > 40000) {
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
    if (!(elem("#chat--big").classList.contains("open"))) elem("#chatNot--big").classList.remove("d-none");
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
    var msg2 = msg.cloneNode(true);
    elem("#chatBox1").append(msg);
    elem("#chatBox2").append(msg2);
    elem("#chatBox1").scrollTop = elem("#chatBox1").scrollHeight;
    elem("#chatBox2").scrollTop = elem("#chatBox2").scrollHeight;
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
    elem("#confirmN").onclick = ()=>{
        showLogin();
        user.countGames = 0;
        user.totalC = 0;
        user.totalW = 0;
        user.ratio = 0;
        user.win = 0;
        user.loose = 0;
        user.level = 0;
        user.experience = 0;
    }
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
        elem("#winGraph").style.height = Math.floor((user.totalC/(user.totalC+user.totalW))*100) + "%";
        elem("#looseGraph").style.height = Math.floor((user.totalW/(user.totalC+user.totalW))*100) + "%"
    }, 100)
    elem("#menuSmall").classList.replace("d-none", "d-flex");
    elem("#sideMenu").classList.replace("d-md-none", "d-md-flex");
    elem(".main__contentShow").classList.remove("d-none");
}

function showChat(from) {
    if (from === "small") {
        setTimeout(() => {
            elem("#chat").classList.toggle("open");
            elem("#chatNot").classList.add("d-none");
            setTimeout(() => {
                if (elem("#chat").classList.contains("open")) elem("#chatInp").focus();
            }, 1000)
        }, 200);
        elem("#ranking").classList.remove("open");
    } else {
        elem("#chat--big").classList.add("open");
        elem("#chatNot--big").classList.add("d-none");
        elem("#ranking--big").classList.remove("open")
    }
}

function showRanking(from) {
    if (from === "small") {
        setTimeout(() => {
            elem("#ranking").classList.toggle("open");
        }, 200);
        elem("#chat").classList.remove("open");
    } else {
        // elem("#ranking--big").classList.add("open");
        elem("#chat--big").classList.remove("open");
    }
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

function onSendChat(from) {
    ws.send(`{"to":"quizGame", "user":${JSON.stringify(user)}, "content":"${(from === "small") ? elem("#chatInp").value : elem("#chatInp2").value}", "type":"messageU"}`);
    (from === "small") ? elem("#chatInp").value = "": elem("#chatInp2").value = "";
}

function leaveGame() {
    user.id = ""
    user.name = ""
    user.image = ""
    ws.send(`{"to":"quizGame", "userId":"", "username":"", "type":"disconnect"}`);
    ws.close();
}

function getQuestions(amount) {
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
    getQuestions(nQuestions)
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
        checkResults()
        questionCount = 0
        return
    }
    mixAnswers()
    console.log(currGame[questionCount]);
    console.log(answers);

    if (elem("#question")) elem("#question").remove()
    elem("#questions").innerHTML = elem("#templateQuestion").innerHTML
    //Insert question
    elem("#question .question__category").innerText = currGame[questionCount].category
    elem("#question .question__number").innerText = (questionCount + 1) + "/" + currGame.length
    elem("#question h2").innerHTML = currGame[questionCount].question

    setTimeout(function () {
        elem("#question").classList.toggle("open")
        // let buttons = elem(".answers button", true)
        let transition = 0.9
        answers.forEach((btn, index) => {
            let button = document.createElement("button")
            button.className = "question__btn btn-grad"
            button.dataset.answers = index
            button.innerHTML = btn
            elem("#question .answers").append(button)
            button.style.animation = `appear ${transition += 0.2}s ease-in-out forwards`

            button.onclick = () => {
                selectedAnswers.push(btn)
                if (btn == currGame[questionCount - 1].correct_answer) {
                    button.style.backgroundColor = "rgb(32, 200, 104)";
                    correctAnswers++;
                } else {
                    button.style.backgroundColor = "rgb(245, 38, 49)";
                    wrongAnswers++;
                }
                stopQuestion()
                button.disabled = true
                elem("#question .answers button", true).forEach(button => button.disabled = true)
            }
        })
        questionTime()
    }, 200)
    questionCount++
    console.log(selectedAnswers);
}

function questionTime() {
    let bar = elem(".seconds")
    barW = bar.parentElement.clientWidth
    wPerSecond = barW / answerTime // Divido por la cantidad de segundo para responder
    if (globalInterval) {
        clearInterval(globalInterval)
    }
    let sec = 0
    globalInterval = setInterval(() => {
        barW -= wPerSecond
        if (barW < 0) bar.style.width = "0px"
        else bar.style.width = barW + "px"
        sec++

        if (sec > answerTime) { // si pasa la cantidad de segundos cierra la pregunta
            elem("#question .answers button", true).forEach(button => button.disabled = true)
            wrongAnswers++;
            stopQuestion()
        }
    }, 1000);
}

function stopQuestion(next = true) {
    clearInterval(globalInterval)

    setTimeout(() => {
        elem("#question").classList.toggle("open")
        if (next) {
            setTimeout(function () {
                showQuestion()
            }, 700)
        }
    }, 1000);
}

function checkResults() {
    if((correctAnswers/nQuestions)*100 >= 70){
        user.experience++;
        user.win++
    }else{
        user.loose++
    }

    if(user.experience >= user.level && user.experience != 0){
        user.level++;
        user.experience = 0;
    }

    user.countGames++;
    user.totalC += correctAnswers;
    user.totalW += wrongAnswers;
    user.ratio = (Math.floor((user.win/user.countGames)*100));

    showProfileData();
    localStorage.setItem("user", JSON.stringify(user))

    setTimeout(() => {
        showSummary();
        correctAnswers = 0;
        wrongAnswers = 0;
    }, 700);
}

function showSummary(){
    console.log("This is the summary:");
    console.log("user.experience:", user.experience);
    console.log("user.level: ", user.level);
    console.log("user.totalC: ", user.totalC);
    console.log("user.ratio: ", user.ratio);
    console.log("user.countGames: ", user.countGames);
    elem("#summary").classList.toggle("open");
}

function elem(selector, all = false) {
    return all ? document.querySelectorAll(selector) : document.querySelector(selector)
}

function showData(source){
    if(source === "winGraph"){
        elem("#answerPercentage").textContent = Math.floor((user.totalC/(user.totalC+user.totalW))*100) + "%";
        elem("#answerPercentage").style = "color: #20C868;"
        elem("#answerExplain").textContent = "of correct answers";
        
    }else if(source === "profileRatio"){
        elem("#answerPercentage").textContent = user.ratio + "%";
        elem("#answerPercentage").style = "color: #20C868;"
        elem("#answerExplain").textContent = "of won games";
    }else{
        elem("#answerPercentage").textContent = Math.floor((user.totalW/(user.totalC+user.totalW))*100) + "%";
        elem("#answerPercentage").style = "color: #F52631;"
        elem("#answerExplain").textContent = "of wronged answers"
    }
    elem(".resultsScreen").classList.toggle("d-flex");
    elem(".resultsScreen").classList.toggle("d-none");
}

function moveData(e, source){
    var sumX = 0;
    source === "profileRatio" ? sumX = -135 : sumX = 15;
    elem(".resultsScreen").style = `top: ${e.clientY - 85}px; left: ${e.clientX + sumX}px;`
}