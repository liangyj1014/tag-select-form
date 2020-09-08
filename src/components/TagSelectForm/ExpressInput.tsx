import React, { useState } from 'react';
import { Input } from 'antd';

interface IExpressProps {
  value?: string;
  onChange?: (value: string) => void;
}

const ExpressInput: React.FC<IExpressProps> = (props) => {
  

  return <Input 
    className='express'
  />
}

export default ExpressInput;