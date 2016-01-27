<%@ page language="java" pageEncoding="UTF-8" contentType="text/html; charset=UTF-8"%>
<html>
	<head>
		<script type="text/javascript">
			function openlogin(){
				window.open("login.jsp","","width=600px,height=460px");
				window.opener=null;
				this.close();
			}
		</script>
	</head>
	<body onload="openlogin()">
	</body>
</html>
