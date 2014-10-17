
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
   ·   Main stream item builder function
   ·
   ·   Not used yet, I was only thinking that the addToFeed()-function
   ·   hidden far down in this file should be restructured into something
   ·   in this direction.
   · 
   ·   @param streamItemObj: object with all necessary data to build stream 
   ·
   ·   @return the html of the stream item
   · 
   · · · · · · · · · */

function buildStreamItem(streamItemObj) {
	
	// make a jquery base element
	var streamItemContainer = $('<div>').append('<div class="stream-item"></div>');
	var streamItem = streamItemContainer.children('.stream-item');	
	
	// give it an id
	streamItem.attr('id',streamItemObj.id);

	// give it classes
	$.each(streamItemObj.classes, function(k,o){
		streamItem.addClass(o);
		});
		
	return streamItemContainer.html();	
	}
	



/* ·  
   · 
   ·   Show favs or requeets in queet element
   · 
   ·   @param q: queet jQuery object
   ·   @param users: object with users that has faved or requeeted 
   ·   @param type: fav or requeet
   · 
   · · · · · · · · · */
   	
function showFavsOrRequeetsInQueet(q,users,type) {

	// label maybe plural				
	if(users.length == 1) {
		if(type=='favs') { var label = window.sL.favoriteNoun;	}
		else if(type=='requeets') { var label = window.sL.requeetNoun;	}
		}
	else if(users.length > 1) {
		if(type=='favs') { var label = window.sL.favoritesNoun;	}
		else if(type=='requeets') { var label = window.sL.requeetsNoun;	}
		}
	
	var html = '<li class="x-count"><a><strong>' + users.length + '</strong> ' + label + ' </a></li>';

	// add fav and rq-container if it doesn't exist
	if(!q.find('ul.stats').length > 0) {
		q.find('.queet-stats-container').prepend('<ul class="stats"><li class="avatar-row"></li></ul>');					
		}
	
	// requeets always first				
	if(type=='favs') {
		q.find('li.avatar-row').before(html.replace('x-count','fav-count'));						
		}
	else if(type=='requeets') {
		q.find('ul.stats').prepend(html.replace('x-count','rq-count'));						
		}
	
	// show max seven avatars
	var avatarnum = q.find('.avatar').length;
	if(avatarnum < 7) {
		$.each(users,function(){
			
			// api return little different objects for fav and rq
			var userObj = new Object();
			if(type=='favs') {
				userObj = this;
				}
			else if(type=='requeets') {
				userObj.fullname = this.user.name;
				userObj.user_id = this.user.id;				
				userObj.profileurl = this.user.statusnet_profile_url;								
				userObj.avatarurl = this.user.profile_image_url;
				}
			
			// no dupes
			if(q.children('.queet').find('#av-' + userObj.user_id).length==0) {
				q.find('.avatar-row').append('<a title="' + userObj.fullname + '" data-user-id="' + userObj.user_id + '" href="' + userObj.profileurl + '"><img alt="' + userObj.fullname + '" src="' + userObj.avatarurl + '" class="avatar size24" id="av-' + userObj.user_id + '"></a>');
				avatarnum++;							
				}
			return (avatarnum < 8);					
			});
		}	
	}
	
	
	
/* ·  
   · 
   ·   Adds a profile card before feed element, with data from the first object in the included object 
   · 
   ·   @param data: an object with one or more queet objects
   · 
   · · · · · · · · · */
   	
function profileCardFromFirstObject(data,screen_name) {
	
	var first = new Object();
	for (var i in data) {
	    if (data.hasOwnProperty(i) && typeof(i) !== 'function') {
	        first = data[i];
	        break;
		    }
		}
	
	if(typeof first.user != 'undefined') {

		first.user = cleanUpUserObject(first.user);
		
		// use avatar if no cover photo
		if(first.user.cover_photo === false) {
			first.user.cover_photo = first.user.profile_image_url_original;
			}
		
		// follows me?
		var follows_you = '';
		if(first.user.follows_you === true && window.myUserID != first.user.id) {
			var follows_you = '<span class="follows-you">' + window.sL.followsYou + '</span>';			
			}
		
		// show user actions if logged in
		var followingClass = '';
		if(first.user.following) {
			followingClass = 'following';
			}	
		var followButton = '';				
		if(typeof window.loggedIn.screen_name != 'undefined' && window.myUserID != first.user.id) {			
			var followButton = '<div class="user-actions"><button data-follow-user-id="' + first.user.id + '" data-follow-user="' + first.user.statusnet_profile_url + '" type="button" class="follow-button ' + followingClass + '"><span class="button-text follow-text"><i class="follow"></i>' + window.sL.userFollow + '</span><span class="button-text following-text">' + window.sL.userFollowing + '</span><span class="button-text unfollow-text">' + window.sL.userUnfollow + '</span></button></div>';	
			}
		
		// follow from external instance if logged out
		if(typeof window.loggedIn.screen_name == 'undefined') {			
			var followButton = '<div class="user-actions"><button type="button" class="external-follow-button ' + followingClass + '"><span class="button-text follow-text"><i class="follow"></i>' + window.sL.userExternalFollow + '</span></button></div>';	
			}
		
		// edit profile button if me
		if(typeof window.loggedIn.screen_name != 'undefined' && window.myUserID == first.user.id) {			
			var followButton = '<div class="user-actions"><button type="button" class="edit-profile-button"><span class="button-text edit-profile-text">' + window.sL.editMyProfile + '</span></button></div>';	
			}		
		
			
		// change design
		changeDesign(first.user);			

		// remove any old profile card 
		$('#feed').siblings('.profile-card').remove();

		// insert profile card into dom
		$('#feed').before('<div class="profile-card"><div class="profile-header-inner" style="background-image:url(' + first.user.cover_photo + ')"><div class="profile-header-inner-overlay"></div><a class="profile-picture" href="' + first.user.profile_image_url_original + '"><img src="' + first.user.profile_image_url_profile_size + '" /></a><div class="profile-card-inner"><h1 class="fullname">' + first.user.name + '<span></span></h1><h2 class="username"><span class="screen-name">@' + first.user.screen_name + '</span>' + follows_you + '</h2><div class="bio-container"><p>' + first.user.description + '</p></div><p class="location-and-url"><span class="location">' + first.user.location + '</span><span class="divider"> · </span><span class="url"><a href="' + first.user.url + '">' + first.user.url.replace('http://','').replace('https://','') + '</a></span></p></div></div><div class="profile-banner-footer"><ul class="stats"><li><a class="tweet-stats"><strong>' + first.user.statuses_count + '</strong>' + window.sL.notices + '</a></li><li><a class="following-stats"><strong>' + first.user.friends_count + '</strong>' + window.sL.following + '</a></li><li><a class="follower-stats"><strong>' + first.user.followers_count + '</strong>' + window.sL.followers + '</a></li><li><a class="groups-stats"><strong>' + first.user.groups_count + '</strong>' + window.sL.groups + '</a></li></ul>' + followButton + '<div class="clearfix"></div></div></div>');		
		}
	
	// if user hasn't queeted or if we're not allowed to read their queets
	else {
		getFromAPI('users/show/' + screen_name + '.json', function(data){ if(data){
			data = cleanUpUserObject(data);
			
			// use avatar if no cover photo
			if(data.cover_photo === false) {
				data.cover_photo = data.profile_image_url_original;
				}

			// follows me?
			var follows_you = '';
			if(data.follows_you === true  && window.myUserID != data.id) {
				var follows_you = '<span class="follows-you">' + window.sL.followsYou + '</span>';			
				}

			// show user actions if logged in
			var followingClass = '';
			if(data.following) {
				followingClass = 'following';
				}			
			var followButton = '';
			if(typeof window.loggedIn.screen_name != 'undefined' && window.myUserID != data.id) {			
				var followButton = '<div class="user-actions"><button data-follow-user-id="' + data.id + '" data-follow-user="' + data.statusnet_profile_url + '" type="button" class="follow-button ' + followingClass + '"><span class="button-text follow-text"><i class="follow"></i>' + window.sL.userFollow + '</span><span class="button-text following-text">' + window.sL.userFollowing + '</span><span class="button-text unfollow-text">' + window.sL.userUnfollow + '</span></button></div>';	
				}
				
			// follow from external instance if logged out
			if(typeof window.loggedIn.screen_name == 'undefined') {			
				var followButton = '<div class="user-actions"><button type="button" class="external-follow-button ' + followingClass + '"><span class="button-text follow-text"><i class="follow"></i>' + window.sL.userExternalFollow + '</span></button></div>';	
				}
		
			// edit profile button if me
			if(typeof window.loggedIn.screen_name != 'undefined' && window.myUserID == data.id) {			
				var followButton = '<div class="user-actions"><button type="button" class="edit-profile-button"><span class="button-text edit-profile-text">' + window.sL.editMyProfile + '</span></button></div>';	
				}						
				
				
			// change design
			changeDesign(data);

			// remove any old profile card and show profile card
			$('#feed').siblings('.profile-card').remove();
			$('#feed').before('<div class="profile-card"><div class="profile-header-inner" style="background-image:url(' + data.cover_photo + ')"><div class="profile-header-inner-overlay"></div><a class="profile-picture" href="' + data.profile_image_url_original + '"><img src="' + data.profile_image_url_profile_size + '" /></a><div class="profile-card-inner"><h1 class="fullname">' + data.name + '<span></span></h1><h2 class="username"><span class="screen-name">@' + data.screen_name + '</span>' + follows_you + '</span></h2><div class="bio-container"><p>' + data.description + '</p></div><p class="location-and-url"><span class="location">' + data.location + '</span><span class="divider"> · </span><span class="url"><a href="' + data.url + '">' + data.url.replace('http://','').replace('https://','') + '</a></span></p></div></div><div class="profile-banner-footer"><ul class="stats"><li><a class="tweet-stats"><strong>' + data.statuses_count + '</strong>' + window.sL.notices + '</a></li><li><a class="following-stats"><strong>' + data.friends_count + '</strong>' + window.sL.following + '</a></li><li><a class="follower-stats"><strong>' + data.followers_count + '</strong>' + window.sL.followers + '</a></li><li><a class="groups-stats"><strong>' + data.groups_count + '</strong>' + window.sL.groups + '</a></li></ul>' + followButton + '<div class="clearfix"></div></div></div>');		
			}});		
		}		
	}
	
	
	
	
/* ·  
   · 
   ·   Adds a group profile card before feed element
   · 
   ·   @param data: an object with one or more queet objects
   · 
   · · · · · · · · · */
   	
