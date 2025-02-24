var searchRunning = false;
var skus = '';
function miniCartRebate(searchValue) {
  //console.log("rebate search started...");
    var vars = {};
    var rebateamount = '';
    var units = '';
    var utilityName = '';
    var token = 'c789f862-0831-4007-a414-6646fed4f437';
    if(skus == '') {
      skus = searchValue;
    } else {
      skus = skus + ',' + searchValue;
    }
    if (!!Cookies.get('eled_rebateinfo')) {
        var rebateinfo = JSON.parse(Cookies.get('eled_rebateinfo'));
        if(rebateinfo[0] !== '' && rebateinfo[0].length === 5 && parseInt(rebateinfo[1]) >= 1) {
            vars['ee_api_cart' + searchValue.replace("-","_").replace(".","_")] = new EEWidgetAPI({ token: token, search: searchValue, prewatts: 999, prehours: 4000 });
            vars['ee_api_cart' + searchValue.replace("-","_").replace(".","_")].utilities({ zip: rebateinfo[0] }).done(function(data) {
                $(data).each(function(key,val) {
                    if(val.nodeName == "OPTION" && val.value == rebateinfo[1]) { 
                        utilityName = val.text;
                    }
                });
                searchRunning = true;
                vars['ee_api_cart' + searchValue.replace("-","_").replace(".","_")].rebates({ zip: rebateinfo[0], utility: rebateinfo[1], midstream: true, category: " " }).done(function(data) {
                    //console.log("API Call: ", data);
                    if(data.data.length >= 1) {
                        $(data.data).each(function(key,prod) {
                            if(prod.rebate.indexOf('$') >= 0 && prod.rebate.indexOf('$0') === -1) {
                                rebateamount = prod.rebate;
                                units = '/' + prod.units;
                                if(rebateamount.indexOf(" ")) {
                                    var rb = rebateamount.split(" ");
                                    $(rb).each(function(key,data) {
                                        if(data.indexOf("$") === 0) {
                                            rebateamount = data;
                                        }
                                    });
                                }
                                if(rebateamount.indexOf("$") === 0) {
                                    var rb1 = rebateamount.replace('$','').split(" ");
                                    var rb2 = parseFloat(rb1[0]).toFixed(2);
                                    rebateamount = '$' + rb2;
                                }
                            }
                        });
                    }
                    if(rebateamount !== '') {
                      //console.log(utilityName,rebateamount);
                        $("." + searchValue.replace(".","_") + ".minicartvalue").html("Up to " + rebateamount + units + " Rebate&nbsp;Available*");
                        $("." + searchValue.replace(".","_") + ".minicartvalue").removeClass('hide');
                        if(utilityName != '') {
                            var tags = "?s=" + skus + "&z=" + rebateinfo[0] + "&u=" + utilityName.replaceAll("&", "%26");
                            $('.cartrebatefootnote').html(' *Rebate estimate(s) for <strong>' 
                              + utilityName.replaceAll("&", "%26") 
                              + '.</strong></span><br>' 
                              + 'To verify eligibility: call <a class="contactus link green nowrap" href="tel:215-355-7200">215-355-7200</a>, <a class="contactus link green" href="mailto:rebates@eledlighs.com">Email</a>, or submit <a class="contactus link green nowrap" href="/pages/instant-rebate-incentives' + tags + '">Quick-Form</a>.');
                        }
                    } else {
                        $("." + searchValue.replace(".","_") + ".minicartvalue").html("");
                    }
                    searchRunning = false;
                });
            });
        }
    }
    if(queue >= 1) {
        queue--;
    }
}
var miniCartObserver = false;
var queue = 0;
function observerMiniCart() {
  //console.log("MiniCart observer started");
    const targetNode = document.getElementById('mini-cart');
    if (typeof(targetNode) != 'undefined' && targetNode != null) {
        if(!miniCartObserver) {
            miniCartObserver = true;
            // Create a new observer
            const observer = new MutationObserver((mutations) => {
                mutations.forEach((mutation) => {
                    if (mutation.type === 'childList' && queue === 0) {
                        //console.log('Mini-Cart contents have changed - updating Rebates');
                        var lineitems = document.querySelectorAll('.line-item__info script');
                        skus = '';
                        $('.cartrebatefootnote').html("");
                        lineitems.forEach(script => {
                            queue++;
                            eval(script.textContent);
                        });
                    }
                });
                
            });
            // Configure the observer to watch for changes to the element's children
            const config = { childList: true };
            // Start observing the target element
            observer.observe(targetNode, config);
        }
    }
}