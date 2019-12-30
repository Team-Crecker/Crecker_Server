var express = require('express');
var router = express.Router({mergeParams : true});

const upload = require('../../../config/multer');

var moment = require('moment');

const defaultRes = require('../../../module/utils/utils');
const statusCode = require('../../../module/utils/statusCode');
const resMessage = require('../../../module/utils/responseMessage');
const authUtils = require('../../../module/utils/authUtils');
const db = require('../../../module/pool');


//광고 삽입
router.post('/insert',upload.array('imgs'),async(req,res)=>{          
                           
    
    console.log(req.body);
    const insertAdQuery ="INSERT INTO Ad "
    + "(thumbnail,title,subtitle,cash,applyFrom,applyTo,choice,uploadFrom,uploadTo,completeDate,"
    + "summaryPhoto,fullPhoto,preference,campaignInfo,url,reward,keyword,campaignMission,addInfo,category,views,createAt) "
    + "VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)";
    const insertAdResult = await  db.queryParam_Parse(insertAdQuery,[req.files[0].location, req.body.title, req.body.subtitle, req.body.cash, 
        req.body.applyFrom, req.body.applyTo, req.body.choice, req.body.uploadFrom, req.body.uploadTo, req.body.completeDate,
    req.files[1].location, req.files[2].location, req.body.preference, req.body.campaignInfo, req.body.url, 
    req.body.reward, req.body.keyword, req.body.campaignMission, req.body.addInfo,req.body.category,req.body.views,moment().format('YYYY-MM-DD HH:mm:ss')]);
    
    if (!insertAdResult){
        res.status(200).send(defaultRes.successFalse(statusCode.DB_ERROR, resMessage.DB_ERROR));
    } else{
    res.status(200).send(defaultRes.successTrue(statusCode.OK,"resMessage.INSERT_AD_SUCCESS"));
    }

   
});

//광고 삽입-코드 정리
router.post('/insert2',upload.array('imgs'),async(req,res)=>{          
                           
    
    console.log(req.body);
    const {title, subtitle, cash, applyFrom, applyTo, choice, uploadFrom, uploadTo, completeDate
    , preference, campaignInfo, url, reward, keyword, campaignMission, addInfo, category, views }  = req.body;
    const [thumbnail, summaryPhoto, fullPhoto] = req.files.map(it=> it.location);

    const insertAdQuery ="INSERT INTO Ad "
    + "(thumbnail,title,subtitle,cash,applyFrom,applyTo,choice,uploadFrom,uploadTo,completeDate,"
    + "summaryPhoto,fullPhoto,preference,campaignInfo,url,reward,keyword,campaignMission,addInfo,category,views,createAt) "
    + "VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)";
    const insertAdResult = await  db.queryParam_Parse(insertAdQuery,[thumbnail, title, subtitle, cash, 
        applyFrom, applyTo, choice, uploadFrom, uploadTo, completeDate,
    summaryPhoto, fullPhoto, preference, campaignInfo, url, 
    reward, keyword, campaignMission, addInfo, category,views,moment().format('YYYY-MM-DD HH:mm:ss')]);
    
    if (!insertAdResult){
        res.status(200).send(defaultRes.successFalse(statusCode.DB_ERROR, resMessage.DB_ERROR));
    } else{
    res.status(200).send(defaultRes.successTrue(statusCode.OK,"resMessage.INSERT_AD_SUCCESS"));
    }

   
});

//광고 첫 화면 랜덤이미지 제공
router.get('/random',async(req,res)=>{  
    const resData={
        thumbnail:"",
        title:"",
        subtitle:"",
        dday:''
    };
    
    const getAdQuery = "SELECT thumbnail,applyTo,title,subtitle FROM Ad order by rand() limit 1";
    const getAdResult = await db.queryParam_None(getAdQuery);

    resData.thumbnail = getAdResult[0].thumbnail;
    resData.title = getAdResult[0].title;
    resData.subtitle = getAdResult[0].subtitle;
  
    console.log(getAdResult[0].applyTo);
     var t1 = moment(getAdResult[0].applyTo,'YYYY-MM-DD HH:mm');
     var t2 = moment();
  
     let ddayfull = moment.duration(t2.diff(t1)).asDays();
      //6.231323
     let ddayfullstring = ddayfull.toString();

     let dday  =   ddayfullstring.split(".");
    
     resData.dday= dday[0];
     

    if (!getAdResult){
        res.status(200).send(defaultRes.successFalse(statusCode.DB_ERROR, resMessage.DB_ERROR));
    } else{
    res.status(200).send(defaultRes.successTrue(statusCode.OK,"resMessage.INSERT_AD_SUCCESS",resData));
    }
    
   
});

