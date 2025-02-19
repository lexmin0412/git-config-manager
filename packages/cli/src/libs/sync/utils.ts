import { UserConfig } from "../../types";

// 对比两份 GCM 配置是否一致
export const isEqual = (local: UserConfig[], remote: UserConfig[]) => {
  const hash = (arr: UserConfig[]) =>
    arr.map(c => `${c.alias}:${c.name}:${c.email}:${c.origin}`).join('|');
  return hash(local) === hash(remote);
};
