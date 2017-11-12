var client_ws;
var server_ws;
var get_pw="";

var login_id="";
var login_pw="";
var is_run=false;

var cur_ip="";

var online_list=new Map();
var group_chat_id="";
var group_chat_obj=new Object();
group_chat_obj.li_ele=document.getElementById("online_list_wrap").children[0];
group_chat_obj.msg_html="";

online_list.set(group_chat_id,group_chat_obj);
var cur_chat_id=group_chat_id;
var cur_chat_obj=group_chat_obj;
cur_chat_obj.li_ele.style.background="#606060";
cur_chat_obj.li_ele.style.borderRight="3px solid #606060";


var list_wrap_unselected_color="#E0E0E0";
var list_wrap_selected_color="#606060";
var list_bdr_style_new_msg="3px solid #A0A0A0";
var list_bdr_style_selected="3px solid #606060";
var list_bdr_style_normal="3px solid #E0E0E0";

if(window.location.host.indexOf(":")==-1){
	cur_ip=window.location.host;
}
else{
	cur_ip=window.location.host.substring(0,window.location.host.indexOf(":"));
}
var vnc_web_url="http://"+cur_ip+"/viewer/index.html";



/*
	msg为fun;(content)格式，调用此函数返回fun，即第一个分号前面的内容
*/
function get_fun(msg){
	var index=msg.indexOf(";");
	return msg.substring(0,index);
}

/*
	msg为fun;content格式，调用此函数返回content，即第一个分号后面的内容
*/
function get_content(msg){
	var index=msg.indexOf(";");
	return msg.substring(index+1);
}



/*
	开始或者停止共享自己的桌面信息，开启后发送自己的屏幕信息到服务器，服务器转发给查看和控制对象
*/
function run_stop_share(){
	if(is_run){//停止共享操作
		client_ws.send("stop_vnc");
		document.getElementById("run_stop_share_btn").value="开始共享";
		document.getElementById("run_stop_share_btn").innerHTML="开始共享";
	}
	else{//开始共享操作
		client_ws.send("start_vnc");
		document.getElementById("run_stop_share_btn").value="关闭共享";
		document.getElementById("run_stop_share_btn").innerHTML="关闭共享";
	}
	is_run=!is_run;
}



/*	
	同意msg_id的查看桌面请求
*/
function pass_view(ask_id){
	server_ws.send("signal;"+ask_id+";pass_view");
	
	var ele=online_list.get(ask_id);
	ele.is_push_view=true;

	if(ask_id==cur_chat_id){
		document.getElementById("push_view_btn").value="关闭查看";
		document.getElementById("push_view_btn").innerHTML="关闭查看";
	}
	var ele=online_list.get(ask_id);
	var display_msg="";
	if(document.getElementById("view_ask_select").value=="自动同意任何人查看"){
		display_msg="已经自动同意 "+ask_id+" 的查看桌面请求";
	}
	else{
		display_msg="已经同意 "+ask_id+" 的查看桌面请求";
	}
	var display_style="color:green;";
	add_send_text_msg(ele,ask_id,display_msg,display_style);
}

/*
	拒绝msg_id的查看桌面请求
*/
function deny_view(ask_id){
	server_ws.send("signal;"+ask_id+";deny_view");
	
	var ele=online_list.get(ask_id);
	var display_msg="";
	if(document.getElementById("view_ask_select").value=="自动拒绝任何人查看"){
		display_msg="已经自动拒绝 "+ask_id+" 的查看桌面请求";
	}
	else{
		display_msg="已经拒绝 "+ask_id+" 的查看桌面请求";
	}
	var display_style="color:red;";
	add_send_text_msg(ele,ask_id,display_msg,display_style);
}

/*
	查看桌面请求处理，请求id为msg_id
*/
function ask_view_msg_process(ask_id){
	if(document.getElementById("view_ask_select").value=="手动同意任何人查看"){
		var r=confirm(ask_id+" 请求查看你的桌面，是否同意？");
		if (r==true){
			pass_view(ask_id);
		}
		else{
			deny_view(ask_id);
		}
	}
	else if(document.getElementById("view_ask_select").value=="自动同意任何人查看"){
		pass_view(ask_id);
	}
	else{
		deny_view(ask_id);
	}
}



