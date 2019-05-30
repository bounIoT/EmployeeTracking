const crypto = require("crypto");

const SECRET = "symetriclool";
const ALGORITHM = "aes-256-ctr";

function encrypt(text) {
    const cipher = crypto.createCipher(ALGORITHM, SECRET);
    let crypted = cipher.update(text, 'utf8', 'hex');
    crypted += cipher.final('hex');
    return crypted;
}

function decrypt(text) {
    var decipher = crypto.createDecipher(ALGORITHM, SECRET)
    var dec = decipher.update(text,'hex','utf8')
    dec += decipher.final('utf8');
    return dec;
}

module.exports = {
    encrypt,
    decrypt
};