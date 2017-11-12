#include"app.h"

App::App(QWidget *parent) :QDialog(parent)
{
	read_config();
	this->msg_server = new Msg_server(msg_ws_port.toUInt(),this->id,this->pw);
	this->vnc_app = new Vnc_app();

	QObject::connect(this->vnc_app, &Vnc_app::to_msg_server, this->msg_server, &Msg_server::on_vnc_app);
	QObject::connect(this->msg_server, &Msg_server::to_vnc_app, this->vnc_app, &Vnc_app::on_msg_server);
	QObject::connect(this->msg_server, &Msg_server::to_app, this, &App::on_msg_server);

	view = new QWebEngineView(this);
	QObject::connect(view->page()->profile(),&QWebEngineProfile::downloadRequested, this, &App::handleDownloadRequested);
	view->page()->profile()->setHttpCacheType(QWebEngineProfile::NoCache);
	view->load(QUrl(web_url + "?port=" + QString::number(msg_server->port, 10)));
	//view->load(QUrl("http://localhost/noti.html"));
	view->show();
	this->setFixedSize(800, 600);
	this->setWindowFlags((Qt::CustomizeWindowHint | Qt::WindowCloseButtonHint | Qt::WindowMinimizeButtonHint)&~(Qt::WindowMaximizeButtonHint));
}

void  App::handleDownloadRequested(QWebEngineDownloadItem * download)
{
	QString download_url = download->url().toString();
	download->setPath("./file/" + download_url.right(download_url.length()- download_url.lastIndexOf("/")-1));

	qDebug(download->path().toStdString().c_str());
	qDebug(download->url().toString().toStdString().c_str());
	qInfo("DDD");
	download->accept();
}

void  App::on_msg_server(QString message)
{
	if (get_fun(message) == "open_vnc_web") {
		Vnc_web *vnc_web = new Vnc_web(get_content(message));
		vnc_web->show();
	}
}

void App::read_config()
{
	QSettings *config_ini_read = new QSettings("config.ini", QSettings::IniFormat);
	if (config_ini_read->status() != 0) {
		QMessageBox box(QMessageBox::Warning, "失败", "读取配置文件config.ini失败！");
		box.setStandardButtons(QMessageBox::Ok | QMessageBox::Cancel);
		box.setButtonText(QMessageBox::Ok, QString("确 定"));
		box.setButtonText(QMessageBox::Cancel, QString("取 消"));
		box.exec();
		delete config_ini_read;
		exit(0);
	}
	web_url = config_ini_read->value("/server/web_url").toString();
	msg_ws_port = config_ini_read->value("/server/msg_port").toString();
	id = config_ini_read->value("/user/id").toString();
	pw = config_ini_read->value("/user/pw").toString();
	
	delete config_ini_read;

	if ( msg_ws_port == ""|| web_url=="") {
		QMessageBox box(QMessageBox::Warning, "失败", "配置文件config.ini的server/msg_port段出错！");
		box.setStandardButtons(QMessageBox::Ok | QMessageBox::Cancel);
		box.setButtonText(QMessageBox::Ok, QString("确 定"));
		box.setButtonText(QMessageBox::Cancel, QString("取 消"));
		box.exec();
		exit(0);
	}
	qInfo("read config successfully");
}

bool App::write_config(bool remeber_pw)
{
	
	QSettings *config_ini_write = new QSettings("config.ini", QSettings::IniFormat);
	if (config_ini_write->status() != 0) {
		QMessageBox box(QMessageBox::Warning, "失败", "写入配置文件config.ini失败！");
		box.setStandardButtons(QMessageBox::Ok | QMessageBox::Cancel);
		box.setButtonText(QMessageBox::Ok, QString("确 定"));
		box.setButtonText(QMessageBox::Cancel, QString("取 消"));
		box.exec();
		delete config_ini_write;
		return false;
	}

	config_ini_write->setValue("/server/web_url", web_url.toStdString().c_str());
	config_ini_write->setValue("/server/msg_port", msg_ws_port.toStdString().c_str());
	config_ini_write->setValue("/user/id", id.toStdString().c_str());
	if (remeber_pw) {
		config_ini_write->setValue("/user/pw", pw.toStdString().c_str());
	}
	else {
		config_ini_write->setValue("/user/pw", QString("").toStdString().c_str());
	}
	delete config_ini_write;
	qInfo("wirte config successfully");
	return true;
}