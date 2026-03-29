/**
 * Get all metaobjects of a type
 * @param {Object} admin - Admin API context
 * @param {string} type - Metaobject type (e.g., "author", "size_chart")
 * @param {number} first - Number of results to fetch
 * @returns {Promise<Object>} Metaobjects with pagination
 */
export async function getMetaobjects(admin, type, first = 20) {
  const response = await admin.graphql(
    `#graphql
      query GetMetaobjects($type: String!, $first: Int!) {
        metaobjects(type: $type, first: $first) {
          edges {
            node {
              id
              handle
              displayName
              createdAt
              updatedAt
              fields {
                key
                value
                type
              }
            }
          }
          pageInfo {
            hasNextPage
            endCursor
          }
        }
      }
    `,
    { variables: { type, first } }
  );

  const data = await response.json();
  return data.metaobjects;
}

/**
 * Get a single metaobject by handle
 * @param {Object} admin - Admin API context
 * @param {string} type - Metaobject type
 * @param {string} handle - Metaobject handle
 * @returns {Promise<Object|null>} Metaobject or null
 */
export async function getMetaobjectByHandle(admin, type, handle) {
  const response = await admin.graphql(
    `#graphql
      query GetMetaobject($type: String!, $handle: String!) {
        metaobject(type: $type, handle: $handle) {
          id
          handle
          displayName
          fields {
            key
            value
            type
          }
        }
      }
    `,
    { variables: { type, handle } }
  );

  const data = await response.json();
  return data.metaobject;
}

/**
 * Create a new metaobject
 * @param {Object} admin - Admin API context
 * @param {string} type - Metaobject type
 * @param {string} handle - Metaobject handle
 * @param {string} displayName - Display name
 * @param {Array} fields - Array of { key, value } objects
 * @returns {Promise<Object>} Create result with userErrors
 */
export async function createMetaobject(admin, type, handle, displayName, fields) {
  const response = await admin.graphql(
    `#graphql
      mutation metaobjectCreate($type: String!, $metaobject: MetaobjectInput!) {
        metaobjectCreate(type: $type, metaobject: $metaobject) {
          metaobject {
            id
            handle
            displayName
          }
          userErrors {
            field
            message
          }
        }
      }
    `,
    {
      variables: {
        type,
        metaobject: { handle, displayName, fields },
      },
    }
  );

  return response.json();
}

/**
 * Update a metaobject
 * @param {Object} admin - Admin API context
 * @param {string} type - Metaobject type
 * @param {string} handle - Metaobject handle
 * @param {string} displayName - Display name
 * @param {Array} fields - Array of { key, value } objects
 * @returns {Promise<Object>} Update result with userErrors
 */
export async function updateMetaobject(admin, type, handle, displayName, fields) {
  const response = await admin.graphql(
    `#graphql
      mutation metaobjectUpdate($type: String!, $handle: String!, $metaobject: MetaobjectInput!) {
        metaobjectUpdate(type: $type, handle: $handle, metaobject: $metaobject) {
          metaobject {
            id
            handle
            displayName
          }
          userErrors {
            field
            message
          }
        }
      }
    `,
    {
      variables: {
        type,
        handle,
        metaobject: { displayName, fields },
      },
    }
  );

  return response.json();
}

/**
 * Delete a metaobject
 * @param {Object} admin - Admin API context
 * @param {string} type - Metaobject type
 * @param {string} handle - Metaobject handle
 * @returns {Promise<Object>} Delete result with userErrors
 */
export async function deleteMetaobject(admin, type, handle) {
  const response = await admin.graphql(
    `#graphql
      mutation metaobjectDelete($type: String!, $handle: String!) {
        metaobjectDelete(type: $type, handle: $handle) {
          deletedMetaobjectId
          userErrors {
            field
            message
          }
        }
      }
    `,
    { variables: { type, handle } }
  );

  return response.json();
}

/**
 * Get metaobject definition
 * @param {Object} admin - Admin API context
 * @param {string} type - Metaobject type
 * @returns {Promise<Object>} Metaobject definition
 */
export async function getMetaobjectDefinition(admin, type) {
  const response = await admin.graphql(
    `#graphql
      query GetMetaobjectDefinition($type: String!) {
        metaobjectDefinition(type: $type) {
          id
          type
          displayName
          fields {
            key
            name
            type {
              name
            }
            required
          }
        }
      }
    `,
    { variables: { type } }
  );

  const data = await response.json();
  return data.metaobjectDefinition;
}
