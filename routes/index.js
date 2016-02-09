var express = require('express');
var router = express.Router();
var request = require("request");
var cheerio = require("cheerio");
var json2csv = require("json2csv");
var nedb = require("nedb");
var async = require("async");
var _ = require("lodash");
var fs = require("fs");


var db = new nedb({ filename: "data.nedb", autoload: true });


router.get("/progress", (req, res) => {
    db.count({ status: "pending" }, (err, count) => {
        db.find({}, (err, docs) => {
            res.render("progress", {
                pending: count,
                state: docs
            });
        });
    });
});


router.get("/last", (req, res) => {
	res.send(fs.readFileSync("last.html"));
});


router.get("/download", (req, res) => {
    db.find({ status: "done" }, (err, docs) => {
        json2csv({ data: docs }, (err, csv) => {
            res.set('Content-disposition', 'attachment; filename=download.csv');
            res.set('Content-Type', 'application/octet-stream');
            res.send(csv);
        });
    });
});


router.get("/", (req, res) => {
    res.render("index");
});


router.post("/", (req, res) => {
    var list = req.body.list.match(/[^\r\n]+/g);
    async.each(list, (name, done) => {
		var id = name.replace(" ", "-");
        db.insert({
            _id: id,
            name: name,
            status: "pending"
        }, () => done());
    }, () => {
        res.redirect("/progress");
    });
});


function work() {
    db.findOne({ status: "pending" }, (err,doc) => {
        if (err) console.error(err);
        if (err || !doc) return setTimeout(work, 1000);
        console.log("grabbing:", doc._id);

        var options = {
            url: "https://angel.co/" + doc._id,
            headers: {
                "Host": "angel.co",
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/48.0.2564.103 Safari/537.36"
            }
        };

        request(options, (err, resp, body) => {
			fs.writeFileSync("last.html", body);
            var $ = cheerio.load(body);
            var links = $(".links.mobile");
            var values = {
                status: "done",
                twitter: links.find(".twitter_url").attr("href"),
                facebook: links.find(".facebook_url").attr("href"),
                linkedin: links.find(".linkedin_url").attr("href"),
                blog: links.find(".blog_url").attr("href"),
                company: links.find(".company_url").attr("href")
            };
            db.update({ _id: doc._id}, {$set:values}, (err) => {
                if (err) console.error(err);
                setTimeout(work, 1000);
            });
        });
    });
}


setTimeout(work, 1000);


module.exports = router;
