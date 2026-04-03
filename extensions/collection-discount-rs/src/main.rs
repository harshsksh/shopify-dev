//! Collection Discount Function
//! Applies percentage discounts to products in specific collections
//! 
//! This function reads JSON input from Shopify, applies discount logic,
//! and returns JSON output with discount operations.

use serde::{Deserialize, Serialize};
use std::io::{self, Read};

/// Configuration for the discount function
#[derive(Deserialize, Serialize, Debug, Default, Clone)]
pub struct DiscountConfiguration {
    #[serde(default)]
    pub collection_ids: Vec<String>,
    #[serde(default)]
    pub discount_percentage: f64,
    #[serde(default)]
    pub applies_to_shipping: bool,
}

/// Input structure matching the GraphQL query
#[derive(Deserialize, Debug)]
pub struct Input {
    pub cart: Cart,
    pub discount: Discount,
}

#[derive(Deserialize, Debug)]
pub struct Cart {
    pub lines: Vec<CartLine>,
}

#[derive(Deserialize, Debug)]
pub struct CartLine {
    pub id: String,
    pub quantity: u32,
    pub merchandise: Merchandise,
}

#[derive(Deserialize, Debug)]
pub struct Merchandise {
    #[serde(rename = "__typename")]
    pub typename: String,
    #[serde(flatten)]
    pub variant: Option<ProductVariant>,
}

#[derive(Deserialize, Debug)]
pub struct ProductVariant {
    pub id: String,
    pub price: Price,
    pub product: Product,
}

#[derive(Deserialize, Debug)]
pub struct Price {
    pub amount: String,
    pub currency_code: String,
}

#[derive(Deserialize, Debug)]
pub struct Product {
    pub id: String,
    pub collections: CollectionsConnection,
}

#[derive(Deserialize, Debug)]
pub struct CollectionsConnection {
    pub edges: Vec<CollectionEdge>,
}

#[derive(Deserialize, Debug)]
pub struct CollectionEdge {
    pub node: Option<CollectionNode>,
}

#[derive(Deserialize, Debug)]
pub struct CollectionNode {
    pub id: String,
    pub handle: String,
}

#[derive(Deserialize, Debug)]
pub struct Discount {
    pub discount_class: String,
    pub metafield: Option<Metafield>,
}

#[derive(Deserialize, Debug)]
pub struct Metafield {
    #[serde(rename = "jsonValue")]
    pub json_value: Option<String>,
}

/// Output operations for the discount function
#[derive(Serialize, Debug)]
pub struct FunctionResult {
    pub operations: Vec<Operation>,
}

#[derive(Serialize, Debug)]
#[serde(tag = "type")]
pub enum Operation {
    #[serde(rename = "productDiscount")]
    ProductDiscount {
        targets: Vec<ProductTarget>,
        value: DiscountValue,
    },
    #[serde(rename = "orderDiscount")]
    OrderDiscount {
        targets: Vec<OrderTarget>,
        value: DiscountValue,
    },
    #[serde(rename = "shippingDiscount")]
    ShippingDiscount {
        targets: Vec<ShippingTarget>,
        value: DiscountValue,
    },
}

#[derive(Serialize, Debug)]
pub struct ProductTarget {
    pub product_variant: ProductVariantTarget,
}

#[derive(Serialize, Debug)]
pub struct ProductVariantTarget {
    pub id: String,
}

#[derive(Serialize, Debug)]
pub struct OrderTarget {
    pub order: OrderDiscountTarget,
}

#[derive(Serialize, Debug)]
pub struct OrderDiscountTarget {}

#[derive(Serialize, Debug)]
pub struct ShippingTarget {
    pub delivery: DeliveryDiscountTarget,
}

#[derive(Serialize, Debug)]
pub struct DeliveryDiscountTarget {}

#[derive(Serialize, Debug)]
pub struct DiscountValue {
    pub percentage: Option<f64>,
}

/// Main function - processes cart and applies discounts
fn run(input: Input) -> FunctionResult {
    let config: DiscountConfiguration = input
        .discount
        .metafield
        .and_then(|m| m.json_value)
        .and_then(|json| serde_json::from_str(&json).ok())
        .unwrap_or_default();

    let mut operations = vec![];

    // Handle product discounts
    if input.discount.discount_class == "PRODUCT" && !config.collection_ids.is_empty() {
        for line in &input.cart.lines {
            if let Some(variant) = &line.merchandise.variant {
                let product_collections: Vec<String> = variant
                    .product
                    .collections
                    .edges
                    .iter()
                    .filter_map(|edge| edge.node.as_ref().map(|n| n.id.clone()))
                    .collect();

                let matches = config
                    .collection_ids
                    .iter()
                    .any(|id| product_collections.contains(id));

                if matches {
                    operations.push(Operation::ProductDiscount {
                        targets: vec![ProductTarget {
                            product_variant: ProductVariantTarget {
                                id: variant.id.clone(),
                            },
                        }],
                        value: DiscountValue {
                            percentage: Some(config.discount_percentage),
                        },
                    });
                }
            }
        }
    }

    // Handle order discounts
    if input.discount.discount_class == "ORDER" && config.discount_percentage > 0.0 {
        operations.push(Operation::OrderDiscount {
            targets: vec![OrderTarget {
                order: OrderDiscountTarget {},
            }],
            value: DiscountValue {
                percentage: Some(config.discount_percentage),
            },
        });
    }

    // Handle shipping discounts
    if input.discount.discount_class == "SHIPPING" && config.applies_to_shipping {
        operations.push(Operation::ShippingDiscount {
            targets: vec![ShippingTarget {
                delivery: DeliveryDiscountTarget {},
            }],
            value: DiscountValue {
                percentage: Some(config.discount_percentage),
            },
        });
    }

    FunctionResult { operations }
}

fn main() {
    let mut input_str = String::new();
    io::stdin().read_to_string(&mut input_str).unwrap();
    
    let input: Input = serde_json::from_str(&input_str).unwrap();
    let result = run(input);
    
    println!("{}", serde_json::to_string(&result).unwrap());
}
