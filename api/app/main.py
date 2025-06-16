from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .routers import auth, users
from .settings import Settings

settings = Settings()
app = FastAPI()

app.include_router(users.router)
app.include_router(auth.router)

print(settings.ORIGINS)
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ORIGINS,  # ou ["*"] para liberar tudo (não recomendado em produção)
    allow_credentials=True,
    allow_methods=['*'],
    allow_headers=['*'],
)
