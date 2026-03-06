# BookShop

BookShop is a modern, responsive e-commerce bookstore for browsing, purchasing, and managing a large catalog of physical books. Customers can register and log in, search and browse books, add to cart, complete Stripe checkout, track orders, leave reviews, and receive recommendations. Admins can manage inventory, templates, analytics, and SEO settings.

## Features
- Customer registration and login with JWT authentication
- Book catalog with search, filters, and detail pages
- Cart management and checkout initiation
- Orders, reviews, and recommendations
- Admin analytics, template management, and SEO tools
- Prisma ORM with SQLite for development

## Setup
```bash
cp .env.example .env
npm install
npm run dev
```

## Scripts
- `npm run dev` - Start development server
- `npm run build` - Generate Prisma client and build Next.js app
- `npm run start` - Start production server
- `npm run lint` - Lint codebase

## API Endpoints
- `GET /api/health`
- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`
- `GET /api/books`
- `GET /api/books/:id`
- `POST /api/admin/books`
- `PUT /api/admin/books/:id`
- `DELETE /api/admin/books/:id`
- `GET /api/cart`
- `POST /api/cart/items`
- `DELETE /api/cart/items/:itemId`
- `POST /api/checkout`
- `POST /api/webhooks/stripe`
- `GET /api/orders`
- `GET /api/orders/:id`
- `POST /api/books/:id/reviews`
- `GET /api/admin/analytics`
- `GET /api/recommendations`
- `GET /api/admin/templates`
- `PUT /api/admin/seo/:bookId`

## Notes
- Prisma uses SQLite in development. Update `DATABASE_URL` to switch to another database.
- Admin endpoints require a user with the `admin` role.
