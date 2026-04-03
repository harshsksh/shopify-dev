import { authenticate } from "../../shopify.server";

/**
 * Webhook handler for product events (create, update, delete)
 * Logs product changes for audit purposes
 */
export const action = async ({ request }) => {
  const { topic, shop, payload } = await authenticate.webhook(request);

  const body = payload;

  console.log(`[Webhook] ${topic} received for shop: ${shop}`);

  switch (topic) {
    case "PRODUCTS_CREATE":
      await handleProductCreate(body, shop);
      break;
    case "PRODUCTS_UPDATE":
      await handleProductUpdate(body, shop);
      break;
    case "PRODUCTS_DELETE":
      await handleProductDelete(body, shop);
      break;
    default:
      console.warn(`[Webhook] Unhandled topic: ${topic}`);
  }

  return new Response(null, { status: 200 });
};

/**
 * Handle product creation
 */
async function handleProductCreate(product, shop) {
  console.log(`[Webhook] Product created: ${product.title} (${product.id})`);
  // Add custom logic here:
  // - Sync to external database
  // - Trigger notifications
  // - Update analytics
}

/**
 * Handle product update
 */
async function handleProductUpdate(product, shop) {
  console.log(`[Webhook] Product updated: ${product.title} (${product.id})`);
  // Add custom logic here:
  // - Sync changes to external database
  // - Invalidate cache
  // - Trigger re-indexing
}

/**
 * Handle product deletion
 */
async function handleProductDelete(product, shop) {
  console.log(`[Webhook] Product deleted: ${product.id}`);
  // Add custom logic here:
  // - Remove from external database
  // - Clean up related metafields/metaobjects
  // - Update analytics
}
