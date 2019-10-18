import React from 'react';
import {Button,Row,Col,Transfer} from 'antd';
import {inject,observer} from 'mobx-react';

@inject('rootStore')
@observer
class RoleSysConf extends React.Component{

    componentDidMount(){
        this.props.rootStore.roleStore.loadAllRoles();
        this.props.rootStore.userRoleStore.loadCurrentSysRole();
    }


    render(){
        const store=this.props.rootStore.userRoleStore;
        return (
            <div>
                <Transfer
                    dataSource={this.props.rootStore.roleStore.allRoles.filter(d=>d).map(r=>({
                        key:r.id,
                        title:r.code,
                        description:r.description,
                        name:r.name,
                        sname:r.sname
                    }))}
                    showSearch
                    listStyle={{width: 400, height: 310,}}
                    titles={['所有角色', '有权限访问该平台的角色']}
                    targetKeys={store.targetKeys.filter(d=>d)}
                    selectedKeys={store.selectedKeys.filter(d=>d)}
                    onChange={store.handleChange}
                    onSelectChange={store.handleSelectChange}
                    onScroll={store.handleScroll}
                    render={item => `${item.sname}-${item.title}-${item.name}-${item.description}`}
                />
                <Row>
                    <Col span={24} style={{ textAlign: 'right' }}>
                        <Button icon="save" onClick={store.saveSysRole}>保存</Button>
                        <Button icon="reload" onClick={store.handleReset}>重置</Button>

                    </Col>
                </Row>
            </div>
        );
    }
}

export default RoleSysConf;