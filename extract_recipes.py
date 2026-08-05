import json
import re
from PyPDF2 import PdfReader

def extract_recipes():
    reader = PdfReader(r"C:\Users\RACHIT\Downloads\Recipes Book.pdf")
    text = ""
    for page in reader.pages:
        text += page.extract_text() + "\n"

    recipes = []
    sections = text.split('Method')
    
    for i in range(len(sections) - 1):
        lines_before = [l.strip() for l in sections[i].split('\n') if l.strip()]
        lines_after = [l.strip() for l in sections[i+1].split('\n') if l.strip()]
        
        title_and_ingredients = '\n'.join(lines_before[-30:])
        
        steps = []
        for line in lines_after:
            if re.match(r'^(Energy \(Kcal\)|Protein|Nutritive|Ingredients)', line, re.I):
                break
            steps.append(line)
            if len(steps) > 30:
                break
                
        title = "Unknown Recipe"
        match = re.search(r'([^\n]+)\n+(?:Nutritive value per serving|Ingredients)', title_and_ingredients, re.I)
        if match:
            title = re.sub(r'[0-9]+$', '', match.group(1)).strip()
            
        if title != "Unknown Recipe" and len(steps) > 0:
            recipes.append({
                "title": title,
                "text": f"{title_and_ingredients}\n\nMethod:\n" + '\n'.join(steps)
            })

    unique_recipes = []
    seen = set()
    for r in recipes:
        if r['title'] not in seen and 2 < len(r['title']) < 50:
            seen.add(r['title'])
            unique_recipes.append(r)

    import os
    if not os.path.exists('./src/data'):
        os.makedirs('./src/data')
        
    with open('./src/data/recipes.json', 'w', encoding='utf-8') as f:
        json.dump(unique_recipes, f, indent=2, ensure_ascii=False)
        
    print(f"Successfully extracted {len(unique_recipes)} recipes!")

if __name__ == "__main__":
    extract_recipes()
