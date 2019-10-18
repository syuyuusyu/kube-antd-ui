import React from 'react';
import { Form, Row, Col, Input, Button ,Select,Modal,Progress} from 'antd';
import ParamsForm from './ParamsForm';
import {baseUrl, get,post} from "../util";
import {UnControlled as CodeMirror} from 'react-codemirror2'
import 'codemirror/mode/javascript/javascript';
import 'codemirror/addon/hint/show-hint.css';
import 'codemirror/addon/hint/show-hint.js';
import 'codemirror/addon/hint/javascript-hint.js';
import 'codemirror/lib/codemirror.css';
import 'codemirror/theme/material.css';
import 'codemirror/theme/ambiance.css';
import '../style.css';
const FormItem = Form.Item;
const Option = Select.Option;
const {TextArea}=Input;



class ConfForm extends React.Component{
    state = {
        next:[],
        saveVisible:false,
        savePercent:0,
        saveStatus:'active',
        paramVisible:false,
        queryStr:[],
        currentInvoke:{},
    };

    componentWillUnmount(){
        //this.props.close=null;
    }
    async componentDidMount(){
        if(this.props.data){
            const data=this.props.data;
            this.props.form.setFieldsValue({
                method:data.method,
                next:data.next?data.next.split(','):[],
                descrption:data.descrption,
                url:data.url,
                name:data.name,
                groupName:data.groupName
            });
            this.funMirrValue=data.parseFun;
            this.bodyMirrValue=data.body;
            this.headMirrValue=data.head;
        }
        if(this.props.invokeType==='2'){
            this.props.form.setFieldsValue({
                method:'post',
            });
        }
        let json=await post(`${baseUrl}/invokeInfo/invokes` ,{});
        json=json.map(o=>({
            id:o.id,name:o.name
        }));
        this.setState({next:json});
    };

    async componentWillReceiveProps(){

    };

    taggleParamForm=()=>{
        this.setState({paramVisible:!this.state.paramVisible})
    };

    test=()=>{
        this.props.form.validateFields((err,values)=>{
            if(err) return;
            if(!this.headMirrValue || !this.bodyMirrValue) return;
            values.head=this.headMirrValue;
            values.body=this.bodyMirrValue;
            values.parseFun=this.funMirrValue;
            if(values.next && values.next.length===0){
                delete values.next;
            }else if(values.next && values.next.length>0){
                values.next=values.next.reduce((a,b)=>a+','+b);
            }
            this.setState({currentInvoke:values});
            let queryStr = [];
            (values.url + values.head + values.body).replace(/@(\w+)/g, function (w, p1) {
                queryStr.push(p1);
            });
            this.setState({queryStr});
            this.taggleParamForm();
        });
    };

    handleReset = () => {
        this.props.form.resetFields();
    };

    save=()=>{
        this.props.form.validateFields(async (err,values)=>{
            if(err) return;
            if(!this.headMirrValue || !this.bodyMirrValue) return;

            values.head=this.headMirrValue;
            values.body=this.bodyMirrValue;
            values.parseFun=this.funMirrValue;
            if(this.props.data){
                values.id=this.props.data.id;
            }
            values.next=values.next?values.next:[];
            values.invokeType=this.props.invokeType;
            if(values.next.length===0){
                delete values.next;
            }else{
                values.next=values.next.reduce((a,b)=>a+','+b);
            }
            this.setState({saveVisible:true});
            let json=await post(`${baseUrl}/invokeInfo/save` , values);
            this.setState({savePercent:75});
            if(json.success){
                this.setState({savePercent:100,saveStatus:'success'});
            }else{
                this.setState({savePercent:100,saveStatus:'exception'});
            }
            //setTimeout(()=>{this.setState({saveVisible:false})},2000);
            this.props.close();
            this.props.reloadTable();
        })
    };

    checkUnique=async(rule, value, callback)=>{
        if(this.props.data){
            if(this.props.data.name===value){
                callback();
            }
        }
        let json=await get(`${baseUrl}/invokeInfo/checkUnique/${value}`);
        //let json=await response.json();
        if(json.total===0){
            callback();
        }else{
            callback(new Error());
        }

    };

    funMirrValue;
    headMirrValue=`{
    "Accept":"application/json",
    "Content-Type":"application/json;charset=UTF-8"
}`;
    bodyMirrValue=`{}`;



