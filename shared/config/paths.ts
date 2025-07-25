/**
 * SmarTalk 路径别名配置
 * 统一管理所有项目的路径别名和模块解析
 */

import path from 'path';

// 项目根目录
export const ROOT_DIR = path.resolve(__dirname, '../..');

// 各模块目录
export const PATHS = {
  // 根目录
  root: ROOT_DIR,
  
  // 主要模块目录
  backend: path.join(ROOT_DIR, 'backend'),
  mobile: path.join(ROOT_DIR, 'mobile'),
  web: path.join(ROOT_DIR, 'web'),
  shared: path.join(ROOT_DIR, 'shared'),
  content: path.join(ROOT_DIR, 'content'),
  docs: path.join(ROOT_DIR, 'docs'),
  scripts: path.join(ROOT_DIR, 'scripts'),
  tests: path.join(ROOT_DIR, 'tests'),
  
  // 后端目录
  backendSrc: path.join(ROOT_DIR, 'backend/src'),
  backendTests: path.join(ROOT_DIR, 'backend/tests'),
  backendDist: path.join(ROOT_DIR, 'backend/dist'),
  
  // 移动端目录
  mobileSrc: path.join(ROOT_DIR, 'mobile/src'),
  mobileTests: path.join(ROOT_DIR, 'mobile/__tests__'),
  mobileAssets: path.join(ROOT_DIR, 'mobile/assets'),
  
  // Web端目录
  webSrc: path.join(ROOT_DIR, 'web/src'),
  webTests: path.join(ROOT_DIR, 'web/__tests__'),
  webPublic: path.join(ROOT_DIR, 'web/public'),
  webDist: path.join(ROOT_DIR, 'web/.next'),
  
  // 共享目录
  sharedComponents: path.join(ROOT_DIR, 'shared/components'),
  sharedUtils: path.join(ROOT_DIR, 'shared/utils'),
  sharedTypes: path.join(ROOT_DIR, 'shared/types'),
  sharedConstants: path.join(ROOT_DIR, 'shared/constants'),
  sharedConfig: path.join(ROOT_DIR, 'shared/config'),
  sharedServices: path.join(ROOT_DIR, 'shared/services'),
  
  // 内容目录
  contentStories: path.join(ROOT_DIR, 'content/stories'),
  contentVideos: path.join(ROOT_DIR, 'content/videos'),
  contentImages: path.join(ROOT_DIR, 'content/images'),
  contentAudio: path.join(ROOT_DIR, 'content/audio'),
};

/**
 * TypeScript 路径别名配置
 */
export const TS_PATH_ALIASES = {
  // 根路径别名
  '@/*': ['./src/*'],
  '@root/*': ['./*'],
  
  // 共享模块别名
  '@shared/*': ['../shared/*'],
  '@shared/components/*': ['../shared/components/*'],
  '@shared/utils/*': ['../shared/utils/*'],
  '@shared/types/*': ['../shared/types/*'],
  '@shared/constants/*': ['../shared/constants/*'],
  '@shared/config/*': ['../shared/config/*'],
  '@shared/services/*': ['../shared/services/*'],
  
  // 内容别名
  '@content/*': ['../content/*'],
  '@content/stories/*': ['../content/stories/*'],
  '@content/videos/*': ['../content/videos/*'],
  '@content/images/*': ['../content/images/*'],
  '@content/audio/*': ['../content/audio/*'],
  
  // 测试别名
  '@tests/*': ['../tests/*'],
  '@test-utils/*': ['../tests/utils/*'],
  
  // 文档别名
  '@docs/*': ['../docs/*'],
  
  // 脚本别名
  '@scripts/*': ['../scripts/*'],
};

/**
 * 后端特定路径别名
 */
export const BACKEND_PATH_ALIASES = {
  '@/*': ['./src/*'],
  '@controllers/*': ['./src/controllers/*'],
  '@services/*': ['./src/services/*'],
  '@models/*': ['./src/models/*'],
  '@middleware/*': ['./src/middleware/*'],
  '@routes/*': ['./src/routes/*'],
  '@utils/*': ['./src/utils/*'],
  '@config/*': ['./src/config/*'],
  '@types/*': ['./src/types/*'],
  '@tests/*': ['./tests/*'],
  ...TS_PATH_ALIASES,
};

