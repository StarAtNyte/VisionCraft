// Top Navigation Component - ProductGenius Style
const TopNavigation = ({ uploadedImage }) => {
    const saveImage = () => {
        if (uploadedImage) {
            const link = document.createElement('a');
            link.href = uploadedImage;
            link.download = 'visioncraft-image.png';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    };

    return (
        <header className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 bg-surface-light dark:bg-surface-dark">
            {/* Left: Brand */}
            <h1 className="text-xl font-bold text-text-light dark:text-text-dark">VisionCraft</h1>
            
            {/* Center: Upload and Search */}
            <div className="flex items-center space-x-4">
                <button className="flex items-center space-x-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium hover:bg-gray-100 dark:hover:bg-gray-700">
                    <span className="material-icons">upload_file</span>
                    <span>Upload Image</span>
                </button>
                <div className="relative">
                    <span className="material-icons absolute left-3 top-1/2 -translate-y-1/2 text-subtle-light dark:text-subtle-dark">search</span>
                    <input 
                        className="bg-gray-100 dark:bg-gray-800 border-none rounded-lg pl-10 pr-4 py-2 text-sm w-64 focus:ring-primary focus:border-primary" 
                        placeholder="Search..." 
                        type="text"
                    />
                </div>
            </div>

            {/* Right: Actions */}
            <div className="flex items-center space-x-4">
                {uploadedImage && (
                    <button 
                        onClick={saveImage}
                        className="flex items-center space-x-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                        <span className="material-icons">download</span>
                        <span>Download</span>
                    </button>
                )}
                <button className="px-4 py-2 bg-primary/10 text-primary dark:bg-primary/20 rounded-lg text-sm font-medium hover:bg-primary/20 dark:hover:bg-primary/30">
                    Free Trial
                </button>
                <button className="px-4 py-2 text-sm font-medium text-text-light dark:text-text-dark hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                    Log In
                </button>
                <button className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary/90">
                    Sign Up
                </button>
            </div>
        </header>
    );
};