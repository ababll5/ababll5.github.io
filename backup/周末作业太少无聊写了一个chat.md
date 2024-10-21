# my-chat第一代的诞生

周末作业周五就做完了，闲着没事，写了个通讯网页**my-chat**

想体验的可以转[im.ababll5.cn](https://im.ababll5.cn/)


# 接下来是部署教程

不想折腾的可以花20找我帮忙搭建
- 扣扣：369491854
- 绿泡泡：15913105505

# my-chat
一个简约的chat

### 演示

演示图片：



![image](https://github.com/user-attachments/assets/65ec8c7f-b424-49d6-9c64-30cfca38eb7a)
![image](https://github.com/user-attachments/assets/23d494ae-0698-4efc-accf-6fe171bdf20b)
![image](https://github.com/user-attachments/assets/246b294c-194a-4490-ba4f-0c69d35fa696)

### 部署教程

[点我去下载源码](https://github.com/ababll5/my-chat/main)    


这里推荐宝塔来完成以下操作

### 后端

打开`admin`文件夹，在里面打开cmd  
之后输入  
```js  
npm install ws  
```
什么！npm not found  
你就浏览器收nodejs下载安装就好了  

npm install ws后我们继续运行这串指令  
```js  
node main.js  
```  
这样后端就部署在了8115端口上  
> 记得开放防火墙  

有能力的，前端域名有ssl证书的，就反向代理`ws//ip:8115/`到你的后端域名  
> 反向代理的前后端不能用同一个域名(可以用不同的三级域名)

#### 不过这样子终端一退出后端就会停
宝塔面板里面有一个软件叫`进程守护器`  
![image](https://github.com/user-attachments/assets/f7e7d6ab-da1b-4481-bf0b-617be5c4f1ba)

安装好后像我这样配置
![image](https://github.com/user-attachments/assets/66d2d7a0-3434-4bb1-9609-dcd11a5cfb5b)


测试一下  

打开这个网页[Websocket在线模拟请求工具](http://www.yunjson.com/websocket/)  

把ws也就是刚刚部署的那条连接复制进去就好了  


这样后端的部署就完成了    

### 前端

更简单用宝塔面板部署根目录就好了  


### 对接

打开`chat.php`    


找到![image](https://github.com/user-attachments/assets/85cdc701-8c70-41c8-b141-2208af65f41e)  


地址写后端的`ws://ip:8115`或者`wss://域名/wss`  

### 最后

打开你的前端网址玩就是了





