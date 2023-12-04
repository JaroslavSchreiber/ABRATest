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
        const groupedData: { [key: string]: { count: number; items: number[], varians: string[] } } = { "_root": { count: 0, items: [], varians: [] } };

        const addToGroupData = (part: string, original: string, item: any) => {
            if (!groupedData[part]) {
                groupedData[part] = { count: 0, items: [], varians: [] };
            }
            if (groupedData[part].items.indexOf(item.id) < 0) {
                groupedData[part].count++;
                groupedData[part].items.push(item.id);
            }
            if (groupedData[part].varians.indexOf(original) < 0)
                groupedData[part].varians.push(original);

        };

        data.forEach((item) => {
            //            if (item.psc.toString().trim() == "") {
            //               addToGroupData("_prázdne_",item.psc.toString(),item);
            //            }
            //            else
            for (var i = 0; i < item.psc.length; i++) {
                var part: string = item.psc.toString().slice(0, i + 1).replaceAll('"', '').replaceAll(' ', '').toLowerCase(); //normalizacia bez medzier
                var original = item.psc.toString().slice(0, i + 1);
                addToGroupData(part, original, item);
            }
            groupedData["_root"].count++;
            groupedData["_root"].items.push(item.id);
        });

        return groupedData;
    };

    return null;
};

export default DataLoader;
