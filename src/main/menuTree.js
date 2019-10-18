import React, {Component} from 'react';
import {Menu, Icon} from 'antd';
import {inject, observer,} from 'mobx-react';
import {configure} from 'mobx';
import {Link,} from 'react-router-dom';

const SubMenu = Menu.SubMenu;

configure({enforceActions: "observed"});

@inject('rootStore')
@observer
class MenuTree extends Component {

    componentDidMount() {

    }


    renderTree = (data) => {
        return data.map(item => {
            const title = item.path ?
                <Link to={item.path + (item.path_value ? item.path_value : '')}>
                    {item.icon ? <Icon type={item.icon}/> : ''}
                    <span>{item.text}</span>
                </Link>
                :
                <span>
                    {item.icon ? <Icon type={item.icon}/> : ''}
                    <span>{item.text}</span>
                </span>;

            if (item.children.filter(d=>d).length>0) {

                if(item.text=='菜单管理'){
                    console.log(item.children.filter(d=>d));
                }
                return <SubMenu key={item.id} title={title}>
                    {this.renderTree(item.children)}
                </SubMenu>
            }
            return <Menu.Item key={item.id}>{title}</Menu.Item>

        })
    };

    render() {
        const store = this.props.rootStore.treeStore;
        return (
            <Menu id="mainMenu" onClick={store.onMenuClick} mode="horizontal">
                <Menu.Item key='home'><Link to='/home'><Icon type="home" style={{fontSize: 16}}/>首页</Link></Menu.Item>
                {this.renderTree(store.menuTreeData)}
            </Menu>);
    }
}

export default MenuTree;
