import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import Config from '../config'
import { ScheduleModule } from '@nestjs/schedule'
import { MysqlEnum } from '../libs/mysql/mysqlEnum'
import { DbLogger } from '../libs/log/dbLogger'
import { RequestMiddleware } from '../libs/api/middleware/request.middleware'
import {TestModule} from "./test/test.module";

// synchronize:
// If this is true, the original table in the library will be deleted and rebuilt when the code starts,
// the specific logic is not examined in detail, and the phenomenon is shown, so it is temporarily changed to false here
const defaultOptions: any = {
  type: 'mysql',
  synchronize: false, // Modification this value is prohibited
  logger: new DbLogger(),
}

@Module({
  imports: [
    ScheduleModule.forRoot(),
    TypeOrmModule.forRootAsync({
      useFactory: () => {
        return {
          ...defaultOptions,
          logging: Config.appConfig.sqlLog,
          ...Config.mysqlConfig.node.write,
          entities: [`${__dirname}/../entity/*/*.entity{.ts,.js}`],
        }
      },
    }),
    TypeOrmModule.forRootAsync({
      name: MysqlEnum.NODE_READ,
      useFactory: () => ({
        ...defaultOptions,
        logging: Config.appConfig.sqlLog,
        ...Config.mysqlConfig.node.read,
        entities: [`${__dirname}/../entity/*/*.entity{.ts,.js}`],
      }),
    }),
    // KafkaModule,
    TestModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(RequestMiddleware).forRoutes('*')
  }
}
