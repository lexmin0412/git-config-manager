import inquirer from 'inquirer'
import { readdirSync } from 'fs'
import { isDirectory, getProjectConfig, getAllUserConfigs } from './../utils'


const ignoredDirs = ['node_modules', 'dist']
const ignoredFiles = ['package-lock.json', 'yarn.lock', '.gitignore', '.git', '.DS_Store', '.vscode', 'package.json']

const allConfigs = getAllUserConfigs()

export const scan = () => {
	inquirer.prompt([
		{
			type: 'input',
			name: 'dirPath',
			message: '请输入需要扫描的文件夹路径',
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
					const { name, email } = getProjectConfig(filePath)
					const stringifyConfig = `${name}<${email}>`
					if (!userConfigs[stringifyConfig]) {
						userConfigs[stringifyConfig] = 1
					} else {
						userConfigs[stringifyConfig] += 1
					}
					console.log(`目录 ${filePath} Git配置: ${stringifyConfig}>`)
				} else {
					files.forEach((fileName: string) => {
						if (![...ignoredDirs, ...ignoredFiles].includes(fileName)) {
							readConfig(`${filePath}/${fileName}`)
						}
					})
				}
			}
		}

		readConfig(dirPath)

		const getAnalyzeRes = (userConfigs: Record<string, number>) => {
			let res = '统计结果\n'
			Object.keys(userConfigs).forEach((key) => {
				res = `${res}${userConfigs[key]} 个目录使用了配置 ${key}\n`
			})
			return res
		}

		console.log(getAnalyzeRes(userConfigs))
	})
}
