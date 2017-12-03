const linebot = require('linebot');
const express = require('express');
var request = require("request")
const bodyParser = require('body-parser');

const AQI_URL = "http://opendata2.epa.gov.tw/AQI.json";
const SITE_NAME = '西屯';

var events = require('events'); 
var emitter = new events.EventEmitter(); 

const bot = linebot({
	channelId: process.env.CHANNEL_ID,
	channelSecret: process.env.CHANNEL_SECRET,
	channelAccessToken: process.env.CHANNEL_ACCESS_TOKEN
});

const app = express();
app.set('view engine', 'ejs');

const parser = bodyParser.json({
	verify: function (req, res, buf, encoding) {
		req.rawBody = buf.toString(encoding);
	}
});

app.get('/',function(req,res){
    let json;

    request({
        url: AQI_URL,
        json: true
    }, function (error, response, body) {
        if (!error && response.statusCode === 200) {
            let data;
            
            for (i in body) {
                if (body[i].SiteName == SITE_NAME) {
                    data = body[i];
                    break;
                }
            }

            res.render('index', {AQI:data});
            console.log(body.length) // Print the json response
        }
    });
});

app.post('/linewebhook', parser, function (req, res) {
	if (!bot.verify(req.rawBody, req.get('X-Line-Signature'))) {
		return res.sendStatus(400);
	}
	bot.parse(req.body);
	return res.json({});
});

bot.on('message', function (event) {
	event.reply(event.message.text).then(function (data) {
		console.log('Success', data);
	}).catch(function (error) {
		console.log('Error', error);
	});
});

app.listen(process.env.PORT || 80, function () {
	console.log('LineBot is running.');
});