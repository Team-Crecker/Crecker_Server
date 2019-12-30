var express = require("express");
var router = express.Router();

var moment = require('moment')

const defaultRes = require("../../../module/utils/utils");
const statusCode = require("../../../module/utils/statusCode");
const resMessage = require("../../../module/utils/responseMessage");
const db = require("../../../module/pool");
const isLoggedin = require('../../../module/utils/authUtils').isLoggedin;
/*   
    알림 생각 해보기
    광고 정보가 변경됨 <-> 

*/
/* GET home page. */


router.get("/", async function(req, res, next) {
    //다 보여주기
});