/**
 * Web端特定路径别名
 */
export const WEB_PATH_ALIASES = {
  '@/*': ['./src/*'],
  '@components/*': ['./src/components/*'],
  '@pages/*': ['./src/pages/*'],
  '@hooks/*': ['./src/hooks/*'],
  '@services/*': ['./src/services/*'],
  '@utils/*': ['./src/utils/*'],
  '@styles/*': ['./src/styles/*'],
  '@types/*': ['./src/types/*'],
  '@public/*': ['./public/*'],
  '@tests/*': ['./__tests__/*'],
  ...TS_PATH_ALIASES,
};

/**
 * 移动端特定路径别名
 */
export const MOBILE_PATH_ALIASES = {
  '@/*': ['./src/*'],
  '@components/*': ['./src/components/*'],
  '@screens/*': ['./src/screens/*'],
  '@navigation/*': ['./src/navigation/*'],
  '@services/*': ['./src/services/*'],
  '@utils/*': ['./src/utils/*'],
  '@hooks/*': ['./src/hooks/*'],
  '@constants/*': ['./src/constants/*'],
  '@types/*': ['./src/types/*'],
  '@assets/*': ['./assets/*'],
  '@tests/*': ['./__tests__/*'],
  ...TS_PATH_ALIASES,
};

/**
 * 生成 TypeScript 配置
 */
export function generateTsConfig(projectType: 'backend' | 'web' | 'mobile' | 'shared') {
  const baseConfig = {
    compilerOptions: {
      target: 'ES2020',
      lib: ['ES2020'],
      allowJs: true,
      skipLibCheck: true,
      strict: true,
      forceConsistentCasingInFileNames: true,
      noEmit: true,
      esModuleInterop: true,
      module: 'esnext',
      moduleResolution: 'node',
      resolveJsonModule: true,
      isolatedModules: true,
      jsx: 'preserve',
      incremental: true,
      baseUrl: '.',
      paths: {} as Record<string, string[]>,
    },
    include: [] as string[],
    exclude: ['node_modules', 'dist', 'build', '.next'],
  };

  switch (projectType) {
    case 'backend':
      baseConfig.compilerOptions.paths = BACKEND_PATH_ALIASES;
      baseConfig.include = ['src/**/*', 'tests/**/*'];
      baseConfig.compilerOptions.lib = ['ES2020'];
      baseConfig.compilerOptions.jsx = undefined;
      break;

    case 'web':
      baseConfig.compilerOptions.paths = WEB_PATH_ALIASES;
      baseConfig.include = ['next-env.d.ts', '**/*.ts', '**/*.tsx'];
      baseConfig.compilerOptions.lib = ['DOM', 'DOM.Iterable', 'ES6'];
      baseConfig.compilerOptions.jsx = 'preserve';
      break;

    case 'mobile':
      baseConfig.compilerOptions.paths = MOBILE_PATH_ALIASES;
      baseConfig.include = ['src/**/*', '__tests__/**/*', 'index.js'];
      baseConfig.compilerOptions.lib = ['ES2020'];
      baseConfig.compilerOptions.jsx = 'react-native';
      break;

    case 'shared':
      baseConfig.compilerOptions.paths = TS_PATH_ALIASES;
      baseConfig.include = ['**/*.ts', '**/*.tsx'];
      baseConfig.compilerOptions.lib = ['ES2020', 'DOM'];
      break;
  }

  return baseConfig;
}

/**
 * 生成 Webpack 别名配置
 */
