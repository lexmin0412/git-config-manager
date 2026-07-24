import { runCmdSync } from '@lexmin0412/run'
import latestVersion from "latest-version"
import pc from 'picocolors'
import inquirer from 'inquirer'
import { gt } from 'semver'
import { getPkgJson } from '@lexmin0412/gcm-api'

interface UpgradeOptions {
	json?: boolean
}

export const upgrade = async(options: UpgradeOptions = {}) => {
	const pkgJson = getPkgJson()
	const newVersion = await latestVersion(pkgJson.name)
	const currentVersion = pkgJson.version

	if ( newVersion === currentVersion ) {
		if (options.json) {
			console.log(JSON.stringify({ success: true, upToDate: true, version: currentVersion }))
		} else {
			console.log(pc.green(`当前已是最新版本: ${currentVersion}`))
		}
		process.exit(0)
	}

	if ( gt(newVersion, currentVersion) ) {
		if (options.json) {
			// JSON 模式下直接升级，不询问
			runCmdSync(`npm install ${pkgJson.name}@${newVersion} -g`);
			console.log(JSON.stringify({ success: true, previousVersion: currentVersion, newVersion }))
			process.exit(0)
		}

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
			  runCmdSync(`npm install ${pkgJson.name}@${newVersion} -g`);
			  console.log(pc.green(`✓ 成功升级到 v${newVersion}`));
			} else {
				console.log('canceled')
				process.exit(0)
			}
		})
	} else {
		if (options.json) {
			console.log(JSON.stringify({ success: false, error: '版本异常', currentVersion, latestVersion: newVersion }))
		} else {
			console.error('当前安装版本异常，请检查: ')
			console.log(`当前版本 ${currentVersion}`)
			console.log(`最新版本 ${newVersion}`)
		}
		process.exit(1)
	}
}
