import subprocess,tempfile,pathlib,os,json,urllib.request,urllib.error,time,secrets,sqlite3
root=pathlib.Path(__file__).resolve().parents[1]
with tempfile.TemporaryDirectory(prefix='sehat-check-') as td:
 dbfile=pathlib.Path(td)/'test.db'; pw=secrets.token_urlsafe(20)
 env={**os.environ,'NODE_ENV':'production','APP_DIR':str(root),'DATABASE_URL':'file:'+str(dbfile),'JWT_SECRET':secrets.token_urlsafe(48),'ADMIN_PASSWORD':pw,'ADMIN_USERNAME':'deploytest','PORT':'3917','HOSTNAME':'127.0.0.1'}
 p=subprocess.run(['sh','docker-entrypoint.sh','node','-e','console.log("startup-complete")'],cwd=root,env=env,capture_output=True,text=True,timeout=30)
 print('fresh startup:',p.returncode)
 if p.returncode: print(p.stdout+p.stderr);raise SystemExit(1)
 con=sqlite3.connect(dbfile);con.execute("UPDATE Service SET title='KEEP-EDIT' WHERE slug='modiriat-mali'");con.commit()
 original=con.execute("SELECT value FROM Setting WHERE key='admin.passwordHash'").fetchone()[0]
 p=subprocess.run(['node','prisma/seed.cjs'],cwd=root,env={**env,'ADMIN_PASSWORD':secrets.token_urlsafe(20)},capture_output=True,text=True,timeout=15)
 assert p.returncode==0
 assert con.execute("SELECT title FROM Service WHERE slug='modiriat-mali'").fetchone()[0]=='KEEP-EDIT'
 assert con.execute("SELECT value FROM Setting WHERE key='admin.passwordHash'").fetchone()[0]==original
 print('seed preserves content and password: PASS')
 con.close()
 log=open('/tmp/sehat-ready-server.log','w')
 server=subprocess.Popen(['node','.next/standalone/server.js'],cwd=root,env=env,stdout=log,stderr=subprocess.STDOUT)
 def req(path,body=None,cookie=None):
  headers={'Content-Type':'application/json'}
  if cookie:headers['Cookie']=cookie
  r=urllib.request.Request('http://127.0.0.1:3917'+path,data=json.dumps(body).encode() if body is not None else None,headers=headers)
  try:
   with urllib.request.urlopen(r,timeout=10) as v:return v.status,v.headers,v.read()
  except urllib.error.HTTPError as e:return e.code,e.headers,e.read()
 try:
  for i in range(50):
   try:req('/');break
   except urllib.error.URLError:time.sleep(.1)
  assert req('/')[0]==200
  assert req('/api/public/site')[0]==200
  assert req('/api/admin/dashboard')[0]==401
  status,headers,_=req('/api/admin/login',{'username':'deploytest','password':pw});assert status==200,(status,_)
  cookie=headers['Set-Cookie'].split(';')[0]
  assert req('/api/admin/dashboard',cookie=cookie)[0]==200
  status,_,data=req('/api/admin/backups',{},cookie);assert status==200,(status,data)
  backup=json.loads(data)['data']['backup']['path']
  c=sqlite3.connect(backup);assert c.execute('PRAGMA integrity_check').fetchone()[0]=='ok';c.close()
  print('HTTP pages, admin auth and SQLite backup: PASS')
 finally:server.terminate();server.wait(timeout=5);log.close()
 bad={**env,'JWT_SECRET':''}
 p=subprocess.run(['sh','docker-entrypoint.sh','true'],cwd=root,env=bad,capture_output=True,text=True,timeout=5)
 assert p.returncode!=0
 print('missing-secret startup blocked: PASS')
