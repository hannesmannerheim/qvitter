
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
  ·   Contact h@nnesmannerhe.im if you have any questions.                      ·
  ·                                                                             · 
  · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · */


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
 	$.ajax({ url: window.fullUrlToThisQvitterApp + 'API.php', 
	 	type: 'POST',
		data: {
			getRequest: "account/verify_credentials.json",
			username: username,
			password: password
			},	 	
	 	dataType: 'json', 
	 	error: function() {
	 		logoutWithoutReload(true);
	 		},
 		success: function(data) { 
 						
			if(typeof data.error == 'undefined') {
				actionOnSuccess(data);
				}
			else {
				// if no stream is set, get the one from the url
				if(typeof window.currentStream == 'undefined' || window.currentStream == '') {
					setNewCurrentStream(getStreamFromUrl(),function(){
						logoutWithoutReload(true);
						remove_spinner();			
						},true);					
					}
				// if we have a strem, just just do logout and shake...
				else {
					logoutWithoutReload(true);									
					remove_spinner();					
					}
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
	
	// request without username/password
	if(typeof window.loginUsername == 'undefined') {
		$.ajax({ url: window.fullUrlToThisQvitterApp + 'API.php', 
			type: "POST", 
			data: {
				getRequest: stream
				},			
			dataType: 'json', 
			success: function(data) { 
				actionOnSuccess(data);				
				},
			error: function(data) {
				actionOnSuccess(false);
				console.log(data);
				remove_spinner();	
				}
			});			
		}
	// with username/password if set
	else {
		$.ajax({ url: window.fullUrlToThisQvitterApp + 'API.php', 
			type: "POST", 
			data: {
				getRequest: stream,
				username: window.loginUsername,
				password: window.loginPassword
				},			
			dataType: 'json', 
			success: function(data) { 
				actionOnSuccess(data);				
				},
			error: function(data) {
				actionOnSuccess(false);
				console.log(data);	
				remove_spinner();				
				}
			});			
		}	
	}	

	
	
/* · 
   · 
   ·   Post queet
   ·
   ·   @param queetText_txt: the text to post
   ·   @param actionOnSuccess: callback function, false on error, data on success
   ·   
   · · · · · · · · · · · · · */ 
   
function postQueetToAPI(queetText_txt, actionOnSuccess) {
	$.ajax({ url: window.fullUrlToThisQvitterApp + 'API.php', 
		type: "POST", 
		data: { 
			postRequest: 'statuses/update.json',
			status: queetText_txt,
			source: 'Qvitter',
			username: window.loginUsername,
			password: window.loginPassword
			},
		dataType: "json",
		error: function(data){ actionOnSuccess(false); console.log(data); },
		success: function(data) { actionOnSuccess(data);}
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
	$.ajax({ url: 'API.php', 
		type: "POST", 
		data: { 
			postRequest: 'account/update_link_color.json',
			linkcolor: newLinkColor,
			username: window.loginUsername,
			password: window.loginPassword
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
	$.ajax({ url: 'API.php', 
		type: "POST", 
		data: { 
			postRequest: 'account/update_background_color.json',
			backgroundcolor: newBackgroundColor,
			username: window.loginUsername,
			password: window.loginPassword
			},
		dataType:"json",
		error: function(data){ console.log(data); },
		success: function(data) { 
			window.userBackgroundColor = newBackgroundColor;			
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
		var postRequest = 'friendships/create.json';
		}
	else if (followOrUnfollow == 'unfollow') {
		var postRequest = 'friendships/destroy.json';
		}
	
	$.ajax({ url: window.fullUrlToThisQvitterApp + 'API.php', 
		type: "POST", 
		data: { 
			postRequest: postRequest,
			user_id: user_id,
			username: window.loginUsername,
			password: window.loginPassword
			},
		dataType:"json",
		error: function(data){ actionOnSuccess(false,this_element); console.log(data); },
		success: function(data) { actionOnSuccess(data,this_element);}
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
	$.ajax({ url: window.fullUrlToThisQvitterApp + 'API.php', 
		type: "POST", 
		data: { 
			postRequest: 'statusnet/groups/' + joinOrLeave + '.json',
			id: group_id,
			username: window.loginUsername,
			password: window.loginPassword
			},
		dataType:"json",
		error: function(data){ actionOnSuccess(false,this_element); console.log(data); },
		success: function(data) { actionOnSuccess(data,this_element);}
		});	
	}		
		

/* · 
   · 
   ·   Post reply
   ·
   ·   @param queetText_txt: the text to post
   ·   @param in_reply_to_status_id: the local id for the queet to reply to
   ·   @param actionOnSuccess: callback function, false on error, data on success
   ·   
   · · · · · · · · · · · · · */ 
   
function postReplyToAPI(queetText_txt, in_reply_to_status_id, actionOnSuccess) {
	$.ajax({ url: window.fullUrlToThisQvitterApp + 'API.php', 
		type: "POST", 
		data: { 
			postRequest: 'statuses/update.json',
			status: queetText_txt,
			source: 'Qvitter',
			username: window.loginUsername,
			password: window.loginPassword,
			in_reply_to_status_id: in_reply_to_status_id
			},
		dataType:"json",
		error: function(data){ actionOnSuccess(false); console.log(data); },
		success: function(data) { actionOnSuccess(data);}
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
	$.ajax({ url: window.fullUrlToThisQvitterApp + 'API.php', 
		type: "POST", 
		data: { 
			postRequest: action,
			source: 'Qvitter',
			username: window.loginUsername,
			password: window.loginPassword
			},
		dataType:"json",
		error: function(data){ actionOnSuccess(false); console.log(data); },
		success: function(data) { actionOnSuccess(data);}
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
   ·   @param apiaction: i.e. 'favs' or 'requeets' 
   ·   @param qid: the queet id
   ·   @param actionOnSuccess: callback function
   · 
   · · · · · · · · · */
    
function getFavsOrRequeetsForQueet(apiaction,qid,actionOnSuccess) { 
	if(apiaction=="requeets") { apiaction="retweets"; } // we might mix this up...
	$.ajax({ url: window.fullUrlToThisQvitterApp + 'API.php',
		type: "POST", 
		data: {
			getRequest: "statuses/" + apiaction + "/" + qid + ".json",
			username: window.loginUsername,
			password: window.loginPassword			
			},
		dataType: 'json', 
		success: function(data) { 			
			if(data.length > 0) {
				actionOnSuccess(data);			
				}
			else {
				actionOnSuccess(false);
				}
			}, 
		error: function(data) { 
			remove_spinner();
			console.log(data); 
			}
		});  
	}
	
/* · 
   · 
   ·   Shorten urls in box 
   ·
   ·   @param apiaction: i.e. 'favs' or 'requeets' 
   ·   @param qid: the queet id
   ·   @param actionOnSuccess: callback function
   ·
   ·   params included to pass along to countCharsInQueetBox
   ·   
   · · · · · · · · · · · · · */ 	
   
function shortenUrlsInBox(box,cnt,btn) {
	// wrap urls
//	var allurls = findUrls(box.html().replace(/&amp;/gi,'&').replace(/&nbsp;/gi,' '));
//	$.each(allurls,function(key,obj){
//		if(obj.substring(0,15) != 'http://qttr.at/' && obj.length > 20) { // don't shorten if link is qttr.at or very short already
//			box.html(box.html().replace(/&amp;/gi,'&').replace(obj,'<a class="shortening">' + obj + '</a>'));
//			placeCaretAtEnd(document.getElementById(box.attr('id')));		
//			}
//		});		
//	
//	// shorten urls vith qttr.at
//	$.each(box.find('a.shortening'),function(key,obj){
//		display_spinner();
//		var urlEncodedUrl = encodeURIComponent($(obj).html().replace(/&amp;/gi,'&'));
//		$.ajax({ url: "http://qttr.at/yourls-api.php?format=jsonp&action=shorturl&signature=b6afeec983&url=" + urlEncodedUrl, type: "GET", dataType: "jsonp", success: function(data) { 				
//			if(typeof data.shorturl != 'undefined') {
//				$(obj).before(data.shorturl);
//				}
//			else {
//				$(obj).before($(obj).html());								
//				}
//			$(obj).remove();					
//			remove_spinner();	
//			placeCaretAtEnd(document.getElementById(box.attr('id')));
//			countCharsInQueetBox(box,cnt,btn);				
//			}});
//		});	
	}	

