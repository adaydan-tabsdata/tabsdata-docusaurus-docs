#!/usr/bin/env python3
"""
Migrate a single Mintlify version to Docusaurus docs/.

Usage:
    python3 migrate.py
        [--src  /path/to/mintlify/versions/1.9.1]   default: mintlify-BE-docs/…/1.9.1
        [--dest /path/to/docs/dir]                   default: my-website/docs
        [--images /path/to/images/dir]               default: inferred from --src parent
        [--section guide|api|tutorials|all]          default: all

Examples:
    # Default (1.9.1 from mintlify-BE-docs)
    python3 migrate.py

    # Custom source and dest
    python3 migrate.py \\
        --src  /Users/danieladayev/docasaurus/mintlify-docs/versions/1.9.1 \\
        --dest /Users/danieladayev/docasaurus/my-website/docs
"""

import os
import re
import sys
import shutil
import json
import argparse

_DEFAULT_SRC      = "/Users/danieladayev/mintlify-BE-docs/mintlify-docs/versions/1.9.1"
_DEFAULT_DST      = "/Users/danieladayev/docasaurus/my-website/docs"
_DEFAULT_IMGS_DST = "/Users/danieladayev/docasaurus/my-website/static/img"

def parse_args():
    p = argparse.ArgumentParser(description="Migrate Mintlify MDX → Docusaurus")
    p.add_argument("--src",     default=_DEFAULT_SRC,      help="Mintlify version directory")
    p.add_argument("--dest",    default=_DEFAULT_DST,       help="Docusaurus docs output directory")
    p.add_argument("--images",  default=None,               help="Override images source directory")
    p.add_argument("--section", default="all",
                   choices=["all", "guide", "api", "tutorials"],
                   help="Which section to migrate (default: all)")
    return p.parse_args()

_args    = parse_args()
SRC      = _args.src
DST      = _args.dest
IMGS_SRC = _args.images or os.path.join(os.path.dirname(os.path.dirname(SRC)), "images")
IMGS_DST = _DEFAULT_IMGS_DST


# ---------------------------------------------------------------------------
# Content transformation
# ---------------------------------------------------------------------------

def convert_admonitions(content):
    for tag, kind in [('Note','note'),('Warning','warning'),('Tip','tip'),
                      ('Info','info'),('Caution','caution'),('Danger','danger')]:
        content = re.sub(
            rf'<{tag}>(.*?)</{tag}>',
            lambda m, k=kind: f':::{k}\n{m.group(1).strip()}\n:::',
            content, flags=re.DOTALL
        )
    return content


def convert_tabs(content):
    has_tabs = bool(re.search(r'<Tab\b', content))
    if not has_tabs:
        return content, False

    def tab_open(m):
        title = m.group(1)
        value = re.sub(r'[^a-z0-9]+', '-', title.lower()).strip('-')
        return f'<TabItem value="{value}" label="{title}">'

    content = re.sub(r'<Tab\s+title="([^"]+)"\s*>', tab_open, content)
    content = re.sub(r'</Tab>', '</TabItem>', content)
    return content, True


def convert_accordions(content):
    # Strip AccordionGroup wrapper (keep children)
    content = re.sub(r'<AccordionGroup[^>]*>', '', content)
    content = re.sub(r'</AccordionGroup>', '', content)
    # Convert <Accordion title="X"> to <details><summary>X</summary>
    content = re.sub(
        r'<Accordion\s+title="([^"]*)"[^>]*>',
        lambda m: f'<details>\n<summary>{m.group(1)}</summary>\n',
        content
    )
    content = re.sub(r'</Accordion>', '\n</details>', content)
    return content


def fix_image_paths(content):
    # Markdown image syntax: ![alt](/images/foo.png)
    content = re.sub(r'\((/?)images/', '(/img/', content)
    # JSX src attribute
    content = re.sub(r'src="(/?)images/', 'src="/img/', content)
    return content


def inject_imports(content, import_lines):
    """Insert import lines right after the closing --- of frontmatter."""
    if not import_lines:
        return content
    block = '\n'.join(import_lines) + '\n\n'
    # Find closing frontmatter fence
    m = re.match(r'^---\n.*?\n---\n', content, re.DOTALL)
    if m:
        end = m.end()
        return content[:end] + block + content[end:]
    return block + content


