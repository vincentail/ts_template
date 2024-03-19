import 'dotenv/config' // see https://github.com/motdotla/dotenv#how-do-i-use-dotenv-with-import
import getLogger from '../../utils/logger'
import ApolloClient from '../../libs/apollo/apolloClient'
import { NestFactory } from '@nestjs/core'
import { AppModule } from '../../modules/app.module'
import { RedisClient } from '../../libs/redis/redisClient'
import { RedisEnum } from '../../libs/redis/RedisEnum'
import { Log4jsLogger } from '../../libs/log/log4jsLogger'
// import { INestApplicationContext } from '@nestjs/common'
import Config from '../../config'
import Master from '../../libs/system/master'
import { RequestInterceptor } from '../../libs/api/interceptor/request.interceptor'
import HttpExceptionFilter from '../../libs/api/filter/httpException.filter'

const logger = getLogger('app')

const bootstrap = async () => {
  logger.info('service starting...')
  // load Apollo configs
  await ApolloClient.getInstance().start()
  // init redis
  RedisClient.getInstance(RedisEnum.NODE)
  // start master heartbeat
  await Master.getInstance().heartbeat()
  // const app: INestApplicationContext =
  //   await NestFactory.createApplicationContext(AppModule, {
  //     logger: new Log4jsLogger(logger),
  //   })
  const app = await NestFactory.create(AppModule, {
    logger: new Log4jsLogger(logger),
  })
  app.enableShutdownHooks()
  app.enableCors()
  // http filter
  app.useGlobalFilters(new HttpExceptionFilter())
  // request interceptor
  app.useGlobalInterceptors(new RequestInterceptor())
  await app.listen(Config.appConfig.port)
}

bootstrap()
  .then(() =>
    logger.info(
      `service started successfully. node: ${Config.appConfig.node}, listen on: localhost:${Config.appConfig.port}`,
    ),
  )
  .catch((err) => {
    logger.error('Failed to start service: ', err)
    process.exit(-1)
  })
