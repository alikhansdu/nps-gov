from __future__ import annotations

from datetime import date

import httpx
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jose import JWTError
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_session
from app.core.security import create_access_token, decode_token, hash_password, verify_password
from app.models.models import User, UserRole
from app.schemas.auth import GoogleAuthRequest, GoogleTokenRequest, LoginRequest, RegisterRequest, TokenResponse, UserLoginRequest, UserRegisterRequest, UserResponse

GOOGLE_CLIENT_ID = "226463256317-bdnr355fpvbdphurm23t9nkm45uq0rks.apps.googleusercontent.com"

router = APIRouter(prefix="/auth", tags=["auth"])
security = HTTPBearer(auto_error=False)


async def get_current_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(security),
    session: AsyncSession = Depends(get_session),
) -> User:
    if credentials is None or not credentials.credentials:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Not authenticated")

    token = credentials.credentials
    try:
        payload = decode_token(token)
        sub = payload.get("sub")
        if not sub:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")
        user_id = int(sub)
    except (JWTError, ValueError):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")

    res = await session.execute(select(User).where(User.id == user_id))
    user = res.scalar_one_or_none()
    if user is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found")
    return user


@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def register(payload: RegisterRequest, session: AsyncSession = Depends(get_session)) -> User:
    existing = await session.execute(select(User).where(User.iin == payload.iin))
    if existing.scalar_one_or_none() is not None:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="IIN already registered")

    if payload.email is not None:
        existing_email = await session.execute(select(User).where(User.email == str(payload.email)))
        if existing_email.scalar_one_or_none() is not None:
            raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Email already registered")

    user = User(
        iin=payload.iin,
        name=payload.name,
        email=str(payload.email) if payload.email is not None else None,
        hashed_password=hash_password(payload.password),
        role=UserRole(payload.role),
    )
    session.add(user)
    await session.commit()
    await session.refresh(user)
    return user


@router.post("/user-register", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
async def user_register(payload: UserRegisterRequest, session: AsyncSession = Depends(get_session)) -> TokenResponse:
    existing = await session.execute(select(User).where(User.phone == payload.phone))
    if existing.scalar_one_or_none() is not None:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Номер телефона уже зарегистрирован")

    age: int | None = None
    if payload.birth_date is not None:
        today = date.today()
        age = today.year - payload.birth_date.year - (
            (today.month, today.day) < (payload.birth_date.month, payload.birth_date.day)
        )

    user = User(
        name=payload.name,
        phone=payload.phone,
        hashed_password=hash_password(payload.password),
        role=UserRole.citizen,
        age=age,
        gender=payload.gender,
    )
    session.add(user)
    await session.commit()
    await session.refresh(user)

    token = create_access_token(subject=str(user.id))
    return TokenResponse(access_token=token)


@router.post("/login", response_model=TokenResponse)
async def login(payload: LoginRequest, session: AsyncSession = Depends(get_session)) -> TokenResponse:
    res = await session.execute(select(User).where(User.iin == payload.iin))
    user = res.scalar_one_or_none()
    if user is None or not verify_password(payload.password, user.hashed_password):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")

    token = create_access_token(subject=str(user.id))
    return TokenResponse(access_token=token)


@router.post("/user-login", response_model=TokenResponse)
async def user_login(payload: UserLoginRequest, session: AsyncSession = Depends(get_session)) -> TokenResponse:
    res = await session.execute(select(User).where(User.phone == payload.phone))
    user = res.scalar_one_or_none()
    if user is None or not verify_password(payload.password, user.hashed_password):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Неверный номер телефона или пароль")

    token = create_access_token(subject=str(user.id))
    return TokenResponse(access_token=token)


@router.get("/me", response_model=UserResponse)
async def me(current_user: User = Depends(get_current_user)) -> User:
    return current_user


@router.post("/google", response_model=TokenResponse)
async def google_auth(payload: GoogleAuthRequest, session: AsyncSession = Depends(get_session)) -> TokenResponse:
    # Verify Google ID token via Google's tokeninfo endpoint
    async with httpx.AsyncClient() as client:
        resp = await client.get(
            "https://oauth2.googleapis.com/tokeninfo",
            params={"id_token": payload.credential},
        )

    if resp.status_code != 200:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Недействительный Google токен")

    info = resp.json()

    # Verify audience matches our client ID
    if info.get("aud") != GOOGLE_CLIENT_ID:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Недействительный Google токен")

    google_email: str | None = info.get("email")
    google_name: str = info.get("name") or info.get("email", "Google User")

    if not google_email:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email не получен от Google")

    # Find or create user by email
    res = await session.execute(select(User).where(User.email == google_email))
    user = res.scalar_one_or_none()

    if user is None:
        user = User(
            name=google_name,
            email=google_email,
            hashed_password=hash_password(google_email + GOOGLE_CLIENT_ID),  # unusable password
            role=UserRole.citizen,
        )
        session.add(user)
        await session.commit()
        await session.refresh(user)

    token = create_access_token(subject=str(user.id))
    return TokenResponse(access_token=token)


@router.post("/google-token", response_model=TokenResponse)
async def google_token_auth(payload: GoogleTokenRequest, session: AsyncSession = Depends(get_session)) -> TokenResponse:
    # Verify the access token by fetching user info from Google
    async with httpx.AsyncClient() as client:
        resp = await client.get(
            "https://www.googleapis.com/oauth2/v3/userinfo",
            headers={"Authorization": f"Bearer {payload.access_token}"},
        )

    if resp.status_code != 200:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Недействительный Google токен")

    info = resp.json()
    google_email: str | None = info.get("email")

    if not google_email or google_email != payload.email:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Недействительный Google токен")

    google_name: str = info.get("name") or payload.name or google_email

    # Find or create user by email
    res = await session.execute(select(User).where(User.email == google_email))
    user = res.scalar_one_or_none()

    if user is None:
        user = User(
            name=google_name,
            email=google_email,
            hashed_password=hash_password(google_email + GOOGLE_CLIENT_ID),
            role=UserRole.citizen,
        )
        session.add(user)
        await session.commit()
        await session.refresh(user)

    token = create_access_token(subject=str(user.id))
    return TokenResponse(access_token=token)