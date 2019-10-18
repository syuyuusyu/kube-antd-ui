import React, {Component} from 'react';
import {
    Modal, Badge, Icon, Input, Table, Dropdown, Menu, Button, Divider, Popconfirm
} from 'antd';
import {inject, observer} from 'mobx-react';


@inject('rootStore')
@observer
class Resources extends Component {

    componentDidMount() {
        const store = this.props.rootStore.kubeStore;
    }

    render() {
        const store = this.props.rootStore.kubeStore;
        return (
            <div>
                <Table
                    columns={store.columns}
                    rowKey={record => record.uid}
                    dataSource={store.resources.filter(d=>d)}
                    size="small"
                />
            </div>
        );

    }
}

export default Resources;