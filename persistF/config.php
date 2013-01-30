<?php

$config = new stdClass();

$config->db = new stdClass();
$config->db->host = 'localhost';
$config->db->user = 'root';
$config->db->pass = '';
$config->db->name = 'gorillas';

$GLOBALS['config'] = $config;


?>