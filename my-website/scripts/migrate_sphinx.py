#!/usr/bin/env python3
"""
Convert Sphinx HTML output → Docusaurus MDX.

Usage:
    python3 migrate_sphinx.py
        [--src  /path/to/sphinx/html]   default: public_site_docs/latest
        [--dest /path/to/docs/dir]      default: my-website/docs
        [--section guide|api|tutorials|use-cases|all]   default: all
        [--images /path/to/_images]     default: inferred from --src parent

Examples:
    # Migrate latest from public_site_docs
    python3 migrate_sphinx.py

    # Migrate API only from local build
    python3 migrate_sphinx.py \\
        --src  /Users/danieladayev/docasaurus/tabsdata-dx/target/html \\
        --dest /Users/danieladayev/docasaurus/my-website/docs \\
        --section api

    # Migrate a specific versioned snapshot into versioned_docs
    python3 migrate_sphinx.py \\
        --src  /Users/danieladayev/mintlify-BE-docs/public_site_docs/1.9.0 \\
        --dest /Users/danieladayev/docasaurus/my-website/versioned_docs/version-1.9.0
"""

import os
import re
import sys
import shutil
import json
import argparse

try:
    from bs4 import BeautifulSoup, NavigableString, Tag
except ImportError:
    print("ERROR: pip install beautifulsoup4")
    sys.exit(1)

from conversion import fix_image_paths

# ---------------------------------------------------------------------------
# CLI
# ---------------------------------------------------------------------------

_DEFAULT_SRC  = "/Users/danieladayev/mintlify-BE-docs/public_site_docs/latest"
_DEFAULT_DEST = "/Users/danieladayev/docasaurus/my-website/docs"
_DEFAULT_IMGS = "/Users/danieladayev/docasaurus/my-website/static/img"

def parse_args():
    p = argparse.ArgumentParser(description="Convert Sphinx HTML → Docusaurus MDX")
    p.add_argument("--src",     default=_DEFAULT_SRC,  help="Sphinx HTML root directory")
    p.add_argument("--dest",    default=_DEFAULT_DEST, help="Docusaurus docs output directory")
    p.add_argument("--images",  default=None,          help="Override _images source directory")
    p.add_argument("--section", default="all",
                   choices=["all", "guide", "api", "tutorials", "use-cases"],
                   help="Which section to migrate (default: all)")
    return p.parse_args()

args = parse_args()

SRC_BASE   = args.src
DST_BASE   = args.dest
IMAGES_DST = _DEFAULT_IMGS

# Infer _images location: sibling of SRC_BASE named "_images"
if args.images:
    IMAGES_SRC = args.images
else:
    IMAGES_SRC = os.path.join(os.path.dirname(SRC_BASE), "_images")

# Map Sphinx guide directory names → Docusaurus slug
GUIDE_SLUG = {
    "01_overview":                        "overview",
    "02_getting_started":                 "getting-started",
    "03_key_concepts":                    "key-concepts",
    "04_01_working_with_publishers":      "publishers",
    "04_02_working_with_transformers":    "transformers",
    "04_03_working_with_subscribers":     "subscribers",
    "05_working_with_triggers":           "triggers",
    "06_working_with_tables":             "tables",
    "07_working_with_connector_plugins":  "plugins",
    "08_testing":                         "testing",
    "09_contact_support":                 "contact-support",
    "10_troubleshooting":                 "troubleshooting",
    "11_cli_commands":                    "cli-commands",
    "ai_agent":                           "ai-agent",
    "catalogs":                           "catalogs",
    "data_quality":                       "data-quality",
    "permissioning":                      "permissioning",
    "release_notes":                      "release-notes",
    "secrets_management":                 "secrets-management",
    "security":                           "security",
    "server_configuration":               "server-configuration",
    "user_interface":                     "user-interface",
    "working_with_kafka":                 "kafka",
}


# ---------------------------------------------------------------------------
# HTML → MDX conversion
# ---------------------------------------------------------------------------

