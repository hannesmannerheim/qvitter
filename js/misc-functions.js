
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
   ·   Store in localStorage object cache
   · 
   ·   @param name: the name of this type of object
   ·   @param unique_id: some unique_id – the key in localStorage will be name-unique_id
   ·   @param object: the object to store
   · 
   · · · · · · · · · */
   
function localStorageObjectCache_STORE(name, unique_id, object) {

	if(localStorageIsEnabled()) {

		if(object.length < 1) {
			// an empty object means we remove this entry
			if(typeof localStorage[name + '-' + unique_id] != 'undefined' && localStorage[name + '-' + unique_id] !== null) {			
				delete localStorage[name + '-' + unique_id];
				}
			}
		else {

			var dataToSave = {};
			dataToSave.modified = Date.now();
			dataToSave.data = object;

			try {
				localStorage.setItem(name + '-' + unique_id, JSON.stringify(dataToSave));
				}
			catch (e) {
				if (e.name == 'QUOTA_EXCEEDED_ERR' || e.name == 'NS_ERROR_DOM_QUOTA_REACHED' || e.name == 'QuotaExceededError' || e.name == 'W3CException_DOM_QUOTA_EXCEEDED_ERR') {
					
					removeOldestLocalStorageEntries(function(){
						localStorageObjectCache_STORE(name, unique_id, object);
						});
					
					}
				else {
					console.log('could not store in localStorage, unknown error');
					}
				}
			}			
		}	
	}

/* ·  
   · 
   ·   Remove the 100 oldest cached items
   · 
   · · · · · · · · · */

function removeOldestLocalStorageEntries(callback) {	

	// grab the expiry and store the modified-key into an object
	var modified = Object.keys(localStorage).reduce(function(collection,key){
		var currentModified = JSON.parse(localStorage.getItem(key)).modified;
		collection[currentModified] = key;
		return collection;
		},{});
		
	delete modified['undefined']; // we don't want those

	// get the modified dates into an array
	var modifiedDates = Object.keys(modified);
	
	modifiedDates.sort();
	
	var i = 0;
	$.each(modifiedDates,function(k,v){
		delete localStorage[modified[v]];		
		i++;
		if(i>=100) {
			return false;
			}
		});

	console.log('removed 100 old localstorage items');

	callback();
	}


/* ·  
   · 
   ·   Get from localStorage object cache
   · 
   ·   @param name: the name of this type of object
   ·   @param unique_id: some unique_id – the key in localStorage will be name-unique_id
   ·   @param callback: callback function, returns false if not found
   · 
   · · · · · · · · · */
   
function localStorageObjectCache_GET(name, unique_id, callback) {

	if(localStorageIsEnabled()) {
		if(typeof localStorage[name + '-' + unique_id] != 'undefined' && localStorage[name + '-' + unique_id] !== null) {
			var parsedObject = JSON.parse(localStorage[name + '-' + unique_id]);
			if(typeof parsedObject.modified == 'undefined' || parsedObject.modified === null) {			
				// invalid or old localstorage object found, check the whole localstorage!
				checkLocalStorage();
				callback(false);
				}
			else {
				callback(parsedObject.data);				
				}
			}
		else {
			callback(false);
			}
		}
	else {
		callback(false);
		}	
	}

function checkLocalStorage() {

	if(localStorageIsEnabled() === false) {
		console.log('localstorage disabled');
		return false;
		}

	console.log('checking localStorage for invalid entries');
	var dateNow = Date.now()
	var corrected = 0;
	var deleted = 0;
	$.each(localStorage, function(k,entry){
		if(typeof entry == 'string') {

			// check that entry is valid json
			try {
				var entryParsed = JSON.parse(entry);			
				}
			catch(e) {
				delete localStorage[k];
				deleted++;
				return true;
				} 
			
			// check that it is a valid/currently used data type
			var validDataTypes = [
				'browsingHistory',
				'conversation',
				'favsAndRequeets',
				'languageData',
				'fullQueetHtml',
				'selectedLanguage'
				];
			var thisDataType = k.substring(0,k.indexOf('-'));
			if($.inArray(thisDataType, validDataTypes) == -1 || k.indexOf('-') == -1) {
				delete localStorage[k];
				deleted++;
				return true;								
				}	
				
			// check that it has a modified entry, if not: add one				
			if(typeof entryParsed.modified == 'undefined' || entryParsed.modified === null) {
				var newEntry = {};
				newEntry.modified = dateNow - corrected; // we want as unique dates as possible
				newEntry.data = entryParsed;
				try {
					localStorage.setItem(k, JSON.stringify(newEntry));
					}
				catch (e) {
					if (e.name == 'QUOTA_EXCEEDED_ERR' || e.name == 'NS_ERROR_DOM_QUOTA_REACHED' || e.name == 'QuotaExceededError' || e.name == 'W3CException_DOM_QUOTA_EXCEEDED_ERR') {
						removeOldestLocalStorageEntries(function(){
							localStorage.setItem(k, JSON.stringify(newEntry));
							});
						}
					}
				corrected++;
				}			
			}			
		});
	console.log(corrected + ' entries corrected, ' + deleted + ' entries deleted');	
	}


/* ·  
   · 
   ·  User array cache
   ·  
   ·  Stored in window.userArrayCache as instance_url/nickname
   ·  with protocol (http:// or https://) trimmed off, e.g. "quitter.se/hannes2peer"
   ·       
   · · · · · · · · · */

window.userArrayCache = new Object();

