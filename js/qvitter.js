
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

// plugins can add translatons to this object
window.pluginTranslations = [];

// object to keep old states of streams in, to speed up stream change
window.oldStreams = new Object();

// check our localStorage and make sure it's correct
checkLocalStorage();

// don't let users inject html/scripts into their own user data... not that it matters, it is only displayed to themselves, but just to be 200% safe
window.loggedIn = iterateRecursiveReplaceHtmlSpecialChars(window.loggedIn);

// hack to supress basic auth popup, e.g. if the user has to tabs open and
// log out in one of them. but microsoft browsers doesn't support this
if(typeof bowser.msie == 'undefined' && typeof bowser.msedge == 'undefined') {
	window.apiRoot = window.apiRoot.replace('://','://x:x@');
	}


/* ·
   ·
   ·   Update stream on back button
   ·
   · · · · · · · · · · · · · */

window.onpopstate = function(event) {
	if(event && event.state) {
		display_spinner();
		setNewCurrentStream(pathToStreamRouter(event.state.strm),false,false,function(){
			remove_spinner();
			});
		}
	}


/* ·
   ·
   ·   Discard error messages
   ·
   · · · · · · · · · · · · · */

$('body').on('click','.discard-error-message',function(){

	// don't nag on people
	if($(this).parent().hasClass('language-error-message')) {
		localStorageObjectCache_STORE('languageErrorMessageDiscarded',$(this).parent().attr('data-language-name'), true);
		}

	$(this).addClass('clicked');
	$(this).closest('.error-message, .language-error-message').slideUp(100,function(){
		$(this).remove();
		});
	});


/* ·
   ·
   ·   welcome text expand and collapse
   ·
   · · · · · · · · · · · · · */

$('body').on('click','.show-full-welcome-text, .front-welcome-text:not(.expanded) sup',function(){
	$('.front-welcome-text').toggleClass('expanded');
	if($('.front-welcome-text').hasClass('expanded')) {
		var welcomeTextInnerObjectsHeightSum = $('.front-welcome-text > p').outerHeight() + $('.front-welcome-text > h1').outerHeight() + 50;
		$('.front-welcome-text').css('height', welcomeTextInnerObjectsHeightSum + 'px')
		}
	else {
		$('.front-welcome-text').css('height', '180px');
		$('.front-welcome-text').css('overflow', 'hidden');
		var scrollTo = $(window).scrollTop() - ($('.front-welcome-text').outerHeight()-200);
		if(scrollTo < 0) { scrollTo = 0;}
		$('html, body').animate({ scrollTop: scrollTo}, 300, 'linear');
		}
	});
$('body').on('click','.welcome-text-register-link',function(){
	var scrollTo = $('#user-container').offset().top;
	$('html, body').animate({ scrollTop: scrollTo}, 300, 'linear');
	});



/* ·
   ·
   ·   Check for tooltips to display
   ·
   · · · · · · · · · · · · · */

$('body').on({
    mouseover: function (e) {
		removeAllTooltips();

		// convert title to tooltip
		if($(e.target).is('[title]')) {
			var titleAttribute = replaceHtmlSpecialChars($(e.target).attr('title')); // can contain malicious code
			$(e.target).attr('data-tooltip',titleAttribute);
			$(e.target).removeAttr('title');
			}

		// regular tooltips
		if($(e.target).is('[data-tooltip]')) {

			var tooltipClass = '';

			tooltip_data = $(e.target).attr('data-tooltip');

			// if embedded content is hidden, we show it in tooltips
			if($('#feed-body').hasClass('embedded-content-hidden-by-user')
			&& !$(e.target).is('.oembed-item')
			&& $(e.target).closest('.queet').length > 0
			&& $(e.target).closest('.queet').find('.oembed-item[href="' + $(e.target).attr('href') + '"]').length > 0) {
				tooltip_data = $(e.target).closest('.queet').find('.oembed-item[href="' + $(e.target).attr('href') + '"]').html();
				tooltipClass = 'oembed';
				}
			else if($('#feed-body').hasClass('embedded-content-hidden-by-user')
			&& !$(e.target).is('.attachment-thumb')
			&& $(e.target).closest('.queet').length > 0
			&& $(e.target).text().indexOf('/attachment/') > -1) {
				// local attachments has /attachment/-url in its href attribute
				if($(e.target).closest('.queet').find('.thumb-container[data-local-attachment-url="' + $(e.target).attr('href') + '"]').length>0) {
					tooltip_data = $(e.target).closest('.queet').find('.thumb-container[data-local-attachment-url="' + $(e.target).attr('href') + '"]').outerHTML();
					tooltipClass = 'thumb';
					}
				// remote attachments are identified by full url
				else if($(e.target).closest('.queet').find('.thumb-container[href="' + $(e.target).attr('data-tooltip') + '"]').length>0) {
					tooltip_data = $(e.target).closest('.queet').find('.thumb-container[href="' + $(e.target).attr('data-tooltip') + '"]').outerHTML();
					tooltipClass = 'thumb';
					}
				// sometimes the attachment link in the queet text does not give us any clue to
				// which attachment it is referring to. but if it is the only link and there is
				// exactly one attachment, we can safely assume that the link is referring to
				// that attachment
				else if($(e.target).closest('.queet').find('.thumb-container').length == 1
					&& $(e.target).closest('.queet-text').find('a.attachment').length == 1) {
					tooltip_data = $(e.target).closest('.queet').find('.thumb-container').outerHTML();
					tooltipClass = 'thumb';
					}
				}
			else if($('#feed-body').hasClass('quotes-hidden-by-user')
			&& !$(e.target).is('.quote-link-container')
			&& $(e.target).is('[data-quote-url]')
			&& $(e.target).closest('.queet-text').find('.quote-link-container[data-quote-url="' + $(e.target).attr('data-quote-url') + '"]').length > 0) {
				tooltip_data = $(e.target).closest('.queet-text').find('.quote-link-container[data-quote-url="' + $(e.target).attr('data-quote-url') + '"]').html();
				tooltipClass = 'quote';
				}

			var tooltipElement = $('<div class="tooltip ' + tooltipClass + '" lang="' + window.selectedLanguage + '">' + tooltip_data + '</div>');
			var tooltipCaret = $('<div class="tooltip-caret"></div>');
			$('body').prepend(tooltipElement);
			$('body').prepend(tooltipCaret);

			// align tooltip to the hovered element
			alignTooltipTohoveredElement(tooltipElement,tooltipCaret,$(e.target));

			// fade in
			tooltipElement.css('opacity','1');
			tooltipCaret.css('opacity','1');
			}
    },
    mouseleave: function (e) {
		removeAllTooltips();
    }
});

// tooltips should be removed very easily, e.g. when any of these events happen
$('body').on("touchstart scroll click dblclick mousedown mouseup submit keydown keypress keyup", function(e){
	removeAllTooltips();
});

// removes all tooltips
function removeAllTooltips() {
	$('.tooltip,.tooltip-caret').remove();
	}


/* ·
   ·
   ·   Check for profile hovercards to display
   ·
   · · · · · · · · · · · · · */

window.userArrayLastRetrieved = new Object();
$('body').on('mouseover',function (e) {

	// no hovercards on these elements
	if($(e.target).is('#user-queets') || $(e.target).closest('a').is('#user-queets')
	|| $(e.target).is('.tweet-stats') || $(e.target).closest('a').is('.tweet-stats')) {
		return true;
		}

	var timeNow = new Date().getTime();
	removeAllhoverCards(e,timeNow);
	var hoverCardData = false;
	var userArray = false;
	var hrefAttr = false;
	var possibleNickname = false;

	// closest a-element with a href
	if($(e.target).is('[href]')) {
		var targetElement = $(e.target);
		}
	else if($(e.target).closest('a').length>0) {
		if($(e.target).closest('a').is('[href]')) {
			var targetElement = $(e.target).closest('a');
			}
		else {
			var targetElement = $(e.target);
			}
		}
	else {
		var targetElement = $(e.target);
		}

	// get href-attribute
	if(targetElement.is('[href]')) {
		hrefAttr = targetElement.attr('href');
		}
	else {
		return true;
		}

	// no hover card if the element has the no-hover-card class
	if(targetElement.hasClass('no-hover-card')) {
		return true;
		}

	// no hovercard for anchor links
	if(hrefAttr.substring(0,1) == '#') {
		return true;
		}

	// guess what element close by could be a nickname
	if($(e.target).is('[href]')) {
		possibleNickname = $(e.target).text();
		}
	else if($(e.target).closest('a').length>0 && $(e.target).closest('a').is('[href]')) {
		if($(e.target).siblings('.screen-name').length>0) { // the screen name can be in a sibling if we're lucky
			possibleNickname = $(e.target).siblings('.screen-name').text();
			}
		else {
			possibleNickname = $(e.target).text();
			}
		}

	// see if we have it in cache, otherwise query server
	getUserArrayData(hrefAttr, possibleNickname, timeNow, targetElement, function(userArray, timeOut){

		// bad data
		if(typeof userArray.local == 'undefined') {
			return;
			}

		// build card from either the local or external data, depending on what we got
		if (userArray.local !== null && userArray.local.is_local == true) {
			var profileCard = buildProfileCard(userArray.local);
			}
		else if(userArray.local !== null && userArray.local.is_local == false && (typeof userArray.external == 'undefined' || userArray.external === null || userArray.external === false)) {
			var profileCard = buildProfileCard(userArray.local);
			}
		else if ((userArray.local === null || userArray.local === false || userArray.local.is_local == false) && typeof userArray.external != 'undefined' && userArray.external !== false && userArray.external !== null) {
			var profileCard = buildExternalProfileCard(userArray);
			}
		else {
			console.log('could not build profile card...');
			return;
			}

		var hoverCardElement = $('<div id="hover-card-' + timeNow + '" class="hover-card" data-card-created="' + timeNow + '">' + profileCard.profileCardHtml + '</div>');
		var hoverCardCaret = $('<div id="hover-card-caret-' + timeNow + '" class="hover-card-caret"></div>');

		targetElement.attr('data-awaiting-hover-card',timeNow);

		// let user hover for 600ms before showing the card
		setTimeout(function(){
			// make sure user is still hovering the same link and that that the link awaits the same hover card
			// (user can have flickered on and off the link triggering two or more hover cards to in setTimeout delay)
			if(targetElement.is(":hover") && parseInt(targetElement.attr('data-awaiting-hover-card'),10) == timeNow) {
				if($('.hover-card').length == 0) {	// no card if there already is one open
					$('body').prepend(hoverCardElement);
					$('body').prepend(hoverCardCaret);
					targetElement.attr('data-hover-card-active',timeNow);

					// if the user array has not been retrieved from the server for the last 60 seconds,
					// we query it for the lastest data
					if((typeof window.userArrayLastRetrieved[hrefAttr] == 'undefined') || (timeNow - window.userArrayLastRetrieved[hrefAttr]) > 60000) {
						window.userArrayLastRetrieved[hrefAttr] = timeNow;

						// local users
						if(userArray.local !== null && userArray.local.is_local === true) {
							getFromAPI('users/show.json?id=' + userArray.local.screen_name, function(data){
								if(data) {
									var newProfileCard = buildProfileCard(data);
									hoverCardElement.html(newProfileCard.profileCardHtml);
									alignTooltipTohoveredElement(hoverCardElement,hoverCardCaret,targetElement);
									}
								});
							}

						// external users
						else if(userArray.local === null || userArray.local.is_local === false) {
							getFromAPI('qvitter/external_user_show.json?profileurl=' + encodeURIComponent(hrefAttr),function(data){
								if(data && data.external !== null) {
									var newProfileCard = buildExternalProfileCard(data);
									hoverCardElement.html(newProfileCard.profileCardHtml);
									alignTooltipTohoveredElement(hoverCardElement,hoverCardCaret,targetElement);
									}
								});
							}
						}

					// hide tooltips
					$('.tooltip,.tooltip-caret').remove();

					// align hover card to the hovered element
					alignTooltipTohoveredElement(hoverCardElement,hoverCardCaret,targetElement);

					// fade in
					hoverCardElement.css('opacity','1');
					hoverCardCaret.css('opacity','1');
					}
				}
			},timeOut);
		});
	});

// get user array from cache (or from server)
function getUserArrayData(maybeProfileUrl,maybeNickname,timeNow,targetElement,callback) {
	if(maybeProfileUrl && maybeNickname) {

		userArray = userArrayCacheGetByProfileUrlAndNickname(maybeProfileUrl, maybeNickname);

		// no cached user array found, query server if this seems to be a profile url
		if(!userArray) {

			var streamObject = URLtoStreamRouter(maybeProfileUrl);

			// pathToStreamRouter failed finding a local stream for this path, maybe it's a remote profile?
			if(streamObject === false) {
				// we don't want to query the server every time we just pass an a-element with the cursor, so if the user
				// hovers the element for, say, 200ms we ask the server if the link could be a remote profile
				setTimeout(function(){
					if(targetElement.is(":hover")) {
						// don't try this if we already tried it less than a minute ago
						if((typeof window.userArrayLastRetrieved[maybeProfileUrl] == 'undefined') || (timeNow - window.userArrayLastRetrieved[maybeProfileUrl]) > 60000) {
							window.userArrayLastRetrieved[maybeProfileUrl] = timeNow;
							getFromAPI('qvitter/external_user_show.json?profileurl=' + encodeURIComponent(maybeProfileUrl),function(data){
								if(data && data.external !== null) {

									// we want hover cards to appear _at least_ 600ms after hover (see below)
									var timeAfterServerQuery = new Date().getTime();
									var queryTime = timeAfterServerQuery-timeNow;
									if(queryTime<600) {
										var timeOut = 600-queryTime;
										}
									else {
										var timeOut = 0;
										}

									callback(data,timeOut);
									}
								});
							}
						}
					},200);
				}
			// likely an uncached local profile
			else if(streamObject && (streamObject.name == 'profile' || streamObject.name == 'profile by id')) {

				var nicknameOrId = streamObject.nickname;
				if(!nicknameOrId) {
					nicknameOrId = streamObject.id;
					}
				// don't query too often for the same user
				if(typeof window.userArrayLastRetrieved[maybeProfileUrl] == 'undefined' || (timeNow - window.userArrayLastRetrieved[maybeProfileUrl]) > 60000) {
					window.userArrayLastRetrieved[maybeProfileUrl] = timeNow;
					// query server and cache user data (done automatically in getFromAPI)
					getFromAPI('users/show.json?id=' + nicknameOrId, function(data){
						if(data) {
							userArray = {local:data};

							// we want hover cards to appear _at least_ 600ms after hover
							// we could just set the timeout to 0 and let the card appear
							// whenever it's loaded, but this will not feel good if we're
							// on a crazy fast server. so we calculate the diff time and makes
							// sure the total delay is at least 600ms
							var timeAfterServerQuery = new Date().getTime();
							var queryTime = timeAfterServerQuery-timeNow;
							if(queryTime<600) {
								var timeOut = 600-queryTime;
								}
							else {
								var timeOut = 0;
								}

							// continue to display the hover card
							callback(userArray,timeOut);
							}
						});
					}
				}
			}
		// from cache
		else {
			// continue to display the hover card
			// 600ms before cards appear feels pretty good
			// but this can be tweaked if cards appear to fast/slow
			callback(userArray,600);
			}
		}
	}

// hover cards should be removed very easily, e.g. when any of these events happen
$('body').on("mouseleave touchstart scroll click dblclick mousedown mouseup submit keydown keypress keyup", function(e){
	var timeNow = new Date().getTime();
	removeAllhoverCards(e,timeNow);
});

// removes all hover cards
function removeAllhoverCards(event,priorTo) {
	// don't remove hovercards until after 100ms, so user have time to move the cursor to it (which gives it the dont-remove-card class)
	setTimeout(function(){
		$.each($('.hover-card'),function(){
			// don't remove card if it was created after removeAllhoverCards() was called
			if($(this).data('card-created') < priorTo) {
				// don't remove it if we're hovering it right now!
				if(!$(this).hasClass('dont-remove-card')) {
					$('[data-hover-card-active="' + $(this).data('card-created') + '"]').removeAttr('data-hover-card-active');
					$('#hover-card-caret-' + $(this).data('card-created')).remove();
					$(this).remove();
					}
				}
			});
		},100);
	}

// if we're hovering a hover card, give it a class, so we don't remove it
$('body').on('mouseover','.hover-card', function(e) {
	$(this).addClass('dont-remove-card');
	});
$('body').on('mouseleave','.hover-card', function(e) {
	$(this).removeClass('dont-remove-card');
	});




/* ·
   ·
   ·   fix login and register box to top when they reach top
   ·
   · · · · · · · · · · · · · */

$(window).scroll(function(e){

	if($('#page-container > .profile-card').length > 0) {
		var feedOrProfileCardOffsetTop = $('#page-container > .profile-card').offset().top;
		}
	else {
		var feedOrProfileCardOffsetTop = $('#feed').offset().top;
		}

	if ($(this).scrollTop() > (feedOrProfileCardOffsetTop-55) && $('#login-content').css('position') != 'fixed'){
		var loginAndSignUpBoxesHeight = $('#login-content').outerHeight() + $('.front-signup').not('#popup-signup').outerHeight();
		$('#login-register-container').css({'position': 'fixed', 'top': '55px'});
		}
	else if ($(this).scrollTop() < (feedOrProfileCardOffsetTop-55) && $('#login-content').css('position') != 'absolute'){
		$('#login-register-container').css({'position': 'relative', 'top': 'auto'});
		}
 	});



/* ·
   ·
   ·   Tooltip to show what federated means
   ·
   · · · · · · · · · · · · · */

$('body').on('mouseenter','#federated-tooltip',function(){
	$('#what-is-federation').fadeIn(100);
	});
$('body').on('mouseleave','#what-is-federation',function(){
	$('#what-is-federation').fadeOut(100);
	});



/* ·
   ·
   ·   Scroll to top when clicking top bar
   ·
   · · · · · · · · · · · · · */
$('body').on('click','.global-nav',function(e) {
	if($(e.target).hasClass('global-nav')) {
		$(window).scrollTop(0);
		}
	});



/* ·
   ·
   ·   Register
   ·
   · · · · · · · · · · · · · */

