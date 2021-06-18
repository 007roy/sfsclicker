// ==UserScript==
// @name        SFS New Clicker
// @namespace   https://violentmonkey.github.io
// @version     3.1t
// @description  try to take over the world!
// @author       You
// @match        https://www.mysfs.net/home/index/*
// @require      http://code.jquery.com/jquery-latest.min.js
// @downloadURL        https://github.com/007roy/sfsclicker/raw/test/sfsnewclick.user.js
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_notification
// @grant        GM_addValueChangeListener
// ==/UserScript==

var jQuery = window.jQuery;
GM_setValue('SKIP_LIST',[733,729,509,624,734]);
GM_setValue('MY_ID', 779);
class SFSClicker {
    constructor(){
        if(window.location.pathname == '/auctions'){
          //this.autoAuction = new AutoAuction();
          return;
        }
        if(window.location.pathname.match('home/index/*')!=null){
            var windowName = window.name.split(":")[0];
            var windowIndex = window.name.split(":")[1];
            switch(windowName){
                case "flip" :
                    this.flip = new DeadCollector(windowIndex);
                    break;
              case "bid" :
                    this.startBiding();
                    break;
                default:
                    setTimeout(this.buildUI(),2000); 
            }            
        }
    }
    launchDeadCollector(){
        var idx = GM_getValue("WINDOW_INDEX",0);
        GM_setValue("WINDOW_INDEX", idx+1);
        window.open('https://www.mysfs.net/home/index/0','flip:'+idx);
    }
    startBiding(){
      this.bidder = new Bidder();
    }
    buildUI(){
        jQuery('.logo').after(`<div id='sfsclicker'></div>`);
        jQuery('#sfsclicker').css({'font-size': '14px', 'color': '#fff'});
        jQuery('#sfsclicker').append("<button id='clickerbutton' class='clicker-buttons'>Bid</button>");
        jQuery('#sfsclicker').append("<button id='deadsbutton' class='clicker-buttons'>Deads</button>");
        jQuery('#clickerbutton').on("click", this.startBiding);
        jQuery('#deadsbutton').on("click",this.launchDeadCollector);
        jQuery('.clicker-buttons').css({'color':'#000'});
    }

}

class Bidder{
  constructor(){
    this.playerPage = new PlayerPage();
    this.playerPage.watchBid(()=>{
      this.playerPage.bid();
    });
    this.watchAuctionTimer(()=>{
      this.playerPage.bidObserver.disconnet();
      this.playerPage.auctionTimerObserver.disconnect();
      this.playerPage.watchBuy(()=>{
        this.playerPage.buyPlayer();
        this.playerPage.buyObserver.disconnet();
      });
    },15);
  }
}
/*
class AutoAuction {
    constructor(){
        
    }
    doingAuctionPage(){
        
    }
    doingPlayerPage(){
        this.playerPage = new PlayerPage();
        this.playerPage.watchBid(this.playerPage.bid());
        this.playerPage.watchAuctionTimer(()=>{
            this.playerPage.bidObserver.disconnect();
            if(GM_getValue('DO_RESET',true)){ 
                this.playerPage.watchBuy(this.playerPage.buyPlayer()); 
            }
            GM_addValueChangeListener('NEXT_AUCTION',(valueName, oldValue, newValue)=>{
                setTimeout(()=>{
                    window.location.href ='https://www.mysfs.net/home/index/' + newValue;
                  },20000); //dont change till buy has a chance
            });
            //wait for next auction page
        },15);
    }

}
*/
class DiamondChaser {

}

class DeadCollector {
    constructor(windowIndex){
        this.windowIndex = windowIndex;
        this.getPlayerList();
        this.init();
    }
    init(){
        this.playerPage = new PlayerPage();
        if(GM_getValue('MY_ID',1) == this.playerPage.pageId) this.nextPlayer();
        var skipList = GM_getValue('SKIP_LIST',[]);
        if(skipList.indexOf(this.playerPage.pageId)>-1) this.nextPlayer();
      
        this.playerPage.watchBuy(()=>{
            if(GM_getValue('BUY_CHEAP',true) && this.playerPage.getPlayerValue() >= 500000000) return;
            this.playerPage.buyPlayer();
        });
      
        this.playerPage.watchWorkPet(()=>{
            this.playerPage.workPet();
            this.playerPage.log('work'+this.playerPage.pageId);
            this.nextPlayer();
        });
        
        this.playerPage.watchSell(()=>{
            if(jQuery('.freePet_'+this.pageId).css('display')=='list-item'){ //whats this?
                //this.NextPlayer();
                this.playerPage.log('whats this '+this.playerPage.pageId);
                return;
            }
            this.playerPage.log('sell'+this.playerPage.pageId);
            this.playerPage.sellPet(this.nextPlayer());
        });
      /*
        this.playerPage.watchBid(()=>{
            this.nextPlayer();
        }); //if bid button up nothing to do
      */
        this.bidWatcher = new WatchBid(this.nextPlayer,this.playerPage.pageId);
        this.bidWatcher.start();
      
        this.playerPage.watchAuctionTimer(()=>{
            if(jQuery('.work_pet_li_'+this.pageId).hasClass('disable-element') &&
                jQuery('.sold_pet_li_'+this.pageId).hasClass('disable-element') &&
                jQuery('.buy_li_'+this.pageId).css('display')=='none'){
              this.playerPage.log('timer'+this.pageId);
              this.nextPlayer(); 
            }
        },-1);
        
        setTimeout(()=>{this.playerPage.log('DeadCollector Timeout: '+this.playerPage.pageId); this.nextPlayer();},10000);
    }
    