/*	
	同意ask_id的控制桌面请求
*/
function pass_control(ask_id){
	server_ws.send("signal;"+ask_id+";pass_control");
	
	var ele=online_list.get(ask_id);
	ele.is_push_view=true;
	ele.is_push_control=true;
	if(ask_id==cur_chat_id){
		document.getElementById("push_view_btn").value="关闭查看";
		document.getElementById("push_view_btn").innerHTML="关闭查看";
		document.getElementById("push_control_btn").value="关闭控制";
		document.getElementById("push_control_btn").innerHTML="关闭控制";
	}
	var display_msg="";
	if(document.getElementById("view_ask_select").value=="自动同意任何人控制"){
		display_msg="已经自动同意 "+ask_id+" 的控制桌面请求";
	}
	else{
		display_msg="已经同意 "+ask_id+" 的控制桌面请求";
	}
	var display_style="color:green;";
	add_send_text_msg(ele,ask_id,display_msg,display_style);
}

/*
	拒绝ask_id的控制桌面请求
*/
function deny_control(ask_id){
	server_ws.send("signal;"+ask_id+";deny_control");
	var ele=online_list.get(ask_id);
	var display_msg="";
	if(document.getElementById("view_ask_select").value=="自动拒绝任何人控制"){
		display_msg="已经自动拒绝 "+ask_id+" 的控制桌面请求";
	}
	else{
		display_msg="已经拒绝 "+ask_id+" 的控制桌面请求";
	}
	var display_style="color:red;";
	add_send_text_msg(ele,ask_id,display_msg,display_style);
}

/*
	控制桌面请求处理，请求id为msg_id
*/
function ask_control_msg_process(ask_id){
	if(document.getElementById("control_ask_select").value=="手动同意任何人控制"){
		var r=confirm(ask_id+"请求控制你的桌面，是否同意？")
		if (r==true){
			pass_control(ask_id);
		}
		else{
			deny_control(ask_id);
		}
	}
	else if(document.getElementById("control_ask_select").value=="自动同意任何人控制"){
		//add_msg("已经自动同意 "+msg_id+" 桌面控制请求","red");
		pass_control(ask_id);
	}
	else{
		//add_msg("已经自动拒绝 "+temp_id+" 桌面控制请求","red");
		deny_control(ask_id);
	}
}


/*
	添加接收的文本消息
	msg_ele为对方的对象，msg_id为对方id，msg为消息内容，style为消息的样式
*/
function add_recv_text_msg(msg_ele,msg_id,msg,style){
	msg_ele.msg_html+="<p class='recv_msg' style='"+style+"'>"+msg+"</p>";
	if(msg_id==cur_chat_id){
		var new_recv_msg_ele=document.createElement("p");
		new_recv_msg_ele.setAttribute("class","recv_msg");
		new_recv_msg_ele.setAttribute("style",style);
		new_recv_msg_ele.innerHTML=msg;
		document.getElementById("msg_content").appendChild(new_recv_msg_ele);
		sync_scroll();
	}
	else{
		if(msg_id!=group_chat_id){
			var parent_obj=document.getElementById("online_list_wrap");
			parent_obj.removeChild(msg_ele.li_ele);
			parent_obj.insertBefore(msg_ele.li_ele,parent_obj.children[1]);
		}
		msg_ele.li_ele.style.borderRight=list_bdr_style_new_msg;
	}
}

