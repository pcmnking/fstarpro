
/**
 * Zi Wei Dou Shu Chart Logic
 */

class Palace {
    constructor(branchName) {
        this.name = branchName; // e.g., '子', '丑'
        this.celestial = '';    // e.g., '甲'
        this.stars = [];        // List of star names
        this.trans = [];        // Four transformations: {star, type}
        this.title = '';        // Palace Name (Ming, Brothers, etc.)
        this.isMing = false;
        this.isZiwei = false; // Location of Zi Wei Star
    }

    setCelestial(stem) {
        this.celestial = stem;
    }

    addStar(starName) {
        if (!this.stars.includes(starName)) {
            this.stars.push(starName);
        }
    }

    addTrans(starName, type) {
        // type is '禄', '权', '科', '忌'
        this.trans.push({ star: starName, type: type });
    }

    reset() {
        this.stars = [];
        this.trans = [];
        this.title = '';
        this.isMing = false;
        this.isZiwei = false;
        this.celestial = '';
    }
}

class ZiWeiChart {
    constructor() {
        this.stems = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];
        this.branches = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];
        this.palaces = {};
        this.interpretations = null; // Store loaded JSON data

        // Initialize 12 palaces
        this.branches.forEach(b => {
            this.palaces[b] = new Palace(b);
        });

        // Rules for Zi Wei Series (Relative to Zi Wei position)
        this.ziweiSeries = [
            { name: '紫微', offset: 0 },
            { name: '天機', offset: -1 },
            { name: '太陽', offset: -3 },
            { name: '武曲', offset: -4 },
            { name: '天同', offset: -5 },
            { name: '廉貞', offset: -8 }
        ];

        // Tien Fu Series (Relative to Tien Fu position)
        this.tianfuSeries = [
            { name: '天府', offset: 0 },
            { name: '太陰', offset: 1 },
            { name: '貪狼', offset: 2 },
            { name: '巨門', offset: 3 },
            { name: '天相', offset: 4 },
            { name: '天梁', offset: 5 },
            { name: '七殺', offset: 6 },
            { name: '破軍', offset: 10 }
        ];

        // Four Transformations Map (Star that transforms)
        this.fourTransMap = {
            '甲': ['廉貞', '破軍', '武曲', '太陽'],
            '乙': ['天機', '天梁', '紫微', '太陰'],
            '丙': ['天同', '天機', '文昌', '廉貞'],
            '丁': ['太陰', '天同', '天機', '巨門'],
            '戊': ['貪狼', '太陰', '右弼', '天機'],
            '己': ['武曲', '貪狼', '天梁', '文曲'],
            '庚': ['太陽', '武曲', '太陰', '天同'],
            '辛': ['巨門', '太陽', '文曲', '文昌'],
            '壬': ['天梁', '紫微', '左輔', '武曲'],
            '癸': ['破軍', '巨門', '太陰', '貪狼']
        };

        // Trans Types
        this.transTypes = ['祿', '權', '科', '忌'];

        // 12 Palace Names (Counter-Clockwise from Ming)
        // Internal App Names
        this.palaceNames = [
            '命宮', '兄弟宮', '夫妻宮', '子女宮',
            '財帛宮', '疾厄宮', '遷移宮', '交友宮',
            '事業宮', '田宅宮', '福德宮', '父母宮'
        ];
    }

    _getIndex(branch) {
        return this.branches.indexOf(branch);
    }

    _getBranch(index) {
        return this.branches[(index + 12) % 12];
    }

    reset() {
        Object.values(this.palaces).forEach(p => p.reset());
    }

    // Load interpretations from global object (from interpretations.js)
    loadInterpretations() {
        if (typeof ZIWEI_DATA_P !== 'undefined') {
            this.interpretations = ZIWEI_DATA_P;
            console.log('Interpretations loaded from global ZIWEI_DATA_P');
        } else if (typeof ZIWEI_DATA !== 'undefined') {
            this.interpretations = ZIWEI_DATA;
            console.log('Interpretations loaded from global ZIWEI_DATA');
        } else {
            console.warn('ZIWEI_DATA_P nor ZIWEI_DATA found. Make sure ziwei_data_P.js is loaded.');
            this.interpretations = {};
        }
    }

    // Helper to get text
    getInterpretation(sourceTitle, transType, targetTitle) {
        if (!this.interpretations || Object.keys(this.interpretations).length === 0) return '(正在讀取象義資料...)';

        // Helper to find key match (Try exact, then +宮, then -宮)
        const findKey = (obj, key) => {
            if (!obj) return null;
            if (obj[key]) return key;
            if (obj[key + '宮']) return key + '宮';
            if (key.endsWith('宮') && obj[key.slice(0, -1)]) return key.slice(0, -1);
            return null;
        };

        // 1. Find Source Key
        const sourceKey = findKey(this.interpretations, sourceTitle);
        if (sourceKey) {
            const sourceObj = this.interpretations[sourceKey];
            const transObj = sourceObj[transType];

            if (transObj) {
                // 2. Find Target Key
                const targetKey = findKey(transObj, targetTitle);
                if (targetKey) {
                    return transObj[targetKey];
                }
            }
        }

        return '(暫無此象義)';
    }


    calculate(yinStem, mingBranch, ziweiBranch, birthStem, wenqu, wenchang, zuofu, youbi) {
        this.reset();
        this.birthStem = birthStem;

        // 1. Set Ming Palace
        this.palaces[mingBranch].isMing = true;

        // Set 12 Palace Titles (Counter-Clockwise)
        let mingIndex = this._getIndex(mingBranch);
        this.palaceNames.forEach((name, i) => {
            let targetIdx = (mingIndex - i) % 12;
            if (targetIdx < 0) targetIdx += 12;

            let targetBranch = this._getBranch(targetIdx);
            this.palaces[targetBranch].title = name;
        });

        // 2. Set Palace Stems (Based on Yin Stem)
        let yinPalaceIndex = this._getIndex('寅');
        let startStemIndex = this.stems.indexOf(yinStem);

        for (let i = 0; i < 12; i++) {
            let currentPalaceIdx = (yinPalaceIndex + i) % 12;
            let currentStemIdx = (startStemIndex + i) % 10;

            let palaceName = this._getBranch(currentPalaceIdx);
            let stemName = this.stems[currentStemIdx];

            this.palaces[palaceName].setCelestial(stemName);
        }

        // 3. Place Zi Wei Series
        let ziweiIndex = this._getIndex(ziweiBranch);
        this.palaces[ziweiBranch].isZiwei = true;

        this.ziweiSeries.forEach(star => {
            let targetIdx = (ziweiIndex + star.offset) % 12;
            if (targetIdx < 0) targetIdx += 12;
            let targetBranch = this._getBranch(targetIdx);
            this.palaces[targetBranch].addStar(star.name);
        });

        // 4. Place Tian Fu Series
        let tianfuIndex = (4 - ziweiIndex + 12) % 12;

        this.tianfuSeries.forEach(star => {
            let targetIdx = (tianfuIndex + star.offset) % 12;
            let targetBranch = this._getBranch(targetIdx);
            this.palaces[targetBranch].addStar(star.name);
        });

        // 5. Manual Star Placement (Must be before Four Transformations)
        if (wenqu) this.palaces[wenqu].addStar('文曲');
        if (wenchang) this.palaces[wenchang].addStar('文昌');
        if (zuofu) this.palaces[zuofu].addStar('左輔');
        if (youbi) this.palaces[youbi].addStar('右弼');

        // 6. Calculate Four Transformations (Birth Year)
        let triggerStem = this.birthStem;
        let transStars = this.fourTransMap[triggerStem];
        if (transStars) {
            transStars.forEach((starName, idx) => {
                let type = this.transTypes[idx];
                Object.values(this.palaces).forEach(p => {
                    if (p.stars.includes(starName)) {
                        p.addTrans(starName, type);
                    }
                });
            });
        }
    }

    getTransSummary() {
        let triggerStem = this.birthStem;
        let transStars = this.fourTransMap[triggerStem];

        let result = [];
        if (transStars) {
            transStars.forEach((star, idx) => {
                result.push({
                    type: this.transTypes[idx],
                    star: star,
                    stem: triggerStem
                });
            });
        }
        return result;
    }
}

