import React from 'react';
import axios from 'axios';
import { Form, Row, Col, Button ,notification,Select,Spin,Icon,Input} from 'antd';
import {inject,observer} from 'mobx-react';
import {baseUrl,activitiUrl,post} from '../util';

const Option=Select.Option;
const FormItem = Form.Item;
const antIcon = <Icon type="loading" style={{ fontSize: 24 }} spin />;

@inject('rootStore')
@observer
class CreateModelForm extends React.Component{


    componentDidMount(){

    }

    create=()=>{
        this.props.form.validateFields(async (err,values)=>{
            values.category='default';
            let {modelId}=await post(`${activitiUrl}/createModel`,values);
            window.open(`${activitiUrl}/modelPage?modelId=${modelId}`,'_blank')

        });
    };

    render(){
        const store=this.props.rootStore.activitiStore;
        const { getFieldDecorator, } = this.props.form;
        return (
            <div>
                    <Form>
                        <Row>
                            <FormItem label="名称">
                                {getFieldDecorator('name',{
                                    rules: [{ required: true, message: '必填' }],
                                })(
                                    <Input placeholder=''/>
                                )}
                            </FormItem>
                            <FormItem label="标识">
                                {getFieldDecorator('key',{
                                    rules: [{ required: true, message: '必填' }],
                                })(
                                    <Input placeholder=''/>
                                )}
                            </FormItem>
                            <FormItem label="描述">
                                {getFieldDecorator('description',{
                                    rules: [{ required: true, message: '必填' }],
                                })(
                                    <Input placeholder=''/>
                                )}
                            </FormItem>
                        </Row>
                        <Row>
                            <Col span={24} style={{ textAlign: 'right' }}>
                                <Button icon="save" onClick={this.create}>新建</Button>
                            </Col>
                        </Row>
                    </Form>

            </div>
        );
    }
}


export default  Form.create()(CreateModelForm);