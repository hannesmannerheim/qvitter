
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

/* · 
   · 
   ·   Update stream on back button (if we're using history push state)
   · 
   · · · · · · · · · · · · · */ 

if(window.useHistoryPushState) {
	window.onpopstate = function(event) {
	    if(event && event.state) {
			display_spinner();
			setNewCurrentStream(event.state.strm,function(){
				remove_spinner();			
				},false);
		    }
		}
	}
	
/* · 
   · 
   ·   Preload the default background image and show login box after
   · 
   · · · · · · · · · · · · · */ 

$('#submit-login').removeAttr('disabled'); // might be remebered by browser...   
$('<img/>').attr('src', window.fullUrlToThisQvitterApp + 'img/ekan4.jpg').load(function() {
	$('body').css('background-image', 'url(' + window.fullUrlToThisQvitterApp + 'img/ekan4.jpg)');

	$('#user-container').css('display','block');
	$('#feed').css('display','block');		

	// autologin if saved
	if(typeof localStorage.autologinUsername != 'undefined') {
		$('input#username').val(localStorage.autologinUsername);
		$('input#password').val(localStorage.autologinPassword);
		$('#submit-login').trigger('click');		
		}
	else {
		
		// set stream		
		display_spinner();
		setNewCurrentStream(getStreamFromUrl(),function(){
			$('input#username').focus();	
			$('#login-content').animate({opacity:'1'},800);
			$('#page-container').animate({opacity:'1'},200);			
			remove_spinner();			
			},true);
		}	
	});	

/* · 
   · 
   ·   Login action
   · 
   · · · · · · · · · · · · · */ 

$('#submit-login').click(function () {		
	$('#submit-login').attr('disabled','disabled');
	$('#submit-login').focus(); // prevents submit on enter to close alert-popup on wrong credentials
	display_spinner();

	// login with ajax
	checkLogin($('input#username').val(),$('input#password').val(),function(user){

		// store credentials in global var
		window.loginUsername = user.screen_name;
		window.loginPassword = $('input#password').val();
		
		console.log(user);
		
		// add user data to DOM, show search form, remeber user id, show the feed
		$('#user-avatar').attr('src', user.profile_image_url);
		$('#user-name').append(user.name);
		$('#user-screen-name').append(user.screen_name);
		$('#user-profile-link').append('<a href="' + user.statusnet_profile_url + '">' + window.sL.viewMyProfilePage + '</a>');
		$('#user-queets strong').html(user.statuses_count);
		$('#user-following strong').html(user.friends_count);			
		$('#user-followers strong').html(user.followers_count);		
		$('#user-groups strong').html(user.groups_count);				
		$('#search').fadeIn('slow');
		window.myUserID = user.id;				

		// if remeber me is checked, save credentials in local storage
		if($('#rememberme').is(':checked')) {
			localStorage.autologinPassword = $('input#password').val();
			localStorage.autologinUsername = $('input#username').val();					
			}
			
		// load history
		loadHistoryFromLocalStorage();			

		// if this is a special url for user, notice etc, grab that stream
		var streamToSet = getStreamFromUrl();
		
		// if this is the public feed, we redirect to friends_timline (I think that's intuitive)
		if(streamToSet == 'statuses/public_timeline.json') {
			streamToSet = 'statuses/friends_timeline.json';
			}
		
		// set stream
		window.currentStream = ''; // always reload stream on login
		setNewCurrentStream(streamToSet,function(){		
			$('#user-header').animate({opacity:'1'},800);
			$('#user-body').animate({opacity:'1'},800);
			$('#user-footer').animate({opacity:'1'},800);
			$('.menu-container').animate({opacity:'1'},800);									
			$('#page-container').animate({opacity:'1'},200);						
			$('#login-content').css('display','none');
			remove_spinner();			
			},true);

		});	

	});


/* · 
   · 
   ·   In the login form, we want to check the remember-me-checkbox when its label is clicked
   · 
   · · · · · · · · · · · · · */ 

$('#rememberme_label').click(function(){
	if($('#rememberme').prop('checked')) {
		$('#rememberme').prop('checked', false);
		}
	else {
		$('#rememberme').prop('checked', true);
		}
	});
	


/* · 
   · 
   ·   Submit login form on enter key
   · 
   · · · · · · · · · · · · · */ 
   
$('input#username,input#password,input#rememberme').keyup(function(e){ 
	if(e.keyCode==13) { 
		$('#submit-login').trigger('click');
		}
	}); 
	


/* · 
   · 
   ·   Logout by deleting local storage credentials (if there are any) and reload
   · 
   · · · · · · · · · · · · · */ 
   
$('#logout').click(function(){
	delete localStorage.autologinUsername;
	delete localStorage.autologinPassword;		
	location.reload();		
	});		

/* · 
   · 
   ·   Handling the language dropdown selection
   · 
   · · · · · · · · · · · · · */ 
   
$('.dropdown').click(function(){$(this).toggleClass('dropped')});
$('.dropdown').disableSelection();
$(document).bind('click', function (e) {
	if(!$(e.target).is('#logo') && !$(e.target).is('#logolink') && !$(e.target).is('.nav-session') && !$(e.target).is('.dropdown-toggle') && !$(e.target).is('.dropdown-toggle small') && !$(e.target).is('.dropdown-toggle span') && !$(e.target).is('.dropdown-toggle b')) {
		$('.dropdown').removeClass('dropped');
		$('.quitter-settings.dropdown-menu').removeClass('dropped');
		}
	});
$('.language-link').click(function(){
	localStorage.selectedLanguage = $(this).attr('data-lang-code'); // save langage selection
	location.reload(); // reload	
	});


/* · 
   · 
   ·   Show the logo menu dropdown on click
   · 
   · · · · · · · · · · · · · */ 
   
$('#logolink').click(function(){
	if(!$('.quitter-settings').hasClass('dropped')) { $('.quitter-settings').addClass('dropped'); }
	else { $('.quitter-settings').removeClass('dropped'); }
	});



/* · 
   · 
   ·   When clicking a follow button
   · 
   · · · · · · · · · · · · · */ 

