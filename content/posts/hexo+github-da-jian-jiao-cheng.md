---
title: "hexo+github搭建教程"
date: 2024-09-07
tags: ["hexo"]
---

参考于https://blog.csdn.net/qq_62928039/article/details/130248518

# 首先

安装该安装的 
-

+ nodejs  
+ git

## 安装下载部署hexo  

- 创建文件夹（命名随便）  
  右键文件夹选`git bash`打开    
  切换国内路线`  npm config set registry https://npmmirror.com`  

`npm install -g hexo-cli`安装hexo
`hexo init`初始化· 没这一步文件夹内的文件显示不出来  

![展示](https://img.picui.cn/free/2024/06/21/667560465c8ce.bmp)
出现这些文件才算成功，否则有问题
要么自行百度要么问(我的微信15913105505)  

然后
-
输入`hexo g`和`hexo s`  
就会出现以下界面(恭喜你本地部署成功)
![界面](https://img.picui.cn/free/2024/06/21/667567982b689.png) 

随后
-

```
输入命令：ssh-keygen -t rsa -C "注册GitHub的邮箱"
进入c盘的/用户/你的用户名/.ssh/id_rsa.pub
```

用记事本打开`id_rsa.pub`然后复制里面的id  

之后
-
![4](https://img.picui.cn/free/2024/06/21/6675681ecbdee.png)
粘贴进去👇
![5](https://img.picui.cn/free/2024/06/21/66756820a06de.png)


## 验证

```
输入命令（git）：ssh -T git@github.com 并且输入yes之后，行末尾会显示你的用户名
（绑定成功邮箱会收到邮件提醒）
接着在本地绑定与Github的用户名和邮箱（git）
输入命令：git config --global user.name “注册时用户名”
输入命令：git config --global user.email “注册时邮箱”
```

## 上传

![9](https://img.picui.cn/free/2024/06/21/667560465c8ce.bmp)
自行配置自己的名字  
然后将文章末尾改为以下格式：

```
deploy:
        type: git
        repo: git@github.com:用户名/用户名.github.io.git
        branch: main
```

下载上传工具`npm install hexo-deployer-git`

### 以后都是下面的步骤上传文章

```
先本地预览: hexo g && hexo s
```

```
保险起见再生成一次: hexo g
```

```
上传GitHub: hexo d
```

使用的话看官方文档  
有主题的看主题的官方文档
