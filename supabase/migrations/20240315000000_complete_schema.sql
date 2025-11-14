-- ============================================================================
-- COMPLETE DATABASE SCHEMA FOR POMMY FOODS OMS
-- ============================================================================
-- This migration creates the complete database schema for the Pommy Foods
-- Order Management System (OMS) based on all project requirements.
-- ============================================================================

-- ============================================================================
-- SECTION 1: DROP ALL EXISTING OBJECTS
-- ============================================================================
-- Drop in reverse dependency order (child tables first, then parent tables)

-- Note: Triggers are automatically dropped when tables are dropped with CASCADE
-- No need to drop them separately

-- Drop all tables (child tables first)
DROP TABLE IF EXISTS barcode_labels CASCADE;
DROP TABLE IF EXISTS delivery_signatures CASCADE;
DROP TABLE IF EXISTS gps_tracking CASCADE;
DROP TABLE IF EXISTS temperature_logs CASCADE;
DROP TABLE IF EXISTS kitchen_sheet_items CASCADE;
DROP TABLE IF EXISTS kitchen_sheets CASCADE;
DROP TABLE IF EXISTS returns CASCADE;
DROP TABLE IF EXISTS delivery_notes CASCADE;
DROP TABLE IF EXISTS deliveries CASCADE;
DROP TABLE IF EXISTS delivery_routes CASCADE;
DROP TABLE IF EXISTS payment_reminders CASCADE;
DROP TABLE IF EXISTS payments CASCADE;
DROP TABLE IF EXISTS invoices CASCADE;
DROP TABLE IF EXISTS order_items CASCADE;
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS replenishment_rules CASCADE;
DROP TABLE IF EXISTS store_stock CASCADE;
DROP TABLE IF EXISTS notifications CASCADE;
DROP TABLE IF EXISTS user_profiles CASCADE;
DROP TABLE IF EXISTS products CASCADE;
DROP TABLE IF EXISTS stores CASCADE;

-- Drop all functions
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;
DROP FUNCTION IF EXISTS generate_order_number() CASCADE;
DROP FUNCTION IF EXISTS generate_invoice_number() CASCADE;
DROP FUNCTION IF EXISTS check_replenishment() CASCADE;
DROP FUNCTION IF EXISTS assign_admin_role(UUID, TEXT, TEXT) CASCADE;
DROP FUNCTION IF EXISTS create_admin_profile(UUID, TEXT, TEXT) CASCADE;

-- Drop all enum types
DROP TYPE IF EXISTS order_status CASCADE;
DROP TYPE IF EXISTS payment_status CASCADE;
DROP TYPE IF EXISTS payment_method CASCADE;
DROP TYPE IF EXISTS delivery_status CASCADE;
DROP TYPE IF EXISTS user_role CASCADE;
DROP TYPE IF EXISTS order_type CASCADE;
DROP TYPE IF EXISTS notification_type CASCADE;
DROP TYPE IF EXISTS notification_status CASCADE;
DROP TYPE IF EXISTS temperature_source CASCADE;

-- ============================================================================
-- SECTION 2: ENABLE EXTENSIONS
-- ============================================================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================================
-- SECTION 3: CREATE ENUM TYPES
-- ============================================================================

-- Order status enum
CREATE TYPE order_status AS ENUM ('draft', 'pending', 'approved', 'rejected', 'completed', 'cancelled');

-- Payment status enum
CREATE TYPE payment_status AS ENUM ('pending', 'paid', 'overdue', 'cancelled');

-- Payment method enum
CREATE TYPE payment_method AS ENUM ('cash', 'direct_debit', 'online');

-- Delivery status enum
CREATE TYPE delivery_status AS ENUM ('pending', 'assigned', 'in_transit', 'delivered', 'returned', 'failed');

-- User role enum
CREATE TYPE user_role AS ENUM ('admin', 'store_owner', 'driver', 'kitchen_staff');

-- Order type enum (manual vs auto-generated)
CREATE TYPE order_type AS ENUM ('manual', 'auto_generated');

