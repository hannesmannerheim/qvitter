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
class QvitterAction extends ApiAction
{

    function isReadOnly($args)
    {
        return true;
    }

    protected function prepare(array $args=array())
    {
        parent::prepare($args);

        $user = common_current_user();

        return true;
    }

    protected function handle()
    {
        parent::handle();
        
        $this->showQvitter();

    }

    function showQvitter()
    {


		$logged_in_user_nickname = '';
		$logged_in_user_obj = false;		
		$logged_in_user = common_current_user();
		if($logged_in_user) {
			$logged_in_user_nickname = $logged_in_user->nickname;
			$logged_in_user_obj = ApiAction::twitterUserArray($logged_in_user->getProfile());
			}
			
		$registrationsclosed = false;
		if(common_config('site','closed') == 1 || common_config('site','inviteonly') == 1) {
			$registrationsclosed = true;
			}
			
		$sitetitle = common_config('site','name');
		$siterootdomain = common_config('site','server');
		$qvitterpath = Plugin::staticPath('Qvitter', '');
		$apiroot = common_path('api/', true);
		$instanceurl = common_path('', true);

		common_set_returnto(''); // forget this

		// if this is a profile we add a link header for LRDD Discovery (see WebfingerPlugin.php)
		if(substr_count($_SERVER['REQUEST_URI'], '/') == 1) { 
			$nickname = substr($_SERVER['REQUEST_URI'],1);
			if(preg_match("/^[a-zA-Z0-9]+$/", $nickname) == 1) {
					$acct = 'acct:'. $nickname .'@'. common_config('site', 'server');
					$url = common_local_url('webfinger') . '?resource='.$acct;
					foreach (array(Discovery::JRD_MIMETYPE, Discovery::XRD_MIMETYPE) as $type) {
						header('Link: <'.$url.'>; rel="'. Discovery::LRDD_REL.'"; type="'.$type.'"');
					}
				}
			}	

		?><!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.1//EN"
		"http://www.w3.org/TR/xhtml11/DTD/xhtml11.dtd">
		<html xmlns="http://www.w3.org/1999/xhtml">
			<head>  
				<title><?php print $sitetitle; ?></title>
				<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
				<meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=0">		
				<link rel="stylesheet" type="text/css" href="<?php print $qvitterpath; ?>css/qvitter.css?v=40" />
				<link rel="stylesheet" type="text/css" href="<?php print $qvitterpath; ?>css/jquery.minicolors.css" />		
				<link rel="shortcut icon" type="image/x-icon" href="<?php print $qvitterpath; ?>/img/favicon.ico?v=4">
				<?php

				// if qvitter is a webapp and this is a users url we add feeds
				if(substr_count($_SERVER['REQUEST_URI'], '/') == 1) { 
					$nickname = substr($_SERVER['REQUEST_URI'],1);
					if(preg_match("/^[a-zA-Z0-9]+$/", $nickname) == 1) {
						$user = User::getKV('nickname', $nickname); 
						if(!isset($user->id)) {
							error_log("QVITTER: Could not get user id for user with nickname: $nickname – REQUEST_URI: ".$_SERVER['REQUEST_URI']);
							}        
						else {
							print '<link title="Notice feed for '.$nickname.' (Activity Streams JSON)" type="application/stream+json" href="'.$instanceurl.'api/statuses/user_timeline/'.$user->id.'.as" rel="alternate">'."\n";
							print '		<link title="Notice feed for '.$nickname.' (RSS 1.0)" type="application/rdf+xml" href="'.$instanceurl.$nickname.'/rss" rel="alternate">'."\n";
							print '		<link title="Notice feed for '.$nickname.' (RSS 2.0)" type="application/rss+xml" href="'.$instanceurl.'api/statuses/user_timeline/'.$user->id.'.rss" rel="alternate">'."\n";
							print '		<link title="Notice feed for '.$nickname.' (Atom)" type="application/atom+xml" href="'.$instanceurl.'api/statuses/user_timeline/'.$user->id.'.atom" rel="alternate">'."\n";
							print '		<link title="FOAF for '.$nickname.'" type="application/rdf+xml" href="'.$instanceurl.$nickname.'/foaf" rel="meta">'."\n";
							print '		<link href="'.$instanceurl.$nickname.'/microsummary" rel="microsummary">'."\n";		    
							}		
						}
					}
				elseif(substr($_SERVER['REQUEST_URI'],0,7) == '/group/') {
					$group_id_or_name = substr($_SERVER['REQUEST_URI'],7);
					if(stristr($group_id_or_name,'/id')) {
						$group_id_or_name = substr($group_id_or_name, 0, strpos($group_id_or_name,'/id'));
						$group = User_group::getKV('id', $group_id_or_name);		
						$group_name = $group->nickname;
						$group_id = $group_id_or_name;				
						}
					else {
						$group = User_group::getKV('nickname', $group_id_or_name);		
						$group_id = $group->id;				
						$group_name = $group_id_or_name;								
						}
					if(preg_match("/^[a-zA-Z0-9]+$/", $group_id_or_name) == 1) {
						print '<link rel="alternate" href="'.$apiroot.'statusnet/groups/timeline/'.$group_id.'.as" type="application/stream+json" title="Notice feed for '.$group_id_or_name.' group (Activity Streams JSON)"/>'."\n";
						print '		<link rel="alternate" href="'.$instanceurl.'group/'.$group_name.'/rss" type="application/rdf+xml" title="Notice feed for '.$group_id_or_name.' group (RSS 1.0)"/>'."\n";
						print '		<link rel="alternate" href="'.$instanceurl.'api/statusnet/groups/timeline/'.$group_id.'.rss" type="application/rss+xml" title="Notice feed for '.$group_id_or_name.' group (RSS 2.0)"/>'."\n";
						print '		<link rel="alternate" href="'.$instanceurl.'api/statusnet/groups/timeline/'.$group_id.'.atom" type="application/atom+xml" title="Notice feed for '.$group_id_or_name.' group (Atom)"/>'."\n";
						print '		<link rel="meta" href="'.$instanceurl.'group/'.$group_name.'/foaf" type="application/rdf+xml" title="FOAF for '.$group_id_or_name.' group"/>'."\n";						
						}
					}			
				
				
				
				?>
				<script>
					window.defaultAvatarStreamSize = <?php print json_encode(Avatar::defaultImage(AVATAR_STREAM_SIZE)) ?>;
					window.textLimit = <?php print json_encode((int)common_config('site','textlimit')) ?>;
					window.registrationsClosed = <?php print json_encode($registrationsclosed) ?>;
					window.siteTitle = <?php print json_encode($sitetitle) ?>;
					window.loggedIn = <?php 
					
					$logged_in_user_json = json_encode($logged_in_user_obj);
					$logged_in_user_json = str_replace('http:\/\/quitter.se\/','https:\/\/quitter.se\/',$logged_in_user_json);    	
					print $logged_in_user_json; 
					
					?>;
					window.timeBetweenPolling = <?php print QvitterPlugin::settings("timebetweenpolling"); ?>;
					window.apiRoot = '<?php print common_path("api/", true); ?>';
					window.avatarRoot = '<?php print common_path("avatar/", true); ?>';					
					window.fullUrlToThisQvitterApp = '<?php print $qvitterpath; ?>';
					window.siteRootDomain = '<?php print $siterootdomain; ?>';
					window.siteInstanceURL = '<?php print $instanceurl; ?>';			
					window.defaultLinkColor = '<?php print QvitterPlugin::settings("defaultlinkcolor"); ?>';
					window.defaultBackgroundColor = '<?php print QvitterPlugin::settings("defaultbackgroundcolor"); ?>';
					window.urlShortenerAPIURL = '<?php print QvitterPlugin::settings("urlshortenerapiurl"); ?>';					
					window.urlShortenerSignature = '<?php print QvitterPlugin::settings("urlshortenersignature"); ?>';
					window.commonSessionToken = '<?php print common_session_token(); ?>';										
				</script>
				<style>
					a, a:visited, a:active,
					ul.stats li:hover a,
					ul.stats li:hover a strong,
					#user-body a:hover div strong,
					#user-body a:hover div div,
					.permalink-link:hover,
					.stream-item.expanded > .queet .stream-item-expand,
					.stream-item-footer .with-icn .requeet-text a b:hover,
					.queet-text span.attachment.more,
					.stream-item-header .created-at a:hover,
					.stream-item-header a.account-group:hover .name,
					.queet:hover .stream-item-expand,
					.show-full-conversation:hover,
					#new-queets-bar,
					.menu-container div,	
					.cm-mention, .cm-tag, .cm-group, .cm-url, .cm-email,
					div.syntax-middle span,
					#user-body strong,
					ul.stats,
					.stream-item:not(.temp-post) ul.queet-actions li .icon:hover:before,
					.show-full-conversation,
					#user-body #user-queets:hover .label,
					#user-body #user-groups:hover .label, 
					#user-body #user-following:hover .label,
					ul.stats a strong,
					.queet-box-extras button {
						color:#0084B4;/*COLOREND*/
						}			
					#unseen-notifications,
					.stream-item.notification .not-seen,
					#top-compose,
					#logo,
					.queet-toolbar button,
					#user-header,
					.profile-header-inner,
					.topbar,
					.menu-container,
					.member-button.member,
					.external-follow-button.following,
					.follow-button.following,
					.save-profile-button,
					.crop-and-save-button,
					.topbar .global-nav.show-logo:before,
					.topbar .global-nav.pulse-logo:before {
						background-color:#0084B4;/*BACKGROUNDCOLOREND*/
						}	
					.queet-box-syntax[contenteditable="true"]:focus {
						border-color:#999999;/*BORDERCOLOREND*/						
						}
					#user-footer-inner,
					.inline-reply-queetbox,
					#popup-faq #faq-container p.indent {
						background-color:rgb(205,230,239);/*LIGHTERBACKGROUNDCOLOREND*/
						}
					#user-footer-inner,
					.queet-box,
					.queet-box-syntax[contenteditable="true"],
					.inline-reply-queetbox,
					span.inline-reply-caret,
					.stream-item.expanded > .queet + .stream-item.conversation:not(.hidden-conversation),
					#popup-faq #faq-container p.indent {
						border-color:rgb(155,206,224);/*LIGHTERBORDERCOLOREND*/
						}
					span.inline-reply-caret .caret-inner {
						border-bottom-color:rgb(205,230,239);/*LIGHTERBORDERBOTTOMCOLOREND*/
						}
						
				</style>
			</head>
			<body style="background-color:<?php print QvitterPlugin::settings("defaultbackgroundcolor"); ?>">
				<input id="upload-image-input" class="upload-image-input" type="file" name="upload-image-input" accept="image/*"> 
				<div class="topbar">
					<a href="<?php print $instanceurl; ?>"><div id="logo"></div></a>
					<a id="settingslink">
						<div class="dropdown-toggle">
							<div class="nav-session"></div>
						</div>
					</a>
					<div id="top-compose" class="hidden"></div>
					<ul class="quitter-settings dropdown-menu">
						<li class="dropdown-caret right">
							<span class="caret-outer"></span>
							<span class="caret-inner"></span>
						</li>
						<li class="fullwidth"><a id="logout"></a></li>
						<li class="fullwidth dropdown-divider"></li>
						<li class="fullwidth"><a id="edit-profile-header-link"></a></li>						
						<li class="fullwidth"><a id="settings" href="<?php print $instanceurl; ?>settings/profile"></a></li>						
						<li class="fullwidth"><a id="faq-link"></a></li>	
						<li class="fullwidth"><a id="classic-link"></a></li>												
						<li class="fullwidth language dropdown-divider"></li>										
						<li class="language"><a class="language-link" title="Arabic" data-lang-code="ar">العربيّة</a></li>	
						<li class="language"><a class="language-link" title="简体中文" data-lang-code="zh_cn">简体中文</a></li>
						<li class="language"><a class="language-link" title="繁體中文" data-lang-code="zh_tw">繁體中文</a></li>													
						<li class="language"><a class="language-link" title="German" data-lang-code="de">Deutsch</a></li>
						<li class="language"><a class="language-link" title="English" data-lang-code="en">English</a></li>
						<li class="language"><a class="language-link" title="Spanish" data-lang-code="es">Español</a></li>	
						<li class="language"><a class="language-link" title="Esperanto" data-lang-code="eo">Esperanto</a></li>													
						<li class="language"><a class="language-link" title="Basque" data-lang-code="eu">Euskara</a></li>																			
						<li class="language"><a class="language-link" title="Farsi" data-lang-code="fa">فارسی</a></li>									
						<li class="language"><a class="language-link" title="French" data-lang-code="fr">français</a></li>									
						<li class="language"><a class="language-link" title="Galego" data-lang-code="gl">Galego</a></li>															
						<li class="language"><a class="language-link" title="Italian" data-lang-code="it">Italiano</a></li>													
						<li class="language"><a class="language-link" title="Norwegian" data-lang-code="no">Norsk</a></li>						
						<li class="language"><a class="language-link" title="Português-Brasil" data-lang-code="pt_br">Português-Brasil</a></li>													
						<li class="language"><a class="language-link" title="Suomi [beta]" data-lang-code="fi">Suomi [beta]</a></li>
						<li class="language"><a class="language-link" title="Swedish" data-lang-code="sv">svenska</a></li>					
					</ul>	
					<div class="global-nav">
						<div class="global-nav-inner">
							<div class="container">				
								<div id="search">
									<input type="text" spellcheck="false" autocomplete="off" name="q" placeholder="Sök" id="search-query" class="search-input">
									<span class="search-icon">
										<button class="icon nav-search" type="submit" tabindex="-1">
											<span> Sök </span>
										</button>						    
									</span>
								</div>	
								<ul class="language-dropdown">
									<li class="dropdown">
										<a class="dropdown-toggle">
											<small></small>
											<span class="current-language"></span>
											<b class="caret"></b>
										</a>
										<ul class="dropdown-menu">
											<li class="dropdown-caret right">
												<span class="caret-outer"></span>
												<span class="caret-inner"></span>
											</li>
											<li><a class="language-link" title="Arabic" data-lang-code="ar">العربيّة</a></li>	
											<li><a class="language-link" title="简体中文" data-lang-code="zh_cn">简体中文</a></li>	
											<li><a class="language-link" title="繁體中文" data-lang-code="zh_tw">繁體中文</a></li>																						
											<li><a class="language-link" title="German" data-lang-code="de">Deutsch</a></li>
											<li><a class="language-link" title="English" data-lang-code="en">English</a></li>
											<li><a class="language-link" title="Spanish" data-lang-code="es">Español</a></li>									
											<li><a class="language-link" title="Esperanto" data-lang-code="eo">Esperanto</a></li>																		
											<li><a class="language-link" title="Basque" data-lang-code="eu">Euskara</a></li>																														
											<li><a class="language-link" title="Farsi" data-lang-code="fa">فارسی</a></li>									
											<li><a class="language-link" title="French" data-lang-code="fr">français</a></li>	
											<li><a class="language-link" title="Galego" data-lang-code="gl">Galego</a></li>	
											<li><a class="language-link" title="Italian" data-lang-code="it">Italiano</a></li>
											<li><a class="language-link" title="Norwegian" data-lang-code="no">Norsk</a></li>														
											<li><a class="language-link" title="Português-Brasil" data-lang-code="pt_br">Português-Brasil</a></li>																														
											<li><a class="language-link" title="Suomi [beta]" data-lang-code="fi">Suomi [beta]</a></li>											
											<li><a class="language-link" title="Swedish" data-lang-code="sv">svenska</a></li>								
										</ul>
									</li>
								</ul>					
							</div>
						</div>
					</div>
				</div>
				<div id="page-container">
					<?php
					
					$site_notice = common_config('site', 'notice');
					if(!empty($site_notice)) {
						print '<div id="site-notice">'.common_config('site', 'notice').'</div>';
						}														
					
					?><div class="front-welcome-text">
						<h1></h1>
						<p></p>
					</div>		
					<div id="user-container" style="display:none;">		
						<div id="login-content">
							<form id="form_login" class="form_settings" action="<?php print common_local_url('qvitterlogin'); ?>" method="post">
								<div id="username-container">
									<input id="nickname" name="nickname" type="text" value="<?php print $logged_in_user_nickname ?>" tabindex="1" />
								</div>
								<table class="password-signin"><tbody><tr>
									<td class="flex-table-primary">
										<div class="placeholding-input">
											<input id="password" name="password" type="password" tabindex="2" value="" />
										</div>
									</td>
									<td class="flex-table-secondary">
										<button class="submit" type="submit" id="submit-login" tabindex="4"></button>
									</td>
								</tr></tbody></table>
								<div id="remember-forgot">
									<input type="checkbox" id="rememberme" name="rememberme" value="yes" tabindex="3" checked="checked"> <span id="rememberme_label"></span> · <a href="<?php print $instanceurl ?>main/recoverpassword"></a>
									<input type="hidden" id="token" name="token" value="<?php print common_session_token(); ?>">								
								</div>
							</form>
						</div>
						<?php
						if($registrationsclosed === false) {
						?><div class="front-signup">
							<h2></h2>
							<div class="signup-input-container"><input placeholder="" type="text" name="user[name]" autocomplete="off" class="text-input" id="signup-user-name"></div>
							<div class="signup-input-container"><input placeholder="" type="text" name="user[email]" autocomplete="off" id="signup-user-email"></div>
							<div class="signup-input-container"><input placeholder="" type="password" name="user[user_password]" class="text-input" id="signup-user-password"></div>
							<button id="signup-btn-step1" class="signup-btn" type="submit"></button>
							<div id="other-servers-link"></div>
						</div><?php } ?>
						<div id="user-header">
							<div id="mini-edit-profile-button"></div>
							<div class="profile-header-inner-overlay"></div>						
							<div id="user-avatar-container"><img id="user-avatar" src="" /></div>
							<div id="user-name"></div>
							<div id="user-screen-name"></div>					
						</div>
						<ul id="user-body">
							<li><a id="user-queets"><span class="label"></span><strong></strong></a></li>
							<li><a id="user-following"><span class="label"></span><strong></strong></a></li>
							<li><a id="user-groups"><span class="label"></span><strong></strong></a></li>									
						</ul>				
						<div id="user-footer">
							<div id="user-footer-inner">
								<div id="queet-box" class="queet-box queet-box-syntax" data-start-text=""></div>
								<div class="syntax-middle"></div>
								<div class="syntax-two" contenteditable="true"></div>							
								<div class="mentions-suggestions"></div>			
								<div class="queet-toolbar">
									<div class="queet-box-extras">
										<button class="upload-image"></button>
										<button class="shorten disabled">URL</button>
									</div>
									<div class="queet-button">
										<span class="queet-counter"></span>
										<button></button>
									</div>						
								</div>
							</div>
						</div>										
						<div class="menu-container">
							<a class="stream-selection friends-timeline" data-stream-header="" data-stream-name="statuses/friends_timeline.json"><i class="chev-right"></i></a>
							<a class="stream-selection notifications" data-stream-header="" data-stream-name="qvitter/statuses/notifications.json"><span id="unseen-notifications"></span><i class="chev-right"></i></a>											
							<a class="stream-selection mentions" data-stream-header="" data-stream-name="statuses/mentions.json"><i class="chev-right"></i></a>				
							<a class="stream-selection my-timeline" data-stream-header="@statuses/user_timeline.json" data-stream-name="statuses/user_timeline.json"><i class="chev-right"></i></a>				
							<a class="stream-selection favorites" data-stream-header="" data-stream-name="favorites.json"><i class="chev-right"></i></a>									
							<a href="<?php print $instanceurl ?>" class="stream-selection public-timeline" data-stream-header="" data-stream-name="statuses/public_timeline.json"><i class="chev-right"></i></a>
							<a href="<?php print $instanceurl ?>main/all" class="stream-selection public-and-external-timeline" data-stream-header="" data-stream-name="statuses/public_and_external_timeline.json"><i class="chev-right"></i></a>					
						</div>
						<div class="menu-container" id="history-container"></div>				
						<div id="qvitter-notice"><?php print common_config('site', 'qvitternotice'); ?></div>																
					</div>						
					<div id="feed">
						<div id="feed-header">
							<div id="feed-header-inner">
								<h2></h2>
								<div class="reload-stream"></div>								
							</div>
						</div>
						<div id="new-queets-bar-container" class="hidden"><div id="new-queets-bar"></div></div>
						<div id="feed-body"></div>
					</div>
			
					<div id="footer"><div id="footer-spinner-container"></div></div>
				</div>

				<!-- FAQ -->
				<div id="faq-html" style="display:none">
					<h1>{instance-name} Howto</h1>
 
					<p>This an incomplete guide for all {instance-name} users, but especially for newcomers. It concentrates on how to get along, without going too much into details. For specific technical questions (e.g., how to set up a GNU Social  instance) please ask in the groups <a href="https://status.vinilox.eu/group/gnusocial">!gnusocial</a> and <a href="http://sn.postblue.info/group/sn">!sn</a>, or on  {instance-name}'s Public Timeline. You may also find technical information at <a href="http://federation.skilledtests.com/">http://federation.skilledtests.com/</a></p>
					<p>Other GNU Social / StatusNet FAQs & wikis:<br>
					<a href="https://wiki.loadaverage.org/gnusocial/begin_to_be_social">https://wiki.loadaverage.org/gnusocial/begin_to_be_social</a><br>
					<a href="http://wiki.gnusocial.de">http://wiki.gnusocial.de</a></p>

					<h2>Table of contents</h2>
					<ul>
						<li><a href="#faq-1">What is {instance-name}?</a></li>
						<li><a href="#faq-2">What is GNU Social/StatusNet and the Federation?</a></li>
						<li><a href="#faq-3">How to create an Avatar image</a></li>
						<li><a href="#faq-4">Why can't I find any "{instance-name} app" in Google Play Store or Apple's AppStore?</a></li>
						<li><a href="#faq-5">What clients are there for GNUsocial / StatusNet / {instance-name}?</a></li>		
						<li><a href="#faq-6">Where is the URL shortener?</a></li>
						<li><a href="#faq-7">How to set email preferences</a></li>
						<li><a href="#faq-8">New {instance-name} and Classic {instance-name}</a></li>
						<li><a href="#faq-9">What are those three Timelines on New {instance-name}?</a></li>		
						<li><a href="#faq-10">How to manage follower requests</a></li>
						<li><a href="#faq-11">Can I delete my {instance-name} account?</a></li>
						<li><a href="#faq-12">How to connect your {instance-name} account to your Twitter account</a></li>
						<li><a href="#faq-13">How to write Direct Messages</a></li>		
						<li><a href="#faq-14">Favourites and Repeats/requeets</a></li>
						<li><a href="#faq-15">What does the "My colleagues at {instance-name}" option do?</a></li>
						<li><a href="#faq-16">Groups</a></li>
						<li><a href="#faq-17">Lists</a></li>		
						<li><a href="#faq-18">How to block</a></li>
						<li><a href="#faq-19">How to follow someone on a remote instance</a></li>
						<li><a href="#faq-20">How to manage the visibility of your notices</a></li>
						<li><a href="#faq-21">How to cite conversations or parts of them</a></li>		
						<li><a href="#faq-22">How to follow keywords and hashtags</a></li>
						<li><a href="#faq-23">Why doesn't my repeat/requeet show up on other instances?</a></li>
					</ul>		
	
					<!-- 1 -->
					<h2 id="faq-1">What is {instance-name}?</h2>
					<p>{instance-name} is one of many GNU Social/StatusNet <em>instances</em>. </p>
					<p>{instance-name} is a project using the GNU Social / StatusNet system, combined with a familiar user interface (UI).</p>
					<p>The original GNU Social/StatusNet web UI is available as "Classic {instance-name}", selectable under your <em>header avatar</em> (upper right).</p>

					<!-- 2 -->
					<h2 id="faq-2">What is GNU Social/StatusNet and the Federation?</h2>
					<p>GNU Social/StatusNet is a decentralised microblogging platform.</p>
					<p>Users of one instance can follow, be followed by, and talk with users of any other instance.</p>
					<p>Other instances are, e.g., <em>loadaverage.org, status.vinilox.eu, micro.fragdev.com, gnusocial.de, indy.im, quitter.no, rainbowdash.net,</em> etc. The current number of micro-blogging instances using the GNU Social/StatusNet software is probably about 50, {instance-name} is one of them. As they all use the same software (GNU Social/StatusNet)  and protocol (OStatus), they can talk to each other, just like e-mail servers can talk to each other, even though they are independant and run  by different operators.</p>
					<p>There  is no central "point" of possible breaking.  If one instance goes down  or the admin starts doing things you don't  like, you can create your  account on another instance. You would still be on the GNU Social  network and would still be able to communicate with your GNU Social friends. You just need to tell your contacts your new address.</p>
					<p>Addresses on GNU Social look like this:</p>
					<p class="indent">@user@instance.org</p>
					<p>Your address is:</p>
					<p class="indent">{nickname}@{instance-url}</p>
					<p>If you follow another user, or if the user is on the same instance, you  may omit the ...@instance.org part and just use the short address</p>
					<p class="indent">@user</p>

					<!-- 3 -->
					<h2 id="faq-3">How to create an Avatar image</h2>
					<p>In New {instance-name}, go to your profile</p>
					<p class="indent">"Edit profile" → Camera icon on top of your avatar</p>
					<p>Use the + and - buttons to zoom in. Crop the image by dragging it with the mouse.</p>

					<!-- 4 -->
					<h2 id="faq-4">Why can't I find any "{instance-name} app" in Google Play Store or Apple's AppStore?</h2>
					<p>The network's name is GNU Social or StatusNet, so what you want is a GNU Social / StatusNet app.</p>
					<p>({instance-name} is just one instance of the GNU Social or StatusNet federation.)</p>

					<!-- 5 -->
					<h2 id="faq-5">What clients are there for GNUsocial / StatusNet / {instance-name}?</h2>
					<p><strong>You can find information on clients and links to downloads here:</strong><br>
					<a href="http://federation.skilledtests.com/Statusnet_clients.html">http://federation.skilledtests.com/Statusnet_clients.html</a><br>
					<a href="http://wiki.gnusocial.de/gnusocial:clients">http://wiki.gnusocial.de/gnusocial:clients</a></p>
					<h3>Android clients</h3>
					<p>— <em>Andstatus</em> (currently in active development by <a href="https://loadaverage.org/andstatus">@andstatus@loadaverage.org</a>)<br>
					<em>has great conversation view as hierarchical tree<br>
					Image upload and display of image attachments<br>
					oversized notices can be opened via web browser</em></p>
					<p>— <em>Mustard 0.3.5c</em> (Android 2.x - current) (← many prefer this one, worth trying: GreyBubble theme)</p>
					<p>— <em>Mustard 0.4.1</em> (Android 3.x - current) (a rather experimental new approach with newer look)</p>
					<p>— <em>Mustard{MOD}</em> (Android 3.x - current)</p>
					<p><em>All Mustards support:  geolocation, upload and display of image attachments, display of  oversized notices from instances with larger character limit (open as  attachment)</em></p>
					<p><strong>Some usable Android Twitter clients (some features like sending DM / img upload may not work):</strong><br>
					— <em>Twidere</em><br>
					— <em>Seesmic 1.7.6</em> (use only this version!) (closed source)<br>
					— <em>Zwitscher</em><br>
					— <em>Twydroid</em> (closed source)<br>
					<h3>iPhone clients</h3>
					<p>— <em>Mayo</em> aka Mayonnaise <br>
					— <em>Meteoric</em> (payware)</p>
					<h3>Windows clients</h3>
					<p>Some Twitter clients (some features like sending DM / img upload not working):<br>
					— <em>Tweetdeck 0.38.2</em> (closed source) (last version before Twitter took over TweetDeck) is usable for basic functions. Instructions: <a href="http://qttr.at/dmm">http://qttr.at/dmm</a> <a href="http://qttr.at/dmn">http://qttr.at/dmn</a>
					— Qwit</p>
					<h3>Mac OSX clients</h3>
					<p>— <em>Tweetdeck 0.38.2</em> (closed source)<br>
					— Adium</p>
					<h3>GNU/Linux clients</h3>
					<p>— <em>Choqok</em><br>
					— <em>Hotot</em> (use 0.9.7.32, that's the version that comes with Debian Wheezy)<br>
					— <em>Heybuddy</em> <br>
					— more: <a href="http://federation.skilledtests.com/Statusnet_clients.html">http://federation.skilledtests.com/Statusnet_clients.html</a></p>

					<!-- 6 -->
					<h2 id="faq-6">Where is the URL shortener?</h2>
					<p>In New {instance-name}: 
					<p class="indent">Links needs to be shortened manually before posting the notice. The "URL ><"-button will shorten any URLs pasted or written in the notice form.
					<p>In Classic {instance-name}: 
					<p class="indent">Links are shortened automatically after the notice is posted. The settings are personal.<br>
					<br>
					Profile > "Edit" (in the top right corner) > URL<br>
					<br>
					Best use the settings:<br>
					- qttr.at<br>
					- URL longer than 30<br>
					- Text longer than 139<br>
					Screenshot: <a href="http://quitter.se/attachment/710078">http://quitter.se/attachment/710078</a></p>
 
 
					<!-- 7 -->
					<h2 id="faq-7">How to set email preferences</h2>
					<p>On New {instance-name} go to</p>
					<p class="indent">Your header avatar (upper right) → Settings → Email</p>
					<p>check accordingly:<br>
					<em>— Send me notifications of new subscriptions through email.  <br>
					— Send me email when someone adds my notice as a favorite.  <br>
					— Send me email when someone sends me a private message.  <br>
					— Send me email when someone sends me an "@-reply".  <br>
					— Allow friends to nudge me and send me an email.  </em></p>

  
					<!-- 8 -->
					<h2 id="faq-8">New {instance-name} and Classic {instance-name}</h2>
					<p>New {instance-name} is the default user interface. It is visually very similiar to other well known commercial microblogging services. It's technical name is "Qvitter". In discussions "Qvitter" and "New {instance-name}" might mean the same thing, but Qvitter mostly refers to the software and New {instance-name} refers to the installation of the Qvitter software on {instance-name}.</p>
					<p>Classic {instance-name} is the canonical GNU Social / StatusNet interface. At the moment some settings and features (e.g., creating a group) have to  be done in Classic {instance-name} as they are not yet implemented in New {instance-name}.</p>
					<p>To switch to Classic {instance-name}, go to</p>
					<p class="indent">Your header avatar (upper right) → Classic {instance-name}</p>
 
 
					<!-- 9 -->
					<h2 id="faq-9">What are those three Timelines on New {instance-name}?</h2>
					<p>There are three timelines that show differerent notices (depending on the sources):</p>
					<p><strong>Timeline ("Home"):</strong><br>
					all notices from the people you follow (not just the ones they send to people you happen to follow as well).</p>
					<p><strong>Public Timeline:</strong><br>
					all notices posted by {instance-name} accounts.</p>
					<p><strong>The Whole Known Network:</strong><br>
					not  only all notices of the Public Timeline but also those of all people on  other ("remote") instances of the StatusNet federation who are followed  by at least one {instance-name} user (i.e. accounts known to {instance-name}).</p>


					<!-- 10 -->
					<h2 id="faq-10">How to manage follower requests</h2>
					<p>Usually you will want to stick with the default settings:</p>
					<p class="indent">yes to "let anyone follow me" (1)</p>
					<p class="indent">no to "Make updates visible only to my followers"</p>
					<p>If you really want to change these settings in New {instance-name} go to: </p>
					<p class="indent">Your header avatar (upper right) → Settings → Profile</p>
					<p><em>(1):  Change to "Ask me first" and you will receive e-mail notifications when  someone wants to follow you. It leaves the subscription request pending  until you either confirm or reject it. (But this does not work in New {instance-name} yet, so be careful with this setting)</em></p>


					<!-- 11 -->
					<h2 id="faq-11">Can I delete my {instance-name} account?</h2>
					<p>You  can delete your account, but your all notices will be deleted on {instance-name}  as well -- and this will break conversation threads. If you re-create  your account on another instance, it's better to rename your {instance-name}  account to something like MyNickhasmovedtoFragdev, instead of deleting it.</p>
					<p>To delete your account go to:</p>
					<p class="indent">Your header avatar (upper right) → Settings → Delete account (right column)</p>
		
 
					<!-- 12 -->
					<h2 id="faq-12">How to connect your {instance-name} account to your Twitter account</h2>
					<p>You can forward your notices to Twitter</p>
					<p>In New {instance-name}:</p>
					<p class="indent">Your header avatar (upper right) → Settings → Twitter</p>
					<p>You are forwarded to Twitter and have to authorise {instance-name} to use your Twitter account.</p>
					<p><em>According  to user reports this doesn't always work on the first or second  attempt. If it doesn't, you may have to try again later. The cause of  the  problem may be on Twitter's side. Your browser must not block  Javascript or Cookies.</em></p>
 
 

					<!-- 13 -->
					<h2 id="faq-13"> How to write Direct Messages</h2>
					<p>Direct Messages are only supported in Classic {instance-name} at the time of writing (Messages in the left menu).</p>
					<p>You can use apps like Mustard and Mayo to send DMs.</p>
					<p><em>Note:</em><br>
					- DM only works within the same instance ({instance-name} in this case)<br>
					- to send DMs you need to mutually follow each other</p>


					<!-- 14 -->
					<h2 id="faq-14">Favourites and Repeats/requeets</h2>

					<p>In all the three timelines you can click on a notice to expand it and see who has favourited or repeated it.</p>
					<p>(You can setup <a href="#faq-7"><em>E-mail Notifications</em></a> to notify you when your notices have been fav'ed.</p>
					<p>Favs and repeats/requeets look like this in New {instance-name}: <a href="http://qttr.at/du6">http://qttr.at/du6</a> and like this in Classic {instance-name}: <a href="http://qttr.at/du5">http://qttr.at/du5</a></p>


					<!-- 15 -->
					<h2 id="faq-15">What does the "My colleagues at {instance-name}" option do?</h2>
					<p>In Classic {instance-name}, there is an option to post to  "My colleagues at {instance-name}". This will stop the notice from federating.  It will only be visible to your followers on {instance-name}.</p>
 
					<!-- 16 -->
					<h2 id="faq-16">Groups</h2>
					<h3>Public Groups</h3>
					<p>You can create a group for any topic, like Feminism, Football, FreeBSD.</p>
					<p>People can be members of as many groups as they like. As a member of a group one can post to the whole group by including ! + group name, e.g., <em>!feminism</em>, in the notice. All group members, whether or not they follow you, will get the notice in their Home Timelines. One follows and unfollows a group like one follows and unfollows a person. </p>
					<p>A list of groups <em>hosted on {instance-name}</em> can be found here:<br>
					<a href="{instance-url-with-protocol}groups">{instance-url-with-protocol}groups</a></p>
					<p>A list of groups <em>hosted also on remote instances</em> can be found here:<br>
					<a href="http://www.skilledtests.com/wiki/List_of_federated_Statusnet_groups">http://www.skilledtests.com/wiki/List_of_federated_Statusnet_groups</a></p>
					<p>To create a group go to:</p>
					<p class="indent"><a href="{instance-url-with-protocol}groups">{instance-url-with-protocol}groups</a> → Create new group</p>
					<h3>Private Groups</h3>
					<p>An admin of a group has the option to declare it "private". This means:</p> 
					<p>1) new members must be approved by the admin, and</p>
					<p>2) all notices are forced to be <em>private</em>, i.e.,</p>
					<p class="indent">notices in the group are only visible to the group members (they don't appear in the Public Timeline), and</p>
					<p class="indent">it's not possible for other instances' users to be members of a private group on {instance-name}.</p>
 
 
					<!-- 17 -->
					<h2 id="faq-17">Lists</h2>
					<p>Lists are available on Classic {instance-name}.</p>
					<p><strong>Adding users to lists:</strong><br>
					When browsing users on e.g. <a href="{instance-url-with-protocol}{nickname}/subscriptions">{instance-url-with-protocol}{nickname}/subscriptions</a>, there's a small edit-button in the bottom. Click the button, and type in the name of the list you wich to add the user to. If the list doesn't exist, it will be created.</p>
					<p><strong>Managing your lists</strong><br>
					Go to your profile. Your lists are listed in the right column.</p>
 

					<!-- 18 -->
					<h2 id="faq-18">How to block</h2>
					<p>To block a {instance-name} user, go to their profile in <strong>Classic {instance-name}</strong></p>
					<p class="indent">{instance-url-with-protocol}[nickname]</p>
					<p>and click "block" below their profile desription</p>
					<p>We don't recommend blocking people from remote instances as there are still issues with this feature.</p>
 

					<!-- 19 -->
					<h2 id="faq-19">How to follow someone on a remote instance</h2>
					<p>If  you click a remote nickname in New {instance-name} you are brought to a small profile window showing the full remote address  @blabla@status.vinilox.eu</p>
					<p>Click the button "Follow". In New {instance-name} that should be all.</p>
					<p>In Classic {instance-name} you're forwarded to the remote instance's user profile  (which may differ in layout and theme from Classic {instance-name}). Look for  the Subscribe-button (usually in the upper right). A subscription box opens in which you're prompted to enter your own "webfinger address", i.e., {nickname}@{instance-domain} Subscribe and you're redirected to your Classic {instance-name} page where you have to confirm the subscription.</p>


					<!-- 20 -->
					<h2 id="faq-20">How to manage the visibility of your notices</h2> 
					<p>There are several ways to make notices visible only to selected people, not to the public. <strong>None of these work in New {instance-name} yet.</strong></p>
					<p>(All four methods only work within the same instance. Users outside {instance-name} won't be able to see the notice.)</p>
					<p>a. Direct Messages → The notice will only be visible to its recipient in his DM inbox (there are no Direct Messages to more than one person).</p>
					<p>b. Set your account to "Make updates visible only to my followers" and "Ask me first if someone wants to follow me"  (Classic {instance-name} → Profile → Edit)</p>
					<p>c. Post to a private group of which you are a member → The post will only be visible to the group members (see above under "Groups")</p>
					<p>(Note to c: You can use any client to post to a private group by using the !group tag.)</p>
					<p>d. Post to a public group and close the lock on the right of the drop-down menu beneath the message field → The post will only be visible to the group members. (Although at the time of writing, this does not work. The post will be visible to everyone.)</p>
					<p><em>(Note to d:  Make sure you don't leave "Everyone" or "My Colleagues at {instance-name}"  selected, otherwise your post will go to the timelines of every {instance-name}  user, which is not what you want if you close the lock)</em></p>
					<p><em>(Note  to d:  The lock method is only available in Classic {instance-name}. There is no  lock  feature in New {instance-name} or any known client, at the time of  writing.)</em></p>
 

					<!-- 21 -->
					<h2 id="faq-21">How to cite conversations or parts of them</h2>
					<p>Sometimes in a blog-post or email, you don't want to cite just one post but a whole conversation. Each post, each reply, and each conversation has its own, URL, and the ways to find them differ slightly in Classic {instance-name} and in New {instance-name}.</p> 
					<p><strong>New {instance-name}</strong></p>
					<p>In New {instance-name} click on the time stamp of a post, or "details" if you have expanded the post. This will show the notice page, with the conversation expanded.</p> 
					<p><strong>Classic {instance-name}</strong></p>
					<p>Click  on the the timestamp of any post. The post will reappear on a separate,  individual page. Click "in context". The whole conversation that  depends on this note will be displayed on a new page, with the selected  post as its visible top. </p>
 

					<!-- 22 -->
					<h2 id="faq-22">How to follow keywords and hashtags</h2>
					<p>Similar  to following a person or group you can, in Classic {instance-name}, subscribe to (or follow)  hashtags and search words. Notices containing them will then appear in your timeline. </p>
					<p>Following search words and hashtags is not limited to notices from accounts on {instance-name} but includes notices from remote instances as well</p>
					<p>To follow hashtags  (# + ...), put the word with the hashtag-symbol "#" prefixed into the  search box of Classic {instance-name} and press Enter. You'll arrive at the  search result page. Similiar, to subscribe to search words,   put them without hashtag-symbol into the search box. You'll get a much   larger list because the search not only covers individual words but  also  looks for occurrences of the phrase inside larger phrases. To  follow the search, click on the tiny "Subscribe"-button on the upper  right corner of the lists. You'll then receive the messages in your  timeline.</p>
					<p>Following one word often yields too many results, so it is expedient to combine words and follow them as complete phrases.</p>
					<p>You can unfollow those notices by unfollowing the hashtags & search phrases.</p>
					<p>For an overview which phrases you follow, enter the URLs<br>
					hashtags: <a href="{instance-url-with-protocol}{nickname}/tag-subscriptions">{instance-url-with-protocol}{nickname}/tag-subscriptions</a><br>
					search words and phrases: <a href="{instance-url-with-protocol}{nickname}/search-subscriptions">{instance-url-with-protocol}{nickname}/search-subscriptions</a></p>
					<p>On those pages you can manage your subscriptions, that is, add more phrases and hashtags or unfollow them.</p>

					<!-- 23 -->
					<h2 id="faq-23">Why doesn't my repeat/requeet show up on other instances?</h2>
					<p>In the latest versions of GNU Social, repeats/requeets do not get sent to your followers on other instances. This was possible in StatusNet, but this feature has been removed due to a security issue. GNU Social developers are working on a solution. In the meantime, if you really want your repeat/requeet to federate, you can always to a "manual repeat", i.e. write RQ @username, and then copy-paste the notice.</p>

					<p class="faq-credits"><em>Thanks to <a href="https://quitter.se/simsa0">@simsa0</a> and <a href="https://quitter.se/mcscx">@mcscx</a> for their work on this FAQ.</em></p>
				</div>

				<script type="text/javascript" src="<?php print $qvitterpath; ?>js/lib/jquery-2.1.1.min.js"></script>
				<script type="text/javascript" src="<?php print $qvitterpath; ?>js/lib/jquery-ui-1.10.3.min.js"></script>
				<script type="text/javascript" src="<?php print $qvitterpath; ?>js/lib/jquery.easing.1.3.js"></script>	    
				<script type="text/javascript" src="<?php print $qvitterpath; ?>js/lib/jquery.minicolors.min.js"></script>	    	    
				<script type="text/javascript" src="<?php print $qvitterpath; ?>js/lib/jquery.jWindowCrop.js"></script>	
				<script type="text/javascript" src="<?php print $qvitterpath; ?>js/lib/load-image.min.js"></script>	
				<script type="text/javascript" src="<?php print $qvitterpath; ?>js/dom-functions.js?v=41"></script>		    	
				<script type="text/javascript" src="<?php print $qvitterpath; ?>js/misc-functions.js?v=40"></script>		    		    
				<script type="text/javascript" src="<?php print $qvitterpath; ?>js/ajax-functions.js?v=40"></script>		    		    	    
				<script type="text/javascript" src="<?php print $qvitterpath; ?>js/lan.js?v=40"></script>	
				<script type="text/javascript" src="<?php print $qvitterpath; ?>js/qvitter.js?v=42"></script>		
			</body>
		</html>

	
			<?php
    }

}

