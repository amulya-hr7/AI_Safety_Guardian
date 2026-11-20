import os
import shutil
from pathlib import Path
from typing import Optional
from contextlib import contextmanager

def cleanup_temp_file(file_path: Optional[Path]) -> None:
    """Safely delete a temporary file if it exists."""
    if file_path and os.path.exists(file_path):
        try:
            os.remove(file_path)
        except Exception as e:
            print(f"[Warning] Failed to clean temp file {file_path}: {e}")

@contextmanager
def TempFileManager(file_path: Path):
    """Context manager ensuring temporary files are pruned even on unhandled exceptions."""
    try:
        yield file_path
    finally:
        cleanup_temp_file(file_path)
