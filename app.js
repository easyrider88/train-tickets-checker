var req = require('request');
var cheerio = require('cheerio');

var url = 'https://dprc.gov.ua/show.php?transport_type=2&src=22204001&dst=22218000&dt=2015-12-29&ret_dt=2001-01-01&ps=ec_privat';
var email_url = 'https://node-emailer.herokuapp.com/wbserg@gmail.com';

var receivers = ['mistery3q@gmail.com'];

var halfAnHour = 1800000;

var halfAminute = 30000;

setInterval(_doWork, halfAnHour);

function _doWork(){
  req(url, function (err, res, body) {
    if (!err && res.statusCode == 200) {
      var html = cheerio.load(body);
      var tables = html('#tables').html();
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
    headers['whereTheQuestionsWhereTheAnswers'] = 'WhoLetTheDogOUT!Raf!';
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
