DELIMITER //

CREATE TRIGGER agreement_finish
BEFORE UPDATE ON Agreement
FOR EACH ROW 
BEGIN
    IF NEW.is_alive = 0 AND OLD.is_alive <> 0 THEN
        INSERT INTO NOTIFICATION_PERSONAL (date_creation, content, is_read, idSender, idReciver, idType)
        VALUES (NOW(), CONCAT('El Acuerdo ', NEW.contractAddress, ' ha finalizado, revisa tus acuerdos activos'), 0, NULL, NEW.idConsumer, 1);
        INSERT INTO NOTIFICATION_PERSONAL (date_creation, content, is_read, idSender, idReciver, idType)
        VALUES (NOW(), CONCAT('El Acuerdo ', NEW.contractAddress, ' ha finalizado, revisa tus acuerdos activos'), 0, NULL, NEW.idProducer, 1);
    END IF;
END;

//

DELIMITER ;


DELIMITER //

CREATE TRIGGER afer_offer_created
AFTER INSERT ON MARKET_OFERTS
FOR EACH ROW
BEGIN
    DECLARE last_insert_id INT;
    
    INSERT INTO NOTIFICATION_BROADCAST (date_creation, content, idType)
    VALUES (CURRENT_DATE, CONCAT('Se ha añadido una nueva oferta al mercado'), 1);
    
    SET last_insert_id = LAST_INSERT_ID();
    
    INSERT INTO NOTIFICATION_BROADCAST_USER (idNotificationBroadcast, idUser, is_read)
    SELECT last_insert_id, u.idUser, 0
    FROM USER u
    JOIN ROLE r ON u.idRole = r.idRole
    WHERE r.name = 'consumer';
END;

//

DELIMITER ;
