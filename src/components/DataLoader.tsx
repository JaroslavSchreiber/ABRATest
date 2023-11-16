// DataLoader.tsx
import React, { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import axios from 'axios';


export const setData = (data: any) => ({
    type: 'SET_DATA' as const,
    payload: data,
});



const DataLoader: React.FC = () => {
    const dispatch = useDispatch();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axios.get('https://demo.flexibee.eu/v2/c/demo/adresar.json?add-row-count=true&detail=custom:psc&limit=0');
                const groupedData = groupDataByPSC(response.data.winstrom.adresar);
                dispatch(setData(groupedData));
            } catch (error) {
                console.error('Chyba při načítání dat:', error);
            }
        };

        fetchData();
    }, [dispatch]);

    const groupDataByPSC = (data: any[]) => {
        const groupedData: { [key: string]: { count: number; items: any[] } } = {};

        data.forEach((item) => {
            //item.psc=item.psc.toString().replaceAll('"','').replaceAll(' ',''); //normalizacia
            for (var i = 0; i < item.psc.length; i++) {
                var part=item.psc.slice(0,i+1);
                if (!groupedData[part]) {
                    groupedData[part] = { count: 0, items: [] };
                }

                groupedData[part].count++;
                groupedData[part].items.push({ id: item.id });
            }
        });

        return groupedData;
    };

    return null;
};

export default DataLoader;
