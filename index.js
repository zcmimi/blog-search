const file='https://blog.zcmimi.top/pure_data.json', // json数据文件位置
    origin='blog.zcmimi.top',
    preview_len=70; // 预览字数
const fetch=require('node-fetch'),
    schedule=require('node-schedule');
var data;
async function getData(){
    await fetch(file).then(res=>res.json()).then(res=>data=res);
    console.log('UPDATED');
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
    if(!data)await getData();
    var res=[];
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
        'Access-Control-Allow-Origin': origin,
        'Access-Control-Allow-Methods':'POST,GET',
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

var hassh;
app.get('/update',async(req,res)=>{
    getData();
    res.send('success');
    if(!hassh)hassh=schedule.scheduleJob('*/30 * * * * *',getData);
})

app.server=app.listen(port,host,()=>{
    console.log(`server running @ http://${host?host:'localhost'}:${port}`);
});