def transform(content):
    content = convert_admonitions(content)
    content, needs_tabs = convert_tabs(content)
    content = convert_accordions(content)
    content = fix_image_paths(content)

    imports = []
    if needs_tabs:
        imports += ["import Tabs from '@theme/Tabs';",
                    "import TabItem from '@theme/TabItem';"]
    if re.search(r'<CardGroup\b|<Card\b', content):
        imports.append("import { Card, CardGroup } from '@site/src/components/Card';")
    if re.search(r'<Steps\b', content):
        imports.append("import Steps from '@site/src/components/Steps';")
    if re.search(r'<ParamField\b|<ResponseField\b', content):
        imports.append("import { ParamField, ResponseField } from '@site/src/components/ApiField';")

    # Only inject if the full import line isn't already present
    new_imports = [i for i in imports if i not in content]
    content = inject_imports(content, new_imports)
    return content


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def write_category(path, label, position=None, collapsed=True):
    os.makedirs(path, exist_ok=True)
    data = {"label": label, "collapsed": collapsed}
    if position is not None:
        data["position"] = position
    with open(os.path.join(path, '_category_.json'), 'w') as f:
        json.dump(data, f, indent=2)
        f.write('\n')


def copy_mdx(src_path, dst_path):
    os.makedirs(os.path.dirname(dst_path), exist_ok=True)
    with open(src_path, encoding='utf-8') as f:
        content = f.read()
    content = transform(content)
    with open(dst_path, 'w', encoding='utf-8') as f:
        f.write(content)
    print(f"  ✓ {os.path.relpath(dst_path, DST)}")


def copy_dir_mdx(src_dir, dst_dir):
    """Copy all .mdx files from src_dir to dst_dir (non-recursive)."""
    for name in sorted(os.listdir(src_dir)):
        if name.endswith('.mdx') or name.endswith('.md'):
            copy_mdx(os.path.join(src_dir, name), os.path.join(dst_dir, name))


# ---------------------------------------------------------------------------
# Migration
# ---------------------------------------------------------------------------

def migrate_guide():
    src_guide = os.path.join(SRC, 'guide')
    dst_guide = os.path.join(DST, 'guide')

    print("\n=== Guide (root) ===")
    # Root guide files that live in top-level categories
    root_map = [
        # (filename, dest_subdir, category_label, position)
        ('overview.mdx',                   'intro',        'Introduction',  1),
        ('getting-started.mdx',            'intro',        None,            None),
        ('server-configuration.mdx',       'intro',        None,            None),
        ('key-concepts.mdx',               'intro',        None,            None),
        ('working-with-functions.mdx',     'functions',    'Functions',     2),
        ('working-with-transformers.mdx',  'transformers', 'Transformers',  4),
        ('working-with-kafka.mdx',         'kafka',        'Kafka',         6),
        ('working-with-triggers.mdx',      'triggers',     'Triggers',      7),
        ('working-with-connector-plugins.mdx', 'plugins',  'Plugins',       10),
        ('data-quality.mdx',               'data-quality', 'Data Quality',  11),
        ('user-interface.mdx',             'platform',     'Platform',      13),
        ('ai-agent.mdx',                   'platform',     None,            None),
        ('permissioning.mdx',              'platform',     None,            None),
        ('security.mdx',                   'platform',     None,            None),
        ('testing.mdx',                    'operations',   'Operations',    14),
        ('troubleshooting.mdx',            'operations',   None,            None),
        ('cli-commands.mdx',               'operations',   None,            None),
        ('release-notes.mdx',              'operations',   None,            None),
        ('contact-support.mdx',            'operations',   None,            None),
    ]

    created_cats = set()
    pos = {}  # track per-subdir positions

    for filename, subdir, cat_label, cat_pos in root_map:
        src_path = os.path.join(src_guide, filename)
        dst_subdir = os.path.join(dst_guide, subdir)
        if not os.path.exists(src_path):
            print(f"  SKIP (not found): {filename}")
            continue
        if subdir not in created_cats:
            write_category(dst_subdir, cat_label or subdir.replace('-', ' ').title(), cat_pos)
            created_cats.add(subdir)
            pos[subdir] = 1
        dst_path = os.path.join(dst_subdir, filename)
        copy_mdx(src_path, dst_path)

    # Publishers (pos 3)
    print("\n=== Publishers ===")
    src_pub = os.path.join(src_guide, 'working-with-publishers')
    dst_pub = os.path.join(dst_guide, 'publishers')
    write_category(dst_pub, 'Publishers', 3)
    copy_mdx(os.path.join(src_guide, 'working-with-publishers.mdx'), os.path.join(dst_pub, 'index.mdx'))
    if os.path.isdir(src_pub):
        copy_dir_mdx(src_pub, dst_pub)

    # Subscribers (pos 5)
    print("\n=== Subscribers ===")
    src_sub = os.path.join(src_guide, 'working-with-subscribers')
    dst_sub = os.path.join(dst_guide, 'subscribers')
    write_category(dst_sub, 'Subscribers', 5)
    copy_mdx(os.path.join(src_guide, 'working-with-subscribers.mdx'), os.path.join(dst_sub, 'index.mdx'))
    if os.path.isdir(src_sub):
        copy_dir_mdx(src_sub, dst_sub)

    # Tables (pos 8)
    print("\n=== Tables ===")
    src_tables = os.path.join(src_guide, 'working-with-tables')
    dst_tables = os.path.join(dst_guide, 'tables')
    write_category(dst_tables, 'Tables', 8)
    if os.path.isdir(src_tables):
        copy_dir_mdx(src_tables, dst_tables)

    # Catalogs (pos 12)
    print("\n=== Catalogs ===")
    src_cat = os.path.join(src_guide, 'catalogs')
    dst_cat = os.path.join(dst_guide, 'catalogs')
    write_category(dst_cat, 'Catalogs', 12)
    copy_mdx(os.path.join(src_guide, 'catalogs.mdx'), os.path.join(dst_cat, 'index.mdx'))
    if os.path.isdir(src_cat):
        copy_dir_mdx(src_cat, dst_cat)

    # Secrets management (nested under platform)
    print("\n=== Secrets (platform) ===")
    src_sec = os.path.join(src_guide, 'secrets-management')
    dst_sec = os.path.join(dst_guide, 'platform', 'secrets-management')
    write_category(dst_sec, 'Secrets Management', 3)
    copy_mdx(os.path.join(src_guide, 'secrets-management.mdx'), os.path.join(dst_sec, 'index.mdx'))
    if os.path.isdir(src_sec):
        copy_dir_mdx(src_sec, dst_sec)


