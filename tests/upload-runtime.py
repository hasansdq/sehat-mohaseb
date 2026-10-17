#!/usr/bin/env python3
"""Production-server checks using an isolated SQLite DB and disposable images."""
import http.client
import json
import os
from pathlib import Path
import secrets
import sqlite3
import subprocess
import tempfile
import time
import urllib.error
import urllib.request

root = Path(__file__).resolve().parents[1]
port = 3918
with tempfile.TemporaryDirectory(prefix='sehat-upload-test-') as tmp:
    tmp = Path(tmp)
    password = secrets.token_urlsafe(24)
    env = dict(os.environ, NODE_ENV='production', APP_DIR=str(root),
               JWT_SECRET=secrets.token_hex(32), ADMIN_PASSWORD=password,
               ADMIN_USERNAME='uploadtest', DATABASE_URL='file:' + str(tmp / 'app.db'),
               PORT=str(port), HOSTNAME='127.0.0.1')
    startup = subprocess.run(['sh', 'docker-entrypoint.sh', 'true'], cwd=root,
                             env=env, capture_output=True, text=True, timeout=45)
    assert startup.returncode == 0, startup.stderr
    with sqlite3.connect(tmp / 'app.db') as connection:
        connection.execute('INSERT INTO Setting (id, key, value, "group", updatedAt) VALUES (?, ?, ?, ?, ?)',
                           ('review-secret', 'openai.apiKey', 'FAKE_REVIEW_SENTINEL', 'openai', int(time.time() * 1000)))
    png = subprocess.check_output(['node', '-e',
        "require('sharp')({create:{width:2,height:2,channels:3,background:'#336699'}}).png().toBuffer().then(b=>process.stdout.write(b))"], cwd=root)
    uploads = root / '.next/standalone/public/uploads'
    uploads.mkdir(parents=True, exist_ok=True)
    created = []
    log = (tmp / 'server.log').open('w')
    server = subprocess.Popen(['node', '.next/standalone/server.js'], cwd=root, env=env,
                              stdout=log, stderr=subprocess.STDOUT)
    def request(path, body=None, cookie=None, content_type='application/json', headers=None):
        h = {'Content-Type': content_type}
        if cookie: h['Cookie'] = cookie
        h.update(headers or {})
        req = urllib.request.Request(f'http://127.0.0.1:{port}' + path, data=body, headers=h)
        try:
            with urllib.request.urlopen(req, timeout=15) as res:
                return res.status, res.headers, res.read()
        except urllib.error.HTTPError as res:
            return res.code, res.headers, res.read()
    def multipart(data, mime='image/png', name='test.png'):
        boundary = 'sehat-' + secrets.token_hex(12)
        body = (f'--{boundary}\r\nContent-Disposition: form-data; name="file"; filename="{name}"\r\nContent-Type: {mime}\r\n\r\n'.encode()
                + data + f'\r\n--{boundary}--\r\n'.encode())
        return body, 'multipart/form-data; boundary=' + boundary
    try:
        for _ in range(100):
            try:
                if request('/api/public/site')[0] == 200: break
            except (urllib.error.URLError, ConnectionError): pass
            if server.poll() is not None: raise AssertionError((tmp/'server.log').read_text())
            time.sleep(0.1)
        else: raise AssertionError('Server did not start')
        status, _, settings_response = request('/api/public/site')
        assert status == 200 and b'FAKE_REVIEW_SENTINEL' not in settings_response
        assert 'openai.apiKey' not in json.loads(settings_response)['data']['settings']
        assert request('/')[0] == 200
        assert request('/sehat-ad/articles')[0] == 200
        body, mime = multipart(png)
        assert request('/api/admin/upload', body, content_type=mime)[0] == 401
        status, headers, data = request('/api/admin/login', json.dumps({'username':'uploadtest','password':password}).encode())
        assert status == 200, (status, data)
        cookie = headers['Set-Cookie'].split(';')[0]
        status, _, data = request('/api/admin/upload', body, cookie, mime)
        assert status == 200, (status, data)
        url = json.loads(data)['data']['url']
        assert url.startswith('/api/uploads/')
        created.append(uploads / url.rsplit('/', 1)[1])
        status, headers, data = request(url)
        assert status == 200 and headers['Content-Type'] == 'image/png' and data.startswith(b'\x89PNG')
        assert headers['X-Content-Type-Options'] == 'nosniff'
        assert request(url, headers={'If-None-Match':headers['ETag']})[0] == 304
        assert request(url.replace('/api/uploads/', '/uploads/'))[0] == 200
        # Add a legacy image after server startup; the rewrite must serve it immediately.
        legacy = uploads / ('legacy-' + secrets.token_hex(8) + '.png')
        legacy.write_bytes(png); created.append(legacy)
        assert request('/uploads/' + legacy.name)[0] == 200
        outside = tmp / 'private.png'; outside.write_bytes(b'PRIVATE')
        link = uploads / ('symlink-' + secrets.token_hex(8) + '.png')
        link.symlink_to(outside); created.append(link)
        assert request('/api/uploads/' + link.name)[0] == 403
        assert request('/api/uploads/%2e%2e%2fprivate.png')[0] == 403
        assert request('/api/uploads/unknown.txt')[0] == 404
        assert request('/api/uploads/missing.png')[0] == 404
        for image, claimed in [(b'RIFF'+bytes(4)+b'WAVE','image/webp'),
                               (b'<svg/>','image/svg+xml'), (b'\x89PNG\r\n\x1a\nFAKE','image/png')]:
            body, mime = multipart(image, claimed)
            assert request('/api/admin/upload', body, cookie, mime)[0] == 422
        connection = http.client.HTTPConnection('127.0.0.1', port, timeout=15)
        connection.putrequest('POST', '/api/admin/upload')
        connection.putheader('Cookie', cookie)
        connection.putheader('Content-Type', 'multipart/form-data; boundary=oversized')
        connection.putheader('Content-Length', str(6 * 1024 * 1024))
        connection.endheaders()
        assert connection.getresponse().status == 413
        connection.close()
        print('PASS: auth, valid image upload, production image reads, legacy rewrite, ETag, symlink/traversal rejection, invalid images, request size limit')
    finally:
        server.terminate(); server.wait(timeout=10); log.close()
        for p in created: p.unlink(missing_ok=True)
