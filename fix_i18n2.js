const fs = require('fs');

try {
  let content = fs.readFileSync('/Users/jamiekwok/Documents/GitHub/travelTogether2/src/i18n.js', 'utf8');
  const acorn = require('acorn');
  
  // Try to parse using Acorn which gives very good error messages
  try {
     acorn.parse(content, { ecmaVersion: 2020, sourceType: 'module' });
     console.log("Acorn parsing successful.");
  } catch (err) {
     console.log("Acorn error at line", err.loc ? err.loc.line : "unknown", ":", err.message);
  }
} catch (e) {
  console.log(e);
}
