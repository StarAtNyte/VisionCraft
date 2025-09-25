// Icon components using SVG directly
const Icons = {
    Upload: (props) => React.createElement('svg', { width: 24, height: 24, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round', ...props },
        React.createElement('circle', { cx: 12, cy: 12, r: 10 }),
        React.createElement('polyline', { points: '8,12 12,8 16,12' }),
        React.createElement('line', { x1: 12, y1: 8, x2: 12, y2: 16 })
    ),
    Sliders: (props) => React.createElement('svg', { width: 24, height: 24, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round', ...props },
        React.createElement('line', { x1: 4, y1: 21, x2: 4, y2: 14 }),
        React.createElement('line', { x1: 4, y1: 10, x2: 4, y2: 3 }),
        React.createElement('line', { x1: 12, y1: 21, x2: 12, y2: 12 }),
        React.createElement('line', { x1: 12, y1: 8, x2: 12, y2: 3 }),
        React.createElement('line', { x1: 20, y1: 21, x2: 20, y2: 16 }),
        React.createElement('line', { x1: 20, y1: 12, x2: 20, y2: 3 }),
        React.createElement('line', { x1: 1, y1: 14, x2: 7, y2: 14 }),
        React.createElement('line', { x1: 9, y1: 8, x2: 15, y2: 8 }),
        React.createElement('line', { x1: 17, y1: 16, x2: 23, y2: 16 })
    ),
    Wand2: (props) => React.createElement('svg', { width: 24, height: 24, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round', ...props },
        React.createElement('path', { d: 'm21.64 3.64-1.28-1.28a1.21 1.21 0 0 0-1.72 0L2.36 18.64a1.21 1.21 0 0 0 0 1.72l1.28 1.28a1.2 1.2 0 0 0 1.72 0L21.64 5.36a1.2 1.2 0 0 0 0-1.72Z' }),
        React.createElement('path', { d: 'm14 7 3 3' }),
        React.createElement('path', { d: 'M5 6v4' }),
        React.createElement('path', { d: 'M19 14v4' }),
        React.createElement('path', { d: 'M10 2v2' }),
        React.createElement('path', { d: 'M7 8H3' }),
        React.createElement('path', { d: 'M21 16h-4' }),
        React.createElement('path', { d: 'M11 3H9' })
    ),
    Camera: (props) => React.createElement('svg', { width: 24, height: 24, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round', ...props },
        React.createElement('rect', { x: 2, y: 3, width: 6, height: 6, rx: 1 }),
        React.createElement('rect', { x: 9, y: 3, width: 6, height: 6, rx: 1 }),
        React.createElement('rect', { x: 16, y: 3, width: 6, height: 6, rx: 1 }),
        React.createElement('rect', { x: 2, y: 12, width: 6, height: 6, rx: 1 }),
        React.createElement('rect', { x: 9, y: 12, width: 6, height: 6, rx: 1 }),
        React.createElement('rect', { x: 16, y: 12, width: 6, height: 6, rx: 1 })
    ),
    Users: (props) => React.createElement('svg', { width: 24, height: 24, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round', ...props },
        React.createElement('path', { d: 'M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2' }),
        React.createElement('circle', { cx: 9, cy: 7, r: 4 }),
        React.createElement('path', { d: 'M22 21v-2a4 4 0 0 0-3-3.87' }),
        React.createElement('path', { d: 'M16 3.13a4 4 0 0 1 0 7.75' })
    ),
    Play: (props) => React.createElement('svg', { width: 24, height: 24, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round', ...props },
        React.createElement('polygon', { points: '5,3 19,12 5,21' })
    ),
    Box: (props) => React.createElement('svg', { width: 24, height: 24, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round', ...props },
        React.createElement('path', { d: 'M12 2L2 7v10l10 5 10-5V7L12 2z' }),
        React.createElement('polyline', { points: '2,7 12,12 22,7' }),
        React.createElement('line', { x1: 12, y1: 22, x2: 12, y2: 12 }),
        React.createElement('path', { d: 'M17 4.5L7 9.5', opacity: 0.4 })
    ),
    Search: (props) => React.createElement('svg', { width: 24, height: 24, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round', ...props },
        React.createElement('circle', { cx: 11, cy: 11, r: 8 }),
        React.createElement('path', { d: 'M21 21l-4.35-4.35' })
    ),
    Download: (props) => React.createElement('svg', { width: 24, height: 24, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round', ...props },
        React.createElement('path', { d: 'M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4' }),
        React.createElement('polyline', { points: '7,10 12,15 17,10' }),
        React.createElement('line', { x1: 12, y1: 15, x2: 12, y2: 3 })
    ),
    ChevronDown: (props) => React.createElement('svg', { width: 24, height: 24, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round', ...props },
        React.createElement('polyline', { points: '6,9 12,15 18,9' })
    ),
    X: (props) => React.createElement('svg', { width: 24, height: 24, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round', ...props },
        React.createElement('line', { x1: 18, y1: 6, x2: 6, y2: 18 }),
        React.createElement('line', { x1: 6, y1: 6, x2: 18, y2: 18 })
    ),
    RotateCw: (props) => React.createElement('svg', { width: 24, height: 24, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round', ...props },
        React.createElement('path', { d: 'M21 2v6h-6' }),
        React.createElement('path', { d: 'M21 13a9 9 0 1 1-3-7.7L21 8' })
    ),
    Crop: (props) => React.createElement('svg', { width: 24, height: 24, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round', ...props },
        React.createElement('path', { d: 'M6 2v14a2 2 0 0 0 2 2h14' }),
        React.createElement('path', { d: 'M18 6H8a2 2 0 0 0-2 2v10' })
    ),
    Palette: (props) => React.createElement('svg', { width: 24, height: 24, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round', ...props },
        React.createElement('circle', { cx: 13.5, cy: 6.5, r: '.5' }),
        React.createElement('circle', { cx: 17.5, cy: 10.5, r: '.5' }),
        React.createElement('circle', { cx: 8.5, cy: 7.5, r: '.5' }),
        React.createElement('circle', { cx: 6.5, cy: 12.5, r: '.5' }),
        React.createElement('path', { d: 'M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z' })
    ),
    Plus: (props) => React.createElement('svg', { width: 24, height: 24, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round', ...props },
        React.createElement('line', { x1: 12, y1: 5, x2: 12, y2: 19 }),
        React.createElement('line', { x1: 5, y1: 12, x2: 19, y2: 12 })
    ),
    Sparkles: (props) => React.createElement('svg', { width: 24, height: 24, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round', ...props },
        React.createElement('path', { d: 'm12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z' }),
        React.createElement('path', { d: 'M5 3v4' }),
        React.createElement('path', { d: 'M19 17v4' }),
        React.createElement('path', { d: 'M3 5h4' }),
        React.createElement('path', { d: 'M17 19h4' })
    )
};