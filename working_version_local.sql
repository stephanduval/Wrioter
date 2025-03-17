-- MySQL dump 10.13  Distrib 8.0.41, for Linux (x86_64)
--
-- Host: localhost    Database: laravelweb_db
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
  `filename` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `path` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `mime_type` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `size` bigint NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `attachments_message_id_foreign` (`message_id`),
  CONSTRAINT `attachments_message_id_foreign` FOREIGN KEY (`message_id`) REFERENCES `messages` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `attachments`
--

LOCK TABLES `attachments` WRITE;
/*!40000 ALTER TABLE `attachments` DISABLE KEYS */;
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
) ENGINE=InnoDB AUTO_INCREMENT=149 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `companies`
--

LOCK TABLES `companies` WRITE;
/*!40000 ALTER TABLE `companies` DISABLE KEYS */;
INSERT INTO `companies` VALUES (1,'Freynet-Gagné','2025-03-17 06:19:09','2025-03-17 06:19:09'),(2,'Brenden Achtemiuk','2025-03-17 06:19:09','2025-03-17 06:19:09'),(3,'CDEM','2025-03-17 06:19:09','2025-03-17 06:19:09'),(4,'Centre de santé','2025-03-17 06:19:09','2025-03-17 06:19:09'),(5,'Editing Services','2025-03-17 06:19:09','2025-03-17 06:19:09'),(6,'FAJEF','2025-03-17 06:19:09','2025-03-17 06:19:09'),(7,'FLMM','2025-03-17 06:19:09','2025-03-17 06:19:09'),(8,'Kigaana Productions','2025-03-17 06:19:09','2025-03-17 06:19:09'),(9,'LMIC','2025-03-17 06:19:09','2025-03-17 06:19:09'),(10,'Magnify Digital','2025-03-17 06:19:09','2025-03-17 06:19:09'),(11,'Manito LFC 2 INC.','2025-03-17 06:19:09','2025-03-17 06:19:09'),(12,'Manitoba Metis Federation','2025-03-17 06:19:09','2025-03-17 06:19:09'),(13,'Manitoba Teachers\' Society','2025-03-17 06:19:09','2025-03-17 06:19:09'),(14,'MANSO','2025-03-17 06:19:09','2025-03-17 06:19:09'),(15,'NANB','2025-03-17 06:19:09','2025-03-17 06:19:09'),(16,'National Gallery of Canada','2025-03-17 06:19:09','2025-03-17 06:19:09'),(17,'Peaceful Ronin Media','2025-03-17 06:19:09','2025-03-17 06:19:09'),(18,'Print Studio One PO 27085','2025-03-17 06:19:09','2025-03-17 06:19:09'),(19,'Réseau Compassion Network','2025-03-17 06:19:09','2025-03-17 06:19:09'),(20,'Roberto Bocangel','2025-03-17 06:19:09','2025-03-17 06:19:09'),(21,'RTAM','2025-03-17 06:19:09','2025-03-17 06:19:09'),(22,'RWB','2025-03-17 06:19:09','2025-03-17 06:19:09'),(23,'Santé en français','2025-03-17 06:19:09','2025-03-17 06:19:09'),(24,'Tiber River','2025-03-17 06:19:09','2025-03-17 06:19:09'),(25,'Travel Manitoba','2025-03-17 06:19:09','2025-03-17 06:19:09'),(26,'Université de Saint-Boniface','2025-03-17 06:19:09','2025-03-17 06:19:09'),(27,'University of Manitoba','2025-03-17 06:19:09','2025-03-17 06:19:09'),(28,'Ville de Winnipeg','2025-03-17 06:19:09','2025-03-17 06:19:09'),(29,'MWEC','2025-03-17 06:19:09','2025-03-17 06:19:09'),(30,'WEM','2025-03-17 06:19:09','2025-03-17 06:19:09'),(31,'WEOC','2025-03-17 06:19:09','2025-03-17 06:19:09'),(32,'Winnipeg Arts Council','2025-03-17 06:19:09','2025-03-17 06:19:09'),(33,'Centre de Renouveau Aulneau','2025-03-17 06:19:09','2025-03-17 06:19:09'),(34,'CFEE','2025-03-17 06:19:09','2025-03-17 06:19:09'),(35,'Deposit Guarantee Corporation of Manitoba','2025-03-17 06:19:09','2025-03-17 06:19:09'),(36,'FortWhyte Alive','2025-03-17 06:19:09','2025-03-17 06:19:09'),(37,'ISED','2025-03-17 06:19:09','2025-03-17 06:19:09'),(38,'Jessica Meza Resillas','2025-03-17 06:19:09','2025-03-17 06:19:09'),(39,'Johnston Group','2025-03-17 06:19:09','2025-03-17 06:19:09'),(40,'Manitoba Housing','2025-03-17 06:19:09','2025-03-17 06:19:09'),(41,'Manitoba School Boards','2025-03-17 06:19:09','2025-03-17 06:19:09'),(42,'Matrix Group Publishing','2025-03-17 06:19:09','2025-03-17 06:19:09'),(43,'NNAS','2025-03-17 06:19:09','2025-03-17 06:19:09'),(44,'Patrick Lessard','2025-03-17 06:19:09','2025-03-17 06:19:09'),(45,'Peak of the Market','2025-03-17 06:19:09','2025-03-17 06:19:09'),(46,'Probe Research','2025-03-17 06:19:09','2025-03-17 06:19:09'),(47,'SFM','2025-03-17 06:19:09','2025-03-17 06:19:09'),(48,'Taro PR','2025-03-17 06:19:09','2025-03-17 06:19:09'),(49,'Wookey Films','2025-03-17 06:19:09','2025-03-17 06:19:09'),(50,'Alamos Gold Inc.','2025-03-17 06:19:09','2025-03-17 06:19:09'),(51,'Canadian Home Economics Fondation','2025-03-17 06:19:09','2025-03-17 06:19:09'),(52,'Conseil des arts','2025-03-17 06:19:09','2025-03-17 06:19:09'),(53,'Enjoy Creative','2025-03-17 06:19:09','2025-03-17 06:19:09'),(54,'Event Camp','2025-03-17 06:19:09','2025-03-17 06:19:09'),(55,'Livres Canada Books','2025-03-17 06:19:09','2025-03-17 06:19:09'),(56,'Lorraine Prefontaine (varia)','2025-03-17 06:19:09','2025-03-17 06:19:09'),(57,'MB School Boards','2025-03-17 06:19:09','2025-03-17 06:19:09'),(58,'TR PO 465390','2025-03-17 06:19:09','2025-03-17 06:19:09'),(59,'Wawanesa','2025-03-17 06:19:09','2025-03-17 06:19:09'),(60,'WSP','2025-03-17 06:19:09','2025-03-17 06:19:09'),(61,'Apprentissage Illimité','2025-03-17 06:19:09','2025-03-17 06:19:09'),(62,'Association de la Neurofibromatose du Québec','2025-03-17 06:19:09','2025-03-17 06:19:09'),(63,'Conseil des arts du Canada','2025-03-17 06:19:09','2025-03-17 06:19:09'),(64,'Creative Manitoba','2025-03-17 06:19:09','2025-03-17 06:19:09'),(65,'Fondation','2025-03-17 06:19:09','2025-03-17 06:19:09'),(66,'LRSD Indigenous Education Team','2025-03-17 06:19:09','2025-03-17 06:19:09'),(67,'Luiz Nunes','2025-03-17 06:19:09','2025-03-17 06:19:09'),(68,'Matrix Group Publish','2025-03-17 06:19:09','2025-03-17 06:19:09'),(69,'Alberta Education','2025-03-17 06:19:09','2025-03-17 06:19:09'),(70,'Assiniboine Park Conservancy','2025-03-17 06:19:09','2025-03-17 06:19:09'),(71,'Brodi Restaurants Ltd.','2025-03-17 06:19:09','2025-03-17 06:19:09'),(72,'Chronic Centre for Veterans','2025-03-17 06:19:09','2025-03-17 06:19:09'),(73,'FMRI','2025-03-17 06:19:09','2025-03-17 06:19:09'),(74,'Heatmaster','2025-03-17 06:19:09','2025-03-17 06:19:09'),(75,'Hôpital Général Saint-Boniface','2025-03-17 06:19:09','2025-03-17 06:19:09'),(76,'MBLL','2025-03-17 06:19:09','2025-03-17 06:19:09'),(77,'Pollard','2025-03-17 06:19:09','2025-03-17 06:19:09'),(78,'Richardson International','2025-03-17 06:19:09','2025-03-17 06:19:09'),(79,'Stantec','2025-03-17 06:19:09','2025-03-17 06:19:09'),(80,'Stories for Caregivers','2025-03-17 06:19:09','2025-03-17 06:19:09'),(81,'The Cover Guy','2025-03-17 06:19:09','2025-03-17 06:19:09'),(82,'University of Manitoba PO 468744','2025-03-17 06:19:09','2025-03-17 06:19:09'),(83,'Urban Shaman Contemporary Aboriginal Art','2025-03-17 06:19:09','2025-03-17 06:19:09'),(84,'Wearecinco','2025-03-17 06:19:09','2025-03-17 06:19:09'),(85,'Wilmar Ariza','2025-03-17 06:19:09','2025-03-17 06:19:09'),(86,'Winnipeg School Division','2025-03-17 06:19:09','2025-03-17 06:19:09'),(87,'Bureau du conseil Privé','2025-03-17 06:19:09','2025-03-17 06:19:09'),(88,'Canada Council for the Arts','2025-03-17 06:19:09','2025-03-17 06:19:09'),(89,'Manitoba School Boards Association','2025-03-17 06:19:09','2025-03-17 06:19:09'),(90,'Musée canadien Pour les Droits de la Personne','2025-03-17 06:19:09','2025-03-17 06:19:09'),(91,'Savoir Montfort','2025-03-17 06:19:09','2025-03-17 06:19:09'),(92,'SodaStream','2025-03-17 06:19:09','2025-03-17 06:19:09'),(93,'St.Amant','2025-03-17 06:19:09','2025-03-17 06:19:09'),(94,'UpHouse','2025-03-17 06:19:09','2025-03-17 06:19:09'),(95,'Alliance catholique canadienne de la santé','2025-03-17 06:19:09','2025-03-17 06:19:09'),(96,'Baltic Brothers','2025-03-17 06:19:09','2025-03-17 06:19:09'),(97,'Bounce Design','2025-03-17 06:19:09','2025-03-17 06:19:09'),(98,'Centre national d\'excellence sur la douleur chronique pour les vétérans canadiens','2025-03-17 06:19:09','2025-03-17 06:19:09'),(99,'EDAC','2025-03-17 06:19:09','2025-03-17 06:19:09'),(100,'G3 Canada Limited','2025-03-17 06:19:09','2025-03-17 06:19:09'),(101,'Guy Dumont','2025-03-17 06:19:09','2025-03-17 06:19:09'),(102,'Manitoba Association of Optometrists','2025-03-17 06:19:09','2025-03-17 06:19:09'),(103,'Paula Isaak','2025-03-17 06:19:09','2025-03-17 06:19:09'),(104,'Rémi Courcelles','2025-03-17 06:19:09','2025-03-17 06:19:09'),(105,'Agriculture in the Classroom-Manitoba','2025-03-17 06:19:09','2025-03-17 06:19:09'),(106,'All Seniors Care Living Centres Inc','2025-03-17 06:19:09','2025-03-17 06:19:09'),(107,'Animal Health Canada','2025-03-17 06:19:09','2025-03-17 06:19:09'),(108,'Castle Health','2025-03-17 06:19:09','2025-03-17 06:19:09'),(109,'Eupraxia Training','2025-03-17 06:19:09','2025-03-17 06:19:09'),(110,'FCFM','2025-03-17 06:19:09','2025-03-17 06:19:09'),(111,'Heritage Winnipeg','2025-03-17 06:19:09','2025-03-17 06:19:09'),(112,'Manitoba child care association','2025-03-17 06:19:09','2025-03-17 06:19:09'),(113,'PADRAIG','2025-03-17 06:19:09','2025-03-17 06:19:09'),(114,'Phonique média','2025-03-17 06:19:09','2025-03-17 06:19:09'),(115,'pipikwan Pêhtâkwan','2025-03-17 06:19:09','2025-03-17 06:19:09'),(116,'PVLIP','2025-03-17 06:19:09','2025-03-17 06:19:09'),(117,'Bounce','2025-03-17 06:19:09','2025-03-17 06:19:09'),(118,'Chronic Pain Centre of Excellence','2025-03-17 06:19:09','2025-03-17 06:19:09'),(119,'Direct Focus','2025-03-17 06:19:09','2025-03-17 06:19:09'),(120,'LCTaylor','2025-03-17 06:19:09','2025-03-17 06:19:09'),(121,'Louisiana Department of Education','2025-03-17 06:19:09','2025-03-17 06:19:09'),(122,'Pembina Trails School Division','2025-03-17 06:19:09','2025-03-17 06:19:09'),(123,'Provincial Court of Saskatchewan','2025-03-17 06:19:09','2025-03-17 06:19:09'),(124,'Sapphire Springs Inc.','2025-03-17 06:19:09','2025-03-17 06:19:09'),(125,'Sophie Bissonnette','2025-03-17 06:19:09','2025-03-17 06:19:09'),(126,'Canadian Museum Human Rights PO 1029122','2025-03-17 06:19:09','2025-03-17 06:19:09'),(127,'Centre Scolaire Centre Nord','2025-03-17 06:19:09','2025-03-17 06:19:09'),(128,'MBLL - HR','2025-03-17 06:19:09','2025-03-17 06:19:09'),(129,'Mustafa Elmi','2025-03-17 06:19:09','2025-03-17 06:19:09'),(130,'Roadwest Pictures','2025-03-17 06:19:09','2025-03-17 06:19:09'),(131,'Shared Health MB','2025-03-17 06:19:09','2025-03-17 06:19:09'),(132,'ViewSource Media','2025-03-17 06:19:09','2025-03-17 06:19:09'),(133,'After Caregiving','2025-03-17 06:19:09','2025-03-17 06:19:09'),(134,'Génome Canada','2025-03-17 06:19:09','2025-03-17 06:19:09'),(135,'NCTR','2025-03-17 06:19:09','2025-03-17 06:19:09'),(136,'Urbanink','2025-03-17 06:19:09','2025-03-17 06:19:09'),(137,'Roll Focus','2025-03-17 06:19:09','2025-03-17 06:19:09'),(138,'Pascale Kihn','2025-03-17 06:19:09','2025-03-17 06:19:09'),(139,'George & Fay Yee Centre for Healthcare Innovation','2025-03-17 06:19:09','2025-03-17 06:19:09'),(140,'Sem Ltd.','2025-03-17 06:19:09','2025-03-17 06:19:09'),(141,'Great Plains Publishing','2025-03-17 06:19:09','2025-03-17 06:19:09'),(142,'PROJETS EN ATTENTE','2025-03-17 06:19:09','2025-03-17 06:19:09'),(143,'Louis Riel Institute','2025-03-17 06:19:09','2025-03-17 06:19:09'),(144,'On Screen Manitoba','2025-03-17 06:19:09','2025-03-17 06:19:09'),(145,'Mangrove','2025-03-17 06:19:09','2025-03-17 06:19:09'),(146,'Economic Development Winnipeg (Tourism Wpg & YES! WPG)','2025-03-17 06:19:09','2025-03-17 06:19:09'),(147,'Spadrole','2025-03-17 06:19:09','2025-03-17 06:19:09'),(148,'Université du Manitoba','2025-03-17 06:19:09','2025-03-17 06:19:09');
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
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `labels_user_id_foreign` (`user_id`),
  CONSTRAINT `labels_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `labels`
--

LOCK TABLES `labels` WRITE;
/*!40000 ALTER TABLE `labels` DISABLE KEYS */;
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `message_labels`
--

LOCK TABLES `message_labels` WRITE;
/*!40000 ALTER TABLE `message_labels` DISABLE KEYS */;
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
  `company_id` bigint unsigned NOT NULL,
  `assignment_id` bigint unsigned DEFAULT NULL,
  `project_id` bigint unsigned DEFAULT NULL,
  `subject` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `body` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `reply_to_id` bigint unsigned DEFAULT NULL,
  `status` enum('draft','archived','deleted','inbox') COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `messages_sender_id_foreign` (`sender_id`),
  KEY `messages_company_id_foreign` (`company_id`),
  KEY `messages_assignment_id_foreign` (`assignment_id`),
  KEY `messages_project_id_foreign` (`project_id`),
  KEY `messages_reply_to_id_foreign` (`reply_to_id`),
  CONSTRAINT `messages_assignment_id_foreign` FOREIGN KEY (`assignment_id`) REFERENCES `assignments` (`id`) ON DELETE CASCADE,
  CONSTRAINT `messages_company_id_foreign` FOREIGN KEY (`company_id`) REFERENCES `companies` (`id`) ON DELETE CASCADE,
  CONSTRAINT `messages_project_id_foreign` FOREIGN KEY (`project_id`) REFERENCES `projects` (`id`) ON DELETE CASCADE,
  CONSTRAINT `messages_reply_to_id_foreign` FOREIGN KEY (`reply_to_id`) REFERENCES `messages` (`id`) ON DELETE CASCADE,
  CONSTRAINT `messages_sender_id_foreign` FOREIGN KEY (`sender_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `messages`
