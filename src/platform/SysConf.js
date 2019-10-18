import React from 'react';
import {Table,Modal,Divider,Popconfirm,Row,Col,Button,Drawer} from 'antd';
import {inject,observer} from 'mobx-react';
import SysForm from './sysForm';
import RoleSysConf from './roleSysConf';
import SysOperation from './sysOperation';
import "../home/index.less";


@inject('rootStore')
@observer
class SysConf extends React.Component{

    columns=[
        {dataIndex:'code',title:'系统编码',width:80},
        {dataIndex:'name',title:'系统名称',width:100},
        {dataIndex:'icon',title:'图标',width:100,},
        {dataIndex:'accType',title:'访问类型',width:100,
            render:(text)=>{
                if(text==='SSO'){
                    return '单点登录';
                }else if(text==='PLAN'){
                    return '直接访问';
                }else{
                    return '其他';
                }
            }
        },
        {
            dataIndex:'url',
            title:'URL',
            width:200,
            render: (text, record) => (
                <div style={{ wordWrap: 'break-word', wordBreak: 'break-all' }}>
                    {text}
                </div>
            )
        },
        {
            title:'操作',
            width:200,
            render:(text,record)=>{
                return (
                    <span>
                        <Button  size='small' icon="edit" disabled={!record.editable } onClick={this.props.rootStore.sysOperationStore.showOperation(record)}>功能配置</Button>
                              <Divider type="vertical"/>
                        <Button  size='small' icon="edit" disabled={!record.editable } onClick={this.props.rootStore.sysStore.showForm(record)}>修改</Button>
                        <Divider type="vertical"/>
                        <Popconfirm disabled={!record.editable } onConfirm={this.props.rootStore.sysStore.delete(record.id)} title="确认删除?">
                              <Button  size='small' icon="delete" disabled={!record.editable } onClick={this.save} >删除</Button>
                        </Popconfirm>
                    </span>
                )
            }
        }
    ];

    componentDidMount(){
        this.props.rootStore.sysStore.initAllsystem();
    }

    render(){
        const store=this.props.rootStore.sysStore;
        return (
            <div>
                <Modal visible={store.sysFormVisible}
                       width={700}
                       title='系统平台接入'
                       footer={null}
                       onCancel={store.toggleSysFormVisible}
                       maskClosable={false}
                       destroyOnClose={true}
                >
                    <SysForm/>
                </Modal>
                <Modal visible={store.sysRoleConfVisible}
                       width={900}
                       title={`角色访问权限配置,当前选中系统:${store.currentSys.name}`}
                       footer={null}
                       onCancel={store.toggleSysRoleConfVisible}
                       maskClosable={false}
                       destroyOnClose={true}
                >
                    <RoleSysConf/>
                </Modal>
                <Drawer
                    title={'功能配置'}
                    placement="right"
                    width={1220}
                    zIndex={999}
                    closable={true}
                    maskClosable={false}
                    destroyOnClose={true}
                    onClose={this.props.rootStore.sysOperationStore.toggleOperationVisible}
                    visible={this.props.rootStore.sysOperationStore.operationVisible}
                >
                    <SysOperation/>
                </Drawer>
              <div style={{paddingBottom:"12px"}}>
                <Row gutter={24}>
                    <Col span={20}></Col>
                    <Col span={4} style={{ textAlign: 'right' }}>
                        <Button  onClick={store.showForm()}>新建</Button>
                    </Col>
                </Row>
              </div>
                <Table columns={this.columns}
                       rowKey={record => record.id}
                       dataSource={store.allSystem.filter(d=>d)}
                       size="small"
                       //scroll={{ y: 600,}}
                    //expandedRowRender={this.expandedRowRender}
                    //pagination={this.state.pagination}
                    //loading={this.state.loading}
                    //onChange={this.handleTableChange}
                />
            </div>
        );
    }
}

export default SysConf;