/*
	添加发送的文本消息
	msg_ele为对方的对象，msg_id为对方id，msg为消息内容，style为消息的样式
*/
function add_send_text_msg(msg_ele,msg_id,msg,style){
	msg_ele.msg_html+="<p class='send_msg' style='"+style+"'>"+msg+"</p>";
	if(msg_id==cur_chat_id){
		var new_send_msg_ele=document.createElement("p");
		new_send_msg_ele.setAttribute("class","send_msg");
		new_send_msg_ele.setAttribute("style",style);
		new_send_msg_ele.innerHTML=msg;
		document.getElementById("msg_content").appendChild(new_send_msg_ele);
		sync_scroll();
	}
	else{
		if(msg_id!=group_chat_id){
			var parent_obj=document.getElementById("online_list_wrap");
			parent_obj.removeChild(msg_ele.li_ele);
			parent_obj.insertBefore(msg_ele.li_ele,parent_obj.children[1]);
		}
		msg_ele.li_ele.style.borderRight=list_bdr_style_new_msg;
	}
}

/*
	对方（个人）文本消息处理，发消息id为msg_id，消息内容为msg
*/
function person_text_msg_process(msg_id,msg){
	var ele=online_list.get(msg_id);
	add_recv_text_msg(ele,msg_id,msg,"");
}

/*
	群聊消息处理，发消息id为msg_id，消息内容为msg
*/
function group_msg_process(msg_id,msg){
	msg="FROM "+msg_id+":<br />&nbsp;&nbsp;"+msg;
	add_recv_text_msg(group_chat_obj,"",msg,"");
}


/*
	对方（个人）信号消息处理，包括如下：
	（1）对方同意/拒绝你的桌面桌面查看/控制请求
	（2）对方关闭你的桌面查看/控制
	PS:关闭控制后仍可以查看，但是关闭查看后不能控制
*/
function person_signal_msg_process(msg_id,msg){
	var ele=online_list.get(msg_id);
	
	//对方同意你的桌面查看请求或者向你推送桌面查看
	if (msg == "pass_view"|| msg == "push_view") {
		ele.is_view = true;
		if(msg == "pass_view"){
			var display_msg=msg_id+" 已经同意你的桌面查看请求";
			var display_style="color:green;";
			add_recv_text_msg(ele,msg_id,display_msg,display_style);
			
		}
		else{
			var display_msg=msg_id+" 已经向你推送桌面查看";
			var display_style="color:green;";
			add_recv_text_msg(ele,msg_id,display_msg,display_style);
		}
		if(msg_id==cur_chat_id){
			document.getElementById("view_btn").value="查看";
			document.getElementById("view_btn").innerHTML="查看";
		}
		return;
	}
	
	//对方同意你的桌面控制请求或者向你推送桌面控制
	if (msg == "pass_control"|| msg == "push_control") {
		ele.is_control = true;
		ele.is_view = true;
		if(msg == "pass_control"){//对方同意你的桌面控制请求
			var display_msg=msg_id+" 已经同意你的桌面控制请求";
			var display_style="color:green;";
			add_recv_text_msg(ele,msg_id,display_msg,display_style);
		}
		else{//对方向你推送桌面控制
			var display_msg=msg_id+" 已经向你推送桌面控制";
			var display_style="color:green;";
			add_recv_text_msg(ele,msg_id,display_msg,display_style);
		}
		if(msg_id==cur_chat_id){
			document.getElementById("view_btn").value="查看";
			document.getElementById("view_btn").innerHTML="查看";
			document.getElementById("control_btn").value="控制";
			document.getElementById("control_btn").innerHTML="控制";
		}
		return;
	}
	
	//对方关闭你的桌面查看（同时关闭控制）/拒绝你的桌面查看请求
	if (msg == "close_view"||msg == "deny_view") {
		ele.is_view = false;
		ele.is_control = false;
		if(msg == "close_view"){//对方关闭你的桌面查看
			var display_msg=msg_id+" 已经关闭你的桌面查看和控制";
			var display_style="color:red;";
			add_recv_text_msg(ele,msg_id,display_msg,display_style);
		}
		else{//对方拒绝你的桌面查看请求
			var display_msg=msg_id+" 已经拒绝你的桌面查看请求";
			var display_style="color:red;";
			add_recv_text_msg(ele,msg_id,display_msg,display_style);
		}
		if(msg_id==cur_chat_id){
			document.getElementById("view_btn").value="申请查看";
			document.getElementById("view_btn").innerHTML="申请查看";
			document.getElementById("control_btn").value="申请控制";
			document.getElementById("control_btn").innerHTML="申请控制";
		}
		return;
	}
	
	//对方关闭你的桌面控制/拒绝你的桌面控制请求
	if (msg == "close_control"||msg == "deny_control") {
		ele.is_control = false;
		if(msg == "close_control"){//对方关闭你的桌面控制
			var display_msg=msg_id+" 已经关闭你的桌面控制，但你仍可以查看对方桌面";
			var display_style="color:red;";
			add_recv_text_msg(ele,msg_id,display_msg,display_style);
		}
		else{//对方拒绝你的桌面控制请求
			var display_msg=msg_id+" 已经拒绝你的桌面控制请求";
			var display_style="color:red;";
			add_recv_text_msg(ele,msg_id,display_msg,display_style);
		}
		if(msg_id==cur_chat_id){
			document.getElementById("control_btn").value="申请控制";
			document.getElementById("control_btn").innerHTML="申请控制";
		}
		return;
	}
}

