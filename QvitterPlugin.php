<?php

 /* · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · ·
  ·                                                                             ·
  ·                                                                             ·
  ·                             Q V I T T E R                                   ·
  ·                                                                             ·
  ·                      https://git.gnu.io/h2p/Qvitter                         ·
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

    protected $hijack_ui = false;
    protected $qvitter_hide_replies = false;

	static function settings($setting)
	{

 	/* · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · ·
         ·        							     ·
         ·                          S E T T I N G S                          ·
         ·         							     ·
         · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · */

		// THESE SETTINGS CAN BE OVERRIDDEN IN CONFIG.PHP
		// e.g. $config['site']['qvitter']['enabledbydefault'] = false;

		// ENABLED BY DEFAULT (true/false)
		$settings['enabledbydefault'] = true;

		// DEFAULT BACKGROUND COLOR
		$settings['defaultbackgroundcolor'] = '#f4f4f4';

		// DEFAULT BACKGROUND IMAGE
		$settings['sitebackground'] = 'img/vagnsmossen.jpg';

		// FAVICON PATH (we've used realfavicongenerator.net to generate the icons)
		$settings['favicon_path'] = Plugin::staticPath('Qvitter', '').'img/gnusocial-favicons/';

		// DEFAULT SPRITE
		$settings['sprite'] = Plugin::staticPath('Qvitter', '').'img/sprite.png?v=41';

		// DEFAULT LINK COLOR
		$settings['defaultlinkcolor'] = '#0084B4';

		// ENABLE DEFAULT WELCOME TEXT
		$settings['enablewelcometext'] = true;

		// CUSTOM WELCOME TEXT (overrides the previous setting)
		$settings['customwelcometext'] = false;

