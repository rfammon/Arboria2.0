
const express = require('express');
const puppeteer = require('puppeteer');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// HARDENING: Allow ALL possible Tauri origins and local dev
app.use(cors({
    origin: [
        'tauri://localhost',
        'http://tauri.localhost',
        'https://tauri.localhost',
        'http://localhost',
        'http://127.0.0.1',
        'http://localhost:5173',
        'http://localhost:3000',
        'http://localhost:3001'
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json({ limit: '200mb' }));

// Helper: Delay
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Helper: Retry operation
async function retryOperation(operation, maxRetries = 3, delayMs = 1000) {
    let lastError;
    for (let i = 0; i < maxRetries; i++) {
        try {
            return await operation();
        } catch (error) {
            console.warn(`Attempt ${i + 1} failed: ${error.message}`);
            lastError = error;
            if (i < maxRetries - 1) await delay(delayMs);
        }
    }
    throw lastError;
}

async function getBrowser() {
    return puppeteer.launch({
        headless: 'new',
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-gpu',
            '--disable-software-rasterizer',
            '--use-gl=swiftshader',
            '--disable-features=IsolateOrigins,site-per-process',
            '--mute-audio',
            '--window-size=1200,800',
            '--hide-scrollbars'
        ]
    });
}

// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'ok', service: 'ArborIA Report Service v1.1' });
});

const reportRouter = express.Router();

