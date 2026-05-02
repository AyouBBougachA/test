INSERT INTO claims (title, description, equipment_id, priority, status, created_at)
VALUES 
('Power loss during operation', 'The machine lost voltage suddenly and shut down.', 1, 'HIGH', 'RESOLVED', NOW() - INTERVAL '10 days'),
('Electrical short circuit', 'Sparks and voltage drop noticed.', 1, 'HIGH', 'RESOLVED', NOW() - INTERVAL '5 days'),
('Fuse blown repeatedly', 'Main circuit fuse blew again.', 1, 'HIGH', 'NEW', NOW() - INTERVAL '1 day');
