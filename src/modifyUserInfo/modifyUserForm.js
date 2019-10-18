import React, {Component} from 'react';
import {Form, Row, Col, Input, Button, Select, Modal, notification} from 'antd';
import {baseUrl, get,post} from "../util";
import {inject, observer} from "mobx-react";
import {Link} from 'react-router-dom';

const FormItem = Form.Item;
const crypto = require('crypto');

@inject('rootStore')
@observer
class ModifyUserForm extends Component {
  /*checkOriginalPw = async (rule, value, callback) => {
    if (!value) {
      value = null;
      callback();
    }
    const url = `${baseUrl}/modifyUser/checkOriginalPw/${value}`;
    const response = await get(url);
    if (!response.success) {
      callback('原始密码错误');
    }
  }*/
  validateToNextPassword = (rule, value, callback) => {
    const form = this.props.form;
    /*   if(typeof(form.getFieldValue('originalPassword'))==="undefined"){
         callback('请先输入原始密码');
       }*/
    if (value && false) {
      form.validateFields(['confirm'], {force: true});
    }
    callback();
  }
  compareToFirstPassword = (rule, value, callback) => {
    const form = this.props.form;
  /*  if(form.getFieldValue('newPassword')!==''&&value===''){
      callback('请输入确认密码');
    }*/
    if (value && value !== form.getFieldValue('newPassword')) {
      callback('两次输入的密码不一致');
    } else {
      callback();
    }
  }
  checkIDnumber= async (rule, value, callback) => {
    if (!value) {
      callback();
    }
    if(JSON.parse(sessionStorage.getItem('user')).ID_number!==value){
    const url = `${baseUrl}/modifyUser/checkIDnumberUnique/${value}`;
    let json = await get(url);
    if (json.total !== 0) {
      callback("身份证编号已存在");
    }
    const format = /^(([1][1-5])|([2][1-3])|([3][1-7])|([4][1-6])|([5][0-4])|([6][1-5])|([7][1])|([8][1-2]))\d{4}(([1][9]\d{2})|([2]\d{3}))(([0][1-9])|([1][0-2]))(([0][1-9])|([1-2][0-9])|([3][0-1]))\d{3}[0-9xX]$/;
    //号码规则校验
    if(!format.test(value)){
      callback("身份证号码不合规");
    }
    //区位码校验
    // 出生年月日校验  前正则限制起始年份为1900;
    const year = value.substr(6,4);//身份证年
    const month = value.substr(10,2);//身份证月
    const date = value.substr(12,2);//身份证日
    const time = Date.parse(month+'-'+date+'-'+year);//身份证日期时间戳date
    const now_time = Date.parse(new Date());//当前时间戳
    const dates = (new Date(year,month,0)).getDate();//身份证当月天数
    if(time>now_time||date>dates){
      callback("出生日期不合规");
    }
    //校验码判断
    const coefficient = [7,9,10,5,8,4,2,1,6,3,7,9,10,5,8,4,2];  //系数
    const checkCode = ['1','0','X','9','8','7','6','5','4','3','2']; //校验码对照表
    let  id_array = value.split("");
    let sum = 0;
    for(let k=0;k<17;k++){
      sum+=parseInt(id_array[k])*parseInt(coefficient[k]);
    }
    if(id_array[17].toUpperCase() != checkCode[sum%11].toUpperCase()){
      callback("身份证校验码不合规");
    }else(callback());
  }}
  checkEmail=async (rule, value, callback)=>{
    if (!value) {
      callback();
    }
    if(JSON.parse(sessionStorage.getItem('user')).email!==value){
      const url = `${baseUrl}/modifyUser/checkEmailUnique/${value}`;
      let json = await get(url);
      if (json.total !== 0) {
        callback("邮箱已存在");
      }
    }
  }
  reset = () => {
    this.props.form.resetFields();
  }
  save=()=>{
    this.props.form.validateFields(async (err, values) =>{
      if(err) return;
      //将当前登录的用户加入到values中，作为后台更新数据时的条件
      values.userName=JSON.parse(sessionStorage.getItem('user')).userName;
      //如果只输入了初始密码，而没有输入修改密码或确认密码，将初始密码置空
      if(values.originalPassword!==''&&(values.newPassword===''||values.confirmNewPassword==='')){
        values.originalPassword='';
      }
      //如果原始密码，新密码，确认密码不为空的话对新密码和确认密码进行加密并将随机生成的数字（salt）加入values传到后台
      if(values.originalPassword!==''&&values.newPassword!==''&&values.confirmNewPassword!==''){
        const randomNumber=Math.random().toString().substr(2,10);
        const hmac = crypto.createHmac('sha256', randomNumber);
        values.newPassword=hmac.update(values.newPassword).digest('hex');
        values.confirmNewPassword=hmac.update(values.confirmNewPassword).digest('hex');
        values.salt=randomNumber;
      }
      let json=await post(`${baseUrl}/modifyUser/save` , values);
        if(json.success==='初始密码错误'){
        notification.error({
          message:'原始密码错误！'
        })
        this.reset();
      } else if(json.success==='修改用户信息及密码成功'){
          Modal.success({
            title: '修改成功!将跳转至登录页面重新登录',
            onOk: this.props.rootStore.authorityStore.logout
          });
        }else if(json.success){
        Modal.success({
          title: '修改成功！',
          onOk: () => {
            this.props.history.push('/home');
          },
        });
      } else{
        notification.error({
          message:'后台错误，请联系管理员。点击返回按钮返回主页面'
        })
      }
    })
  }

