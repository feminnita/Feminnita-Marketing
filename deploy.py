import paramiko
import os
from pathlib import Path

HOST = "72.61.55.194"
USER = "root"
PASS = "Victorhugo01@"
LOCAL_BASE = Path(r"C:\Users\chris\Feminnita-Marketing\dist")
REMOTE_BASE = "/opt/marketing/dist"

def upload_file(sftp, local_path: Path, remote_path: str):
    try:
        sftp.put(str(local_path), remote_path)
    except Exception as e:
        print(f"  ERR {remote_path}: {e}")

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect(HOST, username=USER, password=PASS, timeout=30)
sftp = client.open_sftp()

# Upload index.js
print("Uploading dist/index.js...")
upload_file(sftp, LOCAL_BASE / "index.js", f"{REMOTE_BASE}/index.js")

# Upload public recursively
local_public = LOCAL_BASE / "public"
for local_file in local_public.rglob("*"):
    if local_file.is_file():
        rel = local_file.relative_to(local_public)
        remote_path = f"{REMOTE_BASE}/public/{rel.as_posix()}"
        # ensure remote dir exists
        remote_dir = remote_path.rsplit("/", 1)[0]
        try:
            sftp.stat(remote_dir)
        except FileNotFoundError:
            stdin, stdout, stderr = client.exec_command(f"mkdir -p {remote_dir}")
            stdout.channel.recv_exit_status()
        upload_file(sftp, local_file, remote_path)

sftp.close()

# Restart pm2
print("Restarting pm2...")
stdin, stdout, stderr = client.exec_command("pm2 restart feminnita")
out = stdout.read().decode("utf-8", errors="replace")
err = stderr.read().decode("utf-8", errors="replace")
with open("deploy_log.txt", "w", encoding="utf-8") as f:
    f.write(out + err)

client.close()
import sys
sys.stdout.buffer.write("Deploy concluido!\n".encode("utf-8"))
