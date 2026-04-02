# Learning Notes - Shopify App Development

> Personal reference for key concepts learned during development

---

## Database in Shopify Apps

**Date:** April 2, 2026

### Does Shopify Provide a Database?

**No** - Shopify does NOT provide a built-in database for apps. You must manage your own data storage.

### Storage Options

#### 1. Shopify Storage (Built-in - Limited)

| Storage Type | What It Stores | Use Case |
|--------------|----------------|----------|
| **Metafields** | Simple data on Shopify resources | Product specs, ratings, settings |
| **Metaobjects** | Structured reusable data | Authors, size charts, lookups |

**Limitations:**
- Tied to Shopify resources (products, orders, customers)
- Rate limits apply
- Not for app-specific data (user preferences, logs, analytics)

#### 2. Your Own Database (Required for Most Apps)

| Database | Best For | Example |
|----------|----------|---------|
| **SQLite** | Development, simple apps | Current setup |
| **PostgreSQL** | Production, complex queries | Neon, Supabase |
| **MySQL** | General purpose | PlanetScale |
| **MongoDB** | Flexible schemas | MongoDB Atlas |
| **Redis** | Caching, sessions | Upstash |

### Current Setup (Prisma + SQLite)

```prisma
// prisma/schema.prisma
datasource db {
  provider = "sqlite"
  url      = "file:dev.sqlite"
}

model Session {
  id          String    @id
  shop        String
  state       String
  accessToken String
  // ... session fields
}
```

**What it stores:** Session data (OAuth tokens, shop info)

### Production Migration Example

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")  // Neon connection string
}
```

### When Do You Need a Database?

| App Type | Database Needed? | Why |
|----------|------------------|-----|
| Simple metafield editor | ❌ No | All data in metafields |
| Product reviews | ⚠️ Optional | Can use metafields or own DB |
| Subscription app | ✅ Yes | Billing, user accounts |
| Analytics dashboard | ✅ Yes | Historical data |

---

## Metafields

**Date:** April 2, 2026

### What Are Metafields?

**Metafields** are custom fields that let you attach extra information to Shopify resources (products, orders, customers, etc.) that aren't covered by standard fields.

Think of them as **custom attributes** you add to extend Shopify's data model.

**Example:**
```
Product
├── title: "Snowboard" (standard)
├── price: 299.99 (standard)
└── metafields (custom)
    ├── material: "Fiberglass"
    ├── care_instructions: "Wax monthly"
    └── rating: 4.5
```

### Common Use Cases

| Use Case | Example | Resource |
|----------|---------|----------|
| Product specs | Material, dimensions | Product |
| Care instructions | Washing, maintenance | Product |
| Ratings | Average rating, review count | Product |
| SEO data | Custom meta title | Product/Collection |
| Shipping info | Hazmat status | Product |
| Store badges | "New", "Bestseller" | Product |
| Customer data | Loyalty points | Customer |

### Metafield Structure

```
namespace.key = value (type)

Example: custom.material = "Fiberglass" (single_line_text_field)
```

| Part | Description | Example |
|------|-------------|---------|
| **Namespace** | Groups related metafields | `custom`, `seo` |
| **Key** | Unique identifier | `material`, `rating` |
| **Value** | The actual data | `"Fiberglass"`, `4.5` |
| **Type** | Data type | `single_line_text_field` |

### Common Metafield Types

| Type | Example Value |
|------|---------------|
| `single_line_text_field` | `"Cotton"` |
| `multi_line_text_field` | `"Wash cold, tumble dry"` |
| `number_decimal` | `4.5` |
| `json` | `{"sizes": ["S", "M", "L"]}` |
| `file_reference` | File ID (image/PDF) |
| `color` | `"#FF5733"` |
| `boolean` | `true` |
| `rating` | `4.5` |

### Your App's Metafields

From `shopify.app.toml`:

```toml
[product.metafields.custom.material]
type = "single_line_text_field"
name = "Material"

[product.metafields.custom.care_instructions]
type = "multi_line_text_field"
name = "Care Instructions"

[product.metafields.custom.rating]
type = "number_decimal"
name = "Rating"
```

### Reading Metafields (GraphQL)

```graphql
query GetProduct($id: ID!) {
  product(id: $id) {
    title
    material: metafield(namespace: "custom", key: "material") {
      value
    }
    rating: metafield(namespace: "custom", key: "rating") {
      value
    }
  }
}
```

### Writing Metafields (GraphQL)

```graphql
mutation productUpdate($input: ProductInput!) {
  productUpdate(input: $input) {
    product { id }
    userErrors { field message }
  }
}

