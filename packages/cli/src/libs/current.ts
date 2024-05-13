import { getCurrentConfig, getAllUserConfigs } from '@lexmin0412/gcm-api'
import { UserConfig } from './../types'
import pc from 'picocolors'

export const current = () => {
    const allConfigs = getAllUserConfigs()
    const currentConfig = getCurrentConfig()
    const currentInConfigJson = allConfigs.find((config: UserConfig)=>{
        return config.name === currentConfig.name && config.email === config.email
    })
    if ( currentInConfigJson ) {
        console.log(pc.green(`当前使用的配置:
user.name: ${currentConfig.name}
user.email: ${currentConfig.email}`))
    }
}
