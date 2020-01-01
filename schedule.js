var express = require('express');
var router = express.Router();
const defaultRes = require('./module/utils/utils');
const statusCode = require('./module/utils/statusCode');
const resMessage = require('./module/utils/responseMessage')
const db = require('./module/pool');
const jwtUtils = require('./module/jwt');
const authUtil = require("./module/utils/authUtils");
const cron = require('node-cron')
const moment = require('moment')


// UserAd의 VideoInfo에 값이 업데이트 됨

cron.schedule('*/30 * * * * *', () => console.log('매 10초마다 실행', moment().format("YY.MM.DD hh:mm:ss")));
