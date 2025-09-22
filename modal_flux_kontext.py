import modal
from typing import Dict, Any
import base64
import io
from PIL import Image

# Create Modal app
app = modal.App("flux-kontext")

# Define the container image
image = (
    modal.Image.debian_slim(python_version="3.11")
    .apt_install([
        "git"
    ])
    .pip_install([
        "torch>=2.0.0",
        "git+https://github.com/huggingface/diffusers.git",
        "transformers>=4.30.0",
        "accelerate>=0.20.0", 
        "Pillow>=9.0.0",
        "torchao>=0.1.0",
        "fastapi>=0.100.0",
        "uvicorn>=0.23.0",
        "sentencepiece",
    ])
)

# Persistent volume for model caching
volume = modal.Volume.from_name("flux-kontext-cache", create_if_missing=True)

@app.cls(
    image=image,
    gpu="A100-40GB",
    volumes={"/models": volume},
    timeout=600,
    scaledown_window=300,
    secrets=[modal.Secret.from_name("huggingface")]
)
class FluxKontext:
    
    @modal.enter()
    def load_model(self):
        """Load FLUX.1-Kontext model"""
        import torch
        from diffusers import FluxKontextPipeline, FluxTransformer2DModel
        from torchao.quantization import quantize_, int8_weight_only
        import os
        
        # Set cache directory
        os.environ['HF_HOME'] = '/models/huggingface'
        
        print("Loading FLUX.1-Kontext model...")
        
        # Load transformer with quantization
        transformer = FluxTransformer2DModel.from_pretrained(
            "black-forest-labs/FLUX.1-Kontext-dev",
            subfolder="transformer",
            torch_dtype=torch.bfloat16,
            cache_dir="/models/huggingface",
            token=os.getenv("HF_TOKEN")
        )
        
        quantize_(transformer, int8_weight_only())
        
        # Load pipeline
        self.pipe = FluxKontextPipeline.from_pretrained(
            "black-forest-labs/FLUX.1-Kontext-dev",
            transformer=transformer,
            torch_dtype=torch.bfloat16,
            cache_dir="/models/huggingface",
            token=os.getenv("HF_TOKEN")
        )
        
        self.pipe.enable_model_cpu_offload()
        
        print("Model loaded successfully!")
    
    @modal.method()
    def generate(
        self, 
        prompt: str,
        image_base64: str = None,
        guidance_scale: float = 3.5,
        num_inference_steps: int = 28,
        width: int = 1024,
        height: int = 1024
    ) -> Dict[str, Any]:
        """
        Generate or edit image with FLUX.1-Kontext
        
        Args:
            prompt: Text prompt for image generation/editing
            image_base64: Base64 encoded input image (optional - if None, generates from text)
            guidance_scale: How closely to follow the prompt (1.0-5.0)
            num_inference_steps: Number of denoising steps
            width: Width for text-to-image generation
            height: Height for text-to-image generation
            
        Returns:
            Dictionary with success status and output image (base64)
        """
        try:
            if image_base64:
                # Image-to-image editing mode
                image_data = base64.b64decode(image_base64)
                input_image = Image.open(io.BytesIO(image_data)).convert('RGB')
                
                result = self.pipe(
                    image=input_image,
                    prompt=prompt,
                    guidance_scale=guidance_scale,
                    num_inference_steps=num_inference_steps,
                    height=input_image.height,
                    width=input_image.width
                )
            else:
                # Text-to-image generation mode
                result = self.pipe(
                    prompt=prompt,
                    guidance_scale=guidance_scale,
                    num_inference_steps=num_inference_steps,
                    height=height,
                    width=width
                )
            
            # Convert output to base64
            buffer = io.BytesIO()
            result.images[0].save(buffer, format='PNG')
            output_base64 = base64.b64encode(buffer.getvalue()).decode()
            
            return {
                "success": True,
                "image": output_base64,
                "message": "Image generated successfully"
            }
            
        except Exception as e:
            return {
                "success": False,
                "message": f"Error: {str(e)}",
                "image": None
            }


