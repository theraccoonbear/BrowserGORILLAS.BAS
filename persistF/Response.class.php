<?php

require_once('Error.class.php');

class Response {
	var $resp;
	
	function Response() {
		$this->resp = new stdClass();
		$this->resp->status = 0;
		$this->resp->errors = array();
		$this->resp->trickle = array();
		$this->resp->contents = new stdClass();
	} // constructor()
	
	function addError($msg, $code = 0) {
		array_push($this->resp->errors, new Error($msg, $code));
		$this->resp->status = 1;
	} // addError(); 
	
	function setResponse($contents, $status = 0) {
		$this->resp->contents = $contents;
	} // setResponse()
	
	function toJSON() {
		return json_encode($this->resp);
	} // toJSON()
	
	function send($callback = null) {
		$r = $callback == null ? $this->toJSON() : $callback . '(' . $this->toJSON() . ');';
		
		header('Content-type: application/json');
		
		print $r;
	} // send()
	
	function trickle($msg) {
		array_push($this->resp->trickle, $msg);
	} // trickle()
	
	function &instance() {
		static $response = null;
		
		if(is_null($response)) {
			$response = new Response();
		}
		
		return $response;
	} // instance()
	
} // class Error

?>