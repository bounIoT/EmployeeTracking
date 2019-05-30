/**
 * This software runs on Raspberry Pi. It receives captured packet information via MQTT.
 * This information is then combined here using the timestamp field of the packets.
 * After collecting a packet from each node on the field. These packets are sent to the
 * cloud for predictions.
 */
const mqtt = require("mqtt");
const client = mqtt.connect("mqtt://localhost:1883");
const { sendToCloud } = require("./cloud");

client.on("connect", () => {
    client.subscribe("signal", (err) => {
        if (!err) {
            console.log("Subscribed to channel 'signal'");
        }
    });
});

dpoints = {};
last_locations = {}


client.on("message", (topic, message) => {
    
    const data = JSON.parse(message.toString());
    console.log(data);
    
    if(!(data.mac in dpoints)) {
        dpoints[data.mac] = {};
        last_locations[data.mac] = { loc: -1, counter: 0 };
    }

    if(!(data.ts in dpoints[data.mac])) {
        dpoints[data.mac][data.ts] = {};
    }

    dpoints[data.mac][data.ts][data.node_id] = { mac: data.mac, rssi: data.rssi };

    if(Object.keys(dpoints[data.mac][data.ts]).length >= 3) {
        sendToCloud(data.mac, dpoints[data.mac][data.ts]);
        /*predict(dpoints[data.mac][data.ts], (result) => {
            if(result !== last_locations[data.mac].loc && last_locations[data.mac].counter++ >= 2) {
                
            } else {
                sendToCloud(data.mac, last_locations[data.mac].loc);
            }
        });*/
        delete dpoints[data.mac][data.ts];
    }

});