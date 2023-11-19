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
        const groupedData: { [key: string]: { count: number; items: number[], varians: string[] } } = {};

        data.forEach((item) => {
            //var original = item.psc;
            //item.psc = original.toString().replaceAll('"', '').replaceAll(' ', ''); //normalizacia bez medzier
            for (var i = 0; i < item.psc.length; i++) {
                var part = item.psc.toString().slice(0, i + 1).replaceAll('"', '').replaceAll(' ', ''); //normalizacia bez medzier
                var original = item.psc.toString().slice(0, i + 1);
                if (!groupedData[part]) {
                    groupedData[part] = { count: 0, items: [], varians: [] };
                }

                if (groupedData[part].items.indexOf(item.id) < 0) {
                    groupedData[part].count++;
                    groupedData[part].items.push(item.id);

                }
                if (groupedData[part].varians.indexOf(original) < 0)
                    groupedData[part].varians.push(original);
            }
        });

        return groupedData;
    };

    return null;
};

export default DataLoader;
