# Pommy Foods - Order Management System

A comprehensive Order Management System (OMS) for Pommy Foods, built with Next.js 14, TypeScript, and Tailwind CSS. Features a retro-modern hybrid design system with a fully responsive admin panel.

## Features

- **Admin Dashboard**: Comprehensive dashboard with statistics, recent orders, and quick actions
- **Order Management**: View, filter, and manage orders from stores
- **Responsive Design**: Fully responsive across all devices (mobile, tablet, desktop)
- **Retro-Modern UI**: Unique design system combining fresh, modern aesthetics with nostalgic retro touches
- **Dark Mode**: Built-in dark mode support
- **TypeScript**: Full type safety throughout the application

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Database**: Supabase (PostgreSQL)
- **Deployment**: Vercel
- **CI/CD**: GitHub Actions
- **Icons**: Lucide React
- **Fonts**: Inter, Press Start 2P, JetBrains Mono

## Getting Started

### Prerequisites

- Node.js 18+ installed
- npm or yarn package manager
- Supabase account (for database)
- Vercel account (for deployment)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd pommy-foods
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp env.example .env.local
```

4. Fill in your Supabase credentials in `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

5. Run database migrations (see [Supabase Setup](#supabase-setup))

6. Run the development server:
```bash
npm run dev
```

7. Open [http://localhost:3000](http://localhost:3000) in your browser

The application will automatically redirect to `/admin/dashboard`.

### Supabase Setup

See [supabase/README.md](supabase/README.md) for detailed database setup instructions.

Quick start:
```bash
# Install Supabase CLI
npm install -g supabase

# Login
supabase login

# Start local Supabase
supabase start

# Run migrations
supabase db reset
```

### Deployment

See [DEPLOYMENT.md](DEPLOYMENT.md) for complete deployment guide to Vercel.

## Project Structure

```
├── app/
│   ├── admin/              # Admin panel pages
│   │   ├── dashboard/      # Dashboard page
│   │   ├── orders/         # Orders management
│   │   ├── products/       # Products management
│   │   ├── stores/         # Stores management
│   │   ├── deliveries/     # Deliveries tracking
│   │   ├── payments/       # Payments & invoices
│   │   ├── analytics/      # Analytics & reports
│   │   ├── settings/       # Settings page
│   │   └── layout.tsx      # Admin layout with sidebar
│   ├── globals.css         # Global styles
│   ├── layout.tsx          # Root layout
│   └── page.tsx            # Home page (redirects to admin)
├── components/
│   ├── admin/              # Admin-specific components
│   │   ├── Sidebar.tsx     # Navigation sidebar
│   │   ├── Header.tsx      # Top header with search
│   │   └── StatCard.tsx    # Statistics card component
│   └── ui/                 # Reusable UI components
│       ├── Button.tsx      # Button component
│       ├── Card.tsx        # Card component
│       └── Badge.tsx       # Badge/status component
├── lib/
│   └── utils.ts            # Utility functions
├── tailwind.config.ts      # Tailwind configuration
└── Design Guidelines.md    # Complete design system documentation
```

## Design System

The project follows a comprehensive design system documented in `Design Guidelines.md`. Key features:

- **Color Palette**: Custom tan/amber primary colors with full semantic color system
- **Typography**: Retro-modern font pairing (Press Start 2P + Inter)
- **Components**: Consistent, reusable UI components
- **Responsive**: Mobile-first approach with breakpoints
- **Accessibility**: WCAG AA compliant color contrasts and keyboard navigation

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## Database

The application uses Supabase (PostgreSQL) as the database. Key features:

- **Row Level Security (RLS)**: Secure data access based on user roles
- **Migrations**: Version-controlled database schema
- **Real-time**: Built-in real-time subscriptions (if needed)
- **Authentication**: Integrated with Supabase Auth

See [supabase/README.md](supabase/README.md) for database documentation.

## CI/CD Pipeline

The project includes automated CI/CD pipelines:

- **GitHub Actions**: Automated testing, linting, and deployment
- **Vercel Integration**: Automatic deployments on push to main
- **Database Migrations**: Automated migration runs on deployment

See [DEPLOYMENT.md](DEPLOYMENT.md) for setup instructions.

## Admin Panel Pages

### Dashboard (`/admin/dashboard`)
- Overview statistics (orders, revenue, products, pending approvals)
- Recent orders table
- Quick actions panel

### Orders (`/admin/orders`)
- Complete orders list with filtering and search
- Order status badges
- Actions (view, approve, reject)

### Other Pages
- Products, Stores, Deliveries, Payments, Analytics, Settings (coming soon)

## Responsive Breakpoints

- **Mobile**: < 640px
- **Tablet**: 640px - 1024px
- **Desktop**: > 1024px

The sidebar is hidden on mobile and accessible via hamburger menu.

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## License

Private project for Pommy Foods.

## Development Notes

- All components are fully typed with TypeScript
- Dark mode is enabled by default (can be toggled in future updates)
- The design system is fully documented in `Design Guidelines.md`
- All UI components follow the retro-modern hybrid design philosophy

