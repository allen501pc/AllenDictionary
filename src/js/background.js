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
    var content1 = $(myResult).find(".proun_wrapper").text(); // 音標.    
	
	// var content2 = $(myResult).find("#details-panel").find(".bd .caption,.bd .interpret").text(); // 只有單字解釋.
	var content2 = "";
	var isFirst = true;
	var isListOfFoundExplanation= false;
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

	background_search_result = content2;
	if(background_search_result!="" && background_search_result!=null) // 若查到單字解釋，則Assign查到的單字.
	{
		// 找到的單字
		var found_word= $(myResult).find(".title_term").find(".yschttl").text();
		// 如果查到的單字跟輸入的不一樣，則跳出提示。
		if(found_word!=null && found_word!="" && background_search_keyword != found_word)
		{
			background_search_keyword = "<span style='font-style:italic;font-size:12px;color:red;'>請問您要找的是不是這個單字？</span><br>"+ ("<b>"+found_word +"</b><br>");  
		}
		else
			background_search_keyword = ("<b>"+found_word +"</b><br>");				
	}
	
	if(content1!="") // 若有音標.
	{		
		background_search_keyword += "音標:"+content1+"<br />";
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
	"http://tw.dictionary.search.yahoo.com/search?p=" +  background_search_keyword      
        ,false);
    req.onload = fetch_result;    
    req.send(null);
    
}

// Set title of the context menu.
var title = "查詢 \'%s\' 的翻譯";
// Create context menu.
chrome.contextMenus.create({"title":title, "contexts":['selection'],"onclick":searchOnClick});
