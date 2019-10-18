import axios from 'axios';


const toString=Object.prototype.toString;
const isFunction=function(v){
    return toString.call(v)=="[object Function]";
}

// Array.prototype.indexOf = Array.prototype.indexOf ? Array.prototype.indexOf
//     : function(o, from)  {
//         from = from || 0;
//         var len = this.length;
//         from += (from < 0) ? len : 0;
//         for (; from < len; from++) {
//             console.log(this[from]);
//             console.log(o);
//             console.log(this[from] === o);
//             if (this[from] === o)
//                 return from;
//         }
//         return -1;
//     };

Array.prototype.remove = Array.prototype.remove ? Array.prototype.remove
    : function(o)  {
        let index = this.indexOf(o);
        if (index != -1) {
            this.splice(index, 1);
        }
    };

Function.prototype.createInterceptor=Function.prototype.createInterceptor?Function.prototype.createInterceptor
    :function(fn,scope){
        var method=this;
        return !isFunction(fn)?
            this:
            function(){
                var me=this,
                    arg=arguments;
                return (fn.apply(scope||me||global,arg)!==false)?
                    method.apply(me||global,arg):
                    null;
            }
    };

Function.prototype.replaceArguments=Function.prototype.replaceArguments?Function.prototype.replaceArguments
    :function(fn){
        var method=this;
        return !isFunction(fn)?
            this:
            function(){
                var me=this,
                    arg=arguments;
                return method.apply(me||global,fn.apply(null,arg));
            }
    };

Function.prototype.callInstance=function(obj){
    var method=this;
    return function(){
        var arg=arguments;
        return method.apply(obj,arg);
    }
};


Function.prototype.defer=function(){
    var method=this;
    var arg=arguments;
    return function(time){
        return new Promise((resolve)=>{
            setTimeout(()=>resolve(method.apply(this,arg)),time);
        });
    }
};

export const format = (txt, compress) => {

    var indentChar = '    ';
    if (/^\s*$/.test(txt)) {
        console.error('数据为空,无法格式化! ');
        return;
    }
    try {
        //var data=eval('('+txt+')');
        var data = JSON.parse(txt);
    } catch (e) {
        console.error('数据源语法错误,格式化失败! 错误信息: ' + e.description, 'err');
        return txt;
    };
    var draw = [],
        //last=false,This=this,
        //nodeCount=0,maxDepth=0,
        line = compress ? '' : '\n';

    var notify = function (name, value, isLast, indent/*缩进*/, formObj) {
        //nodeCount++;/*节点计数*/
        for (var j = 0, tab = ''; j < indent; j++)tab += indentChar;/* 缩进HTML */
        tab = compress ? '' : tab;/*压缩模式忽略缩进*/
        //maxDepth=
        ++indent;/*缩进递增并记录*/
        if (value && value.constructor === Array) {
            draw.push(tab + (formObj ? ('"' + name + '":') : '') + '[' + line);/*缩进'[' 然后换行*/
            for (let i = 0; i < value.length; i++)
                notify(i, value[i], i === value.length - 1, indent, false);
            draw.push(tab + ']' + (isLast ? line : (',' + line)));/*缩进']'换行,若非尾元素则添加逗号*/
        } else if (value && typeof value === 'object') {
            draw.push(tab + (formObj ? ('"' + name + '":') : '') + '{' + line);/*缩进'{' 然后换行*/
            var len = 0, i = 0;
            //for(var key in value)len++;
            len = len + Object.keys(value).length;
            for (var key in value) notify(key, value[key], ++i === len, indent, true);
            draw.push(tab + '}' + (isLast ? line : (',' + line)));/*缩进'}'换行,若非尾元素则添加逗号*/
        } else {
            if (typeof value === 'string') value = '"' + value + '"';
            draw.push(tab + (formObj ? ('"' + name + '":') : '') + value + (isLast ? '' : ',') + line);
        };
    };
    var isLast = true, indent = 0;
    notify('', data, isLast, indent, false);
    return draw.join('');
};

