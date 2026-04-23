import paramiko
import shutil
import os

HOST = "72.61.55.194"
USER = "root"
PASS = "Victorhugo01@"

LOCAL = r"C:\Users\chris\Downloads\WhatsApp Image 2026-04-23 at 10.21.39.jpeg"
REMOTE = "/opt/marketing/dist/public/agents/shopee.jpg"

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect(HOST, username=USER, password=PASS, timeout=30)
sftp = client.open_sftp()
sftp.put(LOCAL, REMOTE)
sftp.close()
client.close()
print("shopee.jpg enviado!")