export function generateWebpackAliases(projectType: 'backend' | 'web' | 'mobile' | 'shared') {
  const aliases: Record<string, string> = {};
  
  let pathAliases: Record<string, string[]>;
  
  switch (projectType) {
    case 'backend':
      pathAliases = BACKEND_PATH_ALIASES;
      break;
    case 'web':
      pathAliases = WEB_PATH_ALIASES;
      break;
    case 'mobile':
      pathAliases = MOBILE_PATH_ALIASES;
      break;
    case 'shared':
      pathAliases = TS_PATH_ALIASES;
      break;
  }

  for (const [alias, paths] of Object.entries(pathAliases)) {
    // 移除通配符
    const cleanAlias = alias.replace('/*', '');
    const cleanPath = paths[0].replace('/*', '');
    
    aliases[cleanAlias] = path.resolve(cleanPath);
  }

  return aliases;
}

/**
 * 生成 Jest 模块名映射
 */
export function generateJestModuleNameMapping(projectType: 'backend' | 'web' | 'mobile' | 'shared') {
  const moduleNameMapping: Record<string, string> = {};
  
  let pathAliases: Record<string, string[]>;
  
  switch (projectType) {
    case 'backend':
      pathAliases = BACKEND_PATH_ALIASES;
      break;
    case 'web':
      pathAliases = WEB_PATH_ALIASES;
      break;
    case 'mobile':
      pathAliases = MOBILE_PATH_ALIASES;
      break;
    case 'shared':
      pathAliases = TS_PATH_ALIASES;
      break;
  }

  for (const [alias, paths] of Object.entries(pathAliases)) {
    // Jest 需要正则表达式格式
    const jestAlias = alias.replace('/*', '/(.*)');
    const jestPath = paths[0].replace('/*', '/$1');
    
    moduleNameMapping[`^${jestAlias}$`] = `<rootDir>/${jestPath}`;
  }

  return moduleNameMapping;
}

/**
 * 生成 ESLint 导入解析配置
 */
export function generateEslintImportResolver(projectType: 'backend' | 'web' | 'mobile' | 'shared') {
  const aliases = generateWebpackAliases(projectType);
  
  return {
    'import/resolver': {
      typescript: {
        alwaysTryTypes: true,
        project: './tsconfig.json',
      },
      alias: {
        map: Object.entries(aliases).map(([alias, path]) => [alias, path]),
        extensions: ['.ts', '.tsx', '.js', '.jsx', '.json'],
      },
    },
  };
}

/**
 * 模块依赖关系图
 */
export const MODULE_DEPENDENCIES = {
  backend: {
    dependencies: ['shared'],
    dependents: [],
  },
  web: {
    dependencies: ['shared'],
    dependents: [],
  },
  mobile: {
    dependencies: ['shared'],
    dependents: [],
  },
  shared: {
    dependencies: [],
    dependents: ['backend', 'web', 'mobile'],
  },
  content: {
    dependencies: [],
    dependents: ['backend', 'web', 'mobile'],
  },
  tests: {
    dependencies: ['shared'],
    dependents: [],
  },
};

/**
 * 验证模块依赖关系
 */
export function validateModuleDependencies() {
  const errors: string[] = [];
  
  for (const [module, config] of Object.entries(MODULE_DEPENDENCIES)) {
    // 检查循环依赖
    for (const dependency of config.dependencies) {
      const depConfig = MODULE_DEPENDENCIES[dependency as keyof typeof MODULE_DEPENDENCIES];
      if (depConfig && depConfig.dependencies.includes(module)) {
        errors.push(`Circular dependency detected: ${module} <-> ${dependency}`);
      }
    }
    
    // 检查依赖一致性
    for (const dependent of config.dependents) {
      const depConfig = MODULE_DEPENDENCIES[dependent as keyof typeof MODULE_DEPENDENCIES];
      if (depConfig && !depConfig.dependencies.includes(module)) {
        errors.push(`Inconsistent dependency: ${dependent} should depend on ${module}`);
      }
    }
  }
  
  return errors;
}

export default {
  PATHS,
  TS_PATH_ALIASES,
  BACKEND_PATH_ALIASES,
  WEB_PATH_ALIASES,
  MOBILE_PATH_ALIASES,
  generateTsConfig,
  generateWebpackAliases,
  generateJestModuleNameMapping,
  generateEslintImportResolver,
  MODULE_DEPENDENCIES,
  validateModuleDependencies,
};
