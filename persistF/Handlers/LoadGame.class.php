<?php

require_once('Handler.class.php');

class Handler_LoadGame extends Handler {
	var $game;
	function process() {
		$this->game =& Game::load($_REQUEST['game-id']);
	} // process()
	
	function validate() {
		$resp =& Response::instance();
		
		$valid = true;
		
		$valid = Handler::requireField('game-id') && $valid;
		$valid = Game::exists($_REQUEST['game-id']) && $valid;
		
		return $valid;
	}
	
	function response() {
		return $this->game;
	}
	
	function handles() {
		return array('load-game');
	}
	
	
	
} // class Error

?>