if(!window.registrationsClosed) {
	$('.front-signup input, .front-signup button').removeAttr('disabled'); // clear this onload
	$('#signup-btn-step1').click(function(){

		$(document).trigger('onClickStep1Register'); // hook

		display_spinner();
		$('.front-signup input, .front-signup button').addClass('disabled');
		$('.front-signup input, .front-signup button').attr('disabled','disabled');
		// 7 s timeout to annoy human spammers
		setTimeout(function(){
			remove_spinner();
			popUpAction('popup-register',window.sL.signUp,'<div id="popup-signup" class="front-signup">' +
															  '<div class="signup-input-container"><div id="atsign">@</div><input placeholder="' + window.sL.registerNickname + '" type="text" autocomplete="off" class="text-input" id="signup-user-nickname-step2"><div class="fieldhelp">a-z0-9</div></div>' +
															  '<div class="signup-input-container"><input placeholder="' + window.sL.signUpFullName + '" type="text" autocomplete="off" class="text-input" id="signup-user-name-step2" value="' + $('#signup-user-name').val() + '"></div>' +
															  '<div class="signup-input-container"><input placeholder="' + window.sL.signUpEmail + '" type="text" autocomplete="off" id="signup-user-email-step2" value="' + $('#signup-user-email').val() + '"></div>' +
															  '<div class="signup-input-container"><input placeholder="' + window.sL.registerHomepage + '" type="text" autocomplete="off" class="text-input" id="signup-user-homepage-step2"></div>' +
															  '<div class="signup-input-container"><input placeholder="' + window.sL.registerBio + '" type="text"  autocomplete="off" class="text-input" id="signup-user-bio-step2"></div>' +
															  '<div class="signup-input-container"><input placeholder="' + window.sL.registerLocation + '" type="text" autocomplete="off" class="text-input" id="signup-user-location-step2"></div>' +
															  '<div class="signup-input-container"><input placeholder="' + window.sL.loginPassword + '" type="password" class="text-input" id="signup-user-password1-step2" value="' + $('#signup-user-password').val() + '"><div class="fieldhelp">>5</div></div>' +
															  '<div class="signup-input-container"><input placeholder="' + window.sL.registerRepeatPassword + '" type="password" class="text-input" id="signup-user-password2-step2"></div>' +
															  '<div id="signup-terms-header">' + window.sL.showTerms.replace(/{site-title}/g,window.siteTitle) + '</div><div id="signup-terms-container"></div>' +
															  '<button id="signup-btn-step2" class="signup-btn disabled" type="submit">' + window.sL.signUpButtonText + '</button>' +
														   '</div>',false);

			// ask api if nickname is ok, if no typing for 1 s
			$('#signup-user-nickname-step2').on('keyup',function(){
				clearTimeout(window.checkNicknameTimeout);
				var thisInputElement = $(this);
				var thisValue = $(this).val();
				if(thisValue.length>1 && /^[a-zA-Z0-9]+$/.test(thisValue)) {
					thisInputElement.addClass('nickname-taken');
					if($('.spinner-wrap').length==0) {
						thisInputElement.after('<div class="spinner-wrap"><div class="spinner"><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i></div></div>');
						}
					window.checkNicknameTimeout = setTimeout(function(){
						$.get(window.apiRoot + 'check_nickname.json?nickname=' + encodeURIComponent(thisValue),function(data){
							$('.spinner-wrap').remove();
							if(data==0) {
								$('#signup-user-password2-step2').trigger('keyup'); // revalidates
								}
							else {
								thisInputElement.removeClass('nickname-taken');
								$('#signup-user-password2-step2').trigger('keyup');
								}
							});
						},1000);
					}
				else {
					$('.spinner-wrap').remove();
					}
				});

			// ask api if email is in use, if no typing for 1 s
			$('#signup-user-email-step2').on('keyup',function(){
				clearTimeout(window.checkEmailTimeout);
				var thisInputElement = $(this);
				var thisValue = $(this).val();
				if(thisValue.length>1 && validEmail(thisValue)) {
					thisInputElement.addClass('email-in-use');
					if($('.spinner-wrap').length==0) {
						thisInputElement.after('<div class="spinner-wrap"><div class="spinner"><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i></div></div>');
						}
					window.checkEmailTimeout = setTimeout(function(){
						$.get(window.apiRoot + 'qvitter/check_email.json?email=' + encodeURIComponent(thisValue),function(data){
							$('.spinner-wrap').remove();
							if(data==1) {
								$('#signup-user-password2-step2').trigger('keyup'); // revalidates
								thisInputElement.after('<div class="fieldhelp email-in-use">' + window.sL.emailAlreadyInUse + '</div>');
								}
							else {
								thisInputElement.removeClass('email-in-use');
								thisInputElement.siblings('.fieldhelp.email-in-use').remove();
								$('#signup-user-password2-step2').trigger('keyup');
								}
							});
						},1000);
					}
				else {
					$('.spinner-wrap').remove();
					}
				});


			// validate on keyup
			$('#popup-register input').on('keyup',function(){
				if(validateRegisterForm($('#popup-register'))
				&& !$('#signup-user-nickname-step2').hasClass('nickname-taken')
				&& !$('#signup-user-email-step2').hasClass('email-in-use')) {
					$('#signup-btn-step2').removeClass('disabled');
					}
				else {
					$('#signup-btn-step2').addClass('disabled');
					}
				});
			$('#popup-register input').trigger('keyup');

			// submit on enter
			$('input#signup-user-name-step2,input#signup-user-email-step2,input#signup-user-password1-step2, input#signup-user-password2-step2').keyup(function(e){
				if(e.keyCode==13) {
					$('#signup-btn-step2').trigger('click');
					}
				});

			$('#signup-btn-step2').click(function(){
				if(!$(this).hasClass('disabled')) {
					$('#popup-register input,#popup-register button').addClass('disabled');
					display_spinner();
					$.ajax({ url: window.apiRoot + 'account/register.json',
						type: "POST",
						data: {
							nickname: 		$('#signup-user-nickname-step2').val(),
							email: 			$('#signup-user-email-step2').val(),
							fullname: 		$('#signup-user-name-step2').val(),
							homepage: 		$('#signup-user-homepage-step2').val(),
							bio: 			$('#signup-user-bio-step2').val(),
							location: 		$('#signup-user-location-step2').val(),
							password: 		$('#signup-user-password1-step2').val(),
							confirm: 		$('#signup-user-password2-step2').val(),
							cBS: 			window.cBS,
							cBSm: 			window.cBSm,
							username: 		'none',
							},
						dataType:"json",
						error: function(data){
							if(typeof data.responseJSON != 'undefined' && typeof data.responseJSON.error != 'undefined') {
								remove_spinner();
								$('#popup-register input,#popup-register button').removeClass('disabled');
								$('#signup-user-password2-step2').trigger('keyup'); // revalidate
								showErrorMessage(data.responseJSON.error,$('#popup-register .modal-header'));
								}
							},
						success: function(data) {
							remove_spinner();
							if(typeof data.error == 'undefined') {
								 $('input#nickname').val($('#signup-user-nickname-step2').val());
								 $('input#password').val($('#signup-user-password1-step2').val());
								 $('input#rememberme').prop('checked', true);
								 $('#submit-login').trigger('click');
								 $('#popup-register').remove();
								 }
							 else {
								alert('Try again! ' + data.error);
								$('#popup-register input,#popup-register button').removeClass('disabled');
								}


							 }
						});
					}
				});

			// reactivate register form on popup close
			$('#popup-register').on('remove',function(){
				$('.front-signup input, .front-signup button').removeAttr('disabled');
				$('.front-signup input, .front-signup button').removeClass('disabled');
				});
			},7000);
		});
	// submit on enter
	$('input#signup-user-name,input#signup-user-email,input#signup-user-password').keyup(function(e){
		if(e.keyCode==13) {
			$('#signup-btn-step1').trigger('click');
			}
		});
	}


/* ·
   ·
   ·   Show/hide Terms of Use
   ·
   · · · · · · · · · · · · · */

$('body').on('click','#signup-terms-header',function(){
	if($('#signup-terms-container').text().length > 0) {
		$('#signup-terms-container').html('');
		}
	else {
		if(window.customTermsOfUse) {
			$('#signup-terms-container').html(window.customTermsOfUse);
			}
		else {
			getDoc('terms',function(termsHtml){
				$('#signup-terms-container').html(termsHtml);
				});
			}
		}
	});




/* ·
   ·
   ·   set language, autologin or show welcome screen
   ·
   · · · · · · · · · · · · · */

$('#submit-login').removeAttr('disabled'); // might be remebered by browser...
$(window).load(function() {

	// set language, from local storage, else browser language
	var browserLang = navigator.language || navigator.userLanguage;

	// browsers report e.g. sv-SE but we want it in the format "sv" or "sv_se"
	browserLang = browserLang.replace('-','_').toLowerCase();

	// if we're logged out, we see if there's a saved language in localstorage
	if(window.loggedIn === false) {
		var cacheDataLoggedOut = localStorageObjectCache_GET('selectedLanguage','logged_out');
		if(cacheDataLoggedOut) {
			window.selectedLanguage = cacheDataLoggedOut;
			}
		else {
			window.selectedLanguage = browserLang;
			}
		}
	// if we're logged in, we check
	// 1) check if the logged in user has selected a language
	// 2) check if there a selected language for logged_out users (i.e. the user selected the language before logging in)
	// 3) go with the browser language
	else {
		var cacheDataLoggedOut = localStorageObjectCache_GET('selectedLanguage','logged_out');
		var cacheDataLoggedIn = localStorageObjectCache_GET('selectedLanguage',window.loggedIn.id);
		if(cacheDataLoggedIn) {
			window.selectedLanguage = cacheDataLoggedIn;
			}
		else if(cacheDataLoggedOut) {
			window.selectedLanguage = cacheDataLoggedOut;
			}
		else {
			window.selectedLanguage = browserLang;
			}
		}

	// check that the language is available,
	if(typeof window.availableLanguages[window.selectedLanguage] == 'undefined') {
		var similarLanguageFound = false;
		// if not there might be a base language, e.g. "sv" instead of "sv_se"
		if(window.selectedLanguage.indexOf('_') > -1
		&& typeof window.availableLanguages[window.selectedLanguage.substring(0,window.selectedLanguage.indexOf('_'))] != 'undefined') {
			window.selectedLanguage = window.selectedLanguage.substring(0,window.selectedLanguage.indexOf('_'));
			similarLanguageFound = true;
			}
		else {
			// there's also a chance there no base language, but a similar country specific language that we can use (rather than english)
			if(window.selectedLanguage.indexOf('_') > -1) {
				var baseLan = window.selectedLanguage.indexOf('_');
				}
			else {
				var baseLan = window.selectedLanguage;
				}
			$.each(window.availableLanguages, function(lanCode,lanData){
				if(lanCode.substring(0,lanCode.indexOf('_')) == baseLan) {
					window.selectedLanguage = lanCode;
					similarLanguageFound = true;
					return false;
					}
				});
			}
		// if we can't find a similar language, go with english
		if(similarLanguageFound === false) {
			window.selectedLanguage = 'en';
			}
		}

	// english is always available
	if(window.selectedLanguage == 'en') {
		proceedToSetLanguageAndLogin(window.englishLanguageData);
		}
	else {
		// if we already have this version of this language in localstorage, we
		// use that cached version. we do this because $.ajax doesn't respect caching, it seems
		var cacheData = localStorageObjectCache_GET('languageData',window.availableLanguages[window.selectedLanguage]);
		if(cacheData) {
			proceedToSetLanguageAndLogin(cacheData);
			}
		else {
			$.ajax({
				dataType: "json",
				url: window.fullUrlToThisQvitterApp + 'locale/' + window.availableLanguages[window.selectedLanguage],
				error: function(data){console.log(data)},
				success: function(data) {

					// store this response in localstorage
					localStorageObjectCache_STORE('languageData',window.availableLanguages[window.selectedLanguage], data);

					proceedToSetLanguageAndLogin(data);
					}
				});
			}
		}
	});

// proceed to set language and login
function proceedToSetLanguageAndLogin(data){
	window.sL = data;

	// plugins might have added translations
	$.each(window.pluginTranslations,function(k,pluginTranslation) {
		if(typeof pluginTranslation[window.selectedLanguage] != 'undefined') {
			$.extend(window.sL,pluginTranslation[window.selectedLanguage]);
			}
		else if(typeof pluginTranslation['en'] != 'undefined') {
			$.extend(window.sL,pluginTranslation['en']);
			}
		});

	// plugins might want to wait and do stuff until after language is set
	$(document).trigger('qvitterAfterLanguageIsSet');

	// if this is a RTL-language, add rtl class to body
	if(window.sL.directionality == 'rtl') {
		$('body').addClass('rtl');
		}

	window.siteTitle = $('head title').html(); // remember this for later use


	// replace placeholders in translation
	$.each(window.sL,function(k,v){
		window.sL[k] = v.replace(/{site-title}/g,window.siteTitle);
		});

	// suggest user to help translate if their browsers language does't exist
	if(typeof window.availableLanguages[window.usersLanguageCode] == 'undefined' && !localStorageObjectCache_GET('languageErrorMessageDiscarded',window.usersLanguageNameInEnglish)) { // but don't nag
		$('#page-container').prepend('<div class="language-error-message" data-language-name="' + window.usersLanguageNameInEnglish + '">' + window.siteTitle + ' is not availible in your language (' + replaceHtmlSpecialChars(window.usersLanguageNameInEnglish) + '). Visit <a href="https://git.gnu.io/h2p/Qvitter/tree/master/locale">Qvitter\'s repository homepage</a> if you want to help us to translate the interface. <span class="discard-error-message"></span></div>');
		}

	// if selected language is too similar to english, we display a message telling people to help with the translation
	if(window.sL.languageName != 'English') {
		var numberOfStringsSameAsEnglish = 0;
		var totalStrings = 0;
		$.each(window.sL,function(k,v){
			if(v == window.englishLanguageData[k]) {
				numberOfStringsSameAsEnglish++;
				}
			totalStrings++;
			});
		numberOfStringsSameAsEnglish = Math.max(0, numberOfStringsSameAsEnglish-20); totalStrings = Math.max(0, totalStrings-20); // ~20 strings, e.g. shortened months, is often same in many languages
		var percentTranslated = parseInt((1-(numberOfStringsSameAsEnglish/totalStrings))*100,10);
		if(percentTranslated < 95) {
			if(!localStorageObjectCache_GET('languageErrorMessageDiscarded',window.sL.languageName)) { // but don't nag
				$('#page-container').prepend('<div class="language-error-message" data-language-name="' + window.sL.languageName + '">' + window.sL.onlyPartlyTranslated.replace('{percent}',percentTranslated).replace('{language-name}',window.sL.languageName) + '<span class="discard-error-message"></span></div>');
				}
			}
		}

	// set some static strings
	if(window.customWelcomeText !== false && typeof window.customWelcomeText[window.selectedLanguage] != 'undefined') {
		$('.front-welcome-text').html(window.customWelcomeText[window.selectedLanguage]);

		// collapse long welcome texts and add expand button
		if($('.front-welcome-text').outerHeight()>250) {
			$('.front-welcome-text').css('height','240px');
			$('.front-welcome-text').css('overflow', 'hidden');
			$('.front-welcome-text').append('<div class="show-full-welcome-text"></div>');
			}
		}
	else {
		$('.front-welcome-text').html('<h1>' + window.sL.welcomeHeading +  '</h1>');
		if(window.enableWelcomeText) {
			$('.front-welcome-text').append(window.sL.welcomeText);
			}
		}

	$('#nickname').attr('placeholder',window.sL.loginUsername);
	$('#password').attr('placeholder',window.sL.loginPassword);
	$('button#submit-login').html(window.sL.loginSignIn);
	$('#rememberme_label').html(window.sL.loginRememberMe);
	$('#forgot-password').html(window.sL.loginForgotPassword);
	$('.front-signup h2').html('<strong>' + window.sL.newToQuitter + '</strong> ' + window.sL.signUp);
	$('#signup-user-name').attr('placeholder',window.sL.signUpFullName);
	$('#signup-user-email').attr('placeholder',window.sL.signUpEmail);
	$('#signup-user-password').attr('placeholder',window.sL.loginPassword);
	$('.front-signup button.signup-btn').html(window.sL.signUpButtonText);
	$('#user-queets .label').html(window.sL.notices);
	$('#user-following .label').html(window.sL.following);
	$('#user-followers .label').html(window.sL.followers);
	$('#user-groups .label').html(window.sL.groups);
	$('#queet-box').html(window.sL.compose);
	$('#queet-box').attr('data-start-text',encodeURIComponent(window.sL.compose));
	$('#user-footer .queet-button button').html(window.sL.queetVerb);
	$('#stream-header').html(window.sL.queetsNounPlural);
	$('#logout').html(window.sL.logout);
	$('#settings').html(window.sL.settings);
	$('#other-servers-link').html(window.sL.otherServers);
	$('.language-dropdown .dropdown-toggle small').html(window.sL.languageSelected);
	$('.language-dropdown .current-language').html(window.sL.languageName);
	$('.stream-selection.friends-timeline').prepend(window.sL.timeline);
	$('.stream-selection.mentions').prepend(window.sL.mentions);
	$('.stream-selection.notifications').prepend(window.sL.notifications);
	$('.stream-selection.favorites').prepend(window.sL.favoritesNoun);
	$('.stream-selection.public-timeline').prepend(window.sL.publicTimeline);
	$('.stream-selection.public-and-external-timeline').prepend(window.sL.publicAndExtTimeline)
	$('#search-query').attr('placeholder',window.sL.searchVerb);
	$('#blocking-link').html(window.sL.userBlocks);
	$('#faq-link').html(window.sL.FAQ);
	$('#tou-link').html(window.sL.showTerms);
	$('#add-edit-language-link').html(window.sL.addEditLanguageLink);
	$('#shortcuts-link').html(window.sL.keyboardShortcuts);
	$('#invite-link').html(window.sL.inviteAFriend);
	$('#classic-link').html(window.sL.classicInterface);
	$('#edit-profile-header-link').html(window.sL.editMyProfile);
	$('#mini-logged-in-user-cog-wheel').attr('data-tooltip',window.sL.profileSettings);
	$('#accessibility-toggle-link').html(window.sL.accessibilityToggleLink);
	$('#settingslink .nav-session').attr('data-tooltip',window.sL.profileAndSettings);
	$('#top-compose').attr('data-tooltip',window.sL.compose);
	$('button.upload-image').attr('data-tooltip',window.sL.tooltipAttachImage);
	$('button.shorten').attr('data-tooltip',window.sL.tooltipShortenUrls);
	$('.reload-stream').attr('data-tooltip',window.sL.tooltipReloadStream);
	$('#clear-history').html(window.sL.clearHistory);
	$('#user-screen-name, #user-avatar, #user-name').attr('data-tooltip', window.sL.viewMyProfilePage);
	$('#top-menu-profile-link-view-profile').html(window.sL.viewMyProfilePage);

	// show site body now
	$('#user-container').css('display','block');
	$('#feed').css('display','block');

	// logged in or not?
	if(window.loggedIn) {
		proceedLoggedIn();
		}
	else {
		proceedLoggedOut();
		}
	}

/* ·
   ·
   ·   Stuff we do on load specifically for logged out users
   ·
   · · · · · · · · · · · · · */

function proceedLoggedOut() {
	display_spinner();
	setNewCurrentStream(getStreamFromUrl(),true,false,function(){
		$('input#nickname').focus();
		$('#page-container').css('opacity','1');
		});
	}

/* ·
   ·
   ·   Stuff we do on load specifically for logged in users
   ·
   · · · · · · · · · · · · · */

