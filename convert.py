import cv2
import numpy as np
import math

def cylindrical_to_equirectangular(img, output_width=4096, output_height=2048):
    """
    Convert cylindrical panorama to equirectangular projection
    """
    h, w = img.shape[:2]
    
    # Create output image
    equirect = np.zeros((output_height, output_width, 3), dtype=np.uint8)
    
    # Create coordinate maps
    for y in range(output_height):
        for x in range(output_width):
            # Convert equirectangular coordinates to spherical
            theta = (x / output_width) * 2 * math.pi - math.pi  # longitude: -π to π
            phi = (y / output_height) * math.pi - math.pi/2     # latitude: -π/2 to π/2
            
            # Convert spherical to cylindrical coordinates
            # For cylindrical projection, we map longitude directly and latitude to height
            src_x = (theta + math.pi) / (2 * math.pi) * w  # Map longitude to width
            src_y = (phi + math.pi/2) / math.pi * h        # Map latitude to height
            
            # Clamp coordinates
            src_x = max(0, min(w-1, src_x))
            src_y = max(0, min(h-1, src_y))
            
            # Bilinear interpolation
            x1, x2 = int(src_x), min(int(src_x) + 1, w-1)
            y1, y2 = int(src_y), min(int(src_y) + 1, h-1)
            
            dx, dy = src_x - x1, src_y - y1
            
            # Interpolate
            pixel = (1-dx) * (1-dy) * img[y1, x1] + \
                   dx * (1-dy) * img[y1, x2] + \
                   (1-dx) * dy * img[y2, x1] + \
                   dx * dy * img[y2, x2]
            
            equirect[y, x] = pixel.astype(np.uint8)
    
    return equirect

def perspective_to_equirectangular(img, fov_h=120, fov_v=60, output_width=4096, output_height=2048):
    """
    Convert perspective/rectilinear panorama to equirectangular
    Better for images that are not full cylindrical panoramas
    """
    h, w = img.shape[:2]
    
    # Convert FOV to radians
    fov_h_rad = math.radians(fov_h)
    fov_v_rad = math.radians(fov_v)
    
    # Create output image
    equirect = np.zeros((output_height, output_width, 3), dtype=np.uint8)
    
    # Center of the input image
    cx, cy = w // 2, h // 2
    
    # Focal lengths
    fx = w / (2 * math.tan(fov_h_rad / 2))
    fy = h / (2 * math.tan(fov_v_rad / 2))
    
    for y in range(output_height):
        for x in range(output_width):
            # Equirectangular coordinates to spherical
            longitude = (x / output_width) * 2 * math.pi - math.pi
            latitude = math.pi/2 - (y / output_height) * math.pi
            
            # Spherical to Cartesian
            X = math.cos(latitude) * math.sin(longitude)
            Y = math.sin(latitude)
            Z = math.cos(latitude) * math.cos(longitude)
            
            # Project to perspective plane
            if Z > 0:  # Point is in front of camera
                src_x = fx * (X / Z) + cx
                src_y = fy * (-Y / Z) + cy
                
                # Check if point is within image bounds
                if 0 <= src_x < w and 0 <= src_y < h:
                    # Bilinear interpolation
                    x1, x2 = int(src_x), min(int(src_x) + 1, w-1)
                    y1, y2 = int(src_y), min(int(src_y) + 1, h-1)
                    
                    dx, dy = src_x - x1, src_y - y1
                    
                    pixel = (1-dx) * (1-dy) * img[y1, x1] + \
                           dx * (1-dy) * img[y1, x2] + \
                           (1-dx) * dy * img[y2, x1] + \
                           dx * dy * img[y2, x2]
                    
                    equirect[y, x] = pixel.astype(np.uint8)
    
    return equirect

def advanced_remap_conversion(img, output_width=4096, output_height=2048):
    """
    More efficient conversion using OpenCV's remap function
    """
    h, w = img.shape[:2]
    
    # Create mapping arrays
    map_x = np.zeros((output_height, output_width), dtype=np.float32)
    map_y = np.zeros((output_height, output_width), dtype=np.float32)
    
    for y in range(output_height):
        for x in range(output_width):
            # Equirectangular to spherical coordinates
            theta = (x / output_width) * 2 * math.pi - math.pi
            phi = (y / output_height) * math.pi - math.pi/2
            
            # Assuming input is cylindrical panorama
            # Map to source coordinates
            src_x = (theta + math.pi) / (2 * math.pi) * w
            src_y = (phi + math.pi/2) / math.pi * h
            
            map_x[y, x] = src_x
            map_y[y, x] = src_y
    
    # Apply remapping with interpolation
    equirect = cv2.remap(img, map_x, map_y, cv2.INTER_LINEAR)
    
    return equirect

def main():
    # Load your panoramic image
    img_path = "your_panorama.jpg"  # Replace with your image path
    img = cv2.imread(img_path)
    
    if img is None:
        print("Error: Could not load image")
        return
    
    print(f"Input image size: {img.shape}")
    
    # Method 1: Fast remap conversion (recommended)
    print("Converting using remap method...")
    equirect1 = advanced_remap_conversion(img, 4096, 2048)
    cv2.imwrite("equirectangular_remap.jpg", equirect1)
    
    # Method 2: Cylindrical to equirectangular
    print("Converting from cylindrical...")
    equirect2 = cylindrical_to_equirectangular(img, 2048, 1024)  # Smaller for speed
    cv2.imwrite("equirectangular_cylindrical.jpg", equirect2)
    
    # Method 3: Perspective to equirectangular (if your image is more perspective-like)
    print("Converting from perspective...")
    equirect3 = perspective_to_equirectangular(img, fov_h=120, fov_v=60, 
                                             output_width=2048, output_height=1024)
    cv2.imwrite("equirectangular_perspective.jpg", equirect3)
    
    print("Conversion complete! Check the output files.")
    
    # Display results (optional)
    cv2.imshow("Original", cv2.resize(img, (800, 400)))
    cv2.imshow("Equirectangular", cv2.resize(equirect1, (800, 400)))
    cv2.waitKey(0)
    cv2.destroyAllWindows()

if __name__ == "__main__":
    main()