  render() {
    {
      const {getFieldDecorator} = this.props.form;
      const formItemLayout = {
        labelCol: { span: 4 },
        wrapperCol: { span: 20}
      };
      const treeStore = this.props.rootStore.treeStore;
      const { winWidth, winHeight, headerHeight, menuHeight, footerHeight } = treeStore;
    return (
      <div className="user-inform" style={{ width: winWidth - 32, height: winHeight - headerHeight - menuHeight - footerHeight - 16 }}>
        <Form >
          <br/>
            <Row>
              <Col span={14} offset={5}>
                <Row  gutter={60}>
                  <Col span={12} >
                    <FormItem label='个人账号（不可修改）' className="inform-user">
                      {
                        getFieldDecorator('userName', {
                          initialValue: JSON.parse(sessionStorage.getItem('user')).userName,
                        })(
                          <Input readOnly='readOnly'/>
                        )
                      }
                    </FormItem>
                  </Col>
                  <Col span={12} >
                    <FormItem label="电话号码（不可修改）" className="inform-phone">
                      {
                        getFieldDecorator('phone', {
                          initialValue: JSON.parse(sessionStorage.getItem('user')).phone,
                        })(
                          <Input readOnly='readOnly'/>
                        )
                      }
                    </FormItem>
                  </Col>
                  <Col span={12}>
                    <FormItem label="用户姓名">
                      {
                        getFieldDecorator('nickName', {rules: [{required: true, message: '用户姓名不能为空'},
                          ],
                          initialValue: JSON.parse(sessionStorage.getItem('user')).name,
                        })(
                          <Input/>
                        )
                      }
                    </FormItem>
                  </Col>
                  <Col span={12}>
                    <FormItem label='原始密码'>
                      {getFieldDecorator('originalPassword', {
                        /*rules: [{
                          validator: this.checkOriginalPw,
                        }],*/
                        initialValue:'',
                        validateTrigger: 'onBlur'
                      })(
                        <Input type="password" placeholder="请输入原始密码"/>
                      )}
                    </FormItem>
                  </Col>
                  <Col span={12}>
                    <FormItem label="修改密码">
                      {getFieldDecorator('newPassword', {
                        rules: [{
                          validator: this.validateToNextPassword,
                        }],
                        initialValue:'',
                        validateTrigger: 'onBlur'
                      })(
                        <Input type="password" placeholder="请输入修改密码"/>
                      )}
                    </FormItem>
                  </Col>
                  <Col span={12}>
                    <FormItem label="确认密码">
                      {getFieldDecorator('confirmNewPassword', {
                        rules: [{
                          validator: this.compareToFirstPassword,
                        }],
                        initialValue:'',
                        validateTrigger: 'onBlur'
                      })(
                        <Input type="password" placeholder="请输入确认密码"/>
                      )}
                    </FormItem>
                  </Col>

          {/*<Row>
            <FormItem label="电话号码(禁止修改)" {...formItemLayout}>
              {
                getFieldDecorator('phone', {
                  initialValue: JSON.parse(sessionStorage.getItem('user')).phone,
                })(
                  <Input readOnly='readOnly'/>
                )
              }
            </FormItem>
          </Row>*/}
                  <Col span={12}>
                    <FormItem label="身份证号">
                      {
                        getFieldDecorator('IDnumber', {rules: [{validator: this.checkIDnumber}],
                          initialValue: JSON.parse(sessionStorage.getItem('user')).ID_number,
                          validateTrigger: 'onBlur'
                        })(
                          <Input placeholder="请输入身份证编号(选填)"/>
                        )
                      }
                    </FormItem>
                  </Col>
                  <Col span={12}>
                    <FormItem label="邮箱地址">
                      {
                        getFieldDecorator('email', {rules: [{validator: this.checkEmail}],
                          initialValue: JSON.parse(sessionStorage.getItem('user')).email,
                          validateTrigger: 'onBlur'
                        })(
                          <Input placeholder="请输入邮箱(选填)"/>
                        )
                      }
                    </FormItem>
                  </Col>
                  <Col span={24} className="userinform-button">
                    <Button type="primary" htmlType="submit" onClick={this.save}>保存</Button>
                    <Button className="userinform-button01"  onClick={this.reset}>重置</Button>
                    <Link to="/home">返回</Link>
                  </Col>
                </Row>
              </Col>
            </Row>
        </Form>
      </div>
    );
  }
}}

export default Form.create()(ModifyUserForm);
