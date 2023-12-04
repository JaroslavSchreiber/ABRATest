import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { TreeNode } from './TreeComponent';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { setPageSize, setCurrentPage } from '../actions'; // Upravte cestu podľa potreby


interface CustomerListProps {
    node: TreeNode | null;
    path: string;
}

const CustomerList: React.FC<CustomerListProps> = ({ node, path }) => {
    const dispatch = useDispatch();
    const pageSize = useSelector((state: any) => state.customerList.pageSize);
    const currentPage = useSelector((state: any) => state.customerList.currentPage);


    const [customers, setCustomers] = useState<any[]>([]);
    const [pageCount, setPageCount] = useState<number>(1);
    const [rowCount, setRowCount] = useState<number>(0);

    //    const storedPageSize = localStorage.getItem('pageSize');
    //    return storedPageSize ? parseInt(storedPageSize) : 20;


    const fetchCustomers = async () => {
        try {
            const getQuery = () => {
                //Rozdielne pri node - others
                if (!node) return "adresar.json";
//                if(node.postCode=="_prázdne_") return "adresar/(psc='').json";
                var prevcode = 'xxxxxx';
                if (node.postCode != "others") return "adresar/(" + node.varians.sort((a, b) => a < b ? -1 : 1)
                    .filter((s) => {
                        if (!s.startsWith(prevcode)) {
                            prevcode = s;
                            return true;
                        }
                    })
                    .map((e) => `(psc begins '${e}')`).join(" OR ") + ").json";

                //others cez OR
                else {
                    //najdem rootndode(iny ako others) cez parent
                    var ClosestNotOtherNode = node;
                    var NotOthersNode: TreeNode[] = [];
                    while (ClosestNotOtherNode.parent != null && ClosestNotOtherNode.postCode == "others") {
                        ClosestNotOtherNode = ClosestNotOtherNode.parent;
                        ClosestNotOtherNode.children.forEach((e) => { if (e.postCode != "others") NotOthersNode.push(e) });
                    }

                    const sqlParts:string[]=[];
                    
                    if (ClosestNotOtherNode.parent!=null)
                    {
                    prevcode = "xxxxx";
                    sqlParts.push( ClosestNotOtherNode.varians.sort((a, b) => a < b ? -1 : 1)
                        .filter((s) => {
                            if (!s.startsWith(prevcode)) {
                                prevcode = s;
                                return true;
                            }
                        })
                          .map((e) => `(psc begins '${e}')`).join(" OR "));
                    }

                    if (NotOthersNode.length) {
                        prevcode = "xxxxx";
                       sqlParts.push("not ("+ NotOthersNode
                            .reduce((p, c) => [...p, ...(c.varians ?? [])], [] as string[])
                            .filter((s) => {
                                if (!s.startsWith(prevcode)) {
                                    prevcode = s;
                                    return true;
                                }
                            })
                            .map((e) => `(psc begins '${e}')`).join(" OR ")+")");
                    }
                    return "adresar/(" +sqlParts.join(" AND ")+ ").json";
                }
            };
            const url = `https://demo.flexibee.eu/v2/c/demo/${getQuery()}?limit=${pageSize}&start=${(currentPage - 1) * pageSize
                }&add-row-count=true`;
            const response = await axios.get(url);

            setCustomers(response.data.winstrom.adresar);
            setRowCount(response.data.winstrom['@rowCount']);
            //setPageCount(Math.ceil(rowCount / pageSize));

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

    useEffect(() => {
        setPageCount(Math.ceil(rowCount / pageSize));
        if (currentPage > Math.ceil(rowCount / pageSize))
            dispatch(setCurrentPage(Math.max(1, Math.ceil(rowCount / pageSize))));

    }, [rowCount, pageSize]);


    const handlePageSizeChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        dispatch(setPageSize(parseInt(event.target.value, 10)));
        //setCurrentPage(1); // Resetujeme na prvnú stránku po zmene veľkosti stránky
    };

    const navigate = useNavigate();

    const handleFirstPage = () => dispatch(setCurrentPage(1));
    const handlePrevPage = () => dispatch(setCurrentPage(Math.max(currentPage - 1, 1)));
    const handleNextPage = () => dispatch(setCurrentPage(Math.min(currentPage + 1, pageCount)));
    const handleLastPage = () => dispatch(setCurrentPage(pageCount));


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
                    <p>Podskupiny: {node.children?.map((e) => (<a href={'/psc/' + path + '/' + e.postCode} onClick={handleNodeClick}> {e.postCode + '(' + e.cnt + 'x)'} </a>))}</p>
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