function groupProfileCard(groupAlias) {	
	getFromAPI('statusnet/groups/show/' + groupAlias + '.json', function(data){ if(data){
		
		data.nickname = data.nickname || '';
		data.fullname = data.fullname || '';
		data.stream_logo = data.stream_logo || window.fullUrlToThisQvitterApp + 'img/default-avatar-stream.png';
		data.homepage_logo = data.homepage_logo || window.fullUrlToThisQvitterApp + 'img/default-avatar-profile.png';
		data.original_logo = data.original_logo || window.fullUrlToThisQvitterApp + 'img/default-avatar-profile.png';						
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
		var memberButton = '';
		if(typeof window.loggedIn.screen_name != 'undefined') {			
			var memberButton = '<div class="user-actions"><button data-group-id="' + data.id + '" type="button" class="member-button ' + memberClass + '"><span class="button-text join-text"><i class="join"></i>' + window.sL.joinGroup + '</span><span class="button-text ismember-text">' + window.sL.isMemberOfGroup + '</span><span class="button-text leave-text">' + window.sL.leaveGroup + '</span></button></div>';	
			}
			
		// follow from external instance if logged out
		if(typeof window.loggedIn.screen_name == 'undefined') {			
			var memberButton = '<div class="user-actions"><button type="button" class="external-member-button"><span class="button-text join-text"><i class="join"></i>' + window.sL.joinExternalGroup + '</span></button></div>';	
			}			
		
		// add card to DOM
		$('#feed').siblings('.profile-card').remove();  // remove any old profile card 
		$('#feed').before('<div class="profile-card"><div class="profile-header-inner" style="background-image:url(' + data.original_logo + ')"><div class="profile-header-inner-overlay"></div><a class="profile-picture" href="' + data.original_logo + '"><img src="' + data.homepage_logo + '" /></a><div class="profile-card-inner"><h1 class="fullname">' + data.fullname + '<span></span></h1><h2 class="username"><span class="screen-name">!' + data.nickname + '</span></span></h2><div class="bio-container"><p>' + data.description + '</p></div><p class="location-and-url"></span><span class="url"><a href="' + data.homepage + '">' + data.homepage.replace('http://','').replace('https://','') + '</a></span></p></div></div><div class="profile-banner-footer"><ul class="stats"><li><a class="member-stats"><strong>' + data.member_count + '</strong>' + window.sL.memberCount + '</a></li><li><a class="admin-stats"><strong>' + data.admin_count + '</strong>' + window.sL.adminCount + '</a></li></ul>' + memberButton + '<div class="clearfix"></div></div></div>');		
		}});		
	}	
	
	
	
/* ·  
   · 
   ·   Change stream
   · 
   ·   @param stream: part of the url to the api (everything after api base url)
   ·   @param actionOnSuccess: callback function on success
   · 
   · · · · · · · · · */
    
function setNewCurrentStream(stream,actionOnSuccess,setLocation) { 
	
	// remember state of old stream (including profile card)
	window.oldStreams[window.currentStream] = $('#feed').siblings('.profile-card').outerHTML() + $('#feed').outerHTML();

	// set location bar from stream
	if(setLocation) {
		setUrlFromStream(stream);
		}

	// halt interval that checks for new queets
	window.clearInterval(checkForNewQueetsInterval);
	window.clearInterval(checkForNewNotificationsInterval);
		
	display_spinner();
	
	// scroll to top
	$(window).scrollTop(0);
	$('body').addClass('androidFix').scrollTop(0).removeClass('androidFix');
	
	$('#feed-body').removeAttr('data-search-page-number'); // null any searches
	
	// remember the most recent stream selection in global var
	window.currentStream = stream;	
	
	// if this is a @user stream, i.e. user's queets, user's followers, user's following, we set _queets_ as the default stream in the menu
	if(stream.substring(0,45) == 'statuses/followers.json?count=20&screen_name='
	|| stream.substring(0,43) == 'statuses/friends.json?count=20&screen_name='
	|| stream.substring(0,48) == 'statusnet/groups/list.json?count=10&screen_name='	
	|| stream.substring(0,43) == 'statuses/friends_timeline.json?screen_name='
	|| stream.substring(0,27) == 'favorites.json?screen_name='	
	|| stream.substring(0,35) == 'statuses/mentions.json?screen_name='	
	|| stream.substring(0,27) == 'statuses/user_timeline.json')	{
		var defaultStreamName = 'statuses/user_timeline.json?' + stream.substring(stream.indexOf('screen_name='));
		var streamHeader = '@' + stream.substring(stream.lastIndexOf('=')+1);
		}
	// if this is a my user streams, i.e. my followers, my following
	else if(stream == 'statuses/followers.json?count=20'
	|| stream == 'statuses/friends.json?count=20'
	|| stream == 'statusnet/groups/list.json?count=10')	{
		var defaultStreamName = stream;
		var streamHeader = '@' + window.loggedIn.screen_name;
		}		
	// if this is one of the default streams, get header from DOM
	else if(stream == 'statuses/friends_timeline.json'
	|| stream == 'statuses/mentions.json'
	|| stream == 'qvitter/statuses/notifications.json'	
	|| stream == 'favorites.json'	
	|| stream == 'statuses/public_timeline.json'
	|| stream == 'statuses/public_and_external_timeline.json')	{	
		var defaultStreamName = stream;
		var streamHeader = $('.stream-selection[data-stream-name="' + stream + '"]').attr('data-stream-header');
		}	
		
	// if this is a !group stream
	else if(stream.substring(0,26) == 'statusnet/groups/timeline/'
		 || stream.substring(0,28) == 'statusnet/groups/membership/'
		 || stream.substring(0,24) == 'statusnet/groups/admins/')	{
		var defaultStreamName = 'statusnet/groups/timeline/' + stream.substring(stream.lastIndexOf('/')+1);
		var streamHeader = '!' + stream.substring(stream.lastIndexOf('/')+1, stream.indexOf('.json'));
		}		
	// if this is a #tag stream
	else if(stream.substring(0,24) == 'statusnet/tags/timeline/')	{
		var defaultStreamName = stream;
		var streamHeader = '#' + stream.substring(stream.indexOf('/timeline/')+10,stream.indexOf('.json'));
		}			
	// if this is a notice stream
	else if(stream.substring(0,14) == 'statuses/show/')	{
		var defaultStreamName = stream;
		var streamHeader = 'notice/' + stream.substring(stream.indexOf('/show/')+6,stream.indexOf('.json'));
		}					
	// if this is a search stream
	else if(stream.substring(0,11) == 'search.json')	{
		var defaultStreamName = stream;
		var streamHeader = window.sL.searchVerb + ': ' + decodeURIComponent(stream.substring(stream.indexOf('?q=')+3));
		}
	
	// set the h2 header in the feed
	if(stream.substring(0,23) == 'statuses/followers.json') {
		var h2FeedHeader = '<div class="queet-streams"><a class="queet-stream following">' + window.sL.following + '</a> / </div>' + window.sL.followers;			
		}
	else if(stream.substring(0,21) == 'statuses/friends.json') {
		var h2FeedHeader = window.sL.following + '<div class="queet-streams">/ <a class="queet-stream followers">' + window.sL.followers + '</a></div>';		
		}	
	else if(stream.substring(0,40) == 'statuses/user_timeline.json?screen_name=') {
		var h2FeedHeader = window.sL.notices + '<div class="queet-streams">/ <a class="queet-stream mentions">' + window.sL.mentions + '</a> / <a class="queet-stream favorites">' + window.sL.favoritesNoun +'</a></div>';		
		}	
	else if(stream.substring(0,35) == 'statuses/mentions.json?screen_name=') {
		var h2FeedHeader = '<div class="queet-streams"><a class="queet-stream queets">' + window.sL.notices + '</a> /</div>' + window.sL.mentions + '<div class="queet-streams">/ <a class="queet-stream favorites">' + window.sL.favoritesNoun + '</a></div>';		
		}	
	else if(stream.substring(0,27) == 'favorites.json?screen_name=') {
		var h2FeedHeader = '<div class="queet-streams"><a class="queet-stream queets">' + window.sL.notices + '</a> / <a class="queet-stream mentions">' + window.sL.mentions + '</a> /</div>' + window.sL.favoritesNoun;		
		}					
	else if(stream.substring(0,26) == 'statusnet/groups/list.json') {
		var h2FeedHeader = window.sL.groups;		
		}	
	else if(stream.substring(0,28) == 'statusnet/groups/membership/') {
		var h2FeedHeader = window.sL.memberCount;
		}				
	else if(stream.substring(0,24) == 'statusnet/groups/admins/') {
		var h2FeedHeader = window.sL.adminCount;
		}						
	else if(stream.substring(0,43) == 'statuses/friends_timeline.json?screen_name=') {
		var h2FeedHeader = '<span style="unicode-bidi:bidi-override;direction:ltr;">' + streamHeader + '/all</span>'; // ugly rtl fix, sry, we should have translations for this stream header		
		}			
	else {
		var h2FeedHeader = streamHeader;		
		}									
	

	// if we have a saved copy of this stream, show it immediately (but it is replaced when stream finishes to load later)
	if(typeof window.oldStreams[window.currentStream] != "undefined") {
		$('.profile-card').remove(); 
		$('#feed').remove();
		$('#user-container').after(window.oldStreams[window.currentStream]);
		$('.profile-card').css('display','none');
		$('#feed').css('display','none');		
		$('.profile-card').show();
		$('#feed').show();
		$('#feed-header-inner h2').css('opacity','0.2');
		$('#feed-header-inner h2').animate({opacity:'1'},1000);
		}

	// otherwise we fade out and wait for stream to load
	else {
		// fade out
		$('#feed,.profile-card').animate({opacity:'0'},150,function(){
			// when fade out finishes, remove any profile cards and set new header
			$('.profile-card').remove(); 
			$('#feed-header-inner h2').html(h2FeedHeader);
			});	
		}
			
	// add this stream to history menu if it doesn't exist there (but not if this is me or if we're not logged in)
	if($('.stream-selection[data-stream-header="' + streamHeader + '"]').length==0
	&& streamHeader != '@' + window.loggedIn.screen_name
	&& typeof window.loggedIn.screen_name != 'undefined') { 			
		$('#history-container').append('<a class="stream-selection" data-stream-header="' + streamHeader + '" href="' + $('.stream-selection.public-timeline').attr('href') + convertStreamToPath(defaultStreamName) + '">' + streamHeader + '<i class="chev-right"></i></a>');
		updateHistoryLocalStorage();
		}
	
	// mark this stream as current in menu	
	$('.stream-selection').removeClass('current');
	$('.stream-selection[data-stream-header="' + streamHeader + '"]').addClass('current');
	

	// if this is user's user feed, i.e. followers etc, we want a profile card, which we need to get from user_timeline since the users/show api action is broken (auth doesn't work) 
	if(stream.substring(0,23) == 'statuses/followers.json'
	|| stream.substring(0,21) == 'statuses/friends.json'
	|| stream.substring(0,26) == 'statusnet/groups/list.json'	
	|| stream.substring(0,35) == 'statuses/mentions.json?screen_name='
	|| stream.substring(0,27) == 'favorites.json?screen_name='			
	|| stream.substring(0,43) == 'statuses/friends_timeline.json?screen_name=')	{
		getFromAPI(defaultStreamName + '&count=1', function(profile_data){			
			if(profile_data) {
				getFromAPI(stream, function(user_data){
					if(user_data) {
						// while waiting for this data user might have changed stream, so only proceed if current stream still is this one
						if(window.currentStream == stream) {	
							
							// change design
							changeDesign(window);
							
							// get screen name from stream, if not found, this is me
							if(stream.indexOf('screen_name=')>-1) {
								var thisUsersScreenName = stream.substring(stream.indexOf('screen_name=')+12);
								}
							else {
								var thisUsersScreenName = window.loggedIn.screen_name;
								}
													
							profileCardFromFirstObject(profile_data,thisUsersScreenName); // show profile card

							// start checking for new queets again
							window.clearInterval(checkForNewQueetsInterval);
							window.clearInterval(checkForNewNotificationsInterval);							
							checkForNewQueetsInterval=window.setInterval(function(){checkForNewQueets()},window.timeBetweenPolling);
							checkForNewNotificationsInterval=window.setInterval(function(){checkForNewNotifications()},window.timeBetweenPolling);
							checkForNewNotifications();
							
							remove_spinner();				
							$('#feed-body').html(''); // empty feed only now so the scrollers don't flicker on and off
							$('#new-queets-bar').parent().addClass('hidden'); document.title = window.siteTitle; // hide new queets bar if it's visible there
							$('#feed-body').removeAttr('data-search-page-number'); // reset
							addToFeed(user_data, false,'visible'); // add stream items to feed element
							$('#feed').animate({opacity:'1'},150); // fade in
							$('body').removeClass('loading-older');$('body').removeClass('loading-newer');
							actionOnSuccess(); // return
							}
						}
					});
				}
			});
		}

	// if this is a queet stream
	else {
		getFromAPI(stream, function(queet_data){ 
			if(queet_data) {
				// while waiting for this data user might have changed stream, so only proceed if current stream still is this one
				if(window.currentStream == stream) {
					
					// change design
					changeDesign(window);
						
					// show profile card if this is a user's queet stream
					if(stream.substring(0,27) == 'statuses/user_timeline.json')	{
						var thisUsersScreenName = stream.replace('statuses/user_timeline.json','').replace('?screen_name=','').replace('?id=','').replace('?user_id=','');
						profileCardFromFirstObject(queet_data,thisUsersScreenName);
						}
					// show group profile card if this is a group stream
					else if(stream.substring(0,26) == 'statusnet/groups/timeline/'
						 || stream.substring(0,28) == 'statusnet/groups/membership/'
						 || stream.substring(0,24) == 'statusnet/groups/admins/') {
						var thisGroupAlias = stream.substring(stream.lastIndexOf('/')+1, stream.indexOf('.json'));
						groupProfileCard(thisGroupAlias);
						}						
	
					// start checking for new queets again
					window.clearInterval(checkForNewQueetsInterval);
					window.clearInterval(checkForNewNotificationsInterval);							
					checkForNewQueetsInterval=window.setInterval(function(){checkForNewQueets()},window.timeBetweenPolling);
					if(window.currentStream != 'qvitter/statuses/notifications.json') { // don't check for notifications if this is the notifications page
						checkForNewNotifications();
						checkForNewNotificationsInterval=window.setInterval(function(){checkForNewNotifications()},window.timeBetweenPolling);
						}
					else {
						$('#unseen-notifications').hide();	
						document.title = window.siteTitle;											
						}

					remove_spinner();				
					$('#feed-body').html(''); // empty feed only now so the scrollers don't flicker on and off
					$('#new-queets-bar').parent().addClass('hidden'); document.title = window.siteTitle; // hide new queets bar if it's visible there
					addToFeed(queet_data, false,'visible'); // add stream items to feed element
					$('#feed').animate({opacity:'1'},150); // fade in
					$('body').removeClass('loading-older');$('body').removeClass('loading-newer');
					actionOnSuccess(); // return				
					}
				}
			});		
		}	
	}