@app.function(
    image=image.pip_install(["fastapi", "uvicorn"]),
)
@modal.concurrent(max_inputs=50)
@modal.asgi_app()
def web_app():
    """FastAPI web interface"""
    from fastapi import FastAPI, HTTPException, File, UploadFile, Form
    from fastapi.responses import HTMLResponse
    from pydantic import BaseModel
    import base64
    
    app_instance = FastAPI(title="FLUX.1-Kontext API")
    
    class GenerateRequest(BaseModel):
        prompt: str
        image_base64: str = None  # Optional for text-to-image
        guidance_scale: float = 3.5
        num_inference_steps: int = 28
        width: int = 1024
        height: int = 1024
    
    @app_instance.get("/", response_class=HTMLResponse)
    def home():
        return """
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>FLUX.1-Kontext Image Editor</title>
            <style>
                * { margin: 0; padding: 0; box-sizing: border-box; }
                body { 
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    min-height: 100vh;
                    padding: 20px;
                }
                .container {
                    max-width: 1200px;
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
                .upload-area.dragover {
                    border-color: #764ba2;
                    background: rgba(102, 126, 234, 0.1);
                }
                .upload-icon {
                    font-size: 3rem;
                    color: #667eea;
                    margin-bottom: 15px;
                }
                .file-input {
                    display: none;
                }
                .preview-image {
                    max-width: 100%;
                    max-height: 300px;
                    border-radius: 10px;
                    margin: 15px 0;
                    box-shadow: 0 5px 15px rgba(0,0,0,0.1);
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
                .form-input, .form-textarea {
                    width: 100%;
                    padding: 12px 15px;
                    border: 2px solid #e9ecef;
                    border-radius: 8px;
                    font-size: 14px;
                    transition: border-color 0.3s ease;
                }
                .form-input:focus, .form-textarea:focus {
                    outline: none;
                    border-color: #667eea;
                }
                .form-textarea {
                    resize: vertical;
                    min-height: 80px;
                }
                .slider-group {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 15px;
                }
                .slider-container {
                    display: flex;
                    flex-direction: column;
                }
                .slider {
                    width: 100%;
                    margin: 8px 0;
                }
                .slider-value {
                    font-size: 12px;
                    color: #666;
                    text-align: center;
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
                .generate-btn:hover {
                    transform: translateY(-2px);
                }
                .generate-btn:disabled {
                    opacity: 0.7;
                    cursor: not-allowed;
                    transform: none;
                }
                .result-image {
                    max-width: 100%;
                    border-radius: 10px;
                    box-shadow: 0 5px 15px rgba(0,0,0,0.1);
                }
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
                @media (max-width: 768px) {
                    .content {
                        grid-template-columns: 1fr;
                        gap: 20px;
                        padding: 20px;
                    }
                    .header h1 { font-size: 2rem; }
                    .slider-group { grid-template-columns: 1fr; }
                }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>🎨 FLUX.1-Kontext</h1>
                    <p>Transform your images with AI-powered text prompts</p>
                </div>
                
                <div class="content">
                    <div class="upload-section">
                        <h3>Upload & Configure</h3>
                        
                        <div class="upload-area" onclick="document.getElementById('imageInput').click()">
                            <div class="upload-icon">📁</div>
                            <p>Click or drag an image here</p>
                            <small>Supports JPG, PNG, WEBP</small>
                        </div>
                        
                        <input type="file" id="imageInput" class="file-input" accept="image/*">
                        <img id="previewImage" class="preview-image" style="display: none;">
                        
                        <div class="form-group">
                            <label for="promptInput">Editing Prompt</label>
                            <textarea id="promptInput" class="form-textarea" 
                                placeholder="Describe how you want to transform the image..."
                                required></textarea>
                        </div>
                        
                        <div class="slider-group">
                            <div class="slider-container">
                                <label for="guidanceScale">Guidance Scale</label>
                                <input type="range" id="guidanceScale" class="slider" 
                                       min="1" max="5" step="0.1" value="3.5">
                                <div class="slider-value" id="guidanceValue">3.5</div>
                            </div>
                            
                            <div class="slider-container">
                                <label for="inferenceSteps">Inference Steps</label>
                                <input type="range" id="inferenceSteps" class="slider" 
                                       min="10" max="50" step="1" value="28">
                                <div class="slider-value" id="stepsValue">28</div>
                            </div>
                        </div>
                        
                        <button id="generateBtn" class="generate-btn" disabled>
                            Generate Image
                        </button>
                    </div>
                    
                    <div class="result-section">
                        <h3>Result</h3>
                        <div id="resultArea">
                            <p style="text-align: center; color: #666; padding: 40px;">
                                Upload an image and enter a prompt to get started
                            </p>
                        </div>
                    </div>
                </div>
            </div>
            
            <script>
                let currentImage = null;
                
                // File upload handling
                const imageInput = document.getElementById('imageInput');
                const previewImage = document.getElementById('previewImage');
                const generateBtn = document.getElementById('generateBtn');
                const promptInput = document.getElementById('promptInput');
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
                        currentImage = e.target.result.split(',')[1]; // Remove data URL prefix
                        previewImage.src = e.target.result;
                        previewImage.style.display = 'block';
                        checkFormValidity();
                    };
                    reader.readAsDataURL(file);
                }
                
                // Slider updates
                document.getElementById('guidanceScale').addEventListener('input', (e) => {
                    document.getElementById('guidanceValue').textContent = e.target.value;
                });
                
                document.getElementById('inferenceSteps').addEventListener('input', (e) => {
                    document.getElementById('stepsValue').textContent = e.target.value;
                });
                
                promptInput.addEventListener('input', checkFormValidity);
                
                function checkFormValidity() {
                    const hasImage = currentImage !== null;
                    const hasPrompt = promptInput.value.trim().length > 0;
                    generateBtn.disabled = !(hasImage && hasPrompt);
                }
                
                // Generate image
                generateBtn.addEventListener('click', async () => {
                    const resultArea = document.getElementById('resultArea');
                    
                    // Show loading
                    resultArea.innerHTML = `
                        <div class="loading">
                            <div class="spinner"></div>
                            <p>Generating your image...</p>
                            <small>This may take 30-60 seconds</small>
                        </div>
                    `;
                    
                    try {
                        const response = await fetch('/generate', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                            },
                            body: JSON.stringify({
                                image_base64: currentImage,
                                prompt: promptInput.value,
                                guidance_scale: parseFloat(document.getElementById('guidanceScale').value),
                                num_inference_steps: parseInt(document.getElementById('inferenceSteps').value)
                            })
                        });
                        
                        const result = await response.json();
                        
                        if (result.success) {
                            resultArea.innerHTML = `
                                <div class="success">Image generated successfully!</div>
                                <img src="data:image/png;base64,${result.image}" class="result-image">
                                <a href="data:image/png;base64,${result.image}" download="flux-kontext-result.png" class="download-btn">
                                    📥 Download Image
                                </a>
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
    async def generate(request: GenerateRequest):
        """Generate image with FLUX.1-Kontext"""
        try:
            flux = FluxKontext()
            result = flux.generate.remote(
                prompt=request.prompt,
                image_base64=request.image_base64,
                guidance_scale=request.guidance_scale,
                num_inference_steps=request.num_inference_steps,
                width=request.width,
                height=request.height
            )
            return result
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))
    
    return app_instance


@app.local_entrypoint()
def main():
    """CLI interface"""
    import argparse
    import base64
    from pathlib import Path
    
    parser = argparse.ArgumentParser(description="FLUX.1-Kontext Image Editing")
    parser.add_argument("--image", required=True, help="Input image path")
    parser.add_argument("--prompt", required=True, help="Text prompt")
    parser.add_argument("--output", help="Output path")
    parser.add_argument("--guidance-scale", type=float, default=3.5, help="Guidance scale")
    parser.add_argument("--steps", type=int, default=28, help="Inference steps")
    
    args = parser.parse_args()
    
    # Read image
    image_path = Path(args.image)
    with open(image_path, 'rb') as f:
        image_base64 = base64.b64encode(f.read()).decode()
    
    # Generate
    flux = FluxKontext()
    result = flux.generate.remote(
        image_base64=image_base64,
        prompt=args.prompt,
        guidance_scale=args.guidance_scale,
        num_inference_steps=args.steps
    )
    
    if result["success"]:
        output_path = args.output or f"{image_path.stem}_edited{image_path.suffix}"
        with open(output_path, 'wb') as f:
            f.write(base64.b64decode(result["image"]))
        print(f"✅ Image saved to: {output_path}")
    else:
        print(f"❌ {result['message']}")