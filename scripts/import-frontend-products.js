import "dotenv/config";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import vm from "node:vm";

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const repositoryDirectory = path.resolve(scriptDirectory, "../..");
const assetsDirectory = path.join(
  repositoryDirectory,
  "ecom-frontend",
  "public",
  "frontend_assets"
);
const apiUrl = process.env.API_BASE_URL || "http://localhost:4000";

function readAssetProducts(source) {
  const match = source.match(/export const dummyproducts = (\[[\s\S]*?\n\])/);
  if (!match) {
    throw new Error("Could not find dummyproducts in frontend assets.");
  }

  const productArray = match[1].replace(
    /\bimage: \[([^\]]*)\]/g,
    (_, images) =>
      `image: [${images.replace(/\b(p_img[\w]+)\b/g, '"$1"')}]`
  );
  const products = vm.runInNewContext(`(${productArray})`);

  if (!Array.isArray(products) || !products.length) {
    throw new Error("The frontend product catalog is empty or invalid.");
  }

  return products;
}

function productKey(product) {
  return JSON.stringify([
    String(product.name || "").trim(),
    String(product.description || "").trim(),
    Number(product.prise ?? product.price),
    String(product.category || "").trim(),
    String(product.subCategory || "").trim(),
    [...(product.sizes || [])].map(String).sort(),
    Boolean(product.bestseller),
  ]);
}

async function getProducts() {
  const response = await fetch(`${apiUrl}/api/product/all`);
  if (!response.ok) {
    throw new Error(`Could not read the product catalog (HTTP ${response.status}).`);
  }

  const result = await response.json();
  if (!result.success || !Array.isArray(result.products)) {
    throw new Error("The backend returned an invalid product catalog.");
  }

  return result.products;
}

async function getAdminToken() {
  if (!process.env.ADMIN_EMAIL || !process.env.ADMIN_PASS) {
    throw new Error("ADMIN_EMAIL and ADMIN_PASS must be configured in the backend environment.");
  }

  const response = await fetch(`${apiUrl}/api/user/adminlogin`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: process.env.ADMIN_EMAIL,
      password: process.env.ADMIN_PASS,
    }),
  });
  const result = await response.json();

  if (!response.ok || !result.success || !result.token) {
    throw new Error(`Admin login failed (HTTP ${response.status}).`);
  }

  return result.token;
}

async function addProduct(product, token) {
  if (!product.image?.length || product.image.length > 4) {
    throw new Error(`Product "${product._id}" must have between one and four images.`);
  }

  const formData = new FormData();
  formData.set("name", product.name);
  formData.set("description", product.description);
  formData.set("prise", String(product.price));
  formData.set("category", product.category);
  formData.set("subCategory", product.subCategory);
  formData.set("sizes", product.sizes.join(","));
  formData.set("bestseller", String(Boolean(product.bestseller)));

  for (const [index, imageName] of product.image.entries()) {
    const imagePath = path.join(assetsDirectory, `${imageName}.png`);
    const image = await readFile(imagePath);
    formData.append(
      `img${index + 1}`,
      new Blob([image], { type: "image/png" }),
      `${imageName}.png`
    );
  }

  const response = await fetch(`${apiUrl}/api/product/add`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  });

  if (!response.ok) {
    throw new Error(`Product "${product._id}" could not be added (HTTP ${response.status}).`);
  }

  const result = await response.json();
  if (!result.success) {
    throw new Error(`Product "${product._id}" was rejected by the backend.`);
  }
}

async function main() {
  const source = await readFile(path.join(assetsDirectory, "assets.js"), "utf8");
  const assetProducts = readAssetProducts(source);
  const targetCounts = new Map();
  for (const product of assetProducts) {
    const key = productKey(product);
    targetCounts.set(key, (targetCounts.get(key) || 0) + 1);
  }

  const currentProducts = await getProducts();
  const currentCounts = new Map();
  for (const product of currentProducts) {
    const key = productKey(product);
    currentCounts.set(key, (currentCounts.get(key) || 0) + 1);
  }

  const token = await getAdminToken();
  let added = 0;
  let skipped = 0;

  for (const product of assetProducts) {
    const key = productKey(product);
    const currentCount = currentCounts.get(key) || 0;
    const targetCount = targetCounts.get(key);

    if (currentCount >= targetCount) {
      skipped += 1;
      continue;
    }

    await addProduct(product, token);
    currentCounts.set(key, currentCount + 1);
    added += 1;
    console.log(`Added ${added}: ${product.name}`);
  }

  const finalProducts = await getProducts();
  const finalCounts = new Map();
  for (const product of finalProducts) {
    const key = productKey(product);
    finalCounts.set(key, (finalCounts.get(key) || 0) + 1);
  }

  const missing = [...targetCounts.entries()].reduce(
    (total, [key, count]) => total + Math.max(0, count - (finalCounts.get(key) || 0)),
    0
  );

  if (missing) {
    throw new Error(`Import finished with ${missing} catalog product(s) still missing.`);
  }

  console.log(
    `Import complete: ${assetProducts.length} asset products present; ${added} added, ${skipped} already present.`
  );
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
