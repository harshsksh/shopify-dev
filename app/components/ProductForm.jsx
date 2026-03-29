import { useState, useEffect } from "react";
import { useFetcher, useNavigate } from "react-router";
import { useAppBridge } from "@shopify/app-bridge-react";

/**
 * ProductForm component for creating/editing products
 * @param {Object} props
 * @param {Object} props.product - Existing product data (for edit mode)
 * @param {boolean} props.isEdit - Whether this is edit mode
 */
export default function ProductForm({ product = null, isEdit = false }) {
  const fetcher = useFetcher();
  const shopify = useAppBridge();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    title: product?.title || "",
    description: product?.description || "",
    vendor: product?.vendor || "",
    productType: product?.productType || "",
    tags: product?.tags?.join(", ") || "",
    status: product?.status || "draft",
    variants: product?.variants?.edges.map((e) => ({
      id: e.node.id,
      title: e.node.title,
      price: e.node.price,
      compareAtPrice: e.node.compareAtPrice || "",
      sku: e.node.sku || "",
      barcode: e.node.barcode || "",
      inventoryQuantity: e.node.inventoryQuantity || 0,
    })) || [{ title: "Default Title", price: "", sku: "", barcode: "" }],
    images: product?.images?.edges.map((e) => ({
      id: e.node.id,
      src: e.node.originalSrc,
      alt: e.node.altText || "",
    })) || [],
  });

  const [errors, setErrors] = useState({});
  const [isDirty, setIsDirty] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Track dirty state
  useEffect(() => {
    const original = JSON.stringify({
      title: product?.title || "",
      description: product?.description || "",
    });
    const current = JSON.stringify({
      title: formData.title,
      description: formData.description,
    });
    setIsDirty(original !== current);
  }, [formData, product]);

  const validate = () => {
    const newErrors = {};

    if (!formData.title || formData.title.trim() === "") {
      newErrors.title = "Title is required";
    }

    if (formData.variants.some((v) => !v.price || parseFloat(v.price) < 0)) {
      newErrors.variants = "Each variant must have a valid price";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validate()) {
      shopify.toast.show("Please fix the errors", { error: true });
      return;
    }

    setIsSaving(true);

    const submitData = new FormData();
    submitData.append("action", isEdit ? "update" : "create");
    submitData.append("title", formData.title);
    submitData.append("description", formData.description);
    submitData.append("vendor", formData.vendor);
    submitData.append("productType", formData.productType);
    submitData.append("tags", formData.tags);
    submitData.append("status", formData.status);
    submitData.append("variants", JSON.stringify(formData.variants));

    if (product?.id) {
      submitData.append("productId", product.id);
    }

    fetcher.submit(submitData, { method: "post" });
  };

  // Handle fetcher completion
  useEffect(() => {
    if (fetcher.data && !fetcher.data.errors) {
      shopify.toast.show(isEdit ? "Product updated" : "Product created");
      navigate("/app/products");
    } else if (fetcher.data?.errors) {
      setErrors(fetcher.data.errors);
      shopify.toast.show("Failed to save product", { error: true });
      setIsSaving(false);
    }
  }, [fetcher.data, isEdit, navigate, shopify]);

  const handleVariantChange = (index, field, value) => {
    const newVariants = [...formData.variants];
    newVariants[index] = { ...newVariants[index], [field]: value };
    setFormData({ ...formData, variants: newVariants });
    setIsDirty(true);
  };

  const handleAddVariant = () => {
    setFormData({
      ...formData,
      variants: [...formData.variants, { title: "", price: "", sku: "", barcode: "" }],
    });
  };

  const handleRemoveVariant = (index) => {
    if (formData.variants.length === 1) {
      shopify.toast.show("Product must have at least one variant");
      return;
    }
    const newVariants = formData.variants.filter((_, i) => i !== index);
    setFormData({ ...formData, variants: newVariants });
    setIsDirty(true);
  };

  return (
    <fetcher.Form onSubmit={handleSubmit}>
      <s-stack direction="block" gap="base">
        {/* Title */}
        <s-text-field
          label="Title"
          name="title"
          value={formData.title}
          onChange={(value) => {
            setFormData({ ...formData, title: value });
            setIsDirty(true);
          }}
          error={errors.title}
          autoComplete="off"
        />

        {/* Description */}
        <s-text-area
          label="Description"
          name="description"
          value={formData.description}
          onChange={(value) => {
            setFormData({ ...formData, description: value });
            setIsDirty(true);
          }}
          rows={5}
          helpText="Add a description that highlights the product's features and benefits"
        />

        {/* Vendor and Product Type */}
        <s-grid columns={2}>
          <s-text-field
            label="Vendor"
            name="vendor"
            value={formData.vendor}
            onChange={(value) => {
              setFormData({ ...formData, vendor: value });
              setIsDirty(true);
            }}
          />
          <s-text-field
            label="Product Type"
            name="productType"
            value={formData.productType}
            onChange={(value) => {
              setFormData({ ...formData, productType: value });
              setIsDirty(true);
            }}
          />
        </s-grid>

        {/* Tags */}
        <s-text-field
          label="Tags"
          name="tags"
          value={formData.tags}
          onChange={(value) => {
            setFormData({ ...formData, tags: value });
            setIsDirty(true);
          }}
          helpText="Separate tags with commas"
        />

        {/* Status */}
        <s-select
          label="Status"
          name="status"
          value={formData.status}
          onChange={(value) => {
            setFormData({ ...formData, status: value });
            setIsDirty(true);
          }}
        >
          <option value="active">Active</option>
          <option value="draft">Draft</option>
          <option value="archived">Archived</option>
        </s-select>

        {/* Variants Section */}
        <s-section heading="Variants">
          <s-stack direction="block" gap="base">
            {formData.variants.map((variant, index) => (
              <s-box
                key={index}
                padding="base"
                borderWidth="thin"
                borderRadius="base"
              >
                <s-stack direction="block" gap="tight">
                  <s-heading level={4}>Variant {index + 1}</s-heading>
                  
                  <s-grid columns={2}>
                    <s-text-field
                      label="Title"
                      value={variant.title}
                      onChange={(value) =>
                        handleVariantChange(index, "title", value)
                      }
                      placeholder="e.g., Small, Red, etc."
                    />
                    <s-text-field
                      label="Price"
                      type="number"
                      value={variant.price}
                      onChange={(value) =>
                        handleVariantChange(index, "price", value)
                      }
                      error={errors.variants}
                    />
                  </s-grid>

                  <s-grid columns={2}>
                    <s-text-field
                      label="SKU"
                      value={variant.sku}
                      onChange={(value) =>
                        handleVariantChange(index, "sku", value)
                      }
                    />
                    <s-text-field
                      label="Barcode"
                      value={variant.barcode}
                      onChange={(value) =>
                        handleVariantChange(index, "barcode", value)
                      }
                    />
                  </s-grid>

                  {formData.variants.length > 1 && (
                    <s-button
                      variant="plain"
                      destructive
                      size="small"
                      onClick={() => handleRemoveVariant(index)}
                    >
                      Remove variant
                    </s-button>
                  )}
                </s-stack>
              </s-box>
            ))}

            <s-button variant="secondary" onClick={handleAddVariant}>
              Add variant
            </s-button>
          </s-stack>
        </s-section>

        {/* Save Bar (App Bridge) - renders when form is dirty */}
        {isDirty && (
          <s-save-bar
            onSave={handleSubmit}
            onDiscard={() => navigate("/app/products")}
            {...(isSaving ? { saving: true } : {})}
          />
        )}
      </s-stack>
    </fetcher.Form>
  );
}
