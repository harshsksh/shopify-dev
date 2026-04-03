use shopify_function::{prelude::*, CartLinesDiscountsGenerateRunInput};
use serde::Deserialize;

/// Configuration for the discount function, stored in metafields
#[derive(Deserialize, Debug, Default)]
pub struct DiscountConfiguration {
    /// List of collection IDs to apply discount to
    pub collection_ids: Vec<String>,
    /// Discount percentage (0-100)
    pub discount_percentage: f64,
    /// Whether to apply discount to shipping
    pub applies_to_shipping: bool,
}

#[derive(Debug)]
pub struct RunOutput;

/// Main discount function entry point
/// Runs when cart lines are evaluated for discounts
#[function]
pub fn cart_lines_discounts_generate_run(
    input: CartLinesDiscountsGenerateRunInput,
) -> Result<RunOutput> {
    // Parse configuration from metafield
    let config: DiscountConfiguration = input
        .discount
        .metafield
        .and_then(|m| m.json_value)
        .and_then(|json| serde_json::from_str(&json).ok())
        .unwrap_or_default();

    let mut operations = vec![];

    // Handle product discounts
    if input.discount.discount_class == "product" {
        for line in input.cart.lines {
            if let Some(variant) = line.merchandise.as_product_variant() {
                let product_collections: Vec<String> = variant
                    .product
                    .collections
                    .edges
                    .iter()
                    .filter_map(|edge| edge.node.as_ref().map(|n| n.id.clone()))
                    .collect();

                // Check if product is in target collections
                let matches = config
                    .collection_ids
                    .iter()
                    .any(|id| product_collections.contains(id));

                if matches {
                    operations.push(ProductDiscountsAddOperation {
                        discount_application_strategy: "ACROSS",
                        target: ProductDiscountTarget {
                            product_variant: ProductVariantTarget {
                                id: variant.id,
                            },
                        },
                        value: PricingValue {
                            percentage: Some(config.discount_percentage),
                        },
                    });
                }
            }
        }
    }

    // Handle order discounts (subtotal)
    if input.discount.discount_class == "order" && config.discount_percentage > 0.0 {
        operations.push(OrderDiscountsAddOperation {
            discount_application_strategy: "ACROSS",
            target: OrderDiscountTarget {
                order: OrderTarget {},
            },
            value: PricingValue {
                percentage: Some(config.discount_percentage),
            },
        });
    }

    // Handle shipping discounts
    if input.discount.discount_class == "shipping" && config.applies_to_shipping {
        operations.push(DeliveryDiscountsAddOperation {
            discount_application_strategy: "ACROSS",
            target: DeliveryDiscountTarget {
                delivery: DeliveryTarget {},
            },
            value: PricingValue {
                percentage: Some(config.discount_percentage),
            },
        });
    }

    Ok(operations.into())
}
