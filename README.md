# Crecker_Server

#### 크리에이터라면 누구나! 계약없는 오픈 MCN 플랫폼 서비스 Crecker 

![로그3](https://user-images.githubusercontent.com/49789734/71712003-cd967700-2e46-11ea-9855-7b4fe94cc4b7.png)

![로그2](https://user-images.githubusercontent.com/49789734/71712002-cd967700-2e46-11ea-9e50-e3cd7d2d8e94.png)


![cre2](https://user-images.githubusercontent.com/49789734/71712004-ce2f0d80-2e46-11ea-91f8-9055e150fab6.jpg)

![cre1](https://user-images.githubusercontent.com/49789734/71712005-ce2f0d80-2e46-11ea-8598-570a3f3c3a16.png)

### API: https://github.com/Team-Crecker/Crecker_Server/wiki




# WorkFlow

![workflow](https://user-images.githubusercontent.com/49789734/71712001-ccfde080-2e46-11ea-9a56-15d13646ef64.png)



# ERD

![ERD!](https://user-images.githubusercontent.com/36567887/71727774-ab205000-2e7e-11ea-947e-bb0c9ab29f02.png)

# Main Function 
### 1. 로그인 유튜브 인증 
 jwt 토근구현

- rand-token, jsonwebtoken 모듈을 이용하여 accessToken 과 refreshToken을 발급받음
- accessToken의 payload에 user의 indexing number, user의 관심분야에 대한 정보가 들어감
- accessToken의 기한은 14일, refreshToken의 기한은 30일로 지정함

### 2. 사용자 맞춤형 광고를 제공

### 3. 사용자 맞춤형 뉴스를 제공 

### 4. 광고 등록 기능 

### 5. FAQ 

### 6. 광고의 조회수 서버스 
- 등록한를 자동으로 스케쥴링하여서 클라이언트에게 그래프 값을 제공 

### 7. 크리에이터, 유튜브 영상 정보 db 업데이트
개인 맞춤형 기능을 구현하기 위해 광고, 전문가, 뉴스 테이블이 유저 테이블과 1:N 또는 N:M 관계로 연결되어있음

사용자의 구독자 또는 사용자가 올린 광고 영상에 대한 조회수, 좋아요수, 댓글 수의 정보들은 tmux와 cron을 사용해 5시간마다 DB 업데이트를 하고 있음
- tmux는 pseudoterminal을 window와 session 단위로 관리하는 도구로서 스케줄링 프로그램과 서버 api 서로 다른 pseudoterminal에서 실행할 수 있음


cron으로 비디오 조회수, 좋아요 업데이트

cron으로 유저 구독자 수 업데이트, totalViews 업데이트

# Server-Architecture 

![KakaoTalk_Photo_2020-01-03-23-04-10](https://user-images.githubusercontent.com/36567887/71727450-9d1dff80-2e7d-11ea-9df2-db0956cf6a79.png)

# Dependency Module
```json
"dependencies": {
    "aws-sdk": "^2.596.0",
    "axios": "^0.19.0",
    "cookie-parser": "~1.4.4",
    "crypto-promise": "^2.1.0",
    "debug": "~2.6.9",
    "express": "~4.16.1",
    "http-errors": "~1.6.3",
    "jade": "~1.11.0",
    "json2csv": "^4.5.4",
    "jsonwebtoken": "^8.5.1",
    "moment": "^2.24.0",
    "morgan": "~1.9.1",
    "multer": "^1.4.2",
    "multer-s3": "^2.9.0",
    "node-cron": "^2.0.3",
    "promise-mysql": "^3.3.1",
    "rand-token": "^0.4.0",
    "short-unique-id": "^1.1.1"
  }
```


# Goal

• 매일 20분씩 IT 상식 공유 ❕

• 오늘부터 맡은 부분은 자유롭게 코딩 시작 ❕

• 개발자로서 기존 서비스를 더 좋은 방향으로 제안하기 ❕

• 자기가 만든 DB, API, 코드에 자신감 갖기 ❕
(단 확실한 근거가 있어야 됨!!!)

• 모두가 Crecker를 이해하기 ❕


# Schedule

#### [2019.12.27]
다 같이 API, DB 리뷰 

#### [2019.12.28]
crypto, Oauth 2.0, Jwt, Restful, 통신방법

#### [2019.12.29]
cron, youtube api, json2csv, git (API 70% 완성 예상)


# Team Role

#### 공통
- 데이터베이스 설계
- API 로직 설계 및 API 문서작성
- Youtube API 기능 분석
- 클라이언트 통신 및 유지 보수

#### 양정훈
- 전문가 기능 구현
- 뉴스 기능 구현
- My page 기능 구현
- 홈 화면 기능 구현

#### 유희수
- 광고 기능 구현
- 맞춤형 광고 기능 구현
- 광고 기획서 등록, 조회 구현
- 관리자 광고 관리 기능 구현

#### 장인규
- 팀원 코드 검토
- 팀원 멘토링
- 프로젝트 서버 파트 자문 
- README.md 제작
- 팀원 교육 학습 주도

#### 제갈윤
- 로그인 기능 및 JWT 인증 기능 
- My Page 개인 리포트 기능 구현
- My Page 캐시 기능 구현
- 스케쥴링 기능 구현




# Contributors

#### 제갈윤 [jms0707](https://github.com/jms0707)
#### 양정훈 [luciferkala](https://github.com/luciferkala)
#### 유희수 [yooheesoo](https://github.com/yooheesoo)
#### 장인규 [inguuu](https://github.com/inguuu)




# Plan

#### [2020 1.2 서버 개발 종료]

#### [2020 1.2 서버 통신 시작]

#### [100% 달성] ✔️

Docker, Kubernetes, MVC-Sequlize, MongoDB, 보안, NginX, elastic-search 등 실습


