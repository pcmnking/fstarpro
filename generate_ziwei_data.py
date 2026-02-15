import json
import os

# Simplified to Traditional Chinese Mapping (Basic)

simp_trad_map = {
    '于': '於', '里': '裡', '后': '後', '发': '發', '么': '麼', '尽': '盡', '帮': '幫', '复': '復',
    '获': '獲', '苏': '蘇', '历': '歷', '钟': '鐘', '只': '祇', '杰': '傑', '松': '鬆', '云': '雲',
    '卜': '蔔', '门': '門', '贞': '貞', '机': '機', '阴': '陰', '军': '軍', '阳': '陽', '虽': '雖',
    '义': '義', '与': '與', '乐': '樂', '产': '產', '亲': '親', '亿': '億', '从': '從', '仓': '倉',
    '价': '價', '仪': '儀', '众': '眾', '优': '優', '伙': '夥', '传': '傳', '伪': '偽', '伦': '倫',
    '侧': '側', '侨': '僑', '俭': '儉', '储': '儲', '儿': '兒', '兑': '兌', '兰': '蘭', '关': '關',
    '兴': '興', '兹': '茲', '养': '養', '兽': '獸', '内': '內', '冈': '岡', '册': '冊', '写': '寫',
    '农': '農', '冯': '馮', '删': '刪', '别': '別', '剑': '劍', '剂': '劑', '务': '務', '动': '動',
    '励': '勵', '劲': '勁', '劳': '勞', '医': '醫', '区': '區', '协': '協', '压': '壓', '厌': '厭',
    '参': '參', '双': '雙', '变': '變', '县': '縣', '吕': '呂', '叹': '嘆', '啸': '嘯', '嘱': '囑',
    '园': '園', '围': '圍', '图': '圖', '团': '團', '圣': '聖', '坚': '堅', '坏': '壞', '坠': '墜',
    '声': '聲', '壳': '殼', '处': '處', '备': '備', '宪': '憲', '导': '導', '寿': '壽', '层': '層',
    '岛': '島', '带': '帶', '帮': '幫', '帐': '帳', '庄': '莊', '庆': '慶', '庐': '廬', '库': '庫',
    '应': '應', '废': '廢', '庙': '廟', '广': '廣', '开': '開', '异': '異', '弃': '棄', '张': '張',
    '弹': '彈', '归': '歸', '彦': '彥', '彻': '徹', '径': '徑', '德': '德', '忆': '憶', '忏': '懺',
    '忧': '憂', '怀': '懷', '态': '態', '怜': '憐', '总': '總', '恳': '懇', '恶': '惡', '悬': '懸',
    '惊': '驚', '惧': '懼', '惨': '慘', '愤': '憤', '惭': '慚', '懂': '懂', '战': '戰', '戏': '戲',
    '执': '執', '扩': '擴', '扫': '掃', '扬': '揚', '护': '護', '报': '報', '拟': '擬', '挥': '揮',
    '损': '損', '摇': '搖', '据': '據', '掳': '擄', '择': '擇', '击': '擊', '挡': '擋', '挤': '擠',
    '拟': '擬', '擦': '擦', '支': '支', '放': '放', '效': '效', '敌': '敵', '教': '教', '敛': '斂',
    '数': '數', '斋': '齋', '断': '斷', '无': '無', '旧': '舊', '时': '時', '旷': '曠', '显': '顯',
    '晓': '曉', '晒': '曬', '书': '書', '术': '術', '朱': '朱', '朴': '樸', '杂': '雜', '权': '權',
    '杆': '桿', '条': '條', '来': '來', '杨': '楊', '极': '極', '构': '構', '柜': '櫃', '查': '查',
    '栏': '欄', '样': '樣', '格': '格', '栽': '栽', '桂': '桂', '桌': '桌', '桥': '橋', '梁': '梁',
    '梦': '夢', '械': '械', '梵': '梵', '检': '檢', '棉': '棉', '棒': '棒', '棚': '棚', '棣': '棣',
    '森': '森', '棱': '稜', '棵': '棵', '棍': '棍', '植': '植', '椰': '椰', '楚': '楚', '楼': '樓',
    '概': '概', '榄': '欖', '榆': '榆', '榈': '櫚', '榉': '櫸', '榜': '榜', '榛': '榛', '模': '模',
    '横': '橫', '樱': '櫻', '檀': '檀', '欢': '歡', '欧': '歐', '歼': '殲', '残': '殘', '殃': '殃',
    '殇': '殤', '殉': '殉', '殊': '殊', '殖': '殖', '段': '段', '毁': '毀', '毅': '毅', '母': '母',
    '毒': '毒', '毕': '畢', '毙': '斃', '毡': '氈', '气': '氣', '氢': '氫', '氩': '氬', '氨': '氨',
    '氧': '氧', '氲': '氳', '求': '求', '汇': '匯', '汉': '漢', '汤': '湯', '沟': '溝', '河': '河',
    '沸': '沸', '泼': '潑', '泽': '澤', '洁': '潔', '洋': '洋', '洒': '灑', '洗': '洗', '派': '派',
    '流': '流', '浅': '淺', '测': '測', '济': '濟', '浑': '渾', '浓': '濃', '浙': '浙', '涣': '渙',
    '海': '海', '涛': '濤', '涝': '澇', '涞': '淶', '涟': '漣', '涠': '潿', '涡': '渦', '涣': '渙',
    '涤': '滌', '润': '潤', '涧': '澗', '涨': '漲', '涩': '澀', '渊': '淵', '混': '混', '渐': '漸',
    '渔': '漁', '渴': '渴', '温': '溫', '湾': '灣', '湿': '濕', '溃': '潰', '溅': '濺', '溉': '溉',
    '滢': '瀅', '滨': '濱', '滚': '滾', '滞': '滯', '滥': '濫', '满': '滿', '滤': '濾', '滦': '灤',
    '滩': '灘', '潲': '潲', '潇': '瀟', '潋': '瀲', '潍': '濰', '潜': '潛', '潴': '瀦', '澜': '瀾',
    '濑': '瀨', '濒': '瀕', '灏': '灝', '灭': '滅', '灯': '燈', '灵': '靈', '灾': '災', '灿': '燦',
    '炉': '爐', '炊': '炊', '炎': '炎', '炒': '炒', '炕': '炕', '炬': '炬', '炭': '炭', '炮': '炮',
    '炯': '炯', '烃': '烴', '烙': '烙', '烘': '烘', '烛': '燭', '烟': '煙', '烤': '烤', '烦': '煩',
    '烧': '燒', '烩': '燴', '烫': '燙', '烬': '燼', '热': '熱', '焕': '煥', '焖': '燜', '焘': '燾',
    '爱': '愛', '爷': '爺', '爸': '爸', '牍': '牘', '牙': '牙', '牦': '犛', '牵': '牽', '牺': '犧',
    '状': '狀', '犹': '猶', '狂': '狂', '狄': '狄', '狈': '狽', '狐': '狐', '独': '獨', '狭': '狹',
    '狮': '獅', '狰': '猙', '狱': '獄', '猎': '獵', '猖': '猖', '猛': '猛', '猜': '猜', '猬': '蝟',
    '猩': '猩', '猪': '豬', '猫': '貓', '献': '獻', '猴': '猴', '猾': '猾', '猿': '猿', '獭': '獺',
    '獾': '獾', '率': '率', '玺': '璽', '环': '環', '现': '現', '玲': '玲', '珍': '珍', '珊': '珊',
    '珠': '珠', '琐': '瑣', '瑶': '瑤', '瑰': '瑰', '琼': '瓊', '璃': '璃', '琏': '璉', '璎': '瓔',
    '甄': '甄', '畸': '畸', '画': '畫', '痴': '癡', '疬': '癧', '疡': '瘍', '疗': '療', '疯': '瘋',
    '疤': '疤', '痉': '痙', '疲': '疲', '痘': '痘', '痛': '痛', '痞': '痞', '痢': '痢', '痪': '瘓',
    '痫': '癇', '痴': '癡', '痹': '痹', '痼': '痼', '痿': '痿', '瘀': '瘀', '瘁': '瘁', '瘃': '瘃',
    '瘅': '癉', '瘐': '瘐', '瘕': '瘕', '瘗': '瘞', '瘘': '瘺', '瘙': '瘙', '瘛': '瘈', '瘟': '瘟',
    '瘠': '瘠', '瘢': '瘢', '瘤': '瘤', '瘥': '瘥', '瘦': '瘦', '瘩': '瘩', '瘪': '癟', '瘫': '癱',
    '瘼': '瘼', '瘭': '瘭', '瘰': '瘰', '瘳': '瘳', '瘴': '瘴', '瘵': '瘵', '瘸': '瘸', '瘾': '癮',
    '瘿': '癭', '癞': '癩', '癣': '癬', '癫': '癲', '皋': '皋', '皑': '皚', '疱': '皰', '皲': '皸',
    '皱': '皺', '盏': '盞', '监': '監', '盖': '蓋', '盗': '盜', '盘': '盤', '睁': '睜', '着': '著',
    '睐': '睞', '睑': '瞼', '瞒': '瞞', '瞩': '矚', '矫': '矯', '硕': '碩', '硖': '硤', '确': '確',
    '碍': '礙', '碘': '碘', '碌': '碌', '碎': '碎', '碑': '碑', '碗': '碗', '碟': '碟', '碧': '碧',
    '碰': '碰', '碱': '鹼', '碹': '碹', '碾': '碾', '磁': '磁', '磅': '磅', '磙': '磙', '磕': '磕',
    '磨': '磨', '磬': '磬', '磺': '磺', '礁': '礁', '礅': '礅', '礴': '礡', '礼': '禮', '祷': '禱',
    '祸': '禍', '福': '福', '禧': '禧', '禅': '禪', '离': '離', '秃': '禿', '秆': '桿', '种': '種',
    '积': '積', '称': '稱', '秸': '秸', '税': '稅', '稳': '穩', '稻': '稻', '穗': '穗', '穷': '窮',
    '窃': '竊', '窍': '竅', '窑': '窯', '窜': '竄', '窝': '窩', '窥': '窺', '窦': '竇', '窭': '窶',
    '竖': '豎', '竞': '競', '笃': '篤', '竿': '竿', '笔': '筆', '笋': '筍', '笕': '筧', '笺': '箋',
    '笼': '籠', '箩': '籮', '筹': '籌', '签': '簽', '简': '簡', '箓': '籙', '筛': '篩', '篮': '籃',
    '篱': '籬', '簖': '籪', '篓': '簍', '籁': '籟', '罐': '罐', '籍': '籍', '米': '米', '类': '類',
    '籼': '秈', '籽': '籽', '粉': '粉', '粑': '粑', '粒': '粒', '粕': '粕', '粗': '粗', '粘': '粘',
    '粟': '粟', '粤': '粵', '粥': '粥', '粪': '糞', '粮': '糧', '粱': '粱', '粳': '粳', '粹': '粹',
    '精': '精', '糊': '糊', '糕': '糕', '糖': '糖', '糙': '糙', '糜': '糜', '糟': '糟', '糠': '糠',
    '糯': '糯', '系': '系', '累': '累', '细': '細', '纠': '糾', '结': '結', '绝': '絕', '级': '級',
    '红': '紅', '纤': '纖', '约': '約', '纪': '紀', '纫': '紉', '纬': '緯', '纯': '純', '纲': '綱',
    '纳': '納', '纵': '縱', '纶': '綸', '纷': '紛', '纸': '紙', '纹': '紋', '纺': '紡', '线': '線',
    '练': '練', '组': '組', '终': '終', '织': '織', '绉': '縐', '绊': '絆', '缠': '纏', '缀': '綴',
    '绫': '綾', '绵': '綿', '绪': '緒', '续': '續', '绿': '綠', '绸': '綢', '维': '維', '缓': '緩',
    '缔': '締', '缕': '縷', '编': '編', '缘': '緣', '缥': '縹', '缚': '縛', '缝': '縫', '缨': '纓',
    '缩': '縮', '缪': '繆', '缫': '繅', '缬': '纈', '缭': '繚', '缮': '繕', '缯': '繒', '缰': '韁',
    '缱': '繾', '缲': '繰', '缳': '繯', '缴': '繳', '缢': '縊', '缵': '纘', '缆': '纜', '绒': '絨',
    '絮': '絮', '绩': '績', '绢': '絹', '绣': '繡', '绥': '綏', '继': '繼', '绮': '綺', '绯': '緋',
    '绰': '綽', '绱': '緔', '绲': '緄', '绳': '繩', '绶': '綬', '绷': '繃', '绨': '緇', '丑': '丑',
    '斗': '斗', '面': '面'
}

