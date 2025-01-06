import React, { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import { fetch } from "@tauri-apps/plugin-http"
import { useAppState } from "@/AppState"
import numeral from 'numeral';
import { Skeleton } from './ui/skeleton';

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
        setTopGastos(response.topGastos.slice(0, 5))
        setPercentage(parseInt(response.porcentajeUsado))
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

    return (
        <div className='flex flex-col gap-4'>
            {isLoading ? (
                   <div className="flex flex-col space-y-3">
                   <Skeleton className="h-[125px] w-[250px] rounded-xl" />
                   <div className="space-y-2">
                     <Skeleton className="h-4 w-[250px]" />
                     <Skeleton className="h-4 w-[200px]" />
                   </div>
                 </div>
            ) : (
                <div>
                    <div className="flex items-center justify-center flex-col">
                        <p className='text-5xl font-bold'>{percentage}%</p>
                        <p className='text-muted-foreground'>Ingresos mes usado</p>
                    </div>
                    <div>
                        {topGastos.map((gasto, index) => (
                            <div key={index} className="flex justify-between w-full">
                                <span>{gasto.proposito}</span>
                                <span>{numeral(gasto.monto).format('$0,0')}</span>
                            </div>
                        ))}
                        <p className='text-muted-foreground text-center'>Top Gastos</p>
                    </div>
                </div>
            )}
        </div>
    );
};

// export default UsagePercentage;
export default forwardRef(UsagePercentage)