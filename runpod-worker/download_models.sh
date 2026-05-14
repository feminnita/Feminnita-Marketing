#!/bin/bash
# Script de download dos modelos — rode UMA VEZ no Network Volume
# Execute dentro do pod: bash /download_models.sh

set -e
MODELS_DIR=${COMFYUI_PATH:-/comfyui}/models

echo "=== Download dos modelos WanVideo ==="

pip install huggingface_hub -q

# Cria diretórios
mkdir -p $MODELS_DIR/checkpoints/Wan22Animate
mkdir -p $MODELS_DIR/vae
mkdir -p $MODELS_DIR/clip_vision
mkdir -p $MODELS_DIR/text_encoders
mkdir -p $MODELS_DIR/loras
mkdir -p $MODELS_DIR/onnx

# Modelo principal WanVideo Animate 14B (fp8)
echo "Baixando modelo principal (~14GB)..."
huggingface-cli download Kijai/WanVideo_comfy \
    Wan22Animate/Wan2_2-Animate-14B_fp8_scaled_e4m3fn_KJ_v2.safetensors \
    --local-dir $MODELS_DIR/checkpoints

# VAE
echo "Baixando VAE..."
huggingface-cli download Kijai/WanVideo_comfy \
    Wan2_1_VAE_bf16.safetensors \
    --local-dir $MODELS_DIR/vae

# CLIP Vision
echo "Baixando CLIP Vision..."
huggingface-cli download Kijai/WanVideo_comfy \
    clip_vision_h.safetensors \
    --local-dir $MODELS_DIR/clip_vision

# Text Encoder
echo "Baixando Text Encoder (~10GB)..."
huggingface-cli download Kijai/WanVideo_comfy \
    umt5-xxl-enc-bf16.safetensors \
    --local-dir $MODELS_DIR/text_encoders

# LoRAs
echo "Baixando LoRAs..."
huggingface-cli download Kijai/WanVideo_comfy \
    WanAnimate_relight_lora_fp16.safetensors \
    Wan2.2-Lightning_I2V-A14B-4steps-lora_LOW_fp16.safetensors \
    FastWan_T2V_14B_480p_lora_rank_128_bf16.safetensors \
    Wan21_PusaV1_LoRA_14B_rank512_bf16.safetensors \
    "Wan2.2-Fun-A14B-InP-LOW-HPS2.1_resized_dynamic_avg_rank_15_bf16.safetensors" \
    --local-dir $MODELS_DIR/loras

# SeC model
echo "Baixando SeC..."
huggingface-cli download Kijai/WanVideo_comfy \
    SeC-4B-fp8.safetensors \
    --local-dir $MODELS_DIR/checkpoints

# Pose detection models
echo "Baixando modelos de pose..."
wget -q -O $MODELS_DIR/onnx/vitpose_h_wholebody_model.onnx \
    "https://huggingface.co/yzd-v/DWPose/resolve/main/vitpose_h_wholebody_model.onnx" || true
wget -q -O $MODELS_DIR/onnx/yolov10m.onnx \
    "https://huggingface.co/Ultralytics/assets/resolve/main/yolov10m.onnx" || true

echo "=== Download concluído! ==="
echo "Total de modelos:"
du -sh $MODELS_DIR/
