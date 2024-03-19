import { Repository } from 'typeorm'

/**
 * @description mysql util
 * @author yq
 * @date 2022/11/1 18:51
 */
export interface IConditionItem {
  [key: string]: string | string[] | number | number[] | Date | boolean
}

export interface IOrder {
  [sortName: string]: 'ASC' | 'DESC'
}

export enum ConditionEnum {
  LIKES = 'likes',
  ORS = 'ors',
  INS = 'ins',
  NOT_INS = 'notIns',
  EQS = 'eqs',
  NEQS = 'neqs',
  GTS = 'gts',
  LTS = 'lts',
  GTES = 'gtes',
  LTES = 'ltes',
}

const ConditionEnumValuesSet = new Set(
  Object.values(ConditionEnum).map((v) => v.toString()),
)

export interface ICondition {
  [ConditionEnum.LIKES]?: IConditionItem | IConditionItem[]
  [ConditionEnum.ORS]?: IConditionItem
  [ConditionEnum.INS]?: IConditionItem
  [ConditionEnum.NOT_INS]?: IConditionItem
  [ConditionEnum.EQS]?: IConditionItem
  [ConditionEnum.NEQS]?: IConditionItem
  [ConditionEnum.GTS]?: IConditionItem
  [ConditionEnum.LTS]?: IConditionItem
  [ConditionEnum.GTES]?: IConditionItem
  [ConditionEnum.LTES]?: IConditionItem
}

export interface IQueryParams {
  where: ICondition
  offset?: number
  limit?: number
  order?: {
    [sortName: string]: 'ASC' | 'DESC'
  }
}

interface IFormattedWhere {
  whereParams: IConditionItem
  wheres: string[]
}

