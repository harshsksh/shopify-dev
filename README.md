# Learn - Shopify App

A full-featured Shopify app demonstrating React Router admin UI, GraphQL API, metafields, metaobjects, theme app extensions, and discount functions.

## Features

| Feature | Description |
|---------|-------------|
| **Product Management** | Full CRUD for products with metafields (material, care instructions, rating) |
| **Author Management** | Metaobject-based author profiles with name, bio, and avatar |
| **Size Charts** | Reusable size chart metaobjects with JSON data |
| **Theme Extension** | Product reviews app block for storefront integration |
| **Discount Function** | Rust-based collection discount with admin UI |
| **Webhooks** | Product change tracking and app uninstall handling |

## Tech Stack

- **Framework:** React Router (Shopify App Template)
- **UI:** Polaris Web Components + App Bridge
- **API:** Shopify Admin GraphQL
- **Database:** Prisma + SQLite (dev) / PostgreSQL (production)
- **Functions:** Rust (WASM) for discount logic
- **Theme:** Liquid app blocks + JavaScript/CSS assets

## Quick Start

### Prerequisites

- [Node.js](https://nodejs.org/) >= 20.19
- [Shopify CLI](https://shopify.dev/docs/apps/tools/cli/getting-started)
- [Rust](https://rustup.rs/) (for discount function)
- [Microsoft C++ Build Tools](https://visualstudio.microsoft.com/visual-cpp-build-tools/) (Windows)

### Installation

```bash
# Clone the repository
git clone <your-repo-url>
cd learn

# Install dependencies
npm install

# Install Rust WASM target
rustup target add wasm32-wasip1

# Setup database
npm run setup
```

### Development

```bash
# Start development server
npm run dev

# Open app in browser (press 'p' in dev server)
# Install app on your dev store
```

### Building Extensions

```bash
# Build Rust discount function
cd extensions/collection-discount-rs
cargo build --target=wasm32-wasip1 --release

# Build UI extension
cd extensions/collection-discount-ui
npm install
```

### Deployment

```bash
# Deploy to Shopify (creates new version)
npm run deploy

# Deploy with version tag
npm run deploy -- --version "1.0.0" --message "Initial release"

# Deploy without releasing
npm run deploy -- --no-release
```

## Project Structure

```
app/
├── components/
│   └── ProductForm.jsx          # Product create/edit form
├── models/
│   ├── product.server.js        # Product CRUD operations
│   ├── metafield.server.js      # Metafield operations
│   └── metaobject.server.js     # Metaobject CRUD
├── routes/
│   ├── app._index.jsx           # Home page
│   ├── app.products._index.jsx  # Product listing
│   ├── app.products.$id.jsx     # Product detail/edit
│   ├── app.authors._index.jsx   # Author listing
│   ├── app.authors.$id.jsx      # Author detail/edit
│   ├── app.size-charts._index.jsx  # Size chart listing
│   ├── app.size-charts.$id.jsx     # Size chart detail/edit
│   └── webhooks/                # Webhook handlers
├── root.jsx                     # Root layout
└── shopify.server.js            # Shopify auth config

extensions/
├── product-reviews/             # Theme app extension
│   ├── blocks/
│   │   ├── review-block/        # Product reviews block
│   │   └── review-embed/        # Global widget embed
│   ├── assets/
│   │   ├── product-reviews.css
│   │   └── product-reviews.js
│   └── locales/
│       └── en.default.json
├── collection-discount-rs/      # Rust discount function
│   ├── src/main.rs
│   ├── inputs/cart_lines.graphql
│   └── shopify.extension.toml
└── collection-discount-ui/      # Discount config UI
    ├── src/index.tsx
    └── shopify.extension.toml
```

## Configuration

### Access Scopes

Defined in `shopify.app.toml`:
- `read_products` - Read product data
- `write_products` - Create/update products
- `read_metaobjects` - Read metaobjects
- `write_metaobjects` - Create/update metaobjects
- `write_discounts` - Create discount functions

### Metafields

| Namespace | Key | Type | Resource |
|-----------|-----|------|----------|
| `custom` | `material` | single_line_text_field | Product |
| `custom` | `care_instructions` | multi_line_text_field | Product |
| `custom` | `rating` | number_decimal | Product |

### Metaobjects

| Type | Fields | Purpose |
|------|--------|---------|
| `author` | name, bio, avatar | Product authors/designers |
| `size_chart` | chart_name, chart_data (JSON) | Reusable size charts |

## Webhooks

| Topic | Handler | Purpose |
|-------|---------|---------|
| `app/uninstalled` | `/webhooks/app/uninstalled` | Clean up on uninstall |
| `app/scopes_update` | `/webhooks/app/scopes_update` | Handle scope changes |
| `products/create` | `/webhooks/products` | Track new products |
| `products/update` | `/webhooks/products` | Track product changes |
| `products/delete` | `/webhooks/products` | Track product deletions |

## Discount Function

The Rust discount function applies percentage discounts to products in specific collections.

### Configuration

Set via the admin UI extension:
- **Discount Percentage:** 0-100%
- **Collection IDs:** Comma-separated collection IDs
- **Apply to Shipping:** Toggle for shipping discounts

### How It Works

1. Merchant creates a discount in Shopify Admin
2. UI extension renders configuration fields
3. Configuration stored in `$app:function-configuration` metafield
4. At checkout, Rust function reads metafield and applies discounts

## Testing

```bash
# Run type checking
npm run typecheck

# Run linting
npm run lint

# Test webhooks (in dev server)
shopify app webhook trigger --topic products/create
```

## Troubleshooting

### Database tables don't exist
```bash
npm run setup
```

### Rust build fails (Windows)
Ensure Microsoft C++ Build Tools are installed:
```bash
winget install Microsoft.VisualStudio.2022.BuildTools
```

### Webhooks not firing
Reinstall the app to register webhook subscriptions.

## Resources

- [Shopify App Documentation](https://shopify.dev/docs/apps)
- [React Router App Template](https://shopify.dev/docs/api/shopify-app-react-router)
- [Shopify Functions](https://shopify.dev/docs/apps/build/functions)
- [Polaris Web Components](https://polaris.shopify.com/components)

## License

MIT
