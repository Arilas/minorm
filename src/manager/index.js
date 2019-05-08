/** @flow strict */
import { compose } from '../utils/compose'
import type { ManagerConstructor } from './types'

import { connectionCreator, type Connection } from './connectionCreator'
import { metadataCreator, type Metadata } from './metadataCreator'
import { queriesCreator, type Queries } from './queriesCreator'
import { repositoryCreator, type Repositories } from './repositoryCreator'

export { connectionCreator, metadataCreator, queriesCreator, repositoryCreator }

export type { Connection, Metadata, Queries, Repositories }

export const createBaseManager: <T: *>(
  next: ManagerConstructor<T>,
) => ManagerConstructor<$Exact<{ ...T, ...Repositories }>> = compose(
  repositoryCreator,
  metadataCreator,
  queriesCreator,
  connectionCreator,
)