// Variables
{
  "input": {
    "id": "gid://shopify/Product/123",
    "metafields": [{
      "namespace": "custom",
      "key": "material",
      "value": "Organic Cotton",
      "type": "single_line_text_field"
    }]
  }
}
```

### In React App

```tsx
export default function ProductEdit() {
  const { product } = useLoaderData();

  return (
    <s-text-field
      label="Material"
      name="metafields[custom][material]"
      value={product.material?.value}
    />
  );
}
```

### In Liquid (Theme)

```liquid
{{ product.metafields.custom.material.value }}
<!-- Output: Organic Cotton -->
```

### Access Scopes

| Access | Description |
|--------|-------------|
| `merchant_read_write` | Merchant can read/write |
| `merchant_read` | Merchant read-only |
| `public_read` | Anyone can read (Storefront API) |

### Metafields vs Metaobjects

| Feature | Metafields | Metaobjects |
|---------|------------|-------------|
| Purpose | Simple data on resources | Reusable structured data |
| Structure | Key-value pairs | Custom types with fields |
| Reusability | Tied to one resource | Referenced by many |
| Example | `material: "Cotton"` | Author object |

**Use metafields for:** Simple attributes (rating, material)  
**Use metaobjects for:** Complex, reusable data (authors, size charts)

---

## Metaobjects

**Date:** April 2, 2026

### What Are Metaobjects?

**Metaobjects** let you create custom, structured data types that can be reused across your Shopify store. They're like creating your own database tables within Shopify.

**Analogy:**
- **Metafields** = Adding columns to existing tables
- **Metaobjects** = Creating new tables with relationships

### Metafields vs Metaobjects

| Feature | Metafields | Metaobjects |
|---------|------------|-------------|
| Purpose | Simple attributes on resources | Reusable structured data |
| Structure | Single key-value pair | Multiple fields (like a record) |
| Reusability | Tied to one resource | Can reference from many resources |
| Example | `material: "Cotton"` | Author with name, bio, avatar |

### Common Use Cases

| Use Case | Fields | Referenced By |
|----------|--------|---------------|
| **Author** | Name, bio, avatar, social links | Products, blog posts |
| **Size Chart** | Chart name, measurements (JSON) | Products, collections |
| **Brand** | Logo, description, website | Products |
| **Ingredient** | Name, origin, benefits | Products |
| **Store Location** | Address, hours, phone | Products (pickup) |
| **FAQ** | Question, answer, category | Products, pages |

### Your App's Metaobject Definitions

From `shopify.app.toml`:

```toml
# Author Metaobject
[metaobjects.app.author]
name = "Author"
description = "Content authors for products"

[metaobjects.app.author.fields.name]
name = "Name"
type = "single_line_text_field"
required = true

[metaobjects.app.author.fields.bio]
name = "Bio"
type = "multi_line_text_field"
required = false

[metaobjects.app.author.fields.avatar]
name = "Avatar"
type = "file_reference"
required = false

# Size Chart Metaobject
[metaobjects.app.size_chart]
name = "Size Chart"

[metaobjects.app.size_chart.fields.chart_name]
name = "Chart Name"
type = "single_line_text_field"
required = true

[metaobjects.app.size_chart.fields.chart_data]
name = "Chart Data"
type = "json"
required = false
```

### Creating Metaobjects (GraphQL)

```graphql
mutation CreateAuthor($handle: MetaobjectHandleInput!, $metaobject: MetaobjectUpsertInput!) {
  metaobjectUpsert(handle: $handle, metaobject: $metaobject) {
    metaobject {
      id
      handle
      displayName
      fields { key value }
    }
    userErrors { field message }
  }
}

// Variables
{
  "handle": { "type": "author", "handle": "john-doe" },
  "metaobject": {
    "fields": [
      { "key": "name", "value": "John Doe" },
      { "key": "bio", "value": "Expert snowboarder" },
      { "key": "avatar", "value": "gid://shopify/MediaImage/12345" }
    ]
  }
}
```

### Reading Metaobjects

```graphql
query GetAuthors {
  metaobjects(type: "author", first: 10) {
    edges {
      node {
        id
        handle
        displayName
        fields { key value }
      }
    }
  }
}
```

### Referencing Metaobjects from Products

**1. Define metafield reference:**
```toml
[product.metafields.custom.author]
type = "metaobject_reference"
metaobject_type = "author"
```

**2. Link product to author:**
```graphql
mutation {
  productUpdate(input: {
    id: "gid://shopify/Product/123",
    metafields: [{
      namespace: "custom",
      key: "author",
      value: "gid://shopify/Metaobject/author/456",
      type: "metaobject_reference"
    }]
  }) { product { id } }
}
```

**3. Query product with author:**
```graphql
query GetProduct($id: ID!) {
  product(id: $id) {
    title
    author: metafield(namespace: "custom", key: "author") {
      metaobject {
        id
        handle
        fields { key value }
      }
    }
  }
}
```

### In Liquid (Theme)

```liquid
{% assign author = product.metafields.custom.author.metaobject %}

