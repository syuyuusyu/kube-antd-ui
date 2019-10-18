import React, {Component} from 'react';
import {
    Modal, Badge, Icon, Input, Table, Dropdown, Menu, Button, Divider, Popconfirm
} from 'antd';
import {inject, observer} from 'mobx-react';

import UpdateEdit from './updateEdit'
import LogConsole from './logConsole'
import TerminalConsole from './termianer'


@inject('rootStore')
@observer
class PodTable extends Component {

    columns = [
        {
            dataIndex: 'name', title: '名称', width: 250,
        },
        {
            dataIndex: 'status', title: '状态', width: 250,
        },
        {
            title: '操作',
            align: 'center',
            width: 350,
            render: (text, record) => {
                const store = this.props.rootStore.podStore;
                return (
                    <span key={Math.random()}>
                        <Dropdown   overlay={(
                            <Menu>
                                {
                                    this.getTerminal(record)
                                }
                                {
                                    this.getLog(record)
                                }
                                <Menu.Item>
                                    <Button onClick={store.toggleEditVisible(record)} size={"small"}>编辑</Button>
                                </Menu.Item>
                                <Menu.Item>
                                    <Popconfirm onConfirm={store.delete(record)} title="确认删除?">
                                        <Button onClick={null} size='small'>删除</Button>
                                    </Popconfirm>
                                </Menu.Item>
                            </Menu>
                        )}>
                            <Button icon="api" size={"small"}>操作</Button>
                        </Dropdown>
                    </span>
                )
            }
        }
    ];

    componentDidMount() {
        console.log('table ');
        const store = this.props.rootStore.podStore;
        //store.loadPods();

    }

    getTerminal(record) {
        const store = this.props.rootStore.podStore;
        if (record.containers.length === 1) {
            return (
                <Menu.Item key={Math.random()}>
                    <Button onClick={store.toggleConsoleVisible(record)} size={"small"}>终端</Button>
                </Menu.Item>
            )
        }
        return (
            record.containers.map((c, i) => (
                <Menu.Item  key={Math.random()}>
                    <Button onClick={store.toggleConsoleVisible(record,c.name)} size={"small"}>{`终端${c.name}`}</Button>
                </Menu.Item>
            ))

        )
    }

    getLog(record) {
        const store = this.props.rootStore.podStore;
        if (record.containers.length === 1) {
            return (
                <Menu.Item  key={Math.random()}>
                    <Button onClick={store.toggleLogVisible(record)} size={"small"}>日志</Button>
                </Menu.Item>
            )
        }
        return (
            record.containers.map((c) => (
                <Menu.Item  key={Math.random()}>
                    <Button onClick={store.toggleLogVisible(record,c.name)} size={"small"}>{`日志${c.name}`}</Button>
                </Menu.Item>
            ))

        )
    }


    render() {
        const store = this.props.rootStore.podStore;
        return (
            <div>

                <Modal visible={store.consoleVisible}
                       width={800}
                       title={`控制台`}
                       footer={null}
                       onCancel={store.toggleConsoleVisible()}
                       maskClosable={false}
                       destroyOnClose={true}
                       key="1"
                >
                    <TerminalConsole/>
                </Modal>
                <Modal visible={store.logVisible}
                       width={800}
                       title={`日志`}
                       footer={null}
                       onCancel={store.toggleLogVisible()}
                       maskClosable={false}
                       destroyOnClose={true}
                       key="2"
                >
                    <LogConsole/>
                </Modal>
                <Modal visible={store.editVisible}
                       width={800}
                       title={`编辑`}
                       footer={null}
                       onCancel={store.toggleEditVisible()}
                       maskClosable={false}
                       destroyOnClose={true}
                       key="3"
                >
                    <UpdateEdit/>
                </Modal>
                <Table
                    columns={this.columns}
                    rowKey={record => record.uid}
                    dataSource={store.pods.filter(d => d)}
                    size="small"
                />
            </div>
        );
    }
}


export default PodTable;