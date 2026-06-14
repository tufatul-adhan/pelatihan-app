-- Database Setup Script for Training Service Backend
-- Run this script to create all necessary tables

-- Create Database
CREATE DATABASE IF NOT EXISTS db_pelatihan;
USE db_pelatihan;

-- Users Table
CREATE TABLE IF NOT EXISTS users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  nama VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role ENUM('admin', 'user') DEFAULT 'user',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_email (email),
  INDEX idx_role (role)
);

-- Pelatihan (Training) Table
CREATE TABLE IF NOT EXISTS pelatihan (
  id INT PRIMARY KEY AUTO_INCREMENT,
  nama_pelatihan VARCHAR(255) NOT NULL,
  deskripsi TEXT NOT NULL,
  harga DECIMAL(12, 2) NOT NULL,
  duration VARCHAR(120) NULL,
  tanggal DATETIME NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_tanggal (tanggal),
  INDEX idx_harga (harga)
);

-- Permintaan (Request) Table
CREATE TABLE IF NOT EXISTS permintaan (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  pelatihan_id INT NOT NULL,
  jumlah_peserta INT NOT NULL,
  deskripsi TEXT,
  status ENUM('pending', 'diproses', 'ditolak', 'selesai') DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (pelatihan_id) REFERENCES pelatihan(id) ON DELETE CASCADE,
  INDEX idx_user_id (user_id),
  INDEX idx_pelatihan_id (pelatihan_id),
  INDEX idx_status (status),
  INDEX idx_created_at (created_at)
);

-- Insert Sample Admin User (password: admin123)
-- Note: Replace the hash with actual bcrypt hash before running
INSERT IGNORE INTO users (nama, email, password, role) VALUES 
('Administrator', 'admin@pipu.co.id', '$2b$10$YhJE3lR5hN4xM2kN8pL0cOlY2qT1rS9vZ5x6u7w8mN2oP3q4r5s6t', 'admin');

-- Insert Sample Training Data
INSERT IGNORE INTO pelatihan (nama_pelatihan, deskripsi, harga, duration, tanggal) VALUES 
('Advanced React Patterns', 'Learn advanced React patterns, hooks, and state management with Redux and Context API', 500000, '2 Hari', '2024-06-15 09:00:00'),
('TypeScript Fundamentals', 'Master TypeScript basics, interfaces, generics, and advanced types for production code', 400000, '1 Hari', '2024-06-20 10:00:00'),
('Node.js Backend Development', 'Complete guide to building scalable Node.js applications with Express and databases', 600000, '3 Hari', '2024-07-01 14:00:00'),
('Database Design with MySQL', 'Learn database design principles, normalization, indexing, and query optimization', 450000, '2 Hari', '2024-07-10 10:00:00'),
('REST API Development', 'Build secure and scalable REST APIs using Express, authentication, and best practices', 550000, '2 Hari', '2024-07-15 13:00:00'),
('Web Security Best Practices', 'Comprehensive security training covering OWASP top 10, authentication, encryption, and more', 500000, '2 Hari', '2024-07-22 09:00:00');

-- Insert Sample Request Data (optional - uncomment to add)
-- INSERT INTO permintaan (user_id, pelatihan_id, jumlah_peserta, deskripsi, status) VALUES 
-- (1, 1, 10, 'Training for our development team', 'pending'),
-- (1, 2, 15, 'TypeScript training for all developers', 'diproses');

-- Verify tables were created
SELECT 'Database setup complete!' as status;
SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = 'db_pelatihan';
