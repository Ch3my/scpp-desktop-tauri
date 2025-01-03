import React, { useState, useEffect } from 'react';
import { Label } from '@/components/ui/label';
import { CirclePlus } from "lucide-react"
import { Input } from './ui/input';
import { DatePicker } from './DatePicker';
import { DateTime } from 'luxon';
import { useAppState } from "@/AppState"
import { toast } from "sonner"

import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Button } from './ui/button';
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogDescription
} from "@/components/ui/dialog";
import { fetch } from '@tauri-apps/plugin-http';


interface DocRecordProps {
    id?: number; // Optional id to indicate editing mode
    hideButton?: boolean; // Whether to hide the default trigger button
    onOpenChange?: (isOpen: boolean) => void; // Callback for when the dialog opens/closes
    /**
     * Whether the Dialog is open (parent-controlled).
     * If not provided, DocRecord can manage its own state (uncontrolled mode).
     */
    isOpen?: boolean;
}

const DocRecord: React.FC<DocRecordProps> = ({ id, hideButton = false, onOpenChange, isOpen: controlledIsOpen }) => {
    const [uncontrolledIsOpen, setUncontrolledIsOpen] = useState<boolean>(false);
    // Decide whether to use the parent’s isOpen or our local state
    const isOpen = controlledIsOpen ?? uncontrolledIsOpen;

    const { apiPrefix, sessionId, categorias, tipoDocs } = useAppState()

    const [monto, setMonto] = useState<number>(0);
    const [proposito, setProposito] = useState<string>('');
    const [montoStr, setMontoStr] = useState<string>('');
    const [fecha, setFecha] = useState<DateTime>(DateTime.now());
    const [tipoDoc, setTipoDoc] = useState<string>("0");
    const [categoria, setCategoria] = useState<string>("0");

    useEffect(() => {
        const getDoc = async () => {
            let params = new URLSearchParams();
            params.set("sessionHash", sessionId);
            params.set("id[]", id?.toString() || '');

            const response = await fetch(`${apiPrefix}/documentos?${params.toString()}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                },
            }).then(response => response.json())

            // TODO. Handle error
            const doc = response[0];
            // TODO create number input formated component
            setMonto(doc.monto);
            setMontoStr(doc.monto.toString());
            setProposito(doc.proposito);
            setFecha(DateTime.fromFormat(doc.fecha, "yyyy-MM-dd"));
            setTipoDoc(doc.fk_tipoDoc);
            setCategoria(doc.fk_categoria);
        }

        if (id) {
            getDoc()
        }
    }, [id]);

    const deleteDoc = async () => {
        let params = new URLSearchParams();
        params.set("sessionHash", sessionId);
        params.set("id", id?.toString() || '');

        const response = await fetch(`${apiPrefix}/documentos`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ sessionHash: sessionId, id: id }),

        }).then(response => response.json())
        // TODO handle error
        handleDialogChange(false);
        toast('Documento Eliminado');
    }

    const handleSave = () => {
        if (tipoDoc == "1" && !categoria) {
            toast('Debe seleccionar una categoria');
            return;
        }
        const payload: { monto: number; proposito: string; fecha: string; fk_tipoDoc: number; fk_categoria: number | null; sessionHash: string } = {
            monto,
            proposito,
            fecha: fecha.toFormat('yyyy-MM-dd'),
            fk_tipoDoc: parseInt(tipoDoc),
            fk_categoria: parseInt(categoria),
            sessionHash: sessionId
        };
        if (tipoDoc != "1") {
            payload.fk_categoria = null;
        }
        if (id) {
            fetch(`${apiPrefix}/documentos`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });
            toast('Documento Actualizado');
        } else {
            fetch(`${apiPrefix}/documentos`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });
            toast('Documento Agregado');
        }
        handleDialogChange(false);
    };

    const handleDialogChange = (open: boolean) => {
        // If we have a parent controlling it, call the parent's callback
        onOpenChange?.(open);

        // Otherwise, fall back to local state
        if (controlledIsOpen === undefined) {
            setUncontrolledIsOpen(open);
        }

        if (open === false) {
            setMonto(0);
            setMontoStr("0");
            setProposito('');
            setFecha(DateTime.now());
            setTipoDoc("0");
            setCategoria("0");
        }
    };

    return (
        <>
            {!hideButton && (
                <Button variant="outline" onClick={() => handleDialogChange(true)}>
                    <CirclePlus />
                </Button>
            )}
            <Dialog open={isOpen} onOpenChange={handleDialogChange}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>{id ? 'Editar Documento' : 'Agregar Documento'}</DialogTitle>
                        <DialogDescription>
                            {/* To avoid anoying warning */}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="flex flex-col">
                        <div>
                            <Label className="text-muted-foreground">Monto</Label>
                            <Input
                                value={montoStr}
                                onChange={(e) => {
                                    if (e.target.value === "" || e.target.value === "-") {
                                        setMontoStr(e.target.value);
                                        return;
                                    }
                                    let parseado = parseInt(e.target.value)
                                    if (isNaN(parseado)) {
                                        setMontoStr("0");
                                        setMonto(0)
                                        return
                                    }
                                    setMontoStr(parseado.toString());
                                    setMonto(parseado)
                                }}
                            />
                        </div>
                        <div>
                            <Label className="text-muted-foreground">Proposito</Label>
                            <Input
                                value={proposito}
                                onChange={(e) => setProposito(e.target.value)}
                            />
                        </div>
                        <div>
                            <Label className="text-muted-foreground">Fecha</Label>
                            <DatePicker
                                value={fecha}
                                onChange={(e) => e && setFecha(e)}
                            />
                        </div>
                        <div>
                            <Label className="text-muted-foreground">Tipo Doc</Label>
                            <Select value={tipoDoc} onValueChange={(e) => {
                                setTipoDoc(e)
                            }}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectGroup>
                                        <SelectLabel>Tipo Doc</SelectLabel>
                                        {tipoDocs.map((tipo) => (
                                            <SelectItem key={tipo.id} value={tipo.id}>
                                                {tipo.descripcion}
                                            </SelectItem>
                                        ))}
                                    </SelectGroup>
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <Label className="text-muted-foreground">Categoria</Label>
                            <Select value={categoria} onValueChange={(e) => setCategoria(e)}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectGroup>
                                        <SelectLabel>Categoria</SelectLabel>
                                        {categorias.map((categoria) => (
                                            <SelectItem key={categoria.id} value={categoria.id}>
                                                {categoria.descripcion}
                                            </SelectItem>
                                        ))}
                                    </SelectGroup>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <DialogFooter className="sm:justify-start">
                        <Button variant="secondary" onClick={() => handleDialogChange(false)}>
                            Salir
                        </Button>
                        {id !== undefined && id > 0 && (
                            <Button variant="destructive" onClick={deleteDoc}>
                                Eliminar
                            </Button>
                        )}
                        <Button onClick={handleSave}>{id ? 'Actualizar' : 'Guardar'}</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
};

export default DocRecord