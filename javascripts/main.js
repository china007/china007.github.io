/**
 *自适应各种手机模式

var phoneWidth = parseInt(window.screen.width);
var phoneScale = phoneWidth / 320;
var ua = navigator.userAgent;
if (/Android (\d+\.\d+)/.test(ua)) {
	var version = parseFloat(RegExp.$1);
	if (version > 2.3) {
		document.write('<meta name="viewport" content="width=320, minimum-scale = ' + phoneScale + ', maximum-scale = ' + phoneScale + ',target-densitydpi=device-dpi">');
	} else {
		document.write('<meta name="viewport" content="width=320, target-densitydpi=device-dpi">');
	}
} else {
	document.write('<meta name="viewport" content="width=320, user-scalable=no, target-densitydpi=device-dpi">');
}
 */
var Sys = {};
bowerInfo();
var page=0;
var MaxEmoji=90;
//服务器
BmobSocketIo.initialize("4733f138065d979e5bea5a43bd4bdf0a");
Bmob.initialize("4733f138065d979e5bea5a43bd4bdf0a", "e78ae2b9cf7e63e9066f6336a6822a1c");
/*//检查是否已登陆
var currentUser = Bmob.User.current();
var lastTime ="";
if (currentUser) {
	console.log("已登陆");
	// 取得userId
	var userId = currentUser.id;
} else {
	console.log("未登陆");
	window.location.href='./';
	// show the signup or login page
}*/

var userList={};
userList["All"]={"name":"群聊","chatLastTime":""};
getUserList();
$(function() {

	//取得历史消息
	getHistory();
	saveIp();
	$("#fileImg").click(function() {
		var selectFile = document.getElementById("selectFile");
		selectFile.click();
	});
	//初始化表情
	initEmoji();
});

/**
 *
 */
 function bowerInfo(){
        var ua = navigator.userAgent.toLowerCase();
        var s;
        (s = ua.match(/rv:([\d.]+)\) like gecko/)) ? Sys.ie = s[1] :
        (s = ua.match(/msie ([\d.]+)/)) ? Sys.ie = s[1] :
        (s = ua.match(/firefox\/([\d.]+)/)) ? Sys.firefox = s[1] :
        (s = ua.match(/chrome\/([\d.]+)/)) ? Sys.chrome = s[1] :
        (s = ua.match(/opera.([\d.]+)/)) ? Sys.opera = s[1] :
        (s = ua.match(/version\/([\d.]+).*safari/)) ? Sys.safari = s[1] : 0;
        
        /*if (Sys.ie) document.write('IE: ' + Sys.ie);
        if (Sys.firefox) document.write('Firefox: ' + Sys.firefox);
        if (Sys.chrome) document.write('Chrome: ' + Sys.chrome);
        if (Sys.opera) document.write('Opera: ' + Sys.opera);
        if (Sys.safari) document.write('Safari: ' + Sys.safari);*/
		if (Sys.safari){
			document.write('<meta name="viewport" content="width=320">');
		}
 }
/**
 * 显示好友tab
 */
function showFrindTab(){
	var innerMenuStr='';
	var innerTabStr='';
	for(var k in userList){
		if(k!=userId){
			innerMenuStr+='<li><a id=menu'+k+' class="chatMenu" onclick=changeSendTo("'+k+'")><span>'+userList[k].name+'</span></a></li>';
			innerTabStr +='<div id=data'+k+'  class="chatTab"></div>';
		}
	}
	innerMenuStr+='<input type="button" onclick="logout();" style="float:right;height:30px;" value="注销">';
	document.getElementById('menu').innerHTML=innerMenuStr;
	document.getElementById('mycontent').innerHTML=innerTabStr;
}


/** 
 * 查询所有用户
 */
function getUserList(){
	var UserInfo = Bmob.Object.extend("_User");
	var queryName = new Bmob.Query(UserInfo);
	queryName.find({
			success: function(results) {
				if(results.length > "0"){
					for (i in results) {
						userList[results[i].id]={"img":results[i].get("img"),"name":results[i].get("username"),"chatLastTime":""};
					}
					showFrindTab();
				}
				else{
					console.log("没有用户信息");
				}
			},
			error: function(error) {
				console.log("Error: " + error.code + " " + error.message);
			}
		});
}

