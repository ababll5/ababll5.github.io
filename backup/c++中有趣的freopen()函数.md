# c++ freopen函数



### 语法

头文件：`#include<stdio.h>`

语法：`freopen("文件名.后缀","模式"stdin / stdout)` `stdin输入` ` stdout输入`



模式的表

![image.png](https://s2.loli.net/2024/09/27/WfdvVGXaHigCpQL.png)



### 简单的A+B problem

```cpp
#include <stdio.h>
#include <iostream>
using namespace std;

int main()
{
    int a, b;



    freopen("in.txt", "r", stdin);  
    freopen("out.txt", "w", stdout);    


    cin>>a>>b;

    cout<<a+b<<endl;


    fclose(stdin);             // 关闭重定向输入
    fclose(stdout);            // 关闭重定向输出
    return 0;
}
```



编译后只需要在文件夹中创建一个`in.txt`里面输入两个加数

![image.png](https://s2.loli.net/2024/09/28/zUHEK3LfCkeYrgR.png)



再运行程序

之后就会在同一文件夹内的`out.txt`中出现两数相加的答案

![image.png](https://s2.loli.net/2024/09/28/7pXsEP3o96qMclg.png)



### 理论

实践完了，我们开始讲理论知识



C/C++[重定向](https://so.csdn.net/so/search?q=重定向&spm=1001.2101.3001.7020) 标准输入输出 的库函数

所谓重定向输出，就是可以把原本只是输出在控制台的字符，输出到你指定的路径文件中。(输入类似，就是从指定的文件中读取，而不是读取在控制台中的输入。)重定向函数可以在任何时候开启、关闭。





### 课后作业



做一个加法的答题机，判断输入的对错