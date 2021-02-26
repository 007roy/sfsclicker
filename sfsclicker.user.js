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

switch(GM_getValue('CLICKER_STATE', 0)){
  case 0: //idle
    setTimeout(initUI,2000);
    break;
  case 1: //buy everything
    GotaGetThemAll();
    break;
  case 3: //work um
    break;
}

function makePlayerList(){
  jQuery.post('https://www.mysfs.net/players/get_players_listing',
    {page: 1, player_type: 3, player_seach_string: ''},
    function(data){
      GM_setValue('PlayerList', data.msg);
    },"json");
}

function GetPageId(){
  return parseInt(window.location.pathname.match(/[0-9]+/g)[0]);
}

function initUI(){
  var pageId = GetPageId();
  jQuery('.logo').after(`<div id='sfsclicker'></div>`);
  jQuery('#sfsclicker').css({'font-size': '14px', 'color': '#fff'});
  jQuery('#sfsclicker').append("<button id='clickerbutton'>Do Stuff</button>")
  jQuery('#sfsclicker').append(pageId);
  jQuery('#sfsclicker').append(" thing: " + (jQuery("#current_time").val() - jQuery("#sold_timer_"+pageId).val()));
  jQuery('#clickerbutton').on("click", StartGetThemAll);
}
function StartGetThemAll(){
  GM_setValue('CLICKER_STATE',1);
  GotaGetThemAll();
}
function GotaGetThemAll(){
  var playerListIndex = GM_getValue('PlayerListIndex',0);
  var playerList = GM_getValue('PlayerList',[]);
  if(playerList.length <=0) makePlayerList();
  var player = playerList[playerListIndex];

  //TODO update ui
  var uiReady = setInterval(()=>{
    var thisPageId = GetPageId();
      if(player.player_id != thisPageId){
        Log("On wrong page " + thisPageId + " loading "+player.player_id);
        LoadPlayerPage(player.player_id);
      }
      if(jQuery('.buy_li_'+player.player_id).css('display')==undefined) return;
      if(jQuery('.auction_timer').text()=='--:--'){
        Log("blank auction timer");
        if(jQuery('.buy_li_'+player.player_id).css('display')=='list-item'){
              //buy
              //jQuery('#buy_to_any_player').click();
              Log('buy: '+player.player_id);
              RecordAuctionTimer(player.player_id);
        }else{ Log('no buy');}
      }
      //next?
      var nextId = playerListIndex + 1;
      if(nextId >= playerList.length){
        //done
        GM_setValue('CLICKER_STATE', 0);
        jQuery('.logo').click();
      }
      //next
      GM_setValue('PlayerListIndex', nextId);
      var nextPlayer = playerList[nextId].player_id;
      Log("Next player "+ nextPlayer)
      LoadPlayerPage(nextPlayer);
  }, 1000);
}

function RecordAuctionTimer(id){
  Log('record buy '+id);
  var auctionTimers = GM_getValue('AUCTION_TIMERS',[]);
  auctionTimers.push({'id':id, 'time': jQuery.now()+300000});
  GM_setValue('AUCTION_TIMERS',auctionTimers);
}

function LoadPlayerPage(id){
  window.location.href ='https://www.mysfs.net/home/index/' + id;
}

function Log(value){
  var log = GM_getValue('LOG',"");
  log += value + "/n";
  GM_setValue('LOG', log);
}


