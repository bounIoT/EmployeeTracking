/**
 * This program is used to convert a sqlite3 database file to csv.
 */

const sqlite = require("sqlite");
const dbPromise = sqlite.open("./mydb28052019.sqlite");
const fs = require("fs");

const DATA_FILE_NAME = "packets.csv";

function writeToFile(filename, data) {
    stringData = data.map((val) => {
        return `${val.node_id},${val.mac},${val.rssi},${val.ts},${val.location}`
    });
    str = stringData.join("\n") + "\n";
    fs.appendFileSync(filename, str);
}

dbPromise.then(async db => {
    res = await db.all("SELECT * FROM signal");
    console.log(res);
    
    fs.writeFileSync(DATA_FILE_NAME, "node_id,mac,rssi,ts,location\n");

    writeToFile(DATA_FILE_NAME, res);

}).catch(err => {
    console.log(err);
});