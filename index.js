const linebot = require('linebot');
const express = require('express');
const fs = require("fs");

const bot = linebot({
	channelId: process.env.CHANNEL_ID,
	channelSecret: process.env.CHANNEL_SECRET,
	channelAccessToken: process.env.CHANNEL_ACCESS_TOKEN
});

const app = express();

const linebotParser = bot.parser();

app.get('/',function(req,res){
    res.send('Hello World!');
});

app.post('/linewebhook', linebotParser);


function limitRandomNumber(n, m) {
	var c = m - n + 1;
	return Math.floor(Math.random() * c + n);
}


var FoodList = ['711','弘爺','酷比食堂','彭彭炒飯','ㄓㄠˇ餐吃了沒','學府牛肉麵'];



bot.on('message', function (event) {
	if (event.message.text.match('吃啥') || event.message.text.match('吃什麼') || event.message.text.match('吃甚麼') != null) {


		var ListLength = FoodList.length;
		event.reply(FoodList[limitRandomNumber(0, ListLength - 1)]).then(function (data) {
			// success 
			console.log(msg);
		}).catch(function (error) {
			// error 
			console.log('error');
		});
		
	}
	else if (event.message.text.match('新增餐廳:') != null || event.message.text.match('新增餐廳：') != null) {

		var newString = event.message.text.substring(5);
		if (FoodList.indexOf(newString) == -1) {

			FoodList.push(newString);
			event.reply('已新增' + newString + '。').then(function (data) {
				// success 
				console.log(msg);
			}).catch(function (error) {
				// error 
				console.log('error');
			});

		}
		else {
			event.reply('裡面已經有這個了啦').then(function (data) {
				// success 
				console.log(msg);
			}).catch(function (error) {
				// error 
				console.log('error');
			});
		}
	}
	else if (event.message.text.match('移除餐廳:') != null || event.message.text.match('移除餐廳：') != null) {

		var newString = event.message.text.substring(5);
		if (FoodList.indexOf(newString) != -1) {

			var newnewString = FoodList.splice(FoodList.indexOf(newString), 1);

			event.reply('已移除' + newnewString + '。').then(function (data) {
				// success 
				console.log(msg);
			}).catch(function (error) {
				// error 
				console.log('error');
			});
		} else {
			event.reply('裡面沒有這間啦').then(function (data) {
				// success 
				console.log(msg);
			}).catch(function (error) {
				// error 
				console.log('error');
			});
		}
	}
	else if (event.message.text == '全部的餐廳' || event.message.text == '所有餐廳' || event.message.text == '全部餐廳' || event.message.text == '所有的餐廳') {

		var _all = FoodList.join('、').toString();

		event.reply(_all).then(function (data) {
			// success 
			console.log(msg);
		}).catch(function (error) {
			// error 
			console.log('error');
		});
	}
	else if (event.message.text == 'Admin') {
		var ForMeToTestRestaurant = '\'' + FoodList.join('\',\'').toString() + '\''; //把全部的餐廳變成我要的格式
		event.reply(ForMeToTestRestaurant);
	}
});

app.listen(process.env.PORT || 80, function () {
	console.log('LineBot is running.');
});