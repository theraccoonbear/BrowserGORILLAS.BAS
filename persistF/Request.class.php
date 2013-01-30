<?php

require_once('Error.class.php');
require_once('Response.class.php');

class Request {
	private $raw_request;
	private $obj_request;
	private $method;
	private $payload;
	private $resp;
	
	function Request() {
		$this->resp = Response::instance();
		
		if (array_key_exists('raw', $_REQUEST)) {
			$this->raw_request = str_replace('\"', '"', $_REQUEST['raw']);
			$this->obj_request = json_decode($this->raw_request);
			
			//$this->resp->setResponse(isset($this->obj_request->method)); $this->resp->send(); exit(0);
			
			if (property_exists($this->obj_request, 'method')) {
				$this->method = $this->obj_request->method;
			} else {
				$this->method = '';
				$this->resp->addError("No method provided");
			}
			
			if (property_exists($this->obj_request, 'payload')) {
				$this->payload = $this->obj_request->payload;
			} else {
				$this->payload = new stdClass();
				$this->resp->addError("No payload provided");
			}
			
			
		} else {
			$this->resp->addError("No raw JSON string payload supplied");
		}
	} // constructor()
	
	function __get($name) {
		if ($name == 'method') {
			return $this->method;
		} elseif (isset($this->payload->$name)) {
			return $this->payload->$name;
		} else {
			return null;
		}
	} // __get()
	
	function paramExists($name) {
		return isset($this->payload, $name);
	} // paramExists()
	
	function &instance() {
		static $request = null;
		
		if(is_null($request)) {
			$request = new Request();
		}
		return $request;
	} // instance()
	
} // class Error

$___init_req = Request::instance();

?>