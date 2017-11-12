var mysql = require('mysql');
const WebSocket= require('ws');

/*
	sql连接设置
*/

var sql_connection = mysql.createConnection({
	host:'localhost',
	user:'root',
	password:'88068806a',
	database:'vnc'
});
sql_connection.connect(function(err) {
	if (err) {//mysql错误提示
		console.error('mysql error connecting: ' + err.stack);
		return;
	}
	console.log('mysql connected as id ' + sql_connection.threadId);
});


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
	msg_server
*/
msg_server = new WebSocket.Server({port:5800}); 

//上线的人Map，key为id，value为对应的websocket对象
var msg_server_map=new Map();

/*
	检测msg_server_map是否存在id的对象和对应pw是否正确
	存在且正确返回对象，否则返回null
*/
function verify_id_pw(id,pw)
{
	var result=msg_server_map.get(id);
	if(result!=undefined&&result.pw==pw){
		return result;
	}
	return null;
}

/*
	检测msg_server_map是否存在id的对象
	存在则返回对象，否则返回null
*/
function is_exist_id(id)
{
	var result=msg_server_map.get(id);
	if(result==undefined){
		result=null;
	}
	return result;
}

/*
	获取在线列表
	返回list;id;id;.....的string
*/
function get_list()
{
	var list="list;"
	var temp_map=msg_server_map;
	try{
		temp_map.forEach(function (value) {
			try{
				list=list+value.id+";";
			}
			catch(err){
			}
		});
	}
	catch(err){
		return list;	
	}
	return list;
}


/*	
	向全部在线的人（除了newer_id）广播newer_id上线了
*/
function ad_newer(newer_id){
	var temp_map=msg_server_map;

	temp_map.forEach(function (value) {
		try{
			value.send("newer;"+newer_id);
		}
		catch(err){
		}
	});
}

/*	
	向全部在线的人（除了msg_id）广播msg_id发送的群消息
*/
function ad_group_msg(msg_id,msg){
	var temp_map=msg_server_map;
	temp_map.forEach(function (value,key) {
		try{
			if(key!=msg_id){
				value.send("group_msg;"+msg_id+";"+msg);
			}
		}
		catch(err){
		}
	});
}

/*	
	向全部在线的人（除了newer_id）广播outer_id下线了
*/
function ad_outer(outer_id){
	var temp_map=msg_server_map;
	temp_map.forEach(function (value) {
		try{
			value.send("outer;"+outer_id)
		}
		catch(err){
		}
	});
}

/*
	从vnc_server_ws的view_clients_id删除view_id
	即不再允许view_id查看和控制
*/
function delete_view_client(vnc_server_ws,view_id)
{	
	vnc_server_ws.view_clients_id.delete(view_id);
	if(vnc_server_ws==null) return;
	try{
		for(var i=0;i<vnc_server_ws.view_clients.length;i++)
		{
			if(vnc_server_ws.view_clients[i].id==view_id){
				vnc_server_ws.view_clients[i].close();
				vnc_server_ws.view_clients.splice(i,1);
				break;
			}
		}
		delete_control_client(vnc_server_ws,view_id);
	}
	catch(err){
	}
}

/*
	从vnc_server_ws的control_clients_id删除control_id
	即不再允许control_id控制
*/
function delete_control_client(vnc_server_ws,control_id)
{
	vnc_server_ws.control_clients_id.delete(control_id);
	if(vnc_server_ws==null) return;
	try{
		for(var i=0;i<vnc_server_ws.control_clients.length;i++)
		{
			if(vnc_server_ws.control_clients[i].id==control_id){
				vnc_server_ws.control_clients[i].close();
				vnc_server_ws.control_clients.splice(i,1);
				break;
			}
		}
	}
	catch(err){
	}
}

msg_server.on('connection',function(ws) {
	ws.id="";
	ws.pw="";
	ws.on('message',function(msg){
		console.log(msg);
		var fun=get_fun(msg);
		var content=get_content(msg);
		switch(fun)
		{
			case "person_msg":{
				var temp_id=get_fun(content);
				var person_msg_content=get_content(content);
				var temp_ws=is_exist_id(temp_id);
				if(temp_ws!=null){
					try{
						temp_ws.send("person_msg;"+ws.id+";"+person_msg_content);
					}
					catch(err){
					}
				}
				else{
					ad_outer(temp_id);
					return;
				}
				return;
			}
			case "signal":{
				var temp_id=get_fun(content);
				var signal_content=get_content(content);
				var temp_ws=is_exist_id(temp_id);
				if(temp_ws!=null){
					try{
						temp_ws.send("signal;"+ws.id+";"+signal_content);
					}
					catch(err){
					}
				}
				else{
					ad_outer(temp_id);
					return;
				}
				if(signal_content=="pass_view"||signal_content=="push_view"){
					ws.vnc_ws.view_clients_id.add(temp_id);
					return;
				}
				if(signal_content=="close_view"){
					delete_view_client(ws.vnc_ws,temp_id);
					return;
				}
				if(signal_content=="pass_control"||signal_content=="push_control"){
					ws.vnc_ws.view_clients_id.add(temp_id);
					ws.vnc_ws.control_clients_id.add(temp_id);
					return;
				}
				if(signal_content=="close_control"){
					delete_control_client(ws.vnc_ws,temp_id);
					return;
				}
				return;
			}
			case "group_msg":{
				ad_group_msg(ws.id,content);
				return;
			}
			case "getlist":{
				var temp_list=get_list();
				console.log(temp_list);
				try{
					ws.send(temp_list);
				}
				catch(err){
				}
				break;
			}
			case "login":{//登录验证
				var index=content.indexOf(";");
				ws.id=content.substring(0,index);
				ws.pw=content.substring(index+1);
				if(is_exist_id(ws.id)!=null){
					ws.send("login;again");
					return;
				}
				var sql_params=[ws.id,ws.pw];
				var sql = 'SELECT id FROM members WHERE id=? AND pw=?';
				sql_connection.query(sql,sql_params, function (error, result, fields) {
					if(error){
						console.log('[SELECT ERROR] - ',error.message);
						return;
					}
					else{
						if(result.length==1){//login;pass
							console.log('密码验证通过');
							ws.send("login;pass");
							ad_newer(ws.id);
							msg_server_map.set(ws.id,ws);
							ws.on('close',function(){
								msg_server_map.delete(ws.id);
								ad_outer(ws.id);
							});
						}
						else{//login;error
							ws.send("login;error");
						}
					}
				});
				break;
			}
			
			default:{
				break;
			}
		}
	});
	
	
});

