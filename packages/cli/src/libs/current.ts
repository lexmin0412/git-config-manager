import { getCurrentConfig, getAllUserConfigs } from '@lexmin0412/gcm-api'
import { UserConfig } from './../types'
import pc from 'picocolors'

export const current = () => {
    const allConfigs = getAllUserConfigs()
    const currentConfig = getCurrentConfig()
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
