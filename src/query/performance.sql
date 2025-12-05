SELECT 
      t.truck_id,
      t.license_plate_number,
      lh.latitude,
      lh.longitude,
      lh.address,

      ST_Distance_Sphere(
        lh.location_point,
        ST_GeomFromText(CONCAT('POINT(', :lng, ' ', :lat, ')'), 4326)
      ) / 1000 AS distance_km

    FROM trucks t
    INNER JOIN location_history lh 
        ON t.truck_id = lh.truck_id
    INNER JOIN (
        SELECT truck_id, MAX(timestamp) AS max_ts
        FROM location_history
        GROUP BY truck_id
    ) latest 
        ON lh.truck_id = latest.truck_id 
       AND lh.timestamp = latest.max_ts

    WHERE 
      lh.latitude BETWEEN :lat - (:radius / 111.0) 
                      AND :lat + (:radius / 111.0)

      AND lh.longitude BETWEEN :lng - (:radius / (111.0 * COS(RADIANS(:lat))))
                           AND :lng + (:radius / (111.0 * COS(RADIANS(:lat))))

      AND ST_Distance_Sphere(
          lh.location_point,
          ST_GeomFromText(CONCAT('POINT(', :lng, ' ', :lat, ')'), 4326)
      ) <= :radius * 1000

    ORDER BY distance_km
    LIMIT 100;