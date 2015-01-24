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

app.use('/', routes);
app.use('/users', users);
app.use('/shopagent', function(req, res) {
    request('http://shopagent.co.kr/tour/board.php?bo_table=drama&wr_id=17784', function (error, response, body) {
        if (!error && response.statusCode == 200) {

            var window = jsdom.jsdom(body).parentWindow;

            jsdom.jQueryify(window, "http://code.jquery.com/jquery.js",function(){
                var contentHtml = window.$('table:nth-child(7)').find('p:first').html();
                console.log(contentHtml);

                res.render('parser',{contents:contentHtml});

            });
        }
    });
});





function getVideo2(url){

    if (oPoosted[url]) {
        console.log('중투더복');
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
                console.log(arguments);
                writeLog();
            });
        }
    });

};


function test2(page){
    console.log(page,'페이지 파싱');
    var tvkoUrlDrama = 'http://eeztv.com/category/drama/page/'+page;  

    jsdom.env({
        url:tvkoUrlDrama,
        src:[jquery],
        done:function (errors, window) {
            var $ = window.$;
            var contentHtml = $('div.col-left').html();

            $('div.col-left').find('div.inside > a').each(function(){
                var url = $(this).attr('href');
                getVideo2(url);
                // console.log('제목 : ',$(this).attr('title'),'\n주소 : ',$(this).attr('href'));
            });
        }
    });
    
    var tvkoUrlShow = 'http://eeztv.com/category/show/page/'+page;  

    jsdom.env({
        url:tvkoUrlShow,
        src:[jquery],
        done:function (errors, window) {
            var $ = window.$;
            var contentHtml = $('div.col-left').html();

            $('div.col-left').find('div.inside > a').each(function(){
                var url = $(this).attr('href');
                getVideo2(url);
                // console.log('제목 : ',$(this).attr('title'),'\n주소 : ',$(this).attr('href'));
            });
        }
    });
    
    
}


function writeLog(){
    var filedata = JSON.stringify(oPoosted);
    fs.writeFile('./posted.enjoy', filedata, function(err) {
        if(err) throw err;
        console.log('Log File write completed');
    });
}

setTimeout(function(){
    test2(2);
    test2(1);
},1000);





app.use('/writeLog',function(req,res){
    var filedata = JSON.stringify(oPoosted);
    fs.writeFile('./posted.enjoy', filedata, function(err) {
        if(err) throw err;
        console.log('Log File write completed');
    });
});

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
