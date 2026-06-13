# 🦋 新鲜哥的技术博客

一个蝴蝶主题的静态博客生成器，用 Markdown 写文章，一键生成纯静态 HTML 站点。

**在线演示**: [ababll5.github.io](https://ababll5.github.io)

## 特性

- **Markdown 写作** — YAML frontmatter + Markdown 正文，简单直观
- **精美设计** — 双边框卡片、浮动导航、温暖单色调色板、翠绿强调色
- **深色模式** — 手动切换 + 傍晚 6 点自动切换
- **移动端适配** — 触摸友好，最小 44px 触摸目标
- **全文搜索** — 客户端 JSON 索引，Ctrl+K 快速唤出
- **代码高亮** — Pygments 语法着色 + 一键运行（C++/Python）
- **Waline 评论** — 国内友好的评论系统，无需 GitHub 账号
- **有趣互动** — 头像烟花、打字机标题、樱花飘落、点赞动画、火箭回顶
- **纯静态输出** — 无需数据库，部署到任意静态托管

## 快速开始

```bash
# 1. 创建新文章
./blog new "我的第一篇文章"

# 2. 编辑 content/posts/ 下的 .md 文件

# 3. 本地预览
./blog server

# 4. 部署到 GitHub Pages
./blog deploy
```

## 命令

| 命令 | 简写 | 说明 |
|------|------|------|
| `./blog new <标题>` | `./blog n` | 创建新文章 |
| `./blog server [端口]` | `./blog s` | 构建并启动本地预览 |
| `./blog build` | `./blog b` | 构建静态站点到 `output/` |
| `./blog deploy [说明]` | `./blog d` | 一键部署到 GitHub Pages |
| `./blog clean` | — | 清理构建输出 |
| `./blog` | — | 查看帮助 |

## 文章格式

在 `content/posts/` 目录下创建 `.md` 文件：

```markdown
---
title: "文章标题"
date: 2026-06-13
tags: [标签1, 标签2]
categories: [分类]
---

## 文章内容

这里是 Markdown 正文...

​```python
def hello():
    print("Hello World!")
​```
```

运行 `./blog new "标题"` 会自动生成带日期前缀的文件。

## 项目结构

```
blog/
├── blog                  # CLI 工具
├── build.py              # 构建引擎
├── config.yaml           # 站点配置
├── content/
│   ├── posts/*.md        # 博客文章
│   ├── pages/*.md        # 独立页面（关于、友链）
│   └── images/           # 文章配图、头像
├── themes/butterfly/
│   ├── templates/        # Jinja2 模板
│   └── static/           # CSS / JS
└── output/               # 生成的静态站点（部署这个目录）
```

## 配置

编辑 `config.yaml` 自定义站点：

```yaml
site:
  title: "你的博客名"
  author: "你的名字"
  url: "https://your-site.github.io"

theme:
  dark_mode: true
  sidebar_widgets: [...]    # 侧边栏组件
  nav_menu: [...]           # 导航菜单

  comments:
    system: waline
    waline:
      server_url: "https://your-waline.vercel.app"
```

## 部署到 GitHub Pages

1. 在 GitHub 创建 `用户名.github.io` 仓库
2. 配置 `config.yaml` 中的 `url`
3. 运行 `./blog deploy`

`deploy` 命令会自动将 `output/` 目录推送到 `gh-pages` 分支。

## 技术栈

- **构建**: Python 3 + Jinja2 + PyYAML + Python-Markdown + Pygments
- **前端**: 纯 HTML/CSS/JS，零框架
- **评论**: Waline
- **字体**: Plus Jakarta Sans + Playfair Display + JetBrains Mono + Noto Sans SC

## License

MIT
