  $( document ).ready(function() {
    getHistory();
  });
	function sendMsg() {

		var name = $("#name").val();
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
		//   $("#content").val("");
		chat.save(null, {
			success : function (object) {},
			error : function (model, error) {}
		});
	}

	$("#send").click(function () {
		sendMsg();
	});

	//服务器
	BmobSocketIo.initialize("4733f138065d979e5bea5a43bd4bdf0a");
	Bmob.initialize("4733f138065d979e5bea5a43bd4bdf0a", "e78ae2b9cf7e63e9066f6336a6822a1c");

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
			content.html(p + content.html());
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
	      	Bmob.initialize("4733f138065d979e5bea5a43bd4bdf0a", "e78ae2b9cf7e63e9066f6336a6822a1c");
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
			var p = '<p><span style="color:red;">' + data.get('name') + '</span>  ' + '<span style="color:green;">' + data.createdAt + '</span>  ' + ' :<br/> <div class="send"><div class="rightArrow"></div>' + data.get('content') + '</div></p><br/>';
			content.html(p + content.html());
    	//alert(object.id + ' - ' + object.get('playerName'));
  }
},
error: function(error) {
  alert("查询失败: " + error.code + " " + error.message);
}
});	
}
