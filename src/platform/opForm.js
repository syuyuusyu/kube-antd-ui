import React from 'react';
import { Form, Row, Col, Input, Button ,notification,Select} from 'antd';
import {inject,observer} from 'mobx-react';
import {baseUrl,post} from '../util';
const Option=Select.Option;
const FormItem = Form.Item;

@inject('rootStore')
@observer
class OpForm extends React.Component{

    componentDidMount(){
        const store=this.props.rootStore.sysOperationStore;
        if(store.currentOperation){
            this.props.form.setFieldsValue({
                type:store.currentOperation.type,
                path:store.currentOperation.path,
            });
        }
    }


    save=()=>{
        const store=this.props.rootStore.sysOperationStore;
        this.props.form.validateFields(async (err,values)=>{
            if(err) return;
            values.system_id=store.currentSys.id;
            if(store.currentOperation){
                values.id=store.currentOperation.id;
            }
            console.log(values);
            let json=await post(`${baseUrl}/op/save` , values);
            if(json.success){
                notification.success({
                    message:'保存成功',
                })
            }else{
                notification.error({
                    message:'后台错误，请联系管理员',
                })
            }
            store.loadOperation();
            store.toggleOpFormVisible();

        })
    };


    handleReset = () => {
        this.props.form.resetFields();
    };

    render(){
        const { getFieldDecorator, } = this.props.form;
        return (
            <Form>
                <Row>
                    <FormItem label="类型">
                        {getFieldDecorator('type',{

                        })(
                            <Select>
                                <Option  value={'1'}>登录</Option>
                                <Option  value={'2'}>退出</Option>
                                <Option  value={'5'}>推送用户信息</Option>
                                <Option  value={'6'}>注销平台用户</Option>
                                <Option  value={'7'}>服务资源目录</Option>
                                <Option  value={'8'}>系统元数据</Option>
                            </Select>
                        )}
                    </FormItem>
                </Row>
                <Row>
                    <FormItem label='路径'>
                        {getFieldDecorator('path',{
                            rules: [{ required: true, message: '此项为必填项!!' }],
                            validateTrigger:'onBlur'
                        })(
                            <Input placeholder="输入功能路径"  />
                        )}
                    </FormItem>
                </Row>
                <Row>
                    <Col span={24} style={{ textAlign: 'right' }}>
                        <Button icon="save" onClick={this.save}>保存</Button>
                        <Button icon="reload" onClick={this.handleReset}>重置</Button>

                    </Col>
                </Row>
            </Form>
        )
    }
}

export default  Form.create()(OpForm);
