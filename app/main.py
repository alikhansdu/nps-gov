from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.v1 import auth, surveys, questions, responses, regions, options, stats

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["appi"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/api/v1")
app.include_router(surveys.router, prefix="/api/v1")
app.include_router(questions.router, prefix="/api/v1")
app.include_router(responses.router, prefix="/api/v1")
app.include_router(regions.router, prefix="/api/v1")
app.include_router(options.router, prefix="/api/v1")
app.include_router(stats.router, prefix="/api/v1")