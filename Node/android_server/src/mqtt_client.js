const mqtt = require("mqtt");

const MQTT_BROKER_URL = "mqtt://192.168.5.1:1883";

const client = mqtt.connect(MQTT_BROKER_URL);

let connected = false;

async function getClient() {
    if (!connected) {
        return new Promise((resolve, reject) => {
            client.on("connect", () => {
                connected = true;
                resolve(client);
            });
        });
    } else {
        return client;
    }
    
}

module.exports = {
    getClient
};