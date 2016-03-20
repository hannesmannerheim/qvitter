
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
   ·   Current time in milliseconds, to send with each request to make sure
   ·   we're not getting 304 responses.
   ·
   ·
   · · · · · · · · · · · · · */

function timeNow() {
	return new Date().getTime();
	}



/* ·
   ·
   ·   Get a document and replace strings
   ·
   ·   @param doc: the name of the document
   ·   @param actionOnSuccess: callback function to run on success
   ·
   · · · · · · · · · · · · · */

function getDoc(doc, actionOnSuccess) {
	var timeNow = new Date().getTime();

	$.ajax({ url: window.fullUrlToThisQvitterApp + 'doc/' + window.selectedLanguage + '/' + doc + '.html',
		cache: false,
		type: "GET",
		success: function(data) {
			actionOnSuccess(renderDoc(data));
			},
		error: function() {
			// default to english if we can't find the doc in selected language
			$.ajax({ url: window.fullUrlToThisQvitterApp + 'doc/en/' + doc + '.html',
				cache: false,
				type: "GET",
				success: function(data) {
					actionOnSuccess(renderDoc(data));
					}
				});
			}
		});
	}
function renderDoc(docHtml) {
	docHtml = docHtml.replace(/{instance-name}/g,window.siteTitle);
	docHtml = docHtml.replace(/{instance-url}/g,window.siteRootDomain);
	docHtml = docHtml.replace(/{instance-url-with-protocol}/g,window.siteInstanceURL);
	docHtml = docHtml.replace(/{nickname}/g,window.loggedIn.screen_name);
	docHtml = docHtml.replace(/{instance-email}/g,window.siteEmail);
	docHtml = docHtml.replace(/{instance-license-title}/g,window.siteLicenseTitle);
	docHtml = docHtml.replace(/{instance-license-url}/g,window.siteLicenseURL);
	return docHtml;
	}

/* ·
   ·
   ·   Check login credentials with http basic auth
   ·
   ·   @param username: users screen name
   ·   @param password: users password
   ·   @param actionOnSuccess: callback function on log in success
   ·
   · · · · · · · · · */

function checkLogin(username,password,actionOnSuccess) {
 	$.ajax({ url: window.apiRoot + 'qvitter/checklogin.json',
		cache: false,
		type: 'POST',
	 	data: {
			username: username,
			password: password
			},
	 	dataType: 'json',
	 	error: function(data) {
	 		shakeLoginBox();
			if(data.status === 403) {
				showErrorMessage(window.sL.silenced);
				}
	 		},
 		success: function(data) {
			if(typeof data.error == 'undefined' && data !== false) {
				actionOnSuccess(data);
				}
			else {
		 		shakeLoginBox();
				}
			}
		});
	}


/* ·
   ·
   ·   Generic API GET request
   ·
   ·   @param stream: any api get-request e.g. 'statuses/favs/111111.json'
   ·   @param actionOnSuccess: callback function
   ·
   · · · · · · · · · · · · · */

