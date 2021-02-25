// ==UserScript==
// @name        SFS Clicker - mysfs.net
// @namespace   https://violentmonkey.github.io
// @version     1.3
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



function makePlayerList(){
  //var playerList = [];
  //var now = jQuery.now();
  jQuery.post('https://www.mysfs.net/players/get_players_listing',
    {page: 1, player_type: 3, player_seach_string: ''},
    function(data){
    /*
    data.msg.forEach(function(item,index){
      var id = item.player_id;
      var lastOnline = item.player_connection;
      var url = 'https://www.mysfs.net/home/index/'+id;
      var daysOld = ((now/1000 - lastOnline)/1440).toFixed(1);
      var pls = {'playerId':id, 'nickName':item.nick_name, 'lastOnline': daysOld};
      playerList.push(pls);
    });*/

    GM_setValue('PlayerList', data.msg);
    //GM_setValue('MINE_DATA', true);
    //location.reload();
    },"json");
}

function GetPageID(){
  return parseInt(window.location.pathname.match(/[0-9]+/g)[0]);
}

function initUI(){
  jQuery('.logo').after(`<div id='sfsclicker'></div>`);
  jQuery('#sfsclicker').css({'font-size': '14px', 'color': '#fff'});
  jQuery('#sfsclicker').append("<button id='clickerbutton'>Do Stuff</button>")
  jQuery('#sfsclicker').append(GetPageId());
  jQuery('#sfsclicker').append(" thing: " + (jQuery("#current_time").val() - jQuery("#sold_timer_"+pageId).val()));
  jQuery('#clickerbutton').on("click", makePlayerList);
}

function gotaGetThemAll(){
  if(!GM_getValue('GetUmAll',false))return;
  var playerListIndex = GM_getValue('PlayerListIndex',0);
  var playerList = GM_getValue('PlayerList',[]);
  if(playerList.length <=0) return;  //TODO refresh list
  var player = playerList[playerListIndex];
  if(player.playerId != GetPageID()) window.location.href('https://www.mysfs.net/home/index/' + player.playerId);
  //TODO update ui
  var getUm = setInterval(function(){
      //check if we buy
      if(jQuery('.buy_li_'+player.playerId).css('display')=='none') return;
      //buy
      //jQuery('#buy_to_any_player').click();
      console.log('buy '+player.playerId);
      //TODO set 5min timer
      clearInterval(getUm);
  },100);

  //next?
  var nextId = playerListIndex + 1;
  if(nextId >= playerList.length){
    //done
    GM_setValue('GetUmAll', false);
    jQuery('.logo').click();
  }
  //next
  GM_setValue('PlayerListIndex', nextId);
  window.location.href('https://www.mysfs.net/home/index/' + playerList[nextId].playerId);
}

