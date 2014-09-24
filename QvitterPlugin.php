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
	
	
    // make sure we have a notifications table
    function onCheckSchema()
    {
        $schema = Schema::get();
        $schema->ensureTable('qvitternotification', QvitterNotification::schemaDef());
        return true;
    }
	
	// route/reroute urls
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
		$m->connect('api/qvitter/statuses/notifications.json',
					array('action' => 'apiqvitternotifications'));					
		$m->connect(':nickname/notifications',
					array('action' => 'qvitter',
						  'nickname' => Nickname::INPUT_FMT));					
		$m->connect('api/qvitter/newnotifications.json',
					array('action' => 'ApiNewNotifications'));						  
        $m->connect('settings/qvitter',
                    array('action' => 'qvittersettings'));
        $m->connect('panel/qvitter',
                    array('action' => 'qvitteradminsettings')); 
        common_config_append('admin', 'panels', 'qvitteradm');
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
			URLMapperOverwrite::overwrite_variable($m, 'notice/:notice',
									array('action' => 'shownotice'),
									array('notice' => '[0-9]+'), 
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
     * Menu item for admin panel
     *
     * @param Action $action action being executed
     *
     * @return boolean hook return
     */

    function onEndAdminPanelNav($action)
    {
        
        $action_name = $action->trimmed('action');

        $action->out->menuItem(common_local_url('qvitteradminsettings'),
                          // TRANS: Poll plugin menu item on user settings page.
                          _m('MENU', 'Qvitter'),
                          // TRANS: Poll plugin tooltip for user settings menu item.
                          _m('Qvitter Sidebar Notice'),
                          $action_name === 'qvitteradminsettings');

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
    


   /**
     * Insert into notification table
     */
    function insertNotification($to_profile_id, $from_profile_id, $ntype, $notice_id=false)
    {
		
		// never notify myself
		if($to_profile_id != $from_profile_id) {
					
			// insert				
			$notif = new QvitterNotification();
			$notif->to_profile_id = $to_profile_id;
			$notif->from_profile_id = $from_profile_id;		
			$notif->ntype = $ntype;
			$notif->notice_id = $notice_id;		
			$notif->created = common_sql_now();	
			if (!$notif->insert()) {
				common_log_db_error($notif, 'INSERT', __FILE__);
				return false;
				}
			}
        return true;
    }   
    

    /**
     * Insert likes in notification table
     */
    public function onEndFavorNotice($profile, $notice)
    {
	
		// don't notify people favoriting their own notices 
 		if($notice->profile_id != $profile->id) {
            $this->insertNotification($notice->profile_id, $profile->id, 'like', $notice->id, $notice->id);
 			}   
    }   
    
   
    /**
     * Remove likes in notification table on dislike
     */
    public function onEndDisfavorNotice($profile, $notice)
    {
		$notif = new QvitterNotification();
		$notif->from_profile_id = $profile->id;		
		$notif->notice_id = $notice->id;
		$notif->ntype = 'like';
		$notif->delete();
        return true;
    }     
    
    
    
    /**
     * Insert notifications for replies, mentions and repeats
     *
     * @return boolean hook flag
     */
    function onStartNoticeDistribute($notice) {


		// repeats
        if ($notice->isRepeat()) {
			$repeated_notice = Notice::getKV('id', $notice->repeat_of);
			if ($repeated_notice instanceof Notice) {        	
	            $this->insertNotification($repeated_notice->profile_id, $notice->profile_id, 'repeat', $repeated_notice->id);
				}
 			}  

		// replies and mentions (no notifications for these if this is a repeat)
 		else {
			// check for reply to insert in notifications
			if($notice->reply_to) {
				$replyparent = $notice->getParent();
				$replyauthor = $replyparent->getProfile();
				if ($replyauthor instanceof Profile) {
					$reply_notification_to = $replyauthor->id;
					$this->insertNotification($replyauthor->id, $notice->profile_id, 'reply', $notice->id);
					}
				}

			// check for mentions to insert in notifications
			$mentions = common_find_mentions($notice->content, $notice);
			$sender = Profile::getKV($notice->profile_id);        
			foreach ($mentions as $mention) {
				foreach ($mention['mentioned'] as $mentioned) {

					// Not from blocked profile
					$mentioned_user = User::getKV('id', $mentioned->id);
					if ($mentioned_user instanceof User && $mentioned_user->hasBlocked($sender)) {
						continue;
						}
				
					// only notify if mentioned user is not already notified for reply
					if($reply_notification_to != $mentioned->id) {
						$this->insertNotification($mentioned->id, $notice->profile_id, 'mention', $notice->id);                	
						}
					}
				}		 			
 			}
		
        return true;
    	}

   /**
     * Delete any notifications tied to deleted notices and un-repeats
     *
     * @return boolean hook flag
     */
    public function onNoticeDeleteRelated($notice)
    {

		$notif = new QvitterNotification();

		// unrepeats
        if ($notice->isRepeat()) {
			$repeated_notice = Notice::getKV('id', $notice->repeat_of);
			$notif->notice_id = $repeated_notice->id;		
			$notif->from_profile_id = $notice->profile_id;					
 			}  
		// notices
		else {
			$notif->notice_id = $notice->id;
			}		

		$notif->delete();			
        return true;
    }  
    
   /**
     * Add notification on subscription, remove on unsubscribe
     *
     * @return boolean hook flag
     */
    public function onEndSubscribe($subscriber, $other)
    {
		if(Subscription::exists($subscriber, $other)) {
			$this->insertNotification($other->id, $subscriber->id, 'follow');            					
			}
		
        return true;
    }      
    public function onEndUnsubscribe($subscriber, $other)
    {
		if(!Subscription::exists($subscriber, $other)) {
			$notif = new QvitterNotification();
			$notif->to_profile_id = $other->id;		
			$notif->from_profile_id = $subscriber->id;		
			$notif->ntype = 'follow';
			$notif->delete();
			}
		
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
