import inquirer from 'inquirer'
import { readdirSync } from 'fs'
import { isDirectory, getProjectConfig } from './../utils'

const homeDir = process.env.HOME
const ignoredDirs = ['node_modules', 'dist', '.Trash']
const ignoredFiles = ['package-lock.json', 'yarn.lock', '.gitignore', '.git', '.DS_Store', '.vscode', 'package.json']
const ignoredPrefix = ['.']
const ignoredNoPermissionPaths = ['Library', 'Application Support', 'Pictures']

export const scan = () => {
	inquirer.prompt([
		{
			type: 'input',
			name: 'dirPath',
			message: '请输入需要扫描的文件夹路径（建议指定目录以提升扫描效率）',
			default: homeDir
		}
	]).then((answers) => {
		const dirPath = answers.dirPath

		let userConfigs: {
			[key: string]: number
		} = {}

		const readConfig = (filePath: string) => {
			if (isDirectory(filePath)) {
				const files = readdirSync(filePath)

				const isGitDir = () => {
					return files.some((file) => file === '.git')
				}

				if (isGitDir()) {
					try {
						const {name, email} = getProjectConfig(filePath)
						const stringifyConfig = `${name}<${email}>`
						if (!userConfigs[stringifyConfig]) {
							userConfigs[stringifyConfig] = 1
						} else {
							userConfigs[stringifyConfig] += 1
						}
						console.log(`扫描目录 ${filePath} Git配置: ${stringifyConfig}>`)
					} catch (error) {
						console.log('error', error)
					}
				} else {
					files.forEach((fileName: string) => {
						const fullPath = `${filePath}/${fileName}`
						if (![...ignoredDirs, ...ignoredFiles].includes(fileName) && !ignoredPrefix.some((prefix) => fileName.startsWith(prefix)) && !ignoredNoPermissionPaths.some((path) => fullPath.includes(path))) {
							readConfig(fullPath)
						}
					})
				}
			}
		}

		readConfig(dirPath)

		const getAnalyzeRes = (userConfigs: Record<string, number>) => {
			let res = '\n统计结果\n'
			Object.keys(userConfigs).forEach((key) => {
				res = `${res}${userConfigs[key]} 个目录使用了配置 ${key}\n`
			})
			return res
		}

		console.log(getAnalyzeRes(userConfigs))
	})
}
