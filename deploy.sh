#!/bin/bash
# Copia o script para o VPS e executa lá
scp C:/Users/chris/Feminnita-Marketing/insert-instagram.mjs root@72.61.55.194:/tmp/insert-instagram.mjs
ssh root@72.61.55.194 "cd /opt/marketing && node /tmp/insert-instagram.mjs"
