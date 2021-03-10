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
  const { name, text } = socket.handshake.query;
  console.log("name ==>", name);
  console.log("text ===>", text);
  socket.nickname = name;
  if (text === "undefined") {
    users.length = 0;
    socket.join("room1");
    const clients = socket.adapter.rooms.get("room1");
    console.log("users in room1 ===>", clients);

    for (const clientId of clients) {
      //this is the socket of each client in the room.
      const clientSocket = io.sockets.sockets.get(clientId);
      users.push({ name: clientSocket.nickname, id: clientSocket.id });
    }
  } else {
    users.length = 0;
    socket.join("test");
    const clients = socket.adapter.rooms.get("test");
    console.log("users in test ===>", clients);
    for (const clientId of clients) {
      //this is the socket of each client in the room.
      const clientSocket = io.sockets.sockets.get(clientId);
      users.push({ name: clientSocket.nickname, id: clientSocket.id });
    }
  }
  // console.log(socket.rooms);

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
    console.log(id);
    io.to(`${id}`).emit(
      "received PM",
      "Ceci est le début de votre conversation avec " + socket.nickname
    );
  });
  socket.on("opening private room", text => {
    console.log(text);
  });
  socket.on("disconnect", () => {
    if (text === "undefined") {
      users.length = 0;
      const clients = socket.adapter.rooms.get("room1");
      if (clients) {
        for (const clientId of clients) {
          //this is the socket of each client in the room.
          const clientSocket = io.sockets.sockets.get(clientId);
          users.push({ name: clientSocket.nickname, id: clientSocket.id });
        }
      }
    } else {
      users.length = 0;
      const clients = socket.adapter.rooms.get("test");
      if (clients) {
        for (const clientId of clients) {
          //this is the socket of each client in the room.
          const clientSocket = io.sockets.sockets.get(clientId);
          users.push({ name: clientSocket.nickname, id: clientSocket.id });
        }
      }
    }

    io.emit("user leaving", name + " disconnect", users);
  });
});

http.listen(process.env.PORT, () => {
  console.log("listening on " + process.env.PORT);
});