/* ·  
   · 
   ·   Convert stream to path
   · 
   ·   @param stream: the stream, e.g. 'public_timeline.json'
   ·   @returns: relative path
   · 
   · · · · · · · · · */

function convertStreamToPath(stream) {
	if(stream.substring(0,45) == 'statuses/followers.json?count=20&screen_name=') {
		var screenName = stream.substring(stream.lastIndexOf('=')+1);
		return screenName + '/subscribers';
		}
	else if(stream.substring(0,43) == 'statuses/friends.json?count=20&screen_name=') {
		var screenName = stream.substring(stream.lastIndexOf('=')+1);		
		return screenName + '/subscriptions';
		}
	else if(stream.substring(0,35) == 'statuses/mentions.json?screen_name=') {
		var screenName = stream.substring(stream.indexOf('=')+1);
		return screenName + '/replies';
		}
	else if(stream.substring(0,27) == 'favorites.json?screen_name=') {
		var screenName = stream.substring(stream.indexOf('=')+1);		
		return screenName + '/favorites';
		}	
	else if(stream.substring(0,48) == 'statusnet/groups/list.json?count=10&screen_name=') {
		var screenName = stream.substring(stream.lastIndexOf('=')+1);		
		return screenName + '/groups';
		}		
	else if(stream == 'statuses/followers.json?count=20') {
		return window.loggedIn.screen_name + '/subscribers';
		}
	else if(stream == 'statuses/friends.json?count=20') {
		return window.loggedIn.screen_name + '/subscriptions';
		}
	else if(stream == 'statuses/mentions.json') {
		return window.loggedIn.screen_name + '/replies';
		}
	else if(stream == 'qvitter/statuses/notifications.json') {
		return window.loggedIn.screen_name + '/notifications';
		}
	else if(stream == 'favorites.json') {
		return window.loggedIn.screen_name + '/favorites';
		}						
	else if(stream == 'statusnet/groups/list.json?count=10') {
		return window.loggedIn.screen_name + '/groups';
		}	
	else if (stream.substring(0,27) == 'statuses/user_timeline.json') {
		var screenName = stream.substring(stream.indexOf('=')+1);
		return screenName;		
		}
	else if(stream == 'statuses/friends_timeline.json') {
		return window.loggedIn.screen_name + '/all';
		}
	else if(stream.substring(0,51) == 'statuses/friends_timeline.json?screen_name=') {
		var screenName = stream.substring(stream.indexOf('=')+1);
		return screenName + '/all';
		}		
	else if(stream == 'statuses/public_timeline.json')	{
		return '';
		}
	else if(stream == 'statuses/public_and_external_timeline.json')	{
		return 'main/all';
		}		
	else if(stream.substring(0,26) == 'statusnet/groups/timeline/')	{
		var groupName = stream.substring(stream.lastIndexOf('/')+1,stream.indexOf('.json'));
		return 'group/' + groupName;
		}		
	else if(stream.substring(0,28) == 'statusnet/groups/membership/')	{
		var groupName = stream.substring(stream.lastIndexOf('/')+1,stream.indexOf('.json'));
		return 'group/' + groupName + '/members';
		}		
	else if(stream.substring(0,24) == 'statusnet/groups/admins/')	{
		var groupName = stream.substring(stream.lastIndexOf('/')+1,stream.indexOf('.json'));
		return 'group/' + groupName + '/admins';
		}						
	else if(stream.substring(0,24) == 'statusnet/tags/timeline/')	{
		var tagName = stream.substring(stream.indexOf('/timeline/')+10,stream.indexOf('.json'));
		return 'tag/' + tagName;
		}			
	else if(stream.substring(0,14) == 'statuses/show/')	{
		var noticeId = stream.substring(stream.indexOf('/show/')+6,stream.indexOf('.json'));
		return 'notice/' + noticeId;
		}			
	else if(stream.substring(0,11) == 'search.json')	{
		var searchTerms = stream.substring(stream.indexOf('?q=')+3);
		return 'search/notice?q=' + searchTerms;
		}	
	}


/* ·  
   · 
   ·   Sets the location bar in the browser to correspond with given stream
   · 
   ·   @param stream: the stream, e.g. 'public_timeline.json'
   · 
   · · · · · · · · · */

function setUrlFromStream(stream) {
	history.pushState({strm:stream},'','/' + convertStreamToPath(stream));
	}
	
	
	
/* ·  
   · 
   ·   Get stream from location bar
   · 
   ·   @param stream: the stream, e.g. 'public_timeline.json'
   · 
   · · · · · · · · · */	

