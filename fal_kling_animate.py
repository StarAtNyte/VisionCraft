"""
FAL API Kling 2.5 Video Animation Service
Replaces Modal Labs WAN for faster video generation
"""

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import base64
import io
import os
from typing import Dict, Any
import httpx
from PIL import Image
import json

app = FastAPI(title="FAL Kling 2.5 Animation Service")

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
    duration: str = "5"  # FAL Kling parameter: "5" or "10" seconds
    
    class Config:
        extra = "ignore"

class FALKlingService:
    """Service class for FAL Kling 2.5 API integration"""
    
    def __init__(self):
        self.api_key = os.getenv("FAL_KEY")
        if not self.api_key:
            raise ValueError("FAL_KEY environment variable not set")
        
        self.base_url = "https://queue.fal.run"
        self.model_endpoint = "fal-ai/kling-video/v2.5-turbo/pro/image-to-video"
        
    async def generate_video(
        self,
        image_base64: str,
        prompt: str,
        category: str = "product",
        animation_style: str = "smooth_rotation",
        duration: str = "5",
        negative_prompt: str = None,
        cfg_scale: float = 0.5
    ) -> Dict[str, Any]:
        """
        Generate video using FAL Kling 2.5 API
        """
        try:
            # Convert base64 image to data URI format expected by FAL
            if not image_base64.startswith("data:"):
                # Assume it's a base64 string, convert to data URI
                image_url = f"data:image/png;base64,{image_base64}"
            else:
                image_url = image_base64
                
            # Create enhanced prompt
            enhanced_prompt = self._create_enhanced_prompt(prompt, category, animation_style)
            
            # Set default negative prompt if not provided
            if negative_prompt is None:
                negative_prompt = "blur, distort, and low quality"
            
            # Prepare request payload for FAL Kling API
            payload = {
                "prompt": enhanced_prompt,
                "image_url": image_url,
                "duration": duration,
                "negative_prompt": negative_prompt,
                "cfg_scale": cfg_scale
            }
            
            print(f"Generating video with FAL Kling 2.5:")
            print(f"Prompt: {enhanced_prompt}")
            print(f"Duration: {duration}s")
            print(f"CFG Scale: {cfg_scale}")
            
            # Make request to FAL API using their subscription interface
            async with httpx.AsyncClient(timeout=300.0) as client:
                # Submit request to FAL queue
                response = await client.post(
                    f"{self.base_url}/fal-ai/kling-video/v2.5-turbo/pro/image-to-video",
                    headers={
                        "Authorization": f"Key {self.api_key}",
                        "Content-Type": "application/json"
                    },
                    json=payload
                )
                
                if response.status_code != 200:
                    error_msg = f"FAL API error: {response.status_code} - {response.text}"
                    print(error_msg)
                    return {"success": False, "message": error_msg}
                
                result = response.json()
                
                # FAL returns the result directly for this endpoint
                if "video" in result and "url" in result["video"]:
                    video_url = result["video"]["url"]
                    
                    # Download the video and convert to base64
                    video_response = await client.get(video_url)
                    if video_response.status_code == 200:
                        video_base64 = base64.b64encode(video_response.content).decode()
                        
                        return {
                            "success": True,
                            "video": video_base64,
                            "message": "Video generated successfully with FAL Kling 2.5",
                            "prompt_used": enhanced_prompt,
                            "settings": {
                                "resolution": f"{1280}x{720}",  # FAL Kling default
                                "duration": f"{duration}s",
                                "fps": 16,  # FAL Kling default
                                "cfg_scale": cfg_scale,
                                "model": "Kling 2.5 Turbo Pro"
                            }
                        }
                    else:
                        return {
                            "success": False,
                            "message": f"Failed to download generated video: {video_response.status_code}"
                        }
                else:
                    return {
                        "success": False,
                        "message": f"Unexpected FAL API response format: {result}"
                    }
                    
        except Exception as e:
            error_msg = f"Error generating video with FAL Kling: {str(e)}"
            print(error_msg)
            return {
                "success": False,
                "message": error_msg
            }
    
    def _create_enhanced_prompt(self, base_prompt: str, category: str, animation_style: str) -> str:
        """Create enhanced prompt based on product category and animation style"""
        
        # Category-specific prompt enhancements optimized for Kling 2.5
        category_prompts = {
            "product": "premium commercial product showcase, studio lighting, clean background",
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
        
        # Animation style descriptions optimized for Kling 2.5
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
        
        enhanced_prompt = f"{base_prompt}, {category_enhancement}, {style_enhancement}, high quality, professional, smooth motion, commercial grade"
        
        return enhanced_prompt

# Initialize FAL service
fal_service = FALKlingService()

@app.post("/generate")
async def generate_animation(request: AnimationRequest):
    """Generate animation using FAL Kling 2.5 API"""
    try:
        result = await fal_service.generate_video(
            image_base64=request.image_base64,
            prompt=request.prompt,
            category=request.category,
            animation_style=request.animation_style,
            duration=request.duration,
            negative_prompt=request.negative_prompt,
            cfg_scale=request.guidance_scale / 7.0  # Convert guidance scale to CFG scale (0-1 range)
        )
        
        return result
        
    except Exception as e:
        print(f"Error in generate endpoint: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/health")
def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "service": "FAL Kling 2.5 Animation Service"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001, reload=True)