def inline_text(el):
    """Extract inline MDX from an element, handling bold/italic/code/links."""
    if isinstance(el, NavigableString):
        return str(el)

    tag = el.name
    children = ''.join(inline_text(c) for c in el.children)

    if tag in ('strong', 'b'):
        return f'**{children.strip()}**' if children.strip() else ''
    if tag in ('em', 'i'):
        return f'*{children.strip()}*' if children.strip() else ''
    if tag == 'code':
        text = el.get_text()
        return f'`{text}`' if text.strip() else ''
    if tag == 'a':
        href = el.get('href', '')
        href = fix_sphinx_link(href)
        text = el.get_text().strip()
        if not text:
            return ''
        if href.startswith('#') or not href:
            return text
        return f'[{text}]({href})'
    if tag == 'span':
        return children
    if tag == 'br':
        return '\n'

    return children


def fix_sphinx_link(href):
    """Convert Sphinx relative HTML links to absolute or Docusaurus-style paths."""
    if not href or href.startswith('http') or href.startswith('mailto'):
        return href
    # Strip relative path prefix and .html extension for internal links
    href = re.sub(r'\.\./+', '', href)
    href = re.sub(r'main\.html', '', href)
    href = re.sub(r'\.html', '', href)
    return href


def list_to_mdx(el, ordered=False, indent=0):
    lines = []
    for i, li in enumerate(el.find_all('li', recursive=False), 1):
        prefix = f'{i}. ' if ordered else '- '
        pad = '  ' * indent
        # Get direct text and nested lists separately
        nested = li.find(['ul', 'ol'])
        if nested:
            nested.extract()
        text = inline_text(li).strip()
        if text:
            lines.append(f'{pad}{prefix}{text}')
        if nested:
            lines.append(list_to_mdx(nested, ordered=(nested.name == 'ol'), indent=indent + 1))
    return '\n'.join(lines) + '\n\n'


def table_to_mdx(el):
    rows = []
    for tr in el.find_all('tr'):
        cells = [td.get_text().strip() for td in tr.find_all(['td', 'th'])]
        rows.append(cells)
    if not rows:
        return ''
    # Header
    header = rows[0]
    sep = ['---'] * len(header)
    lines = ['| ' + ' | '.join(header) + ' |',
             '| ' + ' | '.join(sep) + ' |']
    for row in rows[1:]:
        lines.append('| ' + ' | '.join(row) + ' |')
    return '\n'.join(lines) + '\n\n'


def code_block_to_mdx(el):
    """Extract language and clean code from a Sphinx highlight div."""
    classes = el.get('class', [])
    lang = 'text'
    for c in classes:
        m = re.match(r'highlight-(\w+)', c)
        if m and m.group(1) != 'default':
            lang = m.group(1)
            break
    pre = el.find('pre')
    code = pre.get_text() if pre else el.get_text()
    code = code.rstrip('\n')
    return f'```{lang}\n{code}\n```\n\n'


def admonition_to_mdx(el):
    """<div class="admonition note"> → :::note."""
    classes = el.get('class', [])
    kind = 'note'
    for c in classes:
        if c in ('note', 'warning', 'tip', 'important', 'caution', 'danger', 'error'):
            kind = c
            break
    if kind == 'important':
        kind = 'info'

    # Remove the title element
    title_el = el.find('p', class_='admonition-title')
    if title_el:
        title_el.decompose()

    body = element_to_mdx(el).strip()
    return f':::{kind}\n{body}\n:::\n\n'


def sig_to_text(dt):
    """Extract a clean function/class signature string from a <dt class="sig">."""
    # Remove headerlink anchors
    for a in dt.find_all('a', class_='headerlink'):
        a.decompose()
    # Get class/function name
    name_el = dt.find('span', class_='sig-name')
    name = name_el.get_text().strip() if name_el else ''
    # Get params from sig-param elements
    params = []
    for param in dt.find_all('em', class_='sig-param'):
        params.append(param.get_text().strip().rstrip(','))
    # property/class keyword
    prop_el = dt.find('span', class_='property')
    keyword = prop_el.get_text().strip() if prop_el else ''
    if params:
        return f'{name}({", ".join(params)})'
    return name


