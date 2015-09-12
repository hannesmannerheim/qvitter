Qvitter
==========================================

* Author:    Hannes Mannerheim (<h@nnesmannerhe.im>)
* Last mod.: July, 2015
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

2. Put all files in local/plugins/Qvitter

3. Add `addPlugin('Qvitter');` to your /config.php file.

4. There are settings in QvitterPlugin.php, but for easy updates, put them in config.php instead. Example:

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
$config['site']['qvitter']['cache_remote_attachments'] = false;
// $config['site']['qvitter']['customwelcometext']['sv'] = '<h1>Välkommen till Quitter.se – en federerad<sup>1</sup> mikrobloggsallmänning!</h1><p>Etc etc...</p>';
// $config['site']['qvitter']['customwelcometext']['en'] = '<h1>Welcome to Quitter.se – a federated microblog common!</h1><p>Etc etc...</p>';
$config['site']['qvitter']['blocked_ips'] = array();
$config['thumbnail']['maxsize'] = 3000; // recommended setting to get more high-res image previews
````

The settings should be self-explanatory. In doubt, ask in the !qvitter group on quitter.se, or email h@nnesmannerhe.im


Notes
-----

Qvitter is tested with the latest GNU social nightly and also an older version: GNU social version 1.1.1-alpha2 (7e47026085fa4f2071e694d9c3e3fe2aa5142135, 24 aug 2014).