function getFromAPI(stream, actionOnSuccess) {
	var url = window.apiRoot + stream;
	$.ajax({ url: url,
		cache: false,
		type: "GET",
		dataType: 'json',
		statusCode: {
			401:function() {
				location.reload(); // we may have been logged out in another tab, reload page
				}
			},
		success: function(data, textStatus, request) {

			// if there's no Qvitter-Notifications header, it means we're logged out
			// so if it's missing and Qvitter still thinks we're logged in, reload page
			// we've probably been logged out in another tab or something
			if(request.getResponseHeader('Qvitter-Notifications') === null && window.loggedIn !== false) {
				location.reload();
				return;
				}

			displayOrHideUnreadNotifications(request.getResponseHeader('Qvitter-Notifications'));

			// parse and cache any user arrays in header
			var userArray = false;
			if(request.getResponseHeader('Qvitter-User-Array') !== null) {
                var qvitterUserArrayHeader = request.getResponseHeader('Qvitter-User-Array');

				// quitter.se fix
				if(window.thisSiteThinksItIsHttpButIsActuallyHttps) {
					qvitterUserArrayHeader = qvitterUserArrayHeader.replace(new RegExp('http:\\\\/\\\\/' + window.siteRootDomain, 'g'), 'https:\/\/' + window.siteRootDomain);
					}

				userArray = iterateRecursiveReplaceHtmlSpecialChars($.parseJSON(qvitterUserArrayHeader));
				userArrayCacheStore(userArray);
				}

			data = convertEmptyObjectToEmptyArray(data);
			data = iterateRecursiveReplaceHtmlSpecialChars(data);
			searchForUserDataToCache(data);
			updateUserDataInStream();
			searchForUpdatedNoticeData(data);

			actionOnSuccess(data, userArray, request, url);
			},
		error: function(data, textStatus, errorThrown) {
			data.textStatus = textStatus;
			data.errorThrown = errorThrown;
			actionOnSuccess(false, false, data, url);
			remove_spinner();
			}
		});
	}

/* ·
   ·
   ·   Hello to the API! When saying hello you will e.g. also get headers
   ·   with up-to-date unread notifications count to update etc
   ·
   ·   @param callback: function to invoke when done
   ·
   · · · · · · · · · · · · · */

function helloAPI(callback) {
	getFromAPI('qvitter/hello.json',function(){
		if(typeof callback == 'function') {
			callback();
			}
		});
	}


/* ·
   ·
   ·   Get all people we follow, all groups we're in and everyone we've blocked
   ·   Store in global objects
   ·
   ·   @param callback: function to invoke when done
   ·
   · · · · · · · · · · · · · */

function getAllFollowsMembershipsAndBlocks(callback) {

	if(window.loggedIn === false) {
		return;
		}

	window.following = new Object();
	window.groupMemberships = new Object();
	window.groupNicknamesAndLocalAliases = new Array();
	window.allBlocking = new Array();

	getFromAPI('qvitter/allfollowing/' + window.loggedIn.screen_name + '.json',function(data){

		if(data.users) {
			$.each(data.users,function(k,v){
				if(v[2] === false) { var avatar = window.defaultAvatarStreamSize; }
				else { 	var avatar = v[2]; }
				if(v[3]) {
					// extract server base url
					v[3] = v[3].substring(v[3].indexOf('://')+3,v[3].lastIndexOf(v[1])-1);
					}
				v[0] = v[0] || v[1]; // if name is null we go with username there too
				window.following[k] = { 'id': k,'name': v[0], 'username': v[1],'avatar': avatar, 'url':v[3] };
				});
			}

		if(data.groups) {
			$.each(data.groups,function(k,v){
				if(v[2] === false || v[2] === null) { var avatar = window.defaultAvatarStreamSize; }
				else { 	var avatar = v[2]; }
				if(v[3]) {
					// extract server base url
					v[3] = v[3].substring(v[3].indexOf('://')+3);
					v[3] = v[3].substring(0, v[3].indexOf('/'));
					}
				v[0] = v[0] || v[1]; // if name is null we go with username there too
				window.groupMemberships[k] = { 'id': k,'name': v[0], 'username': v[1],'avatar': avatar, 'url':v[3] };
				window.groupNicknamesAndLocalAliases[k] = v[1];
				});
			}

		if(data.blocks)	{
			window.allBlocking = data.blocks;
			markAllNoticesFromBlockedUsersAsBlockedInJQueryObject($('body'));
			}

		if(typeof callback == 'function') {
			callback();
			}
		});
	}




/* ·
   ·
   ·   Get user nickname by user id
   ·
   ·   @param id: local user id
   ·   @param callback: function to invoke when done
   ·
   · · · · · · · · · · · · · */

function getNicknameByUserIdFromAPI(id, callback) {
	display_spinner();
	getFromAPI('users/show.json?id=' + id, function(data){
		remove_spinner();
		if(data && typeof data.screen_name != 'undefined') {
			callback(data.screen_name);
			}
		else {
			callback(false);
			}
		});
	}


