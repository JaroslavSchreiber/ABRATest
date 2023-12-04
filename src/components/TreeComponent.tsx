import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';

import CustomerList from './CustomerList';


export interface TreeNode {
    postCode: string;
    cnt: number;
    children: TreeNode[];
    parent: TreeNode | null;
    varians: string[];
}




const TreeComponent: React.FC = () => {
    const { '*': psc } = useParams();

    var selectedNode: TreeNode | null = null as TreeNode | null;
    const appdata: any[] = useSelector((state: any) => state.data); // 

    const nodes: TreeNode[] = [];
    var root: TreeNode = { postCode: "", cnt: 0, children: [], parent: null, varians: [] } as TreeNode;
    Object.entries(appdata).forEach(function ([key, e]) {
        if (key == "_root") root = { postCode: "", cnt: e.count, children: [], parent: null, varians: e.varians } as TreeNode;
        else nodes.push({ postCode: key, cnt: e.count, children: [], parent: null, varians: e.varians } as TreeNode);
    });

    const navigate = useNavigate();


    const createTreeData = (psc: string): TreeNode => {


        const make_top_and_others = (parentNode: TreeNode, allchilds: TreeNode[], lastlevel: Boolean): TreeNode[] => {
            if (allchilds.length == 0) return allchilds;
            var ret: TreeNode[] = [];

            for (var i = 0; i < allchilds.length && ret.length < 5; i++) {
                if (allchilds[i].cnt <= 0) continue;
                var obj: TreeNode = ({ ...allchilds[i] }); //Klon
                obj.parent = parentNode;

                for (var j = 0; j < ret.length; j++)
                    if (obj.postCode.startsWith(ret[j].postCode)) {
                        ret[j] = obj;
                        break;
                    }
                if (j == ret.length)
                    ret.push(obj);

            }

            //Aktualizacia - ponizenie mnozstva o 
            // Spocitame others node
            //Pocet zaznamov bude porerntNode.cnt minus sucet uzlov , ktore nie su vyspecifikovane uzloch v poli ret
            if (ret.length) {
                var others: TreeNode = {
                    postCode: "others", cnt: parentNode.cnt - ret.reduce((p, c) => p + c.cnt, 0),
                    children: [], parent: parentNode, varians: []
                } as TreeNode;
                if (others.cnt)
                    ret.push(others);
            }
            return ret;

        };

        const getChildren = (node: TreeNode, _nodes: TreeNode[], lastlevel: Boolean) => {

            var subnodes: TreeNode[];


            //Skupiny na pouzite vyssich urovniach    
            var rootnode: TreeNode = node;
            var skupiny: TreeNode[] = [];
            while (rootnode.parent != null) {
                rootnode = rootnode.parent;
                rootnode.children.forEach((e) => { if (e.postCode != "others") skupiny.push(e) });
            }


            if (node.postCode != "others") {
                subnodes = _nodes.filter((v, i) =>
                    v.postCode.startsWith(node.postCode) //Podskpiny podla zaciatku
                    && v.postCode != node.postCode //Okrem samej seba
                    && skupiny.indexOf(v) < 0 //a skupin pouzitých na vyssiech urovniach
                );
            }
            else {
                //ak je postcode== others..tak vytvorime subnoses pole tak ze:
                // roolup najdeme parent kde poostCode != "others" , pricom pridame do pola vsetlky postCode z childrens okrem others
                // potom najdmee vsetky skupiny , ktore nie su pod postcode
                //Pouzite skupiny na tejto a vyssich urovniach
                var ClosestNotOtherNode: TreeNode = node;
                var NotOthersNode: TreeNode[] = [];
                while (ClosestNotOtherNode.parent != null && ClosestNotOtherNode.postCode == "others") {
                    ClosestNotOtherNode = ClosestNotOtherNode.parent;
                    ClosestNotOtherNode.children.forEach((e) => { if (e.postCode != "others") NotOthersNode.push(e) });
                }
                subnodes = _nodes.filter((v, i) => v.postCode.startsWith(ClosestNotOtherNode.postCode) && NotOthersNode.every((s) => !v.postCode.startsWith(s.postCode)));
            }
            subnodes.map((e) => { e.cnt = e.cnt - skupiny.reduce((p, c) => p + (c.postCode.startsWith(e.postCode) ? c.cnt : 0), 0); return e; }); //Skorigujeme pocet o pocty podskupin zobrazenych/pouzitých na vyssich urovniach
            subnodes.sort((a, b) => b.cnt - a.cnt);
            return make_top_and_others(node, subnodes, lastlevel);
        };

        root.children = getChildren(root, nodes, psc == "");

        //var children = root.children;
        selectedNode = root;

        psc.split('/').every((e, i, ar) => {
            selectedNode = selectedNode?.children.find((v) => v.postCode == e) ?? null;
            if (!selectedNode) return false;

            selectedNode.children = getChildren(selectedNode, selectedNode.children.length == 0 ? nodes : selectedNode.children, i == ar.length - 1);
            return true;
        });

        return root;
    };

    var treeData: TreeNode = createTreeData(psc ?? "");

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
                    {renderTree(treeData.children, '/psc')}
                </div>
                <div className="col-md-6">
                    <CustomerList node={selectedNode} path={psc ?? ''} />
                </div>
            </div>
        </div>
    );
};

export default TreeComponent;
