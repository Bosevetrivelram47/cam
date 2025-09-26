-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Aug 07, 2025 at 05:27 AM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `machine_monitor_db`
--

-- --------------------------------------------------------

--
-- Table structure for table `failure_history`
--

CREATE TABLE `failure_history` (
  `id` int(11) NOT NULL,
  `machine_id` varchar(50) NOT NULL,
  `failure_date` datetime NOT NULL,
  `description` text DEFAULT NULL,
  `severity` enum('Low','Medium','High') NOT NULL,
  `action` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `failure_history`
--

INSERT INTO `failure_history` (`id`, `machine_id`, `failure_date`, `description`, `severity`, `action`) VALUES
(1, 'M001', '2025-06-01 10:30:00', 'Spindle motor overheat', 'High', 'Replaced cooling fan'),
(2, 'M001', '2024-11-20 14:00:00', 'Tool changer jam', 'Medium', 'Adjusted mechanism');

-- --------------------------------------------------------

--
-- Table structure for table `machines`
--

CREATE TABLE `machines` (
  `id` varchar(50) NOT NULL,
  `name` varchar(255) NOT NULL,
  `class_id` varchar(50) NOT NULL,
  `status` enum('Running','Stopped','Error','Maintenance') NOT NULL,
  `job_type` varchar(255) DEFAULT NULL,
  `job_started_at` datetime DEFAULT NULL,
  `estimated_remaining_time_sec` int(11) DEFAULT NULL,
  `temperature` decimal(5,2) DEFAULT NULL,
  `pressure` decimal(5,2) DEFAULT NULL,
  `last_updated` datetime NOT NULL,
  `runtime_hours` decimal(10,2) DEFAULT NULL,
  `idle_hours` decimal(10,2) DEFAULT NULL,
  `productivity_score` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `machines`
--

INSERT INTO `machines` (`id`, `name`, `class_id`, `status`, `job_type`, `job_started_at`, `estimated_remaining_time_sec`, `temperature`, `pressure`, `last_updated`, `runtime_hours`, `idle_hours`, `productivity_score`) VALUES
('M001', 'Elegoo-Saturn-4-001', 'class1', 'Running', 'Milling', '2025-06-30 14:30:25', 1800, 78.00, 10.20, '2025-07-10 11:38:39', 150.50, 25.10, 92),
('M002', 'Elegoo-Saturn-4-002', 'class1', 'Maintenance', NULL, NULL, NULL, 40.00, 0.50, '2025-06-30 15:30:25', 100.20, 50.80, 85),
('M003', 'Elegoo-Saturn-4-003', 'class1', 'Running', 'Drilling', '2025-06-30 15:10:25', 600, 72.00, 4.80, '2025-06-30 15:30:25', 200.00, 10.00, 95),
('M004', 'Elegoo-Saturn-4-004', 'class1', 'Stopped', NULL, NULL, NULL, 25.00, 0.10, '2025-06-30 15:30:25', 80.00, 70.00, 70),
('M005', 'Elegoo-Saturn-4-005', 'class1', 'Running', 'Turning', '2025-06-30 13:30:25', 3600, 80.00, 5.50, '2025-06-30 15:30:25', 180.00, 30.00, 90),
('M006', 'Elegoo-Saturn-3-001', 'class2', 'Running', 'Engraving', '2025-06-30 15:00:25', 900, 65.00, 3.10, '2025-06-30 15:30:25', 120.00, 15.00, 88),
('M007', 'Elegoo-Saturn-3-002', 'class2', 'Running', 'Engraving', '2025-06-30 15:00:25', 900, 65.00, 3.10, '2025-06-30 15:30:25', 120.00, 15.00, 88),
('M008', 'Elegoo-Saturn-3-003', 'class2', 'Maintenance', 'Engraving', '2025-06-30 15:00:25', 900, 65.00, 3.10, '2025-06-30 15:30:25', 120.00, 15.00, 88),
('M009', 'Elegoo-Saturn-3-004', 'class2', 'Running', 'Engraving', '2025-06-30 15:00:25', 900, 65.00, 3.10, '2025-06-30 15:30:25', 120.00, 15.00, 88),
('M010', 'The-One-001', 'class3', 'Running', 'Engraving', '2025-06-30 15:00:25', 900, 65.00, 3.10, '2025-06-30 15:30:25', 120.00, 15.00, 88),
('M011', 'The-One-002', 'class3', 'Stopped', 'Engraving', '2025-06-30 15:00:25', 900, 65.00, 3.10, '2025-06-30 15:30:25', 120.00, 15.00, 88),
('M012', 'The-One-003', 'class3', 'Running', 'Engraving', '2025-06-30 15:00:25', 900, 65.00, 3.10, '2025-06-30 15:30:25', 120.00, 15.00, 88),
('M013', 'Kaizer-001', 'class4', 'Running', 'Engraving', '2025-06-30 15:00:25', 900, 65.00, 3.10, '2025-06-30 15:30:25', 120.00, 15.00, 88),
('M014', 'Kaizer-002', 'class4', 'Running', 'Engraving', '2025-06-30 15:00:25', 900, 65.00, 3.10, '2025-06-30 15:30:25', 120.00, 15.00, 88),
('M015', 'Kaizer-003', 'class4', 'Maintenance', 'Engraving', '2025-06-30 15:00:25', 900, 65.00, 3.10, '2025-06-30 15:30:25', 120.00, 15.00, 88),
('M016', 'Kaizer-M104', 'class4', 'Running', NULL, NULL, NULL, 25.00, 100.00, '2025-07-10 11:38:04', NULL, NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `machine_classes`
--

CREATE TABLE `machine_classes` (
  `id` varchar(50) NOT NULL,
  `name` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `machine_classes`
--

INSERT INTO `machine_classes` (`id`, `name`) VALUES
('class2', 'Elegoo-Saturn- 3'),
('class1', 'Elegoo-Saturn-4'),
('class4', 'Kaizer'),
('class3', 'The-One');

-- --------------------------------------------------------

--
-- Table structure for table `machine_daily_status`
--

CREATE TABLE `machine_daily_status` (
  `id` int(11) NOT NULL,
  `report_date` date NOT NULL,
  `machine_name` varchar(255) NOT NULL,
  `shift_timing` text NOT NULL,
  `running_hrs` decimal(5,2) NOT NULL,
  `idle_hrs` decimal(5,2) NOT NULL,
  `percentage` decimal(5,2) NOT NULL,
  `machine_status` enum('Running','Stopped','Maintenance','Error') NOT NULL,
  `no_of_files` int(11) NOT NULL,
  `quantity` int(11) NOT NULL,
  `weight` decimal(10,2) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `machine_daily_status`
--

INSERT INTO `machine_daily_status` (`id`, `report_date`, `machine_name`, `shift_timing`, `running_hrs`, `idle_hrs`, `percentage`, `machine_status`, `no_of_files`, `quantity`, `weight`, `created_at`) VALUES
(1, '2025-07-10', 'Elegoo-Saturn-4-001', '8AM-8PM Day Shift', 18.50, 5.50, 77.08, 'Running', 50, 780, 450.25, '2025-07-12 04:57:14'),
(2, '2025-07-10', 'The-One-001', '8PM-8PM NIGHT Shift', 2.10, 21.90, 8.75, 'Stopped', 5, 10, 2.50, '2025-07-12 04:57:14'),
(3, '2025-07-10', 'Kaizer-001', '8AM-8PM Day Shift', 12.00, 12.00, 50.00, 'Maintenance', 20, 250, 150.00, '2025-07-12 04:57:14'),
(4, '2025-07-11', 'Elegoo-Saturn-3-001', '8AM-8PM Day Shift', 22.00, 2.00, 91.67, 'Running', 48, 950, 580.75, '2025-07-12 04:57:14'),
(5, '2025-07-11', 'Elegoo-Saturn-4-001', '8PM-8PM NIGHT Shift', 15.75, 8.25, 65.63, 'Running', 28, 550, 320.10, '2025-07-12 04:57:14'),
(6, '2025-07-11', 'Elegoo-Saturn-4-002', '8AM-8PM Day Shift', 0.50, 23.50, 2.08, 'Error', 0, 0, 0.00, '2025-07-12 04:57:14'),
(7, '2025-07-12', 'Elegoo-Saturn-3-003', '8AM-8PM Day Shift', 5.00, 19.00, 20.83, 'Maintenance', 80, 150, 75.00, '2025-07-12 04:57:14'),
(8, '2025-07-12', 'Kaizer-002', '8AM-8PM Day Shift', 10.25, 13.75, 42.71, 'Running', 190, 380, 210.50, '2025-07-12 04:57:14'),
(9, '2025-07-12', 'Kaizer-001', '8PM-8PM NIGHT Shift', 20.00, 4.00, 83.33, 'Running', 41, 800, 490.90, '2025-07-12 04:57:14');

-- --------------------------------------------------------

--
-- Table structure for table `machine_discovery_status`
--

CREATE TABLE `machine_discovery_status` (
  `id` int(11) NOT NULL,
  `ip_address` varchar(45) NOT NULL,
  `port` int(11) NOT NULL,
  `current_status` varchar(50) DEFAULT 'UNKNOWN',
  `running_time` decimal(10,2) DEFAULT NULL COMMENT 'In minutes',
  `job_name` varchar(255) DEFAULT 'N/A',
  `balance_time` decimal(10,2) DEFAULT NULL COMMENT 'In minutes',
  `file_name` varchar(255) DEFAULT 'N/A',
  `last_seen` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `raw_response_data` text DEFAULT NULL,
  `created_at` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `maintenance_logs`
--

CREATE TABLE `maintenance_logs` (
  `id` int(11) NOT NULL,
  `machine_id` varchar(50) NOT NULL,
  `log_date` date NOT NULL,
  `description` text DEFAULT NULL,
  `performed_by` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `maintenance_logs`
--

INSERT INTO `maintenance_logs` (`id`, `machine_id`, `log_date`, `description`, `performed_by`) VALUES
(1, 'M001', '2025-05-10', 'Lubrication and calibration', 'Technician A'),
(2, 'M001', '2025-03-15', 'Motor inspection', 'Technician B'),
(3, 'M002', '2025-06-25', 'Scheduled annual maintenance', 'Technician C');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `failure_history`
--
ALTER TABLE `failure_history`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_failure_machine` (`machine_id`);

--
-- Indexes for table `machines`
--
ALTER TABLE `machines`
  ADD PRIMARY KEY (`id`),
  ADD KEY `class_id` (`class_id`);

--
-- Indexes for table `machine_classes`
--
ALTER TABLE `machine_classes`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `name` (`name`);

--
-- Indexes for table `machine_daily_status`
--
ALTER TABLE `machine_daily_status`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `machine_discovery_status`
--
ALTER TABLE `machine_discovery_status`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `ip_address` (`ip_address`),
  ADD KEY `idx_ip_address` (`ip_address`);

--
-- Indexes for table `maintenance_logs`
--
ALTER TABLE `maintenance_logs`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_maintenance_machine` (`machine_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `failure_history`
--
ALTER TABLE `failure_history`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `machine_daily_status`
--
ALTER TABLE `machine_daily_status`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT for table `machine_discovery_status`
--
ALTER TABLE `machine_discovery_status`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `maintenance_logs`
--
ALTER TABLE `maintenance_logs`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `failure_history`
--
ALTER TABLE `failure_history`
  ADD CONSTRAINT `failure_history_ibfk_1` FOREIGN KEY (`machine_id`) REFERENCES `machines` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_failure_machine` FOREIGN KEY (`machine_id`) REFERENCES `machines` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `machines`
--
ALTER TABLE `machines`
  ADD CONSTRAINT `machines_ibfk_1` FOREIGN KEY (`class_id`) REFERENCES `machine_classes` (`id`);

--
-- Constraints for table `maintenance_logs`
--
ALTER TABLE `maintenance_logs`
  ADD CONSTRAINT `fk_maintenance_machine` FOREIGN KEY (`machine_id`) REFERENCES `machines` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `maintenance_logs_ibfk_1` FOREIGN KEY (`machine_id`) REFERENCES `machines` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
