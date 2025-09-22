from fastapi import FastAPI, HTTPException, File, UploadFile, Form, Request
from fastapi.responses import HTMLResponse, FileResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from pydantic import BaseModel
import base64
import io
from PIL import Image, ImageEnhance, ImageFilter, ImageOps
import httpx
import os
from typing import Optional
import numpy as np

app = FastAPI(title="Make3D Studio", description="Transform ideas into 3D models")

# Templates
templates = Jinja2Templates(directory="templates")

# Static files
app.mount("/static", StaticFiles(directory="static"), name="static")

class GenerateRequest(BaseModel):
    prompt: str
    image_base64: str = None  # Optional for text-to-image generation
    guidance_scale: float = 3.5
    num_inference_steps: int = 28
    width: int = 1024
    height: int = 1024

class BasicEditRequest(BaseModel):
    image_base64: str
    operation: str

@app.get("/", response_class=HTMLResponse)
async def homepage():
    """Direct to Make3D Studio editor"""
    return FileResponse("static/modern_editor_fixed.html")

@app.get("/home", response_class=HTMLResponse)
async def marketing_page():
    """Marketing homepage with integrated workflow"""
    return """
    <!DOCTYPE html>
    <!-- Landing page header fixed v2.1 -->
    <html class="dark" lang="en">
    <head>
        <meta charset="utf-8"/>
        <meta content="width=device-width, initial-scale=1.0" name="viewport"/>
        <title>Make3D Studio</title>
        <link href="data:image/x-icon;base64," rel="icon" type="image/x-icon"/>
        <script src="https://cdn.tailwindcss.com?plugins=forms,container-queries"></script>
        <link href="https://fonts.googleapis.com" rel="preconnect"/>
        <link crossorigin="" href="https://fonts.gstatic.com" rel="preconnect"/>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700;900&display=swap" rel="stylesheet"/>
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined" rel="stylesheet"/>
        <script>
            tailwind.config = {
                darkMode: "class",
                theme: {
                    extend: {
                        colors: {
                            "primary": "#1f71d6",
                            "background-light": "#f6f7f8",
                            "background-dark": "#111821",
                        },
                        fontFamily: {
                            "display": ["Inter"],
                        },
                        borderRadius: { "DEFAULT": "0.25rem", "lg": "0.5rem", "xl": "0.75rem", "full": "9999px" },
                    },
                },
            };
        </script>
        <style>
            .material-symbols-outlined {
                font-variation-settings: "FILL" 0, "wght" 400, "GRAD" 0, "opsz" 24;
            }
            .workflow-step {
                transition: all 0.3s ease;
            }
            .workflow-step:hover {
                transform: translateY(-4px);
                box-shadow: 0 10px 25px rgba(0,0,0,0.15);
            }
            .upload-area {
                border: 2px dashed #1f71d6;
                transition: all 0.3s ease;
            }
            .upload-area:hover {
                border-color: #1557b0;
                background: rgba(31, 113, 214, 0.05);
            }
            .upload-area.dragover {
                border-color: #1557b0;
                background: rgba(31, 113, 214, 0.1);
            }
        </style>
    </head>
    <body class="font-display bg-background-light dark:bg-background-dark text-gray-800 dark:text-gray-200">
        <!-- Header -->
        <header class="flex h-24 shrink-0 items-center justify-between border-b-2 border-primary/20 dark:border-primary/30 px-8 shadow-sm">
            <div class="flex items-center gap-5">
                <div class="text-primary size-9 rounded-xl bg-primary/10 flex items-center justify-center shadow-lg">
                    <svg fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg" class="size-6">
                        <g clip-path="url(#clip0_6_535)">
                            <path clip-rule="evenodd" d="M47.2426 24L24 47.2426L0.757355 24L24 0.757355L47.2426 24ZM12.2426 21H35.7574L24 9.24264L12.2426 21Z" fill="currentColor" fill-rule="evenodd"></path>
                        </g>
                        <defs>
                            <clipPath id="clip0_6_535">
                                <rect fill="white" height="48" width="48"></rect>
                            </clipPath>
                        </defs>
                    </svg>
                </div>
                <h2 class="text-2xl font-extrabold text-gray-900 dark:text-white tracking-tight">Make3D Studio</h2>
            </div>
            <nav class="hidden items-center gap-6 text-sm font-medium lg:flex">
                <a class="text-primary font-semibold" href="/">Studio</a>
                <a class="text-gray-600 hover:text-primary dark:text-gray-300 dark:hover:text-primary" href="/home">About</a>
                <a class="text-gray-600 hover:text-primary dark:text-gray-300 dark:hover:text-primary" href="/gallery">Gallery</a>
                <a class="text-gray-600 hover:text-primary dark:text-gray-300 dark:hover:text-primary" href="/learn">Learn</a>
            </nav>
            <div class="flex items-center gap-4">
                <button onclick="startNewProject()" class="flex h-9 cursor-pointer items-center justify-center gap-2 overflow-hidden rounded-lg bg-primary px-4 text-sm font-semibold text-white transition-all hover:bg-primary/90">
                    <span class="material-symbols-outlined text-base">add</span>
                    <span>New Project</span>
                </button>
            </div>
        </header>

        <!-- Hero Section -->
        <main class="flex-1">
            <section class="relative overflow-hidden bg-gradient-to-br from-primary/10 via-purple-500/5 to-pink-500/10 px-6 py-20">
                <div class="mx-auto max-w-7xl">
                    <div class="text-center">
                        <h1 class="text-5xl font-black text-gray-900 dark:text-white lg:text-7xl">
                            Transform Ideas into 
                            <span class="bg-gradient-to-r from-primary via-purple-500 to-pink-500 bg-clip-text text-transparent">
                                3D Reality
                            </span>
                        </h1>
                        <p class="mx-auto mt-6 max-w-2xl text-xl text-gray-600 dark:text-gray-300">
                            Create, edit, and convert product images into high-quality 3D models through an intuitive workflow powered by AI.
                        </p>
                        <div class="mt-10 flex justify-center gap-4">
                            <button onclick="startNewProject()" class="flex h-12 cursor-pointer items-center justify-center gap-2 overflow-hidden rounded-lg bg-primary px-8 text-lg font-semibold text-white transition-all hover:bg-primary/90">
                                Launch Studio
                            </button>
                            <button onclick="scrollToWorkflow()" class="flex h-12 cursor-pointer items-center justify-center gap-2 overflow-hidden rounded-lg border border-gray-300/50 bg-transparent px-8 text-lg font-semibold text-gray-700 transition-all hover:bg-gray-200/50 dark:border-gray-600/50 dark:text-gray-300 dark:hover:bg-gray-700/50">
                                Learn More
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            <!-- Workflow Section -->
            <section id="workflow" class="px-6 py-20">
                <div class="mx-auto max-w-7xl">
                    <div class="text-center mb-16">
                        <h2 class="text-4xl font-bold text-gray-900 dark:text-white">Simple 3-Step Workflow</h2>
                        <p class="mt-4 text-xl text-gray-600 dark:text-gray-300">From concept to 3D model in minutes</p>
                    </div>
                    
                    <div class="grid grid-cols-1 gap-8 lg:grid-cols-3">
                        <!-- Step 1: Create -->
                        <div class="workflow-step rounded-2xl border border-gray-200/50 bg-white/50 p-8 text-center dark:border-gray-700/50 dark:bg-gray-800/50">
                            <div class="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                                <span class="material-symbols-outlined text-3xl text-primary">image</span>
                            </div>
                            <h3 class="text-2xl font-bold text-gray-900 dark:text-white">1. Create</h3>
                            <p class="mt-4 text-gray-600 dark:text-gray-300">
                                Upload sketches, reference photos, or use AI to generate product concepts from text prompts.
                            </p>
                        </div>

                        <!-- Step 2: Edit -->
                        <div class="workflow-step rounded-2xl border border-gray-200/50 bg-white/50 p-8 text-center dark:border-gray-700/50 dark:bg-gray-800/50">
                            <div class="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                                <span class="material-symbols-outlined text-3xl text-primary">edit</span>
                            </div>
                            <h3 class="text-2xl font-bold text-gray-900 dark:text-white">2. Edit</h3>
                            <p class="mt-4 text-gray-600 dark:text-gray-300">
                                Modify colors, materials, textures, and branding with Flux Kontext's professional editing tools.
                            </p>
                        </div>

                        <!-- Step 3: Generate 3D -->
                        <div class="workflow-step rounded-2xl border border-gray-200/50 bg-white/50 p-8 text-center dark:border-gray-700/50 dark:bg-gray-800/50">
                            <div class="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                                <span class="material-symbols-outlined text-3xl text-primary">view_in_ar</span>
                            </div>
                            <h3 class="text-2xl font-bold text-gray-900 dark:text-white">3. Generate 3D</h3>
                            <p class="mt-4 text-gray-600 dark:text-gray-300">
                                Convert to high-quality 3D models with Hunyuan 3D 2.0, ready for AR/VR and manufacturing.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            <!-- Demo Section -->
            <section class="bg-gray-50/50 px-6 py-20 dark:bg-gray-900/50">
                <div class="mx-auto max-w-4xl">
                    <div class="text-center mb-12">
                        <h2 class="text-4xl font-bold text-gray-900 dark:text-white">Try Flux Kontext Editor</h2>
                        <p class="mt-4 text-xl text-gray-600 dark:text-gray-300">Test our AI-powered image editing capabilities</p>
                    </div>

                    <div class="grid grid-cols-1 gap-8 lg:grid-cols-2">
                        <!-- Upload Section -->
                        <div class="rounded-xl bg-white p-6 shadow-sm dark:bg-gray-800">
                            <h3 class="text-lg font-bold text-gray-900 dark:text-white mb-4">Upload & Configure</h3>
                            
                            <div class="upload-area mb-6 rounded-lg p-8 text-center" onclick="document.getElementById('imageInput').click()">
                                <span class="material-symbols-outlined text-4xl text-primary mb-3 block">cloud_upload</span>
                                <p class="font-semibold text-gray-900 dark:text-white">Drop image here or click to browse</p>
                                <small class="text-gray-500 dark:text-gray-400">Supports JPG, PNG, WEBP</small>
                            </div>
                            
                            <input type="file" id="imageInput" style="display: none;" accept="image/*">
                            <img id="previewImage" style="display: none;" class="mb-4 max-h-48 w-full rounded-lg object-cover">
                            
                            <div class="mb-4">
                                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Editing Prompt</label>
                                <textarea id="promptInput" class="w-full rounded-lg border border-gray-300 p-3 text-sm dark:border-gray-600 dark:bg-gray-700" 
                                          placeholder="Describe how you want to transform the image..." rows="3"></textarea>
                            </div>
                            
                            <button id="generateBtn" disabled 
                                    class="w-full rounded-lg bg-primary px-4 py-3 font-semibold text-white transition-all hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed">
                                Generate with Flux Kontext
                            </button>
                        </div>

                        <!-- Result Section -->
                        <div class="rounded-xl bg-white p-6 shadow-sm dark:bg-gray-800">
                            <h3 class="text-lg font-bold text-gray-900 dark:text-white mb-4">Result</h3>
                            <div id="resultArea" class="flex min-h-[300px] items-center justify-center rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600">
                                <p class="text-center text-gray-500 dark:text-gray-400">
                                    Upload an image and enter a prompt to get started
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </main>

        <!-- Footer -->
        <footer class="border-t border-gray-200/10 bg-gray-50/50 px-6 py-12 dark:border-gray-700/50 dark:bg-gray-900/50">
            <div class="mx-auto max-w-7xl text-center">
                <div class="flex items-center justify-center gap-4 mb-6">
                    <div class="text-primary size-6">
                        <svg fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                            <g clip-path="url(#clip0_6_535)">
                                <path clip-rule="evenodd" d="M47.2426 24L24 47.2426L0.757355 24L24 0.757355L47.2426 24ZM12.2426 21H35.7574L24 9.24264L12.2426 21Z" fill="currentColor" fill-rule="evenodd"></path>
                            </g>
                            <defs>
                                <clipPath id="clip0_6_535">
                                    <rect fill="white" height="48" width="48"></rect>
                                </clipPath>
                            </defs>
                        </svg>
                    </div>
                    <span class="text-lg font-bold text-gray-900 dark:text-white">Make3D Studio</span>
                </div>
                <p class="text-gray-600 dark:text-gray-300">
                    Powered by Modal Labs, Flux Kontext, and Hunyuan 3D 2.0
                </p>
            </div>
        </footer>

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
                    <div class="text-center">
                        <div class="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
                        <p class="text-gray-600 dark:text-gray-400">Generating your image...</p>
                        <small class="text-gray-500 dark:text-gray-500">This may take 30-60 seconds</small>
                    </div>
                `;

                try {
                    const response = await fetch('/api/generate', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            image_base64: currentImage,
                            prompt: promptInput.value,
                            guidance_scale: 3.5,
                            num_inference_steps: 28
                        })
                    });

                    const result = await response.json();

                    if (result.success) {
                        resultArea.innerHTML = `
                            <div class="text-center">
                                <img src="data:image/png;base64,${result.image}" class="mb-4 max-h-96 w-full rounded-lg object-contain">
                                <div class="flex gap-2 justify-center">
                                    <a href="data:image/png;base64,${result.image}" download="flux-kontext-result.png" 
                                       class="inline-flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-white hover:bg-green-700">
                                        <span class="material-symbols-outlined text-base">download</span>
                                        Download
                                    </a>
                                    <button onclick="openEditor('${result.image}')"
                                            class="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-white hover:bg-primary/90">
                                        <span class="material-symbols-outlined text-base">edit</span>
                                        Edit in Studio
                                    </button>
                                </div>
                            </div>
                        `;
                    } else {
                        resultArea.innerHTML = `
                            <div class="text-center text-red-600 dark:text-red-400">
                                <span class="material-symbols-outlined text-4xl mb-2 block">error</span>
                                <p><strong>Error:</strong> ${result.message}</p>
                            </div>
                        `;
                    }
                } catch (error) {
                    resultArea.innerHTML = `
                        <div class="text-center text-red-600 dark:text-red-400">
                            <span class="material-symbols-outlined text-4xl mb-2 block">wifi_off</span>
                            <p><strong>Network Error:</strong> ${error.message}</p>
                        </div>
                    `;
                }
            });

            function startNewProject() {
                window.location.href = '/';
            }

            function scrollToWorkflow() {
                document.getElementById('workflow').scrollIntoView({ behavior: 'smooth' });
            }

            function openEditor(imageData) {
                // Open editor with the generated image
                window.location.href = `/editor?image=${encodeURIComponent(imageData)}`;
            }
        </script>
    </body>
    </html>
    """

