
/*· · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · ·
  ·                                                                               ·
  ·                                                                               ·
  ·                             Q V I T T E R                                     ·
  ·                                                                               ·
  ·                                                                               ·
  ·                                 <o)                                           ·
  ·                                  /_////                                       ·
  ·                                 (____/                                        ·
  ·                                          (o<                                  ·
  ·                                   o> \\\\_\                                   ·
  ·                                 \\)   \____)                                  ·
  ·                                                                               ·
  ·                                                                               ·
  ·     @licstart  The following is the entire license notice for the             ·
  ·     JavaScript code in this page.                                             ·
  ·                                                                               ·
  ·     Copyright (C) 2015  Hannes Mannerheim and other contributors              ·
  ·                                                                               ·
  ·                                                                               ·
  ·     This program is free software: you can redistribute it and/or modify      ·
  ·     it under the terms of the GNU Affero General Public License as            ·
  ·     published by the Free Software Foundation, either version 3 of the        ·
  ·     License, or (at your option) any later version.                           ·
  ·                                                                               ·
  ·     This program is distributed in the hope that it will be useful,           ·
  ·     but WITHOUT ANY WARRANTY; without even the implied warranty of            ·
  ·     MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the             ·
  ·     GNU Affero General Public License for more details.                       ·
  ·                                                                               ·
  ·     You should have received a copy of the GNU Affero General Public License  ·
  ·     along with this program.  If not, see <http://www.gnu.org/licenses/>.     ·
  ·                                                                               ·
  ·     @licend  The above is the entire license notice                           ·
  ·     for the JavaScript code in this page.                                     ·
  ·                                                                               ·
  · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · */

/* ·
   ·
   ·   Other plugins can add streams to Qvitter, by pushing streamObjects to
   ·   this array. See the structure in pathToStreamRouter()
   ·
   · · · · · · · · · */

window.pluginStreamObjects = [];



/* ·
   ·
   ·   Sets the location bar in the browser to correspond with given stream
   ·
   ·   @param streamObject: stream object returned by pathToStreamRouter
   ·
   · · · · · · · · · */

function setUrlFromStream(streamObject) {
	history.pushState({strm:streamObject.path},'','/' + streamObject.path);
	}


/* ·
   ·
   ·   Local URL to stream router
   ·
   ·   @param url: any URL
   ·
   · · · · · · · · · */

function URLtoStreamRouter(url) {

	// we don't expect protocol to matter
	url = removeProtocolFromUrl(url);

	// not a local URL
	if(url != window.siteRootDomain && url.indexOf(window.siteRootDomain + '/') != 0) {
		// console.log('not a local url: ' + url);
		return false;
		}

	// remove server
	var path = url.substring(window.siteRootDomain.length);

	return pathToStreamRouter(path);
	}


/* ·
   ·
   ·   Path to stream router
   ·
   ·   @param path: path, with or without starting slash
   ·
   · · · · · · · · · */

