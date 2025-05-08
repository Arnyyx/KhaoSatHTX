// db.js
const sql = require('mssql');

const config = {
  user: 'sa',
  password: '111',
  server: 'MSI\\SQLEXPRESS',
  database: 'KhaoSatHTX',
  options: {
    encrypt: false,
    trustServerCertificate: true,
  },
};

const poolConnect = new sql.ConnectionPool(config)
  .connect()
  .then(pool => {
    // console.log('✅ Connected to SQL Server');
    return pool;
  })
  .catch(err => {
    console.error('❌ Database Connection Failed!', err);
  });

// Hàm query wrapper
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
  sql,
  poolConnect,
  query, 
};
