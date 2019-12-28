var express = require("express");
var router = express.Router();

var moment = require('moment')
const upload = require('../../config/multer');

const defaultRes = require("../../module/utils/utils");
const statusCode = require("../../module/utils/statusCode");
const resMessage = require("../../module/utils/responseMessage");
const db = require("../../module/pool");

/*   
    idx
    제목
    내용(string)
    private(0,1)
    createAt
*/
/* GET home page. */
/*
DB 오류 뜰 때
    ? 개수
404 에러
    1. GET, POST 확인하기
    2. 라우팅 제대로 되었는지 확인하기
*/

router.post("/", upload.single('poster'), async (req, res) => {
    const insertNewsQuery = 'INSERT INTO News (poster, host, title, contents, createAt) VALUES (?,?,?,?,?)';
    const insertNewsResult = await db.queryParam_Arr(insertNewsQuery, [req.file.location, req.body.host, req.body.title, req.body.contents ,moment().format('YYYY-MM-DD HH:mm:ss') ])

    if (!insertNewsResult)
        res.status(200).send(defaultRes.successFalse(statusCode.DB_ERROR, "DB 오류 입니다"));    // 작품 삭제 성공
    else
        res.status(200).send(defaultRes.successTrue(statusCode.OK, "뉴스 입력 성공"));    // 작품 삭제 성공
    
});

module.exports = router;
//localhost:3000/
