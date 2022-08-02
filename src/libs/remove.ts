import inquirer from 'inquirer';
import { removeConfig } from '../utils/index'

export const remove = () => {
	inquirer
		.prompt([
			{
				type: 'input',
				name: 'alias',
				message: '请输入别名',
			}
		])
		.then((answers) => {
			removeConfig(answers.alias)
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
