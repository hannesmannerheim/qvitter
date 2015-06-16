
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
  
// object to keep old states of streams in, to speed up stream change  
window.oldStreams = new Object();

// check our localStorage and make sure it's correct
checkLocalStorage();


/* · 
   · 
   ·   Update stream on back button
   · 
   · · · · · · · · · · · · · */ 

window.onpopstate = function(event) {
	if(event && event.state) {
		display_spinner();
		setNewCurrentStream(event.state.strm,function(){
			remove_spinner();			
			},false);
		}
	}
	
	
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
		$('#login-content, .front-signup').not('#popup-signup').css({'position': 'fixed', 'top': '55px'}); 
		}
	else if ($(this).scrollTop() < (feedOrProfileCardOffsetTop-55) && $('#login-content').css('position') != 'absolute'){ 
		$('#login-content, .front-signup').not('#popup-signup').css({'position': 'absolute', 'top': 'auto'}); 
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
				if($('#signup-user-nickname-step2').val().length>1 && /^[a-zA-Z0-9]+$/.test($('#signup-user-nickname-step2').val())) {
					$('#signup-user-nickname-step2').addClass('nickname-taken');
					if($('.spinner-wrap').length==0) {
						$('#signup-user-nickname-step2').after('<div class="spinner-wrap"><div class="spinner"><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i></div></div>');
						}				
					window.checkNicknameTimeout = setTimeout(function(){					
						$.get(window.apiRoot + 'check_nickname.json?nickname=' + encodeURIComponent($('#signup-user-nickname-step2').val()),function(data){
							$('.spinner-wrap').remove();
							if(data==0) {
								$('#signup-user-password2-step2').trigger('keyup'); // revalidates	
								}
							else {							
								$('#signup-user-nickname-step2').removeClass('nickname-taken');			
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
				if(validateRegisterForm($('#popup-register'))) {
					if(!$('#signup-user-nickname-step2').hasClass('nickname-taken')) {
						$('#signup-btn-step2').removeClass('disabled');
						}
					else {
						$('#signup-btn-step2').addClass('disabled');
						}
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
						error: function(data){ console.log('error'); console.log(data); },
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

	// set language, from local storage, else browser language, else english (english also if no localstorage availible)
	var browserLang = navigator.language || navigator.userLanguage; 
	if(browserLang.substring(0,5).toLowerCase() == 'zh-cn') {
		browserLang = 'zh_cn';
		}
	else if(browserLang.substring(0,5).toLowerCase() == 'zh-tw') {
		browserLang = 'zh_tw';
		}
	else {
		browserLang =  browserLang.substring(0,2);        	
		}
			
	window.selectedLanguage = 'en';      
	
	if(window.loggedIn === false) {
		var selectedForUser = 'logged_out';
		}
	else {
		var selectedForUser = window.loggedIn.id;
		}
	
	localStorageObjectCache_GET('selectedLanguage',selectedForUser, function(data){
		if(data) {
			window.selectedLanguage = data;			
			}
		else {
			window.selectedLanguage = browserLang;			
			}
		});
		
	// check that this language is available, otherwise use english
	if(typeof window.availableLanguages[window.selectedLanguage] == 'undefined') {
		window.selectedLanguage = 'en';
		}	

	// if this is a RTL-language, add rtl class to body
	if(window.selectedLanguage == 'ar'
	|| window.selectedLanguage == 'fa') {
		$('body').addClass('rtl');
		}
				
	// if we already have this version of this language in localstorage, we
	// use that cached version. we do this because $.ajax doesn't respect caching, it seems
	localStorageObjectCache_GET('languageData',window.availableLanguages[window.selectedLanguage], function(data){
		if(data) {
			proceedToSetLanguageAndLogin(data);
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
		});

	});
	
// proceed to set language and login
function proceedToSetLanguageAndLogin(data){
	window.sL = data;

	window.siteTitle = $('head title').html(); // remember this for later use


	// replace placeholders in translation
	$.each(window.sL,function(k,v){
		window.sL[k] = v.replace(/{site-title}/g,window.siteTitle);
		});


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
	$('#feed-header-inner h2').html(window.sL.queetsNounPlural);
	$('#logout').html(window.sL.logout);
	$('#settings').html(window.sL.settings);
	$('#other-servers-link').html(window.sL.otherServers);
	$('.language-dropdown .dropdown-toggle small').html(window.sL.languageSelected);
	$('.language-dropdown .current-language').html(window.sL.languageName);
	$('.stream-selection[data-stream-name="statuses/friends_timeline.json"]').prepend(window.sL.timeline);
	$('.stream-selection[data-stream-name="statuses/friends_timeline.json"]').attr('data-stream-header',window.sL.timeline);
	$('.stream-selection[data-stream-name="statuses/mentions.json"]').prepend(window.sL.mentions);
	$('.stream-selection[data-stream-name="statuses/mentions.json"]').attr('data-stream-header',window.sL.mentions);
	$('.stream-selection[data-stream-name="qvitter/statuses/notifications.json"]').prepend(window.sL.notifications);
	$('.stream-selection[data-stream-name="qvitter/statuses/notifications.json"]').attr('data-stream-header',window.sL.notifications);
	$('.stream-selection[data-stream-name="favorites.json"]').prepend(window.sL.favoritesNoun);
	$('.stream-selection[data-stream-name="favorites.json"]').attr('data-stream-header',window.sL.favoritesNoun);
	$('.stream-selection[data-stream-name="statuses/public_timeline.json"]').prepend(window.sL.publicTimeline);
	$('.stream-selection[data-stream-name="statuses/public_timeline.json"]').attr('data-stream-header',window.sL.publicTimeline);
	$('.stream-selection[data-stream-name="statuses/public_and_external_timeline.json"]').prepend(window.sL.publicAndExtTimeline);
	$('.stream-selection[data-stream-name="statuses/public_and_external_timeline.json"]').attr('data-stream-header',window.sL.publicAndExtTimeline);
	$('#search-query').attr('placeholder',window.sL.searchVerb);
	$('#faq-link').html(window.sL.FAQ);
	$('#invite-link').html(window.sL.inviteAFriend);
	$('#classic-link').html('Classic ' + window.siteTitle);
	$('#edit-profile-header-link').html(window.sL.editMyProfile);
	
	// show site body now 			
	$('#user-container').css('display','block');
	$('#feed').css('display','block');		

	// login or not
	if(window.loggedIn) {
		doLogin(getStreamFromUrl());		
		}
	else {
		display_spinner();
		window.currentStream = ''; // force reload stream
		setNewCurrentStream(getStreamFromUrl(),function(){
			logoutWithoutReload(false);
			remove_spinner();						
			},true);
		}	
	}	

/* · 
   · 
   ·   Login action
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

function doLogin(streamToSet) {
	$('#submit-login').attr('disabled','disabled');
	$('#submit-login').focus(); // prevents submit on enter to close alert-popup on wrong credentials
	display_spinner();
		
		// add user data to DOM, show search form, remeber user id, show the feed
		$('#user-container').css('z-index','1000');
		$('#top-compose').removeClass('hidden');
		$('#qvitter-notice').show();
		$('#user-avatar').attr('src', window.loggedIn.profile_image_url_profile_size);
		$('#settingslink .nav-session').css('background-image', 'url(\'' + window.loggedIn.profile_image_url_profile_size + '\')');
		$('#user-header').attr('title', window.sL.viewMyProfilePage);
		$('#user-name').append(window.loggedIn.name);
		$('#user-screen-name').append(window.loggedIn.screen_name);
		$('#user-queets strong').html(window.loggedIn.statuses_count);
		$('#user-following strong').html(window.loggedIn.friends_count);			
		$('#user-followers strong').html(window.loggedIn.followers_count);		
		$('#user-groups strong').html(window.loggedIn.groups_count);
		$('.stream-selection.friends-timeline').attr('href', window.loggedIn.statusnet_profile_url + '/all');
		$('.stream-selection.mentions').attr('href', window.loggedIn.statusnet_profile_url + '/replies');
		$('.stream-selection.notifications').attr('href', window.loggedIn.statusnet_profile_url + '/notifications');		
		$('.stream-selection.my-timeline').attr('href', window.loggedIn.statusnet_profile_url);				
		$('.stream-selection.favorites').attr('href', window.loggedIn.statusnet_profile_url + '/favorites');								
		window.myUserID = window.loggedIn.id;		
		if(window.loggedIn.cover_photo !== false) {
			$('#user-header').css('background-image','url(\'' + window.loggedIn.cover_photo + '\')');
			}					
				
				
		// get all users i'm following for autosuggestion
		window.following = new Array();
		getFromAPI('qvitter/allfollowing/' + window.loggedIn.screen_name + '.json',function(data){
			if(data) {
				var i=0;
				$.each(data,function(k,v){
					if(v[2] === false) { var avatar = window.defaultAvatarStreamSize; }
					else { 	var avatar = v[2]; }
					if(v[3]) {
						// extract server base url
						v[3] = v[3].substring(v[3].indexOf('://')+3,v[3].lastIndexOf(v[1])-1);
						}					
					v[0] = v[0] || v[1]; // if name is null we go with username there too
					window.following[i] = { 'id': k,'name': v[0], 'username': v[1],'avatar': avatar, 'url':v[3] };
					i++;
					});
				}
			});
		
		// load history
		loadHistoryFromLocalStorage();			
				
		// set stream
		window.currentStream = ''; // always reload stream on login
		setNewCurrentStream(streamToSet,function(){		
			$('.language-dropdown').css('display','none');
			$('#user-header').animate({opacity:'1'},800);
			$('#user-body').animate({opacity:'1'},800);
			$('#user-footer').animate({opacity:'1'},800);
			$('.menu-container').animate({opacity:'1'},800);									
			$('#page-container').animate({opacity:'1'},200);
			$('#search').fadeIn('slow');											
			$('#login-content').css('display','none');
			$('.front-signup').css('display','none');
			$('#settingslink .dropdown-toggle').fadeIn('slow');
			$('#top-compose').fadeIn('slow');
			$('input#nickname').blur();
			remove_spinner();			
			},true);

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
   ·   Classic Link, toggle setting in api and redirect to /all
   · 
   · · · · · · · · · · · · · */ 

$('#classic-link').click(function(){
	getFromAPI('qvitter/toggle_qvitter.json',function(data){
		if(data.success === true) {
			window.location.href = window.siteInstanceURL + window.loggedIn.screen_name + '/all';
			}
		});
	
	});



/* · 
   · 
   ·   Do a logout without reloading, i.e. on login errors 
   · 
   · · · · · · · · · · · · · */ 

function logoutWithoutReload(doShake) {
					
	$('input#nickname').focus();	
	$('.front-signup').animate({opacity:'1'},200);
	if(doShake) {
		$('input#nickname').css('background-color','pink');
		$('input#password').css('background-color','pink');		
		}
	$('#login-content').animate({opacity:'1'},200, function(){
		if(doShake) {
			$('#login-content').effect('shake',{distance:5,times:2},function(){
				$('input#nickname').animate({backgroundColor:'#fff'},1000);
				$('input#password').animate({backgroundColor:'#fff'},1000);					
				});
			}
		$('.front-welcome-text').show();						
		});
	$('#page-container').animate({opacity:'1'},200);	
	
	}


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
	if(!$('.quitter-settings').hasClass('dropped')) { $('.quitter-settings').addClass('dropped'); }
	else { $('.quitter-settings').removeClass('dropped'); }
	});



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
   ·   When clicking an external follow button
   · 
   · · · · · · · · · · · · · */ 

$('body').on('click','.qvitter-follow-button',function(event){
	if(!$(this).hasClass('disabled')) {
		$(this).addClass('disabled');
			
		// get user id
		var user_id = $(this).attr('data-follow-user-id');

		// if there's no local user id, we have to take a detour
		if(typeof user_id == 'undefined') {
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
			}
		
		// if we have a local id, it's straightforward, but we could be handling an unfollow
		else {
	
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
   ·   Select a stream when the logged in user clicks their own queets, followers etc 
   · 
   · · · · · · · · · · · · · */ 

$('#user-header, #user-queets, #user-following, #user-followers, #user-groups').on('click',function(e){

	// not if we're clicking the mini-edit-profile-button
	if($(e.target).is('#mini-edit-profile-button')) {
		return;
		}
		
	if($(this).attr('id') == 'user-header' || $(this).attr('id') == 'user-queets') {
		setNewCurrentStream('statuses/user_timeline.json?screen_name=' + window.loggedIn.screen_name,function(){},true);	
		}
	else if($(this).attr('id') == 'user-following') {
		setNewCurrentStream('statuses/friends.json?count=20',function(){},true);	
		}
	else if($(this).attr('id') == 'user-followers') {
		setNewCurrentStream('statuses/followers.json?count=20',function(){},true);			
		}	
	else if($(this).attr('id') == 'user-groups') {
		setNewCurrentStream('statusnet/groups/list.json?count=10',function(){},true);			
		}				
	});


/* · 
   · 
   ·   Select a stream when clicking on queets, followers etc in a profile card or feed header
   · 
   · · · · · · · · · · · · · */ 
	
$('body').on('click','.profile-banner-footer .stats li a, .queet-stream',function(){
	var screenName = $('.profile-card-inner .screen-name').html().substring(1);	
	if($(this).hasClass('tweet-stats')) {
		setNewCurrentStream('statuses/user_timeline.json?screen_name=' + screenName,function(){},true);	
		}
	else if($(this).hasClass('following-stats')) {
		setNewCurrentStream('statuses/friends.json?count=20&screen_name=' + screenName,function(){},true);	
		}
	else if($(this).hasClass('follower-stats')) {
		setNewCurrentStream('statuses/followers.json?count=20&screen_name=' + screenName,function(){},true);			
		}
	else if($(this).hasClass('groups-stats')) {
		setNewCurrentStream('statusnet/groups/list.json?count=10&screen_name=' + screenName,function(){},true);			
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
	else if($(this).hasClass('following')) {
		setNewCurrentStream('statuses/friends.json?count=20',function(){},true);	
		}		
	else if($(this).hasClass('followers')) {
		setNewCurrentStream('statuses/followers.json?count=20',function(){},true);
		}		
	else if($(this).hasClass('member-stats')) {
		setNewCurrentStream('statusnet/groups/membership/' + screenName + '.json?count=20',function(){},true);			
		}
	else if($(this).hasClass('admin-stats')) {
		setNewCurrentStream('statusnet/groups/admins/' + screenName + '.json?count=20',function(){},true);			
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
	streamName = 'search.json?q=' + encodeURIComponent(replaceHtmlSpecialChars($('#search-query').val()));
	setNewCurrentStream(streamName,function(){},true);			
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
		
	// don't hijack if this is an external link that has been clicked but failed that time
	if($(this).hasClass('external-profile-clicked')) {
		return;
		}
		
	// don't hijack if this is an anchor link in the faq
	if($(this).closest('.modal-container').attr('id') == 'popup-faq' && $(this).attr('href').indexOf('#') > -1) {
		return;
		}

	// don't hijack and don't follow link if this is the x remove users from history, prevent link but don't set a new currentstream
	if($(e.target).is('i.chev-right')) {
		e.preventDefault();		
		return;
		}	

	// don't hijack links with donthijack attribute
	if(!!$(this).attr('donthijack') || $(this).attr('donthijack') == '') {
		return;		
		}

	// if we're clicking something in a profile card popup, close it!
	if($(this).closest('#popup-local-profile, #popup-external-profile').length>0) {
		$('.modal-container').remove();		
		}
		
	// all links opens in new tab
	$(this).attr('target','_blank'); 

	if(typeof $(this).attr('href') != 'undefined') {

		// site root
		if($(this).attr('href').replace('http://','').replace('https://','').replace(window.siteRootDomain,'') == '/') {
			e.preventDefault();
			setNewCurrentStream('statuses/public_timeline.json',function(){},true);	
			}
		// whole network feed
		else if($(this).attr('href').replace('http://','').replace('https://','').replace(window.siteRootDomain,'') == '/main/all') {
			e.preventDefault();
			setNewCurrentStream('statuses/public_and_external_timeline.json',function(){},true);	
			}			
		// logged in users streams
		else if ($(this).attr('href').replace('http://','').replace('https://','').replace(window.siteRootDomain + '/' + window.loggedIn.screen_name,'') == '/all') {
			e.preventDefault();			
			setNewCurrentStream('statuses/friends_timeline.json',function(){},true);	
			}
		else if ($(this).attr('href').replace('http://','').replace('https://','').replace(window.siteRootDomain + '/' + window.loggedIn.screen_name,'') == '/replies') {
			e.preventDefault();			
			setNewCurrentStream('statuses/mentions.json',function(){},true);				
			}					
		else if ($(this).attr('href').replace('http://','').replace('https://','').replace(window.siteRootDomain + '/' + window.loggedIn.screen_name,'') == '/notifications') {
			e.preventDefault();			
			setNewCurrentStream('qvitter/statuses/notifications.json',function(){},true);				
			}								
		else if ($(this).attr('href').replace('http://','').replace('https://','').replace(window.siteRootDomain + '/' + window.loggedIn.screen_name,'') == '/favorites') {
			e.preventDefault();			
			setNewCurrentStream('favorites.json',function(){},true);				
			}			
		// profiles
		else if ((/^[a-zA-Z0-9]+$/.test($(this).attr('href').replace('http://','').replace('https://','').replace(window.siteRootDomain + '/','')))
		|| (/^[0-9]+$/.test($(this).attr('href').replace('http://','').replace('https://','').replace(window.siteRootDomain + '/user/','')))) {
			
			if($(this).attr('href').indexOf('/user/') > -1) {
				var linkNickname = $(this).text().toLowerCase();
				if(linkNickname.substring(0,1) == '@') {
					linkNickname = linkNickname.substring(1);
					}
				}
			else {
				var linkNickname = $(this).attr('href').replace('http://','').replace('https://','').replace(window.siteRootDomain + '/','');				
				}
			
			// don't hijack /groups-url
			if(linkNickname == 'groups') {
				return;
				}
			
			e.preventDefault();

			// logged in user
			if($(this).parent().attr('id') == 'user-profile-link'
			|| linkNickname == window.loggedIn.screen_name) {
				setNewCurrentStream('statuses/user_timeline.json?screen_name=' + window.loggedIn.screen_name,function(){},true);	
				}
			// when in local profile popups
			else if($(this).closest('#popup-local-profile').length>0) {
				setNewCurrentStream('statuses/user_timeline.json?screen_name=' + linkNickname,function(){},true);												
				}
			// any local user, not in popups –> open popup
			else { 

				$(this).addClass('local-profile-clicked');
			
				popUpAction('popup-local-profile', '','<div id="popup-local-profile-spinner" style="height:300px;"></div>',false);			
				display_spinner('#popup-local-profile-spinner');
			
				var cachedUserArray = userArrayCacheGetByProfileUrlAndNickname($(this).attr('href'), linkNickname);

				if(cachedUserArray && cachedUserArray.local) {
					openLocalProfileInPopup(cachedUserArray.local);
					remove_spinner();			
					$('.local-profile-clicked').removeClass('local-profile-clicked');		
					}
			
				// but always query the server also
				getFromAPI('users/show.json?id=' + linkNickname,function(data){
					if(data) {
						// update the popup if it's still open
						if($('#popup-local-profile').length>0) {
							openLocalProfileInPopup(data);					
							remove_spinner();	
							$('.local-profile-clicked').removeClass('local-profile-clicked');												
							}
						}				
					});	
				}			
			}
		// tags
		else if ($(this).attr('href').indexOf(window.siteRootDomain + '/tag/')>-1) {
			e.preventDefault();
			setNewCurrentStream('statusnet/tags/timeline/' + $(this).text().toLowerCase().replace('#','') + '.json',function(){},true);				
			}	
		// notices
		else if ($(this).attr('href').indexOf(window.siteRootDomain + '/notice/')>-1 && $(this).attr('href').indexOf(window.siteRootDomain + '/notice/delete/')==-1) {
			e.preventDefault();
			setNewCurrentStream('statuses/show/' + $(this).attr('href').replace('http://','').replace('https://','').replace(window.siteRootDomain + '/notice/','') + '.json',function(){},true);				
			}	
		// groups
		else if (/^[0-9]+$/.test($(this).attr('href').replace('http://','').replace('https://','').replace(window.siteRootDomain + '/group/','').replace('/id',''))) {
			e.preventDefault();
			if($(this).hasClass('account-group')) {
				var groupName = $(this).find('.screen-name').html().substring(1);
				}
			else {
				var groupName = $(this).text().toLowerCase();
				if(groupName.substring(0,1) == '!') {
					groupName = groupName.substring(1);
					}
				}
			setNewCurrentStream('statusnet/groups/timeline/' + groupName + '.json',function(){},true);				
			}	
		else if ($(this).attr('href').indexOf(window.siteRootDomain + '/group/')>-1) {
			e.preventDefault();
			setNewCurrentStream('statusnet/groups/timeline/' + $(this).attr('href').replace('http://','').replace('https://','').replace(window.siteRootDomain + '/group/','') + '.json',function(){},true);				
			}		
		// search 
		else if ($(this).attr('href').indexOf('/search/notice?q=')>-1) {
			e.preventDefault();
			var searchToStream = $(this).attr('href').replace('http://','').replace('https://','').replace(window.siteRootDomain,'').replace('/search/notice?q=','');
			setNewCurrentStream('search.json?q=' + searchToStream,function(){},true);		
			}
		
		// profile picture
		else if ($(this).hasClass('profile-picture')) {
			e.preventDefault();
				if($(this).closest('.modal-container').attr('id') != 'edit-profile-popup') { // no popup if we're editing our profile
					popUpAction('popup-profile-picture', $('.profile-card-inner .screen-name').html(),'<img style="width:100%;display:block;" src="' + $(this).attr('href') + '" />',false);					
					}
			}

		// external profiles 
		else if (($(this).children('span.mention').length>0 // if it's a mention
				 || $(this).hasClass('h-card mention') // if it's a newer gnusocial group mention		
				 || ($(this).hasClass('account-group') && $(this).attr('href').indexOf('/group/')==-1) // or if this is queet stream item header but not a group
		         || ($(this).closest('.stream-item').hasClass('activity') && $(this).attr('href').indexOf('/group/')==-1)) // or if it's a activity notice but not a group link
		         && typeof window.loggedIn.screen_name != 'undefined') { // if logged in
			e.preventDefault();
			$(this).addClass('external-profile-clicked');
			
			popUpAction('popup-external-profile', '','<div id="popup-external-profile-spinner" style="height:300px;"></div>',false);			
			display_spinner('#popup-external-profile-spinner');
			
			// try getting from cache, to display immediately
			if($(this).hasClass('account-group')) {
				var externalNickname = $(this).children('.screen-name').text();
				}
			else {
				var externalNickname = $(this).text();
				}
			if(externalNickname.substring(0,1) == '@') {
				externalNickname = externalNickname.substring(1);
				}
			var cachedUserArray = userArrayCacheGetByProfileUrlAndNickname($(this).attr('href'), externalNickname);

			if(cachedUserArray && cachedUserArray.external) {
				openExternalProfileInPopup(cachedUserArray);
				remove_spinner();			
				$('.external-profile-clicked').removeClass('external-profile-clicked');		
				}
			
			// but always query the server also
			getFromAPI('qvitter/external_user_show.json?profileurl=' + encodeURIComponent($(this).attr('href')),function(data){

				if(data && data.external !== null) {
					
					// update the popup if it's still open
					if($('#popup-external-profile').length>0) {					
						openExternalProfileInPopup(data);					
						remove_spinner();	
						}
						
					$('.external-profile-clicked').removeClass('external-profile-clicked');						
					}
				// if external lookup failed, and we don't have a cached profile card, trigger click again. 
				// it will not be hijacked since we don't remove the external-profile-clicked class here 
				else if($('#popup-external-profile-spinner').length > 0){
					$('.modal-container').remove();
					$('.external-profile-clicked')[0].click();
					$('.external-profile-clicked').removeClass('external-profile-clicked');
					}
				
				});				
			}

		// external groups
		else if (($(this).children('span.group').length>0 // if it's a group mention
				 || $(this).hasClass('h-card group') // if it's a newer gnusocial group mention
				 || ($(this).hasClass('account-group') && $(this).attr('href').indexOf('/group/')>-1) // or if this is group stream item header
		         || ($(this).closest('.stream-item').hasClass('activity') && $(this).attr('href').indexOf('/group/')>-1)) // or if it's a activity notice
		         && typeof window.loggedIn.screen_name != 'undefined') { // if logged in
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
					var profileCard = '<div class="profile-card"><div class="profile-header-inner" style="background-image:url(' + data.original_logo + ')"><div class="profile-header-inner-overlay"></div><a class="profile-picture"><img src="' + data.homepage_logo + '" /></a><div class="profile-card-inner"><h1 class="fullname">' + data.fullname + '<span></span></h1><h2 class="username"><span class="screen-name"><a target="_blank" href="' + groupRoot + '/group/' + data.nickname + '">!' + data.nickname + '@' + groupServer + '</a></span></span></h2><div class="bio-container"><p>' + data.description + '</p></div><p class="location-and-url"></span><span class="url"><a href="' + data.homepage + '">' + data.homepage.replace('http://','').replace('https://','') + '</a></span></p></div></div><div class="profile-banner-footer"><ul class="stats"><li><a target="_blank" href="' + groupRoot + '/group/' + data.nickname + '/members" class="member-stats">' + avatars + '</a></li></ul>' + memberButton + '<div class="clearfix"></div></div></div>';		
					popUpAction('popup-external-group-profile', '!' + data.nickname + '@' + groupServer,profileCard,false);				
					remove_spinner();																	
					}});				
				}});								
			}							
		}						
	});		
	

/* · 
   · 
   ·   Open a queet menu when clicking ellipsis button
   ·   
   · · · · · · · · · · · · · */ 
   
$('body').on('click','.sm-ellipsis',function(){
	// hide
	if($(this).closest('.action-ellipsis-container').children('.dropdown-menu').length > 0) {
		$(this).closest('.action-ellipsis-container').children('.dropdown-menu').remove();
		}
	// show
	else {
		$('.action-ellipsis-container').children('.dropdown-menu').remove(); // remove menu from other queets
		var streamItemUsername = $(this).closest('.queet').find('.stream-item-header').find('.screen-name').text();
		var streamItemUserID = $(this).closest('.queet').find('.stream-item-header').find('.name').attr('data-user-id');		
		var streamItemID = $(this).closest('.queet').parent('.stream-item').attr('data-quitter-id');				
		
		var blockHtml = '';
		var deleteHtml = '';		
		if(streamItemUserID != window.loggedIn.id) {
			blockHtml = '<li><a class="block-user" href="' + window.siteInstanceURL + 'main/block?profileid=' + streamItemUserID + '">' + window.sL.blockUser.replace('{username}',streamItemUsername) + '</a></li>';
			}
		else {
			deleteHtml = '<li><a class="delete-queet" href="' + window.siteInstanceURL + 'notice/delete/' + streamItemID + '">' + window.sL.deleteVerb + '</a></li>';
			}
		
		
		$(this).closest('.action-ellipsis-container').append('\
			<ul class="dropdown-menu">\
				<li class="dropdown-caret left"><span class="caret-outer"></span><span class="caret-inner"></span></li>\
				' + blockHtml + '\
				' + deleteHtml + '\
			</ul>\
			');		
		}
	});





/* · 
   · 
   ·   When user clicks the x to remove a menu history item
   ·   
   · · · · · · · · · · · · · */ 
   
$('body').on('click','#history-container .chev-right',function(event){
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
		
		// not if we're already loading or if no stream is set yet
		if(!$('body').hasClass('loading-older') && typeof window.currentStream != "undefined") {
			$('body').addClass('loading-older');
			
			// remove loading class in 10 seconds, i.e. try again if failed to load within 10 s			
			if(window.currentStream.substring(0,6) != 'search') {				
				setTimeout(function(){$('body').removeClass('loading-older');},10000); 
				}

			var lastStreamItemId = $('#feed-body').children('.stream-item').last().attr('id');			
			
			// if this is search or users lists, we need page and rpp vars, we store page number in an attribute
			if(window.currentStream.substring(0,6) == 'search'
			|| window.currentStream.substring(0,23) == 'statuses/followers.json'
			|| window.currentStream.substring(0,21) == 'statuses/friends.json'				
			|| window.currentStream.substring(0,26) == 'statusnet/groups/list.json'
			|| window.currentStream.substring(0,28) == 'statusnet/groups/membership/'
			|| window.currentStream.substring(0,24) == 'statusnet/groups/admins/') {
				if(typeof $('#feed-body').attr('data-search-page-number') != 'undefined') {
					var searchPage = parseInt($('#feed-body').attr('data-search-page-number'),10);
					}
				else {
					var searchPage=2;
					}
				var nextPage = searchPage+1;
				var getVars = qOrAmp(window.currentStream) + 'rpp=20&page=' + searchPage; // search uses 'rrp' var and others 'count' for paging, though we can add rrp to others aswell without any problem					
				}
			// normal streams
			else {
				var getVars = qOrAmp(window.currentStream) + 'max_id=' + ($('#feed-body').children('.stream-item').last().attr('data-quitter-id-in-stream'));
				}
			
			display_spinner('#footer-spinner-container');		
			getFromAPI(window.currentStream + getVars,function(data){
				if(data) {
					addToFeed(data, lastStreamItemId,'visible');			
					$('body').removeClass('loading-older');
				
					// if this is search our group users lists, we remember page number
					if(window.currentStream.substring(0,6) == 'search'
					|| window.currentStream.substring(0,23) == 'statuses/followers.json'
					|| window.currentStream.substring(0,21) == 'statuses/friends.json'		
					|| window.currentStream.substring(0,26) == 'statusnet/groups/list.json'								
					|| window.currentStream.substring(0,28) == 'statusnet/groups/membership/'
					|| window.currentStream.substring(0,24) == 'statusnet/groups/admins/') {
						$('#feed-body').attr('data-search-page-number',nextPage);
						}
				
					remove_spinner();	
					}
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
			var timeNow = new Date().getTime();
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

			// if this is notifications page, update site title with hidden notification count
			if(window.currentStream == 'qvitter/statuses/notifications.json') { 
				document.title = window.siteTitle + ' (' + new_queets_num + ')';
				}						

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

$('body').on('click','#new-queets-bar',function(){
	if(window.currentStream == 'qvitter/statuses/notifications.json') {
		document.title = window.siteTitle;		
		}
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

$('body').on('click','.queet',function (event) {
	if(!$(event.target).is('a')
		&& !$(event.target).is('video')
		&& !$(event.target).is('.cm-mention')
		&& !$(event.target).is('.cm-tag')
		&& !$(event.target).is('.cm-group')
		&& !$(event.target).is('.cm-url')						
		&& !$(event.target).is('pre')
		&& !$(event.target).is('img')		
		&& !$(event.target).is('.name')
		&& !$(event.target).is('.queet-box')
		&& !$(event.target).is('.syntax-two')						
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
		&& !$(event.target).is('.action-ellipsis-container a span')
		&& !$(event.target).is('.action-ellipsis-container a b')							
		&& !$(event.target).is('span.group')		
		&& !$(event.target).is('.longdate')			
		&& !$(event.target).is('.screen-name')
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
	
		if(!parentStreamItem.hasClass('conversation')) {
			$parentStreamItemClone.find('.stream-item.conversation').remove();			
			}
	
		var $queetThumbsClone = $('<div/>').append($parentStreamItemClone.find('.queet-thumbs').outerHTML());	
	
		$parentStreamItemClone.find('.queet-thumbs, .expanded-content, .inline-reply-queetbox, .stream-item-footer').remove();
		var footerHTML = $parentStreamItemClone.find('.queet').outerHTML();
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
			popUpAction('queet-thumb-popup', '', '' + $queetThumbsClone.outerHTML() + '', footerHTML, calculatedDimensions.popUpWidth);
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
   ·   Collapse all open conversations, ellipsis menus and the welcome text on esc or when clicking the margin  
   ·   
   · · · · · · · · · · · · · */ 

$('body').click(function(event){	
	if($(event.target).is('body')) {
		$('.action-ellipsis-container').children('.dropdown-menu').remove();
		$('.front-welcome-text.expanded > .show-full-welcome-text').trigger('click');
		$.each($('.stream-item.expanded'),function(){
			expand_queet($(this), false);
			});
		}	
	});

$(document).keyup(function(e){
	if(e.keyCode==27) { // esc
		$('.action-ellipsis-container').children('.dropdown-menu').remove();
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

$('body').on('click','.action-ellipsis-container .delete-queet',function(e){
	e.preventDefault();	
	var this_stream_item = $(this).closest('.stream-item');	

	// don't do anything if this is a queet being posted 
	if(this_stream_item.hasClass('temp-post')) {
		return;
		}

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

$('body').on('click','.action-rt-container .icon:not(.is-mine)',function(){
	var this_stream_item = $(this).closest('.stream-item');
	var this_action = $(this).closest('li'); 
	
	// requeet
	if(!this_action.children('.with-icn').hasClass('done')) {	
		this_action.children('.with-icn').addClass('done');
		this_stream_item.addClass('requeeted');				
		
		// requeet animation
		this_action.children('.with-icn').children('.sm-rt').addClass('rotate');				

		// post requeet
		postActionToAPI('statuses/retweet/' + this_stream_item.attr('data-quitter-id') + '.json', function(data) {
			if(data) {
				// success
				this_stream_item.attr('data-requeeted-by-me-id',data.id);
				getFavsAndRequeetsForQueet(this_stream_item, this_stream_item.attr('data-quitter-id'));	
				
				// mark all instances of this notice as repeated
				$('.stream-item[data-quitter-id="' + this_stream_item.attr('data-quitter-id') + '"]').addClass('requeeted');
				$('.stream-item[data-quitter-id="' + this_stream_item.attr('data-quitter-id') + '"]').attr('data-requeeted-by-me-id',data.id);				
				$('.stream-item[data-quitter-id="' + this_stream_item.attr('data-quitter-id') + '"]').children('.queet').find('.action-rt-container').children('.with-icn').addClass('done');
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
		
		var my_rq_id = this_stream_item.attr('data-requeeted-by-me-id');
		unRequeet(this_stream_item, this_action, my_rq_id);
		
		// mark all instances of this notice as non-repeated
		$('.stream-item[data-quitter-id="' + this_stream_item.attr('data-quitter-id') + '"]').removeClass('requeeted');
		$('.stream-item[data-quitter-id="' + this_stream_item.attr('data-quitter-id') + '"]').removeAttr('data-requeeted-by-me-id');				
		$('.stream-item[data-quitter-id="' + this_stream_item.attr('data-quitter-id') + '"]').children('.queet').find('.action-rt-container').children('.with-icn').removeClass('done');		
		}			
	});
	


/* · 
   · 
   ·   When clicking the fav-button
   ·   
   · · · · · · · · · · · · · */ 

$('body').on('click','.action-fav-container',function(){
	var this_stream_item = $(this).parent().parent().parent().parent().parent();

	// don't do anything if this is a queet being posted 
	if(this_stream_item.hasClass('temp-post')) {
		return;
		}

	var this_action = $(this); 

	// fav
	if(!this_action.children('.with-icn').hasClass('done')) {	

		this_action.children('.with-icn').addClass('done');
		this_stream_item.addClass('favorited');						

		// fav animation
		this_action.children('.with-icn').children('.sm-fav').addClass('pulse');

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
		display_spinner();	
		this_action.children('.with-icn').removeClass('done');
		this_action.find('.with-icn b').html(window.sL.favoriteVerb);		
		this_stream_item.removeClass('favorited');						

		// post unfav
		postActionToAPI('favorites/destroy/' + this_stream_item.attr('data-quitter-id') + '.json', function(data) {
			if(data) {
				// success
				remove_spinner();
				getFavsAndRequeetsForQueet(this_stream_item, this_stream_item.attr('data-quitter-id'));				

				// mark all instances of this notice as non-favorited
				$('.stream-item[data-quitter-id="' + this_stream_item.attr('data-quitter-id') + '"]').removeClass('favorited');
				$('.stream-item[data-quitter-id="' + this_stream_item.attr('data-quitter-id') + '"]').children('.queet').find('.action-fav-container').children('.with-icn').removeClass('done');								
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

$('body').on('click','.action-reply-container',function(){
	
	var this_stream_item = $(this).closest('.stream-item');

	// don't do anything if this is a queet being posted 
	if(this_stream_item.hasClass('temp-post')) {
		return;
		}
		
	var this_stream_item_id = this_stream_item.attr('data-quitter-id');
	this_stream_item.addClass('replying-to');

	// grabbing the queet and view it in the popup, stripped of footer, reply box and other sruff
	var $queetHtml = $('<div>').append(this_stream_item.children('.queet').outerHTML());
	var $queetHtmlFooter = $queetHtml.find('.stream-item-footer');
	$queetHtmlFooter.remove();
	var $queetHtmlQueetBox = $queetHtml.find('.inline-reply-queetbox');
	$queetHtmlQueetBox.remove();
	var $queetHtmlExpandedContent = $queetHtml.find('.expanded-content');
	$queetHtmlExpandedContent.remove();		
	var queetHtmlWithoutFooter = $queetHtml.html();
	popUpAction('popup-reply-' + this_stream_item_id, window.sL.replyTo + ' ' + this_stream_item.children('.queet').find('.screen-name').html(),replyFormHtml(this_stream_item,this_stream_item_id),queetHtmlWithoutFooter);

	// fix the width of the queet box, otherwise the syntax highlighting break
	var queetBoxWidth = $('#popup-reply-' + this_stream_item_id).find('.modal-body').find('.inline-reply-queetbox').width()-20;
	$('#popup-reply-' + this_stream_item_id).find('.modal-body').find('.queet-box-syntax').width(queetBoxWidth);
	$('#popup-reply-' + this_stream_item_id).find('.modal-body').find('.syntax-middle').width(queetBoxWidth);	
	$('#popup-reply-' + this_stream_item_id).find('.modal-body').find('.syntax-two').width(queetBoxWidth);		

	$('#popup-reply-' + this_stream_item_id).find('.modal-body').find('.queet-box').trigger('click'); // expand
	});
	

/* · 
   · 
   ·   When clicking the compose button
   ·   
   · · · · · · · · · · · · · */ 

$('body').on('click','#top-compose',function(){
	popUpAction('popup-compose', window.sL.compose,queetBoxHtml(),false);
	$('#popup-compose').find('.queet-box').width($('#popup-compose').find('.inline-reply-queetbox').width()-20);
	$('#popup-compose').find('.queet-box').trigger('click');
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
		var queetHtml = '<div id="' + tempPostId + '" class="stream-item conversation temp-post" style="opacity:1"><div class="queet"><span class="dogear"></span><div class="queet-content"><div class="stream-item-header"><a class="account-group"><img class="avatar" src="' + $('#user-avatar').attr('src') + '" /><strong class="name">' + $('#user-name').html() + '</strong> <span class="screen-name">@' + $('#user-screen-name').html() + '</span></a><small class="created-at">posting</small></div><div class="queet-text">' + queetTempText + '</div><div class="stream-item-footer"><ul class="queet-actions"><li class="action-reply-container"><a class="with-icn"><span class="icon sm-reply" title="' + window.sL.replyVerb + '"></span></a></li><li class="action-del-container"><a class="with-icn"><span class="icon sm-trash" title="' + window.sL.deleteVerb + '"></span></a></li></i></li><li class="action-fav-container"><a class="with-icn"><span class="icon sm-fav" title="' + window.sL.favoriteVerb + '"></span></a></li></ul></div></div></div></div>';
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
			
		// if the queet is in conversation, add it to parent's conversation		
		if($('.stream-item.replying-to').length > 0 && $('.stream-item.replying-to').hasClass('conversation')) {
			$('.stream-item.replying-to').parent().append(queetHtml);				
			}
		// if the queet is expanded, add it to its conversation
		else if($('.stream-item.replying-to').length > 0 && $('.stream-item.replying-to').hasClass('expanded')) {
			$('.stream-item.replying-to').append(queetHtml);			
			}
		// maybe the replying-to class is missing but we still have a suiting place to add it
		else if($('.stream-item.expanded[data-quitter-id="' + in_reply_to_status_id + '"]').length > 0) {
			$('.stream-item.expanded[data-quitter-id="' + in_reply_to_status_id + '"]').append(queetHtml);
			}
		// if we can't find a proper place, add it to top and remove conversation class
		// if this is either 1) our home/all feed, 2) our user timeline or 3) whole site or 4) whole network		
		else if(window.currentStream.indexOf('statuses/friends_timeline.json') > -1 
		|| window.currentStream.indexOf('statuses/user_timeline.json?screen_name=' + window.loggedIn.screen_name) > -1 						
		|| window.currentStream.indexOf('statuses/public_timeline.json') > -1 
		|| window.currentStream.indexOf('statuses/public_and_external_timeline.json') > -1 ) {
			$('#feed-body').prepend(queetHtml.replace('class="stream-item conversation','class="stream-item'));					
			}
		// don't add it to the current stream, open a popup instead, without conversation class
		else {
			popUpAction('popup-sending', '',queetHtml.replace('class="stream-item conversation','class="stream-item'),false);		
			}
		
		// remove any replying-to classes
		$('.stream-item').removeClass('replying-to');						
		
		// null reply box
		collapseQueetBox(queetBox)				
		
		// check for new queets (one second from) NOW 
		setTimeout('checkForNewQueets()', 1000);

		// post queet
		postQueetToAPI(queetText, in_reply_to_status_id, function(data){ if(data) {

			// show real queet
			var new_queet = Array();
			new_queet[0] = data;
			addToFeed(new_queet,tempPostId,'visible', true);
			
			// remove temp queet
			$('#' + tempPostId).remove();
			
			// queet count
			$('#user-queets strong').html(parseInt($('#user-queets strong').html(),10)+1);			
				
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
	$('.reload-stream').hide();
	setNewCurrentStream(window.currentStream,function(){
		$('.reload-stream').show();
		},false);	
	});	
	
	
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
			var repliesLen = decodeURIComponent($(this).attr('data-replies-text')).length-5;			
			setSelectionRange($(this)[0], repliesLen, repliesLen);	 			
			}
		else {
			$(this).html('');			
			}
		$(this).trigger('input');		
		}
	});
$('body').on('mousedown','.syntax-two',function () {
	$(this).addClass('clicked');
	});	
$('body').on('blur','.queet-box-syntax',function (e) {	
	
	// don't collapse if a toolbar button has been clicked
	var clickedToolbarButtons = $(this).siblings('.queet-toolbar').find('button.clicked');
	if(clickedToolbarButtons.length>0) {
		clickedToolbarButtons.removeClass('clicked');
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

	// regexps for syntax highlighting
	var allDomains = '(abb|abbott|abogado|ac|academy|accenture|accountant|accountants|active|actor|ad|ads|adult|ae|aero|af|afl|ag|agency|ai|aig|airforce|al|allfinanz|alsace|am|amsterdam|an|android|ao|apartments|aq|aquarelle|ar|archi|army|arpa|as|asia|associates|at|attorney|au|auction|audio|auto|autos|aw|ax|axa|az|ba|band|bank|bar|barclaycard|barclays|bargains|bauhaus|bayern|bb|bbc|bbva|bd|be|beer|berlin|best|bf|bg|bh|bi|bible|bid|bike|bingo|bio|biz|bj|bl|black|blackfriday|bloomberg|blue|bm|bmw|bn|bnpparibas|bo|boats|bond|boo|boutique|bq|br|bridgestone|broker|brother|brussels|bs|bt|budapest|build|builders|business|buzz|bv|bw|by|bz|bzh|ca|cab|cafe|cal|camera|camp|cancerresearch|canon|capetown|capital|caravan|cards|care|career|careers|cars|cartier|casa|cash|casino|cat|catering|cbn|cc|cd|center|ceo|cern|cf|cfa|cfd|cg|ch|channel|chat|cheap|chloe|christmas|chrome|church|ci|cisco|citic|city|ck|cl|claims|cleaning|click|clinic|clothing|club|cm|cn|co|coach|codes|coffee|college|cologne|com|community|company|computer|condos|construction|consulting|contractors|cooking|cool|coop|corsica|country|coupons|courses|cr|credit|creditcard|cricket|crs|cruises|cu|cuisinella|cv|cw|cx|cy|cymru|cyou|cz|dabur|dad|dance|date|dating|datsun|day|dclk|de|deals|degree|delivery|democrat|dental|dentist|desi|design|dev|diamonds|diet|digital|direct|directory|discount|dj|dk|dm|dnp|do|docs|dog|doha|domains|doosan|download|durban|dvag|dz|earth|eat|ec|edu|education|ee|eg|eh|email|emerck|energy|engineer|engineering|enterprises|epson|equipment|er|erni|es|esq|estate|et|eu|eurovision|eus|events|everbank|exchange|expert|exposed|express|fail|faith|fan|fans|farm|fashion|feedback|fi|film|finance|financial|firmdale|fish|fishing|fit|fitness|fj|fk|flights|florist|flowers|flsmidth|fly|fm|fo|foo|football|forex|forsale|foundation|fr|frl|frogans|fund|furniture|futbol|fyi|ga|gal|gallery|garden|gb|gbiz|gd|gdn|ge|gent|gf|gg|ggee|gh|gi|gift|gifts|gives|gl|glass|gle|global|globo|gm|gmail|gmo|gmx|gn|gold|goldpoint|golf|goo|goog|google|gop|gov|gp|gq|gr|graphics|gratis|green|gripe|gs|gt|gu|guge|guide|guitars|guru|gw|gy|hamburg|hangout|haus|healthcare|help|here|hermes|hiphop|hitachi|hiv|hk|hm|hn|hockey|holdings|holiday|homedepot|homes|honda|horse|host|hosting|house|how|hr|ht|hu|ibm|icbc|icu|id|ie|ifm|il|im|immo|immobilien|in|industries|infiniti|info|ing|ink|institute|insure|int|international|investments|io|iq|ir|irish|is|it|iwc|java|jcb|je|jetzt|jewelry|jll|jm|jo|jobs|joburg|jp|juegos|kaufen|kddi|ke|kg|kh|ki|kim|kitchen|kiwi|km|kn|koeln|komatsu|kp|kr|krd|kred|kw|ky|kyoto|kz|la|lacaixa|land|lat|latrobe|lawyer|lb|lc|lds|lease|leclerc|legal|lgbt|li|liaison|lidl|life|lighting|limited|limo|link|lk|loan|loans|lol|london|lotte|lotto|love|lr|ls|lt|ltda|lu|lupin|luxe|luxury|lv|ly|ma|madrid|maif|maison|management|mango|market|marketing|markets|marriott|mba|mc|md|me|media|meet|melbourne|meme|memorial|men|menu|mf|mg|mh|miami|mil|mini|mk|ml|mm|mma|mn|mo|mobi|moda|moe|monash|money|montblanc|mormon|mortgage|moscow|motorcycles|mov|movie|mp|mq|mr|ms|mt|mtn|mtpc|mu|museum|mv|mw|mx|my|mz|na|nadex|nagoya|name|navy|nc|ne|nec|net|network|neustar|new|news|nexus|nf|ng|ngo|nhk|ni|nico|ninja|nissan|nl|no|np|nr|nra|nrw|ntt|nu|nyc|nz|okinawa|om|one|ong|onl|online|ooo|org|organic|osaka|otsuka|ovh|pa|page|panerai|paris|partners|parts|party|pe|pf|pg|ph|pharmacy|philips|photo|photography|photos|physio|piaget|pics|pictet|pictures|pink|pizza|pk|pl|place|plumbing|plus|pm|pn|pohl|poker|porn|post|pr|praxi|press|pro|prod|productions|prof|properties|property|ps|pt|pub|pw|py|qa|qpon|quebec|racing|re|realtor|recipes|red|redstone|rehab|reise|reisen|reit|ren|rent|rentals|repair|report|republican|rest|restaurant|review|reviews|rich|rio|rip|ro|rocks|rodeo|rs|rsvp|ru|ruhr|run|rw|ryukyu|sa|saarland|sale|samsung|sandvik|sandvikcoromant|sap|sarl|saxo|sb|sc|sca|scb|schmidt|scholarships|school|schule|schwarz|science|scot|sd|se|seat|sener|services|sew|sex|sexy|sg|sh|shiksha|shoes|show|shriram|si|singles|site|sj|sk|ski|sky|sl|sm|sn|sncf|so|soccer|social|software|sohu|solar|solutions|sony|soy|space|spiegel|spreadbetting|sr|ss|st|study|style|su|sucks|supplies|supply|support|surf|surgery|suzuki|sv|swiss|sx|sy|sydney|systems|sz|taipei|tatar|tattoo|tax|taxi|tc|td|team|tech|technology|tel|temasek|tennis|tf|tg|th|thd|theater|tickets|tienda|tips|tires|tirol|tj|tk|tl|tm|tn|to|today|tokyo|tools|top|toray|toshiba|tours|town|toys|tp|tr|trade|trading|training|travel|trust|tt|tui|tv|tw|tz|ua|ug|uk|um|university|uno|uol|us|uy|uz|va|vacations|vc|ve|vegas|ventures|versicherung|vet|vg|vi|viajes|video|villas|vision|vlaanderen|vn|vodka|vote|voting|voto|voyage|vu|wales|walter|wang|watch|webcam|website|wed|wedding|weir|wf|whoswho|wien|wiki|williamhill|win|wme|work|works|world|ws|wtc|wtf|xbox|xerox|xin|测试|परीक्षा|佛山|慈善|集团|在线|한국|ভারত|八卦|موقع|বাংলা|公益|公司|移动|我爱你|москва|испытание|қаз|онлайн|сайт|срб|бел|时尚|테스트|淡马锡|орг|삼성|சிங்கப்பூர்|商标|商店|商城|дети|мкд|טעסט|工行|中文网|中信|中国|中國|娱乐|谷歌|భారత్|ලංකා|測試|ભારત|भारत|آزمایشی|பரிட்சை|网店|संगठन|餐厅|网络|укр|香港|δοκιμή|飞利浦|إختبار|台湾|台灣|手机|мон|الجزائر|عمان|ایران|امارات|بازار|پاکستان|الاردن|بھارت|المغرب|السعودية|سودان|عراق|مليسيا|澳門|政府|شبكة|გე|机构|组织机构|健康|ไทย|سورية|рус|рф|تونس|みんな|グーグル|ελ|世界|ਭਾਰਤ|网址|游戏|vermögensberater|vermögensberatung|企业|信息|مصر|قطر|广东|இலங்கை|இந்தியா|հայ|新加坡|فلسطين|テスト|政务|xxx|xyz|yachts|yandex|ye|yodobashi|yoga|yokohama|youtube|yt|za|zip|zm|zone|zuerich|zw|oracle|xn--1qqw23a|xn--30rr7y|xn--3bst00m|xn--3ds443g|xn--3e0b707e|xn--45brj9c|xn--45q11c|xn--4gbrim|xn--55qw42g|xn--55qx5d|xn--6frz82g|xn--6qq986b3xl|xn--80adxhks|xn--80ao21a|xn--80asehdb|xn--80aswg|xn--90a3ac|xn--90ais|xn--9et52u|xn--b4w605ferd|xn--c1avg|xn--cg4bki|xn--clchc0ea0b2g2a9gcd|xn--czr694b|xn--czrs0t|xn--czru2d|xn--d1acj3b|xn--d1alf|xn--estv75g|xn--fiq228c5hs|xn--fiq64b|xn--fiqs8s|xn--fiqz9s|xn--fjq720a|xn--flw351e|xn--fpcrj9c3d|xn--fzc2c9e2c|xn--gecrj9c|xn--h2brj9c|xn--hxt814e|xn--i1b6b1a6a2e|xn--imr513n|xn--io0a7i|xn--j1amh|xn--j6w193g|xn--kcrx77d1x4a|xn--kprw13d|xn--kpry57d|xn--kput3i|xn--l1acc|xn--lgbbat1ad8j|xn--mgb9awbf|xn--mgba3a4f16a|xn--mgbaam7a8h|xn--mgbab2bd|xn--mgbayh7gpa|xn--mgbbh1a71e|xn--mgbc0a9azcg|xn--mgberp4a5d4ar|xn--mgbpl2fh|xn--mgbx4cd0ab|xn--mxtq1m|xn--ngbc5azd|xn--node|xn--nqv7f|xn--nqv7fs00ema|xn--nyqy26a|xn--o3cw4h|xn--ogbpf8fl|xn--p1acf|xn--p1ai|xn--pgbs0dh|xn--q9jyb4c|xn--qcka1pmc|xn--rhqv96g|xn--s9brj9c|xn--ses554g|xn--unup4y|xn--vermgensberater-ctb|xn--vermgensberatung-pwb|xn--vhquv|xn--vuq861b|xn--wgbh1c|xn--wgbl6a|xn--xhq521b|xn--xkc2al3hye2a|xn--xkc2dl3a5ee0h|xn--y9a3aq|xn--yfro4i67o|xn--ygbi2ammx|xn--zfr164b)';
	var regexps = Object();
	regexps.externalMention = XRegExp.cache('(^|\\s|\\.|<br>)(@)[a-zA-Z0-9]+(@)[\\p{L}\\p{N}\\-\\.]+(\\.)(' + allDomains + ')($|\\s|\\.|\\,|\\:|\\-|\\<|\\!|\\?|\\&)');		
	regexps.mention = /(^|\s|\.|<br>)(@)[a-zA-Z0-9]+($|\s|\.|\,|\:|\-|\<|\!|\?|\&)/;				
	regexps.tag = XRegExp.cache('(^|\\s|\\.|<br>)(\\#)[\\p{L}\\p{N}\\-\\.]+($|\\s|\\.|\\,|\\:|\\-|\\<|\\!|\\?|\\&)');	
	regexps.group = /(^|\s|\.|<br>)(\!)[a-zA-Z0-9]+($|\s|\.|\,|\:|\-|\<|\!|\?|\&)/;					
	regexps.url = XRegExp.cache('(^|\\s|\\.|<br>|&nbsp;)(http\\:\\/\\/|https\:\\/\\/)([\\p{L}\\p{N}\\-\\.]+)?(\\.)(' + allDomains + ')(\\/[\\p{L}\\p{N}\\%\\!\\*\\\'\\(\\)\\;\\:\\@\\&\\=\\+\\$\\,\\/\\?\\#\\[\\]\\-\\_\\.\\~]+)?(\\/)?($|\\s|\\,|\\:|\\-|\\<|\\!|\\?|\\&)');
	regexps.urlWithoutProtocol = XRegExp.cache('(^|\\s|\\.|<br>|&nbsp;)[\\p{L}\\p{N}\\-\\.]+(\\.)(' + allDomains + ')(\\/[\\p{L}\\p{N}\\%\\!\\*\\\'\\(\\)\\;\\:\\@\\&\\=\\+\\$\\,\\/\\?\\#\\[\\]\\-\\_\\.\\~]+)?(\\/)?($|\\s|\\.|\\,|\\:|\\-|\\<|\\!|\\?|\\&)');
	regexps.email = XRegExp.cache('(^|\\s|\\.|<br>)([a-zA-Z0-9\\!\\#\\$\\%\\&\\\'\\*\\+\\-\\/\\=\\?\\^\\_\\`\\{\\|\\}\\~\\.]+)?(@)[\\p{L}\\p{N}\\-\\.]+(\\.)(' + allDomains + ')($|\\s|\\.|\\,|\\:|\\-|\\<|\\!|\\?|\\&)');			

	// loop through the regexps and highlight
	$.each(regexps,function(k,v){
		while(currentVal.match(v)) {
			var currentMatch = currentVal.match(v);
			if(currentMatch[0].slice(-1) == '<'
			|| currentMatch[0].slice(-1) == '&'
			|| currentMatch[0].slice(-1) == '?'
			|| currentMatch[0].slice(-1) == '!'
			|| currentMatch[0].slice(-1) == ' '
			|| currentMatch[0].slice(-1) == '-'
			|| currentMatch[0].slice(-1) == ':'
			|| currentMatch[0].slice(-1) == '.'
			|| currentMatch[0].slice(-1) == ',') {
				currentMatch[0] = currentMatch[0].slice(0,-1);
				}
			currentVal = currentVal.replace(currentMatch[0],'<span class="' + k + '">' + currentMatch[0].replace('#','&#35;').replace('@','&#64;').replace('.','&#046;').replace('!','&#33;') + '</span>')
			}
		});
		
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
		if (e.keyCode == '13' || e.keyCode == '9') {
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
		var username = queetBox.siblings('.mentions-suggestions').children('div.selected').children('span').html();
		}
	// if none selected, take top suggestion
	else {
		var username = queetBox.siblings('.mentions-suggestions').children('div').first().children('span').html();			
		}

	// replace the halfwritten username with the one we want
	deleteBetweenCharacterIndices(queetBox[0], window.lastMention.mentionPos+1, window.lastMention.cursorPos);
	var range = createRangeFromCharacterIndices(queetBox[0], window.lastMention.mentionPos+1, window.lastMention.mentionPos+1);
	range.insertNode(document.createTextNode(username + ' '));	
	
	// put caret after
	setSelectionRange(queetBox[0], window.lastMention.mentionPos+username.length+2, window.lastMention.mentionPos+username.length+2);					
	queetBox.siblings('.mentions-suggestions').empty();
	queetBox.trigger('input'); // avoid some flickering	
	}

// check for mentions
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

				queetBox.siblings('.mentions-suggestions').empty();
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
					if(suggestionsUsernameCount[this.username]>1) {
						serverHtml = '@' + this.url;
						}
					queetBox.siblings('.mentions-suggestions').append('<div title="@' + this.username + serverHtml + '"><img height="24" width="24" src="' + this.avatar + '" /><strong>' + this.name + '</strong> @<span>' + this.username + serverHtml + '</span></div>')				
					});
				
				}
			else {
				queetBox.siblings('.mentions-suggestions').empty();
				}			

			}
		else {
			queetBox.siblings('.mentions-suggestions').empty();
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
	var this_qid = $(this).closest('.stream-item:not(.conversation)').attr('data-quitter-id');	
	var thisStreamItem = $('#stream-item-' + $(this).attr('data-stream-item-id'));

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

$('body').on('click','.edit-profile-button',function(){
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
			$.ajax({ url: window.apiRoot + 'qvitter/update_cover_photo.json', 
				type: "POST", 
				data: { 
					cropH: 	window.jwc.result.cropH,
					cropW: 	window.jwc.result.cropW,
					cropX:	window.jwc.result.cropX,
					cropY: 	window.jwc.result.cropY,
					img:	$('#cover-photo-to-crop').attr('src')
					},
				dataType:"json",
				error: function(data){ console.log('error'); console.log(data); },
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
						$('.account-group .name[data-user-id="' + window.myUserID + '"]').siblings('.avatar').attr('src',data.profile_image_url_profile_size);
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
		var maxWidth = 1040;
		var minWidth = 1040;
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
   ·   Upload image
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
		$(this).one('change',function(e){ 
			uploadImage(e, thisUploadButton);
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
	
function uploadImage(e, thisUploadButton) {
	// get orientation
	loadImage.parseMetaData(e.target.files[0], function (data) {
		if (data.exif) {
			var orientation = data.exif.get('Orientation'); 
			}
		else {
			var orientation = 1; 
			}

		// loader cover stuff
		thisUploadButton.closest('.queet-toolbar').parent().append('<div class="queet-box-loading-cover"></div>');
		thisUploadButton.closest('.queet-toolbar').siblings('.queet-box-loading-cover').width(thisUploadButton.closest('.queet-toolbar').parent().outerWidth());		
		display_spinner(thisUploadButton.closest('.queet-toolbar').siblings('.queet-box-loading-cover')[0]);
		thisUploadButton.closest('.queet-toolbar').siblings('.queet-box-loading-cover').find('.loader').css('top', (thisUploadButton.closest('.queet-toolbar').parent().outerHeight()/2-20) + 'px');

		// clean up 
		cleanUpAfterCropping();

		// create image
		loadImage(e.target.files[0],
				function (img) {    
					if(typeof img.target == 'undefined') {
						// The preview image below queet box.
						var appendedImg = thisUploadButton.closest('.queet-toolbar').before('<span class="upload-image-container"><img class="to-upload" src="' + img.toDataURL('image/jpeg') +  '" /></span>');								
						var imgFormData = new FormData();
						imgFormData.append('media', $('#upload-image-input')[0].files[0]);

						// upload
						$.ajax({ url: window.apiRoot + 'statusnet/media/upload',
							type: "POST", 
							data: imgFormData,
							contentType: false,
							processData: false,
							dataType: "xml",
							error: function(data){ console.log('error'); console.log(data); $('.queet-box-loading-cover').remove(); },
							success: function(data) {						
								var rsp = $(data).find('rsp');
								if (rsp.attr('stat') == 'ok') {
									cleanUpAfterCropping();

									// If doing 'multiple' input element, maybe reply with many mediaurl elements
									// and then rsp.find('mediaurl').each(...)?
									var mediaurl = rsp.find('mediaurl').text();

									var uploadButton = $('img.to-upload').parent().siblings('.queet-toolbar').find('.upload-image');
									var queetBox = $('img.to-upload').parent().siblings('.queet-box-syntax');									
									var caretPos = uploadButton.attr('data-caret-pos').split(',');
									
									// if this site is like quitter.se, we have to do this, otherwise
									// gnusocial will not recognize the link to the image as a local attachment
									if(window.thisSiteThinksItIsHttpButIsActuallyHttps) {
										mediaurl = mediaurl.replace('https://','http://');
										}
									
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
					else {
						remove_spinner();  
						$('.queet-box-loading-cover').remove();						
						alert('could not read image');
						}
					},
				{ canvas: true,
				  orientation: orientation } // Options
			);	
		});			
	
	}	

/* · 
   · 
   ·   Small edit profile button on mini-card. Go-to user stream and hit edit button 
   ·   
   · · · · · · · · · · · · · */ 	

$('body').on('click','#mini-edit-profile-button, #edit-profile-header-link',function(){
	if(window.currentStream == 'statuses/user_timeline.json?screen_name=' + window.loggedIn.screen_name)	{
		$('.edit-profile-button').trigger('click');
		}
	else {
		setNewCurrentStream('statuses/user_timeline.json?screen_name=' + window.loggedIn.screen_name, function(){
			$('.edit-profile-button').trigger('click');
			},true);		
		}
	});
