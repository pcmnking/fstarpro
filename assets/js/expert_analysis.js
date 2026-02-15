/**
 * Liang Pai Flying Star AI Expert Analysis Module
 * 梁派飛星 AI 實戰解盤助手
 * 
 * Core Logic:
 * 1. Wealth (Lu Flow, Vault Check, Lu follows Ji)
 * 2. Health (Clashes, Vitality, Star Variation)
 * 3. Relationship (Treat, Affairs)
 */

class ExpertAnalyst {
    constructor(chart) {
        this.chart = chart;

        // Palace Name Mapping (Index 0-11)
        // 0:Ming, 1:Brother, 2:Spouse, 3:Children, 4:Wealth, 5:Health, 
        // 6:Migration, 7:Friend, 8:Career, 9:Field, 10:Fortune, 11:Parent
        this.palaceOrder = [
            '命宮', '兄弟', '夫妻', '子女',
            '財帛', '疾厄', '遷移', '交友',
            '事業', '田宅', '福德', '父母'
        ];

        // "Me" Palaces (Real Gain) - From logic A.1
        this.mePalaces = ['命宮', '疾厄', '田宅', '事業', '財帛', '福德'];

        // "He/Other" Palaces (Passing Wealth)
        this.hePalaces = ['兄弟', '夫妻', '子女', '遷移', '交友', '父母'];
    }

    // --- Helper Functions ---

    /**
     * Get Palace Object by Name
     */
    getPalace(name) {
        // App.js chart.palaces is keyed by Branch (e.g. '子', '丑'), not Title ('命宮')
        // We need to find the branch that has the given title.
        // Assuming chart.palaces values have a .title property.
        return Object.values(this.chart.palaces).find(p => p.title === name);
    }

    /**
     * Get Opposite Palace Name
     */
    getOppositeName(name) {
        const idx = this.palaceOrder.indexOf(name);
        if (idx === -1) return null;
        const oppIdx = (idx + 6) % 12;
        return this.palaceOrder[oppIdx];
    }

    /**
     * Fly a Transformation
     * Returns the *Target Palace Object* that receives the transformation
     * @param {string} sourceName - Name of source palace (e.g. "命宮")
     * @param {string} transType - '祿', '權', '科', '忌'
     * @returns {object|null} { palace: PalaceObj, star: StarName, isSelf: boolean }
     */
    fly(sourceName, transType) {
        const sourcePalace = this.getPalace(sourceName);
        if (!sourcePalace) return null;

        const stem = sourcePalace.celestial; // e.g., '甲'
        const stars = this.chart.fourTransMap[stem]; // ['廉貞', '破軍', '武曲', '太陽']
        if (!stars) return null;

        const typeIdx = ['祿', '權', '科', '忌'].indexOf(transType);
        if (typeIdx === -1) return null;

        const transStar = stars[typeIdx];

        // Find which palace houses this star
        const targetPalace = Object.values(this.chart.palaces).find(p => p.stars.includes(transStar));

        if (!targetPalace) return null;

        return {
            palace: targetPalace,
            title: targetPalace.title,
            branch: targetPalace.name,
            star: transStar,
            isSelf: sourcePalace === targetPalace
        };
    }

    /**
     * Check if Source "Clashes" Target (Chong)
     * Definition: Source transforms Ji into Opposite of Target.
     * @param {string} sourceName 
     * @param {string} targetName 
     * @returns {boolean}
     */
    checkClash(sourceName, targetName) {
        const targetOpposite = this.getOppositeName(targetName);
        const result = this.fly(sourceName, '忌');
        if (!result) return false;
        return result.title === targetOpposite;
    }

    /**
     * Check Self-Ji (Auto-Ji)
     * Definition: Source transforms Ji into Source.
     */
    checkSelfJi(sourceName) {
        const result = this.fly(sourceName, '忌');
        return result && result.isSelf;
    }


    // --- Analysis Modules ---

