import React, { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import { fetch } from "@tauri-apps/plugin-http"
import { useAppState } from "@/AppState"
import numeral from 'numeral';
import { Skeleton } from './ui/skeleton';
import { CardHeader, CardDescription, CardTitle, CardFooter, Card } from './ui/card';

function YearlySum(_props: unknown, ref: React.Ref<unknown>) {
  // const [percentage, setPercentage] = useState<number>(0);
  const [gastoSum, setGastoSum] = useState<number>(0);
  const [ingresoSum, setIngresoSum] = useState<number>(0);
  const [utilidadAnual, setUtilidadAnual] = useState<number>(0);
  const { apiPrefix, sessionId } = useAppState()
  const [isLoading, setIsLoading] = useState(true)

  const fetchPercentage = async () => {
    setIsLoading(true)
    let params = new URLSearchParams();
    params.set("sessionHash", sessionId);
    params.set("nMonths", "13");
    const response = await fetch(`${apiPrefix}/yearly-sum?${params.toString()}`, {
      method: "GET",
      headers: {
        'Content-Type': 'application/json'
      }
    }).then(response => response.json())
    let gasto = response.data.find((o: any) => o.id == 1)
    let ingreso = response.data.find((o: any) => o.id == 3)
    // setPercentage(response.porcentajeUsado)
    setGastoSum(gasto.sumMonto)
    setIngresoSum(ingreso.sumMonto)
    setUtilidadAnual(100 - response.porcentajeUsado)
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
    <Card className='h-full'   >
      <CardHeader>
        <CardDescription>Utilidad 13 meses</CardDescription>
        <CardTitle className="@[250px]/card:text-3xl text-2xl font-semibold tabular-nums">
          {numeral(utilidadAnual).format("0,0.00")}%
        </CardTitle>
      </CardHeader>
      {isLoading ? (
        <div className="flex flex-col space-y-3">
          <Skeleton className="h-[125px] w-[250px] rounded-xl" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-[250px]" />
            <Skeleton className="h-4 w-[200px]" />
          </div>
        </div>
      ) : (
        <div className="@container/card">
          <CardFooter className="flex-col items-start gap-1 text-sm">
            <div className="line-clamp-1 flex gap-2 text-muted-foreground">
              Montos 13 meses
            </div>
            <div className='grid grid-cols-2 justify-between'>
              <span>
                Ingresos
              </span>
              <span>
                {numeral(ingresoSum).format("0,0")}
              </span>
            </div>
            <div className='grid grid-cols-2 justify-between'>
              <span>
                Gastos
              </span>
              <span>
                {numeral(gastoSum).format("0,0")}
              </span>
            </div>
          </CardFooter>
        </div>
      )}
    </Card>
  );
};

export default forwardRef(YearlySum)