<?php

 /* · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · ·  
  ·                                                                             ·
  ·                                                                             ·
  ·                             Q V I T T E R                                   ·
  ·                                                                             ·
  ·              http://github.com/hannesmannerheim/qvitter                     ·
  ·                                                                             ·
  ·                                                                             ·
  ·                                 <o)                                         ·
  ·                                  /_////                                     ·
  ·                                 (____/                                      ·
  ·                                          (o<                                ·
  ·                                   o> \\\\_\                                 ·
  ·                                 \\)   \____)                                ·
  ·                                                                             ·
  ·                                                                             ·    
  ·                                                                             ·
  ·  Qvitter is free  software:  you can  redistribute it  and / or  modify it  ·
  ·  under the  terms of the GNU Affero General Public License as published by  ·
  ·  the Free Software Foundation,  either version three of the License or (at  ·
  ·  your option) any later version.                                            ·
  ·                                                                             ·
  ·  Qvitter is distributed  in hope that  it will be  useful but  WITHOUT ANY  ·
  ·  WARRANTY;  without even the implied warranty of MERCHANTABILTY or FITNESS  ·
  ·  FOR A PARTICULAR PURPOSE.  See the  GNU Affero General Public License for  ·
  ·  more details.                                                              ·
  ·                                                                             ·
  ·  You should have received a copy of the  GNU Affero General Public License  ·
  ·  along with Qvitter. If not, see <http://www.gnu.org/licenses/>.            ·
  ·                                                                             ·
  ·  Contact h@nnesmannerhe.im if you have any questions.                       ·
  ·                                                                             · 
  · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · */

require_once('settings.php');

header("Content-type: application/json; charset=utf-8"); 

// add slash if missing
if(substr($apiroot,-1) != '/') {
	$apiroot .= '/';
}

// post requests
if(isset($_POST['postRequest'])) {
	$query = http_build_query($_POST, '', '&');
	$ch=curl_init();
	curl_setopt($ch, CURLOPT_URL, $apiroot.urldecode($_POST['postRequest']));
	curl_setopt($ch, CURLOPT_USERPWD, $_POST['username'].":".$_POST['password']);
	curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
	curl_setopt($ch, CURLOPT_POST, 1);
	curl_setopt($ch, CURLOPT_POSTFIELDS, $query);
	session_write_close(); // fix problem with curling to local
	$reply=curl_exec($ch);
	curl_close($ch);

// get requests
} elseif(isset($_POST['getRequest'])) {
	$ch=curl_init();
	curl_setopt($ch, CURLOPT_URL, $apiroot.$_POST['getRequest']);
	
	if(isset($_POST['username'])) {
		curl_setopt($ch, CURLOPT_USERPWD, $_POST['username'].":".$_POST['password']);
	}
	
	curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
	session_write_close(); 
	$reply=curl_exec($ch);
	curl_close($ch);
} else {
	// 400 Bad request, since neither postRequest or getRequest were included
	http_response_code(400);
	exit;
}

session_start();

// force ssl on our domain
if($forcessl) {
	$reply = str_replace('http://'.$siterootdomain,'https://'.$siterootdomain, $reply);
}

echo $reply;
	
	
 /* · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · ·
  ·                                                                             · 
  ·                (o>                                  >o)                     ·
  ·            \\\\_\                                    /_////                 .
  ·             \____)                                  (____/                  · 
  ·                                                                             ·
  · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · */?>
