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
		$apiroot = common_path('api/', StatusNet::isHTTPS());
		$instanceurl = common_path('', StatusNet::isHTTPS());

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
				<link rel="stylesheet" type="text/css" href="<?php print $qvitterpath; ?>css/qvitter.css?changed=<?php print date('YmdHis',filemtime(QVITTERDIR.'/css/qvitter.css')); ?>" />
				<link rel="stylesheet" type="text/css" href="<?php print $qvitterpath; ?>css/jquery.minicolors.css" />		
				<link rel="shortcut icon" type="image/x-icon" href="<?php print $qvitterpath; ?>/img/favicon.ico?v=4">
				<?php

				// if qvitter is a webapp and this is a users url we add feeds
				if(substr_count($_SERVER['REQUEST_URI'], '/') == 1) { 
					$nickname = substr($_SERVER['REQUEST_URI'],1);
					if(preg_match("/^[a-zA-Z0-9]+$/", $nickname) == 1) {
						$user = User::getKV('nickname', $nickname); 
						if(!isset($user->id)) {
							//error_log("QVITTER: Could not get user id for user with nickname: $nickname – REQUEST_URI: ".$_SERVER['REQUEST_URI']);
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
					window.thisSiteThinksItIsHttpButIsActuallyHttps = <?php
					
						if(isset($_SERVER['HTTPS'])
						&& $_SERVER['HTTPS'] != 'off'
						&& substr($instanceurl,0,7) == 'http://') {
							print 'true';
							}
						else {
							print 'false';
							}
					
					?>;
					window.siteTitle = <?php print json_encode($sitetitle) ?>;
					window.loggedIn = <?php 
					
						$logged_in_user_json = json_encode($logged_in_user_obj);
						$logged_in_user_json = str_replace('http:\/\/quitter.se\/','https:\/\/quitter.se\/',$logged_in_user_json);    	
						print $logged_in_user_json; 
					
					?>;
					window.timeBetweenPolling = <?php print QvitterPlugin::settings("timebetweenpolling"); ?>;
					window.apiRoot = '<?php print common_path("api/", StatusNet::isHTTPS()); ?>';
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
				    .stream-item.expanded .stream-item.first-visible-after-parent,
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
					<?php if (common_config('site','inviteonly') == 1) { ?>
						<li class="fullwidth"><a id="invite-link" href="<?php print $instanceurl; ?>main/invite"></a></li>
					<?php } ?>
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
									<input type="checkbox" id="rememberme" name="rememberme" value="yes" tabindex="3" checked="checked"> <span id="rememberme_label"></span> · <a id="recover-password" href="<?php print $instanceurl ?>main/recoverpassword"></a><div align=center><a id="other-login" href="<?php print $instanceurl ?>main/login"></a></div>
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
				<script type="text/javascript" src="<?php print $qvitterpath; ?>js/lib/jquery-2.1.1.min.js"></script>
				<script type="text/javascript" src="<?php print $qvitterpath; ?>js/lib/jquery-ui-1.10.3.min.js"></script>
				<script type="text/javascript" src="<?php print $qvitterpath; ?>js/lib/jquery.easing.1.3.js"></script>	    
				<script type="text/javascript" src="<?php print $qvitterpath; ?>js/lib/jquery.minicolors.min.js"></script>	    	    
				<script type="text/javascript" src="<?php print $qvitterpath; ?>js/lib/jquery.jWindowCrop.js"></script>	
				<script type="text/javascript" src="<?php print $qvitterpath; ?>js/lib/load-image.min.js"></script>	
				<script type="text/javascript" src="<?php print $qvitterpath; ?>js/dom-functions.js?changed=<?php print date('YmdHis',filemtime(QVITTERDIR.'/js/dom-functions.js')); ?>"></script>
				<script type="text/javascript" src="<?php print $qvitterpath; ?>js/misc-functions.js?changed=<?php print date('YmdHis',filemtime(QVITTERDIR.'/js/misc-functions.js')); ?>"></script>
				<script type="text/javascript" src="<?php print $qvitterpath; ?>js/ajax-functions.js?changed=<?php print date('YmdHis',filemtime(QVITTERDIR.'/js/ajax-functions.js')); ?>"></script>
				<script type="text/javascript" src="<?php print $qvitterpath; ?>js/lan.js?changed=<?php print date('YmdHis',filemtime(QVITTERDIR.'/js/lan.js')); ?>"></script>
				<script type="text/javascript" src="<?php print $qvitterpath; ?>js/qvitter.js?changed=<?php print date('YmdHis',filemtime(QVITTERDIR.'/js/qvitter.js')); ?>"></script>
				<?php
				
					// we might have custom javascript in the config file that we want to add
					if(QvitterPlugin::settings('js')) {
						print '<script type="text/javascript">'.QvitterPlugin::settings('js').'</script>';
					}				
				
				?>	
			</body>
		</html>

	
			<?php
    }

}

