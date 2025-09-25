// AI Edits Panel (Optimized)
const AIEditsPanel = React.memo(({ uploadedImage, setUploadedImage, setIsProcessing, setProcessingText, setProgress }) => {
    const { useState } = React;
    const [prompt, setPrompt] = useState('');
    const [selectedPreset, setSelectedPreset] = useState(null);
    const [strength, setStrength] = useState(75);

    const aiPresets = [
        {
            id: 'enhance',
            name: 'Enhance Quality',
            description: 'Improve image sharpness and clarity',
            icon: Icons.Sparkles,
            prompt: 'enhance image quality, sharpen details, improve clarity'
        },
        {
            id: 'background-remove',
            name: 'Remove Background',
            description: 'Create transparent background',
            icon: Icons.Crop,
            prompt: 'remove background, transparent background'
        },
        {
            id: 'lighting',
            name: 'Fix Lighting',
            description: 'Improve lighting and shadows',
            icon: Icons.Sparkles,
            prompt: 'improve lighting, fix shadows, enhance illumination'
        },
        {
            id: 'upscale',
            name: 'Upscale 2x',
            description: 'Double image resolution',
            icon: Icons.Plus,
            prompt: 'upscale image, increase resolution, enhance details'
        },
        {
            id: 'style-transfer',
            name: 'Style Transfer',
            description: 'Apply artistic styles',
            icon: Icons.Palette,
            prompt: 'apply artistic style, creative transformation'
        },
        {
            id: 'color-correction',
            name: 'Color Correction',
            description: 'Auto-adjust colors',
            icon: Icons.Sliders,
            prompt: 'color correction, auto-adjust colors, balance exposure'
        }
    ];

    const selectPreset = (preset) => {
        setSelectedPreset(preset.id);
        setPrompt(preset.prompt);
    };

    const generateAIEdit = async () => {
        if (!uploadedImage || (!prompt && !selectedPreset)) return;

        setIsProcessing(true);
        setProcessingText('AI is processing your image...');
        setProgress(0);

        // Set initial progress without interval
        setProgress(10);

        try {
            const imageBase64 = uploadedImage.split(',')[1] || uploadedImage;
            
            // Apply preset modifications to the prompt
            let finalPrompt = prompt;
            if (selectedPreset !== 'custom') {
                const presetPrompts = {
                    'enhance': `Enhance and improve the image quality: ${prompt}. Professional photography, high resolution, enhanced details`,
                    'recolor': `Change colors and recolor the image: ${prompt}. Maintain original composition and structure`,
                    'style': `Apply artistic style transformation: ${prompt}. Creative styling while preserving main subject`,
                    'background': `Modify or change the background: ${prompt}. Keep the main subject intact`,
                    'lighting': `Adjust lighting and atmosphere: ${prompt}. Professional lighting, enhanced mood`
                };
                finalPrompt = presetPrompts[selectedPreset] || prompt;
            }
            
            const response = await fetch('/api/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    image_base64: imageBase64,
                    prompt: finalPrompt,
                    guidance_scale: 7.0 + (strength / 100) * 3.0, // Scale guidance based on strength
                    num_inference_steps: 25
                })
            });

            setProgress(50);
            
            if (response.ok) {
                const result = await response.json();
                if (result.success) {
                    setProgress(90);
                    setUploadedImage(`data:image/png;base64,${result.image}`);
                    setProgress(100);
                    setTimeout(() => {
                        setIsProcessing(false);
                        setProgress(0);
                    }, 500);
                } else {
                    throw new Error(result.message || 'AI edit failed');
                }
            } else {
                throw new Error('Network error');
            }

        } catch (error) {
            console.error('AI edit failed:', error);
            setIsProcessing(false);
            setProgress(0);
        }
    };

    return (
        <div className="space-y-6">
            {/* AI Presets */}
            <div>
                <h4 className="font-medium mb-3">Quick Actions</h4>
                <div className="grid grid-cols-1 gap-2">
                    {aiPresets.map(preset => (
                        <button 
                            key={preset.id}
                            onClick={() => selectPreset(preset)}
                            className={`p-3 rounded-lg border-2 transition-all text-left ${
                                selectedPreset === preset.id 
                                    ? 'border-teal-500 bg-teal-500/10' 
                                    : 'border-dark-border bg-dark-bg hover:border-gray-500 hover:bg-gray-700'
                            }`}
                        >
                            <div className="flex items-center space-x-3">
                                <preset.icon className="w-5 h-5 text-teal-500" />
                                <div>
                                    <div className="font-medium text-sm">{preset.name}</div>
                                    <div className="text-xs text-dark-text-secondary">{preset.description}</div>
                                </div>
                            </div>
                        </button>
                    ))}
                </div>
            </div>

            {/* Custom Prompt */}
            <div>
                <h4 className="font-medium mb-3">Custom Prompt</h4>
                <textarea 
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="Describe what you want to change about the image..."
                    className="w-full h-24 px-3 py-2 bg-dark-bg border border-dark-border rounded-lg focus:border-teal-500 focus:outline-none resize-none text-sm"
                />
                <div className="text-xs text-dark-text-secondary mt-1">
                    Be specific about the changes you want to make
                </div>
            </div>

            {/* Strength Control */}
            <div>
                <h4 className="font-medium mb-3">Effect Strength</h4>
                <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                        <span>Subtle</span>
                        <span>{strength}%</span>
                        <span>Strong</span>
                    </div>
                    <input 
                        type="range" 
                        min="10" 
                        max="100" 
                        value={strength}
                        onChange={(e) => setStrength(e.target.value)}
                        className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                    />
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
                            <div className="text-sm font-medium">Preserve Original Colors</div>
                            <div className="text-xs text-dark-text-secondary">Keep the original color palette</div>
                        </div>
                    </label>
                    
                    <label className="flex items-center space-x-3 cursor-pointer">
                        <input 
                            type="checkbox" 
                            className="text-teal-500 focus:ring-teal-500"
                        />
                        <div>
                            <div className="text-sm font-medium">High Quality Mode</div>
                            <div className="text-xs text-dark-text-secondary">Slower but better results</div>
                        </div>
                    </label>
                </div>
            </div>

            {/* Generate Button */}
            <div>
                <button 
                    onClick={generateAIEdit}
                    disabled={!uploadedImage || (!prompt && !selectedPreset)}
                    className="w-full gradient-primary py-3 rounded-lg font-medium text-white hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <Icons.Wand2 className="w-4 h-4 inline mr-2" />
                    Generate AI Edit
                </button>
            </div>

            {/* Example Prompts */}
            <div className="bg-dark-bg border border-dark-border rounded-lg p-4">
                <h5 className="font-medium mb-2 text-teal-500">✨ Example Prompts</h5>
                <div className="space-y-2 text-sm text-dark-text-secondary">
                    <div className="cursor-pointer hover:text-white transition-colors" onClick={() => setPrompt('make the background white and clean')}>
                        • "make the background white and clean"
                    </div>
                    <div className="cursor-pointer hover:text-white transition-colors" onClick={() => setPrompt('add professional studio lighting')}>
                        • "add professional studio lighting"
                    </div>
                    <div className="cursor-pointer hover:text-white transition-colors" onClick={() => setPrompt('remove all shadows and reflections')}>
                        • "remove all shadows and reflections"
                    </div>
                    <div className="cursor-pointer hover:text-white transition-colors" onClick={() => setPrompt('make the product look more premium and luxurious')}>
                        • "make the product look more premium and luxurious"
                    </div>
                </div>
            </div>
        </div>
    );
}, (prevProps, nextProps) => {
    return (
        prevProps.uploadedImage === nextProps.uploadedImage &&
        prevProps.setUploadedImage === nextProps.setUploadedImage &&
        prevProps.setIsProcessing === nextProps.setIsProcessing &&
        prevProps.setProcessingText === nextProps.setProcessingText &&
        prevProps.setProgress === nextProps.setProgress
    );
});