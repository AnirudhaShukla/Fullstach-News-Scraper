import React, { useEffect, useState } from "react";
import { ChevronUp, ChevronDown } from "lucide-react";

interface NewsItem {
  keyword: string;
  link: string;
  title: string;
  snippet: string;
  date: string;
  source: string;
}

interface TableProps {
  results: NewsItem[];
}

function parseDate(dateString: string): number {
  const now = new Date();

  if (dateString.includes("minute")) {
    const minutes = parseInt(dateString.split(" ")[0], 10);
    return now.getTime() - minutes * 60 * 1000;
  } else if (dateString.includes("hour")) {
    const hours = parseInt(dateString.split(" ")[0], 10);
    return now.getTime() - hours * 60 * 60 * 1000;
  } else if (dateString.includes("day")) {
    const days = parseInt(dateString.split(" ")[0], 10);
    return now.getTime() - days * 24 * 60 * 60 * 1000;
  } else if (dateString.includes("week")) {
    const weeks = parseInt(dateString.split(" ")[0], 10);
    return now.getTime() - weeks * 7 * 24 * 60 * 60 * 1000;
  } else if (dateString.includes("month")) {
    const months = parseInt(dateString.split(" ")[0], 10);
    return now.setMonth(now.getMonth() - months);
  } else {
    // Assume it's an absolute date
    return new Date(dateString).getTime();
  }
}

export function Table({ results }: TableProps) {
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [sortedResults, setSortedResults] = useState<NewsItem[]>(results);

  const handleSort = (results: any) => {
    const newOrder = sortOrder === "asc" ? "desc" : "asc";
    const sorted = [...results].sort((a, b) => {
      const dateA = parseDate(a.date);
      const dateB = parseDate(b.date);

      return newOrder === "asc" ? dateA - dateB : dateB - dateA;
    });

    setSortOrder(newOrder);
    setSortedResults(sorted);
  };

  useEffect(() => {
    handleSort(results);
  }, results);

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Keyword
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Title
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Snippet
            </th>
            <th
              onClick={() => handleSort(results)}
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
            >
              Date
              {sortOrder === "asc" ? (
                <ChevronUp className="inline-block ml-2 w-4 h-4" />
              ) : (
                <ChevronDown className="inline-block ml-2 w-4 h-4" />
              )}
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Source
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Action
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {sortedResults.map((item, index) => (
            <tr key={index}>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {item.keyword}
              </td>
              <td className="px-6 py-4 text-sm text-gray-900">{item.title}</td>
              <td className="px-6 py-4 text-sm text-gray-500">
                {item.snippet}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {item.date}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {item.source}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm">
                <a
                  href={item.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-900"
                >
                  View Article
                </a>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
