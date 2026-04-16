"""
Patch: adiciona redirect para sistema de Marketing no /ml/webhook do gestão.
Se state='mkt', redireciona o browser para http://localhost:3001/api/ml/callback
"""
path = '/opt/gestao/blueprints/ml_integracao.py'
content = open(path).read()

needle = '        if error:\n            log.error(f"ML OAuth erro: {error}")\n            return f"Erro ML: {error}", 400'

insert = '''        # Marketing system: se state='mkt', redireciona para localhost
        if state == 'mkt':
            from urllib.parse import urlencode
            if code:
                return redirect('http://localhost:3001/api/ml/callback?' + urlencode({'code': code}))
            return redirect('http://localhost:3001/api/ml/callback?' + urlencode({'error': error or 'unknown'}))

'''

if 'state == \'mkt\'' in content:
    print('Patch já aplicado.')
elif needle in content:
    new_content = content.replace(needle, insert + needle, 1)
    open(path, 'w').write(new_content)
    print('Patch OK')
else:
    # fallback: insere antes do bloco "if not code:"
    needle2 = '        if not code:\n            return jsonify({"status": "ok"}), 200'
    if needle2 in content:
        new_content = content.replace(needle2, insert + needle2, 1)
        open(path, 'w').write(new_content)
        print('Patch OK (fallback)')
    else:
        print('ERRO: needle não encontrado. Verifique manualmente.')
        print(repr(content[content.find('if error'):content.find('if error')+200]))
