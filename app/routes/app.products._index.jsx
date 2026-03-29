import { json } from "react-router";
import { useLoaderData, useNavigate, useActionData } from "react-router";
import { boundary } from "@shopify/shopify-app-react-router/server";
import { authenticate } from "../../shopify.server";
import { getProducts, deleteProduct } from "../../models/product.server";

export const loader = async ({ request }) => {
  const { admin } = await authenticate.admin(request);
  
  const url = new URL(request.url);
  const after = url.searchParams.get("after");
  const first = parseInt(url.searchParams.get("first") || "25", 10);
  
  const products = await getProducts(admin, after, first);
  
  return json({ products });
};

export const action = async ({ request }) => {
  const { admin } = await authenticate.admin(request);
  const formData = await request.formData();
  const action = formData.get("action");

  if (action === "delete") {
    const productId = formData.get("productId");
    const result = await deleteProduct(admin, productId);
    return json(result);
  }

  return json({ error: "Invalid action" }, { status: 400 });
};

export default function ProductsIndex() {
  const { products } = useLoaderData();
  const actionData = useActionData();
  const navigate = useNavigate();

  const handleDelete = (productId) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      const form = document.createElement("form");
      form.method = "post";
      form.innerHTML = `
        <input type="hidden" name="action" value="delete" />
        <input type="hidden" name="productId" value="${productId}" />
      `;
      document.body.appendChild(form);
      form.submit();
    }
  };

  const handleEdit = (productId) => {
    navigate(`/app/products/${encodeURIComponent(productId)}`);
  };

  return (
    <s-page heading="Products">
      <s-button
        slot="primary-action"
        onClick={() => navigate("/app/products/new")}
      >
        Add product
      </s-button>

      {products.edges.length === 0 ? (
        <s-section>
          <s-paragraph>
            No products found. Create your first product to get started.
          </s-paragraph>
        </s-section>
      ) : (
        <>
          <s-section>
            <s-paragraph emphasis="subdued">
              {products.edges.length} product
              {products.edges.length !== 1 ? "s" : ""}
            </s-paragraph>
          </s-section>

          <s-section>
            <s-table>
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Status</th>
                  <th>Inventory</th>
                  <th>Price</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.edges.map(({ node }) => {
                  const variant = node.variants.edges[0]?.node || {};
                  const image = node.images.edges[0]?.node || {};
                  
                  return (
                    <tr key={node.id}>
                      <td>
                        <s-stack direction="inline" gap="extra-tight" alignment="center">
                          {image.originalSrc && (
                            <s-thumbnail
                              source={image.originalSrc}
                              size="small"
                            />
                          )}
                          <s-stack direction="block" gap="none">
                            <s-text fontWeight="bold">{node.title}</s-text>
                            <s-text size="small" emphasis="subdued">
                              {node.handle}
                            </s-text>
                          </s-stack>
                        </s-stack>
                      </td>
                      <td>
                        <s-badge tone={node.status === "active" ? "success" : "warning"}>
                          {node.status}
                        </s-badge>
                      </td>
                      <td>
                        <s-text>{variant.inventoryQuantity || 0}</s-text>
                      </td>
                      <td>
                        <s-text>{variant.price || "N/A"}</s-text>
                      </td>
                      <td>
                        <s-stack direction="inline" gap="tight">
                          <s-button
                            variant="secondary"
                            size="small"
                            onClick={() => handleEdit(node.id)}
                          >
                            Edit
                          </s-button>
                          <s-button
                            variant="plain"
                            size="small"
                            destructive
                            onClick={() => handleDelete(node.id)}
                          >
                            Delete
                          </s-button>
                        </s-stack>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </s-table>
          </s-section>

          {products.pageInfo.hasNextPage && (
            <s-section>
              <s-button
                variant="secondary"
                onClick={() => {
                  const url = new URL(window.location.href);
                  url.searchParams.set("after", products.pageInfo.endCursor);
                  window.location.href = url.toString();
                }}
              >
                Load more
              </s-button>
            </s-section>
          )}
        </>
      )}
    </s-page>
  );
}

export const headers = (headersArgs) => {
  return boundary.headers(headersArgs);
};
