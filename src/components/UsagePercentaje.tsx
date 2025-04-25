import React, { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import { fetch } from "@tauri-apps/plugin-http"
import { useAppState } from "@/AppState"
import numeral from 'numeral';
import { Skeleton } from './ui/skeleton';
import { Card, CardContent, CardHeader } from './ui/card';

function UsagePercentage(_props: unknown, ref: React.Ref<unknown>) {
    const [percentage, setPercentage] = useState<number>(0);
    const [thisMonthIngresos, setThisMonthIngresos] = useState<number>(0);
    const [thisMonthGastos, setThisMonthGastos] = useState<number>(0);
    const [thisRemanente, setRemanente] = useState<number>(0);
    const [topGastos, setTopGastos] = useState<any[]>([]);
    const { apiPrefix, sessionId } = useAppState()
    const [isLoading, setIsLoading] = useState(true)

    const fetchPercentage = async () => {
        setIsLoading(true)
        let params = new URLSearchParams();
        params.set("sessionHash", sessionId);
        const response = await fetch(`${apiPrefix}/curr-month-spending?${params.toString()}`, {
            method: "GET",
            headers: {
                'Content-Type': 'application/json'
            }
        }).then(response => response.json())

        const gasto = response.data.find((o: any) => o.fk_tipoDoc == 1)
        const ingresos = response.data.find((o: any) => o.fk_tipoDoc == 3)
        setThisMonthIngresos(ingresos.sumMonto)
        setThisMonthGastos(gasto.sumMonto)
        setRemanente(ingresos.sumMonto - gasto.sumMonto)

        setTopGastos(response.topGastos.slice(0, 4))
        setPercentage(response.porcentajeUsado)
        setIsLoading(false)
    };

    useEffect(() => {
        fetchPercentage();
    }, []);

    // Expose fetchData to parent through the ref
    useImperativeHandle(ref, () => ({
        refetchData: () => {
            fetchPercentage()
        },
    }))

    if (isLoading) {
        return (
            <Card className='h-full'  >
                <CardHeader>
                    <div className="grid grid-cols-2">
                        <div>
                            <span className='text-muted-foreground'>% Gasto</span>
                            <p className="text-2xl font-semibold tabular-nums">
                                {numeral(percentage).format("0,0.0")}%
                            </p>
                        </div>
                        <div>
                            <span className='text-muted-foreground'>
                                Remanente
                            </span>
                            <p className='text-2xl font-semibold tabular-nums'>{numeral(thisRemanente).format("$0,0")}</p>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 justify-between">
                        <div>
                            <span className="text-muted-foreground">
                                Ingresos
                            </span>
                            <p>{numeral(thisMonthIngresos).format("$0,0")}</p>
                        </div>
                        <div>
                            <span className="text-muted-foreground">
                                Gastos
                            </span>
                            <p>{numeral(thisMonthGastos).format("$0,0")}</p>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col space-y-3">
                        <Skeleton className="h-[50px] w-full rounded-xl" />
                        <div className="space-y-2">
                            <Skeleton className="h-4 w-[200px]" />
                            <Skeleton className="h-4 w-[150px]" />
                        </div>
                    </div>
                </CardContent>
            </Card>
        )
    }

    return (
        <Card className='h-full'>
            <CardHeader>
                <div className="grid grid-cols-2">
                    <div>
                        <span className='text-muted-foreground'>% Gasto</span>
                        <p className="text-2xl font-semibold tabular-nums">
                            {numeral(percentage).format("0,0.0")}%
                        </p>
                    </div>
                    <div>
                        <span className='text-muted-foreground'>
                            Remanente
                        </span>
                        <p className='text-2xl font-semibold tabular-nums'>{numeral(thisRemanente).format("$0,0")}</p>
                    </div>
                </div>
                <div className="grid grid-cols-2 justify-between">
                    <div>
                        <span className="text-muted-foreground">
                            Ingresos
                        </span>
                        <p>{numeral(thisMonthIngresos).format("$0,0")}</p>
                    </div>
                    <div>
                        <span className="text-muted-foreground">
                            Gastos
                        </span>
                        <p>{numeral(thisMonthGastos).format("$0,0")}</p>
                    </div>
                </div>
            </CardHeader>
            <CardContent className='grid gap-2'>
                <div>
                    <span className="text-muted-foreground">
                        Top Gastos
                    </span>
                    <div className='flex flex-col gap-8 truncate text-sm'>
                        <div>
                            {topGastos.map((gasto, index) => (
                                <div key={index} className="flex justify-between w-full">
                                    <span className="truncate block max-w-[8rem]">{gasto.proposito}</span>
                                    <span>{numeral(gasto.monto).format('$0,0')}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};

export default forwardRef(UsagePercentage)