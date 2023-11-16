import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { TreeNode } from './TreeComponent';
import { useNavigate } from 'react-router-dom';

interface CustomerListProps {
    node: TreeNode | null;
    path: string;
}

const CustomerList: React.FC<CustomerListProps> = ({ node,path }) => {
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [customers, setCustomers] = useState<any[]>([]);
    const [pageCount, setPageCount] = useState<number>(1);
    const [rowCount, setRowCount] = useState<number>(0);
    const [pageSize, setPageSize] = useState<number>(() => {
        const storedPageSize = localStorage.getItem('pageSize');
        return storedPageSize ? parseInt(storedPageSize) : 20;
    });

    const fetchCustomers = async () => {
        try {
            const getQuery=()=>{ 
                //Rozdielne pri node - others
                if(!node) return "adresar.json";
                if (node.postCode!="others") return "adresar/(psc begins '"+node.postCode+"').json";
                //others cez OR
                return "adresar/("+node.children.map((e)=>`(psc begins '${e.postCode}')` ).join(" OR ")+").json";
            };
            const url = `https://demo.flexibee.eu/v2/c/demo/${getQuery()}?limit=${pageSize}&start=${(currentPage - 1) * pageSize
                }&add-row-count=true`;
            const response = await axios.get(url);

            setCustomers(response.data.winstrom.adresar);
            setRowCount(response.data.winstrom['@rowCount']);
            setPageCount(Math.ceil(rowCount / pageSize));

        } catch (error) {
            console.error('Chyba pri načítaní zákazníkov:', error);
        }
    };

    useEffect(() => {
        fetchCustomers();
    }, [currentPage, node, pageSize]);

    useEffect(() => {
        localStorage.setItem('pageSize', pageSize.toString());
    }, [pageSize]);

    const handlePageSizeChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        setPageSize(parseInt(event.target.value, 10));
        setCurrentPage(1); // Resetujeme na prvnú stránku po zmene veľkosti stránky
    };

    const navigate=useNavigate();
    const handleFirstPage = () => setCurrentPage(1);
    const handlePrevPage = () => setCurrentPage((prev) => Math.max(prev - 1, 1));
    const handleNextPage = () => setCurrentPage((prev) => Math.min(prev + 1, pageCount));
    const handleLastPage = () => setCurrentPage(pageCount);
    
    const handleNodeClick = (ev: React.MouseEvent<HTMLAnchorElement>) => {
        ev.preventDefault();
        navigate(ev.currentTarget.pathname);
    };

    return (
        <div>
            {node ? (
                <>
                    <h1>Zoznam zákazníkov</h1>
                    <p>Filter za: {node.postCode}</p>
                    <p>{path}</p>
                    <p>Podskupiny: {node.children?.map((e) => (<a href={'/psc/'+path+'/'+e.postCode} onClick={handleNodeClick}> {e.postCode + '(' + e.cnt + 'x)'} </a>))}</p>
                    <p>Počet záznamov: {rowCount}</p>
                </>
            ) : (
                <>
                    <h1>Zoznam zákazníkov - bez obmedzenia</h1>
                    <p>Počet záznamov: {rowCount}</p>
                </>
            )}

            <table className='table table-striped table-hover'>
                <thead>
                    <tr>
                        <th scope='col'>Kód</th>
                        <th scope='col'>Názov</th>
                        <th scope='col'>PSČ</th>
                    </tr>
                </thead>
                <tbody>
                    {customers.map((customer) => (
                        <tr key={customer.id}>
                            <td>{customer.kod}</td>
                            <td>{customer.nazev}</td>
                            <td>{customer.psc}</td>
                        </tr>
                    ))}
                </tbody>
            </table>

            <div className='pagination'>
                <button onClick={handleFirstPage} disabled={currentPage === 1}>
                    Prvá stránka
                </button>
                <button onClick={handlePrevPage} disabled={currentPage === 1}>
                    Predchádzajúca stránka
                </button>
                <span>
                    Stránka {currentPage} z {pageCount}
                </span>
                <button onClick={handleNextPage} disabled={currentPage === pageCount}>
                    Ďalšia stránka
                </button>
                <button onClick={handleLastPage} disabled={currentPage === pageCount}>
                    Posledná stránka
                </button>
            </div>

            <div className='page-size-options'>
                Veľkosť stránky:
                <select onChange={handlePageSizeChange} value={pageSize}>
                    <option value={10}>10</option>
                    <option value={20}>20</option>
                    <option value={30}>30</option>
                </select>
            </div>
        </div>
    );
};

export default CustomerList;
