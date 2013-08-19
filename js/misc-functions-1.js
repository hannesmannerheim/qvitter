
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
	return $streamItem.html().replace(/@<span class="vcard">/gi,'<span class="vcard">').replace(/!<span class="vcard">/gi,'<span class="vcard">').replace(/#<span class="tag">/gi,'<span class="tag">'); // hacky way to get @#! into mention tags to stop bidirection (css sets an @ with before content method)
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
   
function display_spinner() { 
	if($('.spinner-wrap').length==0) {
		$('body').prepend('<div class="spinner-wrap"><div class="spinner"><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i></div></div>');
		}
	}	
function remove_spinner() {	
	$('.spinner-wrap').remove();
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
			$(this).replaceWith($('<span class="attachment more" data-attachment-id="' + $(this).attr('href').substring(29) + '">…</span>'));			
			}
		});
	}


/* · 
   · 
   ·   Places the caret at the end of the contenteditable 
   ·
   ·   @param el: the contenteditable-element
   · 
   · · · · · · · · · · · · · */
   
function placeCaretAtEnd(el) {
    el.focus();
    if (typeof window.getSelection != "undefined"
            && typeof document.createRange != "undefined") {
        var range = document.createRange();
        range.selectNodeContents(el);
        range.collapse(false);
        var sel = window.getSelection();
        sel.removeAllRanges();
        sel.addRange(range);
    } else if (typeof document.body.createTextRange != "undefined") {
        var textRange = document.body.createTextRange();
        textRange.moveToElementText(el);
        textRange.collapse(false);
        textRange.select();
    }
}


/* · 
   · 
   ·   Updates the local storage
   ·
   · · · · · · · · · · · · · */
   
function updateHistoryLocalStorage() {
	var i=0;
	var localStorageName = window.username + '-history-container';
	var historyContainer = new Object();
	$.each($('#history-container .stream-selection'), function(key,obj) {
		historyContainer[i] = new Object();
		historyContainer[i].dataStreamName = $(obj).attr('data-stream-name');
		historyContainer[i].dataStreamHeader = $(obj).attr('data-stream-header');			
		i++;
		});
	localStorage[localStorageName] = JSON.stringify(historyContainer);
	if($('#history-container .stream-selection').length==0) {
		$('#history-container').css('display','none');
		}
	else {
		$('#history-container').css('display','block');
		}
	$('#history-container').sortable({delay: 100});
	$('#history-container').disableSelection();		
	}


/* · 
   · 
   ·   Loads history from local storage to menu
   · 
   · · · · · · · · · · · · · */
   
function loadHistoryFromLocalStorage() {
	var localStorageName = window.username + '-history-container';
	if(typeof localStorage[localStorageName] != "undefined") {
		$('#history-container').css('display','block');
		$('#history-container').html('');																										
		var historyContainer = $.parseJSON(localStorage[localStorageName]);
		$.each(historyContainer, function(key,obj) {
			$('#history-container').append('<div class="stream-selection" data-stream-header="' + obj.dataStreamHeader + '" data-stream-name="' + obj.dataStreamName + '">' + obj.dataStreamHeader + '<i class="close-right"></i><i class="chev-right"></i></div>');
			});
		}
	updateHistoryLocalStorage();
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
   ·   @param src: the queetbox
   ·   @param trgt: the counter
   ·   @param btn: the button 
   ·   
   · · · · · · · · · · · · · */ 

function countCharsInQueetBox(src,trgt,btn) {
	var $src_txt = $('<div/>').append($.trim(src.html()).replace(/&nbsp;/gi,'').replace(/<br>/i,'').replace(/<br>/gi,"x"));
	var numchars = ($.trim($src_txt.text())).length;
	trgt.html(140 - numchars);

	// activate/deactivare button
	if(src.html().replace(/\s/g, '').replace(/&nbsp;/gi,'').replace(/<br>/gi,'') != unescape(src.attr('data-start-html')).replace(/\s/g, '').replace(/&nbsp;/gi,'').replace(/<br>/gi,'')) {
		if(src.text().replace(/\s/g, '').replace(/&nbsp;/gi,'').replace(/<br>/gi,'').length==0) {
			btn.removeClass('enabled');
			btn.addClass('disabled');	
			}
		else if((140-numchars) < 0) {
			btn.removeClass('enabled');
			btn.addClass('disabled');			
			}
		else {
			btn.removeClass('disabled');
			btn.addClass('enabled');
			}
		}
	else {
		btn.removeClass('enabled');
		btn.addClass('disabled');
		}	
		
	// counter color		
	if((140-numchars) < 0) {
		trgt.css('color','#D40D12');
		}
	else if(src.html().length == 0 || src.html() == '<br>'  || src.html() == '<br />') {
		trgt.removeAttr('style');	
		}	
	else {
		trgt.removeAttr('style');			
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
	   if(typeof callback !== 'undefined'){
			$('html, body').animate({ scrollTop: pos}, 1000, 'easeOutExpo',function(){
				callback();
				});		   	
		   	}
	    else {
	    	$('html, body').animate({ scrollTop: pos }, 1000, 'easeOutExpo');
	    	}
		}
	else {
		$('html, body').scrollTop(pos);
		}			
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