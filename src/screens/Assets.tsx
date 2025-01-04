import React from 'react';
import { useAppState } from "@/AppState"
import ScreenTitle from '@/components/ScreenTitle';
import { fetch } from '@tauri-apps/plugin-http';
import AssetsTable, { Asset } from '@/components/AssetsTable';
import AssetImgViewer from '@/components/AssetImgViewer';

const Assets: React.FC = () => {
    const { apiPrefix, sessionId, fetchCategorias, } = useAppState()
    const [assets, setAssets] = React.useState<Asset[]>([]);
    const [base64Img, setBase64Img] = React.useState<string>("");

    const getData = async () => {
        let params = new URLSearchParams();
        params.set("sessionHash", sessionId);
        let data = await fetch(`${apiPrefix}/assets?${params.toString()}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        }).then(response => response.json())
        setAssets(data);
    }

    const handleRowClick = async (id: number) => {
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

    const handleNewDocBtn = () => {
        console.log('new doc')
    }

    React.useEffect(() => {
        getData();
    }, []);

    return (
        <div className="grid gap-4 p-2 w-screen h-screen" style={{gridTemplateColumns: "2fr 3fr"}} >
            <div>
                <ScreenTitle title='Assets' />
                <div>
                    <AssetsTable assets={assets || []} handleNewDocBtn={handleNewDocBtn} handleRowClick={handleRowClick} />
                </div>
            </div>
            <AssetImgViewer base64Img={base64Img} />
        </div>
    );
};

export default Assets;