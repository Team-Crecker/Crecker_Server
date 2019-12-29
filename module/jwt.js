var randtoken = require('rand-token');
const jwt = require('jsonwebtoken');
const secretOrPrivateKey = "jwtSecretKey!";
const options = {
    algorithm: "HS256",
    expiresIn: "24h",
    issuer: "ig"
};
// 이건 랜덤 하게 나오는 옵션 
const refreshOptions = {
    algorithm: "HS256",
    expiresIn: "14d",
    issuer: "ig"
};
// 랜덤하게 나오는게 아니라 jwt signin으로 만들떄 
module.exports = {
    sign: (user) => {
        const payload = {
            idx: user.userIdx
        };

        const result = {
            token: jwt.sign(payload, secretOrPrivateKey, options),
            refreshToken: randtoken.uid(256)
        };
        //refreshToken을 만들 때에도 다른 키를 쓰는게 좋다.

        return result;
    },
    verify: (token) => {
        let decoded;
        try {
            decoded = jwt.verify(token, secretOrPrivateKey);
        } catch (err) {
            if (err.message === 'jwt expired') {
                console.log('expired token');
                return -3;
            } else if (err.message === 'invalid token') {
                console.log('invalid token');
                return -2;
            } else {
                console.log("invalid token");
                return -2;
            }
        }
        return decoded;
    },
    refresh: (user) => {
        const payload = {
            idx: user.idx,
            grade: user.grade,
            name: user.name
        };
        const result = {
            token: jwt.sign(payload, secretOrPrivateKey, refreshOptions),
            refreshToken: randtoken.uid(256)
        };
        return result;
    }
};