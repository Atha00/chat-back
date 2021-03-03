require("dotenv").config();
const app = require("express")();
const http = require("http").Server(app);
const io = require("socket.io")(http, {
  cors: {
    origin: "*"
  }
});

const getRandomFruitsName = require("random-fruits-name");

// io.emit("connection", {
//   someProperty: "some value",
//   otherProperty: "other value"
// });
io.on("connection", socket => {
  let users = [];
  const { name } = socket.handshake.query;
  socket.nickname = name;
  socket.join("room1");
  const clients = socket.adapter.rooms.get("room1");
  // console.log("clients =>", clients);
  for (const clientId of clients) {
    // console.log("verif =>", clientId);
    //this is the socket of each client in the room.
    const clientSocket = io.sockets.sockets.get(clientId);
    users.push(clientSocket.nickname);
  }
  // console.log(users);
  socket.on("user list", () => {
    io.emit("user list", users);
  });
  // console.log(socket.rooms);
  socket.broadcast.emit("connection", name + " is connected");
  // socket.on("name select", name => {
  //     io.emit("name select", name)
  //   })
  socket.on("disconnect", () => {
    console.log(users);
    let index;
    for (let i = 0; i < users.length; i++) {
      if (users[i] === name) {
        index = i;
      }
    }
    users.splice(index, 1);
    console.log(users);
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
  console.log("listening on " + process.env.PORT);
});
