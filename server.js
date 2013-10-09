var express = require('express');
var request = require('request');
var engines = require('consolidate');
var app = express();

var play_token;

app.use(express.logger());
app.use(express.static(__dirname + '/public'));
app.use(express.bodyParser());
app.use(express.methodOverride());

app.configure(function(){
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
});

app.get('/download', function(req, resp){
  resp.render('download');
});

app.post('/playlist', function(req, resp){
  var playlist_url = req.body.playlist_url;
  var matches, playlist_id;
  var regex = /mixes\/(\d+)/gi;

  // Get the playlist ID from visiting the playlist URL
  request(playlist_url, function(error, response, body){
    matches = regex.exec(body);
    playlist_id = parseInt(matches[1]);

    // if we have a valid playlist ID
    if ( playlist_id > 0 ) {

      // let us get a token
      request.get({url: 'http://8tracks.com/sets/new?format=jsonh', json: true},
        function(error, response, body){
          play_token = body.play_token;

          var song = get_next_song(play_token, playlist_id);
          // console.log(song);

      });
    }
  });

  resp.end();
});

var get_next_song = function ( play_token, playlist_id ){
  var song = false;
  var b = request.get({url: 'http://8tracks.com/sets/' + play_token + '/next?mix_id=' + playlist_id + '&format=jsonh', json:true});

};

var port = process.env.PORT || 3000;
app.listen(port);
console.log('Listening on port ' + port);

