const app = require("express")();
const http = require("http").Server(app);
const io = require("socket.io")(http, {
  cors: {
    origin: "*"
  }
});

const getRandomFruitsName = require("random-fruits-name");

// app.get("/", (req, res) => {
//   res.sendFile("/Users/milok/Teacher-Assist/Session21-03/socket-io/index.html");
// });
// io.emit("connection", {
//   someProperty: "some value",
//   otherProperty: "other value"
// });
io.on("connection", socket => {
  //   socket.broadcast.emit("hi");
  let name = getRandomFruitsName("fr");
  socket.broadcast.emit("chat message", name + " is connected");
  socket.broadcast.emit("connection", name + ": Hi there !");
  socket.on("disconnect", () => {
    io.emit("chat message", name + " disconnect");
  });
  socket.on("chat message", msg => {
    io.emit("chat message", name + ": " + msg);
  });
  socket.on("is typing", text => {
    socket.broadcast.emit("is typing", name + " is typing...");
  });

  socket.on("clean alert typing", text => {
    socket.broadcast.emit("clean alert typing");
  });
});

http.listen(process.env.PORT, () => {
  console.log("listening on " + PORT);
});
