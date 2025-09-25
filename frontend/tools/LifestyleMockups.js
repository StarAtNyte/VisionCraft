// Lifestyle Mockups Panel (Optimized)
const LifestyleMockupsPanel = React.memo(({ uploadedImage, setUploadedImage, setIsProcessing, setProcessingText, setProgress, colorVariants, generatedScenarios, setGeneratedScenarios }) => {
    // generatedScenarios is now passed as prop from App.js
    const [selectedScenario, setSelectedScenario] = React.useState(null);
    const [isGenerating, setIsGenerating] = React.useState(false);
    const [detectedCategory, setDetectedCategory] = React.useState('electronics');
    const [selectedVariants, setSelectedVariants] = React.useState([]);
    const [selectAll, setSelectAll] = React.useState(false);
    const [selectedStyle, setSelectedStyle] = React.useState('photorealistic');
    const [selectedScenarios, setSelectedScenarios] = React.useState([]);

    // Enhanced style options for realistic lifestyle scenarios
    const styleOptions = {
        photorealistic: {
            name: 'Photorealistic',
            description: 'Ultra-realistic commercial photography',
            prompt: 'photorealistic lifestyle photography, professional commercial photography, shot with Canon 5D Mark IV, 85mm lens, natural lighting, high resolution, ultra-detailed, no AI artifacts, authentic human expressions, realistic skin textures, professional retouching'
        },
        editorial: {
            name: 'Editorial Fashion',
            description: 'Magazine-quality editorial style',
            prompt: 'high-end editorial lifestyle photography, fashion magazine quality, professional styling, studio-quality lighting, Vogue-style composition, realistic fashion photography, authentic model poses, luxury lifestyle aesthetic'
        },
        documentary: {
            name: 'Documentary',
            description: 'Candid, journalistic style',
            prompt: 'documentary-style lifestyle photography, photojournalistic approach, candid moments, natural interactions, authentic environments, unposed expressions, real-life scenarios, National Geographic style, genuine human emotion'
        },
        commercial: {
            name: 'Commercial',
            description: 'Brand advertising style',
            prompt: 'high-end commercial lifestyle photography, professional brand advertising style, Apple/Nike commercial aesthetic, pristine product integration, aspirational lifestyle, perfect lighting setup, commercial photography excellence'
        },
        casual: {
            name: 'Casual Authentic',
            description: 'Natural, everyday moments',
            prompt: 'casual lifestyle photography, authentic everyday moments, natural candid interactions, genuine expressions, real-world environments, unforced poses, authentic lifestyle documentation, warm human connections'
        },
        luxury: {
            name: 'Luxury Premium',
            description: 'High-end luxury presentation',
            prompt: 'luxury lifestyle photography, premium aesthetic, sophisticated environments, high-end fashion styling, elegant compositions, luxury brand quality, refined lighting, sophisticated color palette, affluent lifestyle'
        }
    };

    // Product categories with realistic, detailed lifestyle scenarios
    const productCategories = {
        footwear: {
            name: 'Footwear',
            keywords: ['shoe', 'sneaker', 'boot', 'sandal', 'heel', 'footwear'],
            scenarios: [
                { 
                    name: 'Male Urban Street', 
                    prompt: 'A young man in his 20s walking on a modern city sidewalk, wearing [PRODUCT] on his feet, casual streetwear with jeans and hoodie, golden hour lighting, realistic scale, natural walking pose, urban background, photorealistic, high detail, professional photography' 
                },
                { 
                    name: 'Female Coffee Culture', 
                    prompt: 'A young woman in her 20s sitting at a cafe table, wearing [PRODUCT], legs visible under table, holding coffee cup, modern cafe interior, soft window lighting, casual outfit with jeans and sweater, photorealistic, natural proportions, lifestyle photography' 
                },
                { 
                    name: 'Male Gym Fitness', 
                    prompt: 'A fit man in his 30s at a modern gym, wearing [PRODUCT], workout clothes, standing next to gym equipment, realistic gym lighting, athletic footwear properly fitted, professional fitness photography, high detail' 
                },
                { 
                    name: 'Female Park Jogger', 
                    prompt: 'A woman jogger in her 20s taking a break on a park bench, wearing [PRODUCT], athletic wear, natural daylight, realistic proportions, outdoor park setting, candid lifestyle moment, photorealistic' 
                },
                { 
                    name: 'Male Business Casual', 
                    prompt: 'A businessman in his 30s walking through a modern office lobby, wearing [PRODUCT], business casual attire, natural indoor lighting, polished floor, professional workplace environment, realistic scale' 
                },
                { 
                    name: 'Female Weekend Casual', 
                    prompt: 'A young woman in her 20s at a farmers market, wearing [PRODUCT], weekend outfit with sundress, natural outdoor lighting, market stalls background, walking pose, realistic proportions, lifestyle photography' 
                }
            ]
        },
        headphones: {
            name: 'Audio/Headphones',
            keywords: ['headphone', 'earbud', 'speaker', 'audio', 'wireless', 'bluetooth'],
            scenarios: [
                { 
                    name: 'Male Music Producer', 
                    prompt: 'A young male music producer in his 20s wearing [PRODUCT] over his ears, working at a music studio mixing board, modern recording studio, professional audio equipment, studio lighting, realistic headphone fit, high detail' 
                },
                { 
                    name: 'Female Remote Worker', 
                    prompt: 'A professional woman in her 30s wearing [PRODUCT] while working on laptop at a coffee shop, business casual attire, natural cafe lighting, realistic headphone placement, work environment, photorealistic' 
                },
                { 
                    name: 'Male Gamer', 
                    prompt: 'A young man in his 20s wearing [PRODUCT] during gaming session, modern gaming setup with monitors, RGB lighting, gaming chair, realistic headphone fit, professional gaming environment, high detail' 
                },
                { 
                    name: 'Female Commuter', 
                    prompt: 'A professional woman wearing [PRODUCT] while commuting on subway train, realistic commuter environment, transportation lighting, daily routine scene, natural headphone placement, photorealistic' 
                },
                { 
                    name: 'Male Fitness Audio', 
                    prompt: 'A fit man in his 30s wearing [PRODUCT] wireless earbuds while working out at gym, exercise equipment visible, gym lighting, realistic earbud placement, athletic environment, fitness photography' 
                },
                { 
                    name: 'Female Podcast Host', 
                    prompt: 'A female podcast host in her 20s wearing [PRODUCT] while recording in home studio, podcast equipment visible, soft lighting, content creation environment, realistic headphone positioning, professional setup' 
                }
            ]
        },
        electronics: {
            name: 'Electronics',
            keywords: ['phone', 'laptop', 'tablet', 'computer', 'device', 'tech', 'gadget', 'mouse', 'keyboard'],
            scenarios: [
                { 
                    name: 'Male Developer Desk', 
                    prompt: 'A male software developer in his 20s using [PRODUCT] at a clean modern desk, multiple monitors visible, natural office lighting, realistic device interaction, tech workspace, professional photography, proper scale' 
                },
                { 
                    name: 'Female Digital Nomad', 
                    prompt: 'A professional woman using [PRODUCT] while working at a trendy coffee shop, laptop on wooden table, casual business attire, natural cafe lighting, realistic work scenario, lifestyle photography' 
                },
                { 
                    name: 'Male Home Office', 
                    prompt: 'A man in his 30s using [PRODUCT] in his home office, natural home lighting, work-from-home environment, realistic device usage, cozy workspace, proper human-device interaction, high detail' 
                },
                { 
                    name: 'Female Creative Studio', 
                    prompt: 'A female graphic designer in her 20s using [PRODUCT] in her design studio, creative workspace with design materials, studio lighting, realistic device interaction, creative environment' 
                },
                { 
                    name: 'Male Tech Startup', 
                    prompt: 'A young male entrepreneur using [PRODUCT] in a modern tech startup office, open office environment, corporate lighting, business setting, realistic technology usage, professional photography' 
                },
                { 
                    name: 'Female Student Library', 
                    prompt: 'A university student using [PRODUCT] while studying in a modern library, books and notes visible, soft library lighting, study environment, realistic educational setting, natural interaction' 
                }
            ]
        },
        fashion: {
            name: 'Fashion/Accessories',
            keywords: ['watch', 'bag', 'wallet', 'jewelry', 'sunglasses', 'hat', 'accessory', 'fashion', 'shirt', 'dress', 'jacket', 'sweater'],
            scenarios: [
                { 
                    name: 'Male Fashion Portrait', 
                    prompt: 'A stylish man in his 20s wearing [PRODUCT] as part of curated outfit, fashion photography studio, soft diffused lighting, realistic fabric and fit, editorial style, proper garment proportions, high fashion' 
                },
                { 
                    name: 'Female Street Style', 
                    prompt: 'A fashionable woman in her 20s wearing [PRODUCT] while walking through trendy neighborhood, natural street lighting, realistic garment movement, street fashion, documentary style, urban background' 
                },
                { 
                    name: 'Male Business Attire', 
                    prompt: 'A businessman in his 30s wearing [PRODUCT] as part of business attire in modern office, natural corporate lighting, professional styling, workplace fashion, realistic fit and proportion' 
                },
                { 
                    name: 'Female Social Occasion', 
                    prompt: 'A woman in her 20s wearing [PRODUCT] at upscale social event, sophisticated venue background, natural event lighting, elegant styling, occasion wear, proper garment draping, high detail' 
                },
                { 
                    name: 'Male Casual Weekend', 
                    prompt: 'A young man wearing [PRODUCT] during weekend activities, casual outdoor setting like park, natural daylight, casual styling, everyday fashion, leisure moment, realistic proportions' 
                },
                { 
                    name: 'Female Date Night', 
                    prompt: 'A young woman wearing [PRODUCT] on dinner date, upscale restaurant setting, warm ambient lighting, evening wear styling, date night fashion, elegant atmosphere, photorealistic' 
                }
            ]
        },
        home: {
            name: 'Home/Kitchen',
            keywords: ['cup', 'mug', 'bottle', 'kitchen', 'home', 'decor', 'furniture', 'appliance'],
            scenarios: [
                { 
                    name: 'Male Morning Routine', 
                    prompt: 'A man in his 30s using [PRODUCT] during morning routine in bright modern kitchen, realistic home environment, natural morning light through windows, daily life moment, proper product scale, warm domestic atmosphere' 
                },
                { 
                    name: 'Female Family Dining', 
                    prompt: 'A woman in her 20s using [PRODUCT] at beautifully set family dining table, realistic home dining environment, natural indoor lighting, family mealtime, proper product placement, domestic scene' 
                },
                { 
                    name: 'Male Living Space', 
                    prompt: 'A young man using [PRODUCT] in stylish modern living room, realistic home decor, natural ambient lighting, home lifestyle, proper product integration, comfortable setting, high detail' 
                },
                { 
                    name: 'Female Outdoor Entertaining', 
                    prompt: 'A woman hosting outdoor gathering using [PRODUCT] during backyard dinner party, realistic outdoor setting, golden hour lighting, entertaining scenario, social dining moment, natural environment' 
                },
                { 
                    name: 'Male Home Cooking', 
                    prompt: 'A man in his 20s using [PRODUCT] while cooking in home kitchen, realistic cooking environment, natural kitchen lighting, food preparation scene, proper product usage, culinary setting' 
                },
                { 
                    name: 'Female Cozy Evening', 
                    prompt: 'A young woman using [PRODUCT] during cozy evening at home, comfortable living room, warm lamp lighting, relaxation moment, home comfort scene, intimate atmosphere, photorealistic' 
                }
            ]
        },
        jewelry: {
            name: 'Jewelry & Watches',
            keywords: ['ring', 'necklace', 'bracelet', 'watch', 'earring', 'jewelry'],
            scenarios: [
                { 
                    name: 'Female Elegant Portrait', 
                    prompt: 'An elegant woman in her 20s wearing [PRODUCT], professional portrait lighting, realistic jewelry placement and scale, elegant styling, high-end fashion photography, proper proportions, sophisticated' 
                },
                { 
                    name: 'Male Watch Lifestyle', 
                    prompt: 'A professional man in his 30s wearing [PRODUCT] during business day, realistic wrist placement, business environment, natural professional lighting, workplace moment, proper watch scale and fit' 
                },
                { 
                    name: 'Female Special Occasion', 
                    prompt: 'A woman wearing [PRODUCT] at special event like wedding or gala, elegant venue background, sophisticated lighting, formal styling, celebration moment, luxury atmosphere, photorealistic' 
                },
                { 
                    name: 'Male Casual Elegance', 
                    prompt: 'A young man wearing [PRODUCT] in casual but refined setting, everyday elegance, natural lighting, personal style moment, proper accessory integration, relaxed sophistication, high detail' 
                }
            ]
        }
    };
    

    // Handle category selection
    const handleCategoryChange = (category) => {
        setDetectedCategory(category);
    };

    // Handle variant selection
    const toggleVariantSelection = (variantId) => {
        setSelectedVariants(prev => {
            if (prev.includes(variantId)) {
                return prev.filter(id => id !== variantId);
            } else {
                return [...prev, variantId];
            }
        });
    };

    const toggleSelectAll = () => {
        if (selectAll) {
            setSelectedVariants([]);
            setSelectAll(false);
        } else {
            setSelectedVariants(colorVariants?.map(v => v.id) || []);
            setSelectAll(true);
        }
    };

    // Generate lifestyle scenarios for selected variants
    const generateScenariosForSelected = async () => {
        if (selectedVariants.length === 0 && !uploadedImage) {
            alert('Please select color variants or upload an image first');
            return;
        }

        setIsGenerating(true);
        setIsProcessing(true);
        setProgress(0);
        setGeneratedScenarios([]);

        try {
            const scenarios = productCategories[detectedCategory]?.scenarios || productCategories.electronics.scenarios;
            const allScenarios = [];

            // If no variants selected, use the main uploaded image
            const imagesToProcess = selectedVariants.length > 0
                ? colorVariants.filter(v => selectedVariants.includes(v.id))
                : [{ name: 'Original', image: uploadedImage, id: 'original' }];

            const totalSteps = imagesToProcess.length * scenarios.length;
            let currentStep = 0;

            for (const variant of imagesToProcess) {
                for (const scenario of scenarios) {
                    setProcessingText(`Generating ${scenario.name} for ${variant.name}...`);
                    setProgress((currentStep / totalSteps) * 100);

                    const imageBase64 = variant.image.includes('data:image') ? variant.image.split(',')[1] : variant.image;
                    
                    // Create enhanced realistic prompt
                    const basePrompt = scenario.prompt;
                    const stylePrompt = styleOptions[selectedStyle]?.prompt || styleOptions.photorealistic.prompt;
                    const lifestylePrompt = `${basePrompt}, ${stylePrompt}, photorealistic, high quality professional photography, realistic human proportions, no cartoonish elements, no floating objects, natural lighting, authentic scene, shot with professional camera, proper product integration, realistic scale`;

                    const response = await fetch('/api/generate', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            image_base64: imageBase64,
                            prompt: lifestylePrompt,
                            guidance_scale: 7.5,
                            num_inference_steps: 35,
                            width: 1024,
                            height: 1024
                        })
                    });

                    const result = await response.json();

                    if (result.success) {
                        const lifestyleImage = `data:image/png;base64,${result.image}`;
                        const scenarioData = {
                            id: `${variant.name}-${scenario.name}-${currentStep}`,
                            variantName: variant.name,
                            variantImage: variant.image,
                            scenarioName: scenario.name,
                            image: lifestyleImage,
                            prompt: scenario.prompt
                        };
                        
                        allScenarios.push(scenarioData);
                        setGeneratedScenarios([...allScenarios]);
                        
                        // Add to main slideshow
                        if (window.addToSlideshow) {
                            window.addToSlideshow(
                                lifestyleImage, 
                                `${scenario.name} - ${variant.name}`, 
                                'lifestyle'
                            );
                        }
                    }

                    currentStep++;
                    await new Promise(resolve => setTimeout(resolve, 300));
                }
            }

            setProgress(100);
            setProcessingText('Lifestyle scenarios generated successfully!');

        } catch (error) {
            console.error('Error generating scenarios:', error);
            alert('Failed to generate scenarios. Please try again.');
        } finally {
            setTimeout(() => {
                setIsGenerating(false);
                setIsProcessing(false);
                setProgress(0);
            }, 1500);
        }
    };

    const selectScenario = (scenario) => {
        setSelectedScenario(scenario);
        setUploadedImage(scenario.image);
        
        // Also add to slideshow if not already there
        if (window.addToSlideshow) {
            window.addToSlideshow(
                scenario.image, 
                `${scenario.scenarioName} - ${scenario.variantName}`, 
                'lifestyle-selected'
            );
        }
    };

    return (
        <div className="space-y-6">
            {/* Product Category */}
            <div>
                <label className="block text-sm font-medium text-subtle-light dark:text-subtle-dark mb-2" htmlFor="product-category">
                    Product Category
                </label>
                <div className="relative">
                    <select
                        className="w-full appearance-none bg-gray-100 dark:bg-gray-800 border-none rounded-lg pl-4 pr-10 py-2.5 text-sm focus:ring-primary focus:border-primary"
                        id="product-category"
                        value={detectedCategory}
                        onChange={(e) => handleCategoryChange(e.target.value)}
                        disabled={isGenerating}
                    >
                        {Object.entries(productCategories).map(([key, category]) => (
                            <option key={key} value={key}>
                                {category.name}
                            </option>
                        ))}
                    </select>
                    <span className="material-icons absolute right-3 top-1/2 -translate-y-1/2 text-subtle-light dark:text-subtle-dark pointer-events-none">
                        expand_more
                    </span>
                </div>
            </div>

            {/* Photography Style */}
            <div>
                <label className="block text-sm font-medium text-subtle-light dark:text-subtle-dark mb-2" htmlFor="photography-style">
                    Photography Style
                </label>
                <div className="relative">
                    <select
                        className="w-full appearance-none bg-gray-100 dark:bg-gray-800 border-none rounded-lg pl-4 pr-10 py-2.5 text-sm focus:ring-primary focus:border-primary"
                        id="photography-style"
                        value={selectedStyle}
                        onChange={(e) => setSelectedStyle(e.target.value)}
                        disabled={isGenerating}
                    >
                        {Object.entries(styleOptions).map(([key, style]) => (
                            <option key={key} value={key}>
                                {style.name}
                            </option>
                        ))}
                    </select>
                    <span className="material-icons absolute right-3 top-1/2 -translate-y-1/2 text-subtle-light dark:text-subtle-dark pointer-events-none">
                        expand_more
                    </span>
                </div>
            </div>

            {/* Color Variants Selection */}
            {colorVariants && colorVariants.length > 0 && (
                <div>
                    <div className="flex justify-between items-center mb-3">
                        <label className="text-sm font-medium text-subtle-light dark:text-subtle-dark">
                            Color Variants
                        </label>
                        <button
                            onClick={toggleSelectAll}
                            className="text-xs text-primary hover:text-primary/80 transition-colors"
                        >
                            {selectAll ? 'Deselect All' : 'Select All'}
                        </button>
                    </div>
                    <div className="grid grid-cols-4 gap-2">
                        {colorVariants.map((variant) => (
                            <div
                                key={variant.id}
                                onClick={() => toggleVariantSelection(variant.id)}
                                className={`relative cursor-pointer rounded-lg overflow-hidden border-2 transition-all ${selectedVariants.includes(variant.id)
                                    ? 'border-primary shadow-lg scale-105'
                                    : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
                                    }`}
                            >
                                <img
                                    src={variant.image}
                                    alt={variant.name}
                                    className="w-full h-12 object-cover"
                                />
                                {selectedVariants.includes(variant.id) && (
                                    <div className="absolute top-1 right-1 w-4 h-4 bg-primary rounded-full flex items-center justify-center">
                                        <span className="material-icons text-white text-xs">check</span>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Generate Button */}
            <div className="mt-auto">
                <button
                    onClick={generateScenariosForSelected}
                    disabled={selectedVariants.length === 0 || selectedScenarios.length === 0 || isGenerating}
                    className="w-full flex items-center justify-center space-x-2 bg-gradient-to-r from-teal-400 to-cyan-500 text-white font-semibold py-3 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <span className="material-icons">auto_awesome</span>
                    <span>{isGenerating ? 'Generating...' : `Generate ${selectedVariants.length} × ${selectedScenarios.length} Lifestyle Images`}</span>
                </button>
            </div>

            {/* Generated Scenarios Grid */}
            {generatedScenarios.length > 0 && (
                <div style={{
                    padding: '16px',
                    background: 'rgba(45, 45, 45, 0.4)',
                    border: '1px solid rgba(64, 64, 64, 0.6)',
                    borderRadius: '12px',
                    backdropFilter: 'blur(10px)'
                }}>
                    <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: '16px'
                    }}>
                        <h5 style={{
                            fontSize: '14px',
                            fontWeight: '600',
                            color: '#ffffff',
                            margin: 0
                        }}>
                            Results ({generatedScenarios.length})
                        </h5>
                        <button
                            onClick={() => setGeneratedScenarios([])}
                            style={{
                                fontSize: '11px',
                                color: '#a3a3a3',
                                background: 'none',
                                border: 'none',
                                cursor: 'pointer',
                                padding: '4px 8px',
                                borderRadius: '6px',
                                transition: 'all 0.2s ease'
                            }}
                            onMouseEnter={(e) => {
                                e.target.style.background = 'rgba(239, 68, 68, 0.1)';
                                e.target.style.color = '#ef4444';
                            }}
                            onMouseLeave={(e) => {
                                e.target.style.background = 'none';
                                e.target.style.color = '#a3a3a3';
                            }}
                        >
                            Clear All
                        </button>
                    </div>

                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(2, 1fr)',
                        gap: '12px',
                        marginBottom: '12px'
                    }}>
                        {generatedScenarios.map((scenario) => (
                            <div
                                key={scenario.id}
                                onClick={() => selectScenario(scenario)}
                                style={{
                                    position: 'relative',
                                    cursor: 'pointer',
                                    borderRadius: '10px',
                                    overflow: 'hidden',
                                    border: selectedScenario?.id === scenario.id
                                        ? '2px solid #14b8a6'
                                        : '1px solid rgba(64, 64, 64, 0.6)',
                                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                    transform: selectedScenario?.id === scenario.id ? 'scale(1.02)' : 'scale(1)',
                                    boxShadow: selectedScenario?.id === scenario.id
                                        ? '0 4px 12px rgba(20, 184, 166, 0.3)'
                                        : '0 2px 8px rgba(0, 0, 0, 0.2)'
                                }}
                                onMouseEnter={(e) => {
                                    if (selectedScenario?.id !== scenario.id) {
                                        e.target.style.borderColor = 'rgba(163, 163, 163, 0.8)';
                                        e.target.style.transform = 'scale(1.01)';
                                    }
                                }}
                                onMouseLeave={(e) => {
                                    if (selectedScenario?.id !== scenario.id) {
                                        e.target.style.borderColor = 'rgba(64, 64, 64, 0.6)';
                                        e.target.style.transform = 'scale(1)';
                                    }
                                }}
                            >
                                <img
                                    src={scenario.image}
                                    alt={`${scenario.variantName} - ${scenario.scenarioName}`}
                                    style={{
                                        width: '100%',
                                        height: '96px',
                                        objectFit: 'cover',
                                        display: 'block'
                                    }}
                                />

                                {/* Overlay info */}
                                <div style={{
                                    position: 'absolute',
                                    bottom: 0,
                                    left: 0,
                                    right: 0,
                                    background: 'linear-gradient(to top, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.6) 50%, transparent 100%)',
                                    padding: '12px 8px 8px 8px'
                                }}>
                                    <div style={{
                                        fontSize: '11px',
                                        fontWeight: '600',
                                        color: '#ffffff',
                                        marginBottom: '2px'
                                    }}>
                                        {scenario.scenarioName}
                                    </div>
                                    <div style={{
                                        fontSize: '10px',
                                        color: '#14b8a6',
                                        fontWeight: '500'
                                    }}>
                                        {scenario.variantName}
                                    </div>
                                </div>

                                {selectedScenario?.id === scenario.id && (
                                    <div style={{
                                        position: 'absolute',
                                        top: '6px',
                                        right: '6px',
                                        width: '18px',
                                        height: '18px',
                                        background: 'linear-gradient(135deg, #14b8a6 0%, #0d9488 100%)',
                                        borderRadius: '50%',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        boxShadow: '0 2px 8px rgba(20, 184, 166, 0.4)'
                                    }}>
                                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'white' }}>
                                            <path d="M5 12l5 5L20 7" />
                                        </svg>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>

                    <p style={{
                        fontSize: '11px',
                        color: '#6b7280',
                        textAlign: 'center',
                        margin: 0,
                        fontStyle: 'italic'
                    }}>
                        Click on any scenario to use it as your main image
                    </p>
                </div>
            )}
        </div>
    );
}, (prevProps, nextProps) => {
    return (
        prevProps.uploadedImage === nextProps.uploadedImage &&
        prevProps.setUploadedImage === nextProps.setUploadedImage &&
        prevProps.setIsProcessing === nextProps.setIsProcessing &&
        prevProps.setProcessingText === nextProps.setProcessingText &&
        prevProps.setProgress === nextProps.setProgress &&
        prevProps.colorVariants === nextProps.colorVariants &&
        prevProps.generatedScenarios === nextProps.generatedScenarios &&
        prevProps.setGeneratedScenarios === nextProps.setGeneratedScenarios
    );
});