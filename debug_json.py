import json

try:
    with open('ziwei_data_all.json', 'r', encoding='utf-8') as f:
        data = json.load(f)
        sheets = data.get('sheets', {})
        print("Keys in sheets:", list(sheets.keys()))
        for k, v in sheets.items():
            print(f"Sheet '{k}' has {len(v)} rows")
except Exception as e:
    print(f"Error: {e}")
