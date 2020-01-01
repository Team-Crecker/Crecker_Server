var express = require('express');
var router = express.Router({mergeParams : true});

const upload = require('../../../config/multer');

var moment = require('moment');

const defaultRes = require('../../../module/utils/utils');
const statusCode = require('../../../module/utils/statusCode');
const resMessage = require('../../../module/utils/responseMessage');
const authUtils = require('../../../module/utils/authUtils');
const db = require('../../../module/pool');


//광고 헤더이미지 - 관리자가 선택하는 것
router.put('/pick', async(req,res) => {

    //pick으로 put시키면 자동으로?
    //자동으로 isPick을 0으로 모두 초기화시킴
    const updatePickQuery = 'UPDATE Ad SET isPick = 0'
    const updatePickResult = await db.queryParam_None(updatePickQuery);
    console.log(req.body.adIdx)
    
    //관리자가 선택한 값을 1로 변경 
    // const putPickQuery = 'UPDATE Ad SET isPick = 1 WHERE adIdx = ?'
    // const putPickResult = await db.queryParam_Parse(putPickQuery,[req.body.adIdx]);
    
    for (let i of req.body.adIdx) {
        const updatePickQuery2 = 'UPDATE Ad SET isPick = 1 WHERE adIdx =? ';
        // console.log(i)
        const updatePickResult2 = await db.queryParam_Arr(updatePickQuery2, [i]);
    };
    
    if (!updatePickResult){
        res.status(200).send(defaultRes.successFalse(statusCode.DB_ERROR, resMessage.DB_ERROR));
    } else{
        res.status(200).send(defaultRes.successTrue(statusCode.OK,"광고 홈 상단 헤더 이미지 성공",updatePickResult));
    }

});

//관리자가 선택한 이미지 보여주기
router.get('/random', authUtils.isLoggedin,async(req,res) => {

 const resData =[];    
 const getHeaderQuery = "SELECT adIdx, thumbnail,applyTo,title,subtitle FROM Ad WHERE isPick = 1 order by rand() ";
 const getHeaderResult = await db.queryParam_Arr(getHeaderQuery,[req.body.isPick]);

for(let i=0; i<getHeaderResult.length; i++){

    const item={
        thumbnail:"",
        title:"",
        subtitle:"",
        dday:''
    };



    item.thumbnail = getHeaderResult[i].thumbnail;
    item.title = getHeaderResult[i].title;
    item.subtitle = getHeaderResult[i].subtitle;
    item.adIdx = getHeaderResult[i].adIdx;

console.log(getHeaderResult[0].applyTo);
 var t1 = moment(getHeaderResult[i].applyTo,'YYYY-MM-DD HH:mm');
 var t2 = moment();


 let ddayfull = moment.duration(t2.diff(t1)).asDays();
  //6.231323
 let ddayfullstring = ddayfull.toString();
console.log(ddayfull)
 let dday = ddayfullstring.split(".");

 item.dday=  Number(dday[0]) ;

 resData.push(item);

}
console.log(getHeaderResult);
if (!getHeaderResult){
    res.status(200).send(defaultRes.successFalse(statusCode.DB_ERROR, resMessage.DB_ERROR));
} else{
res.status(200).send(defaultRes.successTrue(statusCode.OK,"광고 홈 상단 헤더 이미지 성공",resData));
}

});



//광고 맞춤형 
router.get('/interest',authUtils.isLoggedin, async(req,res) => {
    
    console.log(req.decoded.typeAd);
    const getInterestQuery = 'SELECT adIdx, thumbnail, title, cash FROM Ad WHERE categoryCode = ?'
    const getInterestResult = await db.queryParam_Parse(getInterestQuery,[req.decoded.typeAd])

     if (!getInterestResult){
         res.status(200).send(defaultRes.successFalse(statusCode.DB_ERROR, resMessage.DB_ERROR));
     } else{
     res.status(200).send(defaultRes.successTrue(statusCode.OK,"맞춤형 광고 성공", getInterestResult));
     }
     
});

