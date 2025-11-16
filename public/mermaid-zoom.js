// Enhanced Mermaid diagram zoom functionality for Nextra 3.0
// Works with @theguild/remark-mermaid React component rendering
// CRITICAL: Does not move DOM nodes to avoid React reconciliation conflicts

(function() {
    'use strict';

    console.log('[Mermaid Zoom] Script loaded');

    let modal = null;
    const initializedDiagrams = new WeakSet();

    function createZoomModal() {
        if (modal) return modal;

        modal = document.createElement('div');
        modal.className = 'mermaid-zoom-modal';
        modal.innerHTML = `
            <div class="mermaid-zoom-content">
                <button class="mermaid-zoom-close">✕ Close</button>
                <h3 class="mermaid-zoom-title"></h3>
                <div class="mermaid-zoom-controls">
                    <button class="mermaid-zoom-btn" data-action="zoom-in" title="Zoom In">🔍+</button>
                    <button class="mermaid-zoom-btn" data-action="zoom-out" title="Zoom Out">🔍−</button>
                    <button class="mermaid-zoom-btn" data-action="reset" title="Reset View">⟲</button>
                </div>
                <div class="mermaid-zoom-diagram-container">
                    <div class="mermaid-zoom-diagram"></div>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        // Close modal handlers
        const closeBtn = modal.querySelector('.mermaid-zoom-close');
        closeBtn.addEventListener('click', closeModal);

        modal.addEventListener('click', function(e) {
            if (e.target === modal) closeModal();
        });

        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && modal.classList.contains('active')) {
                closeModal();
            }
        });

        // Zoom control handlers
        let currentScale = 1;
        let currentX = 0;
        let currentY = 0;
        let isDragging = false;
        let startX, startY;

        const diagramEl = modal.querySelector('.mermaid-zoom-diagram');
        const containerEl = modal.querySelector('.mermaid-zoom-diagram-container');

        // Zoom buttons
        modal.querySelectorAll('.mermaid-zoom-btn').forEach(btn => {
            btn.addEventListener('click', function(e) {
                e.stopPropagation();
                const action = this.getAttribute('data-action');

                if (action === 'zoom-in') {
                    currentScale = Math.min(currentScale * 1.3, 5);
                } else if (action === 'zoom-out') {
                    currentScale = Math.max(currentScale / 1.3, 0.5);
                } else if (action === 'reset') {
                    currentScale = 1;
                    currentX = 0;
                    currentY = 0;
                }

                updateTransform();
            });
        });

        // Mouse wheel zoom
        containerEl.addEventListener('wheel', function(e) {
            e.preventDefault();
            const delta = e.deltaY > 0 ? 0.9 : 1.1;
            currentScale = Math.min(Math.max(currentScale * delta, 0.5), 5);
            updateTransform();
        });

        // Pan with mouse drag
        diagramEl.addEventListener('mousedown', function(e) {
            isDragging = true;
            startX = e.clientX - currentX;
            startY = e.clientY - currentY;
            diagramEl.style.cursor = 'grabbing';
        });

        document.addEventListener('mousemove', function(e) {
            if (!isDragging) return;
            e.preventDefault();
            currentX = e.clientX - startX;
            currentY = e.clientY - startY;
            updateTransform();
        });

        document.addEventListener('mouseup', function() {
            isDragging = false;
            if (diagramEl) diagramEl.style.cursor = 'grab';
        });

        function updateTransform() {
            diagramEl.style.transform = `translate(${currentX}px, ${currentY}px) scale(${currentScale})`;
        }

        // Reset transform when modal opens
        modal.resetTransform = function() {
            currentScale = 1;
            currentX = 0;
            currentY = 0;
            updateTransform();
        };

        console.log('[Mermaid Zoom] Modal created');
        return modal;
    }

    function openModal(diagramElement, title) {
        if (!modal) createZoomModal();

        const titleEl = modal.querySelector('.mermaid-zoom-title');
        const diagramEl = modal.querySelector('.mermaid-zoom-diagram');

        titleEl.textContent = title || 'Diagram';

        // Clear previous content first to avoid conflicts
        diagramEl.innerHTML = '';

        // Clone the entire container to preserve all SVG content
        try {
            diagramEl.innerHTML = diagramElement.innerHTML;
        } catch (error) {
            console.error('[Mermaid Zoom] Error cloning diagram content:', error);
            return;
        }

        // Reset transform
        if (modal.resetTransform) {
            modal.resetTransform();
        }

        modal.classList.add('active');
        document.body.style.overflow = 'hidden';

        console.log('[Mermaid Zoom] Modal opened:', title);
    }

    function closeModal() {
        if (modal) {
            modal.classList.remove('active');
            document.body.style.overflow = '';
            console.log('[Mermaid Zoom] Modal closed');
        }
    }

    function findDiagramTitle(element) {
        // Search for the nearest preceding heading
        let current = element.previousElementSibling;
        let attempts = 0;
        const maxAttempts = 10; // Don't search too far

        while (current && attempts < maxAttempts) {
            if (current.tagName && current.tagName.match(/^H[1-6]$/)) {
                return current.textContent.trim();
            }
            current = current.previousElementSibling;
            attempts++;
        }

        return 'Diagram';
    }

    function initializeDiagram(container) {
        // Skip if already initialized
        if (initializedDiagrams.has(container)) {
            return;
        }

        // Verify container is still in the DOM before proceeding
        if (!document.body.contains(container)) {
            console.warn('[Mermaid Zoom] Container not in DOM, skipping initialization');
            return;
        }

        console.log('[Mermaid Zoom] Initializing diagram:', container);

        // Mark as initialized FIRST to prevent re-entry
        initializedDiagrams.add(container);

        // Find title
        const title = findDiagramTitle(container);

        // CRITICAL: Do NOT wrap or move the container element!
        // Instead, just add styling classes directly to the container

        // Add mermaid-enhanced class to the container itself for styling
        if (!container.classList.contains('mermaid-enhanced')) {
            container.classList.add('mermaid-enhanced');
        }

        // Ensure the container has overflow hidden to contain zoomed content
        container.style.position = 'relative';
        container.style.overflow = 'hidden';
        container.style.cursor = 'grab';

        // Find the SVG element inside the container - this is what we'll transform
        const svg = container.querySelector('svg');
        if (!svg) {
            console.warn('[Mermaid Zoom] No SVG found in container, aborting initialization');
            initializedDiagrams.delete(container);
            return;
        }

        // Reset any existing transforms on the SVG
        svg.style.transform = '';
        svg.style.transformOrigin = 'center center';
        svg.style.transition = 'transform 0.1s ease-out';
        svg.style.cursor = 'inherit';

        // Setup inline zoom/pan variables
        let scale = 1;
        let translateX = 0;
        let translateY = 0;
        let isDragging = false;
        let startX, startY;

        function updateTransform() {
            if (document.body.contains(svg)) {
                svg.style.transform = `translate(${translateX}px, ${translateY}px) scale(${scale})`;
            }
        }

        // Click handler for fullscreen modal
        const clickHandler = function(e) {
            // Don't interfere if user is dragging or has dragged
            if (scale !== 1 || translateX !== 0 || translateY !== 0) {
                return; // User has zoomed/panned, don't open modal
            }
            e.preventDefault();
            openModal(container, title);
        };

        // Mouse wheel zoom handler
        const wheelHandler = function(e) {
            e.preventDefault();
            e.stopPropagation();
            const delta = e.deltaY > 0 ? 0.9 : 1.1;
            scale = Math.min(Math.max(scale * delta, 0.5), 5);
            updateTransform();
        };

        // Mouse down handler for panning
        const mouseDownHandler = function(e) {
            if (e.button !== 0) return; // Only left click
            isDragging = true;
            startX = e.clientX - translateX;
            startY = e.clientY - translateY;
            container.style.cursor = 'grabbing';
            svg.style.cursor = 'grabbing';
            e.preventDefault();
        };

        // Mouse move handler (scoped to this diagram instance)
        const mouseMoveHandler = function(e) {
            // Check if container still exists in DOM (cleanup for SPA navigation)
            if (!document.body.contains(container)) {
                document.removeEventListener('mousemove', mouseMoveHandler);
                document.removeEventListener('mouseup', mouseUpHandler);
                return;
            }
            if (!isDragging) return;
            translateX = e.clientX - startX;
            translateY = e.clientY - startY;
            updateTransform();
        };

        // Mouse up handler (scoped to this diagram instance)
        const mouseUpHandler = function() {
            // Check if container still exists in DOM (cleanup for SPA navigation)
            if (!document.body.contains(container)) {
                document.removeEventListener('mousemove', mouseMoveHandler);
                document.removeEventListener('mouseup', mouseUpHandler);
                return;
            }
            if (isDragging) {
                isDragging = false;
                container.style.cursor = 'grab';
                if (svg) svg.style.cursor = 'grab';
            }
        };

        // Double-click to reset
        const dblClickHandler = function(e) {
            e.preventDefault();
            scale = 1;
            translateX = 0;
            translateY = 0;
            updateTransform();
        };

        // Attach all event listeners
        container.addEventListener('click', clickHandler);
        container.addEventListener('wheel', wheelHandler);
        container.addEventListener('mousedown', mouseDownHandler);
        container.addEventListener('dblclick', dblClickHandler);

        // These need to be on document to work when mouse leaves container
        // They will self-cleanup when container is removed from DOM
        document.addEventListener('mousemove', mouseMoveHandler);
        document.addEventListener('mouseup', mouseUpHandler);

        console.log('[Mermaid Zoom] Initialized:', title);
    }

    function scanForDiagrams() {
        // Nextra's @theguild/remark-mermaid renders as:
        // <div><svg aria-roledescription="flowchart-v2">...</svg></div>
        // We look for divs containing SVGs with aria-roledescription

        const diagrams = document.querySelectorAll('svg[aria-roledescription]');

        console.log('[Mermaid Zoom] Found SVGs with aria-roledescription:', diagrams.length);

        diagrams.forEach(svg => {
            const container = svg.parentElement;
            if (container && container.tagName === 'DIV') {
                initializeDiagram(container);
            }
        });

        return diagrams.length;
    }

    // Multiple initialization strategies
    let initAttempts = 0;
    const maxAttempts = 20; // Try for up to 10 seconds

    function attemptInit() {
        const found = scanForDiagrams();

        if (found > 0) {
            console.log('[Mermaid Zoom] Successfully initialized', found, 'diagrams');
            return true;
        }

        initAttempts++;
        if (initAttempts < maxAttempts) {
            console.log('[Mermaid Zoom] No diagrams found yet, attempt', initAttempts, 'of', maxAttempts);
            setTimeout(attemptInit, 500);
        } else {
            console.log('[Mermaid Zoom] Stopped searching after', maxAttempts, 'attempts');
        }

        return false;
    }

    // Start initialization
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            console.log('[Mermaid Zoom] DOM ready, starting scan...');
            setTimeout(attemptInit, 100);
        });
    } else {
        console.log('[Mermaid Zoom] Document already loaded, starting scan...');
        setTimeout(attemptInit, 100);
    }

    // Hybrid approach: Watch for DOM changes AND use interval scanning

    // Strategy 1: Watch for major content changes (broader than just SVG additions)
    const observer = new MutationObserver((mutations) => {
        let shouldRescan = false;

        mutations.forEach(mutation => {
            mutation.addedNodes.forEach(node => {
                if (node.nodeType === 1) { // Element
                    // Check if it's an SVG with aria-roledescription
                    if (node.tagName === 'SVG' && node.hasAttribute('aria-roledescription')) {
                        shouldRescan = true;
                    }
                    // Or contains such SVGs
                    else if (node.querySelectorAll) {
                        const svgs = node.querySelectorAll('svg[aria-roledescription]');
                        if (svgs.length > 0) {
                            shouldRescan = true;
                        }
                    }
                    // Or if it's a major content container (Nextra/Next.js page wrapper)
                    else if (node.classList && (
                        node.classList.contains('nextra-content') ||
                        node.classList.contains('nx-content') ||
                        node.id === '__next' ||
                        node.tagName === 'MAIN' ||
                        node.tagName === 'ARTICLE'
                    )) {
                        shouldRescan = true;
                    }
                }
            });
        });

        if (shouldRescan) {
            console.log('[Mermaid Zoom] DOM change detected, rescanning...');
            // Use double requestAnimationFrame to ensure React has finished its work
            requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                    scanForDiagrams();
                });
            });
        }
    });

    observer.observe(document.body, {
        childList: true,
        subtree: true
    });

    console.log('[Mermaid Zoom] MutationObserver active');

    // Strategy 2: Interval-based backup scanning (runs for 30 seconds, checks every 2 seconds)
    let scanInterval = null;
    let intervalScans = 0;
    const maxIntervalScans = 15; // 15 scans × 2 seconds = 30 seconds max
    let lastFoundCount = 0;

    function startIntervalScanning() {
        // Clear any existing interval
        if (scanInterval) {
            clearInterval(scanInterval);
        }

        // Reset counters
        intervalScans = 0;
        lastFoundCount = 0;

        console.log('[Mermaid Zoom] Starting interval scanning (2s intervals, 30s max)');

        scanInterval = setInterval(() => {
            intervalScans++;

            const currentCount = scanForDiagrams();

            // Stop interval if:
            // 1. We've reached max scans (30 seconds)
            // 2. We found diagrams and count hasn't changed for 2 consecutive scans (stable state)
            if (intervalScans >= maxIntervalScans) {
                console.log('[Mermaid Zoom] Interval scanning stopped after 30 seconds');
                clearInterval(scanInterval);
                scanInterval = null;
            } else if (currentCount > 0 && currentCount === lastFoundCount && intervalScans > 1) {
                console.log('[Mermaid Zoom] Interval scanning stopped - diagrams stable at', currentCount);
                clearInterval(scanInterval);
                scanInterval = null;
            }

            lastFoundCount = currentCount;
        }, 2000);
    }

    // Start initial interval scanning
    startIntervalScanning();

    // Restart interval scanning when we detect navigation
    let lastPathname = window.location.pathname;
    const navigationWatcher = setInterval(() => {
        if (window.location.pathname !== lastPathname) {
            console.log('[Mermaid Zoom] Navigation detected:', lastPathname, '→', window.location.pathname);
            lastPathname = window.location.pathname;
            startIntervalScanning();
        }
    }, 500); // Check every 500ms for navigation changes
})();
