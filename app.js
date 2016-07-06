var express = require('express');
var app = express();
var request = require('request');
var bodyParser = require('body-parser');

app.use(bodyParser.json())

// Test
app.get('/hello', function(req, res){
  res.send('world!')
})

// To verify
app.get('/webhook', function (req, res) {
  if (req.query['hub.verify_token'] === 'super-super') {
    res.send(req.query['hub.challenge']);
  }
  res.send('Error, wrong validation token');
})


var token = "EAAHx2JthIs4BAG0FckNvXbdLCZAntSCTgTShgXzMSCNCRs3zGEWgE8ZCRIJY0aTtCPKOexxrfFxn6SZAx9yYPgToqlVUl32cCwzLWXhvTgPOnjJrDsMCU3Y4Be6mbMqgofltygZCY4zA0idXsWknP2qAjr9zeEBntYcEOojoHlsV24YZCTxeo";

function sendTextMessage(sender, text) {
  messageData = {
    text:text
  }
  request({
    url: 'https://graph.facebook.com/v2.6/me/messages',
    qs: {access_token:token},
    method: 'POST',
    json: {
      recipient: {id:sender},
      message: messageData,
    }
  }, function(error, response, body) {
    if (error) {
      console.log('Error sending message: ', error);
    } else if (response.body.error) {
      console.log('Error: ', response.body.error);
    }
  });
}

function sendGenericMessage(sender) {
    let messageData = {
        "attachment": {
            "type": "template",
            "payload": {
                "template_type": "generic",
                "elements": [{
                    "title": "Yoon and Hyeun",
                    "subtitle": "twin",
                    "image_url": "http://52.78.8.150/wp-content/uploads/2016/02/KakaoTalk_20160527_213832774.jpg",
                    "buttons": [{
                        "type": "web_url",
                        "url": "https://www.messenger.com",
                        "title": "visit site"
                    }, {
                        "type": "postback",
                        "title": "Postback",
                        "payload": "They are twin sisters",
                    }],
                }, {
                    "title": "Economics",
                    "subtitle": "behavior-economics",
                    "image_url": "http://52.78.8.150/wp-content/uploads/2016/05/behavior-economics.png",
                    "buttons": [{
                        "type": "postback",
                        "title": "Postback",
                        "payload": "Payload for second element in a generic bubble",
                    }],
                }]
            }
        }
    }
    request({
        url: 'https://graph.facebook.com/v2.6/me/messages',
        qs: {access_token:token},
        method: 'POST',
        json: {
            recipient: {id:sender},
            message: messageData,
        }
    }, function(error, response, body) {
        if (error) {
            console.log('Error sending messages: ', error)
        } else if (response.body.error) {
            console.log('Error: ', response.body.error)
        }
    })
}

function sendButtonMessage(sender){
  let messageData = {
    "attachment":{
      "type":"template",
      "payload":{
        "template_type":"button",
        "text":"What do you want to do next?",
        "buttons":[
          {
            "type":"web_url",
            "url":"https://petersapparel.parseapp.com",
            "title":"Show Website"
          },
          {
            "type":"postback",
            "title":"Start Chatting",
            "payload":"USER_DEFINED_PAYLOAD"
          }
        ]
      }
    }
  }
  request({
      url: 'https://graph.facebook.com/v2.6/me/messages',
      qs: {access_token:token},
      method: 'POST',
      json: {
          recipient: {id:sender},
          message: messageData,
      }
  }, function(error, response, body) {
      if (error) {
          console.log('Error sending messages: ', error)
      } else if (response.body.error) {
          console.log('Error: ', response.body.error)
      }
  })
}





var allSenders = {};

// Should do the things we want to do
app.post('/webhook/', function (req, res) {
  messaging_events = req.body.entry[0].messaging;
  for (i = 0; i < messaging_events.length; i++) {
    event = req.body.entry[0].messaging[i];
    var senderId = event.sender.id;
    allSenders[senderId] = true;

    if (event.message && event.message.text) {
      var text = event.message.text;
      if (text === 'Generic') {
          sendGenericMessage(senderId);
          continue
      }
      if (text === 'Mood') {
// 왜 아래부분을 넣으면 안 작동할까?
//          Object.keys(allSenders).forEach(function(senderId){
            sendTextMessage(senderId, "Hmm..from 1 to 10, I'm in mood "+ Math.floor(Math.random() * 10 + 1));
            continue
//        })
      }
      if (text === 'Button') {
          sendButtonMessage(senderId);
          continue
      }
      // Handle a text message from this sender
      console.log(text);
      console.log(Object.keys(allSenders));
      Object.keys(allSenders).forEach(function(senderId){
        sendTextMessage(senderId, "Text received, echo: "+ text.substring(0, 200));
      })
    }

    if (event.postback) {
         let text = JSON.stringify(event.postback)
         sendTextMessage(senderId, "Postback received: "+text.substring(0, 200), token)
         continue
    }

}




res.sendStatus(200);
});

app.listen(process.env.PORT || 3000)