export default class MysqlUtil {
  /**
   * format where condition
   *
   * @param  {Object} whereCondition query conditions object
   *
   * @return {IFormattedWhere}       the formatted conditions
   */
  public static formatWhere(whereCondition: ICondition): IFormattedWhere {
    const { likes, ors, ins, notIns, eqs, neqs, gts, lts, gtes, ltes } =
      whereCondition
    // check the condition key
    Object.keys(whereCondition).forEach((key) => {
      // if the key does not exist in ConditionEnum, throw an error
      if (!ConditionEnumValuesSet.has(key)) {
        throw new Error(`Invalid where condition key: ${key}`)
      }
    })
    const whereParams: IConditionItem = {}
    const wheres: string[] = []
    let index = 0
    // like conditions
    if (Array.isArray(likes)) {
      // likes is Object array，support (column like a AND column LIKE b)
      likes.forEach((like) => {
        const likesKeys = Object.keys(like)
        if (likesKeys.length > 0) {
          const likesWhere = likesKeys
            .map((key) => {
              const name = `${key}_${index++}`
              whereParams[name] = likes[key]
              return `\`${key}\` LIKE :${name}`
            })
            .join(' AND ')
          wheres.push(likesWhere)
        }
      })
    } else if (likes) {
      // likes is Object，does not support (column like a AND column LIKE b)
      const likesKeys = Object.keys(likes)
      if (likesKeys.length > 0) {
        const likesWhere = likesKeys
          .map((key) => {
            const name = `${key}_${index++}`
            whereParams[name] = likes[key]
            return `\`${key}\` LIKE :${name}`
          })
          .join(' AND ')
        wheres.push(likesWhere)
      }
    }
    // in conditions
    if (ins) {
      const insKeys = Object.keys(ins)
      if (insKeys.length > 0) {
        const insWhere = insKeys
          .map((key) => {
            const name = `${key}_${index++}`
            whereParams[name] = ins[key]
            return `\`${key}\` IN ( :${name} )`
          })
          .join(' AND ')
        wheres.push(insWhere)
      }
    }
    // not in conditions
    if (notIns) {
      const notInsKeys = Object.keys(notIns)
      if (notInsKeys.length > 0) {
        const notInsWhere = notInsKeys
          .map((key) => {
            const name = `${key}_${index++}`
            whereParams[name] = notIns[key]
            return `\`${key}\` NOT IN ( :${name} )`
          })
          .join(' AND ')
        wheres.push(notInsWhere)
      }
    }
    // equal conditions
    if (eqs) {
      const eqsKeys = Object.keys(eqs)
      if (eqsKeys.length > 0) {
        const eqsWhere = eqsKeys
          .map((key) => {
            const name = `${key}_${index++}`
            whereParams[name] = eqs[key]
            return `\`${key}\` = :${name}`
          })
          .join(' AND ')
        wheres.push(eqsWhere)
      }
    }
    // not equal conditions
    if (neqs) {
      const neqsKeys = Object.keys(neqs)
      if (neqsKeys.length > 0) {
        const neqsWhere = neqsKeys
          .map((key) => {
            const name = `${key}_${index++}`
            whereParams[name] = neqs[key]
            return `\`${key}\` != :${name}`
          })
          .join(' AND ')
        wheres.push(neqsWhere)
      }
    }
    // greater than conditions
    if (gts) {
      const gtsKeys = Object.keys(gts)
      if (gtsKeys.length > 0) {
        const gtsWhere = gtsKeys
          .map((key) => {
            const name = `${key}_${index++}`
            whereParams[name] = gts[key]
            return `\`${key}\` > :${name}`
          })
          .join(' AND ')
        wheres.push(gtsWhere)
      }
    }
    // less than conditions
    if (lts) {
      const ltsKeys = Object.keys(lts)
      if (ltsKeys.length > 0) {
        const ltsWhere = ltsKeys
          .map((key) => {
            const name = `${key}_${index++}`
            whereParams[name] = lts[key]
            return `\`${key}\` < :${name}`
          })
          .join(' AND ')
        wheres.push(ltsWhere)
      }
    }
    // greater than or equal conditions
    if (gtes) {
      const gtesKeys = Object.keys(gtes)
      if (gtesKeys.length > 0) {
        const gtesWhere = gtesKeys
          .map((key) => {
            const name = `${key}_${index++}`
            whereParams[name] = gtes[key]
            return `\`${key}\` >= :${name}`
          })
          .join(' AND ')
        wheres.push(gtesWhere)
      }
    }
    // less than or equal conditions
    if (ltes) {
      const ltesKeys = Object.keys(ltes)
      if (ltesKeys.length > 0) {
        const ltesWhere = ltesKeys
          .map((key) => {
            const name = `${key}_${index++}`
            whereParams[name] = ltes[key]
            return `\`${key}\` <= :${name}`
          })
          .join(' AND ')
        wheres.push(ltesWhere)
      }
    }
    // or conditions
    if (Array.isArray(ors) && ors.length > 0) {
      let orWhereStrs: string[] = []
      ors.forEach((or) => {
        const orFormatWhere = MysqlUtil.formatWhere(or)
        Object.assign(whereParams, orFormatWhere.whereParams)
        orWhereStrs = orWhereStrs.concat(orFormatWhere.wheres.join(' AND '))
      })
      wheres.push(`(( ${orWhereStrs.join(' ) OR ( ')} ))`)
    }
    return {
      whereParams,
      wheres,
    } as IFormattedWhere
  }

  /**
   * find list by conditions
   * @param repository
   * @param opts
   */
  public static async findList(
    repository: Repository<any>,
    opts: IQueryParams = { where: {}, offset: 0, limit: 20 },
  ): Promise<any[]> {
    let queryBuilder = repository.createQueryBuilder('t')
    const { where = {}, offset = 0, limit = 20, order } = opts
    const { wheres, whereParams } = MysqlUtil.formatWhere(where)
    if (wheres.length) {
      queryBuilder = queryBuilder.where(wheres.join(' AND '), whereParams)
    }
    queryBuilder = queryBuilder.skip(offset).limit(limit)
    if (order) {
      queryBuilder = queryBuilder.orderBy(order)
    }
    return queryBuilder.getMany()
  }
}
