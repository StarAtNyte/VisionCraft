import modal
from typing import Dict, Any
import base64
import io
import torch
from PIL import Image

# Create Modal app
app = modal.App("wan-animate")

# Define the container image with WAN 2.2 I2V dependencies
image = (
    modal.Image.debian_slim(python_version="3.11")
    .apt_install([
        "git", 
        "libglib2.0-0",
        "libsm6", 
        "libxext6", 
        "libxrender-dev",
        "libgomp1",
        "ffmpeg"
    ])
    .pip_install([
        "torch>=2.4.0",
        "torchvision",
        "git+https://github.com/huggingface/diffusers.git",
        "transformers>=4.30.0",
        "accelerate>=0.20.0", 
        "Pillow>=9.0.0",
        "fastapi>=0.100.0",
        "uvicorn>=0.23.0",
        "sentencepiece",
        "opencv-python",
        "imageio[ffmpeg]",
        "numpy",
        "safetensors"
    ])
)

# Persistent volume for model caching
volume = modal.Volume.from_name("wan-animate-cache", create_if_missing=True)

@app.cls(
    image=image,
    gpu="A100-80GB",  # 80GB required for 14B model
    volumes={"/models": volume},
    timeout=900,
    container_idle_timeout=600,
    allow_concurrent_inputs=1,
    secrets=[modal.Secret.from_name("huggingface")],
    scaledown_window=1800,
)
class WanAnimate:
    
    @modal.enter()
    def load_model(self):
        """Load WAN 2.2 I2V 14B model using Diffusers"""
        import os
        from diffusers import WanImageToVideoPipeline
        
        # Set Hugging Face cache directory to the persistent volume
        os.environ['HF_HOME'] = '/models/huggingface'
        hf_token = os.getenv("HF_TOKEN")
        if not hf_token:
            raise ValueError("Hugging Face token not found. Please create a Modal secret named 'huggingface' with your token.")
        
        print("Loading WAN 2.2 I2V 14B model...")
        
        model_id = "Wan-AI/Wan2.2-I2V-A14B-Diffusers"
        dtype = torch.bfloat16
        
        try:
            # Load pipeline
            self.pipe = WanImageToVideoPipeline.from_pretrained(
                model_id,
                torch_dtype=dtype,
                cache_dir="/models/huggingface",
                token=hf_token
            )
            
            # Move the entire pipeline to the GPU
            self.pipe.to("cuda")
            
            print("WAN 2.2 I2V model loaded successfully!")
            
        except Exception as e:
            print(f"Error loading model: {e}")
            raise e
    
    @modal.method()
    def generate_video(
        self, 
        image_base64: str,
        prompt: str,
        category: str = "product",
        animation_style: str = "smooth_rotation",
        negative_prompt: str = None,
        height: int = 720,
        width: int = 1280,
        num_frames: int = 49,  # Reduced from 81 for faster generation
        guidance_scale: float = 3.5,
        num_inference_steps: int = 30,  # Reduced from 40 for faster generation
        seed: int = None
    ) -> Dict[str, Any]:
        """
        Generate animated video from product image using WAN 2.2 I2V
        
        Args:
            image_base64: Base64 encoded input image
            prompt: Base prompt for animation
            category: Product category for specialized prompts
            animation_style: Animation style to apply
            negative_prompt: Negative prompt for quality control
            height: Video height (720 recommended)
            width: Video width (1280 recommended) 
            num_frames: Number of frames to generate
            guidance_scale: How closely to follow the prompt
            num_inference_steps: Number of denoising steps
            seed: Random seed for reproducible results
            
        Returns:
            Dictionary with success status and video data (base64)
        """
        try:
            from diffusers.utils import export_to_video
            import tempfile
            import os
            
            # Decode input image
            image_data = base64.b64decode(image_base64)
            input_image = Image.open(io.BytesIO(image_data)).convert('RGB')
            
            # Create enhanced prompt based on category and animation style
            enhanced_prompt = self._create_enhanced_prompt(prompt, category, animation_style)
            
            # Set default negative prompt if not provided
            if negative_prompt is None:
                negative_prompt = "low quality, blurry, static, choppy motion, distorted, artifacts, pixelated, poor lighting"
            
            # Set up generator for reproducible results
            if seed is not None:
                generator = torch.Generator(device="cuda").manual_seed(seed)
            else:
                generator = None
            
            print(f"Generating video with prompt: {enhanced_prompt}")
            print(f"Settings: {width}x{height}, {num_frames} frames, {num_inference_steps} steps")
            
            # Generate video
            output = self.pipe(
                image=input_image,
                prompt=enhanced_prompt,
                negative_prompt=negative_prompt,
                height=height,
                width=width,
                num_frames=num_frames,
                guidance_scale=guidance_scale,
                num_inference_steps=num_inference_steps,
                generator=generator,
            ).frames[0]
            
            # Save video to temporary file
            with tempfile.NamedTemporaryFile(suffix='.mp4', delete=False) as temp_file:
                temp_path = temp_file.name
                
            # Export video with optimized settings
            export_to_video(output, temp_path, fps=16)
            
            # Read video file and convert to base64
            with open(temp_path, 'rb') as video_file:
                video_data = video_file.read()
                video_base64 = base64.b64encode(video_data).decode()
            
            # Clean up temporary file
            os.unlink(temp_path)
            
            return {
                "success": True,
                "video": video_base64,
                "message": "Video generated successfully",
                "prompt_used": enhanced_prompt,
                "settings": {
                    "resolution": f"{width}x{height}",
                    "frames": num_frames,
                    "fps": 16,
                    "guidance_scale": guidance_scale,
                    "steps": num_inference_steps
                }
            }
            
        except Exception as e:
            return {
                "success": False,
                "message": f"Error generating video: {str(e)}",
                "video": None
            }
    
    def _create_enhanced_prompt(self, base_prompt: str, category: str, animation_style: str) -> str:
        """Create enhanced prompt based on product category and animation style"""
        
        # Category-specific prompt enhancements
        category_prompts = {
            "product": "professional product showcase, studio lighting, clean background",
            "electronics": "sleek modern electronics, premium materials, high-tech aesthetic",
            "fashion": "stylish fashion photography, elegant presentation, premium quality",
            "jewelry": "luxury jewelry showcase, sparkling details, premium lighting",
            "cosmetics": "beauty product photography, elegant presentation, soft lighting",
            "furniture": "modern furniture showcase, interior design aesthetic, premium materials",
            "automotive": "automotive product showcase, sleek design, professional presentation",
            "food": "appetizing food presentation, fresh ingredients, culinary artistry",
            "sports": "dynamic sports equipment, athletic performance, energetic presentation",
            "lifestyle": "lifestyle product integration, modern living, aspirational presentation"
        }
        
        # Animation style descriptions
        animation_styles = {
            "smooth_rotation": "smooth 360-degree rotation, fluid camera movement, cinematic",
            "gentle_float": "gentle floating motion, ethereal movement, soft transitions",
            "dynamic_showcase": "dynamic product showcase, multiple angles, professional presentation",
            "lifestyle_scene": "lifestyle integration, environmental context, natural movement",
            "premium_reveal": "premium product reveal, dramatic lighting, luxury presentation",
            "tech_demo": "technology demonstration, interactive elements, modern aesthetic",
            "organic_flow": "organic flowing movement, natural transitions, smooth animation",
            "dramatic_lighting": "dramatic lighting changes, cinematic atmosphere, mood enhancement",
            "close_up_details": "detailed close-up shots, texture focus, premium quality reveal",
            "environmental_context": "environmental integration, contextual placement, story-driven"
        }
        
        # Build enhanced prompt
        category_enhancement = category_prompts.get(category, category_prompts["product"])
        style_enhancement = animation_styles.get(animation_style, animation_styles["smooth_rotation"])
        
        enhanced_prompt = f"{base_prompt}, {category_enhancement}, {style_enhancement}, high quality, professional, 4k resolution, smooth motion, commercial grade"
        
        return enhanced_prompt


