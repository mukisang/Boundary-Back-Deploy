# Boundary_backend
Boundary Service Backend

<h1> 사용법 </h1>
<pre>
0. 기본 설정 설치
1. mongoDB 설치
2. git clone repository_name
3. config.js에 설정 채우기
4. npm install
5. npm start app.js
#chating 기능의 경우 Nginx 의 별도 세팅이 필요함

</pre>

<h1> 기본 설정 설치 (DB, node, ...)</h1>
<pre>
sudo apt-get update && sudo apt-get upgrade//apt 최신으로
sudo apt-get install npm //npm 설치
sudo apt-get install n //n 설치

n install stable//node가 최신버전

sudo apt-get install -y mongodb-org
</pre>

<h1> MongoDB 설치</h1>
[도움 될 만한 사이트](https://docs.mongodb.com/manual/tutorial/install-mongodb-on-ubuntu, "google link")</h1>

<h1> git clone </h1>
<pre>
git clone Boundary-Back-Deploy
</pre>

<h1> config 설정 채우기 </h1>
- '#'부분을 채우기
<pre>
module.exports = {
    'secret': '#', <---여기에 secret Key를
    'mongodbUri': 'mongodb://127.0.0.1:27017/devBoundary',
    'serverPort' : #, <--여기에 port를
    'serverName' : "https://boundary.or.kr/api/",
    //'serverName' : "http://127.0.0.1:5000/",
}
</pre>

<h1> npm 모듈 설치 </h1>
<pre>
npm install
</pre>

<h1> 서버 구동 시키기 </h1>
<pre>
npm start app.js
</pre>


