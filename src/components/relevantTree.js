import React from 'react';
import {Tree,Row,Col,Button,notification} from 'antd';
import {inject,observer} from 'mobx-react';
import {baseUrl, get, post} from "../util";
const TreeNode = Tree.TreeNode;

@inject('rootStore')
@observer
class RelevantTree extends React.Component{

    state={
        treeData:[],
        checkedKeys:[]
    };

    componentDidMount(){
        const store=this.props.rootStore.commonStore;
        store.relevantEntity=this.props.relevantEntity;
        this.nameField=store.relevantEntity.nameField;
        this.idField=store.relevantEntity.idField;
        this.initRoot();
    }

    renderTreeNodes = (data) => {
        return data.map((item) => {
            const title=item[this.nameField];
            if (item.children) {
                return (
                    <TreeNode title={title} key={item[this.idField]+''} dataRef={item}>
                        {this.renderTreeNodes(item.children)}
                    </TreeNode>
                );
            }
            return <TreeNode title={title} key={item[this.idField]+''} dataRef={item}  isLeaf={item.is_leaf?(item.is_leaf==='1'?true:false):false} />;
        });
    };

    initRoot=async ()=>{
        const store=this.props.rootStore.commonStore;
        let topParentRecord = await get(`${baseUrl}/entity/topParentRecord/${store.relevantEntity.id}`);
        let treeData = await post(`${baseUrl}/entity/query/${store.relevantEntity.id}`, {
            [store.relevantEntity.pidField]: topParentRecord[store.relevantEntity.idField]
        });
        let url=
            `${baseUrl}/entity/queryRelevant/${store.currentEntity.id}/${this.props.monyTomony.id}/${store.currentTableRow[store.currentEntity.idField]}`;
        let checkedKeys= await get(url);
        this.setState({treeData:treeData.data,checkedKeys:checkedKeys.data.map(d=>d[store.relevantEntity.idField]+'')});
    };

    save=async ()=>{
        const store=this.props.rootStore.commonStore;
        let json=await post(`${baseUrl}/entity/saveRelevant/${store.currentEntity.id}/${this.props.monyTomony.id}`,{
            srcId:store.currentTableRow[store.currentEntity.idField],
            targetIds:this.state.checkedKeys,
        });
        if (json.success) {
            notification.success({
                message: '保存成功',
            })
        } else {
            notification.error({
                message: '后台错误，请联系管理员',
            })
        }
        store.toggleOperationVisible(this.props.operationId)();
    };

    handleReset=()=>{
        this.setState({checkedKeys:[]});
    };

    onCheck=(checkedKeys)=>{
        this.setState({checkedKeys:checkedKeys.checked});
    };

    onLoadData=async (treeNode)=>{
        const store=this.props.rootStore.commonStore;
        const parentId=treeNode.props.dataRef.id;
        let json = await post(`${baseUrl}/entity/query/${store.relevantEntity.id}`, {
            [store.relevantEntity.pidField]: parentId
        });
        treeNode.props.dataRef.children=json.data;
        //console.log()
        this.setState({treeData:[...this.state.treeData]});
    };

    render() {
        const store=this.props.rootStore.commonStore;
        return (
            <div>
                <Tree checkable
                      loadData={this.onLoadData}
                      onCheck={this.onCheck}
                      checkedKeys={this.state.checkedKeys}
                      checkStrictly={true}
                      defaultExpandAll={false}
                      defaultCheckedKeys={this.state.checkedKeys}
                >
                    {this.renderTreeNodes(this.state.treeData)}
                </Tree>
                <Row>
                    <Col span={24} style={{ textAlign: 'right' }}>
                        <Button icon="save" onClick={this.save}>保存</Button>
                        <Button icon="reload" onClick={this.handleReset}>重置</Button>

                    </Col>
                </Row>
            </div>

        );
    }
}

export default RelevantTree;
