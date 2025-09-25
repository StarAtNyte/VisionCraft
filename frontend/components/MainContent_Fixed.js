// Main Content Component - ProductGenius Style (Exact Match)
const MainContent = ({ 
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
    
    // Slideshow state
    const [imageHistory, setImageHistory] = React.useState([]);
    const [currentImageIndex, setCurrentImageIndex] = React.useState(0);
    
    // Update image history when uploadedImage changes
    React.useEffect(() => {
        if (uploadedImage) {
            setImageHistory(prev => {
                const newHistory = [...prev];
                const timestamp = Date.now();
                const newImage = {
                    id: timestamp,
                    src: uploadedImage,
                    name: `Image ${newHistory.length + 1}`,
                    timestamp,
                    isVideo: uploadedImage.startsWith('data:video/')
                };
                
                // Add to history if it's not a duplicate
                if (!newHistory.some(img => img.src === uploadedImage)) {
                    newHistory.push(newImage);
                    setCurrentImageIndex(newHistory.length - 1);
                }
                
                return newHistory;
            });
        }
    }, [uploadedImage]);
    
    // Update color variants in history
    React.useEffect(() => {
        if (colorVariants && colorVariants.length > 0) {
            setImageHistory(prev => {
                const newHistory = [...prev];
                colorVariants.forEach((variant, index) => {
                    const timestamp = Date.now() + index;
                    const variantImage = {
                        id: timestamp,
                        src: variant.image,
                        name: `${variant.name} Variant`,
                        timestamp,
                        isVariant: true,
                        color: variant.color
                    };
                    
                    if (!newHistory.some(img => img.src === variant.image)) {
                        newHistory.push(variantImage);
                    }
                });
                return newHistory;
            });
        }
    }, [colorVariants]);
    
    // Global function to add generated images to slideshow
    window.addToSlideshow = React.useCallback((imageData, name, type = 'generated') => {
        const timestamp = Date.now();
        const newImage = {
            id: timestamp,
            src: imageData,
            name: name || `${type} Image`,
            timestamp,
            type,
            isVideo: imageData.startsWith('data:video/')
        };
        
        setImageHistory(prev => {
            const newHistory = [...prev, newImage];
            setCurrentImageIndex(newHistory.length - 1);
            setUploadedImage(imageData); // Update main image
            return newHistory;
        });
    }, [setUploadedImage]);
    
    const currentImage = imageHistory[currentImageIndex] || { src: uploadedImage, name: 'Current Image' };
    
    const navigateImage = (direction) => {
        if (imageHistory.length <= 1) return;
        
        if (direction === 'prev') {
            setCurrentImageIndex(prev => prev > 0 ? prev - 1 : imageHistory.length - 1);
        } else {
            setCurrentImageIndex(prev => prev < imageHistory.length - 1 ? prev + 1 : 0);
        }
    };
    
    const selectImage = (index) => {
        setCurrentImageIndex(index);
        setUploadedImage(imageHistory[index].src);
    };
    
    const clearHistory = () => {
        setImageHistory([]);
        setCurrentImageIndex(0);
    };

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

    // AI Generate function
    const handleGenerate = async () => {
        if (!prompt.trim()) {
            alert('Please enter a description for your image');
            return;
        }

        setIsProcessing(true);
        setProcessingText('AI is generating your image...');
        setProgress(0);
        setProgress(10);

        try {
            const response = await fetch('/api/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    prompt: prompt.trim(),
                    guidance_scale: 7.5,
                    num_inference_steps: 28,
                    width: 1024,
                    height: 1024
                })
            });

            setProgress(50);
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

    // AI Edit function for the floating prompt - now context-aware
    const handleAIEdit = async (promptText) => {
        if (!uploadedImage) {
            // If no image, treat as generation
            setPrompt(promptText);
            handleGenerate();
            return;
        }

        if (!promptText || !promptText.trim()) {
            alert('Please enter editing instructions');
            return;
        }

        setIsProcessing(true);
        setProgress(0);
        setProgress(10);

        try {
            const imageBase64 = uploadedImage.split(',')[1] || uploadedImage;
            
            // Determine which endpoint to call based on active tool
            let endpoint = '/api/generate'; // Default for image editing
            let requestData = {
                image_base64: imageBase64,
                prompt: promptText.trim(),
                guidance_scale: 7.5,
                num_inference_steps: 28
            };
            
            if (activeToolId === 'animation') {
                // Call video generation endpoint for animation section
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
                    num_inference_steps: 30,
                    seed: null
                };
            } else {
                // Call image edit endpoint for color variations, ad shots, and lifestyle mockup sections
                if (activeToolId === 'shots') {
                    setProcessingText('AI is generating color variation...');
                } else if (activeToolId === 'adshots') {
                    setProcessingText('AI is creating surreal ad shot...');
                } else if (activeToolId === 'lifestyle') {
                    setProcessingText('AI is creating lifestyle mockup...');
                } else {
                    setProcessingText('AI is editing your image...');
                }
            }
            
            const response = await fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(requestData)
            });

            setProgress(50);
            const result = await response.json();

            if (result.success) {
                setProgress(100);
                setTimeout(() => {
                    if (activeToolId === 'animation') {
                        // For animation, we don't replace the main image, just show success
                        // The video will be handled by the Animation panel
                        alert('Animation created successfully! Check the Animation panel to view and download your video.');
                    } else {
                        // For image editing, the result contains image data
                        const imageData = 'data:image/png;base64,' + result.image;
                        setUploadedImage(imageData);
                        // Add to slideshow as image
                        if (window.addToSlideshow) {
                            window.addToSlideshow(imageData, 'AI Edit', 'edit');
                        }
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

    return (
        <>
            {uploadedImage ? (
                /* Slideshow Container */
                <div className={`w-full ${activeToolId ? 'max-w-4xl' : 'max-w-6xl'} space-y-4`}>
                    {/* Main Image Display */}
                    <div className="bg-surface-light dark:bg-surface-dark rounded-xl shadow-lg relative overflow-hidden">
                        {/* Image Header with Navigation */}
                        {imageHistory.length > 1 && (
                            <div className="absolute top-4 left-4 right-4 z-10 flex items-center justify-between">
                                <button 
                                    onClick={() => navigateImage('prev')}
                                    className="p-2 bg-black/50 hover:bg-black/70 rounded-full text-white transition-all"
                                >
                                    <span className="material-icons">chevron_left</span>
                                </button>
                                
                                <div className="flex items-center space-x-2 bg-black/50 rounded-full px-3 py-1">
                                    <span className="text-white text-sm font-medium">{currentImage.name}</span>
                                    <span className="text-white/70 text-xs">({currentImageIndex + 1}/{imageHistory.length})</span>
                                    {imageHistory.length > 3 && (
                                        <button 
                                            onClick={clearHistory}
                                            className="ml-2 text-white/70 hover:text-white text-xs"
                                        >
                                            Clear
                                        </button>
                                    )}
                                </div>
                                
                                <button 
                                    onClick={() => navigateImage('next')}
                                    className="p-2 bg-black/50 hover:bg-black/70 rounded-full text-white transition-all"
                                >
                                    <span className="material-icons">chevron_right</span>
                                </button>
                            </div>
                        )}
                        
                        {/* Main Image/Video */}
                        <div className="p-6">
                            {currentImage.isVideo ? (
                                <video 
                                    src={currentImage.src}
                                    controls
                                    loop
                                    autoPlay
                                    muted
                                    className={`w-full h-auto ${activeToolId ? 'max-h-[60vh]' : 'max-h-[70vh]'} rounded-lg mx-auto`}
                                >
                                    Your browser does not support the video tag.
                                </video>
                            ) : (
                                <img 
                                    alt={currentImage.name || "Product image"} 
                                    className={`w-full h-auto ${activeToolId ? 'max-h-[60vh]' : 'max-h-[70vh]'} rounded-lg object-contain mx-auto`} 
                                    src={currentImage.src}
                                />
                            )}
                        </div>
                        
                        {/* Processing Overlay */}
                        {isProcessing && (
                            <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center rounded-xl">
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
                    
                    {/* Thumbnail Gallery */}
                    {imageHistory.length > 1 && (
                        <div className="bg-surface-light dark:bg-surface-dark rounded-xl p-4 shadow-lg">
                            <div className="flex items-center space-x-3 overflow-x-auto scrollbar-hide pb-2 thumbnail-gallery">
                                {imageHistory.map((image, index) => (
                                    <button
                                        key={image.id}
                                        onClick={() => selectImage(index)}
                                        className={`flex-shrink-0 relative group transition-all ${
                                            index === currentImageIndex 
                                                ? 'ring-2 ring-primary scale-105' 
                                                : 'hover:scale-102 opacity-70 hover:opacity-100'
                                        }`}
                                    >
                                        {image.isVideo ? (
                                            <div className="w-16 h-16 bg-gray-800 rounded-lg flex items-center justify-center relative overflow-hidden">
                                                <video 
                                                    src={image.src} 
                                                    className="w-full h-full object-cover"
                                                    muted
                                                />
                                                <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                                                    <span className="material-icons text-white text-lg">play_circle</span>
                                                </div>
                                            </div>
                                        ) : (
                                            <img 
                                                src={image.src} 
                                                alt={image.name}
                                                className="w-16 h-16 object-cover rounded-lg"
                                            />
                                        )}
                                        
                                        {/* Color indicator for variants */}
                                        {image.isVariant && image.color && (
                                            <div 
                                                className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white dark:border-gray-800"
                                                style={{ backgroundColor: image.color }}
                                            ></div>
                                        )}
                                        
                                        {/* Current image indicator */}
                                        {index === currentImageIndex && (
                                            <div className="absolute inset-0 bg-primary/20 rounded-lg flex items-center justify-center">
                                                <span className="material-icons text-primary text-sm">check_circle</span>
                                            </div>
                                        )}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            ) : (
                /* Upload/Generate Area */
                <div className={`w-full ${activeToolId ? 'max-w-3xl' : 'max-w-5xl'}`}>
                    {/* Upload Area */}
                    <div 
                        className={`bg-surface-light dark:bg-surface-dark p-12 rounded-xl shadow-lg border-2 border-dashed cursor-pointer transition-colors mb-6 ${
                            isDragOver 
                                ? 'border-primary bg-primary/5' 
                                : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
                        }`}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                        onClick={() => fileInputRef.current?.click()}
                    >
                        <div className="text-center">
                            <span className="material-icons text-6xl text-gray-400 dark:text-gray-500 mb-4 block">
                                cloud_upload
                            </span>
                            <h3 className="text-lg font-medium text-text-light dark:text-text-dark mb-2">
                                Upload your product image
                            </h3>
                            <p className="text-sm text-subtle-light dark:text-subtle-dark mb-4">
                                Drag and drop your image here, or click to browse
                            </p>
                            <p className="text-xs text-subtle-light dark:text-subtle-dark">
                                Supports JPG, PNG, GIF up to 10MB
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

                    {/* AI Generation Area */}
                    <div className="bg-surface-light dark:bg-surface-dark p-6 rounded-xl shadow-lg">
                        <div className="text-center mb-4">
                            <span className="material-icons text-4xl text-primary mb-2 block">
                                auto_awesome
                            </span>
                            <h3 className="text-lg font-medium text-text-light dark:text-text-dark mb-2">
                                Or Generate with AI
                            </h3>
                        </div>
                        
                        <div className="space-y-4">
                            <textarea
                                value={prompt}
                                onChange={(e) => setPrompt(e.target.value)}
                                placeholder="Describe your product... (e.g., modern wireless headphones on white background)"
                                className="w-full h-20 px-4 py-3 bg-gray-100 dark:bg-gray-800 border-none rounded-lg text-sm focus:ring-primary focus:border-primary resize-none"
                                rows={3}
                            />
                            
                            <button
                                onClick={handleGenerate}
                                disabled={!prompt.trim() || isProcessing}
                                className="w-full flex items-center justify-center space-x-2 bg-primary text-white font-semibold py-3 rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <span className="material-icons">auto_awesome</span>
                                <span>{isProcessing ? 'Generating...' : 'Generate Image'}</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Floating AI Edit Prompt - Positioned to avoid thumbnail overlap */}
            {uploadedImage && (
                <div className={`absolute ${imageHistory.length > 1 ? 'bottom-28' : 'bottom-8'} w-full ${activeToolId ? 'max-w-3xl' : 'max-w-5xl'} px-8`}>
                    <div className="relative">
                        <span className={`material-icons absolute left-4 top-1/2 -translate-y-1/2 ${
                            activeToolId === 'animation' ? 'text-orange-500' :
                            activeToolId === 'shots' ? 'text-purple-500' :
                            activeToolId === 'adshots' ? 'text-pink-500' :
                            activeToolId === 'lifestyle' ? 'text-green-500' :
                            'text-primary'
                        }`}>
                            {activeToolId === 'animation' ? 'play_arrow' :
                             activeToolId === 'shots' ? 'palette' :
                             activeToolId === 'adshots' ? 'auto_awesome' :
                             activeToolId === 'lifestyle' ? 'people' :
                             'auto_fix_high'}
                        </span>
                        <input 
                            className="w-full bg-surface-light dark:bg-surface-dark border border-gray-300 dark:border-gray-600 rounded-lg pl-12 pr-16 py-3 text-sm focus:ring-primary focus:border-primary shadow-sm" 
                            placeholder={
                                activeToolId === 'animation' 
                                    ? "Describe animation... (e.g., smooth rotation, floating motion)"
                                    : activeToolId === 'shots'
                                    ? "Describe color change... (e.g., change to red, make it blue)"
                                    : activeToolId === 'adshots'
                                    ? "Describe surreal ad concept... (e.g., floating in crystal dimension)"
                                    : activeToolId === 'lifestyle'
                                    ? "Describe lifestyle scene... (e.g., person using product in cafe)"
                                    : "Describe changes... (e.g., remove background, change to blue)"
                            }
                            type="text"
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
                            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-gray-200 dark:bg-gray-700 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600"
                            onClick={(e) => {
                                const input = e.target.parentElement.querySelector('input');
                                const prompt = input.value.trim();
                                if (prompt) {
                                    handleAIEdit(prompt);
                                    input.value = '';
                                }
                            }}
                        >
                            <span className="material-icons text-text-light dark:text-text-dark !text-base">
                                check
                            </span>
                        </button>
                    </div>
                </div>
            )}
        </>
    );
};