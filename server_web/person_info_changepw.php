<?php
	include "./connect.php";
	$account=10;
	$id=$_GET["id"];
	$old_pw=$_GET["old_pw"];
	$new_pw=$_GET["new_pw"];
	$conn=connect();	
	if($conn!=NULL){
		$sql="SELECT id FROM members WHERE id='$id' AND pw='$old_pw'";
		if ($result=$conn->query($sql)){
			$rowcount=$result->num_rows;
			$result->close();
			if($rowcount==1){//存在用户
				$sql="UPDATE members SET pw='$new_pw' WHERE id='$id'";
				if($result=$conn->query($sql)){
					echo 1;
				}
				else{
					echo -1;
				}
			}
			else{
				echo 0;
			}
		}
	}
	else{
		
	}
?>