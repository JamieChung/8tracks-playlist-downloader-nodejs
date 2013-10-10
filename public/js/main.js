$(document).ready(function(){
  $('#playlist-form').submit(function(){
    var playlist_url = $('#playlist-url').val();
    if ( !playlist_url ) {
      $('#playlist-url').focus();
    }

    return false;
  });
});