function proceedLoggedIn() {
	display_spinner();

	// get everyone we follow, block and our memberships and stor in global objects
	getAllFollowsMembershipsAndBlocks(function(){

		// do this now not to stall slow computers, also we know of group memberships to highlight now
		cacheSyntaxHighlighting();

		// we might have cached text for the queet box
		// (we need to get the mentions suggestions and cache the syntax highlighting before doing this)
		$('#queet-box').attr('data-cached-text',encodeURIComponent(localStorageObjectCache_GET('queetBoxInput','queet-box')));
		maybePrefillQueetBoxWithCachedText($('#queet-box'));
		});

	// load history
	loadHistoryFromLocalStorage();

	// show bookmarks
	appendAllBookmarks(window.qvitterProfilePrefs.bookmarks);

	// set stream
	setNewCurrentStream(getStreamFromUrl(),true,false,function(){
		$('.language-dropdown').css('display','none');
		$('#page-container').css('opacity','1');
		$('#search').fadeIn('slow');
		$('#settingslink .dropdown-toggle').fadeIn('slow');
		$('#top-compose').fadeIn('slow');
		$('input#nickname').blur();
		});

	}


/* ·
   ·
   ·   Shake the login box, i.e. when indicating an error
   ·
   · · · · · · · · · · · · · */

function shakeLoginBox() {
	$('input#nickname').css('background-color','pink');
	$('input#password').css('background-color','pink');
	$('#login-content').effect('shake',{distance:5,times:2},function(){
		$('input#nickname').animate({backgroundColor:'#fff'},1000);
		$('input#password').animate({backgroundColor:'#fff'},1000);
		});
	}



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
$('#rememberme_label').disableSelection();


/* ·
   ·
   ·   Submit login form
   ·
   · · · · · · · · · · · · · */

$('#form_login').submit(function(e) {
	if(typeof window.loginCheckSuccessful == 'undefined') {
		e.preventDefault();
		checkLogin($('input#nickname').val(),$('input#password').val(),function(data){
			window.loginCheckSuccessful = true;
			$('#form_login').submit();
			});
		}
	});


/* ·
   ·
   ·   Logout
   ·
   · · · · · · · · · · · · · */

$('#logout').click(function(){
	window.location.href =window.siteInstanceURL + 'main/logout';
	});


/* ·
   ·
   ·   FAQ
   ·
   · · · · · · · · · · · · · */

$('#faq-link').click(function(){
	popUpAction('popup-faq', window.siteTitle + ' ' + window.sL.FAQ,'<div id="faq-container"></div>',false);
	getDoc('faq',function(faqHtml){
		$('#faq-container').html(faqHtml);
		});
	});


/* ·
   ·
   ·   Terms
   ·
   · · · · · · · · · · · · · */

$('#tou-link,.tou-link').click(function(){
	popUpAction('popup-terms', window.sL.showTerms,'<div id="terms-container"></div>',false);
	if(window.customTermsOfUse) {
		$('#terms-container').html(window.customTermsOfUse);
		}
	else {
		getDoc('terms',function(termsHtml){
			$('#terms-container').html(termsHtml);
			});
		}
	});



/* ·
   ·
   ·   Classic Link, toggle setting in api and redirect to /all
   ·
   · · · · · · · · · · · · · */

$('#classic-link, #accessibility-toggle-link').click(function(){
	getFromAPI('qvitter/toggle_qvitter.json',function(data){
		if(data.success === true) {
			window.location.href = window.siteInstanceURL + window.loggedIn.screen_name + '/all';
			}
		});

	});


/* ·
   ·
   ·   Handling the language dropdown selection
   ·
   · · · · · · · · · · · · · */

$('.dropdown').click(function(){$(this).toggleClass('dropped')});
$('.dropdown').disableSelection();
$(document).bind('click', function (e) {
	if(!$(e.target).is('#logo') && !$(e.target).is('#settingslink') && !$(e.target).is('.nav-session') && !$(e.target).is('.dropdown-toggle') && !$(e.target).is('.dropdown-toggle small') && !$(e.target).is('.dropdown-toggle span') && !$(e.target).is('.dropdown-toggle b')) {
		$('.dropdown').removeClass('dropped');
		$('.quitter-settings.dropdown-menu').removeClass('dropped');
		}
	});
$('.language-link').click(function(){

	if(window.loggedIn === false) {
		var selectedForUser = 'logged_out';
		}
	else {
		var selectedForUser = window.loggedIn.id;
		}

	localStorageObjectCache_STORE('selectedLanguage',selectedForUser, $(this).attr('data-lang-code'));

	location.reload(); // reload
	});


/* ·
   ·
   ·   Show the logo menu dropdown on click
   ·
   · · · · · · · · · · · · · */

$('#settingslink').click(function(){
	removeAllTooltips();
	if(!$('.quitter-settings').hasClass('dropped')) { $('.quitter-settings').addClass('dropped'); }
	else { $('.quitter-settings').removeClass('dropped'); }
	});



/* ·
   ·
   ·   Show/hide the user menu dropdown on click
   ·
   · · · · · · · · · · · · · */

$('body').on('click','.user-menu-cog',function(e){
	if(!$(e.target).is($(this))) {
		// don't show/hide when clicking inside the menu
		}

	// hide
	else if($(this).hasClass('dropped')) {
		$(this).removeClass('dropped');
		$(this).children('.dropdown-menu').remove();
		}

	// show
	else {

		$(this).addClass('dropped');

		var userID = $(this).attr('data-user-id');
		var userScreenName = $(this).attr('data-screen-name');
		var silenced = $(this).hasClass('silenced');
		var sandboxed = $(this).hasClass('sandboxed');

		// menu
		var menuArray = [];

		// settings etc if it's me
		if(userID == window.loggedIn.id) {
			menuArray = loggedInUsersMenuArray();
			}
		// block etc if it not me
		else {
			if(userIsBlocked(userID)) {
				menuArray.push({
					type: 'function',
					functionName: 'unblockUser',
					functionArguments: {
						userId: userID
						},
					label: window.sL.unblockUser.replace('{username}','@' + userScreenName)
					});
				}
			else {
				menuArray.push({
					type: 'function',
					functionName: 'blockUser',
					functionArguments: {
						userId: userID
						},
					label: window.sL.blockUser.replace('{username}','@' + userScreenName)
					});
				}

			// mute profile pref
			menuArray.push({
				type: 'profile-prefs-toggle',
				namespace: 'qvitter',
				topic: 'mute:' + userID,
				label: window.sL.muteUser,
				enabledLabel: window.sL.unmuteUser,
				tickDisabled: true,
				callback: 'hideOrShowNoticesAfterMuteOrUnmute'
				});

			// moderator actions
			menuArray = appendModeratorUserActionsToMenuArray(menuArray,userID,userScreenName,sandboxed,silenced);
			}

		var menu = $(getMenu(menuArray)).appendTo(this);
		alignMenuToParent(menu,$(this));
		}
	});

// hide the stream menu when clicking outside it
$('body').on('click',function(e){
	if(!$(e.target).is('.user-menu-cog') && $('.user-menu-cog').hasClass('dropped') && !$(e.target).closest('.user-menu-cog').length>0) {
		$('.user-menu-cog').children('.dropdown-menu').remove();
		$('.user-menu-cog').removeClass('dropped');
		}
	});


/* ·
   ·
   ·   Show/hide the stream menu dropdown on click
   ·
   · · · · · · · · · · · · · */

$('body').on('click','#stream-menu-cog',function(e){
	if(!$(e.target).is('#stream-menu-cog') && $(e.target).closest('#stream-menu-cog').length>0) {
		// don't show/hide when clicking inside the menu
		}

	// hide
	else if($(this).hasClass('dropped')) {
		$(this).removeClass('dropped');
		$(this).children('.dropdown-menu').remove();
		}

	// show
	else {
		$(this).addClass('dropped');
		var menu = $(streamObjectGetMenu(window.currentStreamObject)).appendTo(this);
		alignMenuToParent(menu,$(this));
		}
	});

// hide the stream menu when clicking outside it
$('body').on('click',function(e){
	if(!$(e.target).is('#stream-menu-cog') && $('#stream-menu-cog').hasClass('dropped') && !$(e.target).closest('#stream-menu-cog').length>0) {
		$('#stream-menu-cog').children('.dropdown-menu').remove();
		$('#stream-menu-cog').removeClass('dropped');
		}
	});



/* ·
   ·
   ·   Open a queet menu when clicking ellipsis button
   ·
   · · · · · · · · · · · · · */

$('body').on('click','.sm-ellipsis',function(e){

	if(!$(e.target).is('.sm-ellipsis') && $(e.target).closest('.sm-ellipsis').length>0) {
		// don't show/hide when clicking inside the menu
		}

	// hide
	else if($(this).hasClass('dropped')) {
		$(this).removeClass('dropped');
		$(this).children('.dropdown-menu').remove();
		}

	// show
	else {
		$(this).addClass('dropped');

		var closestStreamItem = $(this).closest('.queet').parent('.stream-item');
		var streamItemUsername = closestStreamItem.attr('data-user-screen-name');
		var streamItemUserID = closestStreamItem.attr('data-user-id');
		var streamItemID = closestStreamItem.attr('data-quitter-id');
		var streamItemUserSandboxed = closestStreamItem.hasClass('sandboxed');
		var streamItemUserSilenced = closestStreamItem.hasClass('silenced');

		// menu
		var menuArray = [];

		// delete my notice, or others notices for mods with rights
		if(streamItemUserID == window.loggedIn.id || window.loggedIn.rights.delete_others_notice === true) {
			menuArray.push({
				type: 'function',
				functionName: 'deleteQueet',
				functionArguments: {
					streamItemID: streamItemID
					},
				label: window.sL.deleteVerb
				});
			}
		// block/unblock if it's not me
		if(streamItemUserID != window.loggedIn.id) {
			if(userIsBlocked(streamItemUserID)) {
				menuArray.push({
					type: 'function',
					functionName: 'unblockUser',
					functionArguments: {
						userId: streamItemUserID
						},
					label: window.sL.unblockUser.replace('{username}',streamItemUsername)
					});
				}
			else {
				menuArray.push({
					type: 'function',
					functionName: 'blockUser',
					functionArguments: {
						userId: streamItemUserID
						},
					label: window.sL.blockUser.replace('{username}',streamItemUsername)
					});
				}

			// mute profile pref
			menuArray.push({
				type: 'profile-prefs-toggle',
				namespace: 'qvitter',
				topic: 'mute:' + streamItemUserID,
				label: window.sL.muteUser,
				enabledLabel: window.sL.unmuteUser,
				tickDisabled: true,
				callback: 'hideOrShowNoticesAfterMuteOrUnmute'
				});
			}

		// moderator actions
		menuArray = appendModeratorUserActionsToMenuArray(menuArray,streamItemUserID,streamItemUsername,streamItemUserSandboxed,streamItemUserSilenced);

		// add menu to DOM and align it
		var menu = $(getMenu(menuArray)).appendTo(this);
		alignMenuToParent(menu,$(this));
		}
	});

// remove the ellipsis menu when clicking outside it
$('body').on('click',function(e){
	if(!$(e.target).is('.sm-ellipsis') && $('.sm-ellipsis.dropped').length>0 && !$(e.target).closest('.sm-ellipsis').length>0) {
		$('.sm-ellipsis').children('.dropdown-menu').remove();
		$('.sm-ellipsis').removeClass('dropped');
		}
	});


/* ·
   ·
   ·   When clicking a function row in a stream menu – invoke the function
   ·
   · · · · · · · · · · · · · */

$('body').on('click','.row-type-function',function(e){

	var thisFunctionRow = $(this);

	// don't invoke the function again if it's not finished last time
	if(thisFunctionRow.hasClass('clicked')) {
		return true;
		}

	thisFunctionRow.addClass('clicked');

	var functionName = $(this).attr('data-function-name');
	if(typeof $(this).attr('data-function-arguments') == 'undefined' || $(this).attr('data-function-arguments') == 'undefined') {
		var functionArguments = false;
		}
	else {
		var functionArguments = JSON.parse($(this).attr('data-function-arguments'));
		}
	window[functionName](functionArguments, function(success){
		if(success) {
			thisFunctionRow.removeClass('clicked');
			}
		});
	});


/* ·
   ·
   ·   When toggeling a a profile pref in a dropdown menu
   ·
   · · · · · · · · · · · · · */

$('body').on('click','.row-type-profile-prefs-toggle',function(e){

	var thisToggle = $(this);

	// wait for last toggle to finish before toggeling again
	if(thisToggle.hasClass('clicked')) {
		return true;
		}

	if(thisToggle.attr('data-profile-pref-state') == 'disabled') {
		var prefDataToSet = '1';
		}
	else if(thisToggle.attr('data-profile-pref-state') == 'enabled') {
		var prefDataToSet = '0';
		}
	else { // invalid
		return true;
		}

	thisToggle.addClass('clicked');

	var prefNamespace = thisToggle.attr('data-profile-prefs-namespace');
	var prefTopic = thisToggle.attr('data-profile-prefs-topic');
	var prefLabel = thisToggle.attr('data-profile-prefs-label');
	var prefEnabledLabel = thisToggle.attr('data-profile-prefs-enabled-label');

	// only prefs in the 'qvitter' namespace allowed
	if(prefNamespace != 'qvitter') {
		return true;
		}

	// save pref to server
	postSetProfilePref(prefNamespace,prefTopic,prefDataToSet,function(data){
		if(data === false) { // error
			showErrorMessage(window.sL.ERRORfailedSavingYourSetting + ' (' + prefTopic + ')');
			}
		else { // success
			thisToggle.removeClass('clicked');
			if(thisToggle.attr('data-profile-pref-state') == 'disabled') {
				thisToggle.removeClass('disabled');
				thisToggle.addClass('enabled');
				thisToggle.attr('data-profile-pref-state','enabled');
				if(prefEnabledLabel != 'undefined') {
					thisToggle.html(prefEnabledLabel);
					}
				window.qvitterProfilePrefs[prefTopic] = '1';
				}
			else if(thisToggle.attr('data-profile-pref-state') == 'enabled') {
				thisToggle.removeClass('enabled');
				thisToggle.addClass('disabled');
				thisToggle.attr('data-profile-pref-state','disabled');
				if(prefEnabledLabel != 'undefined') {
					thisToggle.html(prefLabel);
					}
				window.qvitterProfilePrefs[prefTopic] = '0';
				}

			// run callback
			if(typeof thisToggle.attr('data-profile-pref-callback') != 'undefined'
			&& thisToggle.attr('data-profile-pref-state') != 'undefined'
			&& typeof window[thisToggle.attr('data-profile-pref-callback')] == 'function') {
				window[thisToggle.attr('data-profile-pref-callback')]();
				}
			}
		});

	});


/* ·
   ·
   ·   Mark all notifications as seen
   ·
   · · · · · · · · · · · · · */

function markAllNotificationsAsSeen(arg,callback) {
	display_spinner();
	getFromAPI('qvitter/mark_all_notifications_as_seen.json',function(data){
		if(data === false) {
			showErrorMessage(window.sL.ERRORfailedMarkingAllNotificationsAsRead);
			callback(true);
			}
		else {
			helloAPI(function(){
				$('.stream-item').removeClass('not-seen');
				$('#new-queets-bar').trigger('click'); // show any hidden notifications (this will also remove the dropdown menu)
				remove_spinner();
				callback(true);
				});
			}
		});

	}

/* ·
   ·
   ·   Show or hide embedded content in timeline?
   ·
   · · · · · · · · · · · · · */

function showOrHideEmbeddedContentInTimelineFromProfilePref() {
	if(typeof window.qvitterProfilePrefs['hide_embedded_in_timeline:' + window.currentStreamObject.path] != 'undefined') {
		var showHide = window.qvitterProfilePrefs['hide_embedded_in_timeline:' + window.currentStreamObject.path];
		if(parseInt(showHide,10) == 1) {
			$('#feed-body').addClass('embedded-content-hidden-by-user');
			return;
			}
		}
	$('#feed-body').removeClass('embedded-content-hidden-by-user');
	}

/* ·
   ·
   ·   Show or hide quotes in timeline?
   ·
   · · · · · · · · · · · · · */

function showOrHideQuotesInTimelineFromProfilePref() {
	if(typeof window.qvitterProfilePrefs['hide_quotes_in_timeline:' + window.currentStreamObject.path] != 'undefined') {
		var showHide = window.qvitterProfilePrefs['hide_quotes_in_timeline:' + window.currentStreamObject.path];
		if(parseInt(showHide,10) == 1) {
			$('#feed-body').addClass('quotes-hidden-by-user');
			return;
			}
		}
	$('#feed-body').removeClass('quotes-hidden-by-user');
	}


/* ·
   ·
   ·   Show or hide notices from muted users in notifications?
   ·
   · · · · · · · · · · · · · */

function showOrHideNoticesFromMutedUsersInNotifications() {
	if(typeof window.qvitterProfilePrefs['hide_notifications_from_muted_users'] != 'undefined') {
		var showHide = window.qvitterProfilePrefs['hide_notifications_from_muted_users'];
		if(parseInt(showHide,10) == 1) {
			$('#feed-body').addClass('hide-notifications-from-muted-users');
			return;
			}
		}
	$('#feed-body').removeClass('hide-notifications-from-muted-users')
	}



/* ·
   ·
   ·   When clicking an external follow button
   ·
   · · · · · · · · · · · · · */


$('body').on('click','.external-follow-button',function(event){
	popUpAction('popup-external-follow', window.sL.userExternalFollow + ' ' + $('.profile-card-inner .screen-name').html(),'<form method="post" action="' + window.siteInstanceURL + 'main/ostatus"><input type="hidden" id="nickname" name="nickname" value="' + $('.profile-card-inner .screen-name').html().substring(1) + '"><input type="text" id="profile" name="profile" placeholder="' + window.sL.userExternalFollowHelp + '" /></form>','<div class="right"><button class="close">' + window.sL.cancelVerb + '</button><button class="primary">' + window.sL.userExternalFollow + '</button></div>');
	$('#popup-external-follow form input#profile').focus();
	$('#popup-external-follow button.primary').click(function(){
		$('#popup-external-follow form').submit();
		});
	});

/* ·
   ·
   ·   When clicking an external join button
   ·
   · · · · · · · · · · · · · */


$('body').on('click','.external-member-button',function(event){
	popUpAction('popup-external-join', window.sL.joinExternalGroup + ' ' + $('.profile-card-inner .screen-name').html(),'<form method="post" action="' + window.siteInstanceURL + 'main/ostatus"><input type="hidden" id="group" name="group" value="' + $('.profile-card-inner .screen-name').html().substring(1) + '"><input type="text" id="profile" name="profile" placeholder="' + window.sL.userExternalFollowHelp + '" /></form>','<div class="right"><button class="close">' + window.sL.cancelVerb + '</button><button class="primary">' + window.sL.userExternalFollow + '</button></div>');
	$('#popup-external-join form input#profile').focus();
	$('#popup-external-join button.primary').click(function(){
		$('#popup-external-join form').submit();
		});
	});

/* ·
   ·
   ·   When clicking a follow/block button
   ·
   · · · · · · · · · · · · · */

