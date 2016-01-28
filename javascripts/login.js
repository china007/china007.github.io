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
	function sign(){
		//服务器
		Bmob.initialize("4733f138065d979e5bea5a43bd4bdf0a", "e78ae2b9cf7e63e9066f6336a6822a1c");
		var user = new Bmob.User();
		user.set("username", document.getElementById("userId").value);
		user.set("password", document.getElementById("userPass").value);
		user.set("email", document.getElementById("userEmail").value);

		// other fields can be set just like with Bmob.Object
		user.set("phone", document.getElementById("userTel").value);

		user.signUp(null, {
		  success: function(user) {
			console.log("sign success");
			// Hooray! Let them use the app now.
		  },
		  error: function(user, error) {
			// Show the error message somewhere and let the user try again.
			alert("Error: " + error.code + " " + error.message);
		  }
		});
	}

	function userIdUniqueCheck(){
		$$('.register').setStyle('display', ''); 
		$$('.login').setStyle('display', 'none'); 
		Bmob.initialize("4733f138065d979e5bea5a43bd4bdf0a", "e78ae2b9cf7e63e9066f6336a6822a1c");
		var UserInfo = Bmob.Object.extend("_User");
		var query = new Bmob.Query(UserInfo);
		query.equalTo("username", document.getElementById("userId").value); 
		// 查询所有数据
		query.find({
			success: function(results) {
				if(results.length > "0"){console.log("用户名已存在!");}
				else{sign();}
			},
			error: function(error) {
				console.log("userIdUniqueCheck failed!");
			}
		});
	}

	function login(){
		Bmob.initialize("4733f138065d979e5bea5a43bd4bdf0a", "e78ae2b9cf7e63e9066f6336a6822a1c");
		var UserInfo = Bmob.Object.extend("_User");
		var query = new Bmob.Query(UserInfo);
		query.equalTo("username", document.getElementById("userId").value); 
		query.equalTo("password", document.getElementById("userPass").value); 
		// 查询所有数据
		query.find({
			success: function(results) {
				if(results.length == "1"){console.log("login success!");}
				else{console.log("login failed!");}
			},
			error: function(error) {
				console.log("login failed!");
			}
		});
	}
	
	function back(){
		$$('.register').setStyle('display', 'none'); 
		$$('.login').setStyle('display', ''); 
	}