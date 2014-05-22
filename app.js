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


var mysql = require('mysql');


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

// app.use('/tvko',function(req,res){
//     // console.log(req.query);

//     var tvkoUrl = req.query.url;

//     request(tvkoUrl,function(error,response,body){
//         if (!error && response.statusCode ==200) {

//             var window = jsdom.jsdom(body).parentWindow;

//             jsdom.jQueryify(window, "http://code.jquery.com/jquery.js",function(){
//                 var contentHtml = window.$('div.video').html();
//                 var sTitle = window.$('.post-top').find('a:first').text();

//                 // console.log(contentHtml);

//                 wp.newPost({title:sTitle,status:'publish',content:contentHtml,author:1},function(){console.log(arguments)});
//                 res.render('parser',{title:sTitle,contents:contentHtml});

//             });
//         };
//     });
// });


// app.use('/tvkoList',function(req,res){

//     var tvkoUrl = 'http://tvko.us/page/1/';

//     request(tvkoUrl,function(error,response,body){
//         if (!error && response.statusCode ==200) {

//             var window = jsdom.jsdom(body).parentWindow;

//             jsdom.jQueryify(window, "http://code.jquery.com/jquery.js",function(){

//                 var contentHtml = window.$('div.col-left').html();

//                 // window.$('div.col-left').find('a').each(function(){
//                 //     console.log($(this).text());
//                 // });

//                 console.log(window.$('div.col-left').find('div.inside').length);

//                 // res.render('parser',{title:sTitle,contents:contentHtml});

//             });
//         };
//     });

// });

function getVideo(url){

    if (aPostedURL.indexOf(url)>(-1)) {
        console.log('중복');
        
        // request(url,function(error,response,body){
        //     if (!error && response.statusCode ==200) {

        //         var window = jsdom.jsdom(body).parentWindow;

        //         jsdom.jQueryify(window, "http://code.jquery.com/jquery.js",function(){
        //             var contentHtml = window.$('div.video').html();
        //             var sTitle = window.$('.post-top').find('a:first').text();

        //             // console.log(contentHtml);
        //             console.log('url : ',aPostedURL[aPostedURL.indexOf(url)],'id : ',aPostID[aPostedURL.indexOf(url)]);
        //             wp.editPost(aPostID[aPostedURL.indexOf(url)],{title:sTitle,status:'publish',content:contentHtml,author:1},function(){
        //                 console.log(arguments);
        //                 writeLog();
        //             });

        //         });
        //     };
        // });



        return;
    };

    request(url,function(error,response,body){
        if (!error && response.statusCode ==200) {
            console.log('getVideo성공');
            var window = jsdom.jsdom(body).parentWindow;

            jsdom.jQueryify(window, "http://code.jquery.com/jquery.js",function(){
                var contentHtml = window.$('div.video').html();
                var sTitle = window.$('.post-top').find('a:first').text();

                // console.log(contentHtml);

                wp.newPost({title:sTitle,status:'publish',content:contentHtml,author:1},function(){
                    // aPostedURL.push(url);
                    // aPostID.push(arguments['1']);
                    // console.log('url : ',aPostedURL[aPostedURL.indexOf(url)],'id : ',aPostID[aPostedURL.indexOf(url)]);
                    console.log(arguments);
                    writeLog();
                });

            });
        };
    });
};


function test(page){
    console.log(page,'시작');
    // for(var i=page;i>0;i--){
        var tvkoUrl = 'http://tvko.us/page/'+page;

        request(tvkoUrl,function(error,response,body){
            if (!error && response.statusCode ==200) {
                console.log('req성공');
                var window = jsdom.jsdom(body).parentWindow;

                jsdom.jQueryify(window, "http://code.jquery.com/jquery.js",function(){

                    var contentHtml = window.$('div.col-left').html();

                    window.$('div.col-left').find('div.inside > a').each(function(){
                        var url = window.$(this).attr('href');
                        getVideo(url);
                        // console.log('제목 : ',window.$(this).attr('title'),'\n주소 : ',window.$(this).attr('href'));
                    });


                    // res.render('parser',{title:sTitle,contents:contentHtml});

                });
            };
        });

    // }//for
    
}







function getVideo2(url){

    // if (aPostedURL.indexOf(url)>(-1)) {
    //     console.log('중복');

    //     request(url,function(error,response,body){
    //         if (!error && response.statusCode ==200) {

    //             var window = jsdom.jsdom(body).parentWindow;

    //             jsdom.jQueryify(window, "http://code.jquery.com/jquery.js",function(){
    //                 var contentHtml = window.$('div.video').html();
    //                 var sTitle = window.$('.post-top').find('a:first').text();

    //                 // console.log(contentHtml);
    //                 console.log('url : ',aPostedURL[aPostedURL.indexOf(url)],'id : ',aPostID[aPostedURL.indexOf(url)]);
    //                 wp.editPost(aPostID[aPostedURL.indexOf(url)],{title:sTitle,status:'publish',content:contentHtml,author:1},function(){
    //                     console.log(arguments);
    //                 });

    //             });
    //         };
    //     });



    //     return;
    // };

    if (oPoosted[url]) {
        console.log('중투더복');

        jsdom.env({
            url: url,
            src: [jquery],
            done: function (errors, window){
                var $ = window.$;
                var contentHtml = $('div.video').html();
                var sTitle = $('.post-top').find('a:first').text();

                // console.log(contentHtml);

                wp.editPost(oPoosted[url],{title:sTitle,status:'publish',content:contentHtml,author:1},function(){
                    console.log(arguments);
                });
            }
        });

        return;
    };


    jsdom.env({
        url: url,
        src: [jquery],
        done: function (errors, window){
            var $ = window.$;
            var contentHtml = $('div.video').html();
            var sTitle = $('.post-top').find('a:first').text();

            // console.log(contentHtml);

            wp.newPost({title:sTitle,status:'publish',content:contentHtml,author:1},function(){
                oPoosted[url] = arguments['1'];
                // aPostedURL.push(url);
                // aPostID.push(arguments['1']);
                // console.log('url : ',aPostedURL[aPostedURL.indexOf(url)],'id : ',aPostID[aPostedURL.indexOf(url)]);
                console.log(arguments);
            });
        }
    });

};


function test2(page){
    console.log(page,'페이지 파싱');
    var tvkoUrl = 'http://tvko.us/page/'+page;  
    
    jsdom.env({
        url:tvkoUrl,
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

// for(var i=10;i>0;i--){
//     test2(i);
// }

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

//1,2페이지 10분만다 파싱
// setInterval(function(){test2(1);test2(2);},10*60*1000);


//로그파일 5분 후 저장
// setInterval(function(){writeLog();},5*60*1000);

// test(20);
// getVideo('http://tvko.us/tudou-%EC%8A%A4%ED%83%80%EB%89%B4%EC%8A%A4-140520/');

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
