#!/usr/bin/env python3
"""
Butterfly-style Static Blog Generator.
Converts Markdown posts into a complete static HTML site.
"""

import os
import re
import sys
import json
import math
import shutil
from datetime import datetime, date
from dataclasses import dataclass, field
from pathlib import Path
from typing import Optional

import yaml
import markdown
from jinja2 import Environment, FileSystemLoader, pass_context

# ---------------------------------------------------------------------------
# Data classes
# ---------------------------------------------------------------------------

@dataclass
class Post:
    title: str
    slug: str
    date: datetime
    updated: Optional[datetime]
    content_html: str
    excerpt: str
    toc_html: str
    tags: list[str] = field(default_factory=list)
    categories: list[str] = field(default_factory=list)
    cover: Optional[str] = None
    description: Optional[str] = None
    word_count: int = 0
    reading_time: int = 1

    @property
    def url(self) -> str:
        return f"/posts/{self.slug}/"

    @property
    def year(self) -> int:
        return self.date.year


@dataclass
class Page:
    title: str
    slug: str
    content_html: str
    toc_html: str = ""

    @property
    def url(self) -> str:
        return f"/pages/{self.slug}/"


# ---------------------------------------------------------------------------
# Configuration
# ---------------------------------------------------------------------------

def load_config(path: str = "config.yaml") -> dict:
    with open(path, "r", encoding="utf-8") as f:
        return yaml.safe_load(f)


# ---------------------------------------------------------------------------
# Markdown rendering
# ---------------------------------------------------------------------------

def setup_markdown() -> markdown.Markdown:
    return markdown.Markdown(
        extensions=[
            "fenced_code",
            "codehilite",
            "toc",
            "tables",
            "footnotes",
            "attr_list",
            "nl2br",
        ],
        extension_configs={
            "codehilite": {
                "css_class": "codehilite",
                "guess_lang": True,
                "use_pygments": True,
            },
            "toc": {
                "permalink": True,
                "permalink_class": "toc-link",
                "title": "Table of Contents",
            },
        },
    )


def parse_frontmatter(text: str) -> tuple[dict, str]:
    """Split YAML frontmatter from Markdown body."""
    if not text.startswith("---"):
        return {}, text
    parts = text.split("---", 2)
    if len(parts) < 3:
        return {}, text
    try:
        meta = yaml.safe_load(parts[1]) or {}
    except yaml.YAMLError:
        meta = {}
    return meta, parts[2].strip()


def render_markdown(md: markdown.Markdown, text: str) -> tuple[str, str]:
    """Render Markdown to HTML. Returns (content_html, toc_html)."""
    md.reset()
    body = md.convert(text)
    toc = getattr(md, "toc", "") or ""
    if isinstance(toc, str) and toc.strip():
        # Wrap TOC in a card-like div for sidebar
        toc = f'<div class="toc-widget">{toc}</div>'
    return body, toc


def extract_excerpt(html: str, max_chars: int = 300) -> str:
    """Extract plain text excerpt from HTML content."""
    clean = re.sub(r"<[^>]+>", "", html)
    clean = re.sub(r"\s+", " ", clean).strip()
    if len(clean) <= max_chars:
        return clean
    return clean[:max_chars].rsplit(" ", 1)[0] + "..."


def sanitize_slug(text: str) -> str:
    """Convert a string to a URL-safe slug."""
    # Replace spaces and special chars with hyphens
    slug = re.sub(r"[^\w\s-]", "-", text)
    slug = re.sub(r"\s+", "-", slug)
    slug = re.sub(r"-+", "-", slug)
    slug = slug.strip("-")
    return slug or "post"


def count_words(html: str) -> int:
    """Count words in HTML content."""
    text = re.sub(r"<[^>]+>", "", html)
    return len(text.split())


# ---------------------------------------------------------------------------
# Content collection
# ---------------------------------------------------------------------------

