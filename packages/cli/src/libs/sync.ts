import http from 'http';
import fs from 'fs';
import path from 'path';
import { exec } from 'child_process';

// 创建HTTP服务器
const server = http.createServer((req, res) => {
	// 处理根路径请求
	const purePath = req.url?.slice(0, req.url.indexOf('?'))
	if (!purePath || purePath === '/') {
		const html = fs.readFileSync(path.join(__dirname, '../server/index.html'));
		res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8',  });
		return res.end(html);
	}

	// 处理其他静态文件
	const filePath = path.join(__dirname, req.url as string);
	if (fs.existsSync(filePath)) {
		const content = fs.readFileSync(filePath);
		res.end(content);
	} else {
		res.writeHead(404);
		res.end('Not found');
	}
});

const port = 56789;
const baseURL = `http://localhost:${port}`
const url = `${baseURL}?ws=ws://localhost:${port}`

// 启动服务
server.listen(port, () => {
	console.log(`Server running at ${baseURL}`);
	exec(`open "${url}"`);
});
