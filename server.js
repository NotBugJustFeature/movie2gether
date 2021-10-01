const   express     =   require("express"),
        app         =   express(),
        port        =   3000,
        server      =   require("http").createServer(app),
        VideoServer =   require("http"),
        fs          =   require("fs"),
        io          =   require("socket.io")(server),
        url         =   require("url"),
        path        =   require("path");

clients = []
count = 0;

debug = true

VideoStatus = false;
VideoTime   = 5;

io.on("connection", (socket) => {
    socket2 = socket

    clients[count] = socket.id
    if(debug)console.log(count+1 + ". client connected " + clients[count] )
    count++;
    console.log(count)
    if(count == 1){
        socket2.id = clients[0]
        console.log("primary sent: "+clients[0])
        socket2.emit("setPrimary")
    }

    socket.on("disconnect", () => {
        count--;
        for(i = 0; i < clients.length; i++){
            if(clients[i] == socket.id) {clients.splice(i, 1)}
        }
        if(debug)console.log("a client disconnected")
        console.log("i :"+i)
        if(clients.length > 0) {
            console.log("primary exit"); socket2.id = clients[0]; socket2.emit("setPrimary");
        }
    })

    socket.on('getStatus', (status) => {
        VideoStatus = status
    })

    socket.on('setTimeBackup', (time) => {
        VideoTime = time
    })

    socket.on('setTime', (time) => {
        VideoTime = time
        socket.broadcast.emit("setTime", time)
    })
    socket.on('setStatus', (status) => {
        if(!VideoStatus == status){
            VideoStatus = status
            socket.broadcast.emit("setStatus", VideoStatus)
        }
    })
    
    socket.on('getTimeFromServer', (plus = 0) => {
        socket.emit('getTimeFromServer', VideoTime+plus)
    })

    socket.on('getStatusFromServer', () => {
        socket.emit('getStatusFromServer', VideoStatus)
    })
})



app.get("/", function(req, res){
    res.sendFile('index.html',{root: path.join(__dirname, './')})
})

app.use(express.static(path.join(__dirname, '')))

server.listen(port, () => {
    console.log("server listening on port: "+port)
});

VideoServer.createServer(function (req, res) {
    var file = path.resolve(__dirname, req.url.substring(1, req.url.length))
    fs.stat(file, function(err, stats) {
      if (err) {
        if (err.code === 'ENOENT') {
          // 404 Error if file not found
          return res.sendStatus(404)
        }
      res.end(err)
      }
      var range = req.headers.range
      if (!range) {
       // 416 Wrong range
       return res.sendStatus(416)
      }
      var positions = range.replace(/bytes=/, "").split("-")
      var start = parseInt(positions[0], 10)
      var total = stats.size
      var end = positions[1] ? parseInt(positions[1], 10) : total - 1
      var chunksize = (end - start) + 1

      res.writeHead(206, {
        "Content-Range": "bytes " + start + "-" + end + "/" + total,
        "Accept-Ranges": "bytes",
        "Content-Length": chunksize,
        "Content-Type": "video/mp4"
      });

      var stream = fs.createReadStream(file, { start: start, end: end })
        .on("open", function() {
          stream.pipe(res)
        }).on("error", function(err) {
          res.end(err)
        });
    });
}).listen(8888);
