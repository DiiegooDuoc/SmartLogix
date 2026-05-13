-- product_name
SET @product_name_exists := (
  SELECT COUNT(*)
  FROM information_schema.columns
  WHERE table_schema = DATABASE()
    AND table_name = 'purchase_order'
    AND column_name = 'product_name'
);
SET @sql := IF(
  @product_name_exists = 0,
  'ALTER TABLE purchase_order ADD COLUMN product_name VARCHAR(255) NULL',
  'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- created_at
SET @created_at_exists := (
  SELECT COUNT(*)
  FROM information_schema.columns
  WHERE table_schema = DATABASE()
    AND table_name = 'purchase_order'
    AND column_name = 'created_at'
);
SET @sql := IF(
  @created_at_exists = 0,
  'ALTER TABLE purchase_order ADD COLUMN created_at DATETIME NULL',
  'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

UPDATE purchase_order SET created_at = NOW() WHERE created_at IS NULL;

-- status
SET @status_exists := (
  SELECT COUNT(*)
  FROM information_schema.columns
  WHERE table_schema = DATABASE()
    AND table_name = 'purchase_order'
    AND column_name = 'status'
);
SET @sql := IF(
  @status_exists = 0,
  'ALTER TABLE purchase_order ADD COLUMN status VARCHAR(40) NULL',
  'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

UPDATE purchase_order SET status = 'EN_PROCESO' WHERE status IS NULL OR status = '';
