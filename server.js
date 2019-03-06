const express = require("express");
const app = express();
const port = 3000;
const http = require("http").createServer();
const io = require("socket.io")(http);
const mqttRouter = require("./mqtt/connection").mqttRouter;
const mqttClient = require("./mqtt/connection").mqttClient;

// socket - connection to specific user
io.on("connection", socket => {
  // event name  //data
  console.log("new user connected");
  socket.emit("welcome", "Hello and Welcome to Socket.io Server");
  socket.on("start", action => {
    console.log(action);
    mqttClient.publish("swimTouc", "start");
  });
  socket.on("stop", action => {
    console.log(action);
    mqttClient.publish("swimTouc", "stop");
  });
  socket.on("disconnect", () => {
    console.log("client disconnect");
  });
});

http.listen(port, () => {
  console.log("Server is listenin on local host prot: " + port);
});

http.on("error", err => console.log(err));
