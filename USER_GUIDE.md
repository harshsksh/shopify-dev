# Learn Shopify App - Merchant User Guide

## Overview

The Learn app helps you manage product information, authors, and size charts directly within your Shopify admin. It also provides storefront integration through theme app blocks and custom discount functions.

---

## Getting Started

### Installation

1. Go to your Shopify Admin
2. Navigate to **Apps** → **App and sales channel settings**
3. Click **Develop apps** → **Create an app**
4. Install the Learn app on your store

### First Steps

After installation, you'll see the app home page with quick links to:
- **Products** - Manage your product catalog
- **Authors** - Create author profiles
- **Size Charts** - Set up reusable size charts

---

## Features

### 1. Product Management

#### Viewing Products
- Navigate to **Products** in the app navigation
- See all products with title, status, inventory, and price
- Use pagination to browse large catalogs

#### Editing Products
1. Click **Edit** on any product
2. Update product details:
   - **Title** - Product name
   - **Description** - Product description
   - **Vendor** - Manufacturer/brand
   - **Product Type** - Category
   - **Tags** - Comma-separated tags
   - **Status** - Active, Draft, or Archived

#### Product Details (Metafields)
- **Material** - What the product is made of (e.g., "Cotton", "Leather")
- **Care Instructions** - How to care for the product
- **Rating** - Product rating from 0 to 5

#### Creating Products
1. Click **Add product** on the products page
2. Fill in product details
3. Click **Save**

#### Deleting Products
1. Click **Delete** on any product
2. Confirm the deletion

---

### 2. Author Management

Authors are reusable profiles that can be linked to products.

#### Creating an Author
1. Navigate to **Authors** in the app
2. Click **Add author**
3. Fill in:
   - **Name** - Author's full name (required)
   - **Handle** - Unique identifier (auto-generated from name)
   - **Bio** - Short biography (optional)
4. Click **Save**

#### Editing an Author
1. Click **Edit** on any author
2. Update the details
3. Click **Save**

#### Deleting an Author
1. Click **Delete** on any author
2. Confirm the deletion

#### Linking Authors to Products
To link an author to a product:
1. Go to Shopify Admin → Products
2. Select a product
3. Scroll to **Metafields** section
4. Find **Product Author** field
5. Select the author from the dropdown

---

### 3. Size Chart Management

Size charts are reusable measurement tables that can be linked to products.

#### Creating a Size Chart
1. Navigate to **Size Charts** in the app
2. Click **Add size chart**
3. Fill in:
   - **Chart Name** - Descriptive name (e.g., "T-Shirt Sizing")
   - **Handle** - Unique identifier (auto-generated)
   - **Chart Data** - JSON format size data
4. Click **Save**

#### Chart Data Format
Enter size data as JSON:
```json
{
  "sizes": [
    {"label": "S", "chest": "34-36", "waist": "28-30"},
    {"label": "M", "chest": "38-40", "waist": "32-34"},
    {"label": "L", "chest": "42-44", "waist": "36-38"}
  ]
}
```

#### Editing a Size Chart
1. Click **Edit** on any size chart
2. Update the details
3. Click **Save**

#### Deleting a Size Chart
1. Click **Delete** on any size chart
2. Confirm the deletion

#### Linking Size Charts to Products
To link a size chart to a product:
1. Go to Shopify Admin → Products
2. Select a product
3. Scroll to **Metafields** section
4. Find **Size Chart** field
5. Select the size chart from the dropdown

---

### 4. Theme App Extension

The app adds a **Product Reviews** block to your theme editor.

#### Adding the Block to Your Theme
1. Go to **Online Store** → **Themes**
2. Click **Customize** on your theme
3. Navigate to a **Product** template
4. Click **Add block** → **Apps** → **Product Reviews**
5. Configure the block settings:
   - **Heading** - Section title
   - **Show material info** - Display product material
   - **Show care instructions** - Display care info
   - **Show author info** - Display linked author
   - **Show size chart** - Display linked size chart
   - **Star color** - Color for rating stars
6. Click **Save**

#### What Customers See
- Product rating display
- Material information
- Care instructions
- Author bio (if linked)
- Size chart table (if linked)

---

### 5. Discount Functions

Create collection-based discounts using the Rust discount function.

#### Creating a Discount
1. Go to **Discounts** in Shopify Admin
2. Click **Create discount** → **App discount**
3. Select **Collection Discount**
4. Configure:
   - **Discount Percentage** - 0-100%
   - **Collection IDs** - Comma-separated collection IDs
   - **Apply to shipping** - Toggle for shipping discounts
5. Set discount schedule (start/end dates)
6. Click **Save**

#### Finding Collection IDs
1. Go to **Products** → **Collections**
2. Click on a collection
3. The ID is in the URL: `.../collections/123456789`
4. Use the full ID: `gid://shopify/Collection/123456789`

#### How Discounts Work
- Products in specified collections get the percentage discount
- Order discounts apply to the entire cart subtotal
- Shipping discounts apply to shipping costs (if enabled)

---

## Troubleshooting

### Product not showing metafields
- Ensure metafields are defined in app settings
- Check that you have write permissions for products

### Author/Size Chart not appearing on storefront
- Verify the metaobject is linked to the product
- Ensure the theme app block is added to the product template
- Check that the block settings enable the relevant sections

### Discount not applying at checkout
- Verify collection IDs are correct
- Check discount schedule dates
- Ensure the discount is active
- Confirm products are in the specified collections

### App not loading
- Clear browser cache
- Reinstall the app
- Check that all required scopes are granted

---

## Support

For help with the Learn app:
- Check this user guide
- Review the [README](README.md) for technical details
- Contact support at [your-support-email]

---

*Last updated: April 3, 2026*
