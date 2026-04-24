"""Re-exports auth dependencies (implementation lives in ``src.api.deps``)."""

from src.api.deps import get_current_user, require_roles, role_str

__all__ = ["get_current_user", "require_roles", "role_str"]
