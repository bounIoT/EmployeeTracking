const { encrypt } = require('./crypto');
const axios = require("axios");

const CLOUD_ADDRESS = "http://142.93.38.166:65535";

function sendToCloud(mac, dpoints) {
    console.log(`wow send to cloud ${mac}, ${dpoints}`);
    data = { mac, points: dpoints };
    axios.post(`${CLOUD_ADDRESS}`, encrypt(JSON.stringify(data)));
}

module.exports = {
    sendToCloud
};