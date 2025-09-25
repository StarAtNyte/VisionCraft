// Animation Panel - FAL Kling 2.5 Integration (Fast & Optimized)
const AnimationPanel = React.memo(({ uploadedImage, setUploadedImage, setIsProcessing, setProcessingText, setProgress, generatedScenarios, generatedAds, setGeneratedAds, colorVariants }) => {
    const [selectedCategory, setSelectedCategory] = React.useState('product');
    const [selectedStyle, setSelectedStyle] = React.useState('cinematic_hero_reveal');
    const [customPrompt, setCustomPrompt] = React.useState('');
    const [videoDuration, setVideoDuration] = React.useState('5'); // 5 or 10 seconds
    const [generatedVideos, setGeneratedVideos] = React.useState([]);
    const [showAdvanced, setShowAdvanced] = React.useState(false);
    const [imageSource, setImageSource] = React.useState('main'); // 'main' or 'lifestyle'
    const [selectedLifestyleImage, setSelectedLifestyleImage] = React.useState(null);
    const [advancedSettings, setAdvancedSettings] = React.useState({
        guidance_scale: 4.0, // Optimized for Kling 2.5
        num_inference_steps: 35, // Higher for better quality
        num_frames: 49,
        seed: null,
        motion_strength: 0.8, // New Kling 2.5 parameter
        cinematic_mode: true // Enhanced cinematic processing
    });

    // Move useCallback to top level to avoid hook rule violation
    const updateProgress = React.useCallback((value) => {
        setProgress(value);
    }, [setProgress]);

    // Helper function to check if we have a valid source image
    const hasValidSourceImage = () => {
        if (imageSource === 'main' && uploadedImage) return true;
        if (imageSource === 'lifestyle' && selectedLifestyleImage) return true;
        if (imageSource === 'ads' && selectedLifestyleImage) return true;
        if (imageSource === 'colors' && selectedLifestyleImage) return true;
        return uploadedImage; // fallback to main image if available
    };

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

    // Kling 2.5 Cinematic Animation Styles - Next-Gen Motion Graphics
    const animationStyles = [
        { 
            id: 'cinematic_hero_reveal', 
            name: 'Cinematic Hero Reveal', 
            icon: '🎬', 
            description: 'Dramatic cinematic reveal with professional camera movements, depth of field, and Hollywood-style lighting transitions' 
        },
        { 
            id: 'dynamic_tracking_shot', 
            name: 'Dynamic Tracking Shot', 
            icon: '🎥', 
            description: 'Smooth camera tracking around product with gimbal-like stabilization and professional framing' 
        },
        { 
            id: 'morphing_transformation', 
            name: 'Morphing Transformation', 
            icon: '⚡', 
            description: 'Product transforms with fluid morphing effects, color shifts, and material changes in real-time' 
        },
        { 
            id: 'particle_explosion', 
            name: 'Particle Explosion', 
            icon: '💥', 
            description: 'Product emerges from or dissolves into dynamic particle systems with physics-based motion' 
        },
        { 
            id: 'gravity_defying', 
            name: 'Gravity-Defying Motion', 
            icon: '🌌', 
            description: 'Product floats and moves in impossible ways with realistic physics and supernatural elegance' 
        },
        { 
            id: 'liquid_metal_flow', 
            name: 'Liquid Metal Flow', 
            icon: '🌊', 
            description: 'Product surfaces flow and ripple like liquid metal with reflective chrome effects and fluid dynamics' 
        },
        { 
            id: 'holographic_projection', 
            name: 'Holographic Projection', 
            icon: '🔮', 
            description: 'Product appears as a futuristic hologram with scan lines, digital glitches, and transparency effects' 
        },
        { 
            id: 'time_dilation', 
            name: 'Time Dilation', 
            icon: '⏰', 
            description: 'Time slows and accelerates around the product with bullet-time effects and speed ramping' 
        },
        { 
            id: 'dimensional_portal', 
            name: 'Dimensional Portal', 
            icon: '🌀', 
            description: 'Product emerges through dimensional rifts and portals with energy effects and reality distortion' 
        },
        { 
            id: 'crystalline_formation', 
            name: 'Crystalline Formation', 
            icon: '💎', 
            description: 'Product builds itself from crystalline structures with geometric patterns and refractive lighting' 
        },
        { 
            id: 'electromagnetic_field', 
            name: 'Electromagnetic Field', 
            icon: '⚡', 
            description: 'Product surrounded by visible electromagnetic fields, energy arcs, and electrical phenomena' 
        },
        { 
            id: 'atmospheric_descent', 
            name: 'Atmospheric Descent', 
            icon: '🚀', 
            description: 'Product descends from space through atmospheric layers with heat trails and cosmic effects' 
        },
        { 
            id: 'quantum_entanglement', 
            name: 'Quantum Entanglement', 
            icon: '🔬', 
            description: 'Product exists in multiple quantum states simultaneously with probability wave visualizations' 
        },
        { 
            id: 'neural_network', 
            name: 'Neural Network', 
            icon: '🧠', 
            description: 'Product connected by glowing neural pathways with AI-like data streams and connection nodes' 
        },
        { 
            id: 'molecular_assembly', 
            name: 'Molecular Assembly', 
            icon: '⚛️', 
            description: 'Product assembles from individual molecules and atoms with scientific precision and micro-detail' 
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
        
        // Kling 2.5 Advanced Cinematic Motion Descriptions - Hollywood-Level Quality
        const styleMotions = {
            cinematic_hero_reveal: 'dramatic cinematic hero reveal with professional camera push-in, depth of field rack focus, volumetric lighting rays, Hollywood-style dramatic tension, smooth camera crane movement, cinematic color grading, film-quality bokeh effects',
            dynamic_tracking_shot: 'smooth gimbal tracking shot with professional camera movement, seamless orbital motion, steady-cam fluidity, dynamic framing adjustments, cinematic composition rules, real-time focus pulling, broadcast television quality',
            morphing_transformation: 'fluid morphing transformation with seamless material transitions, advanced deformation effects, color gradient flowing, texture metamorphosis, physics-based material properties, liquid-to-solid conversions',
            particle_explosion: 'dynamic particle system explosion with physics-based debris, volumetric smoke effects, sparkling particle trails, realistic collision dynamics, energy discharge patterns, cinematic slow-motion integration',
            gravity_defying: 'supernatural floating motion with realistic anti-gravity physics, ethereal levitation effects, mystical energy fields, impossible object behavior, dream-like weightlessness, magical realism aesthetics',
            liquid_metal_flow: 'liquid metal surface deformation with chrome reflectivity, fluid dynamics simulation, rippling wave effects, mercury-like properties, mirror surface distortions, high-end CGI liquid effects',
            holographic_projection: 'futuristic hologram projection with scan line effects, digital glitch artifacts, transparency gradients, electronic interference patterns, sci-fi UI elements, holographic shimmer effects',
            time_dilation: 'time manipulation effects with speed ramping, bullet-time cinematography, temporal distortion fields, slow-motion to fast-forward transitions, Matrix-style time effects, chronological visual poetry',
            dimensional_portal: 'interdimensional portal effects with reality warping, space-time distortions, energy vortex patterns, cosmic rifts opening, parallel dimension glimpses, supernatural gateway effects',
            crystalline_formation: 'geometric crystal growth with refractive light patterns, prismatic rainbow effects, mineral formation simulation, faceted surface reflections, crystallographic precision, gem-quality lighting',
            electromagnetic_field: 'visible electromagnetic energy with electrical arc effects, plasma field visualization, magnetic field lines, energy discharge patterns, Tesla coil aesthetics, scientific energy visualization',
            atmospheric_descent: 'space-to-earth descent with atmospheric entry effects, heat trail visualization, orbital mechanics, cosmic background transitions, re-entry fire effects, astronomical scale cinematography',
            quantum_entanglement: 'quantum physics visualization with probability waves, particle-wave duality effects, uncertainty principle aesthetics, quantum superposition states, scientific accuracy with artistic interpretation',
            neural_network: 'neural pathway visualization with synaptic connections, brain-like network patterns, data stream effects, AI consciousness aesthetics, digital thought process visualization, cybernetic organism imagery',
            molecular_assembly: 'atomic-level construction with molecular bonding effects, chemical reaction visualization, scientific precision, microscopic detail accuracy, nano-scale assembly process, laboratory-quality precision'
        };
        
        const categoryText = categoryEnhancements[category] || categoryEnhancements.product;
        const motionText = styleMotions[style] || styleMotions.cinematic_hero_reveal;
        
        return `Kling 2.5 Cinematic Production: ${categoryText}, ${motionText}. Ultra-high resolution 1080p+ quality, film-grade stabilization, professional color grading, advanced motion blur, realistic physics simulation, Hollywood-level visual effects, broadcast cinema quality, award-winning cinematography, next-generation motion graphics, photorealistic rendering, advanced lighting simulation, professional depth of field, seamless transitions, natural character movement, stable background consistency, enhanced texture detail, cinematic framing and composition`;
    };

    const generateAnimation = async () => {
        let sourceImage;
        if (imageSource === 'lifestyle' && selectedLifestyleImage) {
            sourceImage = selectedLifestyleImage.image;
        } else if (imageSource === 'ads' && selectedLifestyleImage) {
            sourceImage = selectedLifestyleImage.image;
        } else if (imageSource === 'colors' && selectedLifestyleImage) {
            sourceImage = selectedLifestyleImage.image;
        } else {
            sourceImage = uploadedImage;
        }
            
        if (!sourceImage) {
            alert('Please select an image first');
            return;
        }

        setIsProcessing(true);
        setProcessingText('Creating FAL Kling 2.5 animation...');
        setProgress(0);

        // Optimized progress updates - less frequent to reduce re-renders        
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
            
            // Use custom prompt if provided, otherwise create ad-quality prompt
            const basePrompt = customPrompt.trim() 
                ? customPrompt.trim()  // Use user's custom prompt directly
                : createAdQualityPrompt(selectedCategory, selectedStyle); // Generate enhanced prompt
            
            const response = await fetch('/api/generate-video', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    image_base64: imageBase64,
                    prompt: basePrompt,
                    category: selectedCategory,
                    animation_style: selectedStyle,
                    duration: videoDuration, // Pass duration to API
                    height: 720,
                    width: 1280,
                    num_frames: advancedSettings.num_frames,
                    guidance_scale: advancedSettings.guidance_scale,
                    num_inference_steps: advancedSettings.num_inference_steps,
                    motion_strength: advancedSettings.motion_strength, // Kling 2.5 motion control
                    cinematic_mode: advancedSettings.cinematic_mode, // Enhanced processing
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
                setProcessingText('FAL Kling 2.5 animation completed!');
                
                // Update main image area with generated video
                setUploadedImage(videoData);
                
                // Also add to slideshow if available
                if (window.addToSlideshow) {
                    window.addToSlideshow(
                        videoData,
                        `${selectedStyle.replace('_', ' ')} Animation`,
                        'animation'
                    );
                }
                
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
        <div className="space-y-4">
            {/* Simplified Category Selection */}
            <div>
                <h4 className="font-medium mb-2 text-text-light dark:text-text-dark">Category</h4>
                <select 
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:ring-primary focus:border-primary text-text-light dark:text-text-dark"
                >
                    {productCategories.map(category => (
                        <option key={category.id} value={category.id}>
                            {category.icon} {category.name}
                        </option>
                    ))}
                </select>
            </div>

            {/* Simplified Animation Style Selection */}
            <div>
                <h4 className="font-medium mb-2 text-text-light dark:text-text-dark">Animation Style</h4>
                <select 
                    value={selectedStyle}
                    onChange={(e) => setSelectedStyle(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:ring-primary focus:border-primary text-text-light dark:text-text-dark"
                >
                    {animationStyles.map(style => (
                        <option key={style.id} value={style.id}>
                            {style.icon} {style.name}
                        </option>
                    ))}
                </select>
            </div>

            {/* Video Duration Selection */}
            <div>
                <h4 className="font-medium mb-2 text-text-light dark:text-text-dark">
                    Video Duration
                    <span className="text-xs font-normal text-blue-600 dark:text-blue-400 ml-2">
                        ⚡ Kling 2.5 Pro
                    </span>
                </h4>
                <div className="grid grid-cols-2 gap-2">
                    <button
                        onClick={() => setVideoDuration('5')}
                        className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                            videoDuration === '5'
                                ? 'bg-primary text-white'
                                : 'bg-gray-100 dark:bg-gray-800 text-text-light dark:text-text-dark hover:bg-gray-200 dark:hover:bg-gray-700'
                        }`}
                    >
                        ⚡ 5 seconds
                        <div className="text-xs opacity-75">Faster</div>
                    </button>
                    <button
                        onClick={() => setVideoDuration('10')}
                        className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                            videoDuration === '10'
                                ? 'bg-primary text-white'
                                : 'bg-gray-100 dark:bg-gray-800 text-text-light dark:text-text-dark hover:bg-gray-200 dark:hover:bg-gray-700'
                        }`}
                    >
                        🎬 10 seconds
                        <div className="text-xs opacity-75">More detail</div>
                    </button>
                </div>
            </div>

            {/* FAL Kling 2.5 Custom Prompt */}
            <div>
                <h4 className="font-medium mb-2 text-text-light dark:text-text-dark">
                    Custom Animation Prompt
                    <span className="text-xs font-normal text-green-600 dark:text-green-400 ml-2">
                        ⚡ Direct to Kling 2.5
                    </span>
                </h4>
                <textarea
                    value={customPrompt}
                    onChange={(e) => setCustomPrompt(e.target.value)}
                    placeholder="Describe your animation (e.g., 'smooth 360° rotation with dramatic lighting' or 'product floating gently with sparkles'). Leave blank to use smart category-based prompts."
                    className="w-full h-20 px-3 py-2 bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:ring-primary focus:border-primary resize-none text-text-light dark:text-text-dark"
                    rows={3}
                />
            </div>

            {/* Simplified Advanced Settings */}
            <div>
                <button 
                    onClick={() => setShowAdvanced(!showAdvanced)}
                    className="flex items-center justify-between w-full text-sm text-subtle-light dark:text-subtle-dark hover:text-text-light dark:hover:text-text-dark transition-colors"
                >
                    <span>Advanced Settings</span>
                    <span className="material-icons text-sm">
                        {showAdvanced ? 'expand_less' : 'expand_more'}
                    </span>
                </button>
                
                {showAdvanced && (
                    <div className="mt-2 space-y-3 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="block text-xs font-medium mb-1 text-text-light dark:text-text-dark">
                                    Quality 
                                    <span className="text-green-500">⚡ Kling 2.5</span>
                                </label>
                                <select 
                                    value={advancedSettings.num_inference_steps}
                                    onChange={(e) => setAdvancedSettings(prev => ({ ...prev, num_inference_steps: parseInt(e.target.value) }))}
                                    className="w-full px-2 py-1 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded text-xs"
                                >
                                    <option value={25}>🚀 Fast (25 steps)</option>
                                    <option value={35}>⭐ Standard (35 steps)</option>
                                    <option value={45}>💎 High (45 steps)</option>
                                    <option value={60}>🎬 Cinema (60 steps)</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-medium mb-1 text-text-light dark:text-text-dark">Motion Strength</label>
                                <select 
                                    value={advancedSettings.motion_strength}
                                    onChange={(e) => setAdvancedSettings(prev => ({ ...prev, motion_strength: parseFloat(e.target.value) }))}
                                    className="w-full px-2 py-1 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded text-xs"
                                >
                                    <option value={0.3}>🍃 Subtle</option>
                                    <option value={0.6}>🌊 Moderate</option>
                                    <option value={0.8}>⚡ Dynamic</option>
                                    <option value={1.0}>🚀 Maximum</option>
                                </select>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="block text-xs font-medium mb-1 text-text-light dark:text-text-dark">Frame Count</label>
                                <select 
                                    value={advancedSettings.num_frames}
                                    onChange={(e) => setAdvancedSettings(prev => ({ ...prev, num_frames: parseInt(e.target.value) }))}
                                    className="w-full px-2 py-1 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded text-xs"
                                >
                                    <option value={25}>📱 Short (25f)</option>
                                    <option value={49}>🎥 Medium (49f)</option>
                                    <option value={73}>🎬 Long (73f)</option>
                                    <option value={97}>🎭 Epic (97f)</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-medium mb-1 text-text-light dark:text-text-dark">Guidance Scale</label>
                                <select 
                                    value={advancedSettings.guidance_scale}
                                    onChange={(e) => setAdvancedSettings(prev => ({ ...prev, guidance_scale: parseFloat(e.target.value) }))}
                                    className="w-full px-2 py-1 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded text-xs"
                                >
                                    <option value={2.5}>🎨 Creative (2.5)</option>
                                    <option value={4.0}>⚖️ Balanced (4.0)</option>
                                    <option value={6.0}>📐 Precise (6.0)</option>
                                    <option value={8.0}>🔒 Strict (8.0)</option>
                                </select>
                            </div>
                        </div>
                        <div className="mt-2">
                            <label className="flex items-center space-x-2 text-xs">
                                <input
                                    type="checkbox"
                                    checked={advancedSettings.cinematic_mode}
                                    onChange={(e) => setAdvancedSettings(prev => ({ ...prev, cinematic_mode: e.target.checked }))}
                                    className="text-primary focus:ring-primary"
                                />
                                <span className="text-text-light dark:text-text-dark">
                                    🎬 Cinematic Mode (Enhanced film-quality processing)
                                </span>
                            </label>
                        </div>
                    </div>
                )}
            </div>

            {/* Simplified Image Source Selection */}
            {(generatedScenarios && generatedScenarios.length > 0) || (generatedAds && generatedAds.length > 0) || (colorVariants && colorVariants.length > 0) ? (
                <div>
                    <h4 className="font-medium mb-2 text-text-light dark:text-text-dark">Image Source</h4>
                    <div className="grid grid-cols-2 gap-2 mb-2">
                        <button
                            onClick={() => setImageSource('main')}
                            className={`px-3 py-2 rounded-lg text-sm transition-colors ${
                                imageSource === 'main'
                                    ? 'bg-primary text-white'
                                    : 'bg-gray-100 dark:bg-gray-800 text-text-light dark:text-text-dark hover:bg-gray-200 dark:hover:bg-gray-700'
                            }`}
                        >
                            Main Image
                        </button>
                        {colorVariants && colorVariants.length > 0 && (
                            <button
                                onClick={() => setImageSource('colors')}
                                className={`px-3 py-2 rounded-lg text-sm transition-colors ${
                                    imageSource === 'colors'
                                        ? 'bg-primary text-white'
                                        : 'bg-gray-100 dark:bg-gray-800 text-text-light dark:text-text-dark hover:bg-gray-200 dark:hover:bg-gray-700'
                                }`}
                            >
                                Color Variants
                            </button>
                        )}
                        {generatedScenarios && generatedScenarios.length > 0 && (
                            <button
                                onClick={() => setImageSource('lifestyle')}
                                className={`px-3 py-2 rounded-lg text-sm transition-colors ${
                                    imageSource === 'lifestyle'
                                        ? 'bg-primary text-white'
                                        : 'bg-gray-100 dark:bg-gray-800 text-text-light dark:text-text-dark hover:bg-gray-200 dark:hover:bg-gray-700'
                                }`}
                            >
                                Lifestyle
                            </button>
                        )}
                        {generatedAds && generatedAds.length > 0 && (
                            <button
                                onClick={() => setImageSource('ads')}
                                className={`px-3 py-2 rounded-lg text-sm transition-colors ${
                                    imageSource === 'ads'
                                        ? 'bg-primary text-white'
                                        : 'bg-gray-100 dark:bg-gray-800 text-text-light dark:text-text-dark hover:bg-gray-200 dark:hover:bg-gray-700'
                                }`}
                            >
                                Ad Shots
                            </button>
                        )}
                    </div>
                    
                    {imageSource === 'colors' && colorVariants && (
                        <select 
                            value={selectedLifestyleImage?.name || ''}
                            onChange={(e) => {
                                const variant = colorVariants.find(v => v.name === e.target.value);
                                setSelectedLifestyleImage(variant);
                            }}
                            className="w-full px-3 py-2 bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:ring-primary focus:border-primary text-text-light dark:text-text-dark"
                        >
                            <option value="">Select color variant...</option>
                            {colorVariants.map((variant, index) => (
                                <option key={index} value={variant.name}>
                                    {variant.name}
                                </option>
                            ))}
                        </select>
                    )}

                    {imageSource === 'lifestyle' && generatedScenarios && (
                        <select 
                            value={selectedLifestyleImage?.id || ''}
                            onChange={(e) => {
                                const scenario = generatedScenarios.find(s => s.id === parseInt(e.target.value));
                                setSelectedLifestyleImage(scenario);
                            }}
                            className="w-full px-3 py-2 bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:ring-primary focus:border-primary text-text-light dark:text-text-dark"
                        >
                            <option value="">Select lifestyle image...</option>
                            {generatedScenarios.map((scenario) => (
                                <option key={scenario.id} value={scenario.id}>
                                    {scenario.scenarioName}
                                </option>
                            ))}
                        </select>
                    )}
                    
                    {imageSource === 'ads' && generatedAds && (
                        <select 
                            value={selectedLifestyleImage?.id || ''}
                            onChange={(e) => {
                                const ad = generatedAds.find(a => a.id === parseInt(e.target.value));
                                setSelectedLifestyleImage(ad);
                            }}
                            className="w-full px-3 py-2 bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:ring-primary focus:border-primary text-text-light dark:text-text-dark"
                        >
                            <option value="">Select ad shot...</option>
                            {generatedAds.map((ad) => (
                                <option key={ad.id} value={ad.id}>
                                    {ad.styleName} - {ad.variantName}
                                </option>
                            ))}
                        </select>
                    )}
                </div>
            ) : null}

            {/* Generation Info */}
            <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-3 border border-green-200 dark:border-green-800">
                <div className="flex items-center justify-between mb-2">
                    <p className="text-sm text-green-700 dark:text-green-300 font-medium">
                        ⚡ FAL Kling 2.5 Ready
                    </p>
                    <span className={`text-xs px-2 py-1 rounded ${customPrompt.trim() 
                        ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300' 
                        : 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300'
                    }`}>
                        {customPrompt.trim() ? '✏️ Custom' : '🤖 Auto'}
                    </span>
                </div>
                <p className="text-xs text-green-600 dark:text-green-400">
                    <strong>Image:</strong> {imageSource === 'colors' && selectedLifestyleImage
                        ? `Color variant: ${selectedLifestyleImage.name}`
                        : imageSource === 'lifestyle' && selectedLifestyleImage
                        ? `Lifestyle: ${selectedLifestyleImage.scenarioName || 'Selected'}`
                        : imageSource === 'ads' && selectedLifestyleImage
                        ? `Ad shot: ${selectedLifestyleImage.styleName}`
                        : uploadedImage
                        ? 'Original uploaded image'
                        : 'Please upload an image first'
                    }<br/>
                    <strong>Prompt:</strong> {customPrompt.trim() 
                        ? `"${customPrompt.slice(0, 50)}${customPrompt.length > 50 ? '...' : ''}"`
                        : `Smart ${selectedCategory} + ${selectedStyle.replace('_', ' ')} prompt`
                    }<br/>
                    <strong>Duration:</strong> {videoDuration} seconds {videoDuration === '5' ? '(⚡ Faster)' : '(🎬 Detailed)'}
                </p>
            </div>

            {/* Generate Button */}
            <button 
                onClick={generateAnimation}
                disabled={!hasValidSourceImage()}
                className="w-full bg-primary hover:bg-primary/90 disabled:bg-gray-400 text-white font-medium py-3 px-4 rounded-lg transition-colors"
            >
                Generate with FAL Kling 2.5
            </button>

            {/* Generated Videos Gallery - Simplified */}
            {generatedVideos.length > 0 && (
                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <h4 className="font-medium text-text-light dark:text-text-dark">Generated ({generatedVideos.length})</h4>
                        <button 
                            onClick={clearVideos}
                            className="text-xs text-subtle-light dark:text-subtle-dark hover:text-red-400 transition-colors"
                        >
                            Clear
                        </button>
                    </div>
                    <div className="space-y-3 max-h-64 overflow-y-auto">
                        {generatedVideos.map((animation) => (
                            <div key={animation.id} className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-3">
                                <video 
                                    src={animation.video} 
                                    controls 
                                    loop 
                                    muted
                                    className="w-full rounded-lg mb-2"
                                    style={{maxHeight: '120px'}}
                                >
                                    Your browser does not support the video tag.
                                </video>
                                <div className="flex gap-2">
                                    <button 
                                        onClick={() => downloadVideo(animation.video, animation.name)}
                                        className="flex-1 bg-green-600 hover:bg-green-700 text-white py-1 px-2 rounded text-xs transition-colors"
                                    >
                                        Download
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
});