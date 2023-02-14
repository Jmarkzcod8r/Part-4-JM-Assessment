

const express = require("express");
const app = express();
const http = require("http");
const cors = require("cors");
const { Server } = require("socket.io");
app.use(cors());


const users = [];
const chatrooms = {};

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});


io.on("connection", (socket) => {
  console.log(`User Connected: ${socket.id}`);

  socket.on("join_room", (data) => {
    console.log('try join_room');
    console.log('this is data: ',data)

    const active ={}

    socket.join(data);
    active[socket.id]='';
    console.log(`User with ID: ${socket.id} joined room: ${data}`);
    socket.to(data).emit("activelist", active);

    console.log(`chatroom: ${data} `,chatrooms[data])
    socket.to(data).emit("oldhistory", {chathis:chatrooms[data]});
 
  });

  socket.on("send_message", (data) => {

    const chatrooms_collection = Object.keys(chatrooms)
    if (!chatrooms_collection.includes(data.room)){
      chatrooms[data.room]=[]
    }
    chatrooms[data.room].push(data.message)
    const combineddata = {...data,...{chathistory:chatrooms[data.room]}}
    const sent = socket.to(data.room).emit("receive_message", combineddata);
    socket.on('chat_history',() => {
      const history = socket.to(data.room).emit("chats_history", combineddata);
    })
    
    

  });

  socket.on("disconnect", () => {
    console.log("User Disconnected", socket.id);
  });

  socket.on('signup', (data, callback) => {
    console.log('try signup')
    console.log('data' ,data)
    // const existingUser = users.find((user) => user.name === data)
    const existingUser = users.find((user) => user.email === data.email);

    if (existingUser) {
      callback({ error: 'User already exists' });
    } else {
      users.push({ email: data.email, password: data.password });
      callback({});
    } })

    socket.on('login', (data, callback) => {
      console.log('try login')
      console.log('data' ,data)
      const existingUser = users.find((user) => user.email === data.email && user.password === data.password);

      if (!existingUser) {
        callback({ error: 'Invalid login credentials' });
        } else {
        callback({eror:''});
        }
        });

        }); //--> End 

server.listen(3001, () => {
  console.log("SERVER RUNNING");
})