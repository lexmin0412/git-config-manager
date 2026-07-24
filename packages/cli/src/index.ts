import EventEmitter from 'events'
import * as path from 'path'
import pc from "picocolors"
import { program } from 'commander'
import { gt } from 'semver'
import { add, current, doctor, list, remove, scan, upgrade, use } from './libs'
import notification from './notification.json'
import { syncPull, syncPush } from './libs/sync'
import { getConfig, setConfig } from './libs/config'
import { handleError } from './utils'
const figlet = require('figlet')
const pkgJsonPath = path.resolve(__dirname, '..', 'package.json')
const pkgJson = require(pkgJsonPath)

// 仅在非 --json 模式下显示 banner
const isJsonMode = process.argv.includes('--json')

if (!isJsonMode) {
	if (gt('1.4.0', pkgJson.version)) {
		console.log(pc.yellow(notification.text))
	}
	console.log('');

	const artText = figlet.textSync('G C M', {
		font: 'Standard',
		horizontalLayout: 'default',
		verticalLayout: 'default',
		width: 80,
		whitespaceBreak: true
	})

	console.log(`> gcm ${process.argv[2]}
${pc.green(artText)}`);
}

// 解决事件监听过多，运行命令后弹出警告信息的问题（默认最大监听器数量为 10 个）
EventEmitter.setMaxListeners(20)

// 全局选项
program
	.version(pkgJson.version)
	.option('--json', 'output as JSON')

// 自定义 version 输出，支持 --json
program.configureOutput({
	writeOut: (str) => {
		if (isJsonMode && str.includes(pkgJson.version)) {
			process.stdout.write(JSON.stringify({ version: pkgJson.version }) + '\n')
		} else {
			process.stdout.write(str)
		}
	}
})

// use
program
	.command('use <alias>')
	.description('use git user config by alias')
	.action(async (alias: string) => {
		try {
			const options = program.opts()
			await use(alias, { json: options.json })
		} catch (error) {
			handleError(error)
		}
	})

// add
program
	.command('add')
	.description('add user config')
	.option('--alias <alias>', 'config alias')
	.option('--name <name>', 'user name')
	.option('--email <email>', 'user email')
	.option('--origin <origin>', 'git remote origin')
	.action(async (options) => {
		try {
			const globalOpts = program.opts()
			await add({ ...options, json: globalOpts.json })
		} catch (error) {
			handleError(error)
		}
	})

// remove
program
	.command('remove')
	.alias('rm')
	.description('remove user config')
	.option('--alias <alias>', 'config alias')
	.action(async (options) => {
		try {
			const globalOpts = program.opts()
			await remove({ ...options, json: globalOpts.json })
		} catch (error) {
			handleError(error)
		}
	})

// list
program
	.command('list')
	.alias('ls')
	.description('list all configs in global config file')
	.action(() => {
		try {
			const options = program.opts()
			list({ json: options.json })
		} catch (error) {
			handleError(error)
		}
	})

// scan
program
	.command('scan')
	.alias('sc')
	.description('scan all git project\'s config in directory')
	.option('--dir <path>', 'directory to scan')
	.action(async (options) => {
		try {
			const globalOpts = program.opts()
			await scan({ ...options, json: globalOpts.json })
		} catch (error) {
			handleError(error)
		}
	})

// doctor
program
	.command('doctor')
	.description('verify if your git config in current workspace is correct')
	.action(() => {
		try {
			const options = program.opts()
			doctor({ json: options.json })
		} catch (error) {
			handleError(error)
		}
	})

// upgrade
program
	.command('upgrade')
	.description('upgrade version of gcm self')
	.action(async () => {
		try {
			const options = program.opts()
			await upgrade({ json: options.json })
		} catch (error) {
			handleError(error)
		}
	})

// get-config
program
	.command('get-config <type>')
	.description('get configuration')
	.action(async (type: string) => {
		try {
			await getConfig(type as 'sync')
		} catch (error) {
			handleError(error)
		}
	})

// set-config
program
	.command('set-config <type>')
	.description('update configuration')
	.action(async (type: string) => {
		try {
			await setConfig(type as 'sync')
		} catch (error) {
			handleError(error)
		}
	})

// sync pull
program
	.command('sync pull')
	.description('pull config from remote (overwrite local)')
	.action(async () => {
		try {
			const options = program.opts()
			await syncPull({ json: options.json })
		} catch (error) {
			handleError(error)
		}
	})

// sync push
program
	.command('sync push')
	.description('push config to remote (overwrite remote)')
	.action(async () => {
		try {
			const options = program.opts()
			await syncPush({ json: options.json })
		} catch (error) {
			handleError(error)
		}
	})

// current
program
	.command('current')
	.alias('cur')
	.description('get current git config in config file')
	.action(() => {
		try {
			const options = program.opts()
			current({ json: options.json })
		} catch (error) {
			handleError(error)
		}
	})

program.parse()
