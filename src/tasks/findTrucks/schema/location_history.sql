location_history (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  truck_id INT NOT NULL,
  timestamp DATETIME NOT NULL,
  latitude DECIMAL(10, 8) NOT NULL,  
  longitude DECIMAL(11, 8) NOT NULL,
  address VARCHAR(255),
  
  location_point POINT NOT NULL SRID 4326,
  
  INDEX idx_truck_timestamp (truck_id, timestamp DESC),
  
  INDEX idx_lat (latitude),
  INDEX idx_lng (longitude),
  
  SPATIAL INDEX idx_location_point (location_point),
  
  FOREIGN KEY (truck_id) REFERENCES trucks(truck_id)
)