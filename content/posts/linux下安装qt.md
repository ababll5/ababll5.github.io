---
title: "linux下安装qt"
date: 2026-6-13
tags: ["qt"]
---

###linux下安装qt


linux下安装qt简单多了，不需要注册账号只需要输入三条命令


```bash
# 查看可用软件包：
apt list qt6-*dev*

# 安装特定的开发包，例如qtbase 和qtdeclarative ：
sudo apt install qt6-{base,declarative}-dev

# 安装包含文档、构建工具和Qt Creator 的所有可用开发包：
sudo apt install qt6-*{dev,doc}* qtcreator cmake clazy g++

```