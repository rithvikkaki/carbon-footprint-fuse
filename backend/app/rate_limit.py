"""In-memory sliding window rate limiter for Carbon Footprint Fuse.

Provides configurable client-IP and token-based rate limiting for authentication
and financial marketplace actions, with zero external dependencies (no Redis required),
and seamless pass-through support during testing.
"""

import time
from collections import defaultdict
from typing import Dict, List, Tuple
from fastapi import Request, HTTPException, status
from backend.app.config import settings

class InMemoryRateLimiter:
    def __init__(self):
        # key -> list of timestamp floats
        self._history: Dict[str, List[float]] = defaultdict(list)

    def is_rate_limited(self, key: str, max_requests: int, window_seconds: int = 60) -> Tuple[bool, int]:
        """Checks if a key has exceeded max_requests in window_seconds.

        Returns (is_limited, retry_after_seconds).
        """
        if not settings.RATE_LIMIT_ENABLED:
            return False, 0

        now = time.time()
        cutoff = now - window_seconds
        
        # Prune old requests
        timestamps = [t for t in self._history[key] if t > cutoff]
        self._history[key] = timestamps

        if len(timestamps) >= max_requests:
            oldest = timestamps[0]
            retry_after = max(1, int(window_seconds - (now - oldest)))
            return True, retry_after

        self._history[key].append(now)
        return False, 0

    def reset(self):
        """Clears rate limit state (useful in test suites)."""
        self._history.clear()

limiter = InMemoryRateLimiter()

def rate_limit(max_requests: int, window_seconds: int = 60, scope: str = "default"):
    """FastAPI dependency for rate limiting."""
    def dependency(request: Request):
        if not settings.RATE_LIMIT_ENABLED:
            return

        client_ip = request.client.host if request.client else "unknown"
        key = f"{scope}:{client_ip}"

        is_limited, retry_after = limiter.is_rate_limited(key, max_requests, window_seconds)
        if is_limited:
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail=f"Too many requests for {scope}. Please retry in {retry_after} seconds.",
                headers={"Retry-After": str(retry_after)},
            )
    return dependency