/*
	查看/申请查看对方的桌面，
	初始：未申请为申请查看按钮；
	已经申请通过后变成查看按钮；
	对方关闭后变成申请查看按钮；
*/
function view(){
	try{
		if(cur_chat_obj.is_view == false) {//申请查看操作
			server_ws.send("signal;" + cur_chat_id + ";ask_view");
			var display_msg="向 "+cur_chat_id+" 发送申请桌面查看请求";
			var display_style="color:blue;";
			add_send_text_msg(cur_chat_obj,cur_chat_id,display_msg,display_style);
		}
		else {//查看操作
			client_ws.send("open_vnc_web;"+vnc_web_url +"&to_see_id="+cur_chat_id+"&way=view");
		}
	}
	catch(err){
		
	}
}

/*
	查看/申请控制对方的桌面
	初始：未申请为申请控制按钮；
	已经申请通过后变成控制按钮；
	对方关闭后变成申请控制按钮；
*/
function control(){
	try{
		if(cur_chat_obj.is_control == false) {//申请控制操作
			server_ws.send("signal;" + cur_chat_id + ";ask_control");
			var display_msg="向 "+cur_chat_id+" 发送申请桌面控制请求";
			var display_style="color:blue;";
			add_send_text_msg(cur_chat_obj,cur_chat_id,display_msg,display_style);
		}
		else {//控制操作
			client_ws.send("open_vnc_web;"+vnc_web_url +"&to_see_id="+cur_chat_id+"&way=control");
		}
	}
	catch(err){
		
	}
}

/*
	向对方推送桌面查看/关闭对方的桌面查看以及控制
	初始：未推送为推送查看按钮；
	点击推送查看或者同意对方查看/控制请求后为关闭查看按钮；
*/
function push_view(){
	//add_msg("向"+temp_id+"推送桌面查看","#FF9900");
	try{
		if(cur_chat_obj.is_push_view == false) {//推送查看操作
			server_ws.send("signal;" + cur_chat_id + ";push_view");
			document.getElementById("push_view_btn").value="关闭查看";
			document.getElementById("push_view_btn").innerHTML="关闭查看";
			var display_msg="向 "+cur_chat_id+" 推送桌面查看";
			var display_style="color:blue;";
			add_send_text_msg(cur_chat_obj,cur_chat_id,display_msg,display_style);
		}
		else {//关闭查看操作
			server_ws.send("signal;" + cur_chat_id + ";close_view");
			if (cur_chat_obj.is_push_control == true) {
				cur_chat_obj.is_push_control=false;
				document.getElementById("push_control_btn").value="推送控制";
				document.getElementById("push_control_btn").innerHTML="推送控制";
				
			}
			document.getElementById("push_view_btn").value="推送查看";
			document.getElementById("push_view_btn").innerHTML="推送查看";
			
			var display_msg="关闭 "+cur_chat_id+" 的桌面查看和控制";
			var display_style="color:red;";
			add_send_text_msg(cur_chat_obj,cur_chat_id,display_msg,display_style);
		}
		cur_chat_obj.is_push_view=!cur_chat_obj.is_push_view;
	}
	catch(err){
		
	}
}

