#!/usr/bin/env python3
"""
Migrate Mintlify versions to Docusaurus versioned_docs/.

Usage — single version:
    python3 migrate_versions.py \\
        --src  /path/to/mintlify-docs/versions/1.9.0 \\
        --dest /path/to/my-website/versioned_docs/version-1.9.0

Usage — all versions at once:
    python3 migrate_versions.py --force

Optional:
    --section guide|api|tutorials|all   (default: all)
"""

import os
import re
import sys
import shutil
import json
import argparse

_DEFAULT_VERSIONS_ROOT = "/Users/danieladayev/mintlify-BE-docs/mintlify-docs/versions"
_DEFAULT_SITE          = "/Users/danieladayev/docasaurus/my-website"

_ALL_VERSIONS = [
    "1.9.0", "1.8.0", "1.7.1", "1.7.0",
    "1.5.1", "1.5.0", "1.4.0", "1.3.0", "1.2.0",
    "1.1.0", "1.0.0",
    "0.9.6", "0.9.5", "0.9.3", "0.9.2", "0.9.1", "0.9.0",
]

def parse_args():
    p = argparse.ArgumentParser(
        description="Migrate Mintlify MDX versions → Docusaurus versioned_docs/",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog=__doc__,
    )
    mode = p.add_mutually_exclusive_group(required=True)
    mode.add_argument("--src",   metavar="SRC_DIR",
                      help="Source dir for a single version (e.g. …/versions/1.9.0)")
    mode.add_argument("--force", action="store_true",
                      help="Migrate all versions using default paths")
    p.add_argument("--dest",    metavar="DEST_DIR",
                   help="Output dir for a single version (e.g. …/versioned_docs/version-1.9.0). Required with --src.")
    p.add_argument("--section", default="all",
                   choices=["all", "guide", "api", "tutorials"],
                   help="Which section to migrate (default: all)")
    return p.parse_args()

_args = parse_args()

if _args.src and not _args.dest:
    print("ERROR: --dest is required when using --src", file=sys.stderr)
    sys.exit(1)

LABEL_MAP = {
    "working-with-publishers": "Publishers",
    "working-with-subscribers": "Subscribers",
    "working-with-transformers": "Transformers",
    "working-with-tables": "Tables",
    "working-with-triggers": "Triggers",
    "working-with-functions": "Functions",
    "working-with-connector-plugins": "Plugins",
    "working-with-kafka": "Kafka",
    "secrets-management": "Secrets Management",
    "catalogs": "Catalogs",
    "appendix": "Appendix",
    "archive": "Archive",
    "tutorials-1": "Additional Tutorials",
    "use-cases": "Use Cases",
    "category": "By Category",
    "module": "By Module",
}

def dir_label(name):
    return LABEL_MAP.get(name, " ".join(w.capitalize() for w in name.split("-")))


# ---------------------------------------------------------------------------
# Content transformation (same as migrate.py)
# ---------------------------------------------------------------------------

def convert_admonitions(content):
    for tag, kind in [("Note","note"),("Warning","warning"),("Tip","tip"),
                      ("Info","info"),("Caution","caution"),("Danger","danger")]:
        content = re.sub(
            rf"<{tag}>(.*?)</{tag}>",
            lambda m, k=kind: f":::{k}\n{m.group(1).strip()}\n:::",
            content, flags=re.DOTALL
        )
    return content

def convert_tabs(content):
    has_tabs = bool(re.search(r"<Tab\b", content))
    if not has_tabs:
        return content, False
    def tab_open(m):
        title = m.group(1)
        value = re.sub(r"[^a-z0-9]+", "-", title.lower()).strip("-")
        return f'<TabItem value="{value}" label="{title}">'
    content = re.sub(r'<Tab\s+title="([^"]+)"\s*>', tab_open, content)
    content = re.sub(r"</Tab>", "</TabItem>", content)
    return content, True

