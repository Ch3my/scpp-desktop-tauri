import { useAppState } from "@/AppState"
import { Button } from "@/components/ui/button"
import { fetch } from '@tauri-apps/plugin-http';
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
import { CirclePlus, Loader2 } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"

interface Props {
    onOpenChange?: (isOpen: boolean) => void;
    isOpen?: boolean;
}

const NewFoodItem: React.FC<Props> = ({ onOpenChange, isOpen: controlledIsOpen }) => {
    const { apiPrefix, sessionId } = useAppState()
    const [loading, setLoading] = useState<boolean>(false);
    const [nombre, setNombre] = useState<string>("");
    const [unit, setUnit] = useState<string>("");
    const [uncontrolledIsOpen, setUncontrolledIsOpen] = useState<boolean>(false);
    // Decide whether to use the parent’s isOpen or our local state
    const isOpen = controlledIsOpen ?? uncontrolledIsOpen;

    const handleDialogChange = (open: boolean) => {
        // If we have a parent controlling it, call the parent's callback
        onOpenChange?.(open);

        // Otherwise, fall back to local state
        if (controlledIsOpen === undefined) {
            setUncontrolledIsOpen(open);
        }
    };

    const handleSave = async () => {
        if (nombre == "") {
            toast("El nombre no puede estar vacío")
            return
        }
        if (unit == "") {
            toast("La unidad no puede estar vacía")
            return
        }
        setLoading(true);
        const payload = {
            sessionHash: sessionId,
            name: nombre,
            unit: unit,
        }
        // console.log(payload)
        await fetch(`${apiPrefix}/food/item`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        });
        toast("Item guardado")
        handleDialogChange(false);
        setTimeout(() => {
            // Do not change until dialog closes
            setLoading(false);
            setNombre("");
            setUnit("");
        }, 100)
    }


    return (
        <Dialog open={isOpen} onOpenChange={handleDialogChange}>
            <DialogTrigger asChild>
                <Button variant="outline"><CirclePlus /></Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Agregar Producto</DialogTitle>
                    <DialogDescription>
                        Agregar un nuevo tipo de producto a la base de datos.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="name" className="text-right">
                            Nombre
                        </Label>
                        <Input id="name" value={nombre} className="col-span-3" autoComplete="off"
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNombre(e.target.value)} />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="unit" className="text-right">
                            Und medida (Kg, L, etc.)
                        </Label>
                        <Input id="unit" value={unit} className="col-span-3"
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setUnit(e.target.value)} />
                    </div>
                </div>
                <DialogFooter>
                    <Button onClick={handleSave} disabled={loading}>
                        {loading && <Loader2 className="animate-spin" />}
                        Guardar
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

export default NewFoodItem
