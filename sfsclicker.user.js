// ==UserScript==
// @name        SFS Clicker - mysfs.net
// @namespace   https://violentmonkey.github.io
// @version     1.2
// @description  try to take over the world!
// @author       You
// @match       https://www.mysfs.net/players
// @match       https://www.mysfs.net/home/index/*
// @require      http://code.jquery.com/jquery-latest.min.js
// @downloadURL        https://github.com/007roy/sfsclicker/raw/main/sfsclicker.user.js
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_notification
// ==/UserScript==

var jQuery = window.jQuery;
setTimeout(initUI,2000);

if(GM_getValue('MINE_DATA',false)){
  
  setTimeout(function(){
      var playerListIndex = GM_getValue('PlayerListIndex',0);
      var playerList = GM_getValue('PlayerList',[]);
      if(playerList.length <=0) return;
      var player = playerList[playerListIndex];
      var playerDetails = GM_getValue('PlayerDetails', []);
      if(playerListIndex >= 5){
            //done
            console.log('done mining');
            GM_setValue('MINE_DATA', false);
            GM_setValue('PlayerListIndex',0);
      }
      else{
            
            console.log('loading next page')
            playerListIndex++;
            GM_setValue('PlayerListIndex',playerListIndex);
            var output = parsePage(player);
            playerDetails.push(output);
            GM_setValue('PlayerDetails', playerDetails);
            var next = 'https://www.mysfs.net/home/index/'+playerList[playerListIndex].playerId;
            console.log(next);
            window.location.href = next;
      }
  }, 1000);
  
}else if(GM_getValue('BUILD_PLAYER_LIST',false)){
  setTimeout(makePlayerList,1000);
  GM_setValue('BUILD_PLAYER_LIST',false);
};

function makePlayerList(){
  var playerList = [];
  var now = jQuery.now();
  jQuery.post('players/get_players_listing',{page: 1, player_type: 3, player_seach_string: ''},function(data){
    data.msg.forEach(function(item,index){
      var id = item.player_id;
      var lastOnline = item.player_connection;
      var url = 'https://www.mysfs.net/home/index/'+id;
      var daysOld = ((now/1000 - lastOnline)/1440).toFixed(1);
      var pls = {'playerId':id, 'nickName':item.nick_name, 'lastOnline': daysOld};
      playerList.push(pls);
    });

    GM_setValue('PlayerList', playerList);
    //GM_setValue('MINE_DATA', true);
    location.reload();
  },"json");

}

function parsePage(player){
  
  var key = player.playerId;
  console.log("player: ", player);
  console.log("key: ", key);
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
  var output = {
        'playerId': key,
        'nickName': nickName,
        'lastOnline': lastOnline,
        'nickName': nickName,
        'lastReset': lastReset,
        'endRaiseTime': endRaiseTime,
        'lastDigging': lastDigging,
        'soldTimer': soldTimer,
        'lockTime': lockTime,
        'playerConnection': playerConnection,
        'playerType': playerType,
        'currentTime': currentTime,
        'connectionStatus': connectionStatus
  };
  
  return output;
}

function initUI(){
  jQuery('.logo').after(`<div id='sfsclicker'></div>`);
  jQuery('#sfsclicker').css({'font-size': '14px', 'color': '#fff'});
  jQuery('#sfsclicker').append("<button id='clickerbutton'>Do Stuff</button>")
  var pageId = parseInt(window.location.pathname.match(/[0-9]+/g)[0]);
  jQuery('#sfsclicker').append(pageId);
  jQuery('#sfsclicker').append(" thing: " + (jQuery("#current_time").val() - jQuery("#sold_timer_"+pageId).val()));
}
