function send_msg(){
	var msg_content_obj=document.getElementById("send_msg_content");
	var msg_content_value=msg_content_obj.value;
	if(msg_content_value==""){
		alert("发送内容不能为空!");
		return;
	}
	msg_content_obj.value="";
	
	var msg_ele=document.createElement("p");
	msg_ele.setAttribute("class","send_msg");
	msg_ele.innerHTML=msg_content_value;
	document.getElementById("msg_content").appendChild(msg_ele);
	sync_scroll();
	
	if(cur_chat_id==group_chat_id){
		group_chat_obj.msg_html+="<p class='send_msg'>"+msg_content_value+"</p>";
		server_ws.send("group_msg;"+msg_content_value);
	}
	else{
		cur_chat_obj.msg_html+="<p class='send_msg'>"+msg_content_value+"</p>";
		server_ws.send("person_msg;"+cur_chat_id+";"+msg_content_value);
	}
}

function sync_scroll(){
	document.getElementById("msg_content").scrollTop=document.getElementById("msg_content").scrollHeight;
}

function to_group_msg_wrap(){
	if(cur_chat_id!=group_chat_id){
		document.getElementById("view_btn").style.display="none";
		document.getElementById("control_btn").style.display="none";
		document.getElementById("push_view_btn").style.display="none";
		document.getElementById("push_control_btn").style.display="none";
		document.getElementById("view_ask_select").style.display="inline";
		document.getElementById("control_ask_select").style.display="inline";
	}
	cur_chat_obj.li_ele.style.background=list_wrap_unselected_color;
	cur_chat_obj.li_ele.style.borderRight=list_bdr_style_normal;
	
	cur_chat_id=group_chat_id;
	cur_chat_obj=group_chat_obj;
	cur_chat_obj.li_ele.style.background=list_wrap_selected_color;
	cur_chat_obj.li_ele.style.borderRight=list_bdr_style_selected;
	
	document.getElementById("msg_id_name").innerHTML="群聊";
	var parent_obj=document.getElementById("msg_content");
	parent_obj.innerHTML="";
	parent_obj.innerHTML=cur_chat_obj.msg_html;
	sync_scroll();
}

function to_person_msg_wrap(new_chat_id){
	if(cur_chat_id==group_chat_id){
		document.getElementById("view_ask_select").style.display="none";
		document.getElementById("control_ask_select").style.display="none";
		document.getElementById("view_btn").style.display="inline";
		document.getElementById("control_btn").style.display="inline";
		document.getElementById("push_view_btn").style.display="inline";
		document.getElementById("push_control_btn").style.display="inline";
	}
	
	{
		document.getElementById("view_btn").disabled=false;
		document.getElementById("view_btn").style.visibility="visible";
		document.getElementById("control_btn").disabled=false;
		document.getElementById("control_btn").style.visibility="visible";
		if(cur_chat_obj.is_view){
			document.getElementById("view_btn").value="查看";
			document.getElementById("view_btn").innerHTML="查看";
		}
		else{
			document.getElementById("view_btn").value="申请查看";
			document.getElementById("view_btn").innerHTML="申请查看";
		}
		
		if(cur_chat_obj.is_control){
			document.getElementById("control_btn").value="控制";
			document.getElementById("control_btn").innerHTML="控制";
		}
		else{
			document.getElementById("control_btn").value="申请控制";
			document.getElementById("control_btn").innerHTML="申请控制";
		}
		
		if(cur_chat_obj.is_push_view){
			document.getElementById("push_view_btn").value="关闭查看";
			document.getElementById("push_view_btn").innerHTML="关闭查看";
		}
		else{
			document.getElementById("push_view_btn").value="推送查看";
			document.getElementById("push_view_btn").innerHTML="推送查看";
		}
		
		if(cur_chat_obj.is_push_control){
			document.getElementById("push_control_btn").value="关闭控制";
			document.getElementById("push_control_btn").innerHTML="关闭控制";
		}
		else{
			document.getElementById("push_control_btn").value="推送控制";
			document.getElementById("push_control_btn").innerHTML="推送控制";
		}
	}
	
	cur_chat_obj.li_ele.style.background=list_wrap_unselected_color;
	cur_chat_obj.li_ele.style.borderRight=list_bdr_style_normal;
	
	cur_chat_id=new_chat_id;
	cur_chat_obj=online_list.get(cur_chat_id);
	cur_chat_obj.li_ele.style.background=list_wrap_selected_color;
	cur_chat_obj.li_ele.style.borderRight=list_bdr_style_selected;
	
	document.getElementById("msg_id_name").innerHTML=cur_chat_id;
	var parent_obj=document.getElementById("msg_content");
	parent_obj.innerHTML="";
	parent_obj.innerHTML=cur_chat_obj.msg_html;
	sync_scroll();
}