#include "msg_server.h"

Msg_server::Msg_server(quint16 port, QString id, QString pw, QObject *parent) :QObject(parent){
	this->id = id;
	this->pw = pw;
	m_pWebSocketServer = new QWebSocketServer(QStringLiteral("Msg_server"), QWebSocketServer::NonSecureMode, this);

	while (!m_pWebSocketServer->listen(QHostAddress::LocalHost, port)) {
		qsrand(QTime(0, 0, 0).secsTo(QTime::currentTime()));
		port = port + qrand() % rand_num;
	}
	connect(m_pWebSocketServer, &QWebSocketServer::newConnection, this, &Msg_server::onNewConnection);
	connect(m_pWebSocketServer, &QWebSocketServer::closed, this, &Msg_server::closed);
	this->port = port;
}

Msg_server::~Msg_server()
{
	m_pWebSocketServer->close();
	delete m_client;
}

void Msg_server::closed() {
	exit(0);
}

void Msg_server::onNewConnection()
{
	QWebSocket *pSocket = m_pWebSocketServer->nextPendingConnection();
	if (m_client == NULL) {
		connect(pSocket, &QWebSocket::textMessageReceived, this, &Msg_server::processTextMessage);
		connect(pSocket, &QWebSocket::binaryMessageReceived, this, &Msg_server::processBinaryMessage);
		connect(pSocket, &QWebSocket::disconnected, this, &Msg_server::socketDisconnected);
		m_client = pSocket;
		m_client->sendTextMessage("login;" + id + ";" + pw);
	}
	else {
		pSocket->sendTextMessage("login;again");
	}
}

void Msg_server::processTextMessage(QString message)
{
	QWebSocket *pClient = qobject_cast<QWebSocket *>(sender());
	if (pClient) {
		emit(to_app(message));
		emit(to_vnc_app(message));
	}
}

void Msg_server::processBinaryMessage(QByteArray message)
{
	return;
}

void Msg_server::socketDisconnected()
{
	exit(0);
}

void Msg_server::on_vnc_app(QString message)
{
	m_client->sendTextMessage(message);
}