--

LOCK TABLES `messages` WRITE;
/*!40000 ALTER TABLE `messages` DISABLE KEYS */;
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
) ENGINE=InnoDB AUTO_INCREMENT=21 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `migrations`
--

LOCK TABLES `migrations` WRITE;
/*!40000 ALTER TABLE `migrations` DISABLE KEYS */;
INSERT INTO `migrations` VALUES (1,'0001_01_01_000000_create_users_table',1),(2,'0001_01_01_000001_create_cache_table',1),(3,'0001_01_01_000002_create_jobs_table',1),(4,'2024_10_14_191341_create_personal_access_tokens_table',1),(5,'2024_10_31_171426_create_permissions_table',1),(6,'2024_10_31_171504_create_roles_table',1),(7,'2024_10_31_171522_create_role_permissions_table',1),(8,'2024_10_31_171540_create_user_roles_table',1),(9,'2024_11_19_180625_create_companies_table',1),(10,'2024_11_19_181147_create_user_company_table',1),(11,'2024_11_19_184318_create_assignments_table',1),(12,'2024_11_19_185017_create_user_assignments_table',1),(13,'2024_11_23_031504_add_password_reset_required_to_users_table',1),(14,'2024_12_05_135714_create_projects_table',1),(15,'2024_12_05_135722_create_messages_table',1),(16,'2024_12_05_140737_create_message_labels_and_statuses_tables',1),(17,'2025_03_12_190930_create_attachments_table',1),(18,'2025_03_12_213152_modify_assignment_id_nullable_in_messages',1),(19,'2025_03_12_213511_modify_project_id_nullable_in_messages',1),(20,'2025_03_15_190918_modify_status_enum_in_messages_table',2);
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
INSERT INTO `permissions` VALUES (1,'create','admin','2025-03-17 06:19:08','2025-03-17 06:19:08'),(2,'read','admin','2025-03-17 06:19:08','2025-03-17 06:19:08'),(3,'update','admin','2025-03-17 06:19:08','2025-03-17 06:19:08'),(4,'delete','admin','2025-03-17 06:19:08','2025-03-17 06:19:08'),(5,'manage','admin','2025-03-17 06:19:08','2025-03-17 06:19:08'),(6,'create','auth','2025-03-17 06:19:08','2025-03-17 06:19:08'),(7,'read','auth','2025-03-17 06:19:08','2025-03-17 06:19:08'),(8,'update','auth','2025-03-17 06:19:08','2025-03-17 06:19:08'),(9,'delete','auth','2025-03-17 06:19:08','2025-03-17 06:19:08'),(10,'manage','auth','2025-03-17 06:19:08','2025-03-17 06:19:08'),(11,'create','manager','2025-03-17 06:19:08','2025-03-17 06:19:08'),(12,'read','manager','2025-03-17 06:19:08','2025-03-17 06:19:08'),(13,'update','manager','2025-03-17 06:19:08','2025-03-17 06:19:08'),(14,'delete','manager','2025-03-17 06:19:08','2025-03-17 06:19:08'),(15,'manage','manager','2025-03-17 06:19:08','2025-03-17 06:19:08'),(16,'create','client','2025-03-17 06:19:08','2025-03-17 06:19:08'),(17,'read','client','2025-03-17 06:19:08','2025-03-17 06:19:08'),(18,'update','client','2025-03-17 06:19:08','2025-03-17 06:19:08'),(19,'delete','client','2025-03-17 06:19:08','2025-03-17 06:19:08'),(20,'manage','client','2025-03-17 06:19:08','2025-03-17 06:19:08'),(21,'create','user','2025-03-17 06:19:08','2025-03-17 06:19:08'),(22,'read','user','2025-03-17 06:19:08','2025-03-17 06:19:08'),(23,'update','user','2025-03-17 06:19:08','2025-03-17 06:19:08'),(24,'delete','user','2025-03-17 06:19:08','2025-03-17 06:19:08'),(25,'manage','user','2025-03-17 06:19:08','2025-03-17 06:19:08'),(26,'create','all','2025-03-17 06:19:08','2025-03-17 06:19:08'),(27,'read','all','2025-03-17 06:19:08','2025-03-17 06:19:08'),(28,'update','all','2025-03-17 06:19:08','2025-03-17 06:19:08'),(29,'delete','all','2025-03-17 06:19:08','2025-03-17 06:19:08'),(30,'manage','all','2025-03-17 06:19:08','2025-03-17 06:19:08');
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
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `personal_access_tokens`
--

