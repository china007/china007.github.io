<%@ page language="java" pageEncoding="GBK"%>

<html>
	<head>
		<style type="text/css">
			body{
				font-size:12px;
				margin:0px;
				line-height:18px;
				padding-left:5px;
			}
		</style>
		<script language="javascript">
				//用户请求数据
			var xmlRequestUser;
			
			//创建对象
			function createXMLHttpRequest(){
				if(window.XMLHttpRequest) { //Mozilla 浏览器
					return new XMLHttpRequest();
				}else if (window.ActiveXObject) { // IE浏览器
					try {
						return new ActiveXObject("Msxml2.XMLHTTP");
					} catch (e) {
						try {
							return new ActiveXObject("Microsoft.XMLHTTP");
						} catch (e) {}
					}
				}
			}
			function sendGetUserRequest(){
				var url = "getUser.jsp";
				xmlRequestUser = createXMLHttpRequest();
				xmlRequestUser.open("GET",url,true);
				xmlRequestUser.onreadystatechange = getUserResponse;
				xmlRequestUser.send(null);
			}
			
			function getUserResponse(){
				if(xmlRequestUser.readyState==4){
					if(xmlRequestUser.status ==200) {
						//信息已经成功返回
						showUserInfo();
					}else{
						showMess("您所请求的页面有异常！");
					}
				}
			}
			
			function showUserInfo(){
				var message = xmlRequestUser.responseXML.getElementsByTagName("userinfo")[0].firstChild.nodeValue;
				document.body.innerText = message;
			}
			//每隔10秒读取一次新用户
			window.setInterval("sendGetUserRequest()",1000);
		</script>
	</head>
	<body onload="sendGetUserRequest()">
		
	</body>
</html>