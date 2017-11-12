function set_noti(name,color,msg){
	document.getElementById(name).style.color=color;
	document.getElementById(name).innerHTML=msg;
}

function get_query_string(name){
     var reg = new RegExp("(^|&)"+ name +"=([^&]*)(&|$)");
     var r = window.location.search.substr(1).match(reg);
     if(r!=null) return  unescape(r[2]); 
	 return null;
}


function to_online_list(){
	document.getElementById("online_list").style.display="block";
	document.getElementById("public_file").style.display="none";
	document.getElementById("person_file").style.display="none";
	document.getElementById("person_info").style.display="none";
	document.getElementById("upload_file").style.display="none";
	
	document.getElementById("to_online_list_btn").style.background="#C0C0C0";
	document.getElementById("to_public_file_btn").style.background="#A0A0A0";
	document.getElementById("to_person_file_btn").style.background="#A0A0A0";
	document.getElementById("to_person_info_btn").style.background="#A0A0A0";
	document.getElementById("to_upload_file_btn").style.background="#A0A0A0";
}

function to_public_file(){
	get_public_file();
	document.getElementById("online_list").style.display="none";
	document.getElementById("public_file").style.display="block";
	document.getElementById("person_file").style.display="none";
	document.getElementById("person_info").style.display="none";
	document.getElementById("upload_file").style.display="none";
	
	document.getElementById("to_online_list_btn").style.background="#A0A0A0";
	document.getElementById("to_public_file_btn").style.background="#C0C0C0";
	document.getElementById("to_person_file_btn").style.background="#A0A0A0";
	document.getElementById("to_person_info_btn").style.background="#A0A0A0";
	document.getElementById("to_upload_file_btn").style.background="#A0A0A0";
}

function to_person_file(){
	get_person_file();
	document.getElementById("online_list").style.display="none";
	document.getElementById("public_file").style.display="none";
	document.getElementById("person_file").style.display="block";
	document.getElementById("person_info").style.display="none";
	document.getElementById("upload_file").style.display="none";
	
	document.getElementById("to_online_list_btn").style.background="#A0A0A0";
	document.getElementById("to_public_file_btn").style.background="#A0A0A0";
	document.getElementById("to_person_file_btn").style.background="#C0C0C0";
	document.getElementById("to_person_info_btn").style.background="#A0A0A0";
	document.getElementById("to_upload_file_btn").style.background="#A0A0A0";
}

function to_person_info(){
	document.getElementById("online_list").style.display="none";
	document.getElementById("public_file").style.display="none";
	document.getElementById("person_file").style.display="none";
	document.getElementById("person_info").style.display="block";
	document.getElementById("upload_file").style.display="none";
	
	document.getElementById("to_online_list_btn").style.background="#A0A0A0";
	document.getElementById("to_public_file_btn").style.background="#A0A0A0";
	document.getElementById("to_person_file_btn").style.background="#A0A0A0";
	document.getElementById("to_person_info_btn").style.background="#C0C0C0";
	document.getElementById("to_upload_file_btn").style.background="#A0A0A0";
}

function to_upload_file(){
	document.getElementById("online_list").style.display="none";
	document.getElementById("public_file").style.display="none";
	document.getElementById("person_file").style.display="none";
	document.getElementById("person_info").style.display="none";
	document.getElementById("upload_file").style.display="block";
	
	document.getElementById("to_online_list_btn").style.background="#A0A0A0";
	document.getElementById("to_public_file_btn").style.background="#A0A0A0";
	document.getElementById("to_person_file_btn").style.background="#A0A0A0";
	document.getElementById("to_person_info_btn").style.background="#A0A0A0";
	document.getElementById("to_upload_file_btn").style.background="#C0C0C0";
}