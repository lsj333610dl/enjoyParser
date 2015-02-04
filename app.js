var express = require('express');
var path = require('path');
var favicon = require('static-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var routes = require('./routes/index');
var users = require('./routes/users');

var request = require('request');
var jsdom = require('jsdom');
var cheerio = require('cheerio');
var url = require('url');

var wordpress = require('wordpress');
var wp = wordpress.createClient({
    "url": 'http://enjoylimit.tv', 
    "username": 'enjoylimit', 
    "password": '963852dl' 
});

var fs = require("fs");
var jquery = fs.readFileSync("./jquery.js", "utf-8");

var aPostedURL = [];
var aPostID = [];
var oPoosted = {};

fs.readFile('./posted.enjoy', 'utf8', function(err, data) {
  
    if (!err) {
        oPoosted = JSON.parse(data);
        console.log("로그 로드완료.");
        //처음 실행시 1페이지 파싱
        doParse(1);
    };
});




var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(favicon());
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));


function getVideo2(url){

    if (oPoosted[url]) {
//        console.log('중복자료');
        return;
    };

    jsdom.env({
        url: url,
        src: [jquery],
        done: function (errors, window){
            var $ = window.$;
            var contentHtml = $('div.video').html();
            var sTitle = $('.post-top').find('a:first').text();

            wp.newPost({title:sTitle,status:'publish',content:contentHtml,author:1},function(){
                oPoosted[url] = arguments['1'];
//                console.log(arguments);
                writeLog();
            });
        }
    });

};


function parseDrama(page){
    console.log(page,'페이지 파싱');
    var dramaUrl = 'http://julytv.com/category/drama/page/'+page;  

    jsdom.env({
        url:dramaUrl,
        src:[jquery],
        done:function (errors, window) {
            var $ = window.$;
            var contentHtml = $('div.col-left').html();

            $('div.col-left').find('div.inside > a').each(function(){
                var postUrl = $(this).attr('href');

                setTimeout(getVideo2(postUrl),5*1000);
            });
        }
    });    
}

function parseShow(page){

    var showUrl = 'http://julytv.com/category/show/page/'+page;  

    jsdom.env({
        url:showUrl,
        src:[jquery],
        done:function (errors, window) {
            var $ = window.$;
            var contentHtml = $('div.col-left').html();

            $('div.col-left').find('div.inside > a').each(function(){
                var postUrl = $(this).attr('href');
                
                setTimeout(getVideo2(postUrl),5*1000);
                
            });
        }
    });
}


function writeLog(){
    var filedata = JSON.stringify(oPoosted);
    fs.writeFile('./posted.enjoy', filedata, function(err) {
        if(err) throw err;
//        console.log('Log File write completed');
    });
}


function doParse(parsePage){
    setTimeout(function(){
        parseDrama(parsePage);
        parseShow(parsePage);
    },3*1000);
}


//30분마다 반복
setInterval(function(){
    console.log('반복 파싱시작');
    
    fs.readFile('./posted.enjoy', 'utf8', function(err, data) {

        if (!err) {
            oPoosted = JSON.parse(data);
            console.log("로그 로드완료.");

            doParse(1);
        };
    });
    
    
},30*60*1000);



/// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

/// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});


module.exports = app;