def collect_posts(content_dir: str, md_engine: markdown.Markdown) -> list[Post]:
    """Scan content/posts/ for .md files, parse and return sorted Post list."""
    posts_dir = Path(content_dir) / "posts"
    if not posts_dir.exists():
        print(f"WARNING: {posts_dir} does not exist. Creating it.")
        posts_dir.mkdir(parents=True, exist_ok=True)
        return []

    posts = []
    for md_file in sorted(posts_dir.glob("*.md"), reverse=True):
        with open(md_file, "r", encoding="utf-8") as f:
            raw = f.read()

        meta, body = parse_frontmatter(raw)
        content_html, toc_html = render_markdown(md_engine, body)

        # Determine slug from filename
        stem = md_file.stem
        # Remove leading date prefix like "2024-01-01-" if present
        slug = re.sub(r"^\d{4}-\d{2}-\d{2}-", "", stem)
        slug = sanitize_slug(slug)

        # Parse date
        date_val = meta.get("date", None)
        if date_val is None:
            date_match = re.match(r"^(\d{4}-\d{2}-\d{2})", stem)
            date_val = date_match.group(1) if date_match else "1970-01-01"
        if isinstance(date_val, (datetime, date)):
            if isinstance(date_val, date) and not isinstance(date_val, datetime):
                post_date = datetime(date_val.year, date_val.month, date_val.day)
            else:
                post_date = date_val
        elif isinstance(date_val, str):
            date_str = date_val[:10].strip()
            # Normalize: pad single-digit month/day with leading zeros
            parts = date_str.split("-")
            if len(parts) == 3:
                date_str = f"{parts[0]}-{parts[1].zfill(2)}-{parts[2].zfill(2)}"
            post_date = datetime.strptime(date_str, "%Y-%m-%d")
        else:
            post_date = datetime(1970, 1, 1)

        # Parse updated date
        updated_val = meta.get("updated", None)
        updated = None
        if updated_val:
            if isinstance(updated_val, datetime):
                updated = updated_val
            elif isinstance(updated_val, str):
                updated = datetime.strptime(updated_val[:10], "%Y-%m-%d")

        # Tags and categories (normalize to lowercase)
        tags = meta.get("tags", [])
        if isinstance(tags, str):
            tags = [t.strip() for t in tags.split(",")]
        tags = [str(t).strip() for t in tags if t]

        categories = meta.get("categories", [])
        if isinstance(categories, str):
            categories = [c.strip() for c in categories.split(",")]
        categories = [str(c).strip() for c in categories if c]

        # Cover image
        cover = meta.get("cover", None)

        # Description
        description = meta.get("description", None)

        # Word count and reading time
        word_count = count_words(content_html)
        reading_time = max(1, math.ceil(word_count / 250))

        # Excerpt
        excerpt = description or extract_excerpt(content_html)

        posts.append(Post(
            title=meta.get("title", slug.replace("-", " ").title()),
            slug=slug,
            date=post_date,
            updated=updated,
            content_html=content_html,
            excerpt=excerpt,
            toc_html=toc_html,
            tags=tags,
            categories=categories,
            cover=cover,
            description=description,
            word_count=word_count,
            reading_time=reading_time,
        ))

    return sorted(posts, key=lambda p: p.date, reverse=True)


def collect_pages(content_dir: str, md_engine: markdown.Markdown) -> list[Page]:
    """Scan content/pages/ for .md files."""
    pages_dir = Path(content_dir) / "pages"
    if not pages_dir.exists():
        pages_dir.mkdir(parents=True, exist_ok=True)
        return []

    pages = []
    for md_file in sorted(pages_dir.glob("*.md")):
        with open(md_file, "r", encoding="utf-8") as f:
            raw = f.read()

        meta, body = parse_frontmatter(raw)
        content_html, toc_html = render_markdown(md_engine, body)
        slug = md_file.stem

        pages.append(Page(
            title=meta.get("title", slug.replace("-", " ").title()),
            slug=slug,
            content_html=content_html,
            toc_html=toc_html,
        ))

    return pages


# ---------------------------------------------------------------------------
# Collections (tags, categories, archives)
# ---------------------------------------------------------------------------

def derive_collections(posts: list[Post]) -> dict:
    """Build tag map, category map, archive map, and recent posts."""
    tags_map: dict[str, list[Post]] = {}
    categories_map: dict[str, list[Post]] = {}
    archive_map: dict[int, list[Post]] = {}

    for post in posts:
        for tag in post.tags:
            tag_lower = tag.lower()
            tags_map.setdefault(tag_lower, []).append(post)
        for cat in post.categories:
            cat_lower = cat.lower()
            categories_map.setdefault(cat_lower, []).append(post)
        archive_map.setdefault(post.year, []).append(post)

    return {
        "tags": tags_map,
        "categories": categories_map,
        "archives": dict(sorted(archive_map.items(), reverse=True)),
        "recent_posts": posts[:5],
    }


