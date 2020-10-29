const file='https://blog.zcmimi.top/pure_data.json', // json数据文件位置
    preview_len=70; // 预览字数
const fetch=require('node-fetch'),
    fs=require('fs'),
    schedule=require('node-schedule');
async function getData(){
    await fetch(file,{
        method:'GET',
        headers:{'Content-Type':'application/octet-stream'},
    }).then(res=>res.buffer()).then(data=>{
        fs.writeFile("./data.json",data,"binary",(err)=>{
            if(err)console.error(err);
            else console.log("updated");
        });
    })
}
function chk(content,text,typ=0){
    content=content.toLowerCase();
    if(typ==0)return content.indexOf(text)!=-1;
    else if(typ==1){
        for(var i=0,j=0;i<content.length;++i)
            if(content[i]==text[j])
                if(++j==text.length)return 1;
    }
    return 0;
}
async function search(text,typ=0){
    console.log('SEARCH',text);
    text=text.toLowerCase();
    if(!fs.existsSync('./data.json'))await getData();
    var res=[],data=require('./data.json');
    for(var node of data){
        var f=chk(node.title,text,typ);
        if(!f)
        for(var tag of node.tags)
            if(chk(tag,text,typ)){f=1;break;} 
        if(!f)
        for(var categorie of node.categories)
            for(var k of categorie)
                if(chk(k,text,typ)){f=1;break;}
        else if(chk(node.content,text,typ))f=1;
        if(f)res.push([node.link,node.title,node.content.substring(0,preview_len)]);
    }
    return JSON.stringify(res);
}
/*------------------------------------------------------------*/
 
const port=process.env.PORT||3000,host=process.env.HOST||'';
const express=require('express'),app=express(),url=require('url');

app.get('/',async(req,res)=>{
    res.status(200);
    res.set({
        'Access-Control-Allow-Credentials': true,
        'Access-Control-Allow-Origin': req.headers.origin || '*',
        'Access-Control-Allow-Headers': 'X-Requested-With,Content-Type',
        'Access-Control-Allow-Methods': 'PUT,POST,GET,DELETE,OPTIONS',
        'Content-Type': 'application/json; charset=utf-8'
    });
    var realurl=decodeURI(req.url);
    if(realurl.indexOf("keyword=")==-1||realurl.indexOf("?")==-1){
        res.send("usage:\n?keyword=<keyword>&typ=<typ>\nrequired: keyword");
        return;
    }
    var params=url.parse(realurl,true).query,
        key=params.keyword,typ=params.typ,
        ans=await search(key,typ);
    res.send(ans);
})

app.get('/update',async(req,res)=>{
    await getData();
    res.send('UPDATED');
})
// getData();
// schedule.scheduleJob('*/1 * * * *',getData);

app.server=app.listen(port,host,()=>{
    console.log(`server running @ http://${host?host:'localhost'}:${port}`);
});