import { getCurrentConfig, getAllUserConfigs, UserConfig } from '@lexmin0412/gcm-api'
import pc from 'picocolors'

interface CurrentOptions {
	json?: boolean
}

export const current = (options: CurrentOptions = {}) => {
    const allConfigs = getAllUserConfigs()
    const currentConfig = getCurrentConfig()

    if (options.json) {
        if (!currentConfig) {
            console.log(JSON.stringify({ matched: false, name: null, email: null, alias: null }))
            return
        }
        const matched = allConfigs.find((config: UserConfig) => 
            config.name === currentConfig.name && config.email === currentConfig.email
        )
        console.log(JSON.stringify({
            matched: !!matched,
            alias: matched?.alias || null,
            name: currentConfig.name,
            email: currentConfig.email
        }, null, 2))
        return
    }

    if (!currentConfig) {
        console.log(pc.red('未检测到当前 git 配置（user.name/user.email）。'))
        return
    }
    const currentInConfigJson = allConfigs.find((config: UserConfig)=>{
        return config.name === currentConfig.name && config.email === currentConfig.email
    })
    if ( currentInConfigJson ) {
        console.log(pc.green(`当前使用的配置:
user.name: ${currentConfig.name}
user.email: ${currentConfig.email}`))
    } else {
        console.log(pc.yellow(`当前配置未在列表中:
user.name: ${currentConfig.name}
user.email: ${currentConfig.email}`))
    }
}
