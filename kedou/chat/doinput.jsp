<%@ page language="java" pageEncoding="UTF-8"%>
<%@page import="java.net.URLDecoder"%>
<%@page import="java.util.ArrayList"%>
<%@page import="java.text.SimpleDateFormat"%>
<%@page import="java.util.Date"%>
<%
	String user = (String)session.getAttribute("sessionuser");
	if(user==null){
		response.sendRedirect("index.jsp");
	}
	//设置字符编码
//	request.setCharacterEncoding("UTF-8");
	//获得参数
	String message = request.getParameter("message");
	
	ArrayList<String> messageList = (ArrayList<String>)application.getAttribute("messages");
	
	if(messageList==null){
		messageList = new ArrayList<String>();
	}
	
	if(message!=null){
		message = URLDecoder.decode(message,"UTF-8");
		message = user+"  ("+new SimpleDateFormat("yyyy-MM-dd HH:mm:ss").format(new Date())+")  说:\n\t\t"+message+"\n";
		//添加到集合中
   		messageList.add(message);
   		//添加到application对象中
   		application.setAttribute("messages",messageList);
	}
   
 	StringBuffer buffer = new StringBuffer("Welcome to Guo Guo Chatting Room \nBlog Address: (http://lvp.javaeye.com)\n\n");
   	if(messageList!=null && messageList.size()!=0){
		for(String string : messageList){
			buffer.append(string);
		}
	}
   	//输出
   	//设置输出信息的格式及字符集 
	response.setContentType("text/xml; charset=UTF-8");
	response.setHeader("Cache-Control", "no-cache");
	out.print("<response>");
	out.print("<message>");
	out.print(buffer.toString());
	out.print("</message>");
	out.print("</response>");
%>