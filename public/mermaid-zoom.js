// Mermaid diagram zoom functionality
(function() {
    let modal = null;
    
    function createZoomModal() {
        if (modal) return modal;
        
        modal = document.createElement('div');
        modal.className = 'mermaid-zoom-modal';
        modal.innerHTML = `
            <div class="mermaid-zoom-content">
                <button class="mermaid-zoom-close">✕ Close</button>
                <h3 class="mermaid-zoom-title"></h3>
                <div class="mermaid-zoom-diagram"></div>
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
        
        return modal;
    }
    
    function openModal(diagramElement, title) {
        if (!modal) createZoomModal();
        
        const titleEl = modal.querySelector('.mermaid-zoom-title');
        const diagramEl = modal.querySelector('.mermaid-zoom-diagram');
        
        titleEl.textContent = title || 'Diagram';
        diagramEl.innerHTML = diagramElement.innerHTML;
        
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
    
    function closeModal() {
        if (modal) {
            modal.classList.remove('active');
            document.body.style.overflow = '';
        }
    }
    
    function initDiagramZoom() {
        // Find all mermaid diagrams
        const diagrams = document.querySelectorAll('.mermaid');
        
        diagrams.forEach((diagram, index) => {
            // Skip if already initialized
            if (diagram.hasAttribute('data-zoom-init')) return;
            
            diagram.setAttribute('data-zoom-init', 'true');
            
            // Wrap in enhanced container if not already wrapped
            if (!diagram.parentElement.classList.contains('mermaid-enhanced')) {
                const wrapper = document.createElement('div');
                wrapper.className = 'mermaid-enhanced';
                diagram.parentElement.insertBefore(wrapper, diagram);
                wrapper.appendChild(diagram);
            }
            
            // Get title from previous heading or generate one
            let title = 'Diagram ' + (index + 1);
            let prevElement = diagram.closest('.mermaid-enhanced').previousElementSibling;
            
            while (prevElement) {
                if (prevElement.tagName && prevElement.tagName.match(/^H[1-6]$/)) {
                    title = prevElement.textContent.trim();
                    break;
                }
                prevElement = prevElement.previousElementSibling;
            }
            
            // Add click handler for zoom
            diagram.addEventListener('click', function(e) {
                e.preventDefault();
                openModal(diagram, title);
            });
            
            // Add title attribute for accessibility
            diagram.setAttribute('title', 'Click to zoom: ' + title);
            diagram.setAttribute('role', 'img');
            diagram.setAttribute('aria-label', title);
        });
    }
    
    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initDiagramZoom);
    } else {
        initDiagramZoom();
    }
    
    // Re-initialize when new content is loaded (for SPAs)
    const observer = new MutationObserver(function(mutations) {
        let shouldReinit = false;
        mutations.forEach(function(mutation) {
            mutation.addedNodes.forEach(function(node) {
                if (node.nodeType === 1) { // Element node
                    if (node.querySelector && node.querySelector('.mermaid')) {
                        shouldReinit = true;
                    }
                }
            });
        });
        
        if (shouldReinit) {
            setTimeout(initDiagramZoom, 100); // Small delay to ensure Mermaid has rendered
        }
    });
    
    observer.observe(document.body, {
        childList: true,
        subtree: true
    });
})();