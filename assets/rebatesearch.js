    /******************
    * Rebate Search
    * ****************/
    var RebateSearch = {
        searchValue: '',
        rebateinfo: [],
        firstLoad: true,
        currentZip: '',
        newZip: '',

        currentUtility: '',
        newUtility: '',
        utilityList: {},
        utilityOpts: '',

        currentCategory: '',
        newCategory:'',
        categoryList: {},
        categoryOpts: '',
        cat_list: '',
//            cat_list: 'LA14,LA22,LA24,AFS,B,DLCS,LRL8,LRL4,FPC,HB,LAD,LB,AR,D,WA,PG,RLHB,RLAR,RLD,RKLA22,RKLA24,RKHB,RKAR,SP,UBRL,VRC',
        searchRebateNote: '<br><span class="smallerfootnotefont">*Program and eligibility must be verified.</span>',
        rebateNote: '<span class="smallerfont">*Rebate estimate from <strong>{}</strong>. <a class="search-again link" href="#rebate_popup1">Change zip code or utility</a>.</span>',
        catsSet: false,
        update: false,
        def_util: '<option value="" SELECTED>Click Here to Choose Your Utility</option>',
        token: 'c789f862-0831-4007-a414-6646fed4f437',
        ee_api: {},

        producPageSetup: function(searchValue) {
/*
            if($('.sku').val() == '') {
                $('.box').parent().addClass('hide');
                return;
            }
*/
            $('.sku').prop('readonly',true);
            $('.skuwrapper').addClass('hide');
            $('table#sortable').addClass('hide');
            $('.first-search').removeClass('hide');
            $('.single-result').removeClass('hide');
            if (!!Cookies.get('eled_rebateinfo')) {
                RebateSearch.rebateinfo = JSON.parse(Cookies.get('eled_rebateinfo'));
                RebateSearch.newZip = RebateSearch.rebateinfo[0]
                RebateSearch.currentZip = RebateSearch.rebateinfo[0]
                RebateSearch.newUtility = RebateSearch.rebateinfo[1]
                RebateSearch.currentUtility = RebateSearch.rebateinfo[1]
            }
            RebateSearch.searchValue = searchValue;
            RebateSearch.startApi();
            RebateSearch.initCategories();
            if(RebateSearch.newZip != '' && typeof RebateSearch.newZip != 'undefined') {
                RebateSearch.get_utilities();
            }
            RebateSearch.setupEvents();
            $(document).ajaxStop(function () {
                if(typeof RebateSearch.rebateinfo[0] != 'undefined') {
                    if(RebateSearch.rebateinfo[0].length == 5 && RebateSearch.rebateinfo[1].length >= 1 && RebateSearch.catsSet == true) {
                        $('.rebate_container .zip_code').val(RebateSearch.rebateinfo[0]);
                        //$('.rebate_container .utilities').val(RebateSearch.rebateinfo[1]).change();
                        $('.rebate_container .utilities option[value=' + RebateSearch.rebateinfo[1] +']').prop('selected', 'selected').change();
                        //console.log($('.rebate_container .utilities').length);
                        //console.log($('.rebate_container .utilities option').length);
                        RebateSearch.processVals();
                        $(this).unbind("ajaxStop");
                    }
                }
            });
        },

        fullPageSetup: function(searchValue) {
            catchTableUpdate();
            RebateSearch.searchValue = searchValue;
            RebateSearch.startApi();
            RebateSearch.initCategories();
            RebateSearch.setupEvents();
        },

        initCategories: function() {
            /*Initialize Category selections*/
            RebateSearch.ee_api.categories().done(function(data) {
                RebateSearch.categoryList = data;
                $(data).each(function(key, val) {
                    RebateSearch.categoryOpts = RebateSearch.categoryOpts + '<option val="'+val.value+'">'+val.name+'</option>';
                });
                if($(RebateSearch.categoryOpts).length >= 1) {
                    $('.categories').html(RebateSearch.categoryOpts);
                }
                RebateSearch.catsSet = true;
            });
        },

        startApi: function() {
            /*instantiate API connection*/
            RebateSearch.ee_api = new EEWidgetAPI({
                token: RebateSearch.token, search: RebateSearch.searchValue, prewatts: 999, prehours: 4000
            });
        },

        setupEvents: function() {
            /*Set up click and change events*/
            $('button.rebate_search.button').on('click', function() {
                RebateSearch.processVals();
            });
            $('.rebate_container .zip_code, .rebate_container .utilities, .rebate_container .categories').on('change', function() {
                RebateSearch.processVals();
            });
            $('.rebate_container .sku').on('change', function() {
                RebateSearch.searchValue = $('.rebate_container .sku').val();
                if(RebateSearch.searchValue == '') {
                    RebateSearch.searchValue == ' ';
                }
                RebateSearch.update = true;
                RebateSearch.processVals();
            });
        },

        processVals: function() {
            /*Something changed - update list of Products*/
            RebateSearch.newSearch = $('.rebate_container .sku').val();
            RebateSearch.newZip = $('.rebate_container .zip_code').val();
            if($('.rebate_container .utilities option').length == 1) {
                RebateSearch.newUtility = '';
            } else {
                RebateSearch.newUtility = $('.rebate_container .utilities').val();
            }
            if($('.rebate_container .categories option').length == 1) {
                RebateSearch.newCategory = '';
            } else {
                RebateSearch.newCategory = $('.rebate_container .categories').val();
            }
            /*Selected category changed*/
            if(RebateSearch.newCategory != RebateSearch.currentCategory) {
                RebateSearch.currentCategory = RebateSearch.newCategory;
                RebateSearch.update = true;
            }
            /*Zip changed and is useable*/
            if(RebateSearch.newZip != RebateSearch.currentZip && RebateSearch.newZip.length == 5) {
                /*we have a good new zip code - get new utilities*/
                RebateSearch.currentZip = RebateSearch.newZip;
                RebateSearch.update = true;
                RebateSearch.get_utilities();
            }
            /*New Utility selected*/
            if(RebateSearch.currentUtility != RebateSearch.newUtility) {
                RebateSearch.currentUtility = RebateSearch.newUtility;
                RebateSearch.update = true;
            }
            /*Zip is not good - clear data*/
            if(RebateSearch.newZip.length != 5) {
                $('.rebate_container .utilities').html(RebateSearch.def_util);
                $('.rebate_container .utilcount').html(0);
                $('.rebate_container tbody.main').html(' ');
                RebateSearch.newUtility = '';
                RebateSearch.update = false;
            }
            /*Utility is blank - Clear list*/
            if(RebateSearch.currentUtility == '') {
                $('.rebate_container .utilcount').html(0);
                $('.rebate_container tbody.main').html(' ');
                RebateSearch.update = false;
            }
            /*update if needed*/
            if(RebateSearch.update) {
                RebateSearch.get_products();
            }
        },
        /*get list of utilities within supplied Zip Code*/
        get_utilities: function() {
            RebateSearch.update = false;
            /*get all utilities in a Zip Code*/
            RebateSearch.ee_api.utilities({ zip: RebateSearch.currentZip, format: 'json' }).done(function(jdata) {
                console.log("utilities",jdata);
            });
            RebateSearch.ee_api.utilities({ zip: RebateSearch.currentZip }).done(function(data) {
                RebateSearch.process_utilities(data);
                if(RebateSearch.update) {
                    RebateSearch.get_products();
                }
            });
        },
        /*Create list of possible rebates*/
        process_utilities: function(data) {
          console.log("processing utilities");
            RebateSearch.utilityOpts = data;
            var utilityTmp = {};
            var ut = [];
            $(data).each(function(key,val) {
                if(val.nodeName == "OPTGROUP") {
                    $(val.innerHTML).each(function(ogkey,ogval) {
                        if(ogval.nodeName == "OPTION" && ogval.value != '') { 
                            utilityTmp.val = ogval.value; 
                            utilityTmp.name = ogval.text;
                            var utilityClone = Object.assign({},utilityTmp);
                            ut.push(utilityClone);
                        }
                    })
                }
            });
            if(ut.length >= 1) {
              var optselected = false;
                /*display count of utilities for current Zip*/
                $('.rebate_container .utilcount').html(ut.length);  
                RebateSearch.update = true;
                RebateSearch.utilityList = ut;
                $('.rebate_container .utilities').html(RebateSearch.utilityOpts);
                $('.rebate_container .utilities option').each(function(key, val) {
                    if($(val).val() == RebateSearch.newUtility) {
                        $(val).attr('selected','selected');
                        optselected = true;
                        RebateSearch.update = true;
                    }

                })
                /*select if only one option*/
                if($('.rebate_container .utilities option').length === 1 || optselected == false) {
                    $('.rebate_container .utilities option').eq(0).attr('selected','selected');
                    RebateSearch.newUtility = $('.rebate_container .utilities option').eq(0).val();
                    RebateSearch.rebateinfo[1] = RebateSearch.newUtility;
                    RebateSearch.update = true;
                }
                if(RebateSearch.newUtility != RebateSearch.currentUtility) {
                    RebateSearch.currentUtility = RebateSearch.newUtility;
                    RebateSearch.rebateinfo[1] = RebateSearch.newUtility;
                    RebateSearch.update = true;
                }
            }
        },

        get_products: function() {
            /*get products*/
            var rs = ' ';
            if(RebateSearch.searchValue != '') {
                rs = RebateSearch.searchValue;
            }
            RebateSearch.ee_api.settings({ token: RebateSearch.token, search: rs, prewatts: 999, prehours: 4000 });

            if(RebateSearch.currentUtility != '' && RebateSearch.currentZip != '' & RebateSearch.currentZip.length >= 5) {
                if(RebateSearch.searchValue == '' || RebateSearch.searchValue == ' ') {
                    $('.rebate_container tbody.main').empty();
                    RebateSearch.get_products_special();
                } else {
                    $('.rebate_container tbody.main').empty();
                    RebateSearch.do_product_api(RebateSearch.cat_list);
                }
            } else {
                RebateSearch.update = false;
                $('.rebate_container tbody.main').empty();
            }
        },

        get_products_special: function() {
            $(RebateSearch.categoryList).each(function(ckey,cval) {
                if(cval.value != '') {
                    RebateSearch.do_product_api(cval.value);
                }
            });
        },

        do_product_api: function(cats) {
            if(cats.indexOf(',') >= 0) {
                //looping
                cats_array = cats.split(',');
                $(cats_array).each(function(key,val) {
                    console.log("ee_api.rebates: zip:"+RebateSearch.currentZip, "utility: "+RebateSearch.currentUtility, "midstream: true, category: "+val, RebateSearch);
                    RebateSearch.ee_api.rebates({ zip: RebateSearch.currentZip, utility: RebateSearch.currentUtility, midstream: true, category: val }).done(function(data) {
                          console.log(RebateSearch.currentZip, RebateSearch.currentUtility, val);
                        console.log(data);
                    });   
                });
                return;     
            }
            console.log("ee_api.rebates: zip:"+RebateSearch.currentZip, "utility: "+RebateSearch.currentUtility, "midstream: true, category: "+cats, RebateSearch);
            RebateSearch.ee_api.rebates({ zip: RebateSearch.currentZip, utility: RebateSearch.currentUtility, midstream: true, category: cats }).done(function(data) {
                console.log(RebateSearch);
                console.log(data);
                RebateSearch.update = false;
                var rebatelines = '';
                var units = '';
                var unsupported = '';
                if(data.data.length >= 1) {
                    $(data.data).each(function(key,prod) {
                        var rebateamount = prod.rebate;
                        if(prod.rebate.indexOf('$') >= 0 && prod.rebate.indexOf('$0') === -1) {
                            units = '/' + prod.units;
                            if(rebateamount.indexOf(" ")) {
                                rb = rebateamount.split(" ");
                                $(rb).each(function(key,data) {
                                    if(data.indexOf("$") === 0) {
                                        rebateamount = data;
                                    }
                                });
                            }
                            if(rebateamount.indexOf("$") === 0) {
                                rb1 = rebateamount.replace('$','').split(" ");
                                rb2 = parseFloat(rb1[0]).toFixed(2);
                                rebateamount = '$' + rb2;
                            } else {
                                rebateamount = "N/A";
                            }
                        } else {
                            units = '';
                            if(prod.rebate=='$0') {
                                rebateamount = "N/A";
                            }
                        }
                        if(prod.variants.length >= 1) {
                            $(prod.variants).each(function(pkey, pprod) {
                                RebateSearch.do_single_product(rebateamount, units, prod.utility_name, data.program_rebate_cap);
                                $('.rebate_container tbody.main').append('<tr class="' + unsupported +'"><td>' + pprod.variant + '<br/><span class="smallfont">' + prod.product_category + '</span></td><td class="hide">' + parseFloat(rebateamount.replace('$','')).toFixed(2) + '</td><td>' + rebateamount + units + '</td><td>' + prod.utility_name + '</td></tr>');
                            });
                        } else {
                            RebateSearch.do_single_product(rebateamount, units, prod.utility_name, data.program_rebate_cap);
                            $('.rebate_container tbody.main').append('<tr class="' + unsupported +'"><td>' + prod.product + '<br/><span class="smallfont">' + prod.product_category + '</span></td><td class="hide">' + parseFloat(rebateamount.replace('$','')).toFixed(2) + '</td><td>' + rebateamount + units + '</td><td>' + prod.utility_name + '</td></tr>');
                        }
                    });
                } else {
                    $('.box').addClass('hide');
                }
                //set cookie with Zip and Utility after rebate query
                if($('.zip_code').val().length == 5 && parseInt($('.utilities').val()) >= 1) {  //$('.utilities').val() != '' && $('.utilities').val().indexOf(' Choose ') == -1 && $('.utilities').val().indexOf(' Zip Code ') == -1) {
                    RebateSearch.rebateinfo[0] = $('.zip_code').val();
                    RebateSearch.rebateinfo[1] = $('.utilities').val();
                    Cookies.set('eled_rebateinfo', JSON.stringify(RebateSearch.rebateinfo));
                }
            });
        },

        do_single_product: function(rebateamount, units, utility_name, terms) {

            //x ...rebate available from ...
            //x No rebate available from ...
            //x Rebates may be available but are not published for ... 
            //+ ... ... <a class="product-form__add-button link">Contact Us to Redeem</a>
            var rebate_terms = '';
            if(typeof terms != 'undefined' && terms) {
                if(terms.length >=1) {
                    //rebate_terms = '<div class="terms">Rebate Cap: ' + terms + '</div>';
                }
            }
            var addfootnote = false;
            var tags = "?s=" + $('.sku').val() + "&z=" + $('.zip_code').val() + "&u=" + $('.utilities option:selected').text().replaceAll("&", "%26");

            if(rebateamount.indexOf("$") >= 0) {
                //have amount
                addfootnote = true;
                search_rebate_text = '<span class="bigredtext">Rebate available for up to ' + rebateamount + '<span style="text-transform: lowercase;">' + units + '</span>*</span><br><span class="smallerfont"><a class="contactus link" href="/pages/instant-rebate-incentives' + tags + '">Contact&nbsp;Us&nbsp;to&nbsp;Redeem</a> or <span class="linewrapper">check&nbsp;another&nbsp;zip&nbsp;code.</span></span>';
                rebate_text = '<span class="greentext"><a class="contactus link" href="/pages/instant-rebate-incentives' + tags + '">Rebate available up to&nbsp' + rebateamount + '<span style="text-transform: lowercase;">' + units + '</span>*</a></span>';
//                search_rebate_text = '<span class="green">Rebate available up to&nbsp;' + rebateamount + units + '*</span> from <span class="utilityname">' + utility_name + '</span><br><a class="contactus link" href="/pages/instant-rebate-incentives' + tags + '">Contact&nbsp;Us&nbsp;to&nbsp;Redeem</a> or <span class="linewrapper">check&nbsp;another&nbsp;zip&nbsp;code.</span>' + RebateSearch.rebateNote;
            }
            if(rebateamount.indexOf("Utility") >= 0 || rebateamount.indexOf("TRANSITION") >= 0) {
                //rebate but no value
                addfootnot = false;
                rebate_text = 'Rebates may be available from <span class="utilityname">' + utility_name + '</span> but are not published.<br><a class="contactus link" href="/pages/find-money-saving-financial-incentives-for-your-lighting-upgrade' + tags + '">Have&nbsp;us&nbsp;find&nbsp;them&nbsp;out&nbsp;for&nbsp;you</a> or <span class="linewrapper"><a class="search-again link" href="#rebate_popup1">check another zip code.</a></span>';
                search_rebate_text = 'Rebates may be available from <span class="utilityname">' + utility_name + '</span> but are not published.*<br><a class="contactus link" href="/pages/find-money-saving-financial-incentives-for-your-lighting-upgrade' + tags + '">Have&nbsp;us&nbsp;find&nbsp;them&nbsp;out&nbsp;for&nbsp;you</a> or <span class="linewrapper">check another zip code.</span>';
            }
            if(rebateamount.indexOf("$") === -1 && rebateamount.indexOf("Utility") === -1 && rebateamount.indexOf("TRANSITION") === -1) {
                //no rebate
                addfootnote = false;
                rebate_text = '<span style="font-weight: normal; font-size: 13px;">Instant rebates not available from <span class="utilityname">' + utility_name + '</span>, but we may be able to find downstream rebates and additional savings.</span> <a class="contactus link normal" style="font-weight: bold;; font-size: 13px;" href="/pages/find-money-saving-financial-incentives-for-your-lighting-upgrade' + tags + '">Inquire</a><span style="font-weight: normal; font-size: 13px;"> or </span><span class="linewrapper" style="font-weight: normal; font-size: 13px;"><a class="search-again link" href="#rebate_popup1">try&nbsp;another&nbsp;zip&nbsp;code.</a></span>';
                search_rebate_text = '<span style="font-weight: normal;">Instant rebates not available from <span class="utilityname">' + utility_name + '</span>, but we may be able to find downstream rebates and additional savings.</span> <a class="contactus link" href="/pages/find-money-saving-financial-incentives-for-your-lighting-upgrade' + tags + '" style="font-weight: bold;">Inquire</a><span style="font-weight: normal;"> or </span><span class="linewrapper" style="font-weight: normal;">try&nbsp;another&nbsp;zip&nbsp;code</span>.';
            }
            $('.single-result').html('<div class="rebate_result">' + search_rebate_text + '</div>');
            if(addfootnote) {
                $('.rebatefootnote').show();
                $('.rebatefootnote').html(RebateSearch.rebateNote.replace("{}",utility_name)); 
            } else {
                $('.rebatefootnote').hide();
                $('.rebatefootnote').html("");
            }
            $('.rebate-text').html('<div class="rebate_result">' + rebate_text + '</div>');
            $('.first-search').addClass('hide');
        }
    }

    //RebateSearch.fullPageSetup(" ");
