// config.js
// Configuration for the legal search functionality. Replace the placeholder
// values below with your own Google API key and Custom Search Engine ID.
// See README or documentation for instructions on obtaining these credentials.

window.LEGAL_SEARCH = {
  // Your Google Custom Search API key. Leave as an empty string until you
  // obtain a valid API key from Google Cloud Console.
  GOOGLE_API_KEY: "",
  // Your Google Custom Search Engine (CSE) ID. Replace with your CSE ID
  // created at https://programmablesearchengine.google.com/.
  GOOGLE_CSE_ID: "",
  // A list of trusted domains to limit search results to Philippine legal
  // sources. You can modify or extend this list as needed.
  ALLOWED_SITES: [
    "lawphil.net",
    "chanrobles.com",
    "sc.judiciary.gov.ph",
    "ca.judiciary.gov.ph",
    "officialgazette.gov.ph",
    "philippinelaw.allegheny.edu"
  ]
};