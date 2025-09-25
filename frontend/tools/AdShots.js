// Ad Shots Panel - Surreal Product Advertisement Generator
const AdShotsPanel = React.memo(({ uploadedImage, setUploadedImage, setIsProcessing, setProcessingText, setProgress, colorVariants, generatedAds, setGeneratedAds }) => {
    const [selectedStyle, setSelectedStyle] = React.useState('surreal_cinematic');
    const [customPrompt, setCustomPrompt] = React.useState('');
    const [selectedVariants, setSelectedVariants] = React.useState([]);
    const [selectAll, setSelectAll] = React.useState(false);

    // Expanded ad shot styles with diverse creative themes
    const adStyles = {
        surreal_cinematic: {
            name: 'Surreal Cinematic',
            description: 'Dreamlike scenes with impossible elements',
            prompt: 'Design a conceptually bold and imaginative product advertisement where the product feels like it exists inside a surreal story world. Place the hero product at the center of a cinematic scene — not just a studio — but a hybrid environment that fuses real props with abstract, impossible elements. Think luminous floating terrains, translucent crystalline forms, and liquid-light trails swirling around it. Use multi-layered neon lighting, shifting color fields, and prismatic reflections to create depth. Add kinetic visual cues like particles, refracted beams, holographic symbols, and dynamic typography that reacts to the scene\'s motion. Blend high-fashion editorial photography with experimental digital art for a one-of-a-kind, futuristic ad image that feels alive and immersive.'
        },
        neon_cyberpunk: {
            name: 'Neon Cyberpunk',
            description: 'Futuristic cyberpunk aesthetic with neon lights',
            prompt: 'Create a cyberpunk-inspired product advertisement set in a dark futuristic cityscape at night with towering skyscrapers covered in neon signs and holographic billboards. The background should feature rain-soaked streets reflecting purple and cyan neon lights, with digital interfaces and circuit patterns overlay effects. The product floats in the center with intense rim lighting, surrounded by glowing particles and electronic glitch effects. Use deep blacks, electric blues, hot pinks, and acid greens.'
        },
        liquid_metal: {
            name: 'Liquid Metal',
            description: 'Flowing metallic surfaces and reflections',
            prompt: 'Create a liquid metal advertisement set in a futuristic industrial environment with flowing mercury-like surfaces covering the ground and walls. The background features molten chrome waterfalls and metallic structures that constantly reshape themselves. The product sits on a pedestal of liquid silver that ripples and reflects multiple distorted versions of itself. Use dramatic industrial lighting with chrome, platinum, and gold reflections creating mirror maze effects.'
        },
        crystal_dimension: {
            name: 'Crystal Dimension',
            description: 'Crystalline structures and prismatic effects',
            prompt: 'Place the product inside a massive crystal cave with towering amethyst and quartz formations covering every surface. The background features rainbow light beams refracting through translucent crystal walls, creating prismatic patterns and rainbow caustics everywhere. Floating crystal shards orbit around the product while pure white light streams penetrate from mysterious sources above, splitting into spectacular color displays. The ground is made of polished crystal reflecting everything in kaleidoscopic patterns.'
        },
        floating_cosmos: {
            name: 'Floating Cosmos',
            description: 'Weightless space environment with cosmic elements',
            prompt: 'Create a cosmic advertisement set in deep space with swirling nebulae in purple, pink, and blue gradients filling the background. Multiple alien planets and moons hang in the distance while asteroid fields drift by. The product floats weightlessly among glowing star clusters and cosmic dust clouds that form spiraling galaxies. Add shooting stars, aurora-like energy streams, and floating geometric portals. The scene should feel like being inside a cosmic storm of colors and celestial phenomena.'
        },
        abstract_geometry: {
            name: 'Abstract Geometry',
            description: 'Bold geometric shapes and impossible architecture',
            prompt: 'Create an abstract geometric advertisement in a surreal architectural space with impossible Escher-like structures. The background features floating triangular platforms, twisted cube formations, and spiral staircases that defy gravity. Giant geometric shapes in bold primary colors (red, yellow, blue) rotate slowly through the space. The product sits at the center of intersecting planes and dimensional portals. Use dramatic directional lighting that creates sharp shadows and bold contrasts against a deep black void.'
        },
        minimalist_luxury: {
            name: 'Minimalist Luxury',
            description: 'Apple-style clean luxury aesthetics',
            prompt: 'Create an ultra-minimalist luxury advertisement in a pristine white infinity room with soft gradient walls that curve seamlessly into the floor and ceiling. The background features subtle pearl-white textures and barely visible geometric patterns. Soft, diffused lighting comes from hidden sources creating gentle shadows. The product floats in the center with perfect reflections on the glossy white floor. Add subtle gold or platinum accents and negative space. The overall feeling should be like being inside a high-end jewelry store or Apple showroom.'
        },
        vintage_poster: {
            name: 'Vintage Poster',
            description: 'Retro advertising poster aesthetics',
            prompt: 'Create a vintage advertisement poster set against a classic 1950s American diner background with checkered floors, neon signs, and chrome details. The background features retro sunburst patterns, art deco geometric borders, and aged paper textures in warm sepia tones. Add vintage typography elements, classic advertising rays emanating from the product, and nostalgic color schemes of cream, burgundy, and gold. Include retro design elements like ribbons, badges, and decorative frames typical of mid-century advertising.'
        },
        explosion_energy: {
            name: 'Explosion Energy',
            description: 'Dynamic energy with explosive elements',
            prompt: 'Create a high-energy advertisement set in an electric storm environment with dark stormy clouds and lightning strikes in the background. The ground cracks and glows with molten energy veins while the product hovers at the center of a controlled explosion. Bright electric arcs, plasma bolts, and energy shockwaves radiate outward in all directions. Use intense oranges, electric blues, and bright whites against a dramatic dark sky filled with energy discharge patterns.'
        },
        underwater_dream: {
            name: 'Underwater Dream',
            description: 'Ethereal underwater fantasy world',
            prompt: 'Create an ethereal underwater advertisement set in a crystal-clear ocean with coral reefs and tropical fish in the background. Shafts of golden sunlight penetrate from the surface above, creating caustic light patterns on the sandy ocean floor. The product floats gracefully surrounded by flowing seaweed, rising air bubbles, and schools of colorful fish. Add floating jellyfish, sea anemones, and underwater flora. Use aqua blues, turquoise, pearl whites, and golden sunbeam highlights.'
        },
        fire_ice: {
            name: 'Fire & Ice',
            description: 'Dramatic contrast of fire and ice elements',
            prompt: 'Create a dramatic split-world advertisement with the left side featuring a volcanic landscape with flowing lava rivers, molten rock formations, and intense fire effects in warm oranges and reds. The right side shows an arctic environment with massive ice glaciers, frozen waterfalls, and crystal formations in cool blues and whites. The product hovers perfectly at the center where these two worlds meet, with steam and mist effects where fire meets ice. Use dramatic temperature contrast lighting.'
        },
        nature_fusion: {
            name: 'Nature Fusion',
            description: 'Product integrated with organic natural elements',
            prompt: 'Design an advertisement where the product seamlessly blends with natural elements like growing plants, flowing water, or organic textures. The product should appear to be part of nature itself, with vines growing around it, water flowing through it, or leaves emerging from its surfaces. Use earthy tones with vibrant green accents.'
        },
        holographic_future: {
            name: 'Holographic Future',
            description: 'Futuristic holographic display aesthetic',
            prompt: 'Create a futuristic advertisement with holographic displays, transparent screens, and digital interface elements surrounding the product. Use glitch effects, scan lines, and digital artifacts. The product should appear to be part of an advanced user interface with floating data visualizations and neon UI elements.'
        },
        pop_art_explosion: {
            name: 'Pop Art Explosion',
            description: 'Bold pop art with comic book aesthetics',
            prompt: 'Design a vibrant pop art advertisement with bold colors, comic book aesthetics, halftone patterns, and dramatic typography. Use bright primary colors, speech bubbles, action lines, and retro comic book styling. The product should be the superhero of the advertisement.'
        },
        glass_refraction: {
            name: 'Glass Refraction',
            description: 'Complex glass prisms and light refraction',
            prompt: 'Create an elegant advertisement featuring the product surrounded by complex glass prisms, crystal formations, and light refraction effects. The scene should showcase beautiful caustics, rainbow refractions, and transparent surfaces that bend and distort light around the product in mesmerizing ways.'
        },
        desert_mirage: {
            name: 'Desert Mirage',
            description: 'Mystical desert landscape with mirage effects',
            prompt: 'Design a mystical desert advertisement where the product appears as a mirage in vast sand dunes. Use heat distortion effects, golden hour lighting, and surreal scale contrasts. The product should seem to emerge from or float above the desert sands with ethereal shimmer effects.'
        }
    };

    // Toggle variant selection
    const toggleVariantSelection = (variant) => {
        setSelectedVariants(prev => {
            const isSelected = prev.some(v => v.name === variant.name);
            if (isSelected) {
                return prev.filter(v => v.name !== variant.name);
            } else {
                return [...prev, variant];
            }
        });
    };

    // Toggle select all variants
    const toggleSelectAll = () => {
        if (selectAll) {
            setSelectedVariants([]);
        } else {
            setSelectedVariants([...colorVariants]);
        }
        setSelectAll(!selectAll);
    };

    // Generate ad shots
    const generateAdShots = async () => {
        if (!uploadedImage) {
            alert('Please upload an image first');
            return;
        }

        const variants = selectedVariants.length > 0 ? selectedVariants : [{ name: 'Original', image: uploadedImage }];

        setIsProcessing(true);
        setProcessingText(`Generating ${variants.length} surreal ad shots...`);
        setProgress(0);

        try {
            const newAds = [];
            const style = adStyles[selectedStyle];
            const basePrompt = customPrompt.trim() || style.prompt;

            for (let i = 0; i < variants.length; i++) {
                const variant = variants[i];
                setProcessingText(`Creating ad shot for ${variant.name}...`);
                setProgress((i / variants.length) * 90);

                const imageBase64 = variant.image.includes('data:image') ? variant.image.split(',')[1] : variant.image;

                const fullPrompt = `${basePrompt}, professional advertising photography, ultra-high quality, 8K resolution, cinematic lighting, award-winning commercial photography, hyperrealistic details, perfect product integration`;

                const response = await fetch('/api/generate', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        image_base64: imageBase64,
                        prompt: fullPrompt,
                        guidance_scale: 8.0,
                        num_inference_steps: 35
                    })
                });

                if (response.ok) {
                    const result = await response.json();
                    if (result.success) {
                        newAds.push({
                            id: Date.now() + i,
                            image: `data:image/png;base64,${result.image}`,
                            variantName: variant.name,
                            styleName: style.name,
                            prompt: fullPrompt,
                            timestamp: new Date().toLocaleString()
                        });
                    }
                }

                // Small delay between requests
                await new Promise(resolve => setTimeout(resolve, 500));
            }

            if (newAds.length > 0) {
                setGeneratedAds(prev => [...prev, ...newAds]);
                setProgress(100);
                setTimeout(() => {
                    setIsProcessing(false);
                    setProgress(0);
                }, 500);
            } else {
                throw new Error('Failed to generate ad shots');
            }

        } catch (error) {
            console.error('Ad shot generation failed:', error);
            alert(`Ad shot generation failed: ${error.message}`);
            setIsProcessing(false);
            setProgress(0);
        }
    };

    const downloadAd = (ad) => {
        const link = document.createElement('a');
        link.href = ad.image;
        link.download = `ad-shot-${ad.variantName.toLowerCase().replace(/\s+/g, '-')}-${ad.styleName.toLowerCase().replace(/\s+/g, '-')}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const clearAds = () => {
        setGeneratedAds([]);
    };

    return (
        <div className="space-y-4">
            {/* Style Selection */}
            <div>
                <h4 className="font-medium mb-2 text-text-light dark:text-text-dark">Ad Style</h4>
                <select
                    value={selectedStyle}
                    onChange={(e) => setSelectedStyle(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:ring-primary focus:border-primary text-text-light dark:text-text-dark"
                >
                    {Object.entries(adStyles).map(([key, style]) => (
                        <option key={key} value={key}>
                            {style.name}
                        </option>
                    ))}
                </select>
                <p className="text-xs text-subtle-light dark:text-subtle-dark mt-1">
                    {adStyles[selectedStyle].description}
                </p>
            </div>

            {/* Custom Prompt */}
            <div>
                <h4 className="font-medium mb-2 text-text-light dark:text-text-dark">Custom Description</h4>
                <textarea
                    value={customPrompt}
                    onChange={(e) => setCustomPrompt(e.target.value)}
                    placeholder="Add specific details for your ad concept..."
                    className="w-full h-16 px-3 py-2 bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:ring-primary focus:border-primary resize-none text-text-light dark:text-text-dark"
                    rows={2}
                />
            </div>

            {/* Original Image Info */}
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 border border-blue-200 dark:border-blue-800">
                <p className="text-sm text-blue-700 dark:text-blue-300 font-medium mb-1">
                    ✨ Ready to Generate
                </p>
                <p className="text-xs text-blue-600 dark:text-blue-400">
                    {selectedVariants.length > 0
                        ? `Will create ${selectedVariants.length} ad variations using selected color variants`
                        : 'Will create surreal ad shot using your original uploaded image'
                    }
                </p>
            </div>

            {/* Color Variants Selection */}
            {colorVariants && colorVariants.length > 0 && (
                <div>
                    <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-text-light dark:text-text-dark">Use Color Variants (Optional)</h4>
                        <button
                            onClick={toggleSelectAll}
                            className="text-xs text-primary hover:text-primary/80 transition-colors"
                        >
                            {selectAll ? 'Deselect All' : 'Select All'}
                        </button>
                    </div>
                    <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto">
                        {colorVariants.map((variant, index) => (
                            <label key={index} className="flex items-center space-x-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={selectedVariants.some(v => v.name === variant.name)}
                                    onChange={() => toggleVariantSelection(variant)}
                                    className="text-primary focus:ring-primary"
                                />
                                <div className="flex items-center space-x-2 flex-1">
                                    <div
                                        className="w-4 h-4 rounded-full border border-gray-300"
                                        style={{ backgroundColor: variant.color }}
                                    ></div>
                                    <span className="text-xs text-text-light dark:text-text-dark truncate">
                                        {variant.name}
                                    </span>
                                </div>
                            </label>
                        ))}
                    </div>
                    <p className="text-xs text-subtle-light dark:text-subtle-dark mt-1">
                        Leave unselected to use original image only
                    </p>
                </div>
            )}

            {/* Generate Button */}
            <button
                onClick={generateAdShots}
                disabled={!uploadedImage}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:from-gray-400 disabled:to-gray-400 text-white font-medium py-3 px-4 rounded-lg transition-all duration-300"
            >
                {selectedVariants.length > 0
                    ? `Generate ${selectedVariants.length} Ad Variations`
                    : 'Generate Ad Shot from Original'
                }
            </button>

            {/* Generated Ads Gallery */}
            {generatedAds.length > 0 && (
                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <h4 className="font-medium text-text-light dark:text-text-dark">Generated Ads ({generatedAds.length})</h4>
                        <button
                            onClick={clearAds}
                            className="text-xs text-subtle-light dark:text-subtle-dark hover:text-red-400 transition-colors"
                        >
                            Clear
                        </button>
                    </div>
                    <div className="space-y-3 max-h-80 overflow-y-auto">
                        {generatedAds.map((ad) => (
                            <div key={ad.id} className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-3">
                                <img
                                    src={ad.image}
                                    alt={`${ad.styleName} - ${ad.variantName}`}
                                    className="w-full rounded-lg mb-2 cursor-pointer hover:opacity-90 transition-opacity"
                                    onClick={() => setUploadedImage(ad.image)}
                                />
                                <div className="flex items-center justify-between mb-2">
                                    <div>
                                        <p className="text-sm font-medium text-text-light dark:text-text-dark">
                                            {ad.styleName}
                                        </p>
                                        <p className="text-xs text-subtle-light dark:text-subtle-dark">
                                            {ad.variantName}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => setUploadedImage(ad.image)}
                                        className="flex-1 bg-primary hover:bg-primary/90 text-white py-1 px-2 rounded text-xs transition-colors"
                                    >
                                        Use Image
                                    </button>
                                    <button
                                        onClick={() => downloadAd(ad)}
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
