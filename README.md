# Pommy Foods - Digital Distribution System

A comprehensive Order Management System (OMS) built with Next.js 14, TypeScript, Prisma, and PostgreSQL.

## Features

- **Order Management System (OMS)**
  - Admin dashboard for order approval and management
  - Customer portal for stores and restaurants
  - Auto-replenishment based on stock thresholds
  - Order approval workflow

- **Kitchen Module**
  - Auto-generated kitchen sheets
  - Batch and expiry-date tracking
  - Barcode/QR code labeling

- **Delivery Management**
  - Delivery scheduling and route optimization
  - Returns handling for expired items
  - Invoice auto-adjustment

- **Driver Mobile App**
  - GPS tracking and route guidance
  - Proof of delivery (e-signature/photo)
  - Temperature logging
  - Payment collection tracking

- **Payments & Invoicing**
  - Auto-generate invoices
  - Multiple payment methods (Cash, Direct Debit, Online)
  - Credit management

- **Analytics & Reporting**
  - Sales reports by product, store, region
  - Stock insights and wastage tracking
  - Delivery performance metrics

## Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Database:** PostgreSQL (via Prisma ORM)
- **Styling:** Tailwind CSS
- **Authentication:** JWT with bcrypt
- **Validation:** Zod

## Prerequisites

- Node.js 18+ 
- PostgreSQL database
- npm or yarn

## Installation

1. **Clone and install dependencies:**
   ```bash
   npm install
   ```

2. **Set up environment variables:**
   Create a `.env.local` file in the root directory:
   ```env
   DATABASE_URL="postgresql://user:password@localhost:5432/pommy_foods?schema=public"
   JWT_SECRET="your-super-secret-jwt-key-change-in-production"
   NEXTAUTH_SECRET="your-nextauth-secret-change-in-production"
   NEXTAUTH_URL="http://localhost:3000"
   NODE_ENV="development"
   UPLOAD_MAX_SIZE="10485760"
   ```

3. **Set up the database:**
   ```bash
   # Generate Prisma Client
   npm run db:generate
   
   # Push schema to database
   npm run db:push
   
   # Or use migrations
   npm run db:migrate
   ```

4. **Run the development server:**
   ```bash
   npm run dev
   ```

5. **Open your browser:**
   Navigate to [http://localhost:3000](http://localhost:3000)

## Project Structure

```
├── prisma/
│   └── schema.prisma          # Database schema
├── src/
│   ├── app/
│   │   ├── (admin)/          # Admin portal routes
│   │   ├── (customer)/       # Customer/Store portal routes
│   │   ├── (driver)/         # Driver app routes
│   │   ├── api/              # API routes
│   │   ├── login/            # Login page
│   │   ├── layout.tsx        # Root layout
│   │   └── page.tsx          # Home page
│   ├── components/           # React components
│   ├── lib/
│   │   ├── prisma.ts         # Prisma client instance
│   │   ├── auth.ts           # Authentication utilities
│   │   └── utils.ts          # Utility functions
│   ├── types/                # TypeScript type definitions
│   └── middleware.ts         # Route protection middleware
├── .env.example              # Environment variables template
└── package.json
```

## Database Models

- **User** - System users (Admin, Store Owner, Driver)
- **Store** - Convenience stores and restaurants
- **Product** - Pommy food products catalog
- **StockLevel** - Store's current stock levels
- **Order** - Customer orders with approval workflow
- **OrderItem** - Individual items in orders
- **KitchenSheet** - Auto-generated kitchen preparation sheets
- **KitchenSheetItem** - Items in kitchen sheets with barcode tracking
- **Delivery** - Delivery assignments and tracking
- **Driver** - Driver profile information
- **TemperatureLog** - Food safety temperature records
- **Return** - Returned expired items
- **ReturnItem** - Items in returns
- **Invoice** - Generated invoices
- **Payment** - Payment records

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run db:generate` - Generate Prisma Client
- `npm run db:push` - Push schema changes to database
- `npm run db:migrate` - Run database migrations
- `npm run db:studio` - Open Prisma Studio

## Portals

### Admin Portal (`/admin`)
- Dashboard with overview statistics
- Order management and approval
- Product catalog management
- Store and user management
- Analytics and reports

### Customer Portal (`/customer`)
- Store dashboard
- Browse product catalog
- Place orders
- Update stock levels
- View order history and invoices

### Driver App (`/driver`)
- View assigned deliveries
- GPS tracking and navigation
- Record proof of delivery
- Log temperature readings
- Handle returns
- Record payment collection

## Development Notes

- All API routes are protected by middleware
- Authentication uses JWT tokens stored in HTTP-only cookies
- Role-based access control (RBAC) is implemented
- Database uses Prisma ORM for type-safe database access

## Next Steps

1. Set up your database connection
2. Create initial admin user (seed script or manual)
3. Implement authentication UI
4. Build out admin dashboard features
5. Implement customer portal
6. Develop driver mobile interface
7. Add payment gateway integration
8. Implement analytics and reporting

## Deployment

### Vercel Deployment

This project is configured for deployment on Vercel with CI/CD pipeline.

**Quick Setup:**
1. Follow the [VERCEL_SETUP.md](./VERCEL_SETUP.md) guide for step-by-step instructions
2. For detailed deployment information, see [DEPLOYMENT.md](./DEPLOYMENT.md)

**Key Features:**
- Automated CI/CD with GitHub Actions
- Automatic deployments on push to main branch
- Preview deployments for pull requests
- Database migrations via GitHub Actions
- Environment variable management

**Prerequisites:**
- GitHub repository
- Vercel account
- PostgreSQL database

## CI/CD Pipeline

The project includes GitHub Actions workflows for:

- **Automated Testing**: Linting and TypeScript checks
- **Automated Builds**: Verify application compiles
- **Preview Deployments**: Auto-deploy PRs to Vercel preview
- **Production Deployments**: Auto-deploy main branch to production
- **Database Migrations**: Automated Prisma migrations

See [.github/workflows/README.md](./.github/workflows/README.md) for workflow details.

## License

Private project - Pommy Foods

