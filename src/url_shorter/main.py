from hashlib import md5
from pathlib import Path
import os
from fastapi.staticfiles import StaticFiles
import uvicorn
from fastapi import FastAPI, HTTPException, Query
from fastapi.responses import HTMLResponse, RedirectResponse, JSONResponse, PlainTextResponse
from datetime import datetime
# Happy Diwali!!!!! greetings from Indiaaaa

ROOT = Path(__file__).resolve().parent
TEMPLATES_DIR = ROOT / "templates"
STATIC_DIR = ROOT / "static"
app = FastAPI(debug=True, title="URL-Shorter")

class LinkRepo:
    def __init__(self):
        self.urls = {}

    def add_link(self, url: str) -> str:
        code = generate_hash(url)
        while code in self.urls and url != self.urls[code]:
            code = generate_hash(url, True)
            print(f"added RANDOM {code} for {url}")
        self.urls[code] = url
        print(f"added {code} for {url}")
        return code

    def get_link(self, code: str) -> str | None:
        return self.urls.get(code)

    def delete_link(self, code:str):
        if code in self.urls:
            self.urls.pop(code)

repo = LinkRepo()


def generate_hash(url:str, random: bool = False) -> str:
    if random:       
        return generate_hash(url+datetime.now().isoformat())
    return md5(url.encode()).hexdigest()[:5]


@app.post("/link", status_code=201)
def create_short_link(link: str) -> PlainTextResponse:
    return PlainTextResponse(repo.add_link(link))


@app.delete("/link", status_code=204)
def delete(code:str = Query()):
    repo.delete_link(code)


@app.get("/-/{code}")
def get_normal_link(code: str) -> RedirectResponse:
    url = repo.get_link(code)
    if url is None:
        raise HTTPException(404)
    return RedirectResponse(url)


@app.get("/links", status_code=200)
def get_all_link() -> JSONResponse:
    return repo.urls


app.mount("/static", StaticFiles(directory=STATIC_DIR), name="static")


@app.get("/home")
def get_homepage() -> HTMLResponse:
    return HTMLResponse((TEMPLATES_DIR / "home.html").read_text(encoding='utf-8'))



def run():
    uvicorn.run("url_shorter.main:app", host="0.0.0.0", port=8000, reload=True)



#TODO: 2) поправить веб