/*
	向对方推送桌面控制/关闭对方的桌面控制但不关闭控制
	初始：未推送为推送控制按钮；
	点击推送控制或者同意对方控制请求后为关闭控制按钮；
*/
function push_control(){
	//add_msg("向"+temp_id+"推送桌面控制","red");
	try{
		if(cur_chat_obj.is_push_control == false) {//推送控制操作
			server_ws.send("signal;" + cur_chat_id + ";push_control");
			cur_chat_obj.is_push_view=true;
			document.getElementById("push_view_btn").value="关闭查看";
			document.getElementById("push_view_btn").innerHTML="关闭查看";
			document.getElementById("push_control_btn").value="关闭控制";
			document.getElementById("push_control_btn").innerHTML="关闭控制";
			var display_msg="向 "+cur_chat_id+" 推送桌面控制";
			var display_style="color:blue;";
			add_send_text_msg(cur_chat_obj,cur_chat_id,display_msg,display_style);
		}
		else {//关闭控制操作
			server_ws.send("signal;" + cur_chat_id + ";close_control");
			document.getElementById("push_control_btn").value="推送控制";
			document.getElementById("push_control_btn").innerHTML="推送控制";
			var display_msg="关闭 "+cur_chat_id+" 的桌面控制，但对方仍可以你的查看桌面";
			var display_style="color:red;";
			add_send_text_msg(cur_chat_obj,cur_chat_id,display_msg,display_style);
		}
		cur_chat_obj.is_push_control=!cur_chat_obj.is_push_control;
	}
	catch(err){
		
	}
}


/*
	添加新上线的人，新上线id为newer_id
*/
function add_newer(newer_id){
	//add_msg(newer_id+" 已上线","black");
	var parent_obj=document.getElementById("online_list_wrap");
	var new_ele=document.createElement("li");
	new_ele.setAttribute("onclick","to_person_msg_wrap(\""+newer_id+"\");");
	new_ele.innerHTML=newer_id;
	parent_obj.appendChild(new_ele);
	var new_chat_obj=new Object();
	new_chat_obj.li_ele=parent_obj.lastChild;
	new_chat_obj.id=newer_id;
	new_chat_obj.msg_array=[];
	new_chat_obj.msg_html="";
	new_chat_obj.is_view = false;
	new_chat_obj.is_control = false;
	new_chat_obj.is_push_view = false;
	new_chat_obj.is_push_control = false;
	online_list.set(newer_id,new_chat_obj);
}

/*
	删除新下线的人，新下线id为outer_id
*/
function delete_outer(outer_id){
	//add_msg(outer_id+" 已下线","black");
	var parent_obj=document.getElementById("online_list_wrap");
	parent_obj.removeChild(online_list.get(outer_id).li_ele);
	online_list.delete(outer_id);
	if(outer_id==cur_chat_id){
		var new_recv_msg_ele=document.createElement("p");
		new_recv_msg_ele.setAttribute("class","recv_msg");
		new_recv_msg_ele.setAttribute("style","font-size:20px;color:red");
		new_recv_msg_ele.innerHTML="对方已经下线，无法继续聊天了";
		document.getElementById("msg_content").innerHTML="";
		document.getElementById("msg_content").appendChild(new_recv_msg_ele);
	}
}


