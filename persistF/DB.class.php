<?php

class DB {
	var $db_link;
	var $resp;

	function DB($host, $user, $pass, $db) {
		$this->resp =& Response::instance();
		
		if(!$this->db_link = mysql_connect($host, $user, $pass, true)) {
			$this->resp->addError('Could not connect to MySQL');
		}
		
		if(!mysql_select_db($db, $this->db_link)) {
			$this->resp->addError('Could not select DB');
		}
	}
	
	function query($query, $params = array()) {
		//$resp =& Response::instance();
		
		//print "$query<p/>\n";
		//print_r($params);
		
		foreach ($params as $id => $val) {
			if (is_int($val)) {
				$query = str_replace(":$id", $val, $query);
			} else {
				$query = str_replace(":$id", "'" . str_replace("'", "\\'", $val) . "'", $query);
			}
		}
		
		$this->resp->trickle($query);
		
		$result = mysql_query($query, $this->db_link);
		
		if(mysql_errno($this->db_link) === 0) {
			if(is_bool($result)) {
				return array('result' => ($result == true));
			} elseif(is_resource($result)) {
				$records = array();
				
				for($row = 0; $row < mysql_num_rows($result); $row++) {
					$record = mysql_fetch_array($result);
					array_push($records, $record);
				}
				
				return $records;
			} else {
				$this->resp->addError("Bad query response for: $query", 0);
			}
			
		} else {
			$this->resp->addError("Invalid Query: (" . mysql_errno($this->db_link) . ") " . mysql_error($this->db_link));
			
			return false;
		}
	}
	
	
	function insertId() {
		return mysql_insert_id($this->db_link);
	}
	
	function &instance() {
		static $connection = null;
		
		if(is_null($connection)) {
			$cfg = $GLOBALS['config'];
			$connection = new DB($cfg->db->host, $cfg->db->user, $cfg->db->pass, $cfg->db->name);
		}
		
		return $connection;
	}
}

?>