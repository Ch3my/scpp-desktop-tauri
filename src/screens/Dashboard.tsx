import React, { useEffect, useState } from 'react';
import ScreenTitle from '@/components/ScreenTitle';
import { useAppState } from "@/AppState"
import { fetch } from '@tauri-apps/plugin-http';
import { DateTime } from 'luxon';
import { SidebarInset } from '@/components/ui/sidebar';
import numeral from 'numeral';
import { Label } from '@/components/ui/label';
import DocRecord from '@/components/DocRecord';
import { CirclePlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DocsFilters } from '@/components/DocsFilters';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"

import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import MonthlyGraphChart from '@/components/MonthlyGraphChart';
import { TestDonut } from '@/components/TestDonut';
import { TestBarChart } from '@/components/TestBarChart';
import { GraficoCategorias } from '@/components/GraficoCategorias';
import UsagePercentage from '@/components/UsagePercentaje';


const Dashboard: React.FC = () => {
    const { apiPrefix, sessionId, tipoDocs, fetchCategorias, fetchTipoDocs } = useAppState()
    const [fechaInicio, setFechaInicio] = useState<DateTime>(DateTime.now().startOf('month'));
    const [fechaTermino, setFechaTermino] = useState<DateTime>(DateTime.now().endOf('month'));
    const [selectedCategoria, setSelectedCategoria] = useState<number>(0);
    const [selectedTipoDoc, setSelectedTipoDoc] = useState<number>(1);
    const [selectedDocId, setSelectedDocId] = useState<number>(0);
    const [totalDocs, setTotalDocs] = useState<number>(0);
    const [searchPhrase, setSearchPhrase] = useState<string>('');
    const [docs, setDocs] = useState<any[]>([]);
    const [openDocDialog, setOpenDocDialog] = useState<boolean>(false);

    const getData = async (paramsOverride?: { fechaInicio?: DateTime, fechaTermino?: DateTime, categoria?: number, searchPhrase?: string, tipoDoc?: number }) => {
        let params = new URLSearchParams();
        params.set("sessionHash", sessionId);
        params.set("fechaInicio", (paramsOverride?.fechaInicio || fechaInicio)?.toFormat('yyyy-MM-dd'));
        params.set("fechaTermino", (paramsOverride?.fechaTermino || fechaTermino)?.toFormat('yyyy-MM-dd'));
        params.set("searchPhrase", paramsOverride?.searchPhrase !== undefined ? paramsOverride.searchPhrase : searchPhrase);
        params.set("fk_tipoDoc", (paramsOverride?.tipoDoc || selectedTipoDoc).toString());
        if ((paramsOverride?.categoria || selectedCategoria) > 0) {
            params.set("fk_categoria", (paramsOverride?.categoria || selectedCategoria).toString());
        }

        let data = await fetch(`${apiPrefix}/documentos?${params.toString()}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        }).then(response => response.json())
        setDocs(data);
        setTotalDocs(data.reduce((acc: number, doc: any) => acc + doc.monto, 0))
    }

    const handleFiltersChange = (filters: { fechaInicio: DateTime; fechaTermino: DateTime; categoria: number; searchPhrase: string; }) => {
        setFechaInicio(filters.fechaInicio)
        setFechaTermino(filters.fechaTermino)
        setSelectedCategoria(filters.categoria)
        setSearchPhrase(filters.searchPhrase)
        getData({
            fechaInicio: filters.fechaInicio,
            fechaTermino: filters.fechaTermino,
            categoria: filters.categoria,
            searchPhrase: filters.searchPhrase
        })
    }

    const docDialogOpenChange = (e: boolean) => {
        setOpenDocDialog(e)
        getData()
    }

    const handleRowClick = (id: number) => {
        setSelectedDocId(id)
        setOpenDocDialog(true)
    }

    const handleNewDocBtn = () => {
        setSelectedDocId(0)
        setOpenDocDialog(!openDocDialog)
    }

    const handleTipoDocChange = (tipoDoc: string) => {
        const parsedTipoDoc = parseInt(tipoDoc);
        setSelectedTipoDoc(parsedTipoDoc);

        let newFechaInicio = fechaInicio;
        let newFechaTermino = fechaTermino;

        if (parsedTipoDoc === 1) {
            newFechaInicio = DateTime.now().startOf('month');
            newFechaTermino = DateTime.now().endOf('month');
        } else if (parsedTipoDoc === 2 || parsedTipoDoc === 3) {
            newFechaInicio = DateTime.now().startOf('year');
        }

        setFechaInicio(newFechaInicio);
        setFechaTermino(newFechaTermino);

        getData({ tipoDoc: parsedTipoDoc, fechaInicio: newFechaInicio, fechaTermino: newFechaTermino });
    };

    const onBarClick = async (catId: number) => {
        let newFechaInicio = fechaInicio;
        let newFechaTermino = fechaTermino;
        newFechaInicio = DateTime.now().startOf('year');
        newFechaTermino = DateTime.now().endOf('month');
        setFechaInicio(newFechaInicio);
        setFechaTermino(newFechaTermino);
        setSelectedCategoria(catId)
        getData({ categoria: catId, fechaInicio: newFechaInicio, fechaTermino: newFechaTermino });
    }

    useEffect(() => {
        getData()
        fetchCategorias()
        fetchTipoDocs()
    }, []);

    return (
        <div className="grid gap-4 p-2 w-screen h-screen grid-docs-layout" >
            <div className="flex flex-col gap-2 overflow-auto">
                <ScreenTitle title="Dashboard" />
                <div className='flex gap-2'>
                    <Button variant="outline" onClick={handleNewDocBtn}>
                        <CirclePlus />
                    </Button>
                    <DocsFilters onFiltersChange={handleFiltersChange} fechaInicio={fechaInicio} fechaTermino={fechaTermino}
                        categoria={selectedCategoria} searchPhrase={searchPhrase} />
                    <Select value={selectedTipoDoc.toString()} onValueChange={handleTipoDocChange}>
                        <SelectTrigger>
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectGroup>
                                <SelectLabel>Tipo Doc</SelectLabel>
                                {tipoDocs.map((tipo) => (
                                    <SelectItem key={tipo.id} value={tipo.id.toString()}>
                                        {tipo.descripcion}
                                    </SelectItem>
                                ))}
                            </SelectGroup>
                        </SelectContent>
                    </Select>
                    <DocRecord id={selectedDocId} isOpen={openDocDialog} hideButton={true} onOpenChange={docDialogOpenChange} />
                </div>
                <Label>Total: ${numeral(totalDocs).format("0,0")}</Label>

                <div className='overflow-auto' >
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[100px]">Fecha</TableHead>
                                <TableHead>Proposito</TableHead>
                                <TableHead className="text-right">Monto</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {docs.map((doc, index) => (
                                <TableRow key={index} onClick={() => handleRowClick(doc.id)}>
                                    <TableCell>{doc.fecha}</TableCell>
                                    <TableCell>{doc.proposito}</TableCell>
                                    <TableCell className="text-right">{numeral(doc.monto).format("0,0")}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </div>
            <div className="grid grid-rows-2">
                <div className="grid gap-2 items-center" style={{ gridTemplateColumns: '2fr 4fr' }}>
                <UsagePercentage />
                    <MonthlyGraphChart />
                </div>
                <GraficoCategorias onBarClick={(e) => onBarClick(e)} />
            </div>
        </div>
    );
};

export default Dashboard;