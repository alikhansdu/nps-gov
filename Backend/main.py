from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.v1.auth import router as auth_router
from app.api.v1.surveys import router as surveys_router
from app.api.v1.questions import router as questions_router
from app.api.v1.options import router as options_router
from app.api.v1.responses import router as responses_router
from app.api.v1.stats import router as stats_router
from app.api.v1.regions import router as regions_router
from app.api.v1.admin import router as admin_router

app = FastAPI(title="NPS GOV API", version="1.0.0", servers=[{"url": "/api/v1"}])

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)
API_PREFIX = "/api/v1"

app.include_router(auth_router, prefix=API_PREFIX)
app.include_router(surveys_router, prefix=API_PREFIX)
app.include_router(questions_router, prefix=API_PREFIX)
app.include_router(options_router, prefix=API_PREFIX)
app.include_router(responses_router, prefix=API_PREFIX)
app.include_router(stats_router, prefix=API_PREFIX)
app.include_router(regions_router, prefix=API_PREFIX)
app.include_router(admin_router, prefix=API_PREFIX)

@app.get("/health")
async def health():
    return {"status": "ok"}

