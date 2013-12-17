/* File Name: grab_event.js
*  Brief: The event-grabing process for Dicitonary Searcher
*  Author: Jyun-Yao Huang ( allen501pc@gmail.com )
*  Update Time: Dec 17, 2013.
*  Website: http://www.allenworkspace.net , http://blog.allenworkspace.net
*/

var myChromeRightClickElement = null; // right click web element.
var myChromeEventLocationX = 0;
var myChromeEventLocationY = 0;
var myChromeSelectedElement = null; // right click selected text.
var myChromeRightClickEvent = null; // right click event.
var myChromeNotification = null;
var myChromeDictionaryTimer = null;
var myChromeImagePath = chrome.extension.getURL("icon-small.png"); // Logo.

chrome.extension.onMessage.addListener(
  function(request, sender, sendResponse) {
    //alert(request.greeting);	
	// 先關閉Tool tip.
	if(myChromeDictionaryTimer!=null)
	{
		clearTimeout(myChromeDictionaryTimer);
	}
	$(".dictionary_tooltip").remove();		
	if(request.data !=null)
	{
		myChromeNotification = $("<span class='dictionary_tooltip'><div class='header'><img src='"+myChromeImagePath+"' width='16px' height='16px' />&nbsp;&nbsp;艾倫查字典<div class='close_dictionary_tooltip'>[X]</div></div><div>"+request.keyword+"</div><div class='dictionary_content'><br />"+request.data+"</div></span>");	
	}
	else
	{
		myChromeNotification = $("<span class='dictionary_tooltip'><div class='header'><img src='"+myChromeImagePath+"' width='16px' height='16px' /><div class='close_dictionary_tooltip'>[X]</div></div><div>"+request.keyword+"</div><div class='dictionary_content'><br /><span style='color:red;'>查無此翻譯！</span></div></span>");	
	}
	$("body").prepend(myChromeNotification);	
	// Default 30 seconds.
	myChromeDictionaryTimer = setTimeout(function() { myChromeNotification.fadeOut("fast"); },30000);
	$(".close_dictionary_tooltip").click(function() { $(this).parent().parent().fadeOut("fast"); });	

	sendResponse({request:"OK"});
});