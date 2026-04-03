# Changelog

All notable changes to the Learn Shopify App will be documented in this file.

## [1.0.0] - 2026-04-03

### Added

#### Phase 1: Setup & Scaffolding
- React Router app template initialized
- Prisma + SQLite session storage
- Authentication flow configured
- Development environment setup

#### Phase 2: Core App Structure
- Product listing page with pagination
- Product detail/edit page with full CRUD
- GraphQL integration for product operations
- Polaris web components UI
- App Bridge integration (SaveBar, navigation)
- Form validation and error handling

#### Phase 3: Data Layer (Metafields & Metaobjects)
- Product metafields: material, care_instructions, rating
- Author metaobject with name, bio, avatar fields
- Size Chart metaobject with JSON data support
- Authors management UI (list, create, edit, delete)
- Size Charts management UI (list, create, edit, delete)
- Server models for metafield and metaobject operations

#### Phase 4: Theme App Extension
- Product reviews app block for storefront
- App embed for global widget loading
- CSS and JavaScript assets
- Configurable settings in theme editor
- Displays product metafields (rating, material, care instructions)
- Author info section (when linked via metaobject)
- Size chart display (when linked via metaobject)

#### Phase 5: Discount Functions (Rust)
- Rust discount function compiled to WASM
- Collection-based percentage discounts
- Supports product, order, and shipping discount classes
- Admin UI extension for discount configuration
- Metafield-based configuration storage
- Build tools setup (cargo-xwin for Windows)

#### Phase 6: Polish & Production
- Product webhooks (create/update/delete)
- Improved error handling across all routes
- Comprehensive README documentation
- Merchant user guide
- Production deployment configuration

### Technical Details

#### Dependencies
- `@shopify/shopify-app-react-router` ^1.1.0
- `@shopify/shopify-app-session-storage-prisma` ^8.0.0
- `@prisma/client` ^6.16.3
- `react-router` ^7.12.0
- `@shopify/app-bridge-react` ^4.2.4

#### Extensions
- `product-reviews` - Theme app extension
- `collection-discount-rs` - Rust discount function
- `collection-discount-ui` - Admin UI extension

#### API Version
- Admin API: 2026-04
- Webhooks: 2026-04

### Breaking Changes
- None

### Migration Notes
- Run `npm run setup` to create database tables
- Run `shopify app deploy` to sync extension configurations

---

## Previous Versions

Based on `@shopify/shopify-app-template-react-router` template.
See template changelog for base version history.
