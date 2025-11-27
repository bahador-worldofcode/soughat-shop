#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Soughat-Shop project snapshot collector

Usage:
  python collect_soughat_snapshot.py
  python collect_soughat_snapshot.py --root "C:\projects\soughat-shop" --out snapshot_soughat.txt

ویژگی‌ها:
- پیش‌فرض روت: C:\projects\soughat-shop (قابل تغییر با --root)
- از پیمایش و درج فایل‌ها/پوشه‌های مشخص‌شده جلوگیری می‌کند (excludes)
- تشخیص فایل‌های متنی حتی بدون پسوند
- ماسک‌کردن مقادیر محرمانه (env و الگوهای معمول)
- متادیتا: mtime, size, sha1
- بریدن فایل‌های خیلی بزرگ با برچسب [TRUNCATED]
"""

from __future__ import annotations
import argparse
import datetime as dt
import hashlib
import os
import re
from pathlib import Path
from typing import Iterable, Tuple, Optional, Set

# ==== تنظیمات پیش‌فرض ====
DEFAULT_ROOT = Path(r"C:\projects\soughat-shop")

# پوشه‌ها/فایل‌هایی که باید کاملا حذف شوند (نام پوشه‌ها یا فایل‌های مشخص)
EXCLUDE_DIR_NAMES: Set[str] = {
    ".git", ".next", "node_modules", ".expo", ".vscode",
}

EXCLUDE_FILES_REL: Set[str] = {
    "package-lock.json",
    "collect_soughat_snapshot.py",
    "collect_soughat_snapshot.bat",
    "snapshot_soughat.txt",
    # می‌توانید اسم فایل‌های دیگری که نباید بیایند را اینجا اضافه کنید
}

# آپشنال: اگر خواستید برخی فایل‌ها را حتما بیاورید، اینجا اضافه کنید (نسبی به root)
FORCE_INCLUDE: Set[Path] = {
    # e.g. Path("app/layout.tsx"), Path("package.json")
}

# پسوندهایی که همیشه به عنوان متنی شناخته می‌شوند
ALWAYS_TEXT_EXTS = {
    ".ts", ".tsx", ".js", ".jsx", ".json", ".mjs", ".cjs",
    ".css", ".scss", ".html", ".htm", ".md", ".mdx",
    ".env", ".yml", ".yaml", ".toml", ".ini", ".conf",
    ".lock", ".gitignore", ".gitattributes", ".tsx", ".py",
}

# الگوهای کلیدهای محرمانه
SECRET_LINE_REGEX = re.compile(
    r'''(?ix)
    (?P<key>
        (?:
            (?:api[_-]?key)|(?:secret(?:[_-]?key)?)|
            (?:token|bearer)|(?:password|passwd|pwd)|(?:access[_-]?key)|
            (?:client[_-]?secret)|(?:smtp[_-]?pass)|(?:jwt)
        )
    )
    \s*[:=]\s*
    (?P<val>[^\r\n#]+)
    '''
)

ENV_KV_REGEX = re.compile(r'^\s*([A-Za-z0-9_\.:-]+)\s*=\s*(.*)$')

# ==== توابع کمکی ====

def sha1_bytes(b: bytes) -> str:
    h = hashlib.sha1()
    h.update(b)
    return h.hexdigest()

def is_probably_text(path: Path, peek_bytes: int = 2048) -> bool:
    """بخشی از فایل را می‌خواند تا اگر باینری است رد کند."""
    try:
        with path.open("rb") as f:
            chunk = f.read(peek_bytes)
        if not chunk:
            return True
        if b"\x00" in chunk:
            return False
        # تعداد بایت‌های 'قابل چاپ' را بسنج
        textish = sum(1 for c in chunk if (c >= 32 or c in (9,10,13)))
        return (textish / max(1, len(chunk))) > 0.90
    except Exception:
        return False

def safe_read_text(path: Path) -> Tuple[Optional[str], Optional[str], Optional[bytes]]:
    """خواندن امن با چند انکودینگ، برگرداندن (text, error-note, raw-bytes)."""
    encodings = ("utf-8", "utf-8-sig", "utf-16", "latin-1")
    raw = None
    try:
        with path.open("rb") as f:
            raw = f.read()
    except Exception as e:
        return None, f"read-bytes-error: {e}", None

    last_err = None
    for enc in encodings:
        try:
            txt = raw.decode(enc, errors="strict")
            return txt, None, raw
        except Exception as e:
            last_err = str(e)
    try:
        txt = raw.decode("utf-8", errors="replace")
        return txt, f"decoded-with-replacement (utf-8): {last_err}", raw
    except Exception as e:
        return None, f"decode-error: {e}", raw

def mask_secrets(text: str, path: Path) -> str:
    """مقادیر محرمانه را ماسک می‌کند."""
    name_low = path.name.lower()
    is_envish = name_low.startswith(".env") or path.suffix.lower() == ".env"

    lines = text.splitlines(keepends=False)
    out_lines = []
    for ln in lines:
        if is_envish:
            if ln.strip().startswith("#") or not ln.strip():
                out_lines.append(ln)
            else:
                m = ENV_KV_REGEX.match(ln)
                if m:
                    k, v = m.group(1), m.group(2)
                    if "#" in v:
                        val, comment = v.split("#", 1)
                        out_lines.append(f"{k}=*** #{comment.strip()}")
                    else:
                        out_lines.append(f"{k}=***")
                else:
                    out_lines.append(ln)
        else:
            def repl(m):
                key = m.group("key")
                return f"{key}=***"
            masked = SECRET_LINE_REGEX.sub(repl, ln)
            out_lines.append(masked)
    return "\n".join(out_lines)

def format_header(root: Path, path: Path, size: int, sha1: str) -> str:
    try:
        st = path.stat()
        mtime = dt.datetime.fromtimestamp(st.st_mtime).isoformat()
    except Exception:
        mtime = "N/A"
    try:
        rel = path.relative_to(root)
        rel_str = rel.as_posix()
    except Exception:
        rel_str = str(path)
    return f"===== File: {rel_str} =====\n# Modified: {mtime} | Size: {size} bytes | SHA1: {sha1}\n"

def iter_files(base: Path, exclude_dir_names: Set[str]) -> Iterable[Path]:
    """بازگشتی همه فایل‌ها بجز دایرکتوری‌های ممنوع."""
    for dirpath, dirnames, filenames in os.walk(base, topdown=True):
        # حذف دایرکتوری‌های excluded تا os.walk به آنها وارد نشود
        dirnames[:] = [d for d in dirnames if d not in exclude_dir_names]
        for fn in filenames:
            yield Path(dirpath) / fn

def should_exclude_path(path: Path, root: Path, exclude_files_rel: Set[str]) -> bool:
    """چک می‌کند که آیا فایل باید حذف شود به خاطر نام فایل یا مسیر یا نام والد."""
    if any(part in EXCLUDE_DIR_NAMES for part in path.parts):
        return True
    try:
        rel = path.relative_to(root)
        rel_str = rel.as_posix()
    except Exception:
        rel_str = path.name
    if path.name in exclude_files_rel or rel_str in exclude_files_rel:
        return True
    # همچنین اگر مسیر دقیقاً با یکی از مسیرهای تعریف‌شده مطابقت داشت
    for ef in exclude_files_rel:
        if ef and ef in str(path):
            return True
    return False

def should_collect_file(path: Path) -> bool:
    """تعیین می‌کند آیا فایل جمع‌آوری شود: پسوند متنی یا احتمالاً متنی."""
    ext = path.suffix.lower()
    if ext in ALWAYS_TEXT_EXTS:
        return True
    # فایل‌هایی که بدون پسوند هستند اما متنی به نظر می‌رسند
    return is_probably_text(path)

# ==== تابع اصلی ====

def main():
    parser = argparse.ArgumentParser(description="Collect project files into a single text snapshot (Soughat-Shop).")
    parser.add_argument("--root", default=str(DEFAULT_ROOT), help="Project root path. Default: C:\\projects\\soughat-shop")
    parser.add_argument("--out", default="snapshot_soughat.txt", help="Output .txt file path.")
    parser.add_argument("--max-file-kb", type=int, default=512, help="Max per-file read size in KB (content beyond is truncated).")
    parser.add_argument("--max-out-mb", type=int, default=60, help="Max total output size in MB (hard stop).")
    parser.add_argument("--no-force-include", action="store_true", help="Ignore FORCE_INCLUDE list even if present.")
    args = parser.parse_args()

    root = Path(args.root).resolve()
    out_path = Path(args.out).resolve()
    out_path.parent.mkdir(parents=True, exist_ok=True)

    per_file_limit = args.max_file_kb * 1024
    total_limit = args.max_out_mb * 1024 * 1024

    # جمع کاندیدها
    candidates = []
    if root.exists() and root.is_dir():
        for p in iter_files(root, EXCLUDE_DIR_NAMES):
            candidates.append(p)

    # افزودن force include در صورت نیاز
    if not args.no_force_include:
        for p in FORCE_INCLUDE:
            fp = (root / p).resolve()
            if fp.exists() and fp.is_file():
                candidates.append(fp)

    # مرتب‌سازی و یکتا کردن
    seen_paths = []
    normalized_seen = set()
    for p in sorted(set(candidates), key=lambda x: str(x).lower()):
        try:
            rp = p.resolve()
        except Exception:
            rp = p
        if str(rp) in normalized_seen:
            continue
        normalized_seen.add(str(rp))
        seen_paths.append(rp)

    total_written = 0
    count_written = 0
    count_skipped = 0
    files_considered = 0

    with out_path.open("w", encoding="utf-8", newline="\n") as out:
        now = dt.datetime.now().isoformat()
        out.write(f"### Soughat-Shop Snapshot\n# Generated: {now}\n# Root: {root}\n")
        out.write(f"# Excluded dir names: {', '.join(sorted(EXCLUDE_DIR_NAMES))}\n")
        out.write(f"# Excluded files (by name/rel): {', '.join(sorted(EXCLUDE_FILES_REL))}\n")
        out.write(f"# Per-file limit: {per_file_limit} bytes | Total limit: {total_limit} bytes\n\n")

        for path in seen_paths:
            files_considered += 1

            if not path.exists() or not path.is_file():
                continue

            if should_exclude_path(path, root, EXCLUDE_FILES_REL):
                count_skipped += 1
                continue

            try:
                size = path.stat().st_size
            except Exception:
                size = -1

            try:
                collect = should_collect_file(path)
            except Exception:
                collect = False

            if not collect:
                count_skipped += 1
                continue

            txt, err, raw = safe_read_text(path)
            sha = sha1_bytes(raw) if raw is not None else "N/A"

            header = format_header(root, path, size, sha)
            block_parts = [header]
            if err:
                block_parts.append(f"*** notice: {err}\n")

            content = txt if txt is not None else ""
            try:
                content = mask_secrets(content, path)
            except Exception:
                content = "*** [ERROR MASKING CONTENT] ***\n"

            bytes_out = content.encode("utf-8")
            if len(bytes_out) > per_file_limit:
                trimmed = bytes_out[:per_file_limit]
                while True:
                    try:
                        content = trimmed.decode("utf-8")
                        break
                    except UnicodeDecodeError:
                        trimmed = trimmed[:-1]
                content += "\n\n*** [TRUNCATED: content larger than per-file limit] ***"

            block_parts.append(content)
            block_parts.append("\n\n")

            chunk = "".join(block_parts)
            if total_written + len(chunk.encode("utf-8")) > total_limit:
                out.write("\n*** HARD STOP: total output exceeded max-out-mb ***\n")
                break

            out.write(chunk)
            total_written += len(chunk.encode("utf-8"))
            count_written += 1

        out.write(f"\n### Summary\n# Files considered: {files_considered} | Written: {count_written} | Skipped: {count_skipped}\n")
        out.write(f"# Output size: {total_written} bytes\n")

    print(f"Done. Wrote {count_written} files to: {out_path}")

if __name__ == "__main__":
    main()
