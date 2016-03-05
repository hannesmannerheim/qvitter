
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

	if(localStorageIsEnabled() === false) {
		return false;
		}

	name = localStorageMaybeAppendIdToKey(name);

	if(object === false || object === null || object.length < 1) {
		// false or an empty object means we remove this entry
		if(typeof localStorage[name + '-' + unique_id] != 'undefined' && localStorage[name + '-' + unique_id] !== null) {
			delete localStorage[name + '-' + unique_id];
			}
		return false;
		}

	var dataToSave = {};
	dataToSave.modified = Date.now();
	dataToSave.cdata = LZString.compressToUTF16(JSON.stringify(object));

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

	console.log('removed ' + i + ' old localstorage items');

	if(i>0) {
		callback();
		return true;
		}
	else {
		return false;
		}
	}


/* ·
   ·
   ·   Get from localStorage object cache
   ·
   ·   @param name: the name of this type of object
   ·   @param unique_id: some unique_id – the key in localStorage will be name-unique_id
   ·
   · · · · · · · · · */

function localStorageObjectCache_GET(name, unique_id) {

	if(localStorageIsEnabled() === false) {
		return false;
		}

	name = localStorageMaybeAppendIdToKey(name);

	if(typeof localStorage[name + '-' + unique_id] == 'undefined' || localStorage[name + '-' + unique_id] === null) {
		return false;
		}

	try {
		var parsedObject = JSON.parse(localStorage[name + '-' + unique_id]);
		}
	catch(e) {
		return false;
		}

	if(typeof parsedObject.modified == 'undefined' || parsedObject.modified === null) {
		// invalid or old localstorage object found, check the whole localstorage!
		checkLocalStorage();
		return false;
		}
	else {
		try {
			var decompressedAndParsed = JSON.parse(LZString.decompressFromUTF16(parsedObject.cdata));
			return decompressedAndParsed;
			}
		catch(e) {
			return false;
			}
		}

	}


// to the following data types we add the logged in user's user id,
// since they contain user specific data (0 for logged out)
// selectedLanguage is handled differently, since we want to be able to
// access the logged out user's data if we're logged in
function localStorageMaybeAppendIdToKey(name) {
	if(jQuery.inArray(name, ['browsingHistory', 'conversation', 'queetBoxInput', 'streamState']) !== -1) {
		if(window.loggedIn) {
			return name + '-' + window.loggedIn.id;
			}
		else {
			return name + '-0' ;
			}
		}
	else {
		return name;
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
	var compressed = 0;
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
				'selectedLanguage',
				'queetBoxInput',
				'streamState',
				'languageErrorMessageDiscarded'
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
				newEntry.cdata = entryParsed;
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
				entryParsed = newEntry;
				corrected++;
				}

			// compress uncompressed data
			if(typeof entryParsed.data != 'undefined') {
				// but not if it's not containing any data (some bug may have saved an empty, false or null value)
				if(entryParsed.data === false || entryParsed.data === null || entryParsed.data.length == 0) {
					delete localStorage[k];
					deleted++;
					return true;
					}
				var dataCompressed = LZString.compressToUTF16(JSON.stringify(entryParsed.data));
				var newCompressedEntry = {};
				newCompressedEntry.modified = entryParsed.modified;
				newCompressedEntry.cdata = dataCompressed;
				localStorage.setItem(k, JSON.stringify(newCompressedEntry));
				compressed++;
				}
			}
		});
	console.log(corrected + ' entries corrected, ' + deleted + ' entries deleted, ' + compressed + ' entries compressed');
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
		if (e.name == 'QUOTA_EXCEEDED_ERR' || e.name == 'NS_ERROR_DOM_QUOTA_REACHED' || e.name == 'QuotaExceededError' || e.name == 'W3CException_DOM_QUOTA_EXCEEDED_ERR') {

			// if localstorage is empty but returns a full error, we assume it's disabled (in an ugly way)
			if(localStorage.length === 0) {
				return false;
				}

			var successfulRemoval = removeOldestLocalStorageEntries(function(){
				return localStorageIsEnabled();
				});
			if(successfulRemoval === false) {
				return false;
				}
			}
		else {
			return false;
			}
		}
	}




/* ·
   ·
   ·  Block/unblock user and do necessary stuff
   ·
   · · · · · · · · · */

function blockUser(arg, callback) {

	$('body').click(); // a click somewhere hides any open menus

	// arguments is sent as an object, for easier use with a menu's function-row
	var userId = arg.userId;
	var blockButton_jQueryElement = arg.blockButton_jQueryElement;

	display_spinner();
	APIBlockOrUnblockUser('block', userId, function(data) {
		remove_spinner();

		// activate the button, if we were passed one
		if(typeof blockButton_jQueryElement != 'undefined') {
			blockButton_jQueryElement.removeClass('disabled');
			}

		if(data && data.statusnet_blocking === true) {
			// success
			markUserAsBlockedInDOM(userId, data.following);
			if(typeof callback == 'function') {
				callback(blockButton_jQueryElement);
				}
			}
		else {
			// failed!
			showErrorMessage(window.sL.failedBlockingUser);
			}
		});
	}
function unblockUser(arg, callback) {

	$('body').click(); // a click somewhere hides any open menus

	// arguments is sent as an object, for easier use with a menu's function-row
	var userId = arg.userId;
	var blockButton_jQueryElement = arg.blockButton_jQueryElement;

	display_spinner();
	APIBlockOrUnblockUser('unblock', userId, function(data) {
		remove_spinner();

		// activate the button, if we were passed one
		if(typeof blockButton_jQueryElement != 'undefined') {
			blockButton_jQueryElement.removeClass('disabled');
			}

		if(data && data.statusnet_blocking === false) {
			// success
			markUserAsUnblockedInDOM(userId, data.following);
			if(typeof callback == 'function') {
				callback(blockButton_jQueryElement);
				}
			}
		else {
			// failed!
			showErrorMessage(window.sL.failedUnblockingUser);
			}
		});
	}
function markUserAsBlockedInDOM(userId, following) {

	// display buttons accordingly
	$('.qvitter-follow-button[data-follow-user-id="' + userId + '"]').addClass('blocking');

	if(following) {
		$('.qvitter-follow-button[data-follow-user-id="' + userId + '"]').addClass('following');
		}
	else {
		$('.qvitter-follow-button[data-follow-user-id="' + userId + '"]').removeClass('following');
		}

	// hide notices from the blocked user
	$.each($('.stream-item[data-quitter-id-in-stream][data-user-id="' + userId + '"]'),function(){
		$(this).addClass('profile-blocked-by-me');
		$(this).children('.queet').attr('data-tooltip',window.sL.thisIsANoticeFromABlockedUser);
		});

	// add to the window.allBlocking array
	if (userIsBlocked(userId) === false) {
    	window.allBlocking.push(userId);
		}
	}
function markUserAsUnblockedInDOM(userId, following) {

	// display buttons accordingly
	$('.qvitter-follow-button[data-follow-user-id="' + userId + '"]').removeClass('blocking');
	if(following) {
		$('.qvitter-follow-button[data-follow-user-id="' + userId + '"]').addClass('following');
		}
	else {
		$('.qvitter-follow-button[data-follow-user-id="' + userId + '"]').removeClass('following');
		}

	// hide the user from lists of blocked users
	if(window.currentStreamObject.name == 'user blocks' && window.currentStreamObject.nickname == window.loggedIn.screen_name) {
		$.each($('.stream-item.user[data-user-id="' + userId + '"]'),function(){
			slideUpAndRemoveStreamItem($(this));
			});
		}

	// unhide notices from the blocked user
	$.each($('.stream-item[data-quitter-id-in-stream][data-user-id="' + userId + '"]'),function(){
		$(this).removeClass('profile-blocked-by-me');
		$(this).children('.queet').removeAttr('data-tooltip');
		});

	// remove from the window.allBlocking array
	var existingBlockIndex = window.allBlocking.indexOf(userId);
	if (existingBlockIndex > -1) {
    	window.allBlocking.splice(existingBlockIndex, 1);
		}
	}

/* ·
   ·
   ·  Is this user id blocked?
   ·
   · · · · · · · · · */

function userIsBlocked(userId) {
	var existingBlock = window.allBlocking.indexOf(userId);
	if (existingBlock > -1) {
    	return true;
		}
	else {
		return false;
		}
	}

/* ·
   ·
   ·  Marks all notices from blocked users in an jQuery object as blocked
   ·
   · · · · · · · · · */


function markAllNoticesFromBlockedUsersAsBlockedInJQueryObject(obj) {
	$.each(window.allBlocking,function(){
		obj.find('.stream-item[data-user-id="' + this + '"]').addClass('profile-blocked-by-me');
		obj.find('.stream-item[data-user-id="' + this + '"]').children('.queet').attr('data-tooltip',window.sL.thisIsANoticeFromABlockedUser);
		});

	}

/* ·
   ·
   ·  Marks all notices from muted users in an jQuery object as muted
   ·
   · · · · · · · · · */

