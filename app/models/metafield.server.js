/**
 * Get metafields for a product
 * @param {Object} admin - Admin API context
 * @param {string} productId - Product Global ID
 * @returns {Promise<Array>} Array of metafields
 */
export async function getProductMetafields(admin, productId) {
  const response = await admin.graphql(
    `#graphql
      query GetProductMetafields($id: ID!) {
        product(id: $id) {
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
        }
      }
    `,
    { variables: { id: productId } }
  );

  const data = await response.json();
  return data.product.metafields.edges.map((e) => e.node);
}

/**
 * Update product metafields
 * @param {Object} admin - Admin API context
 * @param {string} productId - Product Global ID
 * @param {Array} metafields - Array of metafield objects
 * @returns {Promise<Object>} Update result
 */
export async function updateProductMetafields(admin, productId, metafields) {
  const response = await admin.graphql(
    `#graphql
      mutation productUpdate($input: ProductInput!) {
        productUpdate(input: $input) {
          product { id }
          userErrors { field message }
        }
      }
    `,
    {
      variables: {
        input: {
          id: productId,
          metafields: metafields.map((m) => ({
            namespace: m.namespace,
            key: m.key,
            value: m.value,
            type: m.type,
          })),
        },
      },
    }
  );

  return response.json();
}

/**
 * Get specific metafield value for a product
 * @param {Object} admin - Admin API context
 * @param {string} productId - Product Global ID
 * @param {string} namespace - Metafield namespace
 * @param {string} key - Metafield key
 * @returns {Promise<Object|null>} Metafield or null
 */
export async function getProductMetafield(admin, productId, namespace, key) {
  const response = await admin.graphql(
    `#graphql
      query GetProductMetafield($id: ID!, $namespace: String!, $key: String!) {
        product(id: $id) {
          metafield(namespace: $namespace, key: $key) {
            id
            namespace
            key
            value
            type
          }
        }
      }
    `,
    { variables: { id: productId, namespace, key } }
  );

  const data = await response.json();
  return data.product.metafield;
}
