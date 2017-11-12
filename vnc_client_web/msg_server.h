#pragma once
#include "head.h"
#include "fun.h"

const int rand_num = 1000;

class Msg_server : public QObject
{
	Q_OBJECT
public:
	unsigned int port;
	QString id;
	QString pw;
	explicit Msg_server(quint16 port, QString id,QString pw, QObject *parent = Q_NULLPTR);
	~Msg_server();
private:
	QWebSocketServer *m_pWebSocketServer;
	QWebSocket * m_client=NULL;
	void onNewConnection();
	void processTextMessage(QString message);
	void processBinaryMessage(QByteArray message);
	void socketDisconnected();
	void closed();
signals:
	void to_app(QString message);
	void to_vnc_app(QString message);
public slots:
	void on_vnc_app(QString message);
};