<?php
	include "./connect.php";
	
	$defined_reg_pw="rootadmin";
	
	function del_file($dirName){
		if(file_exists($dirName) && $handle=opendir($dirName)){
			while(false!==($item = readdir($handle))){
				if($item!= "." && $item != ".."){
					if(file_exists($dirName.'/'.$item) && is_dir($dirName.'/'.$item)){
						del_file($dirName.'/'.$item);
					}else{
						if(unlink($dirName.'/'.$item)){
							return true;
						}
					}
				}
			}
			closedir( $handle);
		}
	}
	
	$os_name=PHP_OS;
	if(strpos($os_name,"Linux")!==false){
		$os_str="Linux";
	}else if(strpos($os_name,"WIN")!==false){
		$os_str="Windows";
	}

	$reg_id=$_GET["reg_id"];
	$reg_pw=$_GET["reg_pw"];
	$reg_key=$_GET["reg_key"];
	
	if($reg_id==""||$reg_pw==""||$reg_key==""){
		echo -5;
		return;
	}
	
	if($reg_key!=$defined_reg_pw){
		echo 2;
	}
	else{
		$conn=connect();	
		if($conn==NULL){
			echo -2;
		}
		else{
			$sql="SELECT id,reg_time,intro from members WHERE id='$reg_id'";
			$result=$conn->query($sql);
			$rowcount=$result->num_rows;
			if($rowcount==1){
				echo 0;
			}
			else{
				date_default_timezone_set('PRC'); 
				$time=date('Y-m-d H:i:s',time());
				$sql="INSERT INTO members SET id='$reg_id',pw='$reg_pw',reg_time='$time' ";//插入
				if($result=$conn->query($sql)){
					
					if($os_str=="Linux"){
						//Linux
						if (!file_exists("./file/".$reg_id)){
							//不存在文件夹，则创建
							if(mkdir("./file/".$reg_id)){
								echo 1;
							}
							else{
								echo -4;
							}
						}
						else{
							//存在文件夹，则删除里面文件
							del_file("./file/".$reg_id);
							echo 1;
						}
					}
					
					else{
						//Windows
						if (!file_exists(iconv("UTF-8","gb2312","./file/".$reg_id))){
							//不存在文件夹，则创建
							if(mkdir(iconv("UTF-8","gb2312","./file/".$reg_id))){
								echo 1;
							}
							else{
								echo -4;
							}
						}
						else{
							//存在文件夹，则删除里面文件
							del_file(iconv("UTF-8","gb2312","./file/".$reg_id));
							echo 1;
						}
					}
				}
				else{
					echo -3;
				}
			}
		}
	}
?>