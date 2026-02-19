import sql from 'mssql';

const sqlConfig = {
  user: process.env.AZURE_SQL_USER,
  password: process.env.AZURE_SQL_PASSWORD,
  database: process.env.AZURE_SQL_DATABASE,
  server: process.env.AZURE_SQL_SERVER,
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000
  },
  options: {
    encrypt: true,
    trustServerCertificate: false,
    connectTimeout: 30000 // Megemeltük 30 másodpercre
  }
};

let pool = null;

export async function connectToDatabase() {
  if (pool && pool.connected) {
    return pool;
  }

  try {
    // Ha volt régi szakadt kapcsolat, próbáljuk lezárni
    if (pool) await pool.close();
    
    // Újraépítjük a poolt
    pool = await sql.connect(sqlConfig);
    return pool;
  } catch (err) {
    console.error("SQL Csatlakozási hiba:", err);
    pool = null; // Kényszerítsük a rendszert, hogy legközelebb újrakezdje
    throw err;
  }
}
