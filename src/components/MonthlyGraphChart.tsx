import { forwardRef, useCallback, useEffect, useImperativeHandle, useState } from "react"
import { fetch } from "@tauri-apps/plugin-http"
import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts"
import { DateTime } from "luxon";

import { useAppState } from "@/AppState"
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import {
    ChartConfig,
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
} from "@/components/ui/chart"
import LoadingCircle from "./LoadingCircle";
import { Skeleton } from "./ui/skeleton";

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

    const [error, setError] = useState<string | null>(null)
    const [isLoading, setIsLoading] = useState(false)

    const fetchData = useCallback(async () => {
        setIsLoading(true)
        setError(null)

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
            setError("Failed to load chart data.")
        } finally {
            setIsLoading(false)
        }
    }, [apiPrefix, sessionId])

    useEffect(() => {
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

    return (
        <div>
            {/* // <Card> */}
            {/* <CardHeader>
                <CardTitle>Histórico financiero mensual</CardTitle>
                <CardDescription>Ultimos 13 meses</CardDescription>
            </CardHeader> */}

            {/* // <CardContent> */}
            {isLoading && <Skeleton className="h-[40vh] w-full" />}
            {error && <p className="text-red-500">{error}</p>}
            {!isLoading && !error && chartData.length > 0 && (
                <ChartContainer config={chartConfig} className="aspect-auto h-[40vh] w-full" >
                    <LineChart
                        data={chartData}
                        margin={{ left: 12, right: 12, top: 12 }}
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
                            cursor={false}
                            content={<ChartTooltipContent hideLabel />}
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
            )}
            <div className="flex items-center justify-center text-muted-foreground">
                <p>Historico financiero mensual</p>
            </div>
            {/* </CardContent> */}
            {/* </Card> */}
        </div>
    )
}
export default forwardRef(MonthlyGraphChart)