@app.function(
    image=image.pip_install(["fastapi", "uvicorn"]),
)
@modal.concurrent(max_inputs=20)  # Reduced concurrency due to GPU requirements
@modal.asgi_app()
def web_app():
    """FastAPI web interface for WAN 2.2 I2V"""
    from fastapi import FastAPI, HTTPException, File, UploadFile, Form
    from fastapi.responses import HTMLResponse
    from pydantic import BaseModel
    import base64
    
    app_instance = FastAPI(title="WAN 2.2 I2V Animation API")
    
    class AnimationRequest(BaseModel):
        image_base64: str
        prompt: str = "smooth product animation"
        category: str = "product"
        animation_style: str = "smooth_rotation"
        negative_prompt: str = None
        height: int = 720
        width: int = 1280
        num_frames: int = 49
        guidance_scale: float = 3.5
        num_inference_steps: int = 30
        seed: int = None
    
    @app_instance.get("/", response_class=HTMLResponse)
    def home():
        return """
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>WAN 2.2 I2V Product Animation</title>
            <style>
                * { margin: 0; padding: 0; box-sizing: border-box; }
                body { 
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    min-height: 100vh;
                    padding: 20px;
                }
                .container {
                    max-width: 1400px;
                    margin: 0 auto;
                    background: white;
                    border-radius: 20px;
                    box-shadow: 0 20px 40px rgba(0,0,0,0.1);
                    overflow: hidden;
                }
                .header {
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    color: white;
                    padding: 30px;
                    text-align: center;
                }
                .header h1 { font-size: 2.5rem; margin-bottom: 10px; }
                .header p { opacity: 0.9; font-size: 1.1rem; }
                .content {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 30px;
                    padding: 30px;
                }
                .upload-section, .result-section {
                    background: #f8f9fa;
                    border-radius: 15px;
                    padding: 25px;
                }
                .form-group {
                    margin-bottom: 20px;
                }
                .form-group label {
                    display: block;
                    margin-bottom: 8px;
                    font-weight: 600;
                    color: #333;
                }
                .form-input, .form-textarea, .form-select {
                    width: 100%;
                    padding: 12px 15px;
                    border: 2px solid #e9ecef;
                    border-radius: 8px;
                    font-size: 14px;
                    transition: border-color 0.3s ease;
                }
                .form-input:focus, .form-textarea:focus, .form-select:focus {
                    outline: none;
                    border-color: #667eea;
                }
                .upload-area {
                    border: 2px dashed #667eea;
                    border-radius: 10px;
                    padding: 40px;
                    text-align: center;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    margin-bottom: 20px;
                }
                .upload-area:hover { 
                    border-color: #764ba2;
                    background: rgba(102, 126, 234, 0.05);
                }
                .upload-icon {
                    font-size: 3rem;
                    color: #667eea;
                    margin-bottom: 15px;
                }
                .file-input { display: none; }
                .preview-image {
                    max-width: 100%;
                    max-height: 200px;
                    border-radius: 10px;
                    margin: 15px 0;
                    box-shadow: 0 5px 15px rgba(0,0,0,0.1);
                }
                .generate-btn {
                    width: 100%;
                    padding: 15px;
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    color: white;
                    border: none;
                    border-radius: 10px;
                    font-size: 16px;
                    font-weight: 600;
                    cursor: pointer;
                    transition: transform 0.2s ease;
                }
                .generate-btn:hover { transform: translateY(-2px); }
                .generate-btn:disabled { opacity: 0.7; cursor: not-allowed; transform: none; }
                .loading {
                    text-align: center;
                    padding: 40px;
                    color: #666;
                }
                .spinner {
                    border: 3px solid #f3f3f3;
                    border-top: 3px solid #667eea;
                    border-radius: 50%;
                    width: 40px;
                    height: 40px;
                    animation: spin 1s linear infinite;
                    margin: 0 auto 15px;
                }
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
                .result-video {
                    max-width: 100%;
                    border-radius: 10px;
                    box-shadow: 0 5px 15px rgba(0,0,0,0.1);
                }
                .error {
                    color: #dc3545;
                    background: #f8d7da;
                    padding: 15px;
                    border-radius: 8px;
                    margin: 15px 0;
                }
                .success {
                    color: #155724;
                    background: #d4edda;
                    padding: 15px;
                    border-radius: 8px;
                    margin: 15px 0;
                }
                .download-btn {
                    display: inline-block;
                    padding: 10px 20px;
                    background: #28a745;
                    color: white;
                    text-decoration: none;
                    border-radius: 5px;
                    margin-top: 15px;
                }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>🎬 WAN 2.2 I2V Product Animation</h1>
                    <p>Transform your product images into stunning animated videos</p>
                </div>
                
                <div class="content">
                    <div class="upload-section">
                        <h3>Create Product Animation</h3>
                        
                        <div class="upload-area" onclick="document.getElementById('imageInput').click()">
                            <div class="upload-icon">🖼️</div>
                            <p>Click or drag product image here</p>
                            <small>Supports JPG, PNG, WEBP</small>
                        </div>
                        
                        <input type="file" id="imageInput" class="file-input" accept="image/*">
                        <img id="previewImage" class="preview-image" style="display: none;">
                        
                        <div class="form-group">
                            <label for="promptInput">Animation Description</label>
                            <textarea id="promptInput" class="form-textarea" 
                                placeholder="Describe your product animation (e.g., 'modern wireless headphones rotating smoothly')"
                                rows="3">smooth product showcase with elegant presentation</textarea>
                        </div>
                        
                        <div class="form-group">
                            <label for="categorySelect">Product Category</label>
                            <select id="categorySelect" class="form-select">
                                <option value="product">General Product</option>
                                <option value="electronics">Electronics</option>
                                <option value="fashion">Fashion & Apparel</option>
                                <option value="jewelry">Jewelry & Accessories</option>
                                <option value="cosmetics">Beauty & Cosmetics</option>
                                <option value="furniture">Furniture & Home</option>
                                <option value="automotive">Automotive</option>
                                <option value="food">Food & Beverages</option>
                                <option value="sports">Sports & Fitness</option>
                                <option value="lifestyle">Lifestyle Products</option>
                            </select>
                        </div>
                        
                        <div class="form-group">
                            <label for="styleSelect">Animation Style</label>
                            <select id="styleSelect" class="form-select">
                                <option value="smooth_rotation">Smooth 360° Rotation</option>
                                <option value="gentle_float">Gentle Floating Motion</option>
                                <option value="dynamic_showcase">Dynamic Multi-Angle</option>
                                <option value="lifestyle_scene">Lifestyle Integration</option>
                                <option value="premium_reveal">Premium Product Reveal</option>
                                <option value="tech_demo">Tech Demonstration</option>
                                <option value="organic_flow">Organic Flow Movement</option>
                                <option value="dramatic_lighting">Dramatic Lighting</option>
                                <option value="close_up_details">Close-up Details</option>
                                <option value="environmental_context">Environmental Context</option>
                            </select>
                        </div>
                        
                        <button id="generateBtn" class="generate-btn" disabled>
                            Generate Animation Video
                        </button>
                    </div>
                    
                    <div class="result-section">
                        <h3>Generated Animation</h3>
                        <div id="resultArea">
                            <p style="text-align: center; color: #666; padding: 40px;">
                                Upload a product image to create an animated video
                            </p>
                        </div>
                    </div>
                </div>
            </div>
            
            <script>
                let currentImage = null;
                
                const imageInput = document.getElementById('imageInput');
                const previewImage = document.getElementById('previewImage');
                const generateBtn = document.getElementById('generateBtn');
                const uploadArea = document.querySelector('.upload-area');
                
                // Drag and drop
                uploadArea.addEventListener('dragover', (e) => {
                    e.preventDefault();
                    uploadArea.classList.add('dragover');
                });
                
                uploadArea.addEventListener('dragleave', () => {
                    uploadArea.classList.remove('dragover');
                });
                
                uploadArea.addEventListener('drop', (e) => {
                    e.preventDefault();
                    uploadArea.classList.remove('dragover');
                    const files = e.dataTransfer.files;
                    if (files.length > 0) {
                        handleImageUpload(files[0]);
                    }
                });
                
                imageInput.addEventListener('change', (e) => {
                    if (e.target.files.length > 0) {
                        handleImageUpload(e.target.files[0]);
                    }
                });
                
                function handleImageUpload(file) {
                    if (!file.type.startsWith('image/')) {
                        alert('Please select an image file');
                        return;
                    }
                    
                    const reader = new FileReader();
                    reader.onload = (e) => {
                        currentImage = e.target.result.split(',')[1];
                        previewImage.src = e.target.result;
                        previewImage.style.display = 'block';
                        generateBtn.disabled = false;
                    };
                    reader.readAsDataURL(file);
                }
                
                // Generate video
                generateBtn.addEventListener('click', async () => {
                    const resultArea = document.getElementById('resultArea');
                    
                    resultArea.innerHTML = `
                        <div class="loading">
                            <div class="spinner"></div>
                            <p>Creating your animated video...</p>
                            <small>This may take 2-5 minutes</small>
                        </div>
                    `;
                    
                    try {
                        const response = await fetch('/generate', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                image_base64: currentImage,
                                prompt: document.getElementById('promptInput').value,
                                category: document.getElementById('categorySelect').value,
                                animation_style: document.getElementById('styleSelect').value
                            })
                        });
                        
                        const result = await response.json();
                        
                        if (result.success) {
                            resultArea.innerHTML = `
                                <div class="success">Animation generated successfully!</div>
                                <video controls class="result-video">
                                    <source src="data:video/mp4;base64,${result.video}" type="video/mp4">
                                    Your browser does not support the video tag.
                                </video>
                                <a href="data:video/mp4;base64,${result.video}" download="product-animation.mp4" class="download-btn">
                                    📥 Download Video
                                </a>
                                <div style="margin-top: 15px; font-size: 12px; color: #666;">
                                    <strong>Settings:</strong> ${result.settings.resolution}, ${result.settings.frames} frames, ${result.settings.fps} fps
                                </div>
                            `;
                        } else {
                            resultArea.innerHTML = `
                                <div class="error">
                                    <strong>Error:</strong> ${result.message}
                                </div>
                            `;
                        }
                    } catch (error) {
                        resultArea.innerHTML = `
                            <div class="error">
                                <strong>Network Error:</strong> ${error.message}
                            </div>
                        `;
                    }
                });
            </script>
        </body>
        </html>
        """
    
    @app_instance.post("/generate")
    async def generate(request: AnimationRequest):
        """Generate animated video using WAN 2.2 I2V"""
        try:
            wan_animate = WanAnimate()
            result = wan_animate.generate_video.remote(
                image_base64=request.image_base64,
                prompt=request.prompt,
                category=request.category,
                animation_style=request.animation_style,
                negative_prompt=request.negative_prompt,
                height=request.height,
                width=request.width,
                num_frames=request.num_frames,
                guidance_scale=request.guidance_scale,
                num_inference_steps=request.num_inference_steps,
                seed=request.seed
            )
            return result
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))
    
    @app_instance.get("/health")
    def health_check():
        return {"status": "healthy", "service": "WAN 2.2 I2V Animation API"}
    
    return app_instance


