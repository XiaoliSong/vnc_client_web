/*
	登陆
*/
function to_login_view(){
	document.getElementById("reg_view").style.display="none";
	document.getElementById("login_view").style.display="block";
}
/*

*/
function to_reg_view(){
	document.getElementById("login_view").style.display="none";
	document.getElementById("reg_view").style.display="block";
}

/*
	登陆
*/
function login(){
	login_id=document.getElementById("login_id").value;
	login_pw=document.getElementById("login_pw").value;
	if(get_pw!=login_pw){
		login_pw=hex_sha1(login_pw);
	}
	server_ws.send("login;"+login_id+";"+login_pw);
}

/*
	注册
*/
function reg(){
	var reg_id=document.getElementById("reg_id").value;
	var reg_pw=document.getElementById("reg_pw").value;
	var reg_key=document.getElementById("reg_key").value;
	if(reg_id==""||reg_pw==""||reg_key==""){
		set_noti("reg_noti","red","账号、密码、注册码不能为空！");
		return;
	}
	
	reg_pw=hex_sha1(reg_pw);
	
	var req_url="./reg.php?reg_id="+reg_id+"&reg_pw="+reg_pw+"&reg_key="+reg_key;
	var xmlhttp;
	if (window.XMLHttpRequest){// code for IE7+, Firefox, Chrome, Opera, Safari
		xmlhttp=new XMLHttpRequest();
	}
	
	else{// code for IE6, IE5
		xmlhttp=new ActiveXObject("Microsoft.XMLHTTP");
	}	

	xmlhttp.onreadystatechange=function() {
		if (xmlhttp.readyState==4 && xmlhttp.status==200){
			if(xmlhttp.responseText==1){
				set_noti("reg_noti","red","注册成功，1 S 后转到登录！");
				document.getElementById("login_id").value=document.getElementById("reg_id").value;
				document.getElementById("login_pw").value=document.getElementById("reg_pw").value;
				setTimeout(function(){
					to_login_view();
				},1000);
			}
			else{
				if(xmlhttp.responseText==2){
					set_noti("reg_noti","red","注册失败！注册码不对！");
				}
				else{
					if(xmlhttp.responseText==0){
						set_noti("reg_noti","red","注册失败！已经存在该用户名");
					}
					else{
						set_noti("reg_noti","red","注册失败！错误码："+xmlhttp.responseText);
					}
				}
			}
		}
	};
	xmlhttp.open("GET",req_url,true);
	xmlhttp.send();
}