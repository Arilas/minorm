# Getting Started

To use minorm you need to create instance of a manager. To do this we recommend to create a folder `models` and put `index.js` file to it with content like:

```js
import { createManager } from '@minorm/core'
import { createAdapter } from '@minorm/adapter-mysql'
import config from '../config'

export const manager = createManager(createAdapter(config.db))
```

Config for a adapter should follow this format:

```js
export default {
  // Your other configs
  db: {
    host: process.env.MYSQL_HOST || 'localhost',
    user: process.env.MYSQL_USER || 'user',
    password: process.env.hasOwnProperty('MYSQL_PASS')
      ? process.env.MYSQL_PASS
      : 'password',
    database: process.env.MYSQL_DB || 'app_db',
  },
}
```

If you want to read about other conenction configuration parameters please read [mysqljs/mysql doc](https://github.com/mysqljs/mysql#connection-options).

Please note that minorm by default use connection pool, so there's additional config [here](https://github.com/mysqljs/mysql#pool-options)

## Init connection

In your startup screen you need to add code to bootstrap manager. This can looks like:

```js
import { manager } from './models'

async function boot() {
  manager.connect() // this method making instance of connection pool and put configuration to it
  await manager.ready() // this method preparing manager for real use by loading metadata
  // Other boot code
}
```

## Making Repository

In order to use main functionality you will need to use repositories. For example we will create repo for a table `posts`. To do this we will create file `models/posts.js` and put following content:

```js
import { manager } from './models'

const repo = manager.getRepository('posts')

export default repo
```

That's it. You don't need to manually type anything, just use it.
