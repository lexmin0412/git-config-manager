import inquirer from 'inquirer';
import { addConfig, createEmptyJsonWhenNeeds } from '../utils/index'

export const add = () => {
	inquirer
		.prompt([
			{
				type: 'input',
				name: 'alias',
				message: '请输入别名',
			},
			{
				type: 'input',
				name: 'name',
				message: '请输入用户名',
			},
			{
				type: 'input',
				name: 'email',
				message: '请输入邮箱',
			},
			{
				type: 'input',
				name: 'origin',
				message: '请输入适用于当前配置的 git 远程域名(如 github.com )',
			},
		])
		.then((answers) => {
			createEmptyJsonWhenNeeds()
			addConfig({
				alias: answers.alias,
				name: answers.name,
				email: answers.email,
				origin: answers.origin
			})
		})
		.catch((error) => {
			if (error.isTtyError) {
				// 当前运行环境不支持
				console.error(`Prompt couldn't be rendered in the current environment, please check your platform`)
			} else {
				console.error('error', error)
				process.exit(1)
			}
		});
}
