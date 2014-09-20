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

class QvitterPlugin extends Plugin {

	public function settings($setting)
	{
	
 		/* · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · ·  
         ·        															 ·
         ·							S E T T I N G S							 ·
         ·         															 ·
         · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · */		

		// ENABLED BY DEFAULT (true/false)
		$settings['enabledbydefault'] = true;

		// DEFAULT BACKGROUND COLOR
		$settings['defaultbackgroundcolor'] = '#f4f4f4';

		// DEFAULT LINK COLOR
		$settings['defaultlinkcolor'] = '#0084B4';

		// TIME BETWEEN POLLING
		$settings['timebetweenpolling'] = 5000; // ms
		
		// URL SHORTENER
		$settings['urlshortenerapiurl'] = 'http://qttr.at/yourls-api.php';
		$settings['urlshortenersignature'] = 'b6afeec983';		


		 /* · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · ·
		  ·                                                                   · 
		  ·                (o>                                  >o)           ·
		  ·            \\\\_\                                    /_////       .
		  ·             \____)                                  (____/        · 
		  ·                                                                   ·
		  · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · */	


		return $settings[$setting];
	}
	
    public function onRouterInitialized($m)
    {
		
        $m->connect('api/qvitter.json', array('action' => 'qvitterapi'));              
		$m->connect('api/statuses/public_and_external_timeline.:format',
					array('action' => 'ApiTimelinePublicAndExternal',
						  'format' => '(xml|json|rss|atom|as)'));
		$m->connect('api/qvitter/update_link_color.json',
					array('action' => 'apiqvitterupdatelinkcolor'));
		$m->connect('api/qvitter/update_background_color.json',
					array('action' => 'apiqvitterupdatebackgroundcolor'));
		$m->connect('api/qvitter/checklogin.json',
					array('action' => 'apiqvitterchecklogin'));						
		$m->connect('api/qvitter/allfollowing/:id.json',
					array('action' => 'apiqvitterallfollowing',
						  'id' => Nickname::INPUT_FMT));							
		$m->connect('api/qvitter/update_cover_photo.json',
					array('action' => 'ApiUpdateCoverPhoto'));	
		$m->connect('api/qvitter/statuses/friends_timeline.json',
					array('action' => 'apiqvitterfriends'));	
		$m->connect('api/qvitter/statuses/friends_timeline/:id.json',
					array('action' => 'apiqvitterfriends',
						  'id' => Nickname::INPUT_FMT));							
		$m->connect('api/qvitter/statuses/mentions/:id.json',
					array('action' => 'apiqvittermentions',
						  'id' => Nickname::INPUT_FMT));
		$m->connect('api/qvitter/statuses/mentions.:format',
					array('action' => 'apiqvittermentions'));
        $m->connect('settings/qvitter',
                    array('action' => 'qvittersettings'));
        $m->connect('main/qlogin',
                    array('action' => 'qvitterlogin'));                    		
		
		// check if we should reroute UI to qvitter
		$logged_in_user = common_current_user();
		$qvitter_enabled_by_user = false;
		$qvitter_disabled_by_user = false;		
		if($logged_in_user) {
			try {
				$qvitter_enabled_by_user = Profile_prefs::getData($logged_in_user->getProfile(), 'qvitter', 'enable_qvitter');
			} catch (NoResultException $e) {
				$qvitter_enabled_by_user = false;
			}
			try {
				$qvitter_disabled_by_user = Profile_prefs::getData($logged_in_user->getProfile(), 'qvitter', 'disable_qvitter');
			} catch (NoResultException $e) {
				$qvitter_disabled_by_user = false;
			}		
		}					
		
		if((self::settings('enabledbydefault') && !$logged_in_user) ||
		   (self::settings('enabledbydefault') && !$qvitter_disabled_by_user) || 
		  (!self::settings('enabledbydefault') && $qvitter_enabled_by_user)) {
		
			$m->connect('', array('action' => 'qvitter'));      
			$m->connect('main/all', array('action' => 'qvitter'));              
			$m->connect('search/notice', array('action' => 'qvitter')); 
		
				
			URLMapperOverwrite::overwrite_variable($m, ':nickname',
									array('action' => 'showstream'),
									array('nickname' => Nickname::DISPLAY_FMT), 
									'qvitter');
			URLMapperOverwrite::overwrite_variable($m, ':nickname/',
									array('action' => 'showstream'),
									array('nickname' => Nickname::DISPLAY_FMT), 
									'qvitter');                                
			URLMapperOverwrite::overwrite_variable($m, ':nickname/all',
									array('action' => 'all'),
									array('nickname' => Nickname::DISPLAY_FMT), 
									'qvitter');
			URLMapperOverwrite::overwrite_variable($m, ':nickname/subscriptions',
									array('action' => 'subscriptions'),
									array('nickname' => Nickname::DISPLAY_FMT), 
									'qvitter');        
			URLMapperOverwrite::overwrite_variable($m, ':nickname/subscribers',
									array('action' => 'subscribers'),
									array('nickname' => Nickname::DISPLAY_FMT), 
									'qvitter');     
			URLMapperOverwrite::overwrite_variable($m, ':nickname/groups',
									array('action' => 'usergroups'),
									array('nickname' => Nickname::DISPLAY_FMT), 
									'qvitter');                  
			URLMapperOverwrite::overwrite_variable($m, ':nickname/replies',
									array('action' => 'replies'),
									array('nickname' => Nickname::DISPLAY_FMT), 
									'qvitter');               
			URLMapperOverwrite::overwrite_variable($m, ':nickname/favorites',
									array('action' => 'showfavorites'),
									array('nickname' => Nickname::DISPLAY_FMT), 
									'qvitter');                                                                                                                                                                                                                                                         
			URLMapperOverwrite::overwrite_variable($m, 'group/:nickname',
									array('action' => 'showgroup'),
									array('nickname' => Nickname::DISPLAY_FMT), 
									'qvitter');                                
			URLMapperOverwrite::overwrite_variable($m, 'group/:nickname/members',
									array('action' => 'groupmembers'),
									array('nickname' => Nickname::DISPLAY_FMT), 
									'qvitter');                                 

			$m->connect('group/:nickname/admins',
						array('action' => 'qvitter'),
						array('nickname' => Nickname::DISPLAY_FMT));

			URLMapperOverwrite::overwrite_variable($m, 'tag/:tag',
									array('action' => 'showstream'),
									array('tag' => Router::REGEX_TAG), 
									'qvitter');                                 					
		}					
						
    }
    
