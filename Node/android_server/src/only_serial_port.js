/**
 * This file is used to run in production, after the training completes.
 * It reads data from the serial port and sends it through the MQTT broker.
 */
const uuidv1 = require("uuid/v1");
const { getClient } = require("./mqtt_client");
const {
    port, parser
} = require("./serialport.js");

getClient().then(val => {
    client = val;

    async function onSerialPortDataReceived(line) {
        let splitLine = line.split("\t");
    
        data = {
            node_id: 2,
            mac: splitLine[0],
            rssi: parseInt(splitLine[1]),
            ts: splitLine[2]
        };
        dataStr = JSON.stringify(data);
        console.log(`> ${dataStr}`);
        client.publish("signal", dataStr);
    
    }

    parser.on('data', onSerialPortDataReceived);
});