@app.post("/api/generate")
async def generate_image(request: GenerateRequest):
    """Generate or edit image with FLUX.1-Kontext via Modal"""
    try:
        # Get Modal app URL from environment variable
        modal_url = os.getenv("MODAL_FLUX_URL", "https://gpudashboard0--flux-kontext-web-app.modal.run")
        
        # Prepare request data - match your current Modal deployment format
        if request.image_base64:
            # Image editing mode - use original format
            request_data = {
                "image_base64": request.image_base64,
                "prompt": request.prompt,
                "guidance_scale": request.guidance_scale,
                "num_inference_steps": request.num_inference_steps
            }
        else:
            # Text-to-image mode - this might not work with current deployment
            # You'll need to redeploy Modal with the updated code
            request_data = {
                "prompt": request.prompt,
                "guidance_scale": request.guidance_scale,
                "num_inference_steps": request.num_inference_steps,
                "width": request.width,
                "height": request.height
            }
        
        print(f"Sending request to Modal: {request_data}")  # Debug log
        
        async with httpx.AsyncClient(timeout=300.0) as client:
            response = await client.post(
                f"{modal_url}/generate",
                json=request_data
            )
            
            print(f"Modal response status: {response.status_code}")  # Debug log
            
            if response.status_code == 200:
                return response.json()
            else:
                error_text = response.text
                print(f"Modal error response: {error_text}")  # Debug log
                raise HTTPException(
                    status_code=response.status_code, 
                    detail=f"Modal service error: {error_text}"
                )
                
    except httpx.TimeoutException:
        raise HTTPException(status_code=504, detail="Request timeout - model is likely loading")
    except Exception as e:
        print(f"Exception in generate_image: {str(e)}")  # Debug log
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/studio", response_class=HTMLResponse)
async def studio_page(request: Request):
    """Integrated Make3D Studio page"""
    return templates.TemplateResponse("studio.html", {"request": request})

