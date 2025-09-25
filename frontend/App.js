// Tools configuration (moved outside component to prevent re-creation)
const TOOLS_CONFIG = [
    { id: 'upload', name: 'Upload/Import', icon: Icons.Upload, description: 'Upload images or import from URL' },
    { id: 'shots', name: 'Color Variants', icon: Icons.Palette, description: 'Generate different color variations' },
    { id: 'adshots', name: 'Ad Shots', icon: Icons.Sparkles, description: 'Create surreal product advertisements' },
    { id: 'animation', name: 'Ad Videos', icon: Icons.Play, description: 'Create animated product video ads' },
    { id: '3d', name: '3D Mockups', icon: Icons.Box, description: 'Generate 3D product renders' },
];

// Main App Component (Performance Optimized)
const App = () => {
    const { useState, useCallback, useMemo } = React;
    
    const [activeToolId, setActiveToolId] = useState(null);
    const [uploadedImage, setUploadedImage] = useState(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [processingText, setProcessingText] = useState('');
    const [progress, setProgress] = useState(0);
    const [panelClosing, setPanelClosing] = useState(false);
    const [colorVariants, setColorVariants] = useState([]); // Shared state for color variants
    const [generatedAds, setGeneratedAds] = useState([]); // Shared state for ad shots

    const handleToolClick = useCallback((toolId) => {
        if (activeToolId === toolId) {
            setPanelClosing(true);
            setTimeout(() => {
                setActiveToolId(null);
                setPanelClosing(false);
            }, 300);
        } else {
            setActiveToolId(toolId);
            setPanelClosing(false);
        }
    }, [activeToolId]);

    const closePanel = useCallback(() => {
        setPanelClosing(true);
        setTimeout(() => {
            setActiveToolId(null);
            setPanelClosing(false);
        }, 300);
    }, []);

    // Handle logo click - go to starting point (upload)
    const handleLogoClick = useCallback(() => {
        if (activeToolId) {
            // Close any open panel first
            closePanel();
        } else {
            // If no panel is open, open upload panel
            setActiveToolId('upload');
        }
    }, [activeToolId, closePanel]);

    // Tool Panel Component
    const ToolPanel = ({ toolId, onClose, isClosing }) => {
        const panels = {
            upload: React.createElement(UploadPanel, { setUploadedImage }),
            shots: React.createElement(ColorVariationsPanel, { 
                uploadedImage, 
                setUploadedImage, 
                setIsProcessing, 
                setProcessingText, 
                setProgress,
                colorVariants,
                setColorVariants
            }),
            adshots: React.createElement(AdShotsPanel, { 
                uploadedImage, 
                setUploadedImage, 
                setIsProcessing, 
                setProcessingText, 
                setProgress,
                colorVariants,
                generatedAds,
                setGeneratedAds
            }),
            animation: React.createElement(AnimationPanel, { 
                uploadedImage, 
                setUploadedImage,
                setIsProcessing, 
                setProcessingText, 
                setProgress,
                generatedAds,
                setGeneratedAds,
                colorVariants
            }),
            '3d': React.createElement(ThreeDMockupsPanel, { 
                uploadedImage, 
                setIsProcessing, 
                setProcessingText, 
                setProgress 
            }),
        };

        const toolNames = {
            upload: 'Upload & Import',
            shots: 'Color Variations',
            adshots: 'Ad Shots',
            animation: 'Ad Videos',
            '3d': '3D Mockups'
        };

        return (
            <aside className={`w-96 bg-surface-light dark:bg-surface-dark rounded-xl shadow-lg p-6 m-4 flex flex-col tool-panel ${isClosing ? 'closing' : ''}`} style={{ height: 'calc(100vh - 140px)', maxHeight: 'calc(100vh - 140px)' }}>
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-lg font-semibold text-text-light dark:text-text-dark">
                        {toolNames[toolId]}
                    </h2>
                    <button 
                        onClick={onClose}
                        className="p-1 text-subtle-light dark:text-subtle-dark hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full"
                    >
                        <span className="material-icons">close</span>
                    </button>
                </div>
                <div className="flex-1 overflow-y-auto">
                    {panels[toolId]}
                </div>
            </aside>
        );
    };

    return (
        <div className="flex h-screen">
            {/* Left Sidebar */}
            <Sidebar 
                tools={TOOLS_CONFIG} 
                activeToolId={activeToolId} 
                onToolClick={handleToolClick} 
            />

            {/* Main Content Area */}
            <main className="flex-1 flex flex-col">
                {/* Top Navigation */}
                <TopNavigation uploadedImage={uploadedImage} onLogoClick={handleLogoClick} />

                {/* Content Area with Main and Tool Panel - Full Screen */}
                <div className="flex-1 flex bg-background-light dark:bg-background-dark p-4">
                    {/* Main Content - Takes full available space */}
                    <div className={`flex flex-col items-center justify-center relative ${activeToolId ? 'flex-1' : 'w-full'}`}>
                        <MainContent 
                            uploadedImage={uploadedImage}
                            setUploadedImage={setUploadedImage}
                            isProcessing={isProcessing}
                            processingText={processingText}
                            progress={progress}
                            setIsProcessing={setIsProcessing}
                            setProcessingText={setProcessingText}
                            setProgress={setProgress}
                            activeToolId={activeToolId}
                            colorVariants={colorVariants}
                            setColorVariants={setColorVariants}
                        />
                    </div>

                    {/* Tool Panel - Fixed width sidebar */}
                    {activeToolId && (
                        <ToolPanel 
                            toolId={activeToolId}
                            onClose={closePanel}
                            isClosing={panelClosing}
                            uploadedImage={uploadedImage}
                            setUploadedImage={setUploadedImage}
                            setIsProcessing={setIsProcessing}
                            setProcessingText={setProcessingText}
                            setProgress={setProgress}
                            colorVariants={colorVariants}
                            setColorVariants={setColorVariants}
                        />
                    )}
                </div>
            </main>
        </div>
    );
};

// Render the app using React 18 createRoot API
const container = document.getElementById('root');
const root = ReactDOM.createRoot(container);
root.render(React.createElement(App));