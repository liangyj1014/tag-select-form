import { FormProps, FormInstance } from "antd/lib/form/Form";

export interface IRule {
  [key: string]: string;
}

export interface IRules {
  [key: string]: IRule;
}

export interface IValues {
  express: string;
  rules: IRule[];
}

export interface IDatas {
  express: string;
  rules: IRule[];
}

export interface IOption {
  [key: string]: string;
}

export interface ITagSelectFormProps extends FormProps {
  showExpress?: boolean;
  options?: IOption[];
  values?: IValues;
  onValuesChange?: (values: any, allValues: IValues) => void;
}

export interface IContext {
  form: FormInstance;
}