msg_server.on('close',function() {
	console.log("\n\n\n\n msg_server closed!\n\n\n\n");
});




/*
** vnc_server 
*/
var vnc_server_map=new Map();

vnc_server = new WebSocket.Server({port:5801}); 

vnc_server.on('connection', function(ws) {
	ws.id="";
	ws.pw="";
	ws.count=0;
	ws.view_clients=[];
	ws.view_clients_id=new Set();
	ws.control_clients=[];
	ws.control_clients_id=new Set();
	ws.on('message',function(msg){
		if(ws.count==2){
			/*
				图像帧
			*/
			
			// 优先转发给正在控制的人
			for(var i=0;i<ws.control_clients.length;i++)
			{
				try{
					ws.control_clients[i].send(msg);
				}
				catch(err){
				}
			}
			
			// 转发给正在查看的人
			for(var i=0;i<ws.view_clients.length;i++)
			{
				try{
					ws.view_clients[i].send(msg);
				}
				catch(err){
				}
			}
			return;
		}
		if(ws.count==0){
			/*
				解析图像所需要的头部
			*/
			ws.image_header_msg=msg;
			ws.count++;
		}
		else if(ws.count==1){
			/*
				身份认证
			*/
			var index=msg.indexOf(";");
			ws.id=msg.substring(0,index);
			ws.pw=msg.substring(index+1);
			ws.msg_ws=verify_id_pw(ws.id,ws.pw);
			
			if(ws.msg_ws!=null){
				vnc_server_map.set(ws.id,ws);
				ws.msg_ws.vnc_ws=ws;
				ws.send("login;pass");
				ws.count++;
				ws.on('close',function(){
					vnc_server_map.delete(ws.id);
				});
			}
			else{//未登录msg_server
				ws.send("login;error");
				ws.close();
			}
			
		}
	});
});


vnc_server.on('close', function(ws) { 
	console.log("\n\n\n\n vnc_server closed!\n\n\n\n");
});



/*
vnc_client_server
*/
vnc_client_server = new WebSocket.Server({port:5802}); 
var clients=[] ;

vnc_client_server.on('connection', function(ws) {
	ws.count=0;
	ws.vnc_ws=null;
	ws.id="";
	ws.pw="";
	ws.on('message',function(msg){
		if(ws.count==1){
			/*
				鼠标键盘控制信息
			*/
			if(ws.way=="control"){
				try{
					ws.vnc_ws.send(msg);
				}
				catch(err){
				}
			}
			return;
		}
		if(ws.count==0){
			/*
			** 身份认证
			*/
			var index=msg.indexOf(";");
			ws.id=msg.substring(0,index);
			
			msg=msg.substring(index+1);
			index=msg.indexOf(";");
			ws.pw=msg.substring(0,index);
			
			if(verify_id_pw(ws.id,ws.pw)==null){
				//账号密码错误
				ws.send("error_login");
				return;
			}
	
			msg=msg.substring(index+1);
			index=msg.indexOf(";");
			ws.to_see_id=msg.substring(0,index);
			ws.vnc_ws=vnc_server_map.get(ws.to_see_id);
			if(ws.vnc_ws==null||ws.vnc_ws==undefined){
				//被查看（控制）的id不存在
				ws.send("error_access");
				return;
			}
			
			ws.way=msg.substring(index+1);
			
			if(ws.way=="view"){
				//查看模式
				if(ws.vnc_ws.view_clients_id.has(ws.id)){
					//可以查看
					ws.send("view_pass");
					ws.send(ws.vnc_ws.image_header_msg);
					ws.vnc_ws.view_clients.push(ws);
					ws.on('close',function(){
						for(var i=0;i<ws.vnc_ws.view_clients.length;i++)
						{
							if(ws.vnc_ws.view_clients[i]==ws){
								ws.vnc_ws.view_clients.splice(i,1);
								break;
							}
						}
					});
				}
				else{
					//无权限查看
					ws.send("permission_denied");
				}
			}
			
			if(ws.way=="control"){
				//控制模式
				if(ws.vnc_ws.control_clients_id.has(ws.id)){
					//可以控制
					ws.send("control_pass");
					ws.send(ws.vnc_ws.image_header_msg);
					ws.vnc_ws.control_clients.push(ws);
					ws.on('close',function(){
						for(var i=0;i<ws.vnc_ws.control_clients.length;i++)
						{
							if(ws.vnc_ws.control_clients[i]==ws){
								ws.vnc_ws.control_clients.splice(i,1);
								break;
							}
						}
					});
				}
				else{
					//无权限控制
					ws.send("permission_denied");
				}
			}
			
			ws.count++;
		}
	});
});

vnc_client_server.on('close', function(ws) {  	
	console.log("\n\n\n\n vnc_client_server closed!\n\n\n\n");
});

console.log("server start");