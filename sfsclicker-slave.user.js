// ==UserScript==
// @name        SFS Clicker - Slave
// @namespace   https://violentmonkey.github.io
// @version     1.1
// @description  try to take over the world!
// @author       You
// @match        https://www.mysfs.net/home/index/*
// @require      http://code.jquery.com/jquery-latest.min.js
// @downloadURL        https://github.com/007roy/sfsclicker/raw/main/sfsclicker-slave.user.js
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_notification
// ==/UserScript==

var jQuery = window.jQuery;
if(!GM_getValue('MINE_DATA',false)) return;
var playerListIndex = GM_getValue('PlayerListIndex',0);
var playerList = GM_getValue('PlayerList',[]);
if(playerList.length <=0) return;
var player = playerList[playerListIndex];
var playerDetails = GM_getValue('PlayerDetails', []);

setTimeout(function(){
      if(playerListIndex > 2){
            //done
            GM_setValue('MINE_DATA', false);
            GM_setValue('PlayerListIndex',0);
      }
      else{
            playerListIndex++;
            GM_setValue('PlayerListIndex',playerListIndex);
            parsePage();
            window.location.href = 'https://www.mysfs.net/home/index/'+playerList[playerListIndex].playerId;
      }
}, 1000);

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
