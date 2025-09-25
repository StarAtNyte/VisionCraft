// Sidebar Component - ProductGenius Style (Optimized)
const Sidebar = React.memo(({ tools, activeToolId, onToolClick }) => {
    // Icon mapping for Material Icons
    const iconMap = {
        'upload': 'arrow_forward_ios',
        'shots': 'crop_free',
        'lifestyle': 'person',
        'animation': 'play_arrow',
        '3d': 'view_in_ar'
    };

    return (
        <aside className="w-16 bg-surface-light dark:bg-surface-dark flex flex-col items-center py-4 space-y-4 border-r border-gray-200 dark:border-gray-700">
            {/* Logo */}
            <div className="flex items-center justify-center h-10 w-10 bg-primary rounded-lg text-white">
                <span className="material-icons">auto_awesome</span>
            </div>
            
            {/* Navigation */}
            <nav className="flex flex-col items-center space-y-2">
                {tools.map((tool, index) => {
                    const isActive = activeToolId === tool.id;
                    const iconName = iconMap[tool.id] || 'edit';
                    
                    return (
                        <button 
                            key={tool.id}
                            onClick={() => onToolClick(tool.id)}
                            className={`p-3 rounded-lg relative transition-colors ${
                                isActive 
                                    ? 'bg-primary/10 text-primary dark:bg-primary/20' 
                                    : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                            }`}
                        >
                            <span className="material-icons">{iconName}</span>
                        </button>
                    );
                })}
            </nav>
        </aside>
    );
});