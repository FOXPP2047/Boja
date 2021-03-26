const crypto = require('crypto');

const algorithm = 'aes-256-ctr';
const secretKey = 'zxcvbnmlk123jhfyrusia8op2r7yt452';
const iv = crypto.randomBytes(16);

const encrypt = (str) => {
    const cipher = crypto.createCipheriv(algorithm, secretKey, iv);
    const encrypted = Buffer.concat([cipher.update(str), cipher.final()]);
    return {
        iv : iv.toString('hex'),
        content : encrypted.toString('hex')
    };
};

const decrypt = (hash) => {
    hash = JSON.parse(hash);
    const decipher = crypto.createDecipheriv(algorithm, secretKey, Buffer.from(hash.iv, 'hex'));
    const decrypted = Buffer.concat([decipher.update(Buffer.from(hash.content, 'hex')), decipher.final()]);
    return decrypted.toString();
};

module.exports = {
    encrypt,
    decrypt
};