def field_list_to_mdx(dl):
    """Convert <dl class="field-list"> to ParamField components or plain text."""
    parts = []
    dts = dl.find_all('dt', recursive=False)
    dds = dl.find_all('dd', recursive=False)
    for dt, dd in zip(dts, dds):
        label = dt.get_text().replace(':', '').strip()
        if label.lower() in ('variables', 'parameters', 'args'):
            # Convert each variable to a ParamField
            for li in dd.find_all('li'):
                name_el = li.find('strong')
                type_el = li.find('em')
                name = name_el.get_text().strip() if name_el else ''
                type_str = type_el.get_text().strip() if type_el else ''
                # Get description (text after the em dash –)
                text = li.get_text()
                desc = ''
                if '–' in text:
                    desc = text.split('–', 1)[1].strip()
                elif '-' in text and name in text:
                    idx = text.index(name) + len(name)
                    desc = text[idx:].lstrip(' :-').strip()
                type_attr = f' type="{type_str}"' if type_str else ''
                parts.append(f'<ParamField path="{name}"{type_attr}>\n  {desc}\n</ParamField>\n\n')
        elif label.lower() in ('returns', 'return type'):
            value = dd.get_text().strip()
            parts.append(f'**{label}:** {value}\n\n')
        elif label.lower() in ('categories',):
            pass  # skip internal metadata
        else:
            value = dd.get_text().strip()
            if value:
                parts.append(f'**{label}:** {value}\n\n')
    return ''.join(parts)


def api_entry_to_mdx(dl):
    """Convert a <dl class="py class/function/method/property"> to MDX."""
    dt = dl.find('dt', recursive=False)
    dd = dl.find('dd', recursive=False)
    if not dt:
        return ''

    sig = sig_to_text(dt)
    classes = dl.get('class', [])

    # For properties/attributes: simple inline entry
    if 'property' in classes or 'attribute' in classes:
        content = element_to_mdx(dd).strip() if dd else ''
        return f'<details>\n<summary>`{sig}`</summary>\n\n{content}\n\n</details>\n\n'

    # For classes/functions/methods: full block with params
    if dd:
        # Separate field-lists from prose
        body_parts = []
        param_parts = []
        needs_param_import = False

        for child in dd.children:
            if not isinstance(child, Tag):
                continue
            if child.name == 'dl' and 'field-list' in child.get('class', []):
                fp = field_list_to_mdx(child)
                if '<ParamField' in fp:
                    needs_param_import = True
                param_parts.append(fp)
            elif child.name == 'dl' and 'py' in child.get('class', []):
                # Nested method/property — recurse
                body_parts.append(api_entry_to_mdx(child))
            else:
                body_parts.append(element_to_mdx(child))

        body = ''.join(body_parts).strip()
        params = ''.join(param_parts)

        inner = ''
        if body:
            inner += body + '\n\n'
        if params:
            inner += params

        result = f'<details>\n<summary>\n\n**`{sig}`**\n\n</summary>\n\n{inner}</details>\n\n'
        if needs_param_import:
            result = "import { ParamField, ResponseField } from '@site/src/components/ApiField';\n\n" + result
        return result

    return f'**`{sig}`**\n\n'