def convert_accordions(content):
    content = re.sub(r"<AccordionGroup[^>]*>", "", content)
    content = re.sub(r"</AccordionGroup>", "", content)
    content = re.sub(
        r'<Accordion\s+title="([^"]*)"[^>]*>',
        lambda m: f"<details>\n<summary>{m.group(1)}</summary>\n",
        content
    )
    content = re.sub(r"</Accordion>", "\n</details>", content)
    return content

def fix_image_paths(content):
    content = re.sub(r"\((/?)images/", "(/img/", content)
    content = re.sub(r'src="(/?)images/', 'src="/img/', content)
    return content

def inject_imports(content, import_lines):
    if not import_lines:
        return content
    block = "\n".join(import_lines) + "\n\n"
    m = re.match(r"^---\n.*?\n---\n", content, re.DOTALL)
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
    if re.search(r"<CardGroup\b|<Card\b", content):
        imports.append("import { Card, CardGroup } from '@site/src/components/Card';")
    if re.search(r"<Steps\b", content):
        imports.append("import Steps from '@site/src/components/Steps';")
    if re.search(r"<ParamField\b|<ResponseField\b", content):
        imports.append("import { ParamField, ResponseField } from '@site/src/components/ApiField';")
    new_imports = [i for i in imports if i not in content]
    return inject_imports(content, new_imports)


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def write_category(path, label, position=None, collapsed=True):
    os.makedirs(path, exist_ok=True)
    data = {"label": label, "collapsed": collapsed}
    if position is not None:
        data["position"] = position
    with open(os.path.join(path, "_category_.json"), "w") as f:
        json.dump(data, f, indent=2)
        f.write("\n")

def copy_mdx(src, dst):
    os.makedirs(os.path.dirname(dst), exist_ok=True)
    with open(src, encoding="utf-8") as f:
        content = f.read()
    content = transform(content)
    with open(dst, "w", encoding="utf-8") as f:
        f.write(content)

def copy_dir_mdx(src_dir, dst_dir):
    """Copy all .mdx/.md files from src_dir (non-recursive)."""
    if not os.path.isdir(src_dir):
        return
    for name in sorted(os.listdir(src_dir)):
        if name.endswith(".mdx") or name.endswith(".md"):
            copy_mdx(os.path.join(src_dir, name), os.path.join(dst_dir, name))

def migrate_api_nav(nav_items, src_api_root, dst_dir, version, pos_start=1):
    """Recursively migrate API files using _nav.json structure."""
    pos = pos_start
    prefix = f"versions/{version}/api/"

    for item in nav_items:
        if isinstance(item, str):
            # Leaf page — strip prefix to get relative path
            rel = item.replace(prefix, "")
            # Could be "decorators" (→ decorators.mdx) or "decorators/tabsdata-publisher" (→ subdir file)
            parts = rel.split("/")
            if len(parts) == 1:
                src_file = os.path.join(src_api_root, rel + ".mdx")
                if os.path.exists(src_file):
                    copy_mdx(src_file, os.path.join(dst_dir, rel + ".mdx"))
            else:
                # File inside a subdirectory
                src_file = os.path.join(src_api_root, *parts[:-1], parts[-1] + ".mdx")
                dst_file = os.path.join(dst_dir, *parts[:-1], parts[-1] + ".mdx")
                if os.path.exists(src_file):
                    copy_mdx(src_file, dst_file)
            pos += 1

        elif isinstance(item, dict) and "group" in item:
            label = item["group"]
            slug = re.sub(r"[^a-z0-9]+", "-", label.lower()).strip("-")
            dst_sub = os.path.join(dst_dir, slug)
            write_category(dst_sub, label, pos)
            migrate_api_nav(item.get("pages", []), src_api_root, dst_sub, version)
            pos += 1


def read_order(path):
    """Read _order.json and return list of item names."""
    order_file = os.path.join(path, "_order.json")
    if os.path.exists(order_file):
        with open(order_file) as f:
            return json.load(f)
    return []


# ---------------------------------------------------------------------------
# Guide migration (version-aware)
# ---------------------------------------------------------------------------

