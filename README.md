Qvitter
==========================================

* Author:    Hannes Mannerheim (<h@nnesmannerhe.im>)
* Last mod.: August, 2013
* Version:   1
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

You need a webserver with PHP support.

Edit settings.php.

(Qvitter uses a slightly modified statusnet API. Some things will not work
if you connect to a site with standard API. Files are included if you want
to Qvitter-mod your Statusnet API.)
   

TODO
----

1. Join new external groups and follow new external users 

2. Follow people on other instances

3. Auto suggest mentions 

4. Register

5. Background image uploading/editing

6. Color theme

7. Auto url-shortening setting under queet box

10. Settings (e.g. don't show replies to people I don't follow)

11. Syntax-coloring in queet-box, maybe codemirror (worked nicely for ltr but not rtl text when I tried it)

12. Image/file upload, drag-n-drop!

13. Search users

14. Recommended users

15. Filters (hide queets containing strings, e.g. mute users)

18. Better responsive design

19. More languages

20. Queet-page

21. New api for serving _number_ of new items in several streams (to show number of new items in menu/history) 

22. New "expand queet" api for getting conversation, retweets, favs and attachment in the same request 

23. DMs

24. Node.js long polling server and an new api that serve aggregate of all polling users requests in one go