// 		Example:
// 		$settings['customwelcometext']['sv'] = '<h1>Välkommen till Quitter.se – en federerad<sup>1</sup> mikrobloggsallmänning!</h1><p>Etc etc...</p>';
// 		$settings['customwelcometext']['en'] = '<h1>Welcome to Quitter.se – a federated microblog common!</h1><p>Etc etc...</p>';

		// TIME BETWEEN POLLING
		$settings['timebetweenpolling'] = 5000; // ms

		// URL SHORTENER
		$settings['urlshortenerapiurl'] = 'http://qttr.at/yourls-api.php';
		$settings['urlshortenersignature'] = 'b6afeec983';

		// CUSTOM TERMS OF USE
		$settings['customtermsofuse'] = false;

		// IP ADDRESSES BLOCKED FROM REGISTRATION
		$settings['blocked_ips'] = array();

        // LINKIFY DOMAINS WITHOUT PROTOCOL AS DEFAULT
        $settings['linkify_bare_domains'] = true;


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

        // set linkify setting
        common_config_set('linkify', 'bare_domains', $settings['linkify_bare_domains']);

		if(isset($settings[$setting])) {
			return $settings[$setting];
		}
		else {
			return false;
		}
	}

    public function initialize()
    {
        // show qvitter link in the admin panel
        common_config_append('admin', 'panels', 'qvitteradm');
    }


    function onCheckSchema()
    {
        $schema = Schema::get();

        // make sure we have a notifications table
        $schema->ensureTable('qvitternotification', QvitterNotification::schemaDef());

        // index the url column in the notice table
        $notice_schemadef = $schema->getTableDef('notice');
        if(!isset($notice_schemadef['indexes']['notice_url_idx'])) {
            try {
                $schema->createIndex('notice', 'url');
            } catch (Exception $e) {
                common_log(LOG_ERR, __METHOD__ . ': ' . $e->getMessage());
            }
        }

        return true;
    }

	// route/reroute urls
    public function onRouterInitialized($m)
    {
		$m->connect(':nickname/mutes',
					array('action' => 'qvitter',
						  'nickname' => Nickname::INPUT_FMT));
        $m->connect('api/qvitter/mutes.json',
					array('action' => 'ApiQvitterMutes'));
        $m->connect('api/qvitter/sandboxed.:format',
                    array('action' => 'ApiQvitterSandboxed',
                          'format' => '(xml|json)'));
        $m->connect('api/qvitter/silenced.:format',
                    array('action' => 'ApiQvitterSilenced',
                          'format' => '(xml|json)'));
        $m->connect('api/qvitter/sandbox/create.json',
					array('action' => 'ApiQvitterSandboxCreate'));
        $m->connect('api/qvitter/sandbox/destroy.json',
					array('action' => 'ApiQvitterSandboxDestroy'));
        $m->connect('api/qvitter/silence/create.json',
					array('action' => 'ApiQvitterSilenceCreate'));
        $m->connect('api/qvitter/silence/destroy.json',
					array('action' => 'ApiQvitterSilenceDestroy'));
        $m->connect('services/oembed.:format',
                    array('action' => 'apiqvitteroembednotice',
                          'format' => '(xml|json)'));
        $m->connect('api/qvitter/check_email.json',
					array('action' => 'ApiQvitterCheckEmail'));
        $m->connect('api/qvitter/:nickname/lists/:id/subscribers.json',
                    array('action' => 'ApiQvitterListSubscribers',
                          'nickname' => '[a-zA-Z0-9]+',
                          'id' => '[a-zA-Z0-9]+'));
        $m->connect('api/qvitter/:nickname/lists/:id/members.json',
                    array('action' => 'ApiQvitterListMembers',
                          'nickname' => '[a-zA-Z0-9]+',
                          'id' => '[a-zA-Z0-9]+'));
        $m->connect('api/qvitter/:nickname/lists/:id/statuses.json',
                    array('action' => 'ApiQvitterTimelineList',
                          'nickname' => '[a-zA-Z0-9]+',
                          'id' => '[a-zA-Z0-9]+'));
        $m->connect('api/qvitter/blocks.json',
					array('action' => 'ApiQvitterBlocks'));
        $m->connect('api/qvitter/hello.json',
					array('action' => 'ApiQvitterHello'));
        $m->connect('api/qvitter/mark_all_notifications_as_seen.json',
					array('action' => 'ApiQvitterMarkAllNotificationsAsSeen'));
		$m->connect('api/qvitter/favs_and_repeats/:notice_id.json',
					array('action' => 'ApiFavsAndRepeats'),
					array('notice_id' => '[0-9]+'));
		$m->connect('api/statuses/public_and_external_timeline.:format',
					array('action' => 'ApiTimelinePublicAndExternal',
						  'format' => '(xml|json|rss|atom|as)'));
        $m->connect('api/qvitter/update_bookmarks.json',
					array('action' => 'ApiQvitterUpdateBookmarks'));
        $m->connect('api/qvitter/set_profile_pref.json',
					array('action' => 'ApiQvitterSetProfilePref'));
        $m->connect('api/qvitter/update_link_color.json',
					array('action' => 'apiqvitterupdatelinkcolor'));
		$m->connect('api/qvitter/update_background_color.json',
					array('action' => 'apiqvitterupdatebackgroundcolor'));
		$m->connect('api/qvitter/checklogin.json',
					array('action' => 'apiqvitterchecklogin'));
		$m->connect('api/qvitter/allfollowing/:id.json',
					array('action' => 'apiqvitterallfollowing',
						  'id' => Nickname::INPUT_FMT));
		$m->connect('api/account/update_profile_banner.json',
					array('action' => 'ApiAccountUpdateProfileBanner'));
		$m->connect('api/saved_searches/list.json',
					array('action' => 'ApiSavedSearchesList'));
		$m->connect('api/trends/place.json',
					array('action' => 'ApiTrendsPlace'));
		$m->connect('api/activity/about_me/unread.json',
					array('action' => 'ApiActivityAboutMeUnread'));
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
		$m->connect(':nickname/blocks',
					array('action' => 'qvitter',
						  'nickname' => Nickname::INPUT_FMT));
        $m->connect('settings/qvitter',
                    array('action' => 'qvittersettings'));
        $m->connect('panel/qvitter',
                    array('action' => 'qvitteradminsettings'));
        $m->connect('main/qlogin',
                    array('action' => 'qvitterlogin'));
        $m->connect('api/qvitter/statuses/update.:format',
					array('action' => 'ApiQvitterStatusesUpdate'),
					array('format' => '(xml|json)'));

		// check if we should reroute UI to qvitter, and which home-stream the user wants (hide-replies or normal)
		$scoped = Profile::current();
		$qvitter_enabled_by_user = 0;
		$qvitter_disabled_by_user = 0;
		if ($scoped instanceof Profile) {
			$qvitter_enabled_by_user = (int)$scoped->getPref('qvitter', 'enable_qvitter', false);
			$qvitter_disabled_by_user = (int)$scoped->getPref('qvitter', 'disable_qvitter', false);
            $this->qvitter_hide_replies = $scoped->getPref('qvitter', 'hide_replies', false);
		}

        // reroute to qvitter if we're logged out and qvitter is enabled by default
        if(static::settings('enabledbydefault') === true && is_null($scoped)) {
            $this->hijack_ui = true;
        }
        // if we're logged in and qvitter is enabled by default, reroute if the user has not disabled qvitter
        elseif(static::settings('enabledbydefault') === true && $qvitter_disabled_by_user == 0){
            $this->hijack_ui = true;
        }
        // if we're logged in, and qvitter is _not_ enabled by default, reroute if the user enabled qvitter
        elseif(static::settings('enabledbydefault') === false && $qvitter_enabled_by_user == 1) {
            $this->hijack_ui = true;
        }


        if ($this->hijack_ui === true) {

            // other plugins might want to reroute to qvitter
            Event::handle('QvitterHijackUI', array($m));

            $m->connect('', array('action' => 'qvitter'));
			$m->connect('main/all', array('action' => 'qvitter'));
            $m->connect('main/public', array('action' => 'qvitter'));
			$m->connect('main/silenced', array('action' => 'qvitter'));
            $m->connect('main/sandboxed', array('action' => 'qvitter'));
			$m->connect('search/notice', array('action' => 'qvitter'));

            // if the user wants the twitter style home stream with hidden replies to non-friends
            if ($this->qvitter_hide_replies == 1) {
			URLMapperOverwrite::overwrite_variable($m, 'api/statuses/friends_timeline.:format',
									array('action' => 'ApiTimelineFriends'),
									array('format' => '(xml|json|rss|atom|as)'),
									'ApiTimelineFriendsHiddenReplies');
                }

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
			URLMapperOverwrite::overwrite_variable($m, ':nickname/all/:tag',
									array('action' => 'showprofiletag'),
									array('nickname' => Nickname::DISPLAY_FMT,
                                          'tag' => Router::REGEX_TAG),
									'qvitter');
			URLMapperOverwrite::overwrite_variable($m, ':tagger/all/:tag/tagged',
									array('action' => 'peopletagged'),
									array('tagger' => Nickname::DISPLAY_FMT,
                                          'tag' => Router::REGEX_TAG),
									'qvitter');
			URLMapperOverwrite::overwrite_variable($m, ':tagger/all/:tag/subscribers',
									array('action' => 'peopletagsubscribers'),
									array('tagger' => Nickname::DISPLAY_FMT,
                                          'tag' => Router::REGEX_TAG),
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
			URLMapperOverwrite::overwrite_variable($m, 'conversation/:id',
									array('action' => 'conversation'),
									array('id' => '[0-9]+'),
									'qvitter');
		}

		// if qvitter is opt-out, disable the default register page (if we don't have a valid invitation code)
        $valid_code = isset($_POST['code'])
                        ? Invitation::getKV('code', $_POST['code'])
                        : null;
		if(self::settings('enabledbydefault') && empty($valid_code)) {
			$m->connect('main/register',
						array('action' => 'qvitter'));
			}


		// add user arrays for some urls, to use to build profile cards
		// this way we don't have to request this in a separate http request
		if(isset($_GET['withuserarray'])) switch (getPath($_REQUEST)) {
		case 'api/statuses/followers.json':
		case 'api/statuses/friends.json':
		case 'api/statusnet/groups/list.json':
		case 'api/statuses/mentions.json':
		case 'api/favorites.json':
		case 'api/statuses/friends_timeline.json':
		case 'api/statuses/user_timeline.json':

			// add logged in user's user array
			if (common_logged_in() && !isset($_GET['screen_name']) && !isset($_GET['id'])) {
				$profilecurrent = Profile::current();
				header('Qvitter-User-Array: '.json_encode($this->qvitterTwitterUserArray($profilecurrent)));
				}

			// add screen_name's user array
			elseif(isset($_GET['screen_name']) || isset($_GET['id'])){

                if(isset($_GET['screen_name'])) {
                    $user = User::getKV('nickname', $_GET['screen_name']);
                    }
                elseif(isset($_GET['id'])) {
                    $user = User::getKV('id', $_GET['id']);
                    }

                if($user instanceof User) {
					header('Qvitter-User-Array: '.json_encode($this->qvitterTwitterUserArray($user->getProfile())));
					}
				}
			break;
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
            						var toggleText = \''._('New').' '.str_replace("'","\'",common_config('site','name')).'\';
            						var qvitterEnabled = '.$qvitter_enabled.';
            						var qvitterAllLink = \''.common_local_url('all', array('nickname' => $user->nickname)).'\';
            						');
            $action->script($this->path('js/toggleqvitter.js').'?changed='.date('YmdHis',filemtime(QVITTERDIR.'/js/toggleqvitter.js')));
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
                          _m('Qvitter Settings'),
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
			$group_addressees[] = array('nickname'=>$g->nickname,'url'=>$g->mainpage);
			}
		$twitter_status['statusnet_in_groups'] = $group_addressees;

		// for older verions of gnu social: include the repeat-id, which we need when unrepeating later
		if(array_key_exists('repeated', $twitter_status) && $twitter_status['repeated'] === true) {
            $repeated = Notice::pkeyGet(array('profile_id' => $scoped->id,
                                        	'repeat_of' => $notice->id,
                                            'verb' => 'http://activitystrea.ms/schema/1.0/share'));
			$twitter_status['repeated_id'] = $repeated->id;

			}

		// more metadata about attachments

        // get all attachments first, and put all the extra meta data in an array
        $attachments = $notice->attachments();
        $attachment_url_to_id = array();
        if (!empty($attachments)) {
            foreach ($attachments as $attachment) {
				if(is_object($attachment)) {
                    try {
						$enclosure_o = $attachment->getEnclosure();

                        // Oembed
                        if(array_key_exists('Oembed', StatusNet::getActivePlugins())) {
                            $oembed = File_oembed::getKV('file_id',$attachment->id);
                            if($oembed instanceof File_oembed) {
                                $oembed_html = str_replace('&lt;!--//--&gt;','',$oembed->html); // trash left of wordpress' javascript after htmLawed removed the tags
                                if($oembed->provider == 'Twitter' && strstr($oembed_html, '>— '.$oembed->author_name)) {
                                    $oembed_html = substr($oembed_html,0,strpos($oembed_html, '>— '.$oembed->author_name)+1); // remove user data from twitter oembed html (we have it in )
                                    $twitter_username = substr($oembed->html,strpos($oembed->html, '>— '.$oembed->author_name)+strlen('>— '.$oembed->author_name));
                                    $twitter_username = substr($twitter_username, strpos($twitter_username,'(@')+1);
                                    $twitter_username = substr($twitter_username, 0,strpos($twitter_username,')'));
                                    $oembed->title = $twitter_username;
                                    }
                                $oembed_html = str_replace('&#8230;','...',$oembed_html); // ellipsis is sometimes stored as html in db, for some reason
                                $oembed_html = mb_substr(trim(strip_tags($oembed_html)),0,250);
                                $oembed_title = trim(strip_tags(html_entity_decode($oembed->title,ENT_QUOTES))); // sometimes we have html charachters that we want to decode and then strip
                                $oembed_provider = trim(strip_tags(html_entity_decode($oembed->provider,ENT_QUOTES)));
                                $oembed_author_name = trim(strip_tags(html_entity_decode($oembed->author_name,ENT_QUOTES)));
                                $attachment_url_to_id[$enclosure_o->url]['oembed'] = array(
                                    'type'=> $oembed->type,
                                    'provider'=> $oembed_provider,
                                    'provider_url'=> $oembed->provider_url,
                                    'oembedHTML'=> $oembed_html,
                                    'title'=> $oembed_title,
                                    'author_name'=> $oembed_author_name,
                                    'author_url'=> $oembed->author_url
                                );
                            } else {
                                $attachment_url_to_id[$enclosure_o->url]['oembed'] = false;
                            }
                        }

                        // add id to all attachments
                        $attachment_url_to_id[$enclosure_o->url]['id'] = $attachment->id;

                        // add an attachment version to all attachments
                        // this means we can force all cached attachments to update, if we change this
                        $attachment_url_to_id[$enclosure_o->url]['version'] = '1.2';

                        // add data about thumbnails
                        $thumb = $attachment->getThumbnail();
						$large_thumb = $attachment->getThumbnail(1000,3000,false);
                        if(method_exists('File_thumbnail','url')) {
                            $thumb_url = File_thumbnail::url($thumb->filename);
                            $large_thumb_url = File_thumbnail::url($large_thumb->filename);
                        } else {
                            $thumb_url = $thumb->getUrl();
                            $large_thumb_url = $large_thumb->getUrl();
                        }
						$attachment_url_to_id[$enclosure_o->url]['thumb_url'] = $thumb_url;
                        $attachment_url_to_id[$enclosure_o->url]['large_thumb_url'] = $large_thumb_url;
						$attachment_url_to_id[$enclosure_o->url]['width'] = $attachment->width;
						$attachment_url_to_id[$enclosure_o->url]['height'] = $attachment->height;

						// animated gif?
						if($attachment->mimetype == 'image/gif') {
							$image = ImageFile::fromFileObject($attachment);
							if($image->animated == 1) {
								$attachment_url_to_id[$enclosure_o->url]['animated'] = true;
							} else {
								$attachment_url_to_id[$enclosure_o->url]['animated'] = false;
							}
                        }

                    // this applies to older versions of gnu social, i think
					} catch (Exception $e) {
						$thumb = File_thumbnail::getKV('file_id', $attachment->id);
						if ($thumb instanceof File_thumbnail) {
                            $thumb_url = $thumb->getUrl();
							$attachment_url_to_id[$enclosure_o->url]['id'] = $attachment->id;
							$attachment_url_to_id[$enclosure_o->url]['thumb_url'] = $thumb_url;
                            $attachment_url_to_id[$enclosure_o->url]['large_thumb_url'] = $thumb_url;
							$attachment_url_to_id[$enclosure_o->url]['width'] = $attachment->width;
							$attachment_url_to_id[$enclosure_o->url]['height'] = $attachment->height;

							// animated gif?
							if($attachment->mimetype == 'image/gif') {
								$image = ImageFile::fromFileObject($attachment);
								if($image->animated == 1) {
									$attachment_url_to_id[$enclosure_o->url]['animated'] = true;
								}
								else {
									$attachment_url_to_id[$enclosure_o->url]['animated'] = false;
								}
							}
						}
					}
            	}
            }
        }

		// add the extra meta data to $twitter_status
        if (!empty($twitter_status['attachments'])) {
            foreach ($twitter_status['attachments'] as &$attachment) {
                if (!empty($attachment_url_to_id[$attachment['url']])) {
                    $attachment = array_merge($attachment,$attachment_url_to_id[$attachment['url']]);
                }
            }
        }

        // quoted notices
        if (!empty($twitter_status['attachments'])) {
            foreach ($twitter_status['attachments'] as &$attachment) {

                $quoted_notice = false;

                // if this attachment has an url this might be a notice url
                if (isset($attachment['url'])) {
                    $noticeurl = common_path('notice/', StatusNet::isHTTPS());
                    $instanceurl = common_path('', StatusNet::isHTTPS());

                    // remove protocol for the comparison below
                    $noticeurl_wo_protocol = preg_replace('(^https?://)', '', $noticeurl);
                    $instanceurl_wo_protocol = preg_replace('(^https?://)', '', $instanceurl);
                    $attachment_url_wo_protocol = preg_replace('(^https?://)', '', $attachment['url']);

                    // local notice urls
                    if(strpos($attachment_url_wo_protocol, $noticeurl_wo_protocol) === 0) {
                        $possible_notice_id = str_replace($noticeurl_wo_protocol,'',$attachment_url_wo_protocol);
                        if(ctype_digit($possible_notice_id)) {
                            $quoted_notice = Notice::getKV('id',$possible_notice_id);;
                        }
                    }
                    // remote. but we don't want to lookup every url in the db,
                    // so only do this if we have reason to believe this might
                    // be a remote notice url
                    elseif(strpos($attachment_url_wo_protocol, $instanceurl_wo_protocol) !== 0 && stristr($attachment_url_wo_protocol,'/notice/')) {
                        $quoted_notice = Notice::getKV('url',$attachment['url']);
                        // try with http<->https if no match. applies to quitter.se notices mostly
                        if(!$quoted_notice instanceof Notice) {
                            if(strpos($attachment['url'],'https://') === 0) {
                                $quoted_notice = Notice::getKV('url',str_replace('https://','http://', $attachment['url']));
                            } else {
                                $quoted_notice = Notice::getKV('url',str_replace('http://','https://', $attachment['url']));
                            }
                        }
                    }

                    // include the quoted notice in the attachment
                    if($quoted_notice instanceof Notice) {
                        $quoted_notice_author = Profile::getKV('id',$quoted_notice->profile_id);
                        if($quoted_notice_author instanceof Profile) {
                            $attachment['quoted_notice']['id'] = $quoted_notice->id;
                            $attachment['quoted_notice']['content'] = $quoted_notice->content;
                            $attachment['quoted_notice']['nickname'] = $quoted_notice_author->nickname;
                            $attachment['quoted_notice']['fullname'] = $quoted_notice_author->fullname;
                            $attachment['quoted_notice']['is_local'] = $quoted_notice_author->isLocal();
                            $quoted_notice_attachments = $quoted_notice->attachments();
                            foreach($quoted_notice_attachments as $q_attach) {
                                if(is_object($q_attach)) {
                                    try {
                                        $qthumb = $q_attach->getThumbnail();
                                        if(method_exists('File_thumbnail','url')) {
                                            $thumb_url = File_thumbnail::url($qthumb->filename);
                                        } else {
                                            $thumb_url = $qthumb->getUrl();
                                        }
                                        $attachment['quoted_notice']['attachments'][] = array('thumb_url'=>$thumb_url,
                                                                                              'attachment_id'=>$q_attach->id);
                                    } catch (Exception $e) {
                                        common_debug('Qvitter: could not get thumbnail for attachment id='.$q_attach->id.' in quoted notice id='.$quoted_notice->id);
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }


        try {
            $twitter_status['external_url'] = $notice->getUrl(true);
        } catch (InvalidUrlException $e) {
		    common_debug('Qvitter: No URL available for external notice: id='.$notice->id);
        }


		// reply-to profile url
        try {
            $reply = $notice->getParent();
            $reply_profile = $reply->getProfile();
			$twitter_status['in_reply_to_profileurl'] = $reply_profile->getUrl();
            $twitter_status['in_reply_to_ostatus_uri'] = $reply_profile->getUri();
        } catch (ServerException $e) {
		    $twitter_status['in_reply_to_profileurl'] = null;
            $twitter_status['in_reply_to_ostatus_uri'] = null;
        }

        // attentions
        try {
            $attentions = $notice->getAttentionProfiles();
            $attentions_array = array();
            foreach ($attentions as $attn) {
                if(!$attn->isGroup()) {
                    $attentions_array[] = array(
                        'id' => $attn->getID(),
                        'screen_name' => $attn->getNickname(),
                        'fullname' => $attn->getStreamName(),
                        'profileurl' => $attn->getUrl(),
                        'ostatus_uri' => $attn->getUri(),
                    );
                }
            }
        $twitter_status['attentions'] = $attentions_array;
        } catch (Exception $e) {
            //
        }

		// fave number
		$faves = Fave::byNotice($notice);
		$favenum = count($faves);
		$twitter_status['fave_num'] = $favenum;

		// repeat number
		$repeats = $notice->repeatStream();
        $repeatnum=0;
        while ($repeats->fetch()) {
            if($repeats->verb == ActivityVerb::SHARE) { // i.e. not deleted repeats
                $repeatnum++;
                }
        	}
		$twitter_status['repeat_num'] = $repeatnum;

        // is this a post? (previously is_activity)
        if(method_exists('ActivityUtils','compareVerbs')) {
            $twitter_status['is_post_verb'] = ActivityUtils::compareVerbs($notice->verb, array(ActivityVerb::POST));
            }
        else {
            $twitter_status['is_post_verb'] = ($notice->verb == ActivityVerb::POST ? true : false);
            }

        // some more metadata about notice
		if($notice->is_local == '1') {
			$twitter_status['is_local'] = true;
			}
		else {
			$twitter_status['is_local'] = false;
			if ($twitter_status['is_post_verb'] === true) {
                try {
                    $twitter_status['external_url'] = $notice->getUrl(true);
                } catch (InvalidUrlException $e) {
        		    common_debug('Qvitter: No URL available for external notice: id='.$notice->id);
                }
				}
			}


		if(ActivityUtils::compareTypes($notice->verb, array('qvitter-delete-notice', 'delete'))) {
			$twitter_status['qvitter_delete_notice'] = true;
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

        // twitter compatible
        $twitter_user['profile_link_color'] = Profile_prefs::getConfigData($profile, 'theme', 'linkcolor');
        $twitter_user['profile_background_color'] = Profile_prefs::getConfigData($profile, 'theme', 'backgroundcolor');
        $twitter_user['profile_banner_url'] = Profile_prefs::getConfigData($profile, 'qvitter', 'cover_photo');


		if ($scoped) {
            // follows me?
            $twitter_user['follows_you'] = $profile->isSubscribed($scoped);

            // blocks me?
            $twitter_user['blocks_you']  = $profile->hasBlocked($scoped);
        }

		// local user?
		$twitter_user['is_local'] = $profile->isLocal();


		// silenced?
		$twitter_user['is_silenced'] = $profile->isSilenced();

        // rights
        $twitter_user['rights'] = array();
        $twitter_user['rights']['delete_user'] = $profile->hasRight(Right::DELETEUSER);
        $twitter_user['rights']['delete_others_notice'] = $profile->hasRight(Right::DELETEOTHERSNOTICE);
        $twitter_user['rights']['silence'] = $profile->hasRight(Right::SILENCEUSER);
        $twitter_user['rights']['sandbox'] = $profile->hasRight(Right::SANDBOXUSER);

		// sandboxed?
		$twitter_user['is_sandboxed'] = $profile->isSandboxed();

        // ostatus uri
        if($twitter_user['is_local']) {
            $user = $profile->getUser();
            if($user instanceof User) {
                $twitter_user['ostatus_uri'] = $user->uri;
            }
        } else {
            $ostatus_profile = Ostatus_profile::getKV('profile_id',$profile->id);
            if($ostatus_profile instanceof Ostatus_profile) {
                $twitter_user['ostatus_uri'] = $ostatus_profile->uri;
            }
        }

        return true;
    }



   /**
     * Insert into notification table
     */
    function insertNotification($to_profile_id, $from_profile_id, $ntype, $notice_id=false)
    {

		$to_user = User::getKV('id', $to_profile_id);
		$from_profile = Profile::getKV($from_profile_id);

		// don't notify remote profiles
		if (!$to_user instanceof User) {
			return false;
			}

		// no notifications from blocked profiles
		if ($to_user->hasBlocked($from_profile)) {
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

        // mark reply and mention notifications as seen if i'm liking a notice i'm notified about
        self::markNotificationAsSeen($notice->id,$profile->id,'mention');
        self::markNotificationAsSeen($notice->id,$profile->id,'reply');
    }


    /**
     * Mark single notification as seen
     */
    public function markNotificationAsSeen($notice_id, $to_profile_id, $ntype)
    {
    $notification_to_mark_as_seen = QvitterNotification::pkeyGet(array(
        'is_seen' => 0,
        'notice_id' => $notice_id,
        'to_profile_id' => $to_profile_id,
        'ntype' => $ntype
    ));
    if($notification_to_mark_as_seen instanceof QvitterNotification) {
        $orig = clone($notification_to_mark_as_seen);
        $notification_to_mark_as_seen->is_seen = 1;
        $notification_to_mark_as_seen->update($orig);
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

        assert($notice->id > 0);    // since we removed tests below

		// repeats
        if ($notice->isRepeat()) {
			$repeated_notice = Notice::getKV('id', $notice->repeat_of);
			if ($repeated_notice instanceof Notice) {
	            $this->insertNotification($repeated_notice->profile_id, $notice->profile_id, 'repeat', $repeated_notice->id);

                // mark reply/mention-notifications as read if we're repeating to a notice we're notified about
                self::markNotificationAsSeen($repeated_notice->id,$notice->profile_id,'mention');
                self::markNotificationAsSeen($repeated_notice->id,$notice->profile_id,'reply');

                // (no other notifications repeats)
                return true;
                }
 			}

		// don't add notifications for activity/non-post-verb notices
        if(method_exists('ActivityUtils','compareVerbs')) {
            $is_post_verb = ActivityUtils::compareVerbs($notice->verb, array(ActivityVerb::POST));
            }
        else {
            $is_post_verb = ($notice->verb == ActivityVerb::POST ? true : false);
            }
        if($notice->source == 'activity' || !$is_post_verb) {
			return true;
			}

		// mark reply/mention-notifications as read if we're replying to a notice we're notified about
		if($notice->reply_to) {
            self::markNotificationAsSeen($notice->reply_to,$notice->profile_id,'mention');
            self::markNotificationAsSeen($notice->reply_to,$notice->profile_id,'reply');
			}


		// replies and mentions
 		$reply_notification_to = false;
		// check for reply to insert in notifications
		if($notice->reply_to) {
			try {
				$replyauthor = $notice->getParent()->getProfile();
				$reply_notification_to = $replyauthor->id;
				$this->insertNotification($replyauthor->id, $notice->profile_id, 'reply', $notice->id);
			//} catch (NoParentNoticeException $e) {	// TODO: catch this when everyone runs latest GNU social!
				// This is not a reply to something (has no parent)
			} catch (NoResultException $e) {
				// Parent author's profile not found! Complain louder?
				common_log(LOG_ERR, "Parent notice's author not found: ".$e->getMessage());
			}
		}

		// check for mentions to insert in notifications
		$mentions = $notice->getReplies();
		$sender = Profile::getKV($notice->profile_id);
		$all_mentioned_user_ids = array();
		foreach ($mentions as $mentioned) {

			// no duplicate mentions
			if(in_array($mentioned, $all_mentioned_user_ids)) {
				continue;
				}
			$all_mentioned_user_ids[] = $mentioned;

			// only notify if mentioned user is not already notified for reply
			if($reply_notification_to != $mentioned) {
				$this->insertNotification($mentioned, $notice->profile_id, 'mention', $notice->id);
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

		// outputs an activity notice that this notice was deleted
        $profile = $notice->getProfile();

        // don't delete if this is a user is being deleted
        // because that creates an infinite loop of deleting and creating notices...
        $user_is_deleted = false;
        $user = User::getKV('id',$profile->id);
        if($user instanceof User && $user->hasRole(Profile_role::DELETED)) {
            $user_is_deleted = true;
        }

        if(!$user_is_deleted && class_exists('StatusNet') && !array_key_exists('ActivityModeration', StatusNet::getActivePlugins())) {
            $rendered = sprintf(_m('<a href="%1$s">%2$s</a> deleted notice <a href="%3$s">{{%4$s}}</a>.'),
                                htmlspecialchars($profile->getUrl()),
                                htmlspecialchars($profile->getBestName()),
                                htmlspecialchars($notice->getUrl()),
                                htmlspecialchars($notice->uri));
            $text = sprintf(_m('%1$s deleted notice {{%2$s}}.'),
                                $profile->getBestName(),
                                $notice->uri);
            $uri = TagURI::mint('delete-notice:%d:%d:%s',
                                $notice->profile_id,
                                $notice->id,
                                common_date_iso8601(common_sql_now()));
            $notice = Notice::saveNew($notice->profile_id,
                                      $text,
                                      ActivityPlugin::SOURCE,
                                      array('rendered' => $rendered,
                                            'urls' => array(),
                                            'uri' => $uri,
                                            'verb' => 'qvitter-delete-notice',
                                            'object_type' => ActivityObject::ACTIVITY));
        }


        return true;
    }



   /**
     * Checks for deleted remote notices and deleted the locally
     * A local qvitter-delete-notice is outputted in the onNoticeDeleteRelated event above
     *
     * @return boolean hook flag
     */

    public function onEndHandleFeedEntry($activity) {

		if($activity->verb == 'qvitter-delete-notice' && class_exists('StatusNet') && !array_key_exists('ActivityModeration', StatusNet::getActivePlugins())) {

			$deleter_profile_uri = $activity->actor->id;
			$deleted_notice_uri = $activity->objects[0]->objects[0]->content;
			$deleted_notice_uri = substr($deleted_notice_uri,strpos($deleted_notice_uri,'{{')+2);
			$deleted_notice_uri = substr($deleted_notice_uri,0,strpos($deleted_notice_uri,'}}'));

			$deleter_ostatus_profile = Ostatus_profile::getKV('uri', $deleter_profile_uri);

			if(!$deleter_ostatus_profile instanceof Ostatus_profile) {
				return true;
				}

			$deleter_profile = Profile::getKV('id', $deleter_ostatus_profile->profile_id);
			$deleted_notice = Notice::getKV('uri', $deleted_notice_uri);

			if(!($deleter_profile instanceof Profile) || !($deleted_notice instanceof Notice)) {
				return true;
				}

			if($deleter_profile->id != $deleted_notice->profile_id) {
				return true;
				}

			$deleted_notice->delete();
			}

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
     * Correct group mentions
     *
     * We get the correct group ids in a $_POST var called "post_to_groups", formatted as a string with ids separated by colon, e.g. 4:5
     *
     * @return boolean hook flag
     */
    public function onEndFindMentions($sender, $text, &$mentions) {

        // get the correct group profiles
        if(isset($_POST['post_to_groups'])) {
            $correct_group_mentions = explode(':',$_POST['post_to_groups']);
            foreach($correct_group_mentions as $group_id) {
                $correct_groups[] = User_group::getKV('id',$group_id);
                }

            // loop through the groups guessed by gnu social's common_find_mentions() and correct them
            foreach($mentions as $mention_array_id=>$mention) {
                foreach($correct_groups as $correct_groups_array_id=>$correct_group) {
                    if(isset($mention['mentioned'][0]->nickname)
                    && isset($correct_group->nickname)
                    && $mention['mentioned'][0]->nickname == $correct_group->nickname
                    && !isset($mentions[$mention_array_id]['corrected'])) {
                        $user_group_profile = Profile::getKV('id',$correct_group->profile_id);
                        $mentions[$mention_array_id]['mentioned'][0] = $user_group_profile;
                        $mentions[$mention_array_id]['url'] = $correct_group->permalink();
                        $mentions[$mention_array_id]['title'] = $correct_group->getFancyName();
                        $mentions[$mention_array_id]['corrected'] = true;
                        // now we've used this
                        unset($correct_groups[$correct_groups_array_id]);
                        }
                    }
                }
            }

        return true;
        }



   /**
     * Add unread notification count to all API responses, when logged in
     *
     * @return boolean hook flag
     */
    public function onEndSetApiUser($user) {

        // cleanup sessions, to allow for simultaneous http-requests,
        // e.g. if posting a notice takes a very long time
        Session::cleanup();

        if (!$user instanceof User) {
            return true;
        }

		$user_id = $user->id;
        $profile = $user->getProfile();
		$notification = new QvitterNotification();

		$notification->selectAdd();
		$notification->selectAdd('ntype');
		$notification->selectAdd('count(id) as count');
		$notification->whereAdd("(to_profile_id = '".$user_id."')");

        // if the user only want notifications from users they follow
        $only_show_notifications_from_users_i_follow = Profile_prefs::getConfigData($profile, 'qvitter', 'only_show_notifications_from_users_i_follow');
        if($only_show_notifications_from_users_i_follow == '1') {
            $notification->whereAdd(sprintf('qvitternotification.from_profile_id IN (SELECT subscribed FROM subscription WHERE subscriber = %u)', $user_id));
            }

        // the user might have opted out from notifications from profiles they have muted
        $hide_notifications_from_muted_users = Profile_prefs::getConfigData($profile, 'qvitter', 'hide_notifications_from_muted_users');
        if($hide_notifications_from_muted_users == '1') {
            $muted_ids = QvitterMuted::getMutedIDs($profile->id,0,10000); // get all (hopefully not more than 10 000...)
            if($muted_ids !== false && count($muted_ids) > 0) {
                $ids_imploded = implode(',',$muted_ids);
                $notification->whereAdd('qvitternotification.from_profile_id NOT IN ('.$ids_imploded.')');
                }
            }

        // the user might have opted out from certain notification types
        $current_profile = $user->getProfile();
        $disable_notify_replies_and_mentions = Profile_prefs::getConfigData($current_profile, 'qvitter', 'disable_notify_replies_and_mentions');
        $disable_notify_favs = Profile_prefs::getConfigData($current_profile, 'qvitter', 'disable_notify_favs');
        $disable_notify_repeats = Profile_prefs::getConfigData($current_profile, 'qvitter', 'disable_notify_repeats');
        $disable_notify_follows = Profile_prefs::getConfigData($current_profile, 'qvitter', 'disable_notify_follows');
        if($disable_notify_replies_and_mentions == '1') {
            $notification->whereAdd('qvitternotification.ntype != "mention"');
            $notification->whereAdd('qvitternotification.ntype != "reply"');
            }
        if($disable_notify_favs == '1') {
            $notification->whereAdd('qvitternotification.ntype != "like"');
            }
        if($disable_notify_repeats == '1') {
            $notification->whereAdd('qvitternotification.ntype != "repeat"');
            }
        if($disable_notify_follows == '1') {
            $notification->whereAdd('qvitternotification.ntype != "follow"');
            }

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


    function onPluginVersion(array &$versions)
    {
        $versions[] = array('name' => 'Qvitter',
                            'version' => '5-alpha',
                            'author' => 'Hannes Mannerheim',
                            'homepage' => 'https://git.gnu.io/h2p/Qvitter',
                            'rawdescription' => _m('User interface'));
        return true;
    }


    function qvitterTwitterUserArray($profile)
    {
        $twitter_user = array();

        try {
            $user = $profile->getUser();
        } catch (NoSuchUserException $e) {
            $user = null;
        }

        $twitter_user['id'] = intval($profile->id);
        $twitter_user['name'] = $profile->getBestName();
        $twitter_user['screen_name'] = $profile->nickname;
        $twitter_user['location'] = ($profile->location) ? $profile->location : null;
        $twitter_user['description'] = ($profile->bio) ? $profile->bio : null;

        // TODO: avatar url template (example.com/user/avatar?size={x}x{y})
        $twitter_user['profile_image_url'] = Avatar::urlByProfile($profile, AVATAR_STREAM_SIZE);
        $twitter_user['profile_image_url_https'] = $twitter_user['profile_image_url'];

        // START introduced by qvitter API, not necessary for StatusNet API
        $twitter_user['profile_image_url_profile_size'] = Avatar::urlByProfile($profile, AVATAR_PROFILE_SIZE);
        try {
            $avatar  = Avatar::getUploaded($profile);
            $origurl = $avatar->displayUrl();
        } catch (Exception $e) {

            // ugly fix if avatar is missing in the db but exists on the server
            $largest_avatar = array('name'=>false,'size'=>0);
            foreach (glob('avatar/'.$profile->id.'-*') as $filename) {
                $size = filesize($filename);
                if($size > $largest_avatar['size']) {
                    $largest_avatar['size'] = $size;
                    $largest_avatar['name'] = $filename;
                }
            }
            if($largest_avatar['size']>0) {
                $origurl = common_path('', StatusNet::isHTTPS()).$largest_avatar['name'];
            } else {
                $origurl = $twitter_user['profile_image_url_profile_size'];
            }

        }
        $twitter_user['profile_image_url_original'] = $origurl;

        $twitter_user['groups_count'] = $profile->getGroupCount();
        foreach (array('linkcolor', 'backgroundcolor') as $key) {
            $twitter_user[$key] = Profile_prefs::getConfigData($profile, 'theme', $key);
        }
        // END introduced by qvitter API, not necessary for StatusNet API

        $twitter_user['url'] = ($profile->homepage) ? $profile->homepage : null;
        $twitter_user['protected'] = (!empty($user) && $user->private_stream) ? true : false;
        $twitter_user['followers_count'] = $profile->subscriberCount();

        // Note: some profiles don't have an associated user

        $twitter_user['friends_count'] = $profile->subscriptionCount();

        $twitter_user['created_at'] = ApiAction::dateTwitter($profile->created);

        $timezone = 'UTC';

        if (!empty($user) && $user->timezone) {
            $timezone = $user->timezone;
        }

        $t = new DateTime;
        $t->setTimezone(new DateTimeZone($timezone));

        $twitter_user['utc_offset'] = $t->format('Z');
        $twitter_user['time_zone'] = $timezone;
        $twitter_user['statuses_count'] = $profile->noticeCount();

        // Is the requesting user following this user?
        $twitter_user['following'] = false;
        $twitter_user['statusnet_blocking'] = false;

		$logged_in_profile = null;

        if(common_logged_in()) {

            $logged_in_profile = Profile::current();

            $twitter_user['following'] = $logged_in_profile->isSubscribed($profile);
            $twitter_user['statusnet_blocking']  = $logged_in_profile->hasBlocked($profile);

        }

        // StatusNet-specific

        $twitter_user['statusnet_profile_url'] = $profile->profileurl;

        Event::handle('TwitterUserArray', array($profile, &$twitter_user, $logged_in_profile, array()));

        return $twitter_user;
    }


}




/**
 * Overwrites variables in URL-mapping
 *
 */
class URLMapperOverwrite extends URLMapper
{
    static function overwrite_variable($m, $path, $args, $paramPatterns, $newaction)
    {

        $m->connect($path, array('action' => $newaction), $paramPatterns);

		$regex = self::makeRegex($path, $paramPatterns);

		foreach($m->variables as $n=>$v)
			if($v[1] == $regex)
				$m->variables[$n][0]['action'] = $newaction;
    }
}