function sendMsg(content) {
	// var name = $("#name").val();
	// var name = currentUser.attributes.username;
	content= content!=null?content:$("#content").val();

	// if ($.trim(name) == "") {
		// alert("昵称不能为空！");
		// return;
	// }

	if ($.trim(content) == "") {
		alert("内容不能为空！");
		return;
	}

	var Chat = Bmob.Object.extend("Chat");
	var chat = new Chat();
	// chat.set("name", $("#name").val());

	//消息添加换行
	var content = content.replace(/\n/g, "<br/>");
	chat.set("content", content);
	chat.set("sendFrom",userId);
	chat.set("sendTo",sendToId);
	//chat.set("chatImgs",document.getElementById("selectFile").value);
	
	sendTo = sendToId=="All"?"*":sendToId;
	//用户读取权限控制
	var json = {};
	json[userId] = {"read":true,"write":true};
	json[sendTo] = {"read":true};
	//ALC设置
	chat.set("ACL",json);
	
	//清空消息
	$("#content").val("");
	chat.save(null, {
		success : function (object) {
			console.log("送信成功！");
			},
		error : function (model, error) {
			console.log("送信失败！");
			console.log("Error: " + error.code + " " + error.message);
			}
	});
	
	getMsg(userId, sendToId, getNowFormatDate(), content);
	scollToEnd();
}

//初始连接socket.io服务器后，需要监听的事件都写在这个函数内
BmobSocketIo.onInitListen = function () {
	//订阅GameScore表的数据更新事件
	BmobSocketIo.updateTable("Chat");
};

//监听服务器返回的更新表的数据
BmobSocketIo.onUpdateTable = function (tablename, data) {
	if (tablename == "Chat") {
		// 不是自己发送的消息则显示提示
		if(data.sendFrom!=userId){
			getMsg(data.sendFrom, data.sendTo, data.createdAt, data.content);
			scollToEnd();
			if (Sys.chrome) {
				notify(data.content,userList[data.sendFrom].img,data.name + data.createdAt.substring(11));
			}
		}
	}
};

/*
//取得用户图片URL地址
function getImgUrl(id){
	var UserInfo = Bmob.Object.extend("_User");
	var query = new Bmob.Query(UserInfo);
	query.equalTo("objectId", id); 
	query.find({
		success: function(results) {
				if(results.length == "1"){
					return results[0].get("img");
				}
				else{
					console.log("取得用户图片地址错误");
					return "";
				}
			},
			error: function(error) {
				alert("Error: " + error.code + " " + error.message);
				return "";
			}
		});
}

//替换用户头像
function changeImg(id,imgUrl){
	$("."+id).each(function(index,element){
		element.src = imgUrl;
		element.class="";
	});
}
*/

//通过“回车”提交聊天信息
$('#name').keydown(function (e) {
	if (e.keyCode === 13) {
		sendMsg();
	}
});

//通过“回车”提交聊天信息
$('#content').keydown(function (e) {
	if (e.keyCode === 13) {
		sendMsg();
	}
});
	
//取得历史消息
function getHistory(){
	//var name = currentUser.attributes.username;
	var Chat = Bmob.Object.extend("Chat");
	var query = new Bmob.Query(Chat);
	query.ascending('createdAt');
	// 查询所有数据
	query.find({
		success: function(results) {
			// alert("共查询到 " + results.length + " 条记录");
			var startIndex = 0;
			if(results.length > 20)
				startIndex=results.length-20;
			// 循环处理查询到的数据
			for (startIndex; startIndex < results.length;startIndex++) {
			    var data = results[startIndex];
				getMsg(data.get('sendFrom'), data.get('sendTo'), data.createdAt, data.get('content'));
			    //alert(object.id + ' - ' + object.get('playerName'));
	  		}
			if(results.length!=0){
				changeSendTo(results[results.length-1].get('sendTo'));
				scollToEnd();
			}else{
				changeSendTo("All");
			}
		},
		error: function(error) {
	  		console.log("查询失败: " + error.code + " " + error.message);
		}
	});	
}

//注销
function logout(){
	Bmob.User.logOut();
	window.location.href='./';
}

//新消息滚动
function scollToEnd(){
	var elem = document.getElementById('dBody');
	elem.scrollTop = elem.scrollHeight;
}

/**
 * 接收2012-04-09或2012-4-9格式的字符串，并返回该日期与1970年1月1日 00:00:00的毫秒差值
 * @param {String} dateStr
 * @return {Number} 
 */
function getTime(dateStr){
    dateStr = dateStr.replace("-", "/");
    return Date.parse(dateStr);
}

/**
 * 比较两个指定格式的日期字符串，并返回整数形式的比较结果。
 * 返回值:
 *       true : 消息间隔大于3分钟
 *       false : 消息间隔小于3分钟
 * @param {String} date1
 * @param {String} date2
 * @return {boolean} 
 */
