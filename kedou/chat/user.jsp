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
				//�û���������
			var xmlRequestUser;
			
			//��������
			function createXMLHttpRequest(){
				if(window.XMLHttpRequest) { //Mozilla �����
					return new XMLHttpRequest();
				}else if (window.ActiveXObject) { // IE�����
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
						//��Ϣ�Ѿ��ɹ�����
						showUserInfo();
					}else{
						showMess("���������ҳ�����쳣��");
					}
				}
			}
			
			function showUserInfo(){
				var message = xmlRequestUser.responseXML.getElementsByTagName("userinfo")[0].firstChild.nodeValue;
				document.body.innerText = message;
			}
			//ÿ��10���ȡһ�����û�
			window.setInterval("sendGetUserRequest()",1000);
		</script>
	</head>
	<body onload="sendGetUserRequest()">
		
	</body>
</html>