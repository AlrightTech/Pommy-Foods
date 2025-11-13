export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

/**
 * Validate product data before creation/update
 */
export function validateProduct(data: {
  name?: string;
  sku?: string;
  price?: number;
  cost?: number | null;
  min_stock_level?: number;
}): ValidationResult {
  const errors: string[] = [];

  if (data.name !== undefined) {
    if (!data.name || data.name.trim().length === 0) {
      errors.push('Product name is required');
    } else if (data.name.length > 255) {
      errors.push('Product name must be 255 characters or less');
    }
  }

  if (data.sku !== undefined) {
    if (!data.sku || data.sku.trim().length === 0) {
      errors.push('SKU is required');
    } else if (data.sku.length > 100) {
      errors.push('SKU must be 100 characters or less');
    }
  }

  if (data.price !== undefined) {
    if (data.price < 0) {
      errors.push('Price cannot be negative');
    }
    if (data.price === 0) {
      errors.push('Price must be greater than 0');
    }
  }

  if (data.cost !== undefined && data.cost !== null) {
    if (data.cost < 0) {
      errors.push('Cost cannot be negative');
    }
    if (data.price !== undefined && data.cost > data.price) {
      errors.push('Cost cannot be greater than price');
    }
  }

  if (data.min_stock_level !== undefined) {
    if (data.min_stock_level < 0) {
      errors.push('Minimum stock level cannot be negative');
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Validate SKU uniqueness (should be checked against database)
 */
export function validateSKUFormat(sku: string): ValidationResult {
  const errors: string[] = [];

  if (!sku || sku.trim().length === 0) {
    errors.push('SKU is required');
  } else {
    // SKU should be alphanumeric with optional hyphens/underscores
    const skuPattern = /^[A-Z0-9_-]+$/i;
    if (!skuPattern.test(sku)) {
      errors.push('SKU can only contain letters, numbers, hyphens, and underscores');
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

