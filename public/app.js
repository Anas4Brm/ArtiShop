const productsEl = document.getElementById("products");
const categoryEl = document.getElementById("category");
const cartItemsEl = document.getElementById("cart-items");
const cartTotalEl = document.getElementById("cart-total");
const messageEl = document.getElementById("message");

async function loadProducts(category = "") {
  const url = category ? `/api/products?category=${encodeURIComponent(category)}` : "/api/products";
  const products = await (await fetch(url)).json();

  productsEl.innerHTML = "";
  for (const p of products) {
    const card = document.createElement("article");
    card.className = "card";
    card.innerHTML = `
      <span class="category">${p.category}</span>
      <h3>${p.name}</h3>
      <p class="description">${p.description}</p>
      <span class="price">${p.price} MAD</span>
      <button data-id="${p.id}">Ajouter au panier</button>
    `;
    productsEl.appendChild(card);
  }
}

async function loadCategories() {
  const products = await (await fetch("/api/products")).json();
  const categories = [...new Set(products.map((p) => p.category))];
  for (const c of categories) {
    const option = document.createElement("option");
    option.value = c;
    option.textContent = c;
    categoryEl.appendChild(option);
  }
}

function renderCart(cart) {
  cartItemsEl.innerHTML = "";
  for (const item of cart.items) {
    const li = document.createElement("li");
    li.innerHTML = `
      <span>${item.name} × ${item.quantity}</span>
      <span>${item.subtotal} MAD</span>
      <button data-remove="${item.productId}" title="Retirer">×</button>
    `;
    cartItemsEl.appendChild(li);
  }
  cartTotalEl.textContent = cart.total;
}

async function loadCart() {
  renderCart(await (await fetch("/api/cart")).json());
}

productsEl.addEventListener("click", async (e) => {
  const id = e.target.dataset.id;
  if (!id) return;
  const res = await fetch("/api/cart", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ productId: Number(id), quantity: 1 })
  });
  const data = await res.json();
  messageEl.textContent = res.ok ? "" : data.error;
  if (res.ok) renderCart(data);
});

cartItemsEl.addEventListener("click", async (e) => {
  const id = e.target.dataset.remove;
  if (!id) return;
  const res = await fetch(`/api/cart/${id}`, { method: "DELETE" });
  if (res.ok) renderCart(await res.json());
});

categoryEl.addEventListener("change", () => loadProducts(categoryEl.value));

loadCategories();
loadProducts();
loadCart();
