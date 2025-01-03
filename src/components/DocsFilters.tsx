import * as React from "react"
import { DateTime } from "luxon"
import { useAppState } from "@/AppState"
import { Button } from "@/components/ui/button"
import { Filter } from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Select,
    SelectTrigger,
    SelectValue,
    SelectContent,
    SelectItem,
} from "@/components/ui/select"
import { DatePicker } from "./DatePicker";

interface FilterDialogProps {
    // Parent passes in Luxon `DateTime` objects
    fechaInicio: DateTime
    fechaTermino: DateTime

    // `categoria` is an integer
    categoria: number

    // `searchPhrase` is a string
    searchPhrase: string

    // Emitted back to parent when user clicks "OK"
    onFiltersChange: (filters: {
        fechaInicio: DateTime
        fechaTermino: DateTime
        categoria: number
        searchPhrase: string
    }) => void
}

export function DocsFilters({
    fechaInicio,
    fechaTermino,
    categoria,
    searchPhrase,
    onFiltersChange,
}: FilterDialogProps) {
    const [open, setOpen] = React.useState(false)
    const { categorias } = useAppState()
    const [localFechaInicio, setLocalFechaInicio] = React.useState<DateTime>(fechaInicio)
    const [localFechaTermino, setLocalFechaTermino] = React.useState<DateTime>(fechaTermino)
    const [localCategoria, setLocalCategoria] = React.useState<number>(categoria)
    const [localSearchPhrase, setLocalSearchPhrase] = React.useState<string>(searchPhrase)

    // Keep local state in sync if the parent props change
    React.useEffect(() => {
        setLocalFechaInicio(fechaInicio)
    }, [fechaInicio])

    React.useEffect(() => {
        setLocalFechaTermino(fechaTermino)
    }, [fechaTermino])

    React.useEffect(() => {
        setLocalCategoria(categoria)
    }, [categoria])

    React.useEffect(() => {
        setLocalSearchPhrase(searchPhrase)
    }, [searchPhrase])

    const handleOk = () => {
        onFiltersChange({
            fechaInicio: localFechaInicio,
            fechaTermino: localFechaTermino,
            categoria: localCategoria,
            searchPhrase: localSearchPhrase,
        })
        setOpen(false)
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline">
                    <Filter />
                </Button>
            </DialogTrigger>

            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Filtros</DialogTitle>
                    <DialogDescription>
                        Actualiza y presiona Ok para actualizar los resultados
                    </DialogDescription>
                </DialogHeader>

                <div className="grid gap-4 py-4 items-center" style={{ gridTemplateColumns: "1fr 3fr" }}>
                    <Label htmlFor="search-phrase">
                        Buscar
                    </Label>
                    <Input
                        id="search-phrase"
                        placeholder="Palabras clave..."
                        value={localSearchPhrase}
                        onChange={(e) => setLocalSearchPhrase(e.target.value)}
                    />
                    <Label htmlFor="fecha-inicio">
                        Fecha Inicio
                    </Label>
                    <DatePicker
                        value={localFechaInicio}
                        onChange={(e) => e && setLocalFechaInicio(e)}
                    />

                    <Label htmlFor="fecha-termino">
                        Fecha Término
                    </Label>
                    <DatePicker
                        value={localFechaTermino}
                        onChange={(e) => e && setLocalFechaTermino(e)}
                    />

                    <Label htmlFor="categoria">
                        Categoría
                    </Label>
                    <Select
                        // The `Select` from shadcn/ui only accepts strings for `value`.
                        // Convert our numeric value to string:
                        value={String(localCategoria)}
                        // Convert back to number in the onValueChange:
                        onValueChange={(val) => setLocalCategoria(Number(val))}
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="Seleccionar" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="0">(Todos)</SelectItem>
                            {categorias.map((cat) => (
                                <SelectItem key={cat.id} value={String(cat.id)}>
                                    {cat.descripcion}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => setOpen(false)}>
                        Salir
                    </Button>
                    <Button onClick={handleOk}>
                        OK
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
