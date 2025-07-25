/**
 * SmarTalk 共享 Prettier 配置
 * 统一代码格式化规则
 */

module.exports = {
  // 基础格式化规则
  semi: true,                    // 语句末尾添加分号
  trailingComma: 'es5',         // 在ES5中有效的尾随逗号（对象、数组等）
  singleQuote: true,            // 使用单引号而不是双引号
  printWidth: 100,              // 每行最大字符数
  tabWidth: 2,                  // 缩进空格数
  useTabs: false,               // 使用空格而不是制表符
  
  // JSX 特定规则
  jsxSingleQuote: true,         // JSX 中使用单引号
  jsxBracketSameLine: false,    // JSX 标签的右括号另起一行
  
  // 其他格式化选项
  bracketSpacing: true,         // 对象字面量的括号间添加空格 { foo: bar }
  arrowParens: 'avoid',         // 箭头函数参数只有一个时省略括号
  endOfLine: 'lf',              // 使用 LF 换行符（Unix 风格）
  quoteProps: 'as-needed',      // 仅在需要时为对象属性添加引号
  
  // 文件特定覆盖
  overrides: [
    {
      files: '*.json',
      options: {
        printWidth: 80,
        tabWidth: 2,
      },
    },
    {
      files: '*.md',
      options: {
        printWidth: 80,
        proseWrap: 'always',
        tabWidth: 2,
      },
    },
    {
      files: '*.yml',
      options: {
        tabWidth: 2,
        singleQuote: false,
      },
    },
    {
      files: '*.yaml',
      options: {
        tabWidth: 2,
        singleQuote: false,
      },
    },
    {
      files: ['*.js', '*.jsx'],
      options: {
        parser: 'babel',
      },
    },
    {
      files: ['*.ts', '*.tsx'],
      options: {
        parser: 'typescript',
      },
    },
  ],
};
