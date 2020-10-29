const file='https://blog.zcmimi.top/pure_data.json', // json数据文件位置
    preview_len=70; // 预览字数
const fetch=require('node-fetch'),
    schedule=require('node-schedule');
var data;
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
    text=text.toLowerCase();
    var res=[];
    for(i in data){
        var f=0;
        if(chk(data[i].title,text,typ))f=1;
        else for(j in data[i].tags)
            if(chk(data[i].tags[j],text,typ)){
                f=1;
                break;
            }
        else for(j in data[i].categories)
            for(k in data[i].categories[j])
                if(chk(data[i].categories[j][k],text,typ)){
                    f=1;
                    break;
                }
        else if(chk(data[i].content,text,typ))f=1;
        if(f)res.push([data[i].link,data[i].title,data[i].content.substring(0,preview_len)]);
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

function getData(){
    fetch(file).then(res=>res.json()).then(json=>{data=json});
}
getData();
schedule.scheduleJob('*/1 * * * *',getData);

app.server=app.listen(port,host,()=>{
    console.log(`server running @ http://${host?host:'localhost'}:${port}`);
});