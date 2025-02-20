import path from "path";
import os from 'os'


/**
 * GCM 配置目录
 */
const GCM_CONFIG_DIR = path.join(os.homedir(), ".gcm")
/**
 * 临时工作目录名称
 */
export const TEMP_FOLDER_NAME = "sync_temp_workspace";
/**
 * 临时工作目录，用于处理配置同步工作
 */
export const TEMP_SYNC_DIR = path.join(GCM_CONFIG_DIR, TEMP_FOLDER_NAME);
/**
 * 配置仓库名称
 */
export const CONFIG_REPO_NAME = "config";
/**
 * 仓库临时存放目录路径
 */
export const REPO_FOLDER_PATH = path.join(TEMP_SYNC_DIR, CONFIG_REPO_NAME);