$('body').on('click','.follow-button',function(event){
	if(!$(this).hasClass('disabled')) {
		$(this).addClass('disabled');
			
		// get user id
		var user_id = $(this).attr('data-follow-user-id');

		// follow or unfollow?
		if($(this).hasClass('following')) {
			var followOrUnfollow = 'unfollow';
			}
		else {
			var followOrUnfollow = 'follow';
			}

		// post to api
		display_spinner();
		APIFollowOrUnfollowUser(followOrUnfollow,user_id, this, function(data,this_element) {
			remove_spinner();
			$(this_element).removeClass('disabled');
			if(data) {
				if(data.following) {
					$(this_element).addClass('following');
					$('#user-following strong').html(parseInt($('#user-following strong').html(),10)+1);
					}
				else {
					$(this_element).removeClass('following');
					$('#user-following strong').html(parseInt($('#user-following strong').html(),10)-1);
					}
				}
			});		 
		}
	});
	
	
	
	
/* · 
   · 
   ·   When clicking a join group button
   · 
   · · · · · · · · · · · · · */ 

$('body').on('click','.member-button',function(event){
	if(!$(this).hasClass('disabled')) {
		$(this).addClass('disabled');
			
		// get group id
		var group_id = $(this).attr('data-group-id');

		// join or leave?
		if($(this).hasClass('member')) {
			var joinOrLeave = 'leave';
			}
		else {
			var joinOrLeave = 'join';
			}

		// post to api
		display_spinner();
		APIJoinOrLeaveGroup(joinOrLeave,group_id, this, function(data,this_element) {
			remove_spinner();
			$(this_element).removeClass('disabled');
			if(data) {
				if(data.member) {
					$(this_element).addClass('member');
					$('.profile-card .member-stats strong').html(parseInt($('.profile-card .member-stats strong').html(),10)+1);
					$('#user-groups strong').html(parseInt($('#user-groups strong').html(),10)+1);
					}
				else if(data.member === false) {
					$(this_element).removeClass('member');
					$('.profile-card .member-stats strong').html(parseInt($('.profile-card .member-stats strong').html(),10)-1);
					$('#user-groups strong').html(parseInt($('#user-groups strong').html(),10)-1);
					}
				}
			});		 
		}
	});	


/* · 
   · 
   ·   Select a stream when clicking on a menu item
   · 
   · · · · · · · · · · · · · */ 

// select stream
$('body').on('click','.stream-selection',function(event){
	if(!$(event.target).is('.close-right') && !$(this).hasClass('current')) {
		setNewCurrentStream($(this).attr('data-stream-name'),function(){},true);
		}
	});


/* · 
   · 
   ·   Select a stream when the logged in user clicks their own queets, followers etc 
   · 
   · · · · · · · · · · · · · */ 

// my queets, etc
$('#user-header, #user-queets, #user-following, #user-followers, #user-groups').on('click',function(){
	if($(this).attr('id') == 'user-header' || $(this).attr('id') == 'user-queets') {
		setNewCurrentStream('statuses/user_timeline.json?screen_name=' + window.loginUsername,function(){},true);	
		}
	else if($(this).attr('id') == 'user-following') {
		setNewCurrentStream('statuses/friends.json',function(){},true);	
		}
	else if($(this).attr('id') == 'user-followers') {
		setNewCurrentStream('statuses/followers.json',function(){},true);			
		}	
	else if($(this).attr('id') == 'user-groups') {
		setNewCurrentStream('statusnet/groups/list.json',function(){},true);			
		}				
	});


/* · 
   · 
   ·   Select a stream when clicking on queets, followers etc in a profile card
   · 
   · · · · · · · · · · · · · */ 
	
// any users streams
$('body').on('click','.profile-banner-footer .tweet-stats, .profile-banner-footer .following-stats, .groups-stats, .profile-banner-footer .follower-stats, .queet-stream',function(){
	var screenName = $('.profile-card-inner .screen-name').html().substring(1);	
	if($(this).hasClass('tweet-stats')) {
		setNewCurrentStream('statuses/user_timeline.json?screen_name=' + screenName,function(){},true);	
		}
	else if($(this).hasClass('following-stats')) {
		setNewCurrentStream('statuses/friends.json?screen_name=' + screenName,function(){},true);	
		}
	else if($(this).hasClass('follower-stats')) {
		setNewCurrentStream('statuses/followers.json?screen_name=' + screenName,function(){},true);			
		}
	else if($(this).hasClass('groups-stats')) {
		setNewCurrentStream('statusnet/groups/list.json?screen_name=' + screenName,function(){},true);			
		}
	else if($(this).hasClass('queets')) {
		setNewCurrentStream('statuses/user_timeline.json?screen_name=' + screenName,function(){},true);			
		}
	else if($(this).hasClass('mentions')) {
		setNewCurrentStream('statuses/mentions.json?screen_name=' + screenName,function(){},true);			
		}
	else if($(this).hasClass('favorites')) {
		setNewCurrentStream('favorites.json?screen_name=' + screenName,function(){},true);			
		}				
								
	});	
	

/* · 
   · 
   ·   Searching
   · 
   · · · · · · · · · · · · · */ 

$('#search-query').on('keyup',function(e) { if(e.keyCode==13) { showSearchStream(); }}); // on enter in input field
$('button.icon.nav-search').on('click',function(e) { showSearchStream();});	// on click on magnifying glass
function showSearchStream() {
	streamName = 'search.json?q=' + encodeURIComponent($('#search-query').val());
	setNewCurrentStream(streamName,function(){},true);			
	}



/* · 
   ·                                                                          <o
   ·   Hijack all links and look for local users, tags and groups.             (//
   ·   
   ·   If found, select that stream and prevent links default behaviour
   · 
   · · · · · · · · · · · · · */ 