def migrate_guide(src_guide, dst_guide):
    order = read_order(src_guide)

    # Build position map from _order.json
    pos_map = {name: i + 1 for i, name in enumerate(order)}

    # Items that have subdirectories
    subdirs = {
        name for name in os.listdir(src_guide)
        if os.path.isdir(os.path.join(src_guide, name))
        and not name.startswith("_")
    }

    # Root-level .mdx files (not _*)
    root_mdx = {
        os.path.splitext(name)[0]: name
        for name in os.listdir(src_guide)
        if name.endswith(".mdx") and not name.startswith("_")
    }

    # Group: items that have both a root .mdx and a subdir → subdir gets root as index
    for name in subdirs:
        src_subdir = os.path.join(src_guide, name)
        dst_subdir = os.path.join(dst_guide, name)
        label = dir_label(name)
        pos = pos_map.get(name)
        write_category(dst_subdir, label, pos)

        # Copy root .mdx as index if exists
        root_file = root_mdx.get(name)
        if root_file:
            copy_mdx(
                os.path.join(src_guide, root_file),
                os.path.join(dst_subdir, "index.mdx")
            )

        # Copy subdir contents
        copy_dir_mdx(src_subdir, dst_subdir)

    # Root-level files not covered by a subdir
    for stem, filename in root_mdx.items():
        if stem not in subdirs:
            copy_mdx(
                os.path.join(src_guide, filename),
                os.path.join(dst_guide, filename)
            )


# ---------------------------------------------------------------------------
# Per-version migration
# ---------------------------------------------------------------------------

def migrate_version_paths(src_base, dst_base, version, section="all"):

    print(f"\n{'='*40}")
    print(f"  Migrating v{version}  (section: {section})")
    print(f"{'='*40}")

    # Guide
    if section in ("all", "guide"):
        src_guide = os.path.join(src_base, "guide")
        dst_guide = os.path.join(dst_base, "guide")
        if os.path.isdir(src_guide):
            migrate_guide(src_guide, dst_guide)
            print(f"  guide: {len(list(os.walk(dst_guide)))} dirs")

    # Tutorials
    if section in ("all", "tutorials"):
        src_t = os.path.join(src_base, "tutorials")
        dst_t = os.path.join(dst_base, "tutorials")
        if os.path.isdir(src_t):
            write_category(dst_t, "Tutorials", 2, collapsed=False)
            copy_dir_mdx(src_t, dst_t)

        # Tutorials-1 (only in 0.9.0)
        src_t1 = os.path.join(src_base, "tutorials-1")
        dst_t1 = os.path.join(dst_base, "tutorials-1")
        if os.path.isdir(src_t1):
            write_category(dst_t1, "Additional Tutorials", 3)
            copy_dir_mdx(src_t1, dst_t1)

        # Use-cases (1.7.0+)
        src_uc = os.path.join(src_base, "use-cases")
        dst_uc = os.path.join(dst_base, "use-cases")
        if os.path.isdir(src_uc):
            write_category(dst_uc, "Use Cases", 4)
            copy_dir_mdx(src_uc, dst_uc)
            for sub in os.listdir(src_uc):
                sub_path = os.path.join(src_uc, sub)
                if os.path.isdir(sub_path):
                    write_category(os.path.join(dst_uc, sub), dir_label(sub))
                    copy_dir_mdx(sub_path, os.path.join(dst_uc, sub))

    # API
    if section in ("all", "api"):
        src_api = os.path.join(src_base, "api")
        dst_api = os.path.join(dst_base, "api")
        if os.path.isdir(src_api):
            write_category(dst_api, "API Reference", 5)
            nav_file = os.path.join(src_api, "_nav.json")
            if os.path.exists(nav_file):
                # Older versions: use _nav.json to reconstruct grouping
                with open(nav_file) as f:
                    nav = json.load(f)
                # Always copy alphabetical-index if present
                idx = os.path.join(src_api, "alphabetical-index.mdx")
                if os.path.exists(idx):
                    copy_mdx(idx, os.path.join(dst_api, "alphabetical-index.mdx"))
                migrate_api_nav(nav, src_api, dst_api, version)
            else:
                # Newer versions: flat root files + category/module subdirs
                copy_dir_mdx(src_api, dst_api)
                for sub in ("category", "module"):
                    src_sub = os.path.join(src_api, sub)
                    dst_sub = os.path.join(dst_api, sub)
                    if os.path.isdir(src_sub):
                        write_category(dst_sub, dir_label(sub),
                                        1 if sub == "category" else 2)
                        copy_dir_mdx(src_sub, dst_sub)


