
// const {watch ,task } = require("gulp");
const fs = require("fs");
const path = require("path");
const gulp = require("gulp");
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
        fs.writeFileSync(
            `./bin/${name}.html`,
            template
                .replace("[title]", name)
                .replace(/\[name\]/g, name),
            "utf-8");
    }
    console.log("sucess!");
}
gulp.task("build", build);
//创建一个名称为compile的gulp任务
gulp.task("watch", function () {
    /**
    * @ 监听src目录下的所有子目录的所有文件，
    * @ 延迟1000毫秒，才执行下次监听，避免手欠的同学，因连续保存触发多次连续编译
    * @ 监听生效后执行的函数
    */
    gulp.watch('src/**/*.*', { delay: 1000 }, build);
});

