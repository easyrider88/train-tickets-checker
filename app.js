var req = require('request');
var cheerio = require('cheerio');
var twillio = require('twilio')('AC98b30c9900dca0548f5c074b6471dd8c', '51392b4f1bf2a34d2b1bee234532fec5');
var express = require('express');

var url = 'https://dprc.gov.ua/show.php?transport_type=2&src=22204001&dst=22218000&dt=2015-12-29&ret_dt=2001-01-01&ps=ec_privat';
var email_url = 'https://node-emailer.herokuapp.com/wbserg@gmail.com';

var receivers = ['mistery3q@gmail.com'];

var phones = ['+380637492161', '+380953343786'];

var neededTrain = '115О';

var halfAnHour = 1800000;

var halfAminute = 30000;

console.log('starting server...');
_startServer();
console.log('starting interval...');
setInterval(_doWork, halfAnHour);

function _doWork(){
  req(url, function (err, res, body) {
    if (!err && res.statusCode == 200) {
      var html = cheerio.load(body);
      var tables = html('#tables').html();

      console.log('checking needed train 115 O');
      var trains = [];
      html('#tables .info_row.train').each(function(i, el){
        trains.push(html(this).text());
      });
      console.log(trains);
      if (_isNeededTrainExists(trains, neededTrain)) {
        phones.forEach(function(phone) {
          _sendSms(phone);
        });
      } else {
        console.log('needed train 115 O not exist');
      }

      console.log('sending email...');
      _sendEmails(receivers, tables);
    }
  });
};

function _sendEmails(receivers, msg){
  receivers.forEach(function(email){

    var model = {
      to: email,
      subject: 'Билеты на Львов',
      message: msg
    };

    var headers = {};
    headers[process.env.SECRET_HEADER] = process.env.SECRET;
    req({
      method: "PUT",
      uri: email_url + ',' + email,
      json: model,
      headers: headers
    }, function(err, httpResponse) {
      if (!err && httpResponse.statusCode === 200) {
        console.log('email successfuly send');
      } else {
        console.error('error while sending contact email');
      }
    });
  });
};

function _sendSms(phone){

  console.log('sending sms');
  //Send an SMS text message
  twillio.sendMessage({

      to: phone, // Any number Twilio can deliver to
      from: '+16502496493', // A number you bought from Twilio and can use for outbound communication
      body: 'Есть места на нужный нам поезд 115 O' // body of the SMS message

  }, function(err, responseData) { //this function is executed when a response is received from Twilio

      if (!err) { // "err" is an error received during the request, if any
        console.log('sent');
          // "responseData" is a JavaScript object containing data received from Twilio.
          // A sample response from sending an SMS message is here (click "JSON" to see how the data appears in JavaScript):
          // http://www.twilio.com/docs/api/rest/sending-sms#example-1

          console.log(responseData.from); // outputs "+14506667788"
          console.log(responseData.body); // outputs "word to your mother."

      } else {
        console.log('sent error');
        console.log(err);
      }


  });
};

function _isNeededTrainExists(trains, trainNum){
  var exist = false;
  trains.forEach(function (t){
    if (t == trainNum) {
      exist = true;
    }
  });

  return exist;
};

function _startServer(){
  var app = express();
  var port = process.env.PORT || 1111;

  app.get('/', function(req, res, next) {
    res.send('how are you doing?');
    res.end();
  });

  console.log('express server listenning on port: %d', port);
  // start app
  app.listen(port);
};
