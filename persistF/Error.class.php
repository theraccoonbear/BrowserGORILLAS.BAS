<?php

class Error {
	var $message;
	var $code;

	function Error($msg, $code = 0) {
		$this->message = $msg;
		$this->code = $code;
	} // constructor()
	
	function toJSON() {
		return json_encode($this);
	} // toJSON()
	
} // class Error

?>