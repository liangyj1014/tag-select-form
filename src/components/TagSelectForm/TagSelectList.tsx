import React, { useState } from 'react';
import { Form, Input, AutoComplete, Select, Button } from 'antd';
import { FormListFieldData } from 'antd/lib/form/FormList';
import { MinusOutlined, PlusOutlined  } from '@ant-design/icons'
import _ from 'lodash';

import { IRule, IOption } from './interface';
import { number2alphabet } from './utils';
import { OPERATIONS } from './const';

interface ITagOption extends IOption {
  value: string;
}

interface IValueOption {
  [key: string]: ITagOption[];
}

interface ITagSelectListProps {
  options: string[];
  value?: IRule[];
  onChange?: (value: IRule[]) => void;
  addCallback?: () => void;
  removeCallback?: (field: FormListFieldData, index: number) => void;
}

const { Option } = Select;

const OP_OPTIONS = _.map(OPERATIONS, (value, key) => ({
  value: key,
  label: value,
}))

const TagSelectList: React.FC<ITagSelectListProps> = (props) => {
  const { options, addCallback, removeCallback } = props;

  const [keyOptions] = useState<ITagOption[]>(() => {
    const keys: string[] = options.map(item => item.split(':')[0]);
    return _.uniq(keys).map(item => ({value: item}));
  });
  const [valueOptsMap] = useState<IValueOption>(() => {
    const opts: IValueOption = {};
    _.forEach(options, item => {
      const [key, ...values] = item.split(':');
      const value = values.join(':');
      if (!opts[key]) {
        opts[key] = [];
      }
      opts[key].push({value});
    });
    return opts;
  });

  return (
    <Form.List name="rules">
      {(fields, { add, remove }) => (
        <div className="tag-select-list">
          {fields.map(field => (
            <div className="tag-select-row" key={field.key}>
              <Form.Item name={[field.name, 'key']} className="key">
                <AutoComplete
                  options={keyOptions}
                >
                  <Input addonBefore={number2alphabet(field.name + 1)} placeholder="key" />
                </AutoComplete>
              </Form.Item>
              <Form.Item name={[field.name, 'op']} className="op">
                <Select>
                  {OP_OPTIONS.map(({value, label}) => (
                    <Option key={value} value={value} label={label}>{label}</Option>
                  ))}
                </Select>
              </Form.Item>
              <Form.Item noStyle shouldUpdate={(prevValue, currValue) => {
                const prevRules = prevValue.rules || [];
                const currRules = currValue.rules || [];
                const index = field.name;
                return prevRules.length !== currRules.length ||
                  (prevRules[index] && currRules[index] &&
                  prevRules[index].key !== currRules[index].key);
              }}>
                {({getFieldValue}) => {
                  const key = getFieldValue(['rules', field.name, 'key']);
                  const options = valueOptsMap[key] || [];
                  return <Form.Item name={[field.name, 'value']} className="value">
                    <AutoComplete placeholder="value" options={options}></AutoComplete>
                  </Form.Item>
                }}
              </Form.Item>
              <Button
                danger
                className="remove-btn"
                size="small"
                onClick={() => {
                  remove(field.name);
                  if (removeCallback) {
                    removeCallback(field, field.name);
                  }
                }}
              >
                <MinusOutlined />
              </Button>
            </ div>
          ))}
          <Button
            block
            type="dashed"
            className="add-btn"
            onClick={() => {
              const length = fields.length + 1;
              add({ op: 'eq', _order: number2alphabet(length) });
              if (addCallback) {
                addCallback()
              }
            }}
          >
            <PlusOutlined />
          </Button>
        </div>
      )}
    </Form.List>
  )
}

export default TagSelectList;