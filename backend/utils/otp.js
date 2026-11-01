const crypto = require('crypto');

const generateOtp = () => String(crypto.randomInt(0, 1000000)).padStart(6, '0');

const hashOtp = (code) => crypto.createHash('sha256').update(code).digest('hex');

module.exports = { generateOtp, hashOtp };
