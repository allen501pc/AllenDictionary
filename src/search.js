/* File Name: search.js
*  Brief: The search process for Dicitonary Searcher
*  Author: Jyun-Yao Huang ( allen501pc@gmail.com )
*  Update Time: Dec 17, 2013.
*  Website: http://www.allenworkspace.net , http://blog.allenworkspace.net
*/

// JavaScript Document
var req = new XMLHttpRequest();
var background_search_result = "";
var background_search_keyword = "";

// Version: 1.0.0
//先確定瀏覽器是否支援indexedDB
var myAllenDB = null;
var indexedDB = window.indexedDB || window.webkitIndexedDB;
var requestDB = indexedDB.open("AllenDictDB", 1);

// Version: 1.0.0
// 當資料庫建立成功的時候，將截取的資訊放在myAllenDB變數內。
requestDB.onsuccess = function (e) {
    // 將db暫存起來供以後操作
    myAllenDB = requestDB.result; 
	//console.log("開啟DB成功");
};

// Version: 1.0.0
// 資料庫建立失敗，會回傳的訊息。
requestDB.onerror = function (e) {
    // console.log("IndexedDB error: " + e.target.errorCode);
};
// Version: 1.0.0
// 資料庫版本升級或是沒有建立資料庫的時候，會執行此method.
requestDB.onupgradeneeded = function (e) {
	// 建立名為Records的資料表
    var objectStore = e.currentTarget.result.createObjectStore("Records", { keyPath: "id", autoIncrement: true });
	// 存放單字
    objectStore.createIndex("r_word", "r_word", { unique: true });
	// 存放內容與解釋
	objectStore.createIndex("r_content","r_content",{ unique: false });
	// console.log("IndexedDB has been created");
	// Version: 1.0.0
	// 建立名為Settings的資料表
    // var objectStore2 = e.currentTarget.result.createObjectStore("Settings", { keyPath: "id", autoIncrement: false });
	// 是否記錄？
	// objectStore2.createIndex("s_recording", "s_recording", {unique: false });
	// 是否開啟已查詢過的單字提示?
	// objectStore2.createIndex("s_recording", "s_recording", {unique: false });
};

/* Brief: Show search result.
 * Input: None.
 * Output: None.
 */
