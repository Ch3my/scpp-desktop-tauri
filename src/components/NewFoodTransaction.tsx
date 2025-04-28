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
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { CirclePlus, Loader2 } from "lucide-react"
import { useEffect, useState } from "react"
import { DateTime } from "luxon";
import { DatePicker } from "./DatePicker";
import { toast } from "sonner";

interface Props {
    onOpenChange?: (isOpen: boolean) => void;
    isOpen?: boolean;
}

const NewFoodTransaction: React.FC<Props> = ({ onOpenChange, isOpen: controlledIsOpen }) => {
    const { apiPrefix, sessionId } = useAppState()
    const [foods, setFoods] = useState<any[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [codigo, setCodigo] = useState<string>("");
    const [itemId, setItemId] = useState<string>("");
    const [cantidad, setCantidad] = useState<number>(0);
    const [accion, setAccion] = useState<string>("");
    const [notas, setNotas] = useState<string>("");
    const [bestBefore, setBestBefore] = useState<DateTime | undefined>(undefined);
    const [uncontrolledIsOpen, setUncontrolledIsOpen] = useState<boolean>(false);
    // Decide whether to use the parent’s isOpen or our local state
    const isOpen = controlledIsOpen ?? uncontrolledIsOpen;

    const getData = async () => {
        setLoading(true);
        let params = new URLSearchParams();
        params.set("sessionHash", sessionId);
        let data = await fetch(`${apiPrefix}/food/items?${params.toString()}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        }).then(response => response.json())
        setFoods(data);
        setLoading(false);
    }

    const handleSave = async () => {
        if (cantidad == 0) {
            toast("La cantidad no puede ser 0")
            return
        }
        if (itemId == "") {
            toast("Debes seleccionar un item")
            return
        }
        if (accion == "") {
            toast("Debes seleccionar una acción")
            return
        }
        setLoading(true);
        let calculatedBestBefore = bestBefore ? bestBefore.toFormat("yyyy-MM-dd") : null;
        const payload = {
            sessionHash: sessionId,
            foodItemId: Number(itemId),
            quantity: cantidad,
            transactionType: accion,
            code: codigo,
            note: notas,
            bestBefore: calculatedBestBefore
        }
        // console.log(payload)
        let reponse = await fetch(`${apiPrefix}/food/transaction`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        }).then(response => response.json());

        if(reponse.hasErrors) {
            toast("Error al guardar la transacción " + reponse.errorDescription[0])
            setLoading(false);
            return
        }
        toast("Transacción guardada")
        handleDialogChange(false);
        clearInputs()
    }

    const clearInputs = () => {
        setTimeout(() => {
            // Do not change until dialog closes
            setLoading(false);
            setCodigo("");
            setItemId("");
            setCantidad(0);
            setAccion("");
            setNotas("");
            setBestBefore(undefined);
        }, 100)
    }
    const handleDialogChange = (open: boolean) => {
        // If we have a parent controlling it, call the parent's callback
        onOpenChange?.(open);

        // Otherwise, fall back to local state
        if (controlledIsOpen === undefined) {
            setUncontrolledIsOpen(open);
        }
    };

    useEffect(() => {
        getData()
    }, []);

    return (
        <Dialog open={isOpen} onOpenChange={handleDialogChange}>
            <DialogTrigger asChild>
                <Button variant="outline"><CirclePlus /></Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Nueva transacción</DialogTitle>
                    <DialogDescription>
                        Ingresa, egresa o ajusta la cantidad de un alimento
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 items-center" style={{ gridTemplateColumns: '1fr 3fr' }}>
                    <Label htmlFor="item">
                        Item
                    </Label>
                    <Select value={itemId} onValueChange={(value) => setItemId(value)}>
                        <SelectTrigger>
                            <SelectValue placeholder="Selecciona un Item" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectGroup>
                                {foods.map((food) => (
                                    <SelectItem key={food.id} value={food.id}>
                                        {food.name}
                                    </SelectItem>
                                ))}
                            </SelectGroup>
                        </SelectContent>
                    </Select>
                    <Label htmlFor="quantity">
                        Cantidad
                    </Label>
                    <Input id="quantity" value={cantidad} type="number"
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCantidad(parseFloat(e.target.value))} />
                    <Label htmlFor="accion">
                        Accion
                    </Label>
                    <Select value={accion} onValueChange={(value) => setAccion(value)}>
                        <SelectTrigger>
                            <SelectValue placeholder="Selecciona accion" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectGroup>
                                <SelectItem value="consumption">Consumo</SelectItem>
                                <SelectItem value="restock">Reposición</SelectItem>
                                <SelectItem value="adjustment">Ajuste</SelectItem>
                            </SelectGroup>
                        </SelectContent>
                    </Select>
                    <Label htmlFor="codigo">
                        Código
                    </Label>
                    <Input id="codigo" maxLength={3} autoComplete="off" 
                        disabled={accion !== "restock"}
                        value={codigo} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCodigo(e.target.value.toUpperCase())} />
                    <Label htmlFor="notas">
                        Vencimiento
                    </Label>
                    <DatePicker
                        value={bestBefore}
                        disabled={accion !== "restock"}
                        onChange={(e) => e && setBestBefore(e)}
                    />
                    <Label htmlFor="notas">
                        Notas
                    </Label>
                    <Input id="notas" value={notas} autoComplete="off" 
                        disabled={accion !== "restock"}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNotas(e.target.value)} />
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

export default NewFoodTransaction