@app.get("/editor", response_class=HTMLResponse)
async def editor_page(request: Request):
    """Image editor page (legacy)"""
    return templates.TemplateResponse("editor.html", {"request": request})

@app.post("/api/remove-background")
async def remove_background(request: BasicEditRequest):
    """Remove background using basic image processing (fallback to Flux if fails)"""
    try:
        # Decode base64 image
        image_data = base64.b64decode(request.image_base64)
        img = Image.open(io.BytesIO(image_data)).convert("RGBA")
        
        # Simple background removal based on edge detection and color similarity
        # This is a basic implementation - for production, consider using rembg library
        img_array = np.array(img)
        
        # Create a simple mask based on corner colors (assuming background is uniform)
        h, w = img_array.shape[:2]
        corner_colors = [
            img_array[0, 0], img_array[0, w-1], 
            img_array[h-1, 0], img_array[h-1, w-1]
        ]
        
        # Find most common corner color as background
        bg_color = corner_colors[0][:3]  # Take RGB only
        
        # Create mask where pixels are similar to background color
        tolerance = 30
        mask = np.all(np.abs(img_array[:, :, :3] - bg_color) < tolerance, axis=2)
        
        # Set background pixels to transparent
        img_array[mask] = [0, 0, 0, 0]
        
        # Convert back to PIL image
        result_img = Image.fromarray(img_array, 'RGBA')
        
        # Convert to base64
        buffer = io.BytesIO()
        result_img.save(buffer, format="PNG")
        result_base64 = base64.b64encode(buffer.getvalue()).decode()
        
        return {"success": True, "image": result_base64}
        
    except Exception as e:
        return {"success": False, "error": str(e)}

