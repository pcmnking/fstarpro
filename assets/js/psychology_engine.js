
/**
 * Liang Style Psychology Engine
 * Evaluates chart data against JSON rules.
 */

class PsychologyEngine {
    constructor(chart) {
        this.chart = chart;

        // Palace Name Mapping (English Key -> Chinese Key)
        this.palaceMap = {
            "ming": "命宮",
            "brother": "兄弟",
            "spouse": "夫妻",
            "children": "子女",
            "wealth": "財帛",
            "health": "疾厄",
            "migration": "遷移",
            "friends": "交友",
            "career": "事業",
            "tian_zhai": "田宅", // using pinyin for consistency with rules
            "fude": "福德",
            "parents": "父母"
        };

        // Transformation Mapping
        this.transMap = {
            "lu": 0,
            "quan": 1,
            "ke": 2,
            "ji": 3
        };
    }

    /**
     * Resolve English key to Palace Object
     */
    getPalace(key) {
        let chineseTitle = this.palaceMap[key.toLowerCase()];
        if (!chineseTitle) return null;

        // Find palace by title in chart
        const branchKey = Object.keys(this.chart.palaces).find(b => this.chart.palaces[b].title === chineseTitle);
        return branchKey ? this.chart.palaces[branchKey] : null;
    }

    /**
     * Check if a "Fly" condition is met
     * A -> B (Transform)
     */
    checkFly(trigger) {
        const sourcePalace = this.getPalace(trigger.source);
        if (!sourcePalace) return false;

        const transIdx = this.transMap[trigger.transform];
        if (transIdx === undefined) return false;

        // Get the star that transforms based on Source Palace Stem
        const stem = sourcePalace.celestial;
        const stars = this.chart.fourTransMap[stem];
        if (!stars) return false;

        const transStar = stars[transIdx];

        // Find which palace holds this star (Target)
        const targetBranch = Object.keys(this.chart.palaces).find(b => this.chart.palaces[b].stars.includes(transStar));
        if (!targetBranch) return false;

        const targetPalace = this.chart.palaces[targetBranch];

        // If trigger specifies a target, check match
        if (trigger.target) {
            const desiredTargetTitle = this.palaceMap[trigger.target];

            // Check Collision? (Collision usually means "Opposite Palace" or "Projected to the opposite")
            if (trigger.check_collision) {
                // Simplified Collision: In Liang Pai, Ji flying to Migration "clashes" Ming. Ji flying to Ming "enters" Ming (also bad but different technicality).
                // "Career fly Ji to Ming (Collision)" in prompt text likely means "Ji enters Ming" OR "Ji enters Migration (clashing Ming)".
                // Usually "Chong" (Collision) is strictly hitting the opposite.
                // If target is "ming", collision check implies we check if actual target is "ming" OR "migration".
                // HOWEVER, the prompt example says "Career fly Ji to Ming (Collision)". 
                // Let's implement strict target match first. If `check_collision` is true, we assume the Rule definition ALREADY pointed to the "Collision Target" OR we need to calculate the opposite.
                // Re-reading usage: "Career fly Ji to Ming (Collision)". This sounds like the EFFECT is collision, but the flight is to Ming? 
                // Actually in Flying Star, Ji to Ming is "Ji Ru". Ji to Migration is "Ji Chu" which clashes Ming.
                // But often "Chong" is loosely used.
                // Let's stick to: If trigger.target is defined, the star MUST land there.
                // If the user wants to check "Clash Ming", they should write target="migration" (implied clash) or we assume the rule writer knows.
                // But wait, the provided rule for "Misplaced Genius" says: source: "career", target: "ming", check_collision: true.
                // Code-wise, I will check if targetPalace matches desiredTargetTitle OR (if collision is checked) the opposite of desiredTargetTitle matches targetPalace.
                // Opposite of Ming is Migration. Opposite of Wealth is Fude.

                if (trigger.check_collision) {
                    // Check if target matches desired OR target matches Opposite(desired)
                    // We need a helper for opposite palace.
                    // For now, let's strictly check if the actual flight LANDS on the specific target defined in the JSON.
                    // If JSON says target="ming" and check_collision=true, maybe it means strictly landing on Ming causes the collision?
                    // Actually, let's treat target as the "Intended Victim".

                    // Simple logic: Does the flight land on 'target'?
                    if (targetPalace.title === desiredTargetTitle) return true;

                    // Does the flight land on the opposite of 'target'? (Clash)
                    // The opposite palace index differ by 6.
                    const targetIdx = this.chart.branches.indexOf(targetBranch);
                    const desiredPalaceBranch = Object.keys(this.chart.palaces).find(b => this.chart.palaces[b].title === desiredTargetTitle);
                    const desiredIdx = this.chart.branches.indexOf(desiredPalaceBranch);

                    if (Math.abs(targetIdx - desiredIdx) === 6) return true; // It is the opposite

                    return false;
                } else {
                    return targetPalace.title === desiredTargetTitle;
                }
            } else {
                return targetPalace.title === desiredTargetTitle;
            }
        }

        return true; // If no target specified, just 'flying' exists (less common requirement)
    }

    /**
     * Check Self Transformation
     * A -> A (Transform)
     */
    checkSelf(trigger) {
        const sourcePalace = this.getPalace(trigger.source);
        if (!sourcePalace) return false;

        const transIdx = this.transMap[trigger.transform];
        // Check if the star transformed is INSIDE the source palace
        const stem = sourcePalace.celestial;
        const stars = this.chart.fourTransMap[stem];
        if (!stars) return false;

        const transStar = stars[transIdx];

        return sourcePalace.stars.includes(transStar);
    }

    /**
     * Check Existence of Birth Year Transform
     */
    checkExist(trigger) {
        const sourcePalace = this.getPalace(trigger.source);
        if (!sourcePalace) return false;

        // "has_birth_transform": "lu"
        const typeChar = { "lu": "祿", "quan": "權", "ke": "科", "ji": "忌" }[trigger.has_birth_transform];
        if (!typeChar) return false;

        // Check sourcePalace.trans list
        return sourcePalace.trans.some(t => t.type === typeChar);
    }

    evaluate(rules) {
        let results = [];

        rules.forEach(rule => {
            // ALL triggers must be true
            const allMet = rule.triggers.every(trigger => {
                if (trigger.type === 'fly') return this.checkFly(trigger);
                if (trigger.type === 'self') return this.checkSelf(trigger);
                if (trigger.type === 'exist') return this.checkExist(trigger);
                return false;
            });

            if (allMet) {
                // Add trace info if needed
                results.push({
                    rule_id: rule.id,
                    name: rule.name,
                    category: rule.category,
                    severity: rule.severity,
                    content: rule.content,
                    triggers: rule.triggers // include for debug trace
                });
            }
        });

        return results;
    }
}

// Export for usage
window.PsychologyEngine = PsychologyEngine;