function userArrayCacheStore(data) {

	if(typeof data == 'undefined') {
		return false;
		}
	
	// if we are passed a data object with both local and external data, use external data as key
	if(typeof data.local != 'undefined' 
	&& typeof data.local.statusnet_profile_url != 'undefined' 
	&& typeof data.external != 'undefined' 
	&& typeof data.external.statusnet_profile_url != 'undefined') {
		var instanceUrlWithoutProtocol = guessInstanceUrlWithoutProtocolFromProfileUrlAndNickname(data.external.statusnet_profile_url, data.external.screen_name);
		var key = instanceUrlWithoutProtocol + '/' + data.external.screen_name;		
		var dataToStore = data;
		}
	// we can also get either local...
	else if(typeof data.local != 'undefined' && typeof data.local.statusnet_profile_url != 'undefined' ) {
		var instanceUrlWithoutProtocol = guessInstanceUrlWithoutProtocolFromProfileUrlAndNickname(data.local.statusnet_profile_url, data.external.screen_name);
		var key = instanceUrlWithoutProtocol + '/' + data.external.screen_name;		
		data.external = false;
		var dataToStore = data;
		}
	// ...or external...
	else if(typeof data.external != 'undefined' && typeof data.external.statusnet_profile_url != 'undefined' ) {
		var instanceUrlWithoutProtocol = guessInstanceUrlWithoutProtocolFromProfileUrlAndNickname(data.external.statusnet_profile_url, data.external.screen_name);
		var key = instanceUrlWithoutProtocol + '/' + data.external.screen_name;				
		data.local = false;
		var dataToStore = data;
		}
	// ...or an unspecified data object, in which case we check the avatar urls to see if it's local or external
	else if (typeof data.statusnet_profile_url != 'undefined') {
		var instanceUrlWithoutProtocol = guessInstanceUrlWithoutProtocolFromProfileUrlAndNickname(data.statusnet_profile_url, data.screen_name);
		var key = instanceUrlWithoutProtocol + '/' + data.screen_name;				
		
		var dataProfileImageUrlWithoutProtocol = removeProtocolFromUrl(data.profile_image_url);
		var siteInstanceURLWithoutProtocol = removeProtocolFromUrl(window.siteInstanceURL);
		
		// local
		if(dataProfileImageUrlWithoutProtocol.substring(0,siteInstanceURLWithoutProtocol.length) == siteInstanceURLWithoutProtocol){
			var dataToStore = {local:data,external:false};
			}
		// external
		else {
			var dataToStore = {external:data,local:false};			
			}
		}
	else {
		return false;
		}
	
	// store
	if(typeof window.userArrayCache[key] == 'undefined') {
		window.userArrayCache[key] = dataToStore;		
		}
	else {
		if(dataToStore.local) {
			
			// keep old status if newer data doesn't have any
			if(typeof dataToStore.local.status == 'undefined' && typeof window.userArrayCache[key].local.status != 'undefined') {
				dataToStore.local.status = window.userArrayCache[key].local.status;
				}
			
			window.userArrayCache[key].local = dataToStore.local;					
			}
		if(dataToStore.external) {
			window.userArrayCache[key].external = dataToStore.external;					
			}		
		}
	}
	
function userArrayCacheGetByLocalNickname(localNickname) {
	if(typeof window.userArrayCache[window.siteRootDomain + '/' + localNickname] != 'undefined') {
		return window.userArrayCache[window.siteRootDomain + '/' + localNickname];
		}
	else {
		return false;
		}
	}
	
function userArrayCacheGetByProfileUrlAndNickname(profileUrl, nickname) {
	var guessedInstanceUrl = guessInstanceUrlWithoutProtocolFromProfileUrlAndNickname(profileUrl, nickname);
	if(typeof window.userArrayCache[guessedInstanceUrl + '/' + nickname] == 'undefined') {
		return false;
		}
	else {
		return window.userArrayCache[guessedInstanceUrl + '/' + nickname];
		}
	}	



/* ·  
   · 
   ·  Guess instance's base installation url without protocol from a profile url
   · 
   · · · · · · · · · */

function guessInstanceUrlWithoutProtocolFromProfileUrlAndNickname(profileUrl, nickname) {

	// remove protocol
	var guessedInstanceUrl = removeProtocolFromUrl(profileUrl)

	// user/id-style profile urls
	if(guessedInstanceUrl.indexOf('/user/') > -1 &&
	   $.isNumeric(guessedInstanceUrl.substring(guessedInstanceUrl.lastIndexOf('/user/')+6))) {		
		guessedInstanceUrl = guessedInstanceUrl.substring(0,guessedInstanceUrl.lastIndexOf('/user/'));
		}
	
	// nickname-style profile urls
	else if(guessedInstanceUrl.substring(guessedInstanceUrl.lastIndexOf('/')+1) == nickname) {
		guessedInstanceUrl = guessedInstanceUrl.substring(0,guessedInstanceUrl.lastIndexOf('/'));
		}
	
	// remove trailing "index.php" if the instance doesn't use mod_rewrite
	if(guessedInstanceUrl.substring(guessedInstanceUrl.lastIndexOf('/')) == '/index.php') {
		guessedInstanceUrl = guessedInstanceUrl.substring(0,guessedInstanceUrl.lastIndexOf('/'));		
		}	

	// there was a bug once that made some instances have multiple /:s in their url,
	// so make sure there's no trailing /:s
	while (guessedInstanceUrl.slice(-1) == '/') {
		guessedInstanceUrl = guessedInstanceUrl.slice(0,-1);
		}

	return guessedInstanceUrl;
	}
    


/* ·  
   · 
   ·  Remove the protocol (e.g. "http://") from an URL
   · 
   · · · · · · · · · */

function removeProtocolFromUrl(url) {
	if(url.indexOf('://') == -1) {
		return url;
		}
	return url.substring(url.indexOf('://')+3);
	}



/* · 
   · 
   ·   Iterates recursively through an API response in search for user data to cache
   ·   If we find a "statusnet_profile_url" key we assume the parent is a user array/object   
   ·   
   · · · · · · · · · · · · · */ 


function searchForUserDataToCache(obj) {
	for (var property in obj) {
		if (obj.hasOwnProperty(property)) {
			if (typeof obj[property] == "object") {
				searchForUserDataToCache(obj[property]);
				}
			else if(typeof obj[property] == 'string' && property == 'statusnet_profile_url') {
				userArrayCacheStore(obj);
				}
			}
		}  
	}



/* ·  
   · 
   ·  Display unread notifications
   · 
   · · · · · · · · · */
    
