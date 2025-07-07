// ==== PRODUCTS ====


// ==== CART ====
let cart = {};

function loadCartFromStorage() {
  const savedCart = localStorage.getItem('elegantstore-cart');
  if (savedCart) {
    cart = JSON.parse(savedCart);
  }
}

function saveCartToStorage() {
  localStorage.setItem('elegantstore-cart', JSON.stringify(cart));
}

function updateCartCount() {
  const count = Object.values(cart).reduce((acc, item) => acc + item.quantity, 0);
  document.getElementById('cart-count').textContent = count;
}

function addToCart(productId, quantity = 1) {
  if (!cart[productId]) {
    const product = products.find(p => p.id === productId);
    if (!product) return;
    cart[productId] = { product, quantity: 0 };
  }
  cart[productId].quantity += quantity;
  saveCartToStorage();
  updateCartCount();
  alert(`${cart[productId].product.name} added to cart (${quantity})`);
}

function removeFromCart(productId) {
  delete cart[productId];
  saveCartToStorage();
  renderCart();
  updateCartCount();
}

function changeQuantity(productId, quantity) {
  if (quantity < 1) return;
  if (!cart[productId]) return;
  cart[productId].quantity = quantity;
  saveCartToStorage();
  renderCart();
  updateCartCount();
}

function renderCart() {
  const container = document.getElementById('cart-items');
  const receiptContainer = document.getElementById('receipt-products');
  container.innerHTML = '';
  receiptContainer.innerHTML = '';

  if (Object.keys(cart).length === 0) {
    container.innerHTML = '<p class="empty-state">Your cart is empty.</p>';
    document.getElementById('total-cost').textContent = '$0.00';
    return;
  }

  let totalCost = 0;

  for (const [id, { product, quantity }] of Object.entries(cart)) {
    const itemDiv = document.createElement('div');
    itemDiv.className = 'card';

    itemDiv.innerHTML = `
      <div class="cart-item">
 <div class="cart-item-image">
  <div class="product-img-wrapper">
    <img src="${product.image}" alt="${product.name}" loading="lazy" />
  </div>
</div>

        <div class="cart-item-details">
          <h3>${product.name}</h3>
          <p>Price: ${product.price.toFixed(2)} Tk</p>
          <label for="qty-${id}">Quantity:</label>
          <input type="number" id="qty-${id}" min="1" value="${quantity}" />
          <p class="subtotal">Subtotal: ${(product.price * quantity).toFixed(2)} Tk</p>
          <button onclick="removeFromCart('${id}')" class="btn-remove">Remove</button>
        </div>
      </div>
    `;

    container.appendChild(itemDiv);

    const qtyInput = itemDiv.querySelector(`#qty-${id}`);
    qtyInput.addEventListener('change', e => {
      const val = parseInt(e.target.value);
      if (isNaN(val) || val < 1) {
        e.target.value = quantity;
        return;
      }
      changeQuantity(id, val);
    });

    const receiptItem = document.createElement('div');
    receiptItem.style.display = 'flex';
    receiptItem.style.justifyContent = 'space-between';
    receiptItem.textContent = `${product.name} x ${quantity}`;
    receiptContainer.appendChild(receiptItem);

    totalCost += product.price * quantity;
  }

  document.getElementById('total-cost').textContent = `${totalCost.toFixed(2)} Tk`;
}

function checkout() {
  const user = localStorage.getItem('loggedInUser');
  if (!user) {
    alert('Please log in to complete your purchase.');
    showSection('login');
    return;
  }

  if (Object.keys(cart).length === 0) {
    alert('Your cart is empty.');
    return;
  }

  alert(`Thank you for your purchase, ${user}!`);
  cart = {};
  saveCartToStorage();
  renderCart();
  updateCartCount();
  showSection('home');
}


// ==== PRODUCTS ====
function renderProducts(productList) {
  const container = document.getElementById('product-grid');
  container.innerHTML = '';
  if (productList.length === 0) {
    container.innerHTML = '<p class="empty-state">No products found.</p>';
    return;
  }
  for (const product of productList) {
    const card = document.createElement('div');
    card.className = 'card';
card.innerHTML = `
  <div class="product-img-wrapper">
    <img src="${product.image}" alt="${product.name}" loading="lazy" />
  </div>
  <h3>${product.name}</h3>
  <p>${product.price.toFixed(2)} Tk</p>
`;

    card.onclick = () => {
  window.location.href = `product.html?id=${product.id}`;
};

    container.appendChild(card);
  }
}

let currentCategory = 'all';
function filterProducts() {
  const query = document.getElementById('search-input').value.toLowerCase();
  let filtered = products.filter(p => {
    const matchCategory = currentCategory === 'all' || p.category === currentCategory;
    const matchName = p.name.toLowerCase().includes(query);
    return matchCategory && matchName;
  });
  renderProducts(filtered);
}

