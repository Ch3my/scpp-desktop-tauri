import { forwardRef, useEffect, useImperativeHandle, useState } from "react";
import { fetch } from "@tauri-apps/plugin-http";
import { useAppState } from "@/AppState";
import { Bar, BarChart, XAxis, YAxis } from "recharts";
import {
    ChartConfig,
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
} from "@/components/ui/chart";
import { Skeleton } from "./ui/skeleton";
import numeral from "numeral";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";

const chartConfig = {
    desktop: {
        label: "Desktop",
        color: "hsl(var(--chart-1))",
    },
} satisfies ChartConfig


interface GraficoCategoriasProps {
    onBarClick?: (catId: number) => void;
}

export interface GraficoCategoriasRef {
    refetchData?: () => void;
}


const GraficoCategoriasNew = forwardRef<GraficoCategoriasRef, GraficoCategoriasProps>(
    function GraficoCategorias(props, ref) {
        const { onBarClick } = props;
        const [chartData, setChartData] = useState([]);
        const [isLoading, setIsLoading] = useState(false)
        const [hover, setHover] = useState<number | null>(null)
        const { apiPrefix, sessionId } = useAppState();

        const fetchData = async () => {
            try {
                setIsLoading(true)
                const params = new URLSearchParams();
                params.set("sessionHash", sessionId);
                params.set("nMonths", "13");

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

                // Transform the raw data into the shape Recharts needs
                // We’ll use the `data` array from the response:
                // Each item has { label, data, catId }
                const newChartData = result.data.slice(0, 8).map((item: any) => ({
                    category: item.label, // e.g. "Vivienda"
                    amount: item.data, // e.g. 4283327
                    catId: item.catId, // optional if you need it for any additional logic
                }));

                setChartData(newChartData);
            } catch (error) {
                console.error("Error fetching chart data:", error);
            }
            setIsLoading(false)
        };

        useImperativeHandle(ref, () => ({
            refetchData: () => {
                fetchData()
            }
        }));

        useEffect(() => {
            fetchData();
        }, []);

        const handleBarClick = (data: any) => {
            if (onBarClick) {
                onBarClick(data.catId);
            }
        };

        return (
            <Card>
                <CardHeader>
                    <CardTitle>Gastos por Categorias</CardTitle>
                    <CardDescription>13 meses</CardDescription>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <Skeleton className="aspect-square" />
                    ) : (
                        <ChartContainer config={chartConfig} className="aspect-square">
                            <BarChart
                                accessibilityLayer
                                data={chartData}
                                layout="vertical"
                                margin={{
                                    left: 50,
                                }}
                            >
                                <XAxis type="number" dataKey="amount" hide />
                                <YAxis
                                    dataKey="category"
                                    type="category"
                                    tickLine={false}
                                    tickMargin={10}
                                    axisLine={false}
                                />
                                <ChartTooltip
                                    cursor={false}
                                    position={{ x: 70, y: -70 }}
                                    content={<ChartTooltipContent className="w-48 text-base" formatter={(o: any) => (<div>{numeral(o).format("0,0")}</div>)} />}
                                />
                                <Bar dataKey="amount" fill="var(--color-desktop)" onClick={handleBarClick} shape={(props: any) => {
                                    return (<rect
                                        fill={props.fill}
                                        height={props.height}
                                        width={props.width}
                                        x={props.x}
                                        y={props.y}
                                        onMouseEnter={() => setHover(props.index)}
                                        onMouseLeave={() => setHover(null)}
                                        style={{
                                            filter: hover === props.index ? 'brightness(1.5)' : 'none',
                                            transition: 'filter 0.2s ease',
                                        }}
                                        rx={5}
                                    />
                                    )
                                }} />
                            </BarChart>
                        </ChartContainer>
                    )}
                </CardContent>
                {/* <CardFooter className="flex-col items-start gap-2 text-sm">
                <div className="flex gap-2 font-medium leading-none">
                  Trending up by 5.2% this month <TrendingUp className="h-4 w-4" />
                </div>
                <div className="leading-none text-muted-foreground">
                  Showing total visitors for the last 6 months
                </div>
              </CardFooter> */}
            </Card>
        )
    }
)
export default GraficoCategoriasNew;