function displayOrHideUnreadNotifications(notifications) { 
	
		var data = $.parseJSON(notifications);
		
		// if this is notifications page, we use the info from the hidden items in the feed
		if(window.currentStream == 'qvitter/statuses/notifications.json') { 
			var new_queets_num = $('#feed-body').find('.stream-item.notification.hidden').length;
			
			if(new_queets_num == 0) {
				document.title = window.siteTitle;
				$('#unseen-notifications').hide();
				}
			else {
				document.title = window.siteTitle + ' (' + new_queets_num + ')';
				$('#unseen-notifications').html(new_queets_num);	
				$('#unseen-notifications').show();												
				}
			}		
		// all other pages use the header info			
		else if(data === null || typeof data == 'undefined' || data.length == 0) {
			$('#unseen-notifications').hide();
			document.title = window.siteTitle;				
			}
		else {

			var totNotif = 0;
			$.each(data,function(k,v){
				totNotif = totNotif + parseInt(v,10);
				});

			if(totNotif>0) {
				$('#unseen-notifications').html(totNotif);
				document.title = window.siteTitle + ' (' + totNotif + ')'; // update html page title
				$('#unseen-notifications').show();	
				}
			else {
				$('#unseen-notifications').hide();	
				document.title = window.siteTitle;
				}
			}

	}


/* · 
   · 
   ·   Removes HTML special chars recursively from strings in objects
   ·   with exceptions: "statusnet_html" found in notices, which we assume
   ·   gnusocial already stripped from xss, and the "source" which should be
   ·   html rendered by gnusocial itself and not open for attacks
   ·
   ·   @param obj: the object to search and replace in
   ·   
   · · · · · · · · · · · · · */ 


function iterateRecursiveReplaceHtmlSpecialChars(obj) {
	for (var property in obj) {
		if (obj.hasOwnProperty(property)) {
			if (typeof obj[property] == "object") {
				iterateRecursiveReplaceHtmlSpecialChars(obj[property]);
				}
			else if(typeof obj[property] == 'string' && property != 'statusnet_html' && property != 'source') {
				obj[property] = replaceHtmlSpecialChars(obj[property]);
				}
			}
		}
	return obj;   
	}
