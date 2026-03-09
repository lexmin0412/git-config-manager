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

// 解决事件监听过多，运行命令后弹出警告信息的问题（默认最大监听器数量为 10 个）
EventEmitter.setMaxListeners(20)

const commands = [
	{
		command: 'use <alias>',
		description: 'use git user config by alias',
		action: use
	},
	{
		command: 'add',
		description: 'add user config',
		action: add
	},
	{
		command: 'remove',
		alias: 'rm',
		description: 'remove user config',
		action: remove
	},
	{
		command: 'list',
		alias: 'ls',
		description: 'list all configs in global config file',
		action: list
	},
	{
		command: 'scan',
		alias: 'sc',
		description: 'scan all git project\'s config in directory',
		action: scan
	},
	{
		command: 'doctor',
		description: 'verify if your git config in current workspace is correct',
		action: doctor
	},
	{
		command: 'upgrade',
		description: 'upgrade version of gcm self',
		action: upgrade
	},
	{
		command: 'get-config <type>',
		description: 'get configuration',
		action: getConfig
	},
	{
		command: 'set-config <type>',
		description: 'update configuration',
		action: setConfig
	},
	{
		command: 'sync',
		description: 'sync config to remote',
		action: sync
	},
	{
		command: 'current',
		alias: 'cur',
		description: 'get current git config in config file',
		action: current
	}
]

program.version(pkgJson.version)

commands.forEach(({ command, alias, description, action }) => {
	const cmd = program.command(command).description(description)
	if (alias) {
		cmd.alias(alias)
	}
	cmd.action(async (...args: any[]) => {
		try {
			// @ts-ignore
			await action(...args)
		} catch (error) {
			console.error(error)
			process.exit(1)
		}
	})
})

program.parse()