function pathToStreamRouter(path) {

	// remove and remember anchor tags
	var anchor = false;
	if(path.indexOf('#')>-1) {
		anchor = path.substring(path.indexOf('#'));
		path = path.substring(0,path.indexOf('#'));
		}

	// remove starting slash
	if(path.indexOf('/') == 0) {
		path = path.substring(1);
		}

	// remove ending slash
	if(path.length>0 && path.lastIndexOf('/') == (path.length-1)) {
		path = path.substring(0,path.length-1);
		}

    // if we're on the instance base url and logged in, route to {nickname}/all
    if(window.loggedIn && path.length == 0) {
        path = window.loggedIn.screen_name + '/all';
        }


	// structure of the returned object
	var streamObject = {
		path: path,                 // this path
        name: false, 				// human readable name
		streamHeader: false,		// short header, e.g. links and buttons – no html!
		streamSubHeader: false,		// a longer header, that can include html and links
		streamDescription: false,	// description of the stream
		parentPath: false,			// a parent path can e.g. be "group/qvitter" for "group/qvitter/members"
		stream: false,				// the API path
		nickname: false,			// if we can read a nickname/screen_name from the path, add it to this property
		id: false,					// if we can read a id number string from the path, add it to this property
        maxIdOrPage: 'maxId',		// whether this stream uses 'maxId' or 'page' for paging (maxId is default)
		menu: false,				// optional menu in the header
		callbacks: false,			// functions to run after this timeline is loaded to feed-body
		type: 'notices'				// notices, notifications, users, groups, lists etc. notices is default
		};

	// instance's public timeline
	if((path.length == 0 && window.siteLocalOnlyDefaultPath) || path == 'main/public') {
		streamObject.path = 'main/public';
        streamObject.name = 'public timeline';
		streamObject.streamHeader = window.sL.publicTimeline;
		streamObject.stream = 'statuses/public_timeline.json';
		if(window.loggedIn !== false) {
			streamObject.menu = [
				{
					type: 'profile-prefs-toggle',
					namespace: 'qvitter',
					topic: 'hide_embedded_in_timeline:' + streamObject.path,
					label: window.sL.hideEmbeddedInTimeline,
					callback: 'showOrHideEmbeddedContentInTimelineFromProfilePref'
					},
				{
					type: 'profile-prefs-toggle',
					namespace: 'qvitter',
					topic: 'hide_quotes_in_timeline:' + streamObject.path,
					label: window.sL.hideQuotesInTimeline,
					callback: 'showOrHideQuotesInTimelineFromProfilePref'
					},
				{
					type: 'divider'
					},
				{
				type: 'link',
					label: window.sL.silencedPlural,
					href: window.siteInstanceURL + 'main/silenced'
					},
				{
				type: 'link',
					label: window.sL.sandboxedPlural,
					href: window.siteInstanceURL + 'main/sandboxed'
					}
				];
			streamObject.callbacks = [
				'showOrHideEmbeddedContentInTimelineFromProfilePref',
				'showOrHideQuotesInTimelineFromProfilePref'
				];
			}
		return streamObject;
		}

	// the whole known network
	if(path.length == 0 || path == 'main/all') {
        streamObject.path = 'main/all';
		streamObject.name = 'public and external timeline';
		streamObject.streamHeader = window.sL.publicAndExtTimeline;
		streamObject.stream = 'statuses/public_and_external_timeline.json';
		if(window.loggedIn !== false) {
			streamObject.menu = [
				{
					type: 'profile-prefs-toggle',
					namespace: 'qvitter',
					topic: 'hide_embedded_in_timeline:' + streamObject.path,
					label: window.sL.hideEmbeddedInTimeline,
					callback: 'showOrHideEmbeddedContentInTimelineFromProfilePref'
					},
				{
					type: 'profile-prefs-toggle',
					namespace: 'qvitter',
					topic: 'hide_quotes_in_timeline:' + streamObject.path,
					label: window.sL.hideQuotesInTimeline,
					callback: 'showOrHideQuotesInTimelineFromProfilePref'
					},
				{
					type: 'divider'
					},
				{
				type: 'link',
					label: window.sL.silencedPlural,
					href: window.siteInstanceURL + 'main/silenced'
					},
				{
				type: 'link',
					label: window.sL.sandboxedPlural,
					href: window.siteInstanceURL + 'main/sandboxed'
					}
				];
			streamObject.callbacks = [
				'showOrHideEmbeddedContentInTimelineFromProfilePref',
				'showOrHideQuotesInTimelineFromProfilePref'
				];
			}
		return streamObject;
		}

	// groups directory, qvitter can't handle that yet
	if(path == 'groups') {
		streamObject.name = 'group directory';
		return streamObject;
		}

	// search/notice?q={urlencoded search terms}
	if(path.indexOf('search/notice?q=') == 0) {
		var searchQuery = replaceHtmlSpecialChars(path.replace('search/notice?q=',''));
		if(searchQuery.length>0) {
			streamObject.name = 'search';
            streamObject.streamHeader = window.sL.searchVerb + ': ' + replaceHtmlSpecialChars(decodeURIComponent(searchQuery));
            streamObject.stream = 'search.json?q=' + searchQuery;
            streamObject.id = searchQuery;
            streamObject.maxIdOrPage = 'page';
			if(window.loggedIn !== false) {
				streamObject.menu = [
					{
						type: 'profile-prefs-toggle',
						namespace: 'qvitter',
						topic: 'hide_embedded_in_timeline:' + streamObject.path,
						label: window.sL.hideEmbeddedInTimeline,
						callback: 'showOrHideEmbeddedContentInTimelineFromProfilePref'
						},
					{
						type: 'profile-prefs-toggle',
						namespace: 'qvitter',
						topic: 'hide_quotes_in_timeline:' + streamObject.path,
						label: window.sL.hideQuotesInTimeline,
						callback: 'showOrHideQuotesInTimelineFromProfilePref'
						}
					];
				streamObject.callbacks = [
					'showOrHideEmbeddedContentInTimelineFromProfilePref',
					'showOrHideQuotesInTimelineFromProfilePref'
					];
				}
			return streamObject;
			}
		}

	// main/silenced
	if(path == 'main/silenced') {
		streamObject.name = 'silenced profiles';
        streamObject.streamHeader = window.sL.silencedPlural;
        streamObject.streamSubHeader = window.sL.silencedUsersOnThisInstance;
		streamObject.streamDescription = window.sL.silencedStreamDescription;
		streamObject.stream = 'qvitter/silenced.json?count=20';
        streamObject.maxIdOrPage = 'page';
		streamObject.type = 'users';
		streamObject.menu = [
			{
			type: 'link',
				label: window.sL.sandboxedPlural,
				href: window.siteInstanceURL + 'main/sandboxed'
				}
			];
		return streamObject;
		}

	// main/sandboxed
	if(path == 'main/sandboxed') {
		streamObject.name = 'sandboxed profiles';
        streamObject.streamHeader = window.sL.sandboxedPlural;
        streamObject.streamSubHeader = window.sL.sandboxedUsersOnThisInstance;
		streamObject.streamDescription = window.sL.sandboxedStreamDescription;
		streamObject.stream = 'qvitter/sandboxed.json?count=20';
        streamObject.maxIdOrPage = 'page';
		streamObject.type = 'users';
		streamObject.menu = [
			{
			type: 'link',
				label: window.sL.silencedPlural,
				href: window.siteInstanceURL + 'main/silenced'
				}
			];
		return streamObject;
		}

	// {screen_name}
	if(/^[a-zA-Z0-9]+$/.test(path)) {
        streamObject.name = 'profile';
        if(window.loggedIn.screen_name == path) {
            streamObject.name = 'my profile';
            }
        streamObject.nickname = path;
        streamObject.streamHeader = '@' + replaceHtmlSpecialChars(streamObject.nickname);
        streamObject.streamSubHeader = window.sL.notices + '<div class="queet-streams">/ <a class="queet-stream mentions" href="' + window.siteInstanceURL + streamObject.nickname + '/replies">' + window.sL.mentions + '</a> / <a class="queet-stream favorites" href="' + window.siteInstanceURL + streamObject.nickname + '/favorites">' + window.sL.favoritesNoun +'</a></div>';
		streamObject.stream = 'statuses/user_timeline.json?screen_name=' + streamObject.nickname + '&withuserarray=1';
		return streamObject;
		}

	var pathSplit = path.split('/');

	// tag/{tag}
	if(pathSplit.length == 2 && pathSplit[0] == 'tag') {
		streamObject.name = 'tag stream';
        streamObject.streamHeader = '#' + replaceHtmlSpecialChars(pathSplit[1]);
        streamObject.id = pathSplit[1];
		streamObject.stream = 'statusnet/tags/timeline/' + streamObject.id + '.json';
		if(window.loggedIn !== false) {
			streamObject.menu = [
				{
					type: 'profile-prefs-toggle',
					namespace: 'qvitter',
					topic: 'hide_embedded_in_timeline:' + streamObject.path,
					label: window.sL.hideEmbeddedInTimeline,
					callback: 'showOrHideEmbeddedContentInTimelineFromProfilePref'
					},
				{
					type: 'profile-prefs-toggle',
					namespace: 'qvitter',
					topic: 'hide_quotes_in_timeline:' + streamObject.path,
					label: window.sL.hideQuotesInTimeline,
					callback: 'showOrHideQuotesInTimelineFromProfilePref'
					}
				];
			streamObject.callbacks = [
				'showOrHideEmbeddedContentInTimelineFromProfilePref',
				'showOrHideQuotesInTimelineFromProfilePref'
				];
			}
		return streamObject;
		}

	// notice/{id}
	if(pathSplit.length == 2 && pathSplit[0] == 'notice' && /^[0-9]+$/.test(pathSplit[1])) {
		streamObject.name = 'notice';
        streamObject.streamHeader = replaceHtmlSpecialChars(path);
        streamObject.id = pathSplit[1];
		streamObject.stream = 'statuses/show/' + streamObject.id + '.json';
		return streamObject;
		}

	// conversation/{id}
	if(pathSplit.length == 2 && pathSplit[0] == 'conversation' && /^[0-9]+$/.test(pathSplit[1])) {
		streamObject.name = 'notice';
        streamObject.id = pathSplit[1];
		// conversation links are redirected to notice page, if the link is to a
		// non root notice, then the notice we want to link to and expand is in the hash
		if(anchor && anchor.indexOf('#notice-') == 0) {
			streamObject.id = anchor.substring(8);
			}
		streamObject.path = 'notice/' + streamObject.id;
		streamObject.streamHeader = replaceHtmlSpecialChars(streamObject.path);
		streamObject.stream = 'statuses/show/' + streamObject.id + '.json';
		return streamObject;
		}

	// user/{id}
	if(pathSplit.length == 2 && pathSplit[0] == 'user' && /^[0-9]+$/.test(pathSplit[1])) {
		streamObject.name = 'profile by id';
        streamObject.nickname = userArrayCacheGetUserNicknameById(pathSplit[1]);
        if(streamObject.nickname === false) {
            streamObject.streamHeader = replaceHtmlSpecialChars(path);
            }
        else {
            streamObject.streamHeader = '@' + streamObject.nickname;
            streamObject.parentPath = streamObject.nickname;
            streamObject.streamSubHeader = window.sL.notices + '<div class="queet-streams">/ <a class="queet-stream mentions" href="' + window.siteInstanceURL + streamObject.nickname + '/replies">' + window.sL.mentions + '</a> / <a class="queet-stream favorites" href="' + window.siteInstanceURL + streamObject.nickname + '/favorites">' + window.sL.favoritesNoun +'</a></div>';
            }
        streamObject.id = pathSplit[1];
		streamObject.stream = 'statuses/user_timeline.json?id=' + streamObject.id + '&withuserarray=1';
		return streamObject;
		}

	// group/{group_nickname}
	if(pathSplit.length == 2 && pathSplit[0] == 'group' && /^[a-zA-Z0-9]+$/.test(pathSplit[1])) {
		streamObject.name = 'group notice stream';
        streamObject.nickname = pathSplit[1];
        streamObject.streamHeader = '!' + replaceHtmlSpecialChars(pathSplit[1]);
		streamObject.stream = 'statusnet/groups/timeline/' + streamObject.nickname + '.json';
		if(window.loggedIn !== false) {
			streamObject.menu = [
				{
					type: 'profile-prefs-toggle',
					namespace: 'qvitter',
					topic: 'hide_embedded_in_timeline:' + streamObject.path,
					label: window.sL.hideEmbeddedInTimeline,
					callback: 'showOrHideEmbeddedContentInTimelineFromProfilePref'
					},
				{
					type: 'profile-prefs-toggle',
					namespace: 'qvitter',
					topic: 'hide_quotes_in_timeline:' + streamObject.path,
					label: window.sL.hideQuotesInTimeline,
					callback: 'showOrHideQuotesInTimelineFromProfilePref'
					}
				];
			streamObject.callbacks = [
				'showOrHideEmbeddedContentInTimelineFromProfilePref',
				'showOrHideQuotesInTimelineFromProfilePref'
				];
			}
		return streamObject;
		}

	// group/{id}/id
	if(pathSplit.length == 3 && pathSplit[0] == 'group' && /^[0-9]+$/.test(pathSplit[1]) && pathSplit[2] == 'id') {
		streamObject.name = 'group notice stream by id';
        streamObject.id = pathSplit[1];
        streamObject.streamHeader = replaceHtmlSpecialChars(path);
		streamObject.stream = 'statusnet/groups/timeline/' + streamObject.id + '.json';
		return streamObject;
		}

	// group/{group_nickname}/members
	if(pathSplit.length == 3 && pathSplit[0] == 'group' && /^[a-zA-Z0-9]+$/.test(pathSplit[1]) && pathSplit[2] == 'members') {
		streamObject.name = 'group member list';
        streamObject.nickname = pathSplit[1];
        streamObject.parentPath = 'group/' + streamObject.nickname;
        streamObject.streamHeader = '!' + replaceHtmlSpecialChars(pathSplit[1]);
        streamObject.streamSubHeader = window.sL.memberCount;
		streamObject.stream = 'statusnet/groups/membership/' + streamObject.nickname + '.json?count=20';
        streamObject.maxIdOrPage = 'page';
		streamObject.type = 'users';
		return streamObject;
		}

	// group/{group_nickname}/admins
	if(pathSplit.length == 3 && pathSplit[0] == 'group' && /^[a-zA-Z0-9]+$/.test(pathSplit[1]) && pathSplit[2] == 'admins') {
		streamObject.name = 'group admin list';
        streamObject.nickname = pathSplit[1];
        streamObject.parentPath = 'group/' + streamObject.nickname;
        streamObject.streamHeader = '!' + replaceHtmlSpecialChars(pathSplit[1]);
        streamObject.streamSubHeader = window.sL.adminCount;
		streamObject.stream = 'statusnet/groups/admins/' + streamObject.nickname + '.json?count=20';
        streamObject.maxIdOrPage = 'page';
		streamObject.type = 'users';
		return streamObject;
		}

	// {screen_name}/all
	if(pathSplit.length == 2 && /^[a-zA-Z0-9]+$/.test(pathSplit[0]) && pathSplit[1] == 'all') {
        streamObject.name = 'friends timeline';
		streamObject.nickname = pathSplit[0];
        streamObject.streamHeader = replaceHtmlSpecialChars(path);
		if(window.loggedIn.screen_name == streamObject.nickname) {
			streamObject.stream = 'statuses/friends_timeline.json';
            streamObject.streamSubHeader = window.sL.timeline;
			streamObject.menu = [
				{
					type: 'profile-prefs-toggle',
					namespace: 'qvitter',
					topic: 'hide_replies',
					label: window.sL.hideRepliesToPeopleIDoNotFollow
					},
				{
					type: 'divider'
					},
				{
					type: 'profile-prefs-toggle',
					namespace: 'qvitter',
					topic: 'hide_embedded_in_timeline:' + streamObject.path,
					label: window.sL.hideEmbeddedInTimeline,
					callback: 'showOrHideEmbeddedContentInTimelineFromProfilePref'
					},
				{
					type: 'profile-prefs-toggle',
					namespace: 'qvitter',
					topic: 'hide_quotes_in_timeline:' + streamObject.path,
					label: window.sL.hideQuotesInTimeline,
					callback: 'showOrHideQuotesInTimelineFromProfilePref'
					}
				];
			streamObject.callbacks = [
				'showOrHideEmbeddedContentInTimelineFromProfilePref',
				'showOrHideQuotesInTimelineFromProfilePref'
				];
			}
		else {
			streamObject.stream = 'statuses/friends_timeline.json?screen_name=' + streamObject.nickname + '&withuserarray=1';
            streamObject.parentPath = streamObject.nickname;
			}
		return streamObject;
		}

	// {screen_name}/replies
	if(pathSplit.length == 2 && /^[a-zA-Z0-9]+$/.test(pathSplit[0]) && pathSplit[1] == 'replies') {
		streamObject.name = 'mentions';
        streamObject.nickname = pathSplit[0];
		if(window.loggedIn.screen_name == streamObject.nickname) {
			streamObject.stream = 'statuses/mentions.json';
            streamObject.streamHeader = window.sL.mentions;
			}
		else {
            streamObject.parentPath = streamObject.nickname;
			streamObject.stream = 'statuses/mentions.json?screen_name=' + streamObject.nickname + '&withuserarray=1';
            streamObject.streamSubHeader = '<div class="queet-streams"><a class="queet-stream queets" href="' + window.siteInstanceURL + streamObject.nickname + '">' + window.sL.notices + '</a> /</div>' + window.sL.mentions + '<div class="queet-streams">/ <a class="queet-stream favorites" href="' + window.siteInstanceURL + streamObject.nickname + '/favorites">' + window.sL.favoritesNoun + '</a></div>';
			}
		if(window.loggedIn !== false) {
			streamObject.menu = [
				{
					type: 'profile-prefs-toggle',
					namespace: 'qvitter',
					topic: 'hide_embedded_in_timeline:' + streamObject.path,
					label: window.sL.hideEmbeddedInTimeline,
					callback: 'showOrHideEmbeddedContentInTimelineFromProfilePref'
					},
				{
					type: 'profile-prefs-toggle',
					namespace: 'qvitter',
					topic: 'hide_quotes_in_timeline:' + streamObject.path,
					label: window.sL.hideQuotesInTimeline,
					callback: 'showOrHideQuotesInTimelineFromProfilePref'
					}
				];
			streamObject.callbacks = [
				'showOrHideEmbeddedContentInTimelineFromProfilePref',
				'showOrHideQuotesInTimelineFromProfilePref'
				];
			}
		return streamObject;
		}

	// {screen_name}/notifications
	if(pathSplit.length == 2 && /^[a-zA-Z0-9]+$/.test(pathSplit[0]) && pathSplit[1] == 'notifications') {
		streamObject.name = 'notifications';
        streamObject.nickname = pathSplit[0];
		// only accessible to the logged in user
		if(window.loggedIn.screen_name == streamObject.nickname) {
			streamObject.stream = 'qvitter/statuses/notifications.json';
            streamObject.streamHeader = '@' + replaceHtmlSpecialChars(streamObject.nickname);
            streamObject.streamSubHeader = window.sL.notifications;
			streamObject.type = 'notifications';
			streamObject.menu = [
				{
					type: 'function',
					functionName: 'markAllNotificationsAsSeen',
					label: window.sL.markAllNotificationsAsSeen
					},
				{
					type: 'divider'
					},
				{
					type: 'profile-prefs-toggle',
					namespace: 'qvitter',
					topic: 'hide_embedded_in_timeline:' + streamObject.path,
					label: window.sL.hideEmbeddedInTimeline,
					callback: 'showOrHideEmbeddedContentInTimelineFromProfilePref'
					},
				{
					type: 'profile-prefs-toggle',
					namespace: 'qvitter',
					topic: 'hide_quotes_in_timeline:' + streamObject.path,
					label: window.sL.hideQuotesInTimeline,
					callback: 'showOrHideQuotesInTimelineFromProfilePref'
					},
				{
					type: 'divider'
					},
				{
					type: 'profile-prefs-toggle',
					namespace: 'qvitter',
					topic: 'only_show_notifications_from_users_i_follow',
					label: window.sL.onlyShowNotificationsFromUsersIFollow,
					callback: 'reloadCurrentStreamAndClearCache'
					},
				{
					type: 'profile-prefs-toggle',
					namespace: 'qvitter',
					topic: 'hide_notifications_from_muted_users',
					label: window.sL.hideNotificationsFromMutedUsers,
					callback: 'showOrHideNoticesFromMutedUsersInNotifications'
					},
				{
					type: 'divider'
					},
				{
					type: 'profile-prefs-toggle',
					namespace: 'qvitter',
					topic: 'disable_notify_replies_and_mentions',
					label: window.sL.notifyRepliesAndMentions,
					callback: 'reloadCurrentStreamAndClearCache'
					},
				{
					type: 'profile-prefs-toggle',
					namespace: 'qvitter',
					topic: 'disable_notify_favs',
					label: window.sL.notifyFavs,
					callback: 'reloadCurrentStreamAndClearCache'
					},
				{
					type: 'profile-prefs-toggle',
					namespace: 'qvitter',
					topic: 'disable_notify_repeats',
					label: window.sL.notifyRepeats,
					callback: 'reloadCurrentStreamAndClearCache'
					},
				{
					type: 'profile-prefs-toggle',
					namespace: 'qvitter',
					topic: 'disable_notify_follows',
					label: window.sL.notifyFollows,
					callback: 'reloadCurrentStreamAndClearCache'
					}
				];
			streamObject.callbacks = [
				'showOrHideEmbeddedContentInTimelineFromProfilePref',
				'showOrHideQuotesInTimelineFromProfilePref',
				'showOrHideNoticesFromMutedUsersInNotifications'
				];
			}
		return streamObject;
		}

	// {screen_name}/favorites
	if(pathSplit.length == 2 && /^[a-zA-Z0-9]+$/.test(pathSplit[0]) && pathSplit[1] == 'favorites') {
		streamObject.name = 'favorites';
        streamObject.nickname = pathSplit[0];
		if(window.loggedIn.screen_name == streamObject.nickname) {
			streamObject.stream = 'favorites.json';
            streamObject.streamSubHeader = window.sL.favoritesNoun;
			}
		else {
            streamObject.parentPath = streamObject.nickname;
			streamObject.stream = 'favorites.json?screen_name=' + streamObject.nickname + '&withuserarray=1';
            streamObject.streamHeader = '@' + replaceHtmlSpecialChars(streamObject.nickname);
            streamObject.streamSubHeader = '<div class="queet-streams"><a class="queet-stream queets" href="' + window.siteInstanceURL + streamObject.nickname + '">' + window.sL.notices + '</a> / <a class="queet-stream mentions" href="' + window.siteInstanceURL + streamObject.nickname + '/replies">' + window.sL.mentions + '</a> /</div>' + window.sL.favoritesNoun;
			}
		if(window.loggedIn !== false) {
			streamObject.menu = [
				{
					type: 'profile-prefs-toggle',
					namespace: 'qvitter',
					topic: 'hide_embedded_in_timeline:' + streamObject.path,
					label: window.sL.hideEmbeddedInTimeline,
					callback: 'showOrHideEmbeddedContentInTimelineFromProfilePref'
					},
				{
					type: 'profile-prefs-toggle',
					namespace: 'qvitter',
					topic: 'hide_quotes_in_timeline:' + streamObject.path,
					label: window.sL.hideQuotesInTimeline,
					callback: 'showOrHideQuotesInTimelineFromProfilePref'
					}
				];
			streamObject.callbacks = [
				'showOrHideEmbeddedContentInTimelineFromProfilePref',
				'showOrHideQuotesInTimelineFromProfilePref'
				];
			}
		return streamObject;
		}

	// {screen_name}/subscribers
	if(pathSplit.length == 2 && /^[a-zA-Z0-9]+$/.test(pathSplit[0]) && pathSplit[1] == 'subscribers') {
		streamObject.name = 'subscribers';
        streamObject.nickname = pathSplit[0];
        streamObject.parentPath = streamObject.nickname;
        streamObject.streamHeader = '@' + replaceHtmlSpecialChars(streamObject.nickname);
        streamObject.streamSubHeader = '<div class="queet-streams"><a class="queet-stream following" href="' + window.siteInstanceURL + streamObject.nickname + '/subscriptions">' + window.sL.following + '</a> / </div>' + window.sL.followers;
		streamObject.stream = 'statuses/followers.json?count=20&screen_name=' + streamObject.nickname + '&withuserarray=1';
        streamObject.maxIdOrPage = 'page';
		streamObject.type = 'users';
		return streamObject;
		}

	// {screen_name}/subscriptions
	if(pathSplit.length == 2 && /^[a-zA-Z0-9]+$/.test(pathSplit[0]) && pathSplit[1] == 'subscriptions') {
		streamObject.name = 'subscriptions';
        streamObject.nickname = pathSplit[0];
        streamObject.parentPath = streamObject.nickname;
        streamObject.streamHeader = '@' + replaceHtmlSpecialChars(streamObject.nickname);
        streamObject.streamSubHeader = window.sL.following + '<div class="queet-streams">/ <a class="queet-stream followers" href="' + window.siteInstanceURL + streamObject.nickname + '/subscribers">' + window.sL.followers + '</a></div>';
		streamObject.stream = 'statuses/friends.json?count=20&screen_name=' + streamObject.nickname + '&withuserarray=1';
        streamObject.maxIdOrPage = 'page';
		streamObject.type = 'users';
		return streamObject;
		}

	// {screen_name}/blocks
	if(pathSplit.length == 2 && /^[a-zA-Z0-9]+$/.test(pathSplit[0]) && pathSplit[1] == 'blocks') {
		streamObject.name = 'user blocks';
        streamObject.nickname = pathSplit[0];
        streamObject.streamHeader = window.sL.userBlocked;
        streamObject.streamSubHeader = window.sL.userBlocks;
		streamObject.stream = 'qvitter/blocks.json?count=20&id=' + streamObject.nickname + '&withuserarray=1';
        streamObject.maxIdOrPage = 'page';
		streamObject.type = 'users';
		return streamObject;
		}

	// {screen_name}/mutes
	if(pathSplit.length == 2 && /^[a-zA-Z0-9]+$/.test(pathSplit[0]) && pathSplit[1] == 'mutes') {
		streamObject.name = 'user mutes';
        streamObject.nickname = pathSplit[0];
        streamObject.streamHeader = window.sL.userMuted;
        streamObject.streamSubHeader = window.sL.userMutes;
		streamObject.streamDescription = window.sL.mutedStreamDescription;
		streamObject.stream = 'qvitter/mutes.json?count=20&withuserarray=1';
        streamObject.maxIdOrPage = 'page';
		streamObject.type = 'users';
		return streamObject;
		}

	// {screen_name}/groups
	if(pathSplit.length == 2 && /^[a-zA-Z0-9]+$/.test(pathSplit[0]) && pathSplit[1] == 'groups') {
		streamObject.name = 'user group list';
        streamObject.nickname = pathSplit[0];
        streamObject.parentPath = streamObject.nickname;
        streamObject.streamHeader = '@' + replaceHtmlSpecialChars(streamObject.nickname);
        streamObject.streamSubHeader = window.sL.groups;
		streamObject.stream = 'statusnet/groups/list.json?count=10&screen_name=' + streamObject.nickname + '&withuserarray=1';
		streamObject.maxIdOrPage = 'page';
		streamObject.type = 'groups';
		return streamObject;
		}

	// {screen_name}/all/{listname}
	if(pathSplit.length == 3 && /^[a-zA-Z0-9]+$/.test(pathSplit[0]) && pathSplit[1] == 'all' && /^[a-zA-Z0-9]+$/.test(pathSplit[2])) {
		streamObject.name = 'list notice stream';
        streamObject.nickname = pathSplit[2];
		streamObject.stream = 'qvitter/' + pathSplit[0] + '/lists/' + pathSplit[2] + '/statuses.json';
		streamObject.type = 'notices';
		if(window.loggedIn.screen_name == pathSplit[0]) {
			streamObject.streamHeader = window.sL.myListWithListName.replace('{list-name}',streamObject.nickname);
			streamObject.streamSubHeader = window.sL.myListWithListName.replace('{list-name}',streamObject.nickname) + '<div class="queet-streams">/ <a class="queet-stream list-members" href="' + window.siteInstanceURL + pathSplit[0] + '/all/' + streamObject.nickname + '/tagged">' + window.sL.listMembers + '</a> / <a class="queet-stream list-subscribers" href="' + window.siteInstanceURL + pathSplit[0] + '/all/' + streamObject.nickname  + '/subscribers">' + window.sL.listSubscribers + '</a></div>';
			}
		else {
			streamObject.streamHeader = window.sL.nicknamesListWithListName.replace('{list-name}',streamObject.nickname).replace('{nickname}',pathSplit[0]);
			streamObject.streamSubHeader = window.sL.nicknamesListWithListName.replace('{list-name}',streamObject.nickname).replace('{nickname}',pathSplit[0]) + '<div class="queet-streams">/ <a class="queet-stream list-members" href="' + window.siteInstanceURL + pathSplit[0] + '/all/' + streamObject.nickname + '/tagged">' + window.sL.listMembers + '</a> / <a class="queet-stream list-subscribers" href="' + window.siteInstanceURL + pathSplit[0] + '/all/' + streamObject.nickname  + '/subscribers">' + window.sL.listSubscribers + '</a></div>';
			}
		if(window.loggedIn !== false) {
			streamObject.menu = [
				{
					type: 'profile-prefs-toggle',
					namespace: 'qvitter',
					topic: 'hide_embedded_in_timeline:' + streamObject.path,
					label: window.sL.hideEmbeddedInTimeline,
					callback: 'showOrHideEmbeddedContentInTimelineFromProfilePref'
					},
				{
					type: 'profile-prefs-toggle',
					namespace: 'qvitter',
					topic: 'hide_quotes_in_timeline:' + streamObject.path,
					label: window.sL.hideQuotesInTimeline,
					callback: 'showOrHideQuotesInTimelineFromProfilePref'
					}
				];
			streamObject.callbacks = [
				'showOrHideEmbeddedContentInTimelineFromProfilePref',
				'showOrHideQuotesInTimelineFromProfilePref'
				];
			}
		return streamObject;
		}

	// {screen_name}/all/{listname}/members
	if(pathSplit.length == 4 && /^[a-zA-Z0-9]+$/.test(pathSplit[0]) && pathSplit[1] == 'all' && /^[a-zA-Z0-9]+$/.test(pathSplit[2]) && pathSplit[3] == 'tagged') {
		streamObject.name = 'list members';
        streamObject.nickname = pathSplit[2];
		streamObject.parentPath = pathSplit[0] + '/all/' + pathSplit[2];
		streamObject.stream = 'qvitter/' + pathSplit[0] + '/lists/' + pathSplit[2] + '/members.json';
		streamObject.maxIdOrPage = 'page';
		streamObject.type = 'users';
		if(window.loggedIn.screen_name == pathSplit[0]) {
			streamObject.streamHeader = window.sL.myListWithListName.replace('{list-name}',streamObject.nickname);
			streamObject.streamSubHeader = '<div class="queet-streams"><a class="queet-stream list-notice-stream" href="' + window.siteInstanceURL + pathSplit[0] + '/all/' + streamObject.nickname + '">' + window.sL.myListWithListName.replace('{list-name}',streamObject.nickname) + '</a> /</div>' + window.sL.listMembers + '<div class="queet-streams">/ <a class="queet-stream list-subscribers" href="' + window.siteInstanceURL + pathSplit[0] + '/all/' + streamObject.nickname  + '/subscribers">' + window.sL.listSubscribers + '</a></div>';
			}
		else {
			streamObject.streamHeader = window.sL.nicknamesListWithListName.replace('{list-name}',streamObject.nickname).replace('{nickname}',pathSplit[0]);
			streamObject.streamSubHeader = '<div class="queet-streams"><a class="queet-stream list-notice-stream" href="' + window.siteInstanceURL + pathSplit[0] + '/all/' + streamObject.nickname + '">' + window.sL.nicknamesListWithListName.replace('{list-name}',streamObject.nickname).replace('{nickname}',pathSplit[0]) + '</a> /</div>' + window.sL.listMembers + '<div class="queet-streams">/ <a class="queet-stream list-subscribers" href="' + window.siteInstanceURL + pathSplit[0] + '/all/' + streamObject.nickname  + '/subscribers">' + window.sL.listSubscribers + '</a></div>';
			}
		return streamObject;
		}

	// {screen_name}/all/{listname}/subscribers
	if(pathSplit.length == 4 && /^[a-zA-Z0-9]+$/.test(pathSplit[0]) && pathSplit[1] == 'all' && /^[a-zA-Z0-9]+$/.test(pathSplit[2]) && pathSplit[3] == 'subscribers') {
		streamObject.name = 'list subscribers';
        streamObject.nickname = pathSplit[2];
		streamObject.parentPath = pathSplit[0] + '/all/' + pathSplit[2];
		streamObject.stream = 'qvitter/' + pathSplit[0] + '/lists/' + pathSplit[2] + '/subscribers.json';
		streamObject.maxIdOrPage = 'page';
		streamObject.type = 'users';
		if(window.loggedIn.screen_name == pathSplit[0]) {
			streamObject.streamHeader = window.sL.myListWithListName.replace('{list-name}',streamObject.nickname);
			streamObject.streamSubHeader = '<div class="queet-streams"><a class="queet-stream list-notice-stream" href="' + window.siteInstanceURL + pathSplit[0] + '/all/' + streamObject.nickname + '">' + window.sL.myListWithListName.replace('{list-name}',streamObject.nickname) + '</a> / <a class="queet-stream list-members" href="' + window.siteInstanceURL + pathSplit[0] + '/all/' + streamObject.nickname  + '/tagged">' + window.sL.listMembers + '</a> /</div>' + window.sL.listSubscribers;
			}
		else {
			streamObject.streamHeader = window.sL.nicknamesListWithListName.replace('{list-name}',streamObject.nickname).replace('{nickname}',pathSplit[0]);
			streamObject.streamSubHeader = '<div class="queet-streams"><a class="queet-stream list-notice-stream" href="' + window.siteInstanceURL + pathSplit[0] + '/all/' + streamObject.nickname + '">' + window.sL.nicknamesListWithListName.replace('{list-name}',streamObject.nickname).replace('{nickname}',pathSplit[0]) + '</a> / <a class="queet-stream list-members" href="' + window.siteInstanceURL + pathSplit[0] + '/all/' + streamObject.nickname  + '/tagged">' + window.sL.listMembers + '</a> /</div>' + window.sL.listSubscribers;
			}
		return streamObject;
		}


	// other plugins can add streams to Qvitter
	if(window.pluginStreamObjects.length > 0) {
		$.each(window.pluginStreamObjects,function(k,pluginStreamObject) {
			if(typeof pluginStreamObject.pathRegExp != 'undefined' && pluginStreamObject.pathRegExp.test(path)){
				$.extend(streamObject,pluginStreamObject);
				return false;
				}
			});
		return streamObject;
		}

	return false;
	}




/* ·
   ·
   ·   Get stream from location bar
   ·
   · · · · · · · · · */

function getStreamFromUrl() {

	var streamObject = URLtoStreamRouter(window.location.href);

	if(streamObject.stream) {
		return streamObject;
		}
	// fallback to friends timeline or public timeline if URLtoStreamRouter can't find a stream
	else if(window.loggedIn) {
		return pathToStreamRouter(window.loggedIn.screen_name + '/all');
		}
	else if(window.siteLocalOnlyDefaultPath) {
		return pathToStreamRouter('main/public');
		}
	else {
		return pathToStreamRouter('main/all');
		}

	}
