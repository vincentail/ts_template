/**
 * @description kafka client
 * @author yq
 * @date 2022/10/3 10:45
 */
import {
  Consumer,
  ConsumerRunConfig,
  ConsumerSubscribeTopics,
  Kafka,
  Partitioners,
  Producer,
  logLevel,
} from 'kafkajs'
import Config from '../../config'
import getLogger from '../../utils/logger'

const Logger = getLogger('kafka-client')

const LogCreator =
  () =>
  ({ level, log }) => {
    const { message, ...extra } = log
    switch (level) {
      case logLevel.ERROR:
      case logLevel.NOTHING:
        return Logger.error(message, extra)
      case logLevel.WARN:
        return Logger.warn(message, extra)
      case logLevel.INFO:
        return Logger.info(message, extra)
      case logLevel.DEBUG:
        return Logger.debug(message, extra)
    }
  }

export class KafkaClient {
  public static instance: KafkaClient
  private kafka: Kafka
  private producer: Producer
  private consumer: Consumer

  constructor() {
    this.kafka = new Kafka({
      clientId: Config.kafkaConfig.clientId,
      brokers: Config.kafkaConfig.brokers.split(','),
      logLevel: logLevel.DEBUG,
      logCreator: LogCreator,
    })
    this.producer = this.kafka.producer({
      createPartitioner: Partitioners.LegacyPartitioner,
    })
    this.consumer = this.kafka.consumer({
      groupId: Config.kafkaConfig.channelOrder.consumerGroupId,
    })
    this.connect().catch((e: any) => {
      Logger.error(`kafka error: ${e.message}`, e)
    })
  }

  public static getInstance() {
    if (!KafkaClient.instance) {
      KafkaClient.instance = new KafkaClient()
    }
    return KafkaClient.instance
  }

  async connect() {
    await this.producer.connect()
    await this.consumer.connect()
  }

  async disconnect() {
    await this.producer.disconnect()
    await this.consumer.disconnect()
  }

  async initConsumer(
    subscription: ConsumerSubscribeTopics,
    runOpts: ConsumerRunConfig,
  ) {
    await this.consumer.subscribe(subscription)
    await this.consumer.run(runOpts)
  }

  async sendMessage(kafkaTopic: string, kafkaMessages) {
    if (!Array.isArray(kafkaMessages)) kafkaMessages = [kafkaMessages]
    const metadata = await this.producer
      .send({
        topic: kafkaTopic,
        messages: kafkaMessages,
      })
      .catch((e) => console.error(e.message, e))
    return metadata
  }
}