//광고 인기순
router.get('/popular',authUtils.isLoggedin,async(req,res) => {

    const getPopularQuery = 'SELECT adIdx, thumbnail, title, cash FROM Ad ORDER BY views DESC'
    const getPopularResult = await db.queryParam_None(getPopularQuery);

    if (!getPopularResult){
        res.status(200).send(defaultRes.successFalse(statusCode.DB_ERROR, resMessage.DB_ERROR));
    } else{
    res.status(200).send(defaultRes.successTrue(statusCode.OK,"인기순 광고 성공",getPopularResult));
    }

});

//광고 최신순 with d-day
router.get('/latest',authUtils.isLoggedin,async (req,res) => {

    const getLatestQuery = 'SELECT adIdx, thumbnail, title, cash FROM Ad ORDER BY createAt DESC'
    const getLatestResult = await db.queryParam_None(getLatestQuery);
    
    if (!getLatestResult){
        res.status(200).send(defaultRes.successFalse(statusCode.DB_ERROR, resMessage.DB_ERROR));
    } else{
    res.status(200).send(defaultRes.successTrue(statusCode.OK,"최신순 광고 성공",getLatestResult));
    }
});


//카테고리 별 광고 with d-day
router.get('/list/:flag',authUtils.isLoggedin,async (req,res) => {
    
    const resData =[];


    const getCategoryQuery = 'SELECT adIdx,thumbnail, applyTo, title, cash  FROM Ad WHERE categoryCode= ? ORDER BY applyTo ' 
    const getCategoryResult = await db.queryParam_Parse(getCategoryQuery,[req.params.flag]);
 
  
    for(let i=0;i<getCategoryResult.length;i++){

        const item={
            adIdx:"",
            thumbnail:"",
            title:"",
            cash:"",
            dday:''
        };

        item.adIdx = getCategoryResult[i].adIdx;
        item.thumbnail = getCategoryResult[i].thumbnail;
        item.title = getCategoryResult[i].title;
        item.cash= getCategoryResult[i].cash;
       

    var t1 = moment(getCategoryResult[i].applyTo,'YYYY-MM-DD HH:mm');
    var t2 = moment();
 
    let ddayfull = moment.duration(t2.diff(t1)).asDays();
     //6.231323
    let ddayfullstring = ddayfull.toString();

    let dday  =   ddayfullstring.split(".");
  
    item.dday= Number(dday[0]);
 

    resData.push(item);

    };
  
    if (!getCategoryResult){
        res.status(200).send(defaultRes.successFalse(statusCode.DB_ERROR, resMessage.DB_ERROR));
    } else{
    res.status(200).send(defaultRes.successTrue(statusCode.OK,"카테고리 광고 불러오기 성공",resData));
    }
    
});


const convert = element => {
    element.applyFrom = moment(element.applyFrom).format('YY.MM.DD');
    element.applyTo = moment(element.applyTo).format('YY.MM.DD');
    element.choice = moment(element.choice).format('YY.MM.DD');
    element.completeDate = moment(element.completeDate).format('YY.MM.DD');
    element.uploadFrom = moment(element.uploadFrom).format('YY.MM.DD');
    element.uploadTo = moment(element.uploadTo).format('YY.MM.DD');

};

//광고 삽입
router.post('/insert',upload.array('imgs'),async(req,res)=>{          
                           
    
    const {title, subtitle, cash, applyFrom, applyTo, choice, uploadFrom, uploadTo, completeDate
    , preference, campaignInfo, url, reward, keyword, campaignMission, addInfo, categoryCode, subscribers, subscribersNum }  = req.body;
    const [thumbnail, summaryPhoto, fullPhoto] = req.files.map(it=> it.location);

    const insertAdQuery ="INSERT INTO Ad "
    + "(thumbnail,title,subtitle,cash,applyFrom,applyTo,choice,uploadFrom,uploadTo,completeDate,"
    + "summaryPhoto,fullPhoto,preference,campaignInfo,url,reward,keyword,campaignMission,addInfo,categoryCode,createAt,subscribers,subscribersNum) "
    + "VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)";
    const insertAdResult = await  db.queryParam_Parse(insertAdQuery,[thumbnail, title, subtitle, cash, 
        applyFrom, applyTo, choice, uploadFrom, uploadTo, completeDate,
    summaryPhoto, fullPhoto, preference, campaignInfo, url, 
    reward, keyword, campaignMission, addInfo, categoryCode,moment().format('YY.MM.DD'),subscribers,subscribersNum]);
    
    if (!insertAdResult){
        res.status(200).send(defaultRes.successFalse(statusCode.DB_ERROR, resMessage.DB_ERROR));
    } else{
    res.status(200).send(defaultRes.successTrue(statusCode.OK,"resMessage.INSERT_AD_SUCCESS"));
    }

});