    /**
     * Module A: Wealth Diagnosis
     */
    analyzeWealth() {
        let advice = [];
        let score = 0; // Simple internal score just for fun, or we can classify.

        // 1. Lu Flow (進財模式)
        // Check Ming and Wealth Lu
        ['命宮', '財帛'].forEach(source => {
            const luResult = this.fly(source, '祿');
            if (luResult) {
                const targetType = this.mePalaces.includes(luResult.title) ? "實得" : "過路財/需靠他人";
                // Only add significant messages
                if (targetType === "實得") {
                    // advice.push(`【${source}】化祿入【${luResult.title}】，財源落袋為安，屬「實得」之財。`);
                } else {
                    advice.push(`⚠️【${source}】化祿入【${luResult.title}】，此為「過路財」，容易左手進右手出，或需靠人際/配偶得財，難以此存糧。`);
                }
            }
        });

        // 2. Vault Check (庫位檢測)
        const vaults = ['田宅', '兄弟'];
        let leakyVaults = [];
        vaults.forEach(v => {
            if (this.checkSelfJi(v)) leakyVaults.push(v);
        });

        if (leakyVaults.length > 0) {
            advice.push(`💸 **財庫破洞**：${leakyVaults.join('、')} 自化忌。現金與不動產易流失，標準「左手進右手出」，建議採用定存或購房強制儲蓄，切勿手留現金。`);
        }

        // Robbery Check: Friend Ji Clashes Field or Brother
        // Clash Field = Enter Children. Clash Brother = Enter Friend.
        const friendJi = this.fly('交友', '忌');
        if (friendJi) {
            if (friendJi.title === '子女') {
                advice.push(`🚫 **投資警示**：交友宮化忌沖田宅（忌入子女）。易因朋友慫恿、錯誤合夥或不當投資導致破產。切勿輕易借錢給人或與人合夥。`);
            }
            if (friendJi.title === '交友') {
                // Friend Self-Ji -> Clashes Brother (Opposite)
                advice.push(`🚫 **損友劫財**：交友宮自化忌（沖兄弟）。朋友關係不穩，易因人際交際賠上積蓄。`);
            }
        }

        // 3. Lu Follows Ji (祿隨忌走)
        // If Ming/Wealth Lu -> Friend/Children, Check if they turn around and Clash Vault.
        ['命宮', '財帛'].forEach(source => {
            const luRes = this.fly(source, '祿');
            if (luRes && ['交友', '子女'].includes(luRes.title)) {
                // Determine which vault might be clashed
                // If Lu entered Friend, check Friend Ji.
                const nextJi = this.fly(luRes.title, '忌');
                if (nextJi) {
                    // Clash Field (Enter Child) or Clash Brother (Enter Friend)
                    let clashing = false;
                    if (luRes.title === '交友' && (nextJi.title === '子女' || nextJi.title === '交友')) clashing = true;
                    if (luRes.title === '子女' && (nextJi.title === '子女' || nextJi.title === '交友')) clashing = true;
                    // Note: Child Ji entering Child is Self-Ji (Clash Field). Child Ji entering Friend is Clash Brother.

                    if (clashing) {
                        advice.push(`💣 **投資陷阱**：你很想投入人際或合夥（${source}祿入${luRes.title}），但結果將會連本帶利賠光（轉忌沖庫）。切勿合夥！`);
                    }
                }
            }
        });

        return advice.length > 0 ? advice.join('\n\n') : "💰 財運平穩，無顯著破庫或劫財訊號。建議穩健理財。";
    }

