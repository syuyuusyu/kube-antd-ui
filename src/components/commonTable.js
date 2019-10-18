import React, {Component} from 'react';
import {Form, Divider, Popconfirm, Table, Modal, Row, Col,Button,Drawer,Select,notification,Card,List} from 'antd';
import {inject, observer} from 'mobx-react';
import {baseUrl, dateFtt, format, get} from '../util';
import CreateForm from './createForm';
import CommonTransfer from './commonTransfer';
import RelevantTree from './relevantTree';


const EnhancedCreateFrom=Form.create()(CreateForm);
const Option=Select.Option;

//import {SysOperationStore} from "./store";

//const TreeNode = Tree.TreeNode;
//const {Content, Sider} = Layout;
@inject('rootStore')
@observer
class CommonTable extends Component{

    state={
        modalWidth:400
    };

    componentWillMount(){
        const store=this.props.rootStore.commonStore;
        store.loadColumns();
        this.textColumns=store.allColumns.filter(c=>c.entityId===store.currentEntity.id && c.hidden!=='1')
            .filter(c=>c.columnType==='text');
        this.textColumnsLen=this.textColumns.length;
        this.matrix=[];
        this.textColumns.forEach((col,index)=>{
            switch (index%2){
                case 0:
                    this.matrix.push([col]);
                    break;
                case 1:
                    this.matrix[Math.floor(index/2)].push(col);

            }
        });
        console.log(this.matrix);

    }

    componentDidMount(){
        this.props.rootStore.commonStore.queryTable();
    }


    expandedRowRender=(record)=>(
        <div className="box-code-card" style={{ background: '#ECECEC', padding: '1px' }}>
            {
                this.matrix.map((row,index)=> {
                    return (
                        <Row type="flex" justify="center" align="top" gutter={8} key={index}>
                            {
                                row.map(col => {
                                    return (
                                        <Col span={row.length==2? 12 : 24} key={col.id}>
                                            <Card title={col.text ? col.columnName + '-' + col.text : col.columnName}
                                                  bordered={false}>
                                                <pre>{format(record[col.columnName])}</pre>
                                            </Card>
                                        </Col>
                                    );
                                    }
                                )
                            }
                        </Row>
                    );
                    }
                )
            }
        </div>
    );

    createOperationPage=(op)=>{
        const store=this.props.rootStore.commonStore;
        if(op.type==='1'){
            let monyTomony=store.allMonyToMony.find(m=>m.id===op.monyToMonyId);
            let relevantEntity;
            if(monyTomony.firstTable===store.currentEntity.tableName){
                relevantEntity=store.allEntitys.find(e=>e.tableName===monyTomony.secondTable);
            }else if(monyTomony.secondTable===store.currentEntity.tableName){
                relevantEntity=store.allEntitys.find(e=>e.tableName===monyTomony.firstTable);
            }
            if(relevantEntity){
                //store.relevantEntity=relevantEntity;
                if(!relevantEntity.parentEntityId){
                    return (
                        <Modal visible={store.operationVisible[op.id]}
                               key={op.id}
                               width={900}
                               title={op.name}
                               footer={null}
                               onCancel={store.toggleOperationVisible(op.id)}
                               maskClosable={false}
                               destroyOnClose={true}
                        >
                            <CommonTransfer monyTomony={monyTomony} operationId={op.id} relevantEntity={relevantEntity}/>
                        </Modal>
                    );
                }else if(relevantEntity.id===relevantEntity.parentEntityId){
                    return (
                        <Modal visible={store.operationVisible[op.id]}
                               key={op.id}
                               width={400}
                               title={op.name}
                               footer={null}
                               onCancel={store.toggleOperationVisible(op.id)}
                               maskClosable={false}
                               destroyOnClose={true}

                        >
                            <RelevantTree monyTomony={monyTomony} operationId={op.id} relevantEntity={relevantEntity}/>
                        </Modal>
                    );
                }
            }
        }
        if(op.type==='2'){
            return (
                <Modal visible={store.operationVisible[op.id]}
                       key={op.id}
                       width={900}
                       title={op.name}
                       footer={null}
                       onCancel={store.toggleOperationVisible(op.id)}
                       maskClosable={false}
                       destroyOnClose={true}
                >
                    {React.createElement(require('../' + op.pagePath)[op.pageClass],{operationId:op.id})}
                </Modal>
            );

        }
    };

    render(){
        const store=this.props.rootStore.commonStore;
        const xscroll=store.currentEntity.tableLength?store.currentEntity.tableLength:store.hasParent?1080:1340;
        return (
            <div >
                <Modal visible={store.createFormVisible}
                       width={800}
                       //mask={false}
                       title="新建"
                       footer={null}
                       onCancel={store.toggleCreateFormVisible}
                       maskClosable={false}
                       destroyOnClose={true}
                >
                    <EnhancedCreateFrom wrappedComponentRef={(form)=>{store.refCreateForm(form?form.wrappedInstance:null)}}/>
                </Modal>
                {
                    store.operations.filter(o=>o.type!=='3').map(o=>this.createOperationPage(o))
                }
                <Drawer
                    placement="left"
                    width={600}
                    closable={false}
                    onClose={store.infoClose}
                    visible={store.infoVisible}
                >
                    <List
                        itemLayout="horizontal"
                        dataSource={store.infoArr.filter(d=>d)}
                        renderItem={item => (
                            <List.Item>
                                <List.Item.Meta
                                    title={item.title}
                                    description={
                                        item.type=='text'?
                                            <pre>{format(item.value)}</pre>
                                            :
                                            item.value
                                    }
                                />
                            </List.Item>
                        )}
                    />
                </Drawer>
                <Table
                       columns={store.columns.filter(d=>d)}
                       rowKey={record => record[store.currentEntity.idField]}
                       dataSource={store.tableRows.filter(d => d)}
                       rowSelection={this.props.canSelectRows?{selectedRowKeys:store.selectedRowKeys,onChange:store.onSelectRows}:null}
                       size="small"
                       scroll={{y: 800,x:xscroll}}
                       pagination={store.pagination}
                       loading={store.loading}
                       // expandedRowRender={store.allColumns.filter(c=>c.entityId===store.currentEntity.id && c.columnType==='text').length>0?
                       //     this.expandedRowRender:null}
                />
            </div>
        );
    }

}

export default CommonTable;