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
const GIT_REPO_NAME = "config";
/**
 * 配置仓库中用于存放 GCM 配置的目录名称
 */
const SUB_FOLDER = "gcm";
/**
 * GCM 配置文件名称
 */
const GCM_CONFIG_FILE_NAME = "config.json";
/**
 * 仓库临时存放目录路径
 */
export const REPO_FOLDER_PATH = path.join(TEMP_SYNC_DIR, GIT_REPO_NAME);
/**
 * 仓库临时存放目录的 GCM 配置存放目录路径
 */
export const CONFIG_FOLDER_PATH = path.join(REPO_FOLDER_PATH, SUB_FOLDER);
/**
 * 仓库临时存放目录的 GCM 配置文件存放路径
 */
export const GCM_CONFIG_FILE_PATH = path.join(CONFIG_FOLDER_PATH, GCM_CONFIG_FILE_NAME);
