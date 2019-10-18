import React, {Component} from 'react';
import { Divider, Popconfirm, Table, Modal, Row, Col,Button} from 'antd';
import {inject, observer} from 'mobx-react';
import OpForm from './opForm';
//import {SysOperationStore} from "./store";

//const TreeNode = Tree.TreeNode;
//const {Content, Sider} = Layout;

@inject('rootStore')
@observer
class SysOperation extends Component {

    columns = [
        {
            dataIndex: 'type', title: '类型', width: 100,
            render: (text) => {
                switch (text) {
                    case '1':
                        return '登录';
                    case '2':
                        return '退出';
                    case '3':
                        return '接口调用';
                    case '4':
                        return '页面引用';
                    case '5':
                        return '推送用户';
                    case '6':
                        return '注销平台用户';
                    case '7':
                        return '服务资源目录';
                    case '8':
                        return '系统元数据';
                    default:
                        return '';
                }
            }

        },
        {dataIndex: 'path', title: '路径', width: 100,},
        {
            title: '操作',
            width: 200,
            render: (text, record) => {
                return (
                    <span>
                        <Button icon="edit" onClick={this.props.rootStore.sysOperationStore.showOpForm(record)} size='small'>修改</Button>
                        <Divider type="vertical"/>
                        <Popconfirm onConfirm={this.props.rootStore.sysOperationStore.deleteOp(record.id)}
                                    title="确认删除?">
                            <Button icon="delete" onClick={null} size='small'>删除</Button>
                        </Popconfirm>
                    </span>
                );
            }
        }
    ];

    componentWillReceiveProps(netxProps){
        // console.log(netxProps.match.params.sysId);
        // this.props.rootStore.sysOperationStore.loadCurrentSys(this.props.match.params.sysId);
    }



    async componentDidMount() {
        let sysId=this.props.rootStore.sysOperationStore.currentsysId
        console.log(sysId);
        await this.props.rootStore.sysOperationStore.loadCurrentSys(sysId);
        await this.props.rootStore.sysOperationStore.loadOperationById(sysId);
    }

    componentWillUpdate(){
        //console.log('componentWillUpdate:'+this.constructor.name);
        //this.props.rootStore.sysOperationStore.loadCurrentSys(this.props.match.params.sysId);
    }

    render() {
        const store = this.props.rootStore.sysOperationStore;
        return (
            <div>
                <div style={{paddingBottom:"12px"}}>
                    <Row gutter={24}>
                        <Col span={20}><span style={{fontSize: '16px'}}>当前系统名称:{store.currentSys.name}</span></Col>
                        <Col span={4} style={{textAlign: 'right'}}>
                            <Button icon="plus-circle" onClick={this.props.rootStore.sysOperationStore.showOpForm()}>新建</Button>
                        </Col>
                    </Row>
                </div>
                <Modal visible={store.opFormVisible}
                       width={700}
                       title='系统平台接入'
                       footer={null}
                       onCancel={store.toggleOpFormVisible}
                       maskClosable={false}
                       destroyOnClose={true}
                >
                    <OpForm/>
                </Modal>
                <Table columns={this.columns}
                       rowKey={record => record.id}
                       dataSource={store.currentOperations.filter(d => d)}
                       rowSelection={null}
                       size="small"
                       scroll={{y: 800,}}
                    //expandedRowRender={this.expandedRowRender}
                    //pagination={this.state.pagination}
                    //loading={this.state.loading}
                    //onChange={this.handleTableChange}
                />
            </div>
        );
    }
}

export default SysOperation;
