Qvitter
==========================================

* Author:    Hannes Mannerheim (<h@nnesmannerhe.im>)
* Last mod.: November, 2013
* Version:   2
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

1. You need a webserver with PHP support.

2. Edit settings.php.

3. You should really put some security-by-obscurity-stuff in the registration process. E-mail h@nnesmannerhe.im if you want to copy mine. 

Qvitter uses a slightly modified statusnet API. Some things will not work
if you connect to a site with standard API. Files are included if you want
to Qvitter-mod your Statusnet API.

Recently MMN-o has implemented these API-changes in GNU Social. The API changes should
only be needed if you are running Statusnet 1.1.1, not if you have a recent GNU Social
version. 
   

TODO
----

1. Join _new_ external groups and follow _new_ external users ("New" meaning users/groups that the server don't know yet) 

2. Creating groups, make admin, block user

3. Background image uploading/editing

4. Auto suggest mentions 

6. Auto url-shortening setting under queet box

7. Settings (e.g. don't show replies to people I don't follow)

9. Image/file upload, drag-n-drop!

10. Search users

11. Recommended users

12. Filters (hide queets containing strings, e.g. mute users)

14. More languages

15. Queet-page

16. Admin-interface

16. New api for serving _number_ of new items in several streams (to show number of new items in menu/history) 

17. New "expand queet" api for getting conversation, retweets, favs and attachment in the same request

19. Node.js long polling server and an new api that serve aggregate of all polling users requests in one go