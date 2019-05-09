import { compose } from '../utils/compose'
import { ManagerConstructor } from './types'

import { connectionCreator, Connection } from './connectionCreator'
import { metadataCreator, Metadata } from './metadataCreator'
import { queriesCreator, Queries } from './queriesCreator'
import { repositoryCreator, Repositories } from './repositoryCreator'

export { connectionCreator, metadataCreator, queriesCreator, repositoryCreator }

export { Connection, Metadata, Queries, Repositories }

export const createBaseManager: <T>(
  next: ManagerConstructor<T>,
) => ManagerConstructor<
  Repositories<Metadata<Queries<Connection<T>>>>
> = compose(
  repositoryCreator,
  metadataCreator,
  // @ts-ignore
  queriesCreator,
  connectionCreator,
)
