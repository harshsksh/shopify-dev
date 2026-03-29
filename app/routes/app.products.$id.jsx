import { json, redirect } from "react-router";
import {
  useLoaderData,
  useActionData,
  useNavigate,
  useParams,
} from "react-router";
import { Breadcrumbs } from "@shopify/app-bridge-react";
import { boundary } from "@shopify/shopify-app-react-router/server";
import { authenticate } from "../../shopify.server";
import { getProduct, updateProduct, createProduct } from "../../models/product.server";
import ProductForm from "../../components/ProductForm";

export const loader = async ({ params, request }) => {
  const { admin } = await authenticate.admin(request);
  
  const productId = params.id;
  
  if (productId === "new") {
    return json({ product: null, isNew: true });
  }

  const product = await getProduct(admin, productId);
  
  if (!product) {
    return redirect("/app/products");
  }

  return json({ product, isNew: false });
};

export const action = async ({ request, params }) => {
  const { admin } = await authenticate.admin(request);
  const formData = await request.formData();
  const action = formData.get("action");

  try {
    if (action === "create") {
      const productInput = {
        title: formData.get("title"),
        description: formData.get("description"),
        vendor: formData.get("vendor"),
        productType: formData.get("productType"),
        tags: formData.get("tags")?.split(",").map((t) => t.trim()).filter(Boolean),
        status: formData.get("status"),
        variants: JSON.parse(formData.get("variants") || "[]").map((v) => ({
          price: v.price,
          sku: v.sku,
          barcode: v.barcode,
          title: v.title || "Default Title",
        })),
      };

      const result = await createProduct(admin, productInput);
      
      if (result.productCreate.userErrors.length > 0) {
        return json({
          errors: result.productCreate.userErrors.reduce(
            (acc, err) => ({ ...acc, [err.field?.[0] || "general"]: err.message }),
            {}
          ),
        });
      }

      return redirect(`/app/products/${result.productCreate.product.id}`);
    }

    if (action === "update") {
      const productId = formData.get("productId");
      
      const productInput = {
        title: formData.get("title"),
        description: formData.get("description"),
        vendor: formData.get("vendor"),
        productType: formData.get("productType"),
        tags: formData.get("tags")?.split(",").map((t) => t.trim()).filter(Boolean),
        status: formData.get("status"),
      };

      const result = await updateProduct(admin, productId, productInput);

      if (result.productUpdate.userErrors.length > 0) {
        return json({
          errors: result.productUpdate.userErrors.reduce(
            (acc, err) => ({ ...acc, [err.field?.[0] || "general"]: err.message }),
            {}
          ),
        });
      }

      return json({ success: true, product: result.productUpdate.product });
    }

    return json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    console.error("Product action error:", error);
    return json({ errors: { general: "Failed to save product" } }, { status: 500 });
  }
};

export default function ProductEdit() {
  const { product, isNew } = useLoaderData();
  const actionData = useActionData();
  const navigate = useNavigate();
  const params = useParams();

  return (
    <>
      <Breadcrumbs
        links={[
          { label: "Products", url: "/app/products" },
          { label: isNew ? "New Product" : product?.title || "Edit" },
        ]}
      />
      
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
    </>
  );
}

export const headers = (headersArgs) => {
  return boundary.headers(headersArgs);
};