# Specific mapping for Ziwei Context
def to_traditional(text):
    if not text: return ""
    res = ""
    for char in text:
        if char in simp_trad_map:
            # Context logic for '丑', '斗', '面'
            if char in ['丑', '斗', '面']:
                res += char
            else:
                res += simp_trad_map[char]
        else:
            res += char
    return res

def normalize_palace(name):
    name = name.strip()
    # Handle both Traditional and Simplified 'Gong'
    name = name.replace('宮', '').replace('宫', '')
    
    # Handle known aliases
    if name == '命': name = '命'
    elif name in ['官祿', '事業']: name = '事業'
    elif name in ['奴僕', '交友']: name = '交友'
    
    # Validation against known list
    valid_bases = ['命', '兄弟', '夫妻', '子女', '財帛', '疾厄', '遷移', '交友', '事業', '田宅', '福德', '父母']
    
    if name in valid_bases:
        return name + '宮'
        
    return name + '宮'

try:
    with open('ziwei_data_all.json', 'r', encoding='utf-8') as f:
        data = json.load(f)
except Exception as e:
    print(f"Error loading JSON: {e}")
    exit(1)

ZIWEI_DATA_P = {}
ZIWEI_DATA_ZIHUA = {}
ZIWEI_DATA_SIHUA_N = {}

