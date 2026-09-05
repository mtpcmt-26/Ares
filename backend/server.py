from fastapi import FastAPI, APIRouter
from starlette.middleware.cors import CORSMiddleware
import logging

from core import client
import auth_routes
import chat_routes

app = FastAPI(title='Ares API')

api_router = APIRouter(prefix='/api')


@api_router.get('/')
async def root():
    return {'message': 'Ares API online'}


api_router.include_router(auth_routes.router)
api_router.include_router(chat_routes.router)
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=['*'],
    allow_methods=['*'],
    allow_headers=['*'],
)

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)


@app.on_event('shutdown')
async def shutdown_db_client():
    client.close()
