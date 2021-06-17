// ==UserScript==
// @name        SFS Clicker - test
// @namespace   https://violentmonkey.github.io
// @version     3.0t
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

class SFSClicker {
    constructor(){
        var path = window.location.pathname;
        if(path!=null) this.pageId = parseInt(path.match(/[0-9]+/g)[0]);
    }
}

class AutoAuction {
    constructor(){
        
    }
    doingAuctionPage(){
        
    }
    doingPlayerPage(){
        this.playerPage = new PlayerPage();
        this.playerPage.watchBid();
        this.playerPage.watchAuctionTimer(()=>{
            this.playerPage.bidObserver.disconnect();
            if(GM_getValue('DO_RESET',true)){ 
                this.playerPage.watchBuy(); 
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

class DiamondChaser {

}

class DeadCollector {

    getPlayerList(){
        jQuery.post('https://www.mysfs.net/auctions/get_auction_players_listing',
    {page:1,visiblePages:21},
    function(data){
      GM_setValue('AuctionData', data.msg);
    },"json");
    }

    nextPlayer(){

    }
}

class AuctionPage {
    watchAuction(){
        this.auctionObserver = MutationObserver(()=>{
            jQuery('.auction-counter-actual-value').each((index,elem)=>{
                //jQuery('.auction_players_listing li').children(".auction-counter-actual-value")
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
        this.playMode = playMode;
        this.pageId = parseInt(path.match(/[0-9]+/g)[0]);
    }
    watchBuy(){
        this.buyObserver = new MutationObserver(()=>{
            if(jQuery('.buy_li_'+pageId).css('display')!='list-item') return;
            if(GM_getValue('BUY_CHEAP',true) && GetPlayerValue() >= 500000000){
              NextPlayer(); //this doesnt go here maybe, no need to watch buy if expensive, pagedone check
              return;
            }
            Log('Buy '+pageId);
            buyToAnyPlayer();
          });
        this.buyObserver.observe(jQuery('.buy_li_'+pageId).get(0),{attributes: true});
    }

    watchWorkPet(){
        this.workObserver = new MutationObserver(()=>{
            if(jQuery('.work_pet_li_'+pageId).hasClass('disable-element')) return;
            var energy = GetEnergy();
            if(energy == 0){
              //SellPet();
              Log('Sold Pet1 ' +pageId);
              return;
            }else if(energy <= 60){
              multichoice_work_on_pet(energy.toString()[0]);
            }else if(energy > 60){
              multichoice_work_on_pet('6');
            }
            location.reload();
        });
        this.workObserver.observe(jQuery('.work_pet_li_'+pageId).get(0),{attributes: true});
    }

    watchSell(){
        this.sellObserver = new MutationObserver(()=>{
            if(jQuery('.sold_pet_li_'+pageId).hasClass('disable-element')) return;
            if(jQuery('.freePet_'+pageId).css('display')=='list-item'){ NextPlayer();return;}
            var energy = GetEnergy();
            if(energy == 0){
              SellPet();
              Log('Sold Pet2 ' +pageId);
              location.reload();
            };
        });
        this.sellObserver.observe(jQuery('.sold_pet_li_'+pageId).get(0),{attributes: true});
    }
    watchBid(){
        this.bidObserver = new MutationObserver(()=>{
            if(jQuery('.bid_li_'+pageId).css('display') != 'list-item') return;
            if(GetAuctionTimer() <= 30) return; //change, need 30/15sec watcher if just bidding
            bidToAnyPlayer(); 
        });
        this.bidObserver.observe(jQuery('.bid_li_'+pageId).get(0),{attributes: true});
    }
    watchPageDone(){
        //add bid button and too expensive check here.
        this.pageDoneObserver = new MutationObserver(()=>{
            if(jQuery('#auction_timer_'+pageId).text()=='--:--'){
              if(jQuery('.work_pet_li_'+pageId).hasClass('disable-element') &&
              jQuery('.sold_pet_li_'+pageId).hasClass('disable-element') &&
              jQuery('.buy_li_'+pageId).css('display')=='none'){
                if(jQuery('.bid_li_'+pageId).css('display') != 'list-item'){
                  RecordActionTimer();
                }
                NextPlayer();
              }
            }
        });
        this.pageDoneObserver.observe(jQuery('#auction_timer_'+pageId).get(0),{characterData: true,childList: true});
    }
    watchAuctionTimer(dothis,time){
        this.auctionTimerObserver = new MutationObserver(()=>{
            if(this.getAuctionTimer<=time){
                dothis();
                disconnect();
            }
        });
        this.auctionTimerObserver.observe(jQuery('.auction_timer').get(0),{characterData: true,childList: true});
    }
    GetPlayerValue(){
        return parseFloat(jQuery('#actual_value_'+pageId).text().replace(/,/g,""));
    }
    GetEnergy(){
        return parseInt(jQuery('.battery-li_'+pageId).children('span').first().text().split('%')[0]);
    }
    getAuctionTimer(){
        if(jQuery('.bid_li_'+pageId).css('display') == 'list-item'){
          var aucTimer=jQuery('.auction_timer').text().split(':');
          var min = parseInt(aucTimer[0]);
          var sec = parseInt(aucTimer[1]);
          return sec + min * 60;
        }else return -1;
    }
}
