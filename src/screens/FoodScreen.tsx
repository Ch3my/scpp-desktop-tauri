import React, { useEffect, useRef } from 'react';
import { fetch } from '@tauri-apps/plugin-http';
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
import { CirclePlus, MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';

import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbList,
    BreadcrumbPage,
} from "@/components/ui/breadcrumb"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

import { useAppState } from '@/AppState';
import { Food } from '@/models/Food';
import ScreenTitle from '@/components/ScreenTitle';
import { DateTime } from 'luxon';

import NewFoodTransaction from '@/components/NewFoodTransaction';
import FoodTransactions, { FoodTransactionsRef } from '@/components/FoodTransactions';
import FoodItemRecord from '@/components/FoodItemRecord';
import { toast } from 'sonner';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';

const FoodScreen: React.FC = () => {
    const { apiPrefix, sessionId } = useAppState()
    const [foods, setFoods] = React.useState<Food[]>([]);
    const [loading, setLoading] = React.useState<boolean>(false);
    const [openFoodItemDialog, setOpenFoodItemDialog] = React.useState<boolean>(false);
    const [orderByBestBy, setOrderByBestBy] = React.useState<boolean>(false);
    const foodTransactionRef = useRef<FoodTransactionsRef>(null);
    const [selectedFoodItemId, setSelectedFoodItemId] = React.useState<number>(0);
    const [foodItemIdFilter, setFoodItemIdFilter] = React.useState<number>(0);

    const getData = async () => {
        setLoading(true);
        let params = new URLSearchParams();
        params.set("sessionHash", sessionId);

        try {
            let response = await fetch(`${apiPrefix}/food/item-quantity?${params.toString()}`, {
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
            let apiData: any[] = await response.json();

            // --- TRANSFORMATION STEP ---
            // Map the raw API data to match the Food type structure
            const foodsData: Food[] = apiData.map(item => ({
                id: item.id,
                name: item.name,
                unit: item.unit,
                quantity: item.quantity,
                lastTransactionAt: item.last_transaction_at ? DateTime.fromISO(item.last_transaction_at) : null
            }));
            // --- END TRANSFORMATION ---

            setFoods(foodsData); // Use the transformed data
            setLoading(false);

        } catch (error) {
            console.error("Failed to fetch or process food data:", error);
            setLoading(false);
            // Optionally set an error state
        }
    }

    const newTrasactionDialogEvent = (isOpen: boolean) => {
        if (!isOpen) {
            getData()
            foodTransactionRef.current?.getData()
        }
    }
    const newFoodItemDialogEvent = (isOpen: boolean) => {
        setOpenFoodItemDialog(isOpen)
        if (!isOpen) {
            getData()
            setTimeout(() => {
                setSelectedFoodItemId(0) // Reset the selected food item ID
            }, 100); // Delay to allow the dialog to close before reset that change text inside the dialog
        }
    }

    const deleteFoodItem = async (id: number) => {
        setLoading(true)
        let response = await fetch(`${apiPrefix}/food/item`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ sessionHash: sessionId, id: id }),

        }).then(response => response.json())

        if (response.hasErrors) {
            toast.error('Error al eliminar el item: ' + response.errorDescription[0]);
            setLoading(false)
            return
        }
        toast('Item eliminado');
        // NOTA. setLoading(false) is called in the getData function
        getData()
    }

    const editFoodItem = async (id: number) => {
        setSelectedFoodItemId(id)
        setOpenFoodItemDialog(true)
    }

    useEffect(() => {
        getData()
    }, []);

    return (
        <div className="grid gap-4 p-2 w-screen h-screen overflow-hidden" style={{ gridTemplateColumns: "1fr 2fr" }}>
            <div className='flex flex-col gap-2'>
                <ScreenTitle title='Food Storage' />
                <div className='flex gap-2'>
                    <Button variant="outline" onClick={() => {
                        setOpenFoodItemDialog(!openFoodItemDialog)
                    }}><CirclePlus /></Button>
                </div>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Nombre</TableHead>
                            <TableHead className="text-right">Cant</TableHead>
                            <TableHead></TableHead>
                            <TableHead className='min-w-[100px]'>Actividad</TableHead>
                            <TableHead></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {foods.length === 0 && !loading ? (
                            <TableRow>
                                <TableCell colSpan={4} className="text-center">No se encontraron alimentos.</TableCell>
                            </TableRow>
                        ) : (
                            foods.map((food) => (
                                <TableRow key={food.id}>
                                    <TableCell className="font-medium">{food.name}</TableCell>
                                    <TableCell className="text-right">{food.quantity}</TableCell>
                                    <TableCell className='w-[40px]'>{food.unit}</TableCell>
                                    <TableCell>{food.lastTransactionAt?.toFormat("dd-MM-yyyy")}</TableCell>
                                    <TableCell className="text-right">
                                        <DropdownMenu modal={false}>
                                            <DropdownMenuTrigger>
                                                <Button variant="ghost" className="h-6 w-8 p-0">
                                                    <span className="sr-only">Open menu</span>
                                                    <MoreHorizontal />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem
                                                    onClick={() => {
                                                        editFoodItem(food.id)
                                                    }}
                                                >
                                                    Editar
                                                </DropdownMenuItem>
                                                <DropdownMenuItem
                                                    onClick={() => {
                                                        deleteFoodItem(food.id)
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
            <div className='flex flex-col gap-2 overflow-auto'>
                <div className="flex shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-10">
                    <div className="flex items-center gap-2">
                        <Breadcrumb>
                            <BreadcrumbList>
                                <BreadcrumbItem className="hidden md:block">
                                    <BreadcrumbPage>
                                        Transacciones
                                    </BreadcrumbPage>
                                </BreadcrumbItem>
                            </BreadcrumbList>
                        </Breadcrumb>
                    </div>
                </div>
                <div className='flex gap-2 items-center'>
                    <NewFoodTransaction onOpenChange={newTrasactionDialogEvent} />
                    <Select onValueChange={(o) => setFoodItemIdFilter(parseInt(o))}>
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Filtro Item" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem key={0} value={"0"}>
                                (Todos)
                            </SelectItem>
                            {foods.map((food) => (
                                <SelectItem key={food.id} value={food.id.toString()}>
                                    {food.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <div className='flex gap-2 items-baseline' >
                        <Switch id="best-by-order" checked={orderByBestBy} onCheckedChange={o=> setOrderByBestBy(o)} />
                        <Label htmlFor="best-by-order">Vencen pronto</Label>
                    </div>
                </div>
                <div className='overflow-y-auto'>
                    <FoodTransactions ref={foodTransactionRef} 
                    onTransactionDeleted={() => { getData() }} 
                    foodItemIdFilter={foodItemIdFilter} 
                    orderByBestBy={orderByBestBy}/>
                </div>
            </div>
            <FoodItemRecord onOpenChange={newFoodItemDialogEvent} id={selectedFoodItemId} isOpen={openFoodItemDialog} hideButton={true} />
        </div>
    );
};

export default FoodScreen;