const io = require("socket.io-client");

socket = io.connect("http://localhost:3000");

socket.emit("welcome", function(data) {
    console.log("Received: " + data);
});

VideoStatus = 0;
VideoTime   = 0;

socket.emit("getTime", VideoTime);
socket.on('getTime', function(data) {
    socket.emit("getTime", VideoTime);
});
socket.on('getStatus', function(data) {
    socket.emit("getStatus", VideoStatus);
});

socket.on('setTime', function(time) {
    VideoStatus = time;
    console.log("time: "+VideoTime);
});
socket.on('setStatus', function(status) {
    VideoStatus = status;
    console.log("time: "+VideoStatus);
});