LOCK TABLES `personal_access_tokens` WRITE;
/*!40000 ALTER TABLE `personal_access_tokens` DISABLE KEYS */;
INSERT INTO `personal_access_tokens` VALUES (1,'App\\Models\\User',5,'API Token','bbe0cd223e73f596eff2fdfe74e836217072c3a389cc2b24288d33ac85e86b85','[\"*\"]',NULL,NULL,'2025-03-17 06:19:22','2025-03-17 06:19:22');
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
INSERT INTO `role_permissions` VALUES (1,1,1,'2025-03-17 06:19:09','2025-03-17 06:19:09'),(2,1,2,'2025-03-17 06:19:09','2025-03-17 06:19:09'),(3,1,3,'2025-03-17 06:19:09','2025-03-17 06:19:09'),(4,1,4,'2025-03-17 06:19:09','2025-03-17 06:19:09'),(5,1,5,'2025-03-17 06:19:09','2025-03-17 06:19:09'),(6,1,11,'2025-03-17 06:19:09','2025-03-17 06:19:09'),(7,1,12,'2025-03-17 06:19:09','2025-03-17 06:19:09'),(8,1,13,'2025-03-17 06:19:09','2025-03-17 06:19:09'),(9,1,14,'2025-03-17 06:19:09','2025-03-17 06:19:09'),(10,1,15,'2025-03-17 06:19:09','2025-03-17 06:19:09'),(11,1,16,'2025-03-17 06:19:09','2025-03-17 06:19:09'),(12,1,17,'2025-03-17 06:19:09','2025-03-17 06:19:09'),(13,1,18,'2025-03-17 06:19:09','2025-03-17 06:19:09'),(14,1,19,'2025-03-17 06:19:09','2025-03-17 06:19:09'),(15,1,20,'2025-03-17 06:19:09','2025-03-17 06:19:09'),(16,1,21,'2025-03-17 06:19:09','2025-03-17 06:19:09'),(17,1,22,'2025-03-17 06:19:09','2025-03-17 06:19:09'),(18,1,23,'2025-03-17 06:19:09','2025-03-17 06:19:09'),(19,1,24,'2025-03-17 06:19:09','2025-03-17 06:19:09'),(20,1,25,'2025-03-17 06:19:09','2025-03-17 06:19:09'),(21,1,26,'2025-03-17 06:19:09','2025-03-17 06:19:09'),(22,1,27,'2025-03-17 06:19:09','2025-03-17 06:19:09'),(23,1,28,'2025-03-17 06:19:09','2025-03-17 06:19:09'),(24,1,29,'2025-03-17 06:19:09','2025-03-17 06:19:09'),(25,1,30,'2025-03-17 06:19:09','2025-03-17 06:19:09'),(26,2,1,'2025-03-17 06:19:09','2025-03-17 06:19:09'),(27,2,2,'2025-03-17 06:19:09','2025-03-17 06:19:09'),(28,2,3,'2025-03-17 06:19:09','2025-03-17 06:19:09'),(29,2,4,'2025-03-17 06:19:09','2025-03-17 06:19:09'),(30,2,5,'2025-03-17 06:19:09','2025-03-17 06:19:09'),(31,2,6,'2025-03-17 06:19:09','2025-03-17 06:19:09'),(32,2,7,'2025-03-17 06:19:09','2025-03-17 06:19:09'),(33,2,8,'2025-03-17 06:19:09','2025-03-17 06:19:09'),(34,2,9,'2025-03-17 06:19:09','2025-03-17 06:19:09'),(35,2,10,'2025-03-17 06:19:09','2025-03-17 06:19:09'),(36,2,11,'2025-03-17 06:19:09','2025-03-17 06:19:09'),(37,2,12,'2025-03-17 06:19:09','2025-03-17 06:19:09'),(38,2,13,'2025-03-17 06:19:09','2025-03-17 06:19:09'),(39,2,14,'2025-03-17 06:19:09','2025-03-17 06:19:09'),(40,2,15,'2025-03-17 06:19:09','2025-03-17 06:19:09'),(41,2,16,'2025-03-17 06:19:09','2025-03-17 06:19:09'),(42,2,17,'2025-03-17 06:19:09','2025-03-17 06:19:09'),(43,2,18,'2025-03-17 06:19:09','2025-03-17 06:19:09'),(44,2,19,'2025-03-17 06:19:09','2025-03-17 06:19:09'),(45,2,20,'2025-03-17 06:19:09','2025-03-17 06:19:09'),(46,2,21,'2025-03-17 06:19:09','2025-03-17 06:19:09'),(47,2,22,'2025-03-17 06:19:09','2025-03-17 06:19:09'),(48,2,23,'2025-03-17 06:19:09','2025-03-17 06:19:09'),(49,2,24,'2025-03-17 06:19:09','2025-03-17 06:19:09'),(50,2,25,'2025-03-17 06:19:09','2025-03-17 06:19:09'),(51,2,26,'2025-03-17 06:19:09','2025-03-17 06:19:09'),(52,2,27,'2025-03-17 06:19:09','2025-03-17 06:19:09'),(53,2,28,'2025-03-17 06:19:09','2025-03-17 06:19:09'),(54,2,29,'2025-03-17 06:19:09','2025-03-17 06:19:09'),(55,2,30,'2025-03-17 06:19:09','2025-03-17 06:19:09'),(56,3,11,'2025-03-17 06:19:09','2025-03-17 06:19:09'),(57,3,12,'2025-03-17 06:19:09','2025-03-17 06:19:09'),(58,3,13,'2025-03-17 06:19:09','2025-03-17 06:19:09'),(59,3,14,'2025-03-17 06:19:09','2025-03-17 06:19:09'),(60,3,15,'2025-03-17 06:19:09','2025-03-17 06:19:09'),(61,3,16,'2025-03-17 06:19:09','2025-03-17 06:19:09'),(62,3,17,'2025-03-17 06:19:09','2025-03-17 06:19:09'),(63,3,18,'2025-03-17 06:19:09','2025-03-17 06:19:09'),(64,3,19,'2025-03-17 06:19:09','2025-03-17 06:19:09'),(65,3,20,'2025-03-17 06:19:09','2025-03-17 06:19:09'),(66,3,21,'2025-03-17 06:19:09','2025-03-17 06:19:09'),(67,3,22,'2025-03-17 06:19:09','2025-03-17 06:19:09'),(68,3,23,'2025-03-17 06:19:09','2025-03-17 06:19:09'),(69,3,24,'2025-03-17 06:19:09','2025-03-17 06:19:09'),(70,3,25,'2025-03-17 06:19:09','2025-03-17 06:19:09'),(71,4,16,'2025-03-17 06:19:09','2025-03-17 06:19:09'),(72,4,17,'2025-03-17 06:19:09','2025-03-17 06:19:09'),(73,4,18,'2025-03-17 06:19:09','2025-03-17 06:19:09'),(74,4,19,'2025-03-17 06:19:09','2025-03-17 06:19:09'),(75,4,20,'2025-03-17 06:19:09','2025-03-17 06:19:09'),(76,5,21,'2025-03-17 06:19:09','2025-03-17 06:19:09'),(77,5,22,'2025-03-17 06:19:09','2025-03-17 06:19:09'),(78,5,23,'2025-03-17 06:19:09','2025-03-17 06:19:09'),(79,5,24,'2025-03-17 06:19:09','2025-03-17 06:19:09'),(80,5,25,'2025-03-17 06:19:09','2025-03-17 06:19:09');
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
INSERT INTO `roles` VALUES (1,'Admin','2025-03-17 06:19:08','2025-03-17 06:19:08'),(2,'Auth','2025-03-17 06:19:08','2025-03-17 06:19:08'),(3,'Manager','2025-03-17 06:19:08','2025-03-17 06:19:08'),(4,'Client','2025-03-17 06:19:09','2025-03-17 06:19:09'),(5,'User','2025-03-17 06:19:09','2025-03-17 06:19:09');
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
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_company`
--

LOCK TABLES `user_company` WRITE;
/*!40000 ALTER TABLE `user_company` DISABLE KEYS */;
INSERT INTO `user_company` VALUES (1,1,1,'2025-03-17 06:19:11','2025-03-17 06:19:11'),(2,2,1,'2025-03-17 06:19:11','2025-03-17 06:19:11'),(3,3,1,'2025-03-17 06:19:11','2025-03-17 06:19:11'),(4,4,1,'2025-03-17 06:19:11','2025-03-17 06:19:11'),(5,5,1,'2025-03-17 06:19:11','2025-03-17 06:19:11'),(6,6,1,'2025-03-17 06:19:11','2025-03-17 06:19:11'),(7,7,1,'2025-03-17 06:19:11','2025-03-17 06:19:11'),(8,8,1,'2025-03-17 06:19:11','2025-03-17 06:19:11');
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
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_roles`
--

