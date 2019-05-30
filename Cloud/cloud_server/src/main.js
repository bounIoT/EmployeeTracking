/**
 * This is the piece of software used on cloud. It handles two connections at once.
 * 
 * An HTTP server is used to receive data. The server responds with a 404 to every request that
 * is not a POST request. Time constraints didn't allow us to implement error handling mechanisms.
 * 
 * The other connection is a socket.io server. socket.io is not a websocket implementation, but it
 * uses websocket whenever available. It basically allows us to push updates to a web page
 * whenever we want. In this case, the location updates are immediately sent to the web client.
 * 
 */

const http = require("http");
const {predict} = require("./predict");
const io = require("./socketio");
const {
    decrypt
} = require("./crypto");

const locations = {};

function processData(data) {
    console.log(data);
    predict(data.points, (location) => {
        console.log(location);
        locations[data.mac] = location;
        io.emit("location", { mac: data.mac, location });
    });
}

const srv = http.createServer((req, res) => {
    if(req.method === "POST") {
        let allData = "";
        req.on("data", (data) => {
            allData += data;
        });
        req.on("end", () => {
            allData = decrypt(allData);
            dataJson = JSON.parse(allData);
            processData(dataJson);
        });
        res.end('{"message":"Ok, lol"}');
    }
    res.statusCode = 404;
    res.end('{"message":"Nope, boyle bi sey yok..."}');
    
});

srv.listen(65535, () => {
    console.log("server basladi");
});