import Squel from 'squel'
import { Criteria } from '../../types'

export default class CriteriaBlock extends Squel.cls.WhereBlock {
  criteria(criteria: Criteria) {
    for (const key of Object.keys(criteria)) {
      const part = criteria[key]
      if (part === null || part === undefined) {
        this.where(`${key} IS NULL`)
      } else if (['string', 'number'].indexOf(typeof part) != -1) {
        this.where(`${key} = ?`, part)
      } else if (typeof part == 'object') {
        const operator = Object.keys(part)[0]
        switch (operator) {
          case '$in':
            this.where(`${key} IN ?`, part[operator])
            break
          case '$not':
            this.where(`${key} != ?`, part[operator])
            break
          case '$notIn':
            this.where(`${key} NOT IN ?`, part[operator])
            break
          case '$like':
            this.where(`${key} LIKE ?`, part[operator])
            break
        }
      }
    }
  }
}
