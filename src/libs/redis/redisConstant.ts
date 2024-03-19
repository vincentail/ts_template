/**
 * @description redis key constant
 * @author yq
 * @date 2022/10/14 15:09
 */
export const RedisConstant = {
  lockKey: 'lock:%s:%s', // lock key, the parameters are code and id
  cronKey: 'cron:%s', // cron key, the parameters is code
  masterNodeKey: 'master:node', // master node key, the vale is master node ip
  latestAprKey: 'apr:latest', // latest apr key
}
