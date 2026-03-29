import { redirect } from "react-router";
import {
  useLoaderData,
  useActionData,
  useNavigate,
  useParams,
} from "react-router";
import { boundary } from "@shopify/shopify-app-react-router/server";
import { authenticate } from "../shopify.server";
import { getProduct, updateProduct, createProduct } from "../models/product.server";
import ProductForm from "../components/ProductForm";

export const loader = async ({ params, request }) => {
  const { admin } = await authenticate.admin(request);

  const productId = params.id;

  if (productId === "new") {
    return { product: null, isNew: true };
  }

  const product = await getProduct(admin, productId);

  if (!product) {
    throw redirect("/app/products");
  }

  return { product, isNew: false };
};

export const action = async ({ request, params }) => {
  const { admin } = await authenticate.admin(request);
  const formData = await request.formData();
  const action = formData.get("action");

  try {
    if (action === "create") {
      const metafieldsRaw = formData.get("metafields");
      const metafields = metafieldsRaw ? JSON.parse(metafieldsRaw) : null;

      const productInput = {
        title: formData.get("title"),
        description: formData.get("description"),
        vendor: formData.get("vendor"),
        productType: formData.get("productType"),
        tags: formData.get("tags")?.split(",").map((t) => t.trim()).filter(Boolean),
        status: formData.get("status"),
        metafields: metafields,
        variants: JSON.parse(formData.get("variants") || "[]").map((v) => ({
          price: v.price,
          sku: v.sku,
          barcode: v.barcode,
          title: v.title || "Default Title",
        })),
      };

      const result = await createProduct(admin, productInput);

      if (result.productCreate.userErrors.length > 0) {
        return {
          errors: result.productCreate.userErrors.reduce(
            (acc, err) => ({ ...acc, [err.field?.[0] || "general"]: err.message }),
            {}
          ),
        };
      }

      throw redirect(`/app/products/${result.productCreate.product.id}`);
    }

    if (action === "update") {
      const productId = formData.get("productId");
      const metafieldsRaw = formData.get("metafields");
      const metafields = metafieldsRaw ? JSON.parse(metafieldsRaw) : null;

      const productInput = {
        title: formData.get("title"),
        description: formData.get("description"),
        vendor: formData.get("vendor"),
        productType: formData.get("productType"),
        tags: formData.get("tags")?.split(",").map((t) => t.trim()).filter(Boolean),
        status: formData.get("status"),
        metafields: metafields,
      };

      const result = await updateProduct(admin, productId, productInput);

      if (result.productUpdate.userErrors.length > 0) {
        return {
          errors: result.productUpdate.userErrors.reduce(
            (acc, err) => ({ ...acc, [err.field?.[0] || "general"]: err.message }),
            {}
          ),
        };
      }

      return { success: true, product: result.productUpdate.product };
    }

    return { error: "Invalid action" };
  } catch (error) {
    if (error instanceof Response && error.headers.has("Location")) {
      throw error; // Re-throw redirect responses
    }
    console.error("Product action error:", error);
    return { errors: { general: "Failed to save product" } };
  }
};

export default function ProductEdit() {
  const { product, isNew } = useLoaderData();
  const actionData = useActionData();
  const navigate = useNavigate();
  const params = useParams();

  return (
    <s-page heading={isNew ? "Create Product" : "Edit Product"}>
      {actionData?.errors?.general && (
        <s-section>
          <s-banner tone="error" heading="Error">
            {actionData.errors.general}
          </s-banner>
        </s-section>
      )}

      <ProductForm product={product} isEdit={!isNew} />
    </s-page>
  );
}

export const headers = (headersArgs) => {
  return boundary.headers(headersArgs);
};
