// Color Variations Panel - Updated v2.0
const ColorVariationsPanel = ({ 
    uploadedImage, 
    setUploadedImage, 
    setIsProcessing, 
    setProcessingText, 
    setProgress,
    colorVariants,
    setColorVariants 
}) => {
    const [selectedColors, setSelectedColors] = React.useState([]);
    const [customColor, setCustomColor] = React.useState('#ff0000');
    const [preserveDetails, setPreserveDetails] = React.useState(true);
    const [numVariations, setNumVariations] = React.useState(4);
    const [colorMode, setColorMode] = React.useState('custom'); // 'random' or 'custom'

    const predefinedColors = [
        { name: 'Red', color: '#dc2626', hex: '#dc2626' },
        { name: 'Blue', color: '#2563eb', hex: '#2563eb' },
        { name: 'Green', color: '#16a34a', hex: '#16a34a' },
        { name: 'Orange', color: '#ea580c', hex: '#ea580c' },
        { name: 'Purple', color: '#9333ea', hex: '#9333ea' },
        { name: 'Gold', color: '#f59e0b', hex: '#f59e0b' },
        { name: 'Black', color: '#1f2937', hex: '#1f2937' },
        { name: 'White', color: '#f9fafb', hex: '#f9fafb' },
        { name: 'Pink', color: '#f472b6', hex: '#f472b6' },
        { name: 'Mint', color: '#10b981', hex: '#10b981' },
        { name: 'Sky', color: '#0ea5e9', hex: '#0ea5e9' },
        { name: 'Lavender', color: '#a855f7', hex: '#a855f7' }
    ];

    // Auto-select random colors function
    const getRandomColors = (count = 4) => {
        const shuffled = [...predefinedColors].sort(() => 0.5 - Math.random());
        return shuffled.slice(0, count);
    };

    const toggleColorSelection = (color) => {
        setSelectedColors(prev => {
            const isSelected = prev.some(c => c.hex === color.hex);
            if (isSelected) {
                return prev.filter(c => c.hex !== color.hex);
            } else {
                return [...prev, color];
            }
        });
    };

    const addCustomColor = () => {
        const customColorObj = {
            name: `Custom ${customColor}`,
            color: customColor,
            hex: customColor
        };
        
        if (!selectedColors.some(c => c.hex === customColor)) {
            setSelectedColors(prev => [...prev, customColorObj]);
        }
    };

    const generateColorVariations = async () => {
        if (!uploadedImage || selectedColors.length === 0) return;

        setIsProcessing(true);
        setProcessingText(`Generating ${selectedColors.length} color variations...`);
        setProgress(0);

        // Set initial progress
        setProgress(10);

        try {
            const variants = [];
            const imageBase64 = uploadedImage.split(',')[1] || uploadedImage;
            
            // Color prompts mapping (same as working HTML)
            const colorPrompts = {
                "#dc2626": "Transform the product to elegant red color scheme, vibrant red finish, professional red coating",
                "#2563eb": "Transform the product to deep blue color scheme, rich navy blue finish, vibrant blue coating", 
                "#16a34a": "Transform the product to forest green color scheme, natural green finish, deep emerald green coating",
                "#ea580c": "Transform the product to bright orange color scheme, vibrant orange finish, energetic orange coating",
                "#9333ea": "Transform the product to elegant purple color scheme, rich purple finish, luxurious purple coating",
                "#f59e0b": "Transform the product to golden yellow color scheme, warm gold finish, premium golden coating",
                "#1f2937": "Transform the product to elegant matte black color scheme, sophisticated dark finish, premium black coating",
                "#f9fafb": "Transform the product to clean pure white color scheme, pristine white finish, minimalist white coating",
                "#f472b6": "Transform the product to soft pink color scheme, elegant pink finish, stylish rose coating",
                "#10b981": "Transform the product to mint green color scheme, fresh mint finish, modern teal coating",
                "#0ea5e9": "Transform the product to sky blue color scheme, bright cyan finish, modern blue coating",
                "#a855f7": "Transform the product to lavender purple color scheme, soft purple finish, elegant violet coating"
            };

            setProgress(20); // Processing started

            for (let i = 0; i < selectedColors.length; i++) {
                const color = selectedColors[i];
                
                // Update processing text for current color (no progress bar updates in loop)
                setProcessingText(`Generating ${color.name} variation...`);
                
                // Get color-specific prompt or use generic transformation
                const colorPrompt = colorPrompts[color.hex] || `Transform the product to ${color.name} color scheme, maintaining all original design features and proportions`;
                
                const fullPrompt = `${colorPrompt}. Professional product photography, clean white background, studio lighting, high-quality commercial shot, maintain original shape and details${preserveDetails ? ', preserve textures and shadows intact' : ''}`;
                
                const response = await fetch('/api/generate', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        image_base64: imageBase64,
                        prompt: fullPrompt,
                        guidance_scale: 7.0,
                        num_inference_steps: 25
                    })
                });
                
                if (response.ok) {
                    const result = await response.json();
                    if (result.success) {
                        variants.push({
                            name: color.name,
                            color: color.hex,
                            image: `data:image/png;base64,${result.image}`
                        });
                    }
                }
                
                // Small delay between requests
                await new Promise(resolve => setTimeout(resolve, 300));
            }
            
            if (variants.length > 0) {
                setProgress(90);
                setColorVariants(variants);
                
                // Complete the process
                setTimeout(() => {
                    setProgress(100);
                    setTimeout(() => {
                        setIsProcessing(false);
                        setProgress(0);
                    }, 300);
                }, 200);
            } else {
                throw new Error(result.error || 'Failed to generate color variations');
            }

        } catch (error) {
            console.error('Color variation generation failed:', error);
            setIsProcessing(false);
            setProgress(0);
        }
    };

    const clearVariants = () => {
        setColorVariants([]);
    };

    return (
        <div className="space-y-6">


            {/* Color Mode Selection */}
            <div>
                <h4 className="font-medium mb-3">Color Selection Mode</h4>
                <div className="flex gap-2 mb-4">
                    <button 
                        onClick={() => {
                            setColorMode('random');
                            setSelectedColors(getRandomColors(numVariations));
                        }}
                        className={`flex-1 py-2 px-3 rounded-lg transition-colors text-sm ${
                            colorMode === 'random' 
                                ? 'bg-teal-600 text-white' 
                                : 'bg-gray-600 hover:bg-gray-500 text-gray-200'
                        }`}
                    >
                        Random Colors
                    </button>
                    <button 
                        onClick={() => {
                            setColorMode('custom');
                            setSelectedColors([]);
                        }}
                        className={`flex-1 py-2 px-3 rounded-lg transition-colors text-sm ${
                            colorMode === 'custom' 
                                ? 'bg-purple-600 text-white' 
                                : 'bg-gray-600 hover:bg-gray-500 text-gray-200'
                        }`}
                    >
                        Custom Colors
                    </button>
                </div>

                {/* Random Colors Slider - Only show for random mode */}
                {colorMode === 'random' && (
                    <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                            <span>2</span>
                            <span className="font-bold text-teal-400">{numVariations} random colors</span>
                            <span>8</span>
                        </div>
                        <input 
                            type="range" 
                            min="2" 
                            max="8" 
                            value={numVariations}
                            onChange={(e) => {
                                const count = parseInt(e.target.value);
                                setNumVariations(count);
                                setSelectedColors(getRandomColors(count));
                            }}
                            className="w-full h-3 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                            style={{
                                background: `linear-gradient(to right, #14b8a6 0%, #14b8a6 ${(numVariations-2)/6*100}%, #374151 ${(numVariations-2)/6*100}%, #374151 100%)`
                            }}
                        />
                        <button 
                            onClick={() => setSelectedColors(getRandomColors(numVariations))}
                            className="w-full bg-teal-600 hover:bg-teal-700 text-white py-2 rounded-lg transition-colors text-sm"
                        >
                            🎲 Shuffle Colors
                        </button>
                    </div>
                )}
            </div>

            {/* Color Selection - Only show for custom mode */}
            {colorMode === 'custom' && (
                <div>
                    <h4 className="font-medium mb-3">Select Colors</h4>
                    <div className="grid grid-cols-4 gap-3">
                        {predefinedColors.map(color => (
                            <div 
                                key={color.hex}
                                onClick={() => toggleColorSelection(color)}
                                className={`cursor-pointer rounded-lg border-2 p-2 transition-all ${
                                    selectedColors.some(c => c.hex === color.hex)
                                        ? 'border-purple-500 bg-purple-500/10' 
                                        : 'border-dark-border hover:border-gray-500'
                                }`}
                            >
                                <div 
                                    className="w-full h-8 rounded-md border border-gray-600"
                                    style={{ backgroundColor: color.color }}
                                ></div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Custom Color - Only show for custom mode */}
            {colorMode === 'custom' && (
                <div>
                    <h4 className="font-medium mb-3">Add Custom Color</h4>
                    <div className="flex space-x-2">
                        <input 
                            type="color" 
                            value={customColor}
                            onChange={(e) => setCustomColor(e.target.value)}
                            className="w-12 h-10 rounded border border-dark-border bg-dark-bg"
                        />
                        <input 
                            type="text" 
                            value={customColor}
                            onChange={(e) => setCustomColor(e.target.value)}
                            className="flex-1 px-3 py-2 bg-dark-bg border border-dark-border rounded-lg focus:border-purple-500 focus:outline-none text-sm"
                            placeholder="#ffffff"
                        />
                        <button 
                            onClick={addCustomColor}
                            className="px-3 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors"
                        >
                            <Icons.Plus className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            )}

            {/* Selected Colors Display */}
            {selectedColors.length > 0 && (
                <div>
                    <h4 className="font-medium mb-3">
                        Selected Colors ({selectedColors.length})
                        {colorMode === 'random' && <span className="text-teal-400 text-sm ml-2">- Random</span>}
                        {colorMode === 'custom' && <span className="text-purple-400 text-sm ml-2">- Custom</span>}
                    </h4>
                    <div className="flex flex-wrap gap-2">
                        {selectedColors.map((color, index) => (
                            <div 
                                key={index}
                                className="flex items-center space-x-2 bg-dark-bg border border-dark-border rounded-lg px-2 py-1"
                            >
                                <div 
                                    className="w-4 h-4 rounded-full border border-gray-600"
                                    style={{ backgroundColor: color.color }}
                                ></div>
                                <span className="text-xs">{color.name}</span>
                                {colorMode === 'custom' && (
                                    <button 
                                        onClick={() => toggleColorSelection(color)}
                                        className="text-gray-400 hover:text-white"
                                    >
                                        <Icons.X className="w-3 h-3" />
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}



            {/* Options */}
            <div>
                <h4 className="font-medium mb-3">Options</h4>
                <label className="flex items-center space-x-3 cursor-pointer">
                    <input 
                        type="checkbox" 
                        checked={preserveDetails}
                        onChange={(e) => setPreserveDetails(e.target.checked)}
                        className="text-teal-500 focus:ring-teal-500"
                    />
                    <div>
                        <div className="text-sm font-medium">Preserve Details</div>
                        <div className="text-xs text-dark-text-secondary">Keep textures and shadows intact</div>
                    </div>
                </label>
            </div>

            {/* Generate Button */}
            <div className="space-y-3">
                <button 
                    onClick={generateColorVariations}
                    disabled={!uploadedImage || selectedColors.length === 0}
                    className="w-full gradient-primary py-3 rounded-lg font-medium text-white hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <Icons.Palette className="w-4 h-4 inline mr-2" />
                    Generate {selectedColors.length} Color Variation{selectedColors.length !== 1 ? 's' : ''}
                </button>

                {colorVariants.length > 0 && (
                    <button 
                        onClick={clearVariants}
                        className="w-full py-2 border border-dark-border rounded-lg hover:bg-gray-700 transition-colors text-sm"
                    >
                        Clear Variations
                    </button>
                )}
            </div>

            {/* Tips */}
            <div className="bg-dark-bg border border-dark-border rounded-lg p-4">
                <h5 className="font-medium mb-2 text-teal-500">🎨 Color Tips</h5>
                <ul className="text-sm text-dark-text-secondary space-y-1">
                    <li>• Works best with solid-colored products</li>
                    <li>• Select 3-6 colors for optimal results</li>
                    <li>• Consider your brand colors</li>
                    <li>• Test complementary color combinations</li>
                </ul>
            </div>
        </div>
    );
};