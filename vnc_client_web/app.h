#pragma once

#include "head.h"
#include "msg_server.h"
#include "vnc_app.h"
#include "fun.h"

class App :public QDialog
{
	Q_OBJECT
private:
	QString id;
	QString pw;
	QString web_url;
	QString msg_ws_port;

	Msg_server *msg_server;
	Vnc_app *vnc_app;
	QWebEngineView *view;
	void read_config();
	bool write_config(bool remeber_pw);
public:
	void handleDownloadRequested( QWebEngineDownloadItem * download);
	explicit App(QWidget *parent = 0);
	~App() {
		delete view;
	};
protected:
	void resizeEvent(QResizeEvent *) {
		view->resize(this->size());
	}
public slots :
	void  on_msg_server(QString message);
};

class Vnc_web :public QDialog
{
	Q_OBJECT
	QWebEngineView *view;
public:
	explicit Vnc_web(QUrl vnc_web_url,QWidget *parent = 0) {
		view = new QWebEngineView(this);
		view->load(vnc_web_url);
		view->show();
		this->setMinimumSize(1366, 768);
		this->setWindowFlags(Qt::CustomizeWindowHint | Qt::WindowCloseButtonHint | Qt::WindowMinimizeButtonHint | Qt::WindowMaximizeButtonHint);
		if (get_query_string(vnc_web_url.toString(), "way") == "view") {
			this->setWindowTitle("正在查看 " + get_query_string(vnc_web_url.toString(), "to_see_id") + " 的桌面");
		}
		else {
			this->setWindowTitle("正在控制 " + get_query_string(vnc_web_url.toString(), "to_see_id") + " 的桌面");
		}
	}
	void resizeEvent(QResizeEvent *){
		view->resize(this->size());
	}
	~Vnc_web() {
		delete view;
	};
};