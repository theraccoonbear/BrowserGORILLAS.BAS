<?php

require_once('Handler.class.php');

class Handler_CreateGame extends Handler {
	private $game;
	
	function process() {
		$req =& Request::instance();
		$this->game = new Game($req->player1, '', 0, 0, json_encode($req->level));
	} // process()
	
	function validate() {
		$resp =& Response::instance();
		$req =& Request::instance();
		
		$valid = true;
		
		$valid = Handler::requireField('player1') && $valid;
		$valid = Handler::requireField('level') && $valid;
		if ($valid) {
			$valid = Game::validLevel($req->level) && $valid;
		}
		
		return $valid;
	}
	
	function response() {
		return $this->game->id;
	} // response()
	
	function handles() {
		return array('create-game', 'new-game');
	} // handles()
} // class Error

?>