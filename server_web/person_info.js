
function person_info_changepw(){
	var old_pw=document.getElementById("person_info_old_pw").value;
	var new_pw=document.getElementById("person_info_new_pw").value;
	var new_pw_confirm=document.getElementById("person_info_new_pw_confirm").value;
	if(old_pw==""||new_pw==""||new_pw_confirm==""){
		set_noti("person_info_noti","red","全部输入都不允许为空");
		return;
	}
	if(new_pw!=new_pw_confirm){
		set_noti("person_info_noti","red","两次新密码不一致");
		return;
	}
	
	old_pw=hex_sha1(old_pw);
	new_pw=hex_sha1(new_pw);
	if(old_pw!=login_pw){
		set_noti("person_info_noti","red","旧密码不正确！");
		return;
	}
	
	var req_url="./person_info_changepw.php?id="+login_id+"&old_pw="+old_pw+"&new_pw="+new_pw;
	var xmlhttp;
	if (window.XMLHttpRequest){// code for IE7+, Firefox, Chrome, Opera, Safari
		xmlhttp=new XMLHttpRequest();
	}
	
	else{// code for IE6, IE5
		xmlhttp=new ActiveXObject("Microsoft.XMLHTTP");
	}	

	xmlhttp.onreadystatechange=function() {
		if (xmlhttp.readyState==4&& xmlhttp.status==200){
			if(xmlhttp.responseText==1){
				document.getElementById("person_info_changepw_form").reset();
				login_pw=new_pw;
				set_noti("person_info_noti","red","修改成功！");
			}
			else if(xmlhttp.responseText==0){
				set_noti("person_info_noti","red","旧密码不正确！");
			}
		}
		else if (xmlhttp.readyState==4){
			set_noti("person_info_noti","red","失败！");
		}
	};
	xmlhttp.open("GET",req_url,true);
	xmlhttp.send();
}