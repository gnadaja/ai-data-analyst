from typing import Annotated

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from supabase import Client, ClientOptions, create_client

from app.core.config import get_settings

bearer_scheme = HTTPBearer(auto_error=False)


def get_supabase_client(token: str | None = None) -> Client:
    settings = get_settings()
    options = ClientOptions()
    if token:
        options.headers["Authorization"] = f"Bearer {token}"
    return create_client(settings.supabase_url, settings.supabase_publishable_key, options)


def get_current_user(
    credentials: Annotated[HTTPAuthorizationCredentials | None, Depends(bearer_scheme)],
) -> dict:
    if credentials is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Missing bearer token")

    try:
        user_response = get_supabase_client().auth.get_user(credentials.credentials)
    except Exception as error:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid session",
        ) from error

    if not user_response.user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid session")

    return {
        "id": user_response.user.id,
        "email": user_response.user.email,
        "access_token": credentials.credentials,
    }