def migrate_tutorials():
    print("\n=== Tutorials ===")
    src_t = os.path.join(SRC, 'tutorials')
    dst_t = os.path.join(DST, 'tutorials')
    write_category(dst_t, 'Tutorials', 2, collapsed=False)
    if os.path.isdir(src_t):
        copy_dir_mdx(src_t, dst_t)


def migrate_api():
    print("\n=== API Reference ===")
    src_api = os.path.join(SRC, 'api')
    dst_api = os.path.join(DST, 'api')
    write_category(dst_api, 'API Reference', 3, collapsed=True)

    # alphabetical index
    idx = os.path.join(src_api, 'alphabetical-index.mdx')
    if os.path.exists(idx):
        copy_mdx(idx, os.path.join(dst_api, 'alphabetical-index.mdx'))

    # By Category
    src_cat = os.path.join(src_api, 'category')
    dst_cat = os.path.join(dst_api, 'category')
    if os.path.isdir(src_cat):
        write_category(dst_cat, 'By Category', 1)
        copy_dir_mdx(src_cat, dst_cat)

    # By Module
    src_mod = os.path.join(src_api, 'module')
    dst_mod = os.path.join(dst_api, 'module')
    if os.path.isdir(src_mod):
        write_category(dst_mod, 'By Module', 2)
        copy_dir_mdx(src_mod, dst_mod)


def migrate_images():
    print("\n=== Images ===")
    os.makedirs(IMGS_DST, exist_ok=True)
    # Root images dir
    if os.path.isdir(IMGS_SRC):
        for name in os.listdir(IMGS_SRC):
            src = os.path.join(IMGS_SRC, name)
            dst = os.path.join(IMGS_DST, name)
            if os.path.isfile(src):
                shutil.copy2(src, dst)
                print(f"  ✓ {name}")
    # Version-specific images
    ver_imgs = os.path.join(SRC, 'images')
    if os.path.isdir(ver_imgs):
        for name in os.listdir(ver_imgs):
            src = os.path.join(ver_imgs, name)
            dst = os.path.join(IMGS_DST, name)
            if os.path.isfile(src):
                shutil.copy2(src, dst)
                print(f"  ✓ {name} (version)")


def clean_existing():
    """Remove placeholder tutorial content from fresh Docusaurus install."""
    for d in ['tutorial-basics', 'tutorial-extras']:
        p = os.path.join(DST, d)
        if os.path.isdir(p):
            shutil.rmtree(p)
            print(f"  removed placeholder: {d}/")
    intro = os.path.join(DST, 'intro.mdx')
    if os.path.exists(intro):
        os.remove(intro)
        print("  removed placeholder: intro.mdx")


if __name__ == '__main__':
    if not os.path.isdir(SRC):
        print(f"ERROR: source not found: {SRC}")
        sys.exit(1)

    print(f"Source : {SRC}")
    print(f"Dest   : {DST}")
    print(f"Section: {_args.section}")

    if _args.section == 'all':
        print("Cleaning placeholder content...")
        clean_existing()

    section = _args.section
    if section in ('all', 'guide'):
        migrate_guide()
    if section in ('all', 'tutorials'):
        migrate_tutorials()
    if section in ('all', 'api'):
        migrate_api()

    migrate_images()
    print("\nDone!")
