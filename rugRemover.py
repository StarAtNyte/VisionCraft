import modal
from typing import Dict, Any
import base64
import io
from PIL import Image

# --- Modal App Configuration ---

# Create Modal app
app = modal.App("flux-kontext-rug-remover")

# Define the container image with necessary dependencies
image = (
    modal.Image.debian_slim(python_version="3.11")
    .apt_install("git")
    .pip_install(
        "torch>=2.3.0",
        "git+https://github.com/huggingface/diffusers.git",
        "transformers>=4.38.0",
        "accelerate>=0.28.0",
        "Pillow>=9.0.0",
        "fastapi>=0.100.0",
        "uvicorn>=0.23.0",
        "sentencepiece",
    )
)

# Persistent volume for model caching
volume = modal.Volume.from_name("flux-kontext-cache", create_if_missing=True)


@app.cls(
    image=image,
    gpu="A100-40GB",
    volumes={"/models": volume},
    timeout=900,
    container_idle_timeout=600,
    allow_concurrent_inputs=1,
    secrets=[modal.Secret.from_name("huggingface")],
    scaledown_window = 1800,
)
class FluxKontext:
    @modal.enter()
    def load_model(self):
        """Load FLUX.1-Kontext model."""
        import torch
        from diffusers import FluxKontextPipeline
        import os

        # Set Hugging Face cache directory to the persistent volume
        os.environ['HF_HOME'] = '/models/huggingface'
        hf_token = os.getenv("HF_TOKEN")
        if not hf_token:
            raise ValueError("Hugging Face token not found. Please create a Modal secret named 'huggingface' with your token.")

        print("Loading FLUX.1-Kontext pipeline...")
        self.pipe = FluxKontextPipeline.from_pretrained(
            "black-forest-labs/FLUX.1-Kontext-dev",
            torch_dtype=torch.bfloat16,
            cache_dir="/models/huggingface",
            token=hf_token
        )

        # Move the entire pipeline to the GPU
        self.pipe.to("cuda")

        print("Model loaded successfully!")

    @modal.method()
    def generate(
    self,
    prompt: str,
    image_base64: str,
    guidance_scale: float = 2.5,
    num_inference_steps: int = 28,
) -> Dict[str, Any]:
        """
        Edit an image based on a text prompt using FLUX.1-Kontext.
        """
        try:
            # Decode the base64 input image
            image_data = base64.b64decode(image_base64)
            input_image = Image.open(io.BytesIO(image_data)).convert('RGB')
            
            print(f"Input image size: {input_image.size}")
            print(f"Input image mode: {input_image.mode}")
            print(f"Input base64 length: {len(image_base64)}")
            print(f"Input image data length: {len(image_data)}")
            original_width, original_height = input_image.size
            
            # Use the same approach as the HuggingFace demo
            # Pass exact input dimensions as width/height parameters
            processing_image = input_image.convert("RGB")
            print(f"Processing with exact input dimensions: {original_width}x{original_height}")

            # Run the image-to-image pipeline exactly like the HF demo
            import torch
            result = self.pipe(
                image=processing_image,
                prompt=prompt,
                guidance_scale=guidance_scale,
                width=original_width,
                height=original_height,
                num_inference_steps=num_inference_steps,
                generator=torch.Generator().manual_seed(42),
            )
            
            output_image = result.images[0]
            print(f"Output image size from model: {output_image.size}")
            print(f"Output image mode: {output_image.mode}")
            
            # Ensure output is in RGB mode before saving
            if output_image.mode != 'RGB':
                output_image = output_image.convert('RGB')
                print(f"Converted output to RGB mode")

            # Convert the output image to a base64 string
            buffer = io.BytesIO()
            output_image.save(buffer, format='PNG', optimize=False)
            print(f"Saved image buffer size: {len(buffer.getvalue())} bytes")
            output_base64 = base64.b64encode(buffer.getvalue()).decode()
            print(f"Base64 string length: {len(output_base64)}")

            return {
                "success": True,
                "image": output_base64,
                "message": "Image edited successfully"
            }

        except Exception as e:
            return {
                "success": False,
                "message": f"Error: {str(e)}",
                "image": None
            }



