var request = require('request');
var jsdom = require('jsdom');
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
    //처음 실행시 1페이지 파싱
    doParse(1);
//    doParse(2);
});


var VideoSchema = mongoose.Schema({
    url: String
});
var Video = mongoose.model('videoModel', VideoSchema);





function getVideo2(url) {
    Video.find({
        url: url
    }, function (err, res) {

        if (err)
            throw err;
        else if (res.length) {
            //            console.log('디비에 있다');
        } else {
            console.log('디비중복아님');
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

                getVideo2(postUrl);
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

                getVideo2(postUrl);

            });
        }
    });
}

function parseLatest() {
    var mainUrl = 'http://julytv.com';

    jsdom.env({
        url: mainUrl,
        src: [jquery],
        done: function (errors, window) {
            var $ = window.$;

            $('ul.four-col').find('div.post-thumb > a').each(function () {
                var postUrl = $(this).attr('href');
                //                console.log(postUrl);
                getVideo2(postUrl);

            });
        }
    });
}


function doParse(parsePage) {
    parseLatest();
    //    parseDrama(parsePage);
    //    parseShow(parsePage);
}


////10분마다 반복
//setInterval(function () {
//    console.log('반복 파싱시작');
//    doParse(1);
//}, 10 * 60000);