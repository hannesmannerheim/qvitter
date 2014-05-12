
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
  
// object to keep old states of streams in, to speed up stream change  
window.oldStreams = new Object();


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
   ·   fix login and register box to top when they reach top 
   · 
   · · · · · · · · · · · · · */ 
	
window.loginContentStartPos = $('.front-welcome-text').height()+45;
$(window).scroll(function(e){ 
	if ($(this).scrollTop() > window.loginContentStartPos && $('#login-content').css('position') != 'fixed'){ 
		$('#login-content, .front-signup').not('#popup-signup').css({'position': 'fixed', 'top': '50px'}); 
		}
	else if ($(this).scrollTop() < window.loginContentStartPos && $('#login-content').css('position') != 'absolute'){ 
		$('#login-content, .front-signup').not('#popup-signup').css({'position': 'absolute', 'top': 'auto'}); 
		}		
 	});	
	


/* · 
   · 
   ·   Tooltip to show what federated means
   · 
   · · · · · · · · · · · · · */ 
	
$('#federated-tooltip').on('mouseenter',function(){
	$('#what-is-federation').fadeIn(100);
	});
$('#what-is-federation').on('mouseleave',function(){
	$('#what-is-federation').fadeOut(100);
	});	



/* · 
   · 
   ·   Register
   · 
   · · · · · · · · · · · · · */ 

