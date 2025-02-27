from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List
import json
import requests
from bs4 import BeautifulSoup
import pandas as pd

app = FastAPI()

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with your frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class SearchRequest(BaseModel):
    keywords: List[str]
    domains: List[str]

def getNewsData(keywords, allowed_domains):
    headers = {
        "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/101.0.4951.54 Safari/537.36"
    }
    all_news_results = []

    for keyword in keywords:
        google_url = f"https://www.google.com/search?q={keyword.replace(' ', '+')}&gl=us&tbm=nws&num=20"
        bing_url = f"https://www.bing.com/news/search?q={keyword.replace(' ', '+')}"

        for search_url in [google_url, bing_url]:
            try:
                response = requests.get(search_url, headers=headers, timeout=10)
                response.raise_for_status()
                soup = BeautifulSoup(response.content, "html.parser")

                for el in soup.select("div.SoaBEf"):
                    link = el.find("a")["href"]
                    source = el.select_one(".NUnG9d span").get_text() if el.select_one(".NUnG9d span") else "Unknown"
                    if any(domain in link for domain in allowed_domains):
                        all_news_results.append(
                            {
                                "keyword": keyword,
                                "link": link,
                                "title": el.select_one("div.MBeuO").get_text() if el.select_one("div.MBeuO") else "No Title",
                                "snippet": el.select_one(".GI74Re").get_text() if el.select_one(".GI74Re") else "No Snippet",
                                "date": el.select_one(".LfVVr").get_text() if el.select_one(".LfVVr") else "No Date",
                                "source": source
                            }
                        )
            except Exception as e:
                print(f"Error fetching from {search_url}: {str(e)}")
                continue

    return all_news_results

@app.post("/api/search")
async def search_news(request: SearchRequest):
    try:
        results = getNewsData(request.keywords, request.domains)
        return {"results": results}
    except Exception as e:
        return {"error": str(e)}, 500

@app.get("/health")
async def health_check():
    return {"status": "ok"}
