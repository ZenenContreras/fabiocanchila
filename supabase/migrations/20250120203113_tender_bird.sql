/*
  # Add product and category fields

  1. Changes
    - Add image_url to blog_categories
    - Add purchase_url and button_text to products

  2. Details
    - image_url: URL for category cover image
    - purchase_url: URL where the product can be purchased
    - button_text: Custom text for the purchase button
*/

-- Add image_url to blog_categories
ALTER TABLE blog_categories ADD COLUMN IF NOT EXISTS image_url text;

-- Add purchase_url and button_text to products
ALTER TABLE products ADD COLUMN IF NOT EXISTS purchase_url text;
ALTER TABLE products ADD COLUMN IF NOT EXISTS button_text text DEFAULT 'Comprar Ahora';