def element_to_mdx(el, depth=0):
    """Recursively convert a BeautifulSoup element to MDX."""
    if isinstance(el, NavigableString):
        s = str(el)
        return s if s.strip() else (' ' if s else '')

    tag = el.name
    if tag is None:
        return ''

    # --- Headings ---
    if tag in ('h1', 'h2', 'h3', 'h4', 'h5', 'h6'):
        for a in el.find_all('a', class_='headerlink'):
            a.decompose()
        level = int(tag[1])
        text = el.get_text().strip()
        return f'\n{"#" * level} {text}\n\n'

    # --- Sections (just recurse) ---
    if tag == 'section':
        return ''.join(element_to_mdx(c) for c in el.children)

    # --- Paragraphs ---
    if tag == 'p':
        text = inline_text(el).strip()
        return f'{text}\n\n' if text else ''

    # --- Lists ---
    if tag == 'ul':
        return list_to_mdx(el, ordered=False)
    if tag == 'ol':
        return list_to_mdx(el, ordered=True)

    # --- Code blocks ---
    if tag == 'div':
        classes = el.get('class', [])
        if any('highlight' in c for c in classes):
            return code_block_to_mdx(el)
        if 'admonition' in classes:
            return admonition_to_mdx(el)
        if 'line-block' in classes:
            return ''  # Sphinx spacer — skip

    # --- Images ---
    if tag == 'img':
        src = el.get('src', '')
        alt = el.get('alt', '')
        filename = os.path.basename(src)
        return f'![{alt}](/img/{filename})\n\n'

    # --- Image link wrapper ---
    if tag == 'a' and 'image-reference' in el.get('class', []):
        img = el.find('img')
        return element_to_mdx(img) if img else ''

    # --- Tables ---
    if tag == 'table':
        return table_to_mdx(el)

    # --- API autodoc entries ---
    if tag == 'dl':
        classes = el.get('class', [])
        if 'py' in classes:
            return api_entry_to_mdx(el)
        if 'field-list' in classes:
            return field_list_to_mdx(el)

    # --- Inline elements inside block context ---
    if tag in ('strong', 'b', 'em', 'i', 'code', 'a', 'span'):
        return inline_text(el)

    # --- Containers: recurse ---
    if tag in ('div', 'article', 'main', 'aside', 'blockquote',
               'dd', 'dt', 'figure', 'figcaption'):
        return ''.join(element_to_mdx(c) for c in el.children)

    # --- Skip navigation / sidebar / script / style ---
    if tag in ('nav', 'header', 'footer', 'script', 'style', 'button',
               'noscript', 'meta', 'link', 'svg'):
        return ''

    # Fallback
    return ''.join(element_to_mdx(c) for c in el.children)


def html_file_to_mdx(html_path, title=None):
    """Parse a Sphinx HTML file and return MDX string."""
    with open(html_path, encoding='utf-8') as f:
        soup = BeautifulSoup(f.read(), 'html.parser')

    article = soup.find('article', class_='bd-article')
    if not article:
        return None

    # Infer title from <h1> if not provided
    if not title:
        h1 = article.find('h1')
        if h1:
            title = h1.get_text().strip()
            for a in (h1.find_all('a', class_='headerlink') or []):
                a.decompose()

    # Build frontmatter
    fm = f'---\ntitle: "{title}"\n---\n\n' if title else ''

    body = element_to_mdx(article)

    # Clean up excessive blank lines
    body = re.sub(r'\n{3,}', '\n\n', body)

    # Deduplicate ParamField imports that might appear multiple times
    import_line = "import { ParamField, ResponseField } from '@site/src/components/ApiField';"
    if body.count(import_line) > 1:
        body = body.replace(import_line + '\n\n', '', body.count(import_line) - 1)

    return fm + body.strip() + '\n'


# ---------------------------------------------------------------------------
# Directory structure + file copy helpers
# ---------------------------------------------------------------------------

def write_category(path, label, position=None, collapsed=True):
    os.makedirs(path, exist_ok=True)
    data = {'label': label, 'collapsed': collapsed}
    if position is not None:
        data['position'] = position
    with open(os.path.join(path, '_category_.json'), 'w') as f:
        json.dump(data, f, indent=2)
        f.write('\n')


def convert_file(src_html, dst_mdx, title=None):
    os.makedirs(os.path.dirname(dst_mdx), exist_ok=True)
    content = html_file_to_mdx(src_html, title)
    if content is None:
        print(f'  SKIP (no article): {src_html}')
        return
    with open(dst_mdx, 'w', encoding='utf-8') as f:
        f.write(content)
    print(f'  ✓ {os.path.relpath(dst_mdx, DST_BASE)}')


def slug_from_dir(dirname):
    """Convert a Sphinx dir name like 01_overview to overview."""
    if dirname in GUIDE_SLUG:
        return GUIDE_SLUG[dirname]
    # Strip leading number prefix (01_, 04_01_, etc.)
    slug = re.sub(r'^[\d_]+', '', dirname)
    return slug.replace('_', '-')


# ---------------------------------------------------------------------------
# Migration sections
# ---------------------------------------------------------------------------

