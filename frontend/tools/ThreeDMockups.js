// 3D Mockups Panel
const ThreeDMockupsPanel = ({ uploadedImage, setIsProcessing, setProcessingText, setProgress }) => {
    const [selectedModel, setSelectedModel] = React.useState(null);
    const [selectedAngle, setSelectedAngle] = React.useState('front');
    const [lighting, setLighting] = React.useState('studio');

    const mockupModels = [
        {
            id: 'phone',
            name: 'Smartphone',
            description: 'Modern smartphone mockup',
            thumbnail: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=150&h=150&fit=crop',
            category: 'Electronics'
        },
        {
            id: 'laptop',
            name: 'Laptop',
            description: 'MacBook-style laptop',
            thumbnail: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=150&h=150&fit=crop',
            category: 'Electronics'
        },
        {
            id: 'tablet',
            name: 'Tablet',
            description: 'iPad-style tablet',
            thumbnail: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=150&h=150&fit=crop',
            category: 'Electronics'
        },
        {
            id: 'tshirt',
            name: 'T-Shirt',
            description: 'Basic crew neck t-shirt',
            thumbnail: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=150&h=150&fit=crop',
            category: 'Apparel'
        },
        {
            id: 'mug',
            name: 'Coffee Mug',
            description: 'Classic ceramic mug',
            thumbnail: 'https://images.unsplash.com/photo-1514228742587-6b1558fcf93a?w=150&h=150&fit=crop',
            category: 'Drinkware'
        },
        {
            id: 'book',
            name: 'Book Cover',
            description: 'Hardcover book mockup',
            thumbnail: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=150&h=150&fit=crop',
            category: 'Print'
        },
        {
            id: 'poster',
            name: 'Poster Frame',
            description: 'Framed poster on wall',
            thumbnail: 'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=150&h=150&fit=crop',
            category: 'Print'
        },
        {
            id: 'bottle',
            name: 'Water Bottle',
            description: 'Sports water bottle',
            thumbnail: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=150&h=150&fit=crop',
            category: 'Drinkware'
        }
    ];

    const viewAngles = [
        { id: 'front', name: 'Front View', description: 'Straight on view' },
        { id: 'angle', name: 'Angled View', description: '3/4 perspective' },
        { id: 'side', name: 'Side View', description: 'Profile view' },
        { id: 'top', name: 'Top View', description: 'Bird\'s eye view' },
        { id: 'isometric', name: 'Isometric', description: '3D technical view' }
    ];

    const lightingOptions = [
        { id: 'studio', name: 'Studio Lighting', description: 'Professional studio setup' },
        { id: 'natural', name: 'Natural Light', description: 'Soft daylight' },
        { id: 'dramatic', name: 'Dramatic', description: 'High contrast shadows' },
        { id: 'soft', name: 'Soft Light', description: 'Even, diffused lighting' },
        { id: 'neon', name: 'Neon Glow', description: 'Colorful neon effects' }
    ];

    const categories = [...new Set(mockupModels.map(model => model.category))];

    const generate3DMockup = async () => {
        if (!uploadedImage || !selectedModel) return;

        setIsProcessing(true);
        setProcessingText('Generating 3D mockup...');
        setProgress(0);

        // Simulate processing with realistic timing for 3D rendering
        const interval = setInterval(() => {
            setProgress(prev => {
                if (prev >= 85) {
                    clearInterval(interval);
                    return 85;
                }
                return prev + Math.random() * 8;
            });
        }, 600);

        try {
            const response = await fetch('/api/generate-3d-mockup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    image_base64: uploadedImage.split(',')[1],
                    model: selectedModel,
                    angle: selectedAngle,
                    lighting: lighting
                })
            });

            // Simulate completion
            setTimeout(() => {
                setProgress(100);
                setTimeout(() => {
                    setIsProcessing(false);
                    setProgress(0);
                }, 500);
            }, 4000);

        } catch (error) {
            console.error('3D mockup generation failed:', error);
            setIsProcessing(false);
            setProgress(0);
        }
    };

    return (
        <div className="space-y-6">
            {/* Model Categories */}
            <div>
                <h4 className="font-medium mb-3">Categories</h4>
                <div className="flex flex-wrap gap-2">
                    {categories.map(category => (
                        <button 
                            key={category}
                            className="px-3 py-1 bg-dark-bg border border-dark-border rounded-full text-sm hover:bg-gray-700 transition-colors"
                        >
                            {category}
                        </button>
                    ))}
                </div>
            </div>

            {/* Model Selection */}
            <div>
                <h4 className="font-medium mb-3">Select Mockup Model</h4>
                <div className="grid grid-cols-2 gap-3 max-h-64 overflow-y-auto">
                    {mockupModels.map(model => (
                        <div 
                            key={model.id}
                            onClick={() => setSelectedModel(model.id)}
                            className={`cursor-pointer rounded-lg border-2 transition-all ${
                                selectedModel === model.id 
                                    ? 'border-teal-500 bg-teal-500/10' 
                                    : 'border-dark-border hover:border-gray-500'
                            }`}
                        >
                            <img 
                                src={model.thumbnail} 
                                alt={model.name}
                                className="w-full h-20 object-cover rounded-t-lg"
                            />
                            <div className="p-2">
                                <div className="text-sm font-medium">{model.name}</div>
                                <div className="text-xs text-dark-text-secondary">{model.description}</div>
                                <div className="text-xs text-teal-500 mt-1">{model.category}</div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* View Angle */}
            <div>
                <h4 className="font-medium mb-3">View Angle</h4>
                <div className="space-y-2">
                    {viewAngles.map(angle => (
                        <label key={angle.id} className="flex items-center space-x-3 cursor-pointer">
                            <input 
                                type="radio" 
                                name="angle" 
                                value={angle.id}
                                checked={selectedAngle === angle.id}
                                onChange={(e) => setSelectedAngle(e.target.value)}
                                className="text-teal-500 focus:ring-teal-500"
                            />
                            <div>
                                <div className="text-sm font-medium">{angle.name}</div>
                                <div className="text-xs text-dark-text-secondary">{angle.description}</div>
                            </div>
                        </label>
                    ))}
                </div>
            </div>

            {/* Lighting */}
            <div>
                <h4 className="font-medium mb-3">Lighting</h4>
                <div className="space-y-2">
                    {lightingOptions.map(light => (
                        <label key={light.id} className="flex items-center space-x-3 cursor-pointer">
                            <input 
                                type="radio" 
                                name="lighting" 
                                value={light.id}
                                checked={lighting === light.id}
                                onChange={(e) => setLighting(e.target.value)}
                                className="text-teal-500 focus:ring-teal-500"
                            />
                            <div>
                                <div className="text-sm font-medium">{light.name}</div>
                                <div className="text-xs text-dark-text-secondary">{light.description}</div>
                            </div>
                        </label>
                    ))}
                </div>
            </div>

            {/* Advanced Options */}
            <div>
                <h4 className="font-medium mb-3">Advanced Options</h4>
                <div className="space-y-3">
                    <label className="flex items-center space-x-3 cursor-pointer">
                        <input 
                            type="checkbox" 
                            className="text-teal-500 focus:ring-teal-500"
                        />
                        <div>
                            <div className="text-sm font-medium">Add Shadows</div>
                            <div className="text-xs text-dark-text-secondary">Include realistic shadows</div>
                        </div>
                    </label>
                    
                    <label className="flex items-center space-x-3 cursor-pointer">
                        <input 
                            type="checkbox" 
                            className="text-teal-500 focus:ring-teal-500"
                        />
                        <div>
                            <div className="text-sm font-medium">Add Reflections</div>
                            <div className="text-xs text-dark-text-secondary">Surface reflections</div>
                        </div>
                    </label>

                    <label className="flex items-center space-x-3 cursor-pointer">
                        <input 
                            type="checkbox" 
                            className="text-teal-500 focus:ring-teal-500"
                        />
                        <div>
                            <div className="text-sm font-medium">High Resolution</div>
                            <div className="text-xs text-dark-text-secondary">4K output quality</div>
                        </div>
                    </label>
                </div>
            </div>

            {/* Generate Button */}
            <div>
                <button 
                    onClick={generate3DMockup}
                    disabled={!uploadedImage || !selectedModel}
                    className="w-full gradient-primary py-3 rounded-lg font-medium text-white hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <Icons.Box className="w-4 h-4 inline mr-2" />
                    Generate 3D Mockup
                </button>
            </div>

            {/* Tips */}
            <div className="bg-dark-bg border border-dark-border rounded-lg p-4">
                <h5 className="font-medium mb-2 text-teal-500">🎯 3D Mockup Tips</h5>
                <ul className="text-sm text-dark-text-secondary space-y-1">
                    <li>• Use high-resolution images for best results</li>
                    <li>• Images with transparent backgrounds work best</li>
                    <li>• Consider the aspect ratio of your design</li>
                    <li>• Studio lighting works well for product shots</li>
                </ul>
            </div>
        </div>
    );
};