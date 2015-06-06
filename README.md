Qvitter
==========================================

* Author:    Hannes Mannerheim (<h@nnesmannerhe.im>)
* Last mod.: May, 2015
* Version:   5-alpha
* GitHub:    <https://github.com/hannesmannerheim/qvitter>

Qvitter is free  software:  you can  redistribute it  and / or  modify it  
under the  terms of the GNU Affero General Public License as published by  
the Free Software Foundation,  either version three of the License or (at  
your option) any later version.                                            
                                                                           
Qvitter is distributed  in hope that  it will be  useful but  WITHOUT ANY  
WARRANTY;  without even the implied warranty of MERCHANTABILTY or FITNESS  
FOR A PARTICULAR PURPOSE.  See the  GNU Affero General Public License for  
more details.                                                              
                                                                           
You should have received a copy of the  GNU Affero General Public License  
along with Qvitter. If not, see <http://www.gnu.org/licenses/>.            
                                                                           
Setup
-----

1. Install GNU social

2. Put all files in /plugins/Qvitter

3. Replace your lib/apiauthaction.php file with the one supplied in 
edited-gnu-social-files/lib/apiauthaction.php. (this might not be needed if you are
running the latest GNU social nightly)

4. Add `addPlugin('Qvitter');` to your /config.php file.

5. It's recommended to set this setting in your /config.php file: `$config['thumbnail']['maxsize'] = 3000;`

6. There are a few settings in /plugins/Qvitter/QvitterPlugin.php. By default Qvitter is 
opt-out for users. If you set `$settings['enabledbydefault'] = false;` Qvitter will
be opt-in instead.

7. Users can go to ://{instance}/settings/qvitter and enable or disable Qvitter.

Optional
-----

For easy updates, you can use /config.php to override the settings in /plugins/Qvitter/QvitterPlugin.php.
For example, add this to your /config.php file:

````
// Qvitter-settings
$config['site']['qvitter']['enabledbydefault'] = true;
$config['site']['qvitter']['defaultbackgroundcolor'] = '#f4f4f4';
$config['site']['qvitter']['defaultlinkcolor'] = '#0084B4';
$config['site']['qvitter']['timebetweenpolling'] = 5000;
$config['site']['qvitter']['urlshortenerapiurl'] = 'http://qttr.at/yourls-api.php';	
$config['site']['qvitter']['urlshortenersignature'] = 'b6afeec983';	
$config['site']['qvitter']['sitebackground'] = 'img/vagnsmossen.jpg';
$config['site']['qvitter']['favicon'] = 'img/favicon.ico?v=4';
$config['site']['qvitter']['sprite'] = Plugin::staticPath('Qvitter', '').'img/sprite.png?v=40';
$config['site']['qvitter']['enablewelcometext'] = true;
$config['site']['qvitter']['customwelcometext']['sv'] = '<h1>Välkommen till Quitter.se – en federerad<sup>1</sup> mikrobloggsallmänning!</h1><p>Etc etc...</p>';
$config['site']['qvitter']['customwelcometext']['en'] = '<h1>Welcome to Quitter.se – a federated microblog common!</h1><p>Etc etc...</p>';
$config['site']['qvitter']['blocked_ips'] = array();
$config['thumbnail']['maxsize'] = 3000;
````

Note: This version of Qvitter is tested with GNU social version 1.1.1-alpha2 (7e47026085fa4f2071e694d9c3e3fe2aa5142135).