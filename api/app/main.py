from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
# from fastapi.staticfiles import StaticFiles
# from fastapi.responses import FileResponse, HTMLResponse

from .routers import auth, users
from .settings import Settings

settings = Settings()
app = FastAPI()

app.include_router(users.router)
app.include_router(auth.router)

# app.mount("/public", StaticFiles(directory="public"), name="public")


# @app.get("/favicon.ico", include_in_schema=False)
# async def favicon():
#     return FileResponse("public/favicon.ico")


# @app.get("/", response_class=HTMLResponse)
# def read_root():
#     return """
#     <!DOCTYPE html>
#     <html>
#     <head>
#         <title>Vercel + FastAPI</title>
#         <link rel="icon" type="image/x-icon" href="/favicon.ico">
#     </head>
#     <body>
#         <h1>Vercel + FastAPI</h1>
#     </body>
#     </html>
#     """

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ORIGINS,  # ou ["*"] para liberar tudo (não recomendado em produção)
    allow_credentials=True,
    allow_methods=['*'],
    allow_headers=['*'],
)