function markAllNoticesFromMutedUsersAsMutedInJQueryObject(obj) {

	$.each(obj.find('.stream-item'),function(){
		if(isUserMuted($(this).attr('data-user-id'))) {
			$(this).addClass('user-muted');
			$(this).children('.queet').attr('data-tooltip',window.sL.thisIsANoticeFromAMutedUser);
			}
		else {
			$(this).children('.queet').removeAttr('data-tooltip');
			$(this).removeClass('user-muted');
			}
		});
	}


/* ·
   ·
   ·  Marks all profile cards from muted users as muted in DOM
   ·
   · · · · · · · · · */

function markAllProfileCardsFromMutedUsersAsMutedInDOM() {

	$.each($('body').find('.profile-header-inner'),function(){
		if(isUserMuted($(this).attr('data-user-id'))) {
			$(this).parent('.profile-card').addClass('user-muted');
			}
		else {
			$(this).parent('.profile-card').removeClass('user-muted');
			}
		});
	}



/* ·
   ·
   ·  Function invoked after mute and unmute
   ·
   · · · · · · · · · */

function hideOrShowNoticesAfterMuteOrUnmute() {
	markAllNoticesFromMutedUsersAsMutedInJQueryObject($('#feed-body'));
	markAllProfileCardsFromMutedUsersAsMutedInDOM();
	}

/* ·
   ·
   ·  Sandbox/unsandbox user and do necessary stuff
   ·
   · · · · · · · · · */

function sandboxCreateOrDestroy(arg, callback) {

	$('body').click(); // a click somewhere hides any open menus

	display_spinner();
	APISandboxCreateOrDestroy(arg.createOrDestroy, arg.userId, function(data) {
		remove_spinner();
		if(!data) {
			// failed!
			showErrorMessage(window.sL.ERRORfailedSandboxingUser);
			}
		});
	}

/* ·
   ·
   ·  Sandbox/unsandbox user and do necessary stuff
   ·
   · · · · · · · · · */

function silenceCreateOrDestroy(arg, callback) {

	$('body').click(); // a click somewhere hides any open menus

	display_spinner();
	APISilenceCreateOrDestroy(arg.createOrDestroy, arg.userId, function(data) {
		remove_spinner();
		if(!data) {
			// failed!
			showErrorMessage(window.sL.ERRORfailedSilencingUser);
			}
		});
	}

/* ·
   ·
   ·   Get the logged in user's menu array
   ·
   · · · · · · · · · */

function loggedInUsersMenuArray() {
	return [
		{
			type: 'function',
			functionName: 'goToEditProfile',
			label: window.sL.editMyProfile
			},
		{
			type: 'link',
			href: window.siteInstanceURL + 'settings/profile',
			label: window.sL.settings
			},
		{
			type:'divider'
			},
		{
			type: 'link',
			href: window.siteInstanceURL + window.loggedIn.screen_name + '/mutes',
			label: window.sL.userMuted
			},
		{
			type: 'link',
			href: window.siteInstanceURL + window.loggedIn.screen_name + '/blocks',
			label: window.sL.userBlocked
			}];
	}


/* ·
   ·
   ·   Append moderator user actions to menu array
   ·
   ·   @param menuArray: array used to build menus in getMenu()
   ·   @param userID: the user id of the user to act on
   ·   @param userScreenName: the screen_name/nickname/username of the user to act on
   ·   @param sandboxed: is the user sandboxed?
   ·   @param silenced: is the user silenced?
   ·
   · · · · · · · · · */

function appendModeratorUserActionsToMenuArray(menuArray,userID,userScreenName,sandboxed,silenced) {

	// not if it's me
	if(window.loggedIn.id == userID) {
		return menuArray;
		}

	if(window.loggedIn !== false && window.loggedIn.rights.sandbox === true) {
		menuArray.push({type:'divider'});
		if(sandboxed === true) {
			menuArray.push({
				type: 'function',
				functionName: 'sandboxCreateOrDestroy',
				functionArguments: {
					userId: userID,
					createOrDestroy: 'destroy'
					},
				label: window.sL.unSandboxThisUser.replace('{nickname}','@' + userScreenName)
				});
			}
		else {
			menuArray.push({
				type: 'function',
				functionName: 'sandboxCreateOrDestroy',
				functionArguments: {
					userId: userID,
					createOrDestroy: 'create'
					},
				label: window.sL.sandboxThisUser.replace('{nickname}','@' + userScreenName)
				});
			}
		}
	if(window.loggedIn !== false && window.loggedIn.rights.silence === true) {
		if(silenced === true) {
			menuArray.push({
				type: 'function',
				functionName: 'silenceCreateOrDestroy',
				functionArguments: {
					userId: userID,
					createOrDestroy: 'destroy'
					},
				label: window.sL.unSilenceThisUser.replace('{nickname}','@' + userScreenName)
				});
			}
		else {
			menuArray.push({
				type: 'function',
				functionName: 'silenceCreateOrDestroy',
				functionArguments: {
					userId: userID,
					createOrDestroy: 'create'
					},
				label: window.sL.silenceThisUser.replace('{nickname}','@' + userScreenName)
				});
			}
		}

	return menuArray;
	}


/* ·
   ·
   ·  Updates the times for all queets loaded to DOM
   ·
   · · · · · · · · · */

function updateAllQueetsTimes() {
	$('[data-created-at]').each(function(){
		// if the element with the data-created-at doesn't have an a-child, we change the html of the element
		if($(this).children('a').length==0){
			$(this).html(parseTwitterDate($(this).attr('data-created-at')));
			}
		// otherwise the change the child's html
		else {
			$(this).children('a').html(parseTwitterDate($(this).attr('data-created-at')));
			}
		});
	}


/* ·
   ·
   ·  Is this a local URL?
   ·
   · · · · · · · · · */

function isLocalURL(url) {
	if(url.substring(0,window.siteInstanceURL.length) == window.siteInstanceURL) {
		return true;
		}
	else {
		return false;
		}
	}


/* ·
   ·
   ·  Check for hidden items and show the new queets bar if there are any
   ·
   · · · · · · · · · */

function maybeShowTheNewQueetsBar() {

	var newQueetsNum = $('#feed-body').find('.stream-item.hidden:not(.always-hidden):not(.hidden-repeat)').length;

	// subtract the number of hidden notices from muted users if this isn't the notifications stream,
	// or if this is the notifications stream but the user has opted out of seeing notifications from muted users
	var mutedHiddenNum = 0;
	if(window.currentStreamObject.name == 'notifications') {
		if($('#feed-body').hasClass('hide-notifications-from-muted-users')) {
			mutedHiddenNum = $('#feed-body').find('.stream-item.hidden.user-muted:not(.always-hidden):not(.hidden-repeat)').length;
			}
		}
	else {
		var mutedHiddenNum = $('#feed-body').find('.stream-item.hidden.user-muted:not(.always-hidden):not(.hidden-repeat)').length;
		}

	newQueetsNum = newQueetsNum - mutedHiddenNum;

	if(newQueetsNum > 0) {

		$('#new-queets-bar').parent().removeClass('hidden');

		// bar label
		if(newQueetsNum == 1) { var q_txt = window.sL.newQueet; }
		else { var q_txt = window.sL.newQueets; }
		if(window.currentStreamObject.name == 'notifications') {
			if(newQueetsNum == 1) { var q_txt = window.sL.newNotification; }
			else { var q_txt = window.sL.newNotifications; }
			}

		$('#new-queets-bar').html(q_txt.replace('{new-notice-count}',newQueetsNum));
		}
	}



/* ·
   ·
   ·  Align tooltips to the hovered element
   ·
   · · · · · · · · · */

function alignTooltipTohoveredElement(tooltipElement,tooltipCaret,hovered) {
	var tooltipWidth = tooltipElement.outerWidth();
	var tooltipHeight = tooltipElement.outerHeight();
	var windowWidth = $(window).width();
	var windowScrollPosY = $(window).scrollTop();
	var targetPosX = hovered.offset().left;
	var targetPosY = hovered.offset().top;
	var targetHeight = hovered.outerHeight();
	var targetWidth = hovered.outerWidth();

	// too little space on top of element, show tooltip at bottom
	if((targetPosY-windowScrollPosY-tooltipHeight-10) < 0) {
		var tooltipCaretPosX = targetPosX+targetWidth/2-5;
		var tooltipCaretPosY = targetPosY+targetHeight+2;

		// caret always directly under element
		tooltipCaret.css('left',tooltipCaretPosX + 'px');
		tooltipCaret.css('top',tooltipCaretPosY + 'px');
		tooltipCaret.addClass('top');

		// tooltip itself might bleed over the window edges, and need moving
		var tooltipPosX = targetPosX+targetWidth/2-tooltipWidth/2;
		var tooltipPosY = targetPosY+targetHeight+7;
		if((tooltipPosX+tooltipWidth)>windowWidth) {
			tooltipPosX = windowWidth-tooltipWidth-5;
			}
		if(tooltipPosX < 5) {
			tooltipPosX = 5;
			}
		tooltipElement.css('left',tooltipPosX + 'px');
		tooltipElement.css('top',tooltipPosY + 'px');
		}
	// tooltip at top
	else {
		var tooltipCaretPosX = targetPosX+targetWidth/2-5;
		var tooltipCaretPosY = targetPosY-8;

		// caret always directly on top of element
		tooltipCaret.css('left',tooltipCaretPosX + 'px');
		tooltipCaret.css('top',tooltipCaretPosY + 'px');
		tooltipCaret.addClass('bottom');

		// tooltip itself might bleed over the window edges, and need moving
		var tooltipPosX = targetPosX+targetWidth/2-tooltipWidth/2;
		var tooltipPosY = targetPosY-7-tooltipHeight;
		if((tooltipPosX+tooltipWidth)>windowWidth) {
			tooltipPosX = windowWidth-tooltipWidth-5;
			}
		if(tooltipPosX < 5) {
			tooltipPosX = 5;
			}
		tooltipElement.css('left',tooltipPosX + 'px');
		tooltipElement.css('top',tooltipPosY + 'px');

		}
	}




