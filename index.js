const port = process.env.PORT || 3000;
const express = require('express');
const { jsonp } = require('express/lib/response');
const app = express();
const http = require('http');
const lintening = http.Server(app);
const fs = require('fs');
const bodyParser = require('body-parser');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);

const mailgun = require("mailgun-js");
const DOMAIN = 'FeedbackApi';
const mg = mailgun({ apiKey: "0ade0776dc73ba150bbc34f15d9f3e15-62916a6c-0d40c635", domain: "https://api.mailgun.net/v3/sandbox82183e4e0a3740939f284f7a187e8311.mailgun.org" });

var jsonPath = '/data/';

app.get('/', function(req, res) {
    res.sendFile(__dirname + '/public/index.html');
});

app.get('/manage', function(req, res) {
    res.sendFile(__dirname + '/public/manage.html');
});

app.get('/css', function(req, res) {
    res.sendFile(__dirname + '/public/css/style.css');
});

app.get('/view', function(req, res) {
    var search = req.originalUrl.split('?')[1];
    var apiKey, password;
    try {
        if (search.split('&')[0] != undefined && search.split('&')[1] != undefined) {
            apiKey = search.split('&')[0];
            password = search.split('&')[1];
        }
        console.log(apiKey);
        console.log(password);
        var userdata = fs.readFileSync("data.json");
        console.log(JSON.parse(userdata));
        res.setHeader('Content-Type', 'text/html');
        res.write(`<html><head><meta charset="UTF-8">
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
        <meta name="viewport" content="width=device-width, initial-scale=1.0"><title>Feedback</title></head><body>`);
        var haveUser = false;
        var user;
        var json = JSON.parse(userdata);
        for (let i = 0; i < json['users'].length; i++) {
            if (json['users'][i]['key'] == apiKey && json['users'][i]['password'] == password) {
                user = json['users'][i].userId;
                console.log(user);
                haveUser = true;
            }
        }
        if (!haveUser) {
            res.write(`<style>
            .invalid {
                font-weight: 100;
                position: absolute;
                top: 40%;
                left: 50%;
                transform: translate(-50%, -50%);
                display: flex;
                justify-content: center;
                align-items: center;
                flex-direction: column;
                padding: 40px;
                background-color: rgb(240, 240, 240);
                border: 2px solid rgb(232, 232, 232);
                border-radius: 5px;
            }
            
            h1 {
                font-size: 2em;
                font-weight: 100;
                margin: 0;
                padding: 0;
            }
            
            .return {
                font-weight: 100;
                font-size: 26px;
                margin: 0;
                padding: 10px 20px;
                color: rgb(0, 0, 0);
                text-decoration: none;
                cursor: pointer;
                outline: none;
                border: none;
                background: linear-gradient(to right, rgb(167, 170, 220) 0%, rgb(167, 170, 220) 49.8%, #f1592a 50%, #f1592a 100%);
                background-size: 200% 100%;
                background-position: left bottom;
                transition: all .5s cubic-bezier(0.3, 0.88, 0.76, 0.97);
            }
            
            .return:hover {
                background-position: right bottom;
            }
        </style>
        <div class="invalid">
            <h1>Invalid api key or password.</h1>
            <p>Please check your api key and password.</p>
            <button class="return" onclick="window.history.go(-1)">Return</button>
        </div>`);
        } else {
            var data = readFeedbackData(apiKey);
            console.log(data);
            if (data.error.includes('Api key not found')) {
                res.write(`<style>
            .invalid {
                font-weight: 100;
                position: absolute;
                top: 40%;
                left: 50%;
                transform: translate(-50%, -50%);
                display: flex;
                justify-content: center;
                align-items: center;
                flex-direction: column;
                padding: 40px;
                background-color: rgb(240, 240, 240);
                border: 2px solid rgb(232, 232, 232);
                border-radius: 5px;
            }
            
            h1 {
                font-size: 2em;
                font-weight: 100;
                margin: 0;
                padding: 0;
            }
            
            .return {
                font-weight: 100;
                font-size: 26px;
                margin: 0;
                padding: 10px 20px;
                color: rgb(0, 0, 0);
                text-decoration: none;
                cursor: pointer;
                outline: none;
                border: none;
                background: linear-gradient(to right, rgb(167, 170, 220) 0%, rgb(167, 170, 220) 49.8%, #f1592a 50%, #f1592a 100%);
                background-size: 200% 100%;
                background-position: right bottom;
                transition: all .5s cubic-bezier(0.3, 0.88, 0.76, 0.97);
            }
            
            .return:hover {
                background-position: left bottom;
            }
        </style>
        <div class="invalid">
            <h1>Invalid api key or password.</h1>
            <p>Please check your api key and password.</p>
            <button class="return" onclick="window.history.go(-1)">Return</button>
        </div>`)
            } else if (data.error == 'no error') {
                res.write(`<style>
                .fb {
                    background-color: #73a0ff;
                    color: rgb(0, 0, 0);
                    font-weight: 100;
                    padding: 10px 20px;
                    border-radius: 4px;
                    font-size: 20px;
                    margin: 10px;
                }
                
                .fb * {
                    position: relative;
                }
                
                .fb .topic {
                    font-size: 40px;
                    margin: 15px;
                    padding: 0;
                }
                
                .fb .main {
                    font-size: 30px;
                    margin: 0 50px;
                    padding: 0;
                }
                
                .fb .date {
                    right: 5px;
                }
                
                .title {
                    font-weight: 100;
                    font-size: 50px;
                    margin: 50px;
                    padding: 0;
                }

                hr {
                    max-width: 80%;
                    border: 0;
                    border-bottom: 1px solid #ccc;
                }

                a {
                    text-decoration: none;
                    color: rgb(0, 0, 0);
                    font-weight: 100;
                }
            </style>
            <center>
                <p class="title">Feedback of ${user}</p>
            </center>`);
                for (let i = 0; i < data.data.length; i++) {
                    res.write(`
                <div class="fb">
                    <p class="topic">${data.data[i].topic}</p>
                    <p class="main">${data.data[i].message}-${data.data[i].message}</p>
                    <p class="date">${data.data[i].date}</p>
                </div>`);
                }
            }
        }
        res.end(`<hr><center><a>This is the end of the feedbacks</a></center></body></html>`);
    } catch (err) {
        console.log(err);
        res.sendFile(__dirname + '/public/viewErrorInput.html');
    }
});