function show_result()
{
    if( document.getElementById("keyword").value!="")
    {
    
	$("#keyword").select(); // 把Key in 的word全選.
	
        var myResult = req.responseText;        				
		var content1 = $(myResult).find("#pronunciation_pos"); // 音標.  	
		var voice = $(myResult).find("#proun_sound"); // 音標聲音按鈕	
		var content2 = $(myResult).find(".searchCenterMiddle > li")[1]; // 解釋
		var other = $(myResult).find(".searchCenterMiddle > li").last();
        //var content2 = $(myResult).find("ul.explanation_wrapper"); // 尋找查到的單字內容.                
        
	$("#word").html(""); // 初始單字內容
	// Version: 1.0.0 
	// 已查詢過的單字提示
	$("#has_been_found").css("display","none");
	var synonym = $(myResult).find(".searchCenterMiddle").find("#synonyms").parent().parent().parent().parent(); // 同義字

	var antonym = $(myResult).find(".searchCenterMiddle").find("#antonyms").parent().parent().parent().parent(); // 反義字
	var variation = $(myResult).find(".searchCenterMiddle").find("#variation").parent().parent().parent().parent();  // 動詞變化
		if($(content2).html()!=null && $(content2).html() !="")  // 若查到單字內容，將資料輸出。
		{			
			// 找到的單字.
			var word= $(myResult).find("#term")[0];
			word = $(word).text();
			
			if(word != document.getElementById("keyword").value) // 如果找到的單字跟輸入的不一樣，則跳出Hint.
			{								
				$("#spell_hint").css("display","inline");
			}
			else  // 否則隱藏hint.
			{
				$("#spell_hint").css("display","none");
			}
			$("#word").html(word); //插入單字.	

			// Version: 1.0.0
			// 建立Transaction			
			var transaction = myAllenDB.transaction("Records", "readwrite");
			// 查詢是否有在records內?
			has_in_records(transaction,word);
			// 建立objectStore，儲存records
			var objectStore = transaction.objectStore("Records");                    
			var request2 = objectStore.add({ r_word: word,r_content:"" });
			request2.onsuccess = function (evt) {
				// 資料儲存成功                       
			};	
			
			var output = "";
			if(content1.length != 0) {
					output = output + "<font style='color:blue;'>音標:</font>"+content1.text() ;
			}
			// 若沒有變化形
			if(variation.length != 0) {
				output = output + $(variation).html();				
			}
			if(synonym.length != 0) {
				output = output + $(synonym).html();				
			}	
			if(antonym.length != 0 ) {
				output = output + $(antonym).html();
			}
			if(content2.length != 0 ) {
				$(content2).find("*").removeAttr("style");
				$(content2).find("*").removeAttr("class");		
				output = output + $(content2).html();
			}
			
			if(other.length != 0) {
				$(other).find("*").removeAttr("style");				
				$(other).find("*").removeAttr("class");				
				output = output + $(other).html();
			}
			$("#searched_content").html(output);
			
			// 詞性標註字詞大小
			// $("#searched_content").find("h5").css("font-size","14px");
		}
		else // 查無此翻譯，則秀出提醒.
		{
			$("#searched_content").html("<div style='color:red;margin-top:10px;'>抱歉，查無此翻譯！</div>");
		}		
    }            
}
// Version: 1.0.0
// Brief: 找尋這個單字是否已經在歷史紀錄中？
function has_in_records(target_transaction,target_word)
{
	
	var requestLog = target_transaction.objectStore("Records").index("r_word");
	var myRequest = requestLog.openCursor(IDBKeyRange.only(target_word),"next");
	
	myRequest.onsuccess = function(evt) { 
		var cursor = evt.target.result;  

		if (cursor!=null) {
			$("#has_been_found").css("display","inline");
			return true;
		}  
		else {			
			//查詢結束
			$("#has_been_found").css("display","none");
			return false;
		}  
	};	
}

/* Brief: 開啟AJAX Query，到Yahoo字典作查詢。 */
function do_search()
{
    
    req.open(
        "GET",
        "http://tw.dictionary.search.yahoo.com/search?fr2=dict&p=" +  document.getElementById("keyword").value
        ,false);
    
    req.onreadystatechange = function() {
    if (req.readyState == 4) {
	// JSON.parse does not evaluate the attacker's scripts.
	req.onload = show_result;    
	// var resp = JSON.parse(xhr.responseText);
	}
    }
    req.send();
	    
}

// 進行查詢
function clickHandler(e)
{
    setTimeout(do_search,10);
}

// Version: 1.0.0
// 查找歷史紀錄單字
function showRecordsHandler(e)
{
	$("#has_been_found").css("display","none");
	var requestLog = myAllenDB.transaction("Records", "readonly").objectStore("Records").openCursor(null,"prev");
	//console.log(requestLog);
	background_search_result = "<ul>";
	requestLog.onsuccess = function(evt) {  
		var cursor = evt.target.result;  
		
		if (cursor) {
			background_search_result = background_search_result + "<li>"+cursor.value.r_word + "</li>";
			//console.log(background_search_result);
			cursor.continue();  
		}  
		else {			
			//查詢結束 
			// 隱藏提示
			$("#spell_hint").css("display","none");
			// 清空查詢的單字內容，換成標題
			$("#word").html("已查詢過的單字");
			$("#searched_content").html(background_search_result);
		}  
	};	
}

/* 載入時，作Popup頁面初始化 */
document.addEventListener('DOMContentLoaded', function () {
  // 加入查詢按鈕按下去後的事件。
  document.getElementById("button").addEventListener('click', clickHandler);
  // 加入搜尋英文單字，若按下Enter後的處理事件。
  document.querySelector('input').addEventListener('change', clickHandler);
  // Version: 1.0.0
  // 加入查詢記錄按鈕按下去的事件。
  document.getElementById("buttonOfRecords").addEventListener('click', showRecordsHandler);
  
  /* 自動將cursor對準搜尋框 */
  if(location.search != "?focusHack")
  {
	location.search = "?focusHack";
  }
});


