// ==UserScript==
// @name        SFS Clicker - mysfs.net
// @namespace   https://violentmonkey.github.io
// @version     1.5
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
    GGTA();
    break;
  case 2: //work um
    WorkingIt();
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
  location.reload();
}
function WorkingIt(){
  var actionIndex = GM_getValue('ACTION_INDEX',0);
  var actionTimer = GM_getValue('AUCTION_TIMERS',[])[actionIndex];
  
}

function GGTA(){
  var playerList = GM_getValue('PlayerList',[]);
  var pageId = GetPageId();
  /*
  var actionTimer = GM_getValue('AUCTION_TIMERS',[])[0]
  if(jQuery.now() >= actionTimer.time){
    //time to work
    LOG('Working!')
    GM_setValue('CLICKER_STATE', 2);
    GM_setValue('ACTION_INDEX',0);
    LoadPlayerPage(actionTimer.id);
    return;
  }
  */
  var observer = new MutationObserver(()=>{
    observer.disconnect();
    var playerListIndex = GM_getValue('PlayerListIndex',playerList.length-1);
    var playerId = playerList[playerListIndex].player_id;
    if(playerId != pageId){
      Log("Wrong page");
      LoadPlayerPage(playerId); //************
      return;
    }
    switch(jQuery('.buy_li_'+playerId).css('display')){
      case 'list-item':
        //buy
        //jQuery('#buy_to_any_player').click();
        RecordAuctionTimer(playerId);
        break;
      case 'none':
        Log('no buy');
        break;
    }
    var nextId = playerListIndex - 1;
    Log('Index'+nextId);
    if(nextId < 0){
      //done
      GM_setValue('CLICKER_STATE', 0);
      jQuery('.logo').click();
      return;
    }
    //next
    GM_setValue('PlayerListIndex', nextId);
    var nextPlayer = playerList[nextId].player_id;
    LoadPlayerPage(nextPlayer); //*****************
  });
  observer.observe(jQuery('.buy_li_'+pageId).get(0),{
    attributes: true,
    attributeFilter: ['style']
  });
}

function RecordAuctionTimer(id){
  Log('record buy '+id);
  var auctionTimers = GM_getValue('AUCTION_TIMERS',[]);
  auctionTimers.push({'id':id, 'time': jQuery.now()+300000});
  GM_setValue('AUCTION_TIMERS',auctionTimers);
}

function LoadPlayerPage(id){
  setTimeout(()=>{
    window.location.href ='https://www.mysfs.net/home/index/' + id;
  },1000);
}

function Log(value){
  var log = GM_getValue('LOG',"");
  log += value + "/n";
  GM_setValue('LOG', log);
}


