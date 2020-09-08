import _ from "lodash";

import { IValues } from './interface';

/**
 * @description 将字符串拆分为数组
 * @param {string} string
 * @return {object}
 *  [
        {
            begin: key开始位置,
            end: key结束位置,
            prevChar: key上一个字符,
            nextChar: key下一个字符,
            char: 条件的序号
        }
        ...
    ]
  * @example
  *  'a&b|c&(d|ab)' =>
    [
        { "char": "a",  "begin": 0, "end": 1,  "prevChar": "",  "nextChar": "&" },
        { "char": "b",  "begin": 2, "end": 3,  "prevChar": "&", "nextChar": "|" },
        { "char": "c",  "begin": 4, "end": 5,  "prevChar": "|", "nextChar": "&" },
        { "char": "d",  "begin": 7, "end": 8,  "prevChar": "(", "nextChar": "|" },
        { "char": "ab", "begin": 9, "end": 11, "prevChar": "|", "nextChar": ")" }
    ]
  */
interface ISplitString {
  char: string;
  begin: number;
  end: number;
  prevChar: string;
  nextChar: string;
}
export const splitString = (string: string): ISplitString[] => {
  const charsArr: ISplitString[] = [];
  for (let i = 0; i < string.length; i++) {
    const prevChar = string[i - 1] || '';
    const currChar = string[i];
    let nextChar = '';
    let j = i;
    if (isSpecificChar(currChar)) continue;
    while (!isSpecificChar(string[j]) && j < string.length) {
      j++;
    }
    const currChars = string.slice(i, j);
    nextChar = string[j] || '';
    if (
      (!prevChar || isSpecificChar(prevChar)) &&
      (!nextChar || isSpecificChar(nextChar))
    ) {
      charsArr.push({
        char: currChars,
        begin: i,
        end: j,
        prevChar,
        nextChar,
      });
    }
  }
  return charsArr;
}

export const isSpecificChar = (char: string): number => {
  // 字符优先级，优先级高的先移除
  const specificChars: {[key: string]: number} = {
    '|': 2,
    '&': 2,
    '(': 1,
    ')': 1,
  };
  return (specificChars[char]) || 0;
}

export const addChar = (string: string, char: string) => {
  const list = string.split(/[|&()]/g).filter((item: string) => item);
  if (!string) {
    string += char;
  } else if (!list.includes(char)) {
    string += `&${char}`;
  }
  return string;
}

export const removeChar = (string: string, chars: string): string => {
  if (!string || string === chars) {
    return '';
  }
  const charsArr = splitString(string);
  _.forEachRight(charsArr, (charInfo: ISplitString) => {
    const { prevChar, nextChar, char } = charInfo;
    let { begin, end } = charInfo;
    if (char !== chars) return;
    const prevCharPriority = isSpecificChar(prevChar);
    const nextCharPriority = isSpecificChar(nextChar);
    if (prevCharPriority < nextCharPriority) {
      end++;
    } else {
      begin--;
    }
    string = replaceChar(string, begin, end, '');
  });
  return string;
}

/**
 * @description 移除多余括号
 * @param {string} string
 * 需要移除的情况
 * 1. (a|b)
 * 2. a&(b)|c   一个变量外面套了一层或多层括号
 */
export const removeBrackets = (string: string): string => {
  const oldString = string;
  const reg2 = /\(([a-z]*)\)/g;
  if (reg2.test(string)) {
    string = string.replace(reg2, '$1');
  }
  const reg1 = /^\(([^()]*)\)$/g;
  if (reg1.test(string)) {
    string = string.replace(reg1, '$1');
  }
  if (oldString !== string) {
    string = removeBrackets(string);
  }
  return string;
}

export const replaceChar = (
  string: string, 
  beginIndex: number, 
  endIndex: number, 
  newChar: string
) => {
  if (beginIndex < 0 || beginIndex >= string.length || string.length === 0) {
    return string;
  }
  return string.substring(0, beginIndex) + newChar + string.substring(endIndex);
}

// 1->a, 2->b ... 27->aa, 28->ab...
export const number2alphabet = (num: number, code: string = 'a'): string => {
  if (num <= 0) {
    return '';
  }
  num = parseInt(String(num));
  let str = '';
  while (num > 26) {
    let count = parseInt(String(num / 26));
    let remainder = num % 26;
    if (remainder === 0) {
      remainder = 26;
      count--;
    }
    str = _number2alphabet(remainder, code) + str;
    num = count;
  }
  str = _number2alphabet(num, code) + str;
  return str;
}
const _number2alphabet = (num: number, code: string): string => {
  const charCode = code.charCodeAt(0) - 1;
  return String.fromCharCode(charCode + num);
}

// a->1, b->2 ... aa->27, ab->28
export const alphabet2number = (str: string, code: string = 'a'): number => {
  if (!/^[a-z]+$/.test(str)) return 0;
  const alphabetList = str.split('').reverse();
  let num = 0;
  alphabetList.forEach((subStr, index) => {
    num += _alphabet2number(subStr, code) * 26 ** index;
  })
  return num;
}
const _alphabet2number = (str: string, code: string): number => {
  return str.charCodeAt(0) - code.charCodeAt(0) + 1;
}

interface IConvertOrders {
  [key: string]: string;
}

export const resetOrders = ({ rules, express }: IValues) => {
  const convertOrders: IConvertOrders = {};
  _.forEach(rules, (rule, index) => {
    const oldOrder = rule._order;
    const newOrder = number2alphabet(index + 1);
    if (newOrder !== oldOrder) {
      rule._order = newOrder;
      convertOrders[oldOrder] = newOrder;
    }
  });
  express = removeBrackets(express);
  express = resetExpress(express, convertOrders);
  return {
    express, rules
  }
}

export const resetExpress = (string: string, convertOrders: IConvertOrders) => {
  const charsArr = splitString(string);
  _.forEachRight(charsArr, charInfo => {
    const char = charInfo.char;
    const newOrder = convertOrders[char] || char;
    const { begin, end } = charInfo || {};
    string = replaceChar(string, begin, end, newOrder);
  });
  return string;
}