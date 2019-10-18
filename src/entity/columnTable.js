import React, {Component} from 'react';
import { Divider, Popconfirm, Table, Modal, Row, Col,Button,Drawer,Select,notification} from 'antd';
import {inject, observer} from 'mobx-react';
import ColumnForm from './columnForm';
import {baseUrl, get} from '../util';

const Option=Select.Option;

//import {SysOperationStore} from "./store";

//const TreeNode = Tree.TreeNode;
//const {Content, Sider} = Layout;



@inject('rootStore')
@observer
class ColumnTable extends Component {

    columns = [
        {dataIndex: 'id', title: 'ID', width: 50,},
        {dataIndex: 'columnIndex', title: '排序', width: 50,},
        //{dataIndex: 'code', title: '编码', width: 80,},
        {dataIndex: 'columnType', title: '数据类型', width: 80,},
        {dataIndex: 'columnName', title: '列名', width: 100,},
        {dataIndex: 'text', title: '中文名', width: 100,},
        {dataIndex: 'width', title: '渲染宽度', width: 100,},
        {
            dataIndex: 'hidden', title: '隐藏', width: 50,
            render:(text)=>{
                if(text==='1'){
                    return '隐藏';
                }else{
                    return '显示';
                }
            }
        },
        {
            dataIndex: 'isUnique', title: '唯一', width: 50,
            render:(text)=>{
                if(text==='1'){
                    return '是';
                }else{
                    return '否';
                }
            }
        },
        {
            dataIndex: 'required', title: '必须', width: 50,
            render:(text)=>{
                if(text==='1'){
                    return '是';
                }else{
                    return '否';
                }
            }
        },
        {
            dataIndex: 'dicGroupId', title: '关联字典', width: 150,
            render:(text)=>{
                return this.props.rootStore.entityStore.allDictionary.filter(d=>d.groupId===text).length===1?
                    this.props.rootStore.entityStore.allDictionary.filter(d=>d.groupId===text)[0].groupName:''
            }
        },
        {
            title: '操作',
            width: 150,
            render: (text, record) => {
                return (
                    <span>
                        <Button icon="edit" onClick={this.props.rootStore.entityStore.showColumnForm(true,record)} size='small'>修改</Button>
                        <Divider type="vertical"/>
                        <Popconfirm onConfirm={this.delete(record.id)} title="确认删除?">
                            <Button icon="edit" onClick={null} size='small'>删除</Button>
                        </Popconfirm>
                    </span>
                )
            }
        }
    ];

    delete=(id)=>(async ()=>{
        let json=await get(`${baseUrl}/entity/deleteConfig/entity_column/id/${id}`);
        if(json.success){
            notification.info({
                message: '删除成功'
            });
        }else{
            notification.error({
                message: '删除失败'
            });
        }
        this.props.rootStore.entityStore.loadColumns();
    });



    componentDidMount() {
        this.props.rootStore.entityStore.loadColumns();
    }

    componentWillUpdate(){
        //console.log('componentWillUpdate:'+this.constructor.name);
        //this.props.rootStore.sysOperationStore.loadCurrentSys(this.props.match.params.sysId);
    }

    render() {
        const store = this.props.rootStore.entityStore;
        return (
            <div>
                <Drawer
                    title={store.currentColumn?store.currentColumn.text:''}
                    placement="right"
                    width={800}
                    zIndex={1000}
                    closable={false}
                    destroyOnClose={true}
                    onClose={store.toggleColumnFormVisible}
                    visible={store.columnFormVisible}
                >
                    <ColumnForm/>
                </Drawer>

                <Row gutter={2} className="table-head-row">
                    <Col span={4} style={{ textAlign: 'right' }} className="col-button">
                        <Button icon="plus-circle-o" onClick={this.props.rootStore.entityStore.showColumnForm(false,null)}>新建列</Button>
                    </Col>

                </Row>
                <Table columns={this.columns}
                       rowKey={record => record.id}
                       dataSource={store.currentColumns.filter(d => d)}
                       rowSelection={null}
                       size="small"
                       scroll={{y: 800,}}
                />
            </div>
        );
    }
}

export default ColumnTable;