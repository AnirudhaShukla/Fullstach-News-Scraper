import React, { useState } from "react";
import { Table } from "./components/Table";
import { Search, AlertCircle } from "lucide-react";

interface NewsItem {
  keyword: string;
  link: string;
  title: string;
  snippet: string;
  date: string;
  source: string;
}

function App() {
  const [keywords, setKeywords] = useState<string>("");
  const [domains, setDomains] = useState<string[]>([
    "economictimes.com",
    "moneycontrol.com",
    "business-standard.com",
    "livemint.com",
  ]);
  const [newDomain, setNewDomain] = useState<string>("");
  const [results, setResults] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [activeKeyword, setActiveKeyword] = useState<string>("All");

  const handleSearch = async () => {
    setLoading(true);
    setError("");

    try {
      const keywordsList = keywords
        .split(",")
        .map((k) => k.trim())
        .filter((k) => k);

      const response = await fetch("https://fullstach-news-scraper.onrender.com/api/search", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          keywords: keywordsList,
          domains: domains,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to fetch results");
      }

      const data = await response.json();
      setResults(data.results);
      setActiveKeyword("All"); // Reset to "All" after new results load
    } catch (err) {
      if (err instanceof TypeError && err.message.includes("Failed to fetch")) {
        setError(
          "Unable to connect to the server. Please make sure the backend is running:" +
            "\n1. Open a new terminal" +
            "\n2. Navigate to the backend directory: cd backend" +
            "\n3. Run: uvicorn main:app --reload --port 8000"
        );
      } else {
        setError("Failed to fetch news. Please try again later.");
      }
      console.error("Error fetching news:", err);
    } finally {
      setLoading(false);
    }
  };

  const addDomain = () => {
    if (newDomain && !domains.includes(newDomain)) {
      setDomains([...domains, newDomain]);
      setNewDomain("");
    }
  };

  const removeDomain = (domain: string) => {
    setDomains(domains.filter((d) => d !== domain));
  };

  const filteredResults =
    activeKeyword === "All"
      ? results
      : results.filter(
          (result) =>
            result.keyword.toLowerCase() === activeKeyword.toLowerCase()
        );

  const keywordsList = Array.from(
    new Set(results.map((result) => result.keyword))
  );

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">News Scraper</h1>

        {/* Keywords Input */}
        <div className="mb-8">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Keywords (comma-separated)
          </label>
          <div className="flex gap-4">
            <input
              type="text"
              value={keywords}
              onChange={(e) => setKeywords(e.target.value)}
              placeholder="e.g. icici, sbi, kirloskar"
              className="flex-1 rounded-lg border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 p-3"
            />
            <button
              onClick={handleSearch}
              disabled={loading || !keywords}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg flex items-center gap-2 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Search size={20} />
              {loading ? "Searching..." : "Search"}
            </button>
          </div>
          {error && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
              <AlertCircle
                className="text-red-500 flex-shrink-0 mt-0.5"
                size={20}
              />
              <pre className="text-red-600 text-sm whitespace-pre-wrap font-mono">
                {error}
              </pre>
            </div>
          )}
        </div>

        {/* Domains Management */}
        <div className="mb-8 bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Allowed Domains</h2>
          <div className="flex gap-4 mb-4">
            <input
              type="text"
              value={newDomain}
              onChange={(e) => setNewDomain(e.target.value)}
              placeholder="Enter new domain"
              className="flex-1 rounded-lg border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 p-2"
            />
            <button
              onClick={addDomain}
              disabled={!newDomain}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50"
            >
              Add Domain
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {domains.map((domain) => (
              <span
                key={domain}
                className="bg-gray-100 px-3 py-1 rounded-full flex items-center gap-2"
              >
                {domain}
                <button
                  onClick={() => removeDomain(domain)}
                  className="text-red-500 hover:text-red-700"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        </div>

        {/* Tabs for Keywords */}
        {results.length > 0 && (
          <div className="mb-8">
            <div className="flex gap-4 overflow-x-auto">
              <button
                onClick={() => setActiveKeyword("All")}
                className={`px-4 py-2 rounded-lg ${
                  activeKeyword === "All"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-200 hover:bg-gray-300"
                }`}
              >
                All
              </button>
              {keywordsList.map((keyword) => (
                <button
                  key={keyword}
                  onClick={() => setActiveKeyword(keyword)}
                  className={`px-4 py-2 rounded-lg ${
                    activeKeyword === keyword
                      ? "bg-blue-600 text-white"
                      : "bg-gray-200 hover:bg-gray-300"
                  }`}
                >
                  {keyword}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Results Table */}
        {filteredResults.length > 0 ? (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <Table results={filteredResults} />
          </div>
        ) : results.length > 0 ? (
          <div className="text-gray-500 text-center">
            No results found for "{activeKeyword}".
          </div>
        ) : null}
      </div>
    </div>
  );
}

export default App;
