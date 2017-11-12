var person_file_page=0;
//删除文件
function delete_person_file(name){
	var req_url="./file_delete.php?id="+login_id+"&pw="+login_pw+"&name="+name;
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
				set_noti("person_file_noti","green","删除成功！");
				get_person_file();
			}
			else{
				set_noti("person_file_noti","red","删除失败！错误码："+xmlhttp.responseText);
			}
		}
	};
	xmlhttp.open("POST",req_url,true);
	xmlhttp.send();
}

//显示文件
function person_file_display(responseText){
	if(responseText==-1){
		set_noti("person_file_noti","red","连数据库失败！");
		return;
	}
	else{
		if(responseText==-2) {
			set_noti("person_file_noti","red","账号密码不匹配！");
			return;
		}
		else{
			if(responseText==""){
				set_noti("person_file_noti","yellow","当前没有文件！");
				return;
			}
		}
	}
	
	var file=JSON.parse(responseText);
	
	var parent_obj=document.getElementById("person_file_table");
	parent_obj.innerHTML="<tr><th>日期</th><th>文件</th><th>操作</th></tr>";
	for(var i=0;i<file.length;i++)
	{
		var d = new Date(file[i]['time']);
		var date=d.getFullYear()+"-"+(d.getMonth()+1)+"-"+d.getDate();
		var tr_ele=document.createElement("tr");//js新建元素
		tr_ele.innerHTML="<td>"+date+"</td>";
		tr_ele.innerHTML+="<td><a href='./file/"+file[i]['upload_id']+"/"+file[i]['name']+"'>"+file[i]['name']+"</a></td>";
		tr_ele.innerHTML+="<td><button onclick=\" delete_person_file(\'"+file[i]['name']+"\')\">删除</button></td>"
		parent_obj.appendChild(tr_ele);
	}
	
	if(file.length==0){
		set_noti("person_file_noti","red","当前没有文件！");
	}
	if(file.length>=10){
		document.getElementById("person_file_next_page").style.visibility="visible";
	}
	else{
		document.getElementById("person_file_next_page").style.visibility="hidden";
	}
}


//ajax获取文件
function get_person_file(){
	set_noti("person_file_noti","red","");
	var req_url="./file_person.php?id="+login_id+"&pw="+login_pw+"&page="+person_file_page;
	var xmlhttp;
	if (window.XMLHttpRequest){// code for IE7+, Firefox, Chrome, Opera, Safari
		xmlhttp=new XMLHttpRequest();
	}
	
	else{// code for IE6, IE5
		xmlhttp=new ActiveXObject("Microsoft.XMLHTTP");
	}	

	xmlhttp.onreadystatechange=function() {
		if (xmlhttp.readyState==4 && xmlhttp.status==200){
			person_file_display(xmlhttp.responseText);
		}
		else if (xmlhttp.readyState==4){
			set_noti("person_file_noti","red","获取文件失败");
		}
	};
	xmlhttp.open("POST",req_url,true);
	xmlhttp.send();
}

function person_file_next_page(){
	person_file_page=person_file_page+1;
	get_person_file();
	document.getElementById("person_file_former_page").style.visibility="visible";
}

function person_file_former_page(){
	if(person_file_page>1){
		person_file_page=person_file_page-1;
		document.getElementById("person_file_former_page").style.visibility="visible";
	}
	else{
		person_file_page=0;
		document.getElementById("person_file_former_page").style.visibility="hidden";
	}
	get_person_file();
	document.getElementById("person_file_next_page").style.visibility="visible";
}

function person_file_fisrt_page(){
	document.getElementById("person_file_former_page").style.visibility="hidden";
	person_file_page=0;
	get_person_file();
}
