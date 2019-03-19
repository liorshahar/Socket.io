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
let isStart = false;
let lockStart = false;
let record;

let globalStartTime = 0;
/* TODO */
/*
 * List of connected devices and routes
   Check if jump time < start Time
 */

//==========================MQTT==============================================================

// subscribe to the real time stamp of race launch
mqttRouter.subscribe("swimTouch/startTime", function(topic, message) {
  let startTime = new Date().getTime();
  if (isStart && message.toString() === "start") {
    console.log("swimTouch/startTime: " + message.toString());
    globalStartTime = startTime;
    lockStart = true;
  }
});

// subscribe to the real time stamp of race launch
mqttRouter.subscribe("swimTouch/jumpTime", function(topic, message) {
  let jump_time = new Date().getTime();
  if (isStart && record) {
    console.log("swimTouch/jumpTime: " + message.toString());
    let splitMessage = message.toString().split(" ");
    let route = splitMessage[1];
    jump_time = parseFloat((jump_time - globalStartTime) / 1000);
    console.log("jump time: route" + route + ": " + jump_time);
    record.setJumpTime(route, jump_time);
  }
});

// subscribe to messages for wall sensors
mqttRouter.subscribe("swimTouch/WallSensor", function(topic, message) {
  let touch_time = new Date().getTime();
  if (isStart && record) {
    console.log("swimTouch/WallSensor: " + message.toString());
    let splitMessage = message.toString().split(" ");
    let route = splitMessage[1];
    touch_time = parseFloat((touch_time - globalStartTime) / 1000);
    console.log("touch time route" + route + ": " + touch_time);
    record.setResults(route, touch_time);
  }
  // io.sockets.emit("start-swim", record);
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
      if (!isStart) {
        isStart = true;
        record = new Record(training_id, exersice_id);
        mqttClient.publish("swimTouch/start", "start");
      } else {
        console.log("already start");
      }
    } else if (action === "stop") {
      isStart = false;
      if (record) {
        io.sockets.emit("start-swim", record);
        record = null;
      }
      globalStartTime = 0;
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
