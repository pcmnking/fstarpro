
import json

# Load new data
with open('ziwei_output.json', 'r', encoding='utf-8') as f:
    new_data = json.load(f)

# Load existing JS file
js_path = 'assets/js/ziwei_data_P.js'
with open(js_path, 'r', encoding='utf-8') as f:
    js_content = f.read()

# Marker for the next section
marker = 'const ZIWEI_DATA_ZIHUA ='

if marker in js_content:
    parts = js_content.split(marker)
    part_before_zihua = parts[0]
    part_after = marker + parts[1]
    
    # In part_before_zihua, find ZIWEI_DATA_P
    start_marker = 'const ZIWEI_DATA_P ='
    if start_marker in part_before_zihua:
        pre_header = part_before_zihua.split(start_marker)[0]
        
        # Format the new object
        # Ensure proper JSON formatting
        new_json_str = json.dumps(new_data, indent=2, ensure_ascii=False)
        
        # Reconstruct
        # We add the variable declaration
        # We also want to preserve the comment lines just before ZIHUA if possible?
        # The split removed them from 'part_after' if they were before the marker.
        # But 'part_before_zihua' contains them at the end.
        # The 'part_before_zihua' contains the OLD ZIWEI_DATA_P object + comments.
        
        # We need to specifically replace the OBJECT inside part_before_zihua.
        # Or simpler: Just replace everything in part_before_zihua starting from 'const ZIWEI_DATA_P ='
        # But wait, looking at file view:
        # Line 651: };
        # Line 653: //宮位自化對應表
        # Line 655: const ZIWEI_DATA_ZIHUA = {
        
        # So 'part_before_zihua' includes '//宮位自化對應表'.
        # I'll just regenerate the comment.
        
        new_content = pre_header + 'const ZIWEI_DATA_P = ' + new_json_str + ';\n\n//宮位自化對應表\n\n' + part_after
        
        with open(js_path, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print("Updated ZIWEI_DATA_P in ziwei_data_P.js")
        
    else:
        print("Error: Could not find const ZIWEI_DATA_P =")
else:
    print("Error: Could not find const ZIWEI_DATA_ZIHUA =")
    # Fallback: Maybe ZIWEI_DATA_ZIHUA is missing?
    # View file end to see.