/* ·
   ·
   ·  Cache the unicode compatible regexps for the syntax highlighting
   ·
   · · · · · · · · · */

function cacheSyntaxHighlighting() {

	window.syntaxHighlightingRegexps = Object();
	var allDomains = '(abb|abbott|abogado|ac|academy|accenture|accountant|accountants|active|actor|ad|ads|adult|ae|aero|af|afl|ag|agency|ai|aig|airforce|al|allfinanz|alsace|am|amsterdam|an|android|ao|apartments|aq|aquarelle|ar|archi|army|arpa|as|asia|associates|at|attorney|au|auction|audio|auto|autos|aw|ax|axa|az|ba|band|bank|bar|barclaycard|barclays|bargains|bauhaus|bayern|bb|bbc|bbva|bd|be|beer|berlin|best|bf|bg|bh|bi|bible|bid|bike|bingo|bio|biz|bj|bl|black|blackfriday|bloomberg|blue|bm|bmw|bn|bnpparibas|bo|boats|bond|boo|boutique|bq|br|bridgestone|broker|brother|brussels|bs|bt|budapest|build|builders|business|buzz|bv|bw|by|bz|bzh|ca|cab|cafe|cal|camera|camp|cancerresearch|canon|capetown|capital|caravan|cards|care|career|careers|cars|cartier|casa|cash|casino|cat|catering|cbn|cc|cd|center|ceo|cern|cf|cfa|cfd|cg|ch|channel|chat|cheap|chloe|christmas|chrome|church|ci|cisco|citic|city|ck|cl|claims|cleaning|click|clinic|clothing|club|cm|cn|co|coach|codes|coffee|college|cologne|com|community|company|computer|condos|construction|consulting|contractors|cooking|cool|coop|corsica|country|coupons|courses|cr|credit|creditcard|cricket|crs|cruises|cu|cuisinella|cv|cw|cx|cy|cymru|cyou|cz|dabur|dad|dance|date|dating|datsun|day|dclk|de|deals|degree|delivery|democrat|dental|dentist|desi|design|dev|diamonds|diet|digital|direct|directory|discount|dj|dk|dm|dnp|do|docs|dog|doha|domains|doosan|download|durban|dvag|dz|earth|eat|ec|edu|education|ee|eg|eh|email|emerck|energy|engineer|engineering|enterprises|epson|equipment|er|erni|es|esq|estate|et|eu|eurovision|eus|events|everbank|exchange|expert|exposed|express|fail|faith|fan|fans|farm|fashion|feedback|fi|film|finance|financial|firmdale|fish|fishing|fit|fitness|fj|fk|flights|florist|flowers|flsmidth|fly|fm|fo|foo|football|forex|forsale|foundation|fr|frl|frogans|fund|furniture|futbol|fyi|ga|gal|gallery|garden|gb|gbiz|gd|gdn|ge|gent|gf|gg|ggee|gh|gi|gift|gifts|gives|gl|glass|gle|global|globo|gm|gmail|gmo|gmx|gn|gold|goldpoint|golf|goo|goog|google|gop|gov|gp|gq|gr|graphics|gratis|green|gripe|gs|gt|gu|guge|guide|guitars|guru|gw|gy|hamburg|hangout|haus|healthcare|help|here|hermes|hiphop|hitachi|hiv|hk|hm|hn|hockey|holdings|holiday|homedepot|homes|honda|horse|host|hosting|house|how|hr|ht|hu|ibm|icbc|icu|id|ie|ifm|il|im|immo|immobilien|in|industries|infiniti|info|ing|ink|institute|insure|int|international|investments|io|iq|ir|irish|is|it|iwc|java|jcb|je|jetzt|jewelry|jll|jm|jo|jobs|joburg|jp|juegos|kaufen|kddi|ke|kg|kh|ki|kim|kitchen|kiwi|km|kn|koeln|komatsu|kp|kr|krd|kred|kw|ky|kyoto|kz|la|lacaixa|land|lat|latrobe|lawyer|lb|lc|lds|lease|leclerc|legal|lgbt|li|liaison|lidl|life|lighting|limited|limo|link|lk|loan|loans|lol|london|lotte|lotto|love|lr|ls|lt|ltda|lu|lupin|luxe|luxury|lv|ly|ma|madrid|maif|maison|management|mango|market|marketing|markets|marriott|mba|mc|md|me|media|meet|melbourne|meme|memorial|men|menu|mf|mg|mh|miami|mil|mini|mk|ml|mm|mma|mn|mo|mobi|moda|moe|monash|money|montblanc|mormon|mortgage|moscow|motorcycles|mov|movie|mp|mq|mr|ms|mt|mtn|mtpc|mu|museum|mv|mw|mx|my|mz|na|nadex|nagoya|name|navy|nc|ne|nec|net|network|neustar|new|news|nexus|nf|ng|ngo|nhk|ni|nico|ninja|nissan|nl|no|np|nr|nra|nrw|ntt|nu|nyc|nz|okinawa|om|one|ong|onl|online|ooo|org|organic|osaka|otsuka|ovh|pa|page|panerai|paris|partners|parts|party|pe|pf|pg|ph|pharmacy|philips|photo|photography|photos|physio|piaget|pics|pictet|pictures|pink|pizza|pk|pl|place|plumbing|plus|pm|pn|pohl|poker|porn|post|pr|praxi|press|pro|prod|productions|prof|properties|property|ps|pt|pub|pw|py|qa|qpon|quebec|racing|re|realtor|recipes|red|redstone|rehab|reise|reisen|reit|ren|rent|rentals|repair|report|republican|rest|restaurant|review|reviews|rich|rio|rip|ro|rocks|rodeo|rs|rsvp|ru|ruhr|run|rw|ryukyu|sa|saarland|sale|samsung|sandvik|sandvikcoromant|sap|sarl|saxo|sb|sc|sca|scb|schmidt|scholarships|school|schule|schwarz|science|scot|sd|se|seat|sener|services|sew|sex|sexy|sg|sh|shiksha|shoes|show|shriram|si|singles|site|sj|sk|ski|sky|sl|sm|sn|sncf|so|soccer|social|software|sohu|solar|solutions|sony|soy|space|spiegel|spreadbetting|sr|ss|st|study|style|su|sucks|supplies|supply|support|surf|surgery|suzuki|sv|swiss|sx|sy|sydney|systems|sz|taipei|tatar|tattoo|tax|taxi|tc|td|team|tech|technology|tel|temasek|tennis|tf|tg|th|thd|theater|tickets|tienda|tips|tires|tirol|tj|tk|tl|tm|tn|to|today|tokyo|tools|top|toray|toshiba|tours|town|toys|tp|tr|trade|trading|training|travel|trust|tt|tui|tv|tw|tz|ua|ug|uk|um|university|uno|uol|us|uy|uz|va|vacations|vc|ve|vegas|ventures|versicherung|vet|vg|vi|viajes|video|villas|vision|vlaanderen|vn|vodka|vote|voting|voto|voyage|vu|wales|walter|wang|watch|webcam|website|wed|wedding|weir|wf|whoswho|wien|wiki|williamhill|win|wme|work|works|world|ws|wtc|wtf|xbox|xerox|xin|测试|परीक्षा|佛山|慈善|集团|在线|한국|ভারত|八卦|موقع|বাংলা|公益|公司|移动|我爱你|москва|испытание|қаз|онлайн|сайт|срб|бел|时尚|테스트|淡马锡|орг|삼성|சிங்கப்பூர்|商标|商店|商城|дети|мкд|טעסט|工行|中文网|中信|中国|中國|娱乐|谷歌|భారత్|ලංකා|測試|ભારત|भारत|آزمایشی|பரிட்சை|网店|संगठन|餐厅|网络|укр|香港|δοκιμή|飞利浦|إختبار|台湾|台灣|手机|мон|الجزائر|عمان|ایران|امارات|بازار|پاکستان|الاردن|بھارت|المغرب|السعودية|سودان|عراق|مليسيا|澳門|政府|شبكة|გე|机构|组织机构|健康|ไทย|سورية|рус|рф|تونس|みんな|グーグル|ελ|世界|ਭਾਰਤ|网址|游戏|vermögensberater|vermögensberatung|企业|信息|مصر|قطر|广东|இலங்கை|இந்தியா|հայ|新加坡|فلسطين|テスト|政务|xxx|xyz|yachts|yandex|ye|yodobashi|yoga|yokohama|youtube|yt|za|zip|zm|zone|zuerich|zw|oracle|xn--1qqw23a|xn--30rr7y|xn--3bst00m|xn--3ds443g|xn--3e0b707e|xn--45brj9c|xn--45q11c|xn--4gbrim|xn--55qw42g|xn--55qx5d|xn--6frz82g|xn--6qq986b3xl|xn--80adxhks|xn--80ao21a|xn--80asehdb|xn--80aswg|xn--90a3ac|xn--90ais|xn--9et52u|xn--b4w605ferd|xn--c1avg|xn--cg4bki|xn--clchc0ea0b2g2a9gcd|xn--czr694b|xn--czrs0t|xn--czru2d|xn--d1acj3b|xn--d1alf|xn--estv75g|xn--fiq228c5hs|xn--fiq64b|xn--fiqs8s|xn--fiqz9s|xn--fjq720a|xn--flw351e|xn--fpcrj9c3d|xn--fzc2c9e2c|xn--gecrj9c|xn--h2brj9c|xn--hxt814e|xn--i1b6b1a6a2e|xn--imr513n|xn--io0a7i|xn--j1amh|xn--j6w193g|xn--kcrx77d1x4a|xn--kprw13d|xn--kpry57d|xn--kput3i|xn--l1acc|xn--lgbbat1ad8j|xn--mgb9awbf|xn--mgba3a4f16a|xn--mgbaam7a8h|xn--mgbab2bd|xn--mgbayh7gpa|xn--mgbbh1a71e|xn--mgbc0a9azcg|xn--mgberp4a5d4ar|xn--mgbpl2fh|xn--mgbx4cd0ab|xn--mxtq1m|xn--ngbc5azd|xn--node|xn--nqv7f|xn--nqv7fs00ema|xn--nyqy26a|xn--o3cw4h|xn--ogbpf8fl|xn--p1acf|xn--p1ai|xn--pgbs0dh|xn--q9jyb4c|xn--qcka1pmc|xn--rhqv96g|xn--s9brj9c|xn--ses554g|xn--unup4y|xn--vermgensberater-ctb|xn--vermgensberatung-pwb|xn--vhquv|xn--vuq861b|xn--wgbh1c|xn--wgbl6a|xn--xhq521b|xn--xkc2al3hye2a|xn--xkc2dl3a5ee0h|xn--y9a3aq|xn--yfro4i67o|xn--ygbi2ammx|xn--zfr164b)';
	window.syntaxHighlightingRegexps.externalMention = XRegExp.cache('(^|\\s|\\.|<br>|&nbsp;|\\()(@)[a-zA-Z0-9]+(@)[\\p{L}\\p{N}\\-\\.]+(\\.)(' + allDomains + ')($|\\s|\\.|\\,|\\:|\\-|\\<|\\!|\\?|\\&|\\)|\\\')');
	window.syntaxHighlightingRegexps.mention = /(^|\s|\.|<br>|&nbsp;|\()(@)[a-zA-Z0-9]+($|\s|\.|\,|\:|\-|\<|\!|\?|\&|\)|\')/;
	window.syntaxHighlightingRegexps.tag = XRegExp.cache('(^|\\s|\\.|<br>|&nbsp;|\\()(\\#)[\\p{L}\\p{N}\\-\\.]+($|\\s|\\,|\\:|\\<|\\!|\\?|\\&|\\)|\\\')');
	window.syntaxHighlightingRegexps.url = XRegExp.cache('(^|\\s|\\.|<br>|&nbsp;|\\()(http\\:\\/\\/|https\:\\/\\/)([\\p{L}\\p{N}\\-\\.]+)?(\\.)(' + allDomains + ')(\\/[\\p{L}\\p{N}\\%\\!\\*\\\'\\(\\)\\;\\:\\@\\&\\=\\+\\$\\,\\/\\?\\#\\[\\]\\-\\_\\.\\~]+)?(\\/)?($|\\s|\\,|\\:|\\-|\\<|\\!|\\?|\\&|\\)|\\\')');
	window.syntaxHighlightingRegexps.urlWithoutProtocol = XRegExp.cache('(^|\\s|\\.|<br>|&nbsp;|\\()[\\p{L}\\p{N}\\-\\.]+(\\.)(' + allDomains + ')(\\/[\\p{L}\\p{N}\\%\\!\\*\\\'\\(\\)\\;\\:\\@\\&\\=\\+\\$\\,\\/\\?\\#\\[\\]\\-\\_\\.\\~]+)?(\\/)?($|\\s|\\.|\\,|\\:|\\-|\\<|\\!|\\?|\\&|\\)|\\\')');
	window.syntaxHighlightingRegexps.email = XRegExp.cache('(^|\\s|\\.|<br>|&nbsp;|\\()([a-zA-Z0-9\\!\\#\\$\\%\\&\\\'\\*\\+\\-\\/\\=\\?\\^\\_\\`\\{\\|\\}\\~\\.]+)?(@)[\\p{L}\\p{N}\\-\\.]+(\\.)(' + allDomains + ')($|\\s|\\.|\\,|\\:|\\-|\\<|\\!|\\?|\\&|\\)|\\\')');
	cacheSyntaxHighlightingGroups();
	}

/* ·
   ·
   ·  Cache syntax highlighting for groups
   ·
   · · · · · · · · · */

function cacheSyntaxHighlightingGroups() {
	if(window.groupNicknamesAndLocalAliases.length > 0) {
		var allGroupNicknamesAndLocalAliases = '(' + window.groupNicknamesAndLocalAliases.join('|') + ')';
		window.syntaxHighlightingRegexps.group = XRegExp.cache('(^|\\s|\\.|<br>|&nbsp;|\\()(\\!)' + allGroupNicknamesAndLocalAliases + '($|\\s|\\.|\\,|\\:|\\-|\\<|\\!|\\?|\\&|\\)|\\\')');
		}
	}


/* ·
   ·
   ·  User array cache (called array because it's an array in php)
   ·
   ·  Stored in window.userArrayCache with unique key like instance_url/nickname
   ·  with protocol (http:// or https://) trimmed off, e.g. "quitter.se/hannes2peer"
   ·
   · · · · · · · · · */

window.userArrayCache = new Object();
window.convertUriToUserArrayCacheKey = new Object();
window.convertStatusnetProfileUrlToUserArrayCacheKey = new Object();

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
		var instanceUrlWithoutProtocol = guessInstanceUrlWithoutProtocolFromProfileUrlAndNickname(data.local.statusnet_profile_url, data.local.screen_name);
		var key = instanceUrlWithoutProtocol + '/' + data.local.screen_name;
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

		var localOrExternal = detectLocalOrExternalUserObject(data);

		// local
		if(localOrExternal == 'local'){
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
		window.userArrayCache[key].modified = Date.now();

		// easy conversion between URI and statusnet_profile_url and the key we're using in window.userArrayCache
		window.convertUriToUserArrayCacheKey[dataToStore.local.ostatus_uri] = key;
		window.convertStatusnetProfileUrlToUserArrayCacheKey[dataToStore.local.statusnet_profile_url] = key;
		}
	else {
		if(dataToStore.local) {

			// keep old status if newer data doesn't have any
			if(typeof dataToStore.local.status == 'undefined' && typeof window.userArrayCache[key].local.status != 'undefined') {
				dataToStore.local.status = window.userArrayCache[key].local.status;
				}

			window.userArrayCache[key].local = dataToStore.local;

			// easy conversion between URI and statusnet_profile_url and the key we're using in window.userArrayCache
			window.convertUriToUserArrayCacheKey[dataToStore.local.ostatus_uri] = key;
			window.convertStatusnetProfileUrlToUserArrayCacheKey[dataToStore.local.statusnet_profile_url] = key;
			}
		if(dataToStore.external) {
			window.userArrayCache[key].external = dataToStore.external;

			// easy conversion between URI and the key we're using in window.userArrayCache
			window.convertUriToUserArrayCacheKey[dataToStore.external.ostatus_uri] = key;
			window.convertStatusnetProfileUrlToUserArrayCacheKey[dataToStore.external.statusnet_profile_url] = key;
			}
		// store the time when this record was modified
		if(dataToStore.local || dataToStore.external) {
			window.userArrayCache[key].modified = Date.now();
			}
		}
	}

