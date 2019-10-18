import React from 'react';
import {Table,Modal, Row, Col, Divider, notification, Popconfirm, Input, Icon, Button,Form} from 'antd';
import {inject, observer} from 'mobx-react';
import DicForm from './dicForm';
import DicFieldFrom from './dicFieldForm';
import {baseUrl, del, post, get} from '../util';


@inject('rootStore')
@observer
class DictionaryTable extends React.Component {

    columns = [
        {dataIndex: 'groupId', title: '分组ID', width: 50},
        {dataIndex: 'groupName', title: '字典名称', width: 200},
        {
            title: '操作',
            width: 300,
            render: (text, record) => {
                return (
                    <span>
                        <Button icon="edit" onClick={this.props.rootStore.entityStore.showAddDicFieldForm(record,false)} size='small'>新增字段</Button>
                        <Divider type="vertical"/>
                        <Button icon="edit" onClick={this.props.rootStore.entityStore.showAddDicForm(record,true)} size='small'>修改组名称</Button>
                        <Divider type="vertical"/>
                        <Popconfirm onConfirm={this.props.rootStore.entityStore.deleteGroup(record.groupId)} title="确认删除?">
                            <Button icon="delete" onClick={null} size='small'>删除组</Button>
                        </Popconfirm>
                    </span>
                )
            }
        }
    ];

    async componentDidMount(){
        this.props.rootStore.entityStore.loadallDictionary();
    }

    expandedRowRender=(record)=>{
        return (
            <DictionaryFieldTable ref={this.props.rootStore.entityStore.refDictionaryFieldTable(record.groupId)}
                                  group={record}
                                  showAddDicFieldForm={this.props.rootStore.entityStore.showAddDicFieldForm}
                                  deleteDictionary={this.props.rootStore.entityStore.deleteDictionary}

            />
        );
    };

    render() {
        const store = this.props.rootStore.entityStore;
        return (
            <div>
                <Modal visible={store.addDicVisible}
                       width={300}
                       title="字典"
                       footer={null}
                       onCancel={store.toggleAddDicVisible}
                       maskClosable={false}
                       destroyOnClose={true}
                >
                   <DicForm/>
                </Modal>
                <Modal visible={store.addDicFieldVisible}
                       width={300}
                       title="字典字段"
                       footer={null}
                       onCancel={store.toggleAddDicFieldVisible}
                       maskClosable={false}
                       destroyOnClose={true}
                >
                    <DicFieldFrom/>
                </Modal>
                <Row gutter={2} className="table-head-row">
                    <Col span={4} style={{ textAlign: 'right' }} className="col-button">
                        <Button icon="plus-circle-o" onClick={store.showAddDicForm(null,false)}>新建分组</Button>
                    </Col>
                </Row>
                <Table columns={this.columns}
                       rowKey={record => record.groupId}
                       dataSource={store.allDictionary.filter(d => d)}
                       rowSelection={null}
                       size="small"
                       scroll={{y: 500}}
                       bordered={true}
                       pagination={true}
                       expandedRowRender={this.expandedRowRender}
                />
            </div>
        );
    }
}


class DictionaryFieldTable extends React.Component {

    columns = [
        {dataIndex: 'text', title: '字段名称', width: 150},
        {dataIndex: 'value', title: '值', width: 100},
        {
            title: '操作',
            width: 150,
            render: (text, record) => {
                return (
                    <span>
                        <Button icon="edit" onClick={this.props.showAddDicFieldForm(record,true)} size='small'>修改字段</Button>
                        <Divider type="vertical"/>
                        <Popconfirm onConfirm={this.props.deleteDictionary(record.id,record.groupId)} title="确认删除?">
                            <Button icon="delete" onClick={null} size='small'>删除字段</Button>
                        </Popconfirm>
                    </span>
                )
            }
        }
    ];

    state = {
        currentFields: []
    };

    setCurrentFields=async ()=>{
        let json=await get(`${baseUrl}/dictionary/dictionary/${this.props.group.groupId}`);
        this.setState({currentFields:json});
    };

    async componentDidMount(){
        this.setCurrentFields();
    }

    render() {
        return (
            <Table columns={this.columns}
                   rowKey={(record,index) => index}
                   dataSource={this.state.currentFields}
                   rowSelection={null}
                   size="small"
                   scroll={{y: 800}}
                   bordered={true}
                   pagination={false}
            />
        );
    }

}


export default DictionaryTable;