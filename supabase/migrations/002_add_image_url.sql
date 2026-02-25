-- Add image_url column for easier single-image access
-- This is the primary display image; images array stores all photos
ALTER TABLE products ADD COLUMN IF NOT EXISTS image_url TEXT;

-- Create a trigger to auto-set image_url from first images array element
CREATE OR REPLACE FUNCTION set_image_url()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.images IS NOT NULL AND array_length(NEW.images, 1) > 0 THEN
    NEW.image_url := NEW.images[1];
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS auto_set_image_url ON products;
CREATE TRIGGER auto_set_image_url
  BEFORE INSERT OR UPDATE ON products
  FOR EACH ROW
  EXECUTE FUNCTION set_image_url();
