
// const {watch ,task } = require("gulp");
const fs = require("fs");
const path = require("path");
const gulp = require("gulp");
const ws = require("ws");
const { exec } = require("child_process");
const { resolve } = require("path");

function execCmd(cmd) {
    return new Promise((resolve => {
        let process = exec(cmd);
        process.stdout.on("data", (data) => {
            console.log(data);
        });
        process.stderr.on("data", (data) => {
            console.log(data);
        });
        process.on("exit", (code, signal) => {
            console.log(`${cmd}:done.`);
            // console.log(code, signal);
            resolve();
        })
    }))
}

async function build() {
    await execCmd("tsc");
    let template = fs.readFileSync("./template/template.html", "utf-8");
    let files = fs.readdirSync("./src");
    for (let file of files) {
        let name = path.basename(file).replace(".ts", "");
        let htmlContent = template
            .replace("[title]", name)
            .replace("[classname]", name.split("-")[1])
            .replace(/\[name\]/g, name);
        let fileContent = fs.readFileSync(`./bin/${name}.html`, "utf-8");
        if (htmlContent != fileContent) {
            fs.writeFileSync(`./bin/${name}.html`, htmlContent, "utf-8");
        }
    }
    console.log("sucess!");
}


async function startHttpService(port) {
    execCmd(`http-server . -c-1 -g --cors -p ${port}`);
    execCmd(`start http://localhost:${port}`);
}

class ServerSocket {
    constructor(port) {
        let uid = 0;
        const server = new ws.Server({ port: port });

        let clients = this.clients = {};
        server.on("connection", (client) => {
            client.id = `client_${uid++}`;
            clients[client.id] = client;
            // console.log("connectioned:",client.id);
            // client.setEnCoding("utf8");
            function dataHandler(data) {
                console.log("client:", data.toString());
            }
            function closeHandler(data) {
                client.off("data", dataHandler);
                client.off("close", closeHandler);
                client.off("error", closeHandler);
                let id = client.id;
                clients[id] = null;
                delete clients[id];
                // console.log("closed:",id,Object.values(clients).length);
            }
            client.on("data", dataHandler);
            client.on("close", closeHandler);
            client.on("error", closeHandler);
            // this.send("hello!")
        })
    }
    send(data) {
        for (var key in this.clients) {
            if (this.clients[key]) {
                this.clients[key].send(data);
            }
        }
    }
    refresh() {
        this.send("refresh");
    }
}

gulp.task("build", async function () {
    await execCmd("tsc");
});
//创建一个名称为compile的gulp任务
gulp.task("watch", function () {
    // startHttpService(38981)
    // let server = new ServerSocket(38982);
    /**
    * @ 监听src目录下的所有子目录的所有文件，
    * @ 延迟1000毫秒，才执行下次监听，避免手欠的同学，因连续保存触发多次连续编译
    * @ 监听生效后执行的函数
    */
    gulp.watch('src/**/*.*', { delay: 1000, queue: true }, async (done) => {
        await execCmd("tsc");
        // await build(); 
        // server.refresh();
        done();
    });
});