/* ·
   ·
   ·   Get group nickname by group id
   ·
   ·   @param id: local group id
   ·   @param callback: function to invoke when done
   ·
   · · · · · · · · · · · · · */

function getNicknameByGroupIdFromAPI(id, callback) {
	display_spinner();
	getFromAPI('statusnet/groups/show/' + id + '.json', function(data){
		remove_spinner();
		if(data && typeof data.nickname != 'undefined') {
			callback(data.nickname);
			}
		else {
			callback(false);
			}
		});
	}


/* ·
   ·
   ·   Update the bookmarks
   ·
   ·   @param newBookmarks: the new bookmarks object to save
   ·
   · · · · · · · · · · · · · */

function postUpdateBookmarks(newBookmarks) {
	var bookmarksString = JSON.stringify(newBookmarks);
	$.ajax({ url: window.apiRoot + 'qvitter/update_bookmarks.json',
		cache: false,
		type: "POST",
		data: {
			bookmarks: bookmarksString
			},
		dataType:"json",
		error: function(data){ console.log('error updating bookmarks'); },
		success: function(data) {
			// console.log('bookmarks updated successfully');
			}
		});
	}


/* ·
   ·
   ·   Post new link color
   ·
   ·   @param newLinkColor: the new link color in hex without #
   ·
   · · · · · · · · · · · · · */

function postNewLinkColor(newLinkColor) {
	$.ajax({ url: window.apiRoot + 'qvitter/update_link_color.json',
		cache: false,
		type: "POST",
		data: {
			linkcolor: newLinkColor
			},
		dataType:"json",
		error: function(data){ console.log(data); },
		success: function(data) {
			window.userLinkColor = newLinkColor;
			}
		});
	}



/* ·
   ·
   ·   Post new background color
   ·
   ·   @param newBackgroundColor: the new background color in hex without #
   ·
   · · · · · · · · · · · · · */

function postNewBackgroundColor(newBackgroundColor) {
	$.ajax({ url: window.apiRoot + 'qvitter/update_background_color.json',
		cache: false,
		type: "POST",
		data: {
			backgroundcolor: newBackgroundColor
			},
		dataType:"json",
		error: function(data){ console.log(data); },
		success: function(data) {
			// unset background image and set new color
			window.loggedIn.background_image = false;
			changeDesign({backgroundimage:false,backgroundcolor:newBackgroundColor});
			}
		});
	}


/* ·
   ·
   ·   Set a profile pref
   ·
   ·   @param namespace: the namespace field in the db table, should be 'qvitter'
   ·   @param topic: the topic field in the db table,
   ·   @param data: the data to set
   ·   @param callback: function to run when finished
   ·
   · · · · · · · · · · · · · */

function postSetProfilePref(namespace, topic, data, callback) {
	$.ajax({ url: window.apiRoot + 'qvitter/set_profile_pref.json',
		cache: false,
		type: "POST",
		data: {
			namespace: namespace,
			topic: topic,
			data: data
			},
		dataType:"json",
		error: function(data){ callback(false); },
		success: function(data) {
			callback(data);			}
		});
	}



/* ·
   ·
   ·   Post follow or unfollow user request
   ·
   ·   @param followOrUnfollow: either 'follow' or 'unfollow'
   ·   @param user_id: the user id of the user we want to follow
   ·   @param actionOnSuccess: callback function, false on error, data on success
   ·
   · · · · · · · · · · · · · */

function APIFollowOrUnfollowUser(followOrUnfollow,user_id,this_element,actionOnSuccess) {

	if(followOrUnfollow == 'follow') {
		var postRequest = 'friendships/create.json';
		}
	else if (followOrUnfollow == 'unfollow') {
		var postRequest = 'friendships/destroy.json';
		}

	$.ajax({ url: window.apiRoot + postRequest,
		cache: false,
		type: "POST",
		data: {
			user_id: user_id
			},
		dataType:"json",
		error: function(data){ actionOnSuccess(false,this_element); console.log(data); },
		success: function(data) {
			data = convertEmptyObjectToEmptyArray(data);
			data = iterateRecursiveReplaceHtmlSpecialChars(data);
			searchForUserDataToCache(data);
			updateUserDataInStream();
			actionOnSuccess(data,this_element);
			}
		});
	}

