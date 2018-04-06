/** @flow */
import { createServer as createFakeServer } from 'mysql2'
import { makeQueryFilter } from 'array-aggregate'
import config from '../config'

const specialRegex = /\(|\)|'/g

function getModifier(part: string) {
  part = part.trim().toLowerCase()
  switch (part) {
    case '=': return '$eq'
    case 'in': return '$in'
    case '!=': return '$ne'
  }
}

function parseWhere(whereClause) {
  const [, rawModifier, where] = whereClause.trim().split(' ', 3)
  const modifier = getModifier(rawModifier)
  switch (modifier) {
    case '$in': return {
      $in: where.split(',').map(item => item.trim())
    }
    default: {
      const value = parseInt(where, 10).toString() == where ? parseInt(where, 10) : where
      return { // $FlowIgnore
        [modifier]: value
      }
    }
  }
}

export function createServer() {
  const server = createFakeServer()
  const database = {
    users: new Map(),
    posts: new Map(),
    comments: new Map()
  }
  let connectionId = 1234
  const queries = {}
  server.listen(config.connection.port)
  server.on('connection', conn => {

    conn.serverHandshake({
      protocolVersion: 10,
      serverVersion: '5.6.10', // 'node.js rocks',
      connectionId: connectionId++,
      statusFlags: 2,
      characterSet: 8,
      // capabilityFlags: 0xffffff,
      // capabilityFlags: -2113931265,
      capabilityFlags: 0xffffff,
    })

    conn.on('field_list', () => {
      conn.writeEof()
    })

    conn.on('query', sql => {
      console.log('Dump query:' + sql) // eslint-disable-line no-console
      // remote.query(sql, function (err) {
        // overloaded args, either (err, result :object)
        // or (err, rows :array, columns :array)
      if (sql.indexOf('INSERT') !== -1) {
        const [table, rawValues] = sql.split('VALUES')
        const into = {
          tableName: table.split(' ')[2],
          structure: table.split('(')[1].split(',').map(col => col.replace(specialRegex, '').trim())
        }
        const rows = rawValues.split('),').map(
          line => line
            .replace(specialRegex, '')
            .split(',')
            .reduce(
              (target, value, index) => Object.assign(target, {
                [into.structure[index]]: value.trim()
              }),
              {}
            )
        )
        for (const row of rows) {
          database[into.tableName] = database[into.tableName].set(database[into.tableName].size + 1, {
            ...row,
            id: database[into.tableName].size + 1
          })
        }
        conn.writeOk({
          affectedRows: rows.length,
          insertId: database[into.tableName].size
        })
        return
      } else if (sql.indexOf('UPDATE') !== -1) {
        const [table, modifier] = sql.split('SET')
        const [rawValues, rawWhere] = modifier.split('WHERE')
        const into = table.split(' ')[1]
        const values = rawValues
          .split(',')
          .reduce(
            (target, value) => Object.assign(target, {
              [value.split('=')[0].trim()]: value.split('=')[1].trim().replace(specialRegex, '')
            }),
            {}
          )
        const where = rawWhere
          .replace(specialRegex, '')
          .split('AND')
          .reduce(
            (target, part) => Object.assign(target, {
              [part.trim().split(' ')[0].trim()]: parseWhere(part)
            }),
            {}
          )
        const matcher = makeQueryFilter(where)
        const matched = [...database[into]].filter(val => matcher.match(val[1]))
        for (const [, doc] of matched) {
          database[into] = database[into].set(doc.id, {
            ...doc,
            ...values
          })
        }
        conn.writeOk({
          affectedRows: matched.length
        })
        return
      }
      if (!queries[sql]) {
        conn.writeOk(0)
        return
      }
      const rows = queries[sql]()
      if (Array.isArray(rows)) {
        // response to a 'select', 'show' or similar
        const columns = []
        conn.writeTextResult(rows, columns)
      } else {
        // response to an 'insert', 'update' or 'delete'
        conn.writeOk(rows)
      }
    })
  })
  return {
    addSample(sql: string, response: Function) {
      queries[sql] = response
    },
    close() {
      server.close()
    }
  }
}