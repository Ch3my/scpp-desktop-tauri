import React from 'react';
import { useAppState } from "@/AppState"
import ScreenTitle from '@/components/ScreenTitle';
import { fetch } from '@tauri-apps/plugin-http';
import AssetsTable, { Asset } from '@/components/AssetsTable';
import AssetImgViewer from '@/components/AssetImgViewer';
import { Button } from "@/components/ui/button"
import { ArrowUpDown, ChevronDown, MoreHorizontal } from "lucide-react"
import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { toast } from 'sonner';
import { NewAsset } from '@/components/NewAsset';

const Assets: React.FC = () => {
    const { apiPrefix, sessionId, fetchCategorias, } = useAppState()
    const [assets, setAssets] = React.useState<Asset[]>([]);
    const [base64Img, setBase64Img] = React.useState<string>("");
    const [loading, setLoading] = React.useState<boolean>(false);

    const getData = async () => {
        setLoading(true);
        let params = new URLSearchParams();
        params.set("sessionHash", sessionId);
        let data = await fetch(`${apiPrefix}/assets?${params.toString()}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        }).then(response => response.json())
        setAssets(data);
        setLoading(false);
    }

    const handleRowClick = async (id: number, e: any) => {
        // Los elementos de las htas igual trigger este evento, por lo que se debe filtrar
        if (e.target.textContent === "Eliminar") {
            return;
        }

        let params = new URLSearchParams();
        params.set("sessionHash", sessionId);
        params.set("id[]", String(id));
        let data = await fetch(`${apiPrefix}/assets?${params.toString()}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        }).then(response => response.json())
        setBase64Img(data[0].assetData);
    }

    const deleteAsset = async (id: number) => {
        // TODO, ask for confirmation
        setBase64Img("");
        const response = await fetch(`${apiPrefix}/assets`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ sessionHash: sessionId, id: id }),

        }).then(response => response.json())
        toast('Documento Eliminado')
        getData()
    }

    React.useEffect(() => {
        fetchCategorias()
        getData()
    }, []);

    return (
        <div className="grid gap-4 p-2 w-screen h-screen" style={{ gridTemplateColumns: "2fr 3fr" }} >
            <div>
                <ScreenTitle title='Assets' />
                <div>
                    <NewAsset />
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[100px]">Fecha</TableHead>
                                <TableHead>Descripcion</TableHead>
                                <TableHead>Categoria</TableHead>
                                <TableHead></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {assets.map((asset, index) => (
                                <TableRow key={index} onClick={(e) => handleRowClick(asset.id, e)}>
                                    <TableCell>{asset.fecha}</TableCell>
                                    <TableCell>{asset.descripcion}</TableCell>
                                    <TableCell>{asset.categoria.descripcion}</TableCell>
                                    <TableCell>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" className="h-6 w-8 p-0">
                                                    <span className="sr-only">Open menu</span>
                                                    <MoreHorizontal />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem
                                                    onClick={() => deleteAsset(asset.id)}
                                                >
                                                    Eliminar
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </div>
            <AssetImgViewer base64Img={base64Img} />
        </div>
    );
};

export default Assets;