//카테고리 별 광고 with d-day
router.get('/list/:flag',async (req,res) => {
    
    const resData =[];


    const getCategoryQuery = 'SELECT adIdx,thumbnail, applyTo, title, cash  FROM Ad WHERE category= ? ORDER BY applyTo ' 
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
   
    item.dday= dday[i];
    resData.push(item);

    }
  
 
    if (!getCategoryResult){
        res.status(200).send(defaultRes.successFalse(statusCode.DB_ERROR, resMessage.DB_ERROR));
    } else{
    res.status(200).send(defaultRes.successTrue(statusCode.OK,"resMessage.INSERT_AD_SUCCESS",resData));
    }
    
});


//광고 최신순 with d-day
router.get('/latest',async (req,res) => {

    const getLatestQuery = 'SELECT thumbnail, title, cash FROM Ad ORDER BY createAt DESC'
    const getLatestResult = await db.queryParam_None(getLatestQuery);
    
   
    if (!getLatestResult){
        res.status(200).send(defaultRes.successFalse(statusCode.DB_ERROR, resMessage.DB_ERROR));
    } else{
    res.status(200).send(defaultRes.successTrue(statusCode.OK,"resMessage.INSERT_AD_SUCCESS",getLatestResult));
    }
});

//광고 인기순
router.get('/popular',async(req,res) => {

    

    const getPopularQuery = 'SELECT thumbnail, title, cash FROM Ad ORDER BY views DESC'
    const getPopularResult = await db.queryParam_None(getPopularQuery);

    if (!getPopularResult){
        res.status(200).send(defaultRes.successFalse(statusCode.DB_ERROR, resMessage.DB_ERROR));
    } else{
    res.status(200).send(defaultRes.successTrue(statusCode.OK,"resMessage.INSERT_AD_SUCCESS",getPopularResult));
    }

});


//광고 맞춤형 
router.get('/interest',authUtils.isLoggedin, async(req,res) => {
    
    console.log(req.decoded.typeAd);
    const getInterestQuery = 'SELECT thumbnail, title, cash FROM Ad WHERE category = ?'
    const getInterestResult = await db.queryParam_Parse(getInterestQuery,[req.decoded.typeAd])

     if (!getInterestResult){
         res.status(200).send(defaultRes.successFalse(statusCode.DB_ERROR, resMessage.DB_ERROR));
     } else{
     res.status(200).send(defaultRes.successTrue(statusCode.OK,"resMessage.INSERT_AD_SUCCESS",getInterestResult));
     }
    
    
    
});


//광고 조회
router.get('/detail/:idx',async(req,res) => {


    const getDetailQuery = 'SELECT * FROM Ad WHERE adIdx = ?'
    const getDetailResult = await db.queryParam_Parse(getDetailQuery,[req.params.idx]);
  

     const updateViewsQuery = 'UPDATE Ad SET views = views+1 WHERE adIdx=?'
     const updateViewsResult = await db.queryParam_Parse(updateViewsQuery,[req.params.idx]);
    if (!getDetailResult){
        res.status(200).send(defaultRes.successFalse(statusCode.DB_ERROR, "디테일 조회 DB 실패"));
    }else if(!updateViewsResult){
        res.status(200).send(defaultRes.successFalse(statusCode.DB_ERROR, "조회수 수정 실패"));
    } else{
    res.status(200).send(defaultRes.successTrue(statusCode.OK,"resMessage.INSERT_AD_SUCCESS",getDetailResult));
    }

});

//신청하기 버튼 후 기획서 신청정보 가져오기
router.get('/apply',authUtils.isLoggedin, async(req,res) => {
    const getApplyQuery = 'SELECT youtubeUrl, phone, location  FROM User WHERE userIdx = ?'
    const getApplyResult = await db.queryParam_Parse(getApplyQuery,[req.decoded.idx]);

    if (!getApplyResult){
        res.status(200).send(defaultRes.successFalse(statusCode.DB_ERROR, resMessage.DB_ERROR));
    } else{
    res.status(200).send(defaultRes.successTrue(statusCode.OK,"resMessage.INSERT_AD_SUCCESS",getApplyResult));
    }
    
});

//기획서 내용 입력
router.post('/write', async(req,res) => {
    console.log(req.body);
    const getWriteQuery = 'INSERT INTO Plan (title, subtitle,youtubeUrl, phone, location, planTitle, planContents, refUrl) VALUES(?,?,?,?,?,?,?,?)'
    const getWriteResult = await db.queryParam_Parse(getWriteQuery,[req.body.title, req.body.subtitle,req.body.youtubeUrl, req.body.phone, req.body.location, req.body.planTitle, req.body.planContents, req.body.refUrl]);

    if (!getWriteResult){
        res.status(200).send(defaultRes.successFalse(statusCode.DB_ERROR, resMessage.DB_ERROR));
    } else{
    res.status(200).send(defaultRes.successTrue(statusCode.OK,"resMessage.INSERT_AD_SUCCESS"));
    }
    
    
});


//post는 body get은 params쓰라!

module.exports = router;

