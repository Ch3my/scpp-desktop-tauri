import { PolarAngleAxis, PolarGrid, Radar, RadarChart } from "recharts"
import {
    ChartConfig,
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
} from "@/components/ui/chart"
import { DateTime } from "luxon"
import { forwardRef, useEffect, useImperativeHandle, useState } from "react"
import { useAppState } from "@/AppState"
import { fetch } from "@tauri-apps/plugin-http";
import numeral from "numeral"
import { Skeleton } from "./ui/skeleton"

const chartConfig = {
    desktop: {
        label: "Desktop",
        color: "hsl(var(--chart-1))",
    },
} satisfies ChartConfig

function CategoriasRadial(_props: unknown, ref: React.Ref<unknown>) {
    const [fechaInicio, _] = useState(DateTime.now());
    const { apiPrefix, sessionId } = useAppState();
    const [chartData, setChartData] = useState([]);
    const [isLoading, setIsLoading] = useState(false)

    const fetchData = async () => {
        try {
            setIsLoading(true)
            const params = new URLSearchParams();
            params.set("sessionHash", sessionId);
            params.set("nMonths", "0");

            const response = await fetch(
                `${apiPrefix}/expenses-by-category?${params.toString()}`,
                {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                    },
                }
            );
            const result = await response.json();
            const newChartData = result.data.slice(0, 6).map((item: any) => ({
                category: item.label.slice(0, 6),
                amount: item.data, // e.g. 4283327
                catId: item.catId, // optional if you need it for any additional logic
            }));

            setChartData(newChartData);
        } catch (error) {
            console.error("Error fetching chart data:", error);
        }
        setIsLoading(false)
    };

    useEffect(() => {
        fetchData();
    }, []);

    // Expose fetchData to parent through the ref
    useImperativeHandle(ref, () => ({
        refetchData: () => {
            fetchData()
        },
    }))

    return (
        <div className='border rounded-lg p-2 flex flex-col h-full justify-center' >
            {isLoading ? (
                <Skeleton className="h-full w-full rounded-full" />
            ) : (
                <>
                    <ChartContainer
                        config={chartConfig}
                        className="mx-auto aspect-auto h-full w-full"
                    >
                        <RadarChart data={chartData}>
                            <ChartTooltip
                                cursor={false}
                                content={<ChartTooltipContent className="text-base" formatter={(value) => <p>$ {numeral(value).format("0,0")}</p>} />}
                            />
                            <PolarGrid gridType="circle" />
                            <PolarAngleAxis dataKey="category" />
                            <Radar
                                dataKey="amount"
                                fill="var(--color-desktop)"
                                fillOpacity={0.6}
                                dot={{
                                    r: 4,
                                    fillOpacity: 1,
                                }}
                            />
                        </RadarChart>
                    </ChartContainer>
                    <div className="flex items-center justify-center text-muted-foreground">
                        <p>Categorias {fechaInicio.toFormat("MMMM")}</p>
                    </div>
                </>
            )}
        </div>
    )
}

export default forwardRef(CategoriasRadial)