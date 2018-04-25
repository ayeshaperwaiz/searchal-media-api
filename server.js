// Require dependencies
var express = require('express');
var bodyParser = require('body-parser');
var Twitter = require('twitter');
var mongoose = require('mongoose');
var cors = require('cors');
var Tweet = require('./Tweet');

// Express instance
var app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cors());

// Router instance
var router = express.Router();

// Connect to mLab Database
mongoose.connect(process.env.DB);

var client = new Twitter({
    consumer_key: process.env.CONSUMER_KEY,
    consumer_secret: process.env.CONSUMER_SECRET,
    access_token_key: process.env.ACCESS_TOKEN,
    access_token_secret: process.env.ACCESS_SECRET
});


router.route('/search')
    .post(function(req, res) {
        if (!req.body.searchKey) {
            res.json({success: false, msg: 'Please pass search key.'});
        }
        else {
            var key = req.body.searchKey;

            client.get('search/tweets', {q: key, result_type: 'popular'}, function (error, tweets, response) {

                var tweetEntry = new Tweet();

                tweetEntry.twid = tweets.statuses.id_str;
                tweetEntry.active = false;
                tweetEntry.author = tweets.statuses.user.name;
                tweetEntry.avatar = tweets.statuses.user.profile_image_url_https;
                tweetEntry.body = tweets.statuses.text;
                tweetEntry.date = tweets.statuses.created_at;
                tweetEntry.screenName = tweets.statuses.user.screen_name;

                tweetEntry.save(function (err) {
                    if (!err) {
                        res.json({message: 'Tweet created!'});
                    }
                });
            });
        }
    });

app.use('/', router);
app.listen(process.env.PORT || 3030);