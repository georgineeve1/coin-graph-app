// State
let selectedGraphType = null;

// Colors mapping for logic
const colors = {
    A: { bg: 'bg-red-400', text: 'text-red-600', border: 'border-red-400', hex: '#F87171' },
    B: { bg: 'bg-blue-400', text: 'text-blue-600', border: 'border-blue-400', hex: '#60A5FA' },
    C: { bg: 'bg-yellow-400', text: 'text-yellow-600', border: 'border-yellow-400', hex: '#FACC15' }
};

// UI Helpers
function selectType(type) {
    selectedGraphType = type;
    // Reset styles
    document.querySelectorAll('.graph-btn').forEach(btn => {
        btn.classList.remove('bg-indigo-100', 'border-indigo-500', 'text-indigo-700');
        btn.classList.add('border-gray-200', 'text-gray-600');
    });
    // Highlight selected
    const activeBtn = document.getElementById(`btn-${type}`);
    activeBtn.classList.remove('border-gray-200', 'text-gray-600');
    activeBtn.classList.add('bg-indigo-100', 'border-indigo-500', 'text-indigo-700');
}

function restartApp() {
    document.getElementById('inputA').value = '';
    document.getElementById('inputB').value = '';
    document.getElementById('inputC').value = '';
    selectedGraphType = null;
    
    // Reset buttons
    document.querySelectorAll('.graph-btn').forEach(btn => {
        btn.classList.remove('bg-indigo-100', 'border-indigo-500', 'text-indigo-700');
        btn.classList.add('border-gray-200', 'text-gray-600');
    });

    // Reset view
    document.getElementById('graph-container').innerHTML = '';
    document.getElementById('graph-container').classList.add('hidden');
    document.getElementById('placeholder').classList.remove('hidden');
    document.getElementById('error-msg').classList.add('hidden');
}

function generateGraph() {
    // 1. Get Values
    const valA = parseInt(document.getElementById('inputA').value) || 0;
    const valB = parseInt(document.getElementById('inputB').value) || 0;
    const valC = parseInt(document.getElementById('inputC').value) || 0;
    const total = valA + valB + valC;

    // 2. Validation
    const errorBox = document.getElementById('error-msg');
    if (total === 0) {
        errorBox.textContent = "Please put some numbers first!";
        errorBox.classList.remove('hidden');
        return;
    }
    if (!selectedGraphType) {
        errorBox.textContent = "Please pick a graph type!";
        errorBox.classList.remove('hidden');
        return;
    }
    errorBox.classList.add('hidden');

    // 3. Show Container
    const container = document.getElementById('graph-container');
    const placeholder = document.getElementById('placeholder');
    placeholder.classList.add('hidden');
    container.classList.remove('hidden');
    container.innerHTML = ''; // Clear previous

    // 4. Render Logic based on type
    if (selectedGraphType === 'bar') renderBarGraph(valA, valB, valC, total);
    if (selectedGraphType === 'picture') renderPictureGraph(valA, valB, valC);
    if (selectedGraphType === 'pie') renderPieGraph(valA, valB, valC, total);
}

// --- RENDER FUNCTIONS ---

