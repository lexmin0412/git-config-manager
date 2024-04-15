import fs from 'fs'

/**
 * 判断一个path是否是文件夹
 */
export const isDirectory = (path: string) => {
	return fs.existsSync(path) && fs.lstatSync(path).isDirectory()
}
