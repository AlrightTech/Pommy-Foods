# Backend Implementation Plan - Admin Dashboard Order Management Module

## Overview
This document outlines the backend implementation plan for the Admin Dashboard's Order Management System (OMS) based on the Pommy Foods Requirements.

## Technology Stack
- **Framework**: Next.js 14 (App Router)
- **Database**: Supabase (PostgreSQL)
- **API**: Next.js API Routes (REST)
- **Language**: TypeScript

## Database Schema Analysis
The existing schema includes:
- `orders` table with status enum (draft, pending, approved, rejected, completed, cancelled)
- `order_items` table for order line items
- `store_stock` table for tracking store inventory
- `products` table with `min_stock_level` field
- `kitchen_sheets` and `kitchen_sheet_items` tables
- `deliveries` table
- `invoices` table
- `returns` table

## Implementation Plan

### Phase 1: Core Order Management APIs (Current Focus)

#### 1.1 Replenishment Order Generation Service
**File**: `lib/services/replenishment.ts`
- Monitor store stock levels
- Check if `current_stock < min_stock_level` (from products table)
- Auto-generate draft orders when threshold is breached
- Calculate replenishment quantity (suggested: bring stock to 2x min_stock_level)
- Prevent duplicate draft orders for same store/product combination

**API Endpoint**: `POST /api/admin/orders/generate-replenishment`
- Trigger manual replenishment check
- Returns list of generated draft orders

**Background Job**: Consider implementing a cron job or webhook trigger

#### 1.2 Enhanced Order Management API
**File**: `app/api/admin/orders/route.ts` (new admin-specific endpoint)
- GET: List orders with advanced filtering (status, store, date range, search)
- POST: Create manual orders (admin-initiated)
- Enhanced error handling and validation
- Include store credit limit checks
- Include order history and audit trail

**File**: `app/api/admin/orders/[id]/route.ts`
- GET: Get order details with full relationships
- PATCH: Update order (admin can modify items, quantities, prices)
- DELETE: Cancel/reject orders (soft delete with status change)

#### 1.3 Order Modification Service
**File**: `lib/services/order-modification.ts`
- Validate order can be modified (only draft/pending status)
- Recalculate totals when items change
- Track modification history
- Update order items atomically

#### 1.4 Enhanced Order Approval Workflow
**File**: `app/api/admin/orders/[id]/approve/route.ts` (enhance existing)
- Validate order can be approved
- Check store credit limit before approval
- Generate kitchen sheet automatically
- Generate delivery note automatically
- Update order status to 'approved'
- Send notification to store (future: email/push notification)

#### 1.5 Order Rejection API
**File**: `app/api/admin/orders/[id]/reject/route.ts` (new)
- Reject orders with reason
- Update status to 'rejected'
- Notify store owner
- Log rejection reason

### Phase 2: Store Stock Management

#### 2.1 Store Stock API
**File**: `app/api/admin/stores/[id]/stock/route.ts` (new)
- GET: Get all stock levels for a store
- POST: Update stock levels (bulk update)
- GET: Get stock alerts (products below threshold)

#### 2.2 Stock Monitoring Service
**File**: `lib/services/stock-monitoring.ts`
- Check all stores for low stock
- Generate replenishment suggestions
- Track stock movement history

### Phase 3: Kitchen Sheet & Delivery Management

#### 3.1 Kitchen Sheet API
**File**: `app/api/admin/kitchen-sheets/[id]/route.ts` (new)
- GET: Get kitchen sheet details
- PATCH: Update preparation status
- POST: Mark items as prepared

#### 3.2 Delivery Note API
**File**: `app/api/admin/deliveries/[id]/route.ts` (enhance existing)
- GET: Get delivery details
- PATCH: Update delivery status
- POST: Assign driver
- GET: Generate delivery note PDF (future)

### Phase 4: Invoice & Payment Integration

#### 4.1 Auto-Invoice Generation
**File**: `lib/services/invoice-generation.ts`
- Generate invoice after delivery completion
- Calculate final amount (subtract returns)
- Set due date based on payment terms
- Link to order and delivery

#### 4.2 Payment Processing
**File**: `app/api/admin/payments/route.ts` (enhance existing)
- Record cash payments
- Process direct debit payments
- Update invoice payment status
- Update store balance

### Phase 5: Analytics & Reporting

#### 5.1 Order Analytics
**File**: `app/api/admin/analytics/orders/route.ts` (new)
- Order volume by status
- Order value trends
- Average order value
- Order approval time metrics

#### 5.2 Stock Analytics
**File**: `app/api/admin/analytics/stock/route.ts` (new)
- Low stock alerts
- Stock turnover rates
- Replenishment frequency

## File Structure

```
app/api/admin/
├── orders/
│   ├── route.ts                    # List/Create orders
│   ├── [id]/
│   │   ├── route.ts                # Get/Update order
│   │   ├── approve/
│   │   │   └── route.ts            # Approve order
│   │   ├── reject/
│   │   │   └── route.ts            # Reject order
│   │   └── modify/
│   │       └── route.ts            # Modify order items
│   └── generate-replenishment/
│       └── route.ts                # Trigger replenishment
├── stores/
│   └── [id]/
│       └── stock/
│           └── route.ts            # Store stock management
└── kitchen-sheets/
    └── [id]/
        └── route.ts                # Kitchen sheet management

lib/
├── services/
│   ├── replenishment.ts            # Replenishment logic
│   ├── order-modification.ts       # Order modification logic
│   ├── stock-monitoring.ts         # Stock monitoring logic
│   └── invoice-generation.ts       # Invoice generation logic
└── utils/
    ├── order-validation.ts         # Order validation helpers
    └── order-calculations.ts       # Order calculation helpers

types/
└── orders.ts                       # Order-related TypeScript types
```

## Key Business Rules

1. **Replenishment Orders**:
   - Only generate when `current_stock < min_stock_level`
   - Generate in 'draft' status
   - Suggested quantity: `(min_stock_level * 2) - current_stock`
   - Don't generate if existing draft order exists for same store/product

2. **Order Approval**:
   - Only 'draft' or 'pending' orders can be approved
   - Check store credit limit: `current_balance + order_amount <= credit_limit`
   - Auto-generate kitchen sheet and delivery note
   - Update order status to 'approved'

3. **Order Modification**:
   - Only 'draft' or 'pending' orders can be modified
   - Recalculate totals automatically
   - Track modification history

4. **Order Status Transitions**:
   - draft → pending → approved → completed
   - draft → rejected
   - approved → cancelled (with reason)
   - Any status → cancelled (admin override)

5. **Stock Updates**:
   - When store updates stock, trigger replenishment check
   - Log stock update history
   - Validate stock levels (can't be negative)

## Error Handling Strategy

- Use try-catch blocks in all API routes
- Return consistent error response format: `{ error: string, details?: any }`
- Log errors with context for debugging
- Validate input data before database operations
- Use database transactions for multi-step operations

## Security Considerations

- Verify admin authentication/authorization
- Validate user permissions (admin role check)
- Sanitize input data
- Use parameterized queries (Supabase handles this)
- Rate limiting for API endpoints (future)

## Testing Strategy

- Unit tests for business logic services
- Integration tests for API endpoints
- Test order status transitions
- Test replenishment generation logic
- Test credit limit validation

## Next Steps

1. ✅ Create implementation plan (this document)
2. Implement replenishment order generation service
3. Enhance order management APIs
4. Implement order modification functionality
5. Enhance order approval workflow
6. Add order rejection functionality
7. Implement store stock management APIs
8. Add comprehensive error handling and validation

