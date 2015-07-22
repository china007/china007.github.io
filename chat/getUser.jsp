<%@ page language="java" pageEncoding="UTF-8"%>
<%@page import="java.util.ArrayList"%>
<%@page import="java.net.URLDecoder"%>
<%
	String user = (String)session.getAttribute("sessionuser");
	if(user==null){
		response.sendRedirect("index.jsp");
	}
	
	
	//从application中取出所有已登录者的信息
	ArrayList<String> list = (ArrayList<String>)application.getAttribute("users");
	
	int size = 0;
	if(list!=null)
		size = list.size();
		
	StringBuffer buffer = new StringBuffer("在线用户("+size+"人)\n");
	
	if(list!=null){
		for(String string:list){
			buffer.append(string+"\n");
		}
	}
	
	//设置输出信息的格式及字符集 
	response.setContentType("text/xml; charset=UTF-8");
	response.setHeader("Cache-Control", "no-cache");
	out.print("<response>");
	out.print("<userinfo>");
	out.print(buffer.toString());
	out.print("</userinfo>");
	out.print("</response>");
%>