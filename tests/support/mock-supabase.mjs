// Test-only Supabase HTTP double. Never imported by the application.
import { createServer } from 'node:http';
import { randomUUID } from 'node:crypto';
const tables={love_tests:[],love_uploads:[]};
const files=new Map();const rates=new Map();
const server=createServer(async(req,res)=>{
  res.setHeader('Access-Control-Allow-Origin','http://localhost:3100');res.setHeader('Access-Control-Allow-Headers','content-type,cache-control,x-upsert,authorization,apikey,x-client-info');res.setHeader('Access-Control-Allow-Methods','GET,POST,PUT,PATCH,DELETE,OPTIONS');
  if(req.method==='OPTIONS'){res.writeHead(204);res.end();return;}
  const url=new URL(req.url,'http://localhost:5055');const path=url.pathname;
  const chunks=[];for await(const chunk of req)chunks.push(chunk);const bytes=Buffer.concat(chunks);
  let body={};try{body=JSON.parse(bytes.toString());}catch{}
  const json=(data,status=200)=>{res.writeHead(status,{'Content-Type':'application/json'});res.end(JSON.stringify(data));};
  if(path==='/__state'){json(tables);return;}
  if(path==='/rest/v1/rpc/love_rate_limit'){const key=body.p_key;const count=(rates.get(key)??0)+1;rates.set(key,count);json(count<=body.p_limit);return;}
  const name=path.split('/').pop();
  if(path.startsWith('/rest/v1/')&&tables[name]){
    const matches=row=>[...url.searchParams].every(([key,value])=>['select','order'].includes(key)||value.startsWith('eq.')&&String(row[key])===value.slice(3)||value.startsWith('in.(')&&value.slice(4,-1).split(',').includes(String(row[key])));
    if(req.method==='POST'){tables[name].push({...body,created_at:new Date().toISOString(),deleting:false,verified:false});json(null,201);return;}
    if(req.method==='PATCH'){tables[name].filter(matches).forEach(row=>Object.assign(row,body));json(null);return;}
    if(req.method==='DELETE'){const rows=tables[name].filter(matches);tables[name]=tables[name].filter(row=>!matches(row));if(name==='love_tests')tables.love_uploads=tables.love_uploads.filter(row=>!rows.some(test=>test.id===row.test_id));json(null);return;}
    const result=tables[name].filter(matches);json(req.headers.accept?.includes('vnd.pgrst.object')?(result[0]??null):result);return;
  }
  if(path.startsWith('/storage/v1/')){
    const filePath=decodeURIComponent(path.split('/love-media/')[1]??'');
    if(req.method==='POST'&&path.includes('/upload/sign/')){json({url:`/object/upload/sign/love-media/${filePath}?token=test`});return;}
    if(req.method==='PUT'&&path.includes('/upload/sign/')){files.set(filePath,{bytes,type:req.headers['content-type']});json({Key:`love-media/${filePath}`,Id:randomUUID()});return;}
    if(req.method==='POST'&&path.includes('/object/sign/')){json({signedURL:`/object/sign/love-media/${filePath}?token=test`});return;}
    if(req.method==='DELETE'){for(const prefix of body.prefixes??[])files.delete(prefix);json([]);return;}
    if(req.method==='GET'){const file=files.get(filePath);if(!file){json({error:'Not found'},404);return;}res.writeHead(200,{'Content-Type':file.type});res.end(file.bytes);return;}
  }
  json({error:'Unknown test endpoint'},404);
});
server.listen(5055,'127.0.0.1',()=>console.log('Test-only Supabase double listening on 5055'));
