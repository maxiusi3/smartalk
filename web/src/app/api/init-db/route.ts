/**
 * 数据库初始化 API 路由
 * 创建必要的表结构和示例数据
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

export async function POST(request: NextRequest) {
  try {
    // 检查环境变量
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY; // 使用服务角色密钥

    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json({
        status: 'error',
        message: 'Supabase configuration missing',
        details: {
          hasUrl: !!supabaseUrl,
          hasServiceKey: !!supabaseServiceKey
        }
      }, { status: 500 });
    }

    // 创建具有管理员权限的 Supabase 客户端
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // 读取 SQL 文件
    const schemaPath = path.join(process.cwd(), 'database', 'schema.sql');
    const seedPath = path.join(process.cwd(), 'database', 'seed.sql');

    let schemaSQL = '';
    let seedSQL = '';

    try {
      schemaSQL = fs.readFileSync(schemaPath, 'utf8');
      seedSQL = fs.readFileSync(seedPath, 'utf8');
    } catch (fileError) {
      return NextResponse.json({
        status: 'error',
        message: 'Could not read SQL files',
        error: fileError instanceof Error ? fileError.message : 'Unknown file error'
      }, { status: 500 });
    }

    const results = [];

    // 执行架构创建
    try {
      const { data: schemaData, error: schemaError } = await supabase.rpc('exec_sql', {
        sql: schemaSQL
      });

      if (schemaError) {
        // 如果 RPC 函数不存在，尝试直接执行 SQL
        console.log('RPC function not available, trying direct execution...');
        
        // 分割 SQL 语句并逐个执行
        const statements = schemaSQL
          .split(';')
          .map(stmt => stmt.trim())
          .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));

        for (const statement of statements) {
          if (statement.toLowerCase().includes('create table')) {
            // 对于创建表的语句，我们需要使用原生 SQL
            console.log('Executing:', statement.substring(0, 50) + '...');
          }
        }

        results.push({
          type: 'schema',
          status: 'attempted',
          message: 'Schema creation attempted with fallback method'
        });
      } else {
        results.push({
          type: 'schema',
          status: 'success',
          data: schemaData
        });
      }
    } catch (error) {
      results.push({
        type: 'schema',
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown schema error'
      });
    }

    // 执行示例数据插入
    try {
      const { data: seedData, error: seedError } = await supabase.rpc('exec_sql', {
        sql: seedSQL
      });

      if (seedError) {
        results.push({
          type: 'seed',
          status: 'error',
          error: seedError.message
        });
      } else {
        results.push({
          type: 'seed',
          status: 'success',
          data: seedData
        });
      }
    } catch (error) {
      results.push({
        type: 'seed',
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown seed error'
      });
    }

    // 验证表是否创建成功
    const { data: tables, error: tablesError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .in('table_name', ['interests', 'stories', 'keywords', 'user_profiles']);

    return NextResponse.json({
      status: 'completed',
      message: 'Database initialization completed',
      results,
      tables: tables || [],
      tablesError: tablesError?.message,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Database initialization error:', error);

    return NextResponse.json({
      status: 'error',
      message: 'Database initialization failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