    /**
     * Module B: Health Diagnosis
     */
    analyzeHealth() {
        let advice = [];

        // 1. Minor/Accident: Health Ji Clashes Ming OR Migration Ji Clashes Ming
        // Clash Ming = Enter Migration.
        const healthJi = this.fly('疾厄', '忌');
        const migrJi = this.fly('遷移', '忌');

        let minorWarning = false;
        if (healthJi && healthJi.title === '遷移') minorWarning = true;
        if (migrJi && migrJi.title === '遷移') minorWarning = true; // Migration Self-Ji Clashes Ming

        if (minorWarning) {
            advice.push(`🩹 **外出與情緒警訊**：近期身體微恙或易有外傷。遷移宮/疾厄宮化忌沖命，需特别注意行車安全與情緒管理，避免過勞。`);
        }

        // 2. Critical: Health/Brother Ji Clashes Brother
        // Clash Brother = Enter Friend.
        const broJi = this.fly('兄弟', '忌');
        let critical = false;

        if (healthJi && healthJi.title === '交友') critical = true;
        if (broJi && broJi.title === '交友') critical = true;

        if (critical) {
            advice.push(`🚑 **健康紅燈 (元氣耗弱)**：氣數位受沖（疾厄/兄弟忌沖兄弟）。免疫系統需大修，請務必安排精密健檢，嚴禁熬夜與過度勞累。這是身體在求救的訊號。`);
        }

        // 3. Star Variation (Same Star Lu -> Self-Ji)
        // Check Ming and Health Lu
        ['命宮', '疾厄'].forEach(source => {
            const luRes = this.fly(source, '祿');
            if (luRes) {
                // Check if the target palace transforms Ji using the SAME star
                const targetPalaceName = luRes.title;
                const targetJiRes = this.fly(targetPalaceName, '忌');

                if (targetJiRes && targetJiRes.star === luRes.star && targetJiRes.isSelf) {
                    advice.push(`💊 **包著糖衣的毒藥**：${source}化祿入${targetPalaceName}（${luRes.star}），但該宮位立刻以同星自化忌。看似健康的表象下隱藏危機，或看似好事臨門實則損身。`);
                }
            }
        });

        return advice.length > 0 ? advice.join('\n\n') : "💪 健康狀況良好，氣場穩定。";
    }

    /**
     * Module C: Love Diagnosis
     */
    analyzeLove() {
        let advice = [];

        // 1. Treatment
        const mingLu = this.fly('命宮', '祿');
        const spouseJi = this.fly('夫妻', '忌');

        if (mingLu && mingLu.title === '夫妻') {
            advice.push(`❤️ **情深意重**：命宮化祿入夫妻宮。你對配偶/伴侶非常好，願意付出，感情中你是給予的一方。`);
        }

        if (spouseJi && spouseJi.title === '遷移') { // Spouse Ji Clashes Ming (Enter Migration)
            advice.push(`💔 **對待壓力**：夫妻宮化忌沖命宮。伴侶給你較大壓力，或兩人緣分較薄，容易感到這段關係「欠債感」重，對方情緒容易影響你。`);
        }

        // 2. Affairs (Peach Blossom Check)
        // Child Ji Clashes Spouse (Enter Career) or Clashes Field (Enter Child - Self-Ji)
        const childJi = this.fly('子女', '忌');
        if (childJi) {
            if (childJi.title === '事業') {
                advice.push(`🥀 **桃花劫警示**：子女宮化忌沖夫妻宮。需防外緣（桃花/肉慾）干擾正常感情，或因性生活/子女問題導致夫妻失和。`);
            }
            if (childJi.title === '子女') { // Self-Ji Clashes Field
                advice.push(`🏚️ **家宅不安**：子女宮自化忌（沖田宅）。需防因桃花外遇導致家庭風波，或是子女難管教導致家宅不寧。`);
            }
        }

        return advice.length > 0 ? advice.join('\n\n') : "💞 感情運勢持平，順其自然發展。";
    }

    /**
     * Generate Full Report
     */
    generateReport() {
        return {
            wealth_advice: this.analyzeWealth(),
            health_warning: this.analyzeHealth(),
            love_analysis: this.analyzeLove()
        };
    }
}

// Export for usage
// If in browser environment without modules, attach to window
if (typeof window !== 'undefined') {
    window.ExpertAnalyst = ExpertAnalyst;
}
