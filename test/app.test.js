const { test, before, after } = require("node:test");
const assert = require("node:assert");
const createApp = require("../src/app");

let server;
let baseUrl;

before(() => {
  server = createApp().listen(0); // port libre choisi par le système
  baseUrl = `http://localhost:${server.address().port}`;
});

after(() => server.close());

test("GET /health répond ok", async () => {
  const res = await fetch(`${baseUrl}/health`);
  assert.strictEqual(res.status, 200);
  assert.deepStrictEqual(await res.json(), { status: "ok" });
});

test("GET /api/products renvoie le catalogue", async () => {
  const res = await fetch(`${baseUrl}/api/products`);
  const products = await res.json();
  assert.strictEqual(res.status, 200);
  assert.ok(products.length > 0);
});

test("GET /api/products?category=Poterie filtre par catégorie", async () => {
  const products = await (await fetch(`${baseUrl}/api/products?category=Poterie`)).json();
  assert.ok(products.every((p) => p.category === "Poterie"));
});

test("GET /api/products/:id renvoie 404 pour un produit inconnu", async () => {
  const res = await fetch(`${baseUrl}/api/products/999`);
  assert.strictEqual(res.status, 404);
});

test("le panier calcule le total et accepte la suppression", async () => {
  let res = await fetch(`${baseUrl}/api/cart`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ productId: 3, quantity: 2 })
  });
  let cart = await res.json();
  assert.strictEqual(res.status, 201);
  assert.strictEqual(cart.total, 360); // 2 x 180 MAD

  res = await fetch(`${baseUrl}/api/cart/3`, { method: "DELETE" });
  cart = await res.json();
  assert.strictEqual(cart.total, 0);
});

test("le panier refuse une quantité supérieure au stock", async () => {
  const res = await fetch(`${baseUrl}/api/cart`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ productId: 2, quantity: 100 })
  });
  assert.strictEqual(res.status, 400);
});
