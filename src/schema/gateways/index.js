/** @flow */
import {addSqlGateway} from './addSqlGateway'
import {findAndUpdateGateway} from './findAndUpdateGateway'
import {dropTableGateway} from './dropTableGateway'
import {putGateway} from './putGateway'
import {tableGateway} from './tableGateway'
import type {MetadataManager} from '../../types'
import type {SchemaToolContext, SchemaToolGateway} from '../types'


const registeredGateways = {
  addSql: addSqlGateway,
  findAndUpdate: findAndUpdateGateway,
  dropTable: dropTableGateway,
  put: putGateway,
  table: tableGateway,
  use: tableGateway
}

export function registerGateway(name: string, gatewayCreator: () => SchemaToolGateway) {
  registeredGateways[name] = gatewayCreator
}

type ContextWrapper = {
  context: SchemaToolContext,
  getGateways(): Array<SchemaToolGateway>
}

export function createContext(metadataManager: MetadataManager): ContextWrapper {
  const context = {}
  let gateways = []
  for (const name of Object.keys(registeredGateways)) {
    // $FlowIgnore this is not what Flow should control in this application. It's abstract API
    const handler = registeredGateways[name](metadataManager)
    context[name] = (...opts: Array<any>) => {
      if (opts.length > handler.length) {
        throw new Error(`${name} was called with mismatched amount of arguments.
${name} needs ${handler.length} arguments but received ${opts.length}.
Please check your arguments: ${JSON.stringify(opts, null, ' ')}`)
      }
      const gateway = handler(...opts)
      gateways.push(gateway)
      return gateway
    }
  }
  return {
    context,
    getGateways() {
      return gateways
    },
    reset() {
      gateways = []
    }
  }
}