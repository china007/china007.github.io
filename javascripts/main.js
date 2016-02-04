//自适应各种手机模式
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

//服务器
BmobSocketIo.initialize("4733f138065d979e5bea5a43bd4bdf0a");
Bmob.initialize("4733f138065d979e5bea5a43bd4bdf0a", "e78ae2b9cf7e63e9066f6336a6822a1c");
//检查是否已登陆
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
}

var userList={};
getUserList();
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
						userList[results[i].id]={"img":results[i].get("img"),"name":results[i].get("username")};
					}
				}
				else{
					console.log("没有用户信息");
				}
			},
			error: function(error) {
				alert("Error: " + error.code + " " + error.message);
			}
		});
}

function sendMsg() {

	// var name = $("#name").val();
	var name = currentUser.attributes.username;
	var content = $("#content").val();

	if ($.trim(name) == "") {
		alert("昵称不能为空！");
		return;
	}

	if ($.trim(content) == "") {
		alert("内容不能为空！");
		return;
	}

	var Chat = Bmob.Object.extend("Chat");
	var chat = new Chat();
	chat.set("name", $("#name").val());
	notify();	
	//消息添加换行
	chat.set("content", $("#content").val().replace(/\n/g, "<br/>"));
	chat.set("userId",userId);
	
	//用户读取权限控制
	var json = {"*":{"read":true}};
	json[userId] ={"read":true,"write":true};
	chat.set("ACL",json);
	
	//清空消息
	$("#content").val("");
	chat.save(null, {
		success : function (object) {},
		error : function (model, error) {}
	});
}


//初始连接socket.io服务器后，需要监听的事件都写在这个函数内
BmobSocketIo.onInitListen = function () {
	//订阅GameScore表的数据更新事件
	BmobSocketIo.updateTable("Chat");
};

//监听服务器返回的更新表的数据
BmobSocketIo.onUpdateTable = function (tablename, data) {
	if (tablename == "Chat") {
		getMsg(data.userId, data.createdAt, data.content);
		notify(data.content,userList[data.userId].img,data.name + data.createdAt.substring(11));
		scollToEnd();
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
	var name = currentUser.attributes.username;
	var Chat = Bmob.Object.extend("Chat");
	var query = new Bmob.Query(Chat);
	query.ascending('createdAt');
	// 查询所有数据
	query.find({
		success: function(results) {
			// alert("共查询到 " + results.length + " 条记录");
			// 循环处理查询到的数据
			for (var i = 0; i < results.length; i++) {
			    var data = results[i];
				getMsg(data.get('userId'), data.createdAt, data.get('content'));
			    //alert(object.id + ' - ' + object.get('playerName'));
	  		}
			scollToEnd();
		},
		error: function(error) {
	  		//alert("查询失败: " + error.code + " " + error.message);
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
function getMsg(senderId,sendTime,sendContent){
	var content = $("#data");
	//clear: bothを指定すればfloatによる回り込みをキャンセル出来ます。
	var p = '<div style="clear:both"><br>';
	if(lastTime == ""){
		lastTime = sendTime;
		p += '<span style="color:green;display:block;text-align:center">' + lastTime + '</span>';
	}
	if(compareDate(sendTime,lastTime)){
		p += '<span style="color:green;display:block;text-align:center">' + sendTime + '</span>';
	}
	if(userList[senderId].img != ""){
		p += '<div><img class="'+ senderId +'" src="'+userList[senderId].img+'"';
	}else{
		p += '<div><img class="'+ senderId +'" src="https://raw.githubusercontent.com/china007/china007.github.io/master/images/head/loading.gif"';
	}
	if(senderId==userId){
		p += 'style="float:right;"><div class="send historyRight"><div class="rightArrow"></div>' + sendContent + '</div></div></p><br>';
	}else{
		p += 'style="float:left;"><div class="send"><div class="leftArrow"></div>' + sendContent + '</div></div></p><br></div>';
	}
	lastTime = sendTime;
	content.html(content.html() + p);
	// changeImg(senderId,getImgUrl(senderId));
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
//获取消息提醒权限
Notification.requestPermission(); 
function spawnNotification(theBody,theIcon,theTitle) {
	  var options = {
		  body: theBody,
		  icon: theIcon
	  }
	  var n = new Notification(theTitle,options);
	}
	
