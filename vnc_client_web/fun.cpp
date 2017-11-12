#include "fun.h"

QString get_fun(QString message) {
	QString fun("");
	int index = message.indexOf(';');
	fun = message.left(index);
	return fun;
}

QString get_content(QString message)
{
	QString content("");
	int index = message.indexOf(';');
	content = message.right(message.length() - index - 1);
	return content;
}

QString get_query_string(QString url,QString param_name)
{
	int pos = url.indexOf(param_name + "=");
	if (pos == -1) return QString("");
	else {
		url = url.remove(0,pos + param_name.length() + 1);
		return url.left(url.indexOf("&"));
	}
}