import React, { forwardRef, useEffect, useImperativeHandle } from 'react';
import { fetch } from '@tauri-apps/plugin-http';
import { useAppState } from '@/AppState';
import { FoodTransaction } from '@/models/FoodTransaction';
import { DateTime } from 'luxon';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { MoreHorizontal, Skull } from 'lucide-react';
import { Button } from './ui/button';
import { toast } from 'sonner';

export interface FoodTransactionsRef {
    getData: () => Promise<void>;
}
export interface FoodTransactionsProps {
    onTransactionDeleted?: (deletedTransactionId: number) => void;
}
const FoodTransactions = forwardRef<FoodTransactionsRef, FoodTransactionsProps>(({ onTransactionDeleted }, ref) => {
    const { apiPrefix, sessionId } = useAppState()
    const [transactions, setTransactions] = React.useState<FoodTransaction[]>([]);
    const [loading, setLoading] = React.useState<boolean>(false);
    
    const accionMapping: { [key: string]: string } = {
        "consumption": "Consumo",
        "adjustment": "Ajuste",
        "restock": "Reposición",
    }

    // Expose the getData function to the parent via the ref
    useImperativeHandle(ref, () => ({
        getData,
    }));

    const getData = async () => {
        setLoading(true);
        let params = new URLSearchParams();
        params.set("sessionHash", sessionId);
        params.set("page", String(1));

        let response = await fetch(`${apiPrefix}/food/transaction?${params.toString()}`, {
            method: 'GET',
            // Content-Type header is usually not needed for GET requests as they don't have a body,
            // but Accept: 'application/json' is good to indicate you expect JSON back.
            headers: {
                'Accept': 'application/json' // Indicate that you accept JSON response
            }
        });
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        let apiData: any[] = await response.json(); // Get the raw data from the API
        //console.log(apiData)

        const transactionsData: FoodTransaction[] = apiData.map((item: any) => {
            let food = {
                id: item.item_id,
                name: item.item_name,
                unit: item.item_unit,
                quantity: null,
                lastTransactionAt: null
            }
            let transaction = {
                id: item.id,
                itemId: item.item_id,
                changeQty: item.change_qty,
                occurredAt: DateTime.fromISO(item.occurred_at),
                transactionType: item.transaction_type,
                note: item.note,
                code: item.code,
                bestBefore: item.best_before ? DateTime.fromISO(item.best_before) : null,
                food: food,
                remainingQuantity: item.remaining_quantity,
                fkTransaction: item.fk_transaction
            }
            return transaction
        });
        setTransactions(transactionsData);
        setLoading(false);
    }

    const deleteTransaction = async (id: number) => {
        setLoading(true)
        await fetch(`${apiPrefix}/food/transaction`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ sessionHash: sessionId, id: id }),

        }).then(response => response.json())
        // TODO handle error
        toast('Transacción eliminada');
        if (onTransactionDeleted) {
            onTransactionDeleted(id);
        }
        // NOTA. setLoading(false) is called in the getData function
        getData()
    }

    const calculateIcon = (bestBefore: DateTime | null) => {
        if(!bestBefore) {
            return
        }
        const today = DateTime.now()
        const diff = bestBefore.diff(today, ['days']).days
        if(diff < 31) {
            return <Skull size={24} />
        } else {
            return 
        }
    }

    useEffect(() => {
        getData()
    }, []);

    return (
        <div>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Fecha</TableHead>
                        <TableHead>Vencimiento</TableHead>
                        <TableHead></TableHead>
                        <TableHead>Nombre</TableHead>
                        <TableHead></TableHead>
                        <TableHead>Tipo</TableHead>
                        <TableHead className="text-right">Cantidad</TableHead>
                        <TableHead className="text-right">Remanente</TableHead>
                        <TableHead>ID</TableHead>
                        <TableHead>Ref ID</TableHead>
                        <TableHead></TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {transactions.length === 0 && !loading ? (
                        <TableRow>
                            <TableCell colSpan={6} className="text-center">No se encontraron transacciones.</TableCell>
                        </TableRow>
                    ) : (
                        transactions.map((o) => (
                            <TableRow key={o.id}>
                                <TableCell>{o.occurredAt.toFormat("dd-MM-yyyy")}</TableCell>
                                <TableCell>{o.bestBefore?.toFormat("dd-MM-yyyy")}</TableCell>
                                <TableCell>{calculateIcon(o.bestBefore)}</TableCell>
                                <TableCell>{o.food?.name}</TableCell>
                                <TableCell>{o.food?.unit}</TableCell>
                                <TableCell>{accionMapping[o.transactionType]}</TableCell>
                                <TableCell className="text-right">{o.changeQty}</TableCell>
                                <TableCell className="text-right">{o.remainingQuantity}</TableCell>
                                <TableCell className="text-right">{o.id}</TableCell>
                                <TableCell className="text-right">{o.fkTransaction}</TableCell>
                                <TableCell className="text-right">
                                    <DropdownMenu>
                                        <DropdownMenuTrigger>
                                            <Button variant="ghost" className="h-6 w-8 p-0">
                                                <span className="sr-only">Open menu</span>
                                                <MoreHorizontal />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuItem
                                                onClick={() => {
                                                    deleteTransaction(o.id)
                                                }}
                                            >
                                                Eliminar
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </TableCell>
                            </TableRow>
                        ))
                    )}
                </TableBody>
            </Table>
        </div>
    );
});

export default FoodTransactions;