app.get('/view/zh', function(req, res) {
    console.log(req.originalUrl.split('?')[1]);
    var search = req.originalUrl.split('?')[1];
    var apiKey, password;
    try {
        if (search.split('&')[0] != undefined && search.split('&')[1] != undefined) {
            apiKey = search.split('&')[0];
            password = search.split('&')[1];
        }
        console.log(apiKey);
        console.log(password);
        var userdata = fs.readFileSync("data.json");
        console.log(JSON.parse(userdata));
        res.setHeader('Content-Type', 'text/html');
        res.write(`<html><head><title>用户反馈</title><meta charset="UTF-8">
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
        <meta name="viewport" content="width=device-width, initial-scale=1.0"></head><body>`);
        var haveUser = false;
        var user;
        var json = JSON.parse(userdata);
        for (let i = 0; i < json['users'].length; i++) {
            if (json['users'][i]['key'] == apiKey && json['users'][i]['password'] == password) {
                user = json['users'][i].userId;
                console.log(user);
                haveUser = true;
            }
        }
        if (!haveUser) {
            res.write(`<style>
            .invalid {
                font-weight: 100;
                position: absolute;
                top: 40%;
                left: 50%;
                transform: translate(-50%, -50%);
                display: flex;
                justify-content: center;
                align-items: center;
                flex-direction: column;
                padding: 40px;
                background-color: rgb(240, 240, 240);
                border: 2px solid rgb(232, 232, 232);
                border-radius: 5px;
            }
            
            h1 {
                font-size: 2em;
                font-weight: 100;
                margin: 0;
                padding: 0;
            }
            
            .return {
                font-weight: 100;
                font-size: 26px;
                margin: 0;
                padding: 10px 20px;
                color: rgb(0, 0, 0);
                text-decoration: none;
                cursor: pointer;
                outline: none;
                border: none;
                background: linear-gradient(to right, rgb(167, 170, 220) 0%, rgb(167, 170, 220) 49.8%, #f1592a 50%, #f1592a 100%);
                background-size: 200% 100%;
                background-position: left bottom;
                transition: all .5s cubic-bezier(0.3, 0.88, 0.76, 0.97);
            }
            
            .return:hover {
                background-position: right bottom;
            }
            
        </style>
        <div class="invalid">
            <h1>无效 API 密钥或密码</h1>
            <p>请检查您的 api 密钥和密码</p>
            <button class="return" onclick="window.history.go(-1)">返回</button>
        </div>`);
        } else {
            var data = readFeedbackData(apiKey);
            console.log(data);
            if (data.error.includes('Api key not found')) {
                res.write(`<style>
            .invalid {
                font-weight: 100;
                position: absolute;
                top: 40%;
                left: 50%;
                transform: translate(-50%, -50%);
                display: flex;
                justify-content: center;
                align-items: center;
                flex-direction: column;
                padding: 40px;
                background-color: rgb(240, 240, 240);
                border: 2px solid rgb(232, 232, 232);
                border-radius: 5px;
            }
            
            h1 {
                font-size: 2em;
                font-weight: 100;
                margin: 0;
                padding: 0;
            }
            
            .return {
                font-weight: 100;
                font-size: 26px;
                margin: 0;
                padding: 10px 20px;
                color: rgb(0, 0, 0);
                text-decoration: none;
                cursor: pointer;
                outline: none;
                border: none;
                background: linear-gradient(to right, rgb(167, 170, 220) 0%, rgb(167, 170, 220) 49.8%, #f1592a 50%, #f1592a 100%);
                background-size: 200% 100%;
                background-position: right bottom;
                transition: all .5s cubic-bezier(0.3, 0.88, 0.76, 0.97);
            }
            
            .return:hover {
                background-position: left bottom;
            }
        </style>
        <div class="invalid">
            <h1>无效 API 密钥或密码</h1>
            <p>请检查您的 api 密钥和密码</p>
            <button class="return" onclick="window.history.go(-1)">返回</button>
        </div>`)
            } else if (data.error == 'no error') {
                res.write(`<style>
                .fb {
                    background-color: #73a0ff;
                    color: rgb(0, 0, 0);
                    font-weight: 100;
                    padding: 10px 20px;
                    border-radius: 4px;
                    font-size: 20px;
                    margin: 10px;
                }
                
                .fb * {
                    position: relative;
                }
                
                .fb .topic {
                    font-size: 40px;
                    margin: 15px;
                    padding: 0;
                }
                
                .fb .main {
                    font-size: 30px;
                    margin: 0 50px;
                    padding: 0;
                }
                
                .fb .date {
                    right: 5px;
                }
                
                .title {
                    font-weight: 100;
                    font-size: 50px;
                    margin: 50px;
                    padding: 0;
                }

                hr {
                    max-width: 80%;
                    border: 0;
                    border-bottom: 1px solid #ccc;
                }
                
                a {
                    text-decoration: none;
                    color: rgb(0, 0, 0);
                    font-weight: 100;
                }
            </style>
            <center>
                <p class="title">${user} 用户反馈</p>
            </center>`);
                for (let i = 0; i < data.data.length; i++) {
                    res.write(`
                <div class="fb">
                    <p class="topic">${data.data[i].topic}</p>
                    <p class="main">${data.data[i].message}-${data.data[i].message}</p>
                    <p class="date">${data.data[i].date}</p>
                </div>`);
                }
            }
        }
        res.end(`<hr><center><a>以上为反馈内容</a></center></body></html>`);
    } catch (err) {
        console.log(err);
    }
});

