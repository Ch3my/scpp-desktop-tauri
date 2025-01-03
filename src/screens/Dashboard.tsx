import React, { useEffect, useState } from 'react';
import ScreenTitle from '@/components/ScreenTitle';
import { useAppState } from "@/AppState"
import { fetch } from '@tauri-apps/plugin-http';
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
import { DateTime } from 'luxon';
import { SidebarInset } from '@/components/ui/sidebar';
import numeral from 'numeral';
import { Label } from '@/components/ui/label';
import DocRecord from '@/components/DocRecord';
import { CirclePlus } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Dashboard: React.FC = () => {
    const { apiPrefix, sessionId,tipoDocs,fetchCategorias, fetchTipoDocs } = useAppState()
    const [fechaInicio, setFechaInicio] = useState<DateTime>(DateTime.now().minus({ months: 1 }).startOf('month'));
    const [fechaTermino, setFechaTermino] = useState<DateTime>(DateTime.now().endOf('month'));
    const [selectedCategoria, setSelectedCategoria] = useState<number>(0);
    const [selectedTipoDoc, setSelectedTipoDoc] = useState<number>(1);
    const [selectedDocId, setSelectedDocId] = useState<number>(0);
    const [totalDocs, setTotalDocs] = useState<number>(0);
    const [searchPhrase, setSearchPhrase] = useState<string>('');
    const [docs, setDocs] = useState<any[]>([]);
    const [openDocDialog, setOpenDocDialog] = useState<boolean>(false);

    const getData = async () => {
        let params = new URLSearchParams();
        params.set("sessionHash", sessionId);
        params.set("fechaInicio", fechaInicio?.toFormat('yyyy-MM-dd'));
        params.set("fechaTermino", fechaTermino?.toFormat('yyyy-MM-dd'));
        params.set("searchPhrase", searchPhrase);
        params.set("fk_tipoDoc", selectedTipoDoc.toString());
        if (selectedCategoria > 0) {
            params.set("fk_categoria", selectedCategoria.toString());
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

    const docDialogOpenChange = (e:boolean) => {
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

    useEffect(() => {
        getData()
        fetchCategorias()
        fetchTipoDocs()
    }, []);

    return (
        <SidebarInset>
            <ScreenTitle title="Dashboard" />
            <div className="grid gap-2" style={{ gridTemplateColumns: '2fr 3fr' }}>
                <div>
                    <div className='ml-2 flex gap-2'>
                        <Button variant="outline" onClick={handleNewDocBtn}>
                            <CirclePlus />
                        </Button>
                        <div>
                            <Select value={selectedTipoDoc.toString()} onValueChange={(e) => {
                                // setSelectedTipoDoc(e)
                            }}>
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
                        </div>
                        <DocRecord id={selectedDocId} isOpen={openDocDialog} hideButton={true} onOpenChange={docDialogOpenChange} />
                    </div>
                    <Label className='ml-2'>Total: ${numeral(totalDocs).format("0,0")}</Label>

                    <div className='overflow-y-scroll' style={{ maxHeight: 'calc(100vh - 8rem)' }}>
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
                <div>
                    Third Column
                </div>
            </div>
        </SidebarInset>
    );
};

export default Dashboard;