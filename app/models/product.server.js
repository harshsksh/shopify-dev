import { apiVersion } from "../shopify.server";

/**
 * Fetch all products with optional pagination
 * @param {Object} admin - Admin API context
 * @param {string} after - Cursor for pagination
 * @param {number} first - Number of products to fetch
 * @returns {Promise<Object>} Products and pagination info
 */
export async function getProducts(admin, after = null, first = 25) {
  const afterClause = after ? `, after: "${after}"` : "";
  
  const response = await admin.graphql(
    `#graphql
      query GetProducts($first: Int!) {
        products(first: $first${afterClause}) {
          edges {
            cursor
            node {
              id
              title
              handle
              status
              createdAt
              updatedAt
              variants(first: 1) {
                edges {
                  node {
                    id
                    price
                    sku
                    barcode
                  }
                }
              }
              images(first: 1) {
                edges {
                  node {
                    id
                    originalSrc
                    altText
                  }
                }
              }
              metafields(first: 10) {
                edges {
                  node {
                    namespace
                    key
                    value
                    type
                  }
                }
              }
            }
          }
          pageInfo {
            hasNextPage
            hasPreviousPage
            endCursor
            startCursor
          }
        }
      }
    `,
    { variables: { first } }
  );

  const data = await response.json();
  return data.products;
}

/**
 * Fetch a single product by ID
 * @param {Object} admin - Admin API context
 * @param {string} productId - Product Global ID
 * @returns {Promise<Object|null>} Product data or null
 */
export async function getProduct(admin, productId) {
  const response = await admin.graphql(
    `#graphql
      query GetProduct($id: ID!) {
        product(id: $id) {
          id
          title
          handle
          description
          status
          vendor
          productType
          tags
          createdAt
          updatedAt
          publishedAt
          variants(first: 250) {
            edges {
              node {
                id
                title
                price
                compareAtPrice
                sku
                barcode
                inventoryQuantity
                weight
                weightUnit
                requiresShipping
                taxable
              }
            }
          }
          images(first: 250) {
            edges {
              node {
                id
                originalSrc
                altText
                width
                height
              }
            }
          }
          options {
            id
            name
            values
          }
          metafields(first: 50) {
            edges {
              node {
                id
                namespace
                key
                value
                type
                description
              }
            }
          }
          collections(first: 10) {
            edges {
              node {
                id
                title
                handle
              }
            }
          }
        }
      }
    `,
    { variables: { id: productId } }
  );

  const data = await response.json();
  return data.product;
}

/**
 * Create a new product
 * @param {Object} admin - Admin API context
 * @param {Object} productInput - Product input data
 * @returns {Promise<Object>} Created product and errors
 */
export async function createProduct(admin, productInput) {
  const response = await admin.graphql(
    `#graphql
      mutation productCreate($input: ProductInput!) {
        productCreate(input: $input) {
          product {
            id
            title
            handle
            status
          }
          userErrors {
            field
            message
          }
        }
      }
    `,
    { variables: { input: productInput } }
  );

  return response.json();
}

/**
 * Update an existing product
 * @param {Object} admin - Admin API context
 * @param {string} productId - Product Global ID
 * @param {Object} productInput - Product update data
 * @returns {Promise<Object>} Updated product and errors
 */
export async function updateProduct(admin, productId, productInput) {
  const response = await admin.graphql(
    `#graphql
      mutation productUpdate($input: ProductInput!) {
        productUpdate(input: $input) {
          product {
            id
            title
            handle
            status
            updatedAt
          }
          userErrors {
            field
            message
          }
        }
      }
    `,
    { variables: { input: { id: productId, ...productInput } } }
  );

  return response.json();
}

/**
 * Delete a product
 * @param {Object} admin - Admin API context
 * @param {string} productId - Product Global ID
 * @returns {Promise<Object>} Deletion result
 */
export async function deleteProduct(admin, productId) {
  const response = await admin.graphql(
    `#graphql
      mutation productDelete($id: ID!) {
        productDelete(id: $id) {
          deletedProductId
          userErrors {
            field
            message
          }
        }
      }
    `,
    { variables: { id: productId } }
  );

  return response.json();
}

/**
 * Update product variants in bulk
 * @param {Object} admin - Admin API context
 * @param {string} productId - Product Global ID
 * @param {Array} variants - Array of variant updates
 * @returns {Promise<Object>} Update result
 */
export async function updateProductVariants(admin, productId, variants) {
  const response = await admin.graphql(
    `#graphql
      mutation productVariantsBulkUpdate($productId: ID!, $variants: [ProductVariantsBulkInput!]!) {
        productVariantsBulkUpdate(productId: $productId, variants: $variants) {
          productVariants {
            id
            title
            price
            sku
            barcode
          }
          userErrors {
            field
            message
          }
        }
      }
    `,
    { variables: { productId, variants } }
  );

  return response.json();
}