export const evil = (fn) => {
    fn.replace(/(\s?function\s?)(\w?)(\s?\(w+\)[\s|\S]*)/g, function (w, p1, p2, p3) {
        return p1 + p3;
    });
    let Fn = Function;
    return new Fn('return ' + fn)();
};

export const log = (target, name, descriptor) => {
    var oldValue = descriptor.value;
    descriptor.value = function () {
        console.log(`Calling ${name} with`, arguments);
        return oldValue.apply(null, arguments);
    };

    return descriptor;
};




export const baseUrl = 'http://127.0.0.1:7001';
export const kubeUrl = 'http://127.0.0.1:7002';
export const activitiUrl = "http://127.0.0.1:5001";



export function request(method, url, body) {
    method = method.toUpperCase();
    let params;
    if (method === 'GET') {
        // fetch的GET不允许有body，参数只能放在url中
        params = body;
        body=undefined;
    } else {
        body = body //&& JSON.stringify(body);
    }
    return axios({
        url:url,
        method:method,
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Access-Token': sessionStorage.getItem('access-token') || '',// 从sessionStorage中获取access token
        },
        data:body,
        params:params
    }).then((res) => {
        if (res.status === 401) {
            console.log('token失效!!');
            sessionStorage.clear();
            window.history.go('/login');
            return Promise.reject('Unauthorized.');
        } else {
            const token = res.headers['access-token'];
            if (token) {
                sessionStorage.setItem('access-token', token);
            }
            //console.log(res.json());
            return res.data;
        }
    }).catch((err)=>{
        if(err.response.status===401){
            console.log('token失效!');
            sessionStorage.clear();
            window.history.go('/login');
            return Promise.reject('Unauthorized.');
        }
    });
}

export const get = (url,body) => request('GET', url,body);
export const post = (url, body) => request('POST', url, body);
export const put = (url, body) => request('PUT', url, body);
export const del = (url, body) => request('DELETE', url, body);
export const patch = (url, body) => request('PATCH', url, body);

export const convertGiga = (byte) => {
    const units = ['byte','KB', 'MB', 'GB', 'TB'];
    for (let i = 0; i < units.length; i++) {
        if (byte < 1024){
            return {
                number: Math.round(byte * 100) / 100,
                unit: units[i]
            }}
        byte=byte/1024;
    }
    return {
        number: Math.round(byte * 100) / 100,
        unit: units[units.length - 1]
    }
};

export const convertGigaFormat = (byte) => {
    const data=convertGiga(byte);
    return data.number+data.unit;
};

export const dateFtt=(fmt,date)=>
{ //author: meizz
    var o = {
        "M+" : date.getMonth()+1,                 //月份
        "d+" : date.getDate(),                    //日
        "h+" : date.getHours(),                   //小时
        "m+" : date.getMinutes(),                 //分
        "s+" : date.getSeconds(),                 //秒
        "q+" : Math.floor((date.getMonth()+3)/3), //季度
        "S"  : date.getMilliseconds()             //毫秒
    };
    if(/(y+)/.test(fmt))
        fmt=fmt.replace(RegExp.$1, (date.getFullYear()+"").substr(4 - RegExp.$1.length));
    for(var k in o)
        if(new RegExp("("+ k +")").test(fmt))
            fmt = fmt.replace(RegExp.$1, (RegExp.$1.length==1) ? (o[k]) : (("00"+ o[k]).substr((""+ o[k]).length)));
    return fmt;
};

export const getPathById= (id, catalog, callback,idField) =>{
    //定义变量保存当前结果路径
    let temppath = [];
    try {
        function getNodePath(node) {
            temppath.push(node);
            //找到符合条件的节点，通过throw终止掉递归
            if (node[idField]+'' === id+'') {
                throw (new Error("got it!"));
            }
            if (node.children && node.children.length > 0) {
                for (let i = 0; i < node.children.length; i++) {
                    getNodePath(node.children[i]);
                }
                //当前节点的子节点遍历完依旧没找到，则删除路径中的该节点
                temppath.pop();
            }
            else {
                //找到叶子节点时，删除路径当中的该叶子节点
                temppath.pop();
            }
        }
        getNodePath(catalog);
    }
    catch (e) {
        callback(temppath);
    }
};