function compareDate(dateStr1, dateStr2){
    return (getTime(dateStr1) - getTime(dateStr2)) > 180000;
}
 
//消息拼接
function getMsg(senderId, sendToId, sendTime,sendContent){
	var tabId="";
	if(senderId==userId || sendToId == "All"){
		tabId=sendToId;
	}else{
		tabId=senderId;
	}
	var content = $("#data" + tabId);
	//clear: bothを指定すればfloatによる回り込みをキャンセル出来ます。
	var p = '<div style="clear:both"><br>';
	if(isEmptyObject(userList[tabId].chatLastTime)){
		userList[tabId].chatLastTime = sendTime;
		p += '<span style="color:green;display:block;text-align:center">' + userList[tabId].chatLastTime + '</span>';
	}
	if(compareDate(sendTime,userList[tabId].chatLastTime)){
		p += '<span style="color:green;display:block;text-align:center">' + sendTime + '</span>';
	}
	if (!isEmptyObject(userList[senderId].img)) {
		p += '<div><img class="headImg" src="'+userList[senderId].img+'"';
	}else{
		p += '<div><img class="headImg" src="https://raw.githubusercontent.com/china007/china007.github.io/master/images/head/default.gif"';
	}
	if(senderId==userId){
		p += 'style="float:right;"><div class="send historyRight"><div class="rightArrow"></div>' + sendContent + '</div></div></div>';
	}else{
		p += 'style="float:left;"><div class="send"><div class="leftArrow"></div>' + sendContent + '</div></div></div>';
	}
	userList[tabId].chatLastTime = sendTime;
	content.html(content.html() + p);
	// changeImg(senderId,getImgUrl(senderId));
}

/**
 * 判断变量是否为空
 * return true:空
 *        false:非空
 */
function isEmptyObject(obj){
  for (var key in obj) {
    return false;
  }
  return true;
}

/**
 * 浏览器消息提醒（chrome）
 * @param {String} 内容
 * @param {String} 头像
 * @param {String} 标题
 */
function notify(theBody,theIcon,theTitle){
	// Let's check if the browser supports notifications
	if (!("Notification" in window)) {
		// alert("This browser does not support desktop notification");
		console.lgo("This browser does not support desktop notification");
	}
	// Let's check whether notification permissions have already been granted
	else {
		if (Notification.permission === "granted") {
			// If it's okay let's create a notification
			// var notification = new Notification("Hi there!");
			spawnNotification(theBody,theIcon,theTitle);
		}

		// Otherwise, we need to ask the user for permission
		else if (Notification.permission !== 'denied') {
			Notification.requestPermission(function (permission) {
				// If the user accepts, let's create a notification
				if (permission === "granted") {
					// var notification = new Notification("Hi there!");
					spawnNotification(theBody,theIcon,theTitle);
				}
			});
		}
	}
	  // At last, if the user has denied notifications, and you 
	  // want to be respectful there is no need to bother them any more.
	} 
if (Sys.chrome) {
//获取消息提醒权限
Notification.requestPermission(); 
}
function spawnNotification(theBody,theIcon,theTitle) {
	  var options = {
		  body: theBody,
		  icon: theIcon
	  }
	  var n = new Notification(theTitle,options);
	}

	/**
	 * 获取本地时间
	*/
function getNowFormatDate() {
    var date = new Date();
    var seperator1 = "-";
    var seperator2 = ":";
    var month = date.getMonth() + 1;
    var strDate = date.getDate();
    if (month >= 1 && month <= 9) {
        month = "0" + month;
    }
    if (strDate >= 0 && strDate <= 9) {
        strDate = "0" + strDate;
    }
    var currentdate = date.getYear() + seperator1 + month + seperator1 + strDate
            + " " + date.getHours() + seperator2 + date.getMinutes()
            + seperator2 + date.getSeconds();
    return currentdate;
}

/**
 * 保存用户登录信息
 */
function saveIp(){
	var result = returnCitySN;
	
	var ipStatus = Bmob.Object.extend("loginStatus");
	var ip = new ipStatus();

	ip.set("userId", userId);
	ip.set("cid",result.cid);
	ip.set("cip",result.cip);
	ip.set("cname",result.cname);
	ip.set("signIp",false);
	
	ip.save(null, {
		success : function (object) {
			console.log("Ip保存成功！");
			},
		error : function (model, error) {
			console.log("Ip保存失败！");
			console.log("Error: " + error.code + " " + error.message);
			}
	});
}