def build_search_index(posts: list[Post], output_dir: str):
    """Write search_index.json for client-side search."""
    index = []
    for post in posts:
        index.append({
            "title": post.title,
            "url": post.url,
            "excerpt": post.excerpt,
            "tags": post.tags,
            "categories": post.categories,
            "date": post.date.strftime("%Y-%m-%d"),
        })
    out_path = Path(output_dir) / "search_index.json"
    out_path.parent.mkdir(parents=True, exist_ok=True)
    with open(out_path, "w", encoding="utf-8") as f:
        json.dump(index, f, ensure_ascii=False, indent=2)


# ---------------------------------------------------------------------------
# Jinja2 environment
# ---------------------------------------------------------------------------

def init_jinja_env(theme_dir: str) -> Environment:
    """Create Jinja2 environment with custom filters."""
    templates_dir = Path(theme_dir) / "templates"
    env = Environment(
        loader=FileSystemLoader(str(templates_dir)),
        autoescape=True,
    )

    def format_date(dt: datetime, fmt: str = "%Y-%m-%d") -> str:
        if isinstance(dt, str):
            dt = datetime.strptime(dt[:10], "%Y-%m-%d")
        return dt.strftime(fmt)

    env.filters["format_date"] = format_date

    return env


# ---------------------------------------------------------------------------
# Rendering helpers
# ---------------------------------------------------------------------------

def render_page(env: Environment, template: str, ctx: dict, output_path: str):
    """Render a template and write to output path."""
    tmpl = env.get_template(template)
    html = tmpl.render(**ctx)
    path = Path(output_path)
    path.parent.mkdir(parents=True, exist_ok=True)
    with open(path, "w", encoding="utf-8") as f:
        f.write(html)


# ---------------------------------------------------------------------------
# Main build
# ---------------------------------------------------------------------------