{% if author %}
  <div class="author-card">
    <h4>{{ author.fields.name.value }}</h4>
    <p>{{ author.fields.bio.value }}</p>
  </div>
{% endif %}
```

### Complete Example: Size Chart

**1. Create:**
```graphql
mutation {
  metaobjectUpsert(
    handle: { type: "size_chart", handle: "tshirt-sizes" }
    metaobject: {
      fields: [
        { key: "chart_name", value: "T-Shirt Sizing" },
        { key: "chart_data", value: "{\"sizes\":[{\"label\":\"S\",\"chest\":\"34-36\"}]}" }
      ]
    }
  ) { metaobject { id handle } }
}
```

**2. Display in theme:**
```liquid
{% assign sizeChart = product.metafields.custom.size_chart.metaobject %}
{% if sizeChart %}
  <h3>{{ sizeChart.fields.chart_name.value }}</h3>
  {% assign data = sizeChart.fields.chart_data.value | json_to_object %}
  <table>
    {% for size in data.sizes %}
      <tr><td>{{ size.label }}</td><td>{{ size.chest }}</td></tr>
    {% endfor %}
  </table>
{% endif %}
```

### Best Practices

| Practice | Why |
|----------|-----|
| Use descriptive handles | Easy to reference (`john-doe`) |
| Define in `shopify.app.toml` | Auto-deploy with app |
| Use JSON for complex data | Store structured tables |
| Consider relationships | Link via metaobject_reference |

---

## Admin Intents

**Date:** April 2, 2026

### What Are Admin Intents?

Admin Intents are a **Shopify App Bridge** feature that lets your embedded app trigger native Shopify Admin actions directly from your app UI. Instead of building your own UI for common tasks, you can invoke Shopify's built-in editors and navigators.

### What They Do

Admin intents allow your app to:
- Open Shopify's native editors (product, collection, order, etc.)
- Navigate to specific admin pages
- Trigger actions like creating discounts, viewing analytics, etc.

### Key Benefits

| Benefit | Description |
|---------|-------------|
| **Consistent UX** | Users see familiar Shopify interfaces |
| **Less code** | No need to build your own editors |
| **Always up-to-date** | Shopify maintains the native UI |

### Common Intents

| Intent | Description |
|--------|-------------|
| `edit:shopify/Product` | Open product editor |
| `edit:shopify/Collection` | Open collection editor |
| `edit:shopify/Order` | Open order editor |
| `edit:shopify/Customer` | Open customer editor |
| `create:shopify/Discount` | Open discount creator |
| `navigate:shopify/Analytics` | Navigate to analytics |
| `navigate:shopify/Products` | Navigate to products list |

### Code Example (from the learn app)

In `app/routes/app._index.jsx`, the "Edit product" button uses admin intents:

```jsx
<s-button
  onClick={() => {
    shopify.intents.invoke?.("edit:shopify/Product", {
      value: fetcher.data?.product?.id,
    });
  }}
  target="_blank"
  variant="tertiary"
>
  Edit product
</s-button>
```

This button opens Shopify's **native product editor** for the generated product, instead of building a custom edit form.

### Full Example with App Bridge

```tsx
import { useAppBridge } from "@shopify/app-bridge-react";

function ProductActions({ productId }) {
  const shopify = useAppBridge();

  const handleEdit = () => {
    shopify.intents.invoke("edit:shopify/Product", {
      value: productId,
    });
  };

  const handleCreateDiscount = () => {
    shopify.intents.invoke("create:shopify/Discount", {
      data: {
        title: "Summer Sale",
        productId: productId,
      },
    });
  };

  return (
    <>
      <button onClick={handleEdit}>Edit in Shopify</button>
      <button onClick={handleCreateDiscount}>Create Discount</button>
    </>
  );
}
```

### Intent Structure

```typescript
shopify.intents.invoke(intentName, options?)
```

**Parameters:**
- **`intentName`** - String like `"edit:shopify/Product"`
- **`options`** - Optional object with:
  - `value` - Resource ID to edit (e.g., product ID)
  - `data` - Pre-fill data for create actions

### Usage Pattern

```tsx
import { useAppBridge } from "@shopify/app-bridge-react";

export default function MyComponent() {
  const shopify = useAppBridge();

  const handleAction = () => {
    // Check if intents is available (optional chaining)
    shopify.intents.invoke?.("edit:shopify/Product", {
      value: "gid://shopify/Product/123456789",
    });
  };

  return <button onClick={handleAction}>Edit Product</button>;
}
```

### Where to Use in Your App

| Page/Feature | Recommended Intent |
|--------------|-------------------|
| Product management pages | `edit:shopify/Product` |
| Collection management | `edit:shopify/Collection` |
| Order fulfillment flows | `edit:shopify/Order` |
| Discount configuration UI | `create:shopify/Discount` |
| Quick navigation | `navigate:shopify/*` |

### Related Concepts

- **App Bridge** - The React library that enables embedded app functionality
- **Polaris Web Components** - Shopify's UI component library (used alongside App Bridge)
- **Embedded Apps** - Apps that run inside the Shopify Admin iframe

### Resources

- [Shopify Admin Intents Documentation](https://shopify.dev/docs/apps/build/admin/admin-intents)
- [App Bridge React Documentation](https://shopify.dev/docs/api/app-bridge-react)
- [App Bridge Intents Reference](https://shopify.dev/docs/api/app-bridge/latest/utilities/intents)

---

*Last updated: April 2, 2026*
