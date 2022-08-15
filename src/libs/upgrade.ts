import { runCmdSync } from '@lexmin0412/run'
import latestVersion from "latest-version"
import inquirer from 'inquirer'
import { gt } from 'semver'
import { getPkgJson } from './../utils'

export const upgrade = async() => {
	const pkgJson = getPkgJson()
	const newVersion = await latestVersion(pkgJson.name)
	const currentVersion = pkgJson.version

	if ( newVersion === currentVersion ) {
		console.log('当前已是最新版本', currentVersion)
		process.exit(0)
	}

	if ( gt(newVersion, currentVersion) ) {
		inquirer.prompt([
			{
				type: 'confirm',
				name: 'confirmed',
				message: '是否更新',
				default: false
			}
		]).then((answers) => {
			const confirmed = answers.confirmed
			if (confirmed) {
				runCmdSync(`npm install ${pkgJson.name}@${newVersion} -g`)
			} else {
				console.log('canceled')
				process.exit(0)
			}
		})
	} else {
		console.error('当前安装版本异常，请检查: ')
		console.log(`当前版本 ${currentVersion}`)
		console.log(`最新版本 ${newVersion}`)
		process.exit(1)
	}
}
