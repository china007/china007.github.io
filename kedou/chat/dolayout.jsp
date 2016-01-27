<%@ page language="java" import="java.util.*" pageEncoding="GBK"%>
<%
	String user = (String)session.getAttribute("sessionuser");
	if(user==null){
		response.sendRedirect("index.jsp");
		return;
	}
	
	ArrayList<String> list = (ArrayList<String>)application.getAttribute("users");
	
	if(list!=null){
		for(String string:list){
			if(string.equals(user)){
				list.remove(string);
				application.setAttribute("users",list);
				break;
			}
		}
	}
	ArrayList<String> messageList = (ArrayList<String>)application.getAttribute("messages");
	
		if(messageList==null){
			messageList = new ArrayList<String>();
		}
		
	messageList.add("\n"+user+" , Àë¿ªÁÄÌìÊÒÁË.....\n");
	application.setAttribute("messages",messageList);
		
	response.sendRedirect("index.jsp");
%>