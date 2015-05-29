/* File Name: background.js
*  Brief: The background process for Dicitonary Searcher
*  Author: Jyun-Yao Huang ( allen501pc@gmail.com )
*  Update Time: Dec 17, 2013.
*  Website: http://www.allenworkspace.net , http://blog.allenworkspace.net
*/

var req = new XMLHttpRequest(); // Create AJAX XML Request.
var background_search_result = ""; // Search result.
var background_search_keyword = ""; // Searched keyword.
var notification=null; // notificaiton object.

// Set Desktop Notification.
function notif()
{		
	if(notification!=null) // 若存在notification. 
	{
		notification.cancel();
	}
	if(background_search_result!="") // 若有找到翻譯內容.
	{
		notification = webkitNotifications.createNotification(
			'icon.png',  // icon url - can be relative
			background_search_keyword,  // notification title
			background_search_result // notification body text
		);
	}
	else // 若沒有找到單字.
	{
		notification = webkitNotifications.createNotification(
			'icon.png',  // icon url - can be relative
			background_search_keyword,  // notification title
			"抱歉，查無此翻譯。" // notification body text
		);
	}
	notification.show();
	
	var timeout = 20000; // Time out = 20 seconds.
	
	if(timeout > 0) 
	{      
		setTimeout(function(){
			notification.cancel();
		}, timeout);
	}
	
}

/* Brief: Fetch the searched result. Assign it into global variables then call desktop notificaiton.
*  Input: None.
*  Output: None.
*/	
function fetch_result()
{
    var myResult = req.responseText;	
    var content1 = $(myResult).find("#pronunciation_pos"); // 音標. 
	var content2 = $(myResult).find(".searchCenterMiddle > li")[1]; // 解釋	
	var other = $(myResult).find(".searchCenterMiddle > li").last();
	var synonym = $(myResult).find(".searchCenterMiddle").find("#synonyms").parent().parent().parent().parent(); // 同義字
	var antonym = $(myResult).find(".searchCenterMiddle").find("#antonyms").parent().parent().parent().parent(); // 反義字
	var variation = $(myResult).find(".searchCenterMiddle").find("#variation").parent().parent().parent().parent();  // 動詞變化
	var isFirst = true;
	var isListOfFoundExplanation= false;
	/*
	$(myResult).find(".result_cluster_first").find(".explanation_pos_wrapper").each(function() {
		if($(this).find(".explanation_group_hd").html() !=null)
		{
			content2 += "<div style='color:blue;'>"+$(this).find(".explanation_group_hd").html()+"</div>";	
			isFirst = true;
			var count = 0;

			$(this).find(".explanation_group_hd").next().find(".explanation").each(function(key,value) {
				count = count +1;
				isListOfFoundExplanation = true;
				if(isFirst)
				{			
				content2 += count+".&nbsp;"+$(value).html();
				isFirst = false;
				}
				else
				content2 += "<br />"+count+".&nbsp;"+$(value).html();
			});
		}
		
	}); // 只有單字解釋
	
	if(!isListOfFoundExplanation)
	{
	    content2 += $(myResult).find(".result_cluster_first").find(".explanation_pos_wrapper").find(".explanation_ol").html();
	}
	*/
	var output = "";
			if(content1.length != 0) {
					output = output + "<font style='color:blue;'>音標:</font>"+content1.text() ;
			}
			// 若沒有變化形
			if( variation.length != 0 ) {
				output = output + $(variation).html();				
			}
			if( synonym.length != 0 ) {
				output = output + $(synonym).html();				
			}	
			if( antonym.length != 0 ) {
				output = output + $(antonym).html();
			}
			if( content2.length != 0 ) {
				$(content2).find("*").removeAttr("style");
				$(content2).find("*").removeAttr("class");				
				output = output + $(content2).html();
			}
			
			if( other.length != 0 ) {
				$(other).find("*").removeAttr("style");				
				$(other).find("*").removeAttr("class");				
				output = output + $(other).html();
			}
			
	
	background_search_result = output;
	if(background_search_result!="" && background_search_result!=null) // 若查到單字解釋，則Assign查到的單字.
	{
		// 找到的單字
		var found_word= $(myResult).find("#term")[0];
		found_word = $(found_word).text();
		
		// 如果查到的單字跟輸入的不一樣，則跳出提示。
		if(found_word!=null && found_word!="" && background_search_keyword != found_word)
		{
			background_search_keyword = "<span style='font-style:italic;font-size:12px;color:red;'>請問您要找的是不是這個單字？</span><br>"+ ("<b>"+found_word +"</b><br>");  
		}
		else
			background_search_keyword = ("<b>"+found_word +"</b><br>");				
	}
	
	var messageData = "";
	if(background_search_result==null || background_search_result == "")  // 若查無單字翻譯
	{
		messageData = "<br /><span style='color:red;'>查無此翻譯！</span>";
	}
	else
		messageData = background_search_result;
	/* Send message to grab_event.js. */
	chrome.tabs.getSelected(null, function(targetTab) {
			chrome.tabs.sendMessage(targetTab.id, {data: messageData, keyword: background_search_keyword }, function(response) {
			
		});
	});
	
	/* 關閉桌面提醒 */
	// notif();
}

/* Brief: Grab right click object.
*  Input: info -  the chrome info object.
*         tab - the current tab object.
*  Output: none.
*/
function searchOnClick(info, tab) {
	/* start query. */
	background_search_keyword = info.selectionText;
	setTimeout(background_search,10);
}

/* Brief: Background search for Yahoo by AJAX
 * Input: none.
 * Output: none.
 */
function background_search()
{	
    req.open(
        "GET",
	"http://tw.dictionary.search.yahoo.com/search?fr2=dict&p=" +  background_search_keyword      
        ,false);
    req.onload = fetch_result;    
    req.send(null);
    
}

// Set title of the context menu.
var title = "查詢 \'%s\' 的翻譯";
// Create context menu.
chrome.contextMenus.create({"title":title, "contexts":['selection'],"onclick":searchOnClick});
