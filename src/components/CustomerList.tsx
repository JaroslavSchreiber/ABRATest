import React, { useState, useEffect } from 'react';
import axios from 'axios';

import { TreeNode } from './TreeComponent'; // Importujete TreeNode z TreeComponent


interface CustomerListProps {
    node: TreeNode | null;
}

const CustomerList: React.FC<CustomerListProps> = ({ node }) => {
    const [currentPage, setCurrentPage] = useState<number>(1);
    const customers:any[]= [];
    const fetchCustomers = async (page: number, node: TreeNode) => {
        try {
            const response = await axios.get(`https://demo.flexibee.eu/v2/c/demo/adresar.json?page=${page}`, {
                params: {
                    postCode: node.postCode,
                    cnt: node.cnt
                    // Další parametry podle struktury TreeNode
                },
            });
            //setCustomers(response.data);
        } catch (error) {
            console.error('Chyba při načítání zákazníků:', error);
        }
    };

    useEffect(() => {
        //fetchCustomers(currentPage, node);
    }, [currentPage, node]);

    return (
        <div>
            {
                (node &&
                    <>
                        <h1>Zoznam zákazníkov pre uzol: {node.postCode}</h1>
                        <h3>Filter za :{node.postCode}</h3>
                        <p>Childrens: {node.children.map((e) => e.postCode).join("|")}</p>
                    </>
                )
                ||
                (!node &&
                    <>
                        <h1>Zoznam zákazníkov - bez  obmedzenia</h1>
                         <h3>Všetky záznamy:</h3>
                    </>
                )

            }

            <ul>
                {customers.map((customer) => (
                    <li key={customer.postCode}>{customer.postCode}</li>
                ))}
            </ul>
            <button onClick={() => setCurrentPage(currentPage - 1)} disabled={currentPage === 1}>
                Předchozí stránka {currentPage - 1}
            </button>
            <button onClick={() => setCurrentPage(currentPage + 1)}>Další stránka {currentPage + 1}</button>
        </div>
    );
};

export default CustomerList;
