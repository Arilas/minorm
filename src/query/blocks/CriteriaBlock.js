/** @flow */
import Squel from 'squel'
import type {Criteria} from '../../types'

export default class CriteriaBlock extends Squel.cls.WhereBlock {
  criteria(criteria: Criteria) {
    Object.keys(criteria).map(key => {
      if (
        ['string', 'number'].indexOf(typeof criteria[key]) != -1
      ) {
        this.where(
          `${key} = ?`,
          criteria[key]
        )
      } else if (typeof criteria[key] == 'object') {
        const operator = Object.keys(criteria[key])[0]
        switch(operator) {
          case '$in':
            this.where(
              `${key} IN ?`,
              criteria[key][operator]
            )
            break
          case '$not':
            this.where(
              `${key} != ?`,
              criteria[key][operator]
            )
            break
          case '$notIn':
            this.where(
              `${key} NOT IN ?`,
              criteria[key][operator]
            )
            break
          case '$like':
            this.where(
              `${key} LIKE ?`,
              criteria[key][operator]
            )
            break
        }
      }
    })
  }
}