$('body').on('click','a', function(e) {          
	if(typeof $(this).attr('href') != 'undefined') {
		// profiles
		if ((/^[a-zA-Z0-9]+$/.test($(this).attr('href').replace('http://','').replace('https://','').replace(window.siteRootDomain + '/','')))) {
			e.preventDefault();
			if($(this).parent().attr('id') == 'user-profile-link') { // logged in user
				setNewCurrentStream('statuses/user_timeline.json?screen_name=' + window.loginUsername,function(){},true);	
				}
			else if($(this).hasClass('account-group')) { // any user
				setNewCurrentStream('statuses/user_timeline.json?screen_name=' + $(this).find('.screen-name').text().substring(1).toLowerCase(),function(){},true);	
				}				
			else { // any user
				setNewCurrentStream('statuses/user_timeline.json?screen_name=' + $(this).attr('href').replace('http://','').replace('https://','').replace(window.siteRootDomain + '/',''),function(){},true);								
				}			
			}
		else if((/^[0-9]+$/.test($(this).attr('href').replace('http://','').replace('https://','').replace(window.siteRootDomain + '/user/','')))) {
			e.preventDefault();
			setNewCurrentStream('statuses/user_timeline.json?screen_name=' + $(this).text().toLowerCase(),function(){},true);	
			}
		// tags
		else if ($(this).attr('href').indexOf(window.siteRootDomain + '/tag/')>-1) {
			e.preventDefault();
			setNewCurrentStream('statusnet/tags/timeline/' + $(this).text().toLowerCase() + '.json',function(){},true);				
			}	
		// groups
		else if (/^[0-9]+$/.test($(this).attr('href').replace('http://','').replace('https://','').replace(window.siteRootDomain + '/group/','').replace('/id',''))) {
			e.preventDefault();
			if($(this).hasClass('account-group')) {
				var groupName = $(this).find('.screen-name').html().substring(1);
				}
			else {
				var groupName = $(this).text().toLowerCase();
				}
			setNewCurrentStream('statusnet/groups/timeline/' + groupName + '.json',function(){},true);				
			}	
		else if ($(this).attr('href').indexOf(window.siteRootDomain + '/group/')>-1) {
			e.preventDefault();
			setNewCurrentStream('statusnet/groups/timeline/' + $(this).attr('href').replace('http://','').replace('https://','').replace(window.siteRootDomain + '/group/','') + '.json',function(){},true);				
			}				
		
		// profile picture
		else if ($(this).hasClass('profile-picture')) {
			e.preventDefault();
				popUpAction('popup-profile-picture', $('.profile-card-inner .screen-name').html(),'<img style="width:100%" src="' + $(this).attr('href') + '" />',false);
			}

		// external profiles 
		else if (($(this).children('span.mention').length>0 // if it's a mention
				 || ($(this).hasClass('account-group') && $(this).attr('href').indexOf('/group/')==-1) // or if this is queet stream item header but not a group
		         || ($(this).closest('.stream-item').hasClass('activity') && $(this).attr('href').indexOf('/group/')==-1)) // or if it's a activity notice but not a group link
		         && typeof window.loginUsername != 'undefined') { // if logged in
			e.preventDefault();
			display_spinner();
			getFromAPI('externalprofile/show.json?profileurl=' + encodeURIComponent($(this).attr('href')),function(data){
				// external user found locally
				if(data) {
				
					var screenNameWithServer = '@' + data.screen_name + '@' + data.statusnet_profile_url.replace('http://','').replace('https://','').replace('/' + data.screen_name,'');

					// empty strings and zeros instead of null
					data.name = data.name || '';
					data.profile_image_url = data.profile_image_url || '';
					data.profile_image_url_profile_size = data.profile_image_url_profile_size || '';
					data.profile_image_url_original = data.profile_image_url_original || '';						
					data.screen_name = data.screen_name || '';						
					data.description = data.description || '';
					data.location = data.location || '';
					data.url = data.url || '';
					data.statusnet_profile_url = data.statusnet_profile_url || '';
					data.statuses_count = data.statuses_count || 0;
					data.followers_count = data.followers_count || 0;
					data.friends_count = data.friends_count || 0;
					
					// profile card
					var followingClass = '';
					if(data.following) {
						followingClass = 'following';
						}			
						
					var followButton = '<div class="user-actions"><button data-follow-user-id="' + data.id + '" data-follow-user="' + data.statusnet_profile_url + '" type="button" class="follow-button ' + followingClass + '"><span class="button-text follow-text"><i class="follow"></i>' + window.sL.userFollow + '</span><span class="button-text following-text">' + window.sL.userFollowing + '</span><span class="button-text unfollow-text">' + window.sL.userUnfollow + '</span></button></div>';	
					var profileCard = '<div class="profile-card"><div class="profile-header-inner" style="background-image:url(' + data.profile_image_url_original + ')"><div class="profile-header-inner-overlay"></div><a class="profile-picture"><img src="' + data.profile_image_url_profile_size + '" /></a><div class="profile-card-inner"><h1 class="fullname">' + data.name + '<span></span></h1><h2 class="username"><span class="screen-name"><a target="_blank" href="' + data.statusnet_profile_url + '">' + screenNameWithServer + '</a></span><span class="follow-status"></span></h2><div class="bio-container"><p>' + data.description + '</p></div><p class="location-and-url"><span class="location">' + data.location + '</span><span class="divider"> · </span><span class="url"><a target="_blank" href="' + data.url + '">' + data.url.replace('http://','').replace('https://','') + '</a></span></p></div></div><div class="profile-banner-footer"><ul class="stats"><li><a target="_blank" href="' + data.statusnet_profile_url + '"><strong>' + data.statuses_count + '</strong>' + window.sL.notices + '</a></li><li><a target="_blank" href="' + data.statusnet_profile_url + '/subscriptions"><strong>' + data.friends_count + '</strong>' + window.sL.following + '</a></li><li><a target="_blank" href="' + data.statusnet_profile_url + '/subscribers"><strong>' + data.followers_count + '</strong>' + window.sL.followers + '</a></li></ul>' + followButton + '<div class="clearfix"></div></div></div><div class="clearfix"></div>';		
					
					popUpAction('popup-external-profile', screenNameWithServer,profileCard,false);
				
					remove_spinner();	
					}
				// external user not found locally, try externally
				else {
					// TODO!
					}
				});				
			}

		// external groups
		else if (($(this).children('span.group').length>0 // if it's a group mention
				 || ($(this).hasClass('account-group') && $(this).attr('href').indexOf('/group/')>-1) // or if this is group stream item header
		         || ($(this).closest('.stream-item').hasClass('activity') && $(this).attr('href').indexOf('/group/')>-1)) // or if it's a activity notice
		         && typeof window.loginUsername != 'undefined') { // if logged in
			e.preventDefault();
			display_spinner();	
			getFromAPI('statusnet/groups/show.json?id=foo&uri=' + encodeURIComponent($(this).attr('href')), function(data){ if(data){
				
				data.nickname = data.nickname || '';
				data.fullname = data.fullname || '';
				data.stream_logo = data.stream_logo || 'http://quitter.se/theme/quitter-theme2/default-avatar-stream.png';
				data.homepage_logo = data.homepage_logo || 'http://quitter.se/theme/quitter-theme2/default-avatar-profile.png';
				data.original_logo = data.original_logo || 'http://quitter.se/theme/quitter-theme2/default-avatar-profile.png';						
				data.description = data.description || '';
				data.homepage = data.homepage || '';
				data.url = data.url || '';
				data.member_count = data.member_count || 0;
				data.admin_count = data.admin_count || 0;		
				
				// show user actions if logged in
				var memberClass = '';
				if(data.member) {
					memberClass = 'member';
					}			
				
				var groupRoot = data.url.substring(0,data.url.indexOf('/group/'));
				var groupServer = groupRoot.replace('http://','').replace('https://','');
				
				var memberButton = '<div class="user-actions"><button data-group-id="' + data.id + '" type="button" class="member-button ' + memberClass + '"><span class="button-text join-text"><i class="join"></i>' + window.sL.joinGroup + '</span><span class="button-text ismember-text">' + window.sL.isMemberOfGroup + '</span><span class="button-text leave-text">' + window.sL.leaveGroup + '</span></button></div>';
				
				// get local member avatars
				getFromAPI('statusnet/groups/membership.json?id=' + data.id, function(user_data){ if(user_data){
					var avatars = '';
					var i=0;
					$.each(user_data,function(k,v){
						if(i<7) {						
							avatars = avatars + '<img class="avatar size30" src="' + v.profile_image_url + '" />';
							}
						i++;
						});
					var profileCard = '<div class="profile-card"><div class="profile-header-inner" style="background-image:url(' + data.original_logo + ')"><div class="profile-header-inner-overlay"></div><a class="profile-picture"><img src="' + data.homepage_logo + '" /></a><div class="profile-card-inner"><h1 class="fullname">' + data.fullname + '<span></span></h1><h2 class="username"><span class="screen-name"><a target="_blank" href="' + groupRoot + '/group/' + data.nickname + '">!' + data.nickname + '@' + groupServer + '</a></span></span></h2><div class="bio-container"><p>' + data.description + '</p></div><p class="location-and-url"></span><span class="url"><a href="' + data.homepage + '">' + data.homepage.replace('http://','').replace('https://','') + '</a></span></p></div></div><div class="profile-banner-footer"><ul class="stats"><li><a target="_blank" href="' + groupRoot + '/group/' + data.nickname + '/members" class="member-stats">' + avatars + '</li></ul>' + memberButton + '<div class="clearfix"></div></div></div>';		
					popUpAction('popup-external-group-profile', '!' + data.nickname + '@' + groupServer,profileCard,false);				
					remove_spinner();																	
					}});				
				}});								
			}							
		}						
	});		


