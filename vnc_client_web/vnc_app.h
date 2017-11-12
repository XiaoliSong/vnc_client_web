#pragma once

#include "head.h"
#include "grabber.h"
#include "encoder.h"
#include "timer.h"
#include "fun.h"

QT_BEGIN_NAMESPACE

const double APP_MOUSE_SPEED = 5.0f;
const int APP_FRAME_BUFFER_SIZE = 1024 * 1024;
const int DEFAULT_FPS = 30;
class Vnc_app : public QObject
{
	Q_OBJECT
private:
	QString id;
	QString pw;
	QString vnc_ws_url;
	void connect_login();
	void set_target_fps(int fps);
	void run_or_stop(bool is_run);
public:
	QWebSocket vnc_webSocket;
	bool is_run = false;
	encoder_t *encoder;
	grabber_t *grabber;
	int target_fps = DEFAULT_FPS;
	int bit_rate;
	int out_width;
	int out_height;
	HWND window = GetDesktopWindow();
	grabber_crop_area_t crop;
	float mouse_speed = APP_MOUSE_SPEED;

	explicit Vnc_app(QWidget *parent = 0);
	void on_msg_server(QString message);
signals:
	void to_msg_server(QString message);
private slots:
	void onClosed();
	void onConnected();
	void onTextMessageReceived(QString message);
	void onBinaryMessageReceived(QByteArray message);
};