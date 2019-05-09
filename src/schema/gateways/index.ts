import { addSqlGateway } from './addSqlGateway'
import { findAndUpdateGateway } from './findAndUpdateGateway'
import { dropTableGateway } from './dropTableGateway'
import { putGateway } from './putGateway'
import { tableGateway } from './tableGateway'
import { executeGateway } from './async/executeGateway'
import { queryGateway } from './async/queryGateway'
import { MetadataManager } from '../../utils/createMetadataManager'
import { SchemaToolContext, SchemaToolGateway } from '../types'

const registeredGateways = {
  addSql: addSqlGateway,
  findAndUpdate: findAndUpdateGateway,
  dropTable: dropTableGateway,
  put: putGateway,
  table: tableGateway,
  use: tableGateway,

  asyncExecute: executeGateway,
  asyncQuery: queryGateway,
}

export function registerGateway(
  name: string,
  gatewayCreator: () => SchemaToolGateway,
) {
  // @ts-ignore
  registeredGateways[name] = gatewayCreator
}

interface ContextWrapper {
  context: SchemaToolContext
  getGateways(): SchemaToolGateway[]
  reset(): void
}

export function createContext(
  metadataManager: MetadataManager,
): ContextWrapper {
  const context = {}
  let gateways: SchemaToolGateway[] = []
  for (const name of Object.keys(registeredGateways)) {
    // @ts-ignore this is not what Flow should control in this application. It's abstract API
    const handler = registeredGateways[name](metadataManager)
    // @ts-ignore
    // eslint-disable-next-line
    context[name] = (...opts: any[]) => {
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
    },
  }
}
