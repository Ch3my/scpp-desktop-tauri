import { forwardRef, useEffect, useImperativeHandle, useState } from "react";
import { fetch } from "@tauri-apps/plugin-http";
import { useAppState } from "@/AppState";
import { Bar, BarChart, CartesianGrid, LabelList, XAxis } from "recharts";
import {
    ChartContainer,
} from "@/components/ui/chart";
import { Skeleton } from "./ui/skeleton";
import numeral from "numeral";
import { Card } from "./ui/card";

const chartConfig = {
    desktop: {
        label: "Desktop",
        color: "hsl(var(--chart-1))",
    },
};

interface GraficoCategoriasProps {
    onBarClick?: (catId: number) => void;
}

export interface GraficoCategoriasRef {
    refetchData?: () => void;
}


// function GraficoCategorias(_props: unknown, ref: React.Ref<unknown>) {
const GraficoCategorias = forwardRef<GraficoCategoriasRef, GraficoCategoriasProps>(
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
                    category: item.label.slice(0, 6), // e.g. "Vivienda"
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
            <Card >
                {isLoading ? (
                    <Skeleton className="h-[50vh] w-full" />
                ) : (
                    <ChartContainer config={chartConfig} className="aspect-auto h-[50vh] w-full">
                        <BarChart accessibilityLayer data={chartData} >
                            <CartesianGrid vertical={false} />
                            <XAxis dataKey="category" tickLine={false} tickMargin={10} axisLine={false} />
                            <Bar dataKey="amount" fill="var(--color-desktop)" radius={8} onClick={handleBarClick} shape={(props: any) => {
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
                            }}>
                                <LabelList
                                    dataKey="amount"
                                    position="top"
                                    offset={12}
                                    className="fill-foreground"
                                    fontSize={12}
                                    formatter={(value: number) => numeral(value).format("0,0")}
                                />
                            </Bar>
                        </BarChart>
                    </ChartContainer>
                )}
                <div className="flex items-center justify-center text-muted-foreground">
                    <p>Resumen categoría 13 Meses</p>
                </div>
            </Card>
        );
    }
)
export default GraficoCategorias;