reportRouter.post('/generate-report', async (req, res) => {
    console.log('Received report generation request');
    const { installation, stats, trees } = req.body;

    if (!installation || !trees) {
        return res.status(400).json({ error: 'Missing data' });
    }

    let browser;
    let page;
    try {
        console.log('Launching Puppeteer browser (Per-Request)...');
        // Retry browser launch
        browser = await retryOperation(() => getBrowser(), 3, 2000);
        page = await browser.newPage();

        // Hardening Viewport
        await page.setViewport({ width: 1200, height: 800 });
        await page.emulateMediaType('print');

        // Debugging logs
        page.on('console', msg => console.log('BROWSER LOG:', msg.text()));
        page.on('pageerror', err => console.log('BROWSER ERROR:', err));
        page.on('requestfailed', request => {
            console.log(`[!] Request failed: ${request.url()} - ${request.failure().errorText}`);
        });

        const treesJson = JSON.stringify(trees);

        // Map Style
        const mapStyle = JSON.stringify({
            version: 8,
            sources: {
                'satellite': {
                    type: 'raster',
                    tiles: [
                        'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'
                    ],
                    tileSize: 256,
                    attribution: '© Esri'
                }
            },
            layers: [{
                id: 'satellite-layer',
                type: 'raster',
                source: 'satellite',
                minzoom: 0,
                maxzoom: 22
            }]
        });

        const htmlContent = `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://unpkg.com/maplibre-gl@3.6.2/dist/maplibre-gl.css" rel="stylesheet" />
    <script src="https://unpkg.com/maplibre-gl@3.6.2/dist/maplibre-gl.js"></script>
    <style>
        @page { margin: 10mm; size: A4; }
        .page-break { page-break-before: always; }
        .avoid-break { page-break-inside: avoid; }
        #map { width: 100%; height: 400px; border-radius: 8px; overflow: hidden; position: relative; }
        .map-legend { position: absolute; bottom: 10px; right: 10px; background: rgba(255,255,255,0.9); padding: 5px; border-radius: 4px; font-size: 10px; z-index: 10; }
        .risk-dot { width: 10px; height: 10px; border-radius: 50%; display: inline-block; margin-right: 4px; border: 1px solid white; }
    </style>
</head>
<body class="bg-white text-gray-800 font-sans text-sm selection:bg-none">

    <!-- HEADER -->
    <div class="border-b-4 border-green-700 pb-4 mb-6 flex justify-between items-end">
        <div>
            <h1 class="text-3xl font-bold text-green-900">Relatório de Inventário</h1>
            <p class="text-lg text-gray-600 font-medium">${installation.nome}</p>
        </div>
        <div class="text-right">
            <div class="text-xs text-gray-400 uppercase tracking-wider mb-1">ArborIA v3.0</div>
            <div class="text-sm font-semibold text-gray-700">${new Date().toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' })}</div>
        </div>
    </div>

    <!-- EXECUTIVE SUMMARY -->
    <div class="mb-8">
        <h2 class="text-xl font-bold text-gray-800 border-l-4 border-green-500 pl-3 mb-4">Resumo Executivo</h2>
        <div class="grid grid-cols-5 gap-4">
            <div class="bg-green-50 p-4 rounded-lg border border-green-100 text-center">
                <div class="text-3xl font-bold text-green-700">${stats?.totalTrees || 0}</div>
                <div class="text-[10px] uppercase font-bold text-green-600 mt-1">Total Árvores</div>
            </div>
            <div class="bg-red-50 p-4 rounded-lg border border-red-100 text-center">
                <div class="text-3xl font-bold text-red-700">${stats?.highRiskCount || 0}</div>
                <div class="text-[10px] uppercase font-bold text-red-600 mt-1">Alto Risco</div>
            </div>
            <div class="bg-blue-50 p-4 rounded-lg border border-blue-100 text-center">
                <div class="text-3xl font-bold text-blue-700">${stats?.totalSpecies || 0}</div>
                <div class="text-[10px] uppercase font-bold text-blue-600 mt-1">Espécies</div>
            </div>
            <div class="bg-stone-50 p-4 rounded-lg border border-stone-100 text-center">
                <div class="text-3xl font-bold text-stone-700">${stats?.avgDap?.toFixed(1) || 0} cm</div>
                <div class="text-[10px] uppercase font-bold text-stone-600 mt-1">DAP Médio</div>
            </div>
            <div class="bg-stone-50 p-4 rounded-lg border border-stone-100 text-center">
                <div class="text-3xl font-bold text-stone-700">${stats?.avgHeight?.toFixed(1) || 0} m</div>
                <div class="text-[10px] uppercase font-bold text-stone-600 mt-1">Altura Média</div>
            </div>
        </div>
    </div>

    <!-- MAP SECTION -->
    <div class="mb-8 avoid-break relative">
        <h2 class="text-xl font-bold text-gray-800 border-l-4 border-green-500 pl-3 mb-4">Mapa de Localização</h2>
        <div class="border-2 border-slate-200 rounded-lg shadow-sm relative">
             <div id="map"></div>
             <div class="map-legend">
                 <div><span class="risk-dot" style="background: #ef4444;"></span> Alto</div>
                 <div><span class="risk-dot" style="background: #eab308;"></span> Médio</div>
                 <div><span class="risk-dot" style="background: #22c55e;"></span> Baixo/Nenhum</div>
             </div>
        </div>
        <p class="text-xs text-gray-400 mt-2 text-center">Visualização de Satélite - Gerada em Tempo Real</p>
    </div>

    <!-- DETAILED INVENTORY -->
    <div class="page-break"></div>
    <h2 class="text-xl font-bold text-gray-800 border-l-4 border-green-500 pl-3 mb-6 pt-6">Detalhamento do Inventário</h2>
    
    <table class="w-full text-left border-collapse">
        <thead>
            <tr class="text-xs font-bold text-gray-500 uppercase bg-gray-50 border-b border-gray-200">
                <th class="px-4 py-3 w-16">Foto</th>
                <th class="px-4 py-3">ID / Espécie</th>
                <th class="px-4 py-3">Métricas</th>
                <th class="px-4 py-3">Risco</th>
                <th class="px-4 py-3 w-1/3">Fatores de Risco</th>
            </tr>
        </thead>
        <tbody class="divide-y divide-gray-100">
            ${trees.map((t, i) => `
            <tr class="hover:bg-gray-50 avoid-break ${i % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}">
                <td class="px-4 py-3 align-top">
                    ${t.photoUrl
                ? `<img src="${t.photoUrl}" class="w-12 h-12 object-cover rounded shadow-sm border border-gray-200">`
                : `<div class="w-12 h-12 bg-gray-100 rounded flex items-center justify-center text-xs text-gray-400 border border-gray-200">Sem foto</div>`
            }
                </td>
                <td class="px-4 py-3 align-top">
                    <div class="font-bold text-gray-900">#${t.id.slice(0, 8)}</div>
                    <div class="text-gray-600 italic">${t.especie || 'Não identificada'}</div>
                </td>
                <td class="px-4 py-3 align-top text-xs text-gray-600">
                    <div><span class="font-semibold">DAP:</span> ${t.dap} cm</div>
                    <div><span class="font-semibold">Alt:</span> ${t.altura} m</div>
                </td>
                <td class="px-4 py-3 align-top">
                    ${t.risco === 'Alto'
                ? '<span class="px-2 py-1 rounded-full text-xs font-bold bg-red-100 text-red-700">Alto</span>'
                : t.risco === 'Médio'
                    ? '<span class="px-2 py-1 rounded-full text-xs font-bold bg-yellow-100 text-yellow-700">Médio</span>'
                    : '<span class="px-2 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700">Baixo</span>'
            }
                </td>
                <td class="px-4 py-3 align-top">
                    <div class="flex flex-wrap gap-1">
                        ${(t.fatores_risco && t.fatores_risco.length > 0)
                ? t.fatores_risco.map(f => `
                                <span class="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-gray-100 text-gray-600 border border-gray-200">
                                    ${f}
                                </span>
                              `).join('')
                : '<span class="text-xs text-gray-400 italic">Nenhum fator registrado</span>'
            }
                    </div>
                </td>
            </tr>
            `).join('')}
        </tbody>
    </table>

    <!-- FOOTER -->
    <div class="mt-8 pt-4 border-t border-gray-200 text-center text-xs text-gray-400">
        Gerado automaticamente por ArborIA - Sistema de Gestão Arbórea Urbana
    </div>

    <!-- MAP SCRIPT -->
    <script>
        const trees = ${treesJson};
        const style = ${mapStyle};

        // Initialize Map
        const map = new maplibregl.Map({
            container: 'map',
            style: style,
            center: [ -46.6333, -23.5505 ],
            zoom: 12,
            attributionControl: false,
            preserveDrawingBuffer: true,
            failIfMajorPerformanceCaveat: false
        });

        map.on('load', () => {
            // Add Trees Source
            const features = trees
                .filter(t => t.latitude && t.longitude)
                .map(t => ({
                    type: 'Feature',
                    geometry: {
                        type: 'Point',
                        coordinates: [t.longitude, t.latitude]
                    },
                    properties: {
                        risk: t.risco
                    }
                }));

            if (features.length > 0) {
                map.addSource('trees', {
                    type: 'geojson',
                    data: {
                        type: 'FeatureCollection',
                        features: features
                    }
                });

                // Add Circle Layer
                map.addLayer({
                    id: 'tree-points',
                    type: 'circle',
                    source: 'trees',
                    paint: {
                        'circle-radius': 8,
                        'circle-color': [
                            'match',
                            ['get', 'risk'],
                            'Alto', '#ef4444',
                            'Médio', '#eab308',
                            '#22c55e' // Default/Low
                        ],
                        'circle-stroke-width': 2,
                        'circle-stroke-color': '#ffffff'
                    }
                });

                // Fit Bounds
                const bounds = new maplibregl.LngLatBounds();
                features.forEach(f => {
                    bounds.extend(f.geometry.coordinates);
                });

                map.fitBounds(bounds, { padding: 100, maxZoom: 17 });
            }

            setTimeout(() => {
                 map.once('idle', () => {
                    console.log("Map IDLE - Signaling Ready");
                    const el = document.createElement('div');
                    el.id = 'map-ready';
                    document.body.appendChild(el);
                });
                map.triggerRepaint();

            }, 2000); 
        });
    </script>
</body>
</html>
        `;

        if (process.env.DEBUG_HTML === 'true') {
            const fs = require('fs');
            fs.writeFileSync('debug_report.html', htmlContent);
            console.log('DEBUG: Saved debug_report.html');
        }

        await page.setContent(htmlContent, { waitUntil: 'load', timeout: 90000 });
        // Extra delay for dynamic content (Tailwind, etc)
        await delay(3000);
        // Then wait for network idle (more robust than networkidle0)
        await page.waitForNetworkIdle({ idleTime: 500, timeout: 30000 }).catch(() => console.log('Network idle timeout - proceeding anyway'));

        try {
            console.log('Waiting for map to render...');
            await page.waitForSelector('#map-ready', { timeout: 30000 });
            console.log('Map rendered!');
        } catch (e) {
            console.warn('Map render timeout - using what we have');
        }

        console.log('Printing to PDF...');
        const pdf = await page.pdf({
            format: 'A4',
            printBackground: true,
            preferCSSPageSize: true, // Use CSS @page size/margins
            margin: { top: '0', bottom: '0', left: '0', right: '0' }
        });

        if (page) await page.close();
        if (browser) await browser.close();

        console.log('PDF generated successfully');

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=relatorio-${installation.nome}.pdf`);
        res.send(pdf);

    } catch (error) {
        console.error('Error generating PDF:', error);
        if (page) await page.close().catch(() => { });
        if (browser) await browser.close().catch(() => { });
        res.status(500).json({ error: 'Failed to generate PDF', details: error.message });
    }
});

// Generic HTML to PDF endpoint
// GET Debug Screenshot (Easy Browser Test)
reportRouter.get('/debug-test', async (req, res) => {
    console.log('Received GET debug test request');
    let browser;
    let page;
    try {
        browser = await retryOperation(() => getBrowser());
        page = await browser.newPage();
        await page.setViewport({ width: 1200, height: 800 });
        await page.emulateMediaType('print');

        const testHtml = `
            <!DOCTYPE html>
            <html>
            <head>
                <script src="https://cdn.tailwindcss.com"></script>
                <style>body { padding: 50px; text-align: center; background: white; }</style>
            </head>
            <body>
                <h1 style="color: green; font-size: 40px;">ArborIA SERVER OK!</h1>
                <p>Se você está vendo isso, o Puppeteer e o Tailwind estão funcionando.</p>
                <div style="margin: 20px; padding: 20px; background: #f0f0f0; border: 2px dashed #ccc;">
                    Este é um teste de renderização.
                </div>
            </body>
            </html>
        `;

        await page.setContent(testHtml, { waitUntil: 'load' });
        await delay(2000);

        console.log('Taking test screenshot...');
        const screenshot = await page.screenshot({ fullPage: true });

        if (page) await page.close();
        if (browser) await browser.close();

        res.setHeader('Content-Type', 'image/png');
        res.send(screenshot);
    } catch (error) {
        console.error('Debug Test Error:', error);
        if (page) await page.close().catch(() => { });
        if (browser) await browser.close().catch(() => { });
        res.status(500).json({ error: 'Failed', details: error.message });
    }
});

reportRouter.post('/debug-screenshot', async (req, res) => {
    console.log('Received debug screenshot request');
    const { html, mapData } = req.body;
    let browser;
    let page;
    try {
        browser = await retryOperation(() => getBrowser());
        page = await browser.newPage();
        await page.setViewport({ width: 1200, height: 800 });

        // Build the same shell
        const fullHtml = `
            <!DOCTYPE html>
            <html>
            <head>
                <script src="https://cdn.tailwindcss.com"></script>
                <link href="https://unpkg.com/maplibre-gl@3.6.2/dist/maplibre-gl.css" rel="stylesheet" />
                <script src="https://unpkg.com/maplibre-gl@3.6.2/dist/maplibre-gl.js"></script>
                <style>body { margin: 0; padding: 0; background: white; }</style>
            </head>
            <body>${html}</body>
            </html>
        `;

        await page.setContent(fullHtml, { waitUntil: 'load' });
        await delay(3000);

        console.log('Taking screenshot...');
        const screenshot = await page.screenshot({ fullPage: true });

        if (page) await page.close();
        if (browser) await browser.close();

        res.setHeader('Content-Type', 'image/png');
        res.send(screenshot);
    } catch (error) {
        console.error('Screenshot Error:', error);
        if (page) await page.close().catch(() => { });
        if (browser) await browser.close().catch(() => { });
        res.status(500).json({ error: 'Failed to take screenshot', details: error.message });
    }
});

reportRouter.post('/generate-pdf-from-html', async (req, res) => {
    console.log('Received HTML PDF generation request');
    const { html, mapData } = req.body;

    if (!html) {
        return res.status(400).json({ error: 'Missing HTML content' });
    }

    let browser;
    let page;
    try {
        console.log('Using per-request browser...');
        browser = await retryOperation(() => getBrowser());
        page = await browser.newPage();

        // Hardening Viewport
        await page.setViewport({ width: 1200, height: 800 });
        await page.emulateMediaType('print');

        if (process.env.DEBUG_HTML === 'true') {
            fs.writeFileSync(`debug_html_${Date.now()}.html`, html);
        }

        page.on('console', msg => console.log('BROWSER LOG:', msg.text()));
        page.on('pageerror', err => console.log('BROWSER ERROR:', err));
        page.on('requestfailed', request => {
            console.log(`[!] Request failed: ${request.url()} - ${request.failure().errorText}`);
        });

        // Define map style (ArcGIS Satellite)
        const mapStyle = JSON.stringify({
            version: 8,
            sources: {
                'satellite': {
                    type: 'raster',
                    tiles: [
                        'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'
                    ],
                    tileSize: 256,
                    attribution: '© Esri'
                }
            },
            layers: [{
                id: 'satellite-layer',
                type: 'raster',
                source: 'satellite',
                minzoom: 0,
                maxzoom: 22
            }]
        });

        // HTML Shell
        const fullHtml = `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://unpkg.com/maplibre-gl@3.6.2/dist/maplibre-gl.css" rel="stylesheet" />
    <script src="https://unpkg.com/maplibre-gl@3.6.2/dist/maplibre-gl.js"></script>
    <style>
        body { margin: 0; padding: 0; background: white; -webkit-print-color-adjust: exact; }
    </style>
</head>
<body>
    ${html}

    <script>
        const mapData = ${JSON.stringify(mapData || null)};
        const style = ${mapStyle};

        if (mapData && mapData.containerId && document.getElementById(mapData.containerId)) {
            console.log('Initializing Minimap on ' + mapData.containerId);
            
            const map = new maplibregl.Map({
                container: mapData.containerId,
                style: style,
                center: [mapData.lng, mapData.lat],
                zoom: 18,
                attributionControl: false,
                preserveDrawingBuffer: true,
                failIfMajorPerformanceCaveat: false,
                interactive: false
            });

            const markerEl = document.createElement('div');
            markerEl.style.width = '14px';
            markerEl.style.height = '14px';
            markerEl.style.backgroundColor = '#ef4444';
            markerEl.style.border = '2px solid white';
            markerEl.style.borderRadius = '50%';
            markerEl.style.boxShadow = '0 0 4px rgba(0,0,0,0.5)';

            new maplibregl.Marker({ element: markerEl })
                .setLngLat([mapData.lng, mapData.lat])
                .addTo(map);

            // Fail-safe timeout for map rendering
            const mapTimeout = setTimeout(() => {
                if (!document.getElementById('map-ready')) {
                    console.log("Map render timeout - forcing ready signal");
                    const el = document.createElement('div');
                    el.id = 'map-ready';
                    document.body.appendChild(el);
                }
            }, 10000);

            // Wait for map to load
            map.on('load', () => {
                 setTimeout(() => {
                     map.once('idle', () => {
                        console.log("Map IDLE - Ready");
                        clearTimeout(mapTimeout);
                        if (!document.getElementById('map-ready')) {
                            const el = document.createElement('div');
                            el.id = 'map-ready';
                            document.body.appendChild(el);
                        }
                    });
                    map.triggerRepaint();
                }, 1000); 
            });
        } else {
            console.log('No map data or container not found (' + (mapData ? mapData.containerId : 'null') + ')');
            // Immediate ready if no map
            const el = document.createElement('div');
            el.id = 'map-ready';
            document.body.appendChild(el);
        }
    </script>
</body>
</html>
        `;

        // DEBUG: Capture HTML preview
        console.log(`[DEBUG] HTML payload length: ${html.length} characters`);
        console.log(`[DEBUG] HTML Preview (first 500 chars): ${html.substring(0, 500)}`);

        if (html.length < 500) {
            console.warn('[DEBUG] WARNING: HTML payload is very small.');
        }

        await page.setContent(fullHtml, { waitUntil: 'load', timeout: 60000 });

        // Give Tailwind and fonts time to "paint"
        console.log('Waiting for styles to settle...');
        await delay(3000);
        // Critical for cloud: wait for tailwind/maps
        await delay(2000);
        await page.waitForNetworkIdle({ idleTime: 500, timeout: 30000 }).catch(() => console.log('Network idle timeout - proceeding anyway'));

        try {
            if (mapData && mapData.containerId) {
                console.log('Waiting for map to render...');
                await page.waitForSelector('#map-ready', { timeout: 15000 });
            }
        } catch (e) {
            console.warn('Map render timeout or error', e.message);
        }

        console.log('Printing to PDF...');
        const pdf = await page.pdf({
            format: 'A4',
            printBackground: true,
            preferCSSPageSize: true, // Use CSS @page size/margins
            margin: { top: '0', bottom: '0', left: '0', right: '0' }
        });

        if (page) await page.close();

        console.log('PDF generated successfully');
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=relatorio.pdf`);
        res.send(pdf);

    } catch (error) {
        console.error('CRITICAL ERROR in generate-pdf-from-html:', error);

        if (error.message.includes('detached') || error.message.includes('Protocol error')) {
            console.log('Attempting Fallback: Generating PDF without map...');
            try {
                if (page) await page.close().catch(() => { });

                // Create a clean HTML shell without MapLibre
                const safeHtml = `
                    <!DOCTYPE html>
                    <html>
                    <head>
                        <script src="https://cdn.tailwindcss.com"></script>
                        <style>@page { margin: 0; size: A4; } body { background: white; }</style>
                    </head>
                    <body>
                        <div class="bg-yellow-50 text-yellow-800 p-4 mb-4 text-center border-b border-yellow-200">
                            <strong>Aviso:</strong> O mapa não pôde ser renderizado devido a limitações do sistema.
                        </div>
                        ${html}
                    </body>
                    </html>
                `;

                const fallbackBrowser = await getBrowser();
                const fallbackPage = await fallbackBrowser.newPage();
                await fallbackPage.setContent(safeHtml, { waitUntil: 'load', timeout: 30000 });
                const fallbackPdf = await fallbackPage.pdf({ format: 'A4', printBackground: true });
                await fallbackPage.close();
                await fallbackBrowser.close();

                res.setHeader('Content-Type', 'application/pdf');
                res.setHeader('Content-Disposition', `attachment; filename=relatorio-fallback.pdf`);
                return res.send(fallbackPdf);
            } catch (fallbackError) {
                console.error('Fallback also failed:', fallbackError);
            }
        }

        if (page) await page.close().catch(() => { });
        if (browser) await browser.close().catch(() => { });

        if (!res.headersSent) {
            res.status(500).json({
                error: 'Failed to generate PDF',
                details: error.message,
                stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
            });
        }
    }
});

app.use('/api/reports', reportRouter);

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Report Service running on http://0.0.0.0:${PORT}`);
});
