Qvitter
==========================================

* Author:    Hannes Mannerheim (<h@nnesmannerhe.im>)
* Last mod.: May, 2014
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

3. Replace your lib/apiauthaction.php file with the one supplied in edited-gnu-social-files/lib/apiauthaction.php

4. Add `addPlugin('Qvitter');` to your /config.php file.

5. There are a few settings in /plugins/Qvitter/QvitterPlugin.php. By default Qvitter is 
opt-out for users. If you set `$settings['enabledbydefault'] = false;` Qvitter will
be opt-in instead.

6. Users can go to ://{instance}/settings/qvitter and enable or disable Qvitter.



TODO
----

1. Join _new_ external groups and follow _new_ external users ("New" meaning users/groups that the server don't know yet) 

2. Creating groups, make admin, block user

3. Background image uploading/editing

4. Auto suggest mentions 

6. Auto url-shortening setting under queet box

7. Settings (e.g. don't show replies to people I don't follow)

9. Image/file upload

10. Search users

11. Recommended users

12. Filters (hide queets containing strings, e.g. mute users)

14. More languages, maybe make proper po/mo-files

15. Notice-page

16. Admin-interface

16. New api for serving _number_ of new items in several streams (to show number of new items in menu/history)

17. Notifications-page with likes and repeats 

17. New "expand queet" api for getting conversation, retweets, favs and attachment in the same request

19. Node.js long polling server and an new api that serve aggregate of all polling users requests in one go