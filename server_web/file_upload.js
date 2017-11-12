var form = document.forms.namedItem("upload_form");
form.addEventListener('submit', function(ev) {
	oData = new FormData(form);
	var oReq = new XMLHttpRequest();
	oData.append("id",login_id);
	oData.append("pw",login_pw);
	oReq.open("POST", "./file_upload.php", true);
	oReq.onload = function(oEvent) {
		if (oReq.status == 200 && oReq.responseText==1) {
			document.getElementById("upload_form").reset();
			set_noti("upload_file_noti","green","上传成功");
		} 
		else {
			document.getElementById("upload_form").reset();
			set_noti("upload_file_noti","red",oReq.responseText);
		}
	};
	oReq.send(oData);
	ev.preventDefault();
}, false);