/* ·
   ·
   ·   Post block or unblock user request
   ·
   ·   @param blockOrUnblock: either 'block' or 'unblock'
   ·   @param user_id: the user id of the user we want to block/unblock
   ·   @param actionOnSuccess: callback function, false on error, data on success
   ·
   · · · · · · · · · · · · · */

function APIBlockOrUnblockUser(blockOrUnblock,user_id,actionOnSuccess) {

	if(blockOrUnblock == 'block') {
		var postRequest = 'blocks/create.json';
		}
	else if (blockOrUnblock == 'unblock') {
		var postRequest = 'blocks/destroy.json';
		}

	$.ajax({ url: window.apiRoot + postRequest,
		cache: false,
		type: "POST",
		data: {
			id: user_id
			},
		dataType:"json",
		error: function(data){ actionOnSuccess(false); console.log(data); },
		success: function(data) {
			data = convertEmptyObjectToEmptyArray(data);
			data = iterateRecursiveReplaceHtmlSpecialChars(data);
			searchForUserDataToCache(data);
			updateUserDataInStream();
			actionOnSuccess(data);
			}
		});
	}


/* ·
   ·
   ·   Post sandbox or unsandbox user request
   ·
   ·   @param createOrDestroy: either 'create' or 'destroy'
   ·   @param userId: the user id of the user we want to sandbox/unsandbox
   ·   @param actionOnSuccess: callback function, false on error, data on success
   ·
   · · · · · · · · · · · · · */

function APISandboxCreateOrDestroy(createOrDestroy,userId,actionOnSuccess) {
	$.ajax({ url: window.apiRoot + 'qvitter/sandbox/' + createOrDestroy + '.json',
		cache: false,
		type: "POST",
		data: {
			id: userId
			},
		dataType:"json",
		error: function(data){ actionOnSuccess(false); console.log('sandbox error'); console.log(data); },
		success: function(data) {
			data = convertEmptyObjectToEmptyArray(data);
			data = iterateRecursiveReplaceHtmlSpecialChars(data);
			searchForUserDataToCache(data);
			updateUserDataInStream();
			rememberStreamStateInLocalStorage();
			actionOnSuccess(data);
			}
		});
	}

/* ·
   ·
   ·   Post silence or unsilence user request
   ·
   ·   @param createOrDestroy: either 'create' or 'destroy'
   ·   @param userId: the user id of the user we want to silence/unsilence
   ·   @param actionOnSuccess: callback function, false on error, data on success
   ·
   · · · · · · · · · · · · · */

function APISilenceCreateOrDestroy(createOrDestroy,userId,actionOnSuccess) {
	$.ajax({ url: window.apiRoot + 'qvitter/silence/' + createOrDestroy + '.json',
		cache: false,
		type: "POST",
		data: {
			id: userId
			},
		dataType:"json",
		error: function(data){ actionOnSuccess(false); console.log('silence error'); console.log(data); },
		success: function(data) {
			data = convertEmptyObjectToEmptyArray(data);
			data = iterateRecursiveReplaceHtmlSpecialChars(data);
			searchForUserDataToCache(data);
			updateUserDataInStream();
			rememberStreamStateInLocalStorage();
			actionOnSuccess(data);
			}
		});
	}



/* ·
   ·
   ·   Post join or leave group request
   ·
   ·   @param joinOrLeave: either 'join' or 'leave'
   ·   @param group_id: group's id
   ·   @param actionOnSuccess: callback function, false on error, data on success
   ·
   · · · · · · · · · · · · · */