function getStreamFromUrl() {
	var loc = window.location.href.replace('http://','').replace('https://','').replace(window.siteRootDomain,'');
	
	// default/fallback
	var streamToSet = 'statuses/public_timeline.json';
	
	// main/all, i.e. full network
	if (loc == '/main/all') {
		streamToSet = 'statuses/public_and_external_timeline.json';
		}

	// {domain}/{screen_name} or {domain}/{screen_name}/
	else if ((/^[a-zA-Z0-9]+$/.test(loc.substring(0, loc.length - 1).replace('/','')))) {
		var userToStream = loc.replace('/','').replace('/','');
		if(userToStream.length>0) {
			streamToSet = 'statuses/user_timeline.json?screen_name=' + userToStream;
			}
		}

	// {domain}/{screen_name}/all
	else if ((/^[a-zA-Z0-9]+$/.test(loc.replace('/','').replace('/all','')))) {
		var userToStream = loc.replace('/','').replace('/all','');
		if(userToStream.length>0) {
			if(window.loggedIn.screen_name == userToStream) {
				streamToSet = 'statuses/friends_timeline.json';					
				}
			else {
				streamToSet = 'statuses/friends_timeline.json?screen_name=' + userToStream;				
				}
			}
		}		

	// {domain}/{screen_name}/replies
	else if ((/^[a-zA-Z0-9]+$/.test(loc.replace('/','').replace('/replies','')))) {
		var userToStream = loc.replace('/','').replace('/replies','');
		if(userToStream.length>0) {
			if(window.loggedIn.screen_name == userToStream) {
				streamToSet = 'statuses/mentions.json';					
				}
			else {
				streamToSet = 'statuses/mentions.json?screen_name=' + userToStream;				
				}
			}
		}

	// {domain}/{screen_name}/notifications
	else if ((/^[a-zA-Z0-9]+$/.test(loc.replace('/','').replace('/notifications','')))) {
		var userToStream = loc.replace('/','').replace('/notifications','');
		if(userToStream.length>0) {
			if(window.loggedIn.screen_name == userToStream) {
				streamToSet = 'qvitter/statuses/notifications.json';					
				}
			else {
				// not allowed for others than logged in user
				window.location.replace(window.siteInstanceURL);
				}
			}
		}

		
	// {domain}/{screen_name}/favorites
	else if ((/^[a-zA-Z0-9]+$/.test(loc.replace('/','').replace('/favorites','')))) {
		var userToStream = loc.replace('/','').replace('/favorites','');
		if(userToStream.length>0) {
			if(window.loggedIn.screen_name == userToStream) {
				streamToSet = 'favorites.json';					
				}
			else {
				streamToSet = 'favorites.json?screen_name=' + userToStream;				
				}
			}
		}		
		
	// {domain}/{screen_name}/subscribers
	else if ((/^[a-zA-Z0-9]+$/.test(loc.replace('/','').replace('/subscribers','')))) {
		var userToStream = loc.replace('/','').replace('/subscribers','');
		if(userToStream.length>0) {
			if(window.loggedIn.screen_name == userToStream) {
				streamToSet = 'statuses/followers.json?count=20';					
				}
			else {
				streamToSet = 'statuses/followers.json?count=20&screen_name=' + userToStream;				
				}
			}
		}	
		
	// {domain}/{screen_name}/subscriptions
	else if ((/^[a-zA-Z0-9]+$/.test(loc.replace('/','').replace('/subscriptions','')))) {
		var userToStream = loc.replace('/','').replace('/subscriptions','');
		if(userToStream.length>0) {
			if(window.loggedIn.screen_name == userToStream) {
				streamToSet = 'statuses/friends.json?count=20';					
				}
			else {
				streamToSet = 'statuses/friends.json?count=20&screen_name=' + userToStream;				
				}
			}
		}	

	// {domain}/{screen_name}/groups
	else if ((/^[a-zA-Z0-9]+$/.test(loc.replace('/','').replace('/groups','')))) {
		var userToStream = loc.replace('/','').replace('/groups','');
		if(userToStream.length>0) {
			if(window.loggedIn.screen_name == userToStream) {
				streamToSet = 'statusnet/groups/list.json?count=10';					
				}
			else {
				streamToSet = 'statusnet/groups/list.json?count=10&screen_name=' + userToStream;				
				}
			}
		}										

	// {domain}/tag/{tag}
	else if (loc.indexOf('/tag/')>-1) {
		var tagToStream = loc.replace('/tag/','');
		if(tagToStream.length>0) {
			streamToSet = 'statusnet/tags/timeline/' + tagToStream + '.json';
			}
		}		

	// {domain}/notice/{notide_id}
	else if (loc.indexOf('/notice/')>-1) {
		var noticeToStream = loc.replace('/notice/','');
		if(noticeToStream.length>0) {
			streamToSet = 'statuses/show/' + noticeToStream + '.json';
			}
		}				


	// {domain}/group/{group}/members, {domain}/group/{group}/admins or {domain}/group/{group}
	else if (loc.indexOf('/group/')>-1) { 
		
		if(loc.indexOf('/members')>-1) {
			var groupToStream = loc.replace('/group/','').replace('/members','');
			if(groupToStream.length>0) {
				streamToSet = 'statusnet/groups/membership/' + groupToStream + '.json?count=20';
				}						
			}
		else if(loc.indexOf('/admins')>-1) {
			var groupToStream = loc.replace('/group/','').replace('/admins','');
			if(groupToStream.length>0) {
				streamToSet = 'statusnet/groups/admins/' + groupToStream + '.json?count=20';
				}			
			}
		else {
			var groupToStream = loc.replace('/group/','');
			if(groupToStream.length>0) {
				streamToSet = 'statusnet/groups/timeline/' + groupToStream + '.json';
				}			
			}
		}	
						
	// {domain}/search/notice?q={urlencoded searh terms}
	else if (loc.indexOf('/search/notice?q=')>-1) {
		var searchToStream = loc.replace('/search/notice?q=','');
		if(searchToStream.length>0) {
			streamToSet = 'search.json?q=' + searchToStream;
			}
		}	
	return streamToSet;		
	}
	

/* ·  
   · 
   ·   Expand/de-expand queet
   · 
   ·   @param q: the stream item to expand
   ·   @param doScrolling: if we should scroll back to position or not
   · 
   · · · · · · · · · */
    
