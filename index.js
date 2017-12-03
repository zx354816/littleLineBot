const linebot = require('linebot');
const express = require('express');
var request = require("request")
const bodyParser = require('body-parser');

const AQI_URL = "http://opendata2.epa.gov.tw/AQI.json";
const SITE_NAME = '西屯';

var events = require('events'); 
var emitter = new events.EventEmitter(); 

function getAQI() {
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

            emitter.emit('aqiEvent', data); 
        }
    });
}

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
    getAQI();
    emitter.on ('aqiEvent', function (data) {
        res.render('index', {AQI:data});
    })
});

app.post('/linewebhook', parser, function (req, res) {
	if (!bot.verify(req.rawBody, req.get('X-Line-Signature'))) {
		return res.sendStatus(400);
	}
	bot.parse(req.body);
	return res.json({});
});

// 簡單回應訊息
// bot.on('message', function (event) {
// 	event.reply(event.message.text).then(function (data) {
// 		console.log('Success', data);
// 	}).catch(function (error) {
// 		console.log('Error', error);
// 	});
// });

bot.on('message', function (event) {
	switch (event.message.type) {
		case 'text':
			switch (event.message.text) {
				case 'Me':
					event.source.profile().then(function (profile) {
						return event.reply('Hello ' + profile.displayName + ' ' + profile.userId);
					});
					break;
				case '空氣':
					getAQI();
					emitter.on ('aqiEvent', function (data) {
						event.reply('\uDBC0\uDC84 ' + data.County + data.SiteName +
						'PM2.5指數：'+ data["PM2.5_AVG"] + 
					    '狀態：' + data.Status);
					});
					break;
				case 'Picture':
					event.reply({
						type: 'image',
						originalContentUrl: 'https://d.line-scdn.net/stf/line-lp/family/en-US/190X190_line_me.png',
						previewImageUrl: 'https://d.line-scdn.net/stf/line-lp/family/en-US/190X190_line_me.png'
					});
					break;
				case 'Location':
					event.reply({
						type: 'location',
						title: 'LINE Plus Corporation',
						address: '1 Empire tower, Sathorn, Bangkok 10120, Thailand',
						latitude: 13.7202068,
						longitude: 100.5298698
					});
					break;
				case 'Confirm':
					event.reply({
						type: 'template',
						altText: 'this is a confirm template',
						template: {
							type: 'confirm',
							text: 'Are you sure?',
							actions: [{
								type: 'message',
								label: 'Yes',
								text: 'yes'
							}, {
								type: 'message',
								label: 'No',
								text: 'no'
							}]
						}
					});
					break;
				case 'Multiple':
					return event.reply(['Line 1', 'Line 2', 'Line 3', 'Line 4', 'Line 5']);
					break;
				case 'Version':
					event.reply('linebot@' + require('../package.json').version);
					break;
				default:
					event.reply(event.message.text).then(function (data) {
						console.log('Success', data);
					}).catch(function (error) {
						console.log('Error', error);
					});
					break;
			}
			break;
		case 'image':
			event.message.content().then(function (data) {
				const s = data.toString('base64').substring(0, 30);
				return event.reply('Nice picture! ' + s);
			}).catch(function (err) {
				return event.reply(err.toString());
			});
			break;
		case 'video':
			event.reply('Nice movie!');
			break;
		case 'audio':
			event.reply('Nice song!');
			break;
		case 'location':
			event.reply(['That\'s a good location!', 'Lat:' + event.message.latitude, 'Long:' + event.message.longitude]);
			break;
		case 'sticker':
			event.reply({
				type: 'sticker',
				packageId: 1,
				stickerId: 1
			});
			break;
		default:
			event.reply('Unknow message: ' + JSON.stringify(event));
			break;
	}
});

app.listen(process.env.PORT || 80, function () {
	console.log('LineBot is running.');
});