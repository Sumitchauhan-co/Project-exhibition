"""Evaluation module package.

Keep package initialization side-effect free so auth and billing modules can import
without triggering circular dependency chains while the app boots.
"""

__all__ = []
