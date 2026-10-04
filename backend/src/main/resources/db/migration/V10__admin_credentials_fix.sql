-- ==============================================================================
-- Aurora - Migration V10: Ensure Admin Accounts and Password Hash
-- Admin Password: Admin@Aurora2026!
-- Hash: $2a$10$yiwHRO481wBZkURiTdOKsevXaVvj0QIc9IIEaLAL/cHGEkw0sy9Zu
-- ==============================================================================

INSERT INTO users (id, email, password_hash, first_name, last_name, auth_provider, role, is_active)
VALUES (
    'f1a2b3c4-d5e6-4a7b-8c9d-0e1f2a3b4c5d',
    'admin@aurora-masks.tn',
    '$2a$10$yiwHRO481wBZkURiTdOKsevXaVvj0QIc9IIEaLAL/cHGEkw0sy9Zu',
    'Amine',
    'Ben Salem (Atelier Director)',
    'LOCAL',
    'ROLE_ADMIN',
    TRUE
)
ON CONFLICT (email) DO UPDATE 
SET password_hash = '$2a$10$yiwHRO481wBZkURiTdOKsevXaVvj0QIc9IIEaLAL/cHGEkw0sy9Zu',
    role = 'ROLE_ADMIN',
    is_active = TRUE;

UPDATE users 
SET password_hash = '$2a$10$yiwHRO481wBZkURiTdOKsevXaVvj0QIc9IIEaLAL/cHGEkw0sy9Zu',
    role = 'ROLE_ADMIN',
    is_active = TRUE
WHERE email = 'admin@aurora.tn';

UPDATE users 
SET role = 'ROLE_ADMIN' 
WHERE email = 'chedi.landolsi@gmail.com';
