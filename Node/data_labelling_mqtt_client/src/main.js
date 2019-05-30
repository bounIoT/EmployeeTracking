/**
 * This program runs on Raspberry Pi, while collecting labelled data. Saves the
 * data on an sqlite3 database. This database, later, is then converted csv using
 * another proram.
 * 
 * This used to store information in a file. We thought it would be more efficient
 * to use a database management system.
 */

const mqtt = require("mqtt");
const fs = require("fs");

const sqlite = require("sqlite")
const dbPromise = sqlite.open("./db.sqlite")
    .then((db) => {
        db.run("DROP TABLE IF EXISTS signal");
        db.run("CREATE TABLE signal (id INTEGER PRIMARY KEY AUTOINCREMENT, node_id TEXT, rssi INTEGER, mac TEXT, ts INT, location TEXT)");
        return db;
    })

const MQTT_BROKER_URL = "mqtt://localhost:1883";
const DATA_FILE_NAME = "data.csv";

const WRITE_TO = "database" // "file"

const client = mqtt.connect(MQTT_BROKER_URL);

client.on("connect", () => {
    client.subscribe("signal", (err) => {
        if(!err) {
            console.log("Subscribed to 'signal' channel");
        }
    });
});

//fs.writeFileSync(DATA_FILE_NAME, "node_id,mac,rssi,ts,location\n");

let database = [];

function writeToFile(filename, data) {
    stringData = data.map((val) => {
        return `${val.node_id},${val.mac},${val.signal_str},${val.ts},${val.location}`
    });
    str = stringData.join("\n") + "\n";
    fs.appendFileSync(filename, str);
}

async function writeToDB(data) {
    const db = await dbPromise;

    db.run("INSERT INTO signal (node_id, rssi, mac, ts, location) VALUES (?, ?, ?, ?, ?)", [
        data.node_id,
        data.signal_str,
        data.mac,
        data.ts,
        data.location
    ])
}

client.on("message", (topic, message) => {
    let data = JSON.parse(message.toString());
    
    if (WRITE_TO == "file") {
        database.push({
            ...data
        });
        if(database.length % 20 === 0) {
            writeToFile(DATA_FILE_NAME, database);
            database = [];
        }
    } else if(WRITE_TO == "database") {
        writeToDB(data);
    }
    
    console.log(`${data.node_id} ==> (${data.signal_str}) - ${data.location} (${data.ts})`);
});