if (!("WebSocket" in window)){
    // 浏览器不支持 WebSocket
   alert("您的浏览器不支持 WebSocket!");
}
else{
	client_ws = new WebSocket("ws://localhost:"+get_query_string("port"));
	client_ws.onopen = function(){
		set_noti("login_noti","green","连接本地服务器成功");
		
		server_ws = new WebSocket("ws://"+cur_ip+":5800");
		
		server_ws.onopen = function(){
			set_noti("login_noti","green","连接服务器成功");
		};
		
		server_ws.onmessage = function (evt) { 
			var msg=evt.data;
			//登录结果消息
			if(get_fun(msg)=="login"){
				if(get_content(msg)=="pass"){
					//登录成功
					set_noti("login_noti","green","登录成功");
					document.getElementById("login_reg").style.display="none";
					document.getElementById("main").style.display="block";
					
					vnc_web_url=vnc_web_url+"?id="+login_id+"\&pw="+login_pw;
					client_ws.send("login;"+login_id+";"+login_pw+";ws://"+cur_ip+":5801");
					server_ws.send("getlist;");
					setTimeout(function(){
						server_ws.send("getlist;");
					},5000);
					to_online_list();
					get_person_file();
					get_public_file();
				}
				else if(get_content(msg)=="again"){
					//已经在其他地方登录
					set_noti("login_noti","red","已经在其他地方登录");
				}
				else if(get_content(msg)=="error"){
					//账号密码不正确
					set_noti("login_noti","red","账号密码不正确");
				}
				else{
					//其他
					set_noti("login_noti","red",get_content(msg));
				}
				return;
			}
			
			//vnc控制信号消息
			if(get_fun(msg) == "signal") {
				msg = get_content(msg);
				var temp_id = get_fun(msg);
				if (!online_list.has(temp_id)) {
					
				}
				else{
					var content= get_content(msg);

					if (content == "ask_view") {
						ask_view_msg_process(temp_id);
						return;
					}

					if (content == "ask_control") {
						ask_control_msg_process(temp_id);
						return;
					}
					else{
						person_signal_msg_process(temp_id,content);
						return;
					}
				}
			}
			
			//个人消息
			if(get_fun(msg)=="person_msg"){
				msg = get_content(msg);
				var temp_id = get_fun(msg);
				msg = get_content(msg);
				person_text_msg_process(temp_id,msg);
				return;
			}
			
			//群聊消息
			if(get_fun(msg)=="group_msg"){
				msg = get_content(msg);
				var temp_id = get_fun(msg);
				msg = get_content(msg);
				group_msg_process(temp_id,msg);
				return;
			}
			
			//新上线消息
			if(get_fun(msg) == "newer") {
				var temp_id = get_content(msg);
				add_newer(temp_id);
				return;
			}
			
			//刚下线消息
			if(get_fun(msg) == "outer") {
				var temp_id = get_content(msg);
				delete_outer(temp_id);
				return;
			}
			
			//get_list请求返回的上线列表消息
			if(get_fun(msg) == "list") {
				var content = get_content(msg);
				//去除不在线的
				for(var key in online_list)
				{
					try{
						if (content.indexOf(key) == -1) {
							delete_outer(index);
						}
					}
					catch(err){
						
					}
				}
				
				//添加新在线的
				var temp_id;
				while (content.length>0)
				{
					temp_id = get_fun(content);
					if (online_list.has(temp_id)==false&& temp_id!=login_id){
						add_newer(temp_id);
					}
					content = get_content(content);
				}
			}
		};
		
		server_ws.onclose = function(){ 
			set_noti("login_noti","red","连接服务器失败");
		};
	};
	
	client_ws.onmessage = function (evt) { 
		var msg = evt.data;
		if(get_fun(msg)=="login"&&get_content(msg)!="again"){
			var temp=get_content(msg);
			document.getElementById("login_id").value=get_fun(temp);
			get_pw=get_content(temp);
			document.getElementById("login_pw").value=get_content(temp);
			return;
		}
		if(msg=="connect;pass;"){
			//add_msg("vnc已经连上服务器","green");
		}
		if(get_fun(msg)=="start_vnc"){
			//add_msg("已经开始共享屏幕","green");
		}
		
		if(get_fun(msg)=="stop_vnc"){
			//add_msg("已经停止共享屏幕","green");
		}
	};
	
	client_ws.onclose = function(){ 
		set_noti("login_noti","red","连接本地失败");
	};
}