@app.local_entrypoint()
def main():
    """CLI interface for WAN 2.2 I2V"""
    import argparse
    import base64
    from pathlib import Path
    
    parser = argparse.ArgumentParser(description="WAN 2.2 I2V Product Animation")
    parser.add_argument("--image", required=True, help="Input image path")
    parser.add_argument("--prompt", default="smooth product showcase", help="Animation prompt")
    parser.add_argument("--category", default="product", help="Product category")
    parser.add_argument("--style", default="smooth_rotation", help="Animation style")
    parser.add_argument("--output", help="Output video path")
    parser.add_argument("--frames", type=int, default=49, help="Number of frames")
    parser.add_argument("--steps", type=int, default=30, help="Inference steps")
    
    args = parser.parse_args()
    
    # Read image
    image_path = Path(args.image)
    with open(image_path, 'rb') as f:
        image_base64 = base64.b64encode(f.read()).decode()
    
    # Generate animation
    wan_animate = WanAnimate()
    result = wan_animate.generate_video.remote(
        image_base64=image_base64,
        prompt=args.prompt,
        category=args.category,
        animation_style=args.style,
        num_frames=args.frames,
        num_inference_steps=args.steps
    )
    
    if result["success"]:
        output_path = args.output or f"{image_path.stem}_animated.mp4"
        with open(output_path, 'wb') as f:
            f.write(base64.b64decode(result["video"]))
        print(f"✅ Animated video saved to: {output_path}")
        print(f"📊 Settings: {result['settings']}")
    else:
        print(f"❌ {result['message']}")