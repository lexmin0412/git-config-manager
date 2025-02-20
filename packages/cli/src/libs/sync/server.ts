import http from "http";
import fs from "fs";
import path from "path";
import puppeteer from "puppeteer";
import { UserConfig } from "../../types";

export const createServerAndOpenPage = async (options: {
	localConfig: UserConfig[],
	remoteConfig: UserConfig[],
}) => {
	return new Promise<UserConfig[]>((resolve, reject) => {
		// 创建HTTP服务器
		const server = http.createServer((req, res) => {
			// 处理根路径请求
			const purePath = req.url?.slice(0, req.url.indexOf("?"));
			if (!purePath || purePath === "/") {
				const html = fs.readFileSync(
					path.join(__dirname, "../../../server/index.html")
				);
				res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
				return res.end(html);
			}

			// 处理其他静态文件
			const filePath = path.join(__dirname, req.url as string);
			if (fs.existsSync(filePath)) {
				const content = fs.readFileSync(filePath);
				res.end(content);
			} else {
				res.writeHead(404);
				res.end("Not found");
			}
		});

		const port = 56789;
		const baseURL = `http://localhost:${port}`;
		const url = `${baseURL}?ws=ws://localhost:${port}`;

		/**
		 * 打开冲突处理页面
		 */
		const openConflictWebPage = async (cb: (type: 'success', data: any) => void) => {
			const browser = await puppeteer.launch({
				headless: false,
			});
			const page = await browser.newPage();
			await page.goto(url);
			// 给页面注入全局变量
			await page.addScriptTag({
				content: `
				window.GCM = {
					localConfig: ${JSON.stringify(options.localConfig)},
					remoteConfig: ${JSON.stringify(options.remoteConfig)},
				};
				document.querySelector('#localConfig').value = JSON.stringify(window.GCM.localConfig, null, 2);
				document.querySelector('#remoteConfig').value = JSON.stringify(window.GCM.remoteConfig, null, 2);
			`,
			});
			// 监听页面中的点击事件
			await page.exposeFunction("onClickEvent", (event: any) => {
				console.log("点击事件发生:", event);
				if (event.target === 'submit_btn') {

					// TODO 校验配置
					let parsedData = []
					try {
						parsedData = JSON.parse(event.data)
					} catch (e) {
						console.log('解析失败', e)
					}
					if (!parsedData?.length) {
						console.error('配置为空，请检查配置是否正确')
						process.exit(1);
					}
					cb('success', parsedData)
					browser.close();
				}
			});

			// 在页面中注入 JavaScript 代码来监听点击事件
			await page.evaluate(() => {

				document.addEventListener("click", (event) => {
					console.log('合并输入框', document.querySelector('#mergedConfig'))
					console.log('合并输入框的值', document.querySelector('#mergedConfig')?.innerHTML)
					// 调用 Node.js 中暴露的函数
					// @ts-ignore
					window.onClickEvent({
						// @ts-ignore
						target: event.target?.id,
						// @ts-ignore
						data: document.querySelector('#mergedConfig')?.value
					});
				});
			});
		};

		// 启动服务
		server.listen(port, async () => {
			console.log(`Server running at ${baseURL}`);
			// 获取本地配置内容
			openConflictWebPage((type, data) => {
				if (type == 'success') {
					// TODO 提交配置
					console.log('提交配置', data)
					resolve(data);
				}
			});
		});

	})
};
