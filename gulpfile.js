// 引入插件需要的包
var through = require('through2');

// 定义gulp插件主函数
// option:{prefix:string,suffix:string}
function concat(option){

    // 创建stream对象，每个文件都会经过这个stream对象
    var stream = through.obj(function(file, encoding, callback){
        // 文件经过stream时要执行代码
        // 如果file类型不是buffer 退出不做处理
        if(!file.isBuffer()){
            return callback();
        }
        var streamContents=[file.contents];
        if(option.prefix){
            streamContents.unshift(Buffer.from(option.prefix+"\n"))
        }
        if(option.suffix){
            streamContents.push(Buffer.from("\n"+option.suffix))
        }
        // 将字符串跟源文件合并
        file.contents = Buffer.concat(streamContents);

        // 确保文件会传给下一个插件
        this.push(file);

        callback();
    });

    // 返回stream对象
    return stream;
};


var gulp = require('gulp');
var ts = require('gulp-typescript');

const tsProject = ts.createProject("tsconfig.json");

function build(cb) {
    return tsProject.src()
        .pipe(tsProject())
        .js.pipe(concat({suffix:"window.vitamin=vitamin;"}))
        .pipe(gulp.dest("."));
}
gulp.task("default",build);