@app.post("/api/adjust-image")
async def adjust_image(request: BasicEditRequest):
    """Basic image adjustments (brightness, contrast, etc.)"""
    try:
        # Decode base64 image
        image_data = base64.b64decode(request.image_base64)
        img = Image.open(io.BytesIO(image_data))
        
        # Apply brightness enhancement
        enhancer = ImageEnhance.Brightness(img)
        img = enhancer.enhance(1.3)  # Increase brightness by 30%
        
        # Apply contrast enhancement
        enhancer = ImageEnhance.Contrast(img)
        img = enhancer.enhance(1.2)  # Increase contrast by 20%
        
        # Apply color enhancement
        enhancer = ImageEnhance.Color(img)
        img = enhancer.enhance(1.1)  # Increase saturation by 10%
        
        # Convert to base64
        buffer = io.BytesIO()
        img.save(buffer, format="PNG")
        result_base64 = base64.b64encode(buffer.getvalue()).decode()
        
        return {"success": True, "image": result_base64}
        
    except Exception as e:
        return {"success": False, "error": str(e)}

@app.post("/api/enhance-image")
async def enhance_image(request: BasicEditRequest):
    """Enhance image quality using basic filters"""
    try:
        # Decode base64 image
        image_data = base64.b64decode(request.image_base64)
        img = Image.open(io.BytesIO(image_data))
        
        # Apply sharpening filter
        img = img.filter(ImageFilter.UnsharpMask(radius=1, percent=150, threshold=3))
        
        # Apply slight blur to smooth noise, then sharpen
        img = img.filter(ImageFilter.GaussianBlur(radius=0.5))
        img = img.filter(ImageFilter.SHARPEN)
        
        # Enhance sharpness
        enhancer = ImageEnhance.Sharpness(img)
        img = enhancer.enhance(1.2)
        
        # Convert to base64
        buffer = io.BytesIO()
        img.save(buffer, format="PNG")
        result_base64 = base64.b64encode(buffer.getvalue()).decode()
        
        return {"success": True, "image": result_base64}
        
    except Exception as e:
        return {"success": False, "error": str(e)}

@app.post("/api/crop-image")
async def crop_image(request: BasicEditRequest):
    """Crop image to square aspect ratio"""
    try:
        # Decode base64 image
        image_data = base64.b64decode(request.image_base64)
        img = Image.open(io.BytesIO(image_data))
        
        # Get image dimensions
        width, height = img.size
        
        # Calculate square crop
        size = min(width, height)
        left = (width - size) // 2
        top = (height - size) // 2
        right = left + size
        bottom = top + size
        
        # Crop to square
        img = img.crop((left, top, right, bottom))
        
        # Convert to base64
        buffer = io.BytesIO()
        img.save(buffer, format="PNG")
        result_base64 = base64.b64encode(buffer.getvalue()).decode()
        
        return {"success": True, "image": result_base64}
        
    except Exception as e:
        return {"success": False, "error": str(e)}

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "service": "Make3D Studio"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)