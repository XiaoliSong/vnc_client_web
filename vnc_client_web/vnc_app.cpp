#include "vnc_app.h"

typedef enum {
	jsmpeg_frame_type_video = 0xFA010000,
	jsmpeg_frame_type_audio = 0xFB010000
} jsmpeg_trame_type_t;

typedef struct {
	jsmpeg_trame_type_t type;
	int size;
	char data[0];
} jsmpeg_frame_t;

typedef struct {
	unsigned char magic[4];
	unsigned short width;
	unsigned short height;
} jsmpeg_header_t;

typedef enum {
	input_type_key = 0x0001,
	input_type_mouse_button = 0x0002,
	input_type_mouse_absolute = 0x0004,
	input_type_mouse_relative = 0x0008,
	input_type_mouse =
	input_type_mouse_button |
	input_type_mouse_absolute |
	input_type_mouse_relative
} input_type_t;

typedef struct {
	unsigned short type;
	unsigned short state;
	unsigned short key_code;
} input_key_t;

typedef struct {
	unsigned short type;
	unsigned short flags;
	float x, y;
} input_mouse_t;


int swap_int32(int in) {
	return ((in >> 24) & 0xff) |
		((in << 8) & 0xff0000) |
		((in >> 8) & 0xff00) |
		((in << 24) & 0xff000000);
}

int swap_int16(int in) {
	return ((in >> 8) & 0xff) | ((in << 8) & 0xff00);
}

Vnc_app::Vnc_app(QWidget *parent) :QObject(parent)
{
	crop = { 0, 0, 0, 0 };
	grabber = grabber_create(window, crop);
	out_width = grabber->width;
	out_height = grabber->height;
	if (!bit_rate) {
		bit_rate = out_width * 1500;
	} // estimate bit rate based on output size

	encoder = encoder_create(
		grabber->width, grabber->height, // in size
		out_width, out_height, // out size
		bit_rate
	);
}


void Vnc_app::connect_login()
{
	connect(&vnc_webSocket, &QWebSocket::connected, this, &Vnc_app::onConnected);
	connect(&vnc_webSocket, &QWebSocket::disconnected, this, &Vnc_app::onClosed);
	connect(&vnc_webSocket, &QWebSocket::binaryMessageReceived, this, &Vnc_app::onBinaryMessageReceived);
	connect(&vnc_webSocket, &QWebSocket::textMessageReceived, this, &Vnc_app::onTextMessageReceived);
	vnc_webSocket.ignoreSslErrors();
	vnc_webSocket.open(QUrl(vnc_ws_url));
}

void Vnc_app::onClosed()
{
	this->is_run = false;
	emit(to_msg_server("connect;close"));
	qInfo("vnc_app:closed");
}

void Vnc_app::onConnected()
{
	//send jsmpeg_header_t
	jsmpeg_header_t header = {
		{ 'j','s','m','p' },
		swap_int16(encoder->out_width), swap_int16(encoder->out_height)
	};
	QByteArray Bheader;
	Bheader.resize(sizeof(jsmpeg_header_t));
	memcpy(Bheader.data(), &header, sizeof(jsmpeg_header_t));
	vnc_webSocket.sendBinaryMessage(Bheader);

	//send id and pw to confirm
	vnc_webSocket.sendTextMessage(id.append(";").append(pw));
	vnc_webSocket.flush();

	emit(to_msg_server("connect;pass;"));
	qInfo("vnc_app:connected");
}

void Vnc_app::onTextMessageReceived(QString message)
{
	if (message == "login;error") {
		emit(to_msg_server("login;error"));
	}
	if (message == "login;pass") {
		emit(to_msg_server("login;pass"));
	}
	qInfo(QString("vnc_app recvied text:").append(message).toStdString().c_str());
}

