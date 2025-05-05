-- MySQL dump 10.13  Distrib 8.0.41, for Linux (x86_64)
--
-- Host: 127.0.0.1    Database: laravelweb_db
-- ------------------------------------------------------
-- Server version	8.0.41-0ubuntu0.22.04.1

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `assignments`
--

DROP TABLE IF EXISTS `assignments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `assignments` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `title` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `location` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `salary` decimal(8,2) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `assignments`
--

LOCK TABLES `assignments` WRITE;
/*!40000 ALTER TABLE `assignments` DISABLE KEYS */;
/*!40000 ALTER TABLE `assignments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `attachments`
--

DROP TABLE IF EXISTS `attachments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `attachments` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `message_id` bigint unsigned DEFAULT NULL,
  `filename` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `path` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `mime_type` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `size` bigint NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `attachments_message_id_foreign` (`message_id`),
  CONSTRAINT `attachments_message_id_foreign` FOREIGN KEY (`message_id`) REFERENCES `messages` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=35 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `attachments`
--

LOCK TABLES `attachments` WRITE;
/*!40000 ALTER TABLE `attachments` DISABLE KEYS */;
INSERT INTO `attachments` VALUES (1,56,'TO DO TRANSFERS','attachments/5/56/lpoLSX17v14YqqCoEcYpbA0kEqvDyPsDILGZs8CY.txt','text/plain',822,'2025-04-12 23:48:43','2025-04-12 23:48:43'),(2,58,'Screencast from 2025-01-08 08:59:02 AM.webm','attachments/5/58/DJjrbFrYd7kCO676FryGySGrqeSwh5tslCi5CaxB.webm','video/webm',96776,'2025-04-13 00:03:10','2025-04-13 00:03:10'),(3,59,'MT BOARD OF BEHAVIORAL HEALTH RULES  JULY2021.pdf','attachments/5/59/zmmsqy4tnbsnhKY2JA5RLrDaoVKdlIxGI9Rh8Bva.pdf','application/pdf',1409531,'2025-04-13 00:04:39','2025-04-13 00:04:39'),(4,60,'MT BOARD OF BEHAVIORAL HEALTH RULES  JULY2021.pdf','attachments/5/60/xg7ycqbmwuZXxHFf7XuEQB1hGplyXWoLMnkLvy3t.pdf','application/pdf',1409531,'2025-04-13 00:25:15','2025-04-13 00:25:15'),(5,61,'Screencast from 2024-09-21 09:02:11 PM.webm','attachments/5/61/e4OjmYkOFRDkUxy9vgGclCoskVKOWc49PkiCVQ7a.webm','video/webm',20221894,'2025-04-13 00:35:28','2025-04-13 00:35:28'),(6,62,'m2-res_720p.mp4','attachments/5/62/iZJ2rbmJ1iaUOTJoYjKNKxB9mUtQS3FAc1GjuwIs.mp4','video/mp4',5100004,'2025-04-13 00:38:01','2025-04-13 00:38:01'),(7,62,'MT BOARD OF BEHAVIORAL HEALTH RULES  JULY2021.pdf','attachments/5/62/381GEuiYUbozCOdueZjVJWnSOwvZn00tLZzCJ9zO.pdf','application/pdf',1409531,'2025-04-13 00:38:01','2025-04-13 00:38:01'),(8,62,'m2-res_1920p.mp4','attachments/5/62/WPDCj52OhD8o9jnXngfSJtA4uzG05XXOnwukOoRE.mp4','video/mp4',5636480,'2025-04-13 00:38:01','2025-04-13 00:38:01'),(9,63,'Screencast from 2024-09-21 09:02:11 PM.webm','attachments/5/63/seYjpK2KYGZxp8BOrLjzvvlTU8O2gnRagmkjUpXU.webm','video/webm',20221894,'2025-04-13 00:38:29','2025-04-13 00:38:29'),(10,64,'m2-res_720p.mp4','attachments/5/64/IHpfVIMIPd6sTYcCP4IvIHhw473QTnvB5BpgImYZ.mp4','video/mp4',5100004,'2025-04-13 00:39:11','2025-04-13 00:39:11'),(11,64,'MT BOARD OF BEHAVIORAL HEALTH RULES  JULY2021.pdf','attachments/5/64/t02pGy6OYdqBbyr4iJBt1JiFhJxxkZrAflOD8WW9.pdf','application/pdf',1409531,'2025-04-13 00:39:11','2025-04-13 00:39:11'),(12,64,'m2-res_1920p.mp4','attachments/5/64/4urWhc22eEWWn2doppBLKJfV5Nm9jkScNUy682PY.mp4','video/mp4',5636480,'2025-04-13 00:39:11','2025-04-13 00:39:11'),(13,64,'TO DO TRANSFERS','attachments/5/64/5M4ycc3LjX482CIkUVMyLjMTauktCDRlv88kuQHD.txt','text/plain',822,'2025-04-13 00:39:11','2025-04-13 00:39:11'),(14,64,'rclone.conf','attachments/5/64/BZOVzyKWMkBvJeOlK8Ynd40jnzn0VseilvbrKyYE.txt','text/plain',1368,'2025-04-13 00:39:11','2025-04-13 00:39:11'),(15,64,'Gillispie Legal All Emails.txt','attachments/5/64/eVfIsVrKPrgYqkeamR8qeUrbKjs2erYCGQTKH9qz.txt','text/plain',314866,'2025-04-13 00:39:11','2025-04-13 00:39:11'),(16,64,'Gillispie All Legal Filings for Cause No. DV-24-334.txt','attachments/5/64/JbxIX6RpZsuLjkyK0S5G3khRCWUHiaJ34gTpFv5u.txt','text/plain',140954,'2025-04-13 00:39:11','2025-04-13 00:39:11'),(17,64,'Katherine Gillispie Second Demand Letter - Google Docs.pdf','attachments/5/64/8cMxSTjMmKDPZwbUFVE3dwTqN45q22fLLvKXFkeQ.pdf','application/pdf',27781,'2025-04-13 00:39:11','2025-04-13 00:39:11'),(18,64,'Gillispie_Emails_up_to_9JUL2024.pdf','attachments/5/64/jnw1Z1uv1RrnJdG0yU3kffGZTajHu3iXE6DcMN2j.pdf','application/pdf',1736123,'2025-04-13 00:39:11','2025-04-13 00:39:11'),(19,64,'index.html','attachments/5/64/g0peoXgsKUQ1iHnkrGSQIen4QH1vgYxAEVA4Mn9E.html','text/html',70989,'2025-04-13 00:39:11','2025-04-13 00:39:11'),(20,64,'WordPerfectOffice2021.exe','attachments/5/64/AAUPByf9Xo6S1gxzGZstxWqXP8NlpahaarCm0Ct9.exe','application/x-dosexec',969616,'2025-04-13 00:39:11','2025-04-13 00:39:11'),(21,64,'nv3phu4758te1.png','attachments/5/64/rKOtiUl8HQia87GXfhKCyTqPbt5Q8o4sMWHSnQaR.png','image/png',396342,'2025-04-13 00:39:11','2025-04-13 00:39:11'),(22,64,'memories-of-food-shopping-in-2020-v0-mpwf816hcnse1.webp','attachments/5/64/b36jIqgbsUkVwwWlF7FgYZ8S4uO6JP9RCQgBbMHD.webp','image/webp',39764,'2025-04-13 00:39:11','2025-04-13 00:39:11'),(23,64,'memories-of-food-shopping-in-2020-v0-uv06rz5hcnse1.webp','attachments/5/64/4HUsr10EaP1QYrdoiTar8XY5WGOcIxhhzwAgOoBm.webp','image/webp',93758,'2025-04-13 00:39:11','2025-04-13 00:39:11'),(24,64,'memories-of-food-shopping-in-2020-v0-4xvh0d6hcnse1.webp','attachments/5/64/y1e8NF3vSf2Gdxo4XklhKYNRV3cE1kybdvI3JMPq.webp','image/webp',131784,'2025-04-13 00:39:11','2025-04-13 00:39:11'),(25,64,'memories-of-food-shopping-in-2020-v0-v4jpqw5hcnse1.webp','attachments/5/64/uAnfF4pmNKF9PIZU4F4bqKc3v4HQwChWEKsMkRWj.webp','image/webp',113336,'2025-04-13 00:39:11','2025-04-13 00:39:11'),(26,64,'memories-of-food-shopping-in-2020-v0-n0l8pw5hcnse1.webp','attachments/5/64/OqdbWrsGhhD0dYl3NbWVM2r1Yb6o2NtAUul9tEaC.webp','image/webp',55744,'2025-04-13 00:39:11','2025-04-13 00:39:11'),(27,65,'TO DO TRANSFERS','attachments/5/65/KQm2O5QUsHF5Fa2yvrpdd22GpIe2u3RCGN6PgKh7.txt','text/plain',822,'2025-04-13 01:18:33','2025-04-13 01:18:33'),(28,66,'memories-of-food-shopping-in-2020-v0-v4jpqw5hcnse1.webp','attachments/5/66/NPuB19OnC3AiZ63cl5lMwCWV2cB3wxH7n9IVN1Jn.webp','image/webp',113336,'2025-04-13 01:21:27','2025-04-13 01:21:27'),(29,66,'memories-of-food-shopping-in-2020-v0-uv06rz5hcnse1.webp','attachments/5/66/F9Pqjeu2imdCg0BVeus6x8Ci7O526IEUnxKLJvUT.webp','image/webp',93758,'2025-04-13 01:21:27','2025-04-13 01:21:27'),(30,66,'index.html','attachments/5/66/TtRT7UXXa5G8jge7fAdugEdvF0ULk4KLFhP8mGus.html','text/html',70989,'2025-04-13 01:21:27','2025-04-13 01:21:27'),(31,66,'TO DO TRANSFERS','attachments/5/66/etjTxF2hC4JlXqOJyYxPP3uuxDjh0qvWbg1ZHNVv.txt','text/plain',822,'2025-04-13 01:21:27','2025-04-13 01:21:27'),(32,67,'memories-of-food-shopping-in-2020-v0-v4jpqw5hcnse1.webp','attachments/5/67/HS7k083uR1HDUwO7IZS6Z1lVBNliYUJQq8HtPUuq.webp','image/webp',113336,'2025-04-13 01:33:38','2025-04-13 01:33:38'),(33,67,'memories-of-food-shopping-in-2020-v0-uv06rz5hcnse1.webp','attachments/5/67/kD0s85EiqgcRwFY5yIAs3bfD33W3zCBRWR1vEueu.webp','image/webp',93758,'2025-04-13 01:33:38','2025-04-13 01:33:38'),(34,67,'Gillispie_for_GPT_Emails_up_to_9JUL2024.pdf','attachments/5/67/Cwf521esEBeau4VAGxZE84NWRy26HKA5e73tw11m.pdf','application/pdf',18994909,'2025-04-13 01:33:38','2025-04-13 01:33:38');
/*!40000 ALTER TABLE `attachments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `cache`
--

