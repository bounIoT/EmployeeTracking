const socketio = require("socket.io");

const io = socketio(9696);

io.on("connection", (socket) => {
    console.log("Wow connection");
    socket.on("disconnect", () => {
        console.log("wow disconnect");
    })
});

module.exports = io;