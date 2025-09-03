// Mermaid initialization for Next.js
import mermaid from 'mermaid';

let isInitialized = false;

export const initMermaid = () => {
  if (typeof window !== 'undefined' && !isInitialized) {
    mermaid.initialize({
      startOnLoad: true,
      theme: 'default',
      securityLevel: 'loose',
      fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      sequence: {
        actorMargin: 50,
        width: 150,
        height: 65,
        boxMargin: 10,
        boxTextMargin: 5,
        noteMargin: 10,
        messageMargin: 35,
        mirrorActors: true,
        bottomMarginAdj: 1,
        useMaxWidth: true,
        rightAngles: false,
        showSequenceNumbers: false
      },
      flowchart: {
        useMaxWidth: true,
        htmlLabels: true,
        curve: 'basis'
      },
      gantt: {
        useMaxWidth: true
      }
    });
    
    isInitialized = true;
  }
};

// Auto-initialize when script loads
if (typeof window !== 'undefined') {
  initMermaid();
}