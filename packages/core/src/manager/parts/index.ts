import { compose } from '../../utils/compose'
import { ManagerConstructor, ManagerBase } from '../types'

import { connectionCreator, Connection } from './connectionCreator'
import { metadataCreator, Metadata } from './metadataCreator'
import { queriesCreator, Queries } from './queriesCreator'
import { repositoryCreator, Repositories } from './repositoryCreator'
import { Adapter } from '../../types'

export {
  connectionCreator,
  metadataCreator,
  queriesCreator,
  repositoryCreator,
  Connection,
  Metadata,
  Queries,
  Repositories,
}

export const createBaseManager: <T extends ManagerBase, A extends Adapter>(
  next: ManagerConstructor<T, A>,
) => ManagerConstructor<
  Repositories<Metadata<Queries<Connection<T, A>, A>, A>, A>,
  A
> = compose(
  // @ts-ignore
  repositoryCreator,
  metadataCreator,
  queriesCreator,
  connectionCreator,
)
