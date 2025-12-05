trucks (
  truck_id INT PRIMARY KEY,
  license_plate_number VARCHAR(20) NOT NULL,
  INDEX idx_license_plate (license_plate_number)
)