var jwt = require('../jwt');

const resMessage = require('./responseMessage');
const statusCode = require('./statusCode');
const util = require('./utils');

const authUtil = {
    //middlewares
    //미들웨어로 token이 있는지 없는지 확인하고
    //token이 있다면 jwt.verify함수를 이용해서 토큰 hash를 확인하고 토큰에 들어있는 정보 해독
    //해독한 정보는 req.decoded에 저장하고 있으며 이후 로그인 유무는 decoded가 있는지 없는지를 통해 알 수 있음
    isLoggedin: async (req, res, next) => {
        var token = req.headers.token;

        if (!token) {
            //토큰이 헤더에 없으면
            return res.json(util.successFalse(statusCode.BAD_REQUEST, resMessage.EMPTY_TOKEN));
        } else {
            //만든 jwt 모듈 사용하여 토큰 확인
            const user = jwt.verify(token);

            if (user == -3) {
                //유효기간이 지난 토큰일 때
                return res.json(util.successFalse(statusCode.UNAUTHORIZED, resMessage.EXPRIED_TOKEN));
            } else if (user == -2) {
                //잘못 형식의 토큰(키 값이 다르거나 등등)일 때
                return res.json(util.successFalse(statusCode.UNAUTHORIZED, resMessage.INVALID_TOKEN));
            } else {
                //req.decoded에 확인한 토큰 값 넣어줌
                req.decoded = user;
                next();
            }
        }
    },
    checkLogin: async (req, res, next) => {
        var token = req.headers.token;

        if (!token) {
            req.decoded = "NL";
            next();
        } else {
            //만든 jwt 모듈 사용하여 토큰 확인
            const user = jwt.verify(token);
            console.log(user);
            if (user == -3) {
                //유효기간이 지난 토큰일 때
                return res.json(util.successFalse(statusCode.UNAUTHORIZED, resMessage.EXPRIED_TOKEN));
            } else if (user == -2) {
                //잘못 형식의 토큰(키 값이 다르거나 등등)일 때
                return res.json(util.successFalse(statusCode.UNAUTHORIZED, resMessage.INVALID_TOKEN));
            } else {
                //req.decoded에 확인한 토큰 값 넣어줌
                req.decoded = user;
                next();
            }
        }
    },
};

module.exports = authUtil;