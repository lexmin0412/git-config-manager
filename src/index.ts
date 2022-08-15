import * as path from 'path'
import { program } from 'commander'
import { add, current, doctor, list, remove, scan, upgrade, use } from './libs'

const pkgJsonPath = path.resolve(__dirname, '..', 'package.json')
const pkgJson = require(pkgJsonPath)

program
	.version(pkgJson.version)
	.command('use <alias>')
	.description('use git user config by alias')
	.action((alias: string) => {
		try {
			use(alias)
		} catch (error) {
			console.error(error)
			process.exit(1)
		}
	})

program
	.version(pkgJson.version)
	.command('add')
	.description('add user config')
	.action(() => {
		try {
			add()
		} catch (error) {
			console.error(error)
			process.exit(1)
		}
	})

program
	.version(pkgJson.version)
	.command('remove')
	.alias('rm')
	.description('remove user config')
	.action(() => {
		try {
			remove()
		} catch (error) {
			console.error(error)
			process.exit(1)
		}
	})

program
	.version(pkgJson.version)
	.command('list')
	.alias('ls')
	.description('list all configs in global config file')
	.action(() => {
		try {
			list()
		} catch (error) {
			console.error(error)
			process.exit(1)
		}
	})

program
	.version(pkgJson.version)
	.command('scan')
	.alias('sc')
	.description('scan all git project\'s config in directory')
	.action(() => {
		try {
			scan()
		} catch (error) {
			console.error(error)
			process.exit(1)
		}
	})

program
	.version(pkgJson.version)
	.command('doctor')
	.description('verify if your git config in current workspace is correct')
	.action(() => {
		try {
			doctor()
		} catch (error) {
			console.error(error)
			process.exit(1)
		}
	})

program
	.version(pkgJson.version)
	.command('upgrade')
	.description('upgrade version of gcm self')
	.action(() => {
		try {
			upgrade()
		} catch (error) {
			console.error(error)
			process.exit(1)
		}
	})

program
	.version(pkgJson.version)
	.command('current')
	.alias('cur')
	.description('get current git config in config file')
	.action(() => {
		try {
			current()
		} catch (error) {
			console.error(error)
			process.exit(1)
		}
	})

program.parse()
