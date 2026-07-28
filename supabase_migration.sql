CREATE TABLE IF NOT EXISTS "ServicioContratado" (
    "id" SERIAL NOT NULL,
    "clienteId" INTEGER NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT,
    "montoMensual" DOUBLE PRECISION NOT NULL,
    "diaFacturacion" INTEGER NOT NULL DEFAULT 1,
    "estado" TEXT NOT NULL DEFAULT 'activo',
    "frecuenciaFactura" TEXT NOT NULL DEFAULT 'mensual',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "ServicioContratado_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "TareaRealizada" (
    "id" SERIAL NOT NULL,
    "clienteId" INTEGER NOT NULL,
    "servicioId" INTEGER,
    "titulo" TEXT NOT NULL,
    "descripcion" TEXT,
    "fecha" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "horas" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "tipo" TEXT NOT NULL DEFAULT 'interna',
    "finalizada" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "TareaRealizada_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "PagoCliente" (
    "id" SERIAL NOT NULL,
    "clienteId" INTEGER NOT NULL,
    "servicioId" INTEGER,
    "monto" DOUBLE PRECISION NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL,
    "medio" TEXT NOT NULL DEFAULT 'transferencia',
    "periodo" TEXT NOT NULL,
    "estado" TEXT NOT NULL DEFAULT 'pendiente',
    "notas" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "PagoCliente_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "ServicioTercero" (
    "id" SERIAL NOT NULL,
    "clienteId" INTEGER NOT NULL,
    "proveedorId" INTEGER,
    "proveedorNombre" TEXT NOT NULL,
    "concepto" TEXT NOT NULL,
    "costo" DOUBLE PRECISION NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "facturadoAlCliente" BOOLEAN NOT NULL DEFAULT false,
    "notas" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ServicioTercero_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "Proveedor" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "contacto" TEXT,
    "telefono" TEXT,
    "email" TEXT,
    "notas" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Proveedor_pkey" PRIMARY KEY ("id")
);

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'ServicioContratado_clienteId_fkey') THEN
    ALTER TABLE "ServicioContratado" ADD CONSTRAINT "ServicioContratado_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "Cliente"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'TareaRealizada_clienteId_fkey') THEN
    ALTER TABLE "TareaRealizada" ADD CONSTRAINT "TareaRealizada_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "Cliente"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'TareaRealizada_servicioId_fkey') THEN
    ALTER TABLE "TareaRealizada" ADD CONSTRAINT "TareaRealizada_servicioId_fkey" FOREIGN KEY ("servicioId") REFERENCES "ServicioContratado"("id") ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'PagoCliente_clienteId_fkey') THEN
    ALTER TABLE "PagoCliente" ADD CONSTRAINT "PagoCliente_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "Cliente"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'PagoCliente_servicioId_fkey') THEN
    ALTER TABLE "PagoCliente" ADD CONSTRAINT "PagoCliente_servicioId_fkey" FOREIGN KEY ("servicioId") REFERENCES "ServicioContratado"("id") ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'ServicioTercero_clienteId_fkey') THEN
    ALTER TABLE "ServicioTercero" ADD CONSTRAINT "ServicioTercero_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "Cliente"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'ServicioTercero_proveedorId_fkey') THEN
    ALTER TABLE "ServicioTercero" ADD CONSTRAINT "ServicioTercero_proveedorId_fkey" FOREIGN KEY ("proveedorId") REFERENCES "Proveedor"("id") ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;