$('.front-signup input, .front-signup button').removeAttr('disabled'); // clear this onload
$('#signup-btn-step1').click(function(){
		
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
					getFromAPI('check_nickname.json?nickname=' + encodeURIComponent($('#signup-user-nickname-step2').val()),function(data){
						$('.spinner-wrap').remove();
						console.log($('.spinner-wrap').length);
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
			$('#popup-register input,#popup-register button').addClass('disabled');
			display_spinner();
			$.ajax({ url: window.fullUrlToThisQvitterApp + 'API.php', 
				type: "POST", 
				data: { 
					postRequest: 	'account/register.json',
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
						 $('input#username').val($('#signup-user-nickname-step2').val());
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
	
	
	
	
	
/* · 
   · 
   ·   autologin or show welcome screen
   · 
   · · · · · · · · · · · · · */ 

$('#submit-login').removeAttr('disabled'); // might be remebered by browser...   
$(window).load(function() {

	$('#user-container').css('display','block');
	$('#feed').css('display','block');		

	// check for localstorage, if none, we remove possibility to remember login
	var userInLocalStorage = false;
	if(localStorageIsEnabled()) {
		if(typeof localStorage.autologinUsername != 'undefined') {
			userInLocalStorage = true;
			}
		}
	else {
		$('input#rememberme').css('display','none');
		$('span#rememberme_label').css('display','none');		
		$('#remember-forgot').css('font-size','0');						
		$('.language-dropdown').css('display','none');		
		}	


	// autologin if saved
	if(userInLocalStorage) {
		$('input#username').val(localStorage.autologinUsername);
		$('input#password').val(localStorage.autologinPassword);
	
		// if we're in client mode, i.e. not webapp mode, always go to friends timeline if logged in
		if(window.useHistoryPushState === false) {
			streamToSet = 'statuses/friends_timeline.json';
			}

		doLogin("get stream from url");		
		}
	else {
		display_spinner();
		window.currentStream = ''; // force reload stream
		setNewCurrentStream(getStreamFromUrl(),function(){
			logoutWithoutReload(false);
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

	// if this is a special url for user, notice etc, grab that stream (UGLY SORRRRRY)
	var streamToSet = "get stream from url";
	
	// if this is the public feed, we redirect to friends_timline (I think that's intuitive)
	if(getStreamFromUrl() == 'statuses/public_timeline.json') {
		streamToSet = 'statuses/friends_timeline.json';
		}

	doLogin(streamToSet);
	});

function doLogin(streamToSet) {
	$('#submit-login').attr('disabled','disabled');
	$('#submit-login').focus(); // prevents submit on enter to close alert-popup on wrong credentials
	display_spinner();

	// login with ajax
	checkLogin($('input#username').val(),$('input#password').val(),function(user){

		console.log(user);
		
		// store credentials in global var
		window.loginUsername = user.screen_name;
		window.loginPassword = $('input#password').val();
		
		// maybe get stream from url (UGLY SORRRRRY)
		if(streamToSet == "get stream from url") {
			streamToSet = getStreamFromUrl(); // called now becuase we want window.loginUsername to be set first...
			}
		
		// set colors if the api supports it
		if(typeof user.linkcolor != 'undefined' &&
	       typeof user.backgroundcolor != 'undefined') {
			user.linkcolor = user.linkcolor || '';	// no null value		
			user.backgroundcolor = user.backgroundcolor || ''; // no null value
			window.userLinkColor = user.linkcolor;
			window.userBackgroundColor = user.backgroundcolor;			       
			if(window.userLinkColor.length != 6) {
				window.userLinkColor = window.defaultLinkColor;
				}	
			if(window.userBackgroundColor.length != 6) {
				window.userBackgroundColor = window.defaultBackgroundColor;
				}		  		    
	        }
		
		// add user data to DOM, show search form, remeber user id, show the feed
		$('#user-container').css('z-index','1000');
		$('#top-compose').removeClass('hidden');
		$('#user-avatar').attr('src', user.profile_image_url_profile_size);
		$('#user-name').append(user.name);
		$('#user-screen-name').append(user.screen_name);
		$('#user-profile-link').append('<a href="' + user.statusnet_profile_url + '">' + window.sL.viewMyProfilePage + '</a>');
		$('#user-queets strong').html(user.statuses_count);
		$('#user-following strong').html(user.friends_count);			
		$('#user-followers strong').html(user.followers_count);		
		$('#user-groups strong').html(user.groups_count);
		$('.stream-selection.friends-timeline').attr('href', user.statusnet_profile_url + '/all');
		$('.stream-selection.mentions').attr('href', user.statusnet_profile_url + '/replies');
		$('.stream-selection.my-timeline').attr('href', user.statusnet_profile_url);				
		$('.stream-selection.favorites').attr('href', user.statusnet_profile_url + '/favorites');								
		window.myUserID = user.id;				
		
		// if remeber me is checked, save credentials in local storage
		if($('#rememberme').is(':checked')) {
			if(localStorageIsEnabled()) {
				localStorage.autologinPassword = $('input#password').val();
				localStorage.autologinUsername = $('input#username').val();					
				}
			}
			
		// load history
		loadHistoryFromLocalStorage();			
		
		// set stream
		window.currentStream = ''; // always reload stream on login
		setNewCurrentStream(streamToSet,function(){		
			$('.language-dropdown').css('display','none');
			$('.dropdown-menu.quitter-settings li.language').css('display','block');	
			$('#user-header').animate({opacity:'1'},800);
			$('#user-body').animate({opacity:'1'},800);
			$('#user-footer').animate({opacity:'1'},800);
			$('.menu-container').animate({opacity:'1'},800);									
			$('#page-container').animate({opacity:'1'},200);
			$('.front-welcome-text').slideUp(1000);			
			$('#settingslink').fadeIn('slow');	
			$('#search').fadeIn('slow');											
			$('#login-content').css('display','none');
			$('.front-signup').css('display','none');
			remove_spinner();			
			},true);

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
	if(localStorageIsEnabled()) {
		delete localStorage.autologinUsername;
		delete localStorage.autologinPassword;		
		}
	location.reload();		
	});		




/* · 
   · 
   ·   Settings
   · 
   · · · · · · · · · · · · · */ 
   
$('#settings').click(function(){
	// buttons to add later: '<div class="right"><button class="close">' + window.sL.cancelVerb + '</button><button class="primary disabled">' + window.sL.saveChanges + '</button></div>'
	popUpAction('popup-settings', window.sL.settings,'<div id="settings-container"><div><label for="link-color-selection">' + window.sL.linkColor + '</label><input id="link-color-selection" type="text" value="#' + window.userLinkColor + '" /></div><div><label for="link-color-selection">' + window.sL.backgroundColor + '</label><input id="background-color-selection" type="text" value="#' + window.userBackgroundColor + '" /></div><a id="moresettings">' + window.sL.moreSettings + '<form action="https://quitter.se/main/login" method="post" target="_blank"><input type="hidden" id="nickname" name="nickname" value="' + $('input#username').val() + '" /><input type="hidden" id="password" name="password" value="' + $('input#password').val() + '" /><input type="hidden" id="returnto" name="returnto" value="/settings/profile" /></form></a></div>',false);
	$('#link-color-selection').minicolors({
		change: function(hex) {
			changeLinkColor(hex);
			postNewLinkColor(hex.substring(1));
			}
		});
	$('#background-color-selection').minicolors({
		change: function(hex) {
			$('body').css('background-color',hex);
			postNewBackgroundColor(hex.substring(1));
			}
		});		
	// also on keyup in input (minicolors 'change' event does not do this, apparently)
	$('#link-color-selection').on('keyup',function(){
		keyupSetLinkColor($(this).val());
		});
	$('#background-color-selection').on('keyup',function(){
		keyupSetBGColor($(this).val());
		});		
	});	

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


// go to standard settingspage 
$('body').on('click','#moresettings',function(){
    $(document.body).append('<iframe id="logout-iframe" src="https://quitter.se/main/logout" style="display:none;">'); // we need to logout before login, otherwise redirection to settingspage doesn't work
    $('iframe#logout-iframe').load(function() {
        $('#moresettings').children('form').submit(); // submit hidden form and open settingspage in new tab
	    });	
	});		





/* · 
   · 
   ·   Do a logout without reloading, i.e. on login errors 
   · 
   · · · · · · · · · · · · · */ 

function logoutWithoutReload(doShake) {

	if(window.currentStream == 'statuses/public_timeline.json') {
		$('body').css('background-image', 'url(' + window.fullUrlToThisQvitterApp + 'img/ekan4.jpg)');
		}

	$('#submit-login').removeAttr('disabled');				

	// delete any locally stored credentials
	if(localStorageIsEnabled()) {
		delete localStorage.autologinUsername;
		delete localStorage.autologinPassword;		
		}

	$('#user-header').animate({opacity:'0'},200);
	$('#user-body').animate({opacity:'0'},200);
	$('#user-footer').animate({opacity:'0'},200);
	$('.menu-container').animate({opacity:'0'},200);									
	$('.language-dropdown').css('display','block');
	$('.dropdown-menu.quitter-settings li.language').css('display','none');	
	$('#settingslink').fadeOut('slow');	
	$('#search').fadeOut('slow');											
	$('input#username').focus();	
	$('.front-signup').animate({opacity:'1'},200);
	if(doShake) {
		$('input#username').css('background-color','pink');
		$('input#password').css('background-color','pink');		
		}
	$('#login-content').animate({opacity:'1'},200, function(){
		if(doShake) {
			$('#login-content').effect('shake',{distance:5,times:2},function(){
				$('input#username').animate({backgroundColor:'#fff'},1000);
				$('input#password').animate({backgroundColor:'#fff'},1000);					
				});
			}
		$('.front-welcome-text').fadeIn(3000);						
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
	if(localStorageIsEnabled()) {
		localStorage.selectedLanguage = $(this).attr('data-lang-code'); // save langage selection
		}
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
   ·   When clicking a external follow button
   · 
   · · · · · · · · · · · · · */ 


$('body').on('click','.external-follow-button',function(event){
	popUpAction('popup-external-follow', window.sL.userExternalFollow + ' ' + $('.profile-card-inner .screen-name').html(),'<form method="post" action="' + window.siteInstanceURL.replace('https://','http://') + 'main/ostatus"><input type="hidden" id="nickname" name="nickname" value="' + $('.profile-card-inner .screen-name').html().substring(1) + '"><input type="text" id="profile" name="profile" placeholder="' + window.sL.userExternalFollowHelp + '" /></form>','<div class="right"><button class="close">' + window.sL.cancelVerb + '</button><button class="primary">' + window.sL.userExternalFollow + '</button></div>');		
	$('#popup-external-follow form input#profile').focus();
	$('#popup-external-follow button.primary').click(function(){
		$('#popup-external-follow form').submit();
		});
	});
	
/* · 
   · 
   ·   When clicking a external join button
   · 
   · · · · · · · · · · · · · */ 


$('body').on('click','.external-member-button',function(event){
	popUpAction('popup-external-join', window.sL.joinExternalGroup + ' ' + $('.profile-card-inner .screen-name').html(),'<form method="post" action="' + window.siteInstanceURL.replace('https://','http://') + 'main/ostatus"><input type="hidden" id="group" name="group" value="' + $('.profile-card-inner .screen-name').html().substring(1) + '"><input type="text" id="profile" name="profile" placeholder="' + window.sL.userExternalFollowHelp + '" /></form>','<div class="right"><button class="close">' + window.sL.cancelVerb + '</button><button class="primary">' + window.sL.userExternalFollow + '</button></div>');		
	$('#popup-external-join form input#profile').focus();
	$('#popup-external-join button.primary').click(function(){
		$('#popup-external-join form').submit();
		});
	});	



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
   ·   Select a stream when the logged in user clicks their own queets, followers etc 
   · 
   · · · · · · · · · · · · · */ 

$('#user-header, #user-queets, #user-following, #user-followers, #user-groups').on('click',function(){
	if($(this).attr('id') == 'user-header' || $(this).attr('id') == 'user-queets') {
		setNewCurrentStream('statuses/user_timeline.json?screen_name=' + window.loginUsername,function(){},true);	
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
	streamName = 'search.json?q=' + encodeURIComponent($('#search-query').val());
	setNewCurrentStream(streamName,function(){},true);			
	}



/* · 
   ·                                                                              <o
   ·   Hijack all links and look for local users, tags, searches and groups.       (//
   ·   
   ·   If found, select that stream and prevent links default behaviour
   · 
   · · · · · · · · · · · · · */ 

$(document).on('click','a', function(e) {          
	
	// not if metakeys are pressed!
	if(e.ctrlKey || e.altKey || e.shiftKey || e.metaKey) {
		return;
		}
	
	// ugly fix: if this is the x remove users from history, prevent link but don't set a new currentstream
	if($(e.target).is('i.chev-right')) {
		e.preventDefault();		
		return;
		}
	
	// all non-hijacked links opens in new tab
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
			setNewCurrentStream('statuses/public_and_external_timeline.json?since_id=1',function(){},true);	
			}			
		// logged in users streams
		else if ($(this).attr('href').replace('http://','').replace('https://','').replace(window.siteRootDomain + '/' + window.loginUsername,'') == '/all') {
			e.preventDefault();			
			setNewCurrentStream('statuses/friends_timeline.json',function(){},true);	
			}
		else if ($(this).attr('href').replace('http://','').replace('https://','').replace(window.siteRootDomain + '/' + window.loginUsername,'') == '/replies') {
			e.preventDefault();			
			setNewCurrentStream('statuses/mentions.json',function(){},true);				
			}			
// 		else if ($(this).attr('href').replace('http://','').replace('https://','').replace(window.siteRootDomain + '/','') == window.loginUsername) {
// 			e.preventDefault();			
// 			setNewCurrentStream('statuses/user_timeline.json',function(){},true);				
// 			}			
		else if ($(this).attr('href').replace('http://','').replace('https://','').replace(window.siteRootDomain + '/' + window.loginUsername,'') == '/favorites') {
			e.preventDefault();			
			setNewCurrentStream('favorites.json',function(){},true);				
			}			
		// profiles
		else if ((/^[a-zA-Z0-9]+$/.test($(this).attr('href').replace('http://','').replace('https://','').replace(window.siteRootDomain + '/','')))) {
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
			setNewCurrentStream('statusnet/tags/timeline/' + $(this).text().toLowerCase().replace('#','') + '.json',function(){},true);				
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
		// search 
		else if ($(this).attr('href').indexOf('/search/notice?q=')>-1) {
			e.preventDefault();
			var searchToStream = $(this).attr('href').replace('http://','').replace('https://','').replace(window.siteRootDomain,'').replace('/search/notice?q=','');
			setNewCurrentStream('search.json?q=' + searchToStream,function(){},true);		
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
					
					console.log(data);
					
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
						
					var serverUrl = data.statusnet_profile_url.replace('/' + data.screen_name,'');
					var userApiUrl = serverUrl + '/api/statuses/user_timeline.json?screen_name=' + data.screen_name;
					var screenNameWithServer = '@' + data.screen_name + '@' + serverUrl.replace('http://','').replace('https://','');						
					var followButton = '<div class="user-actions"><button data-follow-user-id="' + data.id + '" data-follow-user="' + data.statusnet_profile_url + '" type="button" class="follow-button ' + followingClass + '"><span class="button-text follow-text"><i class="follow"></i>' + window.sL.userFollow + '</span><span class="button-text following-text">' + window.sL.userFollowing + '</span><span class="button-text unfollow-text">' + window.sL.userUnfollow + '</span></button></div>';	
					var profileCard = '<div class="profile-card"><div class="profile-header-inner" style="background-image:url(' + data.profile_image_url_original + ')"><div class="profile-header-inner-overlay"></div><a class="profile-picture"><img src="' + data.profile_image_url_profile_size + '" /></a><div class="profile-card-inner"><h1 class="fullname">' + data.name + '<span></span></h1><h2 class="username"><span class="screen-name"><a target="_blank" href="' + data.statusnet_profile_url + '">' + screenNameWithServer + '</a></span><span class="follow-status"></span></h2><div class="bio-container"><p>' + data.description + '</p></div><p class="location-and-url"><span class="location">' + data.location + '</span><span class="divider"> · </span><span class="url"><a target="_blank" href="' + data.url + '">' + data.url.replace('http://','').replace('https://','') + '</a></span></p></div></div><div class="profile-banner-footer"><ul class="stats"><li><a target="_blank" href="' + data.statusnet_profile_url + '"><strong>' + data.statuses_count + '</strong>' + window.sL.notices + '</a></li><li><a target="_blank" href="' + data.statusnet_profile_url + '/subscriptions"><strong>' + data.friends_count + '</strong>' + window.sL.following + '</a></li><li><a target="_blank" href="' + data.statusnet_profile_url + '/subscribers"><strong>' + data.followers_count + '</strong>' + window.sL.followers + '</a></li></ul>' + followButton + '<div class="clearfix"></div></div></div><div class="clearfix"></div>';		
					
					popUpAction('popup-external-profile', screenNameWithServer,profileCard,false);
					
					// if remote server is https, do jsonp request directly, otherwise proxy
					if(serverUrl.substring(0,8) == 'https://') {
						console.log(userApiUrl);
						$.ajax({ url: userApiUrl, type: "GET", dataType: "jsonp", success: function(data) { 
								console.log(data);
								}
							});
						}
					else {
						getFromAPI('externalproxy.json?url=' + encodeURIComponent(userApiUrl),function(data){
							if(data) {
							
								}
							});
						}
					
					
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
				var getVars = qOrAmp(window.currentStream) + 'max_id=' + $('#feed-body').children('.stream-item').last().attr('data-quitter-id-in-stream');				
				}
			
			display_spinner();		
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

$('body').on('click','#new-queets-bar',function(){
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

$('body').on('click','.queet',function (event) {
	if(!$(event.target).is('a')
		&& !$(event.target).is('.CodeMirror-scroll')
		&& !$(event.target).is('.cm-mention')
		&& !$(event.target).is('.cm-tag')
		&& !$(event.target).is('.cm-group')
		&& !$(event.target).is('.cm-url')						
		&& !$(event.target).is('pre')		
		&& !$(event.target).is('.name')
		&& !$(event.target).is('.queet-box-template')	
		&& !$(event.target).is('img')				
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
		&& !$(this).parent('.stream-item').hasClass('user')) { // not if user stream
		expand_queet($(this).parent());
		}	
	});
	
	
/* · 
   · 
   ·   Collapse all open conversations on esc or when clicking the margin  
   ·   
   · · · · · · · · · · · · · */ 

$('body').click(function(event){	
	if($(event.target).is('body')) {
		$.each($('.stream-item.expanded'),function(){
			expand_queet($(this), false);
			});
		}	
	});

$(document).keyup(function(e){
	if(e.keyCode==27) { // esc
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

$('body').on('click','.action-del-container',function(){
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

$('body').on('click','.action-rt-container',function(){
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

$('body').on('click','.action-fav-container',function(){
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

$('body').on('click','.action-reply-container',function(){
	var this_stream_item = $(this).closest('.stream-item');
	var this_stream_item_id = this_stream_item.attr('data-quitter-id');

	// grabbing the queet and view it in the popup, stripped of footer, reply box and other sruff
	var $queetHtml = $('<div>').append(this_stream_item.children('.queet').outerHTML());
	var $queetHtmlFooter = $queetHtml.find('.stream-item-footer');
	$queetHtmlFooter.remove();
	var $queetHtmlQueetBox = $queetHtml.find('.inline-reply-queetbox');
	$queetHtmlQueetBox.remove();
	var $queetHtmlExpandedContent = $queetHtml.find('.expanded-content');
	$queetHtmlExpandedContent.remove();		
	var queetHtmlWithoutFooter = $queetHtml.html();
	popUpAction('popup-reply-' + this_stream_item_id, window.sL.replyTo + ' ' + this_stream_item.find('.screen-name').html(),replyFormHtml(this_stream_item,this_stream_item_id),queetHtmlWithoutFooter);
	expandInlineQueetBox($('#popup-reply-' + this_stream_item_id).find('.modal-body').find('.queet-box-template'));

	});
	

/* · 
   · 
   ·   When clicking the compose button on mobile view
   ·   
   · · · · · · · · · · · · · */ 

$('body').on('click','#top-compose',function(){
	popUpAction('popup-compose', window.sL.compose,'<div class="inline-reply-queetbox"><div class="queet-box-template"></div></div>',false);
	expandInlineQueetBox($('#popup-compose').find('.queet-box-template'));
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

$('body').on('click','.queet-box-template',function(){
	// expand inline queet box
	expandInlineQueetBox($(this));
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
			
		var queetBoxID = $(this).parent().parent().parent().find('.queet-box-template').attr('id');

		var queetText = window['codemirror-' + queetBoxID].getValue();		
		var queetHtml = '<div id="' + tempPostId + '" class="stream-item conversation temp-post" style="opacity:1"><div class="queet"><span class="dogear"></span><div class="queet-content"><div class="stream-item-header"><a class="account-group"><img class="avatar" src="' + $('#user-avatar').attr('src') + '" /><strong class="name">' + $('#user-name').html() + '</strong> <span class="screen-name">@' + $('#user-screen-name').html() + '</span></a><small class="created-at">posting</small></div><div class="queet-text">' + queetText + '</div><div class="stream-item-footer"><span class="stream-item-expand">&nbsp;</span></div></div></div></div>';
		queetHtml = detectRTL(queetHtml);		


		// get reply to id and add temp queet
		if($('.modal-container').find('.queet-toolbar button').length>0) { // from popup
			var in_reply_to_status_id = $('.modal-container').attr('id').substring(12); // removes "popup-reply-" from popups id
			$('.modal-container').remove();			
			queetHtml = detectRTL(queetHtml);

			// try to find an expanded queet to add the temp queet to
			if($('.stream-item.expanded[data-quitter-id="' + in_reply_to_status_id + '"]').length > 0) {
				$('.stream-item.expanded[data-quitter-id="' + in_reply_to_status_id + '"]').append(queetHtml);
				}
			else if($('.stream-item.conversation[data-quitter-id="' + in_reply_to_status_id + '"]').not('.hidden-conversation').length > 0) {
				$('.stream-item.conversation[data-quitter-id="' + in_reply_to_status_id + '"]').not('.hidden-conversation').parent().append(queetHtml);
				}
			// if we cant find a proper place, just add it to top and remove conversation class
			else {
				$('#feed-body').prepend(queetHtml.replace('class="stream-item conversation','class="stream-item'));				
				}
			}
		else { // from inline reply
			var in_reply_to_status_id = $(this).parent().parent().parent().parent().parent().attr('data-quitter-id');
			$(this).parent().parent().parent().parent().parent().append(queetHtml);			
			}		
		
		// null reply box
		$(this).parent().parent().parent().find('.queet-box-template').css('display','block');	
		$(this).parent().parent().parent().find('.CodeMirror').remove();
		$(this).parent().parent().parent().find('textarea#codemirror-' + queetBoxID).remove();		
		$(this).parent().parent().parent().find('.queet-toolbar').remove();
		delete window['codemirror-' + queetBoxID];
				
		// check for new queets (one second from) NOW 
		setTimeout('checkForNewQueets()', 1000);

		// post queet
		postReplyToAPI(queetText, in_reply_to_status_id, function(data){ if(data) {

			// show real queet
			var new_queet = Array();
			new_queet[0] = data;
			addToFeed(new_queet,tempPostId,'visible');

			// remove temp queet
			$('#' + tempPostId).remove();
			
			// queet count
			$('#user-queets strong').html(parseInt($('#user-queets strong').html(),10)+1);			
				
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
			
		var queetText = codemirrorQueetBox.getValue();

		// remove trailing <br> and convert other <br> to newline
		queetText = $.trim(queetText);	

		// show temporary queet
		var queetHtml = '<div id="' + tempPostId + '" class="stream-item temp-post" style="opacity:1"><div class="queet"><span class="dogear"></span><div class="queet-content"><div class="stream-item-header"><a class="account-group"><img class="avatar" src="' + $('#user-avatar').attr('src') + '" /><strong class="name">' + $('#user-name').html() + '</strong> <span class="screen-name">@' + $('#user-screen-name').html() + '</span></a><small class="created-at">posting</small></div><div class="queet-text">' + queetText + '</div><div class="stream-item-footer"><span class="stream-item-expand">&nbsp;</span></div></div></div></div>';

		// detect rtl
		queetHtml = detectRTL(queetHtml);						

		$('#feed-body').prepend(queetHtml);
		
		// check for new queets (one second from) NOW 
		setTimeout('checkForNewQueets()', 1000);
		
		// null post form
		codemirrorQueetBox.setValue('');
		$('#queet-toolbar').css('display','none');	
		$('#queet-box').css('display','block');	
		$('#user-footer .CodeMirror-wrap').css('display','none');	

		// post queet
		postQueetToAPI(queetText, function(data){ if(data) {

			// show real queet
			var new_queet = Array();
			new_queet[0] = data;
			addToFeed(new_queet,tempPostId,'visible');

			// remove temp queet
			$('#' + tempPostId).remove();
			
			// queet count
			$('#user-queets strong').html(parseInt($('#user-queets strong').html(),10)+1);
			
			}});
		}
	});


/* · 
   · 
   ·   Codemirror configuration for queet box
   ·   
   · · · · · · · · · · · · · */ 


CodeMirror.defaults.lineWrapping = true;        
CodeMirror.defineMode("gnusocial", function(config, parserConfig) {	
	function tokenBase(stream, state) {
		
		stream.string = stream.string + ' '; // makes regexping easier..
		var ch = stream.next();
		
		// regexps
		var externalMentionInBeginningRE = /[a-zA-Z0-9]+(@)[\wåäö\-\.]+(\.)((ac|ad|aero|af|ag|ai|al|am|an|ao|aq|arpa|asia|at|au|aw|ax|az|ba|bb|bd|be|bf|bg|bh|biz|bj|bm|bn|bo|br|bs|bt|bv|bw|by|bz|ca|cat|cc|cd|cf|cg|ch|ci|ck|cl|cm|cn|com|coop|cr|cu|cv|cw|cx|cy|cz|de|dj|dk|dm|do|dz|ec|edu|ee|eg|er|es|et|eu|fi|fj|fk|fm|fo|fr|ga|gb|gd|ge|gf|gg|gh|gi|gl|gm|gn|gov|gp|gq|gr|gs|gt|gu|gw|gy|hk|hm|hn|hr|ht|hu|id|ie|il|im|info|int|io|iq|ir|is|it|je|jm|jobs|jp|ke|kg|kh|ki|km|kn|kp|kr|kw|ky|kz|la|lb|lc|li|lk|lr|ls|lt|lu|lv|ly|ma|mc|md|me|mg|mh|mil|mk|ml|mm|mn|mobi|mp|mq|mr|ms|mt|museum|mv|mw|mx|my|mz|name|nc|net|nf|ng|ni|nl|no|np|nr|nu|nz|om|org|pa|pe|pf|pg|ph|pk|pl|pm|pn|post|pro|ps|pt|pw|py|qa|re|ro|rs|ru|rw|sa|sb|sc|sd|se|sg|sh|si|sj|sk|sl|sm|sn|so|sr|st|su|sv|sx|sy|sz|tc|td|tel|tf|tg|th|tj|tk|tl|tm|tn|to|tp|travel|tt|tv|tw|tz|ua|ug|uk|us|uy|uz|va|vc|ve|vg|vi|vn|vu|wf|ws|xxx|ye|yt|za|zm|zw)|(ae|ar|as|bi|co|in|jo|mo|mu|na|ne|pr|tr))/;
		var mentionInBeginningRE = /[a-zA-Z0-9]+/;		
		var tagInBeginningRE = /[\wåäö\-]+/;	
		var groupInBeginningRE = /[a-zA-Z0-9]+/;			
		var externalMentionRE = /([ ]+)?@[a-zA-Z0-9]+(@)[\wåäö\-\.]+(\.)((ac|ad|aero|af|ag|ai|al|am|an|ao|aq|arpa|asia|at|au|aw|ax|az|ba|bb|bd|be|bf|bg|bh|biz|bj|bm|bn|bo|br|bs|bt|bv|bw|by|bz|ca|cat|cc|cd|cf|cg|ch|ci|ck|cl|cm|cn|com|coop|cr|cu|cv|cw|cx|cy|cz|de|dj|dk|dm|do|dz|ec|edu|ee|eg|er|es|et|eu|fi|fj|fk|fm|fo|fr|ga|gb|gd|ge|gf|gg|gh|gi|gl|gm|gn|gov|gp|gq|gr|gs|gt|gu|gw|gy|hk|hm|hn|hr|ht|hu|id|ie|il|im|info|int|io|iq|ir|is|it|je|jm|jobs|jp|ke|kg|kh|ki|km|kn|kp|kr|kw|ky|kz|la|lb|lc|li|lk|lr|ls|lt|lu|lv|ly|ma|mc|md|me|mg|mh|mil|mk|ml|mm|mn|mobi|mp|mq|mr|ms|mt|museum|mv|mw|mx|my|mz|name|nc|net|nf|ng|ni|nl|no|np|nr|nu|nz|om|org|pa|pe|pf|pg|ph|pk|pl|pm|pn|post|pro|ps|pt|pw|py|qa|re|ro|rs|ru|rw|sa|sb|sc|sd|se|sg|sh|si|sj|sk|sl|sm|sn|so|sr|st|su|sv|sx|sy|sz|tc|td|tel|tf|tg|th|tj|tk|tl|tm|tn|to|tp|travel|tt|tv|tw|tz|ua|ug|uk|us|uy|uz|va|vc|ve|vg|vi|vn|vu|wf|ws|xxx|ye|yt|za|zm|zw)|(ae|ar|as|bi|co|in|jo|mo|mu|na|ne|pr|tr))/;
		var mentionRE = /([ ]+)?@[a-zA-Z0-9]+/;		
		var tagRE = /([ ]+)?#[\wåäö\-]+/;	
		var groupRE = /([ ]+)?![a-zA-Z0-9]+/;	
		var urlWithoutHttpInBeginningRE = /([\wåäö\-\.]+)?(\.)((ac|ad|aero|af|ag|ai|al|am|an|ao|aq|arpa|asia|at|au|aw|ax|az|ba|bb|bd|be|bf|bg|bh|biz|bj|bm|bn|bo|br|bs|bt|bv|bw|by|bz|ca|cat|cc|cd|cf|cg|ch|ci|ck|cl|cm|cn|com|coop|cr|cu|cv|cw|cx|cy|cz|de|dj|dk|dm|do|dz|ec|edu|ee|eg|er|es|et|eu|fi|fj|fk|fm|fo|fr|ga|gb|gd|ge|gf|gg|gh|gi|gl|gm|gn|gov|gp|gq|gr|gs|gt|gu|gw|gy|hk|hm|hn|hr|ht|hu|id|ie|il|im|info|int|io|iq|ir|is|it|je|jm|jobs|jp|ke|kg|kh|ki|km|kn|kp|kr|kw|ky|kz|la|lb|lc|li|lk|lr|ls|lt|lu|lv|ly|ma|mc|md|me|mg|mh|mil|mk|ml|mm|mn|mobi|mp|mq|mr|ms|mt|museum|mv|mw|mx|my|mz|name|nc|net|nf|ng|ni|nl|no|np|nr|nu|nz|om|org|pa|pe|pf|pg|ph|pk|pl|pm|pn|post|pro|ps|pt|pw|py|qa|re|ro|rs|ru|rw|sa|sb|sc|sd|se|sg|sh|si|sj|sk|sl|sm|sn|so|sr|st|su|sv|sx|sy|sz|tc|td|tel|tf|tg|th|tj|tk|tl|tm|tn|to|tp|travel|tt|tv|tw|tz|ua|ug|uk|us|uy|uz|va|vc|ve|vg|vi|vn|vu|wf|ws|xxx|ye|yt|za|zm|zw)|(ae|ar|as|bi|co|in|jo|mo|mu|na|ne|pr|tr))(\/[\wåäö\%\!\*\'\(\)\;\:\@\&\=\+\$\,\/\?\#\[\]\-\_\.\~]+)?(\/)?( )/;
		var urlWithoutHttpRE = /([ ]+)?[\wåäö\-\.]+(\.)((ac|ad|aero|af|ag|ai|al|am|an|ao|aq|arpa|asia|at|au|aw|ax|az|ba|bb|bd|be|bf|bg|bh|biz|bj|bm|bn|bo|br|bs|bt|bv|bw|by|bz|ca|cat|cc|cd|cf|cg|ch|ci|ck|cl|cm|cn|com|coop|cr|cu|cv|cw|cx|cy|cz|de|dj|dk|dm|do|dz|ec|edu|ee|eg|er|es|et|eu|fi|fj|fk|fm|fo|fr|ga|gb|gd|ge|gf|gg|gh|gi|gl|gm|gn|gov|gp|gq|gr|gs|gt|gu|gw|gy|hk|hm|hn|hr|ht|hu|id|ie|il|im|info|int|io|iq|ir|is|it|je|jm|jobs|jp|ke|kg|kh|ki|km|kn|kp|kr|kw|ky|kz|la|lb|lc|li|lk|lr|ls|lt|lu|lv|ly|ma|mc|md|me|mg|mh|mil|mk|ml|mm|mn|mobi|mp|mq|mr|ms|mt|museum|mv|mw|mx|my|mz|name|nc|net|nf|ng|ni|nl|no|np|nr|nu|nz|om|org|pa|pe|pf|pg|ph|pk|pl|pm|pn|post|pro|ps|pt|pw|py|qa|re|ro|rs|ru|rw|sa|sb|sc|sd|se|sg|sh|si|sj|sk|sl|sm|sn|so|sr|st|su|sv|sx|sy|sz|tc|td|tel|tf|tg|th|tj|tk|tl|tm|tn|to|tp|travel|tt|tv|tw|tz|ua|ug|uk|us|uy|uz|va|vc|ve|vg|vi|vn|vu|wf|ws|xxx|ye|yt|za|zm|zw)|(ae|ar|as|bi|co|in|jo|mo|mu|na|ne|pr|tr))(\/[\wåäö\%\!\*\'\(\)\;\:\@\&\=\+\$\,\/\?\#\[\]\-\_\.\~]+)?(\/)?( )/;
		var urlInBeginningRE = /(ttp\:\/\/|ttps\:\/\/)([\wåäö\-\.]+)?(\.)((ac|ad|aero|af|ag|ai|al|am|an|ao|aq|arpa|asia|at|au|aw|ax|az|ba|bb|bd|be|bf|bg|bh|biz|bj|bm|bn|bo|br|bs|bt|bv|bw|by|bz|ca|cat|cc|cd|cf|cg|ch|ci|ck|cl|cm|cn|com|coop|cr|cu|cv|cw|cx|cy|cz|de|dj|dk|dm|do|dz|ec|edu|ee|eg|er|es|et|eu|fi|fj|fk|fm|fo|fr|ga|gb|gd|ge|gf|gg|gh|gi|gl|gm|gn|gov|gp|gq|gr|gs|gt|gu|gw|gy|hk|hm|hn|hr|ht|hu|id|ie|il|im|info|int|io|iq|ir|is|it|je|jm|jobs|jp|ke|kg|kh|ki|km|kn|kp|kr|kw|ky|kz|la|lb|lc|li|lk|lr|ls|lt|lu|lv|ly|ma|mc|md|me|mg|mh|mil|mk|ml|mm|mn|mobi|mp|mq|mr|ms|mt|museum|mv|mw|mx|my|mz|name|nc|net|nf|ng|ni|nl|no|np|nr|nu|nz|om|org|pa|pe|pf|pg|ph|pk|pl|pm|pn|post|pro|ps|pt|pw|py|qa|re|ro|rs|ru|rw|sa|sb|sc|sd|se|sg|sh|si|sj|sk|sl|sm|sn|so|sr|st|su|sv|sx|sy|sz|tc|td|tel|tf|tg|th|tj|tk|tl|tm|tn|to|tp|travel|tt|tv|tw|tz|ua|ug|uk|us|uy|uz|va|vc|ve|vg|vi|vn|vu|wf|ws|xxx|ye|yt|za|zm|zw)|(ae|ar|as|bi|co|in|jo|mo|mu|na|ne|pr|tr))(\/[\wåäö\%\!\*\'\(\)\;\:\@\&\=\+\$\,\/\?\#\[\]\-\_\.\~]+)?(\/)?( )/;
		var urlRE = /([ ]+)?(http\:\/\/|https\:\/\/)([\wåäö\-\.]+)?(\.)((ac|ad|aero|af|ag|ai|al|am|an|ao|aq|arpa|asia|at|au|aw|ax|az|ba|bb|bd|be|bf|bg|bh|biz|bj|bm|bn|bo|br|bs|bt|bv|bw|by|bz|ca|cat|cc|cd|cf|cg|ch|ci|ck|cl|cm|cn|com|coop|cr|cu|cv|cw|cx|cy|cz|de|dj|dk|dm|do|dz|ec|edu|ee|eg|er|es|et|eu|fi|fj|fk|fm|fo|fr|ga|gb|gd|ge|gf|gg|gh|gi|gl|gm|gn|gov|gp|gq|gr|gs|gt|gu|gw|gy|hk|hm|hn|hr|ht|hu|id|ie|il|im|info|int|io|iq|ir|is|it|je|jm|jobs|jp|ke|kg|kh|ki|km|kn|kp|kr|kw|ky|kz|la|lb|lc|li|lk|lr|ls|lt|lu|lv|ly|ma|mc|md|me|mg|mh|mil|mk|ml|mm|mn|mobi|mp|mq|mr|ms|mt|museum|mv|mw|mx|my|mz|name|nc|net|nf|ng|ni|nl|no|np|nr|nu|nz|om|org|pa|pe|pf|pg|ph|pk|pl|pm|pn|post|pro|ps|pt|pw|py|qa|re|ro|rs|ru|rw|sa|sb|sc|sd|se|sg|sh|si|sj|sk|sl|sm|sn|so|sr|st|su|sv|sx|sy|sz|tc|td|tel|tf|tg|th|tj|tk|tl|tm|tn|to|tp|travel|tt|tv|tw|tz|ua|ug|uk|us|uy|uz|va|vc|ve|vg|vi|vn|vu|wf|ws|xxx|ye|yt|za|zm|zw)|(ae|ar|as|bi|co|in|jo|mo|mu|na|ne|pr|tr))(\/[\wåäö\%\!\*\'\(\)\;\:\@\&\=\+\$\,\/\?\#\[\]\-\_\.\~]+)?(\/)?( )/;		
		var emailRE = /([ ]+)?([a-zA-Z0-9\!\#\$\%\&\'\*\+\-\/\=\?\^\_\`\{\|\}\~\.]+)?(@)[\wåäö\-\.]+(\.)((ac|ad|aero|af|ag|ai|al|am|an|ao|aq|arpa|asia|at|au|aw|ax|az|ba|bb|bd|be|bf|bg|bh|biz|bj|bm|bn|bo|br|bs|bt|bv|bw|by|bz|ca|cat|cc|cd|cf|cg|ch|ci|ck|cl|cm|cn|com|coop|cr|cu|cv|cw|cx|cy|cz|de|dj|dk|dm|do|dz|ec|edu|ee|eg|er|es|et|eu|fi|fj|fk|fm|fo|fr|ga|gb|gd|ge|gf|gg|gh|gi|gl|gm|gn|gov|gp|gq|gr|gs|gt|gu|gw|gy|hk|hm|hn|hr|ht|hu|id|ie|il|im|info|int|io|iq|ir|is|it|je|jm|jobs|jp|ke|kg|kh|ki|km|kn|kp|kr|kw|ky|kz|la|lb|lc|li|lk|lr|ls|lt|lu|lv|ly|ma|mc|md|me|mg|mh|mil|mk|ml|mm|mn|mobi|mp|mq|mr|ms|mt|museum|mv|mw|mx|my|mz|name|nc|net|nf|ng|ni|nl|no|np|nr|nu|nz|om|org|pa|pe|pf|pg|ph|pk|pl|pm|pn|post|pro|ps|pt|pw|py|qa|re|ro|rs|ru|rw|sa|sb|sc|sd|se|sg|sh|si|sj|sk|sl|sm|sn|so|sr|st|su|sv|sx|sy|sz|tc|td|tel|tf|tg|th|tj|tk|tl|tm|tn|to|tp|travel|tt|tv|tw|tz|ua|ug|uk|us|uy|uz|va|vc|ve|vg|vi|vn|vu|wf|ws|xxx|ye|yt|za|zm|zw)|(ae|ar|as|bi|co|in|jo|mo|mu|na|ne|pr|tr))( )/;
		
		if (stream.start == 0 && ch == "@" && stream.match(externalMentionInBeginningRE)) { return "mention"}		
		else if (stream.start == 0 && ch == "@" && stream.match(mentionInBeginningRE)) { return "mention"}
		else if (stream.start == 0 && ch == "#" && stream.match(tagInBeginningRE)) { return "mention"}
		else if (stream.start == 0 && ch == "!" && stream.match(groupInBeginningRE)) { return "mention"}				
		else if (stream.start == 0 && ch.match(/[a-z0-9]/) && stream.match(urlWithoutHttpInBeginningRE)) { stream.backUp(1); return "url"; }
		else if (stream.start == 0 && ch == "h" && stream.match(urlInBeginningRE)) { stream.backUp(1); return "url"; }
		else if (ch == " " && stream.match(externalMentionRE)) { return "mention"}		
		else if (ch == " " && stream.match(mentionRE)) { return "mention"}		
		else if (ch == " " && stream.match(tagRE)) { return "tag"; }   
		else if (ch == " " && stream.match(groupRE)) { return "group"; }
		else if (ch == " " && stream.match(urlWithoutHttpRE)) { stream.backUp(1); return "url"; }
		else if (ch == " " && stream.match(urlRE)) { stream.backUp(1); return "url"; }
		else if(!(ch == ' ' && stream.next() == '.') && !(stream.start == 0 && ch == '.') && (stream.start == 0 || ch == ' ') && stream.match(emailRE)) {
			stream.backUp(1);
			return "email";
			}
		}
	
	return {
		startState: function(base) {
			return {tokenize: tokenBase };
			},
		token: function(stream, state) {
			state.tokenize = state.tokenize || tokenBase;
			var style = state.tokenize(stream, state);	
			return style;
			}
		};
	});

// activate queet box
var codemirrorQueetBox = CodeMirror.fromTextArea(document.getElementById("codemirror-queet-box"), { 
	// submit on enter
	onKeyEvent: function(editor, event) {
		event = $.event.fix(event);
		var enterKeyHasBeenPressed = event.type == "keyup" && event.keyCode == 13 && (event.ctrlKey || event.altKey);		
		if(enterKeyHasBeenPressed ){
			$('#queet-toolbar button').trigger('click');
			}
		
		}
  });



/* · 
   · 
   ·   Count chars in queet box on keyup
   ·   
   · · · · · · · · · · · · · */ 

codemirrorQueetBox.on('change',function () {
	countCharsInQueetBox(codemirrorQueetBox.getValue(),$('#queet-counter'),$('#queet-toolbar button'));
	});	
	
	
	
	
	
/* · 
   · 
   ·   Expand/collapse queet box on click and blur
   ·   
   · · · · · · · · · · · · · */ 	

$('#queet-box').click(function () {
	$('#queet-box').css('display','none');	
	$('#user-footer .CodeMirror-wrap').css('display','block');
	$('#queet-toolbar').css('display','block');	
	$('#queet-toolbar button').addClass('disabled');	
	codemirrorQueetBox.setValue('');
	codemirrorQueetBox.focus();
	countCharsInQueetBox(codemirrorQueetBox.getValue(),$('#queet-counter'),$('#queet-toolbar button'));	
	});
codemirrorQueetBox.on("blur", function(){	
	if(codemirrorQueetBox.getValue().length == 0) {
		$('#queet-toolbar').css('display','none');	
		$('#queet-box').css('display','block');	
		$('#user-footer .CodeMirror-wrap').css('display','none');		
		}
	});	
	
/* · 
   · 
   ·   Shorten URL:s in queet boxes on space
   ·   
   · · · · · · · · · · · · · */ 	
  
// $('body').on('keyup','#queet-box',function(e){
// 	if(e.keyCode == 32) {
// 		shortenUrlsInBox($('#queet-box'),$('#queet-counter'),$('#queet-toolbar button'));	
// 		}
// 	});
// $('body').on('keyup','.queet-box-template',function(e){
// 	if(e.keyCode == 32) {
// 		shortenUrlsInBox($(this),$(this).find('.queet-counter'),$(this).find('.queet-toolbar button'));	
// 		}
// 	});	


/* · 
   · 
   ·   When clicking show more links, walk upwards or downwards
   ·   
   · · · · · · · · · · · · · */ 	
  	
$('body').on('click','.view-more-container-bottom', function(){
	findReplyToStatusAndShow($(this).parent('.stream-item').attr('data-quitter-id'),$(this).attr('data-replies-after'));
	$(this).remove();
	});
$('body').on('click','.view-more-container-top', function(){

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

$('body').on('click','.show-full-conversation',function(){

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

