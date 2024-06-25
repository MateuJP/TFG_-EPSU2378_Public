CREATE TABLE ROLE (
    idRole INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(60) NOT NULL
);

CREATE TABLE USER (
    idUser INT AUTO_INCREMENT PRIMARY KEY,
    userName VARCHAR(60) NOT NULL,
    email VARCHAR(120) NOT NULL, 
    password VARCHAR(60) NOT NULL, 
    wallet VARCHAR(60) UNIQUE,
    idRole INT,
    is_admin TINYINT(1),
    publicProfile TINYINT(1) DEFAULT  1,
    aceptPersonalNotification TINYINT(1) DEFAULT  1,
    twitterAccount varchar(60),
    instagramAccount varchar(60),
    facebookAccount varchar(60),
    FOREIGN KEY (idRole) REFERENCES ROLE(idRole)
);

CREATE TABLE SMART_METER (
    idSmartMeter INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(60) NOT NULL,
    wallet VARCHAR(60) NOT NULL UNIQUE, 
    idOwner INT,
    FOREIGN KEY (idOwner) REFERENCES USER(idUser)
);

CREATE TABLE T_NOTIFICATION (
    idType INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(60) NOT NULL
);

CREATE TABLE NOTIFICATION_PERSONAL (
    idNotification INT AUTO_INCREMENT PRIMARY KEY,
    date_creation DATE NOT NULL,
    content TEXT NOT NULL,
    is_read TINYINT(1) NOT NULL, 
    idSender INT,
    idReciver int,
    idType int,
    FOREIGN KEY (idSender) REFERENCES USER(idUser),
    FOREIGN KEY (idReciver) REFERENCES USER(idUser),
    FOREIGN KEY (idType) REFERENCES T_NOTIFICATION(idType)
);
CREATE TABLE NOTIFICATION_BROADCAST (
    idNotificationBroadcast INT AUTO_INCREMENT PRIMARY KEY,
    date_creation DATE NOT NULL,
    content TEXT NOT NULL,
    idType int,
    FOREIGN KEY (idType) REFERENCES T_NOTIFICATION(idType)
);
CREATE TABLE NOTIFICATION_BROADCAST_USER (
    idNotificationBroadcast INT AUTO_INCREMENT,
    idUser int ,
    is_read TINYINT(1),
    PRIMARY key(idNotificationBroadcast,idUser),
    FOREIGN KEY(idNotificationBroadcast) REFERENCES NOTIFICATION_BROADCAST(idNotificationBroadcast),
    FOREIGN KEY (idUser) REFERENCES USER(idUser)
);

CREATE TABLE ENERGY_PRODUCED (
    idEProduced INT AUTO_INCREMENT PRIMARY KEY,
    date_intro DATE NOT NULL,
    tstamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP, 
    kwh_produced DECIMAL(10, 6) NOT NULL, 
    idUser int,
    idSmartMeter INT,
    FOREIGN KEY (idUser) REFERENCES USER(idUser),
    FOREIGN KEY (idSmartMeter) REFERENCES SMART_METER(idSmartMeter)
);

CREATE TABLE ENERGY_CONSUMED (
    idEConsumed INT AUTO_INCREMENT PRIMARY KEY, 
    date_intro DATE NOT NULL,
    tstamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    kwh_consumed DECIMAL(10, 6) NOT NULL,
    idUser INT,
    idSmartMeter INT,
    FOREIGN KEY (idUser) REFERENCES USER(idUser),
    FOREIGN KEY (idSmartMeter) REFERENCES SMART_METER(idSmartMeter)
);

CREATE TABLE MARKET_OFERTS (
    idOfert int PRIMARY key,
    price_kwh decimal(10,6) not null,
    amount_energy decimal (10,3) not null,
    is_avaliable TINYINT(1),
    date_creation date,
    idProducer int,
    FOREIGN KEY(idProducer) REFERENCES USER(idUser)
);

CREATE TABLE AGREEMENT (
    contractAddress varchar(60) PRIMARY key,
    price_kwh decimal(10,6),
    totalEnergy decimal(10,3),
    is_alive TINYINT(1),
    idConsumer int,
    idProducer int,
    FOREIGN KEY(idConsumer) REFERENCES USER(idUser),
    FOREIGN KEY(idProducer) REFERENCES USER(idUser)
);

CREATE TABLE AUCTION_REQUEST(
    idRequest int PRIMARY key not null,
    max_price decimal(10,6) not null,
    energy_amount decimal(10,3) not null,
    limit_time TIMESTAMP,
    idConsumer int,
    FOREIGN KEY(idConsumer) REFERENCES USER(idUser)
);


-- Antes de inicar la app hay que registrar los roles y los tipos de notificación
--INSERT INTO ROLE (name) VALUES('Consumer'),('Producer'),('Prosumer');
--INSERT INTO T_NOTIFICATION(name) values('information');
--INSERT INTO T_NOTIFICATION(name) values('caht');
