import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';

import CustomerList from './CustomerList';


export interface TreeNode {
    postCode: string;
    cnt: number;
    children: TreeNode[];
    varians: string[]
}




const TreeComponent: React.FC = () => {
    const { '*': psc } = useParams();

    var selectedNode: TreeNode | null = null as TreeNode | null;
    const appdata: any[] = useSelector((state: any) => state.data); // 

    const nodes: TreeNode[] = [];
    Object.entries(appdata).forEach(function ([key, e]) {
        nodes.push({ postCode: key, cnt: e.count, children: [], varians: e.varians } as TreeNode);
    });

    const navigate = useNavigate();


    const createTreeData = (psc: string): TreeNode[] => {


        const make_top_and_others = (allchilds: TreeNode[], lastlevel: Boolean): TreeNode[] => {
            if (allchilds.length == 0) return allchilds;
            var ret = allchilds.slice(0, 4).map((e) => ({ ...e })); //clone object
            var prevCode = 'xxxxxx';
            var others = allchilds.slice(4).sort((a, b) => a.postCode < b.postCode ? -1 : 1)
                .reduce((p, c) => {
                    c.varians.forEach((e) => { if (p.varians.indexOf(e) < 0) p.varians.push(e); });
                    if (!c.postCode.startsWith(prevCode)) {
                        p.cnt = p.cnt + c.cnt;
                        prevCode = c.postCode;
                    }
                    return p;
                },
                    { postCode: "others", cnt: 0, children: lastlevel ? [] : allchilds.slice(4), varians: [] } as TreeNode);

            if (others.cnt)
                ret.push(others);
            return ret;

        };

        const getChildren = (psc: string, _nodes: TreeNode[], lastlevel: Boolean) => {
            return make_top_and_others(_nodes.filter((v, i) => v.postCode.startsWith(psc) && v.postCode != psc).sort((a, b) => b.cnt - a.cnt), lastlevel);

        };

        var ret: TreeNode[] = getChildren("", nodes, psc == "");

        var children = ret;
        selectedNode = null;

        psc.split('/').every((e, i, ar) => {
            selectedNode = children.find((v) => v.postCode == e) ?? null;
            if (!selectedNode) return false;

            if (!selectedNode.children || selectedNode.children.length == 0)  //nie je others - ziskame childrens
            {
                selectedNode.children = getChildren(selectedNode.postCode, selectedNode.children.length == 0 ? nodes : selectedNode.children, i == ar.length - 1);
                children.forEach((e) => { if (e !== selectedNode) e.children = []; });
            }
            else selectedNode.children = make_top_and_others(selectedNode.children, i == ar.length - 1);

            children = selectedNode.children;
            return true;
        });

        return ret;

    };
    var treeData: TreeNode[] = createTreeData(psc ?? "");

    const handleNodeClick = (ev: React.MouseEvent<HTMLAnchorElement>) => {
        ev.preventDefault();
        navigate(ev.currentTarget.pathname);
    };

    const renderTree = (nodes: TreeNode[] | null, path: string) => {
        if (!nodes) return null;

        return (
            <ul className="list-group">
                {nodes.map((node) => (
                    <li key={node.postCode} className={`list-group-item ${path + '/' + node.postCode === '/psc/' + psc ? 'active' : ''}`}>
                        <a href={path + '/' + node.postCode} onClick={handleNodeClick}>
                            {node.postCode} <small>({node.cnt})</small>x
                        </a>
                        {renderTree(node.children, path + '/' + node.postCode)}
                    </li>
                ))}
            </ul>
        );
    };

    return (
        <div className="container mt-3">
            <h2>PSČ Filter</h2>
            <a href="/psc" className="btn btn-primary" onClick={handleNodeClick} >Vypnúť filter</a>
            <div className="row">
                <div className="col-md-6">
                    {renderTree(treeData, '/psc')}
                </div>
                <div className="col-md-6">
                    <CustomerList node={selectedNode} path={psc ?? ''} />
                </div>
            </div>
        </div>
    );
};

export default TreeComponent;
