'use client'

import { useEffect, useRef, useState } from 'react'

interface ZoomableMermaidProps {
  chart: string
  title?: string
}

export function ZoomableMermaid({ chart, title }: ZoomableMermaidProps) {
  const [isZoomed, setIsZoomed] = useState(false)
  const [svg, setSvg] = useState('')
  const containerRef = useRef<HTMLDivElement>(null)
  const [isVisible, setIsVisible] = useState(false)

  // Intersection observer to only render when visible
  useEffect(() => {
    if (!containerRef.current) return

    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        observer.disconnect()
        setIsVisible(true)
      }
    })

    observer.observe(containerRef.current)
    return () => observer.disconnect()
  }, [])

  // Render mermaid when visible
  useEffect(() => {
    if (!isVisible) return

    const renderChart = async () => {
      const isDarkTheme = document.documentElement.classList.contains('dark') ||
                          document.documentElement.getAttribute('data-theme') === 'dark'

      const mermaidConfig = {
        startOnLoad: false,
        securityLevel: 'loose' as const,
        fontFamily: 'inherit',
        theme: isDarkTheme ? 'dark' : 'default'
      }

      try {
        const mermaid = (await import('mermaid')).default
        mermaid.initialize(mermaidConfig)

        const { svg: renderedSvg } = await mermaid.render(
          `mermaid-${Math.random().toString(36).substr(2, 9)}`,
          chart,
          containerRef.current!
        )

        setSvg(renderedSvg)
      } catch (error) {
        console.error('Error rendering Mermaid diagram:', error)
      }
    }

    renderChart()

    // Re-render on theme changes
    const observer = new MutationObserver(renderChart)
    observer.observe(document.documentElement, { attributes: true })

    return () => observer.disconnect()
  }, [chart, isVisible])

  const handleClick = () => {
    setIsZoomed(true)
    document.body.style.overflow = 'hidden'
  }

  const handleClose = () => {
    setIsZoomed(false)
    document.body.style.overflow = ''
  }

  return (
    <>
      {/* Main diagram container */}
      <div className="mermaid-enhanced">
        <div
          ref={containerRef}
          onClick={handleClick}
          dangerouslySetInnerHTML={{ __html: svg }}
          style={{ cursor: 'pointer' }}
          title={title ? `Click to zoom: ${title}` : 'Click to zoom'}
          role="img"
          aria-label={title || 'Diagram'}
        />
      </div>

      {/* Zoom modal */}
      {isZoomed && (
        <div
          className="mermaid-zoom-modal active"
          onClick={(e) => {
            if (e.target === e.currentTarget) handleClose()
          }}
        >
          <div className="mermaid-zoom-content">
            <button className="mermaid-zoom-close" onClick={handleClose}>
              ✕ Close
            </button>
            {title && <h3 className="mermaid-zoom-title">{title}</h3>}
            <div
              className="mermaid-zoom-diagram"
              dangerouslySetInnerHTML={{ __html: svg }}
            />
          </div>
        </div>
      )}
    </>
  )
}