def migrate_guide():
    print('\n=== Guide ===')
    src_guide = os.path.join(SRC_BASE, 'guide')
    dst_guide = os.path.join(DST_BASE, 'guide')

    if not os.path.isdir(src_guide):
        print('  SKIP: guide dir not found')
        return

    for entry in sorted(os.listdir(src_guide)):
        entry_path = os.path.join(src_guide, entry)
        if not os.path.isdir(entry_path):
            continue

        html_file = os.path.join(entry_path, 'main.html')
        if not os.path.exists(html_file):
            # Some dirs have a differently named file — find first html
            htmls = [f for f in os.listdir(entry_path) if f.endswith('.html')]
            if not htmls:
                continue
            html_file = os.path.join(entry_path, htmls[0])

        slug = slug_from_dir(entry)
        dst_mdx = os.path.join(dst_guide, f'{slug}.mdx')
        convert_file(html_file, dst_mdx)


def migrate_tutorials():
    print('\n=== Tutorials ===')
    src_t = os.path.join(SRC_BASE, 'tutorials')
    dst_t = os.path.join(DST_BASE, 'tutorials')
    if not os.path.isdir(src_t):
        return
    write_category(dst_t, 'Tutorials', 2, collapsed=False)
    for name in sorted(os.listdir(src_t)):
        if name.endswith('.html'):
            slug = name.replace('.html', '')
            convert_file(os.path.join(src_t, name), os.path.join(dst_t, f'{slug}.mdx'))


def migrate_use_cases():
    print('\n=== Use Cases ===')
    src_uc = os.path.join(SRC_BASE, 'use_cases')
    dst_uc = os.path.join(DST_BASE, 'use-cases')
    if not os.path.isdir(src_uc):
        return
    write_category(dst_uc, 'Use Cases', 3)
    for name in sorted(os.listdir(src_uc)):
        if name.endswith('.html'):
            slug = name.replace('.html', '').replace('_', '-')
            convert_file(os.path.join(src_uc, name), os.path.join(dst_uc, f'{slug}.mdx'))


def migrate_api():
    print('\n=== API Reference ===')
    src_api = os.path.join(SRC_BASE, 'ref', 'api')
    dst_api = os.path.join(DST_BASE, 'api')
    if not os.path.isdir(src_api):
        print('  SKIP: ref/api dir not found')
        return

    write_category(dst_api, 'API Reference', 4)

    # By Category (bycat-*.html)
    dst_cat = os.path.join(dst_api, 'category')
    write_category(dst_cat, 'By Category', 1)
    for name in sorted(os.listdir(src_api)):
        if name.startswith('bycat-') and name.endswith('.html'):
            slug = name.replace('bycat-', '').replace('.html', '')
            convert_file(os.path.join(src_api, name), os.path.join(dst_cat, f'{slug}.mdx'))

    # By Module (bymod-*.html)
    dst_mod = os.path.join(dst_api, 'module')
    write_category(dst_mod, 'By Module', 2)
    for name in sorted(os.listdir(src_api)):
        if name.startswith('bymod-') and name.endswith('.html'):
            slug = name.replace('bymod-', '').replace('.html', '')
            convert_file(os.path.join(src_api, name), os.path.join(dst_mod, f'{slug}.mdx'))


def migrate_images():
    print('\n=== Images ===')
    if not os.path.isdir(IMAGES_SRC):
        print('  SKIP: _images dir not found')
        return
    os.makedirs(IMAGES_DST, exist_ok=True)
    count = 0
    for name in os.listdir(IMAGES_SRC):
        src = os.path.join(IMAGES_SRC, name)
        dst = os.path.join(IMAGES_DST, name)
        if os.path.isfile(src) and not os.path.exists(dst):
            shutil.copy2(src, dst)
            count += 1
    print(f'  copied {count} new images')


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------

if __name__ == '__main__':
    if not os.path.isdir(SRC_BASE):
        print(f'ERROR: source not found: {SRC_BASE}')
        sys.exit(1)

    print(f'Source : {SRC_BASE}')
    print(f'Dest   : {DST_BASE}')
    print(f'Section: {args.section}')

    section = args.section
    if section in ('all', 'guide'):
        migrate_guide()
    if section in ('all', 'tutorials'):
        migrate_tutorials()
    if section in ('all', 'use-cases'):
        migrate_use_cases()
    if section in ('all', 'api'):
        migrate_api()

    migrate_images()
    print('\nDone!')
