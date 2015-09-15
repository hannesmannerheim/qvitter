
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
	$.get(window.fullUrlToThisQvitterApp + 'doc/' + window.selectedLanguage + '/' + doc + '.html?t=' + timeNow, function(data){
		if(data) {
			actionOnSuccess(renderDoc(data));
			}
		}).fail(function() { // default to english if we can't find the doc in selected language
			$.get(window.fullUrlToThisQvitterApp + 'doc/en/' + doc + '.html?t=' + timeNow, function(data){
				if(data) {
					actionOnSuccess(renderDoc(data));
					}
				});
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
	 	type: 'POST',
	 	data: {
			username: username,
			password: password
			},
	 	dataType: 'json',
	 	error: function() {
	 		logoutWithoutReload(true);
	 		},
 		success: function(data) {
			if(typeof data.error == 'undefined' && data !== false) {
				actionOnSuccess(data);
				}
			else {
		 		logoutWithoutReload(true);
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
	$.ajax({ url: window.apiRoot + stream + qOrAmp(stream) + 't=' + timeNow(),
		type: "GET",
		dataType: 'json',
		statusCode: {
			401:function() {
				location.reload(); // we may have been logged out in another tab, reload page
				},
			404:function() {
				// redirect to frontpage when trying to access non-existing users
				if(stream.indexOf('statuses/user_timeline.json?screen_name=') > -1) {
					window.location.replace(window.siteInstanceURL);
					}
				}
			},
		success: function(data, textStatus, request) {

			displayOrHideUnreadNotifications(request.getResponseHeader('Qvitter-Notifications'));

			// profile card from user array, also cache it
			if(request.getResponseHeader('Qvitter-User-Array') !== null) {

                // while waiting for this data user might have changed stream, so only proceed if current stream still is this one
                if(window.currentStream == stream.replace('&withuserarray=1','')) {
                    var qvitterUserArrayHeader = request.getResponseHeader('Qvitter-User-Array');

    				// quitter.se fix
    				if(window.thisSiteThinksItIsHttpButIsActuallyHttps) {
    					qvitterUserArrayHeader = qvitterUserArrayHeader.replace(new RegExp('http:\\\\/\\\\/' + window.siteRootDomain, 'g'), 'https:\/\/' + window.siteRootDomain);
    					}

    				var userArray = iterateRecursiveReplaceHtmlSpecialChars($.parseJSON(qvitterUserArrayHeader));
    				userArrayCacheStore(userArray);
    				addProfileCardToDOM(buildProfileCard(userArray));
                    }
				}

			data = convertEmptyObjectToEmptyArray(data);
			data = iterateRecursiveReplaceHtmlSpecialChars(data);
			searchForUserDataToCache(data);

			actionOnSuccess(data);
			},
		error: function(data) {
			actionOnSuccess(false);
			console.log(data);
			remove_spinner();
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
	$.ajax({ url: window.apiRoot + 'qvitter/update_bookmarks.json?t=' + timeNow(),
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
	$.ajax({ url: window.apiRoot + 'qvitter/update_link_color.json?t=' + timeNow(),
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
	$.ajax({ url: window.apiRoot + 'qvitter/update_background_color.json?t=' + timeNow(),
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
   ·   Post follow or unfollow user request
   ·
   ·   @param followOrUnfollow: either 'follow' or 'unfollow'
   ·   @param user_id: the user id of the user we want to follow
   ·   @param actionOnSuccess: callback function, false on error, data on success
   ·
   · · · · · · · · · · · · · */

function APIFollowOrUnfollowUser(followOrUnfollow,user_id,this_element,actionOnSuccess) {

	if(followOrUnfollow == 'follow') {
		var postRequest = 'friendships/create.json?t=' + timeNow();
		}
	else if (followOrUnfollow == 'unfollow') {
		var postRequest = 'friendships/destroy.json?t=' + timeNow();
		}

	$.ajax({ url: window.apiRoot + postRequest,
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
			actionOnSuccess(data,this_element);
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
	$.ajax({ url: window.apiRoot + 'statusnet/groups/' + joinOrLeave + '.json?t=' + timeNow(),
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
	$.ajax({ url: window.apiRoot + 'statuses/update.json?t=' + timeNow(),
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
	$.ajax({ url: window.apiRoot + action + qOrAmp(action) + 't=' + timeNow(),
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
			actionOnSuccess(data);
			}
		});
	}


/* ·
   ·
   ·   Delete requeet
   ·
   ·   @param this_stream_item: jQuery object for stream-item
   ·   @param this_action: JQuery object for the requeet-button
   ·   @param my_rq_id: the id for the requeet
   ·
   · · · · · · · · · */

function unRequeet(this_stream_item, this_action, my_rq_id) {
	this_action.children('.with-icn').removeClass('done');
	this_action.find('.with-icn b').html(window.sL.requeetVerb);
	this_stream_item.removeClass('requeeted');

	// post unrequeet
	postActionToAPI('statuses/destroy/' + my_rq_id + '.json', function(data) {
		if(data) {
			remove_spinner();
			this_stream_item.removeAttr('data-requeeted-by-me-id');
			this_stream_item.children('.queet').children('.context').find('.requeet-text').children('a[data-user-id="' + window.myUserID + '"]').remove();
			if(this_stream_item.children('.queet').children('.context').find('.requeet-text').children('a').length<1) {
				this_stream_item.children('.queet').children('.context').remove();
				}
			getFavsAndRequeetsForQueet(this_stream_item, this_stream_item.attr('data-quitter-id'));
			}
		else {
			remove_spinner();
			this_action.children('.with-icn').addClass('done');
			this_action.find('.with-icn b').html(window.sL.requeetedVerb);
			this_stream_item.addClass('requeeted');
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

	$.ajax({ url: window.apiRoot + "qvitter/favs_and_repeats/" + qid + ".json?t=" + timeNow(),
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