# --- FastAPI Web Interface ---
@app.function(
    image=image.pip_install(["fastapi", "uvicorn"]),
)
@modal.asgi_app()
def web_app():
    from fastapi import FastAPI, HTTPException
    from fastapi.responses import HTMLResponse
    from pydantic import BaseModel

    app_instance = FastAPI(title="FLUX.1-Kontext Rug Remover")

    class GenerateRequest(BaseModel):
        prompt: str
        image_base64: str
        guidance_scale: float = 2.5
        num_inference_steps: int = 28

    @app_instance.get("/", response_class=HTMLResponse)
    def home():
        # Using the UI from your original code, but tailored for rug removal
        return """
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>AI Rug Remover with FLUX.1-Kontext</title>
            <style>
                * { margin: 0; padding: 0; box-sizing: border-box; }
                body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f0f2f5; min-height: 100vh; padding: 20px; }
                .container { max-width: 1200px; margin: 0 auto; background: white; border-radius: 20px; box-shadow: 0 20px 40px rgba(0,0,0,0.1); overflow: hidden; }
                .header { background: linear-gradient(135deg, #5A67D8 0%, #805AD5 100%); color: white; padding: 30px; text-align: center; }
                .header h1 { font-size: 2.5rem; margin-bottom: 10px; }
                .content { display: grid; grid-template-columns: 1fr 1fr; gap: 30px; padding: 30px; }
                .card { background: #f8f9fa; border-radius: 15px; padding: 25px; }
                .upload-area { border: 2px dashed #718096; border-radius: 10px; padding: 40px; text-align: center; cursor: pointer; transition: all 0.3s ease; margin-bottom: 20px; }
                .upload-area:hover { border-color: #5A67D8; background: rgba(90, 103, 216, 0.05); }
                .preview-image { max-width: 100%; max-height: 300px; border-radius: 10px; margin: 15px 0; box-shadow: 0 5px 15px rgba(0,0,0,0.1); }
                .form-group, .slider-container { margin-bottom: 20px; }
                label { display: block; margin-bottom: 8px; font-weight: 600; color: #2d3748; }
                .form-textarea { width: 100%; padding: 12px 15px; border: 2px solid #e2e8f0; border-radius: 8px; resize: vertical; min-height: 80px; }
                .generate-btn { width: 100%; padding: 15px; background: linear-gradient(135deg, #48BB78 0%, #38A169 100%); color: white; border: none; border-radius: 10px; font-size: 16px; font-weight: 600; cursor: pointer; }
                .generate-btn:disabled { opacity: 0.7; cursor: not-allowed; }
                .result-image { max-width: 100%; border-radius: 10px; box-shadow: 0 5px 15px rgba(0,0,0,0.1); }
                .loading .spinner { border: 3px solid #f3f3f3; border-top: 3px solid #5A67D8; border-radius: 50%; width: 40px; height: 40px; animation: spin 1s linear infinite; margin: 0 auto 15px; }
                .error { color: #e53e3e; background: #fed7d7; padding: 15px; border-radius: 8px; }
                @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header"><h1>AI Rug Remover</h1><p>Upload an image and automatically remove rugs!</p></div>
                <div class="content">
                    <div class="card">
                        <h3>Upload Your Image</h3>
                        <div class="upload-area" onclick="document.getElementById('imageInput').click()">
                            <p>Click or drag image here</p>
                        </div>
                        <input type="file" id="imageInput" style="display: none;" accept="image/*">
                        <img id="previewImage" class="preview-image" style="display: none;">
                        
                        <details style="margin-top: 20px;">
                            <summary style="cursor: pointer; padding: 10px; background: #e2e8f0; border-radius: 5px; font-weight: 600;">⚙️ Advanced Settings</summary>
                            <div style="padding: 15px; border: 1px solid #e2e8f0; border-radius: 5px; margin-top: 5px;">
                                <div class="form-group">
                                    <label for="promptInput">Custom Prompt</label>
                                    <textarea id="promptInput" class="form-textarea">Remove the rug/carpet from this image without changing anythng else.</textarea>
                                    <small>Describe what the floor should look like after rug removal</small>
                                </div>
                            </div>
                        </details>
                        
                        <button id="generateBtn" class="generate-btn" style="margin-top: 20px;" disabled>🚀 Remove Rug Automatically</button>
                    </div>
                    <div class="card">
                        <h3>Result</h3>
                        <div id="resultArea">
                            <div style="text-align: center; color: #718096; padding: 50px;">
                                <p>Upload an image to see the result here</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <script>
                let currentImageBase64 = null;
                const imageInput = document.getElementById('imageInput');
                const previewImage = document.getElementById('previewImage');
                const generateBtn = document.getElementById('generateBtn');
                const promptInput = document.getElementById('promptInput');
                
                function handleImageUpload(file) {
                    if (!file) return;
                    const reader = new FileReader();
                    reader.onload = (e) => {
                        currentImageBase64 = e.target.result.split(',')[1];
                        previewImage.src = e.target.result;
                        previewImage.style.display = 'block';
                        checkFormValidity();
                    };
                    reader.readAsDataURL(file);
                }

                imageInput.addEventListener('change', (e) => handleImageUpload(e.target.files[0]));
                document.body.addEventListener('dragover', (e) => e.preventDefault());
                document.body.addEventListener('drop', (e) => {
                    e.preventDefault();
                    if(e.dataTransfer.files.length > 0) handleImageUpload(e.dataTransfer.files[0]);
                });
                promptInput.addEventListener('input', checkFormValidity);

                function checkFormValidity() {
                    generateBtn.disabled = !currentImageBase64;
                }

                generateBtn.addEventListener('click', async () => {
                    const resultArea = document.getElementById('resultArea');
                    
                    resultArea.innerHTML = `<div class="loading"><div class="spinner"></div><p>Removing the rug... This can take up to a minute.</p></div>`;
                    
                    try {
                        const response = await fetch('/generate', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                image_base64: currentImageBase64,
                                prompt: promptInput.value || "Remove the rug/carpet from this image without changing anythng else."
                            })
                        });
                        const result = await response.json();
                        
                        if (result.success) {
                            resultArea.innerHTML = `
                                <img src="data:image/png;base64,${result.image}" class="result-image" style="margin-bottom: 15px;">
                                <br>
                                <button onclick="downloadResult('${result.image}')" style="padding: 12px 24px; background: #17a2b8; color: white; border: none; border-radius: 8px; cursor: pointer; font-size: 16px; font-weight: 600;">
                                    💾 Download Result
                                </button>
                            `;
                        } else {
                            resultArea.innerHTML = `<div class="error"><strong>Error:</strong> ${result.message}</div>`;
                        }
                    } catch (error) {
                        resultArea.innerHTML = `<div class="error"><strong>Network Error:</strong> ${error.message}</div>`;
                    }
                });

                function downloadResult(base64Data) {
                    const link = document.createElement('a');
                    link.href = 'data:image/png;base64,' + base64Data;
                    link.download = 'rug_removed_' + new Date().getTime() + '.png';
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                }
            </script>
        </body>
        </html>
        """

    @app_instance.post("/generate")
    async def generate(request: GenerateRequest):
        try:
            flux = FluxKontext()
            # Note: We are not passing width/height as the model will use the input image's dimensions
            result = flux.generate.remote(
                request.prompt,
                request.image_base64,
                request.guidance_scale,
                request.num_inference_steps,
            )
            return result
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))

    return app_instance