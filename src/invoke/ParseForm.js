import React from 'react';
import { Form, Input,Row,Col,Button,} from 'antd';
import {format,evil} from '../util';
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
const {TextArea}=Input;

class ParseForm extends React.Component{

    funMirrValue;//e0bf6e64d41a45bbbd1a41a6ae0e99b6

    componentDidMount(){
        console.log(this.props.form.setFieldsValue);
        this.props.form.setFieldsValue({
            result:format(JSON.stringify(this.props.invokeResult.result)),
            //parseFun:this.props.currentInvoke.parseFun,
            //parseResult:this.props.currentInvoke.parseFun
        });
        this.funMirrValue=this.props.currentInvoke.parseFun;
        //this.parse();
    };

    parse=()=>{
        this.props.form.validateFields((err,values)=>{
            if(err) return;
            let {parseFun,result}=values;
            result=JSON.parse(result);
            this.props.form.setFieldsValue({
                parseResult:format(JSON.stringify(this._parse(this.funMirrValue,result)))
            });
        });
    };

    _parse(parseFun,obj){
        try {
            let fn = evil(parseFun);
            return fn(obj);
        }catch (e){
            return e.toString();
        }
    }

    render(){
        const { getFieldDecorator, } = this.props.form;
        const result=this.props.invokeResult;
        return(
            <Form >
                <p>url:{result.url}</p>
                <Row gutter={24}>
                    <Col span={6}>
                        <FormItem label="请求头" ><TextArea rows={10} value={format(JSON.stringify(result.head))}/></FormItem>
                    </Col>
                    <Col span={6}>
                        <FormItem label="请求体" ><TextArea rows={10} value={format(JSON.stringify(result.body))}/></FormItem>
                    </Col>
                    <Col span={12}>
                        <FormItem label="请求结果" >
                            {getFieldDecorator('result',{

                            })(
                                <TextArea rows={10} />
                            )}
                        </FormItem>
                    </Col>
                </Row>
                <Row gutter={24}>
                    <Col span={12}>
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
                    <Col span={12}>
                        <FormItem label="解析函数结果" >
                            {getFieldDecorator('parseResult',{

                            })(
                                <TextArea rows={15} />
                            )}
                        </FormItem>

                    </Col>
                </Row>
                <Row>
                    <Col span={24} style={{ textAlign: 'right' }}>
                        <Button icon="play-circle" onClick={this.parse}>测试解析函数</Button>
                    </Col>
                </Row>
            </Form>
        );
    }
}

export default  Form.create()(ParseForm);