// ==UserScript==
// @name        SFS New Clicker
// @namespace   https://violentmonkey.github.io
// @version     3.4.2t
// @description  try to take over the world!
// @author       You
// @match        https://www.mysfs.net/home/index/*
// @match        https://www.mysfs.net/auctions
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
        if(window.location.pathname.match('home/index/*')!=null){
            var windowName = window.name.split(":")[0];
            var windowIndex = window.name.split(":")[1];
            switch(windowName){
                case "flip" :
                    this.flip = new DeadCollector(windowIndex);
                    break;
              case "bid" :
                    this.autoBid = new AutoAuction();
                    this.autoBid.doPlayerPage();
                    break;
              case "chase":
                  this.chaser = new DiamondChaser();
                  break;
                case "auction":
                    this.autoAuction = new AutoAuction();
                    this.autoAuction.newDoPlayerPage();
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
    chaseDiamond(){
      window.open('https://www.mysfs.net/home/index/0','chase:');
    }
    autoAuction(){
        window.open('https://www.mysfs.net/home/index/0','auction:')
    }
    setReset(){
      GM_setValue('RESET',jQuery('#resetcheckbox').prop('checked'));
    }
    buildUI(){
        jQuery('.logo').after(`<div id='sfsclicker'></div>`);
        jQuery('#sfsclicker').css({'font-size': '14px', 'color': '#fff'});
        jQuery('#sfsclicker').append("<button id='clickerbutton' class='clicker-buttons'>Bid</button>");
        jQuery('#sfsclicker').append("<input type='checkbox' id='resetcheckbox' class='clicker-buttons'><label for='resetcheckbox'>Reset</label>");
        jQuery('#sfsclicker').append("<button id='deadsbutton' class='clicker-buttons'>Deads</button>");
        jQuery('#sfsclicker').append("<button id='diamondbutton' class='clicker-buttons'>Chaser</button>");
        jQuery('#sfsclicker').append("<button id='auctionbutton' class='clicker-buttons'>Auto Auction</button>");
        jQuery('#auctionbutton').on("click", this.autoAuction);
        jQuery('#clickerbutton').on("click", this.startBiding);
        jQuery('#deadsbutton').on("click",this.launchDeadCollector);
        jQuery('#diamondbutton').on("click",this.chaseDiamond);
        jQuery('#resetcheckbox').on('click',this.setReset);
        jQuery('#resetcheckbox').prop('checked',GM_getValue('RESET',false));
        jQuery('.clicker-buttons').css({'color':'#000'});
    }

}

class Bidder{
  constructor(callBack){
    this.playerPage = new PlayerPage();
    this.playerPage.watchBid(()=>{
      this.playerPage.bid();
    });
    this.playerPage.watchAuctionTimer(()=>{
      this.playerPage.bidObserver.disconnect();
      this.playerPage.auctionTimerObserver.disconnect();
      if(GM_getValue('RESET',false)){
        this.playerPage.watchBuy(()=>{ 
          this.playerPage.buyPlayer();
        });
      }
      if(callBack!=null) callBack();
    },15);
  }
}

class AutoAuction {
    constructor(){
    }
    doPlayerPage(){
      this.bidder = new Bidder(()=>{
          AutoAuction.nextAuction();
        });
    }
    doAuctionPage(){
        this.auctionPage = new AuctionPage();
        setTimeout(()=>{this.auctionPage.watchAuction();},2000);
    }
    static nextAuction(){
        GM_addValueChangeListener('NEXT_AUCTION',(valueName, oldValue, newValue)=>{
                  setTimeout(()=>{
                      window.location.href ='https://www.mysfs.net/home/index/' + newValue;
                    },2000); //dont change till buy has a chance
        });
    }
    newDoPlayerPage(){
        this.playerPage = new PlayerPage();
        this.playerCounter = {};
        this.getAuctionPlayerList();
      
    }
  
    getAuctionPlayerList(){
        jQuery.post('https://www.mysfs.net/auctions/get_auction_players_listing',
            {page: 1, visiblePages: 1, totalCount: 48},
            function(data){
              data.msg.each((index,elem)=>{
                  if(elem.buy_value>500000000){
                    if(this.playerCounter[elem.player_id]==null) this.playerCounter[elem.player_id]=0;
                    else this.playerCounter[elem.player_id]++;
                    if(this.playerCounter[elem.player_id]>5 && elem.player_id != this.playerPage.pageId){
                      //do auction & reset counter
                      this.bidder = new Bidder();
                      this.playerCounter[elem.player_id]=0;
                      this.playerPage.log("Auction Bid "+this.playerPage.pageId);
                    }
                  }
                });
              setTimeout(()=>{this.getAuctionPlayerList();},1000);
          },"json");
      
    }
}

class DiamondChaser {
  
  constructor(){
    jQuery('.logo').after(`<div id='sfsclicker'></div>`);
    jQuery('#sfsclicker').css({'font-size': '30px', 'color': '#fff'});
    jQuery('#sfsclicker').append("DIAMOND CHASER");
    console.log('chasing diamond');
    this.playerPage = new PlayerPage();
  //  setTimeout(()=>{
      if(jQuery('#diamond_image_'+this.playerPage.pageId).css('display') == 'inline'){
          console.log('watching Buy');
          this.playerPage.watchBuy(()=>{
               if(GM_getValue('BUY_CHEAP',true) && this.playerPage.getPlayerValue() >= 500000000) return;
              this.playerPage.buyPlayer();
          });
          this.playerPage.watchDiamond(()=>{
            jQuery('a[title="Follow the diamond"]')[0].click();
          });
      }else{
        jQuery('a[title="Follow the diamond"]')[0].click();
      }
   // },5000);
    
  }
}

class DeadCollector {
    constructor(windowIndex){
        jQuery('.logo').after(`<div id='sfsclicker'></div>`);
        jQuery('#sfsclicker').css({'font-size': '30px', 'color': '#fff'});
        jQuery('#sfsclicker').append("DEAD COLLECTOR");
        this.windowIndex = windowIndex;
        this.getPlayerList();
        this.init();
    }
    init(){
        this.playerPage = new PlayerPage();
        var skipList = GM_getValue('SKIP_LIST',[]);
        if(GM_getValue('MY_ID',1) == this.playerPage.pageId || skipList.indexOf(this.playerPage.pageId)>-1) {
          this.playerPage.log('Skipping:'+this.playerPage.pageId);
          DeadCollector.nextPlayer();
          return;
        }
        //console.log(this.playerPage.pageId+":"+skipList.indexOf(this.playerPage.pageId));
      
        this.playerPage.watchBuy(()=>{
            if(GM_getValue('BUY_CHEAP',true) && this.playerPage.getPlayerValue() >= 500000000){
              DeadCollector.nextPlayer();
              return;
            }
          this.playerPage.buyPlayer();
        });
      
        this.playerPage.watchWorkPet(()=>{
            this.playerPage.workPet();
           // this.playerPage.log('work'+this.playerPage.pageId);
            DeadCollector.nextPlayer();
        });
        
        this.playerPage.watchSell(()=>{
            if(jQuery('.freePet_'+this.pageId).css('display')=='list-item'){ //whats this?
                DeadCollector.NextPlayer();
                this.playerPage.log('whats this '+this.playerPage.pageId);
                return;
            }
            this.playerPage.log('sell'+this.playerPage.pageId);
            this.playerPage.sellPet(DeadCollector.nextPlayer);
        });
      
        this.playerPage.watchBid(()=>{
            DeadCollector.nextPlayer();
        }); //if bid button up nothing to do
      /*
        this.bidWatcher = new WatchBid(this.nextPlayer,this.playerPage.pageId);
        this.bidWatcher.start();
      */
        this.playerPage.watchAuctionTimer(()=>{
          if(!jQuery('.work_pet_li_'+this.playerPage.pageId).hasClass('disable-element')) return;
          if(!jQuery('.sold_pet_li_'+this.playerPage.pageId).hasClass('disable-element')) return;
          if(!jQuery('.buy_li_'+this.playerPage.pageId).css('display')=='none') return;
          //this.playerPage.log('pagedone '+this.playerPage.pageId);
          DeadCollector.nextPlayer();
        },-1);
        
       // setTimeout(()=>{this.playerPage.log('DeadCollector Timeout: '+this.playerPage.pageId); this.nextPlayer();},10000);
      setTimeout(()=>{this.playerPage.log('timeout '+this.playerPage.pageId);},10000);
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
    static nextPlayer(){
        var windowIndex = DeadCollector.getWindowIndex();
        var playerList = GM_getValue('PlayerList',[]);
        var playerListIndex = GM_getValue('PlayerListIndex'+windowIndex,0);
        var nextId = playerListIndex + 1;
        if(nextId >= playerList.length){
            nextId = 0;
            GM_setValue('CycleTime',jQuery.now());
        }
        GM_setValue('PlayerListIndex'+windowIndex, nextId);
        DeadCollector.loadPlayerPage(playerList[nextId].player_id);
    }
    static loadPlayerPage(id){
        setTimeout(()=>{
            window.location.href ='https://www.mysfs.net/home/index/' + id;
        },500);
    }
    static getWindowIndex(){
        return window.name.split(":")[1];
    }
}

class AuctionPage {
    constructor(){
        jQuery('.logo').after(`<div id='sfsclicker'></div>`);
        jQuery('#sfsclicker').css({'font-size': '14px', 'color': '#fff'});
        jQuery('#sfsclicker').append("<button id='auctionbutton' class='auction-buttons'>Auto Auction</button>");
        jQuery('#auctionbuttonbutton').on("click", this.watchAuction);
        jQuery('.auction-buttons').css({'color':'#000'});
        this.running = false;
    }
    watchAuction(){
      // jQuery('.auction_players_listing li').each((index,elem)=>{console.log(jQuery(elem).children(".auction-counter-actual-value")[0]);})
        console.log('start watching');
        var counter = {};
        this.auctionObserver = new MutationObserver(()=>{
            jQuery('.auction_players_listing li').each((index,elem)=>{
                var val = jQuery(elem).children(".wall-pic-name").children('.auction-counter').children('.auction-counter-actual-value').text()
                if(val!=null){
                  var actualValue = val.replace(/,/g,"");
                  if(actualValue >  500000000){
                    var bidPage = parseInt(jQuery(elem).children('a').prop('href').match(/[0-9]+/g));
                    if(counter[bidPage]==null) counter[bidPage]=0;
                    else counter[bidPage]++;
                    //console.log('index:'+bidPage+" val:"+counter[bidPage]);
                    if(counter[bidPage]>5){
                      var nextAuction = GM_getValue('NEXT_AUCTION',0);
                      var oldAuction = GM_getValue('OLD_AUCTION',0);
                      if(nextAuction != bidPage && oldAuction != bidPage){
                          GM_setValue('OLD_AUCTION', nextAuction);
                          GM_setValue('NEXT_AUCTION',bidPage);
                          console.log('bid page: ' + bidPage);
                        
                        if(!this.running){
                          //open bidding window
                          window.open('https://www.mysfs.net/home/index/'+bidPage,'bid:');
                          this.running = true;
                        }
                   
                      }else console.log('not next'+bidPage);
                      
                    }
                  }
                }
            });
        });
        this.auctionObserver.observe(jQuery('.auction_players_listing').get(0),{characterData: true,childList: true,attributes: true});
    }
    getAuctionValue(){
        return jQuery('.auction-counter-actual-value').text().replace(/,/g,"");
    }
}

class PlayerPage {
    constructor(){
        var path = window.location.pathname.match(/[0-9]+/g);
        if(path!=null) this.pageId = parseInt(path[0]);  //TODO change to method and static
    }
    buyPlayer(){
        buyToAnyPlayer();
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
      location.reload();
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
          this.log('Sold Pet2 ' +this.pageId);
            jQuery.post('https://www.mysfs.net/home/sold_pet',
                { otherPlayerId: this.pageId },
                function(data){          
                    doThis();
                },"json"); 
          location.reload();
        };
    }
    watchSell(doThis){
        this.sellObserver = new MutationObserver(()=>{
            if(jQuery('.sold_pet_li_'+this.pageId).hasClass('disable-element')) return; //check if sell button up
            doThis();
        });
        this.sellObserver.observe(jQuery('#sold_pet').get(0),{attributes: true});
    }
    bid(){  
        bidToAnyPlayer(); 
       // this.log('bid'+this.pageId);
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
            
            if(isNaN(min) || (sec + min * 60)<=time) {
              dothis();
            }
        });
        this.auctionTimerObserver.observe(jQuery('.auction_timer').get(0),{characterData: true,childList: true});
    }
    watchDiamond(noDiamond){
      this.diamondObserver = new MutationObserver(()=>{
       if(jQuery('#diamond_image_'+this.pageId).css('display') != 'inline'){
         noDiamond();
       }
      });
      this.diamondObserver.observe(jQuery('#diamond_player_'+this.pageId).get(0),{attributes: true});
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
        super(()=>{
            if(jQuery('.bid_li_'+pageId).css('display') != 'list-item') return; //check if bidbutton up
            callback();
        });
        this.pageId = pageId;
    }
    start(){
        this.observe(jQuery('.bid_li_'+this.pageId).get(0),{attributes: true});
    }
    stop(){
        this.observe.disconnet();
    }
}
var clicker = new SFSClicker();

