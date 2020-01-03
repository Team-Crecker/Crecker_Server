const express = require('express');
const router = express.Router();
const defaultRes = require('./utils/utils');
const statusCode = require('./utils/statusCode');
const resMessage = require('./utils/responseMessage')
const db = require('./pool');
const jwtUtils = require('./jwt');
const axios = require('axios') //Youtube API와 통신하기 위한 비동기 자바스크립트 모듈

module.exports = {
    authVideo : async (req,res,next) => {
        const key = 'AIzaSyC3oMoRqErkwxPLzNo6lStvKy6fotK7B9o';
        const {url} = req.body;
        const videoId = (url.includes('=')) ? url.slice((url.lastIndexOf('=')+1)) : url.slice((url.lastIndexOf('/')+1));
        const apiUrl = `https://www.googleapis.com/youtube/v3/videos?id=${videoId}&key=${key}&part=snippet,statistics`;
        let getData;
        const youtubeData = {};
        try {
             getData = await axios.get(apiUrl);
            //  console.log(getData.data.items[0]);
             youtubeData.thumbnails = getData.data.items[0].snippet.thumbnails.high.url;
             youtubeData.publishedAt = getData.data.items[0].snippet.publishedAt;
             youtubeData.viewCount = getData.data.items[0].statistics.viewCount;
             youtubeData.likeCount = getData.data.items[0].statistics.likeCount;
             req.youtubeData = youtubeData;
        } catch (error) {
            console.log(error)
            res.status(600).send(defaultRes.successFalse(statusCode.DB_ERROR, resMessage.INSERT_VIDEOINFO_FAILED)) 
        }
        // console.log(req.youtubeData);
        //썸네일, 업로드 날짜, 좋아요 수, 조회수 
        next();

    },
    authChannel : async (req,res,next) => {
        const key = 'AIzaSyC3oMoRqErkwxPLzNo6lStvKy6fotK7B9o';
        const {url} = req.body;
        const channelId = url.slice((url.lastIndexOf('/')+1));
        const apiUrl = `https://www.googleapis.com/youtube/v3/channels?id=${channelId}&key=${key}&part=snippet,statistics`;
        let getData;
        const youtubeData = {};
        try {
             getData = await axios.get(apiUrl);
             youtubeData.subscriberCount = getData.data.items[0].statistics.subscriberCount;
             req.youtubeData = youtubeData;
        } catch (error) {
            console.log(error)
            
            res.status(500).send(defaultRes.successFalse(statusCode.INTERNAL_SERVER_ERROR, resMessage.ID_NO)) 
        }
        // console.log(req.youtubeData);
        // 구독자 수        
        next();
    }
    
};

