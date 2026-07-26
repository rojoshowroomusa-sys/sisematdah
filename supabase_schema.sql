-- Supabase PostgreSQL Schema for Presupuestos App
-- Run this in Supabase SQL Editor

-- Create tables
CREATE TABLE "Cliente" (
    "id" SERIAL PRIMARY KEY,
    "nombre" TEXT NOT NULL,
    "email" TEXT,
    "telefono" TEXT,
    "direccion" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE "Producto" (
    "id" SERIAL PRIMARY KEY,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT,
    "precio" DOUBLE PRECISION NOT NULL,
    "tipo" TEXT NOT NULL DEFAULT 'producto',
    "categoria" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE "Presupuesto" (
    "id" SERIAL PRIMARY KEY,
    "numero" INTEGER NOT NULL DEFAULT 0,
    "clienteId" INTEGER NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "validez" TEXT,
    "notas" TEXT,
    "impuesto" DOUBLE PRECISION NOT NULL DEFAULT 21,
    "estado" TEXT NOT NULL DEFAULT 'borrador',
    "frecuencia" TEXT,
    "proximaGeneracion" TIMESTAMP(3),
    "esPlantilla" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Presupuesto_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "Cliente" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE "ItemPresupuesto" (
    "id" SERIAL PRIMARY KEY,
    "presupuestoId" INTEGER NOT NULL,
    "productoId" INTEGER,
    "descripcion" TEXT NOT NULL,
    "cantidad" DOUBLE PRECISION NOT NULL DEFAULT 1,
    "precioUnitario" DOUBLE PRECISION NOT NULL,
    "total" DOUBLE PRECISION NOT NULL,
    CONSTRAINT "ItemPresupuesto_presupuestoId_fkey" FOREIGN KEY ("presupuestoId") REFERENCES "Presupuesto" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ItemPresupuesto_productoId_fkey" FOREIGN KEY ("productoId") REFERENCES "Producto" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE TABLE "Project" (
    "id" SERIAL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "color" TEXT,
    "archived" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE "Task" (
    "id" SERIAL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "energyLevel" TEXT NOT NULL DEFAULT 'media_energia',
    "estimatedMinutes" INTEGER,
    "status" TEXT NOT NULL DEFAULT 'inbox',
    "projectId" INTEGER,
    "frictionScore" INTEGER,
    "parentTaskId" INTEGER,
    "stepOrder" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Task_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Task_parentTaskId_fkey" FOREIGN KEY ("parentTaskId") REFERENCES "Task" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE TABLE "DailyState" (
    "id" SERIAL PRIMARY KEY,
    "date" TIMESTAMP(3) NOT NULL UNIQUE,
    "energyMood" TEXT NOT NULL,
    "topPriorityId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE "Factura" (
    "id" SERIAL PRIMARY KEY,
    "numero" INTEGER NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "presupuestoId" INTEGER NOT NULL UNIQUE,
    "clienteId" INTEGER NOT NULL,
    "impuesto" DOUBLE PRECISION NOT NULL DEFAULT 21,
    "estado" TEXT NOT NULL DEFAULT 'emitida',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Factura_presupuestoId_fkey" FOREIGN KEY ("presupuestoId") REFERENCES "Presupuesto" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Factura_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "Cliente" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE "FacturaItem" (
    "id" SERIAL PRIMARY KEY,
    "facturaId" INTEGER NOT NULL,
    "productoId" INTEGER,
    "descripcion" TEXT NOT NULL,
    "cantidad" DOUBLE PRECISION NOT NULL,
    "precioUnitario" DOUBLE PRECISION NOT NULL,
    "total" DOUBLE PRECISION NOT NULL,
    CONSTRAINT "FacturaItem_facturaId_fkey" FOREIGN KEY ("facturaId") REFERENCES "Factura" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "FacturaItem_productoId_fkey" FOREIGN KEY ("productoId") REFERENCES "Producto" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE TABLE "Attachment" (
    "id" SERIAL PRIMARY KEY,
    "presupuestoId" INTEGER NOT NULL,
    "filename" TEXT NOT NULL,
    "originalName" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL DEFAULT 'application/octet-stream',
    "size" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Attachment_presupuestoId_fkey" FOREIGN KEY ("presupuestoId") REFERENCES "Presupuesto" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE "CalendarEvent" (
    "id" SERIAL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "date" TIMESTAMP(3) NOT NULL,
    "time" TEXT,
    "duration" INTEGER,
    "type" TEXT NOT NULL DEFAULT 'cita',
    "clienteId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "CalendarEvent_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "Cliente" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- Create indexes for foreign keys
CREATE INDEX "ItemPresupuesto_presupuestoId_fkey" ON "ItemPresupuesto" ("presupuestoId");
CREATE INDEX "ItemPresupuesto_productoId_fkey" ON "ItemPresupuesto" ("productoId");
CREATE INDEX "Presupuesto_clienteId_fkey" ON "Presupuesto" ("clienteId");
CREATE INDEX "Factura_presupuestoId_fkey" ON "Factura" ("presupuestoId");
CREATE INDEX "Factura_clienteId_fkey" ON "Factura" ("clienteId");
CREATE INDEX "FacturaItem_facturaId_fkey" ON "FacturaItem" ("facturaId");
CREATE INDEX "FacturaItem_productoId_fkey" ON "FacturaItem" ("productoId");
CREATE INDEX "Attachment_presupuestoId_fkey" ON "Attachment" ("presupuestoId");
CREATE INDEX "CalendarEvent_clienteId_fkey" ON "CalendarEvent" ("clienteId");
CREATE INDEX "Task_projectId_fkey" ON "Task" ("projectId");
CREATE INDEX "Task_parentTaskId_fkey" ON "Task" ("parentTaskId");

-- Create trigger for updatedAt
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW."updatedAt" = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER "Cliente_updatedAt" BEFORE UPDATE ON "Cliente" FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER "Producto_updatedAt" BEFORE UPDATE ON "Producto" FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER "Presupuesto_updatedAt" BEFORE UPDATE ON "Presupuesto" FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER "Project_updatedAt" BEFORE UPDATE ON "Project" FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER "Task_updatedAt" BEFORE UPDATE ON "Task" FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER "Factura_updatedAt" BEFORE UPDATE ON "Factura" FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER "CalendarEvent_updatedAt" BEFORE UPDATE ON "CalendarEvent" FOR EACH ROW EXECUTE FUNCTION update_updated_at();