    render() {
        const { getFieldDecorator, } = this.props.form;

        return (
            <div>
                <Modal key="saveStatus" visible={this.state.saveVisible} footer={null}>
                    <Progress type="circle" percent={this.state.savePercent} status={this.state.saveStatus}  />
                </Modal>
                <Modal visible={this.state.paramVisible} footer={null}  onCancel={this.taggleParamForm}
                       maskClosable={false}
                       destroyOnClose={true}>
                    <ParamsForm invokeType={this.props.invokeType} params={this.state.queryStr} currentInvoke={this.state.currentInvoke}/>
                </Modal>
                <Form>
                    <Row gutter={24}>
                        <Col span={6}>
                            <FormItem label="调用名称">
                                {getFieldDecorator('name',{
                                    rules: [{ validator: this.checkUnique, message: '调用名称必须唯一', }],
                                    validateTrigger:'onBlur'
                                })(
                                    <Input placeholder="输入调用名称" />
                                )}
                            </FormItem>
                        </Col>
                        <Col span={6}>
                            <FormItem label="组名称">
                                {getFieldDecorator('groupName',{

                                })(
                                    <Input  placeholder="组名称" />
                                )}
                            </FormItem>
                        </Col>
                        <Col span={12}>
                            <FormItem label="描述">
                                {getFieldDecorator('descrption')(
                                    <Input placeholder="输入描述信息" />
                                )}
                            </FormItem>
                        </Col>
                    </Row>
                    <Row gutter={24}>
                        <Col span={6}>
                            <FormItem label="请求方法">
                                {getFieldDecorator('method',{
                                    rules: [{ required: this.props.invokeType==='1'?true:false, message: '此项为必填项!!' }],
                                    initialValue:'get'
                                })(
                                    <Select disabled={this.props.invokeType==='1'?false:true} onChange={null}>
                                        <Option key="get">GET</Option>
                                        <Option key="post">POST</Option>
                                        <Option key="put">PUT</Option>
                                        <Option key="delete">DELETE</Option>
                                    </Select>
                                )}
                            </FormItem>
                        </Col>
                        <Col span={6}>
                            <FormItem label="关联请求">
                                {getFieldDecorator('next',{
                                    rules: [{ required: this.props.invokeType==='2'?true:false, message: '此项为必填项!!' }],
                                })(
                                    <Select  onChange={null}  mode="multiple">
                                        {
                                            this.state.next.map((o,i)=><Option key={o.id}>{o.name}</Option>)
                                        }
                                    </Select>
                                )}
                            </FormItem>
                        </Col>
                        <Col span={12}>
                            <FormItem label="URL">
                                {getFieldDecorator('url',{
                                    rules: [{ required: this.props.invokeType==='1'?true:false, message: 'url不符合规范',
                                        //pattern: /(https?|ftp|file):\/\/[-A-Za-z0-9+&@#/%?=~_|!:,.;]+[-A-Za-z0-9+&@#/%=~_|]/
                                    }],
                                })(
                                    <Input disabled={this.props.invokeType==='1'?false:true} placeholder="输入请求URL" />
                                )}
                            </FormItem>
                        </Col>
                    </Row>
                    <Row gutter={24}>
                        <Col span={12}>
                            <div>
                                <div style={{marginBottom:'5px',marginTop:'10px'}}>请求头</div>
                                <CodeMirror
                                    value={this.headMirrValue}
                                    options={
                                        {
                                            mode:'json',
                                            theme: 'material',
                                            lineNumbers: true
                                        }
                                    }
                                    onChange={(editor, data, value) => {
                                        this.headMirrValue=value;
                                    }}
                                />
                            </div>
                        </Col>
                        <Col span={12}>
                            <div>
                                <div style={{marginBottom:'5px',marginTop:'10px'}}>请求体</div>
                                <CodeMirror
                                    value={this.bodyMirrValue}
                                    options={
                                        {
                                            mode:'json',
                                            theme: 'material',
                                            lineNumbers: true
                                        }
                                    }
                                    onChange={(editor, data, value) => {
                                        this.bodyMirrValue=value;
                                    }}
                                />
                            </div>
                        </Col>
                    </Row>
                    <Row>
                        <Col span={24}>
                            <div>
                                <div style={{marginBottom:'5px',marginTop:'10px'}}>解析函数</div>
                                <CodeMirror
                                    ref="editorFun"
                                    value={this.funMirrValue}
                                    options={
                                        {
                                            mode:'javascript',
                                            theme: 'material',
                                            lineNumbers: true,
                                            extraKeys: {"Ctrl": "autocomplete"},
                                        }
                                    }
                                    onChange={(editor, data, value) => {
                                        console.log('onChange fun');
                                        this.funMirrValue=value;
                                    }}
                                />
                            </div>
                        </Col>
                    </Row>
                    <Row>
                        <Col span={24} style={{ textAlign: 'right' }}>
                            <Button icon="play-circle" onClick={this.test}>测试</Button>
                            <Button icon="save" onClick={this.save} >保存</Button>
                            <Button type="reload" onClick={this.handleReset}>重置</Button>

                        </Col>
                    </Row>
                </Form>
            </div>
        );
    }
}

export default  Form.create()(ConfForm);