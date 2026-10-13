import { useState, useRef } from 'react'
import * as XLSX from 'xlsx'
import {
  AlertCircle,
  CheckCircle2,
  Download,
  FileSpreadsheet,
  Loader2,
  Upload,
} from 'lucide-react'

import { useJugadorStore } from '@/presentation/store/jugador.store'
import { Button } from '@/presentation/components/ui/button'
import { Label } from '@/presentation/components/ui/label'
import { Badge } from '@/presentation/components/ui/badge'
import { Separator } from '@/presentation/components/ui/separator'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/presentation/components/ui/dialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/presentation/components/ui/table'

// ─── Constantes ───────────────────────────────────────────────────────────────

const COLUMNAS = [
  'nombres',
  'apellidos',
  'cedula',
  'fecha_nacimiento',
  'telefono',
  'email',
  'direccion',
  'equipo',
  'temporada',
  'categoria',
]

const FILA_EJEMPLO_1 = [
  'Juan',
  'Pérez',
  '1712345678',
  '1998-05-12',
  '0991234567',
  'juan@test.com',
  'Av. Amazonas 123',
  'Atlético Armenia',
  'Temporada 2025',
  'Masculino',
]

const FILA_EJEMPLO_2 = [
  'María',
  'López',
  '1798765432',
  '2000-03-22',
  '',
  '',
  '',
  'Atlético Armenia',
  'Temporada 2025',
  'Masculino',
]

const MAX_FILAS = 35
const PREVIEW_ROWS = 10

// ─── Tipos ────────────────────────────────────────────────────────────────────

type Row = (string | number | null)[]

interface PreviewData {
  rows: Row[]
  total: number
}

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
}

// ─── Componente ───────────────────────────────────────────────────────────────

