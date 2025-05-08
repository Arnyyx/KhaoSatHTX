// db.js
const sql = require('mssql');
require('dotenv').config();

const config = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  server: process.env.DB_SERVER,
  database: process.env.DB_DATABASE,
  options: {
    encrypt: false,
    trustServerCertificate: true,
  },
};

const poolPromise = new sql.ConnectionPool(config)
  .connect()
  .then(pool => {
    // console.log('✅ Connected to SQL Server');
    return pool;
  })
  .catch(err => console.error('❌ Database Connection Failed!', err));

async function query(queryString, params = []) {
  const pool = await poolConnect;
  const request = pool.request();

  // Gán từng parameter
  params.forEach((value, index) => {
    request.input(`param${index}`, value);
  });

  // Chuyển ? thành @param0, @param1,...
  let i = 0;
  const parsedQuery = queryString.replace(/\?/g, () => `@param${i++}`);

  return request.query(parsedQuery);
}
module.exports = {
  sql, poolPromise, query
};
