// ==UserScript==
// @name        SFS Clicker - mysfs.net
// @namespace   https://violentmonkey.github.io
// @version     1.2
// @description  try to take over the world!
// @author       You
// @match       https://www.mysfs.net/players
// @require      http://code.jquery.com/jquery-latest.min.js
// @downloadURL        https://github.com/007roy/sfsclicker/raw/main/sfsclicker.user.js
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_notification
// ==/UserScript==

var jQuery = window.jQuery;
setTimeout(makePlayerList,1000);

function makePlayerList(){
  var playerList = [];
  var now = jQuery.now();
  jQuery.post('players/get_players_listing',{page: 1, player_type: 3, player_seach_string: ''},function(data){
    data.msg.forEach(function(item,index){
      var id = item.player_id;
      var lastOnline = item.player_connection;
      var url = 'https://www.mysfs.net/home/index/'+id;
      var daysOld = ((now/1000 - lastOnline)/1440).toFixed(1);
      console.log(lastOnline);
      var pls = `{'playerId':${id}, 'nickName':'${item.nick_name}', 'lastOnline': ${daysOld}}`;
      playerList.push(pls);
    });

    GM_setValue('PlayerList', playerList);
  },"json");

}

function parsePage(){
  var key = player.playerId;
  var nickName = player.nickName;
  var lastOnline = player.lastOnline;
  var lastReset = jQuery('#last_reset_' + key).val();
  var endRaiseTime = jQuery("#end_raise_time_" + key).val();
  var lastDigging = jQuery("#last_digging_" + key).val();
  var soldTimer = jQuery("#sold_timer_" + key).val();
  var lockTime = jQuery("#lock_time_" + key).val();
  var playerConnection = jQuery("#player_connection_" + key).val();
  var playerType = jQuery("#player_type_" + key).val();
  var currentTime = jQuery("#current_time").val(); 
  var connectionStatus = jQuery("#connect_status_cls_" + key).val()
  
  GM_setValue('PlayerDetails', playerDetails.push({
        'playerId': key,
        'nickName': nickName,
        'lastOnline': lastOnline,
        'nickName': player.nick_name,
        'lastReset': lastReset,
        'endRaiseTime': endRaiseTime,
        'lastDigging': lastDigging,
        'soldTimer': soldTimer,
        'lockTime': lockTime,
        'playerConnection': playerConnection,
        'playerType': playerType,
        'currentTime': currentTime,
        'connectionStatus': connectionStatus
  }));
};
