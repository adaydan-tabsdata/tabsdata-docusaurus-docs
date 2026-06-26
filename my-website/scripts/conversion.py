"""
Shared MDX transformation utilities.

Used by migrate.py, migrate_versions.py, and migrate_sphinx.py.
All functions take a content string and return a transformed string.
"""

import re


# ---------------------------------------------------------------------------
# Mintlify MDX → Docusaurus MDX
# ---------------------------------------------------------------------------

def convert_admonitions(content):
    """<Note>, <Warning>, <Tip>, <Info> → Docusaurus ::: fences."""
    for tag, kind in [('Note', 'note'), ('Warning', 'warning'), ('Tip', 'tip'),
                      ('Info', 'info'), ('Caution', 'caution'), ('Danger', 'danger')]:
        content = re.sub(
            rf'<{tag}>(.*?)</{tag}>',
            lambda m, k=kind: f':::{k}\n{m.group(1).strip()}\n:::',
            content, flags=re.DOTALL
        )
    return content


def convert_tabs(content):
    """<Tab title="X"> → <TabItem value="x" label="X">. Returns (content, needs_import)."""
    if not re.search(r'<Tab\b', content):
        return content, False

    def tab_open(m):
        title = m.group(1)
        value = re.sub(r'[^a-z0-9]+', '-', title.lower()).strip('-')
        return f'<TabItem value="{value}" label="{title}">'

    content = re.sub(r'<Tab\s+title="([^"]+)"\s*>', tab_open, content)
    content = re.sub(r'</Tab>', '</TabItem>', content)
    return content, True


def convert_accordions(content):
    """<Accordion title="X"> → <details><summary>X</summary>."""
    content = re.sub(r'<AccordionGroup[^>]*>', '', content)
    content = re.sub(r'</AccordionGroup>', '', content)
    content = re.sub(
        r'<Accordion\s+title="([^"]*)"[^>]*>',
        lambda m: f'<details>\n<summary>{m.group(1)}</summary>\n',
        content
    )
    content = re.sub(r'</Accordion>', '\n</details>', content)
    return content


def fix_image_paths(content):
    """Rewrite /images/ and _images/ references to /img/."""
    content = re.sub(r'\((/?)images/', '(/img/', content)
    content = re.sub(r'src="(/?)images/', 'src="/img/', content)
    content = re.sub(r'\(.*?_images/([^)]+)\)', r'(/img/\1)', content)
    content = re.sub(r'src=".*?_images/([^"]+)"', r'src="/img/\1"', content)
    return content


def inject_imports(content, import_lines):
    """Insert import lines right after the closing --- of frontmatter."""
    if not import_lines:
        return content
    block = '\n'.join(import_lines) + '\n\n'
    m = re.match(r'^---\n.*?\n---\n', content, re.DOTALL)
    if m:
        return content[:m.end()] + block + content[m.end():]
    return block + content


def transform_mdx(content):
    """Full Mintlify → Docusaurus MDX transformation pipeline."""
    content = convert_admonitions(content)
    content, needs_tabs = convert_tabs(content)
    content = convert_accordions(content)
    content = fix_image_paths(content)

    imports = []
    if needs_tabs:
        imports += [
            "import Tabs from '@theme/Tabs';",
            "import TabItem from '@theme/TabItem';",
        ]
    if re.search(r'<CardGroup\b|<Card\b', content):
        imports.append("import { Card, CardGroup } from '@site/src/components/Card';")
    if re.search(r'<Steps\b', content):
        imports.append("import Steps from '@site/src/components/Steps';")
    if re.search(r'<ParamField\b|<ResponseField\b', content):
        imports.append("import { ParamField, ResponseField } from '@site/src/components/ApiField';")

    new_imports = [i for i in imports if i not in content]
    return inject_imports(content, new_imports)