def create_versioned_sidebar_at(version, dst_base, versioned_sidebars):
    os.makedirs(versioned_sidebars, exist_ok=True)
    sidebar = {}

    if os.path.isdir(os.path.join(dst_base, "guide")):
        sidebar["guideSidebar"] = [{"type": "autogenerated", "dirName": "guide"}]
    if os.path.isdir(os.path.join(dst_base, "tutorials")):
        sidebar["tutorialsSidebar"] = [{"type": "autogenerated", "dirName": "tutorials"}]
    if os.path.isdir(os.path.join(dst_base, "api")):
        sidebar["apiSidebar"] = [{"type": "autogenerated", "dirName": "api"}]

    path = os.path.join(versioned_sidebars, f"version-{version}-sidebars.json")
    with open(path, "w") as f:
        json.dump(sidebar, f, indent=2)
        f.write("\n")


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------

def migrate_one(src_dir, dest_dir, section="all"):
    """Migrate a single version directory."""
    if not os.path.isdir(src_dir):
        print(f"ERROR: source not found: {src_dir}", file=sys.stderr)
        sys.exit(1)

    # Derive version string from dest path (version-X.Y.Z → X.Y.Z)
    version = os.path.basename(dest_dir).replace("version-", "")
    versioned_sidebars = os.path.join(
        os.path.dirname(os.path.dirname(dest_dir)), "versioned_sidebars"
    )

    print(f"Source  : {src_dir}")
    print(f"Dest    : {dest_dir}")
    print(f"Version : {version}")
    print(f"Section : {section}")

    migrate_version_paths(src_dir, dest_dir, version, section)
    create_versioned_sidebar_at(version, dest_dir, versioned_sidebars)
    print(f"\nDone!")


def migrate_all(section="all"):
    """Migrate all known versions using default paths."""
    versions_root    = _DEFAULT_VERSIONS_ROOT
    site             = _DEFAULT_SITE
    versioned_docs   = os.path.join(site, "versioned_docs")
    versioned_sbs    = os.path.join(site, "versioned_sidebars")

    if not os.path.isdir(versions_root):
        print(f"ERROR: versions root not found: {versions_root}", file=sys.stderr)
        sys.exit(1)

    print(f"Versions root : {versions_root}")
    print(f"Site          : {site}")
    print(f"Section       : {section}")

    os.makedirs(versioned_docs, exist_ok=True)
    os.makedirs(versioned_sbs, exist_ok=True)

    migrated = []
    for version in _ALL_VERSIONS:
        src = os.path.join(versions_root, version)
        dst = os.path.join(versioned_docs, f"version-{version}")
        if not os.path.isdir(src):
            print(f"SKIP {version} (not found)")
            continue
        migrate_version_paths(src, dst, version, section)
        create_versioned_sidebar_at(version, dst, versioned_sbs)
        migrated.append(version)

    if section == "all":
        versions_json = os.path.join(site, "versions.json")
        with open(versions_json, "w") as f:
            json.dump(migrated, f, indent=2)
            f.write("\n")
        print(f"\nWrote versions.json with {len(migrated)} versions")

    print(f"\nDone! Migrated {len(migrated)} version(s).")


if __name__ == "__main__":
    if _args.force:
        migrate_all(section=_args.section)
    else:
        migrate_one(_args.src, _args.dest, section=_args.section)