function catchTableUpdate() {
    $(document).ajaxStop(function () {
        if(document.getElementById("sortable").rows.length >= 2) {
            sortBy(1);
            sortBy(1);
            var rows = document.getElementById("sortable").rows;
            $(rows).each(function(key,val){
                if($(val).html().indexOf('$') >= 0) {
                    $(val).removeClass();
                } else {
                    $(val).addClass('light');
                }
            });
            cPrev = -1;
        }
    });
}

function closeAndRefreshCart() {
  history.back();
  observerMiniCart();
  var newNode = document.createElement('div');
  var cartNode = document.getElementById('mini-cart');
  cartNode.appendChild(newNode);
}
    /*** Table sort ***/
    /*
    A few requirements for configuring the table:
    1. The table must have id="sortable", i.e. <table id="sortable">
    2. The table needs to have a table header, and the table header must have
    onclick="sortBy(n)", where n is the column number starting with 0
    i.e. <th onclick="sortBy(0)">Title of First Column</th>
    */

    cPrev = -1; // global var saves the previous c, used to
                // determine if the same column is clicked again

    function sortBy(c) {
        rows = document.getElementById("sortable").rows.length; // num of rows
        columns = document.getElementById("sortable").rows[0].cells.length; // num of columns
        arrTable = [...Array(rows)].map(e => Array(columns)); // create an empty 2d array

        for (ro=0; ro<rows; ro++) { // cycle through rows
            for (co=0; co<columns; co++) { // cycle through columns
                // assign the value in each row-column to a 2d array by row-column
                if(co === 1 && document.getElementById("sortable").rows[ro].innerHTML.indexOf('$') >= 0) {
                    arrTable[ro][co] = parseFloat(document.getElementById("sortable").rows[ro].cells[co].innerHTML);
                } else {
                    if(co === 1) {
                        arrTable[ro][co] = 0; //document.getElementById("sortable").rows[ro].cells[co].innerHTML;
                    } else {
                        arrTable[ro][co] = document.getElementById("sortable").rows[ro].cells[co].innerHTML;
                    }
                }
                
    //            console.log(co,arrTable[ro][co]);
            }
        }

        th = arrTable.shift(); // remove the header row from the array, and save it
        
        if (c !== cPrev) { // different column is clicked, so sort by the new column
            arrTable.sort(
                function (a, b) {
                    if (parseFloat(a[c]) === parseFloat(b[c])) {
                        return 0;
                    } else {
                        return (parseFloat(a[c]) < parseFloat(b[c])) ? -1 : 1;
                    }
                }
            );
        } else { // if the same column is clicked then reverse the array
            arrTable.reverse();
        }
        
        cPrev = c; // save in previous c

        arrTable.unshift(th); // put the header back in to the array

        // cycle through rows-columns placing values from the array back into the html table
        for (ro=0; ro<rows; ro++) {
            for (co=0; co<columns; co++) {
                document.getElementById("sortable").rows[ro].cells[co].innerHTML = arrTable[ro][co];
            }
        }
    }

//console.log("rebatesearch.js loaded");
/*
Cookies.set('eled_rebateinfo', JSON.stringify(rebateinfo));

dataq = JSON.parse(Cookies.get('rebateinfo'));
console.log(dataq[0]);
console.log(dataq[1]);
*/