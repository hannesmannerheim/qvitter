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


// SITE TITLE
$sitetitle = 'qvitter front-end';

// SITE DOMAIN
$siterootdomain = 'qvitter.example.com'; // no http:// or https:// and no ending slash

// API ROOT (GNU social instance)
$apiroot = 'https://social.example.com/api/';

// DEFAULT BACKGROUND COLOR
$defaultbackgroundcolor = '#f4f4f4';

// DEFAULT LINK COLOR
$defaultlinkcolor = '#0084B4';

// TIME BETWEEN POLLING
$timebetweenpolling = 5000; // ms

// FORCE SSL ON AVATAR URLS AND SUCH
$forcessl = false;

// USE history.pushState TO REWRITE URLS IN THE LOCATION BAR (use with mod_rewrite)
// Try this rule in .htaccess:
// RewriteRule ^(search/)?(notice\?q=|group/|tag/)?([a-z0-9%]+)?(/all|/subscriptions|/subscribers|/groups|/replies|/favorites|/members|/admins)?$ /theme/quitter-theme2/qvitter/index.php [L]    
$usehistorypushstate = false;

// FULL PATH TO THIS QVITTER APP
// (can be left blank, but if you're not doing mod_rewrites you need this)
$qvitterpath = ''; // WITH trailing slash!!


 /* · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · ·
  ·                                                                             · 
  ·                (o>                                  >o)                     ·
  ·            \\\\_\                                    /_////                 .
  ·             \____)                                  (____/                  · 
  ·                                                                             ·
  · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · */
