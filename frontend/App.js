// Main App Component
const App = () => {
    const { useState, useCallback } = React;
    
    const [activeToolId, setActiveToolId] = useState(null);
    const [uploadedImage, setUploadedImage] = useState(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [processingText, setProcessingText] = useState('');
    const [progress, setProgress] = useState(0);
    const [panelClosing, setPanelClosing] = useState(false);
    const [colorVariants, setColorVariants] = useState([]); // Shared state for color variants
    const [generatedScenarios, setGeneratedScenarios] = useState([]); // Shared state for lifestyle scenarios

    const tools = [
        { id: 'upload', name: 'Upload/Import', icon: Icons.Upload, description: 'Upload images or import from URL' },
        { id: 'basic', name: 'Basic Edits', icon: Icons.Sliders, description: 'Crop, rotate, adjust brightness & filters' },
        { id: 'ai', name: 'AI Edits', icon: Icons.Wand2, description: 'AI-powered editing with Flux integration' },
        { id: 'shots', name: 'Color Variants', icon: Icons.Palette, description: 'Generate different color variations' },
        { id: 'lifestyle', name: 'Lifestyle Mockups', icon: Icons.Users, description: 'Show products in real environments' },
        { id: 'animation', name: 'Animation', icon: Icons.Play, description: 'Create animated product videos' },
        { id: '3d', name: '3D Mockups', icon: Icons.Box, description: 'Generate 3D product renders' },
    ];

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

    // Tool Panel Component
    const ToolPanel = ({ toolId, onClose, isClosing }) => {
        const panels = {
            upload: React.createElement(UploadPanel, { setUploadedImage }),
            basic: React.createElement(BasicEditsPanel, { 
                uploadedImage, 
                setUploadedImage, 
                setIsProcessing, 
                setProcessingText, 
                setProgress 
            }),
            ai: React.createElement(AIEditsPanel, { 
                uploadedImage, 
                setUploadedImage, 
                setIsProcessing, 
                setProcessingText, 
                setProgress 
            }),
            shots: React.createElement(ColorVariationsPanel, { 
                uploadedImage, 
                setUploadedImage, 
                setIsProcessing, 
                setProcessingText, 
                setProgress,
                colorVariants,
                setColorVariants
            }),
            lifestyle: React.createElement(LifestyleMockupsPanel, { 
                uploadedImage, 
                setUploadedImage, 
                setIsProcessing, 
                setProcessingText, 
                setProgress,
                colorVariants,
                generatedScenarios,
                setGeneratedScenarios
            }),
            animation: React.createElement(AnimationPanel, { 
                uploadedImage, 
                setIsProcessing, 
                setProcessingText, 
                setProgress,
                generatedScenarios
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
            basic: 'Basic Edits',
            ai: 'AI Edits',
            shots: 'Color Variations',
            lifestyle: 'Lifestyle Mockups',
            animation: 'Animation',
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
                tools={tools} 
                activeToolId={activeToolId} 
                onToolClick={handleToolClick} 
            />

            {/* Main Content Area */}
            <main className="flex-1 flex flex-col">
                {/* Top Navigation */}
                <TopNavigation uploadedImage={uploadedImage} />

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