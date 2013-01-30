<?php

require_once('init.php');

//$game =& Game::load('1');
$resp =& Response::instance();
$req =& Request::instance();

//$resp->setResponse($req->level);

if (Handler::handlerDefined($req->method)) {
	$hdlr =& Handler::getHandler($req->method);
	if ($hdlr->validate()) {
		$hdlr->process();
		$resp->setResponse($hdlr->response());
	}
} else {
	$resp->addError("Unsupported method \"" . $req->method . "\" specified");
}

$resp->send();


?>