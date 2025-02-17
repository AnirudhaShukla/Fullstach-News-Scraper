from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List
import requests
import time
from bs4 import BeautifulSoup

app = FastAPI()

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Replace with your frontend URL in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class SearchRequest(BaseModel):
    keywords: List[str]
    domains: List[str]

# Rotating User-Agent Headers
USER_AGENTS = [
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/101.0.4951.54 Safari/537.36",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/112.0.5615.137 Safari/537.36",
    "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/109.0.0.0 Safari/537.36"
]

def get_news_data(keywords, allowed_domains):
    all_news_results = []
    
    for keyword in keywords:
        # Using Google News RSS instead of scraping
        google_news_rss_url = f"https://news.google.com/rss/search?q={keyword.replace(' ', '%20')}&hl=en-US&gl=US&ceid=US:en"

        try:
            headers = {"User-Agent": USER_AGENTS[len(all_news_results) % len(USER_AGENTS)]}
            response = requests.get(google_news_rss_url, headers=headers, timeout=10)
            response.raise_for_status()

            soup = BeautifulSoup(response.content, "xml")  # Parse RSS feed
            items = soup.find_all("item")

            for item in items:
                title = item.title.text
                link = item.link.text
                source = item.source.text if item.source else "Unknown"
                date = item.pubDate.text if item.pubDate else "No Date"

                if any(domain in link for domain in allowed_domains):
                    all_news_results.append(
                        {
                            "keyword": keyword,
                            "link": link,
                            "title": title,
                            "snippet": "No Snippet (RSS Feed)",
                            "date": date,
                            "source": source,
                        }
                    )

        except requests.exceptions.RequestException as e:
            print(f"Error fetching from {google_news_rss_url}: {str(e)}")
            time.sleep(5)  # Exponential backoff

    return all_news_results

@app.post("/api/search")
async def search_news(request: SearchRequest):
    try:
        results = get_news_data(request.keywords, request.domains)
        return {"results": results}
    except Exception as e:
        return {"error": str(e)}, 500

@app.get("/health")
async def health_check():
    return {"status": "ok"}
