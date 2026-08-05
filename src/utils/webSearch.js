export const performWebSearch = async (query) => {
  const tavilyKey = import.meta.env.VITE_TAVILY_API_KEY;

  if (tavilyKey) {
    try {
      const res = await fetch("https://api.tavily.com/search", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          api_key: tavilyKey,
          query: query,
          search_depth: "basic",
          include_answer: false,
          max_results: 3
        })
      });

      if (res.ok) {
        const data = await res.json();
        if (data.results && data.results.length > 0) {
          const snippets = data.results.map(r => r.content).join(' | ');
          return snippets;
        }
      }
    } catch (e) {
      console.warn("Tavily search failed, falling back to Wikipedia", e);
    }
  } else {
    console.warn("No VITE_TAVILY_API_KEY found. Falling back to Wikipedia.");
  }

  // Fallback to Wikipedia API (very reliable but limited to exact article titles)
  try {
    const wikiRes = await fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(query)}`);
    if (wikiRes.ok) {
      const wikiData = await wikiRes.json();
      if (wikiData.extract) return wikiData.extract;
    }
  } catch (e) {
    console.warn("Wikipedia search failed", e);
  }

  return "No detailed summary found.";
};
