const io = require("socket.io-client");

// create link
let managerSocket = io.connect("http://127.0.0.1:4004");

// get data
managerSocket.on("welcome", data => {
  console.log(data);
});

// send data
managerSocket.emit("action", "start");
managerSocket.emit("action", "stop");