-- Notification type enum
CREATE TYPE notification_type AS ENUM ('order_approved', 'order_rejected', 'delivery_assigned', 'payment_reminder', 'stock_low', 'system');

-- Notification status enum
CREATE TYPE notification_status AS ENUM ('unread', 'read', 'archived');

-- Temperature source enum (manual entry vs IoT sensor)
CREATE TYPE temperature_source AS ENUM ('manual', 'iot_sensor');

-- ============================================================================
-- SECTION 4: CORE TABLES
-- ============================================================================

-- Stores table
-- Represents convenience stores and restaurants that order Pommy products
CREATE TABLE stores (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(50),
  address TEXT,
  city VARCHAR(100),
  state VARCHAR(100),
  zip_code VARCHAR(20),
  region VARCHAR(100), -- For analytics by region
  latitude DECIMAL(10, 8), -- GPS coordinates for route optimization
  longitude DECIMAL(11, 8), -- GPS coordinates for route optimization
  credit_limit DECIMAL(10, 2) DEFAULT 0,
  current_balance DECIMAL(10, 2) DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Products table
-- Product catalog for Pommy Foods
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  sku VARCHAR(100) UNIQUE NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  cost DECIMAL(10, 2),
  unit VARCHAR(50) DEFAULT 'unit',
  category VARCHAR(100),
  is_active BOOLEAN DEFAULT true,
  min_stock_level INTEGER DEFAULT 0, -- Global minimum stock level
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Orders table
-- Customer orders (both manual and auto-generated replenishment orders)
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_number VARCHAR(50) UNIQUE NOT NULL,
  store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  status order_status DEFAULT 'draft',
  order_type order_type DEFAULT 'manual', -- manual or auto_generated
  is_replenishment BOOLEAN DEFAULT false, -- True if generated by replenishment rules
  total_amount DECIMAL(10, 2) NOT NULL DEFAULT 0,
  discount_amount DECIMAL(10, 2) DEFAULT 0,
  final_amount DECIMAL(10, 2) NOT NULL DEFAULT 0,
  notes TEXT,
  created_by UUID, -- User who created the order (store owner or system)
  approved_by UUID, -- Admin who approved the order
  approved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Order items table
-- Items in each order
CREATE TABLE order_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL,
  unit_price DECIMAL(10, 2) NOT NULL,
  total_price DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Store stock levels table
-- Current stock levels for each product at each store
CREATE TABLE store_stock (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  current_stock INTEGER NOT NULL DEFAULT 0,
  replenishment_threshold INTEGER NOT NULL DEFAULT 0, -- Threshold for auto-generating orders
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_by UUID, -- User who last updated the stock
  UNIQUE(store_id, product_id)
);

-- ============================================================================
-- SECTION 5: REPLENISHMENT AND AUTO-ORDER TABLES
-- ============================================================================

-- Replenishment rules table
-- Store-specific rules for auto-generating replenishment orders
CREATE TABLE replenishment_rules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  threshold INTEGER NOT NULL DEFAULT 0, -- Stock level that triggers replenishment
  reorder_quantity INTEGER NOT NULL DEFAULT 0, -- Quantity to order when threshold is reached
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(store_id, product_id)
);

-- ============================================================================
-- SECTION 6: DELIVERY MANAGEMENT TABLES
-- ============================================================================

-- Delivery routes table
-- Routes for optimizing multiple deliveries
CREATE TABLE delivery_routes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  route_name VARCHAR(255),
  driver_id UUID, -- Assigned driver
  scheduled_date DATE NOT NULL,
  start_location_latitude DECIMAL(10, 8),
  start_location_longitude DECIMAL(11, 8),
  end_location_latitude DECIMAL(10, 8),
  end_location_longitude DECIMAL(11, 8),
  estimated_duration_minutes INTEGER,
  actual_duration_minutes INTEGER,
  status VARCHAR(50) DEFAULT 'planned', -- planned, in_progress, completed
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Deliveries table (enhanced)
-- Delivery tracking with route and GPS support
CREATE TABLE deliveries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  route_id UUID REFERENCES delivery_routes(id) ON DELETE SET NULL,
  driver_id UUID,
  status delivery_status DEFAULT 'pending',
  scheduled_date DATE,
  delivered_at TIMESTAMP WITH TIME ZONE,
  delivery_latitude DECIMAL(10, 8), -- GPS coordinates at delivery location
  delivery_longitude DECIMAL(11, 8), -- GPS coordinates at delivery location
  proof_of_delivery_url TEXT, -- Photo URL
  e_signature_url TEXT, -- E-signature URL
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Delivery notes table
-- Auto-generated delivery notes separate from delivery records
CREATE TABLE delivery_notes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  delivery_id UUID NOT NULL REFERENCES deliveries(id) ON DELETE CASCADE,
  note_number VARCHAR(50) UNIQUE NOT NULL,
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  driver_id UUID,
  generated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  printed_at TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- GPS tracking table