/**
 * 改变聊天对象
 */
var sendToId ="All";
function changeSendTo(sendTo){
	sendToId=sendTo;
	$(".chatTab").hide();
	$("#data"+sendToId).show();
	$(".chatMenu").removeClass("active");
	$("#menu"+sendToId).addClass("active");
	scollToEnd();
}

/**
 * 获取好友列表
 */
var friendList={};
function getFriendList(){
	var friendInfo= Bmob.Object.extend("friend");
	var query= new Bmob.Query(friendInfo);

	query.set("userId",userId);
	query.find({
		success: function(results) {
			if(results.length > "0"){
				for (i in results) {
					friendList[results[i].id]={"img":results[i].get("img"),"name":results[i].get("username"),"chatLastTime":""};
				}
				showFrindTab();
			}
			else{
				console.log("没有好友信息");
			}
		},
		error: function(error) {
			console.log("Error: " + error.code + " " + error.message);
		}
	});
}

/**
 * 图片文件上传
 * 
 */

var chatImgsUrl="";
function fileUpload() {
	// ファイル名のみ取得して表示します
	var selectFile = document.getElementById("selectFile").value;
	var regex = /\\|\\/;
	var array = selectFile.split(regex);
	
	var fileUploadControl = $("#selectFile")[0];
	if (fileUploadControl.files.length > 0) {
		var file = fileUploadControl.files[0];
		var size = file.size;
		var name = array[array.length - 1];
		var file = new Bmob.File(name, file);     
		file.save().then(function(obj) {
			chatImgsUrl = obj.url();
			if(size > 15000){
				Bmob.Image.thumbnail({"image":chatImgsUrl,"mode":4,"quality":100,"width":100,"height":200}
				).then(function(obj) {
					// console.log("filename:"+obj.filename); 
					// console.log("url:"+obj.url); 
					//本页面跳转到原图，后退有bug
					//sendMsg("<a href='"+chatImgsUrl+"'><img src='http://file.bmob.cn/"+obj.url+"'/></a>");
					//新打开窗口显示原图
					//sendMsg("<img onclick=window.open('"+chatImgsUrl+"') src='http://file.bmob.cn/"+obj.url+"'/>");
					//历史消息窗口显示原图，点击原图返回前页面
					sendMsg("<img onclick=showImg0('"+chatImgsUrl+"') src='http://file.bmob.cn/"+obj.url+"'/>");
				});
			}else{
				sendMsg("<img src='"+chatImgsUrl+"'/>");
			}
		}, function(error) {
			console.log("file upload error"+error);
		});

	}else{
		console.log("file upload error");
	}
};

function showImg0(imgUrl){
	$("#mycontent").hide();
	$("#imgDiv").html("<img src='"+imgUrl+"'>");
	$("#imgDiv").show();
}

function hideImg0(){
	$("#mycontent").show();
	$("#imgDiv").html("");
	$("#imgDiv").hide();
}

/**
 * 初始化默认表情
 */
function initEmoji(){
	var MAXROW=4;
	var MAXCOL=9;
	var htmlStr="<table>";
	for(var row=0;row<MAXROW;row++)
	 {
		htmlStr+="<tr>";
		for(var col=1;col<MAXCOL;col++)
		{
			var index=col+(MAXCOL-1)*row+page*(MAXROW*(MAXCOL-1)-1);
			//判断是不是最后一个
			if(index<MaxEmoji+1){
				//判断是不是该页最后一个
				if(row==MAXROW-1&&col==MAXCOL-1){
					htmlStr+="<td><input type='button' value='⇒' onclick='initEmoji();'></td>";
				}else{
					htmlStr+="<td><img src='images/emoji/"+index+".gif' onclick='sendEmoji("+index+");'></img></td>";
				}
			}else{
				htmlStr+="<td></td>";
			}
		}
		htmlStr+="</tr>";
	 }
	page++;
	htmlStr+="</table>";
	document.getElementById("emoji").innerHTML=htmlStr;
}
/**
 * 显示或隐藏表情
 * 
 */
function showOrHideEmoji(button){
	
	var emojiDiv=document.getElementById("emoji");
	if(emojiDiv.style.display=="block")
	{
		emojiDiv.style.display ="none";
		button.value="+";
	}else{
		emojiDiv.style.display ="block";
		button.value="-";
	}
}

/**
 * 发送并隐藏表情列表
 */
 function sendEmoji(index){
	 showOrHideEmoji(document.getElementById("openEmojiBtn"));
	 sendMsg("<img src='images/emoji/"+index+".gif'></img>");
 }
