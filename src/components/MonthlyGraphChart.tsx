import { forwardRef, useCallback, useEffect, useImperativeHandle, useState } from "react"
import { fetch } from "@tauri-apps/plugin-http"
import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts"
import { DateTime, Settings } from "luxon";


import { useAppState } from "@/AppState"
import {
    ChartConfig,
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
} from "@/components/ui/chart"
import { Skeleton } from "./ui/skeleton";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";

const chartConfig = {
    gastos: {
        label: "Gastos",
        color: "hsl(var(--chart-5))",
    },
    ingresos: {
        label: "Ingresos",
        color: "hsl(var(--chart-1))",
    },
    ahorros: {
        label: "Ahorros",
        color: "hsl(var(--chart-3))",
    },
} satisfies ChartConfig

function MonthlyGraphChart(_props: unknown, ref: React.Ref<unknown>) {
    const { apiPrefix, sessionId } = useAppState() // from your context

    // We store the fetched data as "any" without a specific interface/type
    const [monthlyGraphData, setMonthlyGraphData] = useState<any>({
        labels: [],
        gastosDataset: [],
        ingresosDataset: [],
        ahorrosDataset: [],
    })

    const [isLoading, setIsLoading] = useState(true)

    const fetchData = useCallback(async () => {
        try {
            let params = new URLSearchParams();
            params.set("sessionHash", sessionId);
            params.set("nMonths", "13");
            const response = await fetch(`${apiPrefix}/monthly-graph?${params.toString()}`, {
                method: "GET",
                headers: {
                    'Content-Type': 'application/json'
                }
            }).then(response => response.json())

            setMonthlyGraphData(response)
        } catch (err: any) {
            console.error("Error fetching data:", err)
        } finally {
            if (isLoading) {
                setIsLoading(false)
            }
        }
    }, [apiPrefix, sessionId])

    useEffect(() => {
        Settings.defaultLocale = "es"
        fetchData()
    }, [])

    // Expose fetchData to parent through the ref
    useImperativeHandle(ref, () => ({
        refetchData: () => {
            fetchData()
        },
    }))

    const chartData = monthlyGraphData.labels.map((label: string, index: number) => {
        const monthName = DateTime.fromFormat(label, "yyyy-MM").toFormat("MMMM").slice(0, 3);
        return {
            month: monthName,
            gastos: monthlyGraphData.gastosDataset[index],
            ingresos: monthlyGraphData.ingresosDataset[index],
            ahorros: monthlyGraphData.ahorrosDataset[index],
        };
    });

    if (isLoading) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Historico financiero</CardTitle>
                    <CardDescription>13 meses</CardDescription>
                </CardHeader>
                <CardContent>
                    <Skeleton className="h-[20vh] w-full" />
                </CardContent>
            </Card>
        )
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Historico financiero</CardTitle>
                <CardDescription>13 meses</CardDescription>
            </CardHeader>
            <CardContent>

                <ChartContainer config={chartConfig} className="aspect-video">
                    <LineChart
                        data={chartData}
                        margin={{ left: 12, right: 24, top: 24, bottom: 12 }}
                        accessibilityLayer
                    >
                        <CartesianGrid vertical={false} />
                        <XAxis
                            dataKey="month"
                            tickLine={false}
                            axisLine={false}
                            tickMargin={8}
                        />
                        <YAxis
                            domain={[0, "auto"]}
                            tickFormatter={(value) =>
                                new Intl.NumberFormat("en-US").format(value)
                            }
                        />
                        <ChartTooltip
                            cursor={true}
                            content={<ChartTooltipContent indicator="line" className="w-48 text-base" />}
                        />
                        {/* Gastos */}
                        <Line
                            dataKey="gastos"
                            type="monotone"
                            stroke="var(--color-gastos)"
                            strokeWidth={2}
                            dot={{ fill: "var(--color-gastos)" }}
                            activeDot={{ r: 6 }}
                        />
                        {/* Ingresos */}
                        <Line
                            dataKey="ingresos"
                            type="monotone"
                            stroke="var(--color-ingresos)"
                            strokeWidth={2}
                            dot={{ fill: "var(--color-ingresos)" }}
                            activeDot={{ r: 6 }}
                        />
                        {/* Ahorros */}
                        <Line
                            dataKey="ahorros"
                            type="monotone"
                            stroke="var(--color-ahorros)"
                            strokeWidth={2}
                            dot={{ fill: "var(--color-ahorros)" }}
                            activeDot={{ r: 6 }}
                        />
                    </LineChart>
                </ChartContainer>
            </CardContent>
        </Card>
    )
}
export default forwardRef(MonthlyGraphChart)