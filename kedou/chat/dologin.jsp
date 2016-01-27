<%@ page language="java" pageEncoding="UTF-8"%>
<%@page import="java.util.ArrayList"%>
<html>
	<head>
		<%
		//设置字符编码
		request.setCharacterEncoding("UTF-8");
		//获取姓名
		String name = request.getParameter("name");
		if(name==null){
			response.sendRedirect("index.jsp");
			return;
		}
		//存放在 application中
		ArrayList<String> list = (ArrayList<String>)application.getAttribute("users");
		//判断是否为空
		if(list==null){  //聊天室的第一个用户
			list = new ArrayList<String>();
		}
		//System.out.println("即将添加的是:"+name);
		session.setAttribute("sessionuser",name);
		list.add(name);
		application.setAttribute("users",list);
		
		ArrayList<String> messageList = (ArrayList<String>)application.getAttribute("messages");
	
		if(messageList==null){
			messageList = new ArrayList<String>();
		}
		
		messageList.add("\n欢迎，欢迎，大家热列欢迎！"+name+" , 进入聊天室了.....\n");
		application.setAttribute("messages",messageList);
	 %>
		<script language="javascript">
			//显示新窗口
			function newchat(){
				location.href="main.jsp";
			}
		</script>
	</head>
	<body onload="newchat()">
	</body>
</html>