/* · 
   · 
   ·   When user clicks the x to remove a menu history item
   ·   
   · · · · · · · · · · · · · */ 
   
$('body').on('click','.close-right',function(event){
	$(this).parent('.stream-selection').remove();
	updateHistoryLocalStorage();
	});


/* · 
   · 
   ·   When sorting the history menu
   ·   
   · · · · · · · · · · · · · */ 
   
$('#history-container').on("sortupdate", function() {
	updateHistoryLocalStorage();
	});

	

/* · 
   · 
   ·   Load more from the current stream when scroll is 1000px from bottom
   ·
   ·   The search API is crap and don't do max_id and last_id, so we have to do pages there... 
   ·   
   · · · · · · · · · · · · · */ 
   
$(window).scroll(function() {
	if($(window).scrollTop() + $(window).height() > $(document).height() - 1000) {
		
		// only of logged in and not user stream		
		if($('#user-container').css('display') == 'block' && $('.stream-item.user').length==0) {
			// not if we're already loading
			if(!$('body').hasClass('loading-older')) {
				$('body').addClass('loading-older');
				
				// remove loading class in 10 seconds, i.e. try again if failed to load within 10 s			
				if(window.currentStream.substring(0,6) != 'search') {				
					setTimeout(function(){$('body').removeClass('loading-older');},10000); 
					}
	
				var lastStreamItemId = $('#feed-body').children('.stream-item').last().attr('id');			
				
				// if this is search, we need page and rpp vars, we store page number in an attribute
				if(window.currentStream.substring(0,6) == 'search') {
					if(typeof $('#feed-body').attr('data-search-page-number') != 'undefined') {
						var searchPage = parseInt($('#feed-body').attr('data-search-page-number'),10);
						}
					else {
						var searchPage=2;
						}
					var nextPage = searchPage+1;
					var getVars = '&rpp=20&page=' + searchPage;					
					}
				// normal streams
				else {
					var getVars = qOrAmp(window.currentStream) + 'max_id=' + $('#feed-body').children('.stream-item').last().attr('data-quitter-id-in-stream');				
					}
				
				display_spinner();		
				getFromAPI(window.currentStream + getVars,function(data){
					if(data) {
						addToFeed(data, lastStreamItemId,'visible');			
						$('body').removeClass('loading-older');
					
						// if this is search, we remeber page number
						if(window.currentStream.substring(0,6) == 'search') {
							$('#feed-body').attr('data-search-page-number',nextPage);
							}
					
						remove_spinner();	
						}
					});
				}
    	   	}
		}
	});



/* · 
   · 
   ·   Updates all queets' times/dates
   ·   
   · · · · · · · · · · · · · */ 

