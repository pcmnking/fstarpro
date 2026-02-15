
/**
 * Liang Pai Flying Star Analysis Logic
 * 梁派飛星深度分析模組
 */

const LiangLogic = {
    // Helper: Determine where a specific transformation from a source stem lands
    // type: 'Lu', 'Quan', 'Ke', 'Ji' (0, 1, 2, 3)
    // Returns: The target Palace object or null
    getFlyingStarTarget: function (chart, sourceStem, transTypeIndex) {
        if (!chart.fourTransMap || !chart.fourTransMap[sourceStem]) return null;
        const starName = chart.fourTransMap[sourceStem][transTypeIndex];

        // Find which palace contains this star
        const targetBranch = Object.keys(chart.palaces).find(b =>
            chart.palaces[b].stars.includes(starName)
        );

        return targetBranch ? chart.palaces[targetBranch] : null;
    },

    // Helper: Check for Self-Transformation (Self-Ji) in a specific palace
    hasSelfTrans: function (chart, palace, typeIndex) {
        if (!palace) return false;
        const stem = palace.celestial;
        if (!chart.fourTransMap[stem]) return false;

        const starName = chart.fourTransMap[stem][typeIndex];
        // Check if the star transformed is INSIDE the palace itself
        return palace.stars.includes(starName);
    },

    // Helper: Get Palace by Title (e.g., '命宮')
    getPalaceByTitle: function (chart, title) {
        const branch = Object.keys(chart.palaces).find(b => chart.palaces[b].title === title);
        return branch ? chart.palaces[branch] : null;
    },

    // 1. 財運模組：【祿入庫】判定 (The Wealth Vault)
    analyzeWealthVault: function (chart) {
        const mingPalace = this.getPalaceByTitle(chart, '命宮');
        if (!mingPalace) return null;

        // Ming Lu -> Target
        const transLuIndex = 0; // 祿
        const targetPalace = this.getFlyingStarTarget(chart, mingPalace.celestial, transLuIndex);

        if (!targetPalace) return null;

        const isWealthVault = targetPalace.title === '田宅宮' || targetPalace.title === '兄弟宮';

        if (isWealthVault) {
            // Get Star Name for Trace
            const starName = chart.fourTransMap[mingPalace.celestial][0];

            // Check for Self-Ji in the target palace (Self-Ji = Leak)
            const hasSelfJi = this.hasSelfTrans(chart, targetPalace, 3); // 3 is Ji

            if (!hasSelfJi) {
                return {
                    title: "【財運評估】",
                    stars: "⭐⭐⭐⭐⭐",
                    result: "大富格/聚寶盆",
                    advice: "命格顯示您是天生的『築巢專家』。您對家庭與置產有極高的熱情（命祿入庫），且幸運的是您的財庫非常穩固（無自化）。建議您有錢就買房，這是您最穩賺不賠的投資，命主將畢生心力投注於置產與家庭，適合透過不動產累積豐厚財富，屬實質富有之人。",
                    reason: `命宮(${mingPalace.celestial}) ${starName}化祿 ➜ ${targetPalace.title}<br>${targetPalace.title} 無自化忌 (庫穩)`
                };
            } else {
                return {
                    title: "【財運評估】",
                    stars: "⭐⭐",
                    result: "過路財神",
                    advice: "雖有心置產或存錢（命祿入庫），但庫底有漏（該宮自化忌）。錢財易因突發狀況或過度開銷而流失。這不是你賺不到錢，而是『留不住』。建議強制儲蓄或以『定存/保險/房產信託』鎖住資金，不要讓現金留在手上。",
                    reason: `命宮(${mingPalace.celestial}) ${starName}化祿 ➜ ${targetPalace.title}<br>${targetPalace.title} 自化忌 (漏財)`
                };
            }
        }

        return null;
    },

    // 2. 精神/福德模組：【祿忌交戰】判定 (The Mental Struggle)
    analyzeMentalState: function (chart) {
        const fudePalace = this.getPalaceByTitle(chart, '福德宮');
        const mingPalace = this.getPalaceByTitle(chart, '命宮');
        if (!fudePalace || !mingPalace) return null;

        // Check Birth Year Lu/Ji in Fude
        // chart.palaces[branch].trans contains birth year trans objects {star, type}
        const hasBirthLu = fudePalace.trans.some(t => t.type === '祿');
        const hasBirthJi = fudePalace.trans.some(t => t.type === '忌');

        // Check Ming Ji -> Fude
        const mingJiTarget = this.getFlyingStarTarget(chart, mingPalace.celestial, 3); // Ji
        const mingJiInFude = mingJiTarget && mingJiTarget.name === fudePalace.name;

        // Logic A: Mental Struggle (Conflict)
        // If Fude has (Birth Lu AND Birth Ji) OR (Ming Ji into Fude finding Birth Lu)
        if ((hasBirthLu && hasBirthJi) || (mingJiInFude && hasBirthLu)) {
            let reason = "";
            if (hasBirthLu && hasBirthJi) reason = "福德宮內坐 生年祿 + 生年忌 (祿忌同宮)";
            else reason = `福德宮坐生年祿 + 命宮(${mingPalace.celestial})化忌入福德 (祿忌交戰)`;

            return {
                title: "【心靈處方】",
                stars: "⭐⭐",
                type: "祿忌交戰",
                advice: "雖然物質富足或看似樂觀，但您的內心戲非常多。福德宮的『祿忌交戰』顯示您常在『興奮』與『焦慮』中拉扯。命主大腦運轉極快，但也因此容易鑽牛角尖。您的成就是用腦力換來的，請務必學習『鈍感力』，放過自己，不要事事求完美，需注意神經系統保養與睡眠品質。",
                reason: reason
            };
        }

        // Logic B: Obsession (Ji into Fude)
        if (mingJiInFude) {
            const starName = chart.fourTransMap[mingPalace.celestial][3];
            return {
                title: "【心靈處方】",
                stars: "⭐⭐⭐",
                type: "執著煩惱",
                advice: "您容易過於執著於自己的精神世界或嗜好，命宮化忌入福德，代表『我執』於享樂或精神層面，但也容易因此自尋煩惱。易有固執己見或情緒內耗的傾向。建議多接觸大自然或宗教哲學，轉移注意焦點。",
                reason: `命宮(${mingPalace.celestial}) ${starName}化忌 ➜ 福德宮 (命忌入福德)`
            };
        }

        return null;
    },

    // 4. Advanced Insight Modules (D, E, F)
    // 4. Advanced Insight Modules (D, E, F) - NOW POWERED BY PSYCHOLOGY ENGINE
    getPsychologicalInsight: function (chart) {
        if (!window.PsychologyEngine || !window.PSYCHOLOGY_RULES) {
            console.warn("PsychologyEngine or Rules not found. Falling back to internal logic or empty.");
            return [];
        }

        const engine = new window.PsychologyEngine(chart);
        const results = engine.evaluate(window.PSYCHOLOGY_RULES);

        // Map results to the format expected by generateLiangStyleReport
        return results.map(r => {
            // Check triggers to generate a reason string
            let reasonStr = "";
            r.triggers.forEach((t, idx) => {
                if (idx > 0) reasonStr += "<br>+ ";
                if (t.type === 'fly') {
                    if (t.check_collision) reasonStr += "(沖) ";
                    // Compact format: Source化Transform入Target
                    reasonStr += `${t.source}化${t.transform}入${t.target || '...'}`;
                } else if (t.type === 'self') {
                    reasonStr += `${t.source}自化${t.transform}`;
                } else if (t.type === 'exist') {
                    reasonStr += `${t.source}坐${t.has_birth_transform}`;
                }
            });

            // Make the reason string more readable (Chinese translation)
            reasonStr = reasonStr
                .replace(/ming/g, "命宮").replace(/tian_zhai/g, "田宅宮")
                .replace(/fude/g, "福德宮").replace(/wealth/g, "財帛宮")
                .replace(/career/g, "事業宮").replace(/health/g, "疾厄宮")
                .replace(/friends/g, "交友宮").replace(/spouse/g, "夫妻宮")
                .replace(/children/g, "子女宮").replace(/brother/g, "兄弟宮")
                .replace(/migration/g, "遷移宮").replace(/parents/g, "父母宮")
                .replace(/lu/g, "祿").replace(/quan/g, "權")
                .replace(/ke/g, "科").replace(/ji/g, "忌");

            return {
                tag: r.name ? r.name.split(' (')[0] : "心理洞察", // Use name until first bracket
                insight: r.content.insight,
                advice: r.content.advice,
                reason: reasonStr
            };
        });
    },

    // 5. Yearly Fortune Analysis (Traffic Light)
    analyzeYearlyFortune: function (chart) {
        const yearBranch = chart.liuNianMingGongBranch;
        const decadeBranch = chart.daYunMingGongBranch;

        if (!yearBranch || !decadeBranch) return null;

        const yearPalace = chart.palaces[yearBranch];
        const decadePalace = chart.palaces[decadeBranch];
        const decadeStem = decadePalace.celestial;

        // 1. Overlap (Theme)
        const overlapTitle = yearPalace.title; // e.g., "田宅"
        const theme = `流年命宮 重疊 本命${overlapTitle}宮`;

        // 2. Traffic Light Logic (Decade -> Year)
        // Decade Lu and Ji stars
        if (!chart.fourTransMap[decadeStem]) return null;

        const daYunLuStar = chart.fourTransMap[decadeStem][0]; // Lu
        const daYunJiStar = chart.fourTransMap[decadeStem][3]; // Ji

        // Check where Da Yun Lu flies
        const luTargetBranch = Object.keys(chart.palaces).find(b => chart.palaces[b].stars.includes(daYunLuStar));
        const luTargetPalace = chart.palaces[luTargetBranch];

        // Check where Da Yun Ji flies
        const jiTargetBranch = Object.keys(chart.palaces).find(b => chart.palaces[b].stars.includes(daYunJiStar));
        const jiTargetPalace = chart.palaces[jiTargetBranch];

        let trafficLight = "Yellow";
        let score = 70;
        let summary = "【耕耘年】一分耕耘，一分收穫。今年運勢平穩，沒有天上掉下來的禮物，也沒有太大的坑。成敗全看你自己。適合進修、考證照、調理身體，為明年做準備。";
        let detailedAdvice = ""; // Will be populated based on overlap

        // Green Light Logic: Da Yun Lu -> Year Ming (Sit or Shine/Opposite)
        // Shine/Opposite check: Opposite branch index difference is 6
        const yearIdx = chart.branches.indexOf(yearBranch);
        const luIdx = chart.branches.indexOf(luTargetBranch);
        const isLuEnter = luTargetBranch === yearBranch;
        const isLuShine = Math.abs(yearIdx - luIdx) === 6; // Opposite

        if (isLuEnter || isLuShine) {
            trafficLight = "Green";
            score = 90;
            summary = "【衝刺年】大運氣流助攻！今年是事半功倍的一年。大限化祿進入你的流年命宮（或照），代表機會主動找上門。適合創業、求職、擴大投資。請大膽行動，不要浪費好運。";
        }

        // Red Light Logic: Da Yun Ji -> Opposite of Year Ming (Clash Year Ming)
        const jiIdx = chart.branches.indexOf(jiTargetBranch);
        const isJiClash = Math.abs(yearIdx - jiIdx) === 6;

        if (isJiClash) {
            trafficLight = "Red";
            score = 50;
            summary = "【防守年】警報響起！今年你站在大限化忌的『靶心』上。環境充滿變數與排斥力。建議『多看少做』，嚴禁重大投資、借貸或隨意離職。安分守己，保平安就是最大的獲利。";
        }

        // Special Logic: Overlap Advice
        if (overlapTitle === '財帛宮' || overlapTitle === '田宅宮') {
            detailedAdvice = trafficLight === 'Green' ?
                "今年重點在『錢』。流年重疊財庫且亮綠燈，財運極佳，投資置產獲利機率高。" :
                (trafficLight === 'Red' ? "今年重點在『錢』。流年重疊財庫但亮紅燈，務必守成，嚴禁大額投資，慎防破財。" : "今年重點在『錢』。財運平穩，宜多儲蓄。");
        } else if (overlapTitle === '夫妻宮' || overlapTitle === '子女宮' || overlapTitle === '交友宮') { // Adding Friends for broader relationship coverage
            detailedAdvice = trafficLight === 'Green' ?
                "今年重點在『情』。流年重疊桃花位且亮綠燈，單身者有良緣，人際關係順遂。" :
                (trafficLight === 'Red' ? "今年重點在『情』。流年重疊桃花位但亮紅燈，注意感情爭吵或人際是非。" : "今年重點在『情』。人際平順，多陪伴家人。");
        } else if (overlapTitle === '疾厄宮' || overlapTitle === '父母宮') { // Parents often relates to body/appearance
            detailedAdvice = trafficLight === 'Green' ?
                "今年重點在『身』。身體狀況良好，適合健身或進行健康檢查。" :
                (trafficLight === 'Red' ? "今年重點在『身』。抵抗力較弱，需留意老毛病復發或意外，請多保重。" : "今年重點在『身』。平平安安，注意作息。");
        } else {
            detailedAdvice = `流年重疊本命${overlapTitle}，今年生活重心將圍繞在該領域展開。${score >= 80 ? "吉星高照，諸事順遂。" : "步步為營，持盈保泰。"}`;
        }

        return {
            yearLabel: `流年 ${yearBranch}宮`, // Simplify as we assume branch
            theme: theme,
            trafficLight: trafficLight,
            score: score,
            summary: summary,
            detailedAdvice: detailedAdvice,
            reason: trafficLight === 'Green' ?
                `大限${decadeStem}干 ${daYunLuStar}化祿 ${(isLuEnter ? "入" : "照")} 流年命宮(${yearBranch})` :
                (trafficLight === 'Red' ?
                    `大限${decadeStem}干 ${daYunJiStar}化忌 沖 流年命宮(${yearBranch})` :
                    `大限${decadeStem}干 祿忌皆未沖照流年命宮`
                )
        };
    },


    // 6. Family Relation Mapping Module (借盤論六親 1-6-10)
    analyzeFamilyMember: function (chart, relationType) {
        // 1. Define Relative's Taiji (Mapping Table)
        const relationMap = {
            "Father": { palace: "父母宮", label: "父親" },
            "Mother": { palace: "兄弟宮", label: "母親" },
            "Spouse": { palace: "夫妻宮", label: "配偶" },
            "Child_1": { palace: "子女宮", label: "長子/長女" },
            "Child_2": { palace: "財帛宮", label: "次子/次女" },
            "Child_3": { palace: "疾厄宮", label: "三子/三女" },
            "Sibling_1": { palace: "兄弟宮", label: "長兄/長姊" },
            "Sibling_2": { palace: "夫妻宮", label: "二哥/二姊" }
        };

        const targetInfo = relationMap[relationType];
        if (!targetInfo) return null;

        const targetPalace = this.getPalaceByTitle(chart, targetInfo.palace);
        if (!targetPalace) return null;

        // 2. Perform Vital Scan ("1-6-10" Theory relative to New Ming)
        // Determine New Taiji Positions based on sequence offset
        // Standard Sequence: Ming(0), Brother(1), Spouse(2), Children(3), Wealth(4), Health(5), Migration(6), Friends(7), Career(8), Property(9), Fude(10), Parents(11)
        const palaceSequence = ['命宮', '兄弟宮', '夫妻宮', '子女宮', '財帛宮', '疾厄宮', '遷移宮', '交友宮', '事業宮', '田宅宮', '福德宮', '父母宮'];
        const startIdx = palaceSequence.indexOf(targetInfo.palace);

        // New Health (Jie) is +5 positions (1 -> 6)
        const newHealthTitle = palaceSequence[(startIdx + 5) % 12];
        const newHealthPalace = this.getPalaceByTitle(chart, newHealthTitle);

        // New Vault (Tian Zhai) is +9 positions (1 -> 10)
        const newVaultTitle = palaceSequence[(startIdx + 9) % 12];
        const newVaultPalace = this.getPalaceByTitle(chart, newVaultTitle);

        let findings = [];

        // Risk A (財庫破洞): IF [New Vault] has Self-Ji
        if (newVaultPalace && this.hasSelfTrans(chart, newVaultPalace, 3)) {
            const starJi = chart.fourTransMap[newVaultPalace.celestial][3];
            findings.push({
                icon: "💰",
                text: `庫位(${newVaultTitle})自化忌，代表${targetInfo.label}理財能力較弱，或較難存錢（財庫破洞）。`,
                reason: `${newVaultTitle}(${newVaultPalace.celestial}) ${starJi}自化忌`
            });
        }
        // Wealth Bonus: Self-Lu
        else if (newVaultPalace && this.hasSelfTrans(chart, newVaultPalace, 0)) {
            const starLu = chart.fourTransMap[newVaultPalace.celestial][0];
            findings.push({
                icon: "💰",
                text: `庫位(${newVaultTitle})自化祿，代表${targetInfo.label}現金流充裕，花錢大方。`,
                reason: `${newVaultTitle}(${newVaultPalace.celestial}) ${starLu}自化祿`
            });
        }

        // Risk B (健康/情緒): IF [New Health] has Self-Ji
        if (newHealthPalace && this.hasSelfTrans(chart, newHealthPalace, 3)) {
            const starJi = chart.fourTransMap[newHealthPalace.celestial][3];
            findings.push({
                icon: "💊",
                text: `疾厄位(${newHealthTitle})自化忌，代表${targetInfo.label}體質較弱或情緒起伏大。`,
                reason: `${newHealthTitle}(${newHealthPalace.celestial}) ${starJi}自化忌`
            });
        }

        // Risk C (與我關係): IF [New Ming] fly Ji to [Original Ming]
        const newMingJiTarget = this.getFlyingStarTarget(chart, targetPalace.celestial, 3);
        const newMingJiStar = chart.fourTransMap[targetPalace.celestial][3];
        const newMingLuTarget = this.getFlyingStarTarget(chart, targetPalace.celestial, 0);
        const newMingLuStar = chart.fourTransMap[targetPalace.celestial][0];

        if (newMingJiTarget && newMingJiTarget.title === '命宮') {
            findings.push({
                icon: "⚡",
                text: `該親屬化忌入本命，代表${targetInfo.label}會給你帶來壓力或責任（他是你的債主）。`,
                reason: `${targetInfo.label}(${targetInfo.palace}) ${newMingJiStar}化忌 入 命宮`
            });
        }
        else if (newMingJiTarget && newMingJiTarget.title === '遷移') {
            findings.push({
                icon: "⚡",
                text: `該親屬化忌沖本命，代表${targetInfo.label}與你緣分較薄或容易起衝突。`,
                reason: `${targetInfo.label}(${targetInfo.palace}) ${newMingJiStar}化忌 沖 命宮`
            });
        }

        // Lu to Me?
        if (newMingLuTarget && newMingLuTarget.title === '命宮') {
            findings.push({
                icon: "❤️",
                text: `該親屬化祿入本命，代表${targetInfo.label}對你很好，是你命中的貴人。`,
                reason: `${targetInfo.label}(${targetInfo.palace}) ${newMingLuStar}化祿 入 命宮`
            });
        }


        // Risk D (我對他好): IF [Original Ming] fly Lu to [New Ming]
        const mingPalace = this.getPalaceByTitle(chart, '命宮');
        const myLuTarget = this.getFlyingStarTarget(chart, mingPalace.celestial, 0); // Lu
        const myLuStar = chart.fourTransMap[mingPalace.celestial][0];

        if (myLuTarget && myLuTarget.title === targetInfo.palace) {
            findings.push({
                icon: "❤️",
                text: `你化祿入${targetInfo.palace}，代表你對${targetInfo.label}特別疼愛或照顧。`,
                reason: `命宮(${mingPalace.celestial}) ${myLuStar}化祿 入 ${targetInfo.palace}`
            });
        }

        // Default if empty
        if (findings.length === 0) {
            findings.push({
                icon: "✨",
                text: "關係與運勢平穩，無明顯沖剋或重大變動。",
                reason: "相關宮位無自化忌，互無忌沖"
            });
        }

        return {
            target: targetInfo.label,
            palaceUsed: targetInfo.palace,
            findings: findings
        };
    },

    // Main Report Generation Loop
    generateLiangStyleReport: function (chart) {
        let html = '<div class="liang-report-container" style="padding: 20px; background: #fff8f8; border: 1px solid #e0e0e0; border-radius: 8px; margin-top:20px;">';
        html += '<h3 style="color: #c62828; border-bottom: 2px solid #c62828; padding-bottom: 10px; margin-top: 0;">梁派飛星・深度命盤解碼</h3>';

        // 0. Yearly Fortune (Traffic Light) - NEW
        const yearlyFortune = this.analyzeYearlyFortune(chart);
        if (yearlyFortune) {
            const lightColor = yearlyFortune.trafficLight === 'Green' ? '#4caf50' : (yearlyFortune.trafficLight === 'Red' ? '#f44336' : '#ffc107');
            const lightIcon = yearlyFortune.trafficLight === 'Green' ? '🟢' : (yearlyFortune.trafficLight === 'Red' ? '🔴' : '🟡');

            html += `<div class="report-section" style="margin-bottom: 20px; border: 2px solid ${lightColor}; border-radius: 8px; padding: 15px; background-color: white;">`;
            html += `<h4 style="margin: 0 0 10px 0; color: ${lightColor}; border-bottom: 1px dashed #eee; padding-bottom: 5px;">${lightIcon} ${yearlyFortune.yearLabel} 運勢紅綠燈</h4>`;
            html += `<p style="margin: 5px 0;"><strong>年度主題：</strong>${yearlyFortune.theme}</p>`;
            html += `<p style="margin: 5px 0; font-size: 1.1em; font-weight: bold; color: #333;">${yearlyFortune.summary.split('。')[0]}。</p>`; // Title only
            html += `<p style="line-height: 1.6; color: #424242; font-size: 0.95em;">${yearlyFortune.summary}</p>`;
            html += `<div style="margin-top: 10px; padding: 10px; background: #f9f9f9; border-left: 4px solid ${lightColor}; font-size: 0.9em; color: #555;">`;
            html += `<strong>🎯 重點建議：</strong>${yearlyFortune.detailedAdvice}`;
            html += `</div>`;
            if (yearlyFortune.reason) {
                html += `<div style="margin-top:8px; padding:8px; background:#eeeeee; border-radius:4px; font-size:0.9em; color:#666;">🔍 <strong>飛化應期：</strong>${yearlyFortune.reason}</div>`;
            }
            html += `</div>`;
        }



        // 1. Wealth
        const wealthAnalysis = this.analyzeWealthVault(chart);
        if (wealthAnalysis) {
            html += `<div class="report-section" style="margin-bottom: 20px;">`;
            html += `<h4 style="margin: 10px 0; color: #d81b60;">${wealthAnalysis.title} ${wealthAnalysis.stars}</h4>`;
            html += `<p><strong>判定：</strong>${wealthAnalysis.result}</p>`;
            html += `<p style="line-height: 1.6; color: #424242;">${wealthAnalysis.advice}</p>`;
            if (wealthAnalysis.reason) {
                html += `<div style="margin-top:8px; padding:8px; background:#eeeeee; border-radius:4px; font-size:0.9em; color:#666;">🔍 <strong>飛化軌跡：</strong><br>${wealthAnalysis.reason}</div>`;
            }
            html += `</div>`;
        } else {
            // Default safe response if no specific structure found
            html += `<div class="report-section" style="margin-bottom: 20px;">`;
            html += `<h4 style="margin: 10px 0; color: #d81b60;">【財運評估】 ⭐⭐⭐</h4>`;
            html += `<p style="line-height: 1.6; color: #424242;">您的財運走勢較為平穩。建議多關注本命事業宮與財帛宮的星性互動，以專業技能穩步求財為佳。</p>`;
            html += `</div>`;
        }

        // 2. Mental
        const mentalAnalysis = this.analyzeMentalState(chart);
        if (mentalAnalysis) {
            html += `<div class="report-section" style="margin-bottom: 20px;">`;
            html += `<h4 style="margin: 10px 0; color: #5e35b1;">${mentalAnalysis.title} ${mentalAnalysis.stars}</h4>`;
            html += `<p style="line-height: 1.6; color: #424242;">${mentalAnalysis.advice}</p>`;
            if (mentalAnalysis.reason) {
                html += `<div style="margin-top:8px; padding:8px; background:#eeeeee; border-radius:4px; font-size:0.9em; color:#666;">🔍 <strong>飛化軌跡：</strong><br>${mentalAnalysis.reason}</div>`;
            }
            html += `</div>`;
        }

        // 3. Advanced Insights (D, E, F)
        const advancedInsights = this.getPsychologicalInsight(chart);
        if (advancedInsights.length > 0) {
            html += `<div class="report-section" style="margin-bottom: 10px;">`;
            html += `<h4 style="margin: 10px 0; color: #0277bd;">【深層讀心與行為建議】</h4>`;
            html += `<ul style="list-style-type: none; padding-left: 0;">`;

            advancedInsights.forEach(item => {
                html += `<li style="background: white; padding: 15px; border-radius: 6px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); margin-bottom: 15px;">`;
                html += `<strong style="color: #0277bd; display:block; margin-bottom:5px;">➤ ${item.tag}：</strong>`;
                html += `<span style="display:block; margin-bottom:8px; color:#555;">${item.insight}</span>`;
                html += `<span style="display:block; background:#e1f5fe; padding:8px; border-radius:4px; color:#01579b; font-size:0.95em;">💡 <strong>處方：</strong>${item.advice}</span>`;
                if (item.reason) {
                    html += `<div style="margin-top:8px; padding-top:8px; border-top:1px dashed #ccc; font-size:0.9em; color:#888;">🔍 <strong>軌跡：</strong>${item.reason}</div>`;
                }
                html += `</li>`;
            });

            html += `</ul>`;
            html += `</div>`;
        }

        // 4. Family Analysis (Six Relations)
        // Check typical relations
        const familyRelations = ["Spouse", "Child_1", "Father", "Mother"];
        let familyHtml = "";

        familyRelations.forEach(rel => {
            const analysis = this.analyzeFamilyMember(chart, rel);
            if (analysis && analysis.findings && analysis.findings.length > 0) {
                familyHtml += `<div style="margin-bottom:12px; padding:10px; background:#f9f9f9; border-radius:6px;">`;
                familyHtml += `<strong style="color:#00796b;">${analysis.target}</strong> <span style="font-size:0.85em; color:#888;">(借${analysis.palaceUsed}宮)</span>`;
                familyHtml += `<ul style="margin:5px 0 0 20px; padding:0; font-size:0.95em; color:#444;">`;

                analysis.findings.forEach(f => {
                    familyHtml += `<li style="margin-bottom:6px;">${f.icon} ${f.text}<br>`;
                    if (f.reason) {
                        familyHtml += `<span style="font-size:0.85em; color:#888; background-color:#eee; padding:1px 4px; border-radius:3px;">🔍 飛化：${f.reason}</span>`;
                    }
                    familyHtml += `</li>`;
                });

                familyHtml += `</ul></div>`;
            }
        });

        // Always render section now as there is consistent feedback
        if (familyHtml) {
            html += `<div class="report-section" style="margin-bottom: 20px;">`;
            html += `<h4 style="margin: 10px 0; color: #00796b;">【六親緣分掃描】</h4>`;
            html += familyHtml;
            html += `</div>`;
        }

        html += '</div>';
        return html;
    }
};

// Expose to global window
window.LiangLogic = LiangLogic;