DROP TABLE IF EXISTS `cache`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `cache` (
  `key` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `value` mediumtext CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `expiration` int NOT NULL,
  PRIMARY KEY (`key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cache`
--

LOCK TABLES `cache` WRITE;
/*!40000 ALTER TABLE `cache` DISABLE KEYS */;
/*!40000 ALTER TABLE `cache` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `cache_locks`
--

DROP TABLE IF EXISTS `cache_locks`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `cache_locks` (
  `key` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `owner` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `expiration` int NOT NULL,
  PRIMARY KEY (`key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cache_locks`
--

LOCK TABLES `cache_locks` WRITE;
/*!40000 ALTER TABLE `cache_locks` DISABLE KEYS */;
/*!40000 ALTER TABLE `cache_locks` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `companies`
--

DROP TABLE IF EXISTS `companies`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `companies` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `company_name` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=150 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `companies`
--

LOCK TABLES `companies` WRITE;
/*!40000 ALTER TABLE `companies` DISABLE KEYS */;
INSERT INTO `companies` VALUES (1,'Freynet-Gagné','2025-03-17 08:24:27','2025-03-17 08:24:27'),(2,'Brenden Achtemiuk','2025-03-17 08:24:27','2025-03-17 08:24:27'),(3,'CDEM','2025-03-17 08:24:27','2025-03-17 08:24:27'),(4,'Centre de santé','2025-03-17 08:24:27','2025-03-17 08:24:27'),(5,'Editing Services','2025-03-17 08:24:27','2025-03-17 08:24:27'),(6,'FAJEF','2025-03-17 08:24:27','2025-03-17 08:24:27'),(7,'FLMM','2025-03-17 08:24:27','2025-03-17 08:24:27'),(8,'Kigaana Productions','2025-03-17 08:24:27','2025-03-17 08:24:27'),(9,'LMIC','2025-03-17 08:24:27','2025-03-17 08:24:27'),(10,'Magnify Digital','2025-03-17 08:24:27','2025-03-17 08:24:27'),(11,'Manito LFC 2 INC.','2025-03-17 08:24:27','2025-03-17 08:24:27'),(12,'Manitoba Metis Federation','2025-03-17 08:24:27','2025-03-17 08:24:27'),(13,'Manitoba Teachers\' Society','2025-03-17 08:24:27','2025-03-17 08:24:27'),(14,'MANSO','2025-03-17 08:24:27','2025-03-17 08:24:27'),(15,'NANB','2025-03-17 08:24:27','2025-03-17 08:24:27'),(16,'National Gallery of Canada','2025-03-17 08:24:27','2025-03-17 08:24:27'),(17,'Peaceful Ronin Media','2025-03-17 08:24:27','2025-03-17 08:24:27'),(18,'Print Studio One PO 27085','2025-03-17 08:24:27','2025-03-17 08:24:27'),(19,'Réseau Compassion Network','2025-03-17 08:24:27','2025-03-17 08:24:27'),(20,'Roberto Bocangel','2025-03-17 08:24:27','2025-03-17 08:24:27'),(21,'RTAM','2025-03-17 08:24:27','2025-03-17 08:24:27'),(22,'RWB','2025-03-17 08:24:27','2025-03-17 08:24:27'),(23,'Santé en français','2025-03-17 08:24:27','2025-03-17 08:24:27'),(24,'Tiber River','2025-03-17 08:24:27','2025-03-17 08:24:27'),(25,'Travel Manitoba','2025-03-17 08:24:27','2025-03-17 08:24:27'),(26,'Université de Saint-Boniface','2025-03-17 08:24:27','2025-03-17 08:24:27'),(27,'University of Manitoba','2025-03-17 08:24:27','2025-03-17 08:24:27'),(28,'Ville de Winnipeg','2025-03-17 08:24:27','2025-03-17 08:24:27'),(29,'MWEC','2025-03-17 08:24:27','2025-03-17 08:24:27'),(30,'WEM','2025-03-17 08:24:27','2025-03-17 08:24:27'),(31,'WEOC','2025-03-17 08:24:27','2025-03-17 08:24:27'),(32,'Winnipeg Arts Council','2025-03-17 08:24:27','2025-03-17 08:24:27'),(33,'Centre de Renouveau Aulneau','2025-03-17 08:24:27','2025-03-17 08:24:27'),(34,'CFEE','2025-03-17 08:24:27','2025-03-17 08:24:27'),(35,'Deposit Guarantee Corporation of Manitoba','2025-03-17 08:24:27','2025-03-17 08:24:27'),(36,'FortWhyte Alive','2025-03-17 08:24:27','2025-03-17 08:24:27'),(37,'ISED','2025-03-17 08:24:27','2025-03-17 08:24:27'),(38,'Jessica Meza Resillas','2025-03-17 08:24:27','2025-03-17 08:24:27'),(39,'Johnston Group','2025-03-17 08:24:28','2025-03-17 08:24:28'),(40,'Manitoba Housing','2025-03-17 08:24:28','2025-03-17 08:24:28'),(41,'Manitoba School Boards','2025-03-17 08:24:28','2025-03-17 08:24:28'),(42,'Matrix Group Publishing','2025-03-17 08:24:28','2025-03-17 08:24:28'),(43,'NNAS','2025-03-17 08:24:28','2025-03-17 08:24:28'),(44,'Patrick Lessard','2025-03-17 08:24:28','2025-03-17 08:24:28'),(45,'Peak of the Market','2025-03-17 08:24:28','2025-03-17 08:24:28'),(46,'Probe Research','2025-03-17 08:24:28','2025-03-17 08:24:28'),(47,'SFM','2025-03-17 08:24:28','2025-03-17 08:24:28'),(48,'Taro PR','2025-03-17 08:24:28','2025-03-17 08:24:28'),(49,'Wookey Films','2025-03-17 08:24:28','2025-03-17 08:24:28'),(50,'Alamos Gold Inc.','2025-03-17 08:24:28','2025-03-17 08:24:28'),(51,'Canadian Home Economics Fondation','2025-03-17 08:24:28','2025-03-17 08:24:28'),(52,'Conseil des arts','2025-03-17 08:24:28','2025-03-17 08:24:28'),(53,'Enjoy Creative','2025-03-17 08:24:28','2025-03-17 08:24:28'),(54,'Event Camp','2025-03-17 08:24:28','2025-03-17 08:24:28'),(55,'Livres Canada Books','2025-03-17 08:24:28','2025-03-17 08:24:28'),(56,'Lorraine Prefontaine (varia)','2025-03-17 08:24:28','2025-03-17 08:24:28'),(57,'MB School Boards','2025-03-17 08:24:28','2025-03-17 08:24:28'),(58,'TR PO 465390','2025-03-17 08:24:28','2025-03-17 08:24:28'),(59,'Wawanesa','2025-03-17 08:24:28','2025-03-17 08:24:28'),(60,'WSP','2025-03-17 08:24:28','2025-03-17 08:24:28'),(61,'Apprentissage Illimité','2025-03-17 08:24:28','2025-03-17 08:24:28'),(62,'Association de la Neurofibromatose du Québec','2025-03-17 08:24:28','2025-03-17 08:24:28'),(63,'Conseil des arts du Canada','2025-03-17 08:24:28','2025-03-17 08:24:28'),(64,'Creative Manitoba','2025-03-17 08:24:28','2025-03-17 08:24:28'),(65,'Fondation','2025-03-17 08:24:28','2025-03-17 08:24:28'),(66,'LRSD Indigenous Education Team','2025-03-17 08:24:28','2025-03-17 08:24:28'),(67,'Luiz Nunes','2025-03-17 08:24:28','2025-03-17 08:24:28'),(68,'Matrix Group Publish','2025-03-17 08:24:28','2025-03-17 08:24:28'),(69,'Alberta Education','2025-03-17 08:24:28','2025-03-17 08:24:28'),(70,'Assiniboine Park Conservancy','2025-03-17 08:24:28','2025-03-17 08:24:28'),(71,'Brodi Restaurants Ltd.','2025-03-17 08:24:28','2025-03-17 08:24:28'),(72,'Chronic Centre for Veterans','2025-03-17 08:24:28','2025-03-17 08:24:28'),(73,'FMRI','2025-03-17 08:24:28','2025-03-17 08:24:28'),(74,'Heatmaster','2025-03-17 08:24:28','2025-03-17 08:24:28'),(75,'Hôpital Général Saint-Boniface','2025-03-17 08:24:28','2025-03-17 08:24:28'),(76,'MBLL','2025-03-17 08:24:28','2025-03-17 08:24:28'),(77,'Pollard','2025-03-17 08:24:28','2025-03-17 08:24:28'),(78,'Richardson International','2025-03-17 08:24:28','2025-03-17 08:24:28'),(79,'Stantec','2025-03-17 08:24:28','2025-03-17 08:24:28'),(80,'Stories for Caregivers','2025-03-17 08:24:28','2025-03-17 08:24:28'),(81,'The Cover Guy','2025-03-17 08:24:28','2025-03-17 08:24:28'),(82,'University of Manitoba PO 468744','2025-03-17 08:24:28','2025-03-17 08:24:28'),(83,'Urban Shaman Contemporary Aboriginal Art','2025-03-17 08:24:28','2025-03-17 08:24:28'),(84,'Wearecinco','2025-03-17 08:24:28','2025-03-17 08:24:28'),(85,'Wilmar Ariza','2025-03-17 08:24:28','2025-03-17 08:24:28'),(86,'Winnipeg School Division','2025-03-17 08:24:28','2025-03-17 08:24:28'),(87,'Bureau du conseil Privé','2025-03-17 08:24:28','2025-03-17 08:24:28'),(88,'Canada Council for the Arts','2025-03-17 08:24:28','2025-03-17 08:24:28'),(89,'Manitoba School Boards Association','2025-03-17 08:24:28','2025-03-17 08:24:28'),(90,'Musée canadien Pour les Droits de la Personne','2025-03-17 08:24:28','2025-03-17 08:24:28'),(91,'Savoir Montfort','2025-03-17 08:24:28','2025-03-17 08:24:28'),(92,'SodaStream','2025-03-17 08:24:28','2025-03-17 08:24:28'),(93,'St.Amant','2025-03-17 08:24:28','2025-03-17 08:24:28'),(94,'UpHouse','2025-03-17 08:24:28','2025-03-17 08:24:28'),(95,'Alliance catholique canadienne de la santé','2025-03-17 08:24:28','2025-03-17 08:24:28'),(96,'Baltic Brothers','2025-03-17 08:24:28','2025-03-17 08:24:28'),(97,'Bounce Design','2025-03-17 08:24:28','2025-03-17 08:24:28'),(98,'Centre national d\'excellence sur la douleur chronique pour les vétérans canadiens','2025-03-17 08:24:28','2025-03-17 08:24:28'),(99,'EDAC','2025-03-17 08:24:28','2025-03-17 08:24:28'),(100,'G3 Canada Limited','2025-03-17 08:24:28','2025-03-17 08:24:28'),(101,'Guy Dumont','2025-03-17 08:24:28','2025-03-17 08:24:28'),(102,'Manitoba Association of Optometrists','2025-03-17 08:24:28','2025-03-17 08:24:28'),(103,'Paula Isaak','2025-03-17 08:24:28','2025-03-17 08:24:28'),(104,'Rémi Courcelles','2025-03-17 08:24:28','2025-03-17 08:24:28'),(105,'Agriculture in the Classroom-Manitoba','2025-03-17 08:24:28','2025-03-17 08:24:28'),(106,'All Seniors Care Living Centres Inc','2025-03-17 08:24:28','2025-03-17 08:24:28'),(107,'Animal Health Canada','2025-03-17 08:24:28','2025-03-17 08:24:28'),(108,'Castle Health','2025-03-17 08:24:28','2025-03-17 08:24:28'),(109,'Eupraxia Training','2025-03-17 08:24:28','2025-03-17 08:24:28'),(110,'FCFM','2025-03-17 08:24:28','2025-03-17 08:24:28'),(111,'Heritage Winnipeg','2025-03-17 08:24:28','2025-03-17 08:24:28'),(112,'Manitoba child care association','2025-03-17 08:24:28','2025-03-17 08:24:28'),(113,'PADRAIG','2025-03-17 08:24:28','2025-03-17 08:24:28'),(114,'Phonique média','2025-03-17 08:24:28','2025-03-17 08:24:28'),(115,'pipikwan Pêhtâkwan','2025-03-17 08:24:28','2025-03-17 08:24:28'),(116,'PVLIP','2025-03-17 08:24:28','2025-03-17 08:24:28'),(117,'Bounce','2025-03-17 08:24:28','2025-03-17 08:24:28'),(118,'Chronic Pain Centre of Excellence','2025-03-17 08:24:28','2025-03-17 08:24:28'),(119,'Direct Focus','2025-03-17 08:24:28','2025-03-17 08:24:28'),(120,'LCTaylor','2025-03-17 08:24:28','2025-03-17 08:24:28'),(121,'Louisiana Department of Education','2025-03-17 08:24:28','2025-03-17 08:24:28'),(122,'Pembina Trails School Division','2025-03-17 08:24:28','2025-03-17 08:24:28'),(123,'Provincial Court of Saskatchewan','2025-03-17 08:24:28','2025-03-17 08:24:28'),(124,'Sapphire Springs Inc.','2025-03-17 08:24:28','2025-03-17 08:24:28'),(125,'Sophie Bissonnette','2025-03-17 08:24:28','2025-03-17 08:24:28'),(126,'Canadian Museum Human Rights PO 1029122','2025-03-17 08:24:28','2025-03-17 08:24:28'),(127,'Centre Scolaire Centre Nord','2025-03-17 08:24:28','2025-03-17 08:24:28'),(128,'MBLL - HR','2025-03-17 08:24:28','2025-03-17 08:24:28'),(129,'Mustafa Elmi','2025-03-17 08:24:28','2025-03-17 08:24:28'),(130,'Roadwest Pictures','2025-03-17 08:24:28','2025-03-17 08:24:28'),(131,'Shared Health MB','2025-03-17 08:24:28','2025-03-17 08:24:28'),(132,'ViewSource Media','2025-03-17 08:24:28','2025-03-17 08:24:28'),(133,'After Caregiving','2025-03-17 08:24:28','2025-03-17 08:24:28'),(134,'Génome Canada','2025-03-17 08:24:28','2025-03-17 08:24:28'),(135,'NCTR','2025-03-17 08:24:28','2025-03-17 08:24:28'),(136,'Urbanink','2025-03-17 08:24:28','2025-03-17 08:24:28'),(137,'Roll Focus','2025-03-17 08:24:28','2025-03-17 08:24:28'),(138,'Pascale Kihn','2025-03-17 08:24:28','2025-03-17 08:24:28'),(139,'George & Fay Yee Centre for Healthcare Innovation','2025-03-17 08:24:28','2025-03-17 08:24:28'),(140,'Sem Ltd.','2025-03-17 08:24:28','2025-03-17 08:24:28'),(141,'Great Plains Publishing','2025-03-17 08:24:28','2025-03-17 08:24:28'),(142,'PROJETS EN ATTENTE','2025-03-17 08:24:28','2025-03-17 08:24:28'),(143,'Louis Riel Institute','2025-03-17 08:24:28','2025-03-17 08:24:28'),(144,'On Screen Manitoba','2025-03-17 08:24:28','2025-03-17 08:24:28'),(145,'Mangrove','2025-03-17 08:24:28','2025-03-17 08:24:28'),(146,'Economic Development Winnipeg (Tourism Wpg & YES! WPG)','2025-03-17 08:24:28','2025-03-17 08:24:28'),(147,'Spadrole','2025-03-17 08:24:28','2025-03-17 08:24:28'),(148,'Université du Manitoba','2025-03-17 08:24:28','2025-03-17 08:24:28');
/*!40000 ALTER TABLE `companies` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `failed_jobs`
--

DROP TABLE IF EXISTS `failed_jobs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `failed_jobs` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `uuid` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `connection` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `queue` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `payload` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `exception` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `failed_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `failed_jobs_uuid_unique` (`uuid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `failed_jobs`
--

LOCK TABLES `failed_jobs` WRITE;
/*!40000 ALTER TABLE `failed_jobs` DISABLE KEYS */;
/*!40000 ALTER TABLE `failed_jobs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `job_batches`
--

DROP TABLE IF EXISTS `job_batches`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `job_batches` (
  `id` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `total_jobs` int NOT NULL,
  `pending_jobs` int NOT NULL,
  `failed_jobs` int NOT NULL,
  `failed_job_ids` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `options` mediumtext CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `cancelled_at` int DEFAULT NULL,
  `created_at` int NOT NULL,
  `finished_at` int DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `job_batches`
--

LOCK TABLES `job_batches` WRITE;
/*!40000 ALTER TABLE `job_batches` DISABLE KEYS */;
/*!40000 ALTER TABLE `job_batches` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `jobs`
--

DROP TABLE IF EXISTS `jobs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `jobs` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `queue` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `payload` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `attempts` tinyint unsigned NOT NULL,
  `reserved_at` int unsigned DEFAULT NULL,
  `available_at` int unsigned NOT NULL,
  `created_at` int unsigned NOT NULL,
  PRIMARY KEY (`id`),
  KEY `jobs_queue_index` (`queue`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `jobs`
--

LOCK TABLES `jobs` WRITE;
/*!40000 ALTER TABLE `jobs` DISABLE KEYS */;
/*!40000 ALTER TABLE `jobs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `labels`
--

DROP TABLE IF EXISTS `labels`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `labels` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `label_name` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_id` bigint unsigned NOT NULL,
  `colour` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `labels_user_id_foreign` (`user_id`),
  CONSTRAINT `labels_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=17 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `labels`
--

LOCK TABLES `labels` WRITE;
/*!40000 ALTER TABLE `labels` DISABLE KEYS */;
INSERT INTO `labels` VALUES (16,'sadsadsad',5,'primary','2025-04-15 01:16:57','2025-04-15 01:16:57');
/*!40000 ALTER TABLE `labels` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `message_labels`
--

DROP TABLE IF EXISTS `message_labels`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `message_labels` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `message_id` bigint unsigned NOT NULL,
  `label_id` bigint unsigned NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `message_labels_message_id_foreign` (`message_id`),
  KEY `message_labels_label_id_foreign` (`label_id`),
  CONSTRAINT `message_labels_label_id_foreign` FOREIGN KEY (`label_id`) REFERENCES `labels` (`id`) ON DELETE CASCADE,
  CONSTRAINT `message_labels_message_id_foreign` FOREIGN KEY (`message_id`) REFERENCES `messages` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=36 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `message_labels`
--

LOCK TABLES `message_labels` WRITE;
/*!40000 ALTER TABLE `message_labels` DISABLE KEYS */;
INSERT INTO `message_labels` VALUES (35,67,16,NULL,NULL);
/*!40000 ALTER TABLE `message_labels` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `messages`
--

DROP TABLE IF EXISTS `messages`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `messages` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `sender_id` bigint unsigned NOT NULL,
  `receiver_id` bigint unsigned DEFAULT NULL,
  `company_id` bigint unsigned NOT NULL,
  `assignment_id` bigint unsigned DEFAULT NULL,
  `project_id` bigint unsigned DEFAULT NULL,
  `subject` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `body` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `reply_to_id` bigint unsigned DEFAULT NULL,
  `status` enum('draft','archived','deleted','sent','read') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'draft',
  `is_starred` tinyint(1) NOT NULL DEFAULT '0',
  `task_status` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'new',
  `due_date` date DEFAULT NULL,
  `is_archived` tinyint(1) NOT NULL DEFAULT '0',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `messages_sender_id_foreign` (`sender_id`),
  KEY `messages_company_id_foreign` (`company_id`),
  KEY `messages_assignment_id_foreign` (`assignment_id`),
  KEY `messages_project_id_foreign` (`project_id`),
  KEY `messages_reply_to_id_foreign` (`reply_to_id`),
  KEY `messages_receiver_id_foreign` (`receiver_id`),
  KEY `messages_is_starred_index` (`is_starred`),
  CONSTRAINT `messages_assignment_id_foreign` FOREIGN KEY (`assignment_id`) REFERENCES `assignments` (`id`) ON DELETE CASCADE,
  CONSTRAINT `messages_company_id_foreign` FOREIGN KEY (`company_id`) REFERENCES `companies` (`id`) ON DELETE CASCADE,
  CONSTRAINT `messages_project_id_foreign` FOREIGN KEY (`project_id`) REFERENCES `projects` (`id`) ON DELETE CASCADE,
  CONSTRAINT `messages_receiver_id_foreign` FOREIGN KEY (`receiver_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `messages_reply_to_id_foreign` FOREIGN KEY (`reply_to_id`) REFERENCES `messages` (`id`) ON DELETE CASCADE,
  CONSTRAINT `messages_sender_id_foreign` FOREIGN KEY (`sender_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=68 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `messages`
--

LOCK TABLES `messages` WRITE;
/*!40000 ALTER TABLE `messages` DISABLE KEYS */;
INSERT INTO `messages` VALUES (44,5,1,1,NULL,NULL,'saddsd','<p>sadsadsad</p>',NULL,'sent',0,'completed','2025-04-02',1,'2025-04-06 08:55:01','2025-04-06 09:28:21'),(45,5,5,1,NULL,NULL,'1111 1 111 1 1','<p> 11 1 11 1 1</p>',NULL,'read',0,'new','2025-04-01',1,'2025-04-06 08:55:24','2025-04-07 09:02:03'),(46,5,5,1,NULL,NULL,'2222222','<p>2222222</p>',NULL,'read',0,'in_process','2025-04-01',0,'2025-04-06 09:07:04','2025-04-12 04:36:57'),(47,5,5,1,NULL,NULL,'sadsadsadsa','<p>sadsadsad</p>',NULL,'read',0,'new','2025-04-06',0,'2025-04-07 08:57:40','2025-04-12 04:35:21'),(48,5,1,1,NULL,NULL,'wwewew','<p>wewewew</p>',NULL,'read',0,'new','2025-04-06',0,'2025-04-07 09:02:24','2025-04-07 09:16:41'),(49,5,5,1,NULL,NULL,'sadsda','<p>sdsadsad</p>',NULL,'read',0,'new','2025-04-05',0,'2025-04-07 09:16:58','2025-04-12 04:35:38'),(50,5,5,1,NULL,NULL,'sadsadsad','<p>ssadada</p>',NULL,'read',0,'new','2025-04-06',0,'2025-04-07 09:17:16','2025-04-12 04:35:50'),(51,5,5,1,NULL,NULL,'sdadsadsa','<p>sdsadsada</p>',NULL,'read',0,'new','2025-04-06',0,'2025-04-07 10:07:18','2025-04-12 04:35:30'),(53,5,5,1,NULL,NULL,'dfsdfd','<p> sad sadsa dad aDSAD</p>',NULL,'read',0,'new','2025-04-11',0,'2025-04-12 04:36:25','2025-04-12 23:33:30'),(54,5,1,1,NULL,NULL,'SADSAD','<p>SADSAD</p>',NULL,'sent',0,'new','2025-04-12',0,'2025-04-12 23:42:36','2025-04-12 23:42:36'),(55,5,5,1,NULL,NULL,'11111','<p>1111</p>',NULL,'sent',0,'in_process','2025-04-12',1,'2025-04-12 23:42:57','2025-04-12 23:43:37'),(56,5,5,1,NULL,NULL,'sss','<p>sdsss</p>',NULL,'read',0,'new','2025-04-11',0,'2025-04-12 23:48:43','2025-04-12 23:48:45'),(57,5,5,1,NULL,NULL,'3333aa','<p>3322323as</p>',NULL,'read',0,'new','2025-04-17',0,'2025-04-13 00:02:46','2025-04-13 00:08:10'),(58,5,5,1,NULL,NULL,'444','<p>44444</p>',NULL,'read',0,'new','2025-04-15',0,'2025-04-13 00:03:10','2025-04-13 00:06:56'),(59,5,5,1,NULL,NULL,'111','<p>sdsadsad</p>',NULL,'read',0,'new','2025-04-20',0,'2025-04-13 00:04:39','2025-04-13 00:06:53'),(60,5,5,1,NULL,NULL,'999','<p>999</p>',NULL,'read',0,'new','2025-04-12',0,'2025-04-13 00:25:15','2025-04-13 00:25:17'),(61,5,5,1,NULL,NULL,'9999','<p>999</p>',NULL,'read',0,'new','2025-04-13',0,'2025-04-13 00:35:28','2025-04-13 00:35:32'),(62,5,5,1,NULL,NULL,'qqqq','<p>qqqq</p>',NULL,'read',0,'new',NULL,0,'2025-04-13 00:38:01','2025-04-13 00:38:07'),(63,5,5,1,NULL,NULL,'eee','<p>eee</p>',NULL,'sent',0,'new',NULL,0,'2025-04-13 00:38:28','2025-04-13 00:38:28'),(64,5,5,1,NULL,NULL,'eeee','<p>eee</p>',NULL,'read',0,'new',NULL,0,'2025-04-13 00:39:11','2025-04-13 00:48:13'),(65,5,5,1,NULL,NULL,'asdsad','<p>sadsada</p>',NULL,'read',0,'new','2025-04-13',0,'2025-04-13 01:18:33','2025-04-13 01:18:36'),(66,5,5,1,NULL,NULL,'tttt','<p>tttt</p>',NULL,'read',0,'new',NULL,0,'2025-04-13 01:21:27','2025-04-13 01:21:36'),(67,5,5,1,NULL,NULL,'sadsad','<p>sdsads</p>',NULL,'read',0,'in_process','2025-04-01',0,'2025-04-13 01:33:38','2025-04-30 06:34:46');
/*!40000 ALTER TABLE `messages` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `migrations`
--

DROP TABLE IF EXISTS `migrations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `migrations` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `migration` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `batch` int NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=31 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `migrations`
--

LOCK TABLES `migrations` WRITE;
/*!40000 ALTER TABLE `migrations` DISABLE KEYS */;
INSERT INTO `migrations` VALUES (1,'0001_01_01_000000_create_users_table',1),(2,'0001_01_01_000001_create_cache_table',1),(3,'0001_01_01_000002_create_jobs_table',1),(4,'2024_10_14_191341_create_personal_access_tokens_table',1),(5,'2024_10_31_171426_create_permissions_table',1),(6,'2024_10_31_171504_create_roles_table',1),(7,'2024_10_31_171522_create_role_permissions_table',1),(8,'2024_10_31_171540_create_user_roles_table',1),(9,'2024_11_19_180625_create_companies_table',1),(10,'2024_11_19_181147_create_user_company_table',1),(11,'2024_11_19_184318_create_assignments_table',1),(12,'2024_11_19_185017_create_user_assignments_table',1),(13,'2024_11_23_031504_add_password_reset_required_to_users_table',1),(14,'2024_12_05_135714_create_projects_table',1),(15,'2024_12_05_135722_create_messages_table',1),(16,'2024_12_05_140737_create_message_labels_and_statuses_tables',1),(18,'2025_03_12_213152_modify_assignment_id_nullable_in_messages',1),(19,'2025_03_12_213511_modify_project_id_nullable_in_messages',1),(20,'2025_03_15_190918_modify_status_enum_in_messages_table',2),(21,'2025_03_12_190930_create_attachments_table',3),(23,'2025_03_17_195430_add_receiver_id_to_messages_table',4),(25,'2025_03_17_201713_modify_messages_table_for_internal_messaging',5),(26,'2025_04_04_213459_add_is_starred_to_messages_table',6),(27,'2025_04_04_231255_add_color_to_labels_table',7),(29,'2025_04_05_010421_update_status_enum_in_messages_table',8),(30,'2025_04_05_230009_add_task_fields_to_messages_table',9);
/*!40000 ALTER TABLE `migrations` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `password_reset_tokens`
--

DROP TABLE IF EXISTS `password_reset_tokens`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `password_reset_tokens` (
  `email` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `token` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `password_reset_tokens`
--

LOCK TABLES `password_reset_tokens` WRITE;
/*!40000 ALTER TABLE `password_reset_tokens` DISABLE KEYS */;
/*!40000 ALTER TABLE `password_reset_tokens` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `permissions`
--

DROP TABLE IF EXISTS `permissions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `permissions` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `action` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `subject` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=31 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `permissions`
--

LOCK TABLES `permissions` WRITE;
/*!40000 ALTER TABLE `permissions` DISABLE KEYS */;
INSERT INTO `permissions` VALUES (1,'create','admin','2025-03-20 03:47:39','2025-03-20 03:47:39'),(2,'read','admin','2025-03-20 03:47:39','2025-03-20 03:47:39'),(3,'update','admin','2025-03-20 03:47:39','2025-03-20 03:47:39'),(4,'delete','admin','2025-03-20 03:47:39','2025-03-20 03:47:39'),(5,'manage','admin','2025-03-20 03:47:39','2025-03-20 03:47:39'),(6,'create','auth','2025-03-20 03:47:39','2025-03-20 03:47:39'),(7,'read','auth','2025-03-20 03:47:39','2025-03-20 03:47:39'),(8,'update','auth','2025-03-20 03:47:39','2025-03-20 03:47:39'),(9,'delete','auth','2025-03-20 03:47:39','2025-03-20 03:47:39'),(10,'manage','auth','2025-03-20 03:47:39','2025-03-20 03:47:39'),(11,'create','manager','2025-03-20 03:47:39','2025-03-20 03:47:39'),(12,'read','manager','2025-03-20 03:47:39','2025-03-20 03:47:39'),(13,'update','manager','2025-03-20 03:47:39','2025-03-20 03:47:39'),(14,'delete','manager','2025-03-20 03:47:39','2025-03-20 03:47:39'),(15,'manage','manager','2025-03-20 03:47:39','2025-03-20 03:47:39'),(16,'create','client','2025-03-20 03:47:39','2025-03-20 03:47:39'),(17,'read','client','2025-03-20 03:47:39','2025-03-20 03:47:39'),(18,'update','client','2025-03-20 03:47:39','2025-03-20 03:47:39'),(19,'delete','client','2025-03-20 03:47:39','2025-03-20 03:47:39'),(20,'manage','client','2025-03-20 03:47:39','2025-03-20 03:47:39'),(21,'create','user','2025-03-20 03:47:39','2025-03-20 03:47:39'),(22,'read','user','2025-03-20 03:47:39','2025-03-20 03:47:39'),(23,'update','user','2025-03-20 03:47:39','2025-03-20 03:47:39'),(24,'delete','user','2025-03-20 03:47:39','2025-03-20 03:47:39'),(25,'manage','user','2025-03-20 03:47:39','2025-03-20 03:47:39'),(26,'create','all','2025-03-20 03:47:39','2025-03-20 03:47:39'),(27,'read','all','2025-03-20 03:47:39','2025-03-20 03:47:39'),(28,'update','all','2025-03-20 03:47:39','2025-03-20 03:47:39'),(29,'delete','all','2025-03-20 03:47:39','2025-03-20 03:47:39'),(30,'manage','all','2025-03-20 03:47:39','2025-03-20 03:47:39');
/*!40000 ALTER TABLE `permissions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `personal_access_tokens`
--

DROP TABLE IF EXISTS `personal_access_tokens`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `personal_access_tokens` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `tokenable_type` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `tokenable_id` bigint unsigned NOT NULL,
  `name` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `token` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `abilities` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `last_used_at` timestamp NULL DEFAULT NULL,
  `expires_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `personal_access_tokens_token_unique` (`token`),
  KEY `personal_access_tokens_tokenable_type_tokenable_id_index` (`tokenable_type`,`tokenable_id`)
) ENGINE=InnoDB AUTO_INCREMENT=111 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `personal_access_tokens`
--

LOCK TABLES `personal_access_tokens` WRITE;
/*!40000 ALTER TABLE `personal_access_tokens` DISABLE KEYS */;
INSERT INTO `personal_access_tokens` VALUES (25,'App\\Models\\User',1,'NewToken','36340e1744224abee9de44c2a98fa7cbc52bd153105a10c75fd0192a8304f62e','[\"*\"]',NULL,NULL,'2025-03-20 03:50:21','2025-03-20 03:50:21'),(26,'App\\Models\\User',5,'API Token','4737cedc61e4b8da76cd08e6fd228908a52fda52706987270c0fe8bf3c2f07de','[\"*\"]','2025-04-01 05:17:17',NULL,'2025-03-20 04:06:49','2025-04-01 05:17:17'),(27,'App\\Models\\User',1,'api-testing','6a978cfa5f757f7cc73b829c2ec57beae36be3baf5df7499c8ac2853105304d9','[\"*\"]','2025-04-01 01:20:45',NULL,'2025-04-01 01:00:13','2025-04-01 01:20:45'),(28,'App\\Models\\User',5,'API Token','1ac460887695dc74d1f9117fe32227258dfea4267e105258c2b518bc90981a5c','[\"*\"]','2025-04-05 09:18:10',NULL,'2025-04-03 21:51:32','2025-04-05 09:18:10'),(29,'App\\Models\\User',5,'API Token','4dd3de047d68d92de40946dc55233d333005f2665609c83dec76187ce79e3a1c','[\"*\"]','2025-04-07 10:30:43',NULL,'2025-04-05 09:18:21','2025-04-07 10:30:43'),(30,'App\\Models\\User',5,'API Token','2696371363a9365235291d8d5b61f0fc409aa04424cb1f103b71da098fdffdff','[\"*\"]','2025-04-07 10:49:48',NULL,'2025-04-07 10:33:22','2025-04-07 10:49:48'),(31,'App\\Models\\User',8,'API Token','78b0bf20c5e1175af0158d9ae789af228626b6b682eac42d6e4b509ea365a940','[\"*\"]',NULL,NULL,'2025-04-07 10:49:57','2025-04-07 10:49:57'),(32,'App\\Models\\User',7,'API Token','1abe9073528d86842f1123b93bff0bd0af75a52f715fde541701b53bb11ed97e','[\"*\"]',NULL,NULL,'2025-04-07 10:51:30','2025-04-07 10:51:30'),(33,'App\\Models\\User',5,'API Token','c1441ffaeb1048b11f4381619f604a0ed09ab7064cabd1425116face25367ee9','[\"*\"]','2025-04-07 10:51:52',NULL,'2025-04-07 10:51:49','2025-04-07 10:51:52'),(34,'App\\Models\\User',4,'API Token','d75a0bbbb3d9ff060590e277e7b046d6fb8a101b6bcbac632e204f2de02835fa','[\"*\"]',NULL,NULL,'2025-04-07 10:51:58','2025-04-07 10:51:58'),(35,'App\\Models\\User',4,'API Token','80e30f973ddafa6ce5f70c957b848ee2ab548d00ddff966f7e7c6a607bad00df','[\"*\"]','2025-04-07 11:07:10',NULL,'2025-04-07 11:07:04','2025-04-07 11:07:10'),(36,'App\\Models\\User',5,'API Token','5b6a581e35bccca06614d6fe535b7a8d6a858e7cce8b34c7d79c24942d9e8b69','[\"*\"]','2025-04-12 04:36:57',NULL,'2025-04-12 04:30:20','2025-04-12 04:36:57'),(37,'App\\Models\\User',5,'API Token','351f7aa182561078edc0b63cb5210d3f29c663b6e51d5accba9553ddc297e351','[\"*\"]','2025-04-13 01:40:38',NULL,'2025-04-12 23:22:20','2025-04-13 01:40:38'),(38,'App\\Models\\User',7,'API Token','355e98d046042cbc09153c2ceb78947f1bafaf58b128c43fd4e1285a67bb7975','[\"*\"]',NULL,NULL,'2025-04-13 01:43:23','2025-04-13 01:43:23'),(39,'App\\Models\\User',5,'API Token','014319514b5bdd204590f14b3c2d4a2a1cff4e227edbf87cdd2754858d9239f2','[\"*\"]','2025-04-14 22:07:32',NULL,'2025-04-14 22:03:26','2025-04-14 22:07:32'),(40,'App\\Models\\User',7,'API Token','80a54c76719f5bf01379a3d83db549146cf8f726e2f1e1451713e68e347abb27','[\"*\"]',NULL,NULL,'2025-04-14 22:07:38','2025-04-14 22:07:38'),(41,'App\\Models\\User',6,'API Token','a6bc5abd155dd81c0e77ed6a8c495e9a53b354e66a45c75ec846ca5f3e7f9890','[\"*\"]',NULL,NULL,'2025-04-14 22:08:31','2025-04-14 22:08:31'),(42,'App\\Models\\User',5,'API Token','c3fc720f5ebf9c53c539bcd3745ffeb73c1f05abd91c0d93ca15eace64734c93','[\"*\"]','2025-04-14 22:15:07',NULL,'2025-04-14 22:15:03','2025-04-14 22:15:07'),(43,'App\\Models\\User',6,'API Token','fa8ce14e756eeb982359b255199f1d2b3922f310087aaef55d82243a5d3653e2','[\"*\"]',NULL,NULL,'2025-04-14 22:15:16','2025-04-14 22:15:16'),(44,'App\\Models\\User',5,'API Token','93b5dbb015758b6bcfd4b6a60a1b907fbbc1dfbd9a1985148600539f2ce4f3dd','[\"*\"]','2025-04-14 22:16:02',NULL,'2025-04-14 22:15:49','2025-04-14 22:16:02'),(45,'App\\Models\\User',8,'API Token','8579c4f0cec76895b6c88f1888ab9f52c050a3d57e613d78a3b5f78cb769b0ad','[\"*\"]',NULL,NULL,'2025-04-14 22:16:15','2025-04-14 22:16:15'),(46,'App\\Models\\User',5,'API Token','936675b193f74d9bb8c17013f3d35208ab0b991108b4b4a07aa02585882fb8cc','[\"*\"]',NULL,NULL,'2025-04-14 22:28:48','2025-04-14 22:28:48'),(47,'App\\Models\\User',5,'API Token','b2a105a125a3c66bcf6f83fd77bc5da9a2d989155513f0840bc73b24952655e6','[\"*\"]','2025-04-14 22:29:08',NULL,'2025-04-14 22:28:54','2025-04-14 22:29:08'),(48,'App\\Models\\User',6,'API Token','29a789e03338050761a29f348289aa28db68d715b92840c3336440809158be18','[\"*\"]',NULL,NULL,'2025-04-14 22:29:21','2025-04-14 22:29:21'),(49,'App\\Models\\User',5,'API Token','7ae1d34b58e277cf15f9275ab4e202de1f9942fa459572d979bda3b09a65849b','[\"*\"]',NULL,NULL,'2025-04-14 22:36:45','2025-04-14 22:36:45'),(50,'App\\Models\\User',5,'API Token','492f24b846ac91447d9e2ebe10d256742ee9776159c2d57c937ad36aafef13b9','[\"*\"]',NULL,NULL,'2025-04-14 22:36:48','2025-04-14 22:36:48'),(51,'App\\Models\\User',5,'API Token','cacd9eeb678dd7825a1026dc08da01351543262bc5024a5b5c0ced297e74b560','[\"*\"]',NULL,NULL,'2025-04-14 22:36:49','2025-04-14 22:36:49'),(52,'App\\Models\\User',7,'API Token','98a31802e048f0ceb0815b4c40b12e838d6f629ea96c6b543ffcd1ea62d2c719','[\"*\"]',NULL,NULL,'2025-04-14 22:36:52','2025-04-14 22:36:52'),(53,'App\\Models\\User',4,'API Token','47e7647a6617d7657ff6c3fed6c3a5658dc3a4062fabefd1c33a202b5568e795','[\"*\"]',NULL,NULL,'2025-04-14 22:39:56','2025-04-14 22:39:56'),(54,'App\\Models\\User',7,'API Token','0fd4192a97b0cb2b6464f4b4767c11575040e4999747b0c13dbc3ac2f25730f4','[\"*\"]',NULL,NULL,'2025-04-14 22:40:45','2025-04-14 22:40:45'),(55,'App\\Models\\User',7,'API Token','4337357efdaac060e93aac0e3627fd2f2e1eca4b1713f67c8c947f275e473b31','[\"*\"]',NULL,NULL,'2025-04-14 22:43:09','2025-04-14 22:43:09'),(56,'App\\Models\\User',5,'API Token','d6ac201fb1a55d65284912858fa4a6d85859d54a2436003d257994df26aef27a','[\"*\"]',NULL,NULL,'2025-04-14 22:50:57','2025-04-14 22:50:57'),(57,'App\\Models\\User',5,'API Token','30277157ad864a475cf1427e85ff384eac34df615efa04180ee8bf7ba8d6db23','[\"*\"]',NULL,NULL,'2025-04-14 22:54:21','2025-04-14 22:54:21'),(58,'App\\Models\\User',5,'API Token','7a76d7d81ba1fc20969c6c5442b5943e725945a4304b893c2626ea540a670236','[\"*\"]',NULL,NULL,'2025-04-14 23:02:06','2025-04-14 23:02:06'),(59,'App\\Models\\User',5,'API Token','ab4479d825418d08f32f672ce9920e80ee5330c2b450a5b3d6905e967563e8e8','[\"*\"]',NULL,NULL,'2025-04-14 23:03:44','2025-04-14 23:03:44'),(60,'App\\Models\\User',5,'API Token','08116f15ee2b17018ca1590683bbea464533c23b0f511aac2d1a0488f7c1f038','[\"*\"]',NULL,NULL,'2025-04-14 23:04:12','2025-04-14 23:04:12'),(61,'App\\Models\\User',4,'API Token','8df5cbe5ce180013a279e172f2f52a5da33424c4da39ae1d615609bb4fd7318d','[\"*\"]','2025-04-14 23:04:48',NULL,'2025-04-14 23:04:38','2025-04-14 23:04:48'),(62,'App\\Models\\User',5,'API Token','d93eb9e9e9970aa0f5467ae02c2f39c6226e253ea3055e0721395ad25ba3870c','[\"*\"]',NULL,NULL,'2025-04-14 23:06:56','2025-04-14 23:06:56'),(63,'App\\Models\\User',5,'API Token','26c209581949c1752c9a556cc296eaeddad9cb4e5d946899331f44cc21208f06','[\"*\"]',NULL,NULL,'2025-04-14 23:06:59','2025-04-14 23:06:59'),(64,'App\\Models\\User',5,'API Token','8949f3cdfcc5ded65df5262fb093b83dc5a669a6f8fc0c9bc8acceca8c45adf2','[\"*\"]',NULL,NULL,'2025-04-14 23:07:00','2025-04-14 23:07:00'),(65,'App\\Models\\User',5,'API Token','f475d1db291036e9cc9901087b9fc164d596fc35ca0a52a3b8f659ab774900be','[\"*\"]',NULL,NULL,'2025-04-14 23:07:00','2025-04-14 23:07:00'),(66,'App\\Models\\User',5,'API Token','d5d11ae11b692024aa314f2656d91bbc46ab4ce3a31a8287b771798c06d40799','[\"*\"]',NULL,NULL,'2025-04-14 23:07:01','2025-04-14 23:07:01'),(67,'App\\Models\\User',5,'API Token','6424817fe3b0c37fe0dfcd0cf2b3f333280cf7b1a55739569757ede3005075ca','[\"*\"]',NULL,NULL,'2025-04-14 23:07:01','2025-04-14 23:07:01'),(68,'App\\Models\\User',4,'API Token','ad682fb735d467d39ba64b8dddc00e0575c5385773a4aaa36eceaca694f42d0b','[\"*\"]',NULL,NULL,'2025-04-14 23:10:08','2025-04-14 23:10:08'),(69,'App\\Models\\User',5,'API Token','5c8e23d6f61e64a4a04b29163169f1250516a699ef84669f6b5969da9d8b503b','[\"*\"]',NULL,NULL,'2025-04-14 23:10:37','2025-04-14 23:10:37'),(70,'App\\Models\\User',5,'API Token','d4c91cd11d186ff921c645e5fc2faf9aa25e3a84ffb469cad0ed3dbefc033864','[\"*\"]',NULL,NULL,'2025-04-14 23:14:04','2025-04-14 23:14:04'),(71,'App\\Models\\User',5,'API Token','a9f8dca5a3e6878ebec24a86de5f3278dcd0ab983031f53607949585759c6e1c','[\"*\"]',NULL,NULL,'2025-04-14 23:14:06','2025-04-14 23:14:06'),(72,'App\\Models\\User',4,'API Token','048f128151a72137910706237e718e4168ef3f46849c9f6ceb9260d0babb5385','[\"*\"]',NULL,NULL,'2025-04-14 23:14:11','2025-04-14 23:14:11'),(73,'App\\Models\\User',4,'API Token','a3dea98f51dfd6cf8a9a417df6f4ed9b9dc851bc6f0863dc8fbee5a6388cc692','[\"*\"]',NULL,NULL,'2025-04-14 23:14:20','2025-04-14 23:14:20'),(74,'App\\Models\\User',5,'API Token','4225d62203aca8c0e2c4a9f218e3b32868e4ef709c4f5b7bc2c7702227d3e0ae','[\"*\"]',NULL,NULL,'2025-04-14 23:14:27','2025-04-14 23:14:27'),(75,'App\\Models\\User',5,'API Token','24385fada4968b3fe35985e7c83d0f0ffed59f15c98e85d91bf92d33dc51fa1e','[\"*\"]',NULL,NULL,'2025-04-14 23:16:16','2025-04-14 23:16:16'),(76,'App\\Models\\User',5,'API Token','afdc8bd4b0c09db37856682a63da62c7ac51ba96d0252ce28beeb0c6cff72228','[\"*\"]',NULL,NULL,'2025-04-14 23:16:28','2025-04-14 23:16:28'),(77,'App\\Models\\User',4,'API Token','7ff8ef0537c9b5715f1331de43a1f5c85e3b04811ef5ee8746898795381f2651','[\"*\"]',NULL,NULL,'2025-04-14 23:16:34','2025-04-14 23:16:34'),(78,'App\\Models\\User',5,'API Token','2ebcf44ca1c53a07528e34e39c972c6da6c1e622affe09b3b87a4db1848e58db','[\"*\"]',NULL,NULL,'2025-04-14 23:16:45','2025-04-14 23:16:45'),(79,'App\\Models\\User',5,'API Token','be6af377e321ce6962bd0c78773c219b8fef89624aeb2cf015b49942cb27da4c','[\"*\"]',NULL,NULL,'2025-04-14 23:17:43','2025-04-14 23:17:43'),(80,'App\\Models\\User',4,'API Token','24c0f20458e1c2304a5beac5064d0d516420b2e90091bc65b82974c14b46f984','[\"*\"]',NULL,NULL,'2025-04-14 23:17:50','2025-04-14 23:17:50'),(81,'App\\Models\\User',5,'API Token','58ee82926cfd5bcfa326b5ebe89e28e336905b4ba70cd6675a3e80c1f714271b','[\"*\"]',NULL,NULL,'2025-04-14 23:19:28','2025-04-14 23:19:28'),(82,'App\\Models\\User',7,'API Token','38f765be5b802b8b071f9c0e6dba00755b702dc2fdfa0208575fc4156c8a50e3','[\"*\"]',NULL,NULL,'2025-04-14 23:19:37','2025-04-14 23:19:37'),(83,'App\\Models\\User',8,'API Token','a849825368e55e3e077c9863cdc2b8675fcf954f29a3fac51fd87ec26c580d8e','[\"*\"]',NULL,NULL,'2025-04-14 23:24:46','2025-04-14 23:24:46'),(84,'App\\Models\\User',7,'API Token','c34e92878adf958f4940d5aafd028aa7874bc5ae384f561d91b74b98f7541030','[\"*\"]',NULL,NULL,'2025-04-14 23:26:49','2025-04-14 23:26:49'),(85,'App\\Models\\User',8,'API Token','004941aa84770c00b746b7dc4b1e51fce2e30bd481fa37270db181b2946dcb4d','[\"*\"]',NULL,NULL,'2025-04-14 23:29:04','2025-04-14 23:29:04'),(86,'App\\Models\\User',8,'API Token','4348d77206722410ab07faf9fca4353f4c16c078ed3c9f0f780f4f5e7ff1f0fa','[\"*\"]',NULL,NULL,'2025-04-14 23:33:17','2025-04-14 23:33:17'),(87,'App\\Models\\User',7,'API Token','8e802b3c2565030083e546618b286f5f8e36686f1cd88f1ae52f0a38e4d16adb','[\"*\"]',NULL,NULL,'2025-04-14 23:33:52','2025-04-14 23:33:52'),(88,'App\\Models\\User',8,'API Token','0fac5366d8792ef4ca9772cabefece1ea22c6e2712b9753675b677a5bf2287a1','[\"*\"]',NULL,NULL,'2025-04-14 23:34:19','2025-04-14 23:34:19'),(89,'App\\Models\\User',7,'API Token','93a2f9d92b1c6e000cf0629d6137d63ef7ea4d3a3fbd2d26c200d5b98be9e546','[\"*\"]',NULL,NULL,'2025-04-14 23:44:38','2025-04-14 23:44:38'),(90,'App\\Models\\User',8,'API Token','afce7dea0a87e6bfcb101ad42172963cac1b6e0a6e9b97ae4a407cf50a040c0d','[\"*\"]',NULL,NULL,'2025-04-14 23:47:25','2025-04-14 23:47:25'),(91,'App\\Models\\User',7,'API Token','97ae3f32450f4cc37ffe7657122417dbddab3f8416857043ca6202bf7a246b20','[\"*\"]',NULL,NULL,'2025-04-14 23:48:40','2025-04-14 23:48:40'),(92,'App\\Models\\User',8,'API Token','0bfbc9a36a4718154d3f1352c7db6f620fbfcc3fa88b9dfcf7911878fdd0d966','[\"*\"]','2025-04-14 23:54:47',NULL,'2025-04-14 23:54:25','2025-04-14 23:54:47'),(93,'App\\Models\\User',6,'API Token','7cadbc3897321acc95026578ae70715840a340954707830a297cc11f4c744b25','[\"*\"]','2025-04-14 23:55:26',NULL,'2025-04-14 23:55:25','2025-04-14 23:55:26'),(94,'App\\Models\\User',7,'API Token','6b24b39bb3633a8239809127ec2ef20c2d4a952b022c9615a7602e8051f62258','[\"*\"]','2025-04-15 00:04:53',NULL,'2025-04-14 23:55:35','2025-04-15 00:04:53'),(95,'App\\Models\\User',5,'API Token','86ad967bbd46872471088bb15b7b50da84eee223e4013160794590485e7151ef','[\"*\"]','2025-04-15 00:05:38',NULL,'2025-04-15 00:05:05','2025-04-15 00:05:38'),(96,'App\\Models\\User',1,'API Token','5651c2c33481c1685e246a3381b01c25fd0a05ec7034ca031eda6edbcf2838a2','[\"*\"]','2025-04-15 00:05:57',NULL,'2025-04-15 00:05:57','2025-04-15 00:05:57'),(97,'App\\Models\\User',5,'API Token','9727a7023a9b284790c3713b4b941c4df31f8903de9fb589968b27ddab594c79','[\"*\"]','2025-04-15 00:11:11',NULL,'2025-04-15 00:11:01','2025-04-15 00:11:11'),(98,'App\\Models\\User',4,'API Token','e65c98d5f672e0b97c28d05cfc93bd2b7f2cc60691e206c1679a0016cec6630b','[\"*\"]','2025-04-15 00:20:01',NULL,'2025-04-15 00:19:57','2025-04-15 00:20:01'),(99,'App\\Models\\User',8,'API Token','603a3b22a80369e84174517c7ea70c44111e7a218a9b5ad4799857db91cc5ead','[\"*\"]','2025-04-15 00:23:43',NULL,'2025-04-15 00:23:42','2025-04-15 00:23:43'),(100,'App\\Models\\User',5,'API Token','652b927fd0eb789ac870a0815c0abdf39ce9478c7dfdd432598133622009b043','[\"*\"]','2025-04-15 00:51:40',NULL,'2025-04-15 00:30:17','2025-04-15 00:51:40'),(101,'App\\Models\\User',1,'API Token','2c7c6cde1b99d2ef7196ca8df320ef4cdb92fe316249cf4cf7f067376b61e61e','[\"*\"]','2025-04-15 00:53:07',NULL,'2025-04-15 00:53:02','2025-04-15 00:53:07'),(102,'App\\Models\\User',4,'API Token','9c0846ef47cff8a5b3976a15892cb35b5997c0ef456f38b09218d7304e05289e','[\"*\"]','2025-04-15 00:53:24',NULL,'2025-04-15 00:53:16','2025-04-15 00:53:24'),(103,'App\\Models\\User',1,'API Token','2a2783e4c7d96de4debd83b2d556f5e6e3da4ae81675737aa0905d0618c9968b','[\"*\"]','2025-04-15 00:53:37',NULL,'2025-04-15 00:53:33','2025-04-15 00:53:37'),(104,'App\\Models\\User',5,'API Token','ae3ed63f9c5a1c618930d8cd70ad7a14d5defd5f2c9fcf83910289ac3ea6e95d','[\"*\"]','2025-04-15 01:46:01',NULL,'2025-04-15 01:16:48','2025-04-15 01:46:01'),(105,'App\\Models\\User',5,'API Token','70a642365102d194e63380bec16da253dd37e378ab3945a4dad378c89eff2f2d','[\"*\"]',NULL,NULL,'2025-04-15 01:46:35','2025-04-15 01:46:35'),(106,'App\\Models\\User',5,'API Token','031f619e4e248c4d8df529d68c3bcca4f73b4575808a9d13c83610ffebc70fae','[\"*\"]',NULL,NULL,'2025-04-15 01:46:40','2025-04-15 01:46:40'),(107,'App\\Models\\User',5,'API Token','c250392b2c9d5271ce25e6135c566f64294f211c81beb3da1889fc7369e29e4f','[\"*\"]',NULL,NULL,'2025-04-15 01:46:41','2025-04-15 01:46:41'),(108,'App\\Models\\User',5,'API Token','5a39574072874c47b1580b5b68e79c605aef202309eff4f849903914533e59d2','[\"*\"]','2025-04-15 01:50:52',NULL,'2025-04-15 01:46:44','2025-04-15 01:50:52'),(109,'App\\Models\\User',5,'API Token','701931847a09b673f080403642a2a55f270bbad49b4d3ec253eccfad7eba882c','[\"*\"]','2025-04-15 02:10:44',NULL,'2025-04-15 01:51:05','2025-04-15 02:10:44'),(110,'App\\Models\\User',5,'API Token','bd8d27ce33d03294b0ae92fa3c422f8e4bf8191af73725faa22304b09a84a72e','[\"*\"]','2025-05-02 23:02:26',NULL,'2025-04-17 06:27:48','2025-05-02 23:02:26');
/*!40000 ALTER TABLE `personal_access_tokens` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `projects`
--

DROP TABLE IF EXISTS `projects`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `projects` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `projects`
--

LOCK TABLES `projects` WRITE;
/*!40000 ALTER TABLE `projects` DISABLE KEYS */;
/*!40000 ALTER TABLE `projects` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `role_permissions`
--

DROP TABLE IF EXISTS `role_permissions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `role_permissions` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `role_id` bigint unsigned NOT NULL,
  `permission_id` bigint unsigned NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `role_permissions_role_id_foreign` (`role_id`),
  KEY `role_permissions_permission_id_foreign` (`permission_id`),
  CONSTRAINT `role_permissions_permission_id_foreign` FOREIGN KEY (`permission_id`) REFERENCES `permissions` (`id`) ON DELETE CASCADE,
  CONSTRAINT `role_permissions_role_id_foreign` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=81 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `role_permissions`
--

LOCK TABLES `role_permissions` WRITE;
/*!40000 ALTER TABLE `role_permissions` DISABLE KEYS */;
INSERT INTO `role_permissions` VALUES (1,1,1,'2025-03-20 03:47:39','2025-03-20 03:47:39'),(2,1,2,'2025-03-20 03:47:39','2025-03-20 03:47:39'),(3,1,3,'2025-03-20 03:47:39','2025-03-20 03:47:39'),(4,1,4,'2025-03-20 03:47:39','2025-03-20 03:47:39'),(5,1,5,'2025-03-20 03:47:39','2025-03-20 03:47:39'),(6,1,11,'2025-03-20 03:47:39','2025-03-20 03:47:39'),(7,1,12,'2025-03-20 03:47:39','2025-03-20 03:47:39'),(8,1,13,'2025-03-20 03:47:39','2025-03-20 03:47:39'),(9,1,14,'2025-03-20 03:47:39','2025-03-20 03:47:39'),(10,1,15,'2025-03-20 03:47:39','2025-03-20 03:47:39'),(11,1,16,'2025-03-20 03:47:39','2025-03-20 03:47:39'),(12,1,17,'2025-03-20 03:47:39','2025-03-20 03:47:39'),(13,1,18,'2025-03-20 03:47:39','2025-03-20 03:47:39'),(14,1,19,'2025-03-20 03:47:39','2025-03-20 03:47:39'),(15,1,20,'2025-03-20 03:47:39','2025-03-20 03:47:39'),(16,1,21,'2025-03-20 03:47:39','2025-03-20 03:47:39'),(17,1,22,'2025-03-20 03:47:39','2025-03-20 03:47:39'),(18,1,23,'2025-03-20 03:47:39','2025-03-20 03:47:39'),(19,1,24,'2025-03-20 03:47:39','2025-03-20 03:47:39'),(20,1,25,'2025-03-20 03:47:39','2025-03-20 03:47:39'),(21,1,26,'2025-03-20 03:47:39','2025-03-20 03:47:39'),(22,1,27,'2025-03-20 03:47:39','2025-03-20 03:47:39'),(23,1,28,'2025-03-20 03:47:39','2025-03-20 03:47:39'),(24,1,29,'2025-03-20 03:47:39','2025-03-20 03:47:39'),(25,1,30,'2025-03-20 03:47:39','2025-03-20 03:47:39'),(26,2,1,'2025-03-20 03:47:39','2025-03-20 03:47:39'),(27,2,2,'2025-03-20 03:47:39','2025-03-20 03:47:39'),(28,2,3,'2025-03-20 03:47:39','2025-03-20 03:47:39'),(29,2,4,'2025-03-20 03:47:39','2025-03-20 03:47:39'),(30,2,5,'2025-03-20 03:47:39','2025-03-20 03:47:39'),(31,2,6,'2025-03-20 03:47:39','2025-03-20 03:47:39'),(32,2,7,'2025-03-20 03:47:39','2025-03-20 03:47:39'),(33,2,8,'2025-03-20 03:47:39','2025-03-20 03:47:39'),(34,2,9,'2025-03-20 03:47:39','2025-03-20 03:47:39'),(35,2,10,'2025-03-20 03:47:39','2025-03-20 03:47:39'),(36,2,11,'2025-03-20 03:47:39','2025-03-20 03:47:39'),(37,2,12,'2025-03-20 03:47:39','2025-03-20 03:47:39'),(38,2,13,'2025-03-20 03:47:39','2025-03-20 03:47:39'),(39,2,14,'2025-03-20 03:47:39','2025-03-20 03:47:39'),(40,2,15,'2025-03-20 03:47:39','2025-03-20 03:47:39'),(41,2,16,'2025-03-20 03:47:39','2025-03-20 03:47:39'),(42,2,17,'2025-03-20 03:47:39','2025-03-20 03:47:39'),(43,2,18,'2025-03-20 03:47:39','2025-03-20 03:47:39'),(44,2,19,'2025-03-20 03:47:39','2025-03-20 03:47:39'),(45,2,20,'2025-03-20 03:47:39','2025-03-20 03:47:39'),(46,2,21,'2025-03-20 03:47:39','2025-03-20 03:47:39'),(47,2,22,'2025-03-20 03:47:39','2025-03-20 03:47:39'),(48,2,23,'2025-03-20 03:47:39','2025-03-20 03:47:39'),(49,2,24,'2025-03-20 03:47:39','2025-03-20 03:47:39'),(50,2,25,'2025-03-20 03:47:39','2025-03-20 03:47:39'),(51,2,26,'2025-03-20 03:47:39','2025-03-20 03:47:39'),(52,2,27,'2025-03-20 03:47:39','2025-03-20 03:47:39'),(53,2,28,'2025-03-20 03:47:39','2025-03-20 03:47:39'),(54,2,29,'2025-03-20 03:47:39','2025-03-20 03:47:39'),(55,2,30,'2025-03-20 03:47:40','2025-03-20 03:47:40'),(56,3,11,'2025-03-20 03:47:40','2025-03-20 03:47:40'),(57,3,12,'2025-03-20 03:47:40','2025-03-20 03:47:40'),(58,3,13,'2025-03-20 03:47:40','2025-03-20 03:47:40'),(59,3,14,'2025-03-20 03:47:40','2025-03-20 03:47:40'),(60,3,15,'2025-03-20 03:47:40','2025-03-20 03:47:40'),(61,3,16,'2025-03-20 03:47:40','2025-03-20 03:47:40'),(62,3,17,'2025-03-20 03:47:40','2025-03-20 03:47:40'),(63,3,18,'2025-03-20 03:47:40','2025-03-20 03:47:40'),(64,3,19,'2025-03-20 03:47:40','2025-03-20 03:47:40'),(65,3,20,'2025-03-20 03:47:40','2025-03-20 03:47:40'),(66,3,21,'2025-03-20 03:47:40','2025-03-20 03:47:40'),(67,3,22,'2025-03-20 03:47:40','2025-03-20 03:47:40'),(68,3,23,'2025-03-20 03:47:40','2025-03-20 03:47:40'),(69,3,24,'2025-03-20 03:47:40','2025-03-20 03:47:40'),(70,3,25,'2025-03-20 03:47:40','2025-03-20 03:47:40'),(71,4,16,'2025-03-20 03:47:40','2025-03-20 03:47:40'),(72,4,17,'2025-03-20 03:47:40','2025-03-20 03:47:40'),(73,4,18,'2025-03-20 03:47:40','2025-03-20 03:47:40'),(74,4,19,'2025-03-20 03:47:40','2025-03-20 03:47:40'),(75,4,20,'2025-03-20 03:47:40','2025-03-20 03:47:40'),(76,5,21,'2025-03-20 03:47:40','2025-03-20 03:47:40'),(77,5,22,'2025-03-20 03:47:40','2025-03-20 03:47:40'),(78,5,23,'2025-03-20 03:47:40','2025-03-20 03:47:40'),(79,5,24,'2025-03-20 03:47:40','2025-03-20 03:47:40'),(80,5,25,'2025-03-20 03:47:40','2025-03-20 03:47:40');
/*!40000 ALTER TABLE `role_permissions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `roles`
--

DROP TABLE IF EXISTS `roles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `roles` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `roles`
--

LOCK TABLES `roles` WRITE;
/*!40000 ALTER TABLE `roles` DISABLE KEYS */;
INSERT INTO `roles` VALUES (1,'Admin','2025-03-20 03:47:39','2025-03-20 03:47:39'),(2,'Auth','2025-03-20 03:47:39','2025-03-20 03:47:39'),(3,'Manager','2025-03-20 03:47:39','2025-03-20 03:47:39'),(4,'Client','2025-03-20 03:47:39','2025-03-20 03:47:39'),(5,'User','2025-03-20 03:47:39','2025-03-20 03:47:39');
/*!40000 ALTER TABLE `roles` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `sessions`
--

DROP TABLE IF EXISTS `sessions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `sessions` (
  `id` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_id` bigint unsigned DEFAULT NULL,
  `ip_address` varchar(45) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `user_agent` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `payload` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `last_activity` int NOT NULL,
  PRIMARY KEY (`id`),
  KEY `sessions_user_id_index` (`user_id`),
  KEY `sessions_last_activity_index` (`last_activity`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sessions`
--

LOCK TABLES `sessions` WRITE;
/*!40000 ALTER TABLE `sessions` DISABLE KEYS */;
/*!40000 ALTER TABLE `sessions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user_assignments`
--

DROP TABLE IF EXISTS `user_assignments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_assignments` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `user_id` bigint unsigned NOT NULL,
  `assignment_id` bigint unsigned NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `user_assignments_user_id_foreign` (`user_id`),
  KEY `user_assignments_assignment_id_foreign` (`assignment_id`),
  CONSTRAINT `user_assignments_assignment_id_foreign` FOREIGN KEY (`assignment_id`) REFERENCES `assignments` (`id`) ON DELETE CASCADE,
  CONSTRAINT `user_assignments_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_assignments`
--

LOCK TABLES `user_assignments` WRITE;
/*!40000 ALTER TABLE `user_assignments` DISABLE KEYS */;
/*!40000 ALTER TABLE `user_assignments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user_company`
--

DROP TABLE IF EXISTS `user_company`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_company` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `user_id` bigint unsigned NOT NULL,
  `company_id` bigint unsigned NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `user_company_user_id_foreign` (`user_id`),
  KEY `user_company_company_id_foreign` (`company_id`),
  CONSTRAINT `user_company_company_id_foreign` FOREIGN KEY (`company_id`) REFERENCES `companies` (`id`) ON DELETE CASCADE,
  CONSTRAINT `user_company_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_company`
--

LOCK TABLES `user_company` WRITE;
/*!40000 ALTER TABLE `user_company` DISABLE KEYS */;
INSERT INTO `user_company` VALUES (1,1,1,'2025-03-20 03:47:41','2025-03-20 03:47:41'),(2,2,1,'2025-03-20 03:47:41','2025-03-20 03:47:41'),(3,3,1,'2025-03-20 03:47:41','2025-03-20 03:47:41'),(4,4,1,'2025-03-20 03:47:41','2025-03-20 03:47:41'),(5,5,1,'2025-03-20 03:47:41','2025-03-20 03:47:41'),(6,6,1,'2025-03-20 03:47:41','2025-03-20 03:47:41'),(7,7,1,'2025-03-20 03:47:41','2025-03-20 03:47:41'),(8,8,1,'2025-03-20 03:47:41','2025-03-20 03:47:41');
/*!40000 ALTER TABLE `user_company` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user_roles`
--

DROP TABLE IF EXISTS `user_roles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_roles` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `user_id` bigint unsigned NOT NULL,
  `role_id` bigint unsigned NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `user_roles_user_id_foreign` (`user_id`),
  KEY `user_roles_role_id_foreign` (`role_id`),
  CONSTRAINT `user_roles_role_id_foreign` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`) ON DELETE CASCADE,
  CONSTRAINT `user_roles_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_roles`
--

LOCK TABLES `user_roles` WRITE;
/*!40000 ALTER TABLE `user_roles` DISABLE KEYS */;
INSERT INTO `user_roles` VALUES (2,2,3,'2025-03-20 03:47:41','2025-03-20 03:47:41'),(3,3,3,'2025-03-20 03:47:41','2025-03-20 03:47:41'),(4,4,1,'2025-03-20 03:47:41','2025-03-20 03:47:41'),(5,5,2,'2025-03-20 03:47:41','2025-03-20 03:47:41'),(6,6,3,'2025-03-20 03:47:41','2025-03-20 03:47:41'),(7,7,4,'2025-03-20 03:47:41','2025-03-20 03:47:41'),(8,8,5,'2025-03-20 03:47:41','2025-03-20 03:47:41'),(11,1,1,NULL,NULL);
/*!40000 ALTER TABLE `user_roles` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `email_verified_at` timestamp NULL DEFAULT NULL,
  `password` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `remember_token` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `password_reset_required` tinyint(1) NOT NULL DEFAULT '1',
  PRIMARY KEY (`id`),
  UNIQUE KEY `users_email_unique` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'Sophie','sophie@freynet-gagne.com',NULL,'$2y$12$iKPr853tc51vMLF5lBWPzel2PdewaxPU4/vRCLRuEhT1h7YlcLr8u',NULL,'2025-03-17 08:24:29','2025-03-17 08:24:29',1),(2,'Jean-Paul','Jean-paul@freynet-gagne.com',NULL,'$2y$12$R/rjiDkvdDskdtXaqSd/0O1vt1co3bVhcEvby5af5QJP3ixaOpDhe',NULL,'2025-03-17 08:24:29','2025-03-17 08:24:29',1),(3,'Maya','maya@freynet-gagne.com',NULL,'$2y$12$bBCXUIaIYgXcVm9mlMC3Ze.HRMy4uPyy.9.41U49qsD3nQ7ror0gG',NULL,'2025-03-17 08:24:29','2025-03-17 08:24:29',1),(4,'admin','admin@admin.com',NULL,'$2y$12$kz9Quz6q3j9AE/sJY.gqd.Zv/G4Cs4SvwlugAa8Xi6Tn52jIGKOoy',NULL,'2025-03-17 08:24:29','2025-03-17 08:24:29',1),(5,'auth','auth@auth.com',NULL,'$2y$12$u6lLJEncTEVNnpUoL7romeBGhtgzOugMm3w5/8YYu68AyJubfXsGC',NULL,'2025-03-17 08:24:29','2025-03-17 08:24:29',1),(6,'manager','manager@manager.com',NULL,'$2y$12$5wTuf0GYV0vuvTshHldGNelEOEeIpv1GnymPshKCJI.Nstq1wTVDm',NULL,'2025-03-17 08:24:29','2025-03-17 08:24:29',1),(7,'client','client@client.com',NULL,'$2y$12$k2hlH4fIIyOt4tRtTFzHPe80xZdfZYu2Z7AytmTjJZEOVJ7/K5ch2',NULL,'2025-03-17 08:24:29','2025-03-17 08:24:29',1),(8,'user','user@user.com',NULL,'$2y$12$4FpxGPNPkIC3Az3RSwWafeTlLiANmA5ZrnI0RuTsYvWCxAHDU1bkO',NULL,'2025-03-17 08:24:29','2025-03-17 08:24:29',1);
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-05-02 11:17:53
