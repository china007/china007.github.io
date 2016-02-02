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
	//消息添加换行
	chat.set("content", $("#content").val().replace(/\n/g, "<br/>"));
	chat.set("userId",userId);
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
	var name = currentUser.attributes.username;
	if (tablename == "Chat") {
		getMsg(data.userId, data.createdAt, data.content);
		scollToEnd();
	}
};

//取得用户图片URL地址
function getImgUrl(id){
	var UserInfo = Bmob.Object.extend("_User");
	var query = new Bmob.Query(UserInfo);
	query.equalTo("objectId", id); 
	// 查询邮箱
	query.find({
		success: function(results) {
				if(results.length == "1"){
					$("."+id).each(function(index,element){
						element.src = results[0].get("img");
						element.class="";
					});
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
	p += '<div><img class="'+ senderId +'" src="https://raw.githubusercontent.com/china007/china007.github.io/master/images/head/loading.gif"';
	if(senderId==userId){
		p += 'style="float:right;"><div class="send historyRight"><div class="rightArrow"></div>' + sendContent + '</div></div></p><br>';
	}else{
		p += 'style="float:left;"><div class="send"><div class="leftArrow"></div>' + sendContent + '</div></div></p><br></div>';
	}
	lastTime = sendTime;
	content.html(content.html() + p);
	getImgUrl(senderId);
}