sheets = data.get('sheets', {})

# Trans Types
trans_keys = ['祿', '權', '科', '忌']
trans_map = {'祿': '祿', '禄': '祿', '權': '權', '权': '權', '科': '科', '忌': '忌'}

for sheet_name, rows in sheets.items():
    source_palace_raw = sheet_name
    source_palace = normalize_palace(source_palace_raw)
    
    # Initialize dictionaries
    if source_palace not in ZIWEI_DATA_P:
        ZIWEI_DATA_P[source_palace] = {k: {} for k in trans_keys}
    if source_palace not in ZIWEI_DATA_ZIHUA:
        ZIWEI_DATA_ZIHUA[source_palace] = {k: {} for k in trans_keys}
    if source_palace not in ZIWEI_DATA_SIHUA_N:
        ZIWEI_DATA_SIHUA_N[source_palace] = {k: "" for k in trans_keys}
        
    current_context = None # 'A->B', 'Self', 'Birth'
    
    # Iterate rows
    # We need to find the column that corresponds to "SheetName(四化）"
    # But sheet syntax varies? e.g. "命宮" -> "命宮(四化）"
    # Let's find key ending with "(四化）"
    
    # Iterate rows
    # We need to find the column that corresponds to "SheetName(四化）"
    # But sheet syntax varies? e.g. "命宮" -> "命宮(四化）"
    # The parenthesis might be full width or half width.
    
    # Analyze the FIRST row to find the header key
    # (Assuming the first row always has the non-null header for "Intro")
    # Actually, we can just look for the key in EACH row because it's JSON list of dicts.
    
    first_row_header_key = None
    if rows:
        for k in rows[0].keys():
            if "四化" in k:
                first_row_header_key = k
                break
    
    if not first_row_header_key:
        print(f"Skipping sheet {sheet_name}: Could not find '四化' column.")
        continue
        
    print(f"Processing sheet {sheet_name} with header key '{first_row_header_key}'")

    for row in rows:
        # Use the found header key, or searching again if it varies?
        # It should be consistent within a sheet usually.
        header_val = row.get(first_row_header_key)
        
        # If not found, maybe key changed? (Unlikely)
        # Let's just fallback to search if not found
        if header_val is None:
             for k in row.keys():
                if "四化" in k and row[k]:
                    header_val = row[k]
                    break
        
        trans_type_raw = row.get("Unnamed:1")
        interpretation = row.get("Unnamed:2")
        
        if header_val:
            # New Section
            header_val = header_val.strip()
            if "生年四化" in header_val:
                current_context = "Birth"
            elif "自化" in header_val:
                current_context = "Self"
            elif "→" in header_val:
                # Expect "Source → Target"
                current_context = "Flying"
                # Parse Target
                parts = header_val.split("→")
                if len(parts) >= 2:
                    current_target_raw = parts[1].strip()
                    current_target = normalize_palace(current_target_raw)
                    current_context_target = current_target
            elif header_val == source_palace_raw:
                 # Intro section, ignore
                 current_context = "Intro"
        
        if not trans_type_raw or not interpretation:
            continue
            
        trans_type = trans_map.get(trans_type_raw)
        if not trans_type: continue
        
        interpretation = to_traditional(interpretation)
        
        if current_context == "Birth":
            ZIWEI_DATA_SIHUA_N[source_palace][trans_type] = interpretation
        
        elif current_context == "Self":
            # For Self-Trans, Target is Source (or Source Pal Name)
            # We strictly use the full name with '宮' now as key.
            ZIWEI_DATA_ZIHUA[source_palace][trans_type][source_palace] = interpretation

        elif current_context == "Flying" and current_context_target:
            target = current_context_target
            ZIWEI_DATA_P[source_palace][trans_type][target] = interpretation

# Output to file
output_js = ""
output_js += "const ZIWEI_DATA_P = " + json.dumps(ZIWEI_DATA_P, ensure_ascii=False, indent=2) + ";\n\n"
output_js += "const ZIWEI_DATA_ZIHUA = " + json.dumps(ZIWEI_DATA_ZIHUA, ensure_ascii=False, indent=2) + ";\n\n"
output_js += "const ZIWEI_DATA_SIHUA_N = " + json.dumps(ZIWEI_DATA_SIHUA_N, ensure_ascii=False, indent=2) + ";\n"

with open('assets/js/ziwei_data_P.js', 'w', encoding='utf-8') as f:
    f.write(output_js)

print("Successfully regenerated ziwei_data_P.js with all constants.")
