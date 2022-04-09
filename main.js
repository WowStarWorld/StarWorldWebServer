const http = require('http');
const fs = require('fs')
const path = require('path');
const { execSync } = require('child_process');
const colors = require("colors");
const prompt = require("prompt");
const { exit } = require('process');


let version = '7.0.5';
prompt.message = "";
prompt.delimiter = "";

let config = JSON.parse(fs.readFileSync(path.join(__dirname, 'config.json'), 'utf-8'));
const statuscode ={
    404: config.statuscode[404],
    500: config.statuscode[500],
}
var server = http.createServer(function (request, response) {
    if (config.output.enable_connect_message){
        if (request.headers.referer == undefined){
            console.log(colors.bold.blue(`\b\b\b\b\b${request.connection.remoteAddress}发送了一个${request.method}请求 \"${request.url}\"`));
            process.stdout.write(colors.bold.green(">"));
        }else{
            console.log(colors.bold.blue(`\b\b\b\b\b${request.connection.remoteAddress}使用${request.headers.referer}发送了一个${request.method}请求 \"${request.url}\"`));
            process.stdout.write(colors.bold.green(">"));
        }
    }

    if (config.output.enable_headers){console.log(colors.bold.green("请求头:",request.headers));}
    fs.readFile(`./server${decodeURI(request.url).split("?")[0]}` , (err, data) => {
        if (err) {
            if (!fs.stat.isFile) {
                fs.readFile(`./server${decodeURI(request.url).split("?")[0]}index.html`, (err, data) => {
                    if (err) {
                        if (fs.stat.isFile) {
                            response.writeHead(500, {
                                'Content-Type': 'text/html'
                            });
                            if (config.output.enable_status_code) console.log(colors.bold.blue("状态码：500"));
                            response.end(statuscode[500]);
                            
                        } else {
                            fs.readFile(`./server${decodeURI(request.url).split("?")[0]}.html`, (err, data) => {
                                if (err) {
                                    if (fs.stat.isFile) {
                                        response.writeHead(404, {
                                            'Content-Type': 'text/html'
                                        });
                                        if (config.output.enable_status_code) console.log(colors.bold.blue("状态码：404"));
                                        response.end(statuscode[404]);
                                    } else {
                                        response.writeHead(404, {
                                            'Content-Type': 'text/html'
                                        });
                                        if (config.output.enable_status_code) console.log(colors.bold.blue("状态码：404"));
                                        response.end(statuscode[404]);
                                    }
                                } else {
                                    response.writeHead(200, {
                                        'Content-Type': 'text/html'
                                    });
                                    if (config.output.enable_status_code) console.log(colors.bold.blue("状态码：200"));
                                    response.end(data);
                                }
                            });

                            
                        }
                    } else {
                        response.writeHead(200, {
                            'Content-Type': 'text/html'
                        });
                        if (config.output.enable_status_code) console.log(colors.bold.blue("状态码：200"));
                        response.end(data);
                    }
                });

            
            }else{
                if (config.output.enable_status_code) console.log(colors.bold.blue("状态码：500"));
                response.end(
                `${statuscode[500]}`
                );
                
            }

            return;
        }
        response.write(data);     
        if (config.output.enable_status_code) console.log(colors.bold.blue("状态码：200"));
        response.end()
        
    })
    
    
})
server.listen(config.address.port,config.address.host)
if (config.output.enable_start_message) {
    console.log(colors.bold.yellow(`StarWorld WebServer (tags/${version}) [Node.js ${process.version}] on ${process.platform}`));
    console.log(colors.bold.yellow(`服务器已在${config.address.host}:${config.address.port}启动`))
}
function LoopGetInput(message, callback) {
    prompt.start();
    prompt.get(message, function (err, result) {
        if (err) {
            console.log(err);
            return;
        }
        callback(result);
        LoopGetInput(message, callback);
    });
}


if (config.kernel.enable_run_command) execSync(config.kernel.run_command)
function replhelp() {
console.log(colors.bold.blue(`
help: 显示帮助
start: 启动服务器
restart: 重启服务器
stop: 停止服务器
exit: 退出服务器
`));
}
LoopGetInput(
    {
        properties: {
            input: {
                description: `${colors.bold.green(">")}`,
                required: true,
                message: colors.red("\b\b\b\b\b\b\b\b\bEOF错误，请重新输入。"),
            }
        }
    },
    function (result) {
        switch(result.input){
            case "exit":
                console.log(colors.blue("再见！"));
                exit();
                break;
            case "stop":
                try{
                    server.close()
                    console.log(colors.red("服务器已停止"));
                }catch(err){
                    console.log(colors.red("服务器停止失败："+err));
                }
                break;
            case "restart":
                try{
                    console.log(colors.red("正在关闭服务器..."));
                    server.close()
                    console.log(colors.blue("正在启动服务器..."));
                    let config = JSON.parse(fs.readFileSync(path.join(__dirname, 'config.json'), 'utf-8'));
                    server.listen(config.address.port,config.address.host)
                    if (config.kernel.enable_run_command) execSync(config.kernel.run_command)
                }catch(err){
                    console.log(colors.red("服务器重启失败："+err));
                }
                break;
            case "start":
                try{
                    let config = JSON.parse(fs.readFileSync(path.join(__dirname, 'config.json'), 'utf-8'));
                    console.log(colors.blue("正在启动服务器..."));
                    server.listen(config.address.port,config.address.host)
                    if (config.kernel.enable_run_command) execSync(config.kernel.run_command)
                }catch(err){
                    console.log(colors.red("服务器启动失败："+err));
                }
                break;
            case "help":
                replhelp();
                break;
            case "命令":
                console.log(colors.bold.blue(`已知命令：命令`));
                break;
            case "已知命令":
                console.log(colors.bold.blue(`已知命令：已知命令`));
                break;
            default:
                console.log(colors.red("未知命令："+result.input));
                break;
        }
    }
);
