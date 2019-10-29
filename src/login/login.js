import React from 'react';
import { Link } from 'react-router-dom'
import { inject, observer } from 'mobx-react';
import { Icon, Form, Button, notification, Input, Row, Col, Modal, Checkbox } from 'antd';
import { baseUrl,kubeUrl } from '../util';
import axios from 'axios';
import './login-3.less';
//import UserRegisterForm from '../signUp/userRegisterForm';
import Logo from '../assets/images/logo.png'

const FormItem = Form.Item;

@inject('rootStore')
@observer
class Login extends React.Component {
    constructor(props) {
        super();
        this.store = props.rootStore.authorityStore;
    }

    login = () => {
        this.props.form.validateFields(async (err, values) => {
            if (err) return;
            this.store.login(values);

        });
    };

    handleReset = () => {
        this.props.form.resetFields();
    };

    render() {
        const { getFieldDecorator } = this.props.form;
        return (
            <div className="login">
                <div className="content">
                    <Form className="login-form">
                        <div className="logo-title">
                            <img src={Logo} alt="logo" />
                            <h3>Elemental</h3>
                        </div>
                        <Row>
                            <FormItem label="用户名" className="user-name">
                                {getFieldDecorator('identify', {
                                    rules: [{ required: true, message: '用户名不能为空' }],
                                    validateTrigger: 'onBlur',
                                })
                                (<Input onPressEnter={this.login} prefix={<Icon type="user" />} placeholder="请输入用户名" />)}
                            </FormItem>
                        </Row>
                        <Row>
                            <FormItem label="密码">
                                {getFieldDecorator('password', {
                                    rules: [{ required: true, message: '密码不能为空' }],
                                })
                                (<Input onPressEnter={this.login} prefix={<Icon type="lock" />} type="password" autoComplete="password" placeholder="请输入密码" />)}
                            </FormItem>
                        </Row>
                        <Row >
                            <Col span={25}  >
                                <Button type="primary" icon="login" className="login-button" onClick={this.login}>登录</Button>
                                &nbsp; 没有账号，请先<Link to="/register">注册</Link>
                            </Col>
                        </Row>
                    </Form>
                </div>
            </div>
        );
    }
}

export default Form.create()(Login);
