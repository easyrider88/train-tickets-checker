var req = require('request');

var halfAnHour = 1800000;

var halfAminute = 30000;

setInterval(_keepAlive, halfAminute);

function _keepAlive(){
  req('http://train-tickets-checker.herokuapp.com/', function (err, res, body) {
    console.log(body);
  });
};