$('body').on('click','.qvitter-follow-button',function(event){

	if($(this).hasClass('disabled')) {
		return true;
		}

	$(this).addClass('disabled');
	var user_id = $(this).attr('data-follow-user-id');

	// if we have a local id, it's straightforward, but we could be handling an unfollow
	if(typeof user_id != 'undefined') {

		// unblock?
		if($(this).hasClass('blocking')) {
			unblockUser({userId: user_id, blockButton_jQueryElement: $(this)});
			return true;
			}

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
					appendUserToMentionsSuggestionsArray(data);
					}
				else {
					$(this_element).removeClass('following');
					$('#user-following strong').html(parseInt($('#user-following strong').html(),10)-1);
					}
				}
			});

		return true;
		}

	// if there's no local user id, we have to take a detour
	$.ajax({ url: window.siteInstanceURL + 'main/ostatussub',
		type: "POST",
		data: {
			token: 	window.commonSessionToken,
			profile: $(this).attr('data-follow-user'),
			submit: 'Confirm'
			},
		error: function(data){ console.log('error'); console.log(data); },
		success: function(data) {
			// reload page on success
			// since ostatussub doesn't have an api, there's no good way to get the local user id here,
			// and change the button to an unsubscribe button.
			window.location.replace(window.siteInstanceURL + window.loggedIn.screen_name + '/subscriptions');
			}
		});
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
					// add group to mention suggestion array
					if(data.homepage_logo === null) {
						data.homepage_logo = window.defaultAvatarStreamSize;
						}
					var groupmembershipObject = { avatar:data.homepage_logo, id:data.id, name:data.fullname, url:data.url, username:data.nickname };
					window.groupMemberships.push(groupmembershipObject);
					}
				else if(data.member === false) {
					$(this_element).removeClass('member');
					$('.profile-card .member-stats strong').html(parseInt($('.profile-card .member-stats strong').html(),10)-1);
					$('#user-groups strong').html(parseInt($('#user-groups strong').html(),10)-1);

					// remove group from mention suggestion array, if it's there
					var groupToRemove = false;
					$.each(window.groupMemberships,function(k,v) {
						if(v.id == data.id) {
							groupToRemove = k;
							}
						});
					if(groupToRemove) {
						console.log('remove at' + groupToRemove);
						window.groupMemberships.splice(groupToRemove,1);
						}
					}
				}
			});
		}
	});


/* ·
   ·
   ·   Go to profile page when clicking the small user header in left column
   ·
   · · · · · · · · · · · · · */

$('#user-header').on('click',function(e){
	// not if we're clicking the mini-logged-in-user-cog-wheel
	if($(e.target).is('#mini-logged-in-user-cog-wheel')) {
		return;
		}
	setNewCurrentStream(pathToStreamRouter(window.loggedIn.screen_name),true,false);
	});



/* ·
   ·
   ·   Searching
   ·
   · · · · · · · · · · · · · */

$('#search-query').on('keyup',function(e) { if(e.keyCode==13) { showSearchStream(); }}); // on enter in input field
$('button.icon.nav-search').on('click',function(e) { showSearchStream();});	// on click on magnifying glass
function showSearchStream() {
	var path = 'search/notice?q=' + encodeURIComponent(replaceHtmlSpecialChars($('#search-query').val()));
	setNewCurrentStream(pathToStreamRouter(path),true,false);
	}



/* ·
   ·                                                                              <o
   ·   Hijack all links and look for local users, tags, searches and groups.       (//
   ·
   ·   If found, select that stream and prevent links default behaviour
   ·
   · · · · · · · · · · · · · */

$('body').on('click','a', function(e) {

	// don't hijack if metakeys are pressed!
	if(e.ctrlKey || e.altKey || e.shiftKey || e.metaKey) {
		return;
		}

	// don't hijack if this is an anchor link in the faq
	if($(this).closest('.modal-container').attr('id') == 'popup-faq' && $(this).attr('href').indexOf('#') > -1) {
		return;
		}

	// don't hijack and don't follow link if this is the bookmark stream icon, prevent link but don't set a new currentstream
	if($(e.target).is('i.chev-right')) {
		e.preventDefault();
		return;
		}

	// don't hijack links with donthijack attribute
	if(!!$(this).attr('donthijack') || $(this).attr('donthijack') == '') {
		return;
		}

	// all links opens in new tab
	$(this).attr('target','_blank');

	// only proceed if we really have a href attribute
	if(typeof $(this).attr('href') == 'undefined') {
		return;
		}

	// profile picture
	if ($(this).hasClass('profile-picture')) {
		e.preventDefault();
			if($(this).closest('.modal-container').attr('id') != 'edit-profile-popup') { // no popup if we're editing our profile
				popUpAction('popup-profile-picture', $('.profile-card-inner .screen-name').html(),'<img style="width:100%;display:block;" src="' + $(this).attr('href') + '" />',false);
				$('.hover-card,.hover-card-caret').remove();
				}
		}
	// hijack link if we find a matching link that qvitter can handle
	else {
		var streamObject = URLtoStreamRouter($(this).attr('href'));
		if(streamObject && streamObject.stream) {
			e.preventDefault();

			// if this is a user/{id} type link we want to find the nickname before setting a new stream
			// the main reason is that we want to update the browsers location bar and the .stream-selecton
			// links as fast as we can. we rather not wait for the server response
			if(streamObject.name == 'profile by id') {

				// pathToStreamRouter() might have found a cached nickname
				if(streamObject.nickname) {
					setNewCurrentStream(pathToStreamRouter(streamObject.nickname),true,streamObject.id);
					}
				// otherwise we might follow the user and thereby already know its nickname
				else if (typeof window.following != 'undefined' && typeof window.following[streamObject.id] != 'undefined') {
					setNewCurrentStream(pathToStreamRouter(window.following[streamObject.id].username),true,streamObject.id);
					}
				// if the text() of the clicked element looks like a user nickname, use that (but send id to setNewCurrentStream() in case this is bad data)
				else if(/^@[a-zA-Z0-9]+$/.test($(e.target).text()) || /^[a-zA-Z0-9]+$/.test($(e.target).text())) {
					var nickname = $(e.target).text();
					if(nickname.indexOf('@') == 0) {
						nickname = nickname.substring(1); // remove any starting @
						}
					setNewCurrentStream(pathToStreamRouter(nickname),true,streamObject.id);
					}
				// if we can't figure out or guess a nickname, query the server for it
				else {
					getNicknameByUserIdFromAPI(streamObject.id,function(nickname) {
						if(nickname) {
							setNewCurrentStream(pathToStreamRouter(nickname),true,false);
							}
						else {
							alert('user not found');
							}
						});
					}
				}
			// same with group/{id}/id links
			else if(streamObject.name == 'group notice stream by id') {
				// we might be member of the group and thereby already know its nickname
				if (typeof window.groupMemberships != 'undefined' && typeof window.groupMemberships[streamObject.id] != 'undefined') {
					setNewCurrentStream(pathToStreamRouter('group/' + window.groupMemberships[streamObject.id].username),true,streamObject.id);
					}
				// if the text() of the clicked element looks like a group nickname, use that (but send id to setNewCurrentStream() in case this is bad data)
				else if(/^![a-zA-Z0-9]+$/.test($(e.target).text()) || /^[a-zA-Z0-9]+$/.test($(e.target).text())) {
					var nickname = $(e.target).text();
					if(nickname.indexOf('!') == 0) {
						nickname = nickname.substring(1); // remove any starting !
						}
					setNewCurrentStream(pathToStreamRouter('group/' + nickname),true,streamObject.id);
					}
				// if we can't figure out or guess a nickname, query the server for it
				else {
					getNicknameByGroupIdFromAPI(streamObject.id,function(nickname) {
						if(nickname) {
							setNewCurrentStream(pathToStreamRouter('group/' + nickname),true,false);
							}
						else {
							alert('group not found');
							}
						});
					}
				}
			// all other links that qvitter can handle
			else {
				setNewCurrentStream(streamObject,true,false);
				}
			}
		}
	});



/* ·
   ·
   ·   When user clicks the bookmark icon to bookmark
   ·
   · · · · · · · · · · · · · */

$('body').on('click','#history-container .chev-right',function(event){
	var thisStreamLink = $(this).parent('.stream-selection');
	thisStreamLink.slideUp(300,function(){
		$('#bookmark-container').append(thisStreamLink.outerHTML());
		$('#bookmark-container').children().last().children('.chev-right').attr('data-tooltip',window.sL.tooltipRemoveBookmark);
		$('#bookmark-container').children().last().fadeIn(300,function(){
			thisStreamLink.remove();
			updateHistoryLocalStorage();
			saveAllBookmarks();
			});
		});
	});


/* ·
   ·
   ·   When user clicks the x to remove a bookmark
   ·
   · · · · · · · · · · · · · */

$('body').on('click','#bookmark-container .chev-right',function(event){
	$(this).parent('.stream-selection').remove();
	saveAllBookmarks();
	});


/* ·
   ·
   ·   When sorting the bookmark menu
   ·
   · · · · · · · · · · · · · */

$('#bookmark-container').on("sortupdate", function() {
	saveAllBookmarks();
	});


/* ·
   ·
   ·   When clearing the browsing history
   ·
   · · · · · · · · · · · · · */

$('#clear-history').on('click', function() {
	$('#history-container').empty();
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

		// not if we're already loading or if no stream is set yet
		if(!$('body').hasClass('loading-older') && typeof window.currentStreamObject != "undefined" && $('#feed-body').attr('data-end-reached') != 'true') {
			$('body').addClass('loading-older');

			// remove loading class in 10 seconds, i.e. try again if failed to load within 10 s
			if(window.currentStreamObject.name != 'search') {
				setTimeout(function(){$('body').removeClass('loading-older');},10000);
				}

			var lastStreamItemId = $('#feed-body').children('.stream-item').last().attr('id');

			// if this is a stream that uses 'page' for paging, i.e. search or users lists,
			// we need page and rpp vars (page number is stored in an attribute in feed-body)
			if(window.currentStreamObject.maxIdOrPage == 'page') {
				if(typeof $('#feed-body').attr('data-search-page-number') != 'undefined') {
					var searchPage = parseInt($('#feed-body').attr('data-search-page-number'),10);
					}
				else {
					var searchPage=2;
					}
				var nextPage = searchPage+1;
				var getVars = qOrAmp(window.currentStreamObject.stream) + 'rpp=20&page=' + searchPage; // search uses 'rpp' var and others 'count' for paging, though we can add rrp to others aswell without any problem
				}
			// normal streams
			else {
				var getVars = qOrAmp(window.currentStreamObject.stream) + 'max_id=' + ($('#feed-body').children('.stream-item').last().attr('data-quitter-id-in-stream'));
				}

			display_spinner('#footer-spinner-container');
			getFromAPI(window.currentStreamObject.stream + getVars,function(data){

				// if data returned an empty array, we have probably reached the bottom
				if(data.length == 0) {
					$('#feed-body').attr('data-end-reached',true);
					}

				else if(data) {
					addToFeed(data, lastStreamItemId,'visible');
					$('body').removeClass('loading-older');

					// if this is search our group users lists, we remember page number (if we got any users)
					if(window.currentStreamObject.maxIdOrPage == 'page') {
						$('#feed-body').attr('data-search-page-number',nextPage);
						}
					}

				remove_spinner();
				});
			}
   	   	}
	});



/* ·
   ·
   ·   Updates all queets' times/dates
   ·
   · · · · · · · · · · · · · */

var updateTimesInterval=self.setInterval(function(){
	updateAllQueetsTimes();
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

		// only if logged in and only for notice or notification streams
		if(window.loggedIn && (window.currentStreamObject.type == 'notices' || window.currentStreamObject.type == 'notifications')) {
			var lastId = $('#feed-body').children('.stream-item').not('.temp-post').not('.posted-from-form').attr('data-quitter-id-in-stream');
			var addThisStream = window.currentStreamObject.stream;
			var timeNow = new Date().getTime();
			getFromAPI(addThisStream + qOrAmp(window.currentStreamObject.stream) + 'since_id=' + lastId,function(data){
				if(data) {
					$('body').removeClass('loading-newer');
					if(addThisStream == window.currentStreamObject.stream) {
						addToFeed(data, false, 'hidden');

						// say hello to the api if this is notifications stream, to
						// get correct unread notifcation count
						if(window.currentStreamObject.name == 'notifications') {
							helloAPI();
							}

						// if we have hidden items, show new-queets-bar
						maybeShowTheNewQueetsBar()

						}
					}
				});
			}
		}
	}


/* ·
   ·
   ·   Show hidden queets when user clicks on new-queets-bar
   ·
   · · · · · · · · · · · · · */

$('body').on('click','#new-queets-bar',function(){
	if(window.currentStreamObject.name == 'notifications') {
		document.title = window.siteTitle;
		}
	var hiddenStreamItems = $('.stream-item.hidden');
	hiddenStreamItems.css('opacity','0')
	hiddenStreamItems.animate({opacity:'1'}, 200);
	hiddenStreamItems.addClass('visible');
	hiddenStreamItems.removeClass('hidden');
	$('#new-queets-bar').parent().addClass('hidden');

	// say hello to the api if this is notifications stream, to
	// get correct unread notifcation count
	if(window.currentStreamObject.name == 'notifications') {
		helloAPI();
		}
	});




/* ·
   ·
   ·   Expand and de-expand queets when clicking anywhere but on a few element types
   ·
   · · · · · · · · · · · · · */

$('body').on('click','.queet',function (event) {
	if(typeof $(this).attr('href') == 'undefined'
	&& $(event.target).closest('a').length == 0
	&& !$(event.target).is('\
			a,\
			video,\
			.cm-mention,\
			.cm-tag,\
			.cm-group,\
			.cm-url,\
			pre,\
			img,\
			.name,\
			.queet-box,\
			.syntax-two,\
			button,\
			.show-full-conversation,\
			span.mention,\
			.action-reply-container a span,\
			.action-reply-container a b,\
			.action-rt-container a span,\
			.action-rt-container a b,\
			.action-del-container a span,\
			.action-del-container a b,\
			.action-fav-container a span,\
			.action-fav-container a b,\
			.action-ellipsis-container a span,\
			.action-ellipsis-container a b,\
			span.group,\
			.longdate,\
			.screen-name,\
			.discard-error-message')
		&& !$(this).parent('.stream-item').hasClass('user')) { // not if user stream
		expand_queet($(this).parent());
		}
	});


/* ·
   ·
   ·   Image popups
   ·
   · · · · · · · · · · · · · */

$('body').on('click','.stream-item .queet img.attachment-thumb',function (event) {
	event.preventDefault();

	// don't do anything if we are in the middle of collapsing
	if($(this).closest('.stream-item').hasClass('collapsing')) {
		// no action
		}
	// if the stream item isn't expanded, expand that
	else if(!$(this).closest('.stream-item').hasClass('expanded')) {
		expand_queet($(this).closest('.stream-item'));
		}
	// otherwise we open the popup
	else {
		var thisAttachmentThumbSrc = $(this).attr('src');
		var parentStreamItem = $(this).closest('.stream-item');
		var $parentStreamItemClone = $('<div/>').append(parentStreamItem.outerHTML());
		var $queetThumbsClone = $('<div/>').append($parentStreamItemClone.children('.stream-item').children('.queet').find('.queet-thumbs').outerHTML());

		// cleaned version of the stream item to show in the footer
		cleanStreamItemsFromClassesAndConversationElements($parentStreamItemClone);
		$parentStreamItemClone.find('.context,.stream-item-footer').remove();
		var parentStreamItemHTMLWithoutFooter = $parentStreamItemClone.outerHTML();

		$thumbToDisplay = $queetThumbsClone.find('img.attachment-thumb[src="' + thisAttachmentThumbSrc + '"]');
		$thumbToDisplay.parent().addClass('display-this-thumb');

		// "play" all animated gifs and add youtube iframes to all youtube videos
		$.each($queetThumbsClone.find('img.attachment-thumb'),function(){
			if($(this).attr('data-mime-type') == 'image/gif'
			&& $(this).parent().hasClass('play-button')) {
				$(this).attr('src',$(this).attr('data-full-image-url'));
				$(this).parent('.thumb-container').css('background-image','url(\'' + $(this).attr('data-full-image-url') + '\')');
				}
			else if($(this).parent().hasClass('youtube')){

				// autoplay a clicked video
				var autoplayFlag = '';
				if($(this).parent().hasClass('display-this-thumb')) {
					autoplayFlag = '&autoplay=1';
					}

				var youtubeId = $(this).attr('data-full-image-url').replace('http://www.youtube.com/watch?v=','').replace('https://www.youtube.com/watch?v=','').replace('http://youtu.be/','').replace('https://youtu.be/','').substr(0,11);
				$(this).parent().prepend('<iframe width="510" height="315" src="//www.youtube.com/embed/' + youtubeId + '?enablejsapi=1&version=3&playerapiid=ytplayer' + autoplayFlag + '" frameborder="0" allowscriptaccess="always" allowfullscreen></iframe>');
				}
			});

		// navigation buttons
		var imgNum = parentStreamItem.children('.queet').find('.attachment-thumb').length;
		if(imgNum > 1) {
			$queetThumbsClone.find('.queet-thumbs').before('<div class="prev-thumb"></div>');
			$queetThumbsClone.find('.queet-thumbs').after('<div class="next-thumb"></div>');
			}

		if(parentStreamItem.hasClass('expanded')) {

			var calculatedDimensions = calculatePopUpAndImageDimensions($thumbToDisplay.attr('src'));
			var $thisImgInQueetThumbsClone = $queetThumbsClone.find('img[src="' + $thumbToDisplay.attr('src') + '"]');

			// set dimensions
			$thisImgInQueetThumbsClone.width(calculatedDimensions.displayImgWidth);
			$thisImgInQueetThumbsClone.parent('.thumb-container').width(calculatedDimensions.displayImgWidth);
			$thisImgInQueetThumbsClone.parent('.thumb-container').children('iframe').attr('width',calculatedDimensions.displayImgWidth);
			$thisImgInQueetThumbsClone.parent('.thumb-container').children('iframe').attr('height',calculatedDimensions.displayImgHeight);

			// open popup
			popUpAction('queet-thumb-popup', '', '' + $queetThumbsClone.outerHTML() + '', parentStreamItemHTMLWithoutFooter, calculatedDimensions.popUpWidth);
			disableOrEnableNavigationButtonsInImagePopup($('#queet-thumb-popup'));
			}
		}
	});

