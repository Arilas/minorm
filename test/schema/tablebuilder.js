import {createTableBuilder} from '../../src/schema/tablebuilder'
import {assert} from 'chai'

describe('Schema', () => {
  describe('Table Builder', () => {
    it('should create sql for columns', () => {
      const linesBlocks = [
        '`id` INT(11) UNSIGNED AUTO_INCREMENT PRIMARY KEY',
        '`login` VARCHAR(255) NOT NULL',
        '`password` VARCHAR(255) NOT NULL',
        '`createdAt` DATE'
      ]
      const builder = createTableBuilder({})
      const lines = builder('users', gateway => {
        gateway.column('id').int().unsigned().primary().autoIncrement()
        gateway.column('login').notNull()
        gateway.column('password').notNull()
        gateway.column('createdAt').date()
      }).map(line => line.toString())
      assert.deepEqual(lines, linesBlocks)
    })
  })
})