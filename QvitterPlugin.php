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

const QVITTERDIR = __DIR__;

class QvitterPlugin extends Plugin {

	public function settings($setting)
	{
	
 	/* · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · ·
         ·        							     ·
         ·                          S E T T I N G S                          ·
         ·         							     ·
         · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · */		

		// THESE SETTINGS CAN BE OVERRIDDEN IN CONFIG.PHP
		// e.g. $config['site']['qvitter']['enabledbydefault'] = 'false';

		// ENABLED BY DEFAULT (true/false)
		$settings['enabledbydefault'] = true;

		// DEFAULT BACKGROUND COLOR
		$settings['defaultbackgroundcolor'] = '#f4f4f4';

		// DEFAULT BACKGROUND IMAGE
		$settings['sitebackground'] = 'img/vagnsmossen.jpg';

		// DEFAULT FAVICON
		$settings['favicon'] = 'img/favicon.ico?v=4';

		// DEFAULT LINK COLOR
		$settings['defaultlinkcolor'] = '#0084B4';

		// ENABLE WELCOME TEXT
		$settings['enablewelcometext'] = true;

		// TIME BETWEEN POLLING
		$settings['timebetweenpolling'] = 5000; // ms

		// URL SHORTENER
		$settings['urlshortenerapiurl'] = 'http://qttr.at/yourls-api.php';
		$settings['urlshortenersignature'] = 'b6afeec983';
		
		// CUSTOM TERMS OF USE
		$settings['customtermsofuse'] = false;
		
		// IP ADDRESSES BLOCKED FROM REGISTRATION
		$settings['blocked_ips'] = array();


		 /* · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · ·
		  ·                                                                   · 
		  ·                (o>                                  >o)           ·
		  ·            \\\\_\                                    /_////       .
		  ·             \____)                                  (____/        · 
		  ·                                                                   ·
		  · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · */	
		
		// config.php settings override the settings in this file		
		$configphpsettings = common_config('site','qvitter') ?: array();
		foreach($configphpsettings as $configphpsetting=>$value) {
			$settings[$configphpsetting] = $value;
		}

		if(isset($settings[$setting])) {
			return $settings[$setting];			
		}
		else {
			return false;
		}
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
		
		$m->connect('api/qvitter/favs_and_repeats/:notice_id.json',
					array('action' => 'ApiFavsAndRepeats'),
					array('notice_id' => '[0-9]+'));
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
		$m->connect('api/qvitter/update_background_image.json',
					array('action' => 'ApiUpdateBackgroundImage'));						
		$m->connect('api/qvitter/update_avatar.json',
					array('action' => 'ApiUpdateAvatar'));		
		$m->connect('api/qvitter/upload_image.json',
					array('action' => 'ApiUploadImage'));																		
		$m->connect('api/qvitter/external_user_show.json',
					array('action' => 'ApiExternalUserShow'));
		$m->connect('api/qvitter/toggle_qvitter.json',
					array('action' => 'ApiToggleQvitter'));																										
		$m->connect('api/qvitter/statuses/notifications.json',
					array('action' => 'apiqvitternotifications'));					
		$m->connect(':nickname/notifications',
					array('action' => 'qvitter',
						  'nickname' => Nickname::INPUT_FMT));					
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
		
		// if qvitter is opt-out, disable the default register page (if we don't have a valid invitation code)
        if(isset($_POST['code'])) {
			$valid_code = Invitation::getKV('code', $_POST['code']);			
			}
		if(self::settings('enabledbydefault') && empty($valid_code)) {
			$m->connect('main/register',
						array('action' => 'qvitter')); 			
			}
						
    }
    
    
    /**
     * Add script to default ui, to be able to toggle Qvitter with one click
     *
     * @return boolean hook return
     */    

