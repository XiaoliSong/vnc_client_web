<?php
	include "./connect.php";
	$os_name=PHP_OS;
	if(strpos($os_name,"Linux")!==false){
		$os_str="Linux";
	}else if(strpos($os_name,"WIN")!==false){
		$os_str="Windows";
	}

	$id=$_POST["id"];
	$pw=$_POST["pw"];
	$path="./file/".$id;
	
	$conn=connect();	
	if($conn!=NULL){
		$sql="SELECT id FROM members WHERE id='$id' AND pw='$pw'";
		if ($result=$conn->query($sql)){
			$rowcount=$result->num_rows;
			$result->close();
			if($rowcount==1){//存在用户
				if ($_FILES["file"]["error"] > 0){
					echo "错误：" . $_FILES["file"]["error"];
				}
				
				else{
					if(strcmp(substr(strrchr($_FILES["file"]["name"], '.'), 1),"php")==0){
						echo "错误：不允许上传php类型文件！";
					}
					else{
						$file_name=$_FILES["file"]["name"];
						$sql="SELECT upload_id FROM file WHERE upload_id='$id' AND name='$file_name'";
						
						if ($result=$conn->query($sql)){
							$rowcount=$result->num_rows;
							$result->close();
							if($rowcount==0){
								$result=false;
								if($os_str=="Linux"){
									move_uploaded_file($_FILES["file"]["tmp_name"],$path."/".$file_name);
								}
								else{
									move_uploaded_file($_FILES["file"]["tmp_name"],iconv("UTF-8","gb2312", $path."/".$file_name));
								}
								date_default_timezone_set('PRC'); 
								$time=date('Y-m-d H:i:s',time());
								$sql="INSERT INTO file SET upload_id='$id',name='$file_name',time='$time' ";//插入
								if($result=$conn->query($sql)){
									echo 1;
								}
							}
							else{
								echo "错误：文件名为".$file_name."已存在";
								
							}
							
						}
						
					}
				}
			}
			
			else{
				echo "错误：帐号密码不匹配！";
			}
		}
	}
	else{
		echo "错误：连接数据库失败！";
	}
?>