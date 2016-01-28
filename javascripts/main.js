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
if (currentUser) {
	console.log("已登陆");
	// do stuff with the user
} else {
	console.log("未登陆");
	window.location.href='/login';
	// show the signup or login page
}

function sendMsg() {

	// var name = $("#name").val();
	var name = Bmob.User.current().attributes.username;
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
	chat.set("content", $("#content").val());
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
		// alert(tablename);
		var content = $("#data");
		var p = '<p><span style="color:red;">' + data.name + '</span>  ' + '<span style="color:green;">' + data.createdAt + '</span>  ' + ' :<br/> <div class="send"><div class="leftArrow"></div>' + data.content + '</div></p><br/>';
		content.html(content.html() + p);
		scollToEnd();
	}
};

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
	
function getHistory(){
	var GameScore = Bmob.Object.extend("Chat");
	var query = new Bmob.Query(GameScore);
	query.ascending('createdAt');
	// 查询所有数据
	query.find({
		success: function(results) {
			// alert("共查询到 " + results.length + " 条记录");
			// 循环处理查询到的数据
			for (var i = 0; i < results.length; i++) {
			    	var data = results[i];
				var content = $("#data");
				var p = '<p><span style="color:red;">' + data.get('name') + '</span>  ' + '<span style="color:green;">' + data.createdAt + '</span>  ' + ' :<br/> <div class="send"><div class="rightArrow"></div>' + data.get('content') + '</div></p>';
				content.html(content.html() + p);
				scollToEnd();
			    	//alert(object.id + ' - ' + object.get('playerName'));
	  		}
		},
		error: function(error) {
	  		//alert("查询失败: " + error.code + " " + error.message);
		}
	});	
}
function logout(){
	Bmob.User.logOut();
	window.location.href='./login.html';
}

function scollToEnd(){
	// 通过深入 Document 内部对 body 进行检测，获取窗口大小
	// if (document.documentElement && document.documentElement.clientHeight && document.documentElement.clientWidth)
	// {
		// winHeight = document.documentElement.clientHeight;
		// winWidth = document.documentElement.clientWidth;
	// }
	// window.scrollTo(0,winHeight-100);
	var elem = document.getElementById('#data');
	elem.scrollTop = elem.scrollHeight;
}


 