// UI Controller
document.addEventListener('DOMContentLoaded', () => {
    const chart = new ZiWeiChart();

    // Load Interpretations immediately (Synchronous variable check)
    chart.loadInterpretations();

    const ui = {
        birthStem: document.getElementById('birth_stem'),
        yinStem: document.getElementById('yin_stem'),
        mingPos: document.getElementById('ming_position'),
        ziweiPos: document.getElementById('ziwei_position'),
        wenquPos: document.getElementById('wenqu_position'),
        wenchangPos: document.getElementById('wenchang_position'),
        zuofuPos: document.getElementById('zuofu_position'),
        youbiPos: document.getElementById('youbi_position'),
        resetBtn: document.getElementById('resetBtn'),
        chartContainer: document.getElementById('chartContainer'),
        analysisContainer: document.getElementById('interaction-analysis'),
        transContainer: document.getElementById('four-trans'),
        allTransContainer: document.getElementById('all-12-trans'),
        dayunPos: document.getElementById('dayun_position'),
        liunianPos: document.getElementById('liunian_position'),
        palaceCheckboxes: document.getElementById('palace-checkboxes'),
        selectAllBtn: document.getElementById('selectAllPalaces'),
        deselectAllBtn: document.getElementById('deselectAllPalaces'),
        clearArrowsBtn: document.getElementById('clearArrowsBtn'),
        oppositeTransBtn: document.getElementById('oppositeTransBtn')
    };

    let showOppositeArrows = false; // Toggle for opposite palace flying stars

    let activeSourceBranches = new Set(); // Track the specific clicked palace branches
    let activeTargetStars = new Set(); // Track the clicked stars for incoming transformations

    // Track selected palaces for filtering (default: all selected)
    let selectedPalaces = new Set(chart.palaceNames);

    // Populate Palace Filter Checkboxes
    function initializePalaceFilter() {
        if (!ui.palaceCheckboxes) return;

        let checkboxHtml = '';
        chart.palaceNames.forEach(palaceName => {
            checkboxHtml += `
                <label style="display: flex; align-items: center; gap: 6px; cursor: pointer; padding: 6px; border-radius: 4px; transition: background-color 0.2s;">
                    <input type="checkbox" class="palace-filter-checkbox" value="${palaceName}" checked style="cursor: pointer;">
                    <span style="font-size: 0.95em;">${palaceName}</span>
                </label>
            `;
        });
        ui.palaceCheckboxes.innerHTML = checkboxHtml;

        // Add event listeners to checkboxes
        document.querySelectorAll('.palace-filter-checkbox').forEach(checkbox => {
            checkbox.addEventListener('change', (e) => {
                if (e.target.checked) {
                    selectedPalaces.add(e.target.value);
                } else {
                    selectedPalaces.delete(e.target.value);
                }
                render(); // Re-render to apply filter
            });
        });
    }

    // Select All Palaces
    if (ui.selectAllBtn) {
        ui.selectAllBtn.addEventListener('click', () => {
            selectedPalaces = new Set(chart.palaceNames);
            document.querySelectorAll('.palace-filter-checkbox').forEach(cb => {
                cb.checked = true;
            });
            render();
        });
    }

    // Deselect All Palaces
    if (ui.deselectAllBtn) {
        ui.deselectAllBtn.addEventListener('click', () => {
            selectedPalaces.clear();
            document.querySelectorAll('.palace-filter-checkbox').forEach(cb => {
                cb.checked = false;
            });
            render();
        });
    }

    // Populate Selects
    chart.stems.forEach(s => {
        let optYin = new Option(`寅宮天干 ${s}`, s);
        ui.yinStem.add(optYin);

        let optBirth = new Option(`出生年天干 ${s}`, s);
        ui.birthStem.add(optBirth);
    });

    chart.branches.forEach(b => {
        let optMing = new Option(`命宮在 ${b}`, b);
        ui.mingPos.add(optMing);

        let optZiwei = new Option(`紫微在 ${b}`, b);
        ui.ziweiPos.add(optZiwei);

        let optWenqu = new Option(`文曲在 ${b}`, b);
        ui.wenquPos.add(optWenqu);
        let optWenchang = new Option(`文昌在 ${b}`, b);
        ui.wenchangPos.add(optWenchang);
        let optZuofu = new Option(`左輔在 ${b}`, b);
        ui.zuofuPos.add(optZuofu);
        let optYoubi = new Option(`右弼在 ${b}`, b);
        ui.youbiPos.add(optYoubi);

        let optDayun = new Option(`${b}`, b);
        ui.dayunPos.add(optDayun);
        let optLiunian = new Option(`${b}`, b);
        ui.liunianPos.add(optLiunian);
    });

    // Load parameters from URL or set defaults
    function loadFromURL() {
        const params = new URLSearchParams(window.location.search);

        // Helper to get param or default
        const getParam = (key, defaultValue) => params.get(key) || defaultValue;

        ui.birthStem.value = getParam('birth', '甲');
        ui.yinStem.value = getParam('yin', '甲');
        ui.mingPos.value = getParam('ming', '寅');
        ui.ziweiPos.value = getParam('ziwei', '午');
        ui.wenquPos.value = getParam('wenqu', '辰');
        ui.wenchangPos.value = getParam('wenchang', '戌');
        ui.zuofuPos.value = getParam('zuofu', '辰');
        ui.youbiPos.value = getParam('youbi', '戌');
        ui.dayunPos.value = getParam('dayun', '');
        ui.liunianPos.value = getParam('liunian', '');
    }

    // Update URL when parameters change
    function updateURL() {
        const params = new URLSearchParams();

        params.set('birth', ui.birthStem.value);
        params.set('yin', ui.yinStem.value);
        params.set('ming', ui.mingPos.value);
        params.set('ziwei', ui.ziweiPos.value);
        params.set('wenqu', ui.wenquPos.value);
        params.set('wenchang', ui.wenchangPos.value);
        params.set('zuofu', ui.zuofuPos.value);
        params.set('youbi', ui.youbiPos.value);

        if (ui.dayunPos.value) params.set('dayun', ui.dayunPos.value);
        if (ui.liunianPos.value) params.set('liunian', ui.liunianPos.value);

        const newURL = `${window.location.pathname}?${params.toString()}`;
        window.history.replaceState({}, '', newURL);
    }

    // Load from URL
    loadFromURL();

    // Helper to get palace center coordinates
    function getPalaceCenter(branch) {
        const palaceDiv = document.querySelector(`.palace[data-branch="${branch}"]`);
        if (!palaceDiv) return null;

        const chartGrid = document.querySelector('.chart-grid');
        if (!chartGrid) return null;

        const rect = palaceDiv.getBoundingClientRect();
        const containerRect = chartGrid.getBoundingClientRect();

        return {
            x: rect.left + rect.width / 2 - containerRect.left,
            y: rect.top + rect.height / 2 - containerRect.top
        };
    }

    // Helper to draw specific arrow path
    function drawArrowPath(svg, sourcePos, targetPos, typeClass, offsetIndex) {
        // Calculate direct path
        const dx = targetPos.x - sourcePos.x;
        const dy = targetPos.y - sourcePos.y;

        // Shorten the arrow to not overlap with palace borders
        const shortenFactor = 0.9;
        const adjustedTargetX = sourcePos.x + dx * shortenFactor;
        const adjustedTargetY = sourcePos.y + dy * shortenFactor;

        // Create straight path
        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        const pathData = `M ${sourcePos.x} ${sourcePos.y} L ${adjustedTargetX} ${adjustedTargetY}`;
        path.setAttribute('d', pathData);
        path.setAttribute('class', `arrow-${typeClass}`);

        const type = typeClass.replace('arrow-', '');
        const colorMap = { 'lu': '#d32f2f', 'quan': '#388e3c', 'ke': '#1976d2', 'ji': '#7b1fa2' };
        path.setAttribute('stroke', colorMap[type]);
        path.setAttribute('fill', 'none');
        path.setAttribute('stroke-width', '3');
        path.setAttribute('stroke-linecap', 'round');
        path.setAttribute('marker-end', `url(#arrowhead-${type})`);
        svg.appendChild(path);

        // Add text label
        const midX = (sourcePos.x + adjustedTargetX) / 2;
        const midY = (sourcePos.y + adjustedTargetY) / 2;
        const label = type === 'lu' ? '祿' : (type === 'quan' ? '權' : (type === 'ke' ? '科' : '忌'));
        
        // Background for text to make it readable
        const textBg = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        textBg.setAttribute('cx', midX);
        textBg.setAttribute('cy', midY);
        textBg.setAttribute('r', '10');
        textBg.setAttribute('fill', 'white');
        textBg.setAttribute('fill-opacity', '0.8');
        svg.appendChild(textBg);

        const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        text.setAttribute('x', midX);
        text.setAttribute('y', midY);
        text.setAttribute('text-anchor', 'middle');
        text.setAttribute('dominant-baseline', 'central');
        text.setAttribute('class', 'arrow-text-label');
        text.setAttribute('fill', colorMap[type]);
        text.textContent = label;
        svg.appendChild(text);
    }

    // Helper to draw solid arrow path for Opposite Palace Flying
    function drawSolidArrowPath(svg, sourcePos, targetPos, typeClass, offsetIndex) {
        const dx = targetPos.x - sourcePos.x;
        const dy = targetPos.y - sourcePos.y;

        // Straight line for opposite palace
        const adjustedTargetX = sourcePos.x + dx * 0.9;
        const adjustedTargetY = sourcePos.y + dy * 0.9;

        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        const pathData = `M ${sourcePos.x} ${sourcePos.y} L ${adjustedTargetX} ${adjustedTargetY}`;
        path.setAttribute('d', pathData);
        path.setAttribute('class', `arrow-opposite-${typeClass}`);

        const type = typeClass.replace('arrow-', '');
        const colorMap = { 'lu': '#d32f2f', 'quan': '#388e3c', 'ke': '#1976d2', 'ji': '#7b1fa2' };
        path.setAttribute('stroke', colorMap[type]);
        path.setAttribute('fill', 'none');
        path.setAttribute('stroke-width', '4');
        path.setAttribute('stroke-linecap', 'round');
        path.setAttribute('marker-end', `url(#arrowhead-${type})`);
        svg.appendChild(path);

        // Add text label
        const midX = (sourcePos.x + adjustedTargetX) / 2;
        const midY = (sourcePos.y + adjustedTargetY) / 2;
        const label = type === 'lu' ? '祿' : (type === 'quan' ? '權' : (type === 'ke' ? '科' : '忌'));
        
        const textBg = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        textBg.setAttribute('cx', midX);
        textBg.setAttribute('cy', midY);
        textBg.setAttribute('r', '10');
        textBg.setAttribute('fill', 'white');
        textBg.setAttribute('fill-opacity', '0.9');
        svg.appendChild(textBg);

        const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        text.setAttribute('x', midX);
        text.setAttribute('y', midY);
        text.setAttribute('text-anchor', 'middle');
        text.setAttribute('dominant-baseline', 'central');
        text.setAttribute('class', 'arrow-text-label');
        text.setAttribute('fill', colorMap[type]);
        text.textContent = label;
        svg.appendChild(text);
    }

    // Helper function to draw transformation arrows
    function drawTransformationArrows(sourceBranch) {
        const arrowContainer = document.getElementById('arrow-container');
        if (!arrowContainer) return;

        // --- Marker Initialization (Ensure SVG and Arrowheads exist) ---
        let svg = arrowContainer.querySelector('svg');
        if (!svg) {
            svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
            svg.setAttribute('viewBox', '0 0 600 880');
            svg.setAttribute('width', '100%');
            svg.setAttribute('height', '100%');
            svg.style.position = 'absolute';
            svg.style.top = '0';
            svg.style.left = '0';
            svg.style.pointerEvents = 'none';
            svg.style.overflow = 'visible';
            arrowContainer.appendChild(svg);
        }

        let defs = svg.querySelector('defs');
        if (!defs) {
            defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
            const colors = { 'lu': '#d32f2f', 'quan': '#388e3c', 'ke': '#1976d2', 'ji': '#7b1fa2' };
            Object.keys(colors).forEach(type => {
                const marker = document.createElementNS('http://www.w3.org/2000/svg', 'marker');
                marker.setAttribute('id', `arrowhead-${type}`);
                marker.setAttribute('markerWidth', '10');
                marker.setAttribute('markerHeight', '10');
                marker.setAttribute('refX', '9');
                marker.setAttribute('refY', '3');
                marker.setAttribute('orient', 'auto');

                const polygon = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
                polygon.setAttribute('points', '0 0, 10 3, 0 6');
                polygon.setAttribute('fill', colors[type]);

                marker.appendChild(polygon);
                defs.appendChild(marker);
            });
            svg.appendChild(defs);
        }

        if (!sourceBranch) return; // Exit after initialization if no branch provided

        const sourcePalace = chart.palaces[sourceBranch];
        if (!sourcePalace) return;
        const activeStem = sourcePalace.celestial;
        const activeTransStars = chart.fourTransMap[activeStem];
        if (!activeTransStars) return;

        const sourcePos = getPalaceCenter(sourceBranch);
        if (!sourcePos) return;

        const types = ['祿', '權', '科', '忌'];
        const typeClasses = ['lu', 'quan', 'ke', 'ji'];

        // Draw arrows for each transformation
        activeTransStars.forEach((star, idx) => {
            const type = chart.transTypes[idx];
            const typeClass = typeClasses[idx];

            // Find target palace
            const targetPalace = Object.values(chart.palaces).find(p => p.stars.includes(star));
            if (!targetPalace) return;

            const targetBranch = Object.keys(chart.palaces).find(key => chart.palaces[key] === targetPalace);
            if (!targetBranch) return;

            const targetPos = getPalaceCenter(targetBranch);
            if (!targetPos) return;

            drawArrowPath(svg, sourcePos, targetPos, typeClass, idx);
        });
    }

    // Helper function to draw opposite palace transformation arrows (solid lines)
    function drawOppositeTransformationArrows() {
        const arrowContainer = document.getElementById('arrow-container');
        if (!arrowContainer) return;

        // Ensure SVG and markers are initialized
        drawTransformationArrows(''); 
        let svg = arrowContainer.querySelector('svg');
        if (!svg) {
            console.error("Failed to initialize SVG for opposite arrows");
            return;
        }

        console.log("Start drawing opposite palace arrows...");
        let count = 0;
        Object.keys(chart.palaces).forEach(sourceBranch => {
            const sourcePalace = chart.palaces[sourceBranch];
            const sourceStem = sourcePalace.celestial;
            const transStars = chart.fourTransMap[sourceStem];
            if (!transStars) return;

            // Find opposite branch index
            const sourceIdx = chart._getIndex(sourceBranch);
            const oppositeIdx = (sourceIdx + 6) % 12;
            const oppositeBranch = chart._getBranch(oppositeIdx);
            const oppositePalace = chart.palaces[oppositeBranch];

            const sourcePos = getPalaceCenter(sourceBranch);
            const targetPos = getPalaceCenter(oppositeBranch);

            if (!sourcePos || !targetPos) {
                console.warn(`Could not find coordinates for ${sourceBranch} or ${oppositeBranch}`);
                return;
            }

            const typeClasses = ['lu', 'quan', 'ke', 'ji'];

            transStars.forEach((star, idx) => {
                // Only Lu (0) and Ji (3) - Usually used for Opposite Flying
                if (idx !== 0 && idx !== 3) return;

                if (oppositePalace.stars.includes(star)) {
                    count++;
                    drawSolidArrowPath(svg, sourcePos, targetPos, typeClasses[idx], idx);
                }
            });
        });
        console.log(`Opposite arrows drawn: ${count}`);
    }

    // Helper function to draw incoming transformation arrows
    function drawIncomingTransformationArrows(targetStarName) {
        const arrowContainer = document.getElementById('arrow-container');
        if (!arrowContainer) return;

        // Ensure SVG exists (create if not by calling drawTransformationArrows with dummy or manual check)
        // Reuse logic by checking if SVG exists, if not create it.
        let svg = arrowContainer.querySelector('svg');
        if (!svg) {
            // Basic SVG setup if not already created - ensure correct viewBox
            svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
            svg.setAttribute('viewBox', '0 0 600 880');
            svg.setAttribute('width', '100%');
            svg.setAttribute('height', '100%');
            svg.style.position = 'absolute';
            svg.style.top = '0';
            svg.style.left = '0';
            svg.style.pointerEvents = 'none';
            arrowContainer.appendChild(svg);

            const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
            const colors = { '祿': '#d32f2f', '權': '#388e3c', '科': '#1976d2', '忌': '#7b1fa2' };
            const types = ['祿', '權', '科', '忌'];
            const typeClasses = ['lu', 'quan', 'ke', 'ji'];
            types.forEach((type, idx) => {
                const marker = document.createElementNS('http://www.w3.org/2000/svg', 'marker');
                marker.setAttribute('id', `arrowhead-${typeClasses[idx]}`);
                marker.setAttribute('markerWidth', '10');
                marker.setAttribute('markerHeight', '10');
                marker.setAttribute('refX', '9');
                marker.setAttribute('refY', '3');
                marker.setAttribute('orient', 'auto');
                const polygon = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
                polygon.setAttribute('points', '0 0, 10 3, 0 6');
                polygon.setAttribute('fill', colors[type]);
                marker.appendChild(polygon);
                defs.appendChild(marker);
            });
            svg.appendChild(defs);
        }

        // Find Target Palace
        const targetPalace = Object.values(chart.palaces).find(p => p.stars.includes(targetStarName));
        if (!targetPalace) return;
        const targetBranch = Object.keys(chart.palaces).find(key => chart.palaces[key] === targetPalace);
        const targetPos = getPalaceCenter(targetBranch);
        if (!targetPos) return;

        // Iterate all palaces to find sources
        Object.keys(chart.palaces).forEach(sourceBranch => {
            const sourcePalace = chart.palaces[sourceBranch];
            const stem = sourcePalace.celestial;
            const transStars = chart.fourTransMap[stem];

            if (transStars) {
                const starIdx = transStars.indexOf(targetStarName);
                if (starIdx !== -1) {
                    // This palace transforms to the target star!
                    const typeClasses = ['lu', 'quan', 'ke', 'ji'];
                    const typeClass = typeClasses[starIdx]; // 0=Lu, 1=Quan...

                    const sourcePos = getPalaceCenter(sourceBranch);
                    if (sourcePos) {
                        drawArrowPath(svg, sourcePos, targetPos, typeClass, starIdx);
                    }
                }
            }
        });
    }

    // Helper function to find matching palace names between transformations and palace titles
    function getMatchingPalaceNames() {
        const matches = {
            dayun: new Set(),
            liunian: new Set()
        };

        // Check Da Yun transformations
        if (ui.dayunPos.value) {
            const dayunMingIdx = chart._getIndex(ui.dayunPos.value);

            // For each palace in Da Yun layer
            for (let i = 0; i < 12; i++) {
                let targetIdx = (dayunMingIdx - i) % 12;
                if (targetIdx < 0) targetIdx += 12;
                let currentBranch = chart._getBranch(targetIdx);
                let pObj = chart.palaces[currentBranch];
                let stem = pObj.celestial;
                let sourcePalaceName = chart.palaceNames[i]; // e.g., '命宮', '兄弟'

                // Get transformation stars for this stem
                let transStars = chart.fourTransMap[stem];
                if (transStars) {
                    transStars.forEach((star) => {
                        // Find which palace this star is in
                        const targetPalaceObj = Object.values(chart.palaces).find(obj => obj.stars.includes(star));
                        if (targetPalaceObj) {
                            const targetPalaceName = targetPalaceObj.title;
                            // If source and target palace names match
                            if (sourcePalaceName === targetPalaceName) {
                                matches.dayun.add(sourcePalaceName);
                            }
                        }
                    });
                }
            }
        }

        // Check Liu Nian transformations
        if (ui.liunianPos.value) {
            const liunianMingIdx = chart._getIndex(ui.liunianPos.value);

            // For each palace in Liu Nian layer
            for (let i = 0; i < 12; i++) {
                let targetIdx = (liunianMingIdx - i) % 12;
                if (targetIdx < 0) targetIdx += 12;
                let currentBranch = chart._getBranch(targetIdx);
                let pObj = chart.palaces[currentBranch];
                let stem = pObj.celestial;
                let sourcePalaceName = chart.palaceNames[i];

                // Get transformation stars for this stem
                let transStars = chart.fourTransMap[stem];
                if (transStars) {
                    transStars.forEach((star) => {
                        // Find which palace this star is in
                        const targetPalaceObj = Object.values(chart.palaces).find(obj => obj.stars.includes(star));
                        if (targetPalaceObj) {
                            const targetPalaceName = targetPalaceObj.title;
                            // If source and target palace names match
                            if (sourcePalaceName === targetPalaceName) {
                                matches.liunian.add(sourcePalaceName);
                            }
                        }
                    });
                }
            }
        }

        return matches;
    }

    function render() {
        // Update URL with current parameters
        updateURL();

        // Ensure interpretations are loaded securely before every render, just in case
        if (!chart.interpretations || Object.keys(chart.interpretations).length === 0) {
            chart.loadInterpretations();
        }

        const birth = ui.birthStem.value;
        const yin = ui.yinStem.value;
        const ming = ui.mingPos.value;
        const ziwei = ui.ziweiPos.value;
        const wenqu = ui.wenquPos.value;
        const wenchang = ui.wenchangPos.value;
        const zuofu = ui.zuofuPos.value;
        const youbi = ui.youbiPos.value;

        chart.calculate(yin, ming, ziwei, birth, wenqu, wenchang, zuofu, youbi);

        // Update Chart with Da Yun / Liu Nian if selected
        chart.daYunMingGongBranch = ui.dayunPos.value;
        chart.liuNianMingGongBranch = ui.liunianPos.value;

        // Get matching palace names for highlighting
        const matchingPalaces = getMatchingPalaceNames();

        const lifePalaceBranch = ui.mingPos.value;
        const lifePalace = chart.palaces[lifePalaceBranch];

        // Render Grid
        let html = '<div class="chart-grid">';
        let layoutOrder = ['寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥', '子', '丑'];

        layoutOrder.forEach(b => {
            let p = chart.palaces[b];
            let classes = ['palace', b];
            if (p.isMing) classes.push('is-ming');

            const typeMap = { '祿': 'lu', '權': 'quan', '科': 'ke', '忌': 'ji' };

            // Find Life Palace stem for permanent square icons
            const lifeStem = lifePalace ? lifePalace.celestial : '';
            const lifeTransStars = chart.fourTransMap[lifeStem] || [];

            let starsHtml = p.stars.map(s => {
                let icons = '';
                // 1. Birth Year (Circle)
                const bTrans = p.trans.find(t => t.star === s);
                if (bTrans) {
                    icons += `<span class="trans-circle-mini bg-${typeMap[bTrans.type]}" title="生年${bTrans.type}">${bTrans.type}</span>`;
                }
                // 2. Life Palace (Square)
                const lifeStarIdx = lifeTransStars.indexOf(s);
                if (lifeStarIdx !== -1) {
                    const lType = chart.transTypes[lifeStarIdx];
                    icons += `<span class="trans-square-mini bg-${typeMap[lType]}" title="命宮${lType}">${lType}</span>`;
                }
                return `<div class="star" data-star="${s}">${s}${icons}</div>`;
            }).join('');

            let transHtml = '';

            // --- Detect Self-Transformation (自化) ---
            const currentStem = p.celestial;
            const selfTransStars = chart.fourTransMap[currentStem];
            let zihuaHtml = '';
            let zihuaInfo = []; // To store for click handler
            
            if (selfTransStars) {
                selfTransStars.forEach((star, idx) => {
                    const type = chart.transTypes[idx];
                    if (p.stars.includes(star)) {
                        const colors = { '祿': '#d32f2f', '權': '#388e3c', '科': '#1976d2', '忌': '#7b1fa2' };
                        const color = colors[type];
                        zihuaHtml += `<div class="zihua-label" data-type="${type}" data-star="${star}" style="color: ${color}; border: 1px solid ${color}; padding: 2px 4px; border-radius: 4px; font-size: 1em; margin-top: 2px; cursor: pointer; display: inline-block; margin-right: 2px; font-weight: bold;">自化${type}</div>`;
                        zihuaInfo.push({ type, star });
                    }
                });
            }
            if (zihuaHtml) {
                transHtml += `<div class="zihua-container" style="position:absolute; bottom:5px; left:5px; text-align:left; pointer-events:auto; display:flex; flex-direction:column; gap:2px;">${zihuaHtml}</div>`;
            }


            // 3. Active Highlight Trans (Based on Stem) - Circles
            activeSourceBranches.forEach(activeSourceBranch => {
                // Skip if it's Life Palace (handled above as square)
                if (activeSourceBranch === lifePalaceBranch) return;

                const activePalace = chart.palaces[activeSourceBranch];
                const activeStem = activePalace.celestial;

                const activeTransStars = chart.fourTransMap[activeStem];
                if (activeTransStars) {
                    p.stars.forEach(star => {
                        const starIdx = activeTransStars.indexOf(star);
                        if (starIdx !== -1) {
                            const type = chart.transTypes[starIdx];
                            const typeMap = { '祿': 'lu', '權': 'quan', '科': 'ke', '忌': 'ji' };
                            const transColors = { '祿': '#d32f2f', '權': '#388e3c', '科': '#1976d2', '忌': '#7b1fa2' };
                            const color = transColors[type];

                            transHtml += `<div class="trans active-trans" style="color: ${color}; font-weight: bold; margin-top: 4px; display: flex; align-items: center;">
                                <span class="trans-circle bg-${typeMap[type]}">${type}</span>
                                [${activeStem}干${type}] ${star}
                            </div>`;
                        }
                    });
                }
            });

            // Da Yun & Liu Nian Titles with highlighting
            let extraRawHtml = '';
            if (ui.dayunPos.value) {
                const mingIdx = chart._getIndex(ui.dayunPos.value);
                const currentIdx = chart._getIndex(b);
                // Title is relative to Ming (CCW)
                let offset = (mingIdx - currentIdx) % 12;
                if (offset < 0) offset += 12;
                const title = chart.palaceNames[offset];
                // Strip '宮' for brevity if desired, but user asked for "names"
                const displayTitle = '大限' + title.replace('宮', '');

                // Check if this palace name should be highlighted
                const bgColor = matchingPalaces.dayun.has(title) ? 'background-color: rgba(25, 118, 210, 0.2); padding: 2px 4px; border-radius: 3px;' : '';
                extraRawHtml += `<div class="dayun-title" style="position:absolute; top:3px; right:5px; font-size:0.8em; color:#1976d2; pointer-events:none; ${bgColor}">${displayTitle}</div>`;
            }

            if (ui.liunianPos.value) {
                const mingIdx = chart._getIndex(ui.liunianPos.value);
                const currentIdx = chart._getIndex(b);
                let offset = (mingIdx - currentIdx) % 12;
                if (offset < 0) offset += 12;
                const title = chart.palaceNames[offset];
                const displayTitle = '流年' + title.replace('宮', '');

                // Check if this palace name should be highlighted
                const bgColor = matchingPalaces.liunian.has(title) ? 'background-color: rgba(56, 142, 60, 0.2); padding: 2px 4px; border-radius: 3px;' : '';
                extraRawHtml += `<div class="liunian-title" style="position:absolute; top:3px; left:5px; font-size:0.8em; color:#388e3c; pointer-events:none; ${bgColor}">${displayTitle}</div>`;
            }

            // Determine palace title background color
            let palaceTitleStyle = 'position:absolute; bottom:5px; right:5px; font-weight:bold; cursor:pointer; font-size: 1.1em;';

            // Add background color if this palace title matches
            if (matchingPalaces.dayun.has(p.title) || matchingPalaces.liunian.has(p.title)) {
                let bgColors = [];
                if (matchingPalaces.dayun.has(p.title)) {
                    bgColors.push('rgba(25, 118, 210, 0.2)');
                }
                if (matchingPalaces.liunian.has(p.title)) {
                    bgColors.push('rgba(56, 142, 60, 0.2)');
                }
                // If both match, use a blended color or show both
                const bgColor = bgColors.length === 2 ?
                    'linear-gradient(135deg, rgba(25, 118, 210, 0.2) 50%, rgba(56, 142, 60, 0.2) 50%)' :
                    bgColors[0];
                palaceTitleStyle += ` background: ${bgColor}; padding: 2px 6px; border-radius: 3px;`;
            }

            html += `
                <div class="${classes.join(' ')}" data-branch="${b}">
                    <div class="palace-title" style="${palaceTitleStyle}">${p.title}</div>
                    <div class="celestial" style="cursor: pointer; text-decoration: underline;" title="點擊顯示四化">${p.celestial}</div>
                    <div class="name">${p.name}</div>
                    ${starsHtml}
                    ${transHtml}
                    ${extraRawHtml}
                </div>
            `;
        });

        // Add Center Info Panel
        html += `<div class="center-info" id="mid-panel"><p style="color:#888; text-align:center; padding-top:20px;">點擊星曜查看詳細解讀</p></div>`;

        // Add Arrow Container for Four Transformations
        html += '<div class="arrow-container" id="arrow-container"></div>';

        html += '</div>';
        ui.chartContainer.innerHTML = html;

        // Draw arrows if a palace is selected
        activeSourceBranches.forEach(branch => {
            drawTransformationArrows(branch);
        });

        // Draw incoming arrows if a star is selected
        activeTargetStars.forEach(star => {
            drawIncomingTransformationArrows(star);
        });

        // Draw opposite palace arrows if active
        if (showOppositeArrows) {
            drawOppositeTransformationArrows();
        }

        // Add Click Events to Self-Transformation Labels
        document.querySelectorAll('.zihua-label').forEach(label => {
            label.addEventListener('click', (e) => {
                e.stopPropagation();
                const type = label.dataset.type;
                const star = label.dataset.star;
                const palaceDiv = label.closest('.palace');
                const branch = palaceDiv.dataset.branch;
                const palaceTitle = chart.palaces[branch].title;

                // Find if there's an incoming flyer from the opposite palace
                const sourceIdx = chart._getIndex(branch);
                const oppositeIdx = (sourceIdx + 6) % 12;
                const oppositeBranch = chart._getBranch(oppositeIdx);
                const oppositePalace = chart.palaces[oppositeBranch];
                const oppositeStem = oppositePalace.celestial;
                const oppositeTransStars = chart.fourTransMap[oppositeStem];
                
                let collisionFound = false;
                let interpretationText = '';

                const birthToneHtml = getBirthToneHtml(palaceTitle);
                let fullAnalysisHtml = '';
                let incomingInteractions = [];

                if (oppositeTransStars) {
                    console.log(`Scan: Clicking ${palaceTitle} Self-${type}. Checking opposite ${oppositePalace.title}...`);
                    oppositeTransStars.forEach((oppStar, oppIdx) => {
                        const oppType = chart.transTypes[oppIdx];
                        const targetPalace = Object.values(chart.palaces).find(p => p.stars.includes(oppStar));
                        const targetTitle = (targetPalace ? targetPalace.title : 'None');
                        
                        // If any flying star from opposite lands in THIS palace, add to interactions
                        if (targetTitle === palaceTitle) {
                            incomingInteractions.push({ type: oppType, star: oppStar });
                            
                        // Logic for pulling from the new detailed collision data structure
                        if (targetTitle === palaceTitle && (oppType === '祿' || oppType === '忌')) {
                            const firingPalaceTitle = oppositePalace.title;
                            
                            // Normalize titles for robust lookup (事業=官祿, 交友=奴僕, etc.)
                            const normalize = (t) => {
                                let nt = t.replace('宮', '');
                                if (nt === '事業') return '官祿';
                                if (nt === '官祿') return '官祿';
                                if (nt === '交友') return '奴僕'; // Wait, let's check data keys
                                return nt;
                            };

                            const nTitle = normalize(firingPalaceTitle);
                            const palaceData = ZIWEI_DATA_COLLISION[nTitle] || ZIWEI_DATA_COLLISION[nTitle + '宮'] || ZIWEI_DATA_COLLISION[firingPalaceTitle] || ZIWEI_DATA_COLLISION[firingPalaceTitle + '宮'];
                            
                            if (palaceData && palaceData[oppType]) {
                                incomingInteractions.push({ type: oppType, star: oppStar });
                                
                                // Determine if it's a collision (Same type) or cross-type interaction
                                const isSameType = (oppType === type);
                                collisionFound = true; // Any Lu/Ji intersection is now a "detailed analysis" case
                                
                                let currentInterpretation = '';
                                if (type === '祿') {
                                    currentInterpretation = palaceData[oppType].self_lu;
                                } else if (type === '忌') {
                                    currentInterpretation = palaceData[oppType].self_ji;
                                }

                                if (currentInterpretation) {
                                    interpretationText += `<div style="margin-bottom:10px; padding:10px; background:#fff7e6; border-radius:6px; border-left:4px solid #d32f2f;">
                                        <b style="color:#d32f2f;">[${oppType}入遇自化${type}]：</b>${currentInterpretation}
                                    </div>`;
                                }
                                
                                console.log(`>>> DETAILED MATCH: Opposite ${oppType} -> Self-${type} at ${palaceTitle}`);
                            }
                        }
                        }
                    });
                }

                // --- Generate HTML ---
                if (collisionFound) {
                    fullAnalysisHtml = `
                        ${birthToneHtml}
                        <div style="padding: 15px; border: 2px solid #d48806; border-radius: 8px; background: #fffbe6; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
                            <h3 style="color: #d48806; margin-top: 0;">⚡ 對宮飛化遇自化碰撞分析</h3>
                            <p style="margin:0 0 10px 0;"><strong>目前點擊：</strong>${palaceTitle} 【自化${type}】</p>

                            <hr style="border: 0; border-top: 1px solid #ffe58f; margin:15px 0;">
                            <div style="font-size: 1.15em; color: #333; line-height: 1.7;">
                                <strong style="color:#d32f2f;">🔥 碰撞專屬象義：</strong><br>
                                ${interpretationText}
                            </div>
                        </div>
                    `;
                } else {
                    // Standard Self-Transformation text if no collision
                    let text = '(暫無資料)';
                    if (typeof ZIWEI_DATA_ZIHUA !== 'undefined' && ZIWEI_DATA_ZIHUA[palaceTitle] && ZIWEI_DATA_ZIHUA[palaceTitle][type]) {
                        text = ZIWEI_DATA_ZIHUA[palaceTitle][type][palaceTitle] || ZIWEI_DATA_ZIHUA[palaceTitle][type][palaceTitle + '宮'];
                    }
                    fullAnalysisHtml = `
                        ${birthToneHtml}
                        <div style="padding: 15px; border: 1px solid #eee; border-radius: 8px; background:#fafafa;">
                            <h3 style="margin-top: 0; color:#2c3e50; border-bottom:1px solid #ddd; padding-bottom:8px;">自化單獨解析：${palaceTitle} 自化${type}</h3>

                            <div style="font-size: 1.1em; color: #444; line-height: 1.6; margin-top:15px; background:#fff; padding:12px; border-radius:6px; border:1px solid #eee;">
                                <strong>💡 基礎象義：</strong><br>${text}
                            </div>
                        </div>
                    `;
                }

                // Only update the right panel for maximum visibility and to keep the center clear
                if (ui.analysisContainer) {
                    ui.analysisContainer.innerHTML = fullAnalysisHtml;
                    ui.analysisContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            });
        });

        // --- Helper: Generate Birth Year Tone (Golden Table) ---
        function getBirthToneHtml(palaceTitle) {
            let birthTransData = {};
            if (typeof ZIWEI_DATA_SIHUA_N !== 'undefined') birthTransData = ZIWEI_DATA_SIHUA_N;
            
            const transData = chart.getTransSummary();
            const relevantTrans = [];
            
            transData.forEach(item => {
                const targetPalace = Object.values(chart.palaces).find(p => p.stars.includes(item.star));
                if (targetPalace && targetPalace.title === palaceTitle) {
                    let interpretation = '(暫無資料)';
                    if (birthTransData[palaceTitle] && birthTransData[palaceTitle][item.type]) {
                        interpretation = birthTransData[palaceTitle][item.type];
                    }
                    relevantTrans.push({ ...item, interpretation });
                }
            });

            if (relevantTrans.length === 0) return '';

            let tableHtml = `
                <div class="birth-tone-table">
                    <div style="background: #ffd700; color: #8b4513; padding: 8px; font-weight: bold; font-size: 0.9em; text-align: center;">
                        ✨ ${palaceTitle}・先天基調 (生年四化)
                    </div>
                    <table style="width:100%; border-collapse: collapse;">
            `;

            relevantTrans.forEach(rt => {
                const colors = { '祿': '#d32f2f', '權': '#388e3c', '科': '#1976d2', '忌': '#7b1fa2' };
                const color = colors[rt.type] || '#333';
                tableHtml += `
                    <tr>
                        <td style="width: 70px; border-top: 1px solid #ffe58f; text-align: center; font-weight: bold; color: ${color};">
                            [${rt.type}] ${rt.star}
                        </td>
                        <td style="border-top: 1px solid #ffe58f; padding: 10px; font-size: 0.9em; line-height: 1.4; color: #555;">
                            ${rt.interpretation}
                        </td>
                    </tr>
                `;
            });

            tableHtml += `</table></div>`;
            return tableHtml;
        }
        // -------------------------------

        // Render Trans Summary (Born Year Si-Hua)
        let transData = chart.getTransSummary();
        let transHtml = '';

        // Load Birth Trans Data (ZIWEI_DATA_SIHUA_N) if available
        let birthTransData = {};
        if (typeof ZIWEI_DATA_SIHUA_N !== 'undefined') {
            birthTransData = ZIWEI_DATA_SIHUA_N;
        }

        transData.forEach(item => {
            // Find which palace this star is in
            let palaceTitle = '未知';
            Object.values(chart.palaces).forEach(p => {
                if (p.stars.includes(item.star)) {
                    palaceTitle = p.title; // e.g., '夫妻', '財帛'
                }
            });

            // Get Interpretation
            let interpretation = '(暫無資料)';

            // Helper to find key match (Try exact, then +宮, then -宮)
            const findKey = (obj, key) => {
                if (!obj) return null;
                if (obj[key]) return key;
                if (obj[key + '宮']) return key + '宮';
                if (key.endsWith('宮') && obj[key.slice(0, -1)]) return key.slice(0, -1);
                return null;
            };

            const palaceKey = findKey(birthTransData, palaceTitle);
            if (palaceKey && birthTransData[palaceKey][item.type]) {
                interpretation = birthTransData[palaceKey][item.type];
            }

            const transColors = { '祿': '#d32f2f', '權': '#388e3c', '科': '#1976d2', '忌': '#7b1fa2' };
            const color = transColors[item.type] || '#333';

            transHtml += `
            <div class="trans-result" style="border-left-color:${color}">
                <div style="display:flex; align-items:center; gap:10px; margin-bottom:4px;">
                    <span style="color:${color}; font-weight:bold; font-size:1.1em;">[${item.type}]</span>
                    <span style="font-weight:bold;">${item.star}</span>
                    <span style="color:#666; font-size:0.9em;">${palaceTitle}</span>
                </div>
                <div style="font-size:0.85em; color:#666; line-height:1.4;">${interpretation}</div>
            </div>
            `;
        });
        ui.transContainer.innerHTML = transHtml;


        // Render Interaction Analysis Panel
        let hasSelection = activeSourceBranches.size > 0 || activeTargetStars.size > 0;

        if (hasSelection) {
            let analysisHtml = `<h3>飛化分析</h3>`;

            // 1. Source Branches (Outgoing)
            if (activeSourceBranches.size > 0) {
                activeSourceBranches.forEach(activeSourceBranch => {
                    const sourcePalace = chart.palaces[activeSourceBranch];
                    const activeStem = sourcePalace.celestial;
                    
                    const birthToneHtml = getBirthToneHtml(sourcePalace.title);
                    analysisHtml += birthToneHtml;

                    analysisHtml += `<div style="margin-bottom: 25px; border-bottom: 1px solid #eee; padding-bottom: 10px;">`;
                    analysisHtml += `<h4>【${sourcePalace.title}】四化飛伏</h4>`;
                    analysisHtml += `<p style="font-size:0.9em; margin-bottom:10px;">宮干：${activeStem} | 宮位：${sourcePalace.name}</p>`;

                    const transColors = { '祿': '#d32f2f', '權': '#388e3c', '科': '#1976d2', '忌': '#7b1fa2' };
                    const activeTransStars = chart.fourTransMap[activeStem];

                    if (activeTransStars) {
                        activeTransStars.forEach((star, idx) => {
                            const type = chart.transTypes[idx];
                            const color = transColors[type] || '#333';

                            // Find Target Palace
                            const targetPalace = Object.values(chart.palaces).find(p => p.stars.includes(star));
                            const targetName = targetPalace ? targetPalace.title : '未知';
                            const sourceName = sourcePalace.title;
                            const isZiHua = sourceName === targetName;

                            // Get Interpretation Text from JSON
                            let interpretation = '';
                            let displayTitle = '';
                            let containerClass = 'analysis-item';

                            if (isZiHua) {
                                // Self-Transformation Logic
                                containerClass += ' zihua-highlight';
                                displayTitle = `<span class="zihua-tag">[自化]</span> <strong>${sourceName}</strong> <strong>自化${type}</strong>`;

                                // Load from ZIWEI_DATA_ZIHUA if available
                                if (typeof ZIWEI_DATA_ZIHUA !== 'undefined' && ZIWEI_DATA_ZIHUA[sourceName] && ZIWEI_DATA_ZIHUA[sourceName][type]) {
                                    // Try exact match first
                                    interpretation = ZIWEI_DATA_ZIHUA[sourceName][type][sourceName];
                                    // Fallback if key + "宮" logic needed
                                    if (!interpretation) interpretation = ZIWEI_DATA_ZIHUA[sourceName][type][sourceName + '宮'];
                                } else {
                                    interpretation = '(暫無自化象義)';
                                }
                            } else {
                                // Standard Logic
                                displayTitle = `<strong>${sourceName}</strong> <strong>${type}入</strong> <strong>${targetName}</strong>`;
                                
                                // Check if Opposite Palace
                                const sourceIdx = chart._getIndex(sourcePalace.name);
                                const targetIdx = chart._getIndex(targetPalace.name);
                                const isOpposite = (Math.abs(sourceIdx - targetIdx) === 6);

                                if (isOpposite && (type === '祿' || type === '忌')) {
                                    const data = ZIWEI_DATA_COLLISION[sourceName] || ZIWEI_DATA_COLLISION[sourceName + '宮'];
                                    if (data && data[type]) {
                                        interpretation = `<span style="color:#e65100; font-weight:bold;">【${type === '祿' ? '照' : '沖'}】對宮：</span>` + data[type].normal;
                                    } else {
                                        interpretation = chart.getInterpretation(sourceName, type, targetName);
                                    }
                                } else {
                                    interpretation = chart.getInterpretation(sourceName, type, targetName);
                                }
                            }

                            if (!interpretation) interpretation = '(暫無此象義)';

                            analysisHtml += `
                                <div class="${containerClass}" style="padding: 8px 12px; margin-bottom: 8px; border-left: 3px solid ${color}; background: #fafafa; border-radius: 4px;">
                                    <div style="display:flex; align-items:center; gap:10px; margin-bottom:4px;">
                                        <span style="color:${color}; font-weight:bold; font-size:1.1em;">[${type}]</span>
                                        <span style="font-weight:bold;">${star}</span>
                                        <span style="font-size:0.9em; color:#666;">➜ ${displayTitle}</span>
                                    </div>
                                    <div style="font-size:0.85em; color:#666; line-height:1.4; white-space: pre-wrap;">${interpretation}</div>
                                </div>
                            `;
                        });
                    }
                    analysisHtml += `</div>`;
                });
            }

            // 2. Target Stars (Incoming)
            if (activeTargetStars.size > 0) {
                activeTargetStars.forEach(targetStarName => {
                    analysisHtml += `<div style="margin-bottom: 15px; border-bottom: 1px solid #eee; padding-bottom: 10px;">`;
                    analysisHtml += `<h4 style="color:#333;">【${targetStarName}】互涉飛化</h4>`;

                    const targetPalace = Object.values(chart.palaces).find(p => p.stars.includes(targetStarName));
                    if (targetPalace) {
                        const targetTitle = targetPalace.title;

                        Object.keys(chart.palaces).forEach(sourceBranch => {
                            const sourcePalace = chart.palaces[sourceBranch];
                            const stem = sourcePalace.celestial;
                            const transStars = chart.fourTransMap[stem];

                            if (transStars) {
                                const starIdx = transStars.indexOf(targetStarName);
                                if (starIdx !== -1) {
                                    const type = chart.transTypes[starIdx];
                                    const transColors = { '祿': '#d32f2f', '權': '#388e3c', '科': '#1976d2', '忌': '#7b1fa2' };
                                    const color = transColors[type] || '#333';

                                    const sourceName = sourcePalace.title;
                                    const isZiHua = sourceName === targetTitle;

                                    let interpretation = '';
                                    let displayTitle = '';

                                    if (isZiHua) {
                                        displayTitle = `<span class="zihua-tag">[自化]</span> <strong>${sourceName}</strong> <strong>自化${type}</strong>`;
                                        if (typeof ZIWEI_DATA_ZIHUA !== 'undefined' && ZIWEI_DATA_ZIHUA[sourceName] && ZIWEI_DATA_ZIHUA[sourceName][type]) {
                                            interpretation = ZIWEI_DATA_ZIHUA[sourceName][type][sourceName] || ZIWEI_DATA_ZIHUA[sourceName][type][sourceName + '宮'];
                                        } else {
                                            interpretation = '(暫無自化象義)';
                                        }
                                    } else {
                                        displayTitle = `<strong>${sourceName}</strong> <strong>${type}入</strong> <strong>${targetTitle}</strong>`;
                                        interpretation = chart.getInterpretation(sourceName, type, targetTitle);
                                    }

                                    if (!interpretation) interpretation = '(暫無此象義)';

                                    analysisHtml += `
                                        <div class="analysis-item" style="padding: 8px 12px; margin-bottom: 8px; border-left: 3px solid ${color}; background: #fafafa; border-radius: 4px;">
                                            <div style="display:flex; align-items:center; gap:10px; margin-bottom:4px;">
                                                <span style="color:${color}; font-weight:bold; font-size:1.1em;">[${type}]</span>
                                                <span style="font-weight:bold;">${targetStarName}</span>
                                                <span style="font-size:0.9em; color:#666;">← ${displayTitle}</span>
                                            </div>
                                            <div style="font-size:0.85em; color:#666; line-height:1.4; white-space: pre-wrap;">${interpretation}</div>
                                        </div>
                                    `;
                                }
                            }
                        });
                    }
                    analysisHtml += `</div>`;
                });
            }

            ui.analysisContainer.innerHTML = analysisHtml;
        } else {
            ui.analysisContainer.innerHTML = `<h3>飛化分析</h3><p style="color:#666;">點擊盤面天干或星曜查看詳情...</p>`;
        }


        // Helper to generate layer HTML
        const renderLayer = (title, layerMingBranch, themeColor) => {
            let layerHtml = `<h2 style="margin-top:40px; border-left: 5px solid ${themeColor}; padding-left: 10px; color: ${themeColor};">${title}</h2>`;
            const mingIdx = chart._getIndex(layerMingBranch);

            // Iterate 12 palaces order relative to layerMingBranch
            for (let i = 0; i < 12; i++) {
                // Find which branch corresponds to this relative index (0=Ming, 1=Brother...)
                // Standard chart.palaceNames is ['Ming', 'Brother'...]
                // The branch for Ming is layerMingBranch.
                // The branch for Brother is (MingIdx - 1) CCW.

                // Wait. Palace Names array is Counter-Clockwise.
                // Branches array is Clockwise.
                // If Ming is at Index M.
                // "Brother" (Index 1 in Names) should be at Branch (M - 1).
                // So targetBranchIndex = (mingIdx - i).

                let targetIdx = (mingIdx - i) % 12;
                if (targetIdx < 0) targetIdx += 12;
                let currentBranch = chart._getBranch(targetIdx);

                // Get the Palace Object at this branch (It has the fixed Stem)
                let pObj = chart.palaces[currentBranch];
                let stem = pObj.celestial;

                // Get the "Layer Title" (e.g. Da Xian Ming, Da Xian Brother...)
                // chart.palaceNames[i] is the title relative to the layer Ming.
                let layerTitle = chart.palaceNames[i];

                let layerPrefix = '';
                if (title.includes('大運')) layerPrefix = '大運';
                else if (title.includes('流年')) layerPrefix = '流年';
                else if (title.includes('本命')) layerPrefix = '本命';
                let displayLayerTitle = layerPrefix + layerTitle;

                // **FILTER: Skip this palace if not selected**
                if (!selectedPalaces.has(layerTitle)) {
                    continue;
                }

                // Get Trans Stars for this stem
                let transStars = chart.fourTransMap[stem];

                layerHtml += `
                    <div class="palace-section" style="margin-bottom: 25px; background: #fff; padding: 15px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.05); border-top: 3px solid ${themeColor};">
                        <h3 style="margin-top:0; border-bottom: 2px solid #ddd; padding-bottom: 10px; color: #333;">
                            <span style="display:inline-block; width: 32px; height: 32px; background: ${themeColor}; color: #fff; text-align: center; line-height: 32px; border-radius: 50%; margin-right: 10px; font-size: 1rem;">${stem}</span>
                            ${displayLayerTitle} <span style="font-size:0.8em; font-weight:normal; color:#666;">(在${currentBranch})</span>
                        </h3>
                        <div style="display: flex; flex-direction: column; gap: 10px;">
                `;

                if (transStars) {
                    transStars.forEach((star, idx) => {
                        const type = chart.transTypes[idx];
                        const transColors = { '祿': '#d32f2f', '權': '#388e3c', '科': '#1976d2', '忌': '#7b1fa2' };
                        const color = transColors[type] || '#333';

                        // Find which branch implies the active star
                        // We need to find the palace object having this star
                        const targetPalaceObj = Object.values(chart.palaces).find(obj => obj.stars.includes(star));

                        let displayTitle = '';
                        let interpretation = '';

                        if (targetPalaceObj) {
                            // Target is always the Original Palace Title (User Request)
                            const targetTitle = targetPalaceObj.title;

                            // Conceptual Zi Hua: Source Title (Role) == Target Title (Sector).
                            const isZiHua = (layerTitle === targetTitle);

                            if (isZiHua) {
                                displayTitle = `${displayLayerTitle} <strong style="color:${color}">自化${type}</strong>`;
                                if (typeof ZIWEI_DATA_ZIHUA !== 'undefined' && ZIWEI_DATA_ZIHUA[layerTitle] && ZIWEI_DATA_ZIHUA[layerTitle][type]) {
                                    interpretation = ZIWEI_DATA_ZIHUA[layerTitle][type][layerTitle] || ZIWEI_DATA_ZIHUA[layerTitle][type][layerTitle + '宮'];
                                } else {
                                    interpretation = '(暫無自化象義)';
                                }
                            } else {
                                displayTitle = `${displayLayerTitle} <strong style="color:${color}">${type}入</strong> ${targetTitle}`;
                                interpretation = chart.getInterpretation(layerTitle, type, targetTitle);
                            }
                        } else {
                            displayTitle = '未知宮位';
                        }

                        if (!interpretation) interpretation = '(暫無此象義)';

                        layerHtml += `
                            <div class="trans-item" style="border-left: 4px solid ${color}; padding: 12px 15px; background: #fafafa; border-radius: 0 4px 4px 0; margin-bottom: 5px;">
                                <div style="font-size: 1.1em; margin-bottom: 6px; display: flex; align-items: center; flex-wrap: wrap;">
                                    <span style="color:${color}; font-weight: bold; margin-right: 8px;">[${type}]</span> 
                                    <span style="font-weight: bold;">${star}</span>
                                    <span style="margin: 0 10px; color: #999;">➜</span>
                                    ${displayTitle}
                                </div>
                                <div style="font-size: 0.95em; color: #444; white-space: pre-wrap; line-height: 1.6;">${interpretation}</div>
                            </div>
                        `;
                    });
                }
                layerHtml += `</div></div>`;
            }
            return layerHtml;
        };

        let allHtml = '';

        // 1. Original (Ben Ming)
        allHtml += renderLayer('本命各宮飛化', ui.mingPos.value, '#d32f2f');

        // 2. Da Yun
        if (ui.dayunPos.value) {
            allHtml += renderLayer('大運各宮飛化', ui.dayunPos.value, '#1976d2');
        }

        // 3. Liu Nian
        if (ui.liunianPos.value) {
            allHtml += renderLayer('流年各宮飛化', ui.liunianPos.value, '#388e3c');
        }

        if (ui.allTransContainer) ui.allTransContainer.innerHTML = allHtml;

    }

    // Reactivity
    [
        ui.birthStem, ui.yinStem, ui.mingPos, ui.ziweiPos,
        ui.wenquPos, ui.wenchangPos, ui.zuofuPos, ui.youbiPos,
        ui.dayunPos, ui.liunianPos
    ].forEach(el => {
        el.addEventListener('change', render);
    });

    if (ui.oppositeTransBtn) {
        ui.oppositeTransBtn.addEventListener('click', () => {
            showOppositeArrows = !showOppositeArrows;
            const btn = ui.oppositeTransBtn;
            if (showOppositeArrows) {
                btn.style.backgroundColor = '#2c3e50';
                btn.style.color = '#fff';
                btn.textContent = '隱藏對宮飛化';
            } else {
                btn.style.backgroundColor = '';
                btn.style.color = '';
                btn.textContent = '對宮飛化';
            }
            render();
        });
    }

    ui.resetBtn.addEventListener('click', () => {
        ui.birthStem.value = '甲';
        ui.yinStem.value = '甲';
        ui.mingPos.value = '寅';
        ui.ziweiPos.value = '午';
        ui.wenquPos.value = '辰';
        ui.wenchangPos.value = '戌';
        ui.zuofuPos.value = '辰';
        ui.youbiPos.value = '戌';
        activeSourceBranches.clear(); // Reset selection
        render();
    });

    // Copy Link Button
    const copyLinkBtn = document.getElementById('copyLinkBtn');
    const copyStatus = document.getElementById('copyStatus');

    if (copyLinkBtn) {
        copyLinkBtn.addEventListener('click', async () => {
            const url = window.location.href;

            try {
                await navigator.clipboard.writeText(url);
                copyStatus.style.display = 'inline';
                setTimeout(() => {
                    copyStatus.style.display = 'none';
                }, 2000);
            } catch (err) {
                // Fallback for older browsers
                const textArea = document.createElement('textarea');
                textArea.value = url;
                document.body.appendChild(textArea);
                textArea.select();
                document.execCommand('copy');
                document.body.removeChild(textArea);

                copyStatus.style.display = 'inline';
                setTimeout(() => {
                    copyStatus.style.display = 'none';
                }, 2000);
            }
        });
    }

    // Export Text File Logic
    function generateExportText() {
        let textContent = '紫微斗數排盤解讀\n';
        textContent += '='.repeat(50) + '\n\n';

        // Parameters
        textContent += '命盤參數：\n';
        textContent += '  出生年天干：' + ui.birthStem.value + '\n';
        textContent += '  寅宮天干：' + ui.yinStem.value + '\n';
        textContent += '  命宮位置：' + ui.mingPos.value + '\n';
        textContent += '  紫微位置：' + ui.ziweiPos.value + '\n';
        textContent += '  文曲位置：' + ui.wenquPos.value + '\n';
        textContent += '  文昌位置：' + ui.wenchangPos.value + '\n';
        textContent += '  左輔位置：' + ui.zuofuPos.value + '\n';
        textContent += '  右弼位置：' + ui.youbiPos.value + '\n';
        if (ui.dayunPos.value) textContent += '  大運命宮：' + ui.dayunPos.value + '\n';
        if (ui.liunianPos.value) textContent += '  流年命宮：' + ui.liunianPos.value + '\n';
        textContent += '\n' + '='.repeat(50) + '\n\n';

        // Birth Year Four Transformations
        textContent += '出生年四化解讀（' + ui.birthStem.value + '）\n';
        textContent += '-'.repeat(50) + '\n\n';
        const transData = chart.getTransSummary();
        let birthTransData = {};
        if (typeof ZIWEI_DATA_SIHUA_N !== 'undefined') birthTransData = ZIWEI_DATA_SIHUA_N;
        transData.forEach(item => {
            let palaceTitle = '未知';
            Object.values(chart.palaces).forEach(p => {
                if (p.stars.includes(item.star)) palaceTitle = p.title;
            });
            let interpretation = '(暫無資料)';
            if (birthTransData[palaceTitle] && birthTransData[palaceTitle][item.type]) {
                interpretation = birthTransData[palaceTitle][item.type];
            }
            textContent += '[' + item.type + '] ' + item.star + ' → ' + palaceTitle + '\n';
            textContent += interpretation + '\n\n';
        });
        textContent += '='.repeat(50) + '\n\n';

        // Interaction Analysis (if palace clicked)
        if (activeSourceBranches.size > 0) {
            activeSourceBranches.forEach(activeSourceBranch => {
                const sourcePalace = chart.palaces[activeSourceBranch];
                const activeStem = sourcePalace.celestial;
                textContent += '【' + sourcePalace.title + '】四化飛伏分析\n';
                textContent += '宮干：' + activeStem + ' | 宮位：' + sourcePalace.name + '\n';
                textContent += '-'.repeat(50) + '\n\n';
                const activeTransStars = chart.fourTransMap[activeStem];
                if (activeTransStars) {
                    activeTransStars.forEach((star, idx) => {
                        const type = chart.transTypes[idx];
                        const targetPalace = Object.values(chart.palaces).find(p => p.stars.includes(star));
                        const targetName = targetPalace ? targetPalace.title : '未知';
                        const sourceName = sourcePalace.title;
                        const isZiHua = sourceName === targetName;
                        let interpretation = '';
                        let displayTitle = '';
                        if (isZiHua) {
                            displayTitle = sourceName + ' 自化' + type;
                            if (typeof ZIWEI_DATA_ZIHUA !== 'undefined' && ZIWEI_DATA_ZIHUA[sourceName] && ZIWEI_DATA_ZIHUA[sourceName][type]) {
                                interpretation = ZIWEI_DATA_ZIHUA[sourceName][type][sourceName] || ZIWEI_DATA_ZIHUA[sourceName][type][sourceName + '宮'] || '';
                            }
                            if (!interpretation) interpretation = '(暫無自化象義)';
                        } else {
                            displayTitle = sourceName + ' ' + type + '入 ' + targetName;
                            interpretation = chart.getInterpretation(sourceName, type, targetName);
                        }
                        if (!interpretation) interpretation = '(暫無此象義)';
                        textContent += '[' + type + '] ' + star + ' → ' + displayTitle + '\n';
                        textContent += interpretation + '\n\n';
                    });
                }
                textContent += '='.repeat(50) + '\n\n';
            });
        }

        // Incoming Interaction Analysis (if star clicked)
        if (activeTargetStars.size > 0) {
            textContent += '【' + Array.from(activeTargetStars).join('、') + '】互涉飛化分析\n';
            textContent += '='.repeat(50) + '\n\n';

            activeTargetStars.forEach(targetStarName => {
                textContent += '星曜：' + targetStarName + ' (接收飛化)\n';
                textContent += '-'.repeat(50) + '\n';

                const targetPalace = Object.values(chart.palaces).find(p => p.stars.includes(targetStarName));
                if (targetPalace) {
                    const targetTitle = targetPalace.title;

                    Object.keys(chart.palaces).forEach(sourceBranch => {
                        const sourcePalace = chart.palaces[sourceBranch];
                        const stem = sourcePalace.celestial;
                        const transStars = chart.fourTransMap[stem];

                        if (transStars) {
                            const starIdx = transStars.indexOf(targetStarName);
                            if (starIdx !== -1) {
                                const type = chart.transTypes[starIdx];
                                const sourceName = sourcePalace.title;
                                const isZiHua = sourceName === targetTitle;

                                let interpretation = '';
                                let displayTitle = '';

                                if (isZiHua) {
                                    displayTitle = sourceName + ' 自化' + type;
                                    if (typeof ZIWEI_DATA_ZIHUA !== 'undefined' && ZIWEI_DATA_ZIHUA[sourceName] && ZIWEI_DATA_ZIHUA[sourceName][type]) {
                                        interpretation = ZIWEI_DATA_ZIHUA[sourceName][type][sourceName] || ZIWEI_DATA_ZIHUA[sourceName][type][sourceName + '宮'] || '';
                                    }
                                    if (!interpretation) interpretation = '(暫無自化象義)';
                                } else {
                                    displayTitle = sourceName + ' ' + type + '入 ' + targetTitle;
                                    interpretation = chart.getInterpretation(sourceName, type, targetTitle);
                                }

                                if (!interpretation) interpretation = '(暫無此象義)';

                                textContent += '[' + type + '] ' + targetStarName + ' ← ' + displayTitle + '\n';
                                textContent += interpretation + '\n\n';
                            }
                        }
                    });
                }
                textContent += '\n';
            });
            textContent += '='.repeat(50) + '\n\n';
        }

        // All Palace Pages
        function generatePalaceText(layerName, layerMingBranch) {
            const mingIdx = chart._getIndex(layerMingBranch);
            let text = layerName + '\n' + '='.repeat(50) + '\n\n';
            for (let i = 0; i < 12; i++) {
                let targetIdx = (mingIdx - i) % 12;
                if (targetIdx < 0) targetIdx += 12;
                let currentBranch = chart._getBranch(targetIdx);
                let pObj = chart.palaces[currentBranch];
                let stem = pObj.celestial;
                let layerTitle = chart.palaceNames[i];

                let layerPrefix = '';
                if (layerName.includes('大運')) layerPrefix = '大運';
                else if (layerName.includes('流年')) layerPrefix = '流年';
                else if (layerName.includes('本命')) layerPrefix = '本命';
                let displayLayerTitle = layerPrefix + layerTitle;

                text += displayLayerTitle + '（宮干：' + stem + ' | 位置：' + currentBranch + '）\n';
                text += '-'.repeat(50) + '\n';
                let transStars = chart.fourTransMap[stem];
                if (transStars) {
                    transStars.forEach((star, idx) => {
                        const type = chart.transTypes[idx];
                        const targetPalaceObj = Object.values(chart.palaces).find(obj => obj.stars.includes(star));
                        let displayTitle = '';
                        let interpretation = '';
                        if (targetPalaceObj) {
                            const targetTitle = targetPalaceObj.title;
                            const isZiHua = (layerTitle === targetTitle);
                            if (isZiHua) {
                                displayTitle = displayLayerTitle + ' 自化' + type;
                                if (typeof ZIWEI_DATA_ZIHUA !== 'undefined' && ZIWEI_DATA_ZIHUA[layerTitle] && ZIWEI_DATA_ZIHUA[layerTitle][type]) {
                                    interpretation = ZIWEI_DATA_ZIHUA[layerTitle][type][layerTitle] || ZIWEI_DATA_ZIHUA[layerTitle][type][layerTitle + '宮'] || '';
                                }
                                if (!interpretation) interpretation = '(暫無自化象義)';
                            } else {
                                displayTitle = displayLayerTitle + ' ' + type + '入 ' + targetTitle;
                                interpretation = chart.getInterpretation(layerTitle, type, targetTitle);
                            }
                        } else {
                            displayTitle = '未知宮位';
                        }
                        if (!interpretation) interpretation = '(暫無此象義)';
                        text += '\n[' + type + '] ' + star + ' → ' + displayTitle + '\n';
                        text += interpretation + '\n';
                    });
                }
                text += '\n';
            }
            return text;
        }


        textContent += generatePalaceText('本命各宮飛化', ui.mingPos.value);
        if (ui.dayunPos.value) textContent += generatePalaceText('大運各宮飛化', ui.dayunPos.value);
        if (ui.liunianPos.value) textContent += generatePalaceText('流年各宮飛化', ui.liunianPos.value);


        // --- Liang Pai Analysis Integration ---
        if (window.LiangLogic) {
            textContent += '\n梁派飛星・深度命盤解碼\n';
            textContent += '='.repeat(50) + '\n\n';

            try {
                // 0. Yearly Fortune
                const yearly = window.LiangLogic.analyzeYearlyFortune(chart);
                if (yearly) {
                    textContent += `【${yearly.trafficLight === 'Green' ? '🟢' : (yearly.trafficLight === 'Red' ? '🔴' : '🟡')} ${yearly.yearLabel} 運勢紅綠燈】\n`;
                    textContent += `年度主題：${yearly.theme}\n`;
                    textContent += `${yearly.summary}\n`;
                    textContent += `重點建議：${yearly.detailedAdvice}\n`;
                    if (yearly.reason) textContent += `飛化應期：${yearly.reason}\n`;
                    textContent += '\n';
                }

                // 1. Wealth
                const wealth = window.LiangLogic.analyzeWealthVault(chart);
                if (wealth) {
                    textContent += `${wealth.title} ${wealth.stars}\n`;
                    textContent += `判定：${wealth.result}\n`;
                    textContent += `${wealth.advice}\n`;
                    if (wealth.reason) textContent += `飛化軌跡：${wealth.reason.replace(/<br>/g, '\n')}\n`;
                    textContent += '\n';
                } else {
                    textContent += `【財運評估】 ⭐⭐⭐\n`;
                    textContent += `您的財運走勢較為平穩。建議多關注本命事業宮與財帛宮的星性互動，以專業技能穩步求財為佳。\n\n`;
                }

                // 2. Mental
                const mental = window.LiangLogic.analyzeMentalState(chart);
                if (mental) {
                    textContent += `${mental.title} ${mental.stars}\n`;
                    textContent += `${mental.advice}\n`;
                    if (mental.reason) textContent += `飛化軌跡：${mental.reason.replace(/<br>/g, '\n')}\n`;
                    textContent += '\n';
                }

                // 3. Advanced Insights
                const insights = window.LiangLogic.getPsychologicalInsight(chart);
                if (insights.length > 0) {
                    textContent += `【深層讀心與行為建議】\n`;
                    insights.forEach(item => {
                        textContent += `➤ ${item.tag}\n`;
                        textContent += `${item.insight}\n`;
                        textContent += `💡 處方：${item.advice}\n`;
                        if (item.reason) textContent += `🔍 軌跡：${item.reason.replace(/<br>/g, ' ')}\n`;
                        textContent += '\n';
                    });
                }

                // 4. Family
                const families = ["Spouse", "Child_1", "Father", "Mother"];
                let hasFamily = false;
                let familyText = "";
                families.forEach(rel => {
                    const analysis = window.LiangLogic.analyzeFamilyMember(chart, rel);
                    if (analysis && analysis.findings && analysis.findings.length > 0) {
                        hasFamily = true;
                        familyText += `${analysis.target} (借${analysis.palaceUsed}宮)\n`;
                        analysis.findings.forEach(f => {
                            familyText += `${f.icon} ${f.text}\n`;
                            if (f.reason) familyText += `   飛化：${f.reason}\n`;
                        });
                        familyText += '\n';
                    }
                });

                if (hasFamily) {
                    textContent += `【六親緣分掃描】\n`;
                    textContent += familyText;
                }

                textContent += '='.repeat(50) + '\n\n';

            } catch (e) {
                console.error("Error generating Liang text report", e);
            }
        }
        // --------------------------------------

        textContent += '\n生成時間：' + new Date().toLocaleString('zh-TW') + '\n';


        return textContent;
    }

    const exportTextBtn = document.getElementById('exportTextBtn');
    const exportStatus = document.getElementById('exportStatus');

    if (exportTextBtn) {
        exportTextBtn.addEventListener('click', () => {
            exportStatus.style.display = 'inline';
            exportStatus.textContent = '⏳ 生成中...';

            setTimeout(() => {
                try {
                    const textContent = generateExportText();

                    // Download
                    const blob = new Blob([textContent], { type: 'text/plain;charset=utf-8' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = '紫微斗數排盤解讀_' + new Date().toISOString().slice(0, 10) + '.txt';
                    a.click();
                    URL.revokeObjectURL(url);

                    exportStatus.textContent = '✓ 下載完成';
                    exportStatus.style.color = 'green';
                    setTimeout(() => { exportStatus.style.display = 'none'; }, 2000);

                } catch (err) {
                    exportStatus.textContent = '✗ 下載失敗';
                    exportStatus.style.color = 'red';
                    console.error('Text export error:', err);
                    setTimeout(() => { exportStatus.style.display = 'none'; }, 2000);
                }
            }, 100);
        });
    }

    // Copy Text Content Button
    const copyTextBtn = document.getElementById('copyTextBtn');
    const copyTextStatus = document.getElementById('copyTextStatus');

    if (copyTextBtn) {
        copyTextBtn.addEventListener('click', async () => {
            copyTextStatus.style.display = 'inline';
            copyTextStatus.textContent = '⏳ 處理中...';
            copyTextStatus.style.color = 'blue';

            try {
                const textContent = generateExportText();
                await navigator.clipboard.writeText(textContent);

                copyTextStatus.textContent = '✓ 已複製';
                copyTextStatus.style.color = 'green';
                setTimeout(() => { copyTextStatus.style.display = 'none'; }, 2000);
            } catch (err) {
                // Fallback for older browsers
                try {
                    const textContent = generateExportText();
                    const textArea = document.createElement('textarea');
                    textArea.value = textContent;
                    document.body.appendChild(textArea);
                    textArea.select();
                    document.execCommand('copy');
                    document.body.removeChild(textArea);

                    copyTextStatus.textContent = '✓ 已複製';
                    copyTextStatus.style.color = 'green';
                    setTimeout(() => { copyTextStatus.style.display = 'none'; }, 2000);
                } catch (fallbackErr) {
                    copyTextStatus.textContent = '✗ 複製失敗';
                    copyTextStatus.style.color = 'red';
                    console.error('Copy text error:', err);
                    setTimeout(() => { copyTextStatus.style.display = 'none'; }, 2000);
                }
            }
        });
    }

    // Export PDF Button (using browser print with custom content)
    const exportPdfBtn = document.getElementById('exportPdfBtn');
    const pdfStatus = document.getElementById('pdfStatus');

    if (exportPdfBtn) {
        exportPdfBtn.addEventListener('click', () => {
            pdfStatus.style.display = 'inline';
            pdfStatus.textContent = '⏳ 準備中...';
            pdfStatus.style.color = 'blue';

            setTimeout(() => {
                try {
                    // Create print window
                    const printWindow = window.open('', '_blank');

                    const textContent = generateExportText();

                    // Build HTML content
                    let htmlContent = `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>紫微斗數排盤解讀</title><style>
                        @page { size: A4; margin: 15mm; }
                        body { font-family: "Microsoft YaHei", Arial, sans-serif; font-size: 11px; line-height: 1.6; color: #333; margin: 0; padding: 0; }
                        .page-break { page-break-after: always; }
                        .title-page { padding: 20px; }
                        h1 { font-size: 24px; color: #d32f2f; margin: 20px 0; text-align: center; }
                        h2 { font-size: 16px; border-bottom: 2px solid #d32f2f; padding-bottom: 8px; margin: 15px 0 10px 0; }
                        .params { margin-bottom: 20px; }
                        .params p { margin: 5px 0; font-size: 13px; }
                        .chart-grid { display: grid; grid-template-columns: repeat(4, 1fr); grid-template-rows: repeat(4, 1fr); width: 100%; max-width: 780px; margin: 20px auto; border: 2px solid #333; }
                        .palace { border: 1px solid #666; padding: 10px; position: relative; text-align: center; min-height: 140px; font-size: 13px; background: white; }
                        .palace.is-ming { background-color: #fff3e0; }
                        .palace-title { position: absolute; bottom: 5px; right: 5px; font-weight: bold; font-size: 15px; color: #d32f2f; }
                        .celestial { color: #c00; font-weight: bold; font-size: 15px; margin-bottom: 5px; }
                        .name { font-size: 13px; color: #666; }
                        .star { font-size: 13px; margin: 2px 0; color: #333; font-weight: bold; }
                        .trans { color: #090; font-size: 11px; margin-top: 3px; }
                        .巳 { grid-column: 1; grid-row: 1; } .午 { grid-column: 2; grid-row: 1; } .未 { grid-column: 3; grid-row: 1; } .申 { grid-column: 4; grid-row: 1; }
                        .辰 { grid-column: 1; grid-row: 2; } .酉 { grid-column: 4; grid-row: 2; } .卯 { grid-column: 1; grid-row: 3; } .戌 { grid-column: 4; grid-row: 3; }
                        .寅 { grid-column: 1; grid-row: 4; } .丑 { grid-column: 2; grid-row: 4; } .子 { grid-column: 3; grid-row: 4; } .亥 { grid-column: 4; grid-row: 4; }
                        .center-info { grid-column: 2 / 4; grid-row: 2 / 4; background-color: rgba(255, 255, 255, 0.95); border: 1px solid #ddd; padding: 10px; font-size: 16px; display: flex; align-items: center; justify-content: center; text-align: center; color: #333; font-weight: bold; }
                        .dayun-title { position: absolute; top: 5px; right: 5px; font-size: 10px; color: #1976d2; font-weight: bold; }
                        .liunian-title { position: absolute; top: 5px; left: 5px; font-size: 10px; color: #388e3c; font-weight: bold; }
                        .trans-circle { display: inline-flex; align-items: center; justify-content: center; width: 14px; height: 14px; border-radius: 50%; color: white; font-size: 10px; font-weight: bold; margin-right: 2px; }
                        .trans-square { display: inline-flex; align-items: center; justify-content: center; width: 14px; height: 14px; border-radius: 2px; color: white; font-size: 10px; font-weight: bold; margin-right: 2px; }
                        .trans-circle-mini, .trans-square-mini { display: inline-flex; align-items: center; justify-content: center; width: 10px; height: 10px; color: white; font-weight: bold; font-size: 7px; margin-left: 2px; vertical-align: middle; }
                        .trans-circle-mini { border-radius: 50%; } .trans-square-mini { border-radius: 2px; }
                        .bg-lu { background-color: #d32f2f; } .bg-quan { background-color: #388e3c; } .bg-ke { background-color: #1976d2; } .bg-ji { background-color: #7b1fa2; }
                        .birth-trans-container { display: flex; flex-wrap: wrap; gap: 2px; justify-content: center; margin-top: 3px; }
                        .active-trans { display: flex; align-items: center; justify-content: center; margin-top: 2px; font-size: 10px; }
                        pre { white-space: pre-wrap; word-wrap: break-word; font-family: "Microsoft YaHei", Arial, sans-serif; font-size: 14px; line-height: 1.6; padding: 20px; }
                        @media print { .no-print { display: none; } }
                    </style></head><body>`;

                    // Generate chart HTML
                    function generateChartHTML() {
                        const typeMap = { '祿': 'lu', '權': 'quan', '科': 'ke', '忌': 'ji' };
                        const layoutOrder = ['巳', '午', '未', '申', '辰', '酉', '卯', '戌', '寅', '丑', '子', '亥'];
                        let chartHTML = '<div class="chart-grid">';
                        layoutOrder.forEach(b => {
                            const p = chart.palaces[b];
                            const classes = ['palace', b];
                            if (p.isMing) classes.push('is-ming');
                             const starsHtml = p.stars.map(s => {
                                 let icons = '';
                                 const bTrans = p.trans.find(t => t.star === s);
                                 if (bTrans) {
                                     icons += `<span class="trans-circle-mini bg-${typeMap[bTrans.type]}" style="width:10px;height:10px;font-size:7px;margin-left:2px;">${bTrans.type}</span>`;
                                 }
                                 const lifePalaceBranch = ui.mingPos.value;
                                 const lifePalace = chart.palaces[lifePalaceBranch];
                                 const lifeStem = lifePalace ? lifePalace.celestial : '';
                                 const lifeTransStars = chart.fourTransMap[lifeStem] || [];
                                 const lifeStarIdx = lifeTransStars.indexOf(s);
                                 if (lifeStarIdx !== -1) {
                                     const lType = chart.transTypes[lifeStarIdx];
                                     icons += `<span class="trans-square-mini bg-${typeMap[lType]}" style="width:10px;height:10px;font-size:7px;margin-left:2px;">${lType}</span>`;
                                 }
                                 return '<div class="star">' + s + icons + '</div>';
                             }).join('');
                             let transHtml = '';
                             // --- PDF Self-Transformation (自化) ---
                             let zihuaHtml = '';
                             const currentStem = p.celestial;
                             const selfTransStars = chart.fourTransMap[currentStem];
                             if (selfTransStars) {
                                 selfTransStars.forEach((star, idx) => {
                                     const type = chart.transTypes[idx];
                                     if (p.stars.includes(star)) {
                                         const colors = { '祿': '#d32f2f', '權': '#388e3c', '科': '#1976d2', '忌': '#7b1fa2' };
                                         const color = colors[type];
                                         zihuaHtml += `<div style="color: ${color}; border: 1px solid ${color}; padding: 0px 2px; border-radius: 2px; font-size: 7px; display: inline-block; margin-right: 2px; background:white; white-space:nowrap;">自化${type}</div>`;
                                     }
                                 });
                             }
                             if (zihuaHtml) {
                                 transHtml += `<div style="position:absolute; bottom:5px; left:5px; text-align:left; display:flex; flex-direction:column; gap:1px;">${zihuaHtml}</div>`;
                             }
                            let extraHtml = '';
                            if (ui.dayunPos.value) {
                                const mingIdx = chart._getIndex(ui.dayunPos.value);
                                const currentIdx = chart._getIndex(b);
                                let offset = (mingIdx - currentIdx) % 12;
                                if (offset < 0) offset += 12;
                                const title = chart.palaceNames[offset];
                                extraHtml += '<div class="dayun-title">大限' + title.replace('宮', '') + '</div>';
                            }
                            if (ui.liunianPos.value) {
                                const mingIdx = chart._getIndex(ui.liunianPos.value);
                                const currentIdx = chart._getIndex(b);
                                let offset = (mingIdx - currentIdx) % 12;
                                if (offset < 0) offset += 12;
                                const title = chart.palaceNames[offset];
                                extraHtml += '<div class="liunian-title">流年' + title.replace('宮', '') + '</div>';
                            }
                            chartHTML += '<div class="' + classes.join(' ') + '"><div class="palace-title">' + p.title + '</div><div class="celestial">' + p.celestial + '</div><div class="name">' + p.name + '</div>' + starsHtml + transHtml + extraHtml + '</div>';
                        });
                        chartHTML += '<div class="center-info">紫微斗數命盤</div></div>';
                        return chartHTML;
                    }

                    // Add chart at top
                    htmlContent += '<div class="title-page page-break"><h1>紫微斗數排盤解讀</h1><div class="params"><h2>命盤參數</h2>';
                    htmlContent += '<p><strong>出生年天干：</strong>' + ui.birthStem.value + ' | <strong>寅宮天干：</strong>' + ui.yinStem.value + '</p>';
                    htmlContent += '<p><strong>命宮位置：</strong>' + ui.mingPos.value + ' | <strong>紫微位置：</strong>' + ui.ziweiPos.value + '</p>';
                    htmlContent += '<p><strong>文曲：</strong>' + ui.wenquPos.value + ' | <strong>文昌：</strong>' + ui.wenchangPos.value + ' | <strong>左輔：</strong>' + ui.zuofuPos.value + ' | <strong>右弼：</strong>' + ui.youbiPos.value + '</p>';
                    if (ui.dayunPos.value) htmlContent += '<p><strong>大運命宮：</strong>' + ui.dayunPos.value + '</p>';
                    if (ui.liunianPos.value) htmlContent += '<p><strong>流年命宮：</strong>' + ui.liunianPos.value + '</p>';
                    htmlContent += '</div>' + generateChartHTML() + '</div>';

                    htmlContent += '<pre>' + textContent.replace(/</g, '&lt;').replace(/>/g, '&gt;') + '</pre>';

                    htmlContent += '</body></html>';

                    // Write and print
                    printWindow.document.write(htmlContent);
                    printWindow.document.close();
                    printWindow.onload = function () {
                        setTimeout(() => { printWindow.print(); }, 500);
                    };

                    pdfStatus.textContent = '✓ 請在列印對話框選擇「另存為 PDF」';
                    pdfStatus.style.color = 'green';
                    setTimeout(() => {
                        pdfStatus.style.display = 'none';
                        pdfStatus.textContent = '⏳ 生成中...';
                        pdfStatus.style.color = 'blue';
                    }, 5000);

                } catch (err) {
                    pdfStatus.textContent = '✗ 生成失敗';
                    pdfStatus.style.color = 'red';
                    console.error('PDF export error:', err);
                    setTimeout(() => { pdfStatus.style.display = 'none'; }, 2000);
                }
            }, 100);
        });
    }

    // Reactivity (Event Delegation)
    ui.chartContainer.addEventListener('click', (e) => {
        // Handle Celestial Stem Click (Existing)
        if (e.target.classList.contains('celestial')) {
            const palaceDiv = e.target.closest('.palace');
            if (palaceDiv) {
                const branch = palaceDiv.dataset.branch;
                if (activeSourceBranches.has(branch)) {
                    activeSourceBranches.delete(branch);
                } else {
                    activeSourceBranches.add(branch);
                }
                render();
            }
        }

        // Handle Star Click (New)
        const starEl = e.target.closest('.star');
        if (starEl) {
            const starName = starEl.dataset.star;

            // Toggle arrow visualization
            if (activeTargetStars.has(starName)) {
                activeTargetStars.delete(starName);
            } else {
                activeTargetStars.add(starName);
            }
            render();

            let data = null;

            // Try to find star data in global ZIWEI_DATA_MAIN_STARS
            if (typeof ZIWEI_DATA_MAIN_STARS !== 'undefined') {
                // Keys in data usually have '星' suffix, e.g. "紫微星"
                data = ZIWEI_DATA_MAIN_STARS[starName] || ZIWEI_DATA_MAIN_STARS[starName + '星'];
            }

            const midPanel = document.getElementById('mid-panel');
            if (midPanel && data) {
                // Format and display star data in center panel
                let html = `<h3>【${starName}】星曜特質分析</h3>`;

                html += `<div class="analysis-item" style="max-height: 400px; overflow-y: auto;">`;

                if (typeof data === 'string') {
                    html += `<p style="white-space: pre-wrap; line-height: 1.6;">${data}</p>`;
                } else {
                    if (data["代表人物"]) html += `<p><strong>代表人物：</strong>${data["代表人物"]}</p>`;
                    if (data["五行"]) html += `<p><strong>五行：</strong>${data["五行"]}</p>`;

                    if (data["特質"] && Array.isArray(data["特質"])) {
                        html += `<p><strong>特質：</strong></p><ul>`;
                        data["特質"].forEach(item => html += `<li>${item}</li>`);
                        html += `</ul>`;
                    } else if (data["特質"] && typeof data["特質"] === 'string') {
                        html += `<p><strong>特質：</strong><br><span style="white-space: pre-wrap;">${data["特質"]}</span></p>`;
                    }

                    if (data["身體部位_化忌"]) {
                        html += `<p><strong>身體部位_化忌：</strong></p>`;
                        if (Array.isArray(data["身體部位_化忌"])) {
                            html += `<ul>`;
                            data["身體部位_化忌"].forEach(item => html += `<li>${item}</li>`);
                            html += `</ul>`;
                        } else {
                            html += `<p>${data["身體部位_化忌"]}</p>`;
                        }
                    }

                    if (data["四化"]) {
                        html += `<p><strong>四化：</strong></p><ul>`;
                        const trans = data["四化"];
                        if (trans["化祿"]) html += `<li><span style="color:#d32f2f">化祿</span>：${trans["化祿"]}</li>`;
                        if (trans["化權"]) html += `<li><span style="color:#388e3c">化權</span>：${trans["化權"]}</li>`;
                        if (trans["化科"]) html += `<li><span style="color:#1976d2">化科</span>：${trans["化科"]}</li>`;
                        if (trans["化忌"]) html += `<li><span style="color:#7b1fa2">化忌</span>：${trans["化忌"]}</li>`;
                        html += `</ul>`;
                    }

                    if (data["化象註解"] && Array.isArray(data["化象註解"])) {
                        html += `<p><strong>化象註解：</strong></p><ul>`;
                        data["化象註解"].forEach(item => html += `<li>${item}</li>`);
                        html += `</ul>`;
                    }

                    // Fallback for flat object properties that are not handled above
                    for (const key in data) {
                        if (!["代表人物", "五行", "特質", "身體部位_化忌", "四化", "化象註解"].includes(key)) {
                            const val = data[key];
                            if (typeof val === 'string' || typeof val === 'number') {
                                html += `<p><strong>${key}：</strong><br><span style="white-space: pre-wrap;">${val}</span></p>`;
                            } else if (Array.isArray(val)) {
                                html += `<p><strong>${key}：</strong></p><ul>`;
                                val.forEach(item => html += `<li>${item}</li>`);
                                html += `</ul>`;
                            }
                        }
                    }
                }

                html += `</div>`;

                midPanel.innerHTML = html;
            } else if (midPanel) {
                midPanel.innerHTML = `<h3>【${starName}】</h3><p style="text-align:center;">暫無此星曜詳細資料。</p>`;
            }
        }

        // Handle Palace Title Click (New)
        if (e.target.classList.contains('palace-title')) {
            const palaceName = e.target.innerText.trim();
            let data = null;

            // Try to find palace data in global ZIWEI_DATA_PALACE_MEANING
            if (typeof ZIWEI_DATA_PALACE_MEANING !== 'undefined') {
                data = ZIWEI_DATA_PALACE_MEANING[palaceName] || ZIWEI_DATA_PALACE_MEANING[palaceName + '宮'] || ZIWEI_DATA_PALACE_MEANING[palaceName.replace('宮', '')];
            }

            const midPanel = document.getElementById('mid-panel');
            if (midPanel && data) {
                let html = `<h3>【${palaceName}】宮位意義</h3>`;
                html += `<div class="analysis-item" style="max-height: 400px; overflow-y: auto;">`;

                if (typeof data === 'string') {
                    html += `<p style="white-space: pre-wrap; line-height: 1.6;">${data}</p>`;
                } else if (Array.isArray(data)) {
                    html += `<ul>`;
                    data.forEach(item => html += `<li>${item}</li>`);
                    html += `</ul>`;
                } else if (typeof data === 'object') {
                    for (const key in data) {
                        const val = data[key];
                        if (typeof val === 'string' || typeof val === 'number') {
                            html += `<p><strong>${key}：</strong><br><span style="white-space: pre-wrap; line-height: 1.6;">${val}</span></p>`;
                        } else if (Array.isArray(val)) {
                            html += `<p><strong>${key}：</strong></p><ul>`;
                            val.forEach(item => html += `<li>${item}</li>`);
                            html += `</ul>`;
                        }
                    }
                }
                html += `</div>`;
                midPanel.innerHTML = html;
            } else if (midPanel) {
                midPanel.innerHTML = `<h3>【${palaceName}】</h3><p style="text-align:center;">暫無此宮位詳細資料。</p>`;
            }
        }

        // Handle Earthly Branch (name) Click for Copying Content
        if (e.target.classList.contains('name')) {
            try {
                // Sanitize branch name: remove '宮' to match '子', '丑' etc.
                const branch = e.target.innerText.trim().replace('宮', '');
                const p = chart.palaces[branch];
                if (!p) {
                    console.error('Palace not found for branch:', branch);
                    return;
                }

                const palaceTitle = p.title || '未知宮位';
                const celestial = p.celestial || '';

                // Helper to get layered role for a branch
                const getLayeredRole = (targetBranch) => {
                    const targetP = chart.palaces[targetBranch];
                    const roles = {
                        benming: targetP.title.replace('宮', ''),
                        dayun: '無',
                        liunian: '無'
                    };

                    if (ui.dayunPos.value) {
                        const dayunMingIdx = chart._getIndex(ui.dayunPos.value);
                        const targetIdx = chart._getIndex(targetBranch);
                        let offset = (dayunMingIdx - targetIdx) % 12;
                        if (offset < 0) offset += 12;
                        roles.dayun = chart.palaceNames[offset].replace('宮', '');
                    }
                    if (ui.liunianPos.value) {
                        const liunianMingIdx = chart._getIndex(ui.liunianPos.value);
                        const targetIdx = chart._getIndex(targetBranch);
                        let offset = (liunianMingIdx - targetIdx) % 12;
                        if (offset < 0) offset += 12;
                        roles.liunian = chart.palaceNames[offset].replace('宮', '');
                    }
                    return roles;
                };

                const currentRoles = getLayeredRole(branch);
                
                // Get self-transformation
                let zihua = [];
                if (celestial && chart.fourTransMap[celestial]) {
                    const selfTransStars = chart.fourTransMap[celestial];
                    selfTransStars.forEach((star, idx) => {
                        if (p.stars && p.stars.includes(star)) {
                            zihua.push(`自化${chart.transTypes[idx]}`);
                        }
                    });
                }

                // Get ALL incoming flying stars
                let allIncomingTrans = [];
                Object.entries(chart.palaces).forEach(([srcBranch, srcPalace]) => {
                    if (!srcPalace) return;
                    const srcStem = srcPalace.celestial;
                    if (!srcStem || !chart.fourTransMap[srcStem]) return;
                    
                    const srcTransStars = chart.fourTransMap[srcStem];
                    srcTransStars.forEach((star, idx) => {
                        if (p.stars && p.stars.includes(star)) {
                            const type = chart.transTypes[idx];
                            const srcRoles = getLayeredRole(srcBranch);
                            const srcStackStr = `本命${srcRoles.benming} + 大限${srcRoles.dayun} + 流年${srcRoles.liunian}`;
                            allIncomingTrans.push(`  - [${type}] ${star} 來自 [ ${srcStackStr} ] [${srcStem}干]`);
                        }
                    });
                });

                // Prepare Content for Copy
                const instruction = `【AI 解讀指令】\n這是一份紫微斗數命盤的宮位詳細資訊，包含「本命、大限、流年」的疊宮狀態以及「宮位飛化」的動態軌跡。請你扮演一位專業的紫微斗數老師，結合這些疊宮象義與飛星動能，為我深入診斷此宮位的吉凶象義、潛在事件以及建議。\n------------------------------------------------`;
                
                let content = instruction + `\n\n`;
                content += `◎ 宮位重疊 (疊宮) 資訊：\n`;
                content += `【地支：${branch}宮 | 宮干：${celestial}】\n`;
                content += `● 本命層級：${currentRoles.benming}\n`;
                content += `● 大限層級：${currentRoles.dayun}\n`;
                content += `● 流年層級：${currentRoles.liunian}\n\n`;

                let starList = (p.stars || []).join('、');
                content += `◎ 星曜組成：\n`;
                content += `${starList}\n\n`;

                const birthTrans = (p.trans || []).map(t => `${t.star}${t.type}`).join('、');
                if (birthTrans) content += `◎ 先天基調 (生年四化)：\n${birthTrans}\n\n`;
                
                // Get self-transformation list for display
                let selfTransDisplay = [];
                if (celestial && chart.fourTransMap[celestial]) {
                    const selfTransStars = chart.fourTransMap[celestial];
                    selfTransStars.forEach((star, idx) => {
                        if (p.stars && p.stars.includes(star)) {
                            selfTransDisplay.push(`自化${chart.transTypes[idx]}`);
                        }
                    });
                }
                if (selfTransDisplay.length > 0) content += `◎ 變動現象 (自化)：\n${selfTransDisplay.join('、')}\n\n`;
                
                if (allIncomingTrans.length > 0) {
                    content += `◎ 氣數匯聚 (各宮飛入此宮之資訊)：\n`;
                    content += `${allIncomingTrans.join('\n')}\n\n`;
                }
                
                if (celestial && chart.fourTransMap[celestial]) {
                    const flyTrans = chart.fourTransMap[celestial];
                    content += `◎ 四化飛伏 (以此宮宮干 ${celestial} 飛出之資訊)：\n`;
                    flyTrans.forEach((star, idx) => {
                        const type = chart.transTypes[idx];
                        const targetPalace = Object.values(chart.palaces).find(tp => tp.stars && tp.stars.includes(star));
                        if (targetPalace) {
                            const targetBranch = Object.keys(chart.palaces).find(key => chart.palaces[key] === targetPalace);
                            const targetRoles = getLayeredRole(targetBranch);
                            const targetStackStr = `本命${targetRoles.benming} + 大限${targetRoles.dayun} + 流年${targetRoles.liunian}`;
                            content += `  - [${type}] ${star} ➜ [ ${targetStackStr} ]\n`;
                        } else {
                            content += `  - [${type}] ${star} ➜ [ 未知 ]\n`;
                        }
                    });
                    content += `\n`;
                }

                // Show Modal with dedicated Textarea for easy copy
                const modal = document.createElement('div');
                modal.className = 'modal-overlay';
                modal.innerHTML = `
                    <div class="modal-content">
                        <div class="modal-header">宮位詳情 - ${palaceTitle}</div>
                        <div class="modal-body">
                            <div style="font-size: 0.85em; color: #666; margin-bottom: 8px;">內容已包含完整指令，點擊一鍵複製後即可直接貼給 Gemini：</div>
                            <textarea id="copyTargetText" style="width: 100%; height: 260px; padding: 12px; font-family: 'Consolas', monospace; font-size: 13px; border: 1px solid #ddd; border-radius: 4px; background: #fdfdfd; resize: none; line-height: 1.5;" readonly>${content}</textarea>
                        </div>
                        <div class="modal-footer">
                            <button class="modal-btn secondary close-modal">關閉</button>
                            <button class="modal-btn primary copy-modal-content">一鍵複製</button>
                        </div>
                    </div>
                `;
                document.body.appendChild(modal);

                const textarea = modal.querySelector('#copyTargetText');
                textarea.onclick = function() { this.select(); };

                modal.querySelector('.close-modal').onclick = () => modal.remove();
                modal.onclick = (ev) => { if (ev.target === modal) modal.remove(); };
                
                modal.querySelector('.copy-modal-content').onclick = function() {
                    const btn = this;
                    textarea.select();
                    textarea.setSelectionRange(0, 99999);
                    
                    let success = false;
                    try {
                        success = document.execCommand('copy');
                    } catch (err) {
                        console.error('execCommand Error:', err);
                    }

                    if (!success && navigator.clipboard) {
                        navigator.clipboard.writeText(textarea.value).then(() => {
                            updateStatus(btn);
                        }).catch(err => {
                            console.error('Clipboard API Error:', err);
                            // Last resort
                            window.prompt("按 Ctrl+C 複製下方的文字：", textarea.value);
                        });
                    } else if (success) {
                        updateStatus(btn);
                    } else {
                        window.prompt("複製失敗，請手動複製下方文字：", textarea.value);
                    }
                };

                function updateStatus(btn) {
                    const oldText = btn.textContent;
                    btn.textContent = '✓ 已複製';
                    btn.style.backgroundColor = '#4caf50';
                    setTimeout(() => {
                        btn.textContent = oldText;
                        btn.style.backgroundColor = '';
                    }, 2000);
                }
            } catch (err) {
                console.error('Palace Click Error:', err);
                alert('開啟詳細資料時發生錯誤：' + err.message);
            }
        }
    });

    // Clear Arrows Button
    if (ui.clearArrowsBtn) {
        ui.clearArrowsBtn.addEventListener('click', () => {
            activeSourceBranches.clear();
            activeTargetStars.clear();
            render();
        });
    }

    // Initialize Palace Filter
    initializePalaceFilter();

    // Initial Render
    render();
});

