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
// import {
//     DropdownMenu,
//     DropdownMenuContent,
//     DropdownMenuItem,
//     DropdownMenuTrigger,
// } from "@/components/ui/dropdown-menu"
// import { MoreHorizontal } from 'lucide-react';
// import { Button } from '@/components/ui/button';

import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbList,
    BreadcrumbPage,
} from "@/components/ui/breadcrumb"

import { useAppState } from '@/AppState';
import { Food } from '@/models/Food';
import ScreenTitle from '@/components/ScreenTitle';
import { DateTime } from 'luxon';

import NewFoodTransaction from '@/components/NewFoodTransaction';
import FoodTransactions, { FoodTransactionsRef } from '@/components/FoodTransactions';
import NewFoodItem from '@/components/NewFoodItem';

const FoodScreen: React.FC = () => {
    const { apiPrefix, sessionId } = useAppState()
    const [foods, setFoods] = React.useState<Food[]>([]);
    const [loading, setLoading] = React.useState<boolean>(false);
    const foodTransactionRef = useRef<FoodTransactionsRef>(null);

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
        if (!isOpen) {
            getData()
        }
    }

    useEffect(() => {
        getData()
    }, []);

    return (
        <div className="grid gap-4 p-2 w-screen h-screen" style={{ gridTemplateColumns: "auto 1fr" }}>
            <div className='flex flex-col gap-2'>
                <ScreenTitle title='Food Storage' />
                <div className='flex gap-2'>
                    <NewFoodItem onOpenChange={newFoodItemDialogEvent}/>
                </div>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Nombre</TableHead>
                            <TableHead className="text-right">Cantidad</TableHead>
                            <TableHead></TableHead>
                            <TableHead>Ultima Transaccion</TableHead>
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
                                    {/* <TableCell className="text-right">
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
                                                    }}
                                                >
                                                    Eliminar
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell> */}
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
            <div className='flex flex-col gap-2'>
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
                <div className='flex gap-2'>
                    <NewFoodTransaction onOpenChange={newTrasactionDialogEvent} />
                </div>
                <FoodTransactions ref={foodTransactionRef} onTransactionDeleted={() => {getData()}}/>
            </div>
        </div>
    );
};

export default FoodScreen;