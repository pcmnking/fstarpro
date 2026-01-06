
/**
 * Liang Style Flying Star - Psychological Rules
 * Defined as a global variable for ease of loading without a server/fetch.
 */

window.PSYCHOLOGY_RULES = [
    // --- Dimension 1: Wealth & Security ---
    {
        "id": "WEALTH_ANXIETY",
        "name": "焦慮型守財奴 (The Anxiety Saver)",
        "category": "wealth",
        "severity": "high",
        "triggers": [
            { "type": "fly", "source": "ming", "transform": "ji", "target": "tian_zhai" },
            { "type": "self", "source": "tian_zhai", "transform": "ji" }
        ],
        "content": {
            "insight": "你拼命想把錢抓緊，但你越在意，錢流失得越快。你的存摺就像你的安全感，永遠填不滿。你不是缺錢，你是『怕』沒錢。",
            "advice": "你的錢不能留現金，現金會讓你焦慮而亂動。請設定『自動轉帳』去繳房貸或買儲蓄險，讓錢『看不見』，你的心才會安。"
        }
    },
    {
        "id": "EMOTIONAL_SPENDER",
        "name": "情緒型消費者 (The Emotional Spender)",
        "category": "wealth",
        "severity": "medium",
        "triggers": [
            // Option A: Fude fly Ji to Finance (Collision/Entry)
            // Note: Prompt says "Fude fly Ji to Finance (Checking for clash naturally, or direct entry)"
            // We will split this into two potential distinct checks or use OR logic in engine if implied. 
            // But JSON schema "triggers" usually implies AND. The prompt says "OR" between the two main conditions.
            // I will implement this as two separate rule entries with the same content ID suffix or just one complex rule if engine supports.
            // Prompt schema says "All triggers in this array must be TRUE (AND logic)". 
            // So "OR" conditions need separate rule objects or a "group" concept. 
            // To keep it simple and robust, I will define two rules for this archetype.
            { "type": "fly", "source": "fude", "transform": "ji", "target": "wealth" }
        ],
        "content": {
            "insight": "你的消費往往不是因為『需要』，而是因為『想要撫慰情緒』。當你壓力大、空虛或不被理解時，刷卡機的聲音是你唯一的安慰劑。",
            "advice": "心情不好時，嚴禁打開購物 App。去睡覺、去運動。你的情緒漏洞，用錢是補不起來的。"
        }
    },
    {
        "id": "EMOTIONAL_SPENDER_B",
        "name": "情緒型消費者 (The Emotional Spender) - Type B",
        "category": "wealth",
        "severity": "medium",
        "triggers": [
            { "type": "fly", "source": "ming", "transform": "ji", "target": "fude" },
            { "type": "self", "source": "fude", "transform": "ji" }
        ],
        "content": {
            "insight": "你的消費往往不是因為『需要』，而是因為『想要撫慰情緒』。當你壓力大、空虛或不被理解時，刷卡機的聲音是你唯一的安慰劑。",
            "advice": "心情不好時，嚴禁打開購物 App。去睡覺、去運動。你的情緒漏洞，用錢是補不起來的。"
        }
    },
    {
        "id": "HIGH_FLOW_POOR_BROTHER",
        "name": "窮忙過路財神 (The High-Flow Poor) - Brother",
        "category": "wealth",
        "severity": "high",
        "triggers": [
            { "type": "fly", "source": "wealth", "transform": "lu", "target": "brother" },
            { "type": "self", "source": "brother", "transform": "ji" }
        ],
        "content": {
            "insight": "你看起來光鮮亮麗，現金流很大，但其實是『有流動的窮人』。你很會賺，但生活開銷總是精準地把你的收入消耗殆盡。",
            "advice": "你這輩子不能有『閒錢』。一有錢進來，馬上要變成『負債』（如買房揹房貸）。用負債來強迫把你漏掉的錢鎖住。"
        }
    },
    {
        "id": "HIGH_FLOW_POOR_TIANZHAI",
        "name": "窮忙過路財神 (The High-Flow Poor) - Property",
        "category": "wealth",
        "severity": "high",
        "triggers": [
            { "type": "fly", "source": "wealth", "transform": "lu", "target": "tian_zhai" },
            { "type": "self", "source": "tian_zhai", "transform": "ji" }
        ],
        "content": {
            "insight": "你看起來光鮮亮麗，現金流很大，但其實是『有流動的窮人』。你很會賺，但生活開銷總是精準地把你的收入消耗殆盡。",
            "advice": "你這輩子不能有『閒錢』。一有錢進來，馬上要變成『負債』（如買房揹房貸）。用負債來強迫把你漏掉的錢鎖住。"
        }
    },

    // --- Dimension 2: Relationships ---
    {
        "id": "PEOPLE_PLEASER",
        "name": "討好型人格 (The People Pleaser)",
        "category": "love",
        "severity": "medium",
        "triggers": [
            { "type": "fly", "source": "ming", "transform": "lu", "target": "friends" },
            { "type": "fly", "source": "friends", "transform": "ji", "target": "ming" } // Friends Ji to Ming
        ],
        "content": {
            "insight": "你總是習慣用『對別人好』來換取認同。但你的付出，在對方眼裡變成了理所當然。你心裡很苦，覺得沒人懂你的好。",
            "advice": "你的善良需要帶點鋒芒。停止無底線的付出，學會說『不』。那些因為你拒絕而離開的人，本來就不該留在你生命裡。"
        }
    },
    {
        "id": "CONTROLLING_LOVER_SPOUSE",
        "name": "控制狂的愛 (The Controlling Lover) - Spouse",
        "category": "love",
        "severity": "high",
        "triggers": [
            { "type": "fly", "source": "ming", "transform": "quan", "target": "spouse" },
            { "type": "fly", "source": "spouse", "transform": "ji", "target": "ming" }
        ],
        "content": {
            "insight": "你覺得你是為了他好，幫他安排一切。但在他眼裡，那不是愛，那是『控制』與『不信任』。你抓得越緊，他逃得越遠。",
            "advice": "有一種愛叫做『放手』。試著忍住不出手干預，讓他自己去撞牆。你的尊重，比你的幫忙更有價值。"
        }
    },
    {
        "id": "CONTROLLING_LOVER_CHILDREN",
        "name": "控制狂的愛 (The Controlling Lover) - Children",
        "category": "love",
        "severity": "high",
        "triggers": [
            { "type": "fly", "source": "ming", "transform": "quan", "target": "children" },
            { "type": "fly", "source": "children", "transform": "ji", "target": "ming" }
        ],
        "content": {
            "insight": "你覺得你是為了他好，幫他安排一切。但在他眼裡，那不是愛，那是『控制』與『不信任』。你抓得越緊，他逃得越遠。",
            "advice": "有一種愛叫做『放手』。試著忍住不出手干預，讓他自己去撞牆。你的尊重，比你的幫忙更有價值。"
        }
    },
    {
        "id": "KARMIC_DEBT",
        "name": "欠債型戀愛 (The Karmic Debt)",
        "category": "love",
        "severity": "high",
        "triggers": [
            { "type": "fly", "source": "spouse", "transform": "ji", "target": "ming" },
            { "type": "fly", "source": "ming", "transform": "lu", "target": "spouse" }
        ],
        "content": {
            "insight": "這是一段不對等的關係。對方是你的『業力』，你是來還債的。你明知他會讓你受傷，卻像飛蛾撲火一樣離不開。",
            "advice": "承認吧，你改變不了他。設定一個『停損點』，債還完了就要走。若離不開，就保持距離，聚少離多是唯一的解藥。"
        }
    },

    // --- Dimension 3: Career ---
    {
        "id": "MISPLACED_GENIUS_LU",
        "name": "錯位的天才 (Misplaced Genius) - Lu",
        "category": "career",
        "severity": "medium",
        "triggers": [
            { "type": "fly", "source": "career", "transform": "ji", "target": "ming", "check_collision": true }, // Collision check often implies checking collision to Ming (so Ji to Ming or Ji to Migration)
            // Prompt: Career fly Ji to Ming (Collision) -> Usually interpreted as Ji to Ming OR Ji to Migration (clashes Ming).
            // I will let the engine handle "check_collision" logic if true.
            { "type": "fly", "source": "ming", "transform": "lu", "target": "career" }
        ],
        "content": {
            "insight": "你很有才華，也很努力，但總是覺得在職場上格格不入。這不是你能力差，是你站錯了舞台。你不適合『被豢養』。",
            "advice": "別再試圖討好體制了。你需要的是『自由』。去做專業技術、接案、顧問，靠『手藝』吃飯，不要靠『職位』吃飯。"
        }
    },
    {
        "id": "MISPLACED_GENIUS_QUAN",
        "name": "錯位的天才 (Misplaced Genius) - Quan",
        "category": "career",
        "severity": "medium",
        "triggers": [
            { "type": "fly", "source": "career", "transform": "ji", "target": "ming", "check_collision": true },
            { "type": "fly", "source": "ming", "transform": "quan", "target": "career" }
        ],
        "content": {
            "insight": "你很有才華，也很努力，但總是覺得在職場上格格不入。這不是你能力差，是你站錯了舞台。你不適合『被豢養』。",
            "advice": "別再試圖討好體制了。你需要的是『自由』。去做專業技術、接案、顧問，靠『手藝』吃飯，不要靠『職位』吃飯。"
        }
    },
    {
        "id": "BURNOUT_MIMG",
        "name": "過勞社畜 (The Burnout) - To Ming",
        "category": "career",
        "severity": "high",
        "triggers": [
            { "type": "fly", "source": "career", "transform": "ji", "target": "health" },
            { "type": "fly", "source": "health", "transform": "ji", "target": "ming" }
        ],
        "content": {
            "insight": "你的工作與生活已經沒有界線了。你的身體正在幫你承擔工作的壓力。你正在透支未來的健康額度。",
            "advice": "請強制設定『下班時間』。這張盤顯示你的身體正在抗議，若不踩煞車，一場強制的『大修（生病）』即將到來。"
        }
    },
    {
        "id": "BURNOUT_CAREER",
        "name": "過勞社畜 (The Burnout) - To Career",
        "category": "career",
        "severity": "high",
        "triggers": [
            { "type": "fly", "source": "career", "transform": "ji", "target": "health" },
            { "type": "fly", "source": "health", "transform": "ji", "target": "career" }
        ],
        "content": {
            "insight": "你的工作與生活已經沒有界線了。你的身體正在幫你承擔工作的壓力。你正在透支未來的健康額度。",
            "advice": "請強制設定『下班時間』。這張盤顯示你的身體正在抗議，若不踩煞車，一場強制的『大修（生病）』即將到來。"
        }
    },

    // --- Dimension 4: Self & Mind ---
    {
        "id": "OVERTHINKER",
        "name": "完美主義者的糾結 (The Overthinker)",
        "category": "self",
        "severity": "medium",
        "triggers": [
            { "type": "fly", "source": "ming", "transform": "ji", "target": "fude" },
            { "type": "exist", "has_birth_transform": "lu", "source": "fude" } // "Fude has Birth-Year-Lu" - source is implied context for 'exist', but schema said 'triggers' array. I'll use 'source' to specify checking Fude.
        ],
        "content": {
            "insight": "你非常聰明，但這也是你的詛咒。你明明已經做得很好，但你總會找到一個點來否定自己。你在腦海裡演練了無數種失敗的可能。",
            "advice": "放過自己吧。這個世界沒有完美。你的焦慮不是因為做得不夠好，而是因為你腦袋轉太快。去接觸大自然，讓大腦強迫關機。"
        }
    },
    {
        "id": "MASKED_LONER_LU",
        "name": "面具人 (The Masked Loner) - Lu",
        "category": "self",
        "severity": "medium",
        "triggers": [
            // "Migration has Birth-Lu OR Birth-Quan" AND "Ming has Birth-Ji"
            // Split into two rules logic again
            { "type": "exist", "has_birth_transform": "lu", "source": "migration" },
            { "type": "exist", "has_birth_transform": "ji", "source": "ming" }
        ],
        "content": {
            "insight": "在別人眼裡你自信、陽光、能力強。但只有你自己知道，深夜獨處時那種深深的孤獨感與自我懷疑。你戴著面具活得很累。",
            "advice": "試著在信任的人面前展現你的『脆弱』。不需要時時刻刻都當超人。被看見脆弱，才是真正療癒的開始。"
        }
    },
    {
        "id": "MASKED_LONER_QUAN",
        "name": "面具人 (The Masked Loner) - Quan",
        "category": "self",
        "severity": "medium",
        "triggers": [
            { "type": "exist", "has_birth_transform": "quan", "source": "migration" },
            { "type": "exist", "has_birth_transform": "ji", "source": "ming" }
        ],
        "content": {
            "insight": "在別人眼裡你自信、陽光、能力強。但只有你自己知道，深夜獨處時那種深深的孤獨感與自我懷疑。你戴著面具活得很累。",
            "advice": "試著在信任的人面前展現你的『脆弱』。不需要時時刻刻都當超人。被看見脆弱，才是真正療癒的開始。"
        }
    },

    // --- Dimension 5: Karma ---
    {
        "id": "TROJAN_HORSE",
        "name": "引狼入室 (The Trojan Horse)",
        "category": "karma",
        "severity": "high",
        "triggers": [
            { "type": "fly", "source": "friends", "transform": "lu", "target": "ming" },
            { "type": "fly", "source": "friends", "transform": "ji", "target": "tian_zhai" }
        ],
        "content": {
            "insight": "這叫做『包著糖衣的毒藥』。看起來是貴人帶財路給你，或者朋友對你極好，但最終的結果是他會影響你的身家財產。",
            "advice": "這個朋友可以吃喝玩樂，但絕對不能有金錢往來。一旦涉及投資或借貸，連朋友都做不成，還會賠上家底。"
        }
    }
];
