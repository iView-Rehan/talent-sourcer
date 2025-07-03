// Developer Kit: Node.js API + ReadMe + GPT Flow (Non-Technical Friendly Version)

// ===== Node.js Express API for Talent Sourcing =====
const express = require('express');
const bodyParser = require('body-parser');
const crypto = require('crypto');
const cors = require('cors');
const app = express();
const PORT = 3000;

// Secure list of available talent pools (Example Only)
const poolRegistry = [
  { id: "eu_grad_pool", region: "Europe", category: "graduate", specializations: ["Frontend"], link: "HIDDEN_INTERNAL_LINK" },
  { id: "us_industry_pool", region: "North America", category: "industry", specializations: ["Fullstack", "Fintech"], link: "HIDDEN_INTERNAL_LINK" },
  { id: "global_consultant_pool", region: "Global", category: "consultant", specializations: ["AI", "ML"], link: "HIDDEN_INTERNAL_LINK" }
];

const SEARCH_THRESHOLD = 3;  // Minimum results before search expands
const PAGE_LIMIT = 50;       // Maximum results per page

app.use(cors());
app.use(bodyParser.json());

// Helper to encode page tokens (keeps track of search position)
const encodeToken = (cursor) => Buffer.from(cursor).toString('base64');
const decodeToken = (token) => Buffer.from(token, 'base64').toString('utf8');

// Basic cleanup for user inputs
const sanitize = (input) => typeof input === 'string' ? input.replace(/[^a-zA-Z0-9 _-]/g, '') : input;

// Mock candidate generator (used for testing without real data)
const mockCandidates = (pool, count = 5) => {
  const names = ["Alice", "Bob", "Charlie", "Dana", "Eve"];
  return Array.from({ length: count }, (_, i) => ({
    name: `${names[i % names.length]} - ${pool.id}`,
    skills: pool.specializations,
    experience: `${Math.floor(Math.random() * 10) + 1} years`,
    location: pool.region === "Global" ? "Remote" : pool.region,
    profile_link: "https://example.com/profile" + i,
    network: pool.id
  }));
};

// Main API for searching talent pools
app.post('/api/talent/search', (req, res) => {
  try {
    const {
      role, skills, location, experience, source_preference, region,
      category, specializations = [], limit = 10, progressive_search = false,
      next_page_token
    } = req.body;

    if (!role || !Array.isArray(skills)) return res.status(400).json({ error: "Role and skills are required." });

    const offset = next_page_token ? parseInt(decodeToken(next_page_token), 10) : 0;

    // Filter pools based on region, category, specializations
    let filteredPools = poolRegistry.filter(pool => {
      const regionMatch = !region || pool.region === region || pool.region === "Global";
      const categoryMatch = !category || pool.category === category;
      const specMatch = !specializations.length || specializations.some(spec =>
        pool.specializations.some(p => p.toLowerCase().includes(spec.toLowerCase())));
      return regionMatch && categoryMatch && specMatch;
    });

    // Generate fake candidates for testing (replace with real Airtable logic)
    let allResults = filteredPools.flatMap(pool => mockCandidates(pool, 5));

    const total = allResults.length;
    const paginated = allResults.slice(offset, offset + Math.min(limit, PAGE_LIMIT));
    const nextPageToken = offset + limit < total ? encodeToken(String(offset + limit)) : null;
    const needsExpansion = total < SEARCH_THRESHOLD && !progressive_search;

    res.json({
      total,
      results: paginated,
      next_page_token: nextPageToken,
      needs_expansion_confirmation: needsExpansion
    });
  } catch (err) {
    console.error("Error:", err);
    res.status(500).json({ error: "Something went wrong." });
  }
});

app.listen(PORT, () => console.log(`Talent API running on port ${PORT}`));

// ===== EASY STEP-BY-STEP GUIDE (Non-Technical Friendly) =====
/*
TALENT SOURCER SETUP (Easy Version)

1️⃣ Requirements:
- Install Node.js (https://nodejs.org)
- Download Visual Studio Code (recommended) or use Terminal

2️⃣ Setup:
- Create a new folder "talent-sourcer"
- Inside terminal:
   cd talent-sourcer
   npm init -y
   npm install express body-parser cors
- Create "index.js" file and paste the above code

3️⃣ Run the API:
   node index.js
   You should see: "Talent API running on port 3000"

4️⃣ Test the Search:
- Use Postman or online tool like Hoppscotch.io
- Method: POST
- URL: http://localhost:3000/api/talent/search

Example Body:
{
  "role": "React Developer",
  "skills": ["React"],
  "region": "Europe",
  "category": "graduate",
  "specializations": ["Frontend"],
  "limit": 5,
  "progressive_search": true
}

You should see mock candidate results in response.

⚠️ IMPORTANT:
- This version uses fake candidates (for testing only)
- Replace mockCandidates() with real Airtable or Database fetch
- Never share your internal registry links

5️⃣ Next Steps:
- Add real data fetching logic
- Secure the API with authentication (API keys)
- Deploy to cloud server (Heroku, Railway, etc.) if needed
*/

// ===== GPT Conversation Example for Non-Tech Team =====
/*
"Hi, I need a frontend developer, remote is okay, open to graduates from Europe."
- GPT sends search to API with those preferences
- API replies with candidates or asks to expand search
- GPT guides user step by step (no technical terms needed)
*/
