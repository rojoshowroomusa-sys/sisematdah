-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Presupuesto" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "numero" INTEGER NOT NULL DEFAULT 0,
    "clienteId" INTEGER NOT NULL,
    "fecha" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "validez" TEXT,
    "notas" TEXT,
    "impuesto" REAL NOT NULL DEFAULT 21,
    "estado" TEXT NOT NULL DEFAULT 'borrador',
    "frecuencia" TEXT,
    "proximaGeneracion" DATETIME,
    "esPlantilla" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Presupuesto_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "Cliente" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Presupuesto" ("clienteId", "createdAt", "estado", "fecha", "frecuencia", "id", "impuesto", "notas", "numero", "proximaGeneracion", "updatedAt", "validez") SELECT "clienteId", "createdAt", "estado", "fecha", "frecuencia", "id", "impuesto", "notas", "numero", "proximaGeneracion", "updatedAt", "validez" FROM "Presupuesto";
DROP TABLE "Presupuesto";
ALTER TABLE "new_Presupuesto" RENAME TO "Presupuesto";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
