/**
 * Script para configurar la base de datos
 * Ejecuta las migraciones y stored procedures
 */

import { runMigration } from './migrations/migration_v1.js';
import { runMigration as runMigrationV2 } from './migrations/migration_v2.js';
import { runMigration as runMigrationV3 } from './migrations/migration_v3.js';
import mysql from 'mysql2/promise';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuración de la base de datos
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'crud_node',
  port: process.env.DB_PORT || 3306
};

async function executeStoredProcedures() {
  let connection;
  try {
    connection = await mysql.createConnection(dbConfig);
    console.log("Conectado a la base de datos MySQL");

    // Leer el archivo de stored procedures
    const spPath = path.join(__dirname, 'data', 'db', 'sp.sql');
    const spContent = fs.readFileSync(spPath, 'utf8');

    // Dividir el contenido en statements individuales
    const statements = spContent.split('DELIMITER $$').filter(stmt => stmt.trim());

    for (const statement of statements) {
      if (statement.trim()) {
        try {
          // Reemplazar el DELIMITER temporalmente
          const cleanStatement = statement.replace(/DELIMITER \$\$/g, '').trim();
          if (cleanStatement) {
            await connection.query(cleanStatement);
            console.log("Stored procedure ejecutado exitosamente");
          }
        } catch (error) {
          console.error("Error ejecutando stored procedure:", error.message);
        }
      }
    }

    console.log("Todos los stored procedures han sido ejecutados");
    return { success: true };
  } catch (error) {
    console.error("Error ejecutando stored procedures:", error);
    return { success: false, error };
  } finally {
    if (connection) {
      await connection.end();
      console.log("Conexión a la base de datos cerrada");
    }
  }
}

async function setupDatabase() {
  console.log("Iniciando configuración de la base de datos...");

  try {
    // Ejecutar migraciones en orden
    console.log("Ejecutando migración v1...");
    const result1 = await runMigration();
    if (!result1.success) {
      throw new Error("Error en migración v1");
    }

    console.log("Ejecutando migración v2...");
    const result2 = await runMigrationV2();
    if (!result2.success) {
      throw new Error("Error en migración v2");
    }

    console.log("Ejecutando migración v3...");
    const result3 = await runMigrationV3();
    if (!result3.success) {
      throw new Error("Error en migración v3");
    }

    // Ejecutar stored procedures
    console.log("Ejecutando stored procedures...");
    const spResult = await executeStoredProcedures();
    if (!spResult.success) {
      throw new Error("Error ejecutando stored procedures");
    }

    console.log("✅ Configuración de la base de datos completada exitosamente!");
  } catch (error) {
    console.error("❌ Error en la configuración de la base de datos:", error);
    process.exit(1);
  }
}

// Ejecutar si se llama directamente
if (import.meta.url === `file://${process.argv[1]}`) {
  setupDatabase();
}

export { setupDatabase }; 