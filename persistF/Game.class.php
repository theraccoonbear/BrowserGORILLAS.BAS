<?php


class Game {
	private $id;
	private $player_1;
	private $player_2;
	private $level;
	private $score_1;
	private  $score_2;
	private static $resp;
	
	private $db;
	
	static function init() {
		self::$resp =& Response::instance();
	} // init()
	
	function __get($name) {
		if (preg_match('/^(id|player_1|player_2|level|score_1|score_2)$/', $name)) {
			return $this->$name;
		} else {
			return null;
		}
	} // __get()
	
	function Game($player_1 = '', $player_2 = '', $score_1 = 0, $score_2 = 0, $level = '{}') {
		$this->db =& DB::instance();
		
		$this->player_1 = $player_1;
		$this->player_2 = $player_2;
		$this->score_1 = $score_1;
		$this->score_2 = $score_2;
		$this->level = $level;
		
		$result = $this->db->query('
			INSERT INTO tbl_games (
			  gamePlayer1_str,
				gamePlayer2_str,
				gameScore1_int,
				gameScore2_int,
				gameLevel_txt,
				gameStarted_ts
			) VALUES (
			  :player1,
				:player2,
				:score1,
				:score2,
				:level,
				:started
			);',array('player1' => $player_1, 'player2' => $player_2, 'score1' => $score_1, 'score2' => $score_2, 'level' => $level, 'started' => time()));
		
		$this->id = $this->db->insertId();
	} // constructor()
	
	function save() {
		$query = "UPDATE tbl_games SET
							gamePlayer1_str = :player1,
							gamePlayer2_str = :player2,
							gameScore1_int = :score1,
							gameScore2_int = :score2,
							gameLevel_txt = :level
							WHERE gameID_int = :id";
		$result = $db->query($query, array('player1' => $this->player_1, 'player2' => $this->player_2, 'score1' => $this->score_1, 'score2' => $this->score_2, 'level' => $this->level, 'id' => $this->id));
	} // save()
	
	static function exists($id) {
		$result = $db->query('SELECT Count(*) FROM tbl_games WHERE gameID_int = :id', array('id' => $id));
		$result = $result[0];
		self::$resp->trickle("Game ID $id does " . ($result > 0 ? '' : 'not ') . "exist");
		return $result > 0;
	} //  exists()
	
	
	static function &load($id) {
		$db =& DB::instance();
		
		self::$resp->trickle("Loading game ID $id");
		
		$result = $db->query('SELECT * FROM tbl_games WHERE gameID_int = :id', array('id' => $id));
		$result = $result[0];

		$game = new Game($result['gamePlayer1_str'], $result['gamePlayer2_str'], $result['gameScore1_int'], $result['gameScore2_int'], $result['gameLevel_txt']);
		$game->id = $id;
		$game->db =& DB::instance();
		
		return $game;
	} // load()
	
	static function validLevel($level) {
		$resp =& Response::instance();
		$valid = true;
		
		$resp->trickle($level);
		
		if (isset($level->buildings)) {
			$idx = 0;
			foreach ($level->buildings as $bldg) {
				if (!property_exists($bldg, 'x')) {$resp->addError("Building index $idx does not define 'x'"); $valid = false; }
				if (!property_exists($bldg, 'w')) {$resp->addError("Building index $idx does not define 'w'"); $valid = false; }
				if (!property_exists($bldg, 'h')) {$resp->addError("Building index $idx does not define 'h'"); $valid = false; }
				if (!property_exists($bldg, 'c')) {$resp->addError("Building index $idx does not define 'c'"); $valid = false; }
				$idx++;
			}
		} else {
			$resp->addError("No buildings defined in level");
			$valid = false;
		}
		
		return $valid;
	} // validLevel()
} // Game class

Game::init();

?>