Qvitter
==========================================

* Author:    Hannes Mannerheim (<h@nnesmannerhe.im>)
* Last mod.: Sept, 2014
* Version:   3
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

1. Install GNU Social

2. Put all files in /plugins/Qvitter

3. Replace your lib/apiauthaction.php file with the one supplied in 
edited-gnu-social-files/lib/apiauthaction.php. 

4. Add `addPlugin('Qvitter');` to your /config.php file.

5. There are a few settings in /plugins/Qvitter/QvitterPlugin.php. By default Qvitter is 
opt-out for users. If you set `$settings['enabledbydefault'] = false;` Qvitter will
be opt-in instead.

6. Users can go to ://{instance}/settings/qvitter and enable or disable Qvitter.

Note: Qvitter is tested with GNU Social version 1.1.1-alpha2 (7e47026085fa4f2071e694d9c3e3fe2aa5142135).


TODO
----

1. "following you" badge on other peoples profiles

1. better user popup, with e.g. latest queets

1. Faq

1. DM's

1. lists

1. user actions-cog wheel in users lists, with block, list etc

1. proxy to non-https for getting conversations the instance doesn't have via jsonp

1. preview different types of attachments, not just images. e.g. mp3's, torrents etc etc

1. Join _new_ external groups and follow _new_ external users ("New" meaning users/groups that the server don't know yet) 

2. Creating groups, make admin, block user

7. Settings (e.g. don't show replies to people I don't follow)

9. Image/file upload

10. Search users

11. Recommended users

12. Filters (hide queets containing strings, e.g. mute users)

14. More languages, maybe make proper po/mo-files

16. Admin-interface

17. New "expand queet" api for getting conversation, retweets, favs and attachment in the same request

19. Node.js long polling server and an new api that serve aggregate of all polling users requests in one go