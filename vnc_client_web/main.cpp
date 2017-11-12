#include "head.h"
#include "app.h"

int main(int argc, char *argv[])
{
	QApplication a(argc, argv);
	App app(0);
	/*
	Login_dialog login_dialog(0);
	login_dialog.exec();
	*/
	app.show();
	return a.exec();
}
