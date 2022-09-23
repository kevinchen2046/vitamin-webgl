
const fs=require("fs");
const path=require("path");
let $_GID=1;
/**对象工具类 */
 class ObjectUtil {
        static guid(target) {
            return (target.$_GID || (target.$_GID = $_GID++));
        }
    }
    
    /**
     * 对象字典 
     * - 将对象作为键值的哈希表 
     * */
     class ObjectDictionary {
    
        /**
         * 取该对象对应值
         * @param target 
         * @returns 
         */
        get(target) {
            let guid = ObjectUtil.guid(target);
            return this[guid];
        }
    
        /**
         * 设置该对象对应值
         * @param target 
         * @param value 
         */
        set(target, value) {
            let guid = ObjectUtil.guid(target);
            this[guid] = value;
            return value;
        }
    
        /**
         * 移除该对象键值
         * @param target target为空则清理所有对象键值
         * @returns 
         */
        remove(target) {
            if (target) {
                let guid = ObjectUtil.guid(target);
                this[guid] = null;
                delete this[guid];
                return;
            }
            let guids = Object.keys(this);
            for (let guid of guids) {
                this[guid] = null;
                delete this[guid];
            }
        }
    }

  let dic=new ObjectDictionary();
  
  class Item {
        
  }

  let a=new Item();
  let b=new Item();

  dic.set(a,"a");
  dic.set(b,"b");
  console.log(dic,dic.get(a));

  console.log(dic,Object.values(dic));
// let str1="n31232";
// let str2="na31232";
// let str3="n0";
// let str4="nobody123";

// function isVaild(name){
//     return !(name.charAt(0)=="n"&&!Number.isNaN(Number(name.substring(1,name.length))));
// }

// console.log(isVaild(str1),isVaild(str2),isVaild(str3),isVaild(str4));


// console.log(Array.from({length:10},(v,i)=>`part${i}`));

// let map={a:1,b:2};

// console.log(delete map["a"],delete map["34"]);

// let constructorString=`class AppearWnd extends WindowAbstractBase {
//     constructor() {
//         super();
//     }
//     onInit() { super.onInit(); }
//     onResizeHandler() { this.setSize(Laya.stage.width, Laya.stage.height); }
//     onShown() {
//         super.onShown();
//     }
//     onHide() {
//         super.onHide();
//     }
// }`;

// console.log(constructorString.match(/class(.*?){/)[1].trim().split(" ")[0])
// let folders=fs.readdirSync("./book/WebGL_Guide_Code/");
// folders=folders.filter(v=>(["resources","lib"].indexOf(v)==-1))

// async function exec(){
//     for(let folder of folders){
//         let files=fs.readdirSync(`./book/WebGL_Guide_Code/${folder}`);
//         files=files.filter(v=>path.extname(v)==".js").map(v=>`./book/WebGL_Guide_Code/${folder}/${v}`);
        
//         for(let file of files){
//             let name=path.basename(file).replace(".js","");
//             let out=`./src/${folder}-${name}.ts`;
//             let content=fs.readFileSync(file,"utf-8");
//             content=content.replace("function main() {",`class ${name} {\n  constructor() {`);
//             fs.writeFileSync(out,content,"utf-8");
//             console.log(out);
//         }
        
//     }
// }
// exec();


// const ws = require("ws");

// class ServerSocket {
//     constructor(port) {
//         let uid = 0;
//         const server = new ws.Server({ port:port });

//         let clients = this.clients = {};
//         server.on("connection", (client) => {
//             client.id = `client_${uid++}`;
//             clients[client.id] = client;
//             console.log("connectioned:",client.id);
//             // client.setEnCoding("utf8");
//             function dataHandler(data) {
//                 console.log("client:", data.toString());
//             }
//             function closeHandler(data) {
//                 client.off("data", dataHandler);
//                 client.off("close", closeHandler);
//                 client.off("error", closeHandler);
//                 let id = client.id;
//                 clients[id] = null;
//                 delete clients[id];
//                 console.log("closed:",id,Object.values(clients).length);
//             }
//             client.on("data", dataHandler);
//             client.on("close", closeHandler);
//             client.on("error", closeHandler);

//             this.send("hello!")
//         })
//     }
//     send(data) {
//         for (var key in this.clients) {
//             if (this.clients[key]) {
//                 this.clients[key].send(data);
//             }
//         }
//     }
//     refresh() {
//         this.send("refresh");
//     }
// }

// let server=new ServerSocket(5656);


// function createClient(){
//     let socket=new ws.WebSocket("ws://localhost:5656");
//     socket.onmessage=(e)=>console.log(e.data);
//     setTimeout(()=>socket.close(),2000);
// }

// setInterval(createClient,1000);