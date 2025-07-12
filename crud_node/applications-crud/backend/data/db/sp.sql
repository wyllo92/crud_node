DELIMITER $$
DROP PROCEDURE IF EXISTS sp_show_user_active$$
CREATE PROCEDURE sp_show_user_active()
BEGIN
SELECT US.id,US.username,US.email,US.password_hash,US.status_id,UST.name AS status_name,US.last_login,US.created_at,US.updated_at  FROM user AS US 
INNER JOIN  user_status UST ON US.status_id=UST.id WHERE US.status_id=1 ORDER BY US.id;
END $$
DELIMITER ;

DELIMITER $$
DROP PROCEDURE IF EXISTS sp_show_id_user_active$$
CREATE PROCEDURE sp_show_id_user_active(IN Id INT)
BEGIN
SELECT US.id,US.username,US.email,US.password_hash,US.status_id,UST.name AS status_name,US.last_login,US.created_at,US.updated_at  FROM user AS US 
INNER JOIN  user_status UST ON US.status_id=UST.id WHERE US.status_id=1 AND US.id=Id ORDER BY US.id;
END $$
DELIMITER ;

-- Stored Procedures para ApiUser
DELIMITER $$
DROP PROCEDURE IF EXISTS sp_show_apiuser_active$$
CREATE PROCEDURE sp_show_apiuser_active()
BEGIN
SELECT AU.id, AU.username, AU.email, AU.password_hash, AU.status_id, UST.name AS status_name, AU.last_login, AU.created_at, AU.updated_at  
FROM ApiUser AS AU 
INNER JOIN user_status UST ON AU.status_id = UST.id 
WHERE AU.status_id = 1 
ORDER BY AU.id;
END $$
DELIMITER ;

DELIMITER $$
DROP PROCEDURE IF EXISTS sp_show_id_apiuser_active$$
CREATE PROCEDURE sp_show_id_apiuser_active(IN Id INT)
BEGIN
SELECT AU.id, AU.username, AU.email, AU.password_hash, AU.status_id, UST.name AS status_name, AU.last_login, AU.created_at, AU.updated_at  
FROM ApiUser AS AU 
INNER JOIN user_status UST ON AU.status_id = UST.id 
WHERE AU.status_id = 1 AND AU.id = Id 
ORDER BY AU.id;
END $$
DELIMITER ;

-- Stored Procedure para Profile con joins
DELIMITER $$
DROP PROCEDURE IF EXISTS sp_show_profile$$
CREATE PROCEDURE sp_show_profile()
BEGIN 
SELECT PR.id, PR.user_id, US.username, PR.first_name, PR.last_name, PR.address, PR.phone, PR.document_type_id, DT.name AS document_type_name, PR.document_number, PR.photo_url, PR.birth_date, PR.created_at, PR.updated_at 
FROM profile AS PR 
INNER JOIN user AS US ON PR.user_id = US.id
INNER JOIN document_type AS DT ON PR.document_type_id = DT.id
ORDER BY PR.id;
END $$
DELIMITER ;