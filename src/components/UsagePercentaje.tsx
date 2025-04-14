import React, { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import { fetch } from "@tauri-apps/plugin-http"
import { useAppState } from "@/AppState"
import numeral from 'numeral';
import { Skeleton } from './ui/skeleton';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';

function UsagePercentage(_props: unknown, ref: React.Ref<unknown>) {
    const [percentage, setPercentage] = useState<number>(0);
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
        setTopGastos(response.topGastos.slice(0, 6))
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
                <CardHeader className='text-center'>
                    <CardDescription>Gasto mes</CardDescription>
                    <CardTitle className="@[250px]/card:text-3xl text-2xl font-semibold tabular-nums">
                        {numeral(percentage).format("0,0.0")}%
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col space-y-3">
                        <Skeleton className="h-[100px] w-full rounded-xl" />
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
        <Card className='h-full'  >
            <CardHeader className='text-center'>
                <CardDescription>Gasto mes</CardDescription>
                <CardTitle className="@[250px]/card:text-3xl text-2xl font-semibold tabular-nums">
                    {numeral(percentage).format("0,0.0")}%
                </CardTitle>
            </CardHeader>
            <CardContent className='text-sm'>
                <div>
                    <div className="text-muted-foreground">
                        Top Gastos
                    </div>
                    <div className='flex flex-col gap-8 truncate'>
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