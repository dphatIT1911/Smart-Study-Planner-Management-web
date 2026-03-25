from fastapi import FastAPI
from database import engine, Base
from routers import analytics

# Create the database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Smart Study Planner API")

app.include_router(analytics.router)

@app.get("/")
def read_root():
    return {"message": "Welcome to Smart Study Planner API"}
