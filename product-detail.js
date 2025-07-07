// Load product list
// Make sure products.js is already loaded before this

// ==== HELPERS ====

// Get product ID from URL: ?id=p1
function getProductIdFromURL() {
  const params = new URLSearchParams(window.location.search);
  return params.get("id");
}

// ==== CART UTILITIES ====
let cart = {};

function loadCartFromStorage() {
  const savedCart = localStorage.getItem("elegantstore-cart");
  if (savedCart) {
    cart = JSON.parse(savedCart);
  }
}

function saveCartToStorage() {
  localStorage.setItem("elegantstore-cart", JSON.stringify(cart));
}

function updateCartCount() {
  const count = Object.values(cart).reduce(
    (acc, item) => acc + item.quantity,
    0
  );
  const countElem = document.getElementById("cart-count");
  if (countElem) countElem.textContent = count;
}

function addToCart(productId, quantity = 1) {
  if (!cart[productId]) {
    const product = products.find((p) => p.id === productId);
    if (!product) return;
    cart[productId] = { product, quantity: 0 };
  }
  cart[productId].quantity += quantity;
  saveCartToStorage();
  updateCartCount();
  alert(`${cart[productId].product.name} added to cart (${quantity})`);
}

// ==== RENDER PRODUCT ====
function renderProductDetail(product) {
  const container = document.getElementById("product-detail");
  container.innerHTML = `
    <div class="product-page-container">
      <div class="product-image">
        <div class="product-img-wrapper">
          <img src="${product.image}" alt="${product.name}" />
        </div>
      </div>

      <div class="product-info">
        <h1>${product.name}</h1>
        <p class="product-price">${product.price.toFixed(2)} Tk</p>
        <label>Quantity:
          <input type="number" id="quantity-input" value="1" min="1" />
        </label>
        <button id="add-to-cart-btn" class="btn">Add to Cart</button>
     <div class="product-description">
      <h2>Description</h2>
      <p>${product.description}</p>
    </div>
      </div>
     
    </div>
    <div class="related-products">
      <h2>Related Products</h2>
      <div class="grid" id="related-grid"></div>
    </div>
  `;

  const qtyInput = document.getElementById("quantity-input");
  const addToCartBtn = document.getElementById("add-to-cart-btn");

  addToCartBtn.addEventListener("click", () => {
    const qty = parseInt(qtyInput.value);
    if (isNaN(qty) || qty < 1) {
      alert("Please enter a valid quantity");
      return;
    }
    addToCart(product.id, qty);
  });

  qtyInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      const qty = parseInt(qtyInput.value);
      if (isNaN(qty) || qty < 1) {
        alert("Please enter a valid quantity");
        return;
      }
      addToCart(product.id, qty);
    }
  });

  renderRelatedProducts(product);
}


// ==== RENDER RELATED PRODUCTS ====
function renderRelatedProducts(currentProduct) {
  const related = products.filter(
    (p) => p.category === currentProduct.category && p.id !== currentProduct.id
  );
  const grid = document.getElementById("related-grid");
  grid.innerHTML = "";

  if (related.length === 0) {
    grid.innerHTML = '<p class="empty-state">No related products found.</p>';
    return;
  }

  for (const product of related) {
    const card = document.createElement("div");
    card.className = "card";
    card.innerHTML = `
  <div class="product-img-wrapper">
    <img src="${product.image}" alt="${product.name}" />
  </div>
  <h3>${product.name}</h3>
  <p>${product.price.toFixed(2)} Tk</p>
`;

    card.addEventListener("click", () => {
      window.location.href = `product.html?id=${product.id}`;
    });
    grid.appendChild(card);
  }
}

// ==== INIT ====
window.addEventListener("DOMContentLoaded", () => {
  loadCartFromStorage();
  updateCartCount();

  const id = getProductIdFromURL();
  const product = products.find((p) => p.id === id);
  if (!product) {
    document.getElementById("product-detail").innerHTML =
      '<p class="empty-state">Product not found.</p>';
    return;
  }

  renderProductDetail(product);
});

