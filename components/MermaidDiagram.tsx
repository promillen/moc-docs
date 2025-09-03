import React, { useState, useEffect } from 'react';

interface MermaidDiagramProps {
  chart: string;
  title?: string;
  id?: string;
}

const MermaidDiagram: React.FC<MermaidDiagramProps> = ({ chart, title, id }) => {
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    // Initialize Mermaid if not already done
    if (typeof window !== 'undefined') {
      import('../lib/mermaid-init.js').then(({ initMermaid }) => {
        initMermaid();
        
        // Re-render Mermaid diagrams after initialization
        if (window.mermaid) {
          window.mermaid.init();
        }
      });
    }
  }, []);

  const openFullscreen = () => {
    setIsFullscreen(true);
  };

  const closeFullscreen = () => {
    setIsFullscreen(false);
  };

  const diagramContent = (
    <pre className="mermaid" id={id}>
      {chart}
    </pre>
  );

  return (
    <>
      <div className="mermaid-container">
        <button 
          className="mermaid-fullscreen-btn"
          onClick={openFullscreen}
          title="Open in fullscreen"
        >
          🔍 Fullscreen
        </button>
        {title && <h4 style={{ marginTop: 0, marginBottom: '16px' }}>{title}</h4>}
        {diagramContent}
      </div>

      {isFullscreen && (
        <div className="mermaid-fullscreen-overlay" onClick={closeFullscreen}>
          <div className="mermaid-fullscreen-content" onClick={(e) => e.stopPropagation()}>
            <button 
              className="mermaid-fullscreen-close"
              onClick={closeFullscreen}
            >
              ✕ Close
            </button>
            {title && <h3>{title}</h3>}
            <div style={{ marginTop: title ? '40px' : '30px' }}>
              {diagramContent}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default MermaidDiagram;