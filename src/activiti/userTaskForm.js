//label key required placeholder type validateMessage validatePattern value enumValues

import React from 'react';
import {Form, Row, Col, Input, Button, notification, Select, Switch, DatePicker, Checkbox} from 'antd';
import {inject, observer} from 'mobx-react';
import {activitiUrl, baseUrl, post, get} from '../util';
import {paltfromApplyProcess} from './platform_apply_process';
import {paltfromCancelProcess} from './platform_cancel_process';

const Option = Select.Option;
const FormItem = Form.Item;

notification.config({
    placement: 'topLeft',
});

@inject('rootStore')
@observer
class UserTaskForm extends React.Component {

    async componentDidMount() {
        const store = this.props.rootStore.activitiStore;
        await store.loadFormData();
        await store.loadMessage();
        let valueobj = {};
        store.formData.filter(d => d).forEach(data => {
            if (data.value) {
                if (data.value === 'true')
                    valueobj[data.key] = true;
                else
                    valueobj[data.key] = data.value;
            }
        });
        this.props.form.setFieldsValue(valueobj);
    }


    submit = () => {
        const store = this.props.rootStore.activitiStore;
        let selectedTask = store.selectedTask;
        this.props.form.validateFields(async (err, values) => {
            if (err) return;
            let processDefinitionKey = await get(`${activitiUrl}/userTask/processDefinitionKey/${selectedTask.id}`);
            let nextJson = 'default';


            if (processDefinitionKey.key === 'platform_apply') {
                //平台权限申请流程
                nextJson = paltfromApplyProcess(store.selectedTask.name, values, store.formData.filter(d => d));
            }
            if (processDefinitionKey.key === 'platform_cancel') {
                //注销平台权限流程
                nextJson = paltfromCancelProcess(store.selectedTask.name, values, store.formData.filter(d => d));
            }
            if (processDefinitionKey.key === 'platform_modify') {
                //修改用户信息
                nextJson = {
                    isLast:true
                };
            }

            if (processDefinitionKey.key === 'message') {
                //获取其他平台推送的消息
                nextJson = {
                    isLast:true
                };
            }


            if (nextJson === 'default') {
                notification.error({
                    message: `当前流程:${store.selectedTask.name}没有对应的处理程序,请联系管理员`
                });
                return;
            }

            if (!nextJson) {
                return;
            }

            nextJson.previousUser = JSON.parse(sessionStorage.getItem("user")).name;

            let submitResult = await post(`${activitiUrl}/userTask/submit/${store.selectedTask.id}`, nextJson);
            if (submitResult.success) {
                notification.info({
                    message: submitResult.msg
                })
            } else {
                notification.error({
                    message: submitResult.msg
                });
            }
            store.loadCurrentTask();
            store.toggleUserTaskFormVisible();
            store.toggleUserTaskTableVisible();

        })
    };

    handleReset = () => {
        this.props.form.resetFields();
    };

    createInput = (form, getFieldDecorator) => {
        //type:string number,date
        return (
            <FormItem label={form.label} key={form.key + ''}>
                {getFieldDecorator(form.key + '', {
                    rules: [{required: form.required, message: form.validateMessage, type: form.type}],
                    initialValue: form.value
                })(
                    <Input placeholder={form.placeholder} disabled={!form.editable}/>
                )}
            </FormItem>

        );
    };

    createSelect = (form, getFieldDecorator) => {
        return (

            <FormItem label={form.label} key={form.key + ''}>
                {getFieldDecorator(form.key + '', {
                    rules: [{required: form.required}],
                    initialValue: form.value
                })(
                    <Select disabled={!form.editable}>
                        {
                            form.enumValues.map((o, i) => <Option key={i + '' + o.value}
                                                                  value={o.value}>{o.text}</Option>)
                        }
                    </Select>
                )}
            </FormItem>

        );
    };

    createSwitch = (form, getFieldDecorator) => {
        return (
            <Row key={form.key + ''}>
                <Col span={14} style={{lineHeight: '39px'}}>{form.label + ':'}</Col>
                <Col span={10}>
                    <FormItem key={form.key + ''}>
                        {getFieldDecorator(form.key + '', {valuePropName: 'checked'})(
                            <Switch disabled={!form.editable}/>
                        )}
                    </FormItem>
                </Col>
            </Row>

        );
    };

    createCheck = (form, getFieldDecorator) => {
        if(!form.editable){
            return null;
        }
        return (
            <Row key={form.key + ''}>
                <Col span={14} style={{lineHeight: '39px'}}>{form.label + ':'}</Col>
                <Col span={10}>
                    <FormItem key={form.key + ''}>
                        {getFieldDecorator(form.key + '', {valuePropName: 'checked'})(
                            <Checkbox disabled={!form.editable}></Checkbox>
                        )}
                    </FormItem>
                </Col>
            </Row>

        );
    };

    createDate = (form, getFieldDecorator) => {
        return (
            <FormItem label={form.label} key={form.key + ''}>
                {getFieldDecorator(form.key + '', {
                    rules: [{type: 'object', required: form.required, message: '请选择时间'}]
                })(
                    <DatePicker disabled={!form.editable} showTime format="YYYY-MM-DD HH:mm:ss"/>
                )}

            </FormItem>

        );

    };

    render() {
        const store = this.props.rootStore.activitiStore;
        const {getFieldDecorator,} = this.props.form;

        return (
            <Form>
                <div>
                    {
                        store.message.split(";").map(m=><div>{m}</div>)
                    }
                </div>
                {
                    store.formData.filter(d => d).map(data => {
                        switch (data.type) {
                            case 'string':
                                return this.createInput(data, getFieldDecorator);
                            case 'number':
                                return this.createInput(data, getFieldDecorator);
                            case 'switch':
                                return this.createSwitch(data, getFieldDecorator);
                            case 'date':
                                return this.createDate(data, getFieldDecorator);
                            case 'select':
                                return this.createSelect(data, getFieldDecorator);
                            case 'check':
                                return this.createCheck(data, getFieldDecorator);
                        }

                    })
                }
                <Row>
                    <Col span={24} style={{textAlign: 'right'}}>
                        <Button icon="play-circle-o" onClick={this.submit}>提交</Button>
                    </Col>
                </Row>
            </Form>
        )
    }
}

export default Form.create()(UserTaskForm);
