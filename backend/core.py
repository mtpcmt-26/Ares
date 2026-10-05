import os
import uuid
import hashlib
import hmac
from datetime import datetime, timezone, timedelta
from pathlib import Path

import jwt
from dotenv import load_dotenv
from fastapi import HTTPException, Request
from pymongo import AsyncMongoClient

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

mongo_url = os.environ.get('MONGO_URL')
if not mongo_url:
    raise RuntimeError('MONGO_URL is required for Ares; refusing to fall back to localhost in production.')

# Atlas SRV URIs enable TLS by default. Use bounded timeouts for serverless requests.
client = AsyncMongoClient(
    mongo_url,
    serverSelectionTimeoutMS=10000,
    connectTimeoutMS=10000,
    socketTimeoutMS=20000,
    retryWrites=True,
    # Atlas/Vercel can encounter OCSP endpoint handshake failures; this keeps
    # certificate validation enabled while disabling the separate OCSP endpoint check.
    tlsDisableOCSPEndpointCheck=True,
)
db = client[os.environ.get('DB_NAME', 'ares_db')]

JWT_SECRET = os.environ.get('JWT_SECRET', 'ares-dev-secret-change-me')
JWT_ALGO = 'HS256'
GUEST_LIMIT = 10


def now_utc() -> datetime:
    return datetime.now(timezone.utc)


def new_id(prefix: str) -> str:
    return f"{prefix}_{uuid.uuid4().hex[:12]}"


def hash_password(password: str, salt: str | None = None) -> str:
    salt = salt or uuid.uuid4().hex
    dk = hashlib.pbkdf2_hmac('sha256', password.encode(), salt.encode(), 120000)
    return f"{salt}${dk.hex()}"


def verify_password(password: str, stored: str) -> bool:
    try:
        salt, _ = stored.split('$', 1)
    except ValueError:
        return False
    return hmac.compare_digest(hash_password(password, salt), stored)


def make_token(user_id: str) -> str:
    payload = {'sub': user_id, 'exp': now_utc() + timedelta(days=30)}
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGO)


def decode_token(token: str) -> str | None:
    try:
        return jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGO]).get('sub')
    except Exception:
        return None


async def _user_from_session_token(token: str):
    session = await db.user_sessions.find_one({'session_token': token}, {'_id': 0})
    if not session:
        return None
    expires_at = session.get('expires_at')
    if isinstance(expires_at, str):
        expires_at = datetime.fromisoformat(expires_at)
    if expires_at and expires_at.tzinfo is None:
        expires_at = expires_at.replace(tzinfo=timezone.utc)
    if expires_at and expires_at < now_utc():
        return None
    return await db.users.find_one({'user_id': session['user_id']}, {'_id': 0, 'password': 0})


async def get_identity(request: Request) -> dict:
    """Resolve caller: real user (JWT or Emergent session) or guest device id."""
    auth = request.headers.get('Authorization') or ''
    bearer = auth[7:].strip() if auth.lower().startswith('bearer ') else None

    cookie_token = request.cookies.get('session_token')
    for token in [cookie_token, bearer]:
        if not token:
            continue
        user = await _user_from_session_token(token)
        if user:
            return {'user_id': user['user_id'], 'is_guest': False, 'user': user}

    if bearer:
        sub = decode_token(bearer)
        if sub:
            user = await db.users.find_one({'user_id': sub}, {'_id': 0, 'password': 0})
            if user:
                return {'user_id': user['user_id'], 'is_guest': False, 'user': user}

    guest = request.headers.get('X-Guest-Id')
    if guest:
        return {'user_id': guest, 'is_guest': True, 'user': None}

    raise HTTPException(status_code=401, detail='Login required')


async def require_user(request: Request) -> dict:
    ident = await get_identity(request)
    if ident['is_guest']:
        raise HTTPException(status_code=401, detail='Login required')
    return ident
