<?php
/*

This is an example file of how you can utilise http://qttr.at/yourls-api.php URL shortener service from a GNUSocial instance, which is using https.
If you run the qvitter code «as is» the browser will stop you from communicate to qttr.at which is currently running http protocol.

This «proxy» return the result from http://qttr.at/yourls-api.php

1) Install this file on your website eg. : https://myinstance.net/shortener.php
2) Change the following in QvitterPlugin.php - settings() function
	$settings['urlshortenerapiurl'] = 'https://yoursite.net/shortener.php';
3) Test it

Contact Knut Erik if you have any questions related to this .php file.
Quitter.no => knuthollund@quitter.no
GitHub: => https://github.com/fxdwg

*/


	$query = $_SERVER['QUERY_STRING'];
	if(strlen($query)>0) {
		$shortenerUrl = 'http://qttr.at/yourls-api.php?' . $query;
		print file_get_contents($shortenerUrl);
		}


?>
