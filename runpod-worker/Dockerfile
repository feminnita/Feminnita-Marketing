FROM runpod/base:0.6.1-cuda12.1.0

ENV DEBIAN_FRONTEND=noninteractive
ENV PYTHONUNBUFFERED=1
ENV COMFYUI_PATH=/comfyui

# Dependências do sistema
RUN apt-get update && apt-get install -y \
    git wget curl ffmpeg libgl1 libglib2.0-0 \
    && rm -rf /var/lib/apt/lists/*

# Python deps
RUN pip install --no-cache-dir \
    runpod==1.7.3 \
    torch==2.3.1 torchvision torchaudio --index-url https://download.pytorch.org/whl/cu121 \
    && pip install --no-cache-dir \
    comfy-cli requests pillow numpy einops

# Instala ComfyUI
RUN git clone https://github.com/comfyanonymous/ComfyUI.git ${COMFYUI_PATH} \
    && pip install --no-cache-dir -r ${COMFYUI_PATH}/requirements.txt

WORKDIR ${COMFYUI_PATH}/custom_nodes

# Nodes principais do workflow
RUN git clone https://github.com/kijai/ComfyUI-WanVideoWrapper.git && \
    pip install --no-cache-dir -r ComfyUI-WanVideoWrapper/requirements.txt

RUN git clone https://github.com/Kosinkadink/ComfyUI-VideoHelperSuite.git && \
    pip install --no-cache-dir -r ComfyUI-VideoHelperSuite/requirements.txt

RUN git clone https://github.com/chflame163/ComfyUI_LayerStyle.git && \
    pip install --no-cache-dir -r ComfyUI_LayerStyle/requirements.txt 2>/dev/null || true

RUN git clone https://github.com/kijai/ComfyUI-KJNodes.git && \
    pip install --no-cache-dir -r ComfyUI-KJNodes/requirements.txt 2>/dev/null || true

RUN git clone https://github.com/yolain/ComfyUI-Easy-Use.git && \
    pip install --no-cache-dir -r ComfyUI-Easy-Use/requirements.txt 2>/dev/null || true

RUN git clone https://github.com/cubiq/ComfyUI_essentials.git && \
    pip install --no-cache-dir -r ComfyUI_essentials/requirements.txt 2>/dev/null || true

RUN git clone https://github.com/WASasquatch/was-node-suite-comfyui.git && \
    pip install --no-cache-dir -r was-node-suite-comfyui/requirements.txt 2>/dev/null || true

# Nodes de pose detection (ViTPose + YOLO)
RUN git clone https://github.com/Fannovel16/comfyui_controlnet_aux.git && \
    pip install --no-cache-dir -r comfyui_controlnet_aux/requirements.txt 2>/dev/null || true

# SeC segmentation
RUN git clone https://github.com/HM-RunningHub/ComfyUI-SeC.git 2>/dev/null || \
    git clone https://github.com/kijai/ComfyUI-SeC.git 2>/dev/null || true

WORKDIR ${COMFYUI_PATH}

# Handler RunPod
COPY handler.py /handler.py
COPY workflow_template.json /workflow_template.json

# Diretórios de modelos (serão montados via Network Volume)
RUN mkdir -p models/checkpoints models/vae models/clip_vision \
    models/text_encoders models/loras models/onnx \
    input output

CMD ["python", "-u", "/handler.py"]