function userArrayCacheGetByLocalNickname(localNickname) {
	if(localNickname.substring(0,1) == '@') {
		localNickname = localNickname.substring(1);
		}
	if(typeof window.userArrayCache[window.siteRootDomain + '/' + localNickname] != 'undefined') {
		return window.userArrayCache[window.siteRootDomain + '/' + localNickname];
		}
	else {
		return false;
		}
	}

function userArrayCacheGetByProfileUrlAndNickname(profileUrl, nickname) {
	if(nickname.substring(0,1) == '@') {
		nickname = nickname.substring(1);
		}
	// the url might match a known profile uri
	if(typeof window.convertUriToUserArrayCacheKey[profileUrl] != 'undefined') {
		if(typeof window.userArrayCache[window.convertUriToUserArrayCacheKey[profileUrl]] != 'undefined') {
			return window.userArrayCache[window.convertUriToUserArrayCacheKey[profileUrl]];
			}
		}
	// or the href attribute might match a known statusnet_profile_url
	else if(typeof window.convertStatusnetProfileUrlToUserArrayCacheKey[profileUrl] != 'undefined') {
		if(typeof window.userArrayCache[window.convertStatusnetProfileUrlToUserArrayCacheKey[profileUrl]] != 'undefined') {
			return window.userArrayCache[window.convertStatusnetProfileUrlToUserArrayCacheKey[profileUrl]];
			}
		}
	// or we try to guess the instance url, and see if we have a match in our cache
	else if(typeof window.userArrayCache[guessInstanceUrlWithoutProtocolFromProfileUrlAndNickname(profileUrl, nickname) + '/' + nickname] != 'undefined') {
		return window.userArrayCache[guessInstanceUrlWithoutProtocolFromProfileUrlAndNickname(profileUrl, nickname) + '/' + nickname];
		}
	// we couldn't find any cached user array
	else {
		return false;
		}
	}

