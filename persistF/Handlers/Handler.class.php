<?php

require_once('Request.class.php');

class Handler {
	private $resp;
  private $req;

	private static $method_handlers;
	
	function Handler() {
		$this->req = Request::instance();
		$this->resp =& Response::instance();
	} // constructor()

  static function requireField($name) {
		$resp =& Response::instance();
		$req =& Request::instance();
		if (!$req->paramExists($name)) {
		  $resp->addError("Missing field \"$name\"");
			return false;
		}
		return true;
	} // 

  function validate() {
		
	} // validate()
	
	function process() {
		
	} // process()
	
	function response() {
		
	} // response()
	
	function handles() {
		return array();
	} // handles()
	
	static function loadHandlers() {
		$GLOBALS['handlers'] = array();
		self::$method_handlers = array();
		if ($handle = opendir(dirname(__FILE__) . '/')) {
			while (false !== ($file = readdir($handle))) {
				$file = dirname(__FILE__) . '/' . $file;
				if (preg_match('/([^\/]+?)\.class\.php$/', $file, $matches)) {
					require_once($file);
					$class_name = 'Handler_' . $matches[1];
					if (class_exists($class_name)) {
						$inst = new $class_name();
						foreach ($inst->handles() as $method) {
							$GLOBALS['handlers'][$method] = $class_name;
							self::$method_handlers[$method] = $class_name;
						}
					}
				}
			}
		}
	} // loadHandlers()
	
	static function handlerDefined($method) {
		return array_key_exists($method, self::$method_handlers);
	} // handlerDefined()
	
	static function getHandler($method) {
		if (self::handlerDefined($method)) {
			return new self::$method_handlers[$method]();
		} else {
			return new stdClass();
		}
	} // getHandler()
	
	static function handlers() {
		return self::$method_handlers;
	} // handlers()
	
} // class Error

Handler::loadHandlers();

?>