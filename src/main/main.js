import React, {Component} from 'react';
import {
    Popover, Modal, Badge, Icon, Input
} from 'antd';
import {Link} from 'react-router-dom';
import {inject, observer} from 'mobx-react';
import {NavLink, Switch, Route, Redirect, withRouter} from 'react-router-dom';
import {Login} from '../login';
import MenuTree from './menuTree';
import {Home} from '../home';
import ModifyUserForm from '../modifyUserInfo/modifyUserForm'
import {UserTaskTable} from '../activiti';



const renderMergedProps = (component, ...rest) => {
    const finalProps = Object.assign({}, ...rest);
    return (
        React.createElement(component, finalProps)
    );
};

const PropsRoute = ({component, ...rest}) => {
    return (
        <Route {...rest} render={routeProps => {
            return renderMergedProps(component, routeProps, rest);
        }}/>
    );
};

@inject('rootStore')
@observer
class Main extends Component {

    componentWillMount() {
        const winWidth = document.documentElement.clientWidth;
        const winHeight = document.documentElement.clientHeight;
        this.props.rootStore.treeStore.updateWinSize({width: winWidth, height: winHeight});
        this.winResize = (e) => {
            this.props.rootStore.treeStore.updateWinSize({
                width: document.documentElement.clientWidth,
                height: document.documentElement.clientHeight,
            });
        };
        window.addEventListener('resize', this.winResize, false);
    }

    componentWillUnmount() {
        window.removeEventListener('resize', this.winResize, false);
    }

    componentDidMount() {
        //角色权限变动以后需要刷新的数据
        if (!this.props.rootStore.authorityStore.loginVisible) {
            Promise.all([
                this.props.rootStore.treeStore.loadMenuTree()
            ]);
        }
    }

    render() {
        const {loginVisible} = this.props.rootStore.authorityStore;
        const treeStore = this.props.rootStore.treeStore;
        const {winWidth, winHeight, headerHeight, menuHeight, footerHeight} = treeStore;
        const userOperations = (
            <ul className="popover-list">
                {/*<li onClick={this.props.rootStore.notificationStore.toggleApplyPlatformVisible}>*/}
                <li onClick={this.props.rootStore.activitiStore.startProcess('platform_apply')}>
                    <Icon type="user-add"/>&nbsp;&nbsp; 申请平台访问权限
                </li>
                <li onClick={this.props.rootStore.activitiStore.startProcess('platform_cancel')}>
                    <Icon type="user-delete"/>&nbsp;&nbsp; 注销平台访问权限
                </li>
                <li>
                    <Icon type="profile"/>&nbsp;&nbsp; <Link to="/modifyUser">修改用户信息</Link>
                </li>
                <li onClick={this.props.rootStore.authorityStore.logout}>
                    <Icon type="poweroff"/>&nbsp;&nbsp; 退出
                </li>
            </ul>
        );
        // 未登录
        if (loginVisible) {
            return (
                <div className="extend-layout" style={{height: "100%"}}>
                    <Switch>
                        <Route path="/login" component={Login}/>
                        <Redirect path="/" to="/login"/>
                    </Switch>
                    <footer>© syuyuusyu@gmail.com</footer>
                </div>
            );
        }
        // 已登录
        //console.log( this.props.rootStore.treeStore.menuTreeData.filter(d=>d));
        return (
            <div id="mainBox">
                <header>
                    <div id="headerBox">
                        <div id="logoBox">
                            <span className="text">Elemental</span>
                        </div>

                        <Popover placement="bottom" trigger="hover" content={userOperations}>
                            <div id="userBox">
                                <Icon type="user"/>
                                <span
                                    className="name">&nbsp;&nbsp;{sessionStorage.getItem('currentUserName')}&nbsp;</span>
                                <Icon type="down" style={{fontSize: '12px'}}/>
                            </div>
                        </Popover>
                        <Badge id="messageBox" style={{backgroundColor: '#52c41a'}}
                               count={this.props.rootStore.activitiStore.currentTask.filter(d => d).length}>
                            <Icon
                                type="message"
                                onClick={this.props.rootStore.activitiStore.showUserTaskTableVisible}
                            />
                        </Badge>
                    </div>
                    <MenuTree/>
                </header>
                <Switch>
                    <Route exact path="/" render={() => <Redirect to="/home"/>}/>
                    <Route exact path="/login" render={() => <Redirect to="/home"/>}/>
                    <Route exact path="/home" component={Home}/>
                    <Route exact path="/modifyUser" component={ModifyUserForm}/>
                    {
                        this.props.rootStore.treeStore.currentRoleMenu
                            .filter(d => d)
                            .filter(m => m.path)
                            .map(m => {
                                if (m.pageClass === 'CommonLayOut') {
                                    return (
                                        <Route
                                            key={m.id}
                                            exact
                                            path={m.path + (m.path_holder ? m.path_holder : '')}
                                            render={() => (
                                                <div id="contentBox" style={{
                                                    width: winWidth - 32,
                                                    height: winHeight - headerHeight - menuHeight - footerHeight - 16
                                                }}>
                                                    <PropsRoute component={require('../' + m.pagePath)[m.pageClass]}
                                                                defaultQueryObj={m.defaultQueryObj} />
                                                </div>
                                            )}
                                        />
                                    )
                                }
                                return (
                                    <Route
                                        key={m.id}
                                        exact
                                        path={m.path + (m.path_holder ? m.path_holder : '')}
                                        render={() => (
                                            <div id="contentBox" style={{
                                                width: winWidth - 32,
                                                height: winHeight - headerHeight - menuHeight - footerHeight - 16
                                            }}>
                                                <Route component={require('../' + m.pagePath)[m.pageClass]}/>
                                            </div>
                                        )}
                                    />
                                )

                            })
                    }
                </Switch>
                <footer>© syuyuusyu@gmail.com</footer>
                <Modal visible={this.props.rootStore.activitiStore.userTaskTableVisible}
                       width={1000}
                       title={`待办事项`}
                       footer={null}
                       onCancel={this.props.rootStore.activitiStore.toggleUserTaskTableVisible}
                       maskClosable={false}
                       destroyOnClose={true}
                >
                    <UserTaskTable/>
                </Modal>
            </div>
        );
    }
}

export default withRouter(Main);