void Vnc_app::onBinaryMessageReceived(QByteArray message)
{
	void *data = message.data();
	int len = message.length();
	input_type_t type = (input_type_t)((unsigned short *)data)[0];
	if (type & input_type_key && len >= sizeof(input_key_t)) {
		input_key_t *input = (input_key_t *)data;

		if (input->key_code == VK_CAPITAL) { return; } // ignore caps lock

		UINT scan_code = MapVirtualKey(input->key_code, MAPVK_VK_TO_VSC_EX);
		UINT flags = KEYEVENTF_SCANCODE | (input->state ? 0 : KEYEVENTF_KEYUP);

		// set extended bit for some keys
		switch (input->key_code) {
		case VK_LEFT: case VK_UP: case VK_RIGHT: case VK_DOWN:
		case VK_PRIOR: case VK_NEXT: case VK_END: case VK_HOME:
		case VK_INSERT: case VK_DELETE: case VK_DIVIDE: case VK_NUMLOCK:
			scan_code |= 0x100;
			flags |= KEYEVENTF_EXTENDEDKEY;
			break;
		}

		//printf("key: %d -> %d\n", input->key_code, scan_code);
		keybd_event((BYTE)input->key_code, scan_code, flags, 0);
	}
	else if (type & input_type_mouse && len >= sizeof(input_mouse_t)) {
		input_mouse_t *input = (input_mouse_t *)data;

		if (type & input_type_mouse_absolute) {
			POINT window_pos = { 0, 0 };
			ClientToScreen(grabber->window, &window_pos);

			// figure out the x / y scaling for the rendered video
			float scale_x = ((float)encoder->in_width / encoder->out_width),
				scale_y = ((float)encoder->in_height / encoder->out_height);

			int x = (int)(input->x * scale_x + window_pos.x + grabber->crop.x),
				y = (int)(input->y * scale_y + window_pos.y + grabber->crop.y);

			//printf("mouse absolute %d, %d\n", x, y);
			SetCursorPos(x, y);
		}

		if (type & input_type_mouse_relative) {
			int x = (int)(input->x * mouse_speed),
				y = (int)(input->y * mouse_speed);

			//printf("mouse relative %d, %d\n", x, y);
			mouse_event(MOUSEEVENTF_MOVE, x, y, 0, NULL);
		}

		if (type & input_type_mouse_button) {
	
			//printf("mouse button %d\n", input->flags);

			mouse_event(input->flags, 0, 0, 0, NULL);
			
		}
	}
	qInfo(QString("vnc_app recvied binary:").append(message).toStdString().c_str());
}

void Vnc_app::set_target_fps(int fps)
{
	this->target_fps = fps;
}

DWORD WINAPI RunThread(LPVOID lpParameter)
{
	qInfo("vnc_app:start thread");

	Vnc_app *vnc_app = (Vnc_app*)lpParameter;

	jsmpeg_frame_t *frame = (jsmpeg_frame_t *)malloc(APP_FRAME_BUFFER_SIZE);
	frame->type = jsmpeg_frame_type_video;
	frame->size = 0;
	char buf[APP_FRAME_BUFFER_SIZE];
	
	timer_t *frame_timer = timer_create();

	while (vnc_app->is_run) {
		double wait_time = (1000.0f / vnc_app->target_fps) - 1.5f;
		double delta = timer_delta(frame_timer);
		if (delta > wait_time) {
			timer_reset(frame_timer);
			void *pixels;
			double grab_time = timer_measure(grab_time) {
				pixels = grabber_grab(vnc_app->grabber);
			}
			double encode_time = timer_measure(encode_time) {
				size_t encoded_size = APP_FRAME_BUFFER_SIZE - sizeof(jsmpeg_frame_t);
				encoder_encode(vnc_app->encoder, pixels, frame->data, &encoded_size);
				if (encoded_size) {
					frame->size = swap_int32(sizeof(jsmpeg_frame_t) + encoded_size);
					QByteArray frame_data;
					frame_data.resize(sizeof(jsmpeg_frame_t) + encoded_size);
					memcpy(frame_data.data(), frame, sizeof(jsmpeg_frame_t) + encoded_size);
					vnc_app->vnc_webSocket.sendBinaryMessage(frame_data);
					vnc_app->vnc_webSocket.flush();
				}
			}
		}
		Sleep(1);
	}
	qInfo("vnc_app:end thread");
	timer_destroy(frame_timer);
	free(frame);
	return 0;
}

void Vnc_app::on_msg_server(QString message)
{
	if (get_fun(message) == "login") {
		qInfo(message.toStdString().c_str());
		QString temp = get_content(message);
		this -> id = get_fun(temp);
		temp = get_content(temp);
		this->pw = get_fun(temp);
		this->vnc_ws_url = get_content(temp);
		qInfo(id.toStdString().c_str());
		qInfo(pw.toStdString().c_str());
		qInfo(vnc_ws_url.toStdString().c_str());
		this->connect_login();
		return;
	}
	if (get_fun(message) == "set_fps") {
		this->target_fps = get_content(message).toInt();
		return;
	}

	if (message == "start_vnc") {
		emit(to_msg_server("start_vnc;"));
		run_or_stop(true);
		return;
	}
	if (message == "stop_vnc") {
		emit(to_msg_server("stop_vnc;"));
		run_or_stop(false);
		return;
	}
}

void Vnc_app::run_or_stop(bool is_run)
{
	if (is_run == true && this->is_run == false) {
		this->is_run = true;
		HANDLE hThread = NULL;
		hThread = CreateThread(NULL, 0, RunThread, (LPVOID)this, 0, NULL);
		qInfo("vnc_app:start to share");
	}
	else {
		this->is_run = false;
		qInfo("vnc_app:stop to share");
	}
}