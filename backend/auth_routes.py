import os
from datetime import timedelta

import httpx
from fastapi import APIRouter, HTTPException, Request, Response
from pydantic import BaseModel, EmailStr

from core import (
    db,
    new_id,
    now_utc,
    hash_password,
    verify_password,
    make_token,
    get_identity,
)

router = APIRouter(prefix='/auth')

EMERGENT_SESSION_URL = 'https://demobackend.emergentagent.com/auth/v1/env/oauth/session-data'


class SignupIn(BaseModel):
    name: str
    email: EmailStr
    password: str


class LoginIn(BaseModel):
    email: EmailStr
    password: str


class SessionIn(BaseModel):
    session_id: str


def public_user(u: dict) -> dict:
    return {
        'user_id': u['user_id'],
        'email': u.get('email'),
        'name': u.get('name'),
        'picture': u.get('picture'),
    }


async def _migrate_guest(request: Request, user_id: str):
    guest = request.headers.get('X-Guest-Id')
    if guest:
        await db.conversations.update_many({'user_id': guest}, {'$set': {'user_id': user_id}})
        await db.messages.update_many({'user_id': guest}, {'$set': {'user_id': user_id}})


@router.post('/signup')
async def signup(body: SignupIn, request: Request):
    email = body.email.lower()
    if len(body.password) < 6:
        raise HTTPException(400, 'Password must be at least 6 characters')
    if await db.users.find_one({'email': email}):
        raise HTTPException(400, 'An account with this email already exists')
    user = {
        'user_id': new_id('user'),
        'email': email,
        'name': body.name.strip() or email.split('@')[0],
        'picture': None,
        'password': hash_password(body.password),
        'created_at': now_utc(),
    }
    await db.users.insert_one(dict(user))
    await _migrate_guest(request, user['user_id'])
    return {'token': make_token(user['user_id']), 'user': public_user(user)}


@router.post('/login')
async def login(body: LoginIn, request: Request):
    user = await db.users.find_one({'email': body.email.lower()}, {'_id': 0})
    if not user or not user.get('password') or not verify_password(body.password, user['password']):
        raise HTTPException(401, 'Invalid email or password')
    await _migrate_guest(request, user['user_id'])
    return {'token': make_token(user['user_id']), 'user': public_user(user)}


@router.post('/session')
async def emergent_session(body: SessionIn, request: Request, response: Response):
    async with httpx.AsyncClient(timeout=20) as c:
        r = await c.get(EMERGENT_SESSION_URL, headers={'X-Session-ID': body.session_id})
    if r.status_code != 200:
        raise HTTPException(401, 'Invalid session')
    data = r.json()
    email = (data.get('email') or '').lower()
    user = await db.users.find_one({'email': email}, {'_id': 0})
    if not user:
        user = {
            'user_id': new_id('user'),
            'email': email,
            'name': data.get('name') or email.split('@')[0],
            'picture': data.get('picture'),
            'created_at': now_utc(),
        }
        await db.users.insert_one(dict(user))
    else:
        await db.users.update_one(
            {'user_id': user['user_id']},
            {'$set': {'name': data.get('name') or user.get('name'), 'picture': data.get('picture')}},
        )

    session_token = data.get('session_token')
    await db.user_sessions.insert_one(
        {
            'user_id': user['user_id'],
            'session_token': session_token,
            'expires_at': now_utc() + timedelta(days=7),
            'created_at': now_utc(),
        }
    )
    response.set_cookie(
        key='session_token',
        value=session_token,
        httponly=True,
        secure=True,
        samesite='none',
        path='/',
        max_age=7 * 24 * 60 * 60,
    )
    await _migrate_guest(request, user['user_id'])
    return {'user': public_user(user), 'token': session_token}


@router.get('/me')
async def me(request: Request):
    ident = await get_identity(request)
    if ident['is_guest']:
        raise HTTPException(401, 'Login required')
    return public_user(ident['user'])


@router.post('/logout')
async def logout(request: Request, response: Response):
    token = request.cookies.get('session_token')
    auth = request.headers.get('Authorization') or ''
    bearer = auth[7:].strip() if auth.lower().startswith('bearer ') else None
    for t in [token, bearer]:
        if t:
            await db.user_sessions.delete_many({'session_token': t})
    response.delete_cookie('session_token', path='/')
    return {'ok': True}
