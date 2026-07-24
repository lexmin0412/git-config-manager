import EventEmitter from 'events'
import * as path from 'path'
import pc from "picocolors"
import { program } from 'commander'
import { gt } from 'semver'
import { add, current, doctor, list, remove, scan, upgrade, use } from './libs'
import notification from './notification.json'
import { sync } from './libs/sync'
import { getConfig, setConfig } from './libs/config'
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

// use
program
	.command('use <alias>')
	.description('use git user config by alias')
	.action(async (alias: string) => {
		try {
			await use(alias)
		} catch (error) {
			console.error(error)
			process.exit(1)
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
			console.error(error)
			process.exit(1)
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
			console.error(error)
			process.exit(1)
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
			console.error(error)
			process.exit(1)
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
			console.error(error)
			process.exit(1)
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
			console.error(error)
			process.exit(1)
		}
	})

// upgrade
program
	.command('upgrade')
	.description('upgrade version of gcm self')
	.action(async () => {
		try {
			await upgrade()
		} catch (error) {
			console.error(error)
			process.exit(1)
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
			console.error(error)
			process.exit(1)
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
			console.error(error)
			process.exit(1)
		}
	})

// sync
program
	.command('sync')
	.description('sync config to remote')
	.action(async () => {
		try {
			await sync()
		} catch (error) {
			console.error(error)
			process.exit(1)
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
			console.error(error)
			process.exit(1)
		}
	})

program.parse()