function replaceHtmlSpecialChars(text) {
	var map = {
		'&': '&amp;',
		'<': '&lt;',
		'>': '&gt;',
		'"': '&quot;',
		"'": '&#039;'
		};
	return text.replace(/[&<>"']/g, function(m) { return map[m]; });
	}

/* ·  
   · 
   ·   Checks if localstorage is availible
   ·
   ·   We can't just do if(typeof localStorage.selectedLanguage != 'undefined')
   ·   because firefox with cookies disabled then freaks out and stops executing js completely
   · 
   · · · · · · · · · */  

function localStorageIsEnabled() {
	var mod = 'test';
	try {
		localStorage.setItem(mod, mod);
		localStorage.removeItem(mod);
		return true;
		}
	catch(e) {
		return false;
		}
	}
	
	
/* ·  
   · 
   ·   Checks if register form is valid
   · 
   ·   @returns true or false
   ·
   · · · · · · · · · */  

function validateRegisterForm(o) {
	
	var nickname 	= o.find('#signup-user-nickname-step2');
	var fullname 	= o.find('#signup-user-name-step2');	
	var email 		= o.find('#signup-user-email-step2');		
	var homepage 	= o.find('#signup-user-homepage-step2');
	var bio 		= o.find('#signup-user-bio-step2');
	var loc		 	= o.find('#signup-user-location-step2');
	var password1 	= o.find('#signup-user-password1-step2');
	var password2 	= o.find('#signup-user-password2-step2');
	var passwords 	= o.find('#signup-user-password1-step2,#signup-user-password2-step2');		
	
	var allFieldsValid = true;
	
	if(nickname.val().length>1 && /^[a-zA-Z0-9]+$/.test(nickname.val())) {
		nickname.removeClass('invalid'); } else { nickname.addClass('invalid'); if(allFieldsValid)allFieldsValid=false; }
		
	if(fullname.val().length < 255) {
		fullname.removeClass('invalid'); } else { fullname.addClass('invalid'); if(allFieldsValid)allFieldsValid=false; }		

	if(/^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(email.val())) {
		email.removeClass('invalid'); } else { email.addClass('invalid'); if(allFieldsValid)allFieldsValid=false; }		

	if($.trim(homepage.val()).length==0 || /^(ftp|http|https):\/\/[^ "]+$/.test(homepage.val())) {
		homepage.removeClass('invalid'); } else { homepage.addClass('invalid'); if(allFieldsValid)allFieldsValid=false; }		

	if(bio.val().length < 140) {
		bio.removeClass('invalid'); } else { bio.addClass('invalid'); if(allFieldsValid)allFieldsValid=false; }		

	if(loc.val().length < 255) {
		loc.removeClass('invalid'); } else { loc.addClass('invalid'); if(allFieldsValid)allFieldsValid=false; }		

	if(password1.val().length>5 && password2.val().length>5 && password1.val() == password2.val()) {
		passwords.removeClass('invalid'); } else { passwords.addClass('invalid'); if(allFieldsValid)allFieldsValid=false; }		
		
	return allFieldsValid;
	}	

/* ·  
   · 
   ·   Checks if edit profile form is valid
   · 
   ·   @returns true or false
   ·
   · · · · · · · · · */  

function validateEditProfileForm(o) {
	
	var fullname 	= o.find('input.fullname');	
	var homepage 	= o.find('input.url');
	var bio 		= o.find('textarea.bio');
	var loc		 	= o.find('input.location');
	
	var allFieldsValid = true;

	if(fullname.val().length < 255) {
		fullname.removeClass('invalid'); } else { fullname.addClass('invalid'); if(allFieldsValid)allFieldsValid=false; }		

	if($.trim(homepage.val()).length==0 || /^(ftp|http|https):\/\/[^ "]+$/.test(homepage.val())) {
		homepage.removeClass('invalid'); } else { homepage.addClass('invalid'); if(allFieldsValid)allFieldsValid=false; }		

	if(bio.val().length < 140) {
		bio.removeClass('invalid'); } else { bio.addClass('invalid'); if(allFieldsValid)allFieldsValid=false; }		

	if(loc.val().length < 255) {
		loc.removeClass('invalid'); } else { loc.addClass('invalid'); if(allFieldsValid)allFieldsValid=false; }		
		
	return allFieldsValid;
	}	


/* ·  
   · 
   ·   Validate a hex color and add # if missing
   · 
   ·   @returns hex color with # or false
   ·
   · · · · · · · · · */ 

function isValidHexColor(maybeValidHexColor) {
	
	if(maybeValidHexColor.substring(0,1) != '#') {
		maybeValidHexColor = '#' + maybeValidHexColor;
		}
	
	var validHexColor  = /(^#[0-9A-F]{6}$)|(^#[0-9A-F]{3}$)/i.test(maybeValidHexColor);
	if(validHexColor) {
		validHexColor = maybeValidHexColor;
		}
	return validHexColor;
	}


    
/* ·  
   · 
   ·   Change profile design
   ·
   ·   @param obj: user object that should contain one, two or all of backgroundimage, backgroundcolor and linkcolor
   ·               false or empty string unsets the parameter to default
   · 
   · · · · · · · · · */  

function changeDesign(obj) {
	
	// if we're logged out and this is the front page, we use the default design
	if(!window.loggedIn && window.currentStream == 'statuses/public_timeline.json') {
		obj.backgroundimage = window.fullUrlToThisQvitterApp + window.siteBackground;
		obj.backgroundcolor = window.defaultBackgroundColor;
		obj.linkcolor = window.defaultLinkColor;
		}
		
	
	// if no object is defined, abort
	if(typeof obj == 'undefined') {
		return false;
		}	
		
	// remember the design for this stream
	if(typeof window.oldStreamsDesigns[theUserOrGroupThisStreamBelongsTo(window.currentStream)] == 'undefined') {
		window.oldStreamsDesigns[theUserOrGroupThisStreamBelongsTo(window.currentStream)] = new Object();
		}
	
	// change design elements
	if(typeof obj.backgroundimage != 'undefined') {		
		if(obj.backgroundimage === false || obj.backgroundimage == '') {
			$('body').css('background-image','url(\'\')');
			}
		else if(obj.backgroundimage.length > 4) {
			$('body').css('background-image','url(\'' + obj.backgroundimage + '\')');			
			}
		window.oldStreamsDesigns[theUserOrGroupThisStreamBelongsTo(window.currentStream)].backgroundimage = obj.backgroundimage;			
		}		
	if(typeof obj.backgroundcolor != 'undefined') {
		if(obj.backgroundcolor === false || obj.backgroundcolor == '') {
			obj.backgroundcolor = window.defaultBackgroundColor;
			}
		changeBackgroundColor(obj.backgroundcolor);
		window.oldStreamsDesigns[theUserOrGroupThisStreamBelongsTo(window.currentStream)].backgroundcolor = obj.backgroundcolor;	
		}
	if(typeof obj.linkcolor != 'undefined') {
		if(obj.linkcolor === false || obj.linkcolor == '') {
			obj.linkcolor = window.defaultLinkColor;
			}
		changeLinkColor(obj.linkcolor);
		window.oldStreamsDesigns[theUserOrGroupThisStreamBelongsTo(window.currentStream)].linkcolor = obj.linkcolor;
		}
	}

// create object to remember designs on page load
window.oldStreamsDesigns = new Object();


/* ·  
   · 
   ·   Change background color
   ·
   ·   @param newLinkColor: hex value with or without #
   · 
   · · · · · · · · · */  

function changeBackgroundColor(newBackgroundColor) {

	// check hex value
	var validHexColor = isValidHexColor(newBackgroundColor);
	if(!validHexColor) {
		console.log('invalid hex value for backgroundcolor: ' + newBackgroundColor);
		return false;
		}
	
	$('body').css('background-color',validHexColor);	
	}

    
/* ·  
   · 
   ·   Change link color
   ·
   ·   @param newLinkColor: hex value with or without #
   · 
   · · · · · · · · · */  

function changeLinkColor(newLinkColor) {

	// check hex value
	var validHexColor = isValidHexColor(newLinkColor);
	if(!validHexColor) {
		console.log('invalid hex value for linkcolor: ' + newLinkColor);
		return false;
		}
	
	var lighterColor08 = blendRGBColors(hex2rgb(validHexColor),'rgb(255,255,255)',0.8);
	var lighterColor06 = blendRGBColors(hex2rgb(validHexColor),'rgb(255,255,255)',0.6)
	
	var headStyle = $('#dynamic-styles').children('style');
	var headStyleText = headStyle.text();
	headStyleText = replaceFromStringEndToStringStart(headStyleText,'/*COLORSTART*/','/*COLOREND*/',validHexColor);
	headStyleText = replaceFromStringEndToStringStart(headStyleText,'/*BACKGROUNDCOLORSTART*/','/*BACKGROUNDCOLOREND*/',validHexColor);
	headStyleText = replaceFromStringEndToStringStart(headStyleText,'/*BORDERCOLORSTART*/','/*BORDERCOLOREND*/',validHexColor);
	headStyleText = replaceFromStringEndToStringStart(headStyleText,'/*LIGHTERBACKGROUNDCOLORSTART*/','/*LIGHTERBACKGROUNDCOLOREND*/',lighterColor08);
	headStyleText = replaceFromStringEndToStringStart(headStyleText,'/*LIGHTERBORDERCOLORSTART*/','/*LIGHTERBORDERCOLOREND*/',lighterColor06);
	headStyleText = replaceFromStringEndToStringStart(headStyleText,'/*LIGHTERBORDERBOTTOMCOLORSTART*/','/*LIGHTERBORDERBOTTOMCOLOREND*/',lighterColor08);				
	headStyle.text(headStyleText);
	}
function replaceFromStringEndToStringStart(string,fromStringEnd,toStringStart,withString) {
	return string.substring(0,string.indexOf(fromStringEnd)+fromStringEnd.length) + withString + string.substring(string.indexOf(toStringStart));			
	}
function blendRGBColors(c0, c1, p) {
    var f=c0.split(","),t=c1.split(","),R=parseInt(f[0].slice(4)),G=parseInt(f[1]),B=parseInt(f[2]);
    return "rgb("+(Math.round((parseInt(t[0].slice(4))-R)*p)+R)+","+(Math.round((parseInt(t[1])-G)*p)+G)+","+(Math.round((parseInt(t[2])-B)*p)+B)+")";
	}
function hex2rgb(hexStr){
    // note: hexStr should be #rrggbb
    var hex = parseInt(hexStr.substring(1), 16);
    var r = (hex & 0xff0000) >> 16;
    var g = (hex & 0x00ff00) >> 8;
    var b = hex & 0x0000ff;
    return 'rgb(' + r + ',' + g + ',' + b + ')';
	}


/* ·  
   · 
   ·   Right-to-left language detection                              <o
   ·                                                                  (//
   ·   @param s: the stream-item to detect rtl in 
   ·
   ·   @return a stream-item that might have rtl-class added  
   · 
   · · · · · · · · · */
   
function detectRTL(s) {           
	var $streamItem = $('<div>').append(s);
	var $queetText = $('<div>').append($streamItem.find('.queet-text').html()); // create an jquery object
	var $a = $queetText.find('a'); $a.remove(); // remove links
	var $vcard = $queetText.find('.vcard'); $vcard.remove(); // remove users, groups
	var $hcard = $queetText.find('.h-card'); $hcard.remove(); // remove users, groups	
	var $tag = $queetText.find('.tag'); $tag.remove(); // remove tags
	if($queetText.find('.rtl').length>0) { $queetText.html($queetText.find('.rtl').html()); } // remove rtl container if there is one
	// remove chars we're not interested in
	$queetText.html($queetText.html().replace(/\@/gi,'').replace(/\#/gi,'').replace(/\!/gi,'').replace(/\(/gi,'').replace(/\)/gi,'').replace(/\:D/gi,'').replace(/D\:/gi,'').replace(/\:/gi,'').replace(/\-/gi,'').replace(/\s/gi, ''));
	// count ltr and rtl chars	
    var ltrChars        = 'A-Za-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02B8\u0300-\u0590\u0800-\u1FFF'+'\u2C00-\uFB1C\uFDFE-\uFE6F\uFEFD-\uFFFF',
        rtlChars        = '\u0591-\u07FF\uFB1D-\uFDFD\uFE70-\uFEFC',
        rtlDirCheck     = new RegExp('^[^'+ltrChars+']*['+rtlChars+']'),
        RTLnum = 0,
        LTRnum = 0,
        RTLorLTR = $queetText.html();
	for (var i = 0, len = RTLorLTR.length; i < len; i++) {
		if(rtlDirCheck.test(RTLorLTR[i])) { RTLnum++; }
		else { LTRnum++; }
		} 
    // if there are more rtl chars than ltr
    if(RTLnum > LTRnum) { $streamItem.children('.stream-item').children('.queet').addClass('rtl'); }
    // if no chars (that we are interested, but body is set to rtl)
    else if ($queetText.html().length==0 && $('body').hasClass('rtl')) {
    	$streamItem.children('.stream-item').children('.queet').addClass('rtl');
    	}	    	    	    	
	return $streamItem.html().replace(/@<a/gi,'<a').replace(/!<a/gi,'<a').replace(/@<span class="vcard">/gi,'<span class="vcard">').replace(/!<span class="vcard">/gi,'<span class="vcard">').replace(/#<span class="tag">/gi,'<span class="tag">'); // hacky way to get @#! into mention tags to stop bidirection (css sets an @ with before content method)
	}
	
	
	
/* · 
   · 
   ·   Takes twitter style dates and converts them
   ·
   ·   @param tdate: date in the form of e.g. 'Mon Aug 05 16:30:22 +0200 2013' 
   · 
   ·   @return user friendly dates                                                      ..M_   
   ·                                                                                      W  
   ·   Needs global language object window.sL to be populated
   · 
   · · · · · · · · · · · · · */
   
function parseTwitterDate(tdate) {
	var month_names = new Array ();
	month_names[month_names.length] = window.sL.shortmonthsJanuary;
	month_names[month_names.length] = window.sL.shortmonthsFebruary
	month_names[month_names.length] = window.sL.shortmonthsMars
	month_names[month_names.length] = window.sL.shortmonthsApril
	month_names[month_names.length] = window.sL.shortmonthsMay
	month_names[month_names.length] = window.sL.shortmonthsJune
	month_names[month_names.length] = window.sL.shortmonthsJuly
	month_names[month_names.length] = window.sL.shortmonthsAugust
	month_names[month_names.length] = window.sL.shortmonthsSeptember
	month_names[month_names.length] = window.sL.shortmonthsOctober
	month_names[month_names.length] = window.sL.shortmonthsNovember
	month_names[month_names.length] = window.sL.shortmonthsDecember
    var system_date = new Date(Date.parse(tdate));
    var user_date = new Date();
    var diff = Math.floor((user_date - system_date) / 1000);
    if (diff <= 10) {return window.sL.now;}
    if (diff < 60) {return window.sL.shortDateFormatSeconds.replace('{seconds}',Math.round(diff/10)*10);}
    if (diff <= 3540) {return window.sL.shortDateFormatMinutes.replace('{minutes}',Math.round(diff / 60));}
    if (diff <= 86400) {return window.sL.shortDateFormatHours.replace('{hours}',Math.round(diff / 3600));}
    if (diff <= 31536000) {return window.sL.shortDateFormatDate.replace('{day}',system_date.getDate()).replace('{month}',month_names[system_date.getMonth()]);}
    if (diff > 31536000) {return window.sL.shortDateFormatDateAndY.replace('{day}',system_date.getDate()).replace('{month}',month_names[system_date.getMonth()]).replace('{year}',system_date.getFullYear());}
    return system_date;
	}
function parseTwitterLongDate(tdate) {
	var month_names = new Array ();
	month_names[month_names.length] = window.sL.longmonthsJanuary;
	month_names[month_names.length] = window.sL.longmonthsFebruary
	month_names[month_names.length] = window.sL.longmonthsMars
	month_names[month_names.length] = window.sL.longmonthsApril
	month_names[month_names.length] = window.sL.longmonthsMay
	month_names[month_names.length] = window.sL.longmonthsJune
	month_names[month_names.length] = window.sL.longmonthsJuly
	month_names[month_names.length] = window.sL.longmonthsAugust
	month_names[month_names.length] = window.sL.longmonthsSeptember
	month_names[month_names.length] = window.sL.longmonthsOctober
	month_names[month_names.length] = window.sL.longmonthsNovember
	month_names[month_names.length] = window.sL.longmonthsDecember
    var system_date = new Date(Date.parse(tdate));		
	var hours = system_date.getHours();
	var minutes = ('0'+system_date.getMinutes()).slice(-2);
	var ampm = hours >= 12 ? 'pm' : 'am';
	var time24hours = hours + ':' + minutes;
	var time12hours = hours % 12;
	time12hours = time12hours ? time12hours : 12; // the hour '0' should be '12'
	if(ampm == 'am') { time12hours = window.sL.time12am.replace('{time}',time12hours + ':' + minutes);}
	else { time12hours = window.sL.time12pm.replace('{time}',time12hours + ':' + minutes); }
	return window.sL.longDateFormat.replace('{time24}',time24hours).replace('{hours}',hours).replace('{minutes}',minutes).replace('{time12}',time12hours).replace('{day}',system_date.getDate()).replace('{month}',month_names[system_date.getMonth()]).replace('{year}',system_date.getFullYear());
	}	 
function timestampToTwitterDate(timestamp) {
	 var a = new Date(timestamp*1000);
	 var months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
	 var days = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];						 
	 var day = days[a.getUTCDay()];
	 var year = a.getUTCFullYear();
	 var month = months[a.getUTCMonth()];
	 var date = (a.getUTCDate()<10?'0':'')+a.getUTCDate();
	 var hour = (a.getUTCHours()<10?'0':'')+a.getUTCHours();
	 var min = (a.getUTCMinutes()<10?'0':'')+a.getUTCMinutes();
	 var sec = (a.getUTCSeconds()<10?'0':'')+a.getUTCSeconds();
	 return day+' '+month+' '+date+' '+hour+':'+min+':'+sec+' +0000 '+year;
	 }	 	
	
	
	
	
/* ·
   · 
   ·   If we want to make sure we have empty arrays, not empty objects
   · 
   · · · · · · · · · · */
   
function convertEmptyObjectToEmptyArray(data) {	
	
	// empty object? return empty array instead...
	if($.isEmptyObject(data)) {
		return [];
		}
	// leave data unchanged if we don't recognize it
	else {
		return data;
		}		

	}
	
	
	
	
/* ·
   · 
   ·   Return all URL:s in a string
   · 
   ·   @param string: the string to search
   ·
   ·   @return an array with the found urls
   · 
   · · · · · · · · · · */
   
function findUrls(text) {
    var source = (text || '').toString();
    var urlArray = [];
    var url;
    var matchArray;
    var regexToken = /(((ftp|https?):\/\/)[\-\w@:%_\+.~#?,&\/\/=]+)|((mailto:)?[_.\w-]+@([\w][\w\-]+\.)+[a-zA-Z]{2,3})/g;
    while( (matchArray = regexToken.exec( source )) !== null ) {
        var token = matchArray[0];
        urlArray.push( token );
	    }
    return urlArray;
	}		



/* · 
   · 
   ·   Functions to show and remove the spinner
   · 
   · · · · · · · · · · · · */
   
function display_spinner(parent) { 
	if($('.loader').length<1) {
	
		if(typeof parent == 'undefined') {
			$('.global-nav').removeClass('show-logo');
			var parent = 'body';
			}	
	
		$(parent).prepend('\
			<div class="loader">\
			  <svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px"\
			   width="40px" height="40px" viewBox="0 0 40 40" enable-background="new 0 0 40 40" xml:space="preserve">\
			<path opacity="0.2" enable-background="new    " d="M20.201,8.503c-6.413,0-11.612,5.199-11.612,11.612s5.199,11.611,11.612,11.611\
				c6.412,0,11.611-5.198,11.611-11.611S26.613,8.503,20.201,8.503z M20.201,29.153c-4.992,0-9.039-4.046-9.039-9.038\
				s4.047-9.039,9.039-9.039c4.991,0,9.038,4.047,9.038,9.039S25.192,29.153,20.201,29.153z"/>\
			<path d="M24.717,12.293l1.285-2.227c-1.708-0.988-3.686-1.563-5.801-1.563l0,0v2.573l0,0C21.848,11.076,23.386,11.524,24.717,12.293 z">\
			<animateTransform attributeType="xml"\
				  attributeName="transform"\
				  type="rotate"\
				  from="0 20 20"\
				  to="360 20 20"\
				  dur="1s"\
				  repeatCount="indefinite"/>\
				</path>\
			  </svg>\
			</div>\
			');
		}
	}	
function remove_spinner() {	
	$('.loader').remove();
	$('.global-nav').addClass('show-logo');	
	}	
		
	

/* · 
   · 
   ·   Converts ...-attachment-links to spans
   ·
   ·   (Attachments are loaded when queets expand)
   · 
   · · · · · · · · · · · · · · · · · */

function convertAttachmentMoreHref() {
	$('a.attachment.more').each(function() {
		if(typeof $(this).attr('href') != 'undefined') {
			var attachment_href = $(this).attr('href');
			var attachment_id = attachment_href.substr((~-attachment_href.lastIndexOf("/") >>> 0) + 2);
			if(attachment_id.length>0) {
				$(this).replaceWith($('<span class="attachment more" data-attachment-id="' + attachment_id + '">…</span>'));							
				}
			}
		});
	}



/* · 
   · 
   ·   Updates the browsing history local storage
   ·
   · · · · · · · · · · · · · */
   
function updateHistoryLocalStorage() {
	if(localStorageIsEnabled()) {
		var i=0;
		var historyContainer = new Object();
		$.each($('#history-container .stream-selection'), function(key,obj) {
			historyContainer[i] = new Object();
			historyContainer[i].dataStreamHref = $(obj).attr('href');
			historyContainer[i].dataStreamHeader = $(obj).attr('data-stream-header');			
			i++;
			});
		localStorageObjectCache_STORE('browsingHistory', window.loggedIn.screen_name,historyContainer);
		if($('#history-container .stream-selection').length==0) {
			$('#history-container').css('display','none');
			}
		else {
			$('#history-container').css('display','block');
			}
		$('#history-container').sortable({delay: 100});
		$('#history-container').disableSelection();		
		}
	}


/* · 
   · 
   ·   Loads history from local storage to menu
   · 
   · · · · · · · · · · · · · */
   
function loadHistoryFromLocalStorage() {
	if(localStorageIsEnabled()) {
		localStorageObjectCache_GET('browsingHistory', window.loggedIn.screen_name,function(data){
			if(data) {
				$('#history-container').css('display','block');
				$('#history-container').html('');																										
				$.each(data, function(key,obj) {
					$('#history-container').append('<a class="stream-selection" data-stream-header="' + obj.dataStreamHeader + '" href="' + obj.dataStreamHref + '">' + obj.dataStreamHeader + '</i><i class="chev-right"></i></a>');
					});				
				}
			});
		updateHistoryLocalStorage();
		}
	}	


	
/* · 
   · 
   ·   Does stream need a ? or a &
   · 
   · · · · · · · · · · · · · */
   
function qOrAmp(stream) {
	if(stream.substr(-5) == '.json') {
		return '?';
		}
	else {
		return '&';
		}		
	}
	
	
/* · 
   · 
   ·   Count chars in queet box
   ·
   ·   @param src: the queetbox's value
   ·   @param trgt: the counter
   ·   @param btn: the button 
   ·   
   · · · · · · · · · · · · · */ 

function countCharsInQueetBox(src,trgt,btn) {

	// count linebreaks by converting them to spaces
	var $src_txt = $('<div/>').append(src.html().replace(/<br>/g,' '));
	$src_txt = $('<div/>').append($.trim($src_txt.text().replace(/\n/g,'').replace(/^\s+|\s+$/g, '')));
	var numchars = ($src_txt.text()).length;

	// check for long urls and disable/enable url shorten button if present
	var longurls = 0;
	$.each(src.siblings('.syntax-middle').find('span.url'),function(key,obj){
		if($.trim($(obj).html().replace(/&nbsp;/gi,'').replace(/<br>/gi,'')).length > 20) {
			longurls++;
			}
		});
	if(longurls>0) src.siblings('.queet-toolbar').find('button.shorten').removeClass('disabled');
	else src.siblings('.queet-toolbar').find('button.shorten').addClass('disabled');

	// limited
	if(window.textLimit > 0) {
		trgt.html(window.textLimit - numchars);

		// activate/deactivare button
		if(numchars > 0 && numchars < window.textLimit+1) {
			btn.removeClass('disabled');
			btn.addClass('enabled');
			btn.removeClass('too-long');			

			// deactivate button if it's equal to the start text
			var queetBox = btn.closest('.inline-reply-queetbox').children('.queet-box-syntax');
			if(typeof queetBox.attr('data-replies-text') != 'undefined') {
				var $startText = $('<div/>').append(decodeURIComponent(queetBox.attr('data-replies-text')));
				if($.trim($startText.text()) == $.trim($src_txt.text())) {
					btn.removeClass('enabled');
					btn.addClass('disabled');			
					}
				}
			}
		else if(numchars > window.textLimit){
			btn.removeClass('enabled');
			btn.addClass('disabled');
			btn.addClass('too-long');						
			}
		else {
			btn.removeClass('enabled');
			btn.addClass('disabled');
			btn.removeClass('too-long');	
			}	
	
		
		// counter color		
		if((window.textLimit-numchars) < 0) {
			trgt.css('color','#D40D12');
			}
		else {
			trgt.removeAttr('style');			
			}
		}
	// unlimited
	else {
		if(numchars > 0) {
			btn.removeClass('disabled');
			btn.addClass('enabled');		
			}
		else {
			btn.removeClass('enabled');
			btn.addClass('disabled');			
			}
		}
	}		
	

/* · 
   · 
   ·   Remember my scroll position
   ·
   ·   @param obj: jQuery object which position we want to remember
   ·   @param id: id for position to remember
   ·   @param offset: we might want to offset our remembered scroll, e.g. when stream-item gets margin after expand
   ·   
   · · · · · · · · · · · · · */ 

function rememberMyScrollPos(obj,id,offset) {
	if(typeof offset == 'undefined') {
		var offset = 0;
		}	
	if(typeof window.scrollpositions == 'undefined') { window.scrollpositions = new Object();}
	window.scrollpositions[id] = obj.offset().top - $(window).scrollTop() - offset;
	}	

	
/* · 
   · 
   ·   Go back to my scroll po
   ·
   ·   @param obj: jQuery object to put in the remebered position
   ·   @param id: id for remembered position   
   ·   @param animate: if we want to animate the scroll
   ·   @param callback: function to run when animation stops
   ·   
   · · · · · · · · · · · · · */ 

function backToMyScrollPos(obj,id,animate,callback) {
	var pos = obj.offset().top-window.scrollpositions[id];
	if(animate) {
		if(animate == 'animate' || animate === true) {
			animate = 1000;
			}
	   if(typeof callback !== 'undefined'){
			$('html, body').animate({ scrollTop: pos}, animate, 'swing',function(){
				callback();
				});		   	
		   	}
	    else {
	    	$('html, body').animate({ scrollTop: pos }, animate, 'swing');
	    	}
		}
	else {
		$('html, body').scrollTop(pos);
		}			
	}		
	


/* · 
   · 
   ·   Clean up user object, remove null etc
   ·   
   · · · · · · · · · · · · · */ 

function cleanUpUserObject(data) {
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
	data.groups_count = data.groups_count || 0;			
	data.friends_count = data.friends_count || 0;
	return data;		
	}		
	



/* · 
   · 
   ·   outerHTML
   ·   
   · · · · · · · · · · · · · */ 
	
jQuery.fn.outerHTML = function(s) {
    return s
        ? this.before(s).remove()
        : jQuery("<p>").append(this.eq(0).clone()).html();
};




/* · 
   · 
   ·   Stuff to get and set selection/caret in contenteditables 
   ·   
   · · · · · · · · · · · · · */ 
	
function getSelectionInElement(element) {
	var caretOffset = Array(0,0);
	var doc = element.ownerDocument || element.document;
	var win = doc.defaultView || doc.parentWindow;
	var sel;
	var range = win.getSelection().getRangeAt(0);
	var preCaretRangeEnd = range.cloneRange();
	preCaretRangeEnd.selectNodeContents(element);
	preCaretRangeEnd.setEnd(range.endContainer, range.endOffset);
	caretOffset[1] = preCaretRangeEnd.toString().length;
	var preCaretRangeStart = range.cloneRange();
	preCaretRangeStart.selectNodeContents(element);
	preCaretRangeStart.setEnd(range.startContainer, range.startOffset);
	caretOffset[0] = preCaretRangeStart.toString().length;			
	return caretOffset;
	}					
function getTextNodesIn(node) {
	var textNodes = [];
	if (node.nodeType == 3) {
		textNodes.push(node);
		}
	else {
		var children = node.childNodes;
		for (var i = 0, len = children.length; i < len; ++i) {
			textNodes.push.apply(textNodes, getTextNodesIn(children[i]));
			}
		}
	return textNodes;
	}

function setSelectionRange(el, start, end) {
    if (document.createRange && window.getSelection) {
        var range = document.createRange();
        range.selectNodeContents(el);
        var textNodes = getTextNodesIn(el);
        var foundStart = false;
        var charCount = 0, endCharCount;

        for (var i = 0, textNode; textNode = textNodes[i++]; ) {
            endCharCount = charCount + textNode.length;
			if(endCharCount == start && endCharCount == end) {
				endCharCount = endCharCount+1;
				}            
            if (!foundStart && start >= charCount
                    && (start < endCharCount ||
                    (start == endCharCount && i < textNodes.length))) {
                range.setStart(textNode, start - charCount);
                foundStart = true;
            }
            if (foundStart && end <= endCharCount) {
                range.setEnd(textNode, end - charCount);
                break;
            }
            charCount = endCharCount;
        }
        var sel = window.getSelection();
        sel.removeAllRanges();
        sel.addRange(range);
    } else if (document.selection && document.body.createTextRange) {
        var textRange = document.body.createTextRange();
        textRange.moveToElementText(el);
        textRange.collapse(true);
        textRange.moveEnd("character", end);
        textRange.moveStart("character", start);
        textRange.select();
    }
}
function createRangeFromCharacterIndices(containerEl, start, end) {
    var charIndex = 0, range = document.createRange(), foundStart = false, stop = {};
    range.setStart(containerEl, 0);
    range.collapse(true);

    function traverseTextNodes(node) {
        if (node.nodeType == 3) {
            var nextCharIndex = charIndex + node.length;
            if (!foundStart && start >= charIndex && start <= nextCharIndex) {
                range.setStart(node, start - charIndex);
                foundStart = true;
            }
            if (foundStart && end >= charIndex && end <= nextCharIndex) {
                range.setEnd(node, end - charIndex);
                throw stop;
            }
            charIndex = nextCharIndex;
        } else {
            for (var i = 0, len = node.childNodes.length; i < len; ++i) {
                traverseTextNodes(node.childNodes[i]);
            }
        }
    }

    try {
        traverseTextNodes(containerEl);
    } catch (ex) {
        if (ex == stop) {
            return range;
        } else {
            throw ex;
        }
    }
}

function deleteBetweenCharacterIndices(el, from, to) {
    var range = createRangeFromCharacterIndices(el, from, to);
    if(typeof range != 'undefined') {
	    range.deleteContents();    	
    	}
}


/* · 
   · 
   ·   Shorten urls in a queet-box
   ·   
   · · · · · · · · · · · · · */ 

function shortenUrlsInBox(shortenButton) {
	shortenButton.addClass('disabled');
	
	$.each(shortenButton.parent().parent().siblings('.syntax-middle').find('span.url'),function(key,obj){

		var url = $.trim($(obj).text());
		
		display_spinner();
		
		$.ajax({ url: window.urlShortenerAPIURL + '?format=jsonp&action=shorturl&signature=' + window.urlShortenerSignature + '&url=' + encodeURIComponent(url), type: "GET", dataType: "jsonp", success: function(data) {

			if(typeof data.shorturl != 'undefined') {
				
				shortenButton.closest('.queet-toolbar').siblings('.upload-image-container').children('img[data-shorturl="' + data.url.url + '"]').attr('data-shorturl',data.shorturl);
				shortenButton.parent().parent().siblings('.queet-box-syntax').html(shortenButton.parent().parent().siblings('.queet-box-syntax').html().replace($('<div/>').text(data.url.url).html(), data.shorturl));
				shortenButton.parent().parent().siblings('.queet-box-syntax').trigger('keyup');
				shortenButton.addClass('disabled'); // make sure the button is disabled right after
				}
			remove_spinner();
			}});
		});
}

/* · 
   ·     
   ·   Return the user screen name that this stream belongs to. last resort just return the stream
   ·     
   · · · · · · · · · · · · · */ 

function theUserOrGroupThisStreamBelongsTo(stream) {
	// if screen_name is given as get-var, use that
	if(stream.indexOf('screen_name=')>-1) {
		var thisUsersScreenName = stream.substring(stream.indexOf('screen_name=')+12);
		if(thisUsersScreenName.indexOf('&=')>-1) {
			thisUsersScreenName = thisUsersScreenName.substring(0,stream.indexOf('&'));			
			}
		return thisUsersScreenName;
		}
	// 	groups
	else if(stream.indexOf('statusnet/groups/timeline/')>-1
	     || stream.indexOf('statusnet/groups/membership/')>-1
	     || stream.indexOf('statusnet/groups/admins/')>-1) {
		var groupName = '!' + stream.substring(stream.lastIndexOf('/')+1, stream.indexOf('.json'));				     	     
		return groupName;
		}
	// otherwise, and if we're logged in, we assume this is my stream		
	else if (window.loggedIn){
		return window.loggedIn.screen_name;
		}
	else {
		return stream;
		}
	}
	
