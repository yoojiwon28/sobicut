from fastapi import FastAPI

app = FastAPI(
    title="소비컷 API",
    version="1.0.0"
)

@app.get("/")
def root():
    return {"message": "소비컷 서버 실행 중"}