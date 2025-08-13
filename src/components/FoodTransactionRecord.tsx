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
import { useEffect, useState } from "react"
import { DateTime } from "luxon";
import { toast } from "sonner";
import { DatePickerInput } from "./DatePickerInput";
import { ComboboxAlimentos } from "./ComboboxAlimentos";
import { Food } from "@/models/Food";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "./ui/select";

interface Props {
    onOpenChange?: (isOpen: boolean) => void;
    isOpen?: boolean;
    id?: number;
    hideButton?: boolean;
}

const FoodTransactionRecord: React.FC<Props> = ({ onOpenChange, id, isOpen: controlledIsOpen, hideButton }) => {
    const { apiPrefix, sessionId } = useAppState()
    const [foods, setFoods] = useState<Food[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [codigo, setCodigo] = useState<string>("");
    const [itemId, setItemId] = useState<number>(0);
    const [cantidad, setCantidad] = useState<number>(0);
    const [accion, setAccion] = useState<string>("");
    const [notas, setNotas] = useState<string>("");
    const [bestBefore, setBestBefore] = useState<DateTime | undefined>(undefined);
    const [uncontrolledIsOpen, setUncontrolledIsOpen] = useState<boolean>(false);
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

    const getTransactionData = async () => {
        if (!id) return;
        setLoading(true);
        let params = new URLSearchParams();
        params.set("sessionHash", sessionId);
        params.set("id", id.toString());
        let data = await fetch(`${apiPrefix}/food/transaction?${params.toString()}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        }).then(response => response.json())
        data = data[0]; 
        setItemId(data.item_id);
        setCantidad(data.change_qty);
        setAccion(data.transaction_type);
        setCodigo(data.code);
        setNotas(data.note);
        if (data.best_before) {
            setBestBefore(DateTime.fromISO(data.best_before));
        }
        setLoading(false);
    }

    const handleSave = async () => {
        if (cantidad == 0) {
            toast("La cantidad no puede ser 0")
            return
        }
        if (itemId == 0) {
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
            id: id,
            foodItemId: Number(itemId),
            quantity: cantidad,
            transactionType: accion,
            code: codigo,
            note: notas,
            bestBefore: calculatedBestBefore
        }
        let url = id ? `${apiPrefix}/food/transaction` : `${apiPrefix}/food/transaction`;
        let method = id ? 'PUT' : 'POST';

        let reponse = await fetch(url, {
            method: method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        }).then(response => response.json());

        if (reponse.hasErrors) {
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
            setLoading(false);
            setCodigo("");
            setItemId(0);
            setCantidad(0);
            setAccion("");
            setNotas("");
            setBestBefore(undefined);
        }, 100)
    }
    const handleDialogChange = (open: boolean) => {
        onOpenChange?.(open);
        if (controlledIsOpen === undefined) {
            setUncontrolledIsOpen(open);
        }
        if (!isOpen) {
            clearInputs()
        }
    };

    useEffect(() => {
        if (isOpen) {
            getData()
            if (id) {
                getTransactionData()
            }
        } else {
            clearInputs()
        }
    }, [isOpen, id]);

    return (
        <Dialog open={isOpen} onOpenChange={handleDialogChange}>
            {!hideButton && <DialogTrigger asChild>
                <Button variant="outline"><CirclePlus /></Button>
            </DialogTrigger>}
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>{id ? "Editar" : "Nueva"} transacción</DialogTitle>
                    <DialogDescription>
                        Ingresa, egresa o ajusta la cantidad de un alimento
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 items-center" style={{ gridTemplateColumns: '1fr 3fr' }}>
                    <Label htmlFor="item">
                        Item
                    </Label>
                    <ComboboxAlimentos foods={foods} value={itemId} onChange={setItemId} hideTodos={true} />
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
                    <DatePickerInput value={bestBefore}
                        disabled={accion !== "restock"}
                        onChange={(e) => e && setBestBefore(e)} />
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

export default FoodTransactionRecord