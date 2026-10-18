/**
 * ScanPulse - Vanilla JavaScript Script File
 * Tagline: Scan. Track. Optimize.
 * 
 * Step-by-step comments are included below so you can easily explain 
 * state management, DOM manipulation, and asynchronous API calls during your viva.
 */

// Initial array containing dummy history records (simulating MERN database records)
let historyData = [
    {
        id: 1,
        url: 'https://scanpulse.io/promo-summer',
        category: 'Marketing',
        date: '2026-10-10 14:32',
        scans: 142
    },
    {
        id: 2,
        url: 'https://github.com/scanpulse/mern-app',
        category: 'General',
        date: '2026-10-11 09:15',
        scans: 89
    }
];

let activeQRCodeUrl = null;
let activeTargetUrl = '';

// DOM Element Selectors
const qrForm = document.getElementById('qrForm');
const urlInput = document.getElementById('urlInput');
const categorySelect = document.getElementById('categorySelect');
const fgColorInput = document.getElementById('fgColorInput');
const bgColorInput = document.getElementById('bgColorInput');
const fgColorText = document.getElementById('fgColorText');
const bgColorText = document.getElementById('bgColorText');
const generateBtn = document.getElementById('generateBtn');
const btnText = document.getElementById('btnText');
const errorMsg = document.getElementById('errorMsg');

const emptyState = document.getElementById('emptyState');
const qrOutputWrapper = document.getElementById('qrOutputWrapper');
const qrImage = document.getElementById('qrImage');
const targetUrlLabel = document.getElementById('targetUrlLabel');
const downloadBtn = document.getElementById('downloadBtn');
const copyBtn = document.getElementById('copyBtn');
const copyText = document.getElementById('copyText');
const historyTableBody = document.getElementById('historyTableBody');
const totalCountBadge = document.getElementById('totalCountBadge');

// Update color hex code text labels live as the user picks custom colors
fgColorInput.addEventListener('input', (e) => {
    fgColorText.textContent = e.target.value.toUpperCase();
});

bgColorInput.addEventListener('input', (e) => {
    bgColorText.textContent = e.target.value.toUpperCase();
});

// Function to render and update the Analytics & History Dashboard table
function renderHistoryTable() {
    historyTableBody.innerHTML = '';
    
    if (historyData.length === 0) {
        historyTableBody.innerHTML = `
            <tr>
                <td colspan="4" class="py-12 text-center text-slate-400 text-sm">
                    No QR codes generated yet. Create your first code above!
                </td>
            </tr>
        `;
    } else {
        historyData.forEach(item => {
            const row = document.createElement('tr');
            row.className = 'hover:bg-slate-50/60 transition-colors';
            row.innerHTML = `
                <td class="py-4 px-6 font-medium text-slate-800 max-w-xs truncate">
                    <span class="block truncate">${escapeHtml(item.url)}</span>
                </td>
                <td class="py-4 px-6">
                    <span class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700">
                        ${escapeHtml(item.category)}
                    </span>
                </td>
                <td class="py-4 px-6 text-slate-500 text-xs font-medium">
                    ${escapeHtml(item.date)}
                </td>
                <td class="py-4 px-6 text-center">
                    <span class="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-600 border border-emerald-200/50">
                        <svg class="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                            <path fill-rule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clip-rule="evenodd" />
                        </svg>
                        ${item.scans} scans
                    </span>
                </td>
            `;
            historyTableBody.appendChild(row);
        });
    }

    totalCountBadge.textContent = `Total Generated: ${historyData.length}`;
}

// Utility function to prevent XSS attacks when inserting user data into innerHTML
function escapeHtml(str) {
    return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

// QR Generation Form Event Listener with Error Handling & Asynchronous API Call
qrForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const targetUrl = urlInput.value.trim();

    // 1. Error & Validation Handling (Friendly message if empty)
    if (!targetUrl) {
        errorMsg.textContent = 'Please enter a valid link or URL.';
        errorMsg.classList.remove('hidden');
        errorMsg.classList.add('flex', 'animate-fadeIn');
        urlInput.classList.add('border-rose-300', 'focus:border-rose-500');
        return;
    }

    // Clear previous error states
    errorMsg.classList.add('hidden');
    urlInput.classList.remove('border-rose-300', 'focus:border-rose-500');

    // 2. Loading State (Smooth loading indicator on button)
    generateBtn.disabled = true;
    btnText.textContent = 'Generating Smart QR...';

    try {
        const cleanFg = fgColorInput.value.replace('#', '');
        const cleanBg = bgColorInput.value.replace('#', '');
        const encodedUrl = encodeURIComponent(targetUrl);

        // Fetching QR image blob from public QR generator API (simulating backend API response)
        const apiEndpoint = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodedUrl}&color=${cleanFg}&bgcolor=${cleanBg}`;
        
        const response = await fetch(apiEndpoint);
        if (!response.ok) throw new Error('Failed to fetch QR image from server.');

        const blob = await response.blob();
        activeQRCodeUrl = URL.createObjectURL(blob);
        activeTargetUrl = targetUrl;

        // Generate timestamp for the new record
        const now = new Date();
        const formattedDate = now.toISOString().replace('T', ' ').substring(0, 16);

        const newItem = {
            id: Date.now(),
            url: targetUrl,
            category: categorySelect.value,
            date: formattedDate,
            scans: Math.floor(Math.random() * 20) // Random initial analytics scan count
        };

        // Update history array and re-render dashboard table
        historyData.unshift(newItem);
        renderHistoryTable();

        // Update Preview Panel View
        emptyState.classList.add('hidden');
        qrOutputWrapper.classList.remove('hidden');
        qrImage.src = activeQRCodeUrl;
        targetUrlLabel.textContent = `Target: ${targetUrl}`;

        // Enable action buttons
        downloadBtn.disabled = false;
        copyBtn.disabled = false;

    } catch (err) {
        console.error('API Error:', err);
        errorMsg.textContent = 'Failed to generate QR code. Please check your internet connection.';
        errorMsg.classList.remove('hidden');
        errorMsg.classList.add('flex');
    } finally {
        // Reset button state
        generateBtn.disabled = false;
        btnText.textContent = 'Generate QR Code';
    }
});

// Download PNG Button Event Handler
downloadBtn.addEventListener('click', () => {
    if (!activeQRCodeUrl) return;
    const a = document.createElement('a');
    a.href = activeQRCodeUrl;
    a.download = `ScanPulse-QR-${Date.now()}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
});

// Copy Tracking Link Button Event Handler
copyBtn.addEventListener('click', () => {
    if (!activeTargetUrl) return;
    navigator.clipboard.writeText(activeTargetUrl).then(() => {
        copyText.textContent = 'Copied!';
        setTimeout(() => {
            copyText.textContent = 'Copy Tracking Link';
        }, 2500);
    });
});

// Initial render call when the page loads
renderHistoryTable();