//광고 조회
router.get('/detail/:idx',authUtils.isLoggedin, async(req,res) => {
    const getDetailQuery = 'SELECT * FROM Ad WHERE adIdx = ?'
    const getDetailResult = await db.queryParam_Parse(getDetailQuery,[req.params.idx]);
    
    const getSubscribersQuery = 'SELECT * FROM User WHERE userIdx = ?'
    const getSubscribersResult = await db.queryParam_Parse(getSubscribersQuery,[req.decoded.idx]);
    const subscribers = getSubscribersResult[0]['subscribers']
    console.log(subscribers)
    const updateViewsQuery = 'UPDATE Ad SET views = views+1 WHERE adIdx=?'
    const updateViewsResult = await db.queryParam_Parse(updateViewsQuery,[req.params.idx]);

    convert(getDetailResult[0]);

    if (!getDetailResult){
        res.status(200).send(defaultRes.successFalse(statusCode.DB_ERROR, "디테일 조회 DB 실패"));
    }else if(!updateViewsResult){
        res.status(200).send(defaultRes.successFalse(statusCode.DB_ERROR, "조회수 수정 실패"));
    } else{
    res.status(200).send(defaultRes.successTrue(statusCode.OK,"광고 조회 성공", {'ad': getDetailResult, 'subscribers': subscribers}));
    }

});


//신청하기 버튼 후 기획서 신청정보 가져오기
router.get('/apply',authUtils.isLoggedin, async(req,res) => {
    const getApplyQuery = 'SELECT youtubeUrl, phone, location  FROM User WHERE userIdx = ?'
    const getApplyResult = await db.queryParam_Parse(getApplyQuery,[req.decoded.idx]);

    if (!getApplyResult){
        res.status(200).send(defaultRes.successFalse(statusCode.DB_ERROR, resMessage.DB_ERROR));
    } else{
    res.status(200).send(defaultRes.successTrue(statusCode.OK,"기획서 가져오기 성공",getApplyResult));
    }
    
});

//기획서 내용 입력
router.post('/write', authUtils.isLoggedin ,async(req,res) => {
    console.log(req.body);
    
    const getWriteQuery = 'INSERT INTO Plan (title, subtitle,youtubeUrl, phone, location, planTitle, planContents, refUrl,isAgree, userIdx) VALUES(?,?,?,?,?,?,?,?,?,?)'
    const postWriteQuery = 'INSERT INTO UserAd (userIdx, adIdx, progress, createAt) VALUES (?,?,?,?)';
    
    const writeTransaction = db.Transaction(async connection => {
        const getWriteResult = await connection.query(getWriteQuery,[req.body.title, req.body.subtitle,req.body.youtubeUrl, req.body.phone, req.body.location, req.body.planTitle, req.body.planContents, req.body.refUrl,req.body.isAgree, req.decoded.idx]);
        const postWriteResult = await connection.query(postWriteQuery,[req.decoded.idx, req.body.adIdx, 1, moment().format('YYYY-MM-DD HH:mm:ss')]);
    })
    
    
    if (!writeTransaction){
        res.status(200).send(defaultRes.successFalse(statusCode.DB_ERROR, resMessage.DB_ERROR));
    } else{
    res.status(200).send(defaultRes.successTrue(statusCode.OK,"기획서 작성 성공"));
    }
    
    
});




//post는 body get은 params쓰라!

    // GET -문자열 url로 받으니까 
    // POST - 이미지


    // 문자열 
    // 이미지 

module.exports = router;