function userArrayCacheGetUserNicknameById(id) {

	var possibleUserURI = window.siteInstanceURL + 'user/' + id;
	var key = window.convertUriToUserArrayCacheKey[possibleUserURI];

	if(typeof key != 'undefined') {
		if(typeof window.userArrayCache[key] != 'undefined') {
			return window.userArrayCache[key].local.screen_name;
			}
		}
	return false;
	}


/* ·
   ·
   ·  Detect if the supplied user object is from the local server or external
   ·
   · · · · · · · · · */

function detectLocalOrExternalUserObject(userObject) {
	var dataProfileImageUrlWithoutProtocol = removeProtocolFromUrl(userObject.profile_image_url);
	var siteInstanceURLWithoutProtocol = removeProtocolFromUrl(window.siteInstanceURL);
	if(dataProfileImageUrlWithoutProtocol.substring(0,siteInstanceURLWithoutProtocol.length) == siteInstanceURLWithoutProtocol){
		return 'local';
		}
	else {
		return 'external';
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
	if(typeof url == 'undefined'
	|| url === null
	|| url === false
	|| url == '') {
		return '';
		}
	if(url.indexOf('://') == -1) {
		return url;
		}
	return url.substring(url.indexOf('://')+3);
	}

/* ·
   ·
   ·  Get host from URL
   ·
   · · · · · · · · · */

function getHost(url) {
    var a = document.createElement('a');
    a.href = url;
    return a.hostname;
	}


/* ·
   ·
   ·  Is this url a link to my profile?
   ·
   · · · · · · · · · */

function thisIsALinkToMyProfile(url) {
	if(typeof url == 'undefined') {
		return false;
		}
	if(!window.loggedIn) {
		return false;
		}
	if(url.slice(-1) == '/') { // remove trailing '/'
		url = url.slice(0,-1);
		}
	var urlWithoutProtocol = removeProtocolFromUrl(url);
	if(removeProtocolFromUrl(window.loggedIn.statusnet_profile_url) == urlWithoutProtocol) {
		return true;
		}
	var userIdUrlWithoutProtocol = removeProtocolFromUrl(window.siteInstanceURL) + 'user/' + window.loggedIn.id;
	if(userIdUrlWithoutProtocol == urlWithoutProtocol) {
		return true;
		}
	return false;
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
   ·   Updates user data loaded into the stream with the latest data from the user array cache
   ·   This function should therefor always be invoked _after_ searchForUserDataToCache()
   ·
   · · · · · · · · · · · · · */

function updateUserDataInStream() {
	var timeNow = Date.now();
	$.each(window.userArrayCache,function(k,userArray){
		// if the cache record was updated the latest second, we assume this is brand new info that we haven't
		// updated the stream with
		if(typeof userArray.local != 'undefined'
		&& userArray.local !== false
		&& typeof userArray.modified != 'undefined'
		&& (timeNow-userArray.modified)<1000) {

			// add/remove silenced class to stream items and profile cards
			if(userArray.local.is_silenced === true) {
				$('.stream-item[data-user-id=' + userArray.local.id + ']').addClass('silenced');
				$('.profile-card .profile-header-inner[data-user-id=' + userArray.local.id + ']').addClass('silenced');
				$('.user-menu-cog[data-user-id=' + userArray.local.id + ']').addClass('silenced');
				}
			else {
				$('.stream-item[data-user-id=' + userArray.local.id + ']').removeClass('silenced')
				$('.profile-card .profile-header-inner[data-user-id=' + userArray.local.id + ']').removeClass('silenced');
				$('.user-menu-cog[data-user-id=' + userArray.local.id + ']').removeClass('silenced');
				}


			// add/remove sandboxed class to stream items and profile cards
			if(userArray.local.is_sandboxed === true) {
				$('.stream-item[data-user-id=' + userArray.local.id + ']').addClass('sandboxed');
				$('.profile-card .profile-header-inner[data-user-id=' + userArray.local.id + ']').addClass('sandboxed');
				$('.user-menu-cog[data-user-id=' + userArray.local.id + ']').addClass('sandboxed');
				}
			else {
				$('.stream-item[data-user-id=' + userArray.local.id + ']').removeClass('sandboxed')
				$('.profile-card .profile-header-inner[data-user-id=' + userArray.local.id + ']').removeClass('sandboxed');
				$('.user-menu-cog[data-user-id=' + userArray.local.id + ']').removeClass('sandboxed');
				}

			// profile size avatars (notices, users)
			$.each($('img.avatar.profile-size[data-user-id="' + userArray.local.id + '"]'),function(){
				if($(this).attr('src') != userArray.local.profile_image_url_profile_size) {
					$(this).attr('src',userArray.local.profile_image_url_profile_size);
					}
				});

			// standard size avatars (notifications)
			$.each($('img.avatar.standard-size[data-user-id="' + userArray.local.id + '"]'),function(){
				if($(this).attr('src') != userArray.local.profile_image_url) {
					$(this).attr('src',userArray.local.profile_image_url);
					}
				});

			// full names
			$.each($('strong.name[data-user-id="' + userArray.local.id + '"],\
					  .fullname[data-user-id="' + userArray.local.id + '"]'),function(){
				if($(this).html() != userArray.local.name) {
					$(this).html(userArray.local.name);
					}
				});

			// user/screen names
			$.each($('.screen-name[data-user-id="' + userArray.local.id + '"]'),function(){
				if($(this).html().substring(1) != userArray.local.screen_name) {
					$(this).html('@' + userArray.local.screen_name);
					}
				});

			// profile urls
			// try to find the last account group with this id, if the statusnet_profile_url seems to
			// be changed we replace it wherever we can find it, even in list urls etc that starts with statusnet_profile_url
			if($('a.account-group[data-user-id="' + userArray.local.id + '"]').last().attr('href') != userArray.local.statusnet_profile_url) {
				var oldStatusnetProfileURL = $('a.account-group[data-user-id="' + userArray.local.id + '"]').last().attr('href');
				// all links with the exact statusnet_profile_url
				$.each($('[href="' + oldStatusnetProfileURL + '"]'),function(){
					$(this).attr('href',userArray.local.statusnet_profile_url);
					});
				// links starting with statusnet_profile_url
				$.each($('[href*="' + oldStatusnetProfileURL + '/"]'),function(){
					$(this).attr('href',$(this).attr('href').replace(oldStatusnetProfileURL + '/',userArray.local.statusnet_profile_url + '/'));
					});
				}

			// cover photos
			$.each($('.profile-header-inner[data-user-id="' + userArray.local.id + '"]'),function(){
				if($(this).css('background-image') != 'url("' + userArray.local.cover_photo + '")' && userArray.local.cover_photo != false) {
					$(this).css('background-image','url("' + userArray.local.cover_photo + '")');
					}
				});

			// the window.following object might need updating also
			if(typeof window.following != 'undefined' && typeof window.following[userArray.local.id] != 'undefined') {
				if(window.following[userArray.local.id].avatar != userArray.local.profile_image_url) {
					window.following[userArray.local.id].avatar = userArray.local.profile_image_url;
					}
				if(window.following[userArray.local.id].name != userArray.local.name) {
					window.following[userArray.local.id].name = userArray.local.name;
					}
				if(window.following[userArray.local.id].username != userArray.local.screen_name) {
					window.following[userArray.local.id].username = userArray.local.screen_name;
					}
				}

			}
		});
	}

/* ·
   ·
   ·   Iterates recursively through an API response in search for updated notice data
   ·   If we find a "repeated" key we assume the parent is a notice object (chosen arbitrary)
   ·
   · · · · · · · · · · · · · */

window.knownDeletedNotices = new Object();
function searchForUpdatedNoticeData(obj) {
	var streamItemsUpdated = false;
	for (var property in obj) {
		if (obj.hasOwnProperty(property)) {
			if (typeof obj[property] == "object") {
				searchForUpdatedNoticeData(obj[property]);
				}
			else if(typeof obj[property] == 'boolean' && property == 'repeated') {
				var streamItemFoundInFeed = $('.stream-item[data-conversation-id][data-quitter-id="' + obj.id + '"]'); // data-conversation-id identifies it as a notice, not a user or something

				// if this is a special qvitter-delete-notice activity notice it means we try to hide
				// the deleted notice from our stream
	            // the uri is in the obj.text var, between the double curly brackets
				if(typeof obj.qvitter_delete_notice != 'undefined' && obj.qvitter_delete_notice == true) {
					var uriToHide = obj.text.substring(obj.text.indexOf('{{')+2,obj.text.indexOf('}}'));
					window.knownDeletedNotices[uriToHide] = true;
	                var streamItemToHide = $('.stream-item[data-uri="' + uriToHide + '"]');
					slideUpAndRemoveStreamItem(streamItemToHide);
					streamItemsUpdated = true;
					}
				// if this is not a delete notice it means the notice exists and is not deleted,
				// correct any notices that are marked as unrepeated, they might have
				// been marked like that by mistake (i.e. a bug...)
				else if(streamItemFoundInFeed.hasClass('unrepeated')) {
					streamItemFoundInFeed.removeClass('unrepeated always-hidden');
					streamItemsUpdated = true;
					}

				// ordinary notices
				else if(streamItemFoundInFeed.length>0) {

					var queetFoundInFeed = streamItemFoundInFeed.children('.queet');
					var queetID = streamItemFoundInFeed.attr('data-quitter-id');

					// sometimes activity notices don't get the is_activity flag set to true
					// maybe because they were in the process of being saved when
					// we first got them
					if(obj.is_post_verb === false) {
						streamItemFoundInFeed.addClass('activity always-hidden');
						streamItemsUpdated = true;
						}

					// update the avatar row if the queet is expanded and the numbers are not the same
					if(streamItemFoundInFeed.hasClass('expanded')) {
						var oldFavNum = parseInt(queetFoundInFeed.find('.action-fav-num').text(),10);
						var oldRQNum = parseInt(queetFoundInFeed.find('.action-rq-num').text(),10);
						if(oldFavNum != obj.fave_num || oldRQNum != obj.repeat_num) {
							getFavsAndRequeetsForQueet(streamItemFoundInFeed, queetID);
							}
						}

					// attachments might have been added/changed/have had time to be processed
					if(queetFoundInFeed.children('script.attachment-json').text() != JSON.stringify(obj.attachments)) {
						if(queetFoundInFeed.children('script.attachment-json').length == 0) {
							queetFoundInFeed.prepend('<script class="attachment-json" type="application/json">' + JSON.stringify(obj.attachments) + '</script>');
							}
						else {
							queetFoundInFeed.children('script.attachment-json').text(JSON.stringify(obj.attachments));
							}
						var attachmentsHTMLBuild = buildAttachmentHTML(obj.attachments);
						var thumbsIsHidden = false;
						if(queetFoundInFeed.find('.queet-thumbs').hasClass('hide-thumbs')) {
							var thumbsIsHidden = true;
							}
						queetFoundInFeed.find('.queet-thumbs').remove();
						queetFoundInFeed.find('.oembed-data').remove();
						placeQuotedNoticesInQueetText(attachmentsHTMLBuild.quotedNotices,queetFoundInFeed.find('.queet-text'));
						// we might want to hide urls (rendered as attachments) in the queet text
						$.each(queetFoundInFeed.find('.queet-text').find('a'),function(){
							if(attachmentsHTMLBuild.urlsToHide.indexOf($(this).text()) > -1) {
								$(this).removeAttr('style'); // temporary fix
								$(this).addClass('hidden-embedded-link-in-queet-text');
								}
							});
						queetFoundInFeed.find('.queet-text').after(attachmentsHTMLBuild.html);
						if(thumbsIsHidden) {
							queetFoundInFeed.find('.queet-thumbs').addClass('hide-thumbs');
							}
						streamItemsUpdated = true;
						}

					// attentions might have been added to a notice
					if(queetFoundInFeed.children('script.attentions-json').text() != JSON.stringify(obj.attentions)) {
						if(queetFoundInFeed.children('script.attentions-json').length == 0) {
							queetFoundInFeed.prepend('<script class="attentions-json" type="application/json">' + JSON.stringify(obj.attentions) + '</script>');
							}
						else {
							queetFoundInFeed.children('script.attentions-json').text(JSON.stringify(obj.attentions));
							}
						}

					// set favorite data
					queetFoundInFeed.find('.action-fav-num').attr('data-fav-num',obj.fave_num);
					queetFoundInFeed.find('.action-fav-num').html(obj.fave_num);
					if(obj.favorited) {
						streamItemFoundInFeed.addClass('favorited');
						queetFoundInFeed.find('.action-fav-container').children('.with-icn').addClass('done');
						queetFoundInFeed.find('.action-fav-container').find('.icon.sm-fav').attr('data-tooltip',window.sL.favoritedVerb);
						streamItemsUpdated = true;
						}
					else {
						streamItemFoundInFeed.removeClass('favorited');
						queetFoundInFeed.find('.action-fav-container').children('.with-icn').removeClass('done');
						queetFoundInFeed.find('.action-fav-container').find('.icon.sm-fav').attr('data-tooltip',window.sL.favoriteVerb);
						streamItemsUpdated = true;
						}

					// set repeat data
					queetFoundInFeed.find('.action-rq-num').attr('data-rq-num',obj.repeat_num);
					queetFoundInFeed.find('.action-rq-num').html(obj.repeat_num);
					if(obj.repeated) {
						streamItemFoundInFeed.addClass('requeeted');
						queetFoundInFeed.find('.action-rt-container').children('.with-icn').addClass('done');
						queetFoundInFeed.find('.action-rt-container').find('.icon.sm-rt').attr('data-tooltip',window.sL.requeetedVerb);
						streamItemFoundInFeed.attr('data-requeeted-by-me-id',obj.repeated_id);
						streamItemsUpdated = true;
						}
					else {
						streamItemFoundInFeed.removeClass('requeeted');
						queetFoundInFeed.find('.action-rt-container').children('.with-icn').removeClass('done');
						queetFoundInFeed.find('.action-rt-container').find('.icon.sm-rt').attr('data-tooltip',window.sL.requeetVerb);
						streamItemFoundInFeed.removeAttr('data-requeeted-by-me-id');
						streamItemsUpdated = true;
						}
					}
				}
			}
		}
	if(streamItemsUpdated) {
		// TODO, create a queue that runs with setInterval instead, say every 5 s,
		// that way we can run rememberStreamStateInLocalStorage() in the background,
		// and don't slow down stream change etc
		// rememberStreamStateInLocalStorage();
		}
	}


/* ·
   ·
   ·  Removes a deleted stream item from the feed gracefully, if not already hidden
   ·
   · · · · · · · · · */

function slideUpAndRemoveStreamItem(streamItem,callback) {
	if(streamItem.length>0 && !streamItem.hasClass('always-hidden')) {
		streamItem.animate({opacity:'0.2'},1000,'linear',function(){
			$(this).css('height',$(this).height() + 'px');
			$(this).animate({height:'0px'},500,'linear',function(){
				$(this).addClass('deleted always-hidden');
				rememberStreamStateInLocalStorage();
				if(typeof callback == 'function') {
					callback();
					}
				});
			});
		}
	}

/* ·
   ·
   ·  Store the current stream's state (html) in localStorage (if we're logged in)
   ·
   · · · · · · · · · */


function rememberStreamStateInLocalStorage() {
	if(typeof window.currentStreamObject != 'undefined') {

		// don't store expanded content, only store profile card and the top 20 visible stream-items
		var firstTwentyVisibleHTML = '';
		var i = 0;
		$.each($('#feed-body').children('.stream-item'),function(k,streamItem){
			firstTwentyVisibleHTML += $(streamItem).outerHTML();
			if(!$(streamItem).hasClass('always-hidden')) {
				i++;
				}
			if(i>20) {
				return false;
				}
			});

		var feed = $('<div/>').append(firstTwentyVisibleHTML);

		// we add some of these things again when the notices are fetched from the cache
		cleanStreamItemsFromClassesAndConversationElements(feed);

		var feedHtml = feed.html();
		var profileCardHtml = $('#feed').siblings('.profile-card').outerHTML();
		var streamData = {
			card: profileCardHtml,
			feed: feedHtml
			};

		localStorageObjectCache_STORE('streamState',window.currentStreamObject.path, streamData);
		}
	}

/* ·
   ·
   ·   Clean stream items from classes and conversation elements,
   ·   to use e.g. for caching and including in popup footers
   ·
   ·   @param streamItems: jQuery object with stream items as children
   ·
   · · · · · · · · · */

function cleanStreamItemsFromClassesAndConversationElements(streamItems) {
	streamItems.children('.stream-item').removeClass('profile-blocked-by-me');
	streamItems.children('.stream-item').children('.queet').removeAttr('data-tooltip'); // can contain tooltip about blocked user

	streamItems.find('.temp-post').remove();
	streamItems.children('.stream-item').removeClass('not-seen');
	streamItems.children('.stream-item').removeClass('hidden-repeat'); // this means we need hide repeats when adding cached notices to feed later
	streamItems.children('.stream-item').removeClass('selected-by-keyboard');
	streamItems.find('.dropdown-menu').remove();
	streamItems.find('.stream-item').removeClass('expanded').removeClass('next-expanded').removeClass('hidden').removeClass('collapsing').addClass('visible');
	streamItems.children('.stream-item').each(function() {
		cleanUpAfterCollapseQueet($(this));
		});
	}


/* ·
   ·
   ·   Hide all instances (repeats) of a notice but the first/oldest one
   ·
   ·   @param streamItems: jQuery object with stream items as children
   ·
   · · · · · · · · · */

function hideAllButOldestInstanceOfStreamItem(streamItemContainer) {
	streamItemContainer.children('.stream-item').each(function(){
		// if this stream item have siblings _after_ it, with the same id, hide it!
		if($(this).nextAll('.stream-item[data-quitter-id="' + $(this).attr('data-quitter-id') + '"]').length > 0) {
			$(this).addClass('hidden-repeat');
			}
		});
	return streamItemContainer;
	}



/* ·
   ·
   ·  Gets the full unshortened HTML for a queet
   ·
   · · · · · · · · · */

function getFullUnshortenedHtmlForQueet(streamItem, cacheOnly) {
	if(typeof cacheOnly == 'undefined') {
		var cacheOnly = false;
		}
	var queet = streamItem.children('.queet');
	var queetId = streamItem.attr('data-quitter-id');
	var attachmentMore = queet.find('span.attachment.more');
	// only if actually shortened
	if(attachmentMore.length>0
	&& queet.children('script.attachment-json').length > 0
	&& queet.children('script.attachment-json').text() != 'undefined') {
		// first try localstorage cache
		var cacheData = localStorageObjectCache_GET('fullQueetHtml',queetId);
		if(cacheData) {
			queet.find('.queet-text').html(cacheData);
			queet.outerHTML(detectRTL(queet.outerHTML()));
			}
		// then try static html file attachment, that we should have in the attachment-json script element
		else if(cacheOnly === false){
			var attachmentId = attachmentMore.attr('data-attachment-id');
			$.each(JSON.parse(queet.children('script.attachment-json').text()), function(k,attachment) {
				if(attachment.id == attachmentId) {
					$.get(attachment.url,function(data){
						if(data) {
							// get body and store in localStorage
							var bodyHtml = $('<html/>').html(data).find('body').html();
							localStorageObjectCache_STORE('fullQueetHtml',queetId,bodyHtml);
							queet.find('.queet-text').html($.trim(bodyHtml));
							queet.outerHTML(detectRTL(queet.outerHTML()));
							}
						});
					return false;
					}
				});
			}
		}
	}

/* ·
   ·
   ·  Appends a user to the array containing the mentions suggestions to show when typing a notice
   ·
   · · · · · · · · · */

function appendUserToMentionsSuggestionsArray(user) {

	if(typeof window.following[user.id] == 'undefined') {

		// in the window.following array, we use "false" as url if it's a user from this instance
		if(user.is_local) {
			var url = false;
			}
		else {
			var url = guessInstanceUrlWithoutProtocolFromProfileUrlAndNickname(user.statusnet_profile_url,user.screen_name);
			}

		var userToAdd = {
			avatar: user.profile_image_url,
			id: user.id,
			name: user.name,
			url: url,
			username: user.screen_name
			};

		window.following[user.id] = userToAdd;
		}

	}


/* ·
   ·
   ·  Is a profile pref in the qvitter namespace enabled?
   ·
   · · · · · · · · · */

function isQvitterProfilePrefEnabled(topic) {
	if(typeof window.qvitterProfilePrefs != 'undefined' && typeof window.qvitterProfilePrefs[topic] != 'undefined'
		&& window.qvitterProfilePrefs[topic] !== null
		&& window.qvitterProfilePrefs[topic] != ''
		&& window.qvitterProfilePrefs[topic] !== false
		&& window.qvitterProfilePrefs[topic] != 0
		&& window.qvitterProfilePrefs[topic] != '0') {
		return true;
		}
	return false;
	}

/* ·
   ·
   ·  Is this user muted?
   ·
   · · · · · · · · · */

function isUserMuted(userID) {
	if(isQvitterProfilePrefEnabled('mute:' + userID)) {
		return true;
		}
	else {
		return false;
		}
	}


/* ·
   ·
   ·  Display unread notifications
   ·
   · · · · · · · · · */

function displayOrHideUnreadNotifications(notifications) {

		var data = $.parseJSON(notifications);
		var totNotif = 0;

		if(data !== null && typeof data != 'undefined') {
			$.each(data,function(k,v){
				totNotif = totNotif + parseInt(v,10);
				});
			}

		if(window.currentStreamObject.name == 'notifications') {
			var hiddenNotifications = $('#feed-body').find('.stream-item.hidden:not(.always-hidden)').length;
			if(hiddenNotifications>0) {
				totNotif = totNotif + hiddenNotifications;
				}
			}

		if(totNotif>0) {
			$('#unseen-notifications').html(totNotif);
			document.title = '(' + totNotif + ') ' + window.siteTitle; // update html page title
			$('#unseen-notifications').show();
			}
		else {
			$('#unseen-notifications').hide();
			document.title = window.siteTitle;
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
			else if(typeof obj[property] == 'string'
			&& property != 'statusnet_html'
			&& property != 'oembedHTML' // we trust this to be cleaned server side
			&& property != 'source') {
				obj[property] = replaceHtmlSpecialChars(obj[property]);
				}
			}
		}
	return obj;
	}
function replaceHtmlSpecialChars(text) {

	// don't do anything if the text is undefined
	if(typeof text == 'undefined') {
		return text;
		}

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

	if(validEmail(email.val())) {
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

function validEmail(email) {
	if(/^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(email)) {
		return true;
		}
	else {
		return false;
		}
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
	if(!window.loggedIn &&
	(window.currentStreamObject.name == 'public timeline' || window.currentStreamObject.name == 'public and external timeline')) {
		obj.backgroundimage = window.fullUrlToThisQvitterApp + window.siteBackground;
		obj.backgroundcolor = window.defaultBackgroundColor;
		obj.linkcolor = window.defaultLinkColor;
		}


	// if no object is defined, abort
	if(typeof obj == 'undefined') {
		return false;
		}

	// remember the design for this stream
	if(typeof window.oldStreamsDesigns[window.currentStreamObject.nickname] == 'undefined') {
		window.oldStreamsDesigns[window.currentStreamObject.nickname] = new Object();
		}

	// change design elements
	if(typeof obj.backgroundimage != 'undefined') {
		if(obj.backgroundimage === false || obj.backgroundimage == '') {
			$('body').css('background-image','url(\'\')');
			}
		else if(obj.backgroundimage.length > 4) {
			$('body').css('background-image','url(\'' + obj.backgroundimage + '\')');
			}
		window.oldStreamsDesigns[window.currentStreamObject.nickname].backgroundimage = obj.backgroundimage;
		}
	if(typeof obj.backgroundcolor != 'undefined') {
		if(obj.backgroundcolor === false || obj.backgroundcolor == '') {
			obj.backgroundcolor = window.defaultBackgroundColor;
			}
		changeBackgroundColor(obj.backgroundcolor);
		window.oldStreamsDesigns[window.currentStreamObject.nickname].backgroundcolor = obj.backgroundcolor;
		}
	if(typeof obj.linkcolor != 'undefined') {
		if(obj.linkcolor === false || obj.linkcolor == '') {
			obj.linkcolor = window.defaultLinkColor;
			}
		changeLinkColor(obj.linkcolor);
		window.oldStreamsDesigns[window.currentStreamObject.nickname].linkcolor = obj.linkcolor;
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
    // or if no chars (that we are interested, but body is set to rtl)
    if(RTLnum > LTRnum
    || ($queetText.html().length==0 && $('body').hasClass('rtl'))) {
    	$streamItem.children('.stream-item').children('.queet').addClass('rtl');
    	}
    else {
		// for ltr languages we move @, ! and # to inside
    	$streamItem.find('.queet-text').find('.h-card.mention').prepend('@');
    	$streamItem.find('.queet-text').find('.h-card.group').prepend('!');
    	$streamItem.find('.queet-text').find('.vcard .fn.nickname:not(.group)').prepend('@'); // very old style
        $streamItem.find('.queet-text').find('.vcard .nickname.mention:not(.fn)').prepend('@'); // old style
    	$streamItem.find('.queet-text').find('.vcard .nickname.group').prepend('!'); // old style
    	$streamItem.find('.queet-text').find('a[rel="tag"]').prepend('#');
    	}

	// we remove @, ! and #, they are added as pseudo elements, or have been moved to the inside
   	return $streamItem.html().replace(/@<a/gi,'<a').replace(/!<a/gi,'<a').replace(/@<span class="vcard">/gi,'<span class="vcard">').replace(/!<span class="vcard">/gi,'<span class="vcard">').replace(/#<span class="tag">/gi,'<span class="tag">');
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
    var system_date = parseDate(tdate);
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
    var system_date = parseDate(tdate);
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
function parseDate(str) {
 	if(typeof str != 'undefined') {
		var v=str.split(' ');
	 	return new Date(Date.parse(v[1]+" "+v[2]+", "+v[5]+" "+v[3]+" "+v[4]));
		}
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
   ·   Saves the user's bookmarks to the server
   ·
   · · · · · · · · · · · · · */

function saveAllBookmarks() {
	var i=0;
	var bookmarkContainer = new Object();
	$.each($('#bookmark-container .stream-selection'), function(key,obj) {
		bookmarkContainer[i] = new Object();
		bookmarkContainer[i].dataStreamHref = $(obj).attr('href');
		bookmarkContainer[i].dataStreamHeader = $(obj).text();
		i++;
		});

	postUpdateBookmarks(bookmarkContainer);

	$('#bookmark-container').sortable({delay: 100});
	$('#bookmark-container').disableSelection();
	}


/* ·
   ·
   ·   Append all bookmarks to the bookmark container
   ·
   · · · · · · · · · · · · · */

function appendAllBookmarks(bookmarkContainer) {
	if(typeof bookmarkContainer != 'undefined' && bookmarkContainer) {
		$('#bookmark-container').html('');
		var bookmarkContainerParsed = JSON.parse(bookmarkContainer);
		$.each(bookmarkContainerParsed, function(key,obj) {
			$('#bookmark-container').append('<a class="stream-selection" href="' + obj.dataStreamHref + '">' + obj.dataStreamHeader + '<i class="chev-right" data-tooltip="' + window.sL.tooltipRemoveBookmark + '"></i></a>');
			});
		}
	$('#bookmark-container').sortable({delay: 100});
	$('#bookmark-container').disableSelection();
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
			historyContainer[i].dataStreamHeader = $(obj).text();
			i++;
			});
		localStorageObjectCache_STORE('browsingHistory', window.loggedIn.screen_name,historyContainer);
		if($('#history-container .stream-selection').length==0) {
			$('#history-container').css('display','none');
			}
		else {
			$('#history-container').css('display','block');
			}
		}
	}


/* ·
   ·
   ·   Loads history from local storage to menu
   ·
   · · · · · · · · · · · · · */

function loadHistoryFromLocalStorage() {
	if(localStorageIsEnabled()) {
		var cacheData = localStorageObjectCache_GET('browsingHistory', window.loggedIn.screen_name);
		if(cacheData) {
			$('#history-container').css('display','block');
			$('#history-container').html('');
			$.each(cacheData, function(key,obj) {
				var streamHeader = replaceHtmlSpecialChars(obj.dataStreamHeader); // because we're pulling the header with jQuery.text() before saving in localstorage, which unescapes our escaped html
				$('#history-container').append('<a class="stream-selection" href="' + obj.dataStreamHref + '">' + streamHeader + '<i class="chev-right" data-tooltip="' + window.sL.tooltipBookmarkStream + '"></i></a>');
				});
			}
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
   ·   Prefill the queet box with cached text, if there is any in an attribute
   ·
   ·   @param queetBox: jQuery object for the queet box
   ·
   · · · · · · · · · · · · · */

function maybePrefillQueetBoxWithCachedText(queetBox) {
    var cachedText = decodeURIComponent(queetBox.attr('data-cached-text'));
    var cachedTextText = $('<div/>').html(cachedText).text();
    if(cachedText != 'undefined' && cachedText != 'false') {
        queetBox.click();
        queetBox.html(cachedText);
        setSelectionRange(queetBox[0], cachedTextText.length, cachedTextText.length);
        queetBox.trigger('input');
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
   ·   Scroll to a stream item
   ·
   ·   @param streamItem: jQuery object to scroll to
   ·
   · · · · · · · · · · · · · */

function scrollToQueet(streamItem) {
	var streamItemPos = streamItem.offset().top;
	var windowHeight = $(window).height();
	var streamItemHeight = streamItem.outerHeight();
	// console.log(streamItemHeight);
	// console.log(windowHeight);
	var newScrollPos = Math.round(streamItemPos - windowHeight/2 + streamItemHeight/2);
	$('html, body').scrollTop(newScrollPos);
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
   ·   Sort divs by attribute descending
   ·
   · · · · · · · · · · · · · */

jQuery.fn.sortDivsByAttrDesc = function sortDivsByAttrDesc(attr) {
    $("> div", this[0]).sort(dec_sort).appendTo(this[0]);
    function dec_sort(a, b){ return parseInt($(b).attr(attr),10) > parseInt($(a).attr(attr),10) ? 1 : -1; }
}


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

		$.ajax({ url: window.urlShortenerAPIURL + '?format=jsonp&action=shorturl&signature=' + window.urlShortenerSignature + '&url=' + encodeURIComponent(url), type: "GET", dataType: "jsonp",
			success: function(data) {

				if(typeof data.shorturl != 'undefined') {

					shortenButton.closest('.queet-toolbar').siblings('.upload-image-container').children('img[data-shorturl="' + data.url.url + '"]').attr('data-shorturl',data.shorturl);
					shortenButton.parent().parent().siblings('.queet-box-syntax').html(shortenButton.parent().parent().siblings('.queet-box-syntax').html().replace($('<div/>').text(data.url.url).html(), data.shorturl));
					shortenButton.parent().parent().siblings('.queet-box-syntax').trigger('keyup');
					shortenButton.addClass('disabled'); // make sure the button is disabled right after
					}
				remove_spinner();
				},
			error: function(data) {
				console.log(data);
				remove_spinner();
				}
			});
		});
	}


/* ·
   ·
   ·   Youtube embed link from youtube url
   ·
   · · · · · · · · · · · · · */

function youTubeEmbedLinkFromURL(url) {
	var youtubeId = url.replace('http://www.youtube.com/watch?v=','').replace('https://www.youtube.com/watch?v=','').replace('http://youtu.be/','').replace('https://youtu.be/','').substr(0,11);

	// get start time hash
	var l = document.createElement("a");
	l.href = url;
	if(l.hash.substring(0,3) == '#t=') {
		return '//www.youtube.com/embed/' + youtubeId + '?start=' + l.hash.substring(3);
		}
	else {
		return '//www.youtube.com/embed/' + youtubeId;
		}
	}



/* ·
   ·
   ·   String similarity
   ·
   ·   @params string1, string2:
   ·   @returns (int) percent similarity
   ·
   · · · · · · · · · · · · · */

function stringSimilarity(string1, string2) {

	if(typeof string1 != 'string' || typeof string2 != 'string') {
		return 0;
		}

	// trim and strip html tags
	string1 = $('<div/>').html($.trim(string1)).text();
	string2 = $('<div/>').html($.trim(string2)).text();

	var longestStringLength = string1.length;
	if(string2.length>string1.length) {
		longestStringLength = string2.length;
	}

	var distanceArray = levenshteinenator(string1, string2);
	var distance = distanceArray[distanceArray.length-1][distanceArray[distanceArray.length-1].length-1];

	var percentSimilarity = 100-Math.round(distance/longestStringLength*100);

	return percentSimilarity;
	}

// from http://andrew.hedges.name/experiments/levenshtein/
var levenshteinenator = (function () {

	/**
	 * @param String a
	 * @param String b
	 * @return Array
	 */
	function levenshteinenator(a, b) {
		var cost;
		var m = a.length;
		var n = b.length;

		// make sure a.length >= b.length to use O(min(n,m)) space, whatever that is
		if (m < n) {
			var c = a; a = b; b = c;
			var o = m; m = n; n = o;
		}

		var r = []; r[0] = [];
		for (var c = 0; c < n + 1; ++c) {
			r[0][c] = c;
		}

		for (var i = 1; i < m + 1; ++i) {
			r[i] = []; r[i][0] = i;
			for ( var j = 1; j < n + 1; ++j ) {
				cost = a.charAt( i - 1 ) === b.charAt( j - 1 ) ? 0 : 1;
				r[i][j] = minimator( r[i-1][j] + 1, r[i][j-1] + 1, r[i-1][j-1] + cost );
			}
		}

		return r;
	}

	/**
	 * Return the smallest of the three numbers passed in
	 * @param Number x
	 * @param Number y
	 * @param Number z
	 * @return Number
	 */
	function minimator(x, y, z) {
		if (x <= y && x <= z) return x;
		if (y <= x && y <= z) return y;
		return z;
	}

	return levenshteinenator;

}());