function filterByCategory(e, category) {
  e.preventDefault();
  currentCategory = category;
  document.getElementById('search-input').value = '';
  filterProducts();
  showSection('home');
  closeMenu();
}

function sortProducts() {
  const sortType = document.getElementById('sort-select').value;
  let productList = [...products];
  if (currentCategory !== 'all') {
    productList = productList.filter(p => p.category === currentCategory);
  }
  switch (sortType) {
    case 'price-asc': productList.sort((a,b) => a.price - b.price); break;
    case 'price-desc': productList.sort((a,b) => b.price - a.price); break;
    case 'name-asc': productList.sort((a,b) => a.name.localeCompare(b.name)); break;
    case 'name-desc': productList.sort((a,b) => b.name.localeCompare(a.name)); break;
  }
  renderProducts(productList);
}

function openProductModal(productId) {
  const product = products.find(p => p.id === productId);
  if (!product) return;
  currentModalProductId = productId;
  const modal = document.getElementById('product-modal');
  modal.innerHTML = `
    <div style="background:white; padding:20px; border-radius:8px; max-width:400px;">
      <h2>${product.name}</h2>
     <div class="product-img-wrapper" style="margin-bottom: 1rem;">
  <img src="${product.image}" alt="${product.name}" />
</div>

      <p>${product.description}</p>
      <p>Price: ${product.price.toFixed(2)} Tk</p>
      <input type="number" id="modal-quantity" value="1" min="1" />
      <button onclick="addToCartFromModal()">Add to Cart</button>
      <button onclick="closeProductModal()">Close</button>
    </div>
  `;
  modal.hidden = false;
}

function closeProductModal() {
  document.getElementById('product-modal').hidden = true;
  currentModalProductId = null;
}

function addToCartFromModal() {
  const qty = parseInt(document.getElementById('modal-quantity').value);
  if (isNaN(qty) || qty < 1) {
    alert('Invalid quantity');
    return;
  }
  addToCart(currentModalProductId, qty);
  closeProductModal();
}

function toggleMenu() {
  document.querySelector('nav').classList.toggle('open');
}
function closeMenu() {
  document.querySelector('nav').classList.remove('open');
}
function showSection(id) {
  document.querySelectorAll('main > section').forEach(sec => {
    sec.classList.toggle('active-section', sec.id === id);
  });

  if (id === 'cart') renderCart();
  if (id === 'home') filterProducts();
  if (id === 'register') {
    document.getElementById('register-form').reset();
  }
  if (id === 'login') {
    document.getElementById('login-form').reset();
  }

  closeMenu();
}


// ==== REGISTER & LOGIN ====
document.getElementById('register-form').addEventListener('submit', e => {
  e.preventDefault();
  const username = document.getElementById('reg-username').value.trim();
  const password = document.getElementById('reg-password').value.trim();
  if (!username || !password) return alert('Fill all fields!');
  const users = JSON.parse(localStorage.getItem('users') || '{}');
  if (users[username]) return alert('User exists!');
  users[username] = { password };
  localStorage.setItem('users', JSON.stringify(users));
  alert('Registered! Now login.');
  showSection('login');
});

document.getElementById('login-form').addEventListener('submit', e => {
  e.preventDefault();
  const username = document.getElementById('login-username').value.trim();
  const password = document.getElementById('login-password').value.trim();
  const users = JSON.parse(localStorage.getItem('users') || '{}');
  if (users[username] && users[username].password === password) {
    localStorage.setItem('loggedInUser', username);
    checkLoggedIn();
    alert(`Welcome ${username}`);
    showSection('home');
  } else {
    alert('Wrong username/password.');
  }
});
function checkLoggedIn() {
  const user = localStorage.getItem('loggedInUser');
  const info = document.getElementById('user-info');
  const authLinks = document.getElementById('auth-links');

  if (user) {
    info.innerHTML = `Hello, ${user}! <button onclick="logout()" class="btn">Logout</button>`;
    authLinks.style.display = 'none';  // Hide Login/Register
  } else {
    info.innerHTML = '';
    authLinks.style.display = 'inline'; // Show Login/Register
  }
}

function logout() {
  localStorage.removeItem('loggedInUser');

  // 🔑 Clear the cart when logging out:
  cart = {};
  saveCartToStorage();
  updateCartCount();
  renderCart();

  checkLoggedIn();
  alert('Logged out.');
  showSection('home');
}


// ==== INIT ====
window.addEventListener('load', () => {
  loadCartFromStorage();
  checkLoggedIn();
  updateCartCount();
  filterProducts();
});