-- Real-time GPS coordinates for drivers and deliveries
CREATE TABLE gps_tracking (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  delivery_id UUID REFERENCES deliveries(id) ON DELETE CASCADE,
  driver_id UUID,
  latitude DECIMAL(10, 8) NOT NULL,
  longitude DECIMAL(11, 8) NOT NULL,
  accuracy DECIMAL(8, 2), -- GPS accuracy in meters
  speed DECIMAL(8, 2), -- Speed in km/h
  heading DECIMAL(5, 2), -- Direction in degrees
  recorded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Delivery signatures table
-- E-signatures for proof of delivery
CREATE TABLE delivery_signatures (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  delivery_id UUID NOT NULL REFERENCES deliveries(id) ON DELETE CASCADE,
  signature_data TEXT NOT NULL, -- Base64 encoded signature data
  signer_name VARCHAR(255),
  signer_email VARCHAR(255),
  signed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  ip_address VARCHAR(45), -- IPv4 or IPv6 address
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- SECTION 7: KITCHEN AND LABELING TABLES
-- ============================================================================

-- Kitchen sheets table
-- Auto-generated kitchen preparation sheets
CREATE TABLE kitchen_sheets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  sheet_number VARCHAR(50) UNIQUE NOT NULL,
  prepared_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  prepared_by UUID, -- Kitchen staff member
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Kitchen sheet items table (enhanced with barcode/QR)
-- Items to prepare with batch and expiry tracking
CREATE TABLE kitchen_sheet_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  kitchen_sheet_id UUID NOT NULL REFERENCES kitchen_sheets(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL,
  batch_number VARCHAR(100),
  expiry_date DATE,
  barcode VARCHAR(255), -- Barcode for packed items
  qr_code VARCHAR(255), -- QR code for packed items
  prepared BOOLEAN DEFAULT false,
  prepared_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Barcode labels table
-- Track all barcode/QR codes generated for kitchen items
CREATE TABLE barcode_labels (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  kitchen_sheet_item_id UUID NOT NULL REFERENCES kitchen_sheet_items(id) ON DELETE CASCADE,
  barcode VARCHAR(255) UNIQUE NOT NULL,
  qr_code VARCHAR(255) UNIQUE,
  label_type VARCHAR(50) DEFAULT 'barcode', -- barcode, qr_code, or both
  generated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  printed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- SECTION 8: RETURNS AND COMPLIANCE TABLES
-- ============================================================================

-- Returns table (enhanced)
-- Expired/unsold item returns with better tracking
CREATE TABLE returns (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  delivery_id UUID NOT NULL REFERENCES deliveries(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL,
  batch_number VARCHAR(100), -- Batch number of returned items
  expiry_date DATE, -- Expiry date of returned items
  reason VARCHAR(255) DEFAULT 'expired', -- expired, damaged, unsold
  returned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  returned_by UUID, -- Driver who collected the return
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Temperature logs table
-- Temperature readings for food safety compliance (manual + IoT)
CREATE TABLE temperature_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  delivery_id UUID REFERENCES deliveries(id) ON DELETE SET NULL,
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  temperature_reading DECIMAL(5, 2) NOT NULL, -- Temperature in Celsius
  source temperature_source NOT NULL, -- manual or iot_sensor
  sensor_id VARCHAR(100), -- IoT sensor ID if applicable
  location VARCHAR(255), -- Location where reading was taken (fridge, freezer, truck, etc.)
  recorded_by UUID, -- User who recorded (driver for manual entries)
  recorded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- SECTION 9: FINANCIAL TABLES
-- ============================================================================

-- Invoices table
-- Auto-generated invoices after delivery
CREATE TABLE invoices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  invoice_number VARCHAR(50) UNIQUE NOT NULL,
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  subtotal DECIMAL(10, 2) NOT NULL,
  discount_amount DECIMAL(10, 2) DEFAULT 0,
  return_amount DECIMAL(10, 2) DEFAULT 0, -- Amount deducted for returns
  total_amount DECIMAL(10, 2) NOT NULL,
  due_date DATE,
  payment_status payment_status DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Payments table (enhanced)
-- Payment records with reminder tracking
CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  invoice_id UUID REFERENCES invoices(id) ON DELETE SET NULL,
  amount DECIMAL(10, 2) NOT NULL,
  payment_method payment_method NOT NULL,
  payment_status payment_status DEFAULT 'pending',
  transaction_id VARCHAR(255), -- Bank transaction ID or payment gateway ID
  payment_date TIMESTAMP WITH TIME ZONE,
  proof_url TEXT, -- Receipt/photo URL for cash payments
  collected_by UUID, -- Driver who collected cash payment
  reminder_sent_at TIMESTAMP WITH TIME ZONE, -- When payment reminder was sent
  overdue_days INTEGER DEFAULT 0, -- Days overdue if payment is late
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Payment reminders table
-- Credit management and overdue payment tracking
CREATE TABLE payment_reminders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
  store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  reminder_type VARCHAR(50) DEFAULT 'overdue', -- overdue, approaching_due_date, final_notice
  days_overdue INTEGER DEFAULT 0,
  sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  sent_to_email VARCHAR(255),
  sent_by UUID, -- Admin who sent the reminder
  message TEXT,
  is_sent BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- SECTION 10: USER AND NOTIFICATION TABLES
-- ============================================================================

-- User profiles table
-- Extends Supabase auth.users with role and store association
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email VARCHAR(255) NOT NULL,
  full_name VARCHAR(255),
  role user_role NOT NULL,
  store_id UUID REFERENCES stores(id) ON DELETE SET NULL,
  phone VARCHAR(50),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Notifications table
-- System notifications for stores, admins, drivers, etc.
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  store_id UUID REFERENCES stores(id) ON DELETE CASCADE,
  notification_type notification_type NOT NULL,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  status notification_status DEFAULT 'unread',
  related_order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
  related_delivery_id UUID REFERENCES deliveries(id) ON DELETE SET NULL,
  related_invoice_id UUID REFERENCES invoices(id) ON DELETE SET NULL,
  read_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- SECTION 11: INDEXES FOR PERFORMANCE
-- ============================================================================

-- Stores indexes
CREATE INDEX idx_stores_region ON stores(region);
CREATE INDEX idx_stores_city ON stores(city);
CREATE INDEX idx_stores_is_active ON stores(is_active);
CREATE INDEX idx_stores_location ON stores(latitude, longitude); -- For geographic queries

-- Products indexes
CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_products_sku ON products(sku);
CREATE INDEX idx_products_is_active ON products(is_active);

-- Orders indexes
CREATE INDEX idx_orders_store_id ON orders(store_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_order_type ON orders(order_type);
CREATE INDEX idx_orders_is_replenishment ON orders(is_replenishment);
CREATE INDEX idx_orders_created_at ON orders(created_at);
CREATE INDEX idx_orders_approved_at ON orders(approved_at);
CREATE INDEX idx_orders_created_by ON orders(created_by);
CREATE INDEX idx_orders_approved_by ON orders(approved_by);

-- Order items indexes
CREATE INDEX idx_order_items_order_id ON order_items(order_id);
CREATE INDEX idx_order_items_product_id ON order_items(product_id);

-- Store stock indexes
CREATE INDEX idx_store_stock_store_id ON store_stock(store_id);
CREATE INDEX idx_store_stock_product_id ON store_stock(product_id);
CREATE INDEX idx_store_stock_threshold ON store_stock(current_stock, replenishment_threshold); -- For replenishment checks

-- Replenishment rules indexes
CREATE INDEX idx_replenishment_rules_store_id ON replenishment_rules(store_id);
CREATE INDEX idx_replenishment_rules_product_id ON replenishment_rules(product_id);
CREATE INDEX idx_replenishment_rules_is_active ON replenishment_rules(is_active);

-- Delivery routes indexes
CREATE INDEX idx_delivery_routes_driver_id ON delivery_routes(driver_id);
CREATE INDEX idx_delivery_routes_scheduled_date ON delivery_routes(scheduled_date);
CREATE INDEX idx_delivery_routes_status ON delivery_routes(status);

-- Deliveries indexes
CREATE INDEX idx_deliveries_order_id ON deliveries(order_id);
CREATE INDEX idx_deliveries_route_id ON deliveries(route_id);
CREATE INDEX idx_deliveries_driver_id ON deliveries(driver_id);
CREATE INDEX idx_deliveries_status ON deliveries(status);
CREATE INDEX idx_deliveries_scheduled_date ON deliveries(scheduled_date);

-- Delivery notes indexes
CREATE INDEX idx_delivery_notes_delivery_id ON delivery_notes(delivery_id);
CREATE INDEX idx_delivery_notes_order_id ON delivery_notes(order_id);
CREATE INDEX idx_delivery_notes_store_id ON delivery_notes(store_id);
CREATE INDEX idx_delivery_notes_driver_id ON delivery_notes(driver_id);

-- GPS tracking indexes
CREATE INDEX idx_gps_tracking_delivery_id ON gps_tracking(delivery_id);
CREATE INDEX idx_gps_tracking_driver_id ON gps_tracking(driver_id);
CREATE INDEX idx_gps_tracking_recorded_at ON gps_tracking(recorded_at);
CREATE INDEX idx_gps_tracking_location ON gps_tracking(latitude, longitude); -- For geographic queries

-- Delivery signatures indexes
CREATE INDEX idx_delivery_signatures_delivery_id ON delivery_signatures(delivery_id);
CREATE INDEX idx_delivery_signatures_signed_at ON delivery_signatures(signed_at);

-- Kitchen sheets indexes
CREATE INDEX idx_kitchen_sheets_order_id ON kitchen_sheets(order_id);
CREATE INDEX idx_kitchen_sheets_prepared_by ON kitchen_sheets(prepared_by);
CREATE INDEX idx_kitchen_sheets_created_at ON kitchen_sheets(created_at);

-- Kitchen sheet items indexes
CREATE INDEX idx_kitchen_sheet_items_kitchen_sheet_id ON kitchen_sheet_items(kitchen_sheet_id);
CREATE INDEX idx_kitchen_sheet_items_product_id ON kitchen_sheet_items(product_id);
CREATE INDEX idx_kitchen_sheet_items_batch_number ON kitchen_sheet_items(batch_number);
CREATE INDEX idx_kitchen_sheet_items_expiry_date ON kitchen_sheet_items(expiry_date);
CREATE INDEX idx_kitchen_sheet_items_barcode ON kitchen_sheet_items(barcode);
CREATE INDEX idx_kitchen_sheet_items_qr_code ON kitchen_sheet_items(qr_code);

-- Barcode labels indexes
CREATE INDEX idx_barcode_labels_kitchen_sheet_item_id ON barcode_labels(kitchen_sheet_item_id);
CREATE INDEX idx_barcode_labels_barcode ON barcode_labels(barcode);
CREATE INDEX idx_barcode_labels_qr_code ON barcode_labels(qr_code);

-- Returns indexes
CREATE INDEX idx_returns_delivery_id ON returns(delivery_id);
CREATE INDEX idx_returns_product_id ON returns(product_id);
CREATE INDEX idx_returns_batch_number ON returns(batch_number);
CREATE INDEX idx_returns_expiry_date ON returns(expiry_date);
CREATE INDEX idx_returns_reason ON returns(reason);
CREATE INDEX idx_returns_returned_at ON returns(returned_at);

-- Temperature logs indexes
CREATE INDEX idx_temperature_logs_delivery_id ON temperature_logs(delivery_id);
CREATE INDEX idx_temperature_logs_product_id ON temperature_logs(product_id);
CREATE INDEX idx_temperature_logs_source ON temperature_logs(source);
CREATE INDEX idx_temperature_logs_recorded_at ON temperature_logs(recorded_at);
CREATE INDEX idx_temperature_logs_sensor_id ON temperature_logs(sensor_id);

-- Invoices indexes
CREATE INDEX idx_invoices_order_id ON invoices(order_id);
CREATE INDEX idx_invoices_store_id ON invoices(store_id);
CREATE INDEX idx_invoices_payment_status ON invoices(payment_status);
CREATE INDEX idx_invoices_due_date ON invoices(due_date);
CREATE INDEX idx_invoices_created_at ON invoices(created_at);

-- Payments indexes
CREATE INDEX idx_payments_order_id ON payments(order_id);
CREATE INDEX idx_payments_invoice_id ON payments(invoice_id);
CREATE INDEX idx_payments_payment_method ON payments(payment_method);
CREATE INDEX idx_payments_payment_status ON payments(payment_status);
CREATE INDEX idx_payments_payment_date ON payments(payment_date);
CREATE INDEX idx_payments_collected_by ON payments(collected_by);

-- Payment reminders indexes
CREATE INDEX idx_payment_reminders_invoice_id ON payment_reminders(invoice_id);
CREATE INDEX idx_payment_reminders_store_id ON payment_reminders(store_id);
CREATE INDEX idx_payment_reminders_sent_at ON payment_reminders(sent_at);
CREATE INDEX idx_payment_reminders_is_sent ON payment_reminders(is_sent);

-- User profiles indexes
CREATE INDEX idx_user_profiles_store_id ON user_profiles(store_id);
CREATE INDEX idx_user_profiles_role ON user_profiles(role);
CREATE INDEX idx_user_profiles_is_active ON user_profiles(is_active);

-- Notifications indexes
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_store_id ON notifications(store_id);
CREATE INDEX idx_notifications_type ON notifications(notification_type);
CREATE INDEX idx_notifications_status ON notifications(status);
CREATE INDEX idx_notifications_created_at ON notifications(created_at);
CREATE INDEX idx_notifications_related_order_id ON notifications(related_order_id);

-- ============================================================================
-- SECTION 12: TRIGGER FUNCTIONS
-- ============================================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at triggers to all tables with updated_at column
CREATE TRIGGER update_stores_updated_at BEFORE UPDATE ON stores
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_replenishment_rules_updated_at BEFORE UPDATE ON replenishment_rules
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_delivery_routes_updated_at BEFORE UPDATE ON delivery_routes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_deliveries_updated_at BEFORE UPDATE ON deliveries
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_kitchen_sheets_updated_at BEFORE UPDATE ON kitchen_sheets
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_payments_updated_at BEFORE UPDATE ON payments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_invoices_updated_at BEFORE UPDATE ON invoices
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_payment_reminders_updated_at BEFORE UPDATE ON payment_reminders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON user_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_notifications_updated_at BEFORE UPDATE ON notifications
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- SECTION 13: HELPER FUNCTIONS
-- ============================================================================

-- Function to generate unique order numbers
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TEXT AS $$
DECLARE
  new_order_number TEXT;
  order_count INTEGER;
BEGIN
  -- Format: ORD-YYYYMMDD-XXXXX (e.g., ORD-20240315-00001)
  SELECT COUNT(*) + 1 INTO order_count
  FROM orders
  WHERE DATE(created_at) = CURRENT_DATE;
  
  new_order_number := 'ORD-' || TO_CHAR(CURRENT_DATE, 'YYYYMMDD') || '-' || LPAD(order_count::TEXT, 5, '0');
  
  -- Ensure uniqueness
  WHILE EXISTS (SELECT 1 FROM orders WHERE order_number = new_order_number) LOOP
    order_count := order_count + 1;
    new_order_number := 'ORD-' || TO_CHAR(CURRENT_DATE, 'YYYYMMDD') || '-' || LPAD(order_count::TEXT, 5, '0');
  END LOOP;
  
  RETURN new_order_number;
END;
$$ LANGUAGE plpgsql;

-- Function to generate unique invoice numbers
CREATE OR REPLACE FUNCTION generate_invoice_number()
RETURNS TEXT AS $$
DECLARE
  new_invoice_number TEXT;
  invoice_count INTEGER;
BEGIN
  -- Format: INV-YYYYMMDD-XXXXX (e.g., INV-20240315-00001)
  SELECT COUNT(*) + 1 INTO invoice_count
  FROM invoices
  WHERE DATE(created_at) = CURRENT_DATE;
  
  new_invoice_number := 'INV-' || TO_CHAR(CURRENT_DATE, 'YYYYMMDD') || '-' || LPAD(invoice_count::TEXT, 5, '0');
  
  -- Ensure uniqueness
  WHILE EXISTS (SELECT 1 FROM invoices WHERE invoice_number = new_invoice_number) LOOP
    invoice_count := invoice_count + 1;
    new_invoice_number := 'INV-' || TO_CHAR(CURRENT_DATE, 'YYYYMMDD') || '-' || LPAD(invoice_count::TEXT, 5, '0');
  END LOOP;
  
  RETURN new_invoice_number;
END;
$$ LANGUAGE plpgsql;

-- Function to check if replenishment order should be generated
-- Returns true if stock is below threshold
CREATE OR REPLACE FUNCTION check_replenishment(p_store_id UUID, p_product_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  current_stock INTEGER;
  threshold INTEGER;
BEGIN
  SELECT ss.current_stock, COALESCE(rr.threshold, ss.replenishment_threshold, 0)
  INTO current_stock, threshold
  FROM store_stock ss
  LEFT JOIN replenishment_rules rr ON rr.store_id = ss.store_id AND rr.product_id = ss.product_id AND rr.is_active = true
  WHERE ss.store_id = p_store_id AND ss.product_id = p_product_id;
  
  -- Return true if stock is below threshold
  RETURN COALESCE(current_stock, 0) < COALESCE(threshold, 0);
END;
$$ LANGUAGE plpgsql;

-- Function to create admin user profile
-- Use this after creating a user in Supabase Authentication Dashboard
CREATE OR REPLACE FUNCTION create_admin_profile(
  p_user_id UUID,
  p_email TEXT,
  p_full_name TEXT DEFAULT 'Admin User'
)
RETURNS void AS $$
BEGIN
  INSERT INTO user_profiles (id, email, full_name, role, is_active, created_at, updated_at)
  VALUES (
    p_user_id,
    p_email,
    p_full_name,
    'admin',
    true,
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO UPDATE 
  SET 
    role = 'admin',
    email = EXCLUDED.email,
    full_name = EXCLUDED.full_name,
    is_active = true,
    updated_at = NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission on admin functions
GRANT EXECUTE ON FUNCTION create_admin_profile(UUID, TEXT, TEXT) TO authenticated;

-- ============================================================================
-- SECTION 14: ENABLE ROW LEVEL SECURITY
-- ============================================================================
-- RLS policies will be added in a separate migration file
-- Enable RLS on all tables for security

ALTER TABLE stores ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE store_stock ENABLE ROW LEVEL SECURITY;
ALTER TABLE replenishment_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE delivery_routes ENABLE ROW LEVEL SECURITY;
ALTER TABLE deliveries ENABLE ROW LEVEL SECURITY;
ALTER TABLE delivery_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE gps_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE delivery_signatures ENABLE ROW LEVEL SECURITY;
ALTER TABLE kitchen_sheets ENABLE ROW LEVEL SECURITY;
ALTER TABLE kitchen_sheet_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE barcode_labels ENABLE ROW LEVEL SECURITY;
ALTER TABLE returns ENABLE ROW LEVEL SECURITY;
ALTER TABLE temperature_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_reminders ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- END OF SCHEMA
-- ============================================================================

