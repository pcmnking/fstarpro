
import json
import re

with open('assets/js/ziwei_data_P.js', 'r', encoding='utf-8') as f:
    content = f.read()

# Strip const ... = 
content = re.sub(r'const\s+ZIWEI_DATA_P\s*=\s*', '', content)
# Strip trailing ;
content = content.strip()
if content.endswith(';'):
    content = content[:-1]

try:
    data = json.loads(content)
    # Success
    with open('existing_data.json', 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    print("Success")
except json.JSONDecodeError as e:
    print(f"Error decoding JSON: {e}")
    # Plan B: ast.literal_eval might work if it's python-like dict syntax?
    # JS object syntax is close to Python dict, but true/false vs True/False, null vs None.
    # We can try to replace tokens.
    
    # Try simple token replacements
    content = content.replace('true', 'True').replace('false', 'False').replace('null', 'None')
    try:
        import ast
        data = ast.literal_eval(content)
        with open('existing_data.json', 'w', encoding='utf-8') as f:
             json.dump(data, f, ensure_ascii=False, indent=2)
        print("Success with ast")
    except Exception as e2:
        print(f"Error with ast: {e2}")