    function onEndShowScripts($action){

        if (common_logged_in()) {		

			$user = common_current_user();
			$profile = $user->getProfile();
			$qvitter_enabled='false';

			// if qvitter is enabled by default but _not_ disabled by the user,
			if(QvitterPlugin::settings('enabledbydefault')) {
				$disabled = Profile_prefs::getConfigData($profile, 'qvitter', 'disable_qvitter');
				if($disabled == 0) {
					$qvitter_enabled='true';
					}
				}
			// if qvitter is disabled by default and _enabled_ by the user,
			else {
				$enabled = Profile_prefs::getConfigData($profile, 'qvitter', 'enable_qvitter');
				if($enabled == 1) {
					$qvitter_enabled='true';
					}
				}

            $action->inlineScript(' var toggleQvitterAPIURL = \''.common_path('', true).'api/qvitter/toggle_qvitter.json\';
            						var toggleText = \'New '.str_replace("'","\'",common_config('site','name')).'\';
            						var qvitterEnabled = '.$qvitter_enabled.';
            						var qvitterAllLink = \''.common_local_url('all', array('nickname' => $user->nickname)).'\';
            						');        
            $action->script($this->path('js/toggleqvitter.js').'?changed='.date('YmdHis',filemtime(QVITTERDIR.'/js/toggleqvitter.js')));
        }
    }

    /**
     * User colors in default UI too, if theme is neo-quitter
     *
     * @return boolean hook return
     */    

    function onEndShowStylesheets($action) {
			
		$theme = common_config('site','theme');

        if (common_logged_in() && substr($theme,0,11) == 'neo-quitter') {		

			$user = common_current_user();
			$profile = $user->getProfile();

			$backgroundcolor = Profile_prefs::getConfigData($profile, 'theme', 'backgroundcolor');
			if(!$backgroundcolor) {
				$backgroundcolor = substr(QvitterPlugin::settings('defaultbackgroundcolor'),1);
				}
			$linkcolor = Profile_prefs::getConfigData($profile, 'theme', 'linkcolor');
			if(!$linkcolor) {
				$linkcolor = substr(QvitterPlugin::settings('defaultlinkcolor'),1);				
				}				
			
			$ligthen_elements = '';
			if($this->darkness($backgroundcolor)<0.5) {
			$ligthen_elements = "
				#nav_profile a:before, 
				#nav_timeline_replies a:before, 
				#nav_timeline_personal a:before, 
				#nav_local_default li:first-child ul.nav li:nth-child(4) a:before, 
				#nav_timeline_favorites a:before, 
				#nav_timeline_public a:before, 
				#nav_groups a:before, 
				#nav_recent-tags a:before, 
				#nav_timeline_favorited a:before, 
				#nav_directory a:before, 
				#nav_lists a:before,
				#site_nav_local_views h3,
				#content h1,
				#aside_primary h2,
				#gnusocial-version p,
				#page_notice,
				#pagination .nav_next a {
					color:rgba(255,255,255,0.4);
					}
				.nav li.current a:before,
				.entity_actions a {
					color: rgba(255,255,255, 0.6) !important;					
					}
				#aside_primary,
				.entity_edit a:before, 
				.entity_remote_subscribe:before, 
				#export_data a:before, 
				.peopletags_edit_button:before, 
				.form_group_join:before, 
				.form_group_leave:before, 
				.form_group_delete:before,
				#site_nav_object li.current a,
				#pagination .nav_next a:hover,
				#content .guide {
					color: rgba(255,255,255, 0.6);
					}				
				#site_nav_local_views a, 
				#site_nav_object a,
				#aside_primary a:not(.invite_button) {
					color: rgba(255,255,255, 0.7);
					}
				#site_nav_local_views li.current a,
				.entity_edit a:hover:before,
				.entity_remote_subscribe:hover:before,
				.peopletags_edit_button:hover:before,
				.form_group_join:hover:before,
				.form_group_leave:hover:before,
				.form_group_delete:hover:before	{
					color: rgba(255,255,255, 0.8);
					}	
				#site_nav_local_views li.current a {
					background-position: -3px 1px;
					}				
				#site_nav_local_views li a:hover {
					background-position:-3px -24px;					
					}
				#gnusocial-version,
				#pagination .nav_next a {
					border-color: rgba(255,255,255, 0.3);					
					}
				#pagination .nav_next a:hover {
					border-color: rgba(255,255,255, 0.5);					
					}	
				#site_nav_object li.current a {
					background-position: -3px 2px;
					}	
				#site_nav_object li a:hover {
					background-position: -3px -23px;
					}						
				";				
				}

			$action->style("
				body {
					background-color:#".$backgroundcolor.";
					}
				a,
				a:hover,				
				a:active,								
				#site_nav_global_primary a:hover,
				.threaded-replies .notice-faves:before, 
				.threaded-replies .notice-repeats:before, 
				.notice-reply-comments > a:before,
				#content .notices > .notice > .entry-metadata .conversation {
					color:#".$linkcolor.";
					}
				#site_nav_global_primary a:hover {
					border-color:#".$linkcolor.";
					}
				address {
					background-color:#".$linkcolor.";
					}										
				".$ligthen_elements);
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
     * Add stuff to notices in API responses
     *
     * @param Action $action action being executed
     *
     * @return boolean hook return
     */

    function onNoticeSimpleStatusArray($notice, &$twitter_status, $scoped)
    {
    
    	// groups
		$notice_groups = $notice->getGroups();
		$group_addressees = false;
		foreach($notice_groups as $g) {
			$group_addressees = array('nickname'=>$g->nickname,'url'=>$g->mainpage);
			}
		$twitter_status['statusnet_in_groups'] = $group_addressees;    

		// include the repeat-id, which we need when unrepeating later
		if(array_key_exists('repeated', $twitter_status) && $twitter_status['repeated'] === true) {
			$repeated = Notice::pkeyGet(array('profile_id' => $scoped->id,
                                        	'repeat_of' => $notice->id));
			$twitter_status['repeated_id'] = $repeated->id;
			}

		// thumb urls
		
        // find all thumbs
        $attachments = $notice->attachments();
        $attachment_url_to_id = array();
        if (!empty($attachments)) {
            foreach ($attachments as $attachment) {
				if(is_object($attachment)) {                 
                try {
                    $enclosure_o = $attachment->getEnclosure();
	                $thumb = $attachment->getThumbnail();
	                $attachment_url_to_id[$enclosure_o->url]['id'] = $attachment->id;
	                $attachment_url_to_id[$enclosure_o->url]['thumb_url'] = $thumb->getUrl();
                } catch (ServerException $e) {
					$thumb = File_thumbnail::getKV('file_id', $attachment->id);
					if ($thumb instanceof File_thumbnail) {
						$attachment_url_to_id[$enclosure_o->url]['id'] = $attachment->id;
						$attachment_url_to_id[$enclosure_o->url]['thumb_url'] = $thumb->getUrl();
						} 
                }
            }
            }
        }
		
		// add thumbs to $twitter_status
        if (!empty($twitter_status['attachments'])) {
            foreach ($twitter_status['attachments'] as &$attachment) {
                if (!empty($attachment_url_to_id[$attachment['url']])) {
                    $attachment['id'] = $attachment_url_to_id[$attachment['url']]['id'];
                    
                    // if the attachment is other than image, and we have a thumb (e.g. videos),
                    // we include the default thumbnail url
                    if(substr($attachment['mimetype'],0,5) != 'image') {
                    	$attachment['thumb_url'] = $attachment_url_to_id[$attachment['url']]['thumb_url'];
                   	}
                }
            }
        }		
        
		// reply-to profile url
		$twitter_status['in_reply_to_profileurl'] = null;
        if ($notice->reply_to) {
            $reply = Notice::getKV(intval($notice->reply_to));
            if ($reply) {
                $replier_profile = $reply->getProfile();
				$twitter_status['in_reply_to_profileurl'] = $replier_profile->profileurl;
			}
        }


        		     	
        
        // some more metadata about notice
		if($notice->is_local == '1') {
			$twitter_status['is_local'] = true;            					
			}
		else {
			$twitter_status['is_local'] = false;            					
			if($notice->object_type != 'activity') {
				$twitter_status['external_url'] = $notice->getUrl(true);							
				}
			}
			
		if($notice->object_type == 'activity') {
			$twitter_status['is_activity'] = true;            					
			}
		else {
			$twitter_status['is_activity'] = false;            					
			}            								

        return true;
    }
    
    
    /**
     * Cover photo in API response, also follows_you, etc
     *
     * @return boolean hook return
     */

    function onTwitterUserArray($profile, &$twitter_user, $scoped)
    {

        $twitter_user['cover_photo'] = Profile_prefs::getConfigData($profile, 'qvitter', 'cover_photo');        
        $twitter_user['background_image'] = Profile_prefs::getConfigData($profile, 'qvitter', 'background_image');                
        

		// follows me?
		if ($scoped) {
				$twitter_user['follows_you'] = $profile->isSubscribed($scoped);
				}
		
		// local user?		
		$twitter_user['is_local'] = $profile->isLocal();


        return true;
    }    
    


   /**
     * Insert into notification table
     */
    function insertNotification($to_profile_id, $from_profile_id, $ntype, $notice_id=false)
    {
		
		// no notifications from blocked profiles
		$to_user = User::getKV('id', $to_profile_id);
		$from_user = Profile::getKV($from_profile_id);
		if ($to_user instanceof User && $to_user->hasBlocked($from_user)) {
			return false;
			}
		
		// never notify myself
		if($to_profile_id == $from_profile_id) {
			return false;
			}
					
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

        return true;
    }   
    

    /**
     * Insert likes in notification table
     */
    public function onEndFavorNotice($profile, $notice)
    {
	
		// don't notify people favoriting their own notices 
 		if($notice->profile_id != $profile->id) {
            $this->insertNotification($notice->profile_id, $profile->id, 'like', $notice->id);
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

		// don't add notifications for activity type notices
		if($notice->object_type == 'activity') {
			return true;			
			}

		// mark reply/mention-notifications as read if we're replying to a notice we're notified about
		if($notice->reply_to) {

			$user = common_current_user();
            $notification_to_mark_as_seen = QvitterNotification::pkeyGet(array('is_seen' => 0,
                                                                                'notice_id' => $notice->reply_to,
                                                                                'to_profile_id' => $user->id));
            if($notification_to_mark_as_seen instanceof QvitterNotification
            && ($notification_to_mark_as_seen->ntype == 'mention' || $notification_to_mark_as_seen->ntype == 'reply')) {
                $orig = clone($notification_to_mark_as_seen);
                $notification_to_mark_as_seen->is_seen = 1;
                $notification_to_mark_as_seen->update($orig);            	
            	}                                                               
			}		

		// repeats
        if ($notice->isRepeat()) {
			$repeated_notice = Notice::getKV('id', $notice->repeat_of);
			if ($repeated_notice instanceof Notice) {        	
	            $this->insertNotification($repeated_notice->profile_id, $notice->profile_id, 'repeat', $repeated_notice->id);
				}
 			}  

		// replies and mentions (no notifications for these if this is a repeat)
 		else {
	 		$reply_notification_to = false; 		
			// check for reply to insert in notifications
			if($notice->reply_to) {
				$replyparent = $notice->getParent();
				$replyauthor = $replyparent->getProfile();
				if ($replyauthor instanceof Profile && !empty($notice->id)) {
					$reply_notification_to = $replyauthor->id;
					$this->insertNotification($replyauthor->id, $notice->profile_id, 'reply', $notice->id);
					}
				}

			// check for mentions to insert in notifications
			$mentions = common_find_mentions($notice->content, $notice);
			$sender = Profile::getKV($notice->profile_id);        
			$all_mentioned_user_ids = array();
			foreach ($mentions as $mention) {
				foreach ($mention['mentioned'] as $mentioned) {
					
					// no duplicate mentions
					if(in_array($mentioned->id, $all_mentioned_user_ids)) {
						continue;
						}					
					$all_mentioned_user_ids[] = $mentioned->id;
				
					// only notify if mentioned user is not already notified for reply
					if($reply_notification_to != $mentioned->id && !empty($notice->id)) {
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
			$this->insertNotification($other->id, $subscriber->id, 'follow', 1);            					
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

   /**
     * Replace GNU Social's default FAQ with Qvitter's
     *
     * @return boolean hook flag
     */
    public function onEndLoadDoc($title, &$output)
    {
    	
    	if($title == 'faq') {

	    	$faq = file_get_contents(QVITTERDIR.'/doc/en/faq.html');  
	    	$faq = str_replace('{instance-name}',common_config('site','name'),$faq); 
	    	$faq = str_replace('{instance-url}',common_config('site','server'),$faq); 	    	
	    	$faq = str_replace('{instance-url-with-protocol}',common_path('', true),$faq); 	    	
	
	        if (common_logged_in()) {		
				$user = common_current_user();
		    	$faq = str_replace('{nickname}',$user->nickname,$faq);
		    	}
	    	$output = $faq;
    		}
    			
        return true;
    }   
    
   /**
     * Add menu items to top header in Classic
     *
     * @return boolean hook flag
     */
    public function onStartPrimaryNav($action)
    {
       	
                $action->menuItem(common_local_url('doc', array('title' => 'faq')),
                                // TRANS: Menu item in primary navigation panel.
                                _m('MENU','FAQ'),
                                // TRANS: Menu item title in primary navigation panel.
                                _('Frequently asked questions'),
                                false,
                                'top_nav_doc_faq');
    			
        return true;
    }      


   /**
     * No registration for blocked ips
     *
     * @return boolean hook flag
     */
    public function onStartUserRegister($profile)
    {
       	
		if(is_array(self::settings("blocked_ips"))) {
			if(in_array($_SERVER['REMOTE_ADDR'], self::settings("blocked_ips"))) {
				return false;
				}
			}	
			
        return true;
    }        
             
        

   /**
     * Add unread notification count to all API responses
     *
     * @return boolean hook flag
     */        
    public function onEndSetApiUser($user) {
        if (!$user instanceof User) {
            return true;
        }

		$user_id = $user->id;
		$notification = new QvitterNotification();

		$notification->selectAdd();
		$notification->selectAdd('ntype');
		$notification->selectAdd('count(id) as count');        
		$notification->whereAdd("(to_profile_id = '".$user_id."')");
		$notification->groupBy('ntype');        
		$notification->whereAdd("(is_seen = '0')");
		$notification->whereAdd("(notice_id IS NOT NULL)");	// sometimes notice_id is NULL, those notifications are corrupt and should be discarded	
		$notification->find();
	
		$new_notifications = array();
		while ($notification->fetch()) {
			$new_notifications[$notification->ntype] = $notification->count;
			}
		
		header('Qvitter-Notifications: '.json_encode($new_notifications));				

    	return true;
    	}
        
        
    function onPluginVersion(&$versions)
    {
        $versions[] = array('name' => 'Qvitter',
                            'version' => '4',
                            'author' => 'Hannes Mannerheim',
                            'homepage' => 'https://github.com/hannesmannerheim/qvitter',
                            'rawdescription' => _m('User interface'));
        return true;
    }


	function darkness($hex) {
		$r = hexdec($hex[0].$hex[1]);
		$g = hexdec($hex[2].$hex[3]);
		$b = hexdec($hex[4].$hex[5]);
	    return (max($r, $g, $b) + min($r, $g, $b)) / 510.0; // HSL algorithm
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
