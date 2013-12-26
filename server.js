/**
 * 8Tracks Playlist Downloader
 */

var express = require('express');
var request = require('request')
var engines = require('consolidate');
var app = express()
var emitter = new (require('events').EventEmitter)

// actual playtoken that is used in the session
var play_token;

// tracks
var tracks = []

app.use(express.logger());
app.use(express.static(__dirname + '/public'));
app.use(express.bodyParser());
app.use(express.methodOverride());

app.configure(function() {
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
});

app.get('/', function(req, resp) {
  resp.render('index');
});

app.post('/playlist', function(req, resp) {
  var playlist_url = req.body.playlist_url;
  var matches, playlist_id;
  var regex = /mixes\/(\d+)/gi;

  // Get the playlist ID from visiting the playlist URL
  request(playlist_url, function(error, response, body) {
    matches = regex.exec(body);
    playlist_id = parseInt(matches[1]);

    // if we have a valid playlist ID
    if (playlist_id > 0) {

      // let us get a token
      request.get({
          url: 'http://8tracks.com/sets/new?format=jsonh',
          json: true
        },
        function(error, response, body) {
          play_token = body.play_token;

          // start playing first track
          request.get({
              url: 'http://8tracks.com/sets/' + play_token + '/play?mix_id=' + playlist_id + '&format=jsonh',
              json: true
            },
            function(error, _response, body) {
              download_song(resp, play_token, playlist_id, body.set);
            });
        });
    }
  });

  // emitter.emit('end-download', resp);
});

var download_song = function(response, play_token, playlist_id, set) {
  // console.log(play_token, playlist_id, set);
  var track = set.track;

  // console.log(track);
  // track.track_file_stream_url
  // track.name
  // track.performer
  // track.release_name

  if (set.at_end) {
    emitter.emit('end-download', response);
  } else {
    // Add track to the temp listing
    emitter.emit('add-track', track);

    // Start getting next track
    request.get({
        url: 'http://8tracks.com/sets/' + play_token + '/next?mix_id=' + playlist_id + '&format=jsonh',
        json: true
      },
      function(error, _response, body) {
        download_song(response, play_token, playlist_id, body.set);
      });
  }
};

emitter.on('add-track', function(track){
  tracks.push(track);
});

emitter.on('end-download', function(response){
  response.json(tracks);
});

var port = process.env.PORT || 3000;
app.listen(port);
console.log('Listening on port ' + port);