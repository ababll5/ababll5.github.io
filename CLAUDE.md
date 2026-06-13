# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A butterfly-themed static blog generator inspired by [hexo-theme-butterfly](https://github.com/jerryc127/hexo-theme-butterfly). Write blog posts in Markdown files with YAML frontmatter, then run `python3 build.py` to generate a complete static HTML site.

## Commands

- **Build the site**: `python3 build.py`
- **Serve locally**: `python3 -m http.server --directory output/ 8080`
- **Build and serve**: `python3 build.py && python3 -m http.server --directory output/ 8080`

## Architecture

```
build.py                  # Single-file static site generator (Python)
config.yaml               # Site configuration (title, theme, nav, sidebar, etc.)
content/
  posts/*.md              # Blog posts (YAML frontmatter + Markdown body)
  pages/*.md              # Standalone pages (About, etc.)
  images/                 # Post covers, avatar, etc.
themes/butterfly/
  templates/              # Jinja2 HTML templates
    base.html             # Root document shell with blocks for title/og/content
    index.html            # Homepage: post card list + pagination
    post.html             # Single post with TOC, prev/next nav, share, comments
    page.html             # Standalone page
    archive.html          # Posts grouped by year
    tags.html/tag.html    # Tag cloud and per-tag listing
    categories.html/...   # Category listing
    search.html           # Dedicated search page
    partials/             # Reusable template fragments
  static/
    css/style.css         # Complete stylesheet (CSS variables, card system, responsive, dark mode)
    css/pygments.css      # Auto-generated syntax highlighting theme
    js/main.js            # Dark mode toggle, mobile menu, TOC, code copy, back-to-top, search modal
    js/search.js          # Search page initialization
output/                   # GENERATED static site (deploy this directory)
```

## Key Design Patterns

- **Card-based UI**: All content in `.sidebar__card` / `.post-card` elements with shadows and hover effects
- **CSS Variables**: Theming via `[data-theme="light"]` and `[data-theme="dark"]` on `<html>`. See `:root` in style.css. Accent color is `#49b1f5` (light) / `#58a6ff` (dark).
- **Two-column layout**: `display: flex` on `.layout` at ≥900px, stacked below. Sidebar is 300px.
- **Post metadata**: YAML frontmatter supports `title`, `date`, `updated`, `tags`, `categories`, `cover`, `description`
- **Code highlighting**: Pygments via `codehilite` Markdown extension. Theme CSS auto-generated in `pygments.css`
- **Client-side search**: `search_index.json` loaded by `main.js`; scored substring matching with debounce
- **Dark mode FOUC prevention**: Inline `<script>` in `<head>` reads localStorage before paint
