// Progress Bar Component (Separate to prevent unnecessary re-renders)
const ProgressBar = React.memo(({ isProcessing, processingText, progress }) => {
    if (!isProcessing) return null;
    
    return (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 z-50 min-w-80">
            <div className="flex items-center space-x-3">
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-primary border-t-transparent"></div>
                <div className="flex-1">
                    <p className="text-sm font-medium text-text-light dark:text-text-dark">{processingText}</p>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mt-2">
                        <div 
                            className="bg-primary h-2 rounded-full transition-all duration-300 ease-out"
                            style={{ width: `${Math.min(progress, 100)}%` }}
                        ></div>
                    </div>
                </div>
            </div>
        </div>
    );
});

// Enhanced Main Content Component - AI Generation, Upload, and Lifestyle Galleries (Optimized)
const MainContent = React.memo(({ 
    uploadedImage, 
    setUploadedImage, 
    isProcessing, 
    processingText, 
    progress,
    setIsProcessing,
    setProcessingText,
    setProgress,
    activeToolId,
    colorVariants,
    setColorVariants
}) => {
    const fileInputRef = React.useRef(null);
    const [isDragOver, setIsDragOver] = React.useState(false);
    const [prompt, setPrompt] = React.useState('');
    const [showAdvanced, setShowAdvanced] = React.useState(false);
    const [sidebarCollapsed, setSidebarCollapsed] = React.useState(false);

    const handleDragOver = (e) => {
        e.preventDefault();
        setIsDragOver(true);
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        setIsDragOver(false);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragOver(false);
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            handleFileUpload(files[0]);
        }
    };

    const handleFileUpload = (file) => {
        if (file && file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = (e) => {
                setUploadedImage(e.target.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const sampleImages = [
        'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=150&h=150&fit=crop',
        'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=150&h=150&fit=crop',
        'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=150&h=150&fit=crop',
    ];

    // Auto-collapse when image is uploaded, or manual collapse
    const isCollapsed = (uploadedImage && !sidebarCollapsed) || sidebarCollapsed;

    // AI Edit function for the floating prompt - handles different endpoints based on active tool
    const handleAIEdit = async (promptText) => {
        if (!uploadedImage) {
            alert('Please upload an image first');
            return;
        }

        if (!promptText || !promptText.trim()) {
            alert('Please enter editing instructions');
            return;
        }

        setIsProcessing(true);
        setProgress(0);

        // Determine endpoint and processing text based on active tool
        let endpoint, requestData, processingMessage;
        const imageBase64 = uploadedImage.split(',')[1] || uploadedImage;

        if (activeToolId === 'animation') {
            // Video generation endpoint for animation section
            endpoint = '/api/generate-video';
            setProcessingText('AI is creating your animation...');
            requestData = {
                image_base64: imageBase64,
                prompt: promptText.trim(),
                category: 'product',
                animation_style: 'smooth_rotation',
                height: 720,
                width: 1280,
                num_frames: 49,
                guidance_scale: 3.5,
                num_inference_steps: 30
            };
        } else {
            // Image edit endpoint for color variations and lifestyle mockup sections
            endpoint = '/api/generate';
            if (activeToolId === 'shots') {
                setProcessingText('AI is generating color variation...');
            } else if (activeToolId === 'lifestyle') {
                setProcessingText('AI is creating lifestyle mockup...');
            } else {
                setProcessingText('AI is editing your image...');
            }
            requestData = {
                image_base64: imageBase64,
                prompt: promptText.trim(),
                guidance_scale: 7.5,
                num_inference_steps: 28
            };
        }

        const interval = setInterval(() => {
            setProgress(prev => {
                if (prev >= 90) {
                    clearInterval(interval);
                    return 90;
                }
                return prev + 5;
            });
        }, 300);

        try {
            const response = await fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(requestData)
            });

            const result = await response.json();

            if (result.success) {
                setProgress(100);
                setTimeout(() => {
                    if (activeToolId === 'animation') {
                        // For animation, update the main area with the generated video
                        if (result.video) {
                            const videoData = `data:video/mp4;base64,${result.video}`;
                            setUploadedImage(videoData);
                            
                            // Also add to slideshow if available
                            if (window.addToSlideshow) {
                                window.addToSlideshow(
                                    videoData,
                                    'Quick Animation',
                                    'animation'
                                );
                            }
                        }
                    } else {
                        // For image edits, update the main image
                        setUploadedImage('data:image/png;base64,' + result.image);
                    }
                    setIsProcessing(false);
                    setProgress(0);
                }, 500);
            } else {
                setIsProcessing(false);
                setProgress(0);
                alert('Error: ' + (result.message || result.detail || 'Failed to process request'));
            }
        } catch (error) {
            setIsProcessing(false);
            setProgress(0);
            alert('Error processing request: ' + error.message);
        }
    };

    const handleGenerate = async () => {
        if (!prompt.trim()) {
            alert('Please enter a description for your image');
            return;
        }

        setIsProcessing(true);
        setProcessingText('AI is generating your image...');
        setProgress(0);

        const interval = setInterval(() => {
            setProgress(prev => {
                if (prev >= 90) {
                    clearInterval(interval);
                    return 90;
                }
                return prev + 10;
            });
        }, 500);

        try {
            const response = await fetch('/api/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    prompt: prompt,
                    guidance_scale: 7.5,
                    num_inference_steps: 28,
                    width: 1024,
                    height: 1024
                })
            });

            const result = await response.json();

            if (result.success) {
                setProgress(100);
                setTimeout(() => {
                    setUploadedImage('data:image/png;base64,' + result.image);
                    setIsProcessing(false);
                    setProgress(0);
                }, 500);
            } else {
                setIsProcessing(false);
                setProgress(0);
                alert('Error: ' + (result.message || result.detail || 'Failed to generate image'));
            }
        } catch (error) {
            setIsProcessing(false);
            setProgress(0);
            alert('Error generating image: ' + error.message);
        }
    };

    return (
        <>
            <ProgressBar isProcessing={isProcessing} processingText={processingText} progress={progress} />
            <div className="flex h-full w-full bg-gray-900">
            {/* Left Column: Generation - Collapsible */}
            <div className={`${isCollapsed ? 'w-12' : 'w-80'} bg-gray-800 border-r border-gray-700 overflow-y-auto flex-shrink-0 transition-all duration-300 ease-in-out`}>
                {isCollapsed ? (
                    // Collapsed state - toggle buttons
                    <div className="p-3 flex flex-col items-center gap-3">
                        <button
                            onClick={() => setSidebarCollapsed(false)}
                            className="w-8 h-8 bg-gray-700 hover:bg-gray-600 rounded-lg flex items-center justify-center text-gray-300 hover:text-white transition-colors"
                            title="Show Generation Panel"
                        >
                            <Icons.ChevronDown style={{ width: '16px', height: '16px', transform: 'rotate(-90deg)' }} />
                        </button>
                        {uploadedImage && (
                            <button
                                onClick={() => setUploadedImage(null)}
                                className="w-8 h-8 bg-red-600 hover:bg-red-500 rounded-lg flex items-center justify-center text-white transition-colors"
                                title="Clear Image"
                            >
                                <Icons.X style={{ width: '16px', height: '16px' }} />
                            </button>
                        )}
                    </div>
                ) : (
                    // Expanded state - full generation panel
                    <div className="p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold text-white">Generation</h2>
                            <button
                                onClick={() => setSidebarCollapsed(true)}
                                className="w-8 h-8 bg-gray-700 hover:bg-gray-600 rounded-lg flex items-center justify-center text-gray-300 hover:text-white transition-colors"
                                title="Collapse Panel"
                            >
                                <Icons.ChevronDown style={{ width: '16px', height: '16px', transform: 'rotate(90deg)' }} />
                            </button>
                        </div>
                
                        {/* AI Prompt */}
                        <div className="mb-6">
                            <h3 className="text-sm font-semibold text-gray-300 mb-3">AI Prompt</h3>
                            <textarea
                                value={prompt}
                                onChange={(e) => setPrompt(e.target.value)}
                                placeholder="Describe your product..."
                                className="w-full h-24 px-3 py-2 border border-gray-600 rounded-lg bg-gray-700 text-white placeholder-gray-400 resize-none focus:ring-2 focus:ring-primary focus:border-primary"
                                rows={3}
                            />
                        </div>

                        {/* Advanced Settings & Style Presets */}
                        <div className="mb-6 space-y-3">
                            <button
                                onClick={() => setShowAdvanced(!showAdvanced)}
                                className="flex items-center text-sm text-gray-400 hover:text-white"
                            >
                                Advanced Settings
                                <Icons.ChevronDown 
                                    style={{ 
                                        width: '16px', 
                                        height: '16px', 
                                        marginLeft: '4px',
                                        transform: showAdvanced ? 'rotate(180deg)' : 'rotate(0deg)',
                                        transition: 'transform 0.2s ease'
                                    }} 
                                />
                            </button>
                            
                            {showAdvanced && (
                                <div className="space-y-3 pl-4 border-l-2 border-gray-600">
                                    <div>
                                        <label className="block text-xs font-medium text-gray-300 mb-1">
                                            Quality
                                        </label>
                                        <select className="w-full text-sm border border-gray-600 rounded-md bg-gray-700 text-white px-2 py-1">
                                            <option>Standard</option>
                                            <option>High</option>
                                            <option>Ultra</option>
                                        </select>
                                    </div>
                                    
                                    <div>
                                        <label className="block text-xs font-medium text-gray-300 mb-1">
                                            Style Preset
                                        </label>
                                        <select className="w-full text-sm border border-gray-600 rounded-md bg-gray-700 text-white px-2 py-1">
                                            <option>Photorealistic</option>
                                            <option>Artistic</option>
                                            <option>Minimalist</option>
                                            <option>Vintage</option>
                                        </select>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Generate Button */}
                        <button
                            onClick={handleGenerate}
                            disabled={!prompt.trim() || isProcessing}
                            className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white font-semibold py-3 px-4 rounded-lg transition-colors mb-4"
                        >
                            {isProcessing ? 'Generating...' : 'Generate'}
                        </button>

                        {/* Enhance & Refine Buttons */}
                        <div className="flex gap-2 mb-6">
                            <button className="flex-1 bg-gray-600 hover:bg-gray-500 text-gray-200 font-medium py-2 px-3 rounded-md text-sm transition-colors">
                                Enhance
                            </button>
                            <button className="flex-1 bg-gray-600 hover:bg-gray-500 text-gray-200 font-medium py-2 px-3 rounded-md text-sm transition-colors">
                                Refine
                            </button>
                        </div>

                        {/* Image Upload Section */}
                        <div>
                            <h3 className="text-sm font-semibold text-gray-300 mb-3">Image Upload</h3>
                            <div
                                onDragOver={handleDragOver}
                                onDragLeave={handleDragLeave}
                                onDrop={handleDrop}
                                onClick={() => fileInputRef.current?.click()}
                                className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                                    isDragOver 
                                        ? 'border-primary bg-primary/5' 
                                        : 'border-gray-600 hover:border-gray-500'
                                }`}
                            >
                                <Icons.Upload className="mx-auto h-12 w-12 text-gray-500 mb-3" />
                                <p className="text-sm text-gray-400 mb-1">
                                    Click to upload or drag and drop
                                </p>
                                <p className="text-xs text-gray-500">
                                    SVG, PNG, JPG or GIF (MAX. 800x400)
                                </p>
                            </div>
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={(e) => {
                                    if (e.target.files && e.target.files[0]) {
                                        handleFileUpload(e.target.files[0]);
                                    }
                                }}
                            />
                        </div>
                    </div>
                )}
            </div>

            {/* Right Column: Image Area */}
            <div className="flex-1 bg-gray-900 flex flex-col min-w-0">
                <div className="w-full flex items-center justify-center p-6" style={{
                    height: uploadedImage ? 'calc(100vh - 160px)' : 'calc(100vh - 80px)',
                    minHeight: '400px'
                }}>
                    {uploadedImage ? (
                        <div className="relative w-full h-full flex items-center justify-center">
                            <img
                                src={uploadedImage}
                                alt="Generated or uploaded"
                                className="max-w-full max-h-full object-contain rounded-lg shadow-lg"
                                style={{ maxHeight: 'calc(100vh - 200px)' }}
                            />
                            
                            {/* Processing Overlay */}
                            {isProcessing && (
                                <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center rounded-lg">
                                    <div className="w-16 h-16 border-4 border-gray-400 border-t-primary rounded-full animate-spin mb-4"></div>
                                    <p className="text-white font-semibold mb-2">{processingText}</p>
                                    <div className="w-48 h-2 bg-gray-600 rounded-full overflow-hidden">
                                        <div 
                                            className="h-full bg-primary transition-all duration-300 ease-out"
                                            style={{ width: `${progress}%` }}
                                        ></div>
                                    </div>
                                    <span className="text-white text-sm mt-2">{progress}%</span>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="w-full flex flex-col items-center justify-center text-center">
                            <div className="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-gray-600">
                                <Icons.Upload className="h-8 w-8 text-gray-500" />
                            </div>
                            <h3 className="text-lg font-medium text-gray-400 mb-2">
                                No image loaded
                            </h3>
                            <p className="text-sm text-gray-500 max-w-md">
                                Upload an image or generate one with AI to get started
                            </p>
                        </div>
                    )}
                </div>

            {/* Color Variants Display - Enhanced */}
            {colorVariants.length > 0 && (
                <div style={{ 
                    padding: '32px',
                    borderTop: '1px solid #374151',
                    backgroundColor: '#1f2937'
                }}>
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-xl font-bold text-white">Color Variations ({colorVariants.length})</h3>
                        <button 
                            onClick={() => setColorVariants([])}
                            className="text-gray-400 hover:text-white text-sm"
                        >
                            Clear All
                        </button>
                    </div>
                    
                    {/* Large Grid Display */}
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {colorVariants.map((variant, index) => (
                            <div key={index} className="relative group cursor-pointer bg-gray-800 rounded-xl overflow-hidden hover:transform hover:scale-105 transition-all duration-300">
                                <div className="aspect-square relative">
                                    <img 
                                        src={variant.image} 
                                        alt={`Color variant ${index + 1}`}
                                        className="w-full h-full object-cover"
                                        onClick={() => setUploadedImage(variant.image)}
                                    />
                                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all flex items-center justify-center">
                                        <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button 
                                                onClick={() => setUploadedImage(variant.image)}
                                                className="bg-teal-500 hover:bg-teal-600 text-white px-4 py-2 rounded-lg font-medium shadow-lg"
                                            >
                                                Use This Color
                                            </button>
                                        </div>
                                    </div>
                                </div>
                                
                                {/* Color Info */}
                                <div className="p-4">
                                    <div className="flex items-center space-x-3">
                                        <div 
                                            className="w-8 h-8 rounded-full border-2 border-gray-600 shadow-inner"
                                            style={{ backgroundColor: variant.color }}
                                        ></div>
                                        <div>
                                            <p className="text-white font-medium text-sm">{variant.name}</p>
                                            <p className="text-gray-400 text-xs">{variant.color}</p>
                                        </div>
                                    </div>
                                    
                                    {/* Action Buttons */}
                                    <div className="flex space-x-2 mt-3">
                                        <button 
                                            onClick={() => setUploadedImage(variant.image)}
                                            className="flex-1 bg-teal-600 hover:bg-teal-700 text-white text-xs py-2 rounded-md transition-colors"
                                        >
                                            Select
                                        </button>
                                        <button 
                                            onClick={() => {
                                                const link = document.createElement('a');
                                                link.href = variant.image;
                                                link.download = `${variant.name.toLowerCase().replace(/\s+/g, '-')}-variant.png`;
                                                document.body.appendChild(link);
                                                link.click();
                                                document.body.removeChild(link);
                                            }}
                                            className="bg-gray-600 hover:bg-gray-700 text-white text-xs py-2 px-3 rounded-md transition-colors"
                                        >
                                            <Icons.Download className="w-3 h-3" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                    
                    {/* Bulk Actions */}
                    <div className="flex justify-center space-x-4 mt-8">
                        <button 
                            onClick={() => {
                                colorVariants.forEach((variant, index) => {
                                    const link = document.createElement('a');
                                    link.href = variant.image;
                                    link.download = `color-variant-${index + 1}-${variant.name.toLowerCase().replace(/\s+/g, '-')}.png`;
                                    document.body.appendChild(link);
                                    link.click();
                                    document.body.removeChild(link);
                                });
                            }}
                            className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                        >
                            <Icons.Download className="w-4 h-4 inline mr-2" />
                            Download All
                        </button>
                        <button 
                            onClick={() => setColorVariants([])}
                            className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                        >
                            Clear Variations
                        </button>
                    </div>
                </div>
            )}

            {/* Floating AI Edit Prompt - Responsive to Sidebar and Tool Panel */}
            {uploadedImage && (
                <div style={{
                    position: 'fixed',
                    bottom: '12px',
                    left: activeToolId ? '72px' : '0px',
                    right: activeToolId ? '360px' : '0px',
                    zIndex: 1000,
                    display: 'flex',
                    justifyContent: 'center',
                    paddingLeft: '24px',
                    paddingRight: '24px',
                    animation: 'slideUp 0.3s ease-out',
                    transition: 'left 0.3s ease, right 0.3s ease'
                }}>
                    <div style={{
                        width: '100%',
                        maxWidth: activeToolId ? '600px' : '800px',
                        transition: 'max-width 0.3s ease'
                    }}>
                        <div style={{
                            background: 'rgba(26, 26, 26, 0.95)',
                            backdropFilter: 'blur(20px)',
                            border: '1px solid rgba(139, 92, 246, 0.3)',
                            borderRadius: '12px',
                            padding: '12px 16px',
                            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(139, 92, 246, 0.1)',
                            display: 'flex',
                            gap: '16px',
                            alignItems: 'center'
                        }}>
                            <div style={{
                                width: '32px',
                                height: '32px',
                                borderRadius: '8px',
                                background: activeToolId === 'animation' 
                                    ? 'linear-gradient(135deg, #f59e0b 0%, #ef4444 100%)'
                                    : activeToolId === 'shots'
                                    ? 'linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%)'
                                    : activeToolId === 'lifestyle'
                                    ? 'linear-gradient(135deg, #10b981 0%, #3b82f6 100%)'
                                    : 'linear-gradient(135deg, #8b5cf6 0%, #14b8a6 100%)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                flexShrink: 0
                            }}>
                                {activeToolId === 'animation' ? (
                                    <Icons.Play style={{ width: '16px', height: '16px', color: 'white' }} />
                                ) : activeToolId === 'shots' ? (
                                    <Icons.Palette style={{ width: '16px', height: '16px', color: 'white' }} />
                                ) : activeToolId === 'lifestyle' ? (
                                    <Icons.Users style={{ width: '16px', height: '16px', color: 'white' }} />
                                ) : (
                                    <Icons.Wand2 style={{ width: '16px', height: '16px', color: 'white' }} />
                                )}
                            </div>
                            
                            <input
                                id="floating-ai-prompt"
                                type="text"
                                placeholder={
                                    activeToolId === 'animation' 
                                        ? "Describe animation... (e.g., smooth rotation, floating motion)"
                                        : activeToolId === 'shots'
                                        ? "Describe color change... (e.g., change to red, make it blue)"
                                        : activeToolId === 'lifestyle'
                                        ? "Describe lifestyle scene... (e.g., person using product in cafe)"
                                        : "Describe changes... (e.g., remove background, change to blue)"
                                }
                                style={{
                                    flex: 1,
                                    background: 'transparent',
                                    border: 'none',
                                    outline: 'none',
                                    color: '#ffffff',
                                    fontSize: '16px',
                                    fontWeight: '400',
                                    fontFamily: 'inherit'
                                }}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        e.preventDefault();
                                        const prompt = e.target.value.trim();
                                        if (prompt) {
                                            handleAIEdit(prompt);
                                            e.target.value = '';
                                        }
                                    }
                                }}
                            />
                            
                            <button
                                onClick={() => {
                                    const prompt = document.getElementById('floating-ai-prompt').value.trim();
                                    if (prompt) {
                                        handleAIEdit(prompt);
                                        document.getElementById('floating-ai-prompt').value = '';
                                    }
                                }}
                                style={{
                                    width: '32px',
                                    height: '32px',
                                    borderRadius: '8px',
                                    background: 'rgba(255, 255, 255, 0.1)',
                                    border: 'none',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    transition: 'all 0.2s ease',
                                    flexShrink: 0
                                }}
                                onMouseEnter={(e) => {
                                    e.target.style.background = 'rgba(255, 255, 255, 0.2)';
                                    e.target.style.transform = 'scale(1.05)';
                                }}
                                onMouseLeave={(e) => {
                                    e.target.style.background = 'rgba(255, 255, 255, 0.1)';
                                    e.target.style.transform = 'scale(1)';
                                }}
                            >
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: '#ffffff' }}>
                                    <path d="M5 12l5 5L20 7" />
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
        </>
    );
});