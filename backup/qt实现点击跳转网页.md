### 按钮点击信号与槽函数连接

刚学的按钮点击信号与槽函数连接，我来实践一下吧
创建`main.cpp`

> 代码如下

```cpp

#include <QApplication>
#include <QPushButton>
#include <QDesktopServices>
#include <QUrl>

int main(int argc, char *argv[]) {
    QApplication app(argc, argv);

    QPushButton button("打开有惊喜");
    button.resize(200, 100);

    // 按钮点击信号与槽函数连接
    QObject::connect(&button, &QPushButton::clicked, []() {
        // 指定要跳转的URL
        QDesktopServices::openUrl(QUrl("https://www.ababll5.cn"));
    });

    button.show();
    return app.exec();
}

```    
运行一下就会出现这样的画面   

![image](https://github.com/user-attachments/assets/57cc6ed1-924d-4c87-9d9e-cba17b6635b2)   

打开就会跳转到我的博客页面中，只要改一个代码中的url就能跳转到你想要跳转的网页。
