import {
  Box,
  InlineStack,
  Text,
  TextField,
  Checkbox,
  BlockStack,
} from "@shopify/ui-extensions-react/admin";
import { useExtensionData } from "@shopify/ui-extensions-react/admin";

interface DiscountConfig {
  collection_ids: string[];
  discount_percentage: number;
  applies_to_shipping: boolean;
}

/**
 * Discount Settings UI Extension
 * Renders in the Shopify Admin when merchants configure the discount function
 */
export default function DiscountSettings() {
  const { extensionData } = useExtensionData();
  
  // Parse existing configuration from metafield
  const config: DiscountConfig = JSON.parse(
    extensionData.metafield?.value || 
    '{"collection_ids":[],"discount_percentage":0,"applies_to_shipping":false}'
  );

  /**
   * Update the function configuration metafield
   */
  const updateConfig = (newConfig: DiscountConfig) => {
    shopify.applyExtensionMetafieldChange({
      type: "update",
      key: "function-configuration",
      namespace: "$app",
      value: JSON.stringify(newConfig),
      valueType: "json",
    });
  };

  /**
   * Handle discount percentage change
   */
  const handlePercentageChange = (value: string) => {
    const percentage = parseFloat(value) || 0;
    const clampedPercentage = Math.min(100, Math.max(0, percentage));
    updateConfig({ ...config, discount_percentage: clampedPercentage });
  };

  /**
   * Handle shipping discount toggle
   */
  const handleShippingChange = (checked: boolean) => {
    updateConfig({ ...config, applies_to_shipping: checked });
  };

  /**
   * Handle collection IDs change (comma-separated)
   */
  const handleCollectionIdsChange = (value: string) => {
    const collectionIds = value
      .split(",")
      .map((id) => id.trim())
      .filter((id) => id.length > 0);
    updateConfig({ ...config, collection_ids: collectionIds });
  };

  return (
    <Box padding="base">
      <BlockStack gap="base">
        <Text fontWeight="bold" size="large">
          Collection Discount Configuration
        </Text>

        <Text emphasis="subdued">
          Configure how this discount applies to products in specific collections.
        </Text>

        <TextField
          label="Discount Percentage"
          type="number"
          value={config.discount_percentage.toString()}
          onChange={handlePercentageChange}
          min={0}
          max={100}
          helpText="Enter a value between 0 and 100"
          suffix="%"
        />

        <TextField
          label="Collection IDs"
          value={config.collection_ids.join(", ")}
          onChange={handleCollectionIdsChange}
          helpText="Enter collection IDs separated by commas (e.g., gid://shopify/Collection/123, gid://shopify/Collection/456)"
          multiline
        />

        <Checkbox
          label="Apply to shipping"
          checked={config.applies_to_shipping}
          onChange={handleShippingChange}
          helpText="When enabled, the discount percentage also applies to shipping costs"
        />

        <Box padding="base" borderWidth="thin" borderRadius="base" background="subdued">
          <BlockStack gap="tight">
            <Text fontWeight="bold">How it works</Text>
            <Text size="small">
              • Products in the specified collections will receive the discount percentage off
            </Text>
            <Text size="small">
              • If "Apply to shipping" is enabled, shipping costs are also discounted
            </Text>
            <Text size="small">
              • Collection IDs can be found in the Shopify Admin URL when viewing a collection
            </Text>
          </BlockStack>
        </Box>
      </BlockStack>
    </Box>
  );
}
