"use strict";(self.webpackChunkgloboFormbuilder=self.webpackChunkgloboFormbuilder||[]).push([[809],{9945:(e,t,o)=>{o.r(t),o.d(t,{default:()=>r});const r={init:function(e,t){this.hideElementForFormEditCustomer(e,Globo.FormBuilder.forms[t]),this.showCustomerInformation(e)},hideElementForFormEditCustomer:function(e,t){const o=t.integration.shopify,r=Object.entries(o.integrationElements).find((e=>"email"==e[1]));e.querySelector('[name="'+r[0]+'"]').classList.add("globo-form-disabled");const s=e.querySelectorAll('[type="password"]');s.length&&s.forEach((e=>{e.closest(".globo-form-control").style.display="none"}))},showCustomerInformation:function(e){const t=Globo.FormBuilder,o=e.querySelector(".block-container").getAttribute("data-id"),r=t.forms[o].integration.shopify.integrationElements;t.customer.default_address&&Object.keys(t.customer.default_address).forEach((e=>{t.customer["addresses."+e]=t.customer.default_address[e]})),Object.entries(r).forEach((o=>{const r=e.querySelectorAll('[name="'+o[0]+'[]"], [name="'+o[0]+'"]'),s=t.customer.metafields&&void 0!==t.customer.metafields[o[1]]?t.customer.metafields[o[1]]:null;r.forEach((e=>{if("checkbox"==e.type||"radio"==e.type){let r=[];s?o[1].indexOf("[]")>-1?void 0!==t.customer.metafields[o[1]]&&void 0!==t.customer.metafields[o[1]][e.name.replace("[]","")]&&(r=t.customer.metafields[o[1]][e.name.replace("[]","")]):("object"==typeof t.customer.metafields[o[1].replace("[]","")]&&(r=t.customer.metafields[o[1].replace("[]","")]),"string"==typeof t.customer.metafields[o[1].replace("[]","")]&&(r=t.customer.metafields[o[1].replace("[]","")].split(","))):("object"==typeof t.customer[o[1].replace("[]","")]&&(r=t.customer[o[1].replace("[]","")]),"string"==typeof t.customer[o[1].replace("[]","")]&&(r=t.customer[o[1].replace("[]","")].split(","))),r.length&&r.includes(e.value)&&(e.checked=!0)}else if(s)if(o[1].indexOf("[]")>-1){let r=void 0!==t.customer.metafields[o[1]]&&void 0!==t.customer.metafields[o[1]][e.name]?t.customer.metafields[o[1]][e.name]:null;e.value=r||(void 0!==t.customer.metafields[o[1].replace("[]","")]?t.customer.metafields[o[1].replace("[]","")]:"")}else e.value=s;else e.value=void 0!==t.customer[o[1]]?t.customer[o[1]]:""}))}))},renderAccountDetail:async e=>{const{default:t}=await Promise.all([o.e(620),o.e(542)]).then(o.bind(o,1331));let r;document.querySelector("#globo-formbuilder-account")&&(r=document.querySelector("#globo-formbuilder-account").innerHTML);const s=r||t.templates.accountTemplate;let l=t.parseAndRenderSync(s,{customerDetail:Globo.FormBuilder.customer,settings:Globo.FormBuilder.shop.settings});e.innerHTML=l}}}}]);