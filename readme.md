## 思路与原理

利用vercel,leancloud,heroku,cloudflare workers等平台

让静态博客可以实现动态博客一样的搜索体验

受hexo站内搜索插件的启发,我们可以将所有文章数据整合到一个文件中实现静态网站的搜索

而随着文章的增多,数据越来越大,文件也随之增大,我的数据文件以达到`3.3MB`,

每次搜索都要加载较长时间,并且浪费了巨大的流量,用户只需要搜索的结果,却需要加载全部的数据

那么,我们是否可以在服务端搜索后再返回呢? 嗯,不错的想法

~~通过白嫖各大云平台,可以轻松实现我们的目的~~

## 使用

请先查看[数据格式](#数据格式)

### vercel

fork本仓库,将index.js中第一行的`file`修改为你的搜索数据文件地址,

再在vercel导入github仓库部署后即可访问

### leancloud

通过leancloud云引擎部署,通过git部署即可

国内版需绑定备案域名才能访问

国际版可以直接访问

### cloudflare worker

复制`cf worker/index.js`中代码,修改必要信息,粘贴到worker编辑界面脚本中,保存并部署即可

### heroku

fork本仓库,将index.js中第一行的`file`修改为你的搜索数据文件地址,

再在heroku选择从github部署

### 数据格式

请将文章数据整合成以下格式的json文件

```json
[
    {
        "title":"<title>",             // 标题
        "link":"<link>",               // 链接
        "tags":["tag1","tag2",/*...*/],// 标签
        "categories":[                 // 分类
            ["xx","xxx","xxxx",/*...*/],
            ["yy","yyy","yyyy"],
            /*...*/
        ],
        "content":"<content>"          // 内容
    },
    /*...*/
]
```

将会得到以下格式的json结果:

```json
[
    [
        "<link>",  // 链接
        "<title>", // 标题
        "<preview>"// 预览
    ],
    /*...*/
]
```

### 前端使用例

以[我的博客](https://blog.zcmimi.top)为例:

```html
<div class="mdui-progress" id='loading-progress' style="position: fixed;top:0;z-index: 999999;"><div class="mdui-progress-indeterminate"></div></div>
<div class="mdui-dialog" id="search_dialog">
    <div class="mdui-dialog-title">Search</div>
    <div class="mdui-dialog-content">
        <div class="mdui-textfield">
            <i class="mdui-icon material-icons">search</i>
            <input id="search_input" class="mdui-textfield-input" placeholder="搜索">
        </div>
        <div id="search_result" class="mdui-list"></div>
    </div>
</div>
```

```javascript
function search(api){ //接口地址
    document.getElementById('loading-progress').hidden=0;
    var text=document.getElementById("search_input").value.toLowerCase(),
        res=document.getElementById("search_result"),
        xhr=new XMLHttpRequest();
    res.innerHTML='';
    xhr.open('GET',api+'/?keyword='+text,true);
    xhr.onreadystatechange=function(){
        if(xhr.readyState==4){
            document.getElementById('loading-progress').hidden=1;
            var data=JSON.parse(this.responseText);
            for(i in data){
                var a=document.createElement('a'),
                    content=document.createElement('div'),
                    Title=document.createElement('div'),
                    Text=document.createElement('div');
                
                a.classList.add('mdui-list-item');
                Title.classList.add('mdui-list-item-title');
                Text.classList.add('mdui-list-item-text');
                content.classList.add('mdui-list-item-content');
                a.href=data[i][0]; // link
                Title.innerText=data[i][1]; // title
                Text.innerText=data[i][2].replace(/[\r\n]/g," "); // preview
                
                content.appendChild(Title),content.appendChild(Text);
                a.appendChild(content);
                
                res.appendChild(a);
            }
            search_dialog.handleUpdate();
        }
    }
    xhr.send();
}
```

### 服务器使用

```shell
git clone https://github.com/zcmimi/blog-search.git
cd blog-search
nano index.js
npm install
npm start
```

~~既然有服务器了,那就用动态博客嘛~~