from __future__ import annotations

from pathlib import Path
import html
import re

import markdown


PUBLIC_ROOT = Path("index.md")
PUBLIC_WIKI = Path("wiki")
AGENT_FILES = [
    Path(".agents/skills/kaggle-research/SKILL.md"),
    Path(".agents/standards/wiki/article-structure.md"),
    Path(".agents/standards/wiki/visualization.md"),
]

HTML_POLICY = """## HTML-first publishing requirement

Kagglectureの公開ページは **HTML-first** とする。公開本文にMarkdown記法を使用しない。

- 公開ページは `index.html` または `wiki/**/*.html` とする。
- JekyllのYAML Front Matter (`---` で囲まれた先頭metadata) は保持してよい。Front Matterより後ろはHTMLのみとする。
- 見出しは `<h1>`〜`<h6>`、段落は `<p>`、リストは `<ul>` / `<ol>`、リンクは `<a>`、codeは `<code>` / `<pre><code>` を使う。
- Markdown見出し (`#`)、Markdown link (`[text](url)`)、強調 (`**text**`)、fenced code、pipe table、Markdown listを公開本文へ追加しない。
- 表・比較・図は既存のHTML component classを優先して再利用する。
- Liquid (`{{ ... }}`, `{% ... %}`) はHTML内で使用してよい。
- 公開URLは従来どおり `.html` / category directory URLを維持する。
- `.agents/**/*.md` はAgent / Skill loader用の内部instructionなのでMarkdownのまま維持する。これは公開記事の例外であり、公開コンテンツではない。

"""

FRONT_MATTER_RE = re.compile(r"\A---\r?\n(?P<yaml>.*?)\r?\n---\r?\n?", re.DOTALL)
LIQUID_BLOCK_RE = re.compile(r"^\s*\{%[-]?\s*.*?\s*[-]?%\}\s*$")
LIQUID_LINK_RE = re.compile(r"\[([^\]\n]+)\]\(\s*(\{\{.*?\}\})\s*\)")
LOCAL_MD_ATTR_RE = re.compile(
    r'(?P<prefix>\b(?:href|src)=["\'])(?P<url>(?!https?://|mailto:|tel:|#)[^"\']+?)\.md(?P<suffix>(?:[?#][^"\']*)?["\'])'
)
LIQUID_MD_PATH_RE = re.compile(r"(?P<prefix>\{\{\s*['\"])(?P<path>/[^'\"]+?)\.md(?P<suffix>['\"]\s*\|\s*relative_url\s*\}\})")


def split_front_matter(text: str, path: Path) -> tuple[str, str]:
    match = FRONT_MATTER_RE.match(text)
    if not match:
        raise RuntimeError(f"Missing YAML front matter: {path}")
    front = text[: match.end()]
    body = text[match.end() :]
    return front.rstrip() + "\n\n", body


def protect_liquid_blocks(body: str) -> tuple[str, dict[str, str]]:
    protected: dict[str, str] = {}
    out: list[str] = []
    for line in body.splitlines():
        if LIQUID_BLOCK_RE.match(line):
            key = f"KAGGLECTURELIQUIDBLOCK{len(protected):05d}"
            protected[key] = line
            out.append(f"<!--{key}-->")
        else:
            out.append(line)
    return "\n".join(out), protected


def restore_liquid_blocks(body: str, protected: dict[str, str]) -> str:
    for key, value in protected.items():
        body = body.replace(f"<!--{key}-->", value)
    return body


def preprocess_liquid_links(body: str) -> str:
    def repl(match: re.Match[str]) -> str:
        label = match.group(1)
        href = match.group(2)
        return f'<a href="{href}">{label}</a>'

    return LIQUID_LINK_RE.sub(repl, body)


def rewrite_local_md_links(body: str) -> str:
    body = LOCAL_MD_ATTR_RE.sub(
        lambda m: f"{m.group('prefix')}{m.group('url')}.html{m.group('suffix')}", body
    )
    body = LIQUID_MD_PATH_RE.sub(
        lambda m: f"{m.group('prefix')}{m.group('path')}.html{m.group('suffix')}", body
    )
    return body


def convert_markdown_body(body: str) -> str:
    body = preprocess_liquid_links(body)
    body, liquid_blocks = protect_liquid_blocks(body)
    rendered = markdown.markdown(
        body,
        extensions=["extra", "sane_lists"],
        output_format="html5",
    )
    rendered = restore_liquid_blocks(rendered, liquid_blocks)
    rendered = rewrite_local_md_links(rendered)
    return rendered.strip() + "\n"


def migrate_public_file(path: Path) -> Path:
    source = path.read_text(encoding="utf-8")
    front, body = split_front_matter(source, path)
    rendered = convert_markdown_body(body)
    target = path.with_suffix(".html")
    if target.exists() and target != path:
        raise RuntimeError(f"Target already exists: {target}")
    target.write_text(front + rendered, encoding="utf-8")
    path.unlink()
    return target


def update_agent_policy(path: Path) -> None:
    text = path.read_text(encoding="utf-8")
    if "## HTML-first publishing requirement" not in text:
        heading = re.search(r"^# .+$", text, re.MULTILINE)
        if heading:
            insert_at = heading.end()
            text = text[:insert_at] + "\n\n" + HTML_POLICY + text[insert_at:].lstrip("\n")
        else:
            text = HTML_POLICY + text

    # Public repository examples only. Internal .agents Markdown paths are intentionally untouched.
    text = re.sub(
        r"(?<!standards/)(?<!skills/)(?<!\.agents/)(\bwiki/[A-Za-z0-9_./<>-]+)\.md\b",
        r"\1.html",
        text,
    )
    text = text.replace("`index.md` — ホーム", "`index.html` — ホーム")
    text = text.replace("`index.md` — ホームから", "`index.html` — ホームから")
    path.write_text(text, encoding="utf-8")


def verify() -> None:
    remaining = []
    if PUBLIC_ROOT.exists():
        remaining.append(str(PUBLIC_ROOT))
    if PUBLIC_WIKI.exists():
        remaining.extend(str(p) for p in PUBLIC_WIKI.rglob("*.md"))
    if remaining:
        raise RuntimeError("Public Markdown files remain:\n" + "\n".join(sorted(remaining)))

    public_html = [Path("index.html"), *sorted(PUBLIC_WIKI.rglob("*.html"))]
    if not Path("index.html").exists():
        raise RuntimeError("index.html was not created")

    for path in public_html:
        text = path.read_text(encoding="utf-8")
        if not text.startswith("---\n"):
            raise RuntimeError(f"Front matter missing after migration: {path}")
        _, body = split_front_matter(text, path)
        # Broken local links to removed public Markdown files are not allowed.
        if re.search(r'(?:href|src)=["\'](?!https?://)[^"\']+\.md(?:[?#][^"\']*)?["\']', body):
            raise RuntimeError(f"Local .md link remains: {path}")

    print(f"Migrated public pages: {len(public_html)} HTML files")


def main() -> None:
    public_files = []
    if PUBLIC_ROOT.exists():
        public_files.append(PUBLIC_ROOT)
    if PUBLIC_WIKI.exists():
        public_files.extend(sorted(PUBLIC_WIKI.rglob("*.md")))

    if not public_files:
        print("No public Markdown files found; nothing to migrate.")
    else:
        for path in public_files:
            target = migrate_public_file(path)
            print(f"{path} -> {target}")

    for path in AGENT_FILES:
        if path.exists():
            update_agent_policy(path)

    verify()


if __name__ == "__main__":
    main()
