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
var userInfoViewUserId="";
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
userList["All"]={"name":"群聊","chatLastTime":"","unRead":"0"};
getUserList();
$(function() {

        //DEL搜狐IP无法使用20160517 START
	//saveIp();
	//DEL搜狐IP无法使用20160517 END
	$("#fileImg").click(function() {
		var selectFile = document.getElementById("selectFile");
		selectFile.click();
	});
	$("#infoImg").click(function() {
		//只能上传自己的头像
		if(userInfoViewUserId==userId){
			var selectFile = document.getElementById("selectFile");
			selectFile.click();
		}
	});
	//初始化表情
	initEmoji();
	
	//通过“ctrl+回车”提交聊天信息
	$('#content').bind("keypress",function (e) {
		//console.log(e.which);
		if (e.which === 10) {
			sendMsg();
		}
	});
	getImgFromClip();
});

/**
 * 浏览器兼容性处理
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
			document.write('<meta name="viewport" content="width=320, user-scalable=no, target-densitydpi=device-dpi">');
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
			innerMenuStr+='<li class=menu'+k+'><a id=menu'+k+' class="chatMenu" onclick=changeSendTo("'+k+'")><span>'+userList[k].name+'</span></a><span onclick=changeSendTo("'+k+'") class="msgCount">'+userList[k].unRead+'</span></li>';
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
						userList[results[i].id]={"img":results[i].get("img"),"name":results[i].get("username"),"chatLastTime":"","unRead":"0","mail":results[i].get("email"),"tel":results[i].get("mobilePhoneNumber")};
					}
					showFrindTab();
					//取得历史消息
					getHistory();
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
	content= content!=null?content:$("#content")[0].innerHTML;

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
	
	sendTo = sendToId=="All"?"*":sendToId;
	//用户读取权限控制
	var json = {};
	json[userId] = {"read":true,"write":true};
	json[sendTo] = {"read":true};
	//ALC设置
	chat.set("ACL",json);
	
	//清空消息
	$("#content")[0].innerHTML="";
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
			if(data.sendTo==userId){
				//发送给当前用户的数据
				userList[data.sendFrom].unRead++;
				showUnReadMsg(data.sendFrom);
			}else if(data.sendTo=="All"){
				//群聊
				userList["All"].unRead++;
				showUnReadMsg("All");
			}
			if(data.sendTo=="All" || data.sendTo==userId){
				getMsg(data.sendFrom, data.sendTo, data.createdAt, data.content);
				scollToEnd();
				if (Sys.chrome) {
					if(data.content.indexOf("<img")==0){
						data.content="发来一个表情，请打开浏览器查看";
					}else if(data.content.indexOf("<a")==0){
						data.content="发来一个文件，请打开浏览器查看";
					}
					notify(data.content,userList[data.sendFrom].img,userList[data.sendFrom].name +"  "+ data.createdAt.substring(11));
				}
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

//取得历史消息
function getHistory(){
	//var name = currentUser.attributes.username;
	var Chat = Bmob.Object.extend("Chat");
	var query = new Bmob.Query(Chat);
	query.count({
	  success: function(count) {
		// 查询成功，返回记录数量
		//alert("共有 " + count + " 条记录");
			var Chat = Bmob.Object.extend("Chat");
			var query = new Bmob.Query(Chat);
			query.ascending('createdAt');
			//只显示最后100条数据
			if(count>100)query.skip(count-100);
			
			// 查询所有数据
			query.find({
				success: function(results) {
					var startIndex = 0;
					/*if(results.length > 20)
						startIndex=results.length-20;*/
					// 循环处理查询到的数据
					for (startIndex; startIndex < results.length;startIndex++) {
						var data = results[startIndex];
						getMsg(data.get('sendFrom'), data.get('sendTo'), data.createdAt, data.get('content'));
						//alert(object.id + ' - ' + object.get('playerName'));
					}
					if(results.length!=0){
						var lastMsg = results[results.length-1];
						var sendF=lastMsg.get('sendFrom');
						var sendT=lastMsg.get('sendTo');
						var tabid ="All";
						if(sendT!="All"){
							tabid = sendF==userId?sendT:sendF;
						}
						changeSendTo(tabid);
						//scollToEnd();
					}else{
						changeSendTo("All");
					}
				},
				error: function(error) {
					console.log("查询失败: " + error.code + " " + error.message);
				}
			});	
	  },
	  error: function(error) {
		// 查询失败
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
	var tabId="All";
	if(senderId==userId || sendToId == "All"){
		tabId=sendToId;
	}else{
		tabId=senderId;
	}
	//已删除用户消息不显示
	if(isEmptyObject(userList[tabId]))return;

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
		p += '<div><img class="headImg '+senderId+'Img" onclick=showUserInfoView("'+senderId+'"); src="'+userList[senderId].img+'"';
	}else{
		p += '<div><img class="headImg" src="https://raw.githubusercontent.com/china007/china007.github.io/master/images/head/default.gif"';
	}
	if(senderId==userId){
		p += 'style="float:right;"><div class="send historyRight"><div class="rightArrow"></div>' + strToLink(sendContent) + '</div></div></div>';
	}else{
		p += 'style="float:left;"><div class="send"><div class="leftArrow"></div>' + strToLink(sendContent) + '</div></div></div>';
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
	  //1秒关闭提示框
	  setTimeout(n.close.bind(n), 1000);
	  n.onclick = function() {
		  点击后立即关闭
		  setTimeout(n.close.bind(n), 1);
			//console.log("You clicked me!");
			//window.location = "/";
      };
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
	if(isEmptyObject(sendTo))sendTo ="All";
	sendToId=sendTo;
	if(userList[sendTo].unRead!="0"){
		userList[sendToId].unRead="0";
		showUnReadMsg(sendToId);
	}
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
 * 图片Or文件上传
 * 
 */
var fileUrl="";
function fileUpload() {
	// ファイル名のみ取得して表示します
	var selectFile = document.getElementById("selectFile").value;
	var regex = /\\|\\/;
	var array = selectFile.split(regex);
	
	var fileUploadControl = $("#selectFile")[0];
	if (fileUploadControl.files.length > 0) {
		var file0 = fileUploadControl.files[0];
		var size = file0.size;
		var name = array[array.length - 1];
		var file = new Bmob.File2(name, file0);     
		file.save().then(function(obj) {
			fileUrl = obj.url();
			
			if($('#userInfoView')[0].style.display != 'none'){
				//用户信息视图
				if(file._guessedType.indexOf("image")==0){
					if(size > 15000){
						Bmob.Image.thumbnail({"image":fileUrl,"mode":4,"quality":100,"width":30,"height":30}
						).then(function(obj) {
							userList[userInfoViewUserId].img="http://file.bmob.cn/"+obj.url;
						});
						updateUserInfo("img",obj.url);
					}else{
						userList[userInfoViewUserId].img=fileUrl;
						updateUserInfo("img",fileUrl);
					}
					$("."+userInfoViewUserId+"Img").each(function(){this.src=fileUrl});
					showUserInfoView(userInfoViewUserId);
					updateUserInfo("img0",fileUrl);
				}
			}else{
				//聊天视图
				//判断上传文件为图片
				if(file._guessedType.indexOf("image")==0){
					if(size > 15000){
						Bmob.Image.thumbnail({"image":fileUrl,"mode":4,"quality":100,"width":100,"height":200}
						).then(function(obj) {
							// console.log("filename:"+obj.filename); 
							// console.log("url:"+obj.url); 
							//本页面跳转到原图，后退有bug
							//sendMsg("<a href='"+fileUrl+"'><img src='http://file.bmob.cn/"+obj.url+"'/></a>");
							//新打开窗口显示原图
							//sendMsg("<img onclick=window.open('"+fileUrl+"') src='http://file.bmob.cn/"+obj.url+"'/>");
							//历史消息隐藏，显示原图，点击原图返回历史消息
							sendMsg("<img onclick=showImg0('"+fileUrl+"') src='http://file.bmob.cn/"+obj.url+"'/>");
						});
					}else{
						sendMsg("<img src='"+fileUrl+"'/>");
					}
				}else{
					//上传文件原图片,target设定打开新标签
					sendMsg("<a href='"+fileUrl+"' target='_blank'>"+name+"</a>");
				}
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
					//htmlStr+="<td><img src='images/emoji/"+index+".gif' onclick='sendEmoji("+index+");'/></td>";
					htmlStr+="<td><img src='images/emoji/"+index+".gif' onclick='sendEmojiToInputText("+index+");'/></td>";
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
	 sendMsg("<img src='images/emoji/"+index+".gif'/>");
 }
 function sendEmojiToInputText(index){
	 showOrHideEmoji(document.getElementById("openEmojiBtn"));
	 $("#content")[0].innerHTML=$("#content")[0].innerHTML+"<img src='images/emoji/"+index+".gif'/>";
 }
 
 
 function showUserInfoView(userid){
	 // $("#userInfoView").
	 $("#infoImg")[0].src=userList[userid].img;
	 $("#infoName")[0].innerHTML=userList[userid].name;
	 $("#infoMail")[0].innerHTML=userList[userid].mail;
	 $("#infoTel")[0].innerHTML=userList[userid].tel;
	 $("#userInfoView").show();
	 $("#chatView").hide();
	 userInfoViewUserId=userid;
 }
 
 function hideUserInfoView(){
	 $("#userInfoView").hide();
	 $("#chatView").show();
 }
 
 
/**
 * 更新个人信息
 */
function updateUserInfo(col,imgUrl){
	var UserInfo = Bmob.Object.extend("_User");
	var queryName = new Bmob.Query(UserInfo);
	queryName.get(userInfoViewUserId, {
		success: function(results) {
				results.set(col, imgUrl);
				results.save();
		},
		error: function(error) {
			console.log("Error: " + error.code + " " + error.message);
		}
	});
}

/**
 * 未读消息提示数目
 */
function showUnReadMsg(tabId){
	var tab = $(".menu"+tabId+" .msgCount");
	var unread = userList[tabId].unRead;
	if(unread==0){
		tab.hide();
	}else{
		tab[0].innerHTML = userList[tabId].unRead;
		tab.show();
	}
	
}

/**
 * 查找字符串中的链接，并替换成链接
 */
function strToLink(text) 
{ 
	//用户上传得文件或图片的情况
	if(text.indexOf("<a") == 0 || text.indexOf("<img") == 0) return text;
	return text.replace(/(http|ftp|https):\/\/[\w\-_]+(\.[\w\-_]+)+([\w\-\.,@?^=%&amp;:/~\+#]*[\w\-\@?^=%&amp;/~\+#])?/ig, "<a href='$&' target='_blank'>$&</a>");
}

/**
 * 判断上传图片长宽
 * return 
 *      true:超过最大值
 *      false:符合规定
 */
function testWidthHeight(file){
	var notAllow = false;
	var Max_Width = 278;

	debugger;

	//读取图片数据
	var reader = new FileReader();
	reader.onload = function (e) {
		var data = e.target.result;
		//加载图片获取图片真实宽度和高度
		var image = new Image();
		image.onload=function(){
			var width = image.width;
			var height = image.height;
			notAllow = width >= Max_Width;
			return notAllow;
		};
		image.src= data;
	};
	reader.readAsDataURL(file);
}


/**
 * 从剪贴板获取图片
 */
function getImgFromClip(){
	var imgReader = function( item ){
		var blob = item.getAsFile(),
			reader = new FileReader();
			
		reader.onload = function( e ){
			var img = new Image();
			
			img.src = e.target.result;
			// $("#content")[0].html=img;
			// document.body.appendChild( img );
			sendMsg("<img src='"+img.src+"'>");
		};
		reader.readAsDataURL( blob );
	};
	document.getElementById( 'content' ).addEventListener( 'paste', function( e ){
		var clipboardData = e.clipboardData,
			i = 0,
			items, item, types;
			
		if( clipboardData ){
			items = clipboardData.items;
			
			if( !items ){
				return;
			}
			
			item = items[0];
			types = clipboardData.types || [];
			
			for( ; i < types.length; i++ ){
				if( types[i] === 'Files' ){
					item = items[i];
					break;
				}
			}
			
			if( item && item.kind === 'file' && item.type.match(/^image\//i) ){
				imgReader( item );
			}
		}
	});
}

/**

function sendCaputreFile(img){
	var file0 = img;
	var width = file0.width;
	var file = new Bmob.File("Caputre.jpeg", file0);
	file.save().then(function(obj) {
		fileUrl = obj.url();

		//聊天视图
		//判断上传文件为图片
		if(file._guessedType.indexOf("image")==0){
			if(width > 274){
				Bmob.Image.thumbnail({"image":fileUrl,"mode":4,"quality":100,"width":100,"height":200}
				).then(function(obj) {
					//历史消息隐藏，显示原图，点击原图返回历史消息
					sendMsg("<img onclick=showImg0('"+fileUrl+"') src='http://file.bmob.cn/"+obj.url+"'/>");
				});
			}else{
				sendMsg("<img src='"+fileUrl+"'/>");
			}
		}else{
			//上传文件原图片,target设定打开新标签
			sendMsg("<a href='"+fileUrl+"' target='_blank'>"+name+"</a>");
		}
	
	});
}*/
