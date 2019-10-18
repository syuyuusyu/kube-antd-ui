import React, {Component} from 'react';
import { Divider, Popconfirm, Table, Modal, Row, Col,Button,Drawer,Select,notification} from 'antd';
import {inject, observer} from 'mobx-react';
import {baseUrl, dateFtt, get} from '../util';
import ColumnTable from './columnTable';
import EntityForm from './entityForm';
import DictionaryTable from './dictionaryTable';
import MonyToMonyTable from './monyToMonyTable';
import OperationTable from './operationTable';

const Option=Select.Option;

//import {SysOperationStore} from "./store";

//const TreeNode = Tree.TreeNode;
//const {Content, Sider} = Layout;

@inject('rootStore')
@observer
class EntityTable extends Component {

    columns = [
        {dataIndex: 'id', title: 'ID', width: 50,},
        {
            dataIndex: 'tableName', title: '表名', width: 80
        },
        {dataIndex: 'entityCode', title: '编码', width: 80,},
        {dataIndex: 'entityName', title: '名称', width: 100,},
        {dataIndex: 'nameField', title: '名称字段', width: 120,},
        {
            dataIndex: 'editAble', title: '是否可编辑', width: 100,
            render:(text)=>{
                if(text==='1'){
                    return '是';
                }else{
                    return '否';
                }
            }
        },
        {dataIndex: 'idField', title: 'ID字段', width: 80,},
        {
            dataIndex: 'parentEntityId', title: '父实体表名', width: 80,
            render:(text)=>{
                if(text){
                    return this.props.rootStore.entityStore.entitys.filter(o=>o.id==text)[0]['tableName'];
                }else{
                    return text;
                }

            }
        },
        {dataIndex: 'pidField', title: '父ID字段', width: 80,},
        {
            title: '操作',
            width: 340,
            render: (text, record) => {
                return (
                    <span>
                        <Button icon="menu-unfold"
                                onClick={this.props.rootStore.entityStore.checkColumn(record)} size='small'>查看表字段</Button>
                        <Divider type="vertical"/>
                        <Button icon="tool"
                                onClick={this.props.rootStore.entityStore.showOperationTable(record)} size='small'>操作配置</Button>
                        <Divider type="vertical"/>
                        <Button icon="edit"
                                onClick={this.props.rootStore.entityStore.showEntityForm(true,record)} size='small'>修改</Button>
                        <Divider type="vertical"/>
                        <Popconfirm onConfirm={this.delete(record.id)} title="确认删除?">
                            <Button icon="delete" onClick={null} size='small'>删除</Button>
                        </Popconfirm>
                    </span>
                )
            }
        }
    ];

    delete=(id)=>(async ()=>{
        let json=await get(`${baseUrl}/entity/deleteConfig/entity/id/${id}`);
        if(json.success){
            notification.info({
                message: '删除成功'
            });
        }else{
            notification.error({
                message: '删除失败'
            });
        }
        this.props.rootStore.entityStore.loadEntitys();
    });


    componentDidMount() {
        this.props.rootStore.entityStore.loadEntitys();
        this.props.rootStore.entityStore.loadallDictionary();
        this.props.rootStore.entityStore.loadMonyToMonys();
    }

    componentWillUpdate(){
        //console.log('componentWillUpdate:'+this.constructor.name);
        //this.props.rootStore.sysOperationStore.loadCurrentSys(this.props.match.params.sysId);
    }

    render() {
        const store = this.props.rootStore.entityStore;
        return (
            <div>
                <Row gutter={2} className="table-head-row">
                    <Col span={2} style={{ textAlign: 'right' }} className="col-button">
                            <Button icon="plus-circle-o" onClick={store.showEntityForm(false,null)}>实体新建</Button>
                    </Col>
                    <Col span={2} style={{ textAlign: 'right' }} className="col-button">
                        <Button icon="profile" onClick={store.toggleDictionaryTableVisible}>字典配置</Button>
                    </Col>
                    <Col span={4} style={{ textAlign: 'right' }} className="col-button">
                        <Button icon="appstore-o" onClick={store.toggleMonyToMonyTableVisible}>多对多关系配置</Button>
                    </Col>
                </Row>
                <Drawer
                    title={store.currentEntity?store.currentEntity.entityName:''}
                    placement="right"
                    width={1220}
                    zIndex={999}
                    closable={true}
                    maskClosable={false}
                    destroyOnClose={true}
                    onClose={store.toggleColumnTableVisible}
                    visible={store.columnTableVisible}

                >
                    <ColumnTable/>
                </Drawer>
                <Drawer
                    title={store.currentEntity?store.currentEntity.entityName:''}
                    placement="right"
                    width={600}
                    zIndex={999}
                    closable={true}
                    maskClosable={false}
                    destroyOnClose={true}
                    onClose={store.toggleEntityFormVisible}
                    visible={store.entityFormVisible}

                >
                    <EntityForm/>
                </Drawer>
                <Drawer
                    title={store.currentEntity?store.currentEntity.entityName:''}
                    placement="right"
                    width={1200}
                    zIndex={999}
                    closable={true}
                    maskClosable={false}
                    destroyOnClose={true}
                    onClose={store.toggleOperationTableVisible}
                    visible={store.operationTableVisible}

                >
                    <OperationTable/>
                </Drawer>
                <Drawer
                    title={'字典配置'}
                    placement="right"
                    width={800}
                    zIndex={999}
                    closable={true}
                    maskClosable={true}
                    destroyOnClose={true}
                    onClose={store.toggleDictionaryTableVisible}
                    visible={store.dictionaryTableVisible}

                >
                    <DictionaryTable/>
                </Drawer>
                <Drawer
                    title={'多对多关系'}
                    placement="right"
                    width={1000}
                    zIndex={999}
                    closable={true}
                    maskClosable={true}
                    destroyOnClose={true}
                    onClose={store.toggleMonyToMonyTableVisible}
                    visible={store.monyToMonyTableVisible}

                >
                    <MonyToMonyTable/>
                </Drawer>
                <Table columns={this.columns}
                       rowKey={record => record.id}
                       dataSource={store.entitys.filter(d => d)}
                       rowSelection={null}
                       size="small"
                       scroll={{y: 800,}}
                />
            </div>
        );
    }
}

export default EntityTable;