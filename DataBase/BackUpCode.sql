-- MySQL dump 10.13  Distrib 8.3.0, for macos14.2 (x86_64)
--
-- Host: localhost    Database: tfg_energia
-- ------------------------------------------------------
-- Server version	8.2.0

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
-- Table structure for table `AGREEMENT`
--

DROP TABLE IF EXISTS `AGREEMENT`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `AGREEMENT` (
  `contractAddress` varchar(60) NOT NULL,
  `price_kwh` decimal(10,6) DEFAULT NULL,
  `totalEnergy` decimal(10,3) DEFAULT NULL,
  `is_alive` tinyint(1) DEFAULT NULL,
  `idConsumer` int DEFAULT NULL,
  `idProducer` int DEFAULT NULL,
  PRIMARY KEY (`contractAddress`),
  KEY `idConsumer` (`idConsumer`),
  KEY `idProducer` (`idProducer`),
  CONSTRAINT `agreement_ibfk_1` FOREIGN KEY (`idConsumer`) REFERENCES `USER` (`idUser`),
  CONSTRAINT `agreement_ibfk_2` FOREIGN KEY (`idProducer`) REFERENCES `USER` (`idUser`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `AGREEMENT`
--

LOCK TABLES `AGREEMENT` WRITE;
/*!40000 ALTER TABLE `AGREEMENT` DISABLE KEYS */;
INSERT INTO `AGREEMENT` VALUES ('0x12d83d0D0FE245cC95BfbFFD5d68b11049154573',0.009318,500.000,0,2,1),('0x1f168c68bd79522a02971c27881C013Df4422441',0.099318,140.000,0,2,1),('0x234dFcdE07Ba64373b1256A4a3fd110D863AE252',0.009318,450.000,0,2,1),('0x269784f806c1F0C700168CF181e9A4b183492dC7',0.009318,450.000,0,2,1),('0x89ad60d1Fa40Bac802966BBE58A6CA7910ab7F74',0.099318,300.000,0,2,1),('0xcDde2182386F46f6e4D479e1F16A3320bE021440',0.099318,200.000,0,2,1),('0xE321A0C760c0B5DBCd451F3F1f495126E51ae0D3',0.009318,300.000,0,2,1),('0xf68dabee576D6ff95113aF563240b6AD8A07B63b',0.006318,300.000,0,2,1);
/*!40000 ALTER TABLE `AGREEMENT` ENABLE KEYS */;
UNLOCK TABLES;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`localhost`*/ /*!50003 TRIGGER `agreement_finish` BEFORE UPDATE ON `agreement` FOR EACH ROW BEGIN
    IF NEW.is_alive = 0 AND OLD.is_alive <> 0 THEN
        INSERT INTO NOTIFICATION_PERSONAL (date_creation, content, is_read, idSender, idReciver, idType)
        VALUES (NOW(), CONCAT('El Acuerdo ', NEW.contractAddress, ' ha finalizado, revisa tus acuerdos activos'), 0, NULL, NEW.idConsumer, 1);
        INSERT INTO NOTIFICATION_PERSONAL (date_creation, content, is_read, idSender, idReciver, idType)
        VALUES (NOW(), CONCAT('El Acuerdo ', NEW.contractAddress, ' ha finalizado, revisa tus acuerdos activos'), 0, NULL, NEW.idProducer, 1);
    END IF;
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;

--
-- Table structure for table `AUCTION_REQUEST`
--

DROP TABLE IF EXISTS `AUCTION_REQUEST`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `AUCTION_REQUEST` (
  `idRequest` int NOT NULL,
  `max_price` decimal(10,6) NOT NULL,
  `energy_amount` decimal(10,3) NOT NULL,
  `limit_time` timestamp NULL DEFAULT NULL,
  `idConsumer` int DEFAULT NULL,
  PRIMARY KEY (`idRequest`),
  KEY `idConsumer` (`idConsumer`),
  CONSTRAINT `auction_request_ibfk_1` FOREIGN KEY (`idConsumer`) REFERENCES `USER` (`idUser`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `AUCTION_REQUEST`
--

LOCK TABLES `AUCTION_REQUEST` WRITE;
/*!40000 ALTER TABLE `AUCTION_REQUEST` DISABLE KEYS */;
/*!40000 ALTER TABLE `AUCTION_REQUEST` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `ENERGY_CONSUMED`
--

DROP TABLE IF EXISTS `ENERGY_CONSUMED`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ENERGY_CONSUMED` (
  `idEConsumed` int NOT NULL AUTO_INCREMENT,
  `date_intro` date NOT NULL,
  `tstamp` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `kwh_consumed` decimal(10,6) NOT NULL,
  `idUser` int DEFAULT NULL,
  `idSmartMeter` int DEFAULT NULL,
  PRIMARY KEY (`idEConsumed`),
  KEY `idUser` (`idUser`),
  KEY `idSmartMeter` (`idSmartMeter`),
  CONSTRAINT `energy_consumed_ibfk_1` FOREIGN KEY (`idUser`) REFERENCES `USER` (`idUser`),
  CONSTRAINT `energy_consumed_ibfk_2` FOREIGN KEY (`idSmartMeter`) REFERENCES `SMART_METER` (`idSmartMeter`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ENERGY_CONSUMED`
--

LOCK TABLES `ENERGY_CONSUMED` WRITE;
/*!40000 ALTER TABLE `ENERGY_CONSUMED` DISABLE KEYS */;
/*!40000 ALTER TABLE `ENERGY_CONSUMED` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `ENERGY_PRODUCED`
--

DROP TABLE IF EXISTS `ENERGY_PRODUCED`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ENERGY_PRODUCED` (
  `idEProduced` int NOT NULL AUTO_INCREMENT,
  `date_intro` date NOT NULL,
  `tstamp` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `kwh_produced` decimal(10,6) NOT NULL,
  `idUser` int DEFAULT NULL,
  `idSmartMeter` int DEFAULT NULL,
  PRIMARY KEY (`idEProduced`),
  KEY `idUser` (`idUser`),
  KEY `idSmartMeter` (`idSmartMeter`),
  CONSTRAINT `energy_produced_ibfk_1` FOREIGN KEY (`idUser`) REFERENCES `USER` (`idUser`),
  CONSTRAINT `energy_produced_ibfk_2` FOREIGN KEY (`idSmartMeter`) REFERENCES `SMART_METER` (`idSmartMeter`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ENERGY_PRODUCED`
--

LOCK TABLES `ENERGY_PRODUCED` WRITE;
/*!40000 ALTER TABLE `ENERGY_PRODUCED` DISABLE KEYS */;
/*!40000 ALTER TABLE `ENERGY_PRODUCED` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `MARKET_OFERTS`
--

DROP TABLE IF EXISTS `MARKET_OFERTS`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `MARKET_OFERTS` (
  `idOfert` int NOT NULL,
  `price_kwh` decimal(10,6) NOT NULL,
  `amount_energy` decimal(10,3) NOT NULL,
  `is_avaliable` tinyint(1) DEFAULT NULL,
  `date_creation` date DEFAULT NULL,
  `idProducer` int DEFAULT NULL,
  PRIMARY KEY (`idOfert`),
  KEY `idProducer` (`idProducer`),
  CONSTRAINT `market_oferts_ibfk_1` FOREIGN KEY (`idProducer`) REFERENCES `USER` (`idUser`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `MARKET_OFERTS`
--

LOCK TABLES `MARKET_OFERTS` WRITE;
/*!40000 ALTER TABLE `MARKET_OFERTS` DISABLE KEYS */;
INSERT INTO `MARKET_OFERTS` VALUES (6614129,0.099318,160.000,1,'2024-06-22',1);
/*!40000 ALTER TABLE `MARKET_OFERTS` ENABLE KEYS */;
UNLOCK TABLES;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`localhost`*/ /*!50003 TRIGGER `afer_offer_created` AFTER INSERT ON `market_oferts` FOR EACH ROW BEGIN
    DECLARE last_insert_id INT;
    
    INSERT INTO NOTIFICATION_BROADCAST (date_creation, content, idType)
    VALUES (CURRENT_DATE, CONCAT('Se ha añadido una nueva oferta al mercado'), 1);
    
    SET last_insert_id = LAST_INSERT_ID();
    
    INSERT INTO NOTIFICATION_BROADCAST_USER (idNotificationBroadcast, idUser, is_read)
    SELECT last_insert_id, u.idUser, 0
    FROM USER u
    JOIN ROLE r ON u.idRole = r.idRole
    WHERE r.name = 'consumer';
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;

--
-- Table structure for table `NOTIFICATION_BROADCAST`
--

DROP TABLE IF EXISTS `NOTIFICATION_BROADCAST`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `NOTIFICATION_BROADCAST` (
  `idNotificationBroadcast` int NOT NULL AUTO_INCREMENT,
  `date_creation` date NOT NULL,
  `content` text NOT NULL,
  `idType` int DEFAULT NULL,
  PRIMARY KEY (`idNotificationBroadcast`),
  KEY `idType` (`idType`),
  CONSTRAINT `notification_broadcast_ibfk_1` FOREIGN KEY (`idType`) REFERENCES `T_NOTIFICATION` (`idType`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `NOTIFICATION_BROADCAST`
--

LOCK TABLES `NOTIFICATION_BROADCAST` WRITE;
/*!40000 ALTER TABLE `NOTIFICATION_BROADCAST` DISABLE KEYS */;
INSERT INTO `NOTIFICATION_BROADCAST` VALUES (1,'2024-06-24','Se ha añadido una nueva oferta al mercado',1),(2,'2024-06-24','Se ha añadido una nueva oferta al mercado',1),(3,'2024-06-24','Se ha añadido una nueva oferta al mercado',1);
/*!40000 ALTER TABLE `NOTIFICATION_BROADCAST` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `NOTIFICATION_BROADCAST_USER`
--

DROP TABLE IF EXISTS `NOTIFICATION_BROADCAST_USER`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `NOTIFICATION_BROADCAST_USER` (
  `idNotificationBroadcast` int NOT NULL AUTO_INCREMENT,
  `idUser` int NOT NULL,
  `is_read` tinyint(1) DEFAULT NULL,
  PRIMARY KEY (`idNotificationBroadcast`,`idUser`),
  KEY `idUser` (`idUser`),
  CONSTRAINT `notification_broadcast_user_ibfk_1` FOREIGN KEY (`idNotificationBroadcast`) REFERENCES `NOTIFICATION_BROADCAST` (`idNotificationBroadcast`),
  CONSTRAINT `notification_broadcast_user_ibfk_2` FOREIGN KEY (`idUser`) REFERENCES `USER` (`idUser`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `NOTIFICATION_BROADCAST_USER`
--

LOCK TABLES `NOTIFICATION_BROADCAST_USER` WRITE;
/*!40000 ALTER TABLE `NOTIFICATION_BROADCAST_USER` DISABLE KEYS */;
INSERT INTO `NOTIFICATION_BROADCAST_USER` VALUES (2,2,1),(3,2,1);
/*!40000 ALTER TABLE `NOTIFICATION_BROADCAST_USER` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `NOTIFICATION_PERSONAL`
--

DROP TABLE IF EXISTS `NOTIFICATION_PERSONAL`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `NOTIFICATION_PERSONAL` (
  `idNotification` int NOT NULL AUTO_INCREMENT,
  `date_creation` date NOT NULL,
  `content` text NOT NULL,
  `is_read` tinyint(1) NOT NULL,
  `idSender` int DEFAULT NULL,
  `idReciver` int DEFAULT NULL,
  `idType` int DEFAULT NULL,
  PRIMARY KEY (`idNotification`),
  KEY `idSender` (`idSender`),
  KEY `idReciver` (`idReciver`),
  KEY `idType` (`idType`),
  CONSTRAINT `notification_personal_ibfk_1` FOREIGN KEY (`idSender`) REFERENCES `USER` (`idUser`),
  CONSTRAINT `notification_personal_ibfk_2` FOREIGN KEY (`idReciver`) REFERENCES `USER` (`idUser`),
  CONSTRAINT `notification_personal_ibfk_3` FOREIGN KEY (`idType`) REFERENCES `T_NOTIFICATION` (`idType`)
) ENGINE=InnoDB AUTO_INCREMENT=27 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `NOTIFICATION_PERSONAL`
--

LOCK TABLES `NOTIFICATION_PERSONAL` WRITE;
/*!40000 ALTER TABLE `NOTIFICATION_PERSONAL` DISABLE KEYS */;
INSERT INTO `NOTIFICATION_PERSONAL` VALUES (1,'2024-06-20','Se ha creado un nuevo acuerdo, para la oferta 62386, por favor revise sus acuerdos activos para gestionar el acuerdo',1,NULL,1,1),(2,'2024-06-20','El acuerdo se ha creado, puedes verlo en tu lista de acuerdos, el contrato es el siguiente : 0x12d83d0D0FE245cC95BfbFFD5d68b11049154573',1,NULL,2,1),(3,'2024-06-21','Se ha creado un nuevo acuerdo, para la oferta 104768, por favor revise sus acuerdos activos para gestionar el acuerdo',1,NULL,1,1),(4,'2024-06-21','El acuerdo se ha creado, puedes verlo en tu lista de acuerdos, el contrato es el siguiente : 0xf68dabee576D6ff95113aF563240b6AD8A07B63b',1,NULL,2,1),(5,'2024-06-23','Se ha creado un nuevo acuerdo, para la oferta 120716, por favor revise sus acuerdos activos para gestionar el acuerdo',1,NULL,1,1),(6,'2024-06-23','El acuerdo se ha creado, puedes verlo en tu lista de acuerdos, el contrato es el siguiente : 0xE321A0C760c0B5DBCd451F3F1f495126E51ae0D3',1,NULL,2,1),(7,'2024-06-23','Se ha creado un nuevo acuerdo, para la oferta 6614129, por favor revise sus acuerdos activos para gestionar el acuerdo',1,NULL,1,1),(8,'2024-06-23','El acuerdo se ha creado, puedes verlo en tu lista de acuerdos, el contrato es el siguiente : 0xcDde2182386F46f6e4D479e1F16A3320bE021440',1,NULL,2,1),(9,'2024-06-24','El Acuerdo 0x12d83d0D0FE245cC95BfbFFD5d68b11049154573 ha finalizado, revisa tus acuerdos activos',1,NULL,2,1),(10,'2024-06-24','El Acuerdo 0x12d83d0D0FE245cC95BfbFFD5d68b11049154573 ha finalizado, revisa tus acuerdos activos',1,NULL,1,1),(11,'2024-06-24','Se ha creado un nuevo acuerdo, para la oferta 6614129, por favor revise sus acuerdos activos para gestionar el acuerdo',1,NULL,1,1),(12,'2024-06-24','El acuerdo se ha creado, puedes verlo en tu lista de acuerdos, el contrato es el siguiente : 0x89ad60d1Fa40Bac802966BBE58A6CA7910ab7F74',1,NULL,2,1),(13,'2024-06-24','El Acuerdo 0x89ad60d1Fa40Bac802966BBE58A6CA7910ab7F74 ha finalizado, revisa tus acuerdos activos',1,NULL,2,1),(14,'2024-06-24','El Acuerdo 0x89ad60d1Fa40Bac802966BBE58A6CA7910ab7F74 ha finalizado, revisa tus acuerdos activos',1,NULL,1,1),(15,'2024-06-24','Se ha creado un nuevo acuerdo, para la oferta 15081, por favor revise sus acuerdos activos para gestionar el acuerdo',1,NULL,1,1),(16,'2024-06-24','El acuerdo se ha creado, puedes verlo en tu lista de acuerdos, el contrato es el siguiente : 0x269784f806c1F0C700168CF181e9A4b183492dC7',1,NULL,2,1),(17,'2024-06-24','Se ha creado un nuevo acuerdo, para la oferta 206054, por favor revise sus acuerdos activos para gestionar el acuerdo',1,NULL,1,1),(18,'2024-06-24','El acuerdo se ha creado, puedes verlo en tu lista de acuerdos, el contrato es el siguiente : 0x234dFcdE07Ba64373b1256A4a3fd110D863AE252',1,NULL,2,1),(19,'2024-06-24','Se ha creado un nuevo acuerdo, para la oferta 6614129, por favor revise sus acuerdos activos para gestionar el acuerdo',1,NULL,1,1),(20,'2024-06-24','El acuerdo se ha creado, puedes verlo en tu lista de acuerdos, el contrato es el siguiente : 0x1f168c68bd79522a02971c27881C013Df4422441',1,NULL,2,1),(21,'2024-06-24','El Acuerdo 0x1f168c68bd79522a02971c27881C013Df4422441 ha finalizado, revisa tus acuerdos activos',1,NULL,2,1),(22,'2024-06-24','El Acuerdo 0x1f168c68bd79522a02971c27881C013Df4422441 ha finalizado, revisa tus acuerdos activos',1,NULL,1,1),(23,'2024-06-24','El Acuerdo 0x234dFcdE07Ba64373b1256A4a3fd110D863AE252 ha finalizado, revisa tus acuerdos activos',1,NULL,2,1),(24,'2024-06-24','El Acuerdo 0x234dFcdE07Ba64373b1256A4a3fd110D863AE252 ha finalizado, revisa tus acuerdos activos',1,NULL,1,1),(25,'2024-06-24','El Acuerdo 0x269784f806c1F0C700168CF181e9A4b183492dC7 ha finalizado, revisa tus acuerdos activos',0,NULL,2,1),(26,'2024-06-24','El Acuerdo 0x269784f806c1F0C700168CF181e9A4b183492dC7 ha finalizado, revisa tus acuerdos activos',1,NULL,1,1);
/*!40000 ALTER TABLE `NOTIFICATION_PERSONAL` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `ROLE`
--

DROP TABLE IF EXISTS `ROLE`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ROLE` (
  `idRole` int NOT NULL AUTO_INCREMENT,
  `name` varchar(60) NOT NULL,
  PRIMARY KEY (`idRole`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ROLE`
--

LOCK TABLES `ROLE` WRITE;
/*!40000 ALTER TABLE `ROLE` DISABLE KEYS */;
INSERT INTO `ROLE` VALUES (1,'Consumer'),(2,'Producer'),(3,'Prosumer');
/*!40000 ALTER TABLE `ROLE` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `SMART_METER`
--

DROP TABLE IF EXISTS `SMART_METER`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `SMART_METER` (
  `idSmartMeter` int NOT NULL AUTO_INCREMENT,
  `name` varchar(60) NOT NULL,
  `wallet` varchar(60) NOT NULL,
  `idOwner` int DEFAULT NULL,
  PRIMARY KEY (`idSmartMeter`),
  UNIQUE KEY `wallet` (`wallet`),
  KEY `idOwner` (`idOwner`),
  CONSTRAINT `smart_meter_ibfk_1` FOREIGN KEY (`idOwner`) REFERENCES `USER` (`idUser`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `SMART_METER`
--

LOCK TABLES `SMART_METER` WRITE;
/*!40000 ALTER TABLE `SMART_METER` DISABLE KEYS */;
INSERT INTO `SMART_METER` VALUES (1,'Lector Solarium 1','0x8467CDa23B8eC04291Bce441287dBCf6Cba056Be',1),(2,'Lector Techo 1','0x206EB141F86341fcc3743d6fF6C1a42e6d7E25f7',2);
/*!40000 ALTER TABLE `SMART_METER` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `T_NOTIFICATION`
--

DROP TABLE IF EXISTS `T_NOTIFICATION`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `T_NOTIFICATION` (
  `idType` int NOT NULL AUTO_INCREMENT,
  `name` varchar(60) NOT NULL,
  PRIMARY KEY (`idType`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `T_NOTIFICATION`
--

LOCK TABLES `T_NOTIFICATION` WRITE;
/*!40000 ALTER TABLE `T_NOTIFICATION` DISABLE KEYS */;
INSERT INTO `T_NOTIFICATION` VALUES (1,'information'),(2,'caht');
/*!40000 ALTER TABLE `T_NOTIFICATION` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `USER`
--

DROP TABLE IF EXISTS `USER`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `USER` (
  `idUser` int NOT NULL AUTO_INCREMENT,
  `userName` varchar(60) NOT NULL,
  `email` varchar(120) NOT NULL,
  `password` varchar(60) NOT NULL,
  `wallet` varchar(60) DEFAULT NULL,
  `idRole` int DEFAULT NULL,
  `is_admin` tinyint(1) DEFAULT NULL,
  `publicProfile` tinyint(1) DEFAULT '1',
  `aceptPersonalNotification` tinyint(1) DEFAULT '1',
  `twitterAccount` varchar(60) DEFAULT NULL,
  `instagramAccount` varchar(60) DEFAULT NULL,
  `facebookAccount` varchar(60) DEFAULT NULL,
  PRIMARY KEY (`idUser`),
  UNIQUE KEY `wallet` (`wallet`),
  KEY `idRole` (`idRole`),
  CONSTRAINT `user_ibfk_1` FOREIGN KEY (`idRole`) REFERENCES `ROLE` (`idRole`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `USER`
--

LOCK TABLES `USER` WRITE;
/*!40000 ALTER TABLE `USER` DISABLE KEYS */;
INSERT INTO `USER` VALUES (1,'MJP748','mateujoanperello@gmail.com','$2b$10$OVxmtnx0pDgvuTgsHlM.nON4/o/.x/XYbNo3mD8kFozwB.xmyi9uG','0xdcf2058865d08b42fb2bb603c23808625e252048',2,0,1,1,NULL,NULL,NULL),(2,'User2','user2@gmail.com','$2b$10$ZVC0LNdLBz.BwM5rgaGBteSw6.qzpGbjTZIK6gJzAr1d8FvRaxrOG','0x64fa304596bf04a0d2d8b998036465fffd03f1b1',1,0,1,1,NULL,NULL,NULL);
/*!40000 ALTER TABLE `USER` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2024-06-24 23:52:28
