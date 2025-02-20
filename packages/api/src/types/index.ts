export interface UserConfig {
	alias: string
	name: string
	email: string
	origin: string
}

export interface Origin {
	origin: string
}

/**
 * 同步配置
 */
export interface ISyncConfig {
	type: 'github'
	repoUrl: string
	dir: string
	filename: string
}
