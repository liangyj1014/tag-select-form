import React, { useState } from "react";
import { Form, Input } from 'antd';
import classnames  from 'classnames';

import { ITagSelectFormProps, IValues, IContext } from './interface';
import TagSelectList from "./TagSelectList";
import { number2alphabet, addChar, removeChar, resetOrders } from './utils';


export const TagSelectFormContext = React.createContext<IContext>({} as IContext);

const defaultOptions = ['host:123', 'host:324', 'ip:4123', 'ip:12513']

const TagSelectForm: React.FC<ITagSelectFormProps> = (props) => {
  const { 
    options,
    className,
    showExpress = true,
    values,
    onValuesChange, 
    children,
    ...restProps 
  } = props;
  const classes = classnames('tag-select-form', className, {});
  
  const [form] = Form.useForm();

  const [initialValues, setInitialValues] = useState<IValues>({
    express: 'a',
    rules: [
      {
        _order: 'a',
        op: 'eq',
      }
    ],
  });

  const [tagOptions] = useState<string[]>(defaultOptions);

  const context = {
    form,
  }

  const onChange = (values: any, allValues: IValues) => {
    console.log('on values change', values, allValues);
    if (onValuesChange) {
      onValuesChange(values, allValues);
    } 
  }

  const addRule = () => {
    const values: IValues = form.getFieldsValue();
    const { express, rules } = values;
    const order = number2alphabet(rules.length);
    const newExpress = addChar(express, order);
    form.setFieldsValue({express: newExpress});
  }

  const removeRule = (field: any, index: number) => {
    const values: IValues = form.getFieldsValue();
    const { express, rules } = values;
    rules.pop();  // 删除多余项
    let newExpress = express;
    if (!rules.length) {
      newExpress = '';
    } else {
      // 删除匹配条件对应的order
      const order = number2alphabet(index + 1);
      newExpress = removeChar(express, order);
    }
    const newValues = resetOrders({ express: newExpress, rules });
    form.setFieldsValue(newValues);
  }

  return (
    <TagSelectFormContext.Provider value={context}>
      <Form
        form={form}
        {...restProps}
        style={{width: 600}}
        name="tag-select-form"
        layout='horizontal'
        className={classes}
        initialValues={initialValues}
        onValuesChange={onChange}
      >
        {
          showExpress && <Form.Item name="express">
            <Input className="express" />
          </Form.Item>
        }
        
        <TagSelectList 
          options={tagOptions}
          addCallback={addRule}
          removeCallback={removeRule}
        />
      </Form>
    </TagSelectFormContext.Provider>
  )
}

TagSelectForm.defaultProps = {
  showExpress: true,
}

export default TagSelectForm;