var updateTimesInterval=self.setInterval(function(){
	$('.created-at').each(function(){		
		$(this).children('a').html(parseTwitterDate($(this).attr('data-created-at')));
		});
	},10000);


/* · 
   · 
   ·   Check for new queets 
   ·   
   · · · · · · · · · · · · · */ 

var checkForNewQueetsInterval=window.setInterval(function(){checkForNewQueets()},window.timeBetweenPolling);
function checkForNewQueets() {

	// no new requests if requests are very slow, e.g. searches
	if(!$('body').hasClass('loading-newer')) {
		$('body').addClass('loading-newer');

		// only of logged in and not user stream
		if($('#user-container').css('display') == 'block' && $('.stream-item.user').length==0) {
			var lastId = $('#feed-body').children('.stream-item').not('.temp-post').attr('data-quitter-id-in-stream');
			var addThisStream = window.currentStream;
			getFromAPI(addThisStream + qOrAmp(window.currentStream) + 'since_id=' + lastId,function(data){
				if(data) {
					$('body').removeClass('loading-newer');
					if(addThisStream == window.currentStream) {		
						addToFeed(data, false, 'hidden');			
						}			
					}
				});
			}
		
		// if we have hidden items, show new-queets-bar
		if($('#feed-body').find('.stream-item.hidden').length > 0) {
			var new_queets_num = $('#feed-body').find('.stream-item.hidden').length;
			document.title = window.siteTitle + ' (' + new_queets_num + ')';
			$('#new-queets-bar').parent().removeClass('hidden');
	
			// text plural	
			if(new_queets_num == 1) { 
				var q_txt = ' ' + window.sL.newQueet;
				}
			else {
				var q_txt = ' ' + window.sL.newQueets;
				}		
	
			$('#new-queets-bar').html(new_queets_num + q_txt);
			}
		
		}	
	}



/* · 
   · 
   ·   Show hidden queets when user clicks on new-queets-bar
   ·   
   · · · · · · · · · · · · · */ 

$('#feed').on('click','#new-queets-bar',function(){
	document.title = window.siteTitle;
	$('.stream-item.hidden').css('opacity','0')
	$('.stream-item.hidden').animate({opacity:'1'}, 200);
	$('.stream-item.hidden').removeClass('hidden');	
	$('#new-queets-bar').parent().addClass('hidden');
	});	
	
	
	

/* · 
   · 
   ·   Expand and de-expand queets when clicking anywhere but on a few element types
   ·   
   · · · · · · · · · · · · · */ 

$('#feed-body').on('click','.queet',function (event) {
	if(!$(event.target).is('a')
		&& !$(event.target).is('.name')
		&& !$(event.target).is('.queet-box-template')	
		&& !$(event.target).is('button')				
		&& !$(event.target).is('.show-full-conversation')						
		&& !$(event.target).is('span.mention')
		&& !$(event.target).is('.action-reply-container a span')
		&& !$(event.target).is('.action-reply-container a b')	
		&& !$(event.target).is('.action-rt-container a span')
		&& !$(event.target).is('.action-rt-container a b')	
		&& !$(event.target).is('.action-del-container a span')
		&& !$(event.target).is('.action-del-container a b')			
		&& !$(event.target).is('.action-fav-container a span')
		&& !$(event.target).is('.action-fav-container a b')						
		&& !$(event.target).is('span.group')		
		&& !$(event.target).is('.longdate')			
		&& !$(event.target).is('.screen-name')
		&& !$(this).parent('.stream-item').hasClass('user') // not if user stream
		&& typeof window.loginUsername != 'undefined') {    // not if not logged in
		expand_queet($(this).parent());
		}	
	});



/* · 
   · 
   ·   When clicking the delete-button
   ·   
   · · · · · · · · · · · · · */ 

$('#feed').on('click','.action-del-container',function(){
	var this_stream_item = $(this).parent().parent().parent().parent().parent();	
	var this_qid = this_stream_item.attr('data-quitter-id');		
	var $queetHtml = $('<div>').append(this_stream_item.html());
	var $stuffToRemove = $queetHtml.find('.stream-item-footer, .expanded-content, .inline-reply-queetbox, .stream-item.conversation, .view-more-container-top, .view-more-container-bottom');
	$stuffToRemove.remove();
	var queetHtmlWithoutFooterAndConversation = $queetHtml.html();
	
	popUpAction('popup-delete-' + this_qid, window.sL.deleteConfirmation,queetHtmlWithoutFooterAndConversation,'<div class="right"><button class="close">' + window.sL.cancelVerb + '</button><button class="primary">' + window.sL.deleteVerb + '</button></div>');
	
	$('#popup-delete-' + this_qid + ' button.primary').on('click',function(){
		display_spinner();
		$('.modal-container').remove();		
		// delete
		postActionToAPI('statuses/destroy/' + this_qid + '.json', function(data) {
			if(data) {
				remove_spinner();
				// remove the stream-item clicked and all other displays of this object from dom (e.g. in conversation)
				$('.stream-item[data-quitter-id="' + this_qid + '"]').find('.queet').animate({opacity:'0'},700,function(){
					$('.stream-item[data-quitter-id="' + this_qid + '"]').remove(); 
					});
				}
			else {
				remove_spinner();
				}
			});		
		});

	});


/* · 
   · 
   ·   When clicking the requeet-button
   ·   
   · · · · · · · · · · · · · */ 