// popups can be max 900px wide, and should not be higher than the window, so we need to do some calculating
function calculatePopUpAndImageDimensions(img_src) {

		// trick to get width and height, we can't go with what gnusocial tells us, because
		// gnusocial doesn't (always?) report width and height after proper orientation
		$('body').prepend('<div id="img-dimension-check" style="opacity:0;"><img src="' + img_src + '" /></div>');
		var imgWidth = $('#img-dimension-check img').width();
		var imgHeight = $('#img-dimension-check img').height();
		$('#img-dimension-check').remove();


		// e.g. svg's may not have dimensions set, in that case we just make them small
		if(typeof imgWidth == 'undefined' && typeof imgHeight == 'undefined')  {
			return {popUpWidth: 540, displayImgWidth: 540};
			}

		var thisImgWidth = parseInt(imgWidth,10);
		var thisImgHeight = parseInt(imgHeight,10);
		var maxImageHeight = $(window).height() - 120; // 120 being a little more than a short queet in the footer

		if(thisImgWidth < 540) {
			var displayImgWidth = thisImgWidth;
			var popUpWidth = 540;
			if(thisImgHeight > maxImageHeight) {
				displayImgWidth = Math.round(maxImageHeight/thisImgHeight*displayImgWidth);
				}
			}
		else if(thisImgWidth < 900) {
			var displayImgWidth = thisImgWidth;
			if(thisImgHeight > maxImageHeight) {
				displayImgWidth = Math.round(maxImageHeight/thisImgHeight*displayImgWidth);
				if(displayImgWidth < 540) {
					var popUpWidth = 540;
					}
				else {
					var popUpWidth = displayImgWidth;
					}
				}
			else {
				var popUpWidth = displayImgWidth;
				}
			}
		else {
			var displayImgWidth = 900;
			var displayImgHeight = 900/thisImgWidth*thisImgHeight;
			if(displayImgHeight > maxImageHeight) {
				displayImgWidth = Math.round(maxImageHeight*displayImgWidth/displayImgHeight);
				if(displayImgWidth < 540) {
					var popUpWidth = 540;
					}
				else if(displayImgWidth < 900) {
					var popUpWidth = displayImgWidth;
					}
				else {
					var popUpWidth = 900;
					}
				}
			else {
				var popUpWidth = 900;
				}
			}
	return {popUpWidth: popUpWidth, displayImgWidth: displayImgWidth};
	}

// switch to next image when clicking the image in the popup
$('body').on('click','#queet-thumb-popup .attachment-thumb',function (event) {
	event.preventDefault();

	var nextImage = $(this).parent().next().children('.attachment-thumb');
	if(nextImage.length>0) {

		// start and stop youtube videos, if any
		$.each($(this).parent('.youtube').children('iframe'),function(){
			this.contentWindow.postMessage('{"event":"command","func":"' + 'stopVideo' + '","args":""}', '*');
			});
		$.each(nextImage.parent('.youtube').children('iframe'),function(){
			this.contentWindow.postMessage('{"event":"command","func":"' + 'playVideo' + '","args":""}', '*');
			});

		// set dimensions of next image and the popup
		var calculatedDimensions = calculatePopUpAndImageDimensions(nextImage.attr('src'));
		nextImage.width(calculatedDimensions.displayImgWidth);
		nextImage.parent('.thumb-container').width(calculatedDimensions.displayImgWidth);
		nextImage.parent('.thumb-container').children('iframe').attr('width',calculatedDimensions.displayImgWidth);
		nextImage.parent('.thumb-container').children('iframe').attr('height',calculatedDimensions.displayImgHeight);
		$('#queet-thumb-popup .modal-draggable').width(calculatedDimensions.popUpWidth);

		// switch image
		$(this).parent().removeClass('display-this-thumb');
		$(this).parent().next().addClass('display-this-thumb');
		disableOrEnableNavigationButtonsInImagePopup($('#queet-thumb-popup'));
		centerPopUp($('#queet-thumb-popup .modal-draggable'));
		}

	});

// navigation buttons in image popup
$('body').on('click','#queet-thumb-popup .next-thumb',function (event) {
	$(this).parent().find('.display-this-thumb').children('img').trigger('click');
	});
$('body').on('click','#queet-thumb-popup .prev-thumb',function (event) {
	var prevImage = $(this).parent().find('.display-this-thumb').prev().children('img');
	if(prevImage.length>0) {

		// start and stop youtube videos, if any
		$.each($(this).parent().find('.display-this-thumb.youtube').children('iframe'),function(){
			this.contentWindow.postMessage('{"event":"command","func":"' + 'stopVideo' + '","args":""}', '*');
			});
		$.each(prevImage.parent('.youtube').children('iframe'),function(){
			this.contentWindow.postMessage('{"event":"command","func":"' + 'playVideo' + '","args":""}', '*');
			});

		// set dimensions of next image and the popup
		var calculatedDimensions = calculatePopUpAndImageDimensions(prevImage.attr('src'));
		prevImage.width(calculatedDimensions.displayImgWidth);
		prevImage.parent('.thumb-container').width(calculatedDimensions.displayImgWidth);
		prevImage.parent('.thumb-container').children('iframe').attr('width',calculatedDimensions.displayImgWidth);
		prevImage.parent('.thumb-container').children('iframe').attr('height',calculatedDimensions.displayImgHeight);
		$('#queet-thumb-popup .modal-draggable').width(calculatedDimensions.popUpWidth);

		// switch image
		$(this).parent().find('.display-this-thumb').removeClass('display-this-thumb');
		prevImage.parent().addClass('display-this-thumb');
		disableOrEnableNavigationButtonsInImagePopup($('#queet-thumb-popup'));
		centerPopUp($('#queet-thumb-popup .modal-draggable'));
		}
	});

function disableOrEnableNavigationButtonsInImagePopup(popUp) {
	if(popUp.find('.display-this-thumb').prev().length < 1) {
		popUp.find('.prev-thumb').addClass('disabled');
		}
	else {
		popUp.find('.prev-thumb').removeClass('disabled');
		}
	if(popUp.find('.display-this-thumb').next().length < 1) {
		popUp.find('.next-thumb').addClass('disabled');
		}
	else {
		popUp.find('.next-thumb').removeClass('disabled');
		}
	}

/* ·
   ·
   ·   Collapse all open conversations and the welcome text on esc or when clicking the margin
   ·
   · · · · · · · · · · · · · */

$('body').click(function(event){
	if($(event.target).is('body') || $(event.target).is('#page-container')) {
		$('.front-welcome-text.expanded > .show-full-welcome-text').trigger('click');
		$.each($('.stream-item.expanded'),function(){
			expand_queet($(this), false);
			});
		}
	});

$(document).keyup(function(e){
	if(e.keyCode==27) { // esc
		$('.front-welcome-text.expanded > .show-full-welcome-text').trigger('click');
		$.each($('.stream-item.expanded'),function(){
			expand_queet($(this), false);
			});
		}
	});


/* ·
   ·
   ·   When clicking the delete-button
   ·
   · · · · · · · · · · · · · */

function deleteQueet(arg) {

	var this_stream_item = $('.stream-item[data-quitter-id="' + arg.streamItemID + '"]');

	// don't do anything if this is a queet being posted
	if(this_stream_item.hasClass('temp-post')) {
		return;
		}

	var this_qid = this_stream_item.attr('data-quitter-id');

	var $queetHtml = $(this_stream_item.outerHTML());
	$queetHtml.children('.stream-item.conversation').remove();
	$queetHtml.find('.context,.stream-item-footer,.inline-reply-queetbox,.expanded-content').remove();
	var queetHtmlWithoutFooterAndConversation = $queetHtml.outerHTML();

	popUpAction('popup-delete-' + this_qid, window.sL.deleteConfirmation,queetHtmlWithoutFooterAndConversation,'<div class="right"><button class="close">' + window.sL.cancelVerb + '</button><button class="primary">' + window.sL.deleteVerb + '</button></div>');

	$('#popup-delete-' + this_qid + ' button.primary').on('click',function(){
		display_spinner();
		$('.modal-container').remove();
		// delete
		postActionToAPI('statuses/destroy/' + this_qid + '.json', function(data) {
			if(data) {
				remove_spinner();
				window.knownDeletedNotices[$('.stream-item[data-quitter-id="' + this_qid + '"]').attr('data-uri')] = true;
				slideUpAndRemoveStreamItem($('.stream-item[data-quitter-id="' + this_qid + '"]'));
				}
			else {
				remove_spinner();
				}
			});
		});

	}


/* ·
   ·
   ·   When clicking the requeet-button
   ·
   · · · · · · · · · · · · · */

