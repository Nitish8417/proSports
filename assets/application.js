$(document).ready(function () {
  // Get the popup element
  var $popup = $('#cart-popup');
  var $cartItemsContainer = $('#cart-items');
  var $cartTotal = $('#cart-total');
  var $cartSavings = $('#cart-savings');

  // Get the buttons
  var $viewCartBtn = $('#view-cart');
  var $checkoutBtn = $('#checkout');

  // Function to update the cart popup content
  function updateCartPopup() {
    $.getJSON('/cart.js', function (cart) {
      $cartItemsContainer.empty();
      cart.items.forEach(function (item) {
        var itemElement = `
          <div class="product-card" data-line="${item.key}">
            <img src="${item.image}" alt="${item.title}" class="product-image">
            <div class="product-details">
              <h2 class="product-brand">${item.vendor}</h2>
              <p class="product-name">${item.title}</p>
              <div class="product-pricing">
                ${item.compare_at_price > item.price ? `<span class="original-price">${Shopify.formatMoney(item.compare_at_price)}</span>` : ''}
                <span class="discounted-price">${Shopify.formatMoney(item.price)}</span>
              </div>
              <div class="product-quantity">
                <input type="number" value="${item.quantity}" min="1" class="quantity-input" data-line="${item.key}">
                <button class="cart-item-remove" data-line="${item.key}">
                  Remove
                </button>
              </div>
            </div>
          </div>
        `;
        $cartItemsContainer.append(itemElement);
      });

      $cartTotal.text(Shopify.formatMoney(cart.total_price));
      $cartSavings.text(Shopify.formatMoney(cart.original_total_price - cart.total_price));
    });
  }

  // Make sure to attach event listeners to dynamically generated elements
  $(document).on('click', '.cart-item-remove', function () {
    var line = $(this).data('line');
    $.post('/cart/change.js', { line: line, quantity: 0 }, function () {
      updateCartPopup();
    });
  });

  $(document).on('change', '.quantity-input', function () {
    var line = $(this).data('line');
    var quantity = $(this).val();
    $.post('/cart/change.js', { line: line, quantity: quantity }, function () {
      updateCartPopup();
    });
  });

  // Function to open the popup
  function openPopup() {
    updateCartPopup();
    $popup.show();
  }

  // When the user clicks on the cart icon, open the popup
  $('#cartDropdownToggle').on('click', function (event) {
    event.preventDefault();
    openPopup();
  });

  // When the user clicks anywhere outside of the popup, close it
  $(window).on('click', function (event) {
    if ($(event.target).is($popup)) {
      $popup.hide();
    }
  });

  // Redirect to cart page
  $viewCartBtn.on('click', function () {
    window.location.href = '/cart';
  });

  // Redirect to checkout page
  $checkoutBtn.on('click', function () {
    window.location.href = '/checkout';
  });
});

Shopify.formatMoney = function (cents, format) {
  if (typeof cents === 'undefined' || cents === null) {
    return '0.00';
  }

  var value = '';
  var placeholderRegex = /\{\{\s*(\w+)\s*\}\}/;
  var formatString = format || this.money_format || '{{amount}}';

  function defaultOption(opt, def) {
    return (typeof opt == 'undefined' ? def : opt);
  }

  function formatWithDelimiters(number, precision, thousands, decimal) {
    precision = defaultOption(precision, 2);
    thousands = defaultOption(thousands, ',');
    decimal = defaultOption(decimal, '.');

    if (isNaN(number) || number == null) {
      return '0.00';
    }

    number = (number / 100.0).toFixed(precision);

    var parts = number.split('.');
    var dollarsAmount = parts[0].replace(
      /(\d)(?=(\d\d\d)+(?!\d))/g,
      '$1' + thousands
    );
    var centsAmount = parts[1] ? decimal + parts[1] : '';

    return dollarsAmount + centsAmount;
  }

  switch (formatString.match(placeholderRegex)[1]) {
    case 'amount':
      value = formatWithDelimiters(cents, 2);
      break;
    case 'amount_no_decimals':
      value = formatWithDelimiters(cents, 0);
      break;
    case 'amount_with_comma_separator':
      value = formatWithDelimiters(cents, 2, '.', ',');
      break;
    case 'amount_no_decimals_with_comma_separator':
      value = formatWithDelimiters(cents, 0, '.', ',');
      break;
    default:
      value = formatWithDelimiters(cents, 2);
      break;
  }

  return formatString.replace(placeholderRegex, value);
};


// search
$(document).ready(function () {
  const $searchButton = $("#search-button");
  const $searchInput = $("#search-input");

  $searchButton.on("click", function () {
    handleSearch();
  });

  $searchInput.on("keypress", function (event) {
    if (event.key === "Enter") {
      handleSearch();
    }
  });

  function handleSearch() {
    const query = $searchInput.val().trim();
    if (query) {
      // Redirect to search results page or perform search action
      window.location.href = `/search?q=${encodeURIComponent(query)}`;
    } else {
      alert("Please enter a search term.");
    }
  }
});
