const config = {
    port: "/dev/ttyUSB0",
    baudRate: 115200,
};


const SerialPort = require("serialport");
const Readline = require("@serialport/parser-readline");

console.log("Connecting to port " + config.port + " with baud rate " + config.baudRate);
const port = new SerialPort(config.port, { baudRate: config.baudRate });

const parser = new Readline();
port.pipe(parser);

module.exports = {
    port,
    parser,
}