$('body').on('click','.action-rt-container .icon:not(.is-mine)',function(){
	var this_stream_item = $(this).closest('.stream-item');
	var this_queet = this_stream_item.children('.queet');
	var this_action = $(this).closest('li');

	// requeet
	if(!this_action.children('.with-icn').hasClass('done')) {

		// update the repeat count immediately
		var newRqNum = parseInt(this_queet.find('.action-rq-num').html(),10)+1;
		this_queet.find('.action-rq-num').html(newRqNum);
		this_queet.find('.action-rq-num').attr('data-rq-num',newRqNum);

		this_action.children('.with-icn').addClass('done');
		this_stream_item.addClass('requeeted');

		// requeet animation
		this_action.children('.with-icn').children('.sm-rt').addClass('rotate');

		// remove the fav and rq cache for this queet, to avoid number flickering
		localStorageObjectCache_STORE('favsAndRequeets',this_stream_item.attr('data-quitter-id'), false);

		// post requeet
		postActionToAPI('statuses/retweet/' + this_stream_item.attr('data-quitter-id') + '.json', function(data) {
			if(data) {
				// success
				this_stream_item.attr('data-requeeted-by-me-id',data.id);
				getFavsAndRequeetsForQueet(this_stream_item, this_stream_item.attr('data-quitter-id'));

				// mark all instances of this notice as repeated
				$('.stream-item[data-quitter-id="' + data.retweeted_status.id + '"]').addClass('requeeted');
				$('.stream-item[data-quitter-id="' + data.retweeted_status.id + '"]').attr('data-requeeted-by-me-id',data.id);
				$('.stream-item[data-quitter-id="' + data.retweeted_status.id + '"]').children('.queet').find('.action-rt-container').children('.with-icn').addClass('done');
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

		var myRequeetID = this_stream_item.attr('data-requeeted-by-me-id');

		// display button as unrepeated
		this_action.children('.with-icn').removeClass('done');
		this_action.find('.with-icn b').html(window.sL.requeetVerb);
		this_stream_item.removeClass('requeeted');

		// post unrequeet
		postActionToAPI('statuses/destroy/' + myRequeetID + '.json', function(data) {
			if(data) {
				// remove my repeat-notice from the feed, if it's there
				slideUpAndRemoveStreamItem($('.stream-item[data-quitter-id-in-stream="' + myRequeetID + '"]'));

				// mark all instances of this notice as non-repeated
				$('.stream-item[data-quitter-id="' + this_stream_item.attr('data-quitter-id') + '"]').removeClass('requeeted');
				$('.stream-item[data-quitter-id="' + this_stream_item.attr('data-quitter-id') + '"]').removeAttr('data-requeeted-by-me-id');
				$('.stream-item[data-quitter-id="' + this_stream_item.attr('data-quitter-id') + '"]').children('.queet').find('.action-rt-container').children('.with-icn').removeClass('done');

				getFavsAndRequeetsForQueet(this_stream_item, this_stream_item.attr('data-quitter-id'));
				remove_spinner();
				}
			else {
				remove_spinner();
				this_action.children('.with-icn').addClass('done');
				this_action.find('.with-icn b').html(window.sL.requeetedVerb);
				this_stream_item.addClass('requeeted');
				}
			});
		}
	});



/* ·
   ·
   ·   When clicking the fav-button
   ·
   · · · · · · · · · · · · · */

$('body').on('click','.action-fav-container',function(){
	var this_stream_item = $(this).closest('.stream-item');
	var this_queet = this_stream_item.children('.queet');

	// don't do anything if this is a queet being posted
	if(this_stream_item.hasClass('temp-post')) {
		return;
		}

	var this_action = $(this);

	// fav
	if(!this_action.children('.with-icn').hasClass('done')) {

		// update the fav count immediately
		var newFavNum = parseInt(this_queet.find('.action-fav-num').html(),10)+1;
		this_queet.find('.action-fav-num').html(newFavNum);
		this_queet.find('.action-fav-num').attr('data-fav-num',newFavNum);

		this_action.children('.with-icn').addClass('done');
		this_stream_item.addClass('favorited');

		// fav animation
		this_action.children('.with-icn').children('.sm-fav').addClass('pulse');

		// remove the fav and rq cache for this queet, to avoid number flickering
		localStorageObjectCache_STORE('favsAndRequeets',this_stream_item.attr('data-quitter-id'), false);

		// post fav
		postActionToAPI('favorites/create/' + this_stream_item.attr('data-quitter-id') + '.json', function(data) {
			if(data) {
				// success
				getFavsAndRequeetsForQueet(this_stream_item, this_stream_item.attr('data-quitter-id'));

				// mark all instances of this notice as favorited
				$('.stream-item[data-quitter-id="' + this_stream_item.attr('data-quitter-id') + '"]').addClass('favorited');
				$('.stream-item[data-quitter-id="' + this_stream_item.attr('data-quitter-id') + '"]').children('.queet').find('.action-fav-container').children('.with-icn').addClass('done');
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

		// update the fav count immediately
		var newFavNum = Math.max(0, parseInt(this_queet.find('.action-fav-num').html(),10)-1);
		this_queet.find('.action-fav-num').html(newFavNum);
		this_queet.find('.action-fav-num').attr('data-fav-num',newFavNum);

		this_action.children('.with-icn').removeClass('done');
		this_action.find('.with-icn b').html(window.sL.favoriteVerb);
		this_stream_item.removeClass('favorited');

		// remove the fav and rq cache for this queet, to avoid number flickering
		localStorageObjectCache_STORE('favsAndRequeets',this_stream_item.attr('data-quitter-id'), false);

		// post unfav
		postActionToAPI('favorites/destroy/' + this_stream_item.attr('data-quitter-id') + '.json', function(data) {
			if(data) {
				// success
				getFavsAndRequeetsForQueet(this_stream_item, this_stream_item.attr('data-quitter-id'));

				// mark all instances of this notice as non-favorited
				$('.stream-item[data-quitter-id="' + this_stream_item.attr('data-quitter-id') + '"]').removeClass('favorited');
				$('.stream-item[data-quitter-id="' + this_stream_item.attr('data-quitter-id') + '"]').children('.queet').find('.action-fav-container').children('.with-icn').removeClass('done');
				}
			else {
				// error
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

$('body').on('click','.action-reply-container',function(){

	var this_stream_item = $(this).closest('.stream-item');

	// don't do anything if this is a queet being posted
	if(this_stream_item.hasClass('temp-post')) {
		return;
		}

	var this_stream_item_id = this_stream_item.attr('data-quitter-id');
	this_stream_item.addClass('replying-to');

	// grabbing the stream-item and view it in the popup, stripped of conversation footer, reply box and other sruff
	var streamItemHTML = $('<div/>').html(this_stream_item.outerHTML());
	cleanStreamItemsFromClassesAndConversationElements(streamItemHTML);
	streamItemHTML.find('.context,.stream-item-footer').remove();
	var streamItemHTMLWithoutFooter = streamItemHTML.outerHTML();

	popUpAction('popup-reply-' + this_stream_item_id, window.sL.replyTo + ' ' + this_stream_item.children('.queet').find('.screen-name').html(),replyFormHtml(this_stream_item,this_stream_item_id),streamItemHTMLWithoutFooter);

	$('#popup-reply-' + this_stream_item_id).find('.modal-body').find('.queet-box').trigger('click'); // expand

	// fix the width of the queet box, otherwise the syntax highlighting break
	var queetBox = $('#popup-reply-' + this_stream_item_id).find('.modal-body').find('.inline-reply-queetbox');
	var queetBoxWidth = queetBox.width()-20;
	queetBox.children('.queet-box-syntax, .syntax-middle, .syntax-two').width(queetBoxWidth);

	maybePrefillQueetBoxWithCachedText(queetBox.children('.queet-box'));
	});


/* ·
   ·
   ·   When clicking the compose button
   ·
   · · · · · · · · · · · · · */

$('body').on('click','#top-compose',function(){
	popUpAction('popup-compose', window.sL.compose,queetBoxPopUpHtml(),false);
	var queetBoxWidth = $('#popup-compose').find('.inline-reply-queetbox').width()-20;
	$('#popup-compose').find('.queet-box-syntax').width(queetBoxWidth);
	$('#popup-compose').find('.syntax-middle').width(queetBoxWidth);
	$('#popup-compose').find('.syntax-two').width(queetBoxWidth);
	$('#popup-compose').find('.queet-box').trigger('click');
	maybePrefillQueetBoxWithCachedText($('#popup-compose').find('.queet-box'));
	});



/* ·
   ·
   ·   Close popups
   ·
   · · · · · · · · · · · · · */

$('body').on('click','.modal-container button.close',function(){
	$('.stream-item').removeClass('replying-to');
	$('.modal-container').remove();
	});
$('body').on('click','.modal-close',function(){
	$('.stream-item').removeClass('replying-to');
	$('.modal-container').remove();
	});
$('body').on('click','.modal-container',function(e){
	if($(e.target).is('.modal-container')) {
		$('.stream-item').removeClass('replying-to');
		$('.modal-container').remove();
		abortEditProfile();
		}
	});
$(document).keyup(function(e){
	if(e.keyCode==27) {
		$('.stream-item').removeClass('replying-to');
		$('.modal-container').remove();
		$('*').blur();
		abortEditProfile();
		}
	});



/* ·
   ·
   ·   Post queets, inline and popup replies
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

		var queetBox = $(this).parent().parent().siblings('.queet-box');
		var queetBoxID = queetBox.attr('id');

		// jquery's .text() function is not consistent in converting <br>:s to \n:s,
		// so we do this detour to make sure line breaks are preserved
		queetBox.html(queetBox.html().replace(/<br>/g, '{{{lb}}}'));
		var queetText =  $.trim(queetBox.text().replace(/^\s+|\s+$/g, '').replace(/\n/g, ''));
		queetText = queetText.replace(/{{{lb}}}/g, "\n");

		var queetTempText = replaceHtmlSpecialChars(queetText.replace(/\n/g,'<br>')); // no xss
		queetTempText = queetTempText.replace(/&lt;br&gt;/g,'<br>'); // but preserve line breaks
		var queetHtml = '<div id="' + tempPostId + '" class="stream-item conversation temp-post" style="opacity:1"><div class="queet"><span class="dogear"></span><div class="queet-content"><div class="stream-item-header"><a class="account-group"><img class="avatar" src="' + $('#user-avatar').attr('src') + '" /><strong class="name">' + $('#user-name').html() + '</strong> <span class="screen-name">@' + $('#user-screen-name').html() + '</span></a><small class="created-at"> ' + window.sL.posting + '</small></div><div class="queet-text">' + queetTempText + '</div><div class="stream-item-footer"><ul class="queet-actions"><li class="action-reply-container"><a class="with-icn"><span class="icon sm-reply" title="' + window.sL.replyVerb + '"></span></a></li><li class="action-del-container"><a class="with-icn"><span class="icon sm-trash" title="' + window.sL.deleteVerb + '"></span></a></li></i></li><li class="action-fav-container"><a class="with-icn"><span class="icon sm-fav" title="' + window.sL.favoriteVerb + '"></span></a></li></ul></div></div></div></div>';
		queetHtml = detectRTL(queetHtml);

		// popup reply
		if($('.modal-container').find('.toolbar-reply button').length>0){
			var in_reply_to_status_id = $('.modal-container').attr('id').substring(12);
			}
		// if this is a inline reply
		else if(queetBox.parent().hasClass('inline-reply-queetbox')) {
			var in_reply_to_status_id = queetBox.closest('.stream-item').attr('data-quitter-id');
			}
		// not a reply
		else {
			var in_reply_to_status_id = false;
			}

		// remove any popups
		$('.modal-container').remove();

		// try to find a queet to add the temp queet to:
		var tempQueetInsertedInConversation = false;

		// if the queet is in conversation, add it to parent's conversation
		if($('.stream-item.replying-to').length > 0 && $('.stream-item.replying-to').hasClass('conversation')) {
			var insertedTempQueet = $(queetHtml).appendTo($('.stream-item.replying-to').parent());
			findAndMarkLastVisibleInConversation($('.stream-item.replying-to').parent());
			insertedTempQueet.parent().children('.view-more-container-bottom').remove(); // remove any view-more-container-bottom:s, they only cause trouble at this point
			tempQueetInsertedInConversation = true;
			}
		// if the queet is expanded, add it to its conversation
		else if($('.stream-item.replying-to').length > 0 && $('.stream-item.replying-to').hasClass('expanded')) {
			var insertedTempQueet = $(queetHtml).appendTo($('.stream-item.replying-to'));
			findAndMarkLastVisibleInConversation($('.stream-item.replying-to'));
			insertedTempQueet.parent().children('.view-more-container-bottom').remove(); // remove any view-more-container-bottom:s, they only cause trouble at this point
			tempQueetInsertedInConversation = true;
			}
		// maybe the replying-to class is missing but we still have a suiting place to add it
		else if($('.stream-item.expanded[data-quitter-id="' + in_reply_to_status_id + '"]').length > 0) {
			var insertedTempQueet = $(queetHtml).appendTo($('.stream-item.expanded[data-quitter-id="' + in_reply_to_status_id + '"]'));
			findAndMarkLastVisibleInConversation($('.stream-item.expanded[data-quitter-id="' + in_reply_to_status_id + '"]'));
			insertedTempQueet.parent().children('.view-more-container-bottom').remove(); // remove any view-more-container-bottom:s, they only cause trouble at this point
			tempQueetInsertedInConversation = true;
			}
		// if we can't find a proper place, add it to top and remove conversation class
		// if this is either 1) our home/all feed, 2) our user timeline or 3) whole site or 4) whole network
		else if(window.currentStreamObject.name == 'friends timeline'
			 || window.currentStreamObject.name == 'my profile'
			 || window.currentStreamObject.name == 'public timeline'
			 || window.currentStreamObject.name == 'public and external timeline') {
			var insertedTempQueet = $(queetHtml).prependTo('#feed-body');
			insertedTempQueet.removeClass('conversation');
			}
		// don't add it to the current stream, open a popup instead, without conversation class
		else {
			popUpAction('popup-sending','','',false);
			var insertedTempQueet = $(queetHtml).prependTo($('#popup-sending').find('.modal-body'));
			insertedTempQueet.removeClass('conversation');
			}

		// maybe post queet in groups
		var postToGroups = '';
		var postToGropsArray = new Array();
		$.each(queetBox.siblings('.post-to-group'),function(){
			postToGropsArray.push($(this).data('group-id'));
			});
		if(postToGropsArray.length > 0) {
			postToGroups = postToGropsArray.join(':');
			}

		// remove any post-to-group-divs
		queetBox.siblings('.post-to-group').remove();

		// remove any replying-to classes
		$('.stream-item').removeClass('replying-to');

		// null reply box
		collapseQueetBox(queetBox);

		// check for new queets (one second from) NOW
		setTimeout('checkForNewQueets()', 1000);

		// post queet
		postQueetToAPI(queetText, in_reply_to_status_id, postToGroups, function(data){ if(data) {

			var queetHtml = buildQueetHtml(data, data.id, 'visible posted-from-form', false, tempQueetInsertedInConversation);

			// while we were waiting for our posted queet to arrive here, it may have already
			// arrived in the automatic update of the feed, so if it's already there, we
			// replace it (but not if the temp queet is inserted in a conversation of course, or if
			// the user has had time to expand it)
			var alredyArrived = $('#feed-body > .stream-item[data-quitter-id-in-stream=' + data.id + ']');
			if(alredyArrived.length > 0 && tempQueetInsertedInConversation === false) {
				if(!alredyArrived.hasClass('expanded')) {
					alredyArrived.replaceWith(queetHtml);
					}
				}
			else {
				var newInsertedQueet = $(queetHtml).insertBefore(insertedTempQueet);
				findAndMarkLastVisibleInConversation(insertedTempQueet.parent());

				// make ranting easier, move the reply-form to this newly created notice
				// if we have not started writing in it, or if it's missing
				// only if this is an expanded conversation
				// and only if we're ranting, i.e. no replies the queetbox
				var parentQueetBox = insertedTempQueet.parent().find('.inline-reply-queetbox');
				if(parentQueetBox.length == 0
				|| parentQueetBox.children('.syntax-middle').css('display') == 'none') {
					if(insertedTempQueet.parent().hasClass('expanded') || insertedTempQueet.parent().hasClass('conversation')) {
						if(parentQueetBox.children('.queet-box').attr('data-replies-text') == '') {
							insertedTempQueet.parent().find('.inline-reply-queetbox').remove();
							newInsertedQueet.children('.queet').append(replyFormHtml(newInsertedQueet,newInsertedQueet.attr('data-quitter-id')));
							}
						}
					}
				}

			// remove temp queet
			insertedTempQueet.remove();

			// clear queetbox input cache
			localStorageObjectCache_STORE('queetBoxInput',queetBox.attr('id'),false);

			// queet count
			$('#user-queets strong').html(parseInt($('#user-queets strong').html(),10)+1);

			// fadeout any posting-popups
			setTimeout(function(){
				$('#popup-sending').fadeOut(1000, function(){
					$('#popup-sending').remove();
					});
				},100);

			}});
		}
	});




/* ·
   ·
   ·   Count chars in queet box on keyup, also check for any attachments to show/hide
   ·
   · · · · · · · · · · · · · */
$('body').on('keyup input paste','.queet-box-syntax',function () {

	countCharsInQueetBox($(this),$(this).siblings('.queet-toolbar').find('.queet-counter'),$(this).siblings('.queet-toolbar').find('.queet-button button'));

	var attachments = $(this).siblings('.upload-image-container');
	$.each(attachments,function(k,attachment){
		var attachmentShorturl = $(attachment).children('img').attr('data-shorturl');
		if($(attachment).siblings('.queet-box-syntax').text().indexOf(attachmentShorturl) > -1) {
			$(attachment).show();
			}
		else {
			$(attachment).hide();
			}
		});
	});


/* ·
   ·
   ·   Middle button expands queet box
   ·
   · · · · · · · · · · · · · */
$('body').on('mousedown','.queet-box-syntax',function (e) {
	if( e.which == 2 ) {
		e.preventDefault();
		$(this).trigger('click');
		}
	});

/* ·
   ·
   ·   Shorten URL's
   ·
   · · · · · · · · · · · · · */
$('body').on('click','button.shorten',function () {
	shortenUrlsInBox($(this));
	});


/* ·
   ·
   ·   Reload current stream
   ·
   · · · · · · · · · · · · · */
$('body').on('click','.reload-stream',function () {
	reloadCurrentStream();
	});
// can be used a callback too, e.g. from profile pref toggles
function reloadCurrentStream() {
	setNewCurrentStream(URLtoStreamRouter(window.location.href),false,false,false);
	}


/* ·
   ·
   ·   Reload current stream and clear cache
   ·
   · · · · · · · · · · · · · */

function reloadCurrentStreamAndClearCache() {

	$('#feed-body').empty();
	rememberStreamStateInLocalStorage();

	// reload
	reloadCurrentStream();
	}

/* ·
   ·
   ·   Expand/collapse queet box on click and blur
   ·
   · · · · · · · · · · · · · */

$('body').on('click contextmenu','.queet-box-syntax',function () {
	if($(this).html() == decodeURIComponent($(this).attr('data-start-text'))) {
		$(this).attr('contenteditable','true');
		$(this).focus();
		$(this).siblings('.syntax-middle').html('&nbsp;');
		$(this).siblings('.syntax-two').html('&nbsp;');
		$(this).siblings('.queet-toolbar').css('display','block');
		$(this).siblings('.syntax-middle').css('display','block');
		$(this).siblings('.mentions-suggestions').css('display','block');
		$(this).siblings('.syntax-two').css('display','block');
		$(this).siblings('.queet-toolbar').find('.queet-button button').addClass('disabled');
		countCharsInQueetBox($(this),$(this).siblings('.queet-toolbar .queet-counter'),$(this).siblings('.queet-toolbar button'));
		$(this)[0].addEventListener("paste", stripHtmlFromPaste);
		if(typeof $(this).attr('data-replies-text') != 'undefined') {
			$(this).html(decodeURIComponent($(this).attr('data-replies-text')));
			var repliesLen = decodeURIComponent($(this).attr('data-replies-text')).replace('&nbsp;',' ').length;
			setSelectionRange($(this)[0], repliesLen, repliesLen);
			}
		else {
			$(this).html('');
			}
		$(this).trigger('input');
		$(this).closest('.stream-item').addClass('replying-to');
		}
	});
$('body').on('mousedown','.syntax-two',function () {
	$(this).addClass('clicked');
	});
$('body').on('blur','.queet-box-syntax',function (e) {

	// empty the mention suggestions on blur, timeout because we want to capture clicks in .mentions-suggestions
	setTimeout(function(){
		$(this).siblings('.mentions-suggestions').empty();
		},10);

	// don't collapse if a toolbar button has been clicked
	var clickedToolbarButtons = $(this).siblings('.queet-toolbar').find('button.clicked');
	if(clickedToolbarButtons.length>0) {
		clickedToolbarButtons.removeClass('clicked');
		return true;
		}

	// don't collapse if an error message discard button has been clicked
	if($(this).siblings('.error-message').children('.discard-error-message').length>0) {
		return true;
		}

	// don't collapse if we're clicking around inside queet-box
	var syntaxTwoBox = $(this).siblings('.syntax-two');
	if(syntaxTwoBox.hasClass('clicked')) {
		syntaxTwoBox.removeClass('clicked');
		return true;
		}

	// don't collapse if we're in a modal
	if($(this).parent().parent().hasClass('modal-body')) {
		return true;
		}

	// collapse if nothing is change
	if($(this).attr('data-replies-text') != 'undefined') {
		var $startText = $('<div/>').append(decodeURIComponent($(this).attr('data-replies-text')));
		if($.trim($startText.text()) == $.trim($(this).text()) || $(this).html().length == 0 || $(this).html() == '<br>'  || $(this).html() == '<br />' || $(this).html() == '&nbsp;' || $(this).html() == '&nbsp;<br>') {
			collapseQueetBox($(this));
			}
		}

	// collapse if empty
	else if($(this).html().length == 0 || $(this).html() == '<br>'  || $(this).html() == '<br />' || $(this).html() == '&nbsp;' || $(this).html() == '&nbsp;<br>') {
		collapseQueetBox($(this));
		}
	});

function collapseQueetBox(qB) {
	qB.closest('.stream-item').removeClass('replying-to');
	qB.siblings('.upload-image-container').remove();
	qB.siblings('.syntax-middle').css('display','none');
	qB.siblings('.syntax-two').css('display','none');
	qB.siblings('.mentions-suggestions').css('display','none');
	qB.attr('contenteditable','false');
	qB.html(decodeURIComponent(qB.attr('data-start-text')));
	qB.siblings('.queet-toolbar').find('button').removeClass('enabled');
	qB.siblings('.queet-toolbar').css('display','none');
	qB.removeAttr('style');
	qB[0].removeEventListener("paste", stripHtmlFromPaste);
	}





/* ·
   ·
   ·   Syntax highlighting in queetbox
   ·
   · · · · · · · · · · · · · */

// transfer focus and position/selection to background div
$('body').on('mouseup', 'div.syntax-two', function(e){

		// don't transfer rightclicks, instead wait for oninput and transfer after
		// this makes spell checker work
		if( e.which == 3 ) {
			$(this)[0].oninput = function() {
				$(this).siblings('div.queet-box-syntax').html($(this).html());
				$(this).trigger('mouseup'); // transfer focus
				}
			}

		else {
			$(this).removeClass('clicked');
			var caretPos = getSelectionInElement($(this)[0]);
			var thisQueetBox = $(this).siblings('div.queet-box-syntax');
			thisQueetBox.focus();
			setSelectionRange(thisQueetBox[0], caretPos[0], caretPos[1]);
			// fixes problem with caret not showing after delete, unfocus and refocus
			if(thisQueetBox.html() == '<br>') {
				thisQueetBox.html(' ');
				}
			}
	});

// strip html from paste
function stripHtmlFromPaste(e) {
	e.preventDefault();
	var text = replaceHtmlSpecialChars(e.clipboardData.getData("text/plain"));
	text = text.replace(/\n/g,'<br>').replace(/\t/g, '&nbsp;&nbsp;&nbsp;&nbsp;'); // keep line-breaks and tabs
	document.execCommand("insertHTML", false, text);
	}

// sync divs
$('body').on('keyup paste input', 'div.queet-box-syntax', function() {

	var currentVal = $(this).html();
	currentVal = currentVal.replace(/<br>$/, '').replace(/&nbsp;$/, '').replace(/ $/, ''); // fix
	$(this).siblings('.syntax-two').html(currentVal);


	// loop through the regexps and highlight
	$.each(window.syntaxHighlightingRegexps,function(k,v){
		var i = 0;
		while(currentVal.match(v) && i < 100) { // 100 matches is enough, we don't want to get caught in an infinite loop here
			var currentMatch = currentVal.match(v);

			// too small match, probably a single ! or something, just replace that with its html code
			if($.trim(currentMatch[0]).length < 2) {
				currentVal = currentVal.replace(currentMatch[0],currentMatch[0].replace('#','&#35;').replace('@','&#64;').replace('.','&#046;').replace('!','&#33;'));
				}
			// long enough match, create a mention span
			else {
				// don't include ending char, if any of these (but tags can contain and end with . and -)
				if(currentMatch[0].slice(-1) == '<'
				|| currentMatch[0].slice(-1) == '&'
				|| currentMatch[0].slice(-1) == '?'
				|| currentMatch[0].slice(-1) == '!'
				|| currentMatch[0].slice(-1) == ' '
				|| (currentMatch[0].slice(-1) == '-' && k != 'tag')
				|| currentMatch[0].slice(-1) == ':'
				|| (currentMatch[0].slice(-1) == '.' && k != 'tag')
				|| currentMatch[0].slice(-1) == ','
				|| currentMatch[0].slice(-1) == ')'
				|| currentMatch[0].slice(-1) == '\'') {
					currentMatch[0] = currentMatch[0].slice(0,-1);
					}

				// don't include these start strings
				if(currentMatch[0].substring(0,1) == ' '
				|| currentMatch[0].substring(0,1) == '(') {
					currentMatch[0] = currentMatch[0].substring(1);
					}
				else if(currentMatch[0].substring(0,6) == '&nbsp;') {
					currentMatch[0] = currentMatch[0].substring(6);
					}

				currentVal = currentVal.replace(currentMatch[0],'<span class="' + k + '">' + currentMatch[0].replace('#','&#35;').replace('@','&#64;').replace('.','&#046;').replace('!','&#33;') + '</span>')
				}
			i++;
			}
		});

	// safari fix
	if(typeof bowser.safari != 'undefined') {
		currentVal = currentVal.replace(/&nbsp;<span/g,' <span');
		}

	$(this).siblings('.syntax-middle').html(currentVal);
	});


/* ·
   ·
   ·   Auto suggest mentions in queet-box
   ·
   · · · · · · · · · · · · · */

// navigate in mentions with mouse
$('body').on('mouseenter', '.mentions-suggestions > div', function(){
	$('.mentions-suggestions > div').removeClass('selected');
	$(this).addClass('selected');
	}).on('mouseleave', '.mentions-suggestions > div', function(){
		$(this).removeClass('selected');
		});
$('body').on('click', '.mentions-suggestions > div', function(){
	$(this).parent().siblings('.queet-box-syntax').focus();
	$(this).siblings().removeClass('selected');
	$(this).addClass('selected');
	useSelectedMention($(this).parent().siblings('.queet-box-syntax'));
	});

// navigate in mentions with keyboard
$('body').on('keydown', '.queet-box-syntax', function(e) {
	if($(this).siblings('.mentions-suggestions').children('div').length > 0) {

		// enter or tab
		if (!e.ctrlKey && (e.keyCode == '13' || e.keyCode == '9')) {
			e.preventDefault();
			useSelectedMention($(this));
			}

		// downkey
		else if (e.keyCode == '40') {
			e.preventDefault();
			if($(this).siblings('.mentions-suggestions').children('div.selected').length > 0) {
				var selected = $(this).siblings('.mentions-suggestions').children('div.selected');
				selected.removeClass('selected');
				selected.next().addClass('selected');
				}
			else {
				$(this).siblings('.mentions-suggestions').children('div').first().addClass('selected');
				}
			}

		// upkey
		else if (e.keyCode == '38') {
			e.preventDefault();
			if($(this).siblings('.mentions-suggestions').children('div.selected').length > 0) {
				var selected = $(this).siblings('.mentions-suggestions').children('div.selected');
				selected.removeClass('selected');
				selected.prev().addClass('selected');
				}
			else {
				$(this).siblings('.mentions-suggestions').children('div').last().addClass('selected');
				}
			}
		}
	});

function useSelectedMention(queetBox){

	// use selected
	if(queetBox.siblings('.mentions-suggestions').children('div.selected').length > 0) {
		var selectedSuggestion = queetBox.siblings('.mentions-suggestions').children('div.selected');
		}
	// if none selected, take top suggestion
	else {
		var selectedSuggestion = queetBox.siblings('.mentions-suggestions').children('div').first();
		}

	var username = selectedSuggestion.children('span').html();
	var name = selectedSuggestion.children('strong').html();

	// if this is a group, we remember its id, the user might be member of multiple groups with the same username
	if(selectedSuggestion.hasClass('group-suggestion')) {
		var groupId = selectedSuggestion.data('group-id');
		if(queetBox.siblings('.post-to-group[data-group-id="' + groupId + '"]').length < 1) {
			if(queetBox.siblings('.post-to-group').length>0) {
				var addAfter = queetBox.siblings('.post-to-group').last();
				}
			else {
				var addAfter = queetBox;
				}
			addAfter.after('<div class="post-to-group" data-group-username="' + username + '" data-group-id="' + groupId + '">' + name + '</div>');
			}
		}

	// replace the halfwritten username with the one we want
	deleteBetweenCharacterIndices(queetBox[0], window.lastMention.mentionPos+1, window.lastMention.cursorPos);
	var range = createRangeFromCharacterIndices(queetBox[0], window.lastMention.mentionPos+1, window.lastMention.mentionPos+1);
	range.insertNode(document.createTextNode(username + '\u00a0')); // non-breaking-space, to prevent collapse

	// put caret after
	setSelectionRange(queetBox[0], window.lastMention.mentionPos+username.length+2, window.lastMention.mentionPos+username.length+2);
	queetBox.siblings('.mentions-suggestions').empty();
	queetBox.trigger('input'); // avoid some flickering
	}

// check for removed group mentions
$('body').on('keyup', 'div.queet-box-syntax', function(e) {
	var groupMentions = $(this).siblings('.post-to-group');
	var queetBoxGroups = $(this).siblings('.syntax-middle').find('.group');
	var queetBoxGroupsString = '';
	$.each(queetBoxGroups,function(){
		queetBoxGroupsString = queetBoxGroupsString + $(this).html() + ':';
		});
	$.each(groupMentions,function(){
		if(queetBoxGroupsString.indexOf('!' + $(this).data('group-username') + ':') == -1) {
			$(this).remove();
			}
		});
	});

// check for user mentions
window.lastMention = new Object();
$('body').on('keyup', 'div.queet-box-syntax', function(e) {

	var queetBox = $(this);
	var cursorPosArray = getSelectionInElement(queetBox[0]);
	var cursorPos = cursorPosArray[0];

	// add space before linebreaks (to separate mentions in beginning of new lines when .text():ing later)
	if(e.keyCode == '13') {
		e.preventDefault();
		var range = createRangeFromCharacterIndices(queetBox[0], cursorPos, cursorPos);
		range.insertNode(document.createTextNode(" \n"));
		}
	else if(e.keyCode != '40' && e.keyCode != '38' && e.keyCode != '13' && e.keyCode != '9') {
		var contents = queetBox.text().substring(0,cursorPos);
		var mentionPos = contents.lastIndexOf('@');
		var check_contents = contents.substring(mentionPos - 1, cursorPos);
		var regex = /(^|\s|\.|\n)(@)[a-zA-Z0-9]+/;
		var match = check_contents.match(regex);
		if (contents.indexOf('@') >= 0 && match) {

			if(contents.lastIndexOf('@') > 1) {
				match[0] = match[0].substring(1,match[0].length);
				}
			if((contents.lastIndexOf('@')+match[0].length) == cursorPos) {

				queetBox.siblings('.mentions-suggestions').children('.user-suggestion').remove();
				queetBox.siblings('.mentions-suggestions').css('top',(queetBox.height()+20) + 'px');
				var term = match[0].substring(match[0].lastIndexOf('@')+1, match[0].length).toLowerCase();
				window.lastMention.mentionPos = mentionPos;
				window.lastMention.cursorPos = cursorPos;


				// see if anyone we're following matches
				var suggestionsToShow = [];
				var suggestionsUsernameCount = {};
				suggestionsUsernameCount[window.loggedIn.screen_name] = 1; // any suggestions with the same screen name as mine will get their server url added
				$.each(window.following,function(){
					var userregex = new RegExp(term);
					if(this.username.toLowerCase().match(userregex) || this.name.toLowerCase().match(userregex)) {
						suggestionsToShow.push({avatar:this.avatar, name:this.name, username:this.username,url:this.url});

						// count the usernames to see if we need to show the server for any of them
						if(typeof suggestionsUsernameCount[this.username] != 'undefined') {
							suggestionsUsernameCount[this.username] = suggestionsUsernameCount[this.username] + 1;
							}
						else {
							suggestionsUsernameCount[this.username] = 1;
							}
						}
					});

				// show matches
				$.each(suggestionsToShow,function(){
					var serverHtml = '';
					if(suggestionsUsernameCount[this.username]>1 && this.url !== false) {
						serverHtml = '@' + this.url;
						}
					queetBox.siblings('.mentions-suggestions').append('<div class="user-suggestion" title="@' + this.username + serverHtml + '"><img height="24" width="24" src="' + this.avatar + '" /><strong>' + this.name + '</strong> @<span>' + this.username + serverHtml + '</span></div>')
					});

				}
			else {
				queetBox.siblings('.mentions-suggestions').children('.user-suggestion').remove();
				}

			}
		else {
			queetBox.siblings('.mentions-suggestions').children('.user-suggestion').remove();
			}
		}
	});


// check for group mentions
$('body').on('keyup', 'div.queet-box-syntax', function(e) {

	var queetBox = $(this);
	var cursorPosArray = getSelectionInElement(queetBox[0]);
	var cursorPos = cursorPosArray[0];

	// add space before linebreaks (to separate mentions in beginning of new lines when .text():ing later)
	if(e.keyCode == '13') {
		e.preventDefault();
		var range = createRangeFromCharacterIndices(queetBox[0], cursorPos, cursorPos);
		range.insertNode(document.createTextNode(" \n"));
		}
	else if(e.keyCode != '40' && e.keyCode != '38' && e.keyCode != '13' && e.keyCode != '9') {
		var contents = queetBox.text().substring(0,cursorPos);
		var mentionPos = contents.lastIndexOf('!');
		var check_contents = contents.substring(mentionPos - 1, cursorPos);
		var regex = /(^|\s|\.|\n)(!)[a-zA-Z0-9]+/;
		var match = check_contents.match(regex);
		if (contents.indexOf('!') >= 0 && match) {

			if(contents.lastIndexOf('!') > 1) {
				match[0] = match[0].substring(1,match[0].length);
				}
			if((contents.lastIndexOf('!')+match[0].length) == cursorPos) {

				queetBox.siblings('.mentions-suggestions').children('.group-suggestion').remove();
				queetBox.siblings('.mentions-suggestions').css('top',(queetBox.height()+20) + 'px');
				var term = match[0].substring(match[0].lastIndexOf('!')+1, match[0].length).toLowerCase();
				window.lastMention.mentionPos = mentionPos;
				window.lastMention.cursorPos = cursorPos;


				// see if any group we're member of matches
				var suggestionsToShow = [];
				var suggestionsUsernameCount = {};
				$.each(window.groupMemberships,function(){
					var userregex = new RegExp(term);
					if(this.username.toLowerCase().match(userregex) || this.name.toLowerCase().match(userregex)) {
						suggestionsToShow.push({id:this.id, avatar:this.avatar, name:this.name, username:this.username,url:this.url});

						// count the usernames to see if we need to show the server for any of them
						if(typeof suggestionsUsernameCount[this.username] != 'undefined') {
							suggestionsUsernameCount[this.username] = suggestionsUsernameCount[this.username] + 1;
							}
						else {
							suggestionsUsernameCount[this.username] = 1;
							}
						}
					});

				// show matches
				$.each(suggestionsToShow,function(){
					var serverHtml = '';
					if(suggestionsUsernameCount[this.username]>1 && this.url !== false) {
						serverHtml =  this.url + '/group/';
						}
					queetBox.siblings('.mentions-suggestions').append('<div class="group-suggestion" title="' + serverHtml + this.username + '" data-group-id="' + this.id + '"><img height="24" width="24" src="' + this.avatar + '" /><strong>' + this.name + '</strong> !<span>' + this.username + '</span></div>')
					});

				}
			else {
				queetBox.siblings('.mentions-suggestions').children('.group-suggestion').remove();
				}

			}
		else {
			queetBox.siblings('.mentions-suggestions').children('.group-suggestion').remove();
			}
		}
	});


/* ·
   ·
   ·   Any click empties the mentions-suggestions
   ·
   · · · · · · · · · · · · · */

$(document).click(function() {
	$('.mentions-suggestions').empty();
	});


/* ·
   ·
   ·   Store unposted queets in cache, if the user accidentally reloads the page or something
   ·
   · · · · · · · · · · · · · */

$('body').on('keyup', 'div.queet-box-syntax', function(e) {

	var thisId = $(this).attr('id');
	var thisText = $.trim($(this).text());

	// keep in global var to avoid doing all these operations every keystroke
	if(typeof window.queetBoxCurrentlyActive == 'undefined'
	|| window.queetBoxCurrentlyActive.id != thisId) {
		window.queetBoxCurrentlyActive = {
			id: thisId,
			startText: $.trim($('<div/>').append(decodeURIComponent($(this).attr('data-start-text'))).text()),
			repliesText: $.trim($('<div/>').append(decodeURIComponent($(this).attr('data-replies-text'))).text())
			};
		}

	// remove from cache if empty, or same as default text
	if(thisText == ''
	|| thisText == window.sL.compose
	|| thisText == window.queetBoxCurrentlyActive.startText
	|| thisText == window.queetBoxCurrentlyActive.repliesText) {
		localStorageObjectCache_STORE('queetBoxInput',thisId,false);
		}
	else {
		localStorageObjectCache_STORE('queetBoxInput',thisId,$(this).html());
		}
	});


/* ·
   ·
   ·   Keyboard shortcuts
   ·
   · · · · · · · · · · · · · */

// menu
$('#shortcuts-link').click(function(){
	popUpAction('popup-shortcuts', window.sL.keyboardShortcuts,'<div id="shortcuts-container"></div>',false);
	getDoc('shortcuts',function(html){
		$('#shortcuts-container').html(html);
		centerPopUp($('#popup-shortcuts').find('.modal-draggable'));
		});
	});

// send queet on ctrl+enter or ⌘+enter (mac)
$('body').on('keydown','.queet-box-syntax',function (e) {
	if((e.ctrlKey && e.which == 13)
	|| (e.metaKey && e.which == 13)) {
		e.preventDefault();
		var pressThisButton = $(this).siblings('.queet-toolbar').children('.queet-button').children('button');
		pressThisButton.click();
		$(this).blur();
		}
	});

$('body').keyup(function (e) {

	// only if queetbox is blurred, and we're not typing in any input, and we're logged in
	if($('.queet-box-syntax[contenteditable="true"]').length == 0
	&& $(":focus").length == 0
	&& window.loggedIn !== false) {

		// shortcuts documentation on '?'
		if(e.shiftKey && (e.which == 171 || e.which == 191)) {
			$('#shortcuts-link').click();
			}

		// queet box popup on 'n'
		else if(e.which == 78) { // n
			e.preventDefault();
			var pressThis = $('#top-compose')
			pressThis.click();
			}

		// select first queet on first selection, 'j' or 'k'
		else if ((e.which == 74 || e.which == 75) && $('.stream-item.selected-by-keyboard').length == 0) {
			$('#feed-body').children('.stream-item.visible').first().addClass('selected-by-keyboard');
			}

		// only if we have a selected queet
		else if($('.stream-item.selected-by-keyboard').length == 1) {
			var selectedQueet = $('#feed-body').children('.stream-item.selected-by-keyboard');

			// next queet on 'j'
			if(e.which == 74) {
				selectedQueet.removeClass('selected-by-keyboard');
				var next = selectedQueet.nextAll('.visible').not('.always-hidden').first();
				next.addClass('selected-by-keyboard');
				scrollToQueet(next);
				}
			// prev queet on 'k'
			else if(e.which == 75) {
				selectedQueet.removeClass('selected-by-keyboard');
				var prev = selectedQueet.prevAll('.visible').not('.always-hidden').first();
				prev.addClass('selected-by-keyboard');
				scrollToQueet(prev);
				}
			// fav queet on 'f'
			else if(e.which == 70) {
				selectedQueet.children('.queet').find('.icon.sm-fav').click();
				}
			// rq queet on 't'
			else if(e.which == 84) {
				selectedQueet.children('.queet').find('.icon.sm-rt:not(.is-mine)').click();
				}
			// expand/collapse queet on enter
			else if(e.which == 13) {
				selectedQueet.children('.queet').click();
				}
			// reply to queet on 'r'
			else if(e.which == 82) {
				if(selectedQueet.hasClass('expanded')) {
					selectedQueet.find('.queet-box-syntax').click();
					}
				else {
					selectedQueet.children('.queet').find('.icon.sm-reply').click();
					}
				}
			}
		}
	});


/* ·
   ·
   ·   When clicking show more links, walk upwards or downwards
   ·
   · · · · · · · · · · · · · */

$('body').on('click','.view-more-container-bottom', function(){
	var thisParentStreamItem = $(this).parent('.stream-item');
	findReplyToStatusAndShow(thisParentStreamItem, thisParentStreamItem.attr('data-quitter-id'),$(this).attr('data-replies-after'));
	$(this).remove();
	findAndMarkLastVisibleInConversation(thisParentStreamItem);
	});
$('body').on('click','.view-more-container-top', function(){

	var this_qid = $(this).closest('.stream-item:not(.conversation)').attr('data-quitter-id');
	var queet = $(this).siblings('.queet');
	var thisParentStreamItem = $(this).parent('.stream-item');
	rememberMyScrollPos(queet,'moretop' + this_qid);


	findInReplyToStatusAndShow(thisParentStreamItem, thisParentStreamItem.attr('data-quitter-id'),$(this).attr('data-trace-from'),false,true);
	$(this).remove();

	backToMyScrollPos(queet,'moretop' + this_qid,false);

	// remove the "show full conversation" link if nothing more to show
	if(thisParentStreamItem.find('.hidden-conversation').length == 0) {
		thisParentStreamItem.children('.queet').find('.show-full-conversation').remove();
		}
	findAndMarkLastVisibleInConversation(thisParentStreamItem);
	});



/* ·
   ·
   ·   When clicking "show full conversation", show all hidden queets in conversation
   ·
   · · · · · · · · · · · · · */

$('body').on('click','.show-full-conversation',function(){

	var this_q = $(this).closest('.queet');
	var thisStreamItem = this_q.parent();
	var this_qid = thisStreamItem.attr('data-quitter-id');

	rememberMyScrollPos(this_q,this_qid);

	thisStreamItem.find('.view-more-container-top').remove();
	thisStreamItem.find('.view-more-container-bottom').remove();
	$.each(thisStreamItem.find('.hidden-conversation'),function(key,obj){
		$(obj).removeClass('hidden-conversation');
		$(obj).animate({opacity:'1'},400,function(){
			$(obj).css('background-color','pink').animate({backgroundColor:'#F6F6F6'},1000);
			});
		});
	$(this).remove();

	backToMyScrollPos(this_q,this_qid,false);
	findAndMarkLastVisibleInConversation(thisStreamItem);
	});



/* ·
   ·
   ·   Edit profile
   ·
   · · · · · · · · · · · · · */

$('body').on('click','#page-container > .profile-card .edit-profile-button',function(){
	if(!$(this).hasClass('disabled')) {
		$(this).addClass('disabled');
		$('html').scrollTop(0);
		$('html').addClass('fixed');
		$('body').prepend('<div id="edit-profile-popup" class="modal-container"></div>');
		display_spinner();
		getFromAPI('users/show/' + window.loggedIn.screen_name + '.json', function(data){
			remove_spinner();
			if(data){
				data = cleanUpUserObject(data);
				// use avatar if no cover photo
				var coverPhotoHtml = '';
				if(data.cover_photo !== false) {
					coverPhotoHtml = 'background-image:url(\'' + data.cover_photo + '\')';
					}
				$('.hover-card,.hover-card-caret').remove();
				$('#edit-profile-popup').prepend('\
					<div class="edit-profile-container">\
			  			<div class="upload-background-image"></div>\
					    <input type="file" name="background-image-input" id="background-image-input" />\
						<div class="profile-card">\
							<div class="profile-header-inner" style="' + coverPhotoHtml + '">\
							   <input type="file" name="cover-photo-input" id="cover-photo-input" />\
							   <div class="close-edit-profile-window"></div>\
							   <div class="upload-cover-photo"></div>\
							   <input type="file" name="avatar-input" id="avatar-input" />\
							   <div class="upload-avatar"></div>\
							   <div class="profile-header-inner-overlay"></div>\
							   <a class="profile-picture" href="' + data.profile_image_url_original + '"><img src="' + data.profile_image_url_profile_size + '" /></a>\
							   <div class="profile-card-inner">\
								   <input class="fullname" id="edit-profile-fullname" placeholder="' + window.sL.signUpFullName + '" data-start-value="' + data.name + '" value="' + data.name + '" />\
								   <h2 class="username"><span class="screen-name">@' + data.screen_name + '</span><span class="follow-status"></span></h2>\
								   <div class="bio-container">\
									   <textarea class="bio" id="edit-profile-bio"  data-start-value="' + data.description + '" placeholder="' + window.sL.registerBio + '">' + data.description + '</textarea>\
								   </div>\
								   <p class="location-and-url">\
									   <input class="location" id="edit-profile-location" placeholder="' + window.sL.registerLocation + '" data-start-value="' + data.location + '" value="' + data.location + '" />\
									   <span class="divider"> · </span>\
									   <input class="url" id="edit-profile-url" placeholder="' + window.sL.registerHomepage + '" data-start-value="' + data.url + '" value="' + data.url + '" />\
								   </p>\
							   </div>\
							</div>\
							<div class="profile-banner-footer">\
							   <div class="color-selection">\
							      <label for="link-color-selection">' + window.sL.linkColor + '</label>\
							      <input id="link-color-selection" type="text" value="#' + window.loggedIn.linkcolor + '" />\
							   </div>\
							   <div class="color-selection">\
							      <label for="link-color-selection">' + window.sL.backgroundColor + '</label>\
							      <input id="background-color-selection" type="text" value="#' + window.loggedIn.backgroundcolor + '" />\
							   </div>\
							   <div class="user-actions">\
							       <button type="button" class="abort-edit-profile-button"><span class="button-text edit-profile-text">' + window.sL.cancelVerb + '</span>\
								   <button type="button" class="save-profile-button"><span class="button-text edit-profile-text">' + window.sL.saveChanges + '</span>\
								   <button type="button" class="crop-and-save-button"><span class="button-text edit-profile-text">' + window.sL.cropAndSave + '</span>\
							   </div>\
							   <div class="clearfix"></div>\
							</div>\
						</div>\
					</div>');
				$('#edit-profile-popup .profile-card').css('top',$('#page-container .profile-card').offset().top-53 + 'px'); // position exactly over
				// save colors on change
				$('#link-color-selection').minicolors({
					change: function(hex) {

						// pause for 500ms before saving and displaying color changes
						window.changeToLinkColor = hex;
						setTimeout(function(){
							if(hex == window.changeToLinkColor) {
								changeDesign({linkcolor:hex});
								postNewLinkColor(hex.substring(1));
								window.loggedIn.linkcolor = hex.substring(1);
								}
							},500);

						}
					});
				$('#background-color-selection').minicolors({
					change: function(hex) {

						// pause for 500ms before saving and displaying color changes
						window.changeToBackgroundColor = hex;
						setTimeout(function(){
							if(hex == window.changeToBackgroundColor) {
								changeDesign({backgroundcolor:hex});
								postNewBackgroundColor(hex.substring(1));
								window.loggedIn.backgroundcolor = hex.substring(1);
								}
							},500);

						}
					});
				// also on keyup in input (minicolors 'change' event does not do this, apparently)
				$('#link-color-selection').on('keyup',function(){
					keyupSetLinkColor($(this).val());
					});
				$('#background-color-selection').on('keyup',function(){
					keyupSetBGColor($(this).val());
					});

				// check if profile info is change and show/hide buttons
				$('input.fullname,textarea.bio,input.location,input.url').on('keyup paste input',function(){
					showHideSaveProfileButtons();
					});
				}
			else {
				abortEditProfile();
				}
			});
		}
	});

// function to see if anything in profile is changed and show/hide buttons accordingly
function showHideSaveProfileButtons() {
	if($('input.fullname').val() != $('input.fullname').attr('data-start-value')
	|| $('textarea.bio').val() != $('textarea.bio').attr('data-start-value')
	|| $('input.location').val() != $('input.location').attr('data-start-value')
	|| $('input.url').val() != $('input.url').attr('data-start-value')) {
		$('.abort-edit-profile-button, .save-profile-button').show();
		}
	else {
		$('.abort-edit-profile-button, .save-profile-button').hide();
		}
	}
// idle function for linkcolor selection by keyboard input
var keyupLinkColorTimer;
function keyupSetLinkColor(hex) {
	clearTimeout(keyupLinkColorTimer);
	keyupLinkColorTimer = setTimeout(function () {
		$('#link-color-selection').minicolors('value',hex);
		changeLinkColor($('#link-color-selection').val());
		postNewLinkColor($('#link-color-selection').val().substring(1));
		}, 500);
	}
// idle function for bgcolor selection by keyboard input
var keyupBGColorTimer;
function keyupSetBGColor(hex) {
	clearTimeout(keyupBGColorTimer);
	keyupBGColorTimer = setTimeout(function () {
		$('#background-color-selection').minicolors('value',hex);
		$('body').css('background-color',$('#background-color-selection').val());
		postNewBackgroundColor($('#background-color-selection').val().substring(1));
		}, 500);
	}

// cancel
$('body').on('click','.close-edit-profile-window',function(){
	abortEditProfile();
	});
$('body').on('click','.abort-edit-profile-button',function(){
	// if this is the avatar or cover photo
	if($('#edit-profile-popup .jwc_frame').length>0) {
		cleanUpAfterCropping();
		}
	// if profile info
	else {
		abortEditProfile();
		}
	});
function abortEditProfile() {
	$('#edit-profile-popup').remove();
	$('.edit-profile-button').removeClass('disabled');
	$('html').removeClass('fixed');
	}
// validate
$('body').on('keyup paste input', '#edit-profile-popup input,#edit-profile-popup textarea', function() {
	if(validateEditProfileForm($('#edit-profile-popup'))){
		$('.save-profile-button').removeAttr('disabled');
		$('.save-profile-button').removeClass('disabled');
		}
	else {
		$('.save-profile-button').attr('disabled','disabled');
		$('.save-profile-button').addClass('disabled');
		}
	});

// submit cover photo or avatar
$('body').on('click','.crop-and-save-button',function(){
	if($('.crop-and-save-button').attr('disabled') != 'disabled') {
		$('.crop-and-save-button').attr('disabled','disabled');
		$('.crop-and-save-button').addClass('disabled');
		display_spinner();

		// if this is the cover photo
		if($('#edit-profile-popup .jwc_frame.cover-photo-to-crop').length>0) {

			var coverImgFormData = new FormData();
			coverImgFormData.append('banner', $('#cover-photo-input')[0].files[0]);
			coverImgFormData.append('height', window.jwc.result.cropH);
			coverImgFormData.append('width', window.jwc.result.cropW);
			coverImgFormData.append('offset_left', window.jwc.result.cropX);
			coverImgFormData.append('offset_top', window.jwc.result.cropY);

			$.ajax({
				url:         window.apiRoot + 'account/update_profile_banner.json',
				type:        "POST",
				data:        coverImgFormData,
				processData: false,
				contentType: false,
				cache:       false,
				dataType:    "json",
				error: function(data){
					console.log('error saving profile banner'); console.log(data);
					$('.crop-and-save-button').removeAttr('disabled');
					$('.crop-and-save-button').removeClass('disabled');
					cleanUpAfterCropping();
					remove_spinner();
					},
				success: function(data) {
					remove_spinner();
					if(typeof data.error == 'undefined') {
						$('.crop-and-save-button').removeAttr('disabled');
						$('.crop-and-save-button').removeClass('disabled');
						cleanUpAfterCropping();
						$('.profile-header-inner').css('background-image','url(' + data.url + ')');
						$('#user-header').css('background-image','url(' + data.url + ')');
						}
					 else {
						alert('Try again! ' + data.error);
						$('.crop-and-save-button').removeAttr('disabled');
						$('.crop-and-save-button').removeClass('disabled');
						}
					 }
				});
			}
		// if this is the avatar
		else if($('#edit-profile-popup .jwc_frame.avatar-to-crop').length>0) {
			$.ajax({ url: window.apiRoot + 'qvitter/update_avatar.json',
				type: "POST",
				data: {
					cropH: 	window.jwc.result.cropH,
					cropW: 	window.jwc.result.cropW,
					cropX:	window.jwc.result.cropX,
					cropY: 	window.jwc.result.cropY,
					img:	$('#avatar-to-crop').attr('src')
					},
				dataType:"json",
				error: function(data){ console.log('error'); console.log(data); },
				success: function(data) {
					remove_spinner();
					if(typeof data.error == 'undefined') {
						$('.crop-and-save-button').removeAttr('disabled');
						$('.crop-and-save-button').removeClass('disabled');
						cleanUpAfterCropping();
						$('.profile-picture').attr('href',data.profile_image_url_original);
						$('.profile-picture img, #user-avatar').attr('src',data.profile_image_url_profile_size);
						$('#settingslink .nav-session').css('background-image','url(\'' + data.profile_image_url_profile_size + '\')');
						$('.account-group .name[data-user-id="' + window.loggedIn.id + '"]').siblings('.avatar').attr('src',data.profile_image_url_profile_size);
						}
					 else {
						alert('Try again! ' + data.error);
						$('.crop-and-save-button').removeAttr('disabled');
						$('.crop-and-save-button').removeClass('disabled');
						}
					 }
				});
			}
		// if this is the background-image
		else if($('#edit-profile-popup .jwc_frame.background-to-crop').length>0) {
			$.ajax({ url: window.apiRoot + 'qvitter/update_background_image.json',
				type: "POST",
				data: {
					cropH: 	window.jwc.result.cropH,
					cropW: 	window.jwc.result.cropW,
					cropX:	window.jwc.result.cropX,
					cropY: 	window.jwc.result.cropY,
					img:	$('#background-to-crop').attr('src')
					},
				dataType:"json",
				error: function(data){ console.log('error'); console.log(data); },
				success: function(data) {
					remove_spinner();
					if(typeof data.error == 'undefined') {
						$('.crop-and-save-button').removeAttr('disabled');
						$('.crop-and-save-button').removeClass('disabled');
						cleanUpAfterCropping();
						changeDesign({backgroundimage:data.url});
						window.loggedIn.background_image = data.url;
						}
					 else {
						alert('Try again! ' + data.error);
						$('.crop-and-save-button').removeAttr('disabled');
						$('.crop-and-save-button').removeClass('disabled');
						}
					 }
				});
			}
		}
	});

// submit new profile info
$('body').on('click','.save-profile-button',function(){
	if($('.save-profile-button').attr('disabled') != 'disabled') {
		$('.save-profile-button').attr('disabled','disabled');
		$('.save-profile-button').addClass('disabled');
		display_spinner();

		if(validateEditProfileForm($('#edit-profile-popup'))) {
			$.ajax({ url: window.apiRoot + 'account/update_profile.json',
				type: "POST",
				data: {
					name: 			$('#edit-profile-popup input.fullname').val(),
					url: 			$('#edit-profile-popup input.url').val(),
					location: 		$('#edit-profile-popup input.location').val(),
					description:	$('#edit-profile-popup textarea.bio').val(),
					},
				dataType:"json",
				error: function(data){ console.log('error'); console.log(data); },
				success: function(data) {
					remove_spinner();
					if(typeof data.error == 'undefined') {
						location.reload(); // reload, hopefully the new profile is saved
						}
					 else {
						alert('Try again! ' + data.error);
						$('.save-profile-button').removeAttr('disabled');
						$('.save-profile-button').removeClass('disabled');
						}
					 }
				});
			}
		}
	});

// cover photo, avatar and background image select and crop
$('body').on('click','.upload-cover-photo, .upload-avatar, .upload-background-image',function(){
	var coverOrAvatar = $(this).attr('class');
	if(coverOrAvatar == 'upload-cover-photo') {
		var inputId = 'cover-photo-input'
		}
	else if(coverOrAvatar == 'upload-avatar') {
		var inputId = 'avatar-input'
		}
	else if(coverOrAvatar == 'upload-background-image') {
		var inputId = 'background-image-input'
		}
	$('#' + inputId).click(function(){ $(this).one('change',function(e){ // trick to make the change event only fire once when selecting a file
		coverPhotoAndAvatarSelectAndCrop(e, coverOrAvatar);
		})});

	// trigger click for firefox
	if(navigator.userAgent.toLowerCase().indexOf('firefox') > -1) {
		$('#' + inputId).trigger('click');
		}
	// other browsers
	else {
		var evt = document.createEvent("HTMLEvents");
		evt.initEvent("click", true, true);
		$('#' + inputId)[0].dispatchEvent(evt);
		}

	});

// load image from file input
function coverPhotoAndAvatarSelectAndCrop(e, coverOrAvatar) {

	if(coverOrAvatar == 'upload-cover-photo') {
		var targetWidth = 588;
		var targetHeight = 260;
		var cropId = 'cover-photo-to-crop';
		}
	else if(coverOrAvatar == 'upload-avatar') {
		var targetWidth = 220;
		var targetHeight = 220;
		var maxWidth = 1040;
		var minWidth = 1040;
		var cropId = 'avatar-to-crop';
		}
	else if(coverOrAvatar == 'upload-background-image') {
		var targetWidth = $(window).width();
		var targetHeight = $(window).height()-46;
		var maxWidth = 3000;
		var minWidth = 3000;
		var cropId = 'background-to-crop';
		}

	// get orientation
	loadImage.parseMetaData(e.target.files[0], function (data) {
		if (data.exif) {
			var orientation = data.exif.get('Orientation');
			}
		else {
			var orientation = 1;
			}

		display_spinner();

		// clean up
		cleanUpAfterCropping();

		// create image
		loadImage(e.target.files[0],
				function (img) {
					if(typeof img.target == 'undefined') {
						var appendedImg = $('#edit-profile-popup .profile-card').prepend('<img id="' + cropId +'" src="' + img.toDataURL('image/jpeg') +  '" />');

						// enable cropping
						$('#' +  cropId).jWindowCrop({
							targetWidth:targetWidth,
							targetHeight:targetHeight,
							onChange: function(result) {
								remove_spinner();
								}
							});

						// align centered, fade out background
						$('#' + cropId).parent().addClass(cropId);
						$('#' + cropId).parent().css('position','absolute')
						$('#' + cropId).parent().css('left','50%')
						$('#' + cropId).parent().css('margin-left','-' + (targetWidth/2) + 'px')
						$('#' + cropId).parent().siblings('.profile-header-inner').children('div,input,a').css('display','none');

						// replace the hardcoded "click to drag" string
						$('#' + cropId).siblings('.jwc_controls').children('span').html(window.sL.clickToDrag);

						window.jwc = $('#' + cropId).getjWindowCrop();

						$('.save-profile-button').hide();
						$('.abort-edit-profile-button, .crop-and-save-button').show();
						}
					else {
						remove_spinner();
						$('.queet-box-loading-cover').remove();
						alert('could not read image');
						}
					},
				{ maxWidth: maxWidth,
				  minWidth: minWidth,
				  canvas: true,
				  orientation: orientation } // Options
			);
		});
	}
function cleanUpAfterCropping(){
	$('.jwc_frame').siblings('.profile-header-inner').children('div,input,a').css('display','block');
	if(typeof window.jwc != 'undefined') {
		window.jwc.destroy();
		}
	$('.jwc_frame').remove();
	$('#cover-photo-to-crop').remove();
	$('#avatar-to-crop').remove();
	$('#background-to-crop').remove();
	$('input:file').unbind('click');
	$('.crop-and-save-button').removeClass('disabled');
	$('.crop-and-save-button').removeAttr('disabled');
	$('.crop-and-save-button, .abort-edit-profile-button').hide();
	showHideSaveProfileButtons();
	}


/* ·
   ·
   ·   Upload attachment
   ·
   · · · · · · · · · · · · · */

$('body').on('mousedown','.upload-image',function () {

	// remember caret position
	var caretPos = getSelectionInElement($(this).closest('.queet-toolbar').siblings('.queet-box-syntax')[0]);
	$(this).attr('data-caret-pos',caretPos);

	// prevent queet-box collapse
	$(this).addClass('clicked');

	});

$('body').on('click','.upload-image',function () {

	var thisUploadButton = $(this);

	$('#upload-image-input').one('click',function(){ // trick to make the change event only fire once when selecting a file
		$(this).unbind('change');
		$(this).one('change',function(e){
			uploadAttachment(e, thisUploadButton);
			})
		});

	// trigger click for firefox
	if(navigator.userAgent.toLowerCase().indexOf('firefox') > -1) {
		$('#upload-image-input').trigger('click');
		}
	// other browsers
	else {
		var evt = document.createEvent("HTMLEvents");
		evt.initEvent("click", true, true);
		$('#upload-image-input')[0].dispatchEvent(evt);
		}
	});

function uploadAttachment(e, thisUploadButton) {

	// loader cover stuff
	thisUploadButton.closest('.queet-toolbar').parent().append('<div class="queet-box-loading-cover"></div>');
	thisUploadButton.closest('.queet-toolbar').siblings('.queet-box-loading-cover').width(thisUploadButton.closest('.queet-toolbar').parent().outerWidth());
	display_spinner(thisUploadButton.closest('.queet-toolbar').siblings('.queet-box-loading-cover')[0]);
	thisUploadButton.closest('.queet-toolbar').siblings('.queet-box-loading-cover').find('.loader').css('top', (thisUploadButton.closest('.queet-toolbar').parent().outerHeight()/2-20) + 'px');

	var uploadButton = thisUploadButton.closest('.queet-toolbar').find('.upload-image');
	var queetBox = thisUploadButton.closest('.queet-toolbar').siblings('.queet-box-syntax');
	var caretPos = uploadButton.attr('data-caret-pos').split(',');

	var imgFormData = new FormData();
	imgFormData.append('media', $('#upload-image-input')[0].files[0]);

	// upload
	$.ajax({ url: window.apiRoot + 'statusnet/media/upload',
		type: "POST",
		data: imgFormData,
		contentType: false,
		processData: false,
		dataType: "xml",
		error: function(data, textStatus, errorThrown){
			showErrorMessage(window.sL.ERRORattachmentUploadFailed, queetBox.siblings('.syntax-two'));
			$('.queet-box-loading-cover').remove();
			queetBox.focus();
			},
		success: function(data) {
			var rsp = $(data).find('rsp');
			if (rsp.attr('stat') == 'ok') {

				// maybe add thumbnail below queet box
				if($(data).find('atom\\:link,link').length>0) {
					var mimeType = $(data).find('atom\\:link,link').attr('type');
					if(mimeType.indexOf('image/') == 0) {
						var imgUrl = $(data).find('atom\\:link,link').attr('href');
						thisUploadButton.closest('.queet-toolbar').before('<span class="upload-image-container"><img class="to-upload" src="' + imgUrl +  '" /></span>');
						}
					}

				var mediaurl = rsp.find('mediaurl').text();

				$('img.to-upload').attr('data-shorturl', mediaurl);
				$('img.to-upload').addClass('uploaded');
				$('img.to-upload').removeClass('to-upload');

				// insert shorturl in queet box
				deleteBetweenCharacterIndices(queetBox[0], caretPos[0], caretPos[1]);
				var range = createRangeFromCharacterIndices(queetBox[0], caretPos[0], caretPos[0]);
				if(typeof range == 'undefined') {
					// if queetbox is empty no range is returned, and inserting will fail,
					// so we insert a space and try to get range again...
					queetBox.html('&nbsp;');
				    range = createRangeFromCharacterIndices(queetBox[0], caretPos[0], caretPos[0]);
					}
				range.insertNode(document.createTextNode(' ' + mediaurl + ' '));

				// put caret after
				queetBox.focus();
				var putCaretAt = parseInt(caretPos[0],10)+mediaurl.length+2;
				setSelectionRange(queetBox[0], putCaretAt, putCaretAt);
				queetBox.trigger('input'); // avoid some flickering
				setTimeout(function(){ queetBox.trigger('input');},1); // make sure chars are counted and shorten-button activated
				$('.queet-box-loading-cover').remove();
				}
			 else {
				alert('Try again! ' + rsp.find('err').attr('msg'));
				$('.save-profile-button').removeAttr('disabled');
				$('.save-profile-button').removeClass('disabled');
				$('img.to-upload').parent().remove();
				$('.queet-box-loading-cover').remove();
				}
			 }
		});

	}

/* ·
   ·
   ·   Small edit profile button on hover cards goes to edit profile
   ·
   · · · · · · · · · · · · · */

$('body').on('click','.hover-card .edit-profile-button',function(){
	goToEditProfile();
	});


/* ·
   ·
   ·   User menu when clicking the mini cog wheel in the logged in mini card
   ·
   · · · · · · · · · · · · · */

$('body').on('click','#mini-logged-in-user-cog-wheel:not(.dropped)',function(){
	var menu = $(getMenu(loggedInUsersMenuArray())).appendTo(this);
	alignMenuToParent(menu,$(this));
	$(this).addClass('dropped');
	});
// hide when clicking it again
$('body').on('click','#mini-logged-in-user-cog-wheel.dropped',function(e){
	if($(e.target).is('#mini-logged-in-user-cog-wheel')) {
		$('#mini-logged-in-user-cog-wheel').children('.dropdown-menu').remove();
		$('#mini-logged-in-user-cog-wheel').removeClass('dropped');
		}
	});
// hide the menu when clicking outside it
$('body').on('click',function(e){
	if($('#mini-logged-in-user-cog-wheel').hasClass('dropped') && !$(e.target).closest('#mini-logged-in-user-cog-wheel').length>0) {
		$('#mini-logged-in-user-cog-wheel').children('.dropdown-menu').remove();
		$('#mini-logged-in-user-cog-wheel').removeClass('dropped');
		}
	});


/* ·
   ·
   ·   Goes to edit profile
   ·
   · · · · · · · · · · · · · */

function goToEditProfile(arg, callback) {
	if(window.currentStreamObject.name == 'my profile') {
		$('#page-container > .profile-card .edit-profile-button').trigger('click');
		if(typeof callback == 'function') {
			callback(true);
			}
		}
	else {
		setNewCurrentStream(pathToStreamRouter(window.loggedIn.screen_name), true, false, function(){
			$('#page-container > .profile-card .edit-profile-button').trigger('click');
			if(typeof callback == 'function') {
				callback(true);
				}
			});
		}

	}