$('#feed').on('click','.action-rt-container',function(){
	var this_stream_item = $(this).parent().parent().parent().parent().parent();
	var this_action = $(this); 
	
	// requeet
	if(!this_action.children('.with-icn').hasClass('done')) {	
		this_action.children('.with-icn').addClass('done');
		this_action.find('.with-icn b').html(window.sL.requeetedVerb);		
		this_stream_item.addClass('requeeted');						

		// post requeet
		postActionToAPI('statuses/retweet/' + this_stream_item.attr('data-quitter-id') + '.json', function(data) {
			if(data) {
				// success
				this_stream_item.attr('data-requeeted-by-me-id',data.id);
				}
			else {
				// error
				this_action.children('.with-icn').removeClass('done');
				this_action.find('.with-icn b').html(window.sL.requeetVerb);		
				this_stream_item.removeClass('requeeted');									
				}
			});
		}
	// un-requeet
	else if(this_action.children('.with-icn').hasClass('done')) {
		display_spinner();	
		
		// if we don't have the id od the repeat stored in DOM, we need to look it up 
		// (might be a problem if there's more than 100 repeats)
		if(typeof this_stream_item.attr('data-requeeted-by-me-id') == 'undefined') {
			getFavsOrRequeetsForQueet('requeets',this_stream_item.attr('data-quitter-id'),function(data) {
				$.each(data,function(key,obj){
					if(window.myUserID == obj.user.id) {
						var my_rq_id = obj.id;
						unRequeet(this_stream_item, this_action, my_rq_id);
						}
					});								
				});			
			}
		// if we have the id stored in DOM 
		else {
			var my_rq_id = this_stream_item.attr('data-requeeted-by-me-id');
			unRequeet(this_stream_item, this_action, my_rq_id);
			}
		}			
	});
	


/* · 
   · 
   ·   When clicking the fav-button
   ·   
   · · · · · · · · · · · · · */ 

$('#feed').on('click','.action-fav-container',function(){
	var this_stream_item = $(this).parent().parent().parent().parent().parent();
	var this_action = $(this); 

	// fav
	if(!this_action.children('.with-icn').hasClass('done')) {	
		this_action.children('.with-icn').addClass('done');
		this_action.find('.with-icn b').html(window.sL.favoritedVerb);		
		this_stream_item.addClass('favorited');						

		// post fav	
		postActionToAPI('favorites/create/' + this_stream_item.attr('data-quitter-id') + '.json', function(data) {
			if(data) {
				// success
				}
			else {
				// error
				this_action.children('.with-icn').removeClass('done');
				this_action.find('.with-icn b').html(window.sL.favoriteVerb);		
				this_stream_item.removeClass('favorited');			
				}
			});
		}
	// unfav
	else  {
		display_spinner();	
		this_action.children('.with-icn').removeClass('done');
		this_action.find('.with-icn b').html(window.sL.favoriteVerb);		
		this_stream_item.removeClass('favorited');						

		// post unfav
		postActionToAPI('favorites/destroy/' + this_stream_item.attr('data-quitter-id') + '.json', function(data) {
			if(data) {
				// success
				remove_spinner();
				}
			else {
				// error
				remove_spinner();
				this_action.children('.with-icn').addClass('done');
				this_action.find('.with-icn b').html(window.sL.favoritedVerb);		
				this_stream_item.addClass('favorited');				
				}
			});		
		}		
	});



/* · 
   · 
   ·   When clicking the reply-button
   ·   
   · · · · · · · · · · · · · */ 

$('#feed').on('click','.action-reply-container',function(){
	var this_stream_item = $(this).parent().parent().parent().parent().parent();
	var this_stream_item_id = this_stream_item.attr('data-quitter-id');
	
	// if in conversation, popup
	if(this_stream_item.hasClass('conversation')) {

		var $queetHtml = $('<div>').append(this_stream_item.html());
		var $queetHtmlFooter = $queetHtml.find('.stream-item-footer');
		$queetHtmlFooter.remove();
		var queetHtmlWithoutFooter = $queetHtml.html();
		popUpAction('popup-reply-' + this_stream_item_id, window.sL.replyTo + ' ' + this_stream_item.find('.screen-name').html(),replyFormHtml(this_stream_item,this_stream_item_id),queetHtmlWithoutFooter);
		expandInlineQueetBox($('#popup-reply-' + this_stream_item_id).find('.modal-body').find('.queet-box-template'));
		}
	// inline replies	
	else {
		// if not expanded, expand first
		if(!this_stream_item.hasClass('expanded')) {
			expand_queet(this_stream_item);
			}
		// if queet box is not active: activate
		if(!this_stream_item.find('.queet').find('.queet-box-template').hasClass('active')) {
			expandInlineQueetBox(this_stream_item.find('.queet').find('.queet-box-template'));			
			}
		}
	});



/* · 
   · 
   ·   Close popups
   ·   
   · · · · · · · · · · · · · */ 

$('body').on('click','.modal-container button.close',function(){
	$('.modal-container').remove();
	});
$('body').on('click','.modal-close',function(){
	$('.modal-container').remove();
	});	
$(document).keyup(function(e){
	if(e.keyCode==27) {
		$('.modal-container').remove();
		}
	});	


/* · 
   · 
   ·   Expand inline reply form when clicked
   ·   
   · · · · · · · · · · · · · */ 

$('#feed').on('click','.queet-box-template',function(){
	// expand inline queet box
	expandInlineQueetBox($(this));
	});
	


/* · 
   · 
   ·   When inline reply form blur, check if it is changed  
   ·   
   · · · · · · · · · · · · · */ 

$('#feed').on('blur','.queet-box-template',function(){
	if($(this).html().replace(/\s/g, '').replace(/&nbsp;/gi,'').replace(/<br>/gi,'') != unescape($(this).attr('data-start-html')).replace(/\s/g, '').replace(/&nbsp;/gi,'').replace(/<br>/gi,'')) {
		if($(this).text().replace(/\s/gi, '').replace(/&nbsp;/gi,'').replace(/<br>/gi,'').length==0) {
			$(this).removeClass('active');
			$(this).html(unescape($(this).attr('data-blurred-html')));
			$(this).parent().find('.queet-toolbar').remove();			
			}
		}
	else {
		$(this).removeClass('active');
		$(this).html(unescape($(this).attr('data-blurred-html')));
		$(this).parent().find('.queet-toolbar').remove();
		}
	});



/* · 
   · 
   ·   Do varouis thins on keyup in reply box, counting, checking for spaces in mentions etc
   ·   
   · · · · · · · · · · · · · */ 

