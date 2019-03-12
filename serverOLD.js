const express = require("express");
const app = express();
const port = 3000;
const http = require("http").createServer();
const io = require("socket.io")(http);
const mqttRouter = require("./mqtt/connection").mqttRouter;
const mqttClient = require("./mqtt/connection").mqttClient;

let realStartTime;
let touchSensorOneTime;
let touchSensorTwoTime;
let stop = false;
let start = false;
let sensorOneIsTouched = false;
let sensorTwoIsTouched = false;
let results = [];

//==========================MQTT==============================================================

// subscribe to messages for client-connected
mqttRouter.subscribe("client-connected", function(topic, message) {
  console.log(
    "received from " + topic + ": " + "client connected-> " + message.toString()
  );
});
// subscribe to messages for start-timestamp
// the real time when the swimmer jump
mqttRouter.subscribe("start-timestamp", function(topic, message) {
  console.log(
    "received from " + topic + ": " + "start-timestamp-> " + message.toString()
  );

  console.log(start);
  results.push({ start: parseInt(message) });
  console.log("get start time from node mcu: " + parseInt(message));
  io.sockets.emit("start-swim", message.toString());
});

// subscribe to messages for touch-time
// from sensor 1
mqttRouter.subscribe("touch-time1", function(topic, message) {
  console.log("received from " + topic + ": " + message.toString());
  results.push({ "touch from sensor1": message.toString() });
});

// subscribe to messages for touch-time
// from sensor 2
mqttRouter.subscribe("touch-time2", function(topic, message) {
  console.log("received from " + topic + ": " + message.toString());
  results.push({ "touch from sensor2": message.toString() });
});

//======================Socket.IO=========================================================

// Io scoket for incoming data from coach html page
io.on("connection", socket => {
  // Event name  //data
  console.log("coach connected to server");
  socket.emit("welcome", "Hello coach and Welcome to Socket.io Server");
  // When coach press start on html page
  socket.on("action", action => {
    console.log("coach press -> " + action);
    if (action === "start") {
      if (!start) {
        start = true;
        mqttClient.publish("swimTouch", "start");
      }
    } else if (action === "stop") {
      start = false;
      mqttClient.publish("swimTouch", "stop");
    }
  });
  // When coach disconnected
  socket.on("disconnect", () => {
    console.log("coach disconnect");
  });
});

http.listen(port, () => {
  console.log("Server is listenin on local host prot: " + port);
});

http.on("error", err => console.log(err));