var readFeedbackData = (key) => {
    var dataPath = __dirname + jsonPath + key + '.json';
    // check if the file exists
    if (fs.existsSync(dataPath)) {
        var data = fs.readFileSync(dataPath);
        data = JSON.parse(data);
        data['error'] = 'no error';
        return data;
    } else {
        return { "error": "Api key not found : " + key };
    }
}

app.get('/send', (req, res) => {
    var apiKey = req.query.api;
    var user = req.query.user;
    var topic = req.query.topic;
    var message = req.query.message;
    var date = new Date();
    res.setHeader('Content-Type', 'application/json');
    if (apiKey == undefined || user == undefined || topic == undefined || message == undefined) {
        res.end(`{"error": "invalid parameters"}`);
    }
    var data = {
        "topic": topic,
        "user": user,
        "message": message,
        "date": date.toLocaleString()
    }
    createFeedbackData(apiKey, data);
    res.end(JSON.stringify(data));
});

var createFeedbackData = (key, data) => {
    var dataPath = __dirname + jsonPath + key + '.json';
    var orgin = readFeedbackData(key);
    orgin.data.push(data);
    console.log(orgin.data);
    fs.writeFileSync(dataPath, JSON.stringify(orgin));
}

app.get('/create', (req, res) => {
    var apiYes = true;
    while (apiYes) {
        // rendom a key in 64 places
        var key = '';
        var chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-';
        for (var i = 0; i < 64; i++) {
            key += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        if (fs.existsSync(__dirname + jsonPath + key + '.json')) {
            apiYes = true;
        } else {
            apiYes = false;
        }
    }
    var password = '';
    var name = '';
    res.write(`
    <!DOCTYPE html>
<html>

<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Create an api key</title>
    <style>
        input {
            width: 500px;
            height: 60px;
            font-size: 20px;
            margin: 10px;
            padding: 2px 10px;
            border: 2px solid #ccc;
            border-bottom: 5px solid rgb(123, 156, 255);
            border-radius: 4px;
            outline: none;
            background-color: transparent;
            font-weight: 100;
        }
        
        .formTip {
            position: relative;
            left: -500px;
            z-index: 2;
            color: rgb(0, 0, 0);
            top: 0px;
            transition: .3s;
            background-color: white;
            padding: 0 5px;
            border-radius: 4px;
            font-size: 20px;
            font-weight: 100;
        }
        
        .form {
            padding: 50px;
            border-radius: 4px;
            position: absolute;
            left: 50%;
            top: 50%;
            transform: translate(-50%, -50%);
            height: 500px;
        }
        
        button {
            width: 520px;
            height: 60px;
            font-size: 20px;
            margin: 10px;
            padding: 2px 10px;
            border: 2px solid #ccc;
            border-radius: 4px;
            outline: none;
            background-color: transparent;
            font-weight: 100;
            transition: .5s;
        }
        
        button:hover {
            background-color: rgb(255, 225, 172);
        }
        
        @keyframes out {
            0% {
                height: 500px;
                opacity: 1;
            }
            100% {
                height: 0px;
                opacity: 0;
            }
        }
        
        @keyframes in {
            0% {
                height: 0px;
                opacity: 0;
            }
            100% {
                height: 500px;
                opacity: 1;
            }
        }
        
        p {
            font-weight: 100;
            font-size: 26px;
        }
    </style>
</head>

<body>
    <div class="form" id="f">
        <!-- username, password and confirm pw &&  -->
        <div class="form-group">
            <input type="text" class="form-control" id="username" placeholder="Username">
        </div>
        <div class="form-group">
            <input type="text" class="form-control" id="password" placeholder="Password">
        </div>
        <div class="form-group">
            <input type="text" class="form-control" id="confirm" placeholder="Confirm password">
        </div>
        <button class="submit" onclick="confirmData()">Submit</button>
    </div>
    <div class="form" id="c" style="display: none;">
        <p>Please confirm and remember the information below</p>
        <p id="Username"></p>
        <p id="Password"></p>
        <p id="Apikey">Api key: ${key}</p>
        <button id="s">Confirm and create</button>
    </div>
    <script>
        var username = document.getElementById('username');
        var password = document.getElementById('password');
        var confirmX = document.getElementById('confirm');
        var submit = document.getElementsByClassName('submit')[0];

        var confirmData = () => {
            if (username.value != '') {
                /*if email.value is not email*/
                if (password.value != '' && password.value == confirmX.value) {
                    document.getElementById('f').style.animation = 'out 1s';
                    setTimeout(() => {
                        document.getElementById('f').style.display = 'none'
                        document.getElementById('c').style.animation = 'in 1s';
                        document.getElementById('c').style.display = 'block';
                    }, 1000);
                    document.getElementById('Username').innerHTML = 'Username: ' + username.value;
                    document.getElementById('Password').innerHTML = 'Password: ' + password.value;
                    document.getElementById('s').onclick = () => {
                        location.href = '/api/create?username=' + username.value + '&password=' + password.value + '&apikey=' + document.getElementById('Apikey').innerHTML.split(' ')[2];
                    }

                } else if (password.value == '') {
                    message('Please input password');
                } else if (password.value != confirmX.value) {
                    message('Comfirm password is not correct');
                }

            } else {
                message('Please input username');
            }
        };
    </script>
    <script src="https://xchuangc.github.io/messagejs/message.js"></script>
    <script>
        startXmessage( /*Config*/ );
    </script>
</body>

</html>
    `);
    res.end();
});

app.get('/api/create', (req, res) => {
    var username = req.query.username;
    var password = req.query.password;
    var apikey = req.query.apikey;
    if (username || password || apikey) {
        createApiKey(apikey, password, username);
        res.sendFile(__dirname + '/public/apiCreateS.html');
    } else {
        res.sendFile(__dirname + '/public/siteError.html');
    }
});

var createApiKey = (key, password, name) => {
    var dataPath = __dirname + jsonPath + key + '.json';
    fs.writeFileSync(dataPath, `{"data":[]}`);
    var user = fs.readFileSync(__dirname + '/data.json');
    user = JSON.parse(user);
    var Xuser = user.users;
    Xuser.push({
        "password": password,
        "key": key,
        "userId": name
    });
    user.users = Xuser;
    fs.writeFileSync(__dirname + '/data.json', JSON.stringify(user));
}


lintening.listen(port, function() {
    console.log('listening on *:' + port);
});