function APIJoinOrLeaveGroup(joinOrLeave,group_id,this_element,actionOnSuccess) {
	$.ajax({ url: window.apiRoot + 'statusnet/groups/' + joinOrLeave + '.json',
		cache: false,
		type: "POST",
		data: {
			id: group_id
			},
		dataType:"json",
		error: function(data){ actionOnSuccess(false,this_element); console.log(data); },
		success: function(data) {
			data = convertEmptyObjectToEmptyArray(data);
			data = iterateRecursiveReplaceHtmlSpecialChars(data);
			searchForUserDataToCache(data);
			updateUserDataInStream();
			actionOnSuccess(data,this_element);
			}
		});
	}


/* ·
   ·
   ·   Post queet
   ·
   ·   @param queetText_txt: the text to post
   ·   @param in_reply_to_status_id: the local id for the queet to reply to
   ·   @param postToGroups: post the queet in these groups, string of ids separated by colon expected, e.g. 5:2:4
   ·   @param actionOnSuccess: callback function, false on error, data on success
   ·
   · · · · · · · · · · · · · */

function postQueetToAPI(queetText_txt, in_reply_to_status_id, postToGroups, actionOnSuccess) {
	$.ajax({ url: window.apiRoot + 'qvitter/statuses/update.json',
		cache: false,
		type: "POST",
		data: {
			status: queetText_txt,
			source: 'Qvitter',
			in_reply_to_status_id: in_reply_to_status_id,
			post_to_groups: postToGroups
			},
		dataType:"json",
		error: function(data){ actionOnSuccess(false); console.log(data); },
		success: function(data) {
			data = convertEmptyObjectToEmptyArray(data);
			data = iterateRecursiveReplaceHtmlSpecialChars(data);
			searchForUserDataToCache(data);
			updateUserDataInStream();
			searchForUpdatedNoticeData(data);
			actionOnSuccess(data);
			}
		});
	}




/* ·
   ·
   ·   Generic POST-action
   ·
   ·   @param action: the api action, e.q. 'statuses/retweet/1.json'
   ·   @param actionOnSuccess: callback function, false on error, data on success
   ·
   · · · · · · · · · · · · · */

function postActionToAPI(action, actionOnSuccess) {
	$.ajax({ url: window.apiRoot + action,
		cache: false,
		type: "POST",
		data: {
			source: 'Qvitter'
			},
		dataType:"json",
		error: function(data){ actionOnSuccess(false); console.log(data); },
		success: function(data) {
			data = convertEmptyObjectToEmptyArray(data);
			data = iterateRecursiveReplaceHtmlSpecialChars(data);
			searchForUserDataToCache(data);
			updateUserDataInStream();
			searchForUpdatedNoticeData(data);
			actionOnSuccess(data);
			}
		});
	}



/* ·
   ·
   ·   Gets favs or requeets for a queet from api
   ·
   ·   @param q: stream item object
   ·   @param qid: the queet id
   ·
   · · · · · · · · · */

function getFavsAndRequeetsForQueet(q,qid) {

	// get immediately from localstorage cache
	var cacheData = localStorageObjectCache_GET('favsAndRequeets',qid);
	if(cacheData) {
		showFavsAndRequeetsInQueet(q, cacheData);
		}

	$.ajax({ url: window.apiRoot + "qvitter/favs_and_repeats/" + qid + ".json",
		cache: false,
		type: "GET",
		dataType: 'json',
		success: function(data) {

			data = iterateRecursiveReplaceHtmlSpecialChars(data);

			if(data.favs.length > 0 || data.repeats.length > 0) {
				localStorageObjectCache_STORE('favsAndRequeets',qid, data); // cache response
				}
			else {
				// remove from cache and DOM if all favs and repeats are deleted
				localStorageObjectCache_STORE('favsAndRequeets',qid, false);
				}

			showFavsAndRequeetsInQueet(q,data);
			},
		error: function(data) {
			remove_spinner();
			console.log(data);
			}
		});
	}
