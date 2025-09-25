// Animation Panel - WAN 2.2 I2V Integration (Optimized)
const AnimationPanel = React.memo(({ uploadedImage, setIsProcessing, setProcessingText, setProgress, generatedScenarios }) => {
    const [selectedCategory, setSelectedCategory] = React.useState('product');
    const [selectedStyle, setSelectedStyle] = React.useState('smooth_rotation');
    const [customPrompt, setCustomPrompt] = React.useState('');
    const [generatedVideos, setGeneratedVideos] = React.useState([]);
    const [showAdvanced, setShowAdvanced] = React.useState(false);
    const [imageSource, setImageSource] = React.useState('main'); // 'main' or 'lifestyle'
    const [selectedLifestyleImage, setSelectedLifestyleImage] = React.useState(null);
    const [advancedSettings, setAdvancedSettings] = React.useState({
        guidance_scale: 3.5,
        num_inference_steps: 30,
        num_frames: 49,
        seed: null
    });

    // Product categories with descriptions
    const productCategories = [
        { id: 'product', name: 'General Product', icon: '📦', description: 'Professional showcase for any product' },
        { id: 'electronics', name: 'Electronics', icon: '📱', description: 'Tech gadgets and electronic devices' },
        { id: 'fashion', name: 'Fashion & Apparel', icon: '👗', description: 'Clothing, shoes, and fashion items' },
        { id: 'jewelry', name: 'Jewelry & Accessories', icon: '💍', description: 'Rings, watches, and luxury accessories' },
        { id: 'cosmetics', name: 'Beauty & Cosmetics', icon: '💄', description: 'Makeup, skincare, and beauty products' },
        { id: 'furniture', name: 'Furniture & Home', icon: '🪑', description: 'Home decor and furniture items' },
        { id: 'automotive', name: 'Automotive', icon: '🚗', description: 'Car parts and automotive accessories' },
        { id: 'food', name: 'Food & Beverages', icon: '🍔', description: 'Food items and drink products' },
        { id: 'sports', name: 'Sports & Fitness', icon: '⚽', description: 'Athletic gear and fitness equipment' },
        { id: 'lifestyle', name: 'Lifestyle Products', icon: '🎯', description: 'Everyday lifestyle and hobby items' }
    ];

    // Animation styles with creative descriptions
    const animationStyles = [
        { 
            id: 'smooth_rotation', 
            name: '360° Smooth Rotation', 
            icon: '🔄', 
            description: 'Professional 360-degree product rotation with cinematic camera movement' 
        },
        { 
            id: 'gentle_float', 
            name: 'Gentle Floating', 
            icon: '🪶', 
            description: 'Ethereal floating motion with soft, dream-like transitions' 
        },
        { 
            id: 'dynamic_showcase', 
            name: 'Dynamic Showcase', 
            icon: '⚡', 
            description: 'Multi-angle dynamic presentation with professional lighting' 
        },
        { 
            id: 'lifestyle_scene', 
            name: 'Lifestyle Integration', 
            icon: '🏠', 
            description: 'Product shown in natural lifestyle environments and contexts' 
        },
        { 
            id: 'premium_reveal', 
            name: 'Premium Reveal', 
            icon: '✨', 
            description: 'Dramatic product reveal with luxury presentation and lighting' 
        },
        { 
            id: 'tech_demo', 
            name: 'Tech Demonstration', 
            icon: '🔬', 
            description: 'Modern technology showcase with interactive elements' 
        },
        { 
            id: 'organic_flow', 
            name: 'Organic Flow', 
            icon: '🌊', 
            description: 'Natural, flowing movement with smooth organic transitions' 
        },
        { 
            id: 'dramatic_lighting', 
            name: 'Dramatic Lighting', 
            icon: '🎬', 
            description: 'Cinematic lighting changes with mood enhancement effects' 
        },
        { 
            id: 'close_up_details', 
            name: 'Detail Focus', 
            icon: '🔍', 
            description: 'Close-up shots highlighting textures and premium quality' 
        },
        { 
            id: 'environmental_context', 
            name: 'Environmental Story', 
            icon: '🌍', 
            description: 'Story-driven animation with environmental integration' 
        }
    ];

    // Create professional ad-quality prompts
    const createAdQualityPrompt = (category, style) => {
        // Professional commercial-grade category enhancements
        const categoryEnhancements = {
            product: 'premium commercial product showcase, Apple-style presentation, studio-quality lighting, professional cinematography',
            electronics: 'high-tech commercial aesthetic, sleek modern design, premium materials showcase, tech product advertising style',
            fashion: 'luxury fashion commercial, editorial presentation, sophisticated styling, high-end brand aesthetic',
            jewelry: 'luxury jewelry commercial, sparkling premium presentation, sophisticated lighting, Tiffany-style advertising',
            cosmetics: 'premium beauty commercial, elegant product presentation, soft luxury lighting, high-end cosmetics advertising',
            furniture: 'sophisticated furniture commercial, modern interior design aesthetic, architectural presentation style',
            automotive: 'premium automotive commercial, sleek dynamic presentation, luxury car advertising aesthetic',
            food: 'gourmet food commercial, appetizing premium presentation, culinary artistry, fine dining aesthetic',
            sports: 'dynamic sports commercial, athletic performance showcase, Nike-style energy, fitness advertising aesthetic',
            lifestyle: 'aspirational lifestyle commercial, modern living presentation, premium brand aesthetic'
        };
        
        // Ad-quality motion and cinematography descriptions
        const styleMotions = {
            smooth_rotation: 'cinematic 360-degree rotation with professional camera movement, smooth gimbal-like motion, commercial-grade cinematography, perfect product tracking',
            hero_reveal: 'dramatic hero product reveal with cinematic lighting transitions, luxury brand commercial style, sophisticated unveiling sequence, premium presentation',
            dynamic_showcase: 'professional multi-angle dynamic presentation, smooth camera transitions, Nike-commercial style movement, high-energy cinematography',
            floating_elegance: 'elegant floating motion with premium studio lighting, sophisticated levitation effect, luxury commercial aesthetic, Chanel-style presentation',
            kinetic_energy: 'high-energy kinetic movement with dynamic motion blur, explosive energy effects, sports commercial cinematography, Red Bull-style dynamism',
            minimalist_spin: 'clean minimal rotation with perfect studio lighting, tech product commercial aesthetic, Apple-style simplicity, precision movement',
            luxury_orbit: 'sophisticated orbital camera movement with premium lighting setup, luxury watch commercial style, Rolex-level cinematography',
            explosive_reveal: 'dynamic explosive reveal with professional particle effects, gaming commercial style, high-impact presentation, tech product unveiling',
            smooth_glide: 'buttery smooth gliding motion with ambient premium lighting, automotive commercial style, Mercedes-level sophistication',
            rhythmic_pulse: 'rhythmic pulsing motion synchronized with professional beat, audio product commercial style, Beats-style presentation'
        };
        
        const categoryText = categoryEnhancements[category] || categoryEnhancements.product;
        const motionText = styleMotions[style] || styleMotions.smooth_rotation;
        
        return `Professional commercial animation: ${categoryText}, ${motionText}, commercial television advertising quality, Super Bowl commercial level production, professional cinematography, cinema-quality lighting, smooth motion, award-winning commercial aesthetic, high-end brand presentation, broadcast television quality`;
    };

    const generateAnimation = async () => {
        const sourceImage = imageSource === 'lifestyle' && selectedLifestyleImage 
            ? selectedLifestyleImage.image 
            : uploadedImage;
            
        if (!sourceImage) {
            alert('Please select an image first');
            return;
        }

        setIsProcessing(true);
        setProcessingText('Creating AI-powered animation...');
        setProgress(0);

        // Optimized progress updates - less frequent to reduce re-renders
        const updateProgress = React.useCallback((value) => {
            setProgress(value);
        }, [setProgress]);
        
        let currentProgress = 0;
        const progressInterval = setInterval(() => {
            currentProgress += Math.random() * 12;
            if (currentProgress >= 85) {
                clearInterval(progressInterval);
                currentProgress = 85;
            }
            updateProgress(currentProgress);
        }, 2000); // Reduced frequency from 1000ms to 2000ms

        try {
            const imageBase64 = sourceImage.split(',')[1] || sourceImage;
            
            // Build professional ad-quality prompt
            const basePrompt = customPrompt.trim() || createAdQualityPrompt(selectedCategory, selectedStyle);
            
            const response = await fetch('/api/generate-video', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    image_base64: imageBase64,
                    prompt: basePrompt,
                    category: selectedCategory,
                    animation_style: selectedStyle,
                    height: 720,
                    width: 1280,
                    num_frames: advancedSettings.num_frames,
                    guidance_scale: advancedSettings.guidance_scale,
                    num_inference_steps: advancedSettings.num_inference_steps,
                    seed: advancedSettings.seed
                })
            });

            clearInterval(progressInterval);
            updateProgress(90);

            const result = await response.json();
            updateProgress(100);

            if (result.success) {
                const videoData = `data:video/mp4;base64,${result.video}`;
                const animationInfo = {
                    id: Date.now(),
                    video: videoData,
                    name: `${selectedStyle.replace('_', ' ')} Animation`,
                    category: selectedCategory,
                    style: selectedStyle,
                    prompt: basePrompt,
                    timestamp: new Date().toLocaleString()
                };
                
                setGeneratedVideos(prev => [...prev, animationInfo]);
                setProcessingText('Animation completed successfully!');
                
                // Don't add to main slideshow - keep in animation section
                // if (window.addToSlideshow) {
                //     window.addToSlideshow(
                //         videoData,
                //         `${selectedStyle.replace('_', ' ')} Animation`,
                //         'animation'
                //     );
                // }
                
                setTimeout(() => {
                    setIsProcessing(false);
                    updateProgress(0);
                }, 1000);
            } else {
                throw new Error(result.message || 'Animation generation failed');
            }

        } catch (error) {
            clearInterval(progressInterval);
            console.error('Animation generation failed:', error);
            alert(`Animation generation failed: ${error.message}`);
            setIsProcessing(false);
            updateProgress(0);
        }
    };

    const downloadVideo = (video, name) => {
        if (!video) return;
        
        const link = document.createElement('a');
        link.href = video;
        link.download = `${name.replace(/\s+/g, '-').toLowerCase()}.mp4`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };
    
    const clearVideos = () => {
        setGeneratedVideos([]);
    };

    return (
        <div className="space-y-6">
            {/* Product Category Selection */}
            <div>
                <h4 className="font-medium mb-3 text-text-light dark:text-text-dark">Product Category</h4>
                <div className="grid grid-cols-2 gap-2">
                    {productCategories.map(category => (
                        <button 
                            key={category.id}
                            onClick={() => setSelectedCategory(category.id)}
                            className={`p-3 rounded-lg border-2 transition-all text-left ${
                                selectedCategory === category.id 
                                    ? 'border-primary bg-primary/10' 
                                    : 'border-gray-300 dark:border-gray-600 bg-surface-light dark:bg-surface-dark hover:border-gray-400 dark:hover:border-gray-500'
                            }`}
                        >
                            <div className="flex items-center space-x-2">
                                <span className="text-lg">{category.icon}</span>
                                <div className="flex-1">
                                    <div className="font-medium text-xs text-text-light dark:text-text-dark">{category.name}</div>
                                    <div className="text-xs text-subtle-light dark:text-subtle-dark leading-tight">{category.description}</div>
                                </div>
                            </div>
                        </button>
                    ))}
                </div>
            </div>

            {/* Animation Style Selection */}
            <div>
                <h4 className="font-medium mb-3 text-text-light dark:text-text-dark">Animation Style</h4>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                    {animationStyles.map(style => (
                        <button 
                            key={style.id}
                            onClick={() => setSelectedStyle(style.id)}
                            className={`w-full p-3 rounded-lg border-2 transition-all text-left ${
                                selectedStyle === style.id 
                                    ? 'border-primary bg-primary/10' 
                                    : 'border-gray-300 dark:border-gray-600 bg-surface-light dark:bg-surface-dark hover:border-gray-400 dark:hover:border-gray-500'
                            }`}
                        >
                            <div className="flex items-center space-x-3">
                                <span className="text-xl">{style.icon}</span>
                                <div className="flex-1">
                                    <div className="font-medium text-sm text-text-light dark:text-text-dark">{style.name}</div>
                                    <div className="text-xs text-subtle-light dark:text-subtle-dark">{style.description}</div>
                                </div>
                            </div>
                        </button>
                    ))}
                </div>
            </div>

            {/* Custom Prompt */}
            <div>
                <h4 className="font-medium mb-3 text-text-light dark:text-text-dark">Custom Description (Optional)</h4>
                <textarea
                    value={customPrompt}
                    onChange={(e) => setCustomPrompt(e.target.value)}
                    placeholder="Add specific details about how you want your product animated (e.g., 'elegant jewelry rotating with sparkles')"
                    className="w-full h-20 px-3 py-2 bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:ring-primary focus:border-primary resize-none text-text-light dark:text-text-dark"
                    rows={3}
                />
            </div>

            {/* Advanced Settings */}
            <div>
                <button 
                    onClick={() => setShowAdvanced(!showAdvanced)}
                    className="flex items-center justify-between w-full p-3 bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                >
                    <span className="font-medium text-text-light dark:text-text-dark">Advanced Settings</span>
                    <span className="material-icons text-text-light dark:text-text-dark">
                        {showAdvanced ? 'expand_less' : 'expand_more'}
                    </span>
                </button>
                
                {showAdvanced && (
                    <div className="mt-3 space-y-4 p-4 border border-gray-300 dark:border-gray-600 rounded-lg">
                        <div>
                            <label className="block text-sm font-medium mb-2 text-text-light dark:text-text-dark">Guidance Scale: {advancedSettings.guidance_scale}</label>
                            <input 
                                type="range" 
                                min="1" 
                                max="7" 
                                step="0.5"
                                value={advancedSettings.guidance_scale}
                                onChange={(e) => setAdvancedSettings(prev => ({ ...prev, guidance_scale: parseFloat(e.target.value) }))}
                                className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer"
                            />
                            <div className="flex justify-between text-xs text-subtle-light dark:text-subtle-dark mt-1">
                                <span>More Creative</span>
                                <span>More Accurate</span>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2 text-text-light dark:text-text-dark">Quality Steps: {advancedSettings.num_inference_steps}</label>
                            <input 
                                type="range" 
                                min="20" 
                                max="50" 
                                step="5"
                                value={advancedSettings.num_inference_steps}
                                onChange={(e) => setAdvancedSettings(prev => ({ ...prev, num_inference_steps: parseInt(e.target.value) }))}
                                className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer"
                            />
                            <div className="flex justify-between text-xs text-subtle-light dark:text-subtle-dark mt-1">
                                <span>Faster</span>
                                <span>Higher Quality</span>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2 text-text-light dark:text-text-dark">Video Length: {advancedSettings.num_frames} frames</label>
                            <input 
                                type="range" 
                                min="25" 
                                max="81" 
                                step="8"
                                value={advancedSettings.num_frames}
                                onChange={(e) => setAdvancedSettings(prev => ({ ...prev, num_frames: parseInt(e.target.value) }))}
                                className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer"
                            />
                            <div className="flex justify-between text-xs text-subtle-light dark:text-subtle-dark mt-1">
                                <span>Short (~1.5s)</span>
                                <span>Long (~5s)</span>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2 text-text-light dark:text-text-dark">Random Seed (Optional)</label>
                            <input 
                                type="number" 
                                placeholder="Leave empty for random"
                                value={advancedSettings.seed || ''}
                                onChange={(e) => setAdvancedSettings(prev => ({ ...prev, seed: e.target.value ? parseInt(e.target.value) : null }))}
                                className="w-full px-3 py-2 bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:ring-primary focus:border-primary text-text-light dark:text-text-dark"
                            />
                            <div className="text-xs text-subtle-light dark:text-subtle-dark mt-1">Use the same seed to reproduce results</div>
                        </div>
                    </div>
                )}
            </div>

            {/* Image Source Selection */}
            <div>
                <h4 className="font-medium mb-3 text-text-light dark:text-text-dark">Image Source</h4>
                <div className="space-y-3">
                    <label className="flex items-center space-x-3 cursor-pointer">
                        <input 
                            type="radio" 
                            name="imageSource" 
                            value="main"
                            checked={imageSource === 'main'}
                            onChange={(e) => setImageSource(e.target.value)}
                            className="text-primary focus:ring-primary"
                        />
                        <div>
                            <div className="text-sm font-medium text-text-light dark:text-text-dark">Main Image</div>
                            <div className="text-xs text-subtle-light dark:text-subtle-dark">Use the current main image</div>
                        </div>
                    </label>
                    
                    {generatedScenarios && generatedScenarios.length > 0 && (
                        <label className="flex items-center space-x-3 cursor-pointer">
                            <input 
                                type="radio" 
                                name="imageSource" 
                                value="lifestyle"
                                checked={imageSource === 'lifestyle'}
                                onChange={(e) => setImageSource(e.target.value)}
                                className="text-primary focus:ring-primary"
                            />
                            <div>
                                <div className="text-sm font-medium text-text-light dark:text-text-dark">Lifestyle Image</div>
                                <div className="text-xs text-subtle-light dark:text-subtle-dark">Select from generated lifestyle mockups</div>
                            </div>
                        </label>
                    )}
                </div>
            </div>

            {/* Lifestyle Image Selection */}
            {imageSource === 'lifestyle' && generatedScenarios && generatedScenarios.length > 0 && (
                <div>
                    <h4 className="font-medium mb-3 text-text-light dark:text-text-dark">Select Lifestyle Image</h4>
                    <div className="grid grid-cols-2 gap-3 max-h-48 overflow-y-auto">
                        {generatedScenarios.map((scenario) => (
                            <button
                                key={scenario.id}
                                onClick={() => setSelectedLifestyleImage(scenario)}
                                className={`relative rounded-lg overflow-hidden border-2 transition-all ${
                                    selectedLifestyleImage?.id === scenario.id
                                        ? 'border-primary ring-2 ring-primary/30'
                                        : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
                                }`}
                            >
                                <img 
                                    src={scenario.image} 
                                    alt={`${scenario.scenarioName} - ${scenario.variantName}`}
                                    className="w-full h-16 object-cover"
                                />
                                <div className="absolute bottom-0 left-0 right-0 bg-black/70 text-white text-xs p-1 truncate">
                                    {scenario.scenarioName}
                                </div>
                                {selectedLifestyleImage?.id === scenario.id && (
                                    <div className="absolute top-1 right-1 w-4 h-4 bg-primary rounded-full flex items-center justify-center">
                                        <span className="material-icons text-white text-xs">check</span>
                                    </div>
                                )}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Generated Videos Gallery */}
            {generatedVideos.length > 0 && (
                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <h4 className="font-medium text-text-light dark:text-text-dark">Generated Animations ({generatedVideos.length})</h4>
                        <button 
                            onClick={clearVideos}
                            className="text-xs text-subtle-light dark:text-subtle-dark hover:text-red-400 transition-colors"
                        >
                            Clear All
                        </button>
                    </div>
                    <div className="space-y-4 max-h-80 overflow-y-auto">
                        {generatedVideos.map((animation) => (
                            <div key={animation.id} className="bg-surface-light dark:bg-surface-dark rounded-lg p-4 border border-gray-300 dark:border-gray-600">
                                <div className="flex items-center justify-between mb-2">
                                    <h5 className="font-medium text-sm text-text-light dark:text-text-dark">{animation.name}</h5>
                                    <span className="text-xs text-subtle-light dark:text-subtle-dark">{animation.timestamp}</span>
                                </div>
                                <video 
                                    src={animation.video} 
                                    controls 
                                    loop 
                                    muted
                                    className="w-full rounded-lg shadow-sm mb-3"
                                    style={{maxHeight: '200px'}}
                                >
                                    Your browser does not support the video tag.
                                </video>
                                <div className="flex space-x-2">
                                    <button 
                                        onClick={() => downloadVideo(animation.video, animation.name)}
                                        className="flex-1 flex items-center justify-center space-x-2 bg-green-600 hover:bg-green-700 text-white py-2 px-3 rounded-lg transition-colors text-sm"
                                    >
                                        <span className="material-icons text-sm">download</span>
                                        <span>Download</span>
                                    </button>
                                    <button 
                                        onClick={() => {
                                            // Don't add to main slideshow - keep in animation section
                                            // if (window.addToSlideshow) {
                                            //     window.addToSlideshow(animation.video, animation.name, 'animation-replay');
                                            // }
                                            // Instead, just show a message or focus on the animation
                                            alert('Animation is already displayed in the Animation panel');
                                        }}
                                        className="flex-1 flex items-center justify-center space-x-2 bg-primary hover:bg-primary/90 text-white py-2 px-3 rounded-lg transition-colors text-sm"
                                    >
                                        <span className="material-icons text-sm">replay</span>
                                        <span>Use</span>
                                    </button>
                                </div>
                                <div className="mt-2 text-xs text-subtle-light dark:text-subtle-dark">
                                    <div><strong>Style:</strong> {animation.style.replace('_', ' ')}</div>
                                    <div><strong>Category:</strong> {animation.category}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Generate Button */}
            <div>
                <button 
                    onClick={generateAnimation}
                    disabled={imageSource === 'main' ? !uploadedImage : !selectedLifestyleImage}
                    className="w-full flex items-center justify-center space-x-2 bg-primary text-white font-semibold py-3 rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <span className="material-icons">play_arrow</span>
                    <span>Generate AI Animation</span>
                </button>
                {imageSource === 'lifestyle' && !selectedLifestyleImage && (
                    <p className="text-xs text-subtle-light dark:text-subtle-dark text-center mt-2">
                        Please select a lifestyle image above
                    </p>
                )}
            </div>

            {/* Tips */}
            <div className="bg-surface-light dark:bg-surface-dark border border-gray-300 dark:border-gray-600 rounded-lg p-4">
                <h5 className="font-medium mb-2 text-primary flex items-center">
                    <span className="material-icons mr-2">lightbulb</span>
                    Animation Tips
                </h5>
                <ul className="text-sm text-subtle-light dark:text-subtle-dark space-y-1">
                    <li>• Choose the right category for optimal results</li>
                    <li>• Custom descriptions help create more specific animations</li>
                    <li>• Use lifestyle images for more dynamic animated scenes</li>
                    <li>• Higher quality steps take longer but produce better videos</li>
                    <li>• Shorter videos (25-49 frames) render faster</li>
                    <li>• Use the same seed to reproduce your favorite results</li>
                </ul>
            </div>
        </div>
    );
}, (prevProps, nextProps) => {
    // Custom comparison to prevent re-renders on progress changes
    return (
        prevProps.uploadedImage === nextProps.uploadedImage &&
        prevProps.setIsProcessing === nextProps.setIsProcessing &&
        prevProps.setProcessingText === nextProps.setProcessingText &&
        prevProps.setProgress === nextProps.setProgress
    );
});