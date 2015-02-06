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


//몽고DB
var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/test');

var db = mongoose.connection;

db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function callback() {
    console.log("db오픈 완료.");
    //처음 실행시 1~2페이지 파싱
    doParse(1);
    doParse(2);
});


var VideoSchema = mongoose.Schema({
    url: String
});
var Video = mongoose.model('videoModel', VideoSchema);




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


function getVideo2(url) {
    Video.find({
        url: url
    }, function (err, res) {

        if (err)
            throw err;
        else if (res.length) {
//            console.log('디비에 있다');
        } else {
//            console.log('디비중복아님');
            var video = new Video({
                url: url
            });


            jsdom.env({
                url: url,
                src: [jquery],
                done: function (errors, window) {
                    var $ = window.$;
                    var contentHtml = $('div.video').html();
                    var sTitle = $('.post-top').find('a:first').text();

                    wp.newPost({
                        title: sTitle,
                        status: 'publish',
                        content: contentHtml,
                        author: 1
                    }, function () {
                        //                        oPoosted[url] = arguments['1'];
                        console.log(arguments);

                        video.save(function (err) {
                            if (err) {
                                console.log(err);
                                throw err;
                            }
                            console.log('db저장 성공');
                        });
                        
                    });
                }
            });
        }
    });
};


function parseDrama(page) {
    console.log(page, '페이지 파싱');
    var dramaUrl = 'http://julytv.com/category/drama/page/' + page;

    jsdom.env({
        url: dramaUrl,
        src: [jquery],
        done: function (errors, window) {
            var $ = window.$;
            var contentHtml = $('div.col-left').html();

            $('div.col-left').find('div.inside > a').each(function () {
                var postUrl = $(this).attr('href');

                setTimeout(getVideo2(postUrl), 10 * 1000);
            });
        }
    });
}

function parseShow(page) {

    var showUrl = 'http://julytv.com/category/show/page/' + page;

    jsdom.env({
        url: showUrl,
        src: [jquery],
        done: function (errors, window) {
            var $ = window.$;
            var contentHtml = $('div.col-left').html();

            $('div.col-left').find('div.inside > a').each(function () {
                var postUrl = $(this).attr('href');

                setTimeout(getVideo2(postUrl), 10 * 1000);

            });
        }
    });
}



function doParse(parsePage) {
    setTimeout(function () {
        parseDrama(parsePage);
        parseShow(parsePage);
    }, 3 * 1000);
}


//20분마다 반복
setInterval(function () {
    console.log('반복 파싱시작');
    doParse(1);
}, 20 * 60 * 1000);




/// catch 404 and forward to error handler
app.use(function (req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

/// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function (err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function (err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});


module.exports = app;
