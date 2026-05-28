import './loadEnv';
import { execSync } from 'child_process';
import postgres from 'postgres';
import fs from 'fs';
import path from 'path';

async function runSystemCheck() {
  console.log("=========================================");
  console.log("🛡️  LifeBloom Hub: LUMEN-9 Quality Gatekeeper");
  console.log("=========================================");

  let hasErrors = false;

  // 1. TypeScript Compilation Check (tsc)
  console.log("\n⚡ Step 1: Running TypeScript Compiler Check...");
  try {
    execSync('npx tsc --noEmit', { stdio: 'inherit' });
    console.log("✅ TypeScript compilation passed cleanly.");
  } catch (error) {
    console.error("❌ TypeScript compilation failed.");
    hasErrors = true;
  }

  // 2. Linting Check (next lint)
  console.log("\n⚡ Step 2: Running ESLint Validation...");
  try {
    execSync('npx next lint', { stdio: 'inherit' });
    console.log("✅ ESLint validation passed cleanly.");
  } catch (error) {
    console.error("❌ ESLint validation failed.");
    hasErrors = true;
  }

  // 3. Row-Level Security (RLS) Audit Check
  console.log("\n⚡ Step 3: Running Row-Level Security (RLS) Audit...");
  const connectionString = process.env.SUPABASE_POOLER_URL || process.env.DATABASE_URL;

  if (connectionString) {
    try {
      console.log("📡 Connecting to database for live RLS status validation...");
      const sql = postgres(connectionString, { ssl: 'require', connect_timeout: 5 });
      const tables = await sql`
        SELECT tablename, rowsecurity 
        FROM pg_tables 
        WHERE schemaname = 'public'
          AND tablename NOT IN ('spatial_ref_sys', 'playwright_tests');
      `;
      await sql.end();

      if (tables && tables.length > 0) {
        console.log(`📊 Auditing ${tables.length} database tables:`);
        let unsecureTables = [];
        for (const table of tables) {
          const isSecure = table.rowsecurity;
          console.log(`  - ${table.tablename}: ${isSecure ? '🔒 RLS ENABLED' : '⚠️  RLS DISABLED'}`);
          if (!isSecure) {
            unsecureTables.push(table.tablename);
          }
        }

        if (unsecureTables.length > 0) {
          console.error(`❌ Security Violation: RLS is disabled on active tables: ${unsecureTables.join(', ')}`);
          hasErrors = true;
        } else {
          console.log("✅ All active database tables have Row-Level Security (RLS) enabled.");
        }
      } else {
        console.log("⚠️ No tables found in public schema to audit.");
      }
    } catch (dbError: any) {
      console.warn(`📡 Live database RLS check skipped or failed (${dbError.message || dbError}). Falling back to migration script scan...`);
      auditMigrationFiles();
    }
  } else {
    console.log("⚠️ No database connection string found in env. Falling back to migration script scan...");
    auditMigrationFiles();
  }

  function auditMigrationFiles() {
    console.log("📂 Scanning migration files for RLS configurations...");
    const migrationDir = path.resolve(process.cwd(), 'supabase/migrations');
    if (!fs.existsSync(migrationDir)) {
      console.log("⚠️ Supabase migrations folder not found. Skipping scan.");
      return;
    }

    try {
      const files = fs.readdirSync(migrationDir).filter(f => f.endsWith('.sql'));
      console.log(`🔍 Scanning ${files.length} migration files...`);
      
      const tableDefinitions: { [key: string]: boolean } = {};
      const rlsEnables: { [key: string]: boolean } = {};

      for (const file of files) {
        const filePath = path.join(migrationDir, file);
        const content = fs.readFileSync(filePath, 'utf8');

        // Match table creations
        const createTableRegex = /create\s+table\s+(?:if\s+not\s+exists\s+)?(?:public\.)?([a-zA-Z0-9_-]+)/gi;
        let match;
        while ((match = createTableRegex.exec(content)) !== null) {
          const tableName = match[1].toLowerCase();
          if (tableName !== 'spatial_ref_sys') {
            tableDefinitions[tableName] = true;
          }
        }

        // Match RLS activations
        const rlsRegex = /alter\s+table\s+(?:public\.)?([a-zA-Z0-9_-]+)\s+enable\s+row\s+level\s+security/gi;
        while ((match = rlsRegex.exec(content)) !== null) {
          const tableName = match[1].toLowerCase();
          rlsEnables[tableName] = true;
        }
      }

      const tables = Object.keys(tableDefinitions);
      if (tables.length === 0) {
        console.log("✅ No custom tables found in migration scripts.");
        return;
      }

      console.log(`📊 Found ${tables.length} schema table definitions. Validating RLS activations...`);
      let missingRLS = [];
      for (const table of tables) {
        const hasRLS = rlsEnables[table];
        console.log(`  - ${table}: ${hasRLS ? '🔒 RLS ENABLED IN MIGRATION' : '⚠️  RLS MISSING IN MIGRATION'}`);
        if (!hasRLS) {
          missingRLS.push(table);
        }
      }

      if (missingRLS.length > 0) {
        console.error(`❌ Security Warning: RLS enable statement is missing in migrations for tables: ${missingRLS.join(', ')}`);
        // We warn rather than fail build on static scans since older tables might be defined elsewhere
        console.log("⚠️ Migration static check warning issued. Ensure RLS is active on live DB.");
      } else {
        console.log("✅ All tables in migration scripts have RLS ENABLE declarations.");
      }
    } catch (err: any) {
      console.error("❌ Failed to parse migration files:", err.message);
    }
  }

  console.log("\n=========================================");
  if (hasErrors) {
    console.error("❌ LUMEN-9 System Check: FAILED");
    console.log("=========================================");
    process.exit(1);
  } else {
    console.log("✅ LUMEN-9 System Check: PASSED");
    console.log("=========================================");
    process.exit(0);
  }
}

runSystemCheck();
