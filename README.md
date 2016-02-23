Qvitter
==========================================

* Author:    Hannes Mannerheim (<h@nnesmannerhe.im>)
* Last mod.: Jan, 2016
* Version:   5-alpha
* Homepage:  <https://git.gnu.io/h2p/Qvitter>

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

1. Install GNU social _directly under a domain_ (Qvitter is not compatible with
subdirectory installs) with _fancy urls_ enabled (if your instance has
"index.php" in its URLs, Qvitter will not work properly) _and HTTPS enabled_ (it's
always best to use HTTPS from the beginning, there will be issues with federation
if you choose to enable HTTPS later)

2. Put all files in local/plugins/Qvitter

3. Add `addPlugin('Qvitter');` to your /config.php file.

4. It's highly recommended to use the StoreRemoteMedia plugin. It will cache attachments from remote instances locally and make them appear in the streams. Add `addPlugin('StoreRemoteMedia');` to your /config.php file. (Only available in newer GNU social)

5. There are settings in QvitterPlugin.php, but for easy updates, put them in config.php instead. Example:

````
// Qvitter-settings
$config['site']['qvitter']['enabledbydefault'] = true;
$config['site']['qvitter']['defaultbackgroundcolor'] = '#f4f4f4';
$config['site']['qvitter']['defaultlinkcolor'] = '#0084B4';
$config['site']['qvitter']['timebetweenpolling'] = 5000;
$config['site']['qvitter']['urlshortenerapiurl'] = 'http://qttr.at/yourls-api.php'; // if your site is on HTTPS, use url to shortener.php here
$config['site']['qvitter']['urlshortenersignature'] = 'b6afeec983';
$config['site']['qvitter']['sitebackground'] = 'img/vagnsmossen.jpg';
$config['site']['qvitter']['favicon_path'] = Plugin::staticPath('Qvitter', '').'img/gnusocial-favicons/';
$config['site']['qvitter']['sprite'] = Plugin::staticPath('Qvitter', '').'img/sprite.png?v=40';
$config['site']['qvitter']['enablewelcometext'] = true;
// $config['site']['qvitter']['customwelcometext']['sv'] = '<h1>Välkommen till Quitter.se – en federerad<sup>1</sup> mikrobloggsallmänning!</h1><p>Etc etc...</p>';
// $config['site']['qvitter']['customwelcometext']['en'] = '<h1>Welcome to Quitter.se – a federated microblog common!</h1><p>Etc etc...</p>';
$config['site']['qvitter']['blocked_ips'] = array();

// Recommended GNU social settings
$config['thumbnail']['maxsize'] = 3000; // recommended setting to get more high-res image previews
$config['profile']['delete'] = true; // twitter users are used to being able to remove their accounts
$config['profile']['changenick'] = true; // twitter users are used to being able to change their nicknames
$config['public']['localonly'] = true; // only local users in the public timeline (qvitter always has a timeline for the whole known network)
addPlugin('StoreRemoteMedia'); // makes remote images appear in the feed

````

The settings should be self-explanatory. In doubt, ask in the !qvitter group on quitter.se, or email h@nnesmannerhe.im

6. For better performance, disable checkschema (instructions in GNU social's config.php),
but don't forget to run it when updating plugins (including Qvitter).

7. To change the logo, edit /img/sprite.png. For easier git-updates, put it in GNU social's locale folder, and edit the sprite path setting above.


Translation
-----

1. Translation files reside in /locale and /doc folders.

2. When translating .json files, don't translate the placeholder strings inside curly brackets {}

API
-----

Qvitter uses GNU social's built in "twitter compatible" API. The API was designed to be
compatible with Twitter's API v1.0. Some documentation is here: <http://skilledtests.com/wiki/Twitter-compatible_API>
Twitter's API v1.1 documentation is also useful, but may be partly incorrect.

Qvitter extends this API in a few undocumented ways. See onRouterInitialized() in QvitterPlugin.php
for ideas about paths for the API extensions.


Notes
-----

Qvitter is tested with the latest GNU social nightly
