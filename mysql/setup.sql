DROP TABLE IF EXISTS `tbl_games`;
CREATE TABLE tbl_games (
	gameID_int INTEGER(11) UNSIGNED NOT NULL AUTO_INCREMENT,
	gamePlayer1_str VARCHAR(100) NOT NULL DEFAULT '',
	gamePlayer2_str VARCHAR(100) NOT NULL DEFAULT '',
	gameScore1_int INTEGER(11) UNSIGNED NOT NULL DEFAULT '0',
	gameScore2_int INTEGER(11) UNSIGNED NOT NULL DEFAULT '0',
	gamePassword_str VARCHAR(30) NOT NULL DEFAULT '',
	gameUsePassword_bool ENUM('false','true') NOT NULL DEFAULT 'false',
	gameLevel_txt TEXT NOT NULL,
	gameStarted_ts INTEGER(11) UNSIGNED NOT NULL DEFAULT '0',
	
	PRIMARY KEY (gameID_int),
	KEY (gamePlayer1_str),
	KEY (gamePlayer2_str)
) Type=InnoDB;