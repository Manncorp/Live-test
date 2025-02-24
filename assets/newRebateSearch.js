  var newRebateSearch = {
    searchValue: '',
    rebateinfo: [],
    rebateNote: '<span class="smallerfont">*Rebate estimate from <strong>{}</strong>. <a class="search-again link" href="#rebate_popup1">Change zip code or utility</a>.</span>',
    pecoNote: '<span class="smallerfont">*Min. cost of $1/fixture. Rebate estimate from <strong>{}</strong>. <a class="search-again link" href="#rebate_popup1">Change zip code or utility</a>.</span>',
    noUtilNote: '<span class="smallerfont"><a class="search-again link" href="#rebate_popup1">Change zip code or utility</a>.</span>',
    multUtil: false,
    utilityDropdown: document.getElementsByClassName("utilities")[0],
    key: 2153557201,
  
    producPageSetup: function (searchValue) {
      $('.sku').prop('readonly', true);
      $('.skuwrapper').addClass('hide');
      $('table#sortable').addClass('hide');
      $('.first-search').removeClass('hide');
      $('.single-result').removeClass('hide');
    
      newRebateSearch.searchValue = searchValue;
  
      newRebateSearch.setupEvents();
  
      if (!!Cookies.get('eled_rebateinfo')) {
        newRebateSearch.rebateinfo = JSON.parse(Cookies.get('eled_rebateinfo'));
        document.getElementsByClassName("zip_code")[0].value = newRebateSearch.rebateinfo[0];
        document.getElementsByClassName("zip_code")[0].dispatchEvent(new Event('change'));
      }
    },
  
    fieldChange: function(e) {
      var changedElement = $(e.target);
      if (changedElement.hasClass('zip_code')) {
        if ($('.rebate_container .zip_code').val().length == 5) {
          newRebateSearch.queryZip(changedElement);  
        }  
      } else {
        if (changedElement[0].value != "choose utility") {
          console.log("fieldChange")
          newRebateSearch.queryUtility(changedElement);
        }
      }
    },
  
    setupEvents: function () {
      /*Set up click and change events*/
      $('button.rebate_search.button').on('click', function () {
      });
  
      $('.rebate_container .zip_code, .rebate_container .utilities').on('change', newRebateSearch.fieldChange);
      $('.rebate_container .sku').on('change', function () {
        newRebateSearch.searchValue = $('.rebate_container .sku').val();
        if (newRebateSearch.searchValue == '') {
          newRebateSearch.searchValue == ' ';
        }
      });
    },
  
    queryZip: function (zipField) {
      newRebateSearch.searchValue = $('.rebate_container .sku').val();
      var zip = zipField[0].value; // has to happen if above is commented out
      newRebateSearch.rebateinfo[0] = $('.zip_code').val();
      Cookies.set('eled_rebateinfo', JSON.stringify(newRebateSearch.rebateinfo));
      var requestObject = { zip: zip, key: newRebateSearch.key, product: newRebateSearch.searchValue };
      var requestData = JSON.stringify(requestObject); 
      console.log("Request: ", requestData)
      var url = "https://briteswitch.com/api/lighting/rebates/eled/index.php";
      newRebateSearch.postData(url, requestData).then((response) => {
        var status = response.status_message;
        console.log("Response: ", response)
        responseData = response.data;
        if (status == "Error") {
          // Cannot find product
          $('.first-search').hide();
          newRebateSearch.errorResponse();
        } else if (status == "Multiple Utilities") {
          newRebateSearch.buildUtilList(responseData)
        }
        else {
          newRebateSearch.invalidUtility(responseData, status, zipField)
        }
      })
    }, 

    invalidUtility: function (responseData, status, zipField) {
      var optionsHTML = [];
      var responseUtility = responseData[Object.keys(responseData)[0]].Utility;
      newRebateSearch.utilityDropdown.innerHTML = optionsHTML;
      $('.single-result').html('<div class="rebate_result">There are no rebates currently available for this location.<br>Try&nbsp;another&nbsp;zip&nbsp;code.</div>');
      $('.rebate-text').html('<div class="rebate_result"><span style="font-weight: normal; font-size 13px">There are no rebates currently available for this location.</span><br><span class="linewrapper" style="font-weight: normal; font-size: 13px;"><a class="search-again link" href="#rebate_popup1">Try&nbsp;another&nbsp;zip&nbsp;code.</a></span></div>');
      $('.rebatefootnote').hide();
      $('.first-search').hide();
    },
  
    buildUtilList: function (responseData) {
      $('.rebate_result').hide();
      var utilRan = true;
      var optionsHTML = []
      optionsHTML.push('<option value="choose utility">Click Here to Choose Your Utility</option>');
      for (var i = 0; i < responseData.length; i++) {
        optionsHTML.push(`<option value="${responseData[i]}">${responseData[i]}</option>`)
      }
      newRebateSearch.utilityDropdown.innerHTML = optionsHTML.join('\n');
      if (newRebateSearch.utilityDropdown.length > 2) {
        newRebateSearch.multUtil = true;
      } else {
        newRebateSearch.multUtil = false;
      }
      newRebateSearch.rebateinfo = JSON.parse(Cookies.get('eled_rebateinfo'));
      var matchFound = false;
      for (var i = 0; i < newRebateSearch.utilityDropdown.options.length; i++) {
        var option = newRebateSearch.utilityDropdown.options[i];
        if (option.value == newRebateSearch.rebateinfo[1]) {
          matchFound = true;
        }
      }
      if (matchFound) {
        $('.utilities').val(newRebateSearch.rebateinfo[1]);
        newRebateSearch.queryUtility(utilRan);
      } else if (newRebateSearch.multUtil == false) {
        newRebateSearch.utilityDropdown.value = newRebateSearch.utilityDropdown.options[1].value
        newRebateSearch.queryUtility(utilRan);
      }
    }, 
  
    queryUtility: function (utilRan) {
      var zip = $('.rebate_container .zip_code').val();
      var tempCookie = JSON.parse(Cookies.get('eled_rebateinfo'));
      if ((newRebateSearch.rebateinfo[1] && newRebateSearch.utilityDropdown.options.selectedIndex != -1) || tempCookie.length == 1) {
        var utility = newRebateSearch.utilityDropdown.value;
      }
      if ($('.utilities').val() != "choose utility") {
        newRebateSearch.rebateinfo[1] = $('.utilities').val();
      }     
      Cookies.set('eled_rebateinfo', JSON.stringify(newRebateSearch.rebateinfo));
      var requestObject = { zip: zip, utility: utility, key: newRebateSearch.key, product: newRebateSearch.searchValue };
      var requestData = JSON.stringify(requestObject); 
      console.log("Request: ", requestData)
      var url = "https://briteswitch.com/api/lighting/rebates/eled/index.php";
      newRebateSearch.postData(url, requestData).then((response) => {
        var status = response.status_message;
        console.log("Response: ", response)
        var responseData = response.data;
        if (status == "Error") {
          // Cannot find product
          $('.first-search').hide();
          newRebateSearch.errorResponse();
        }
        else {
          var responseUtility = responseData[Object.keys(responseData)[0]].Utility;
          var tags = "?s=" + $('.sku').val() + "&z=" + $('.zip_code').val() + "&u=" + $('.utilities option:selected').text().replaceAll("&", "%26");
          if (status == "Success") {
            var final;
            var resultArr = [];
            for (let key in responseData) {
              var row = responseData[key];
              if (row.RebateType == "Midstream") {
                resultArr.push(row)
              }
            } 
            if (resultArr.length > 0) {
              if (responseUtility == "PECO Energy Co - PA" || responseUtility == "PSE&G - Public Service Elec & Gas Co - NJ") {
                const objectsArray = resultArr.map(obj => ({
                  amount: parseFloat(obj.RebateAmount),
                  per: obj.AmountPer
                }));
                objectsArray.sort((a, b) => a.amount - b.amount);
                final = objectsArray[0];
              } else {
                final = {
                  amount: response.maximum_rebate,
                  per: responseData[Object.keys(responseData)[0]].AmountPer
                }
              }
              console.log(final)
              var rebate_amount = parseFloat(final.amount).toFixed(2);
              var prod_type = final.per.toLowerCase();

              if(responseUtility == "PECO Energy Co - PA") {
                //Sets HTML for when a PECO zip code is entered
                $('.single-result').html('<div class="rebate_result"><span class="bigredtext">Buy with $' + rebate_amount + '/' + prod_type + ' Rebate Applied</span><br><span class="smallerfont"><a class="contactus link" onclick="closeAndRefreshCart(); openModal()">Click&nbsp;to&nbsp;Redeem&nbsp;on&nbsp;our&nbsp;Easy&nbsp;Rebates&nbsp;Site</a></span></div>');  
                $('.rebate-text').html('<div class="greentext"><a class="contactus link">Buy with $' + rebate_amount + '/' + prod_type + ' Rebate Applied</a></div>');
                $('.rebatefootnote').html(newRebateSearch.pecoNote.replace("{}", responseUtility)); 
                $('.rebatefootnote').show();
                $('.first-search').hide();

                //Set up DOM to open modal and send to Easy Rebates site
                let urlArr = window.location.href.split("/");
                let urlIndex = urlArr.findIndex((elem) => elem == 'products');
                document.querySelector('#continue-btn').setAttribute("onclick", "location.href='https://easyrebates.eledlights.com/products/" + urlArr[urlIndex+1] + "'");
                document.querySelector('.greentext > .contactus.link').href = '#';
                document.querySelector('.greentext > .contactus.link').setAttribute("onclick", "openModal()");
              } else {
                $('.single-result').html('<div class="rebate_result"><span class="bigredtext">Rebate available for up to $' + rebate_amount + '/' + prod_type + '*</span></div>');
                $('.rebate-text').html('<div class="greentext"><a class="contactus link" href="/pages/instant-rebate-incentives' + tags + '">Rebate available for up to $' + rebate_amount + '/' + prod_type + '*</a></div>');
                $('.rebatefootnote').html(newRebateSearch.rebateNote.replace("{}", responseUtility)); 
                $('.rebatefootnote').show();
                $('.first-search').hide();
              }
            } else {
              // Prescriptive or custom
              $('.single-result').html('<div class="rebate_result">Instant rebates not available from <span class="utilityname">' + responseUtility + '</span>, but we may be able to find downstream rebates and additional savings. <a class="contactus link" href="/pages/find-money-saving-financial-incentives-for-your-lighting-upgrade' + tags + '" style="font-weight: bold;">Inquire</a><span style="font-weight: normal;"> or </span><span class="linewrapper" style="font-weight: normal;">try&nbsp;another&nbsp;zip&nbsp;code.</span></div>');
              $('.rebate-text').html('<div><span style="font-weight: normal; font-size: 13px;">Instant rebates not available from <span class="utilityname">' + responseUtility + '</span>, but we may be able to find downstream rebates and additional savings.</span> <a class="contactus link normal" style="font-weight: bold;; font-size: 13px;" href="/pages/find-money-saving-financial-incentives-for-your-lighting-upgrade' + tags + '">Inquire</a><span style="font-weight: normal; font-size: 13px;"> or </span><span class="linewrapper" style="font-weight: normal; font-size: 13px;"><a class="search-again link" href="#rebate_popup1">try&nbsp;another&nbsp;zip&nbsp;code.</a></span></div>');
              $('.rebatefootnote').html(newRebateSearch.noUtilNote); 
              $('.rebatefootnote').hide();
              $('.first-search').hide();
            }
          } else if (status == "No rebates") {
            // Same as Invalid Utility
            $('.single-result').html('<div class="rebate_result">Instant rebates not available from <span class="utilityname">' + JSON.parse(requestData).utility + '</span>, but we may be able to find downstream rebates and additional savings. <a class="contactus link" href="/pages/find-money-saving-financial-incentives-for-your-lighting-upgrade' + tags + '" style="font-weight: bold;">Inquire</a><span style="font-weight: normal;"> or </span><span class="linewrapper" style="font-weight: normal;">try&nbsp;another&nbsp;zip&nbsp;code.</span></div>');
            $('.rebate-text').html('<div><span style="font-weight: normal; font-size: 13px;">Instant rebates not available from <span class="utilityname">' + JSON.parse(requestData).utility + '</span>, but we may be able to find downstream rebates and additional savings. <a class="contactus link" href="/pages/find-money-saving-financial-incentives-for-your-lighting-upgrade' + tags + '" style="font-weight: bold;">Inquire</a><span style="font-weight: normal;"> or </span><span class="linewrapper" style="font-weight: normal;"><a class="search-again link" href="#rebate_popup1">try&nbsp;another&nbsp;zip&nbsp;code.</a></span></span></div>');
            // $('.rebatefootnote').html(newRebateSearch.noUtilNote); 
            $('.rebatefootnote').hide();
            $('.first-search').hide();
          } else if (status == "Invalid Utility") {
            // Same as No Rebates
            $('.single-result').html('<div class="rebate_result">Instant rebates not available from <span class="utilityname">' + JSON.parse(requestData).utility + '</span>, but we may be able to find downstream rebates and additional savings. <a class="contactus link" href="/pages/find-money-saving-financial-incentives-for-your-lighting-upgrade' + tags + '" style="font-weight: bold;">Inquire</a><span style="font-weight: normal;"> or </span><span class="linewrapper" style="font-weight: normal;">try&nbsp;another&nbsp;zip&nbsp;code.</span></div>');
            $('.rebate-text').html('<div><span style="font-weight: normal; font-size: 13px;">Instant rebates not available from <span class="utilityname">' + JSON.parse(requestData).utility + '</span>, but we may be able to find downstream rebates and additional savings. <a class="contactus link" href="/pages/find-money-saving-financial-incentives-for-your-lighting-upgrade' + tags + '" style="font-weight: bold;">Inquire</a><span style="font-weight: normal;"> or </span><span class="linewrapper" style="font-weight: normal;"><a class="search-again link" href="#rebate_popup1">try&nbsp;another&nbsp;zip&nbsp;code.</a></span></span></div>');
            // $('.rebatefootnote').html(newRebateSearch.noUtilNote); 
            $('.rebatefootnote').hide();
            $('.first-search').hide();
          }
        }
      })
    }, 
    
    errorResponse: function () {
      $('.single-result').html('<div class="rebate_result"><span class="bigredtext">Cannot find product</span></div>');
    },
    postData: async function (url, data) {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Accept": "application/json",
          "Content-Type": "application/json",
        },
        body: data, 
      });
      return response.json(); 
    }
    
  }

  
  
  
  
  function catchTableUpdate() {
    $(document).ajaxStop(function () {
      if (document.getElementById("sortable").rows.length >= 2) {
        sortBy(1);
        sortBy(1);
        var rows = document.getElementById("sortable").rows;
        $(rows).each(function (key, val) {
          if ($(val).html().indexOf('$') >= 0) {
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
  
    for (ro = 0; ro < rows; ro++) { // cycle through rows
      for (co = 0; co < columns; co++) { // cycle through columns
        // assign the value in each row-column to a 2d array by row-column
        if (co === 1 && document.getElementById("sortable").rows[ro].innerHTML.indexOf('$') >= 0) {
          arrTable[ro][co] = parseFloat(document.getElementById("sortable").rows[ro].cells[co].innerHTML);
        } else {
          if (co === 1) {
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
    for (ro = 0; ro < rows; ro++) {
      for (co = 0; co < columns; co++) {
        document.getElementById("sortable").rows[ro].cells[co].innerHTML = arrTable[ro][co];
      }
    }
  }