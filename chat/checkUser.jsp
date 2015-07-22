<%@ page language="java" pageEncoding="UTF-8"%>
<%@page import="java.util.ArrayList"%>
<%@page import="java.net.URLDecoder"%>
<%
	//获得参数 用户名
	String name = request.getParameter("user");
	//name = new String(name.getBytes("ISO-8859-1"),"UTF-8");
	name = URLDecoder.decode(name,"UTF-8");
	//System.out.print("检查用户输入的是:"+name);
	String responseText = "可以使用"; //响应字符串 
	//从application中取出所有已登录者的信息
	ArrayList<String> list = (ArrayList<String>)application.getAttribute("users");
	
	if(list!=null){
		for(String string:list){
			if(string.equals(name)){
				responseText = "这个名称已经被占用！";
				break;
			}
		}
	}
	
	//设置输出信息的格式及字符集 
	response.setContentType("text/xml; charset=UTF-8");
	response.setHeader("Cache-Control", "no-cache");
	out.print("<response>");
	out.print("<userinfo>");
	out.print(responseText);
	out.print("</userinfo>");
	out.print("</response>");
%>