function expand_queet(q,doScrolling) {
	
	doScrolling = typeof doScrolling !== 'undefined' ? doScrolling : true;
	var qid = q.attr('data-quitter-id');
	
	// de-expand if expanded
	if(q.hasClass('expanded') && !q.hasClass('collapsing')) {
		var sel = getSelection().toString();
    	
    	if(!sel 
    	&& !q.find('.queet-button').children('button').hasClass('enabled')
    	&& !q.find('.queet-button').children('button').hasClass('too-long')) { // don't collapse if text is selected, or if queet has an active queet button, or if queet text is too long
			
			// remove some things right away
			q.find('.inline-reply-caret').remove();
			
			q.addClass('collapsing');
			q.css('overflow','hidden');
			q.find('.stream-item-expand').html(window.sL.expand);
			if(q.hasClass('conversation')) {
				q.removeClass('expanded');	         
				q.removeClass('collapsing');				
				q.find('.view-more-container-top').remove();
				q.find('.view-more-container-bottom').remove();
				q.find('.stream-item.conversation').remove();
				q.find('.inline-reply-queetbox').remove();
				q.find('.expanded-content').remove();				
				}
			else {
				rememberMyScrollPos(q.children('.queet'),qid,0);	
				
				// give stream item a height
				q.css('height',q.height() + 'px');
				q.children('.queet').find('.expanded-content').css('height',q.find('.expanded-content').height() + 'px');							
				
				q.children('div').not('.queet').children('a').css('opacity','0.5');
				q.children('div').not('.queet').children().children().css('opacity','0.5');

				var collapseTime = 350 + q.find('.stream-item.conversation:not(.hidden-conversation)').length*50;
				
				// set transition time (needs to be delayed, otherwise webkit animates the height-setting above)
 				setTimeout(function() {				
					q.children('.queet').css('-moz-transition-duration',Math.round( collapseTime / 1000 * 10) / 10 + 's');
					q.children('.queet').css('-o-transition-duration',Math.round( collapseTime / 1000 * 10) / 10 + 's');
					q.children('.queet').css('-webkit-transition-duration',Math.round( collapseTime * 1000 * 10) / 10 + 's');
					q.children('.queet').css('transition-duration',Math.round( collapseTime / 1000 * 10) / 10 + 's');
					q.css('-moz-transition-duration',Math.round( collapseTime / 1000 * 10) / 10 + 's');
					q.css('-o-transition-duration',Math.round( collapseTime / 1000 * 10) / 10 + 's');
					q.css('-webkit-transition-duration',Math.round( collapseTime * 1000 * 10) / 10 + 's');
					q.css('transition-duration',Math.round( collapseTime / 1000 * 10) / 10 + 's');
					q.find('.expanded-content').css('-moz-transition-duration',Math.round( collapseTime / 1000 * 10) / 10 + 's');
					q.find('.expanded-content').css('-o-transition-duration',Math.round( collapseTime / 1000 * 10) / 10 + 's');
					q.find('.expanded-content').css('-webkit-transition-duration',Math.round( collapseTime * 1000 * 10) / 10 + 's');
					q.find('.expanded-content').css('transition-duration',Math.round( collapseTime / 1000 * 10) / 10 + 's');					

					// set new heights and margins to animate to
					q.css('height',(q.children('.queet').find('.queet-content').outerHeight() - q.children('.queet').find('.expanded-content').outerHeight()) + 'px');
					q.children('.queet').css('margin-top', '-' + (q.children('.queet').offset().top - q.offset().top) + 'px');					
					q.children('.queet').find('.expanded-content').css('height','0');

 					}, 50);				
				
				setTimeout(function() {
					q.css('height','auto');
					q.children('.queet').css('margin-top','0');
					q.removeClass('expanded');
					q.removeClass('collapsing');	
					q.find('.expanded-content').remove();	
					q.find('.view-more-container-top').remove();
					q.find('.view-more-container-bottom').remove();
					q.find('.inline-reply-queetbox').remove();																																							
					q.find('.stream-item.conversation').remove();					
					q.removeAttr('style');			
					q.children('.queet').removeAttr('style');							
					}, collapseTime+500);

				
				
				if(doScrolling) {
					backToMyScrollPos(q,qid,collapseTime);
					}
   								
				}    	    
	    	}
		}
	else if(!q.hasClass('collapsing')) {
		
		rememberMyScrollPos(q,qid,-8);
		
		// not for acitivity or notifications
		if(!q.hasClass('activity') && !q.hasClass('repeat') && !q.hasClass('like') && !q.hasClass('follow')) {
		
			q.addClass('expanded');		
			q.find('.stream-item-expand').html(window.sL.collapse);
				
			// if shortened queet, get full text (not if external)
			if(!q.hasClass('external-conversation')) {
				if(q.children('.queet').find('span.attachment.more').length>0) {
					var attachmentId = q.children('.queet').find('span.attachment.more').attr('data-attachment-id');
					getFromAPI("attachment/" + attachmentId + ".json",function(data){
						if(data) {
							console.log(data);
							q.children('.queet').find('.queet-text').html($.trim(data.replace(/@<a href="/gi,'<a href="').replace(/!<a href="/gi,'<a href="').replace(/@<span class="vcard">/gi,'<span class="vcard">').replace(/!<span class="vcard">/gi,'<span class="vcard">').replace(/#<span class="tag">/gi,'<span class="tag">').replace(/&#64;<span class="vcard">/gi,'<span class="vcard">').replace(/@<span class="vcard">/gi,'<span class="vcard">').replace(/!<span class="vcard">/gi,'<span class="vcard">').replace(/#<span class="tag">/gi,'<span class="tag">')));
							}
						});					
					}
				}

			// add expanded container
			var longdate = parseTwitterLongDate(q.find('.created-at').attr('data-created-at'));
			var qurl = q.find('.created-at').find('a').attr('href');
			
			var metadata = '<span class="longdate" title="' + longdate + '">' + longdate + ' · ' + unescape(q.attr('data-source')) + '</span> · <a href="' + qurl + '" class="permalink-link">' + window.sL.details + '</a>';
			
			// show expanded content
			q.find('.stream-item-footer').before('<div class="expanded-content"><div class="queet-stats-container"></div><div class="client-and-actions"><span class="metadata">' + metadata + '</span></div></div>');					
	
			
			// maybe show images or videos
			$.each($('#' + q.children('.queet').attr('id') + ' .queet-text, #' + q.children('.queet').attr('id') + ' > .attachments').find('a'), function() {
				var attachment_title = $(this).attr('title');
				
				console.log('attachment: ' + attachment_title);
				
				// attachments in the .attachments container don't have a title, their full url is in the href
				if(typeof attachment_title == 'undefined') {
					attachment_title = $(this).attr('href');					
					}

				// attachments in the content link to /attachment/etc url and not direct to image/video, link is in title
				if(typeof attachment_title != 'undefined') {
					// images
					if(attachment_title.substr(attachment_title.length - 5) == '.jpeg' ||
					   attachment_title.substr(attachment_title.length - 4) == '.png' ||
					   attachment_title.substr(attachment_title.length - 4) == '.gif' ||
					   attachment_title.substr(attachment_title.length - 4) == '.jpg') {
						if(q.children('.queet').find('.expanded-content').children('.media').children('a').attr('href') != attachment_title) { // not if already showed
							q.children('.queet').find('.expanded-content').prepend('<div class="media"><a href="' + attachment_title + '" target="_blank"><img src="' + attachment_title + '" /></a></div>');
							}
						}
					// videos
					else if(attachment_title.indexOf('youtube.com/watch?v=') > -1 || attachment_title.indexOf('://youtu.be/') > -1) {
						var youtubeId = attachment_title.replace('http://www.youtube.com/watch?v=','').replace('https://www.youtube.com/watch?v=','').replace('http://youtu.be/','').replace('https://youtu.be/','').substr(0,11);
						if(q.children('.queet').find('.expanded-content').children('.media').children('iframe').attr('src') != '//www.youtube.com/embed/' + youtubeId) { // not if already showed
							q.children('.queet').find('.expanded-content').prepend('<div class="media"><iframe width="420" height="315" src="//www.youtube.com/embed/' + youtubeId + '" frameborder="0" allowfullscreen></iframe></div>');						
							}
						}
					}
				});
			
			// get favs and rq:s (not if external) (and only if logged in because API demands that)
			if(!q.hasClass('external-conversation') && window.loggedIn) {
				
				// get and show favs
				getFavsOrRequeetsForQueet('favs',qid,function(favs){
					if(favs) {
						if(q.hasClass('expanded') && !q.hasClass('collapsing')) {
							showFavsOrRequeetsInQueet(q,favs,'favs');
							}
						}
					});	

				// get and show requeets
				getFavsOrRequeetsForQueet('retweets',qid,function(requeets){
					if(requeets) {
						if(q.hasClass('expanded') && !q.hasClass('collapsing')) {
							showFavsOrRequeetsInQueet(q,requeets,'requeets');
							}
						}
					});								
				}		
								
			// show conversation and reply form (but not if already in conversation)
			if(!q.hasClass('conversation')) {
				
				// show conversation
				showConversation(qid);	
				
				// show inline reply form if logged in
				if(typeof window.loggedIn.screen_name != 'undefined') {			
					q.find('#q-' + qid).append(replyFormHtml(q,qid));	
					}
							
				}			
			}
		}
	}	
	
	




/* ·  
   · 
   ·   Get an inline queet box
   · 
   ·   @return the html for the queet box
   ·
   · · · · · · · · · */
    
function queetBoxHtml() {
	var startText = encodeURIComponent(window.sL.compose);
	return '<div class="inline-reply-queetbox"><div class="queet-box queet-box-syntax" data-start-text="' + startText + '">' + decodeURIComponent(startText) + '</div><div class="syntax-middle"></div><div class="syntax-two" contenteditable="true"></div><div class="mentions-suggestions"></div><div class="queet-toolbar toolbar-reply"><div class="queet-box-extras"><button class="shorten disabled"><i></i></button></div><div class="queet-button"><span class="queet-counter"></span><button>' + window.sL.queetVerb + '</button></div></div></div>';	
	}
	
	

/* ·  
   · 
   ·   Get a reply form
   · 
   ·   @param q: the stream item to open reply form in
   ·   @param qid: queet id
   ·   @return the html for the reply form
   ·
   · · · · · · · · · */
    
function replyFormHtml(q,qid) {
	// get all @:s
	var user_screen_name = q.children('.queet').find('.screen-name').html().substring(1);
	var user_screen_name_html = '<a>@' + user_screen_name + '</a>';
	var user_screen_name_text = '@' + user_screen_name;	
	var reply_to_screen_name = '';
	var reply_to_screen_name_html = '';			
	var reply_to_screen_name_text = '';				
	if(q.attr('data-in-reply-to-screen-name').length>0 // not if not a reply
	&& q.attr('data-in-reply-to-screen-name') != $('#user-screen-name').html() // not if it's me
	&& q.attr('data-in-reply-to-screen-name') != user_screen_name // not same screen name twice
		) {
		reply_to_screen_name = q.attr('data-in-reply-to-screen-name');				
		reply_to_screen_name_html = '&nbsp;<a>@' + reply_to_screen_name + '</a>';				
		reply_to_screen_name_text = ' @' + reply_to_screen_name;						
		}
	var more_reply_tos = '';
	var more_reply_tos_text = '';	
	$.each(q.children('.queet').find('.queet-text').find('.mention'),function(key,obj){
		if($(obj).html() != user_screen_name && $(obj).html() != reply_to_screen_name && $(obj).html() != $('#user-screen-name').html()) {
			more_reply_tos = more_reply_tos + '&nbsp;<a>@' + $(obj).html() + '</a>';
			more_reply_tos_text = more_reply_tos_text + ' @' + $(obj).html();			
			}
		});
	
	var startText = encodeURIComponent(window.sL.replyTo + ' ' + user_screen_name_html + reply_to_screen_name_html + more_reply_tos + '&nbsp;<br>');
	var repliesText = encodeURIComponent(user_screen_name_text + reply_to_screen_name_text + more_reply_tos_text + '&nbsp;&nbsp;');	
	return '<div class="inline-reply-queetbox"><span class="inline-reply-caret"><span class="caret-inner"></span></span><img class="reply-avatar" src="' + $('#user-avatar').attr('src') + '" /><div class="queet-box queet-box-syntax" id="queet-box-' + qid + '" data-start-text="' + startText + '" data-replies-text="' + repliesText + '">' + decodeURIComponent(startText) + '</div><div class="syntax-middle"></div><div class="syntax-two" contenteditable="true"></div><div class="mentions-suggestions"></div><div class="queet-toolbar toolbar-reply"><div class="queet-box-extras"><button class="shorten disabled"><i></i></button></div><div class="queet-button"><span class="queet-counter"></span><button>' + window.sL.queetVerb + '</button></div></div></div>';	
	}
	

/* · 
   · 
   ·   Popup for replies, deletes, etc
   · 
   ·   @param popupId: popups id
   ·   @param heading: popops header
   ·   @param bodyHtml: popups body html      
   ·   @param footerHtml: popups footer html       
   ·   
   · · · · · · · · · · · · · */ 

function popUpAction(popupId, heading, bodyHtml, footerHtml){
	var allFooterHtml = '';
	if(footerHtml) {
		allFooterHtml = '<div class="modal-footer">' + footerHtml + '</div>';
		}
	$('body').prepend('<div id="' + popupId + '" class="modal-container"><div class="modal-draggable"><div class="modal-content"><button class="modal-close" type="button"><span class="icon"></span></button><div class="modal-header"><h3 class="modal-title">' + heading + '</h3></div><div class="modal-body">' + bodyHtml + '</div>' + allFooterHtml + '</div></div></div>');	
	var this_modal_height = $('#' + popupId).children('.modal-draggable').height();
	var this_modal_width = $('#' + popupId).children('.modal-draggable').width();
	var popupPos = $('#' + popupId).children('.modal-draggable').offset().top - $(window).scrollTop();
	if((popupPos-(this_modal_height/2))<5) {
		var marginTop = 5-popupPos;
		}
	else {
		var marginTop = 0-this_modal_height/2;
		}
	$('#' + popupId).children('.modal-draggable').css('margin-top', marginTop + 'px');
	$('#' + popupId).children('.modal-draggable').css('margin-left', '-' + (this_modal_width/2) + 'px');		
	$('#' + popupId).children('.modal-draggable').draggable({ handle: ".modal-header" });
	$('#' + popupId).children('.modal-header').disableSelection();
	}	
	
	


/* · 
   · 
   ·  Gnu social don't use url as uri anymore, we need to handle both cases	
   ·
   · · · · · · · · · · · · · */ 	
  
function convertNewGNUSocialURItoURL(obj) {

	if(obj.uri.substring(0,4) != 'http') {									
		
		// guess the url if we only have the non-url uri
		if(typeof obj.url == 'undefined') {							
			var httpOrHttps = obj.user.statusnet_profile_url.substring(0,obj.user.statusnet_profile_url.indexOf('://'));
			obj.uri = httpOrHttps + '://' + obj.uri.substring(4,obj.uri.indexOf(',')) + '/notice/' + obj.uri.substring(obj.uri.indexOf('noticeId=')+9,obj.uri.indexOf(':objectType'));
			}
		
		// if an url record is present, use that
		else {
			obj.uri = obj.url;
			}
		}
	return obj;
	}
	
	
	
/* · 
   · 
   ·  Show conversation
   ·   
   ·  This function has grown into a monster, needs fixing  
   ·
   · · · · · · · · · · · · · */ 	
  
function showConversation(qid) {
	
	display_spinner();
			
	// get conversation	
	getFromAPI('statusnet/conversation/' + $('#stream-item-' + qid).attr('data-conversation-id') + '.json?count=100', function(data){ if(data) { 

		if(data && !$('#stream-item-' + qid).hasClass('collapsing')){		
			// we have local conversation
			if(data.length>1) {
				var before_or_after = 'after';
				$.each(data, function (key,obj) {
					
					// switch to append after original queet
					if(obj.id == qid) {	
						before_or_after = 'before';
						}
					
					// don't add clicked queet to DOM, but all else
					// note: first we add the full conversation, but hidden
					if(obj.id != qid) {
						var queetTime = parseTwitterDate(obj.created_at);															
	
						// we don't want to print 'null', someone might have that username!
						var in_reply_to_screen_name = '';
						if(obj.in_reply_to_screen_name != null) {
							in_reply_to_screen_name = obj.in_reply_to_screen_name;
							}
						
						// requeet or delete html
						var requeetedClass = '';
						if(obj.user.id == window.myUserID) {
							var requeetHtml = '<li class="action-del-container"><a class="with-icn"><span class="icon sm-trash"></span> <b>' + window.sL.deleteVerb + '</b></a></li>';
							}
						else if(obj.repeated) {
							var requeetHtml = '<li class="action-rt-container"><a class="with-icn done"><span class="icon sm-rt"></span> <b>' + window.sL.requeetedVerb + '</b></a></li>';
							requeetedClass = 'requeeted';
							}
						else {
							var requeetHtml = '<li class="action-rt-container"><a class="with-icn"><span class="icon sm-rt"></span> <b>' + window.sL.requeetVerb + '</b></a></li>';
							}
						// favorite html
						var favoritedClass = '';
						if(obj.favorited) {
							var favoriteHtml = '<a class="with-icn done"><span class="icon sm-fav"></span> <b>' + window.sL.favoritedVerb + '</b></a>';
							favoritedClass = 'favorited'; 
							}
						else {
							var favoriteHtml = '<a class="with-icn"><span class="icon sm-fav"></span> <b>' + window.sL.favoriteVerb + '</b></a>';
							}							
							
						// actions only for logged in users
						var queetActions = '';
						if(typeof window.loggedIn.screen_name != 'undefined') {			
							queetActions = '<ul class="queet-actions"><li class="action-reply-container"><a class="with-icn"><span class="icon sm-reply"></span> <b>' + window.sL.replyVerb + '</b></a></li>' +  requeetHtml + '<li class="action-fav-container">' + favoriteHtml + '</li></ul>';
							}

						// reply-to html
						var reply_to_html = '';							
						if(obj.in_reply_to_screen_name != null && obj.in_reply_to_screen_name != obj.user.screen_name) {
							reply_to_html = '<span class="reply-to">@' + obj.in_reply_to_screen_name + '</span> ';
							}

						// in-groups html
						var in_groups_html = '';							
						if(obj.statusnet_in_groups !== false && typeof obj.statusnet_in_groups != 'undefined') {
							in_groups_html = '<span class="in-groups">' + obj.statusnet_in_groups + '</span>';
							}								

						obj = convertNewGNUSocialURItoURL(obj);
												
						if(obj.source == 'activity') {
							var queetHtml = '<div id="conversation-stream-item-' + obj.id + '" class="stream-item conversation activity hidden-conversation" data-source="' + escape(obj.source) + '" data-quitter-id="' + obj.id + '"  data-quitter-id-in-stream="' + obj.id + '"><div class="queet" id="conversation-q-' + obj.id + '"><span class="dogear"></span><div class="queet-content"><div class="stream-item-header"><small class="created-at" data-created-at="' + obj.created_at + '"><a>' + queetTime + '</a></small></div><div class="queet-text">' + $.trim(obj.statusnet_html) + '</div></div></div></div>';
							}
						else {
							var queetHtml = '<div id="conversation-stream-item-' + obj.id + '" class="stream-item conversation hidden-conversation ' + requeetedClass + ' ' + favoritedClass + '" data-source="' + escape(obj.source) + '" data-quitter-id="' + obj.id + '" data-conversation-id="' + obj.statusnet_conversation_id + '" data-quitter-id-in-stream="' + obj.id + '" data-in-reply-to-screen-name="' + in_reply_to_screen_name + '" data-in-reply-to-status-id="' + obj.in_reply_to_status_id + '"><div class="queet" id="conversation-q-' + obj.id + '"><span class="dogear"></span><div class="queet-content"><div class="stream-item-header"><a class="account-group" href="' + obj.user.statusnet_profile_url + '"><img class="avatar" src="' + obj.user.profile_image_url_profile_size + '" /><strong class="name" data-user-id="' + obj.user.id + '">' + obj.user.name + '</strong> <span class="screen-name">@' + obj.user.screen_name + '</span></a><i class="addressees">' + reply_to_html + in_groups_html + '</i><small class="created-at" data-created-at="' + obj.created_at + '"><a href="' + obj.uri + '">' + queetTime + '</a></small></div><div class="queet-text">' + $.trim(obj.statusnet_html) + '</div><div class="stream-item-footer">' + queetActions + '<span class="stream-item-expand">' + window.sL.expand + '</span></div></div></div></div>';				
							}						
						
						// detect rtl
						queetHtml = detectRTL(queetHtml);						
						
						if($('#stream-item-' + qid).hasClass('expanded')) { // add queet to conversation only if still expanded
							if(before_or_after == 'before') {
								$('#stream-item-' + qid).prepend(queetHtml);
								}
							else {
								$('#q-' + qid).after(queetHtml);
								}
								
							}
						}
					remove_spinner();	
					convertAttachmentMoreHref();						
					});
				}
	
			// try to get conversation from external instance
			else if(typeof data[0] != 'undefined') {
				if(data[0].source == 'ostatus') {
					var external_status_url = data[0].uri.replace('notice','api/statuses/show') + '.json';					
					var external_base_url = data[0].uri.substring(0,data[0].uri.indexOf('/notice/'));
					$.ajax({ url: external_status_url, type: "GET", dataType: "jsonp", success: function(data) { // try to get conversation id fro notice
						var external_id = data.id;
						if(typeof data.statusnet_conversation_id == 'undefined') {
							console.log(data);remove_spinner();
							}
						else { // proceed if we got a conversation_id
							$.ajax({ url: external_base_url + '/api/statusnet/conversation/' + data.statusnet_conversation_id + ".json?count=100", type: "GET", dataType: "jsonp", success: function(data) { 				
								var before_or_after = 'after';
								$.each(data, function (key,obj) {
									
									// switch to append after original queet
									if(obj.id == external_id) {	
										before_or_after = 'before';
										$('#stream-item-' + qid).attr('data-in-reply-to-status-id',obj.in_reply_to_status_id);
										}
									else {
										var queetTime = parseTwitterDate(obj.created_at);															
					
										// we don't want to print 'null', someone might have that username!
										var in_reply_to_screen_name = '';
										if(obj.in_reply_to_screen_name != null) {
											in_reply_to_screen_name = obj.in_reply_to_screen_name;
											}

										// reply-to html
										var reply_to_html = '';							
										if(obj.in_reply_to_screen_name != null && obj.in_reply_to_screen_name != obj.user.screen_name) {
											reply_to_html = '<span class="reply-to">@' + obj.in_reply_to_screen_name + '</span> ';
											}
										
										obj = convertNewGNUSocialURItoURL(obj);
										
										if(obj.source == 'activity') {
											var queetHtml = '<div id="conversation-stream-item-' + obj.id + '" class="stream-item conversation activity hidden-conversation external-conversation" data-source="' + escape(obj.source) + '" data-quitter-id="' + obj.id + '"  data-quitter-id-in-stream="' + obj.id + '"><div class="queet" id="conversation-q-' + obj.id + '"><span class="dogear"></span><div class="queet-content"><div class="stream-item-header"><small class="created-at" data-created-at="' + obj.created_at + '"><a href="' + external_base_url + '/notice/' + obj.id + '">' + queetTime + '</a></small></div><div class="queet-text">' + $.trim(obj.statusnet_html) + '</div></div></div></div>';
											}
										else {
											var queetHtml = '<div id="conversation-stream-item-' + obj.id + '" class="stream-item conversation hidden-conversation external-conversation" data-external-base-url="' + escape(external_base_url) + '" data-source="' + escape(obj.source) + '" data-quitter-id="' + obj.id + '" data-conversation-id="' + obj.statusnet_conversation_id + '" data-quitter-id-in-stream="' + obj.id + '" data-in-reply-to-screen-name="' + in_reply_to_screen_name + '" data-in-reply-to-status-id="' + obj.in_reply_to_status_id + '"><div class="queet" id="conversation-q-' + obj.id + '"><span class="dogear"></span><div class="queet-content"><div class="stream-item-header"><a class="account-group" href="' + obj.user.statusnet_profile_url + '"><img class="avatar" src="' + obj.user.profile_image_url_profile_size + '" /><strong class="name" data-user-id="' + obj.user.id + '">' + obj.user.name + '</strong> <span class="screen-name">@' + obj.user.screen_name + '</span></a>' + reply_to_html + '<small class="created-at" data-created-at="' + obj.created_at + '"><a href="' + external_base_url + '/notice/' + obj.id + '">' + queetTime + '</a></small></div><div class="queet-text">' + $.trim(obj.statusnet_html) + '</div><div class="stream-item-footer"><ul class="queet-actions"><li class="action-reply-container">&nbsp;</li></ul><span class="stream-item-expand">' + window.sL.expand + '</span></div></div></div></div>';				
											}
										
										// detect rtl
										queetHtml = detectRTL(queetHtml);						
										
										if($('#stream-item-' + qid).hasClass('expanded')) { // add queet to conversation only if still expanded
											if(before_or_after == 'before') {
												$('#stream-item-' + qid).prepend(queetHtml);
												}
											else {
												$('#q-' + qid).after(queetHtml);
												}		
											}
										}	
									remove_spinner();	
									convertAttachmentMoreHref();
									});							
								findInReplyToStatusAndShow(qid,$('#stream-item-' + qid).attr('data-in-reply-to-status-id'),true,false);
								backToMyScrollPos($('#q-' + qid),qid,false);
								}, error: function(data) { console.log(data);remove_spinner(); }});							
							}
						}, error: function(data) { console.log(data);remove_spinner(); }});							
					}
				// no conversation
				else {
					remove_spinner();
					}
				}
			else {
				remove_spinner();
				}
			
			// loop trough this stream items conversation and show the "strict" line of replies
			findInReplyToStatusAndShow(qid,$('#stream-item-' + qid).attr('data-in-reply-to-status-id'),true,false);
			backToMyScrollPos($('#q-' + qid),qid,false);						
			}
		else {
			remove_spinner();
			}	
		}});	
	}
	


/* · 
   · 
   ·  Recursive walker functions to view onlt reyplies to replies, not full conversation
   ·
   · · · · · · · · · · · · · */ 	
  	
function findInReplyToStatusAndShow(qid,reply,only_first,onlyINreplyto) {
	var reply_found = $('#stream-item-' + qid).find('.stream-item[data-quitter-id="' + reply + '"]');
	var reply_found_reply_to = $('#stream-item-' + qid).find('.stream-item[data-quitter-id="' + reply_found.attr('data-in-reply-to-status-id') + '"]');	
	if(reply_found.length>0) {
		reply_found.removeClass('hidden-conversation');
		//reply_found.animate({opacity:'1'},500);
		reply_found.css('opacity','1');
		if(only_first && reply_found_reply_to.length>0) {
			reply_found.before('<div class="view-more-container-top" data-trace-from="' + reply + '"><a>' + window.sL.viewMoreInConvBefore + '</a></div>');			
			findReplyToStatusAndShow(qid,qid,true);
			}
		else {
			findInReplyToStatusAndShow(qid,reply_found.attr('data-in-reply-to-status-id'),false,onlyINreplyto);							
			}
		}
	else if(!onlyINreplyto) {
		findReplyToStatusAndShow(qid,qid,true);
		}
	else {
		checkForHiddenConversationQueets(qid);		
		}		
	}
// recursive function to find the replies to a status
function findReplyToStatusAndShow(qid,this_id,only_first) {
	var reply_found = $('#stream-item-' + qid).find('.stream-item[data-in-reply-to-status-id="' + this_id + '"]');
	var reply_founds_reply = $('#stream-item-' + qid).find('.stream-item[data-in-reply-to-status-id="' + reply_found.attr('data-quitter-id') + '"]');
	if(reply_found.length>0) {
		reply_found.removeClass('hidden-conversation');
// 		reply_found.animate({opacity:'1'},0,function(){
// 			if(!only_first) {
// 				findReplyToStatusAndShow(qid,$(this).attr('data-quitter-id'),false);
// 				}			
// 			});
		reply_found.css('opacity','1');
		if(!only_first) {
			findReplyToStatusAndShow(qid,$(this).attr('data-quitter-id'),false);
			}					
		if(only_first && reply_founds_reply.length>0) {
			reply_found.last().after('<div class="view-more-container-bottom" data-replies-after="' + qid + '"><a>' + window.sL.viewMoreInConvAfter + '</a></div>');			
			}
		}
	checkForHiddenConversationQueets(qid);	
	}

// helper function for the above recursive functions
function checkForHiddenConversationQueets(qid) {
	// here we check if there are any remaining hidden queets in conversation, if there are, we put a "show full conversation"-link
	if($('#stream-item-' + qid).find('.hidden-conversation').length>0) {
		if($('#stream-item-' + qid).children('.queet').find('.show-full-conversation').length == 0) {
			$('#stream-item-' + qid).children('.queet').find('.metadata').append('<span class="show-full-conversation" data-stream-item-id="' + qid + '">' + window.sL.expandFullConversation + '</span>');							
			}
		}
	else {
		$('#stream-item-' + qid).children('.queet').find('.show-full-conversation').remove();
		}		
	}
	
	
/* · 
   · 
   ·   Build stream items and add them to feed
   ·
   ·   Also a function that has grown out of control... Needs total makeover
   ·
   · · · · · · · · · · · · · */ 	
  	
function addToFeed(feed, after, extraClasses, isReply) {
	
	// some streams, e.g. /statuses/show/1234.json is not enclosed in an array, make sure it is
	if(!$.isArray(feed)) {
		feed = [feed];		
		}
		
	$.each(feed.reverse(), function (key,obj) {
		
		var extraClassesThisRun = extraClasses;			

		// if this is the notifications feed, but not if it is a reply
		if(window.currentStream.substring(0,35) == 'qvitter/statuses/notifications.json'
		&& !isReply) {					
			
			
			// only if this notification isn't already in stream
			if($('#stream-item-' + obj.id).length == 0) {		
				
				obj.from_profile.description = obj.from_profile.description || '';
				var notificationTime = parseTwitterDate(obj.created_at);						
				
				if(obj.is_seen == '0') {
					extraClassesThisRun = extraClassesThisRun + ' not-seen'
					}
								
				if(obj.ntype == 'like') {	
					var noticeTime = parseTwitterDate(obj.notice.created_at);
					obj.notice = convertNewGNUSocialURItoURL(obj.notice);
					var notificationHtml = '<div data-quitter-id-in-stream="' + obj.id + '" id="stream-item-n-' + obj.id + '" class="stream-item ' + extraClassesThisRun + ' notification like"><div class="queet"><div class="queet-content"><div class="stream-item-header"><small class="created-at" data-created-at="' + obj.created_at + '" title="' + obj.created_at + '">' + notificationTime + '</small><a class="account-group" href="' + obj.from_profile.statusnet_profile_url + '"><span class="dogear"></span><img class="avatar" src="' + obj.from_profile.profile_image_url + '" /><strong class="name" data-user-id="' + obj.from_profile.id + '" title="@' + obj.from_profile.screen_name + '">' + obj.from_profile.name + '</strong></a> ' + window.sL.xFavedYourQueet + '</div><div class="small-grey-notice"><a href="' + obj.notice.uri + '">' + noticeTime + '</a>: ' + $.trim(obj.notice.statusnet_html) + '</div></div></div></div>';
					}
				else if(obj.ntype == 'repeat') {	
					obj.notice = convertNewGNUSocialURItoURL(obj.notice);
					var noticeTime = parseTwitterDate(obj.notice.created_at);
					var notificationHtml = '<div data-quitter-id-in-stream="' + obj.id + '" id="stream-item-n-' + obj.id + '" class="stream-item ' + extraClassesThisRun + ' notification repeat"><div class="queet"><div class="queet-content"><div class="stream-item-header"><small class="created-at" data-created-at="' + obj.created_at + '" title="' + obj.created_at + '">' + notificationTime + '</small><a class="account-group" href="' + obj.from_profile.statusnet_profile_url + '"><span class="dogear"></span><img class="avatar" src="' + obj.from_profile.profile_image_url + '" /><strong class="name" data-user-id="' + obj.from_profile.id + '" title="@' + obj.from_profile.screen_name + '">' + obj.from_profile.name + '</strong></a> ' + window.sL.xRepeatedYourQueet + '</div><div class="small-grey-notice"><a href="' + obj.notice.uri + '">' + noticeTime + '</a>: ' + $.trim(obj.notice.statusnet_html) + '</div></div></div></div>';
					}
				else if(obj.ntype == 'mention') {	
					var notificationHtml = buildQueetHtml(obj.notice, obj.id, extraClassesThisRun + ' notification mention');
					}				 
				else if(obj.ntype == 'reply') {	
					var notificationHtml = buildQueetHtml(obj.notice, obj.id, extraClassesThisRun + ' notification reply');
					}				 		
				else if(obj.ntype == 'follow') {	
					var notificationHtml = '<div data-quitter-id-in-stream="' + obj.id + '" id="stream-item-n-' + obj.id + '" class="stream-item ' + extraClassesThisRun + ' notification follow"><div class="queet"><div class="queet-content"><div class="stream-item-header"><small class="created-at" data-created-at="' + obj.created_at + '" title="' + obj.created_at + '">' + notificationTime + '</small><a class="account-group" href="' + obj.from_profile.statusnet_profile_url + '"><img class="avatar" src="' + obj.from_profile.profile_image_url + '" /><strong class="name" data-user-id="' + obj.from_profile.id + '" title="@' + obj.from_profile.screen_name + '">' + obj.from_profile.name + '</strong></a> ' + window.sL.xStartedFollowingYou + '</div></div></div></div>';
					}				 										
				
				if(after) {
					$('#' + after).after(notificationHtml);							
					}
				else {
					$('#feed-body').prepend(notificationHtml);										
					}
					
				// add not seen notification circle
				$.each($('.notification.not-seen .queet'),function(){
					if($(this).children('.not-seen').length<1) {
						$(this).prepend('<div class="not-seen"></div>');
						}
					});
				}
			}

		// if this is a user feed
		else if(window.currentStream.substring(0,21) == 'statuses/friends.json'
		|| window.currentStream.substring(0,18) == 'statuses/followers'
		|| window.currentStream.substring(0,28) == 'statusnet/groups/membership/'
		|| window.currentStream.substring(0,24) == 'statusnet/groups/admins/') {					
			
			
			// only if not user is already in stream
			if($('#stream-item-' + obj.id).length == 0) {			
				
				obj.description = obj.description || '';
				
				// show user actions
				var followingClass = '';
				if(obj.following) {
					followingClass = 'following';
					}			
				var followButton = '';
				if(typeof window.loggedIn.screen_name != 'undefined'  	// if logged in
				   && window.myUserID != obj.id) {	// not if this is me	
					if(!(obj.statusnet_profile_url.indexOf('/twitter.com/')>-1 && obj.following === false)) { // only unfollow twitter users	
						var followButton = '<div class="user-actions"><button data-follow-user-id="' + obj.id + '" data-follow-user="' + obj.statusnet_profile_url + '" type="button" class="follow-button ' + followingClass + '"><span class="button-text follow-text"><i class="follow"></i>' + window.sL.userFollow + '</span><span class="button-text following-text">' + window.sL.userFollowing + '</span><span class="button-text unfollow-text">' + window.sL.userUnfollow + '</span></button></div>';	
						}
					}
				
				var userHtml = '<div id="stream-item-' + obj.id + '" class="stream-item user"><div class="queet">' + followButton + '<div class="queet-content"><div class="stream-item-header"><a class="account-group" href="' + obj.statusnet_profile_url + '"><img class="avatar" src="' + obj.profile_image_url_profile_size + '" /><strong class="name" data-user-id="' + obj.id + '">' + obj.name + '</strong> <span class="screen-name">@' + obj.screen_name + '</span></a></div><div class="queet-text">' + obj.description + '</div></div></div></div>';
				
				if(after) {
					$('#' + after).after(userHtml);							
					}
				else {
					$('#feed-body').prepend(userHtml);										
					}
				}
			}
			
		// if this is a list of groups
		else if(window.currentStream.substring(0,26) == 'statusnet/groups/list.json') {

			// only if not group is already in stream
			if($('#stream-item-' + obj.id).length == 0) {			
	
				obj.description = obj.description || '';
				obj.stream_logo = obj.stream_logo || window.fullUrlToThisQvitterApp + 'img/default-avatar-profile.png';
	
				// show group actions if logged in
				var memberClass = '';
				if(obj.member) {
					memberClass = 'member';
					}			
				var memberButton = '';
				if(typeof window.loggedIn.screen_name != 'undefined') {			
					console.log(obj);
					var memberButton = '<div class="user-actions"><button data-group-id="' + obj.id + '" type="button" class="member-button ' + memberClass + '"><span class="button-text join-text"><i class="join"></i>' + window.sL.joinGroup + '</span><span class="button-text ismember-text">' + window.sL.isMemberOfGroup + '</span><span class="button-text leave-text">' + window.sL.leaveGroup + '</span></button></div>';	
					}			
				var groupAvatar = obj.stream_logo;
				if(obj.homepage_logo != null) {
					groupAvatar = obj.homepage_logo;
					}
				var groupHtml = '<div id="stream-item-' + obj.id + '" class="stream-item user"><div class="queet">' + memberButton + '<div class="queet-content"><div class="stream-item-header"><a class="account-group" href="' + obj.url + '"><img class="avatar" src="' + groupAvatar + '" /><strong class="name" data-group-id="' + obj.id + '">' + obj.fullname + '</strong> <span class="screen-name">!' + obj.nickname + '</span></a></div><div class="queet-text">' + obj.description + '</div></div></div></div>';
	
				if(after) {
					$('#' + after).after(groupHtml);							
					}
				else {
					$('#feed-body').prepend(groupHtml);										
					}					
				}
			}			

		// if this is a retweet
		else if(typeof obj.retweeted_status != 'undefined') {
			
			// retweeted object already exist in feed
			if($('#q-' + obj.retweeted_status.id).length > 0) {			
							
				// only if not already shown and not mine
				if($('#requeet-' + obj.id).length == 0 && obj.user.statusnet_profile_url != $('#user-profile-link').children('a').attr('href')) {
					
					// if not requeeted before 
					if($('#q-' + obj.retweeted_status.id + ' .stream-item-footer').find('.requeet-text').length > 0) {
						// if users rt not already added
						if($('#q-' + obj.retweeted_status.id + ' .stream-item-footer').find('.requeet-text').find('a[data-user-id="' + obj.user.id + '"]').length==0) {
							$('#q-' + obj.retweeted_status.id + ' .stream-item-footer').find('.requeet-text').append(',<a data-user-id="' + obj.user.id + '" href="' + obj.user.statusnet_profile_url + '"> <b>' + obj.user.name + '</b></a>');
							}
						}
					else {
						$('#q-' + obj.retweeted_status.id + ' .stream-item-footer').prepend('<div class="context" id="requeet-' + obj.id + '"><span class="with-icn"><i class="badge-requeeted"></i><span class="requeet-text"> ' + window.sL.requeetedBy + '<a data-user-id="' + obj.user.id + '" href="' + obj.user.statusnet_profile_url + '"> <b>' + obj.user.name + '</b></a></span></span></div>');						
						}
					}
				}
			// retweeted object don't exist in feed
			else {

				var queetHtml = buildQueetHtml(obj.retweeted_status, obj.id, extraClassesThisRun, obj);					
				
				if(after) {
					$('#' + after).after(queetHtml);			
					}
				else {
					$('#feed-body').prepend(queetHtml);			
					}

				}
			
			}
		
		// ordinary tweet
		else {
			
			// only if not already exist
			if($('#q-' + obj.id).length == 0) {				

				// activity get special design
				if(obj.source == 'activity') {
					var queetTime = parseTwitterDate(obj.created_at);															
					var queetHtml = '<div id="stream-item-' + obj.id + '" class="stream-item activity ' + extraClassesThisRun + '" data-quitter-id="' + obj.id + '" data-conversation-id="' + obj.statusnet_conversation_id + '" data-quitter-id-in-stream="' + obj.id + '"><div class="queet" id="q-' + obj.id + '"><span class="dogear"></span><div class="queet-content"><div class="stream-item-header"><small class="created-at" data-created-at="' + obj.created_at + '"><a href="' + obj.uri + '">' + queetTime + '</a></small></div><div class="queet-text">' + $.trim(obj.statusnet_html) + '</div></div></div></div>';

					// detect rtl
					queetHtml = detectRTL(queetHtml);	
		
					if(after) {
						$('#' + after).after(queetHtml);		
						}
					else {
						$('#feed-body').prepend(queetHtml);			
						}
					
					}
				else {
					
					// if this is my queet, remove any temp-queets
					if(typeof obj.user != 'undefined') {
						if(obj.user.screen_name == $('#user-screen-name').html()) {
							if($('.temp-post').length > 0) {
								$('.temp-post').each(function (){
									// remove temp duplicate
									$(this).css('display','none');
									
									// we do this so this queet gets added after correct temp-queet in expanded conversations							
									if($(this).find('.queet-text').text() == obj.text) {
										after = $(this).attr('id');
										}
									
									// but don't hide my new queet
									extraClassesThisRun = 'visible';
									});
								}			
							}
						}
										
					var queetHtml = buildQueetHtml(obj, obj.id, extraClassesThisRun);
		
					if(after) {
						if($('#' + after).hasClass('conversation')) { // if this is a reply, give stream item some conversation formatting
							if($('#conversation-q-' + obj.id).length == 0) { // only if it's not already there
								$('#' + after).after(queetHtml.replace('id="stream-item','id="conversation-stream-item').replace('class="stream-item','class="stream-item conversation').replace('id="q','id="conversation-q'));							
								$('#' + after).remove();								
								}
							}
						else {
							$('#' + after).after(queetHtml);							
							}		
						}
					else {
						$('#feed-body').prepend(queetHtml);		
						
						// if this is a single notice, we expand it
						if(window.currentStream.substring(0,14) == 'statuses/show/') {
							expand_queet($('#stream-item-' + obj.id));
							}
							
						}
					
					}
				}
			}
		
		convertAttachmentMoreHref();		
		});	
	$('.stream-selection').removeAttr('data-current-user-stream-name'); // don't remeber user feeds
	} 
	
/* · 
   · 
   ·   Build HTML for a queet from an object
   · 
   ·   @param obj: a queet object
   ·   @param requeeted_by: if this is a requeet
   ·   
   · · · · · · · · · · · · · */ 

function buildQueetHtml(obj, idInStream, extraClassesThisRun, requeeted_by) {
	
	// we don't want to print 'null' in in_reply_to_screen_name-attribute, someone might have that username!
	var in_reply_to_screen_name = '';
	if(obj.in_reply_to_screen_name != null) {
		in_reply_to_screen_name = obj.in_reply_to_screen_name;
		}										

	// requeet html
	var requeetedClass = '';
	if(obj.user.id == window.myUserID) {
		var requeetHtml = '<li class="action-del-container"><a class="with-icn"><span class="icon sm-trash"></span> <b>' + window.sL.deleteVerb + '</b></a></li></i></li>';
		}
	else if(obj.repeated) {
		var requeetHtml = '<li class="action-rt-container"><a class="with-icn done"><span class="icon sm-rt"></span> <b>' + window.sL.requeetedVerb + '</b></a></li>';
		var requeetedClass = 'requeeted';
		}
	else {
		var requeetHtml = '<li class="action-rt-container"><a class="with-icn"><span class="icon sm-rt"></span> <b>' + window.sL.requeetVerb + '</b></a></li>';
		}
	// favorite html
	var favoritedClass = '';
	if(obj.favorited) {
		var favoriteHtml = '<a class="with-icn done"><span class="icon sm-fav"></span> <b>' + window.sL.favoritedVerb + '</b></a>';
		favoritedClass = 'favorited';
		}
	else {
		var favoriteHtml = '<a class="with-icn"><span class="icon sm-fav"></span> <b>' + window.sL.favoriteVerb + '</b></a>';
		}						


	// actions only for logged in users
	var queetActions = '';
	if(typeof window.loggedIn.screen_name != 'undefined') {			
		queetActions = '<ul class="queet-actions"><li class="action-reply-container"><a class="with-icn"><span class="icon sm-reply"></span> <b>' + window.sL.replyVerb + '</b></a></li>' + requeetHtml + '<li class="action-fav-container">' + favoriteHtml + '</li></ul>';
		}
		
	// reply-to html					
	var reply_to_html = '';							
	if(obj.in_reply_to_screen_name != null && obj.in_reply_to_screen_name != obj.user.screen_name) {
		reply_to_html = '<span class="reply-to">@' + obj.in_reply_to_screen_name + '</span> ';
		}
		
	// in-groups html
	var in_groups_html = '';							
	if(obj.statusnet_in_groups !== false && typeof obj.statusnet_in_groups != 'undefined') {
		in_groups_html = '<span class="in-groups">' + obj.statusnet_in_groups + '</span>';
		}	
		
	// image attachment thumbnails
	var attachment_html = '';
	if(typeof obj.attachments != "undefined") {
		$.each(obj.attachments, function(){
			if(this.thumb_url != null) {
				attachment_html = attachment_html + '<a href="' + this.url + '"><img src="' + this.thumb_url + '"/></a>';
				}
			});
		}	
	if(attachment_html.length>0) {
		attachment_html = '<div class="attachments">' + attachment_html + '</div>';
		}
		
	// requeets
	var requeetHtml = '';
	if(typeof requeeted_by != 'undefined') {
		requeetHtml = '<div class="context" id="requeet-' + requeeted_by.id + '"><span class="with-icn"><i class="badge-requeeted"></i><span class="requeet-text"> ' + window.sL.requeetedBy + '<a href="' + requeeted_by.user.statusnet_profile_url + '"> <b>' + requeeted_by.user.name + '</b></a></span></span></div>';
		}


	obj = convertNewGNUSocialURItoURL(obj);
		
	var queetTime = parseTwitterDate(obj.created_at);															
	var queetHtml = '<div \
						id="stream-item-' + obj.id + '" \
						class="stream-item ' + extraClassesThisRun + ' ' + requeetedClass + ' ' + favoritedClass + '" \
						data-source="' + escape(obj.source) + '" \
						data-quitter-id="' + obj.id + '" \
						data-conversation-id="' + obj.statusnet_conversation_id + '" \
						data-quitter-id-in-stream="' + idInStream + '" \
						data-in-reply-to-screen-name="' + in_reply_to_screen_name + '" \
						data-in-reply-to-status-id="' + obj.in_reply_to_status_id + '">\
							<div class="queet" id="q-' + obj.id + '">\
								' + attachment_html + '\
								<span class="dogear"></span>\
								<div class="queet-content">\
									<div class="stream-item-header">\
										<a class="account-group" href="' + obj.user.statusnet_profile_url + '">\
											<img class="avatar" src="' + obj.user.profile_image_url_profile_size + '" />\
											<strong class="name" data-user-id="' + obj.user.id + '">' + obj.user.name + '</strong> \
											<span class="screen-name">@' + obj.user.screen_name + '</span>\
										</a>\
										<i class="addressees">' + reply_to_html + in_groups_html + '</i>\
										<small class="created-at" data-created-at="' + obj.created_at + '">\
											<a href="' + obj.uri + '">' + queetTime + '</a>\
										</small>\
									</div>\
									<div class="queet-text">' + $.trim(obj.statusnet_html) + '</div>\
									<div class="stream-item-footer">\
										' + queetActions + '\
										' + requeetHtml + '\
										<span class="stream-item-expand">' + window.sL.expand + '</span>\
									</div>\
								</div>\
							</div>\
						</div>';

	// detect rtl
	queetHtml = detectRTL(queetHtml);	
	
	return queetHtml;
	}


