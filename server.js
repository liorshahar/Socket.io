const express = require("express");
const app = express();
const port = 3000;
const http = require("http").createServer();
const io = require("socket.io")(http);
const mqttRouter = require("./mqtt/connection").mqttRouter;
const mqttClient = require("./mqtt/connection").mqttClient;
let Record = require("./utils/recordObject");

let training_id = 1;
let exersice_id = 1;
let isStart = new Boolean(true);
let record = new Record(training_id, exersice_id);
//==========================MQTT==============================================================

// subscribe to the real time stamp of race launch
mqttRouter.subscribe("swimTouch/startTime", function(topic, message) {
  console.log("swimTouch/startTime: " + message.toString());
  let start = parseInt(message);
  // Check if there is any exercise the execute...
  if (isStart && record) {
    record.setStartTime(start);
    console.log("start time-> " + start);
  } else {
    console.log("exersice already start");
  }
});

// subscribe to the real time stamp of race launch
mqttRouter.subscribe("swimTouch/jumpTime", function(topic, message) {
  console.log("swimTouch/jumpTime: " + message.toString());
  let splitMessage = message.toString().split(" ");
  let route = splitMessage[1];
  let jump_time = parseInt(splitMessage[splitMessage.length - 1]);
  record.setJumpTime(route, jump_time);
});

// subscribe to messages for wall sensors
mqttRouter.subscribe("swimTouch/WallSensor", function(topic, message) {
  console.log("swimTouch/WallSensor: " + message.toString());
  let splitMessage = message.toString().split(" ");
  let route = splitMessage[1];
  let touch_time = parseInt(splitMessage[splitMessage.length - 1]);
  record.setResults(route, touch_time);
  io.sockets.emit("start-swim", record);
});

// subscribe to connected new device
mqttRouter.subscribe("swimTouch/nodeMCUConnected", function(topic, message) {
  console.log("swimTouch/nodeMCUConnected: " + message.toString());
});

// subscribe to connected devices log
mqttRouter.subscribe("swimTouch/connectedDevicesLog", function(topic, message) {
  console.log("swimTouch/connectedDevicesLog: " + message.toString());
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