export default function ImportJugadoresDialog({ open, onOpenChange }: Props) {
  const {
    importarExcel,
    isImporting,
    importErrors,
    importResult,
    error,
    clearImportState,
  } = useJugadorStore()

  const fileInputRef = useRef<HTMLInputElement>(null)
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<PreviewData | null>(null)
  const [parseError, setParseError] = useState<string | null>(null)

  // ─── Reset al cerrar ────────────────────────────────────────────────────────

  function handleClose(isOpen: boolean) {
    if (!isOpen) {
      setFile(null)
      setPreview(null)
      setParseError(null)
      clearImportState()
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
    onOpenChange(isOpen)
  }

  // ─── Descargar plantilla ────────────────────────────────────────────────────

  function descargarPlantilla() {
    const data = [COLUMNAS, FILA_EJEMPLO_1, FILA_EJEMPLO_2]
    const ws = XLSX.utils.aoa_to_sheet(data)

    ws['!cols'] = [
      { wch: 15 },
      { wch: 15 },
      { wch: 15 },
      { wch: 18 },
      { wch: 15 },
      { wch: 25 },
      { wch: 25 },
      { wch: 25 },
      { wch: 20 },
      { wch: 15 },
    ]

    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Jugadores')

    XLSX.writeFile(wb, 'plantilla-jugadores.xlsx')
  }

  // ─── Cargar y parsear el archivo ────────────────────────────────────────────

  async function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0]
    if (!f) return

    setFile(f)
    setPreview(null)
    setParseError(null)
    clearImportState()

    if (!/\.xlsx?$/i.test(f.name)) {
      setParseError('El archivo debe ser un Excel (.xlsx o .xls).')
      return
    }

    try {
      const buffer = await f.arrayBuffer()
      const wb = XLSX.read(buffer, { type: 'array' })
      const ws = wb.Sheets[wb.SheetNames[0]]
      const rows = XLSX.utils.sheet_to_json<Row>(ws, {
        header: 1,
        raw: true,
        defval: null,
      })

      if (rows.length === 0) {
        setParseError('El Excel está vacío.')
        return
      }

      const cabecera = (rows[0] as Row).map((c) =>
        c == null ? '' : String(c).trim().toLowerCase(),
      )

      const cabeceraOk =
        cabecera.length === COLUMNAS.length &&
        COLUMNAS.every((col, i) => cabecera[i] === col)

      if (!cabeceraOk) {
        setParseError(
          `Las columnas no coinciden con el formato esperado. ` +
            `Se esperan: ${COLUMNAS.join(', ')}.`,
        )
        return
      }

      const dataRows = (rows.slice(1) as Row[]).filter((row) =>
        row.some((c) => c !== null && String(c).trim() !== ''),
      )

      if (dataRows.length === 0) {
        setParseError('El Excel no contiene filas de datos.')
        return
      }

      if (dataRows.length > MAX_FILAS) {
        setParseError(
          `El Excel tiene ${dataRows.length} filas. El máximo permitido es ${MAX_FILAS}.`,
        )
        return
      }

      setPreview({ rows: dataRows, total: dataRows.length })
    } catch (err) {
      setParseError(
        `No se pudo leer el archivo: ${err instanceof Error ? err.message : 'error desconocido'}`,
      )
    }
  }

  // ─── Subir archivo al backend ───────────────────────────────────────────────

  async function onImportar() {
    if (!file) return
    try {
      await importarExcel(file)
    } catch {
      // Los errores ya están en el store
    }
  }

  // ─── Formatear celda ────────────────────────────────────────────────────────

  function formatCell(value: string | number | null | undefined): string {
    if (value === null || value === undefined || value === '') return '—'
    return String(value)
  }

  // ─── Render ─────────────────────────────────────────────────────────────────

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileSpreadsheet className="h-5 w-5 text-primary" />
            Importar jugadores desde Excel
          </DialogTitle>
          <DialogDescription>
            Sube un archivo Excel con el listado de jugadores. Se crearán los
            jugadores y sus inscripciones al equipo.
          </DialogDescription>
        </DialogHeader>

        {/* Resultado exitoso */}
        {importResult && (
          <div className="rounded-md bg-green-50 dark:bg-green-900/20 px-4 py-3 text-sm text-green-700 dark:text-green-400 flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5" />
            <div>
              <p className="font-medium">¡Importación exitosa!</p>
              <p className="text-xs">
                Se crearon {importResult.creados} jugador
                {importResult.creados !== 1 ? 'es' : ''} correctamente.
              </p>
            </div>
          </div>
        )}

        {/* Errores por fila */}
        {importErrors && importErrors.length > 0 && (
          <div className="space-y-2">
            <div className="rounded-md bg-destructive/10 px-4 py-3 text-sm text-destructive flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              <div>
                <p className="font-medium">No se importó ningún jugador.</p>
                <p className="text-xs">
                  Corrige los errores en el Excel y vuelve a intentar. Se
                  encontraron {importErrors.length} error
                  {importErrors.length !== 1 ? 'es' : ''}.
                </p>
              </div>
            </div>

            <div className="rounded-md border max-h-60 overflow-y-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-20">Fila</TableHead>
                    <TableHead>Error</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {importErrors.map((e, i) => (
                    <TableRow key={i}>
                      <TableCell>
                        <Badge variant="destructive">#{e.fila}</Badge>
                      </TableCell>
                      <TableCell className="text-sm">{e.error}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        )}

        {/* Error genérico */}
        {error && !importErrors && (
          <div className="rounded-md bg-destructive/10 px-4 py-3 text-sm text-destructive flex items-center gap-2">
            <AlertCircle className="h-4 w-4" />
            {error}
          </div>
        )}

        {/* Contenido (solo si no hay resultado) */}
        {!importResult && (
          <>
            {/* Paso 1: Plantilla */}
            <div className="space-y-2">
              <Label>Paso 1 · Descargar plantilla</Label>
              <p className="text-xs text-muted-foreground">
                Usa esta plantilla con el formato exacto. Las columnas son:{' '}
                <span className="font-mono text-xs">
                  {COLUMNAS.join(', ')}
                </span>
                .
              </p>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={descargarPlantilla}
                className="gap-2"
              >
                <Download className="h-4 w-4" />
                Descargar plantilla .xlsx
              </Button>
            </div>

            <Separator />

            {/* Paso 2: Subir archivo */}
            <div className="space-y-2">
              <Label>Paso 2 · Subir Excel completado</Label>
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx,.xls"
                onChange={onFileChange}
                className="block w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-primary file:text-primary-foreground hover:file:bg-primary/90 file:cursor-pointer"
              />
              {file && (
                <p className="text-xs text-muted-foreground">
                  Archivo: <span className="font-mono">{file.name}</span>
                </p>
              )}
            </div>

            {/* Error de parseo */}
            {parseError && (
              <div className="rounded-md bg-destructive/10 px-4 py-3 text-sm text-destructive flex items-start gap-2">
                <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <span>{parseError}</span>
              </div>
            )}

            {/* Preview */}
            {preview && !parseError && (
              <>
                <Separator />
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Vista previa</Label>
                    <Badge variant="secondary">
                      {preview.total} fila{preview.total !== 1 ? 's' : ''}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Mostrando {Math.min(preview.rows.length, PREVIEW_ROWS)} de{' '}
                    {preview.total} fila{preview.total !== 1 ? 's' : ''}.
                  </p>
                  <div className="rounded-md border overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-12">#</TableHead>
                          {COLUMNAS.map((c) => (
                            <TableHead key={c} className="text-xs">
                              {c}
                            </TableHead>
                          ))}
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {preview.rows.slice(0, PREVIEW_ROWS).map((row, i) => (
                          <TableRow key={i}>
                            <TableCell className="text-xs text-muted-foreground">
                              {i + 2}
                            </TableCell>
                            {COLUMNAS.map((_, ci) => (
                              <TableCell
                                key={ci}
                                className="text-xs whitespace-nowrap"
                              >
                                {formatCell(row[ci] as string | number | null)}
                              </TableCell>
                            ))}
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              </>
            )}
          </>
        )}

        <DialogFooter>
          {importResult ? (
            <Button onClick={() => handleClose(false)}>Cerrar</Button>
          ) : (
            <>
              <Button
                type="button"
                variant="outline"
                onClick={() => handleClose(false)}
                disabled={isImporting}
              >
                Cancelar
              </Button>
              <Button
                type="button"
                onClick={onImportar}
                disabled={!file || !preview || isImporting || !!parseError}
                className="gap-2"
              >
                {isImporting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Importando…
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4" />
                    Importar {preview?.total ?? 0} jugador
                    {preview?.total !== 1 ? 'es' : ''}
                  </>
                )}
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
