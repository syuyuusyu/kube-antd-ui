
//平台访问权限申请流程的相关方法

//用户申请访问权限后提交的信息
const applyVariable=(values,formData)=>{
    let username = JSON.parse(sessionStorage.getItem("user")).name;
    let msg=username+'申请以下平台权限:';
    let applySystemCode=[];
    let nextForm =[];
    formData.forEach(data=>{
        if(values[data.key] && data.editable){
            //msg=msg+data.label+',';
            let form={
                label: data.label,
                key: data.key,
                type: 'check',
                editable: true,
                value: false
            };
            nextForm.push(form);
            applySystemCode.push(data.key);
        }
    });
    if(applySystemCode.length===0){
        return {
            applySystemLength:applySystemCode.length,
            isLast:true
        };
    }
    return {
        message:msg,
        nextForm:nextForm,
        applySystemLength:applySystemCode.length,
    }
};

//平台访问权限角色审批后提交的信息
const approval=(values,formData)=>{
    let approval=false;
    let applySystemCode=[];
    let username = JSON.parse(sessionStorage.getItem("user")).name;
    let message=username;
    formData.forEach(data=>{
        if(values[data.key]){
            message+=`同意申请${data.label}权限,`;
            applySystemCode.push(data.key);
            approval=true;
        }else{
            message+=`拒绝申请${data.label}权限,`
        }
    });

    return {
        approval:approval,
        message:message,
        applySystemCode:applySystemCode.join(','),
        opType:'apply',
        nextForm:[]
    }
};

export const paltfromApplyProcess=(taskName,values,formData)=>{
    if(taskName==='用户申请平台访问权限'){
        return applyVariable(values,formData);
    }
    if(taskName==='审批申请平台权限'){
        return approval(values,formData);
    }
    if(taskName==='申请平台权限结果'){
        return {
            isLast:true
        }
    }
};