function renderBarGraph(a, b, c, total) {
    const max = Math.max(a, b, c, 1);
    const isMobile = window.innerWidth < 768; // Check for mobile width
    const data = [
        { label: 'Coin A', val: a, color: colors.A, key: 'A' },
        { label: 'Coin B', val: b, color: colors.B, key: 'B' },
        { label: 'Coin C', val: c, color: colors.C, key: 'C' }
    ];

    let html = '';

    if (isMobile) {
        // --- MOBILE: HORIZONTAL BARS ---
        html = `<div class="flex flex-col gap-6 w-full p-4 pop-in">`;
        data.forEach(item => {
            const percent = (item.val / max) * 100;
            html += `
                <div class="space-y-2">
                    <div class="flex justify-between font-bold text-gray-600">
                        <span>${item.label}</span>
                        <span>${item.val}</span>
                    </div>
                    <div class="w-full bg-gray-200 rounded-full h-8 overflow-hidden shadow-inner">
                        <div style="width: ${percent}%" 
                             class="${item.color.bg} h-full rounded-full transition-all duration-1000">
                        </div>
                    </div>
                </div>
            `;
        });
        html += `</div>`;
    } else {
        // --- DESKTOP: VERTICAL X/Y AXIS ---
        const mid = Math.floor(max / 2);
        html = `
        <div class="flex h-full w-full p-10 pop-in relative select-none">
            <div class="flex flex-col justify-between items-end pr-3 text-gray-400 font-bold text-sm h-[85%] mb-10">
                <span>${max}</span><span>${mid}</span><span>0</span>
            </div>
            <div class="flex-grow flex items-end justify-around border-l-4 border-b-4 border-gray-300 h-[85%] relative bg-white/30 rounded-br-lg">
                ${data.map(item => {
                    const percent = (item.val / max) * 100;
                    return `
                    <div class="flex flex-col items-center justify-end w-1/5 h-full relative group">
                        <div class="absolute -top-8 bg-indigo-600 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                            ${item.val}
                        </div>
                        <div style="height: ${percent}%; min-height: 4px;" 
                             class="${item.color.bg} w-full rounded-t-md shadow-md transition-all duration-700 hover:brightness-110">
                        </div>
                        <div class="absolute -bottom-10 text-center">
                            <p class="font-bold text-gray-500 uppercase text-sm">${item.key}</p>
                        </div>
                    </div>`;
                }).join('')}
                <div class="absolute top-0 left-0 w-full border-t border-gray-200 border-dashed pointer-events-none"></div>
                <div class="absolute top-1/2 left-0 w-full border-t border-gray-200 border-dashed pointer-events-none"></div>
            </div>
            <div class="absolute -left-6 top-1/2 -rotate-90 text-indigo-300 font-bold tracking-widest text-[10px] uppercase">Quantity</div>
            <div class="absolute bottom-2 left-1/2 -translate-x-1/2 text-indigo-300 font-bold tracking-widest text-[10px] uppercase">Categories</div>
        </div>`;
    }

    document.getElementById('graph-container').innerHTML = html;
}

function renderPictureGraph(a, b, c) {
    const createRow = (label, count, colorObj) => {
        let coins = '';
        for(let i=0; i<count; i++) {
            coins += `<span class="text-4xl shadow-sm rounded-full bg-white m-1">🟡</span>`; // Using coin emoji
        }
        if(count === 0) coins = `<span class="text-gray-400 italic text-lg ml-2">No coins</span>`;

        return `
            <div class="mb-4 bg-white p-3 rounded-xl shadow-sm border-2 ${colorObj.border} pop-in">
                <div class="flex items-center mb-2">
                    <span class="font-bold text-xl w-24 ${colorObj.text}">${label}</span>
                    <span class="bg-gray-100 px-3 py-1 rounded-full font-bold text-gray-600">${count}</span>
                </div>
                <div class="flex flex-wrap pl-2">
                    ${coins}
                </div>
            </div>
        `;
    };

    const html = `
        <div class="h-full overflow-y-auto p-2">
            ${createRow('Coin A', a, colors.A)}
            ${createRow('Coin B', b, colors.B)}
            ${createRow('Coin C', c, colors.C)}
        </div>
    `;
    document.getElementById('graph-container').innerHTML = html;
}

function renderPieGraph(a, b, c, total) {
    // Calculate degrees
    const degA = (a / total) * 360;
    const degB = (b / total) * 360;
    
    // Conic Gradient Logic
    // Red starts at 0, ends at degA
    // Blue starts at degA, ends at degA + degB
    // Yellow starts at degA + degB, ends at 360
    const stop1 = degA;
    const stop2 = degA + degB;

    const html = `
        <div class="flex flex-col items-center justify-center h-full pop-in">
            <div class="relative w-64 h-64 md:w-80 md:h-80 rounded-full shadow-2xl border-4 border-white"
                style="background: conic-gradient(
                    ${colors.A.hex} 0deg ${stop1}deg, 
                    ${colors.B.hex} ${stop1}deg ${stop2}deg, 
                    ${colors.C.hex} ${stop2}deg 360deg
                );">
            </div>
            
            <div class="flex gap-6 mt-8 bg-white p-4 rounded-xl shadow-md">
                <div class="flex items-center gap-2">
                    <div class="w-6 h-6 rounded bg-red-400"></div>
                    <span class="font-bold text-gray-600">A (${a})</span>
                </div>
                <div class="flex items-center gap-2">
                    <div class="w-6 h-6 rounded bg-blue-400"></div>
                    <span class="font-bold text-gray-600">B (${b})</span>
                </div>
                <div class="flex items-center gap-2">
                    <div class="w-6 h-6 rounded bg-yellow-400"></div>
                    <span class="font-bold text-gray-600">C (${c})</span>
                </div>
            </div>
        </div>
    `;
    document.getElementById('graph-container').innerHTML = html;
}