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


class InvokeParseForm extends React.Component{

    resultMirrValue;
    funMirrValue;
    funResultMirrValue;

    state={
        funResult:''
    };

    componentDidMount(){
        this.resultMirrValue=format(JSON.stringify(this.props.result));
        this.funMirrValue=this.props.parseFun;
        //this.parse();
    };

    parse=()=>{
        let result=JSON.parse(this.resultMirrValue);
        this.funResultMirrValue=format(JSON.stringify(this._parse(this.funMirrValue,result)));
        this.setState({funResult:this.funResultMirrValue});

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
        //const result=this.props.invokeResult;
        return(
            <div >
                <Row gutter={24}>

                    <Col span={24}>
                        <div>
                            <div style={{marginBottom:'5px',marginTop:'10px'}}>请求结果</div>
                            <CodeMirror
                                value={this.resultMirrValue}
                                options={
                                    {
                                        mode:'json',
                                        theme: 'material',
                                        lineNumbers: true
                                    }
                                }
                                onChange={(editor, data, value) => {
                                    this.resultMirrValue=value;
                                }}
                            />
                        </div>
                    </Col>
                </Row>
                <Row gutter={24}>
                    <Col span={12}>
                        <div>
                            <div style={{marginBottom:'5px',marginTop:'10px'}}>解析函数</div>
                            <CodeMirror
                                value={this.funMirrValue}
                                options={
                                    {
                                        mode:'javascript',
                                        theme: 'material',
                                        lineNumbers: true
                                    }
                                }
                                onChange={(editor, data, value) => {
                                    this.funMirrValue=value;
                                }}
                            />
                        </div>
                    </Col>
                    <Col span={12}>
                        <div>
                            <div style={{marginBottom:'5px',marginTop:'10px'}}>解析函数结果</div>
                            <CodeMirror
                                value={this.state.funResult}
                                options={
                                    {
                                        mode:'json',
                                        theme: 'material',
                                        lineNumbers: true
                                    }
                                }
                                onChange={(editor, data, value) => {
                                    this.funResultMirrValue=value;
                                }}
                            />
                        </div>

                    </Col>
                </Row>
                <Row>
                    <Col span={24} style={{ textAlign: 'right' }}>
                        <Button icon="play-circle" onClick={this.parse}>测试解析函数</Button>
                    </Col>
                </Row>
            </div>
        );
    }
}

export default  InvokeParseForm;