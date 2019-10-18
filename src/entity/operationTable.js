import React, {Component} from 'react';
import { Divider, Popconfirm,Icon, Table, Modal, Row, Col,Button,Drawer,Select,notification} from 'antd';
import {inject, observer} from 'mobx-react';
import {baseUrl, get} from '../util';
import OperationForm from './operationForm';
import '../style.css';

const Option=Select.Option;

//import {SysOperationStore} from "./store";

//const TreeNode = Tree.TreeNode;
//const {Content, Sider} = Layout;

@inject('rootStore')
@observer
class OperationTable extends Component {

    columns = [
        {dataIndex: 'name', title: '操作名称', width: 120,},
        {
            dataIndex: 'icon', title: '图标', width: 50,
            render:(text)=>{
                return <Icon type={text}/>
            }
        },
        {
            dataIndex: 'type', title: '类型', width: 100,
            render:(text)=>{
                switch (text){
                    case '1':
                        return '关联关系';
                    case '2':
                        return '自定义';
                    case '3':
                        return '执行方法';
                }
            }
        },
        {
            dataIndex: 'location', title: '按钮位置', width: 100,
            render:(text)=>{
                switch (text){
                    case '1':
                        return '位于表头';
                    case '2':
                        return '位于每一行';
                }
            }
        },
        {dataIndex: 'pagePath', title: '类所在目录', width: 220,},
        {dataIndex: 'pageClass', title: '页面类名', width: 120,},
        {
            dataIndex: 'monyToMonyId', title: '关系名称', width: 120,
            render:(text,record)=>{
                if(record.type=='1'){
                    const store = this.props.rootStore.entityStore;
                    return store.monyToMonys.find(d=>d.id==text).name;
                }else{
                    return '';
                }

            }
        },
        {
            title: '操作',
            width: 180,
            render: (text, record) => {
                return (
                    <span>
                        <Divider type="vertical"/>
                        <Button icon="edit"
                                onClick={this.props.rootStore.entityStore.showOperationForm(true,record)} size='small'>修改</Button>
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
        let json=await get(`${baseUrl}/entity/deleteConfig/entity_operation/id/${id}`);
        if(json.success){
            notification.info({
                message: '删除成功'
            });
        }else{
            notification.error({
                message: '删除失败'
            });
        }
        this.props.rootStore.entityStore.loadEntityOperations();
    });


    componentDidMount() {
        this.props.rootStore.entityStore.loadEntityOperations();
    }


    render() {
        const store = this.props.rootStore.entityStore;
        return (
            <div>
                <Modal visible={store.operationFormVisible}
                       width={600}
                       title="配置操作"
                       footer={null}
                       onCancel={store.toggleOperationFormVisible}
                       maskClosable={false}
                       destroyOnClose={true}
                >
                    <OperationForm/>
                </Modal>
                <Row gutter={2} className="table-head-row">
                    <Col span={4} style={{ textAlign: 'right' }} className="col-button">
                        <Button icon="plus-circle-o" onClick={store.showOperationForm(false,null)}>新建操作</Button>
                    </Col>
                </Row>
                <Table columns={this.columns}
                       rowKey={record => record.id}
                       dataSource={store.entityOperations.filter(d => d)}
                       rowSelection={null}
                       size="small"
                       scroll={{y: 800,}}
                />
            </div>
        );
    }
}

export default OperationTable;