const mqtt = require("mqtt");
const client = mqtt.connect("mqtt://192.168.5.1:1883");

const ts = 12345;

const data_test1 = {
    node_id: 1,
    mac: "00:00:00:00:00:00",
    ts: ts,
    rssi: -60,
};

const data_test2 = {
    node_id: 2,
    mac: "00:00:00:00:00:00",
    ts: ts,
    rssi: -60,
};

const data_test3 = {
    node_id: 3,
    mac: "00:00:00:00:00:00",
    ts: ts,
    rssi: -50,
};

client.on("connect", () => {
    client.publish("signal",
        JSON.stringify(data_test1));
    client.publish("signal",
        JSON.stringify(data_test2));
    client.publish("signal",
        JSON.stringify(data_test3));
});