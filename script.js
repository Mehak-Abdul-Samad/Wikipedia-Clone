// Elements
const searchForm = document.getElementById("search-form");
const searchInput = document.getElementById("search-input");
const searchResults = document.getElementById("search-results");
const themeToggler = document.getElementById("theme-toggler");
const body = document.body;

// Utility: strip HTML tags from Wikipedia snippet (they include <span class="searchmatch">)
function stripHtmlTags(html) {
  if (!html) return "";
  return html.replace(/<\/?[^>]+(>|$)/g, "");
}

// Fetch function (fixed typos and renamed)
async function searchWikipedia(query) {
  const encodedQuery = encodeURIComponent(query);
  const endpoint = `https://en.wikipedia.org/w/api.php?action=query&list=search&prop=info&inprop=url&utf8=&format=json&origin=*&srlimit=10&srsearch=${encodedQuery}`;

  const response = await fetch(endpoint);
  if (!response.ok) {
    throw new Error("Failed to fetch search results from Wikipedia API.");
  }

  const json = await response.json();
  return json;
}

// Display results (fixed pageid usage + safely show snippet text)
function displayResults(results) {
  searchResults.innerHTML = "";

  results.forEach((result, idx) => {
    const url = `https://en.wikipedia.org/?curid=${result.pageid}`; // use result.pageid
    const titleLink = `<a class="result-link" href="${url}" target="_blank" rel="noopener noreferrer">${result.title}</a>`;
    // strip HTML tags from snippet to avoid injecting tags
    const cleanSnippet = stripHtmlTags(result.snippet);

    const resultItem = document.createElement("div");
    resultItem.className = "result-item";
    resultItem.innerHTML = `
      <h3 class="result-title">${idx + 1}. ${titleLink}</h3>
      <div><small>${url}</small></div>
      <p class="result-snippet">${cleanSnippet}...</p>
    `;

    searchResults.appendChild(resultItem);
  });
}

// Handle submit
searchForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const query = searchInput.value.trim();
  if (!query) {
    searchResults.innerHTML = "<p>Please enter a valid search term.</p>";
    return;
  }

  searchResults.innerHTML = "<div class='spinner'>Loading results...</div>";

  try {
    const results = await searchWikipedia(query);

    if (!results.query || results.query.searchinfo.totalhits === 0) {
      searchResults.innerHTML = "<p>No results found.</p>";
    } else {
      displayResults(results.query.search);
    }
  } catch (err) {
    console.error(err);
    searchResults.innerHTML = `<p>An error occurred while searching. Try again later.</p>`;
  }
});

// Theme toggler (small improvement)
themeToggler.addEventListener("click", () => {
  body.classList.toggle("dark-theme");
  const dark = body.classList.contains("dark-theme");
  themeToggler.textContent = dark ? "Dark" : "Light";
  themeToggler.setAttribute("aria-pressed", dark ? "true" : "false");
});