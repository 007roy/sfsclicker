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
// @grant        GM_addValueChangeListener
// ==/UserScript==

var jQuery = window.jQuery;
var pageTime = jQuery.now();
var l =0;
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

function LoadNextPlayer(name, oldValue, newValue){
    Log("something here");
    if(name == 'PlayerListIndex'){
      var nextPlayerId = GM_getValue('PlayerList',[])[newValue].player_id;
      Log("Next player "+ nextPlayerId);
      //jQuery(location).attr(window.location.href ='https://www.mysfs.net/home/index/' + nextPlayerId);
    }else{
      Log("something else");
    }
}

function GotaGetThemAll(){
  GM_addValueChangeListener('PlayerListIndex',LoadNextPlayer);
  var playerListIndex = GM_getValue('PlayerListIndex',0);
  var playerList = GM_getValue('PlayerList',[]);
  if(playerList.length <=0) {makePlayerList();return;}
  var playerId = playerList[playerListIndex].player_id;
  var thisPageId = GetPageId();
  
  
  
  if(playerId != thisPageId){
    Log("On wrong page " + thisPageId + " loading "+playerId);
    //jQuery(location).attr(window.location.href ='https://www.mysfs.net/home/index/' + playerId);
    return;
  }else {
    Log("ON " + thisPageId + " page for player "+playerId);
  }
  Log("Z");
  const observer = new MutationObserver(()=>{
    //Log("Stuff happening " + jQuery('.buy_li_'+thisPageId).css('display'));
    
    var dis = "list-item";
    try{
      Log("A");
      //dis = jQuery('.buy_li_'+thisPageId).css('display');
    }catch(err){
      Log(err.message);
    }
    Log("B");
    switch(dis){
      case 'list-item':
        //buy
        //jQuery('#buy_to_any_player').click();
        Log('buy: '+ thisPageId);
        RecordAuctionTimer(thisPageId);
        break;
      case 'none':
        Log('no buy: '+ thisPageId);
        break;
    }
    // why nothing down here happens ?------
    Log('Beep!');
    observer.disconnect();
    Log('Boop!')
    //next?
    var nextIndex = playerListIndex + 1;
    if(nextIndex >= playerList.length){
      //done
      GM_setValue('CLICKER_STATE', 0);
      //jQuery('.logo').click();
    }
    //next
    GM_setValue('PlayerListIndex', nextIndex);
    Log("doing next");
    return;
  });
  observer.observe(jQuery('.buy_li_'+thisPageId).get(0),{attributes: true, attributeFilter:['style']});
}

function RecordAuctionTimer(id){
  Log('record buy '+id);
  var auctionTimers = GM_getValue('AUCTION_TIMERS',[]);
  auctionTimers.push({'id':id, 'time': jQuery.now()+300000});
  GM_setValue('AUCTION_TIMERS',auctionTimers);
}

function LoadPlayerPage(id){
  jQuery(location).attr(window.location.href ='https://www.mysfs.net/home/index/'  + id);
}

function Log(value){
  var log = GM_getValue('LOG',"");
  var pageId = GetPageId();
  log += pageTime + ":" + GetPageId() + " " + value + "\n";
  GM_setValue('LOG', log);
}


