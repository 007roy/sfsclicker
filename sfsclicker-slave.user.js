// ==UserScript==
// @name        SFS Clicker - Slave
// @namespace   https://violentmonkey.github.io
// @version     1.0
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
var windowIndex = GM_getValue('WindowIndex',0);
//GM_setValue('WindowIndex',-1);
var playerListIndex = GM_getValue('PlayerListIndex'+windowIndex,0);
var player = GM_getValue('PlayerList'+windowIndex,[])[playerListIndex];
var playerDetails = GM_getValue('PlayerDetails'+windowIndex, []);

setTimeout(parsePage(), 1000);
GM_setValue('PlayerListIndex'+windowIndex, playerListIndex+1);
window.location.href = 'https://www.mysfs.net/home/index/'+player.player_id;

function parsePage(){
      var key = player.player_id;
      var lastReset = jQuery('#last_reset_' + key).val();
      var endRaiseTime = jQuery("#end_raise_time_" + key).val();
      var lastDigging = jQuery("#last_digging_" + key).val();
      var soldTimer = jQuery("#sold_timer_" + key).val();
      var lockTime = jQuery("#lock_time_" + key).val();
      var playerConnection = jQuery("#player_connection_" + key).val();
      var playerType = jQuery("#player_type_" + key).val();
      var currentTime = jQuery("#current_time").val(); 
      var connectionStatus = jQuery("#connect_status_cls_" + key).val()
      GM_setValue('PlayerDetails'+windowIndex, playerDetails.push({playerId: key, nickName: player.nick_name, lastReset: lastReset}));
};
