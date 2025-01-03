import React, { useState, useEffect } from 'react';
import { fetch } from "@tauri-apps/plugin-http"
import { useAppState } from "@/AppState"

const UsagePercentage: React.FC = () => {
    const [percentage, setPercentage] = useState<number>(0);
    const { apiPrefix, sessionId } = useAppState() 

    useEffect(() => {
        const fetchPercentage = async () => {
            let params = new URLSearchParams();
            params.set("sessionHash", sessionId);
            const response = await fetch(`${apiPrefix}/curr-month-spending?${params.toString()}`, {
                method: "GET",
                headers: {
                    'Content-Type': 'application/json'
                }
            }).then(response => response.json())
            console.log(response);
            
            setPercentage(response.porcentajeUsado)
        };

        fetchPercentage();
    }, []);

    return (
        <div className="flex items-center justify-center flex-col gap-2">
            <p className='text-5xl font-bold'>{percentage}%</p>
            <p className='text-muted-foreground'>Ingresos mes usado</p>
        </div>
    );
};

export default UsagePercentage;