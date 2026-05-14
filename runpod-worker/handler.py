"""
RunPod Serverless Handler — Video Transfer (WanVideo Animate)
Recebe: imagem de produto (base64) + vídeo referência (base64)
Retorna: vídeo gerado (base64)
"""

import runpod
import json
import base64
import os
import time
import uuid
import subprocess
import requests
import copy

COMFYUI_PATH = os.environ.get("COMFYUI_PATH", "/comfyui")
COMFYUI_URL = "http://127.0.0.1:8188"

with open("/workflow_template.json") as f:
    WORKFLOW_TEMPLATE = json.load(f)


def start_comfyui():
    proc = subprocess.Popen(
        ["python", "main.py", "--listen", "0.0.0.0", "--port", "8188",
         "--disable-auto-launch", "--disable-metadata"],
        cwd=COMFYUI_PATH,
        stdout=subprocess.DEVNULL,
        stderr=subprocess.DEVNULL,
    )
    # Aguarda ComfyUI ficar pronto
    for _ in range(60):
        try:
            r = requests.get(f"{COMFYUI_URL}/system_stats", timeout=3)
            if r.status_code == 200:
                print("[ComfyUI] Pronto.")
                return proc
        except Exception:
            pass
        time.sleep(3)
    raise RuntimeError("ComfyUI não iniciou em 3 minutos")


def upload_file_to_comfyui(filename: str, data: bytes) -> str:
    """Faz upload de arquivo para o /input do ComfyUI e retorna o nome salvo."""
    files = {"image": (filename, data, "application/octet-stream")}
    r = requests.post(f"{COMFYUI_URL}/upload/image", files=files, data={"overwrite": "true"})
    r.raise_for_status()
    result = r.json()
    return result.get("name", filename)


def queue_workflow(workflow: dict) -> str:
    r = requests.post(f"{COMFYUI_URL}/prompt", json={"prompt": workflow})
    r.raise_for_status()
    return r.json()["prompt_id"]


def wait_for_completion(prompt_id: str, timeout: int = 600) -> dict:
    start = time.time()
    while time.time() - start < timeout:
        r = requests.get(f"{COMFYUI_URL}/history/{prompt_id}")
        r.raise_for_status()
        history = r.json()
        if prompt_id in history:
            return history[prompt_id]
        time.sleep(5)
    raise TimeoutError(f"Workflow não concluiu em {timeout}s")


def get_output_video(history: dict) -> bytes:
    outputs = history.get("outputs", {})
    for node_id, node_output in outputs.items():
        if "gifs" in node_output:
            for gif in node_output["gifs"]:
                filename = gif.get("filename")
                subfolder = gif.get("subfolder", "")
                folder_type = gif.get("type", "output")
                params = {"filename": filename, "subfolder": subfolder, "type": folder_type}
                r = requests.get(f"{COMFYUI_URL}/view", params=params)
                r.raise_for_status()
                return r.content
    raise ValueError("Nenhum vídeo no output do workflow")


def handler(job):
    job_input = job.get("input", {})

    image_b64 = job_input.get("image_base64")
    video_b64 = job_input.get("video_base64")

    if not image_b64 or not video_b64:
        return {"error": "image_base64 e video_base64 são obrigatórios"}

    try:
        image_data = base64.b64decode(image_b64)
        video_data = base64.b64decode(video_b64)
    except Exception as e:
        return {"error": f"Erro ao decodificar base64: {e}"}

    run_id = uuid.uuid4().hex[:8]
    image_filename = f"ref_image_{run_id}.jpg"
    video_filename = f"ref_video_{run_id}.mp4"

    try:
        # Upload dos arquivos para ComfyUI
        saved_image = upload_file_to_comfyui(image_filename, image_data)
        saved_video = upload_file_to_comfyui(video_filename, video_data)

        # Monta workflow com os arquivos do usuário
        workflow = copy.deepcopy(WORKFLOW_TEMPLATE)
        workflow["391"]["inputs"]["image"] = saved_image      # Imagem de referência
        workflow["392"]["inputs"]["video"] = saved_video      # Vídeo TikTok

        # Ajustes opcionais do job
        if "duration_seconds" in job_input:
            workflow["341"]["inputs"]["value"] = int(job_input["duration_seconds"])

        # Executa
        prompt_id = queue_workflow(workflow)
        print(f"[Handler] Workflow enfileirado: {prompt_id}")

        history = wait_for_completion(prompt_id)
        video_bytes = get_output_video(history)

        video_b64_out = base64.b64encode(video_bytes).decode("utf-8")
        return {"video_base64": video_b64_out, "prompt_id": prompt_id}

    except Exception as e:
        return {"error": str(e)}


# Inicia ComfyUI antes de aceitar jobs
print("[Startup] Iniciando ComfyUI...")
start_comfyui()
print("[Startup] Pronto para receber jobs.")

runpod.serverless.start({"handler": handler})
