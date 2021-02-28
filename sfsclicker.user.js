// ==UserScript==
// @name        SFS Clicker - mysfs.net
// @namespace   https://violentmonkey.github.io
// @version     1.7
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

switch(window.name){
  case "buy": //buy everything
    GGTA();
    break;
  case "work": //work um
    WorkingIt();
    break;
  default:
    setTimeout(initUI,2000);
}

function makePlayerList(){
  jQuery.post('https://www.mysfs.net/players/get_players_listing',
    {page: 1, player_type: 3, player_seach_string: ''},
    function(data){
      GM_setValue('PlayerList', data.msg);
      location.reload();
    },"json");
}

function SellPet(){
  var pageId = GetPageId();
  jQuery.post('https://www.mysfs.net/home/sold_pet',
    { otherPlayerId: pageId },
    function(data){
      Log('WI:Sold: '+ pageId);
      buyToAnyPlayer();
      RecordAuctionTimer(pageId);
    },"json");
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
    var str = " Buy: "+(numToBuy - newValue) + "\\" + numToBuy;
    jQuery('#buyNum').text(str);
  });
  GM_addValueChangeListener('ACTION_INDEX',(valueName, oldValue, newValue)=>{
    var numToWork = GM_getValue('AUCTION_TIMERS',[]).length;
    var str = " Work: "+(newValue+1) + "\\" + numToWork;
    jQuery('#workNum').text(str);
  });
}
function StartGetThemAll(){
  window.open('https://www.mysfs.net/home/index/0','buy');
}
function StartWorkingIt() {
  window.open('https://www.mysfs.net/home/index/0','work');
}
function StartFlipping(){
  var pageId = GetPageId();
  var observer=new MutationObserver(()=>{
    buyToAnyPlayer();
  });
    observer.observe(jQuery('.buy_li_'+pageId).get(0),{
    attributes: true,
    attributeFilter: ['style']
  });
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
    attributes: true,
    attributeFilter: ['style']
  });
}

function WorkingIt(){
  var actionIndex = GM_getValue('ACTION_INDEX',0);
  var actionTimer = GM_getValue('AUCTION_TIMERS',[]);
  var playerId = actionTimer[actionIndex].id;
  var pageId = GetPageId();
  
  if(playerId != pageId){
    Log("WI:Wrong page");
    LoadPlayerPage(playerId); //************
    return;
  }
  
  var observer = new MutationObserver(()=>{
    observer.disconnect();
    switch(jQuery('.buy_li_'+playerId).css('display')){
      case 'none':
        if(!jQuery('.work_pet_li_'+playerId).hasClass('disable-element')){
          switch(jQuery('.battery-li_'+playerId).children('span').text()[0]){
            case "1":
              multichoice_work_on_pet('1');
              break;
            case "2":
              multichoice_work_on_pet('2');
              break;
            case "3":
              multichoice_work_on_pet('3');
              break;
            case "4":
              multichoice_work_on_pet('4');
              break;
            case "5":
              multichoice_work_on_pet('5');
              break;
            case "6":
              multichoice_work_on_pet('6');
              break;
          }
          if(!jQuery('#sold_pet').hasClass('disable-element')){
                SellPet();
          }
        }
        break;
    }
    var nextId = actionIndex + 1;
    if(nextId >= actionTimer.length){
      jQuery('.logo').click();
      return;
    }
    //next
    GM_setValue('ACTION_INDEX', nextId);
    var nextPlayer = actionTimer[nextId].id;
    var t = actionTimer[nextId].time - jQuery.now();
    if(t>0){
      setTimeout(()=>{
        Log("WAITING: "+t);
        LoadPlayerPage(nextPlayer);},t);
    }else{
      LoadPlayerPage(nextPlayer);
    }
  });
   observer.observe(jQuery('.buy_li_'+pageId).get(0),{
    attributes: true,
    attributeFilter: ['style']
  });
}

function GGTA(){
  var playerList = GM_getValue('PlayerList',[]);
  var pageId = GetPageId();
  if(playerList.length <=0){
    makePlayerList();
    return;
  }
  
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
        buyToAnyPlayer();
        RecordAuctionTimer(playerId);
        break;
      case 'none':
        if(!jQuery('.work_pet_li_'+playerId).hasClass('disable-element')){
          switch(jQuery('.battery-li_'+playerId).children('span').text()[0]){
            case "1":
              multichoice_work_on_pet('1');
              break;
            case "2":
              multichoice_work_on_pet('2');
              break;
            case "3":
              multichoice_work_on_pet('3');
              break;
            case "4":
              multichoice_work_on_pet('4');
              break;
            case "5":
              multichoice_work_on_pet('5');
              break;
            case "6":
              multichoice_work_on_pet('6');
              break;
          }
          if(!jQuery('#sold_pet').hasClass('disable-element')){
            SellPet();
          }
          
        }
        break;
    }
    
    var nextId = playerListIndex - 1;
    if(nextId < 0){
      //done
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