    getPlayerList(doThis){
        var players = GM_getValue('PlayerList',[]);
        if(players.length>0){
          //doThis();
          return;
        }
        jQuery.post('https://www.mysfs.net/players/get_players_listing',
            {page: 1, player_type: 3, player_seach_string: ''},
            function(data){
                GM_setValue('PlayerList', data.msg);
                //doThis();
            },"json");
    }
    nextPlayer(){
        var playerList = GM_getValue('PlayerList',[]);
        var playerListIndex = GM_getValue('PlayerListIndex'+this.windowIndex,0);
        var nextId = playerListIndex + 1;
        if(nextId >= playerList.length){
            GM_setValue('PlayerListIndex'+this.windowIndex,0); //done
            GM_setValue('CycleTime',jQuery.now());
            return;
        }
        GM_setValue('PlayerListIndex'+this.windowIndex, nextId);
        this.loadPlayerPage(playerList[nextId].player_id);
    }
    loadPlayerPage(id){
        setTimeout(()=>{
            window.location.href ='https://www.mysfs.net/home/index/' + id;
        },500);
    }
}

class AuctionPage {
    constructor(){
        jQuery('.logo').after(`<div id='sfsclicker'></div>`);
        jQuery('#sfsclicker').css({'font-size': '14px', 'color': '#fff'});
        jQuery('#sfsclicker').append("<button id='auctionbutton' class='auction-buttons'>Auction</button>");
        jQuery('#auctionbuttonbutton').on("click", this.watchAuction);
        jQuery('.clicker-buttons').css({'color':'#000'});
    }
    watchAuction(){
        this.auctionObserver = MutationObserver(()=>{
            jQuery('.auction-counter-actual-value').each((index,elem)=>{
                var elem = jQuery('.auction_players_listing li').children(".auction-counter-actual-value")
                if(jQuery(elem).text().replace(/,/g,"") > 500000000)
                {

                }
            });
        });
        this.auctionObserver.observe(jQuery('.auction-counter-actual-value').get(0),{characterData: true,childList: true});
    }
    getAuctionValue(){
        return jQuery('.auction-counter-actual-value').text().replace(/,/g,"");
    }
}

class PlayerPage {
    constructor(){
        var path = window.location.pathname.match(/[0-9]+/g);
        if(path!=null) this.pageId = parseInt(path[0]);
    }
    buyPlayer(){
        buyToAnyPlayer();
       // this.log('Buy '+this.pageId);
    }
    watchBuy(doThis){
        this.buyObserver = new MutationObserver(()=>{
            if(jQuery('.buy_li_'+this.pageId).css('display')!='list-item') return; // check if buy button up
            doThis();
        });
        this.buyObserver.observe(jQuery('.buy_li_'+this.pageId).get(0),{attributes: true});
    }
    workPet(){
        var energy = this.getEnergy();
        if(energy == 0) return;
        if(energy <= 60) multichoice_work_on_pet(energy.toString()[0]);
        if(energy > 60) multichoice_work_on_pet('6');
    }
    watchWorkPet(doThis){
        this.workObserver = new MutationObserver(()=>{
            if(jQuery('.work_pet_li_'+this.pageId).hasClass('disable-element')) return; //check if buy button up
            doThis();
        });
        this.workObserver.observe(jQuery('.work_pet_li_'+this.pageId).get(0),{attributes: true});
    }
    sellPet(doThis){
        var energy = this.getEnergy();
        if(energy == 0){
            jQuery.post('https://www.mysfs.net/home/sold_pet',
                { otherPlayerId: this.pageId },
                function(data){
                    this.log('Sold Pet2 ' +this.pageId);
                    doThis();
                },"json"); 
        };
    }
    watchSell(doThis){
        this.sellObserver = new MutationObserver(()=>{
            if(jQuery('.sold_pet_li_'+this.pageId).hasClass('disable-element')) return; //check if sell button up
            doThis();
        });
        this.sellObserver.observe(jQuery('.buy-right').get(0),{childList: true});
    }
    bid(){  
        bidToAnyPlayer(); 
        this.playerPage.log('bid'+this.playerPage.pageId);
    }
    watchBid(doThis){
        this.bidObserver = new MutationObserver(()=>{
            if(jQuery('.bid_li_'+this.pageId).css('display') != 'list-item') return; //check if bidbutton up
            doThis();
        });
        this.bidObserver.observe(jQuery('.bid_li_'+this.pageId).get(0),{attributes: true});
    }
    watchAuctionTimer(dothis,time){
        this.auctionTimerObserver = new MutationObserver(()=>{
            var aucTimer=jQuery('.auction_timer').text().split(':');
            var min = parseInt(aucTimer[0]);
            var sec = parseInt(aucTimer[1]);
            if(isNaN(min+sec)) return -1;
            return sec + min * 60;
            if(aucTimer<=time){
                dothis();
                //this.auctionTimerObserver.disconnect();
            }
        });
        this.auctionTimerObserver.observe(jQuery('.auction_timer').get(0),{characterData: true,childList: true});
    }
    getPlayerValue(){
        return parseFloat(jQuery('#actual_value_'+this.pageId).text().replace(/,/g,""));
    }
    getEnergy(){
        return parseInt(jQuery('.battery-li_'+this.pageId).children('span').first().text().split('%')[0]);
    }

    log(value){
      var log = GM_getValue('LOG',"");
      log += value + "/";
      GM_setValue('LOG', log);
    }
}

class WatchBid extends MutationObserver{
    constructor(callback, pageId){
        this.pageId = pageId;
        super(()=>{
            if(jQuery('.bid_li_'+this.pageId).css('display') != 'list-item') return; //check if bidbutton up
            callback();
        });
    }
    start(){
        this.observe(jQuery('.bid_li_'+this.pageId).get(0),{attributes: true});
    }
    stop(){
        this.observe.disconnet();
    }
}
var clicker = new SFSClicker();
