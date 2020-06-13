// var user = {
//     id: "",
//     name: "",

// }
var ws;
var users = [];
var currGame
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
elem("#chatInp").onkeyup = e => {
   if (e.keyCode == 13) onSendChat()
}

document.querySelector("#buttonId").addEventListener("click", onSendChat);

window.onbeforeunload = leaveGame;

elem("#imgImport").addEventListener("change", () => {
   var file = (elem("#imgImport").files[0]);
   if (file.size > 40000) alert("File too big! Max size: 40kb");
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
   msgContent.classList.add("msg__content", "p-1");

   msgContent.textContent = message;

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
         (file.size < 40000) ? user.image = reader.result: user.image = `https://ssl.gstatic.com/docs/common/profile/${anonymousUser[Math.floor(Math.random() * (anonymousUser.length))]}_lg.png`; //elem("#imgImport").value = "";
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

function getQuestions(amount = 10) {
   axios
      .get("https://opentdb.com/api.php?amount=" + amount)
      .then(function (response) {
         currGame = response.data.results
      })
}

function showQuestions() {
   elem("#questions").classList.toggle("open")
   let quest = elem("#questions")
   quest.addEventListener("transitionend", showCountDown)
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

// ! ----------------- RESIZING FUNCTIONALITY ------------------- ! \\
/*
var fileinput = document.getElementById('imgImport');

var max_width = fileinput.getAttribute('data-maxwidth');
var max_height = fileinput.getAttribute('data-maxheight');

var preview = document.getElementById('preview');

var form = document.getElementById('form');

function processfile(file) {

    if (!(/image/i).test(file.type)) {
        alert("File " + file.name + " is not an image.");
        return false;
    }
    // read the files
    var reader = new FileReader();
    // reader.readAsArrayBuffer(file);
    reader.readAsDataURL(file);

    reader.onload = function (event) {
        // blob stuff
        var blob = new Blob([event.target.result]); // create blob...
        window.URL = window.URL || window.webkitURL;
        var blobURL = window.URL.createObjectURL(blob); // and get it's URL
        // helper Image object
        var image = new Image();
        // image.src = blobURL;
        // image.src = event.target.result;
        image.src = reader.result;
        //preview.appendChild(image); // preview commented out, I am using the canvas instead
        image.onload = function () {
            // have to wait till it's loaded
            var resized = resizeMe(image); // send it to canvas
            var newinput = document.createElement("input");
            newinput.type = 'hidden';
            newinput.id = "resizedProfilePic"
            newinput.name = 'images[]';
            newinput.value = resized; // put result from canvas into new hidden input
            form.appendChild(newinput);
        }
    };
}

function readfiles(files) {

    // remove the existing canvases and hidden inputs if user re-selects new pics
    var existinginputs = document.getElementsByName('images[]');
    var existingcanvases = document.getElementsByTagName('canvas');
    while (existinginputs.length > 0) { // it's a live list so removing the first element each time
        // DOMNode.prototype.remove = function() {this.parentNode.removeChild(this);}
        form.removeChild(existinginputs[0]);
        preview.removeChild(existingcanvases[0]);
    }

    for (var i = 0; i < files.length; i++) {
        processfile(files[i]); // process each file at once
    }
    //fileinput.value = ""; //remove the original files from fileinput
    // TODO remove the previous hidden inputs if user selects other files
}

// this is where it starts. event triggered when user selects files
fileinput.onchange = function () {
    if (!(window.File && window.FileReader && window.FileList && window.Blob)) {
        alert('The File APIs are not fully supported in this browser.');
        return false;
    }
    readfiles(fileinput.files);
}

// === RESIZE ====

function resizeMe(img) {

    var canvas = document.createElement('canvas');

    var width = img.width;
    var height = img.height;

    // calculate the width and height, constraining the proportions
    if (width > height) {
        if (width > max_width) {
            //height *= max_width / width;
            height = Math.round(height *= max_width / width);
            width = max_width;
        }
    } else {
        if (height > max_height) {
            //width *= max_height / height;
            width = Math.round(width *= max_height / height);
            height = max_height;
        }
    }

    // resize the canvas and draw the image data into it
    canvas.width = width;
    canvas.height = height;
    var ctx = canvas.getContext("2d");
    ctx.drawImage(img, 0, 0, width, height);
    preview.appendChild(canvas); // do the actual resized preview

    return canvas.toDataURL("image/jpeg", 0.7); // get the data from canvas as 70% JPG (can be also PNG, etc.)

}

*/