// ==UserScript==
// @name        SFS Clicker - test
// @namespace   https://violentmonkey.github.io
// @version     2.0t
// @description  try to take over the world!
// @author       You
// @match       https://www.mysfs.net/players
// @match       https://www.mysfs.net/home/index/*
// @require      http://code.jquery.com/jquery-latest.min.js
// @downloadURL        https://github.com/007roy/sfsclicker/raw/test/sfsclicker.user.js
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
  case "Action":
    ActionPage();
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
  jQuery('#sfsclicker').append("<button id='flipbutton' class='clicker-buttons'>Flip</button>");
  jQuery('#sfsclicker').append("<span id='buyNum'></span>");
  jQuery('#sfsclicker').append("<span id='petNum'></span>");
  jQuery('#clickerbutton').on("click", StartGetThemAll);
  jQuery('#flipbutton').on("click",StartFlipping);
  jQuery('.clicker-buttons').css({'color':'#000'});
  
  GM_addValueChangeListener('PlayerListIndex',(valueName, oldValue, newValue)=>{
    var numToBuy = GM_getValue('PlayerList',[]).length;
    var str = " Buy: "+newValue + "\\" + numToBuy;
    jQuery('#buyNum').text(str);
  });
 var actionList = [];
  var z = 0;
  GM_addValueChangeListener('ActionTimer',(valueName, oldValue, newValue)=>{
    var actionTime = newValue.time - jQuery.now();
    
    actionTime = actionTime <0 ? 0:actionTime;
    var action = setTimeout(StartAction,actionTime,newValue.id,z); //work
    actionList.push(action);
    z++;
    jQuery('#petNum').text('Watched: '+ actionIt + "//"+ actionList.length);
  });
}
var actionIt = 0;
function RecordActionTimer(t=300000){
  var actionTimer = GM_setValue('ActionTimer',{'id':pageId, 'time': jQuery.now()+t});
}
function StartAction(id,z){
  actionIt++;
  window.open('https://www.mysfs.net/home/index/'+id,'Action:0');
}
function StartGetThemAll(){
  var windowIndex = GM_getValue('WindowIndex',0);
  GM_setValue('WindowIndex', windowIndex+1);
  window.open('https://www.mysfs.net/home/index/0','buy:'+windowIndex);
}
function StartFlipping(){
  WatchBuy();
  WatchBid(true);
}

function GetAuctionTimer(){
  if(jQuery('.bid_li_'+pageId).css('display') == 'list-item'){
    var aucTimer=jQuery('.auction_timer').text().split(':');
    var min = parseInt(aucTimer[0]);
    var sec = parseInt(aucTimer[1]);
    return sec + min * 60;
  }else return -1;

}

function ActionPage(){
  WatchBuy(false);
  WatchWorkPet();
  WatchSell();
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
      Log('Sold Pet1 ' +pageId);
    }else if(energy <= 60){
      multichoice_work_on_pet(energy.toString()[0]);
      Log('Work Pet ' +pageId);
      RecordActionTimer(900000);
    }else if(energy > 60){
      multichoice_work_on_pet('6');
      Log('Work Pet ' +pageId);
      RecordActionTimer(900000);
    }
    location.reload();
  });

  workObserver.observe(jQuery('.work_pet_li_'+pageId).get(0),{
    attributes: true
  });
}

function WatchBuy(record = true){
  //buy if can
  var buyObserver = new MutationObserver(()=>{
    if(jQuery('.buy_li_'+pageId).css('display')!='list-item') return;
    buyToAnyPlayer();
    if(record)RecordActionTimer();
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
      Log('Sold Pet2 ' +pageId);
      location.reload();
    };
  });
  sellObserver.observe(jQuery('.sold_pet_li_'+pageId).get(0),{
    attributes: true
  });
}

function WatchBid(flipping = false){
  var bidObserver = new MutationObserver(()=>{
    if(jQuery('.bid_li_'+pageId).css('display') != 'list-item') return;
    if(flipping){
      if(GetAuctionTimer() <= 30) return;
      bidToAnyPlayer();
    }else{
      NextPlayer();
    }
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
        if(jQuery('.bid_li_'+pageId).css('display') != 'list-item'){
          
        }
        NextPlayer();
      }
    }
  });
  timerObserver.observe(jQuery('#auction_timer_'+pageId).get(0),{
    characterData: true,
    childList: true
  });
}

function NextPlayer(){
  var playerList = GM_getValue('PlayerList',[]);
  var playerListIndex = GM_getValue('PlayerListIndex'+windowIndex,0);
  var nextId = playerListIndex + 1;
  if(nextId >= playerList.length){
    //done
    //GM_setValue('PlayerListIndex'+windowIndex,0);
    //jQuery('.logo').click();
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
  setTimeout(()=>{Log('Timeout '+pageId);NextPlayer();},4000);
}




function LoadPlayerPage(id){
  setTimeout(()=>{
    window.location.href ='https://www.mysfs.net/home/index/' + id;
  },500);
}

function Log(value){
  var log = GM_getValue('LOG',"");
  log += value + "/";
  GM_setValue('LOG', log);
}

