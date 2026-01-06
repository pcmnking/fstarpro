
# Replace '官祿' with '事業' in ziwei_data_P.js

file_path = 'assets/js/ziwei_data_P.js'

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

new_content = content.replace('官祿', '事業').replace('官禄', '事業')

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(new_content)

print("Replaced 官祿 with 事業 in " + file_path)
