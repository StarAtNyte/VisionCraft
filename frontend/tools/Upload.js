// Upload Panel
const UploadPanel = ({ setUploadedImage }) => {
    const fileInputRef = React.useRef(null);
    const [urlInput, setUrlInput] = React.useState('');

    const handleFileUpload = (file) => {
        if (file && file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = (e) => {
                setUploadedImage(e.target.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleUrlUpload = async () => {
        if (!urlInput) return;
        
        try {
            // In a real app, you'd proxy this through your backend to avoid CORS issues
            const response = await fetch(urlInput);
            const blob = await response.blob();
            const reader = new FileReader();
            reader.onload = (e) => {
                setUploadedImage(e.target.result);
                setUrlInput('');
            };
            reader.readAsDataURL(blob);
        } catch (error) {
            console.error('Failed to load image from URL:', error);
        }
    };

    const handleCameraCapture = () => {
        // In a real app, this would open camera interface
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
            navigator.mediaDevices.getUserMedia({ video: true })
                .then(stream => {
                    // Handle camera stream
                    console.log('Camera access granted');
                })
                .catch(err => {
                    console.error('Camera access denied:', err);
                });
        }
    };

    return (
        <div className="space-y-6">
            {/* Upload Options */}
            <div>
                <h4 className="font-medium mb-3">Upload Options</h4>
                <div className="space-y-3">
                    <button 
                        onClick={() => fileInputRef.current?.click()}
                        className="w-full p-3 bg-dark-bg border border-dark-border rounded-lg hover:bg-gray-700 transition-colors text-left"
                    >
                        <div className="flex items-center space-x-3">
                            <Icons.Upload className="w-5 h-5 text-teal-500" />
                            <div>
                                <div className="font-medium">From Computer</div>
                                <div className="text-sm text-dark-text-secondary">Upload from your device</div>
                            </div>
                        </div>
                    </button>
                    
                    <button 
                        onClick={handleCameraCapture}
                        className="w-full p-3 bg-dark-bg border border-dark-border rounded-lg hover:bg-gray-700 transition-colors text-left"
                    >
                        <div className="flex items-center space-x-3">
                            <Icons.Camera className="w-5 h-5 text-teal-500" />
                            <div>
                                <div className="font-medium">From Camera</div>
                                <div className="text-sm text-dark-text-secondary">Take a photo directly</div>
                            </div>
                        </div>
                    </button>
                </div>
            </div>

            {/* URL Upload */}
            <div>
                <h4 className="font-medium mb-3">From URL</h4>
                <div className="space-y-2">
                    <input 
                        type="url" 
                        value={urlInput}
                        onChange={(e) => setUrlInput(e.target.value)}
                        placeholder="Paste image URL here..."
                        className="w-full p-3 bg-dark-bg border border-dark-border rounded-lg focus:border-teal-500 focus:outline-none"
                    />
                    <button 
                        onClick={handleUrlUpload}
                        disabled={!urlInput}
                        className="w-full py-2 gradient-primary rounded-lg font-medium text-white hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Load from URL
                    </button>
                </div>
            </div>

            {/* File Format Support */}
            <div>
                <h4 className="font-medium mb-3">Supported Formats</h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                    {['JPG', 'PNG', 'WebP', 'GIF', 'BMP', 'TIFF'].map(format => (
                        <div key={format} className="flex items-center space-x-2">
                            <div className="w-2 h-2 bg-teal-500 rounded-full"></div>
                            <span>{format}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Upload Guidelines */}
            <div className="bg-dark-bg border border-dark-border rounded-lg p-4">
                <h5 className="font-medium mb-2 text-teal-500">📋 Upload Guidelines</h5>
                <ul className="text-sm text-dark-text-secondary space-y-1">
                    <li>• Maximum file size: 10MB</li>
                    <li>• Recommended resolution: 1024x1024px or higher</li>
                    <li>• For best results, use high-quality images</li>
                    <li>• Products with clear backgrounds work best</li>
                </ul>
            </div>

            {/* Recent Uploads */}
            <div>
                <h4 className="font-medium mb-3">Recent Uploads</h4>
                <div className="text-sm text-dark-text-secondary text-center py-4">
                    No recent uploads
                </div>
            </div>

            <input 
                ref={fileInputRef}
                type="file" 
                accept="image/*" 
                onChange={(e) => e.target.files[0] && handleFileUpload(e.target.files[0])}
                className="hidden"
            />
        </div>
    );
};