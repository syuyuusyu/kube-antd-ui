import React, {Component} from 'react';
import {Tree} from 'antd';
import {inject, observer} from 'mobx-react';
import {baseUrl, dateFtt, get} from '../util';




const TreeNode = Tree.TreeNode;


@inject('rootStore')
@observer
class CommonTree extends Component{

    componentWillMount(){
        const store=this.props.rootStore.commonStore;
        store.initTree();

    }

    renderTreeNodes = (data) => {
        const store=this.props.rootStore.commonStore;
        return data.map((item) => {
            const title=item[store.currentParentEntity.nameField];
            if (item.children) {
                return (
                    <TreeNode title={title} key={item[store.currentParentEntity.idField]} dataRef={item}>
                        {this.renderTreeNodes(item.children)}
                    </TreeNode>
                );
            }
            return <TreeNode title={title} key={item[store.currentParentEntity.idField]} dataRef={item} isLeaf={item.is_leaf?(item.is_leaf==='1'?true:false):false}   />;
        });
    };

    render(){
        const store=this.props.rootStore.commonStore;
        return (
            <Tree loadData={store.onLoadTreeData}
                  onSelect={store.treeSelect}
            >
                {this.renderTreeNodes(store.treeData)}
            </Tree>
        );
    }

}

export default CommonTree;