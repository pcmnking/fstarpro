
import json
import re

# Load JSON
with open('ziwei_data_all.json', 'r', encoding='utf-8') as f:
    raw_data = json.load(f)

# Mapping functions
def map_palace_name(name):
    name = name.strip()
    # Remove '宮' or '宫' except for '命宮'
    if name == '命宮' or name == '命' or name == '命宫':
        return '命宮'
    
    # Handle explicit mapping
    mapping = {
        '官祿宮': '事業',
        '官祿': '事業',
        '官禄宮': '事業',
        '官禄宫': '事業',
        '官禄': '事業',
        '事業宮': '事業',
        '事業': '事業',
        '父母宫': '父母', 
        '父母宮': '父母',
        '父母': '父母',
        '財帛宮': '財帛',
        '財帛': '財帛',
        '财帛宮': '財帛',
        '财帛宫': '財帛',
        '财帛': '財帛',
        '遷移宮': '遷移',
        '遷移': '遷移',
        '迁移宮': '遷移',
        '迁移宫': '遷移',
        '迁移': '遷移',
        '疾厄宮': '疾厄',
        '疾厄宫': '疾厄',
        '疾厄': '疾厄',
        '兄弟宮': '兄弟',
        '兄弟宫': '兄弟',
        '兄弟': '兄弟',
        '夫妻宮': '夫妻',
        '夫妻宫': '夫妻',
        '夫妻': '夫妻',
        '子女宮': '子女',
        '子女宫': '子女',
        '子女': '子女',
        '交友宮': '交友',
        '交友宫': '交友',
        '交友': '交友',
        '田宅宮': '田宅',
        '田宅宫': '田宅',
        '田宅': '田宅',
        '福德宮': '福德',
        '福德宫': '福德',
        '福德': '福德'
    }
    
    if name in mapping:
        return mapping[name]
    
    # Generic rule: take first 2 chars
    # Check if ends with Gong
    if name.endswith('宮') or name.endswith('宫'):
        short_name = name[:-1]
    else:
        short_name = name
        
    return mapping.get(short_name, short_name)

output_data = {}
source_keys = list(raw_data['sheets'].keys())

for sheet_name in source_keys:
    # Check if this sheet is a palace sheet
    if not (sheet_name.endswith('宮') or sheet_name.endswith('宫')):
        continue
        
    js_source_name = map_palace_name(sheet_name)
    
    if js_source_name not in output_data:
        output_data[js_source_name] = {}
        
    sheet_data = raw_data['sheets'][sheet_name]
    
    current_target = None
    
    for row_idx, row in enumerate(sheet_data):
        # Header keys usually contain the logic
        col0_key = None
        for k in row.keys():
            if "四化" in k:
                col0_key = k
                break
        
        if col0_key:
            val = row[col0_key]
            if val and isinstance(val, str) and ("→" in val):
                # This is a header row
                header_text = val.strip()
                
                # Check Type
                if "生年四化" in header_text:
                    current_target = "SKIP"
                elif "自化" in header_text:
                    current_target = js_source_name # Source to Source
                else:
                    # Extract target
                    # Format: "Source→Target"
                    parts = header_text.split("→")
                    if len(parts) > 1:
                        raw_target = parts[1].strip()
                        current_target = map_palace_name(raw_target)
                    else:
                        current_target = None
                
                # Usually header rows don't contain content immediately useful unless it's the first line too?
                # Check if Unnamed:1 is present in this same row.
                # Actually, in Excel parsed to JSON, the Header Row might contain the First Data Row if structure is weird.
                # But looking at JSON logic, if row has 'Unnamed:1'='祿', we should process it.
                # We do that in the NEXT block regardless (continue is removed/modified).
                
        # Handle Data
        if current_target == "SKIP":
            continue
            
        if not current_target:
            continue
            
        trans = row.get("Unnamed:1")
        content = row.get("Unnamed:2")
        
        if trans and content and trans in ["祿", "權", "科", "忌"]:
            if trans not in output_data[js_source_name]:
                output_data[js_source_name][trans] = {}
            
            output_data[js_source_name][trans][current_target] = content

# Output as JSON
with open('ziwei_output.json', 'w', encoding='utf-8') as f:
    json.dump(output_data, f, ensure_ascii=False, indent=2)
print("Done writing ziwei_output.json")
