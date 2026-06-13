---
title: "c++文件io"
date: 2026-06-13
tags: ["cpp"]
---


### c++中的文件IO操作

步骤如下

1. 必须包含的头文件

`#include<fstream>`

2. 创建流对象

操作文件的三大对象

- ofstream : 写操作

- ifstream : 读操作

- fstram : 读写操作

例如
`ofstream ofs;`

3. 打开文件

`ofs.open("文件路径",打开方式);`

4. 写入内容

`ofs <<"写入内容";`

5. 关闭文件

`ofs.close();`


打开方式如下：

|打开方式|作用|
--------|-----
ios::in|读
ios::out|写
ios::ate|从文件尾开始
ios::app|追加
ios::trunc|先删除同名再创建
ios::binary|二进制


可以用 `|` 同时使用多种打开方式  