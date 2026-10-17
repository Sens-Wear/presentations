// Dependency-free local preview server, bound only to this computer.
const http=require('node:http');
const fs=require('node:fs');
const path=require('node:path');
const {execFile}=require('node:child_process');
const root=__dirname;
const requestedPort=Number(process.env.PORT||8123);
const types={'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.svg':'image/svg+xml','.png':'image/png','.jpg':'image/jpeg','.ttf':'font/ttf','.pdf':'application/pdf','.mp4':'video/mp4','.md':'text/plain; charset=utf-8','.json':'application/json; charset=utf-8'};
const server=http.createServer((req,res)=>{
  let pathname;try{pathname=decodeURIComponent(new URL(req.url,'http://127.0.0.1').pathname);}catch{res.writeHead(400);res.end('Bad request');return;}
  let file=path.resolve(root,'.'+pathname);
  if(file!==root&&!file.startsWith(root+path.sep)){res.writeHead(403);res.end('Forbidden');return;}
  if(pathname.endsWith('/'))file=path.join(file,'index.html');
  fs.stat(file,(err,stat)=>{
    if(err||!stat.isFile()){res.writeHead(404);res.end('Not found');return;}
    res.writeHead(200,{'Content-Type':types[path.extname(file)]||'application/octet-stream','Cache-Control':'no-cache','X-Content-Type-Options':'nosniff'});
    fs.createReadStream(file).pipe(res);
  });
});
server.on('error',error=>{if(error.code==='EADDRINUSE'){server.listen(0,'127.0.0.1');}else{console.error(error);process.exit(1);}});
server.listen(requestedPort,'127.0.0.1',()=>{
  const url=`http://127.0.0.1:${server.address().port}`;
  console.log(`SensWear: ${url}\nArrow keys: slides | F: full screen | S: speaker notes\nClose this window or press Ctrl+C to stop.`);
  if(!process.argv.includes('--no-open')&&process.platform==='win32')execFile('rundll32.exe',['url.dll,FileProtocolHandler',url]);
});