$('body').on('keyup','.queet-box-template, .queet-box',function(e){

	// count chars
	countCharsInQueetBox($(this),$(this).parent().find('.queet-toolbar .queet-counter'),$(this).parent().find('.queet-toolbar button'));	
	
	// no spaces in mentions!
	$.each($(this).find('a'), function(key, obj){
		var obj_html = $(obj).html();
		var first_part = obj_html.substr(0,obj_html.indexOf(' ')); 
		if(first_part.length>0) {
			var second_part = obj_html.substr(obj_html.indexOf(' ')+1); 
			if(e.keyCode==32) { // space
				$(obj).before('<a>' + first_part + '</a> ');
				$(obj).after(second_part);				
				$(obj)[0].outerHTML = '';				
				}
			else { // other keys
				$(obj).before('<a>' + first_part + '</a> ' + second_part);
				$(obj)[0].outerHTML = '';				
				}
			}
		});
	
	});



/* · 
   · 
   ·   Post inline and popup replies
   ·   
   · · · · · · · · · · · · · */ 

$('body').on('click', '.queet-toolbar button',function () {	
	
	if($(this).hasClass('enabled')) {
		
		// set temp post id
		if($('.temp-post').length == 0) {
			var tempPostId = 'stream-item-temp-post-i';
			}
		else {
			var tempPostId = $('.temp-post').attr('id') + 'i';			
			}
			
		var queetText = $(this).parent().parent().parent().find('.queet-box-template').html();
		var queetText_txt = $(this).parent().parent().parent().find('.queet-box-template').text();
		
		// remove trailing <br> and convert other <br> to newline
		queetText = $.trim(queetText);
		if(queetText.substr(queetText.length-4) == '<br>') {
			queetText = queetText.substring(0, queetText.length - 4);
			queetText = queetText.replace(/<br>/g,"\n");
			}						
		
		// get reply to id and add temp queet
		if($('.modal-container').find('.queet-toolbar button').length>0) { // from popup
			var in_reply_to_status_id = $('.modal-container').attr('id').substring(12); // removes "popup-reply-" from popups id
			$('.modal-container').remove();			
			var queetHtml = '<div id="' + tempPostId + '" class="stream-item temp-post" style="opacity:1"><div class="queet"><span class="dogear"></span><div class="queet-content"><div class="stream-item-header"><a class="account-group"><img class="avatar" src="' + $('#user-avatar').attr('src') + '" /><strong class="name">' + $('#user-name').html() + '</strong> <span class="screen-name">@' + $('#user-screen-name').html() + '</span></a><small class="created-at">posting</small></div><div class="queet-text">' + queetText + '</div><div class="stream-item-footer"><span class="stream-item-expand">&nbsp;</span></div></div></div></div>';
			queetHtml = detectRTL(queetHtml);		
			$('#feed-body').prepend(queetHtml);
			}
		else { // from inline reply
			var in_reply_to_status_id = $(this).parent().parent().parent().parent().parent().attr('data-quitter-id');
			var queetHtml = '<div id="' + tempPostId + '" class="stream-item conversation temp-post" style="opacity:1"><div class="queet"><span class="dogear"></span><div class="queet-content"><div class="stream-item-header"><a class="account-group"><img class="avatar" src="' + $('#user-avatar').attr('src') + '" /><strong class="name">' + $('#user-name').html() + '</strong> <span class="screen-name">@' + $('#user-screen-name').html() + '</span></a><small class="created-at">posting</small></div><div class="queet-text">' + queetText + '</div><div class="stream-item-footer"><span class="stream-item-expand">&nbsp;</span></div></div></div></div>';
			queetHtml = detectRTL(queetHtml);		
			$(this).parent().parent().parent().parent().parent().append(queetHtml);			
			}		
		
		// null reply box
		$(this).parent().parent().parent().find('.queet-box-template').removeClass('active');
		$(this).parent().parent().parent().find('.queet-box-template').html(unescape($(this).parent().parent().parent().find('.queet-box-template').attr('data-blurred-html')));
		$(this).parent().parent().parent().find('.queet-toolbar').remove();
				
		// check for new queets (one second from) NOW 
		setTimeout('checkForNewQueets()', 1000);

		// post queet
		postReplyToAPI(queetText_txt, in_reply_to_status_id, function(data){ if(data) {

			// show real queet
			var new_queet = Array();
			new_queet[0] = data;
			addToFeed(new_queet,tempPostId,'visible');

			// remove temp queet
			$('#' + tempPostId).remove();
				
			}});
		}
	});



/* · 
   · 
   ·   Post queet
   ·   
   · · · · · · · · · · · · · */ 

$('#queet-toolbar button').click(function () {
	if($(this).hasClass('enabled')) {
		
		// set temp post id
		if($('.temp-post').length == 0) {
			var tempPostId = 'stream-item-temp-post-i';
			}
		else {
			var tempPostId = $('.temp-post').attr('id') + 'i';			
			}
			
		var queetText = $('#queet-box').html();

		// remove trailing <br> and convert other <br> to newline
		queetText = $.trim(queetText);
		if(queetText.substr(queetText.length-4) == '<br>') {
			queetText = queetText.substring(0, queetText.length - 4);
			queetText = queetText.replace(/<br>/g,"\n");
			}		

		// show temporary queet
		var queetHtml = '<div id="' + tempPostId + '" class="stream-item temp-post" style="opacity:1"><div class="queet"><span class="dogear"></span><div class="queet-content"><div class="stream-item-header"><a class="account-group"><img class="avatar" src="' + $('#user-avatar').attr('src') + '" /><strong class="name">' + $('#user-name').html() + '</strong> <span class="screen-name">@' + $('#user-screen-name').html() + '</span></a><small class="created-at">posting</small></div><div class="queet-text">' + queetText + '</div><div class="stream-item-footer"><span class="stream-item-expand">&nbsp;</span></div></div></div></div>';

		// detect rtl
		queetHtml = detectRTL(queetHtml);						

		$('#feed-body').prepend(queetHtml);
		
		// check for new queets (one second from) NOW 
		setTimeout('checkForNewQueets()', 1000);
		
		// null post form
		$('#queet-box').html(window.sL.compose);
		$('#queet-box').attr('contenteditable','false');
		$('#queet-toolbar').css('display','none');

		// post queet
		postQueetToAPI(queetText, function(data){ if(data) {

			// show real queet
			var new_queet = Array();
			new_queet[0] = data;
			addToFeed(new_queet,tempPostId,'visible');

			// remove temp queet
			$('#' + tempPostId).remove();
			
			}});
		}
	});