LOCK TABLES `user_roles` WRITE;
/*!40000 ALTER TABLE `user_roles` DISABLE KEYS */;
INSERT INTO `user_roles` VALUES (1,1,3,'2025-03-17 06:19:11','2025-03-17 06:19:11'),(2,2,3,'2025-03-17 06:19:11','2025-03-17 06:19:11'),(3,3,3,'2025-03-17 06:19:11','2025-03-17 06:19:11'),(4,4,1,'2025-03-17 06:19:11','2025-03-17 06:19:11'),(5,5,2,'2025-03-17 06:19:11','2025-03-17 06:19:11'),(6,6,3,'2025-03-17 06:19:11','2025-03-17 06:19:11'),(7,7,4,'2025-03-17 06:19:11','2025-03-17 06:19:11'),(8,8,5,'2025-03-17 06:19:11','2025-03-17 06:19:11');
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
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'Sophie','sophie@freynet-gagne.com',NULL,'$2y$12$FgHL15EXiGjFUrXGXrkxl.ttkTb7P/.N1/SqtENKWVOfF9almp6EG',NULL,'2025-03-17 06:19:11','2025-03-17 06:19:11',1),(2,'Jean-Paul','Jean-paul@freynet-gagne.com',NULL,'$2y$12$yYxTju8t6vp/H1Q0.bsi8.E77JbaKTa9qBTMb7S76PsG7/v3W0S9i',NULL,'2025-03-17 06:19:11','2025-03-17 06:19:11',1),(3,'Maya','maya@freynet-gagne.com',NULL,'$2y$12$.RAGvvctzEFnZoIpdw7DoOZ9..65PFZna1eIHJHzIyBMRL1H8jAFO',NULL,'2025-03-17 06:19:11','2025-03-17 06:19:11',1),(4,'admin','admin@admin.com',NULL,'$2y$12$9h7V5rzQravP7w77jTuvye0nkJSnEBcvP4dZKrk5ZZkFQcElDw1yi',NULL,'2025-03-17 06:19:11','2025-03-17 06:19:11',1),(5,'auth','auth@auth.com',NULL,'$2y$12$YOtDS.mhEFUjNamGYYLlZuzRnAPXgGe.FcdJqv4AOWTlW17yqHMCC',NULL,'2025-03-17 06:19:11','2025-03-17 06:19:11',1),(6,'manager','manager@manager.com',NULL,'$2y$12$uiqbw30Dp3Sc.CZToqsh7uoXcukpBSQJCwy4zl2RrMt2F3jdWYZY.',NULL,'2025-03-17 06:19:11','2025-03-17 06:19:11',1),(7,'client','client@client.com',NULL,'$2y$12$OOacQwl9TlF/.bwHOfHZeOAg.nViaw3HiWbDmijeaC4cIOUB.ldBS',NULL,'2025-03-17 06:19:11','2025-03-17 06:19:11',1),(8,'user','user@user.com',NULL,'$2y$12$kGvv59UgAzylbvyosExSPupQtnK4Yr0DdCPNIhWjbsboJxmxrt5XG',NULL,'2025-03-17 06:19:11','2025-03-17 06:19:11',1);
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

-- Dump completed on 2025-03-16 20:08:47
