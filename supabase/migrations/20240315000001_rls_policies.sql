-- Row Level Security Policies

-- Stores policies
CREATE POLICY "Admins can view all stores" ON stores
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role = 'admin'
    )
  );

CREATE POLICY "Store owners can view their own store" ON stores
  FOR SELECT USING (
    id IN (
      SELECT store_id FROM user_profiles
      WHERE user_profiles.id = auth.uid()
    )
  );

CREATE POLICY "Admins can insert stores" ON stores
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role = 'admin'
    )
  );

CREATE POLICY "Admins can update stores" ON stores
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role = 'admin'
    )
  );

-- Orders policies
CREATE POLICY "Users can view orders for their store" ON orders
  FOR SELECT USING (
    store_id IN (
      SELECT store_id FROM user_profiles
      WHERE user_profiles.id = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role = 'admin'
    )
  );

CREATE POLICY "Store owners can create orders" ON orders
  FOR INSERT WITH CHECK (
    store_id IN (
      SELECT store_id FROM user_profiles
      WHERE user_profiles.id = auth.uid()
    )
  );

CREATE POLICY "Admins can update orders" ON orders
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role = 'admin'
    )
  );

-- Order items policies
CREATE POLICY "Users can view order items for their orders" ON order_items
  FOR SELECT USING (
    order_id IN (
      SELECT id FROM orders
      WHERE store_id IN (
        SELECT store_id FROM user_profiles
        WHERE user_profiles.id = auth.uid()
      )
      OR EXISTS (
        SELECT 1 FROM user_profiles
        WHERE user_profiles.id = auth.uid()
        AND user_profiles.role = 'admin'
      )
    )
  );

CREATE POLICY "Store owners can insert order items" ON order_items
  FOR INSERT WITH CHECK (
    order_id IN (
      SELECT id FROM orders
      WHERE store_id IN (
        SELECT store_id FROM user_profiles
        WHERE user_profiles.id = auth.uid()
      )
    )
  );

-- Store stock policies
CREATE POLICY "Users can view stock for their store" ON store_stock
  FOR SELECT USING (
    store_id IN (
      SELECT store_id FROM user_profiles
      WHERE user_profiles.id = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role = 'admin'
    )
  );

CREATE POLICY "Store owners can update their stock" ON store_stock
  FOR UPDATE USING (
    store_id IN (
      SELECT store_id FROM user_profiles
      WHERE user_profiles.id = auth.uid()
    )
  );

-- Deliveries policies
CREATE POLICY "Users can view deliveries for their orders" ON deliveries
  FOR SELECT USING (
    order_id IN (
      SELECT id FROM orders
      WHERE store_id IN (
        SELECT store_id FROM user_profiles
        WHERE user_profiles.id = auth.uid()
      )
      OR EXISTS (
        SELECT 1 FROM user_profiles
        WHERE user_profiles.id = auth.uid()
        AND user_profiles.role = 'admin'
      )
    )
    OR driver_id = auth.uid()
  );

CREATE POLICY "Admins can update deliveries" ON deliveries
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role = 'admin'
    )
  );

CREATE POLICY "Drivers can update their deliveries" ON deliveries
  FOR UPDATE USING (
    driver_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role = 'driver'
    )
  );

-- Payments policies
CREATE POLICY "Users can view payments for their orders" ON payments
  FOR SELECT USING (
    order_id IN (
      SELECT id FROM orders
      WHERE store_id IN (
        SELECT store_id FROM user_profiles
        WHERE user_profiles.id = auth.uid()
      )
      OR EXISTS (
        SELECT 1 FROM user_profiles
        WHERE user_profiles.id = auth.uid()
        AND user_profiles.role = 'admin'
      )
    )
  );

-- Invoices policies
CREATE POLICY "Users can view invoices for their store" ON invoices
  FOR SELECT USING (
    store_id IN (
      SELECT store_id FROM user_profiles
      WHERE user_profiles.id = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role = 'admin'
    )
  );

-- User profiles policies
CREATE POLICY "Users can view their own profile" ON user_profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON user_profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles" ON user_profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_profiles up
      WHERE up.id = auth.uid()
      AND up.role = 'admin'
    )
  );

