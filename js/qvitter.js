
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
   ·   fix login and register box to top when they reach top 
   · 
   · · · · · · · · · · · · · */ 
	
$(window).scroll(function(e){ 
// 	console.log($('#feed').offset().top);
	if ($(this).scrollTop() > ($('#feed').offset().top-50) && $('#login-content').css('position') != 'fixed'){ 
		$('#login-content, .front-signup').not('#popup-signup').css({'position': 'fixed', 'top': '50px'}); 
		}
	else if ($(this).scrollTop() < ($('#feed').offset().top-50) && $('#login-content').css('position') != 'absolute'){ 
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

if(!window.registrationsClosed) {
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
   ·   autologin or show welcome screen
   · 
   · · · · · · · · · · · · · */ 

$('#submit-login').removeAttr('disabled'); // might be remebered by browser...   
$(window).load(function() {

	$('#user-container').css('display','block');
	$('#feed').css('display','block');		

	// login or not
	if(window.loggedIn) {
		console.log('logged in user: ' + window.loggedIn.screen_name);	
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
	});	

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
		
		// set colors if the api supports it
		if(typeof window.loggedIn.linkcolor != 'undefined' &&
	       typeof window.loggedIn.backgroundcolor != 'undefined') {
			window.loggedIn.linkcolor = window.loggedIn.linkcolor || '';	// no null value		
			window.loggedIn.backgroundcolor = window.loggedIn.backgroundcolor || ''; // no null value
			window.userLinkColor = window.loggedIn.linkcolor;
			window.userBackgroundColor = window.loggedIn.backgroundcolor;			       
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
		$('#qvitter-notice').show();
		$('#user-avatar').attr('src', window.loggedIn.profile_image_url_profile_size);
		$('#user-name').append(window.loggedIn.name);
		$('#user-screen-name').append(window.loggedIn.screen_name);
		$('#user-profile-link').append('<a href="' + window.loggedIn.statusnet_profile_url + '">' + window.sL.viewMyProfilePage + '</a>');
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
		
		// get all users i'm following for autosuggestion
		window.following = new Array();
		getFromAPI('qvitter/allfollowing/' + window.loggedIn.screen_name + '.json',function(data){
			if(data) {
				var i=0;
				$.each(data,function(k,v){
					if(v[2] === false) { var avatar = window.defaultAvatarStreamSize; }
					else { 	var avatar = window.avatarRoot + v[2]; }
					v[0] = v[0] || v[1]; // if name is null we go with username there too
					window.following[i] = { 'id': k,'name': v[0], 'username': v[1],'avatar': avatar };
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
   ·   Settings
   · 
   · · · · · · · · · · · · · */ 
   
$('#settings').click(function(){
	// buttons to add later: '<div class="right"><button class="close">' + window.sL.cancelVerb + '</button><button class="primary disabled">' + window.sL.saveChanges + '</button></div>'
	popUpAction('popup-settings', window.sL.settings,'<div id="settings-container"><div><label for="link-color-selection">' + window.sL.linkColor + '</label><input id="link-color-selection" type="text" value="#' + window.userLinkColor + '" /></div><div><label for="link-color-selection">' + window.sL.backgroundColor + '</label><input id="background-color-selection" type="text" value="#' + window.userBackgroundColor + '" /></div><a href="' + window.siteInstanceURL + 'settings/profile" id="moresettings">' + window.sL.moreSettings + '</a></div>',false);
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
		$('body').css('background-image', 'url(' + window.fullUrlToThisQvitterApp + 'img/mela.jpg)');
		}
											
	$('input#nickname').focus();	
	$('.front-signup').animate({opacity:'1'},200);
	if(doShake || localStorage.doShake) {
		$('input#nickname').css('background-color','pink');
		$('input#password').css('background-color','pink');		
		}
	$('#login-content').animate({opacity:'1'},200, function(){
		if(doShake || localStorage.doShake) {
			$('#login-content').effect('shake',{distance:5,times:2},function(){
				$('input#nickname').animate({backgroundColor:'#fff'},1000);
				$('input#password').animate({backgroundColor:'#fff'},1000);					
				delete localStorage.doShake;
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
		else if ((/^[a-zA-Z0-9]+$/.test($(this).attr('href').replace('http://','').replace('https://','').replace(window.siteRootDomain + '/','')))) {
			e.preventDefault();
			if($(this).parent().attr('id') == 'user-profile-link') { // logged in user
				setNewCurrentStream('statuses/user_timeline.json?screen_name=' + window.loggedIn.screen_name,function(){},true);	
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
		// notices
		else if ($(this).attr('href').indexOf(window.siteRootDomain + '/notice/')>-1) {
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
		         && typeof window.loggedIn.screen_name != 'undefined') { // if logged in
			e.preventDefault();
			display_spinner();
			getFromAPI('externalprofile/show.json?profileurl=' + encodeURIComponent($(this).attr('href')),function(data){
				// external user found locally
				if(data) {
					
					console.log(data);
					
					// empty strings and zeros instead of null
					data = cleanUpUserObject(data);
					
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
// 					if(serverUrl.substring(0,8) == 'https://') {
// 						console.log(userApiUrl);
// 						$.ajax({ url: userApiUrl, type: "GET", dataType: "jsonp", success: function(data) { 
// 								console.log(data);
// 								}
// 							});
// 						}
// 					else {
// 						getFromAPI('externalproxy.json?url=' + encodeURIComponent(userApiUrl),function(data){
// 							if(data) {
// 							
// 								}
// 							});
// 						}
					
					
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
   ·   Check for new queets and notifications
   ·   
   · · · · · · · · · · · · · */ 

var checkForNewNotificationsInterval=window.setInterval(function(){checkForNewNotifications()},window.timeBetweenPolling);
checkForNewNotifications();
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
		&& !$(event.target).is('.cm-mention')
		&& !$(event.target).is('.cm-tag')
		&& !$(event.target).is('.cm-group')
		&& !$(event.target).is('.cm-url')						
		&& !$(event.target).is('pre')		
		&& !$(event.target).is('.name')
		&& !$(event.target).is('.queet-box')	
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

	// fix the width of the queet box, otherwise the syntax highlighting break
	var queetBoxWidth = $('#popup-reply-' + this_stream_item_id).find('.modal-body').find('.inline-reply-queetbox').width()-20;
	$('#popup-reply-' + this_stream_item_id).find('.modal-body').find('.queet-box-syntax').width(queetBoxWidth);
	$('#popup-reply-' + this_stream_item_id).find('.modal-body').find('.syntax-middle').width(queetBoxWidth);	
	$('#popup-reply-' + this_stream_item_id).find('.modal-body').find('.two').width(queetBoxWidth);		

	$('#popup-reply-' + this_stream_item_id).find('.modal-body').find('.queet-box').trigger('click'); // expand
	});
	

/* · 
   · 
   ·   When clicking the compose button on mobile view
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
	$('.modal-container').remove();
	});
$('body').on('click','.modal-close',function(){
	$('.modal-container').remove();
	});	
$(document).keyup(function(e){
	if(e.keyCode==27) {
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

		var queetText =  $.trim(queetBox.html().replace(/\n/g,'').replace(/<br>/g,"\n"));
		var queetHtml = '<div id="' + tempPostId + '" class="stream-item conversation temp-post" style="opacity:1"><div class="queet"><span class="dogear"></span><div class="queet-content"><div class="stream-item-header"><a class="account-group"><img class="avatar" src="' + $('#user-avatar').attr('src') + '" /><strong class="name">' + $('#user-name').html() + '</strong> <span class="screen-name">@' + $('#user-screen-name').html() + '</span></a><small class="created-at">posting</small></div><div class="queet-text">' + queetText.replace(/\n/g,'<br>') + '</div><div class="stream-item-footer"><span class="stream-item-expand">&nbsp;</span></div></div></div></div>';
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
		
		// remove any popups
		$('.modal-container').remove();			
		
		// null reply box
		collapseQueetBox(queetBox)				
		
		// check for new queets (one second from) NOW 
		setTimeout('checkForNewQueets()', 1000);

		// post queet
		postQueetToAPI(queetText, in_reply_to_status_id, function(data){ if(data) {

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
   ·   Count chars in queet box on keyup
   ·   
   · · · · · · · · · · · · · */ 
$('body').on('keyup input paste','.queet-box-syntax',function () {
	countCharsInQueetBox($(this),$(this).siblings('.queet-toolbar').find('.queet-counter'),$(this).siblings('.queet-toolbar').find('.queet-button button'));
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

$('body').on('click','.queet-box-syntax',function () {
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
			var repliesLen = decodeURIComponent($(this).attr('data-replies-text')).length-11;			
			setSelectionRange($(this)[0], repliesLen, repliesLen);	 			
			}
		else {
			$(this).html('&nbsp;');			
			}
		$(this).trigger('input');		
		}
	});
$('body').on('blur','.queet-box-syntax',function () {
	if($(this).parent().parent().hasClass('modal-body')) {	
		// don't collapse if in a modal
		}
	else if($(this).attr('data-replies-text') != 'undefined') {
		var $startText = $('<div/>').append(decodeURIComponent($(this).attr('data-replies-text')));
		if($.trim($startText.text()) == $.trim($(this).text()) || $(this).html().length == 0 || $(this).html() == '<br>'  || $(this).html() == '<br />' || $(this).html() == '&nbsp;' || $(this).html() == '&nbsp;<br>') {
			collapseQueetBox($(this));			
			}
		}
	else if($(this).html().length == 0 || $(this).html() == '<br>'  || $(this).html() == '<br />' || $(this).html() == '&nbsp;' || $(this).html() == '&nbsp;<br>') {
		collapseQueetBox($(this));
		}
	});
	
function collapseQueetBox(qB) {
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
		var caretPos = getSelectionInElement($(this)[0]);
		var thisQueetBox = $(this).siblings('div.queet-box-syntax');
		thisQueetBox.focus();
		setSelectionRange(thisQueetBox[0], caretPos[0], caretPos[1]);	        
		// fixes problem with caret not showing after delete, unfocus and refocus
		if(thisQueetBox.html() == '<br>') {
			thisQueetBox.html(' ');
			}
	});


// strip html from paste
function stripHtmlFromPaste(e) {
	e.preventDefault();
	var text = e.clipboardData.getData("text/plain");
	document.execCommand("insertHTML", false, text);	
	}
	
// sync divs
$('body').on('keyup paste input', 'div.queet-box-syntax', function() {
	
	var currentVal = $(this).html();
	currentVal = currentVal.replace(/<br>$/, '').replace(/&nbsp;$/, '').replace(/ $/, ''); // fix
	$(this).siblings('.syntax-two').html(currentVal);

	// regexps
	var regexps = Object();
	regexps.externalMention = /(^|\s|\.|<br>)(@)[a-zA-Z0-9]+(@)[\wåäö\-\.]+(\.)((ac|ad|aero|af|ag|ai|al|am|an|ao|aq|arpa|asia|at|au|aw|ax|az|ba|bb|bd|be|bf|bg|bh|biz|bj|bm|bn|bo|br|bs|bt|bv|bw|by|bz|ca|cat|cc|cd|cf|cg|ch|ci|ck|cl|cm|cn|com|coop|cr|cu|cv|cw|cx|cy|cz|de|dj|dk|dm|do|dz|ec|edu|ee|eg|er|es|et|eu|fi|fj|fk|fm|fo|fr|ga|gb|gd|ge|gf|gg|gh|gi|gl|gm|gn|gov|gp|gq|gr|gs|gt|gu|gw|gy|hk|hm|hn|hr|ht|hu|id|ie|il|im|info|int|io|iq|ir|is|it|je|jm|jobs|jp|ke|kg|kh|ki|km|kn|kp|kr|kw|ky|kz|la|lb|lc|li|lk|lr|ls|lt|lu|lv|ly|ma|mc|md|me|mg|mh|mil|mk|ml|mm|mn|mobi|mp|mq|mr|ms|mt|museum|mv|mw|mx|my|mz|name|nc|net|nf|ng|ni|nl|no|np|nr|nu|nz|om|org|pa|pe|pf|pg|ph|pk|pl|pm|pn|post|pro|ps|pt|pw|py|qa|re|ro|rs|ru|rw|sa|sb|sc|sd|se|sg|sh|si|sj|sk|sl|sm|sn|so|sr|st|su|sv|sx|sy|sz|tc|td|tel|tf|tg|th|tj|tk|tl|tm|tn|to|tp|travel|tt|tv|tw|tz|ua|ug|uk|us|uy|uz|va|vc|ve|vg|vi|vn|vu|wf|ws|xxx|ye|yt|za|zm|zw)|(ae|ar|as|bi|co|in|jo|mo|mu|na|ne|pr|tr))($|\s|\.|\,|\:|\-|\<|\!|\?|\&)/;		
	regexps.mention = /(^|\s|\.|<br>)(@)[a-zA-Z0-9]+($|\s|\.|\,|\:|\-|\<|\!|\?|\&)/;				
	regexps.tag = /(^|\s|\.|<br>)(\#)[\wåäöÅÄÖ\-]+($|\s|\.|\,|\:|\-|\<|\!|\?|\&)/;	
	regexps.group = /(^|\s|\.|<br>)(\!)[a-zA-Z0-9]+($|\s|\.|\,|\:|\-|\<|\!|\?|\&)/;					
	regexps.url = /(^|\s|\.|<br>)(http\:\/\/|https\:\/\/)([\wåäö\-\.]+)?(\.)((ac|ad|aero|af|ag|ai|al|am|an|ao|aq|arpa|asia|at|au|aw|ax|az|ba|bb|bd|be|bf|bg|bh|biz|bj|bm|bn|bo|br|bs|bt|bv|bw|by|bz|ca|cat|cc|cd|cf|cg|ch|ci|ck|cl|cm|cn|com|coop|cr|cu|cv|cw|cx|cy|cz|de|dj|dk|dm|do|dz|ec|edu|ee|eg|er|es|et|eu|fi|fj|fk|fm|fo|fr|ga|gb|gd|ge|gf|gg|gh|gi|gl|gm|gn|gov|gp|gq|gr|gs|gt|gu|gw|gy|hk|hm|hn|hr|ht|hu|id|ie|il|im|info|int|io|iq|ir|is|it|je|jm|jobs|jp|ke|kg|kh|ki|km|kn|kp|kr|kw|ky|kz|la|lb|lc|li|lk|lr|ls|lt|lu|lv|ly|ma|mc|md|me|mg|mh|mil|mk|ml|mm|mn|mobi|mp|mq|mr|ms|mt|museum|mv|mw|mx|my|mz|name|nc|net|nf|ng|ni|nl|no|np|nr|nu|nz|om|org|pa|pe|pf|pg|ph|pk|pl|pm|pn|post|pro|ps|pt|pw|py|qa|re|ro|rs|ru|rw|sa|sb|sc|sd|se|sg|sh|si|sj|sk|sl|sm|sn|so|sr|st|su|sv|sx|sy|sz|tc|td|tel|tf|tg|th|tj|tk|tl|tm|tn|to|tp|travel|tt|tv|tw|tz|ua|ug|uk|us|uy|uz|va|vc|ve|vg|vi|vn|vu|wf|ws|xxx|ye|yt|za|zm|zw)|(ae|ar|as|bi|co|in|jo|mo|mu|na|ne|pr|tr))(\/[\wåäö\%\!\*\'\(\)\;\:\@\&\=\+\$\,\/\?\#\[\]\-\_\.\~]+)?(\/)?($|\s|\,|\:|\-|\<|\!|\?|\&)/;		
	regexps.urlWithoutProtocol = /(^|\s|\.|<br>)[\wåäö\-\.]+(\.)((ac|ad|aero|af|ag|ai|al|am|an|ao|aq|arpa|asia|at|au|aw|ax|az|ba|bb|bd|be|bf|bg|bh|biz|bj|bm|bn|bo|br|bs|bt|bv|bw|by|bz|ca|cat|cc|cd|cf|cg|ch|ci|ck|cl|cm|cn|com|coop|cr|cu|cv|cw|cx|cy|cz|de|dj|dk|dm|do|dz|ec|edu|ee|eg|er|es|et|eu|fi|fj|fk|fm|fo|fr|ga|gb|gd|ge|gf|gg|gh|gi|gl|gm|gn|gov|gp|gq|gr|gs|gt|gu|gw|gy|hk|hm|hn|hr|ht|hu|id|ie|il|im|info|int|io|iq|ir|is|it|je|jm|jobs|jp|ke|kg|kh|ki|km|kn|kp|kr|kw|ky|kz|la|lb|lc|li|lk|lr|ls|lt|lu|lv|ly|ma|mc|md|me|mg|mh|mil|mk|ml|mm|mn|mobi|mp|mq|mr|ms|mt|museum|mv|mw|mx|my|mz|name|nc|net|nf|ng|ni|nl|no|np|nr|nu|nz|om|org|pa|pe|pf|pg|ph|pk|pl|pm|pn|post|pro|ps|pt|pw|py|qa|re|ro|rs|ru|rw|sa|sb|sc|sd|se|sg|sh|si|sj|sk|sl|sm|sn|so|sr|st|su|sv|sx|sy|sz|tc|td|tel|tf|tg|th|tj|tk|tl|tm|tn|to|tp|travel|tt|tv|tw|tz|ua|ug|uk|us|uy|uz|va|vc|ve|vg|vi|vn|vu|wf|ws|xxx|ye|yt|za|zm|zw)|(ae|ar|as|bi|co|in|jo|mo|mu|na|ne|pr|tr))(\/[\wåäö\%\!\*\'\(\)\;\:\@\&\=\+\$\,\/\?\#\[\]\-\_\.\~]+)?(\/)?($|\s|\.|\,|\:|\-|\<|\!|\?|\&)/;
	regexps.email = /(^|\s|\.|<br>)([a-zA-Z0-9\!\#\$\%\&\'\*\+\-\/\=\?\^\_\`\{\|\}\~\.]+)?(@)[\wåäö\-\.]+(\.)((ac|ad|aero|af|ag|ai|al|am|an|ao|aq|arpa|asia|at|au|aw|ax|az|ba|bb|bd|be|bf|bg|bh|biz|bj|bm|bn|bo|br|bs|bt|bv|bw|by|bz|ca|cat|cc|cd|cf|cg|ch|ci|ck|cl|cm|cn|com|coop|cr|cu|cv|cw|cx|cy|cz|de|dj|dk|dm|do|dz|ec|edu|ee|eg|er|es|et|eu|fi|fj|fk|fm|fo|fr|ga|gb|gd|ge|gf|gg|gh|gi|gl|gm|gn|gov|gp|gq|gr|gs|gt|gu|gw|gy|hk|hm|hn|hr|ht|hu|id|ie|il|im|info|int|io|iq|ir|is|it|je|jm|jobs|jp|ke|kg|kh|ki|km|kn|kp|kr|kw|ky|kz|la|lb|lc|li|lk|lr|ls|lt|lu|lv|ly|ma|mc|md|me|mg|mh|mil|mk|ml|mm|mn|mobi|mp|mq|mr|ms|mt|museum|mv|mw|mx|my|mz|name|nc|net|nf|ng|ni|nl|no|np|nr|nu|nz|om|org|pa|pe|pf|pg|ph|pk|pl|pm|pn|post|pro|ps|pt|pw|py|qa|re|ro|rs|ru|rw|sa|sb|sc|sd|se|sg|sh|si|sj|sk|sl|sm|sn|so|sr|st|su|sv|sx|sy|sz|tc|td|tel|tf|tg|th|tj|tk|tl|tm|tn|to|tp|travel|tt|tv|tw|tz|ua|ug|uk|us|uy|uz|va|vc|ve|vg|vi|vn|vu|wf|ws|xxx|ye|yt|za|zm|zw)|(ae|ar|as|bi|co|in|jo|mo|mu|na|ne|pr|tr))($|\s|\.|\,|\:|\-|\<|\!|\?|\&)/;			


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
				$.each(window.following,function(){
					var userregex = new RegExp(term);
					if(this.username.toLowerCase().match(userregex) || this.name.toLowerCase().match(userregex)) {
						queetBox.siblings('.mentions-suggestions').append('<div><img height="24" width="24" src="' + this.avatar + '" /><strong>' + this.name + '</strong> @<span>' + this.username + '</span></div>')
						}
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
				if(data.cover_photo === false) {
					data.cover_photo = data.profile_image_url_original;
					}				
				$('#edit-profile-popup').prepend('\
					<div class="edit-profile-container">\
						<div class="profile-card">\
							<div class="profile-header-inner" style="background-image:url(' + data.cover_photo + ')">\
							   <input type="file" name="cover-photo-input" id="cover-photo-input" />\
							   <div class="upload-cover-photo"></div>\
							   <div class="profile-header-inner-overlay"></div>\
							   <a class="profile-picture" href="' + data.profile_image_url_original + '"><img src="' + data.profile_image_url_profile_size + '" /></a>\
							   <div class="profile-card-inner">\
								   <input class="fullname" id="edit-profile-fullname" placeholder="' + window.sL.signUpFullName + '" value="' + data.name + '" />\
								   <h2 class="username"><span class="screen-name">@' + data.screen_name + '</span><span class="follow-status"></span></h2>\
								   <div class="bio-container">\
									   <textarea class="bio" id="edit-profile-bio" placeholder="' + window.sL.registerBio + '">' + data.description + '</textarea>\
								   </div>\
								   <p class="location-and-url">\
									   <input class="location" id="edit-profile-location" placeholder="' + window.sL.registerLocation + '" value="' + data.location + '" />\
									   <span class="divider"> · </span>\
									   <input class="url" id="edit-profile-url" placeholder="' + window.sL.registerHomepage + '" value="' + data.url + '" />\
								   </p>\
							   </div>\
							</div>\
							<div class="profile-banner-footer">\
							   <div class="user-actions">\
							       <button type="button" class="abort-edit-profile-button"><span class="button-text edit-profile-text">' + window.sL.cancelVerb + '</span>\
								   <button type="button" class="save-profile-button"><span class="button-text edit-profile-text">' + window.sL.saveChanges + '</span>\
							   </div>\
							   <div class="clearfix"></div>\
							</div>\
						</div>\
					</div>');
				$('#edit-profile-popup .profile-card').css('top',$('#page-container .profile-card').offset().top-53 + 'px'); // position exactly over
				}
			else {
				abortEditProfile();
				}
			});				
		}	
	});
// cancel
$('body').on('click','.abort-edit-profile-button',function(){
	// if this is the cover photo
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
// submit
$('body').on('click','.save-profile-button',function(){
	$('.save-profile-button').attr('disabled','disabled');		
	$('.save-profile-button').addClass('disabled');
	display_spinner();

	// if this is the cover photo
	if($('#edit-profile-popup .jwc_frame').length>0) {
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
					$('.save-profile-button').removeAttr('disabled');		
					$('.save-profile-button').removeClass('disabled');
					cleanUpAfterCropping();
					$('.profile-header-inner').css('background-image','url(' + data.url + ')');
					}
				 else {
					alert('Try again! ' + data.error);
					$('.save-profile-button').removeAttr('disabled');		
					$('.save-profile-button').removeClass('disabled');
					}
				 }
			});							
		}
	// if profile info
	else {
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
// cover photo select and crop
$('body').on('click','.upload-cover-photo',function(){
	$('input:file').click(function(){ $(this).one('change',function(e){ // trick to make the change event only fire once when selecting a file		
		renderFileInput2(e);
		})});
	
	// trigger click for firefox
	if(navigator.userAgent.toLowerCase().indexOf('firefox') > -1) {
		$('#cover-photo-input').trigger('click');
		}
	// other browsers
	else {
		var evt = document.createEvent("HTMLEvents");
		evt.initEvent("click", true, true); 
		$('#cover-photo-input')[0].dispatchEvent(evt);		
		}	
	});

// load image from file input
function renderFileInput2(e) {
	
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
						var appendedImg = $('#edit-profile-popup .profile-header-inner').prepend('<img id="cover-photo-to-crop" src="' + img.toDataURL('image/jpeg') +  '" />');
					
						// enable cropping
						$('#cover-photo-to-crop').jWindowCrop({
							targetWidth:520,
							targetHeight:260,
							onChange: function(result) {
								remove_spinner();    
								}
							});
						window.jwc = $('#cover-photo-to-crop').getjWindowCrop();						
						}
					else {
						remove_spinner();  
						alert('could not read image');
						}
					},
				{ maxWidth: 1040,
				  minWidth:1040,
				  canvas: true,
				  orientation: orientation } // Options
			);	
		});						
	}
function cleanUpAfterCropping(){
	if(typeof window.jwc != 'undefined') {
		window.jwc.destroy();
		}
	$('.jwc_frame').remove();
	$('#cover-photo-to-crop').remove();
	$('input:file').unbind('click');	
	}