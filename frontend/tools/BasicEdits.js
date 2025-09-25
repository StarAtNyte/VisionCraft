// Basic Edits Panel (Optimized)
const BasicEditsPanel = React.memo(({ uploadedImage, setUploadedImage, setIsProcessing, setProcessingText, setProgress }) => {
    const [brightness, setBrightness] = React.useState(0);
    const [contrast, setContrast] = React.useState(0);
    const [saturation, setSaturation] = React.useState(0);

    const applyBasicEdit = async (operation, value = null) => {
        if (!uploadedImage) return;

        setIsProcessing(true);
        setProcessingText(`Applying ${operation}...`);
        
        // Optimized progress updates
        const updateProgress = React.useCallback((value) => {
            setProgress(value);
        }, [setProgress]);
        
        updateProgress(0);
        updateProgress(10);

        try {
            // Here you would integrate with your backend API
            const response = await fetch('/api/basic-edit', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    image_base64: uploadedImage.split(',')[1],
                    operation: operation,
                    value: value
                })
            });

            setTimeout(() => {
                updateProgress(100);
                setTimeout(() => {
                    setIsProcessing(false);
                    updateProgress(0);
                }, 500);
            }, 1000);

        } catch (error) {
            console.error('Edit failed:', error);
            setIsProcessing(false);
            updateProgress(0);
        }
    };

    return (
        <div className="space-y-6">
            {/* Transform Tools */}
            <div>
                <h4 className="font-medium mb-3">Transform</h4>
                <div className="grid grid-cols-2 gap-3">
                    <button 
                        onClick={() => applyBasicEdit('rotate')}
                        className="p-3 bg-dark-bg border border-dark-border rounded-lg hover:bg-gray-700 transition-colors"
                    >
                        <Icons.RotateCw className="w-5 h-5 mx-auto mb-1 text-teal-500" />
                        <div className="text-sm">Rotate</div>
                    </button>
                    <button 
                        onClick={() => applyBasicEdit('crop')}
                        className="p-3 bg-dark-bg border border-dark-border rounded-lg hover:bg-gray-700 transition-colors"
                    >
                        <Icons.Crop className="w-5 h-5 mx-auto mb-1 text-teal-500" />
                        <div className="text-sm">Crop</div>
                    </button>
                </div>
            </div>

            {/* Adjustments */}
            <div>
                <h4 className="font-medium mb-3">Adjustments</h4>
                <div className="space-y-4">
                    <div>
                        <label className="text-sm text-dark-text-secondary mb-2 block">
                            Brightness: {brightness}
                        </label>
                        <input 
                            type="range" 
                            min="-100" 
                            max="100" 
                            value={brightness}
                            onChange={(e) => setBrightness(e.target.value)}
                            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                        />
                    </div>
                    <div>
                        <label className="text-sm text-dark-text-secondary mb-2 block">
                            Contrast: {contrast}
                        </label>
                        <input 
                            type="range" 
                            min="-100" 
                            max="100" 
                            value={contrast}
                            onChange={(e) => setContrast(e.target.value)}
                            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                        />
                    </div>
                    <div>
                        <label className="text-sm text-dark-text-secondary mb-2 block">
                            Saturation: {saturation}
                        </label>
                        <input 
                            type="range" 
                            min="-100" 
                            max="100" 
                            value={saturation}
                            onChange={(e) => setSaturation(e.target.value)}
                            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                        />
                    </div>
                    <button 
                        onClick={() => applyBasicEdit('adjust', { brightness, contrast, saturation })}
                        className="w-full gradient-primary py-2 rounded-lg font-medium text-white hover:opacity-90 transition-opacity"
                    >
                        Apply Adjustments
                    </button>
                </div>
            </div>

            {/* Filters */}
            <div>
                <h4 className="font-medium mb-3">Filters</h4>
                <div className="grid grid-cols-2 gap-3">
                    {['Vintage', 'B&W', 'Sepia', 'Vivid'].map(filter => (
                        <button 
                            key={filter}
                            onClick={() => applyBasicEdit('filter', filter.toLowerCase())}
                            className="p-3 bg-dark-bg border border-dark-border rounded-lg hover:bg-gray-700 transition-colors text-sm"
                        >
                            {filter}
                        </button>
                    ))}
                </div>
            </div>

            {/* Reset */}
            <div>
                <button 
                    onClick={() => {
                        setBrightness(0);
                        setContrast(0);
                        setSaturation(0);
                    }}
                    className="w-full py-2 border border-dark-border rounded-lg hover:bg-gray-700 transition-colors text-sm"
                >
                    Reset All
                </button>
            </div>
        </div>
    );
}, (prevProps, nextProps) => {
    // Custom comparison to prevent re-renders on progress changes
    return (
        prevProps.uploadedImage === nextProps.uploadedImage &&
        prevProps.setUploadedImage === nextProps.setUploadedImage &&
        prevProps.setIsProcessing === nextProps.setIsProcessing &&
        prevProps.setProcessingText === nextProps.setProcessingText &&
        prevProps.setProgress === nextProps.setProgress
    );
});