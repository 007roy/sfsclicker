// ==UserScript==
// @name        SFS Clicker - test
// @namespace   https://violentmonkey.github.io
// @version     1.9t
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
var pageId = GetPageId();
var windowName = window.name.split(":")[0];
var windowIndex = window.name.split(":")[1];
switch(windowName){
  case "buy": //buy everything
    if(pageId == 779 || pageId == 729 || pageId == 509) NextPlayer();
    GGTA();
    break;
  case "work": //work um
    if(pageId == 779 || pageId == 729 || pageId == 509) NextPlayer();
    WorkingIt();
    break;
  default:
    if(pageId == 729 || pageId == 509) NextPlayer();
    setTimeout(initUI,2000);
}

function makePlayerList(){
  jQuery.post('https://www.mysfs.net/players/get_players_listing',
    {page: 1, player_type: 3, player_seach_string: ''},
    function(data){
      GM_setValue('PlayerList', data.msg);
      //TODO: remove muted and self
      location.reload();
    },"json");
}

function SellPet(){
  jQuery.post('https://www.mysfs.net/home/sold_pet',
    { otherPlayerId: pageId },
    function(data){},"json");
}

function GetPageId(){
  return parseInt(window.location.pathname.match(/[0-9]+/g)[0]);
}

function initUI(){
  jQuery('.logo').after(`<div id='sfsclicker'></div>`);
  jQuery('#sfsclicker').css({'font-size': '14px', 'color': '#fff'});
  jQuery('#sfsclicker').append("<button id='clickerbutton' class='clicker-buttons'>Buy</button>");
  jQuery('#sfsclicker').append("<button id='workbutton' class='clicker-buttons'>Work</button>");
  jQuery('#sfsclicker').append("<button id='flipbutton' class='clicker-buttons'>Flip</button>");
  jQuery('#sfsclicker').append("<span id='buyNum'></span>");
  jQuery('#sfsclicker').append("<span id='workNum'></span>");
  jQuery('#clickerbutton').on("click", StartGetThemAll);
  jQuery('#workbutton').on("click",StartWorkingIt);
  jQuery('#flipbutton').on("click",StartFlipping);
  jQuery('.clicker-buttons').css({'color':'#000'});
  
  GM_addValueChangeListener('PlayerListIndex',(valueName, oldValue, newValue)=>{
    var numToBuy = GM_getValue('PlayerList',[]).length;
    var str = " Buy: "+newValue + "\\" + numToBuy;
    jQuery('#buyNum').text(str);
  });
}

function StartGetThemAll(){
  var windowIndex = GM_getValue('WindowIndex',0);
  GM_setValue('WindowIndex', windowIndex+1);
  window.open('https://www.mysfs.net/home/index/0','buy:'+windowIndex);
}
function StartFlipping(){
  WatchBuy();
  var bidObserver=new MutationObserver(()=>{
    if(jQuery('.bid_li_'+pageId).css('display') == 'list-item'){
      var aucTimer=jQuery('.auction_timer').text().split(':');
      var min = parseInt(aucTimer[0]);
      var sec = parseInt(aucTimer[1]);
      if(min == 0 && sec <= 30) return;
      bidToAnyPlayer();
    }
  });
  bidObserver.observe(jQuery('.bid_li_'+pageId).get(0),{
    attributes: true
  });
}
function GetAuctionTimer(){
  if(jQuery('.bid_li_'+pageId).css('display') == 'list-item'){
    var aucTimer=jQuery('.auction_timer').text().split(':');
    var min = parseInt(aucTimer[0]);
    var sec = parseInt(aucTimer[1]);
    return sec + min * 60;
  }else return -1;

}
function GetEnergy(){
  return parseInt(jQuery('.battery-li_'+pageId).children('span').first().text().split('%')[0]);
}
function WatchWorkPet(){
  //work if can
  //sell
  var workObserver = new MutationObserver(()=>{
    if(jQuery('.work_pet_li_'+pageId).hasClass('disable-element')) return;
    var energy = GetEnergy();
    if(energy == 0){
      SellPet();
      Log('Sold Pet ' +pageId);
    }else if(energy <= 60){
      multichoice_work_on_pet(energy.toString()[0]);
      Log('Work Pet ' +pageId);
    }else if(energy > 60){
      multichoice_work_on_pet('6');
      Log('Work Pet ' +pageId);
    }
  });

  workObserver.observe(jQuery('.work_pet_li_'+pageId).get(0),{
    attributes: true
  });
}

function WatchBuy(){
  //buy if can
  var buyObserver = new MutationObserver(()=>{
    if(jQuery('.buy_li_'+pageId).css('display')!='list-item') return;
    buyToAnyPlayer();
    RecordAuctionTimer(pageId);
  });
  buyObserver.observe(jQuery('.buy_li_'+pageId).get(0),{
    attributes: true
  });
}
function WatchSell(){
  var sellObserver = new MutationObserver(()=>{
    if(jQuery('.sold_pet_li_'+pageId).hasClass('disable-element')) return;
    var energy = GetEnergy();
    if(energy == 0){
      SellPet();
      Log('Sold Pet ' +pageId);
      location.reload();
    };
  });
  sellObserver.observe(jQuery('.sold_pet_li_'+pageId).get(0),{
    attributes: true
  });
}

function WatchBid(){
  var bidObserver = new MutationObserver(()=>{
    if(jQuery('.bid_li_'+pageId).css('display') != 'list-item') return;
    NextPlayer();
  });
  bidObserver.observe(jQuery('.buy_li_'+pageId).get(0),{
    attributes: true
  });
}

function WatchPageDone(){
  var timerObserver = new MutationObserver(()=>{
    if(jQuery('#auction_timer_'+pageId).text()=='--:--'){
      if(jQuery('.work_pet_li_'+pageId).hasClass('disable-element') &&
      jQuery('.sold_pet_li_'+pageId).hasClass('disable-element') &&
      jQuery('.buy_li_'+pageId).css('display')=='none'){
        NextPlayer();
      }
    }
  });
  timerObserver.observe(jQuery('#auction_timer_'+pageId).get(0),{
    characterData: true
  });
}

function NextPlayer(){
  var playerList = GM_getValue('PlayerList',[]);
  var playerListIndex = GM_getValue('PlayerListIndex'+windowIndex,0);
  var nextId = playerListIndex + 1;
  if(nextId >= playerList.length){
    //done
    GM_setValue('PlayerListIndex'+windowIndex,0);
    jQuery('.logo').click();
  }else{
    GM_setValue('PlayerListIndex'+windowIndex, nextId);
    var nextPlayer = playerList[nextId].player_id;
    LoadPlayerPage(nextPlayer);  
  }
}

function GGTA(){
  var playerList = GM_getValue('PlayerList',[]);
  if(playerList.length <=0) makePlayerList();
  WatchBuy();
  WatchWorkPet();
  WatchSell();
  WatchBid(); //Bid comes up we go to next page
  WatchPageDone();
  //setTimeout(NextPlayer,4000);
}


function RecordAuctionTimer(id){
  Log('Buy '+id);
  //var auctionTimers = GM_getValue('AUCTION_TIMERS',[]);
 // auctionTimers.push({'id':id, 'time': jQuery.now()+300000});
  //GM_setValue('AUCTION_TIMERS',auctionTimers);
}

function LoadPlayerPage(id){
  setTimeout(()=>{
    window.location.href ='https://www.mysfs.net/home/index/' + id;
  },500);
}

function Log(value){
  var log = GM_getValue('LOG',"");
  log += value + "/n";
  GM_setValue('LOG', log);
}

