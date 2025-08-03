import { SQLiteProvider, type SQLiteDatabase } from "expo-sqlite";
import { Main } from './app';
export default function index(){
    return (
        <SQLiteProvider databaseName="db.db" onInit={migrateDbIfNeeded}>
            <Main />
        </SQLiteProvider>
    )
}

async function migrateDbIfNeeded(db: SQLiteDatabase) {
      const DATABASE_VERSION = 1;
      let { user_version: currentDbVersion } = await db.getFirstAsync<{
        user_version: number;
      }>('PRAGMA user_version');
      if (currentDbVersion >= DATABASE_VERSION) {
        return;
      }
      if (currentDbVersion === 0) {
        await db.execAsync(`
            PRAGMA journal_mode = 'wal';
            CREATE TABLE IF NOT EXISTS items (id INTEGER PRIMARY KEY NOT NULL, done INT, value TEXT, date TEXT);
            `);
        currentDbVersion = 1;
      }
      // if (currentDbVersion === 1) {
      //   Add more migrations
      // }
      await db.execAsync(`PRAGMA user_version = ${DATABASE_VERSION}`);
    }
    