/* · 
   · 
   ·   Count chars in queet box on keyuo
   ·   
   · · · · · · · · · · · · · */ 

$('#queet-box').keyup(function () {
	countCharsInQueetBox($('#queet-box'),$('#queet-counter'),$('#queet-toolbar button'));
	});	
	
	
	
	
/* · 
   · 
   ·   Expand/collapse queet box on click and blur
   ·   
   · · · · · · · · · · · · · */ 	

$('#queet-box').click(function () {
	if($('#queet-box').html() == window.sL.compose) {
		$('#queet-box').attr('contenteditable','true');	
		$('#queet-box').html('&nbsp;');
		$('#queet-box').focus();
		$('#queet-toolbar').css('display','block');	
		$('#queet-toolbar button').addClass('disabled');	
		countCharsInQueetBox($('#queet-box'),$('#queet-counter'),$('#queet-toolbar button'));	
		}
	});
$('#queet-box').blur(function () {
	if($('#queet-box').html().length == 0 || $('#queet-box').html() == '<br>'  || $('#queet-box').html() == '<br />' || $('#queet-box').html() == '&nbsp;' || $('#queet-box').html() == '&nbsp;<br>') {
		$('#queet-box').attr('contenteditable','false');	
		$('#queet-box').html(window.sL.compose);
		$('#queet-toolbar').css('display','none');	
		$('#queet-box').removeAttr('style'); 
		}
	});


	
	
/* · 
   · 
   ·   Remove html and shorten urls on paste in queet boxes
   ·   
   · · · · · · · · · · · · · */ 	
   
$('#queet-box').bind('paste',function () {
	$('#queet-box').css('color','transparent');
	setTimeout(function () {
		
		// clean all html (but keep linebreaks)
		var $keep_br = $('<div/>').append($('#queet-box').html().replace(/<br>/gi,'{{br}}'));
		$('#queet-box').html($keep_br.text().replace(/{{br}}/gi,'<br>'));
		
		// shorten urls
		shortenUrlsInBox($('#queet-box'),$('#queet-counter'),$('#queet-toolbar button'));
		
		$('#queet-box').css('color','#333333');	
		placeCaretAtEnd(document.getElementById("queet-box"));
		countCharsInQueetBox($('#queet-box'),$('#queet-counter'),$('#queet-toolbar button'));
		}, 1);
	});
$('#feed').on('paste','.queet-box-template',function(e){
	window.current_box_id = '#' + $(this).attr('id');
	setTimeout(function () {			
		// clean all html
		$(window.current_box_id).html($(window.current_box_id).text());
		
		// shorten urls
		shortenUrlsInBox($(window.current_box_id),$(window.current_box_id).find('.queet-counter'),$(window.current_box_id).find('.queet-toolbar button'));
		
		placeCaretAtEnd(document.getElementById($(window.current_box_id).attr('id')));
		countCharsInQueetBox($(window.current_box_id),$(window.current_box_id).find('.queet-counter'),$(window.current_box_id).find('.queet-toolbar button'));
		}, 1);
	});		
	
	
	
/* · 
   · 
   ·   Shorten URL:s in queet boxes on space
   ·   
   · · · · · · · · · · · · · */ 	
  
$('body').on('keyup','#queet-box',function(e){
	if(e.keyCode == 32) {
		shortenUrlsInBox($('#queet-box'),$('#queet-counter'),$('#queet-toolbar button'));	
		}
	});
$('#feed').on('keyup','.queet-box-template',function(e){
	if(e.keyCode == 32) {
		shortenUrlsInBox($(this),$(this).find('.queet-counter'),$(this).find('.queet-toolbar button'));	
		}
	});	


/* · 
   · 
   ·   When clicking show more links, walk upwards or downwards
   ·   
   · · · · · · · · · · · · · */ 	
  	
$('#feed').on('click','.view-more-container-bottom', function(){
	findReplyToStatusAndShow($(this).parent('.stream-item').attr('data-quitter-id'),$(this).attr('data-replies-after'));
	$(this).remove();
	});
$('#feed').on('click','.view-more-container-top', function(){

	var this_qid = $(this).closest('.stream-item:not(.conversation)').attr('data-quitter-id');	
	var queet = $(this).siblings('.queet');
	rememberMyScrollPos(queet,'moretop' + this_qid);


	findInReplyToStatusAndShow($(this).parent('.stream-item').attr('data-quitter-id'),$(this).attr('data-trace-from'),false,true);
	$(this).remove();

	backToMyScrollPos(queet,'moretop' + this_qid,false);	

	// remove the "show full conversation" link if nothing more to show
	if($('#stream-item-' + $(this).parent('.stream-item').attr('data-quitter-id')).find('.hidden-conversation').length == 0) {
		$('#stream-item-' + $(this).parent('.stream-item').attr('data-quitter-id')).children('.queet').find('.show-full-conversation').remove();
		}		
	});	



/* · 
   · 
   ·   When clicking "show full conversation", show all hidden queets in conversation
   ·   
   · · · · · · · · · · · · · */ 	

$('#feed').on('click','.show-full-conversation',function(){

	var this_q = $(this).closest('.queet');
	var this_qid = $(this).closest('.stream-item:not(.conversation)').attr('data-quitter-id');	

	rememberMyScrollPos(this_q,this_qid);
			
	$('#stream-item-' + $(this).attr('data-stream-item-id')).find('.view-more-container-top').remove();		
	$('#stream-item-' + $(this).attr('data-stream-item-id')).find('.view-more-container-bottom').remove();		
	$.each($('#stream-item-' + $(this).attr('data-stream-item-id')).find('.hidden-conversation'),function(key,obj){
		$(obj).removeClass('hidden-conversation');
		$(obj).animate({opacity:'1'},400,function(){
			$(obj).css('background-color','pink').animate({backgroundColor:'#F6F6F6'},1000);			
			});
		});
	$(this).remove();
	
	backToMyScrollPos(this_q,this_qid,false);
	});