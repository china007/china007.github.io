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

window.addEvent('domready', function() {
	alert("ready");
	//密码强度⇒福利
	$$("input[type=password]").nakedPassword();
});
	function sign(){
		//服务器
		Bmob.initialize("4733f138065d979e5bea5a43bd4bdf0a", "e78ae2b9cf7e63e9066f6336a6822a1c");
		var user = new Bmob.User();
		user.set("username", document.getElementById("userId").value);
		user.set("password", document.getElementById("userPass").value);
		user.set("email", document.getElementById("userEmail").value);
		user.set("phone", document.getElementById("userTel").value);
		
		//默认头像
		user.set("img", "https://raw.githubusercontent.com/china007/china007.github.io/master/images/head/default.gif");

		user.signUp(null, {
		  success: function(user) {
			console.log("sign success");
			alert("注册成功，即将跳往登陆页面！")
			login();
			// Hooray! Let them use the app now.
		  },
		  error: function(user, error) {
			// Show the error message somewhere and let the user try again.
			alert("Error: " + error.code + " " + error.message);
		  }
		});
	}

	function checkId(){
		if($$('.register').getStyle('display')[0] == 'none'){
			$$('.register').setStyle('display', ''); 
			$$('.login').setStyle('display', 'none'); 
		}else{
			//服务器
			Bmob.initialize("4733f138065d979e5bea5a43bd4bdf0a", "e78ae2b9cf7e63e9066f6336a6822a1c");

			var UserInfo = Bmob.Object.extend("_User");
			var queryName = new Bmob.Query(UserInfo);
			queryName.equalTo("username", document.getElementById("userId").value); 
			// 查询用户名
			queryName.find({
				success: function(results) {
					if(results.length > "0"){
						showErr("该用户名已被注册!");
						console.log("该用户名已被注册!");
						}
					else{
						checkMail();
					}
				},
				error: function(error) {
					alert("Error: " + error.code + " " + error.message);
				}
			});
		}
	}
	
	function checkMail(){
		var email=document.getElementById("userEmail").value;
		//格式检查
		var reg = /^(\w)+(\.\w+)*@(\w)+((\.\w+)+)$/;
		if(!reg.test(email)){
			showErr("邮箱格式不正确!");
			return;
		}
		
		//唯一性检查
		//服务器
		Bmob.initialize("4733f138065d979e5bea5a43bd4bdf0a", "e78ae2b9cf7e63e9066f6336a6822a1c");
		
		var UserInfo = Bmob.Object.extend("_User");
		var queryMail = new Bmob.Query(UserInfo);
		queryMail.equalTo("email", email); 
		// 查询邮箱
		queryMail.find({
			success: function(results) {
				if(results.length > "0"){
					showErr("该邮箱已被注册!");
					console.log("该邮箱已被注册!");
					}
				else{
					checkTel();
				}
			},
			error: function(error) {
				alert("Error: " + error.code + " " + error.message);
			}
		});
	}
	
	function checkTel(){
		var tel = document.getElementById("userTel").value;
		//格式检查
		var reg = /^(13[0-9]|15[012356789]|17[0678]|18[0-9]|14[57]|0[7-9]0|050)[0-9]{8}$/;
		if(!reg.test(tel)){
			showErr("电话格式不正确!");
			return;
		}
		
		//唯一性检查
		//服务器
		Bmob.initialize("4733f138065d979e5bea5a43bd4bdf0a", "e78ae2b9cf7e63e9066f6336a6822a1c");
		
		var UserInfo = Bmob.Object.extend("_User");
		var queryTel = new Bmob.Query(UserInfo);
		queryTel.equalTo("phone", tel); 
		// 查询电话
		queryTel.find({
			success: function(results) {
				if(results.length > "0"){
					showErr("该电话已被注册!");
					console.log("该电话已被注册!");}
				else{
					sign();
				}
			},
			error: function(error) {
				alert("Error: " + error.code + " " + error.message);
			}
		});
	}

	function login(){
		//服务器
		Bmob.initialize("4733f138065d979e5bea5a43bd4bdf0a", "e78ae2b9cf7e63e9066f6336a6822a1c");
		var UserInfo = Bmob.Object.extend("_User");
		var query = new Bmob.Query(UserInfo);
		query.equalTo("username", document.getElementById("userId").value); 
		query.equalTo("password", document.getElementById("userPass").value); 
		// 查询所有数据
		query.find({
			success: function(results) {
				if(results.length == "1"){
					console.log("login success!");
					Bmob.User.logIn(document.getElementById("userId").value, document.getElementById("userPass").value, {
						success: function(user) {
						console.log("login success!");
						document.getElementById("formRegister").submit();
						// Do stuff after successful login.
						},
						error: function(user, error) {
						  console.log("login failed!");
						// The login failed. Check error to see why.
					    }
					});}
				else{
					console.log("login failed!");
					showErr("用户名或密码不正确!");
					}
			},
			error: function(error) {
				showErr("数据库连接错误!");
				console.log("login failed!");
			}
		});
	}
	
	function back(){
		$$('.register').setStyle('display', 'none'); 
		$$('.login').setStyle('display', ''); 
	}
	
	function showErr(err){
		//清除当前密码强度奖励
		$$('.nakedPasswdImage').destroy();
		
		//显示error
		$$('.errorbox').set('html','<p>'+err+'</p>');
		$$('.errorbox').setStyle('display', ''); 
		
		//设置新密码奖励
		$("userPass").nakedPassword();
	}