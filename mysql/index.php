<?php

require dirname(__FILE__).'/conf.php';

session_start();

// get the HTTP method, path and body of the request
$method = $_SERVER['REQUEST_METHOD'];

//  si method=OPTIONS (preflight)
if ($method == 'OPTIONS') {
	http_response_code(200);
	exit();
}

if (isset($_SERVER['PATH_INFO'])) {
	$request = explode('/', trim($_SERVER['PATH_INFO'],'/'));
	$table = preg_replace('/[^a-z0-9_]+/i','',array_shift($request));
	$key = array_shift($request)+0;
}

if (!$table) {
	http_response_code(500);
	exit();
}

if ($method == 'PUT' || $method == 'POST') {
	// --------------------------------------------------------------------------
	// ADD or UPDATE
	// --------------------------------------------------------------------------
	if (!$key) {
		http_response_code(500);
		exit();
	}
	$input = json_decode(file_get_contents('php://input'),true);
	if ($input != null) {
		// escape the columns and values from the input object
		$columns = preg_replace('/[^a-z0-9_]+/i','',array_keys($input));
		$values = array_map(function ($value) use ($link) {
			if ($value===null) return null;
			return mysqli_real_escape_string($link,(string)$value);
		},array_values($input));
		// build the SET part of the SQL command
		$set = '';
		for ($i=0;$i<count($columns);$i++) {
			$set.=($i>0?',':'').'`'.$columns[$i].'`=';
			if (strpos($columns[$i], "date") !== false) {
				$values[$i] = substr($values[$i], 0, 10).' '.substr($values[$i], 11, 8);
			}
			$set.=($values[$i]===null?'NULL':'"'.$values[$i].'"');
		}
	}	else {
		http_response_code(500);
		exit();
	}
	if ($method == 'PUT') {
		// SQL
		$sql = "update `$table` set $set where `id`=$key";

	}
	if ($method == 'POST') {
		// SQL
		$sql = "insert into `$table` set $set";

	}
} elseif ($method == 'DELETE') {
	// --------------------------------------------------------------------------
	// DELETE
	// --------------------------------------------------------------------------
	if (!$key) {
		http_response_code(500);
		exit();
	}
	// SQL
	$sql = "delete from `$table` where `id`=$key";

} elseif ($method == 'GET') {
	// --------------------------------------------------------------------------
	// GET
	// --------------------------------------------------------------------------
	if ($key) {
		// SQL
		$sql = "select * from `$table`".($key?" WHERE `id`=$key":'');

	} else {
		$operation = '*';
		// COUNT ?
		$paths = explode('/', $_SERVER['PATH_INFO']);
		if ($paths[2] == 'count') {
			$operation = 'count(*) as total';
		}
		// FILTERS
		$columns = array();
		$values = array();
		$query = explode('&',$_SERVER['QUERY_STRING']);
		for ($i=0;$i<count($query);$i++) {
			if ($query[$i] != '') {
				$param = explode('=', $query[$i]);
				array_push($columns, preg_replace('/[^a-z0-9]+/i','',$param[0]));
				array_push($values, $param[1]);
			}
		}
		$search = '1=1 ';
		for ($i=0;$i<count($columns);$i++) {
			if ($values[$i] !== "") {
				$aMinMax = preg_replace('/[^0-9-]+/i','',explode(':', $values[$i]));
				if ($aMinMax[0] || $aMinMax[0] == 0) {
					$search.=" AND `".$columns[$i]."` >= ".$aMinMax[0];
				}
				if ($aMinMax[1] || $aMinMax[1] == 0) {
					$search.=" AND `".$columns[$i]."` <= ".$aMinMax[1];
				}
			}
		}
		// SQL
		$sql = "select $operation from `$table` WHERE $search";
	
	}
}

// ----------------------------------------------------------------------------
// connect to the mysql database
// ----------------------------------------------------------------------------
$link = mysqli_connect(DB_HOST, DB_USER, DB_PASS, DB_DBASE);
mysqli_set_charset($link,'utf8');

// excecute SQL statement
$result = mysqli_query($link,$sql);

// die if SQL statement failed
if (!$result) {
	http_response_code(404);
	die(mysqli_error($link));
}

// ----------------------------------------------------------------------------
// print results, insert id or affected row count
// ----------------------------------------------------------------------------
if ($method == 'GET') {
	if (!$key) echo '[';
	for ($i=0;$i<mysqli_num_rows($result);$i++) {
		echo ($i>0?',':'').json_encode(mysqli_fetch_object($result));
	}
	if (!$key) echo ']';
} elseif ($method == 'POST') {
	echo mysqli_insert_id($link);
} else {
	echo mysqli_affected_rows($link);
}

// ----------------------------------------------------------------------------
// close mysql connection
// ----------------------------------------------------------------------------
mysqli_close($link);
