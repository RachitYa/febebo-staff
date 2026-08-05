const fs = require('fs');
const pdfParse = require('pdf-parse');

async function extractRecipes() {
  const dataBuffer = fs.readFileSync('C:\\Users\\RACHIT\\Downloads\\Recipes Book.pdf');
  
  try {
    const data = await pdfParse(dataBuffer);
    const text = data.text;
    
    // Split by common recipe markers. The PDF has "Nutritive value per serving" and "Method"
    const recipes = [];
    
    // Simple heuristic: look for "Method" as a marker and extract chunks around it
    const sections = text.split('Method');
    
    for (let i = 0; i < sections.length - 1; i++) {
        // The title and ingredients are usually in sections[i], at the end
        // The instructions are in sections[i+1], at the beginning
        
        const linesBefore = sections[i].split('\n').map(l => l.trim()).filter(l => l);
        const linesAfter = sections[i+1].split('\n').map(l => l.trim()).filter(l => l);
        
        // Grab the last 20 lines before 'Method' as ingredients/title
        const titleAndIngredients = linesBefore.slice(Math.max(linesBefore.length - 30, 0)).join('\n');
        
        // Grab the first 20 lines after 'Method' as steps
        let steps = [];
        for (const line of linesAfter) {
            if (line.match(/^Energy \(Kcal\)|^Protein|^Nutritive|^Ingredients/i)) break;
            steps.push(line);
            if (steps.length > 30) break; // Arbitrary limit
        }
        
        // Try to guess title (usually the first line before "Nutritive value" or "Ingredients")
        let title = "Unknown Recipe";
        const titleMatch = titleAndIngredients.match(/([^\n]+)\n+(?:Nutritive value per serving|Ingredients)/i);
        if (titleMatch) {
            title = titleMatch[1].replace(/[0-9]+$/, '').trim(); // Remove page numbers if present
        }
        
        if (title !== "Unknown Recipe" && steps.length > 0) {
            recipes.push({
                title: title,
                text: `${titleAndIngredients}\n\nMethod:\n${steps.join('\n')}`
            });
        }
    }
    
    // Clean up
    const uniqueRecipes = [];
    const seen = new Set();
    for (const r of recipes) {
        if (!seen.has(r.title) && r.title.length > 2 && r.title.length < 50) {
            seen.add(r.title);
            uniqueRecipes.push(r);
        }
    }
    
    if (!fs.existsSync('./src/data')) {
        fs.mkdirSync('./src/data');
    }
    
    fs.writeFileSync('./src/data/recipes.json', JSON.stringify(uniqueRecipes, null, 2));
    console.log(`Successfully extracted ${uniqueRecipes.length} recipes!`);
    
  } catch (err) {
    console.error('Error parsing PDF:', err);
  }
}

extractRecipes();
