
export default {
  connection: {
    host: process.env.MYSQL_HOST || 'localhost',
    user: process.env.MYSQL_USER || 'local',
    password: process.env.MYSQL_PASS || 'freeware',
    database: process.env.MYSQL_DB || 'minorm_test'
  }
}