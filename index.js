require("dotenv").config();
const app = require("express")();
const http = require("http").Server(app);
const io = require("socket.io")(http, {
  cors: {
    origin: "*"
  }
});

// io.emit("connection", {
//   someProperty: "some value",
//   otherProperty: "other value"
// });
io.on("connection", socket => {
  let users = [];
  const { name } = socket.handshake.query;
  socket.nickname = name;
  socket.join("room1");
  // console.log(socket.rooms);
  const clients = socket.adapter.rooms.get("room1");

  for (const clientId of clients) {
    //this is the socket of each client in the room.
    const clientSocket = io.sockets.sockets.get(clientId);

    users.push({ name: clientSocket.nickname, id: clientSocket.id });
  }

  socket.on("incoming user", () => {
    io.emit("added entry to userList", users);
  });

  socket.broadcast.emit("connection", name + " is connected");

  socket.on("chat message", msg => {
    io.emit("chat message", name + ": " + msg);
  });

  socket.on("is typing", text => {
    socket.broadcast.emit("is typing", name + " is typing...");
  });

  socket.on("clean alert typing", text => {
    socket.broadcast.emit("clean alert typing");
  });
  socket.on("send PM", id => {
    io.to(`${id}`).emit("yo ma gueule !");
  });
  socket.on("disconnect", () => {
    users.length = 0;
    const clients = socket.adapter.rooms.get("room1");
    if (clients) {
      for (const clientId of clients) {
        //this is the socket of each client in the room.
        const clientSocket = io.sockets.sockets.get(clientId);

        users.push({ name: clientSocket.nickname, id: clientSocket.id });
      }
    }

    io.emit("user leaving", name + " disconnect", users);
  });
});

http.listen(process.env.PORT, () => {
  console.log("listening on " + process.env.PORT);
});
