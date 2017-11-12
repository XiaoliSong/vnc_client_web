var public_file_page=0;

//显示文件
function public_file_display(responseText){
	if(responseText==-1){
		set_noti("public_file_noti","red","连数据库失败！");
		return;
	}
	else{
		if(responseText==-2) {
			set_noti("public_file_noti","red","账号密码不匹配！");
			return;
		}
		else{
			if(responseText==""){
				set_noti("public_file_noti","yellow","当前没有文件！");
				return;
			}
		}
	}
	var file=JSON.parse(responseText);
	var parent_obj=document.getElementById("public_file_table");
	parent_obj.innerHTML="<tr><th>日期</th><th>上传人</th><th>文件</th></tr>";
	for(var i=0;i<file.length;i++)
	{
		var d = new Date(file[i]['time']);
		var date=d.getFullYear()+"-"+(d.getMonth()+1)+"-"+d.getDate();
		var tr_ele=document.createElement("tr");//js新建元素
		tr_ele.innerHTML="<td>"+date+"</td>";
		tr_ele.innerHTML+="<td>"+file[i]['upload_id']+"</td>";
		tr_ele.innerHTML+="<td><a href='./file/"+file[i]['upload_id']+"/"+file[i]['name']+"'>"+file[i]['name']+"</a></td>";
		parent_obj.appendChild(tr_ele);
	}
	document.getElementById("public_file_page_noti").innerHTML=public_file_page;
	
	if(file.length==0){
		set_noti("public_file_noti","red","当前没有文件！");
	}
	if(file.length>=10){
		document.getElementById("public_file_next_page").style.visibility="visible";
	}
	else{
		document.getElementById("public_file_next_page").style.visibility="hidden";
	}
}


//ajax获取文件
function get_public_file(){
	set_noti("public_file_noti","red","");
	var req_url="./file_public.php?id="+login_id+"&pw="+login_pw+"&page="+public_file_page;
	var xmlhttp;
	if (window.XMLHttpRequest){// code for IE7+, Firefox, Chrome, Opera, Safari
		xmlhttp=new XMLHttpRequest();
	}
	
	else{// code for IE6, IE5
		xmlhttp=new ActiveXObject("Microsoft.XMLHTTP");
	}	

	xmlhttp.onreadystatechange=function() {
		if (xmlhttp.readyState==4&& xmlhttp.status==200){
			public_file_display(xmlhttp.responseText);
		}
		else if (xmlhttp.readyState==4){
			set_noti("public_file_noti","red","获取文件失败！");
		}
	};
	xmlhttp.open("GET",req_url,true);
	xmlhttp.send();
}

function public_file_next_page(){
	public_file_page=public_file_page+1;
	get_public_file();
	document.getElementById("public_file_former_page").style.visibility="visible";
}

function public_file_former_page(){
	if(public_file_page>1){
		public_file_page=public_file_page-1;
		document.getElementById("public_file_former_page").style.visibility="visible";
	}
	else{
		public_file_page=0;
		document.getElementById("public_file_former_page").style.visibility="hidden";
	}
	get_public_file();
}

function public_file_fisrt_page(){
	document.getElementById("public_file_former_page").style.visibility="hidden";
	public_file_page=0;
	get_public_file();
}
