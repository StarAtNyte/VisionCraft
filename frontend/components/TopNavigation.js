// Top Navigation Component - Simplified & Optimized
const TopNavigation = React.memo(({ uploadedImage, onLogoClick }) => {
    const downloadCurrentMedia = () => {
        if (uploadedImage) {
            const link = document.createElement('a');
            link.href = uploadedImage;
            
            // Determine file extension based on data type
            let filename = 'visioncraft-media';
            let extension = '.png'; // default
            
            if (uploadedImage.startsWith('data:video/')) {
                extension = '.mp4';
            } else if (uploadedImage.startsWith('data:image/png')) {
                extension = '.png';
            } else if (uploadedImage.startsWith('data:image/jpeg') || uploadedImage.startsWith('data:image/jpg')) {
                extension = '.jpg';
            } else if (uploadedImage.startsWith('data:image/webp')) {
                extension = '.webp';
            }
            
            link.download = filename + extension;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    };

    return (
        <header className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 bg-surface-light dark:bg-surface-dark">
            {/* Left: Clickable Brand */}
            <button 
                onClick={onLogoClick}
                className="text-xl font-bold text-text-light dark:text-text-dark hover:text-primary transition-colors cursor-pointer flex items-center space-x-2"
            >
                <span className="material-icons text-primary">auto_awesome</span>
                <span>VisionCraft</span>
            </button>
            
            {/* Center: Empty space */}
            <div></div>

            {/* Right: Download Button Only */}
            <div className="flex items-center">
                {uploadedImage && (
                    <button 
                        onClick={downloadCurrentMedia}
                        className="flex items-center space-x-2 px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
                    >
                        <span className="material-icons">download</span>
                        <span>Download</span>
                    </button>
                )}
            </div>
        </header>
    );
});