    /**
     * Menu item for Qvitter
     *
     * @param Action $action action being executed
     *
     * @return boolean hook return
     */

    function onEndAccountSettingsNav($action)
    {
        $action_name = $action->trimmed('action');

        $action->menuItem(common_local_url('qvittersettings'),
                          // TRANS: Poll plugin menu item on user settings page.
                          _m('MENU', 'Qvitter'),
                          // TRANS: Poll plugin tooltip for user settings menu item.
                          _m('Enable/Disable Qvitter UI'),
                          $action_name === 'qvittersettings');

        return true;
    }


    /**
     * Group addresses in API response
     *
     * @param Action $action action being executed
     *
     * @return boolean hook return
     */

    function onNoticeSimpleStatusArray($notice, &$twitter_status)
    {
    
		$notice_groups = $notice->getGroups();
		$group_addressees = false;
		foreach($notice_groups as $g) {
		$group_addressees .= '!'.$g->nickname.' ';
		}
		$group_addressees = trim($group_addressees);
		if($group_addressees == '') $group_addressees = false;
		$twitter_status['statusnet_in_groups'] = $group_addressees;    

        return true;
    }
    
    
    /**
     * Cover photo in API response
     *
     * @param Action $action action being executed
     *
     * @return boolean hook return
     */

    function onTwitterUserArray($profile, &$twitter_user)
    {

        $twitter_user['cover_photo'] = Profile_prefs::getConfigData($profile, 'qvitter', 'cover_photo');        

        return true;
    }    
    
}




/**
 * Overwrites variables in URL-mapping
 *
 */
class URLMapperOverwrite extends URLMapper
{
    function overwrite_variable($m, $path, $args, $paramPatterns, $newaction)
    {
    
        $m->connect($path, array('action' => $newaction), $paramPatterns);	
		
		$regex = URLMapper::makeRegex($path, $paramPatterns);
	
		foreach($m->variables as $n=>$v)
			if($v[1] == $regex) 
				$m->variables[$n][0]['action'] = $newaction;
    }
}


?>
