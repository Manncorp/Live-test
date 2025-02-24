if (window.location.hash) {
    var hash = window.location.hash.substring(1);
    if (hash === 'accessories') {
      $(".tabs-nav__item-list button:contains('Accessories')").click()
    }
}

// Quantity and checkbox logic for shoebox product options addon - Andrew
function defer(method) {
  if (document.querySelector('.spice-spa-addon-input-field')) {
    method();
  } else {
    setTimeout(function () { defer(method) });
  }
}

function quantityCheckBox() {
  let mountOption = document.querySelectorAll('.spice-spa-addon-product-item');

  mountOption.forEach(mount => {
    let quantityBox = mount.querySelector('[id^="quantity_"]');
    let checkBox = mount.querySelector('.spice-spa-addon-checkbox-input');
    quantityBox.min = 0;
    quantityBox.value = 0;

    quantityBox.addEventListener('input', (e) => {
      if (e.target.value >= 1) {
        if (checkBox.checked == false) {
          checkBox.click();
        }
      } else {
        if (checkBox.checked == true) {
          checkBox.click();
        }
      }
    });
  })
}

defer(quantityCheckBox);