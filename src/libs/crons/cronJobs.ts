import { CRON_TYPES } from './timer'

/**
 * @description cron jobs
 * @author yq
 * @date 2022/6/28 21:29
 */

export interface CronJob {
  code: string // job code
  type: CRON_TYPES // job type
  name: string // job name
  description: string // job description
  cron: string // job cron expression
  initialDelay: number // job initialization delay execution time
  intervalTime: number // job interval
  params?: any[] // parameters
  timeout: number // job timeout
  scriptPath?: any // job script path
  method: string // job script method name
  status: number // job status 1-normal, -1-disabled
  cronScript?: any // cron job instance
  scheduleJob?: any // schedule job instance, using for cancel the job
  lastTime: number // last execution time
  nextTime: number // next execution time
  executionTime: number // execution time
  runningStatus: number // job running status: 0-init, 1-running, 2-end
  version?: string // job version, which is an uuid
}

export const CRON_JOBS: CronJob[] = []
