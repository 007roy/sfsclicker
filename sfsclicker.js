/ ==UserScript==
// @name        SFS Clicker - mysfs.net
// @namespace   Violentmonkey Scripts
// @match       https://www.mysfs.net/*
// @version     1.0
// @author      -
// @description 2/22/2021, 11:06:26 AM
// @require      http://code.jquery.com/jquery-latest.min.js
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
      var pls = `<a href='${url}'>${item.nick_name} lastOnline: ${daysOld}</a>}`;
      playerList.push(pls);
    });
    
    GM_setValue('PlayerList', playerList);
  },"json");

}