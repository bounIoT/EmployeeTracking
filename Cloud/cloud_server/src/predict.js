/**
 * Predictions are taken via the python program in the classifier directory.
 */
const { exec } = require("child_process");

function predict(data, callback) {
    let rssiVals = data["2"].rssi + " " + data["3"].rssi + " " + data["1"].rssi;
    // requires python3 program to be present on the target system.
    // TODO this is not a portable solution, maybe use virtual environments???
    exec(`python3 ./classifier/get_pred.py ${rssiVals}`, (err, stdout, stderr) => {
        if(!err) {
            callback(parseInt(stdout));
        } else {
            console.log(stdout);
            console.error(stderr);
        }
    });
}

module.exports = {
    predict
}