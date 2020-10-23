# The Quiz Game

![The Quiz Game](assets/img/quizgame.png)

Trivial game (SPA) implementing websocket to incorporate a chat and multiplayer option.

To generate the multiplayer option and chat, we are implementing WebSocket from [achex.ca](http://achex.ca/) (Achex Cloud Server Platform) and the questions are implemented consuming [Open Trivia DB](https://opentdb.com) API

the players session is stored in local storage. As long as the user does not close the browser window, they can continue playing with their username and game statistics.

## The Game

Each game consists of answering five (5) random questions. It can be in Solo mode or in group mode of up to 10 players.

The result of each game is stored and reflected in the ranking of users who are online.

The game has a chat where users can send messages but these will not be stored. In case of refreshing the window, the chat history will be lost.


## Authors

Ezequiel Garay [GitHub](https://github.com/ezemgaray)

Alejando Palomes [GitHub](https://github.com/AlejandroPalomes)



