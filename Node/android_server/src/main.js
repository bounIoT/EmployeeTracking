/**
 * This program initializes a server and receives commands from the Android client.
 * 
 * The server is simply a TCP client. The application protocol used is completely written
 * by our team. This protocol uses a very simple authentication system. It generates a uuid
 * for every client. Then uses this uuid to authenticate these clients. The uuid is
 * generated by a pre-shared password. However there's no encryption used before transmission.
 * An encyrption mechanism must be used before this product is used in production.
 * 
 */
const { createServer } = require("net");
const uuidv1 = require("uuid/v1");
const { getClient } = require("./mqtt_client");

let client;
getClient().then(val => {
    client = val;
});

const {
    port, parser
} = require("./serialport.js")

mac_addresses = {};
locations = {};

async function onSerialPortDataReceived(line) {
    let splitLine = line.split("\t");

    data = {
        node_id: 2,
        mac: splitLine[0],
        signal_str: parseInt(splitLine[1]),
        location: locations[splitLine[0]],
        ts: splitLine[2]
    };
    dataStr = JSON.stringify(data);
    //console.log(`> ${dataStr}`);
    client.publish("signal", dataStr);

    uuid = Object.keys(mac_addresses).find((v) => mac_addresses[v].mac === splitLine[0]);
    mac_addresses[uuid].packet_count++;
}

function onCommandConnect(socket, args) {
    if(args[1] !== "garip_bi_parola??") {
        socket.write("no\n");
        return;
    }
    uuid = uuidv1();
    mac_addresses[uuid] = { loc: "no_location", mac: args[2], packet_count: 0};
    locations[args[2]] = "no_location";
    socket.write(uuid + "\n");
    socket.write("ok\n");
    console.log("Connect Command OK");
}

function onCommandSetLocation(socket, args) {
    if(args[1] in mac_addresses) {
        mac_addresses[args[1]].loc = args[2];
        locations[mac_addresses[args[1]].mac] = args[2];
        socket.write("ok\n");
        console.log("set_location Command OK");
    } else {
        socket.write("no\n");
    }
}

function onCommandStartMeasure(socket, args) {
    if(args[1] in mac_addresses) {
        parser.on('data', onSerialPortDataReceived);
        console.log("start measure on nodemcu");
        socket.write("ok\n");
    } else {
        socket.write("no\n");
    }
}

function onCommandStopMeasure(socket, args) {
    if(args[1] in mac_addresses) {
        parser.off('data', onSerialPortDataReceived);
        console.log("stop measure on nodemcu");
        socket.write("ok\n");
    } else {
        socket.write("no\n");
    }
}

function onCommandDisconnect(socket, args) {
    if(args[1] in mac_addresses) {
        parser.off('data', onSerialPortDataReceived);
        delete mac_addresses[args[1]]
        socket.write("ok\n");
    } else {
        socket.write("ok\n"); // ... i guess
    }
}

function onCommandCheckPacketCount(socket, args) {
    if(args[1] in mac_addresses) {
        socket.write(mac_addresses[args[1]].packet_count + "\n");
        socket.write("ok\n");
    } else {
        socket.write("no\n");
    }
}

function onCommandResetPacketCount(socket, args) {
    if(args[1] in mac_addresses) {
        mac_addresses[args[1]].packet_count = 0;
        socket.write("ok\n");
    } else {
        socket.write("no\n");
    }
}

function onClientData(socket, data) {
    console.log(data);
    splitted = data.trim().split(" ");
    if(data.startsWith("connect")) {
        onCommandConnect(socket, splitted);
    } else if(data.startsWith("set_location")) {
        onCommandSetLocation(socket, splitted);
    } else if(data.startsWith("start_measure")) {
        onCommandStartMeasure(socket, splitted);
    } else if(data.startsWith("stop_measure")) {
        onCommandStopMeasure(socket, splitted);
    } else if(data.startsWith("disconnect")) {
        onCommandDisconnect(socket, splitted);
    } else if(data.startsWith("check_packet_count")) {
        onCommandCheckPacketCount(socket, splitted);
    } else if(data.startsWith("reset_packet_count")) {
        onCommandResetPacketCount(socket, splitted);
    }
}

var server = createServer((socket) => {
    socket.setEncoding("utf8");
    socket.on("data", (data) => onClientData(socket, data));
    socket.on("end", () => {
        console.log("Disconnected");
        parser.off('data', onSerialPortDataReceived);
    });
});

server.listen(6969, () => {
    console.log("Android server started");
});