def build(config_path: str = "config.yaml"):
    """Run the full build pipeline."""
    start_time = datetime.now()

    config = load_config(config_path)
    site = config["site"]
    theme = config["theme"]
    build_cfg = config["build"]

    output_dir = build_cfg["output_dir"]
    content_dir = build_cfg["content_dir"]
    theme_dir = build_cfg["theme_dir"]

    # Clean output
    if build_cfg.get("clean_output", True):
        out_path = Path(output_dir)
        if out_path.exists():
            shutil.rmtree(out_path)
        out_path.mkdir(parents=True)

    print("🦋 Building blog...")

    # Setup
    md_engine = setup_markdown()
    env = init_jinja_env(theme_dir)

    # Collect content
    print("  📝 Collecting posts...")
    posts = collect_posts(content_dir, md_engine)
    print(f"     Found {len(posts)} posts")

    print("  📄 Collecting pages...")
    pages = collect_pages(content_dir, md_engine)
    print(f"     Found {len(pages)} pages")

    # Derive collections
    collections = derive_collections(posts)
    all_tags = sorted(collections["tags"].keys())
    all_categories = sorted(collections["categories"].keys())

    # Build search index
    print("  🔍 Building search index...")
    build_search_index(posts, output_dir)

    # Base context shared by all templates
    base_ctx = {
        "site": site,
        "theme": theme,
        "all_posts": posts,
        "all_pages": pages,
        "all_tags": collections["tags"],
        "all_categories": collections["categories"],
        "archives": collections["archives"],
        "recent_posts": collections["recent_posts"],
    }

    # --- Render Homepage (with pagination) ---
    print("  🏠 Rendering homepage...")
    per_page = theme.get("posts_per_page", 10)
    total_pages = max(1, math.ceil(len(posts) / per_page))
    for page_num in range(1, total_pages + 1):
        start = (page_num - 1) * per_page
        page_posts = posts[start:start + per_page]
        pagination = {
            "current": page_num,
            "total": total_pages,
            "has_prev": page_num > 1,
            "has_next": page_num < total_pages,
            "prev_url": f"/page/{page_num - 1}/" if page_num > 2 else "/",
            "next_url": f"/page/{page_num + 1}/",
        }
        ctx = {**base_ctx, "posts": page_posts, "pagination": pagination}
        out = f"{output_dir}/index.html" if page_num == 1 else f"{output_dir}/page/{page_num}/index.html"
        render_page(env, "index.html", ctx, out)

    # --- Render single posts ---
    print("  📝 Rendering posts...")
    for i, post in enumerate(posts):
        prev_post = posts[i - 1] if i > 0 else None
        next_post = posts[i + 1] if i < len(posts) - 1 else None
        ctx = {**base_ctx, "post": post, "prev_post": prev_post, "next_post": next_post}
        render_page(env, "post.html", ctx, f"{output_dir}/posts/{post.slug}/index.html")

    # --- Render pages ---
    print("  📄 Rendering pages...")
    for page in pages:
        ctx = {**base_ctx, "page": page}
        render_page(env, "page.html", ctx, f"{output_dir}/pages/{page.slug}/index.html")

    # --- Render archives ---
    print("  📦 Rendering archives...")
    render_page(env, "archive.html", base_ctx, f"{output_dir}/archives/index.html")

    # --- Render tags ---
    print("  🏷️  Rendering tags...")
    # Sort tags by post count descending
    sorted_tags = sorted(all_tags, key=lambda t: len(collections["tags"][t]), reverse=True)
    ctx = {**base_ctx, "sorted_tags": sorted_tags}
    render_page(env, "tags.html", ctx, f"{output_dir}/tags/index.html")
    for tag in all_tags:
        tag_ctx = {**base_ctx, "tag_name": tag, "tag_posts": collections["tags"][tag]}
        render_page(env, "tag.html", tag_ctx, f"{output_dir}/tags/{tag}/index.html")

    # --- Render categories ---
    print("  📁 Rendering categories...")
    sorted_cats = sorted(all_categories, key=lambda c: len(collections["categories"][c]), reverse=True)
    ctx = {**base_ctx, "sorted_categories": sorted_cats}
    render_page(env, "categories.html", ctx, f"{output_dir}/categories/index.html")
    for cat in all_categories:
        cat_ctx = {**base_ctx, "category_name": cat, "category_posts": collections["categories"][cat]}
        render_page(env, "category.html", cat_ctx, f"{output_dir}/categories/{cat}/index.html")

    # --- Render search page ---
    print("  🔍 Rendering search page...")
    render_page(env, "search.html", base_ctx, f"{output_dir}/search/index.html")

    # --- Render 404 ---
    render_page(env, "404.html", base_ctx, f"{output_dir}/404.html")

    # --- Copy static assets ---
    print("  📋 Copying static assets...")
    static_src = Path(theme_dir) / "static"
    static_dst = Path(output_dir) / "static"
    if static_src.exists():
        shutil.copytree(static_src, static_dst, dirs_exist_ok=True)

    images_src = Path(content_dir) / "images"
    images_dst = Path(output_dir) / "content" / "images"
    if images_src.exists():
        shutil.copytree(images_src, images_dst, dirs_exist_ok=True)

    # --- Generate Pygments CSS ---
    print("  🎨 Generating syntax highlighting CSS...")
    from pygments.formatters import HtmlFormatter
    from pygments.styles import get_style_by_name
    hl_theme = theme["post"].get("code_highlight_theme", "default")
    try:
        style = get_style_by_name(hl_theme)
    except Exception:
        style = get_style_by_name("default")
    formatter = HtmlFormatter(style=style)
    pygments_css = formatter.get_style_defs(".codehilite")
    css_dir = Path(output_dir) / "static" / "css"
    css_dir.mkdir(parents=True, exist_ok=True)
    with open(css_dir / "pygments.css", "w", encoding="utf-8") as f:
        f.write(pygments_css)

    elapsed = (datetime.now() - start_time).total_seconds()
    print(f"\n✅ Build complete! {len(posts)} posts, {len(pages)} pages in {elapsed:.2f}s")
    print(f"   Output: {os.path.abspath(output_dir)}/")
    print(f"   Run: python3 -m http.server --directory {output_dir}/ 8080")


if __name__ == "__main__":
    build()
