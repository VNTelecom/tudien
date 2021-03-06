<?php
// caching
$lastrun = intval(file_get_contents('update_pages.lastrun'));
if ($lastrun+3600 > time()) {
	echo "List is not updated.";
	die;
}
else {
	file_put_contents('update_pages.lastrun', time());
}

define('MEDIAWIKI', 1);
require_once(dirname(__FILE__).'/../w/LocalSettings.php');
$link = mysql_connect($wgDBserver, $wgDBuser, $wgDBpassword)
	or die("Connection failed!");
mysql_select_db($wgDBname)
	or die("Could not select database");

// abc order
$query = "SELECT page_title FROM {$wgDBprefix}page WHERE page_namespace=0 ORDER BY page_title";
$result = mysql_query($query)
	or die("Query failed");

$ft = fopen('pages.txt', 'w');
$fx = fopen('pages.xml', 'w');
$fj = fopen('pages.js', 'w');
$fj2 = fopen('pages2.js', 'w');
fwrite($fx, '<?xml version="1.0" encoding="utf-8"?><pages>');
fwrite($fj, 'var tdcnPages = [');
fwrite($fj2, 'var tdcnPages = [');
while ($line = mysql_fetch_row($result))
{
	fwrite($ft, $line[0] . "\t");
	fwrite($fx, '<page>'.$line[0].'</page>');
	fwrite($fj, '"' . str_replace('"', '&quot;', $line[0]) . '", ');
	fwrite($fj2, '"' . str_replace(array('"','_'), array('&quot;',' '), $line[0]) . '", ');
}
fwrite($fx, '</pages>');
fwrite($fj, ' "unusedtitled"];');
fwrite($fj2, ' "unusedtitled"];');
fclose($ft);
fclose($fx);
fclose($fj);
fclose($fj2);
mysql_free_result($result);

// length order
$query = "SELECT page_title FROM {$wgDBprefix}page WHERE page_namespace=0 ORDER BY LENGTH(page_title) DESC, page_title";
$result = mysql_query($query)
	or die("Query failed");

$fj3 = fopen('pages3.js', 'w');
fwrite($fj3, 'var tdcnPages = [');
while ($line = mysql_fetch_row($result))
{
	fwrite($fj3, '"' . str_replace(array('"','_'), array('&quot;',' '), $line[0]) . '", ');
}
fwrite($fj3, ' "unusedtitled"];');
fclose($fj3);
mysql_free_result($result);

mysql_close($link);
?>
Done!
