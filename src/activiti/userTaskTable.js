import React, {Component} from 'react';
import { Divider, Popconfirm, Table, Modal, Row, Col,Button} from 'antd';
import {inject, observer} from 'mobx-react';
import {dateFtt} from '../util';
import UserTaskForm from './userTaskForm';
//import {SysOperationStore} from "./store";

//const TreeNode = Tree.TreeNode;
//const {Content, Sider} = Layout;

@inject('rootStore')
@observer
class UserTaskTable extends Component {

    columns = [
        {
            dataIndex: 'name', title: '待办事项', width: 200
        },
        {dataIndex: 'owner', title: '申请人', width: 200,},
        {dataIndex: 'ownerOrg', title: '申请人所在部门', width: 200,},
        {
            dataIndex: 'createTime', title: '创建时间', width: 200,
            render:text=>dateFtt('yyyy年MM月dd日 hh:mm:ss',new Date(text))
        },
        {
            title: '操作',
            width: 100,
            render: (text, record) => {
                return (
                    <span>
                        <Button icon="pushpin-o" onClick={this.props.rootStore.activitiStore.showUserTaskForm(record)} size='small'>办理</Button>
                    </span>
                );
            }
        }
    ];



    componentDidMount() {

    }

    componentWillUpdate(){
        //console.log('componentWillUpdate:'+this.constructor.name);
        //this.props.rootStore.sysOperationStore.loadCurrentSys(this.props.match.params.sysId);
    }

    render() {
        const store = this.props.rootStore.activitiStore;
        return (
            <div>
                <Modal visible={store.userTaskFormVisible}
                       width={400}
                       title={store.selectedTask.name}
                       footer={null}
                       onCancel={store.toggleUserTaskFormVisible}
                       maskClosable={false}
                       destroyOnClose={true}
                >
                    <UserTaskForm/>
                </Modal>
                <Table columns={this.columns}
                       rowKey={record => record.id}
                       dataSource={store.currentTask.filter(d => d)}
                       rowSelection={null}
                       size="small"
                       scroll={{y: 800,}}
                />
            </div>
        );
    }
}

export default UserTaskTable;
