# SmarTalk MVP 回滚程序

## 🔄 回滚策略概述

### 回滚触发条件
- 用户激活率下降超过50%
- 系统错误率超过5%
- 关键功能完全不可用
- 数据安全问题
- 用户反馈严重负面情绪激增

### 回滚决策流程
1. **问题识别** (0-5分钟)
   - 监控告警触发
   - 用户反馈激增
   - 关键指标异常

2. **影响评估** (5-10分钟)
   - 评估问题严重程度
   - 确定影响用户范围
   - 预估修复时间

3. **回滚决策** (10-15分钟)
   - 技术负责人评估
   - 产品负责人确认
   - 启动回滚程序

## 🎯 分级回滚程序

### Level 1: 配置回滚 (最快速)
**适用场景**: 配置错误、功能开关问题
**预计时间**: 5-10分钟
**影响程度**: 最小

```bash
# 1. 回滚应用配置
git checkout HEAD~1 -- config/
npm run deploy:config

# 2. 重启相关服务
sudo systemctl restart smartalk-backend
sudo systemctl reload nginx

# 3. 验证回滚效果
curl -f http://localhost:3000/api/v1/health
```

### Level 2: 应用回滚 (中等速度)
**适用场景**: 代码bug、API问题
**预计时间**: 15-30分钟
**影响程度**: 中等

```bash
# 1. 确定回滚目标版本
git log --oneline -10
ROLLBACK_COMMIT="abc123def456"

# 2. 创建回滚分支
git checkout -b rollback-$(date +%Y%m%d-%H%M%S)
git reset --hard $ROLLBACK_COMMIT

# 3. 部署回滚版本
npm run build
npm run deploy:production

# 4. 验证服务状态
npm run test:smoke
npm run test:api
```

### Level 3: 数据库回滚 (最慢但最彻底)
**适用场景**: 数据结构问题、数据损坏
**预计时间**: 30-60分钟
**影响程度**: 最大

```bash
# 1. 停止应用服务
sudo systemctl stop smartalk-backend

# 2. 备份当前数据库状态
pg_dump -h localhost -U smartalk_user smartalk_db > /backup/emergency_backup_$(date +%Y%m%d_%H%M%S).sql

# 3. 恢复到最近的稳定备份
BACKUP_FILE="/backup/smartalk_db_stable_$(date -d '1 day ago' +%Y%m%d).sql"
psql -h localhost -U smartalk_user -d smartalk_db < $BACKUP_FILE

# 4. 重启服务并验证
sudo systemctl start smartalk-backend
npm run test:database
```

## 📋 详细回滚检查清单

### 回滚前准备 (Pre-Rollback Checklist)
- [ ] 确认回滚触发条件已满足
- [ ] 获得技术和产品负责人授权
- [ ] 通知相关团队成员
- [ ] 准备用户沟通方案
- [ ] 确认回滚目标版本
- [ ] 验证备份文件完整性

### 回滚执行步骤 (Rollback Execution)

#### 步骤1: 环境准备
```bash
# 设置回滚环境变量
export ROLLBACK_VERSION="v1.2.3"
export ROLLBACK_TIMESTAMP=$(date +%Y%m%d_%H%M%S)
export BACKUP_DIR="/backup/rollback_$ROLLBACK_TIMESTAMP"

# 创建回滚日志
mkdir -p $BACKUP_DIR
echo "Rollback started at $(date)" > $BACKUP_DIR/rollback.log
```

#### 步骤2: 当前状态备份
```bash
# 备份当前代码状态
git branch backup_before_rollback_$ROLLBACK_TIMESTAMP

# 备份当前数据库
pg_dump -h localhost -U smartalk_user smartalk_db > $BACKUP_DIR/current_db.sql

# 备份当前配置
cp -r config/ $BACKUP_DIR/config_backup/
cp -r .env* $BACKUP_DIR/
```

#### 步骤3: 执行回滚
```bash
# 应用代码回滚
git checkout $ROLLBACK_VERSION
npm install
npm run build

# 数据库回滚 (如需要)
if [ "$DB_ROLLBACK_REQUIRED" = "true" ]; then
    psql -h localhost -U smartalk_user -d smartalk_db < $BACKUP_DIR/target_db.sql
fi

# 配置回滚
cp $BACKUP_DIR/target_config/* config/
```

#### 步骤4: 服务重启
```bash
# 重启后端服务
sudo systemctl restart smartalk-backend

# 重启Web服务器
sudo systemctl reload nginx

# 清理缓存
redis-cli FLUSHALL
```

#### 步骤5: 验证回滚
```bash
# 健康检查
curl -f http://localhost:3000/api/v1/health

# 关键功能测试
npm run test:critical-path

# 数据库连接测试
psql -h localhost -U smartalk_user -d smartalk_db -c "SELECT COUNT(*) FROM users;"
```

### 回滚后验证 (Post-Rollback Verification)
- [ ] 应用服务正常启动
- [ ] 数据库连接正常
- [ ] 关键API端点响应正常
- [ ] 用户可以正常访问应用
- [ ] 核心功能流程可用
- [ ] 监控指标恢复正常
- [ ] 错误率降至可接受范围

## 🚨 紧急回滚程序

### 一键回滚脚本
```bash
#!/bin/bash
# emergency_rollback.sh - 紧急回滚脚本

set -e

ROLLBACK_VERSION=${1:-"last-stable"}
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

echo "🚨 启动紧急回滚程序..."
echo "目标版本: $ROLLBACK_VERSION"
echo "时间戳: $TIMESTAMP"

# 1. 立即停止新用户流量
echo "🛑 停止新用户流量..."
sudo nginx -s reload -c /etc/nginx/nginx.maintenance.conf

# 2. 快速代码回滚
echo "🔄 执行代码回滚..."
git stash
git checkout $ROLLBACK_VERSION
npm run build:fast

# 3. 重启关键服务
echo "🔧 重启服务..."
sudo systemctl restart smartalk-backend
sleep 10

# 4. 快速验证
echo "✅ 验证回滚..."
if curl -f http://localhost:3000/api/v1/health > /dev/null 2>&1; then
    echo "✅ 回滚成功！服务已恢复"
    # 恢复正常流量
    sudo nginx -s reload -c /etc/nginx/nginx.conf
else
    echo "❌ 回滚失败！需要手动干预"
    exit 1
fi

echo "📊 生成回滚报告..."
cat > /tmp/rollback_report_$TIMESTAMP.txt << EOF
回滚执行报告
=============
执行时间: $(date)
回滚版本: $ROLLBACK_VERSION
执行状态: 成功
服务状态: 正常
用户影响: 最小化

下一步行动:
1. 监控系统稳定性
2. 分析原问题根因
3. 制定修复计划
4. 准备重新部署
EOF

echo "🎯 回滚完成！报告已生成: /tmp/rollback_report_$TIMESTAMP.txt"
```

### 使用方法
```bash
# 回滚到上一个稳定版本
./emergency_rollback.sh

# 回滚到指定版本
./emergency_rollback.sh v1.2.3

# 回滚到指定提交
./emergency_rollback.sh abc123def456
```

## 📊 回滚后监控

### 关键指标监控
- **服务可用性**: 99.9%+
- **API响应时间**: <500ms
- **错误率**: <1%
- **用户激活率**: 恢复到回滚前水平
- **数据库性能**: 查询时间正常

### 监控脚本
```bash
#!/bin/bash
# post_rollback_monitoring.sh

echo "📊 回滚后监控开始..."

for i in {1..10}; do
    echo "检查轮次 $i/10"
    
    # 检查服务状态
    if ! curl -f http://localhost:3000/api/v1/health > /dev/null 2>&1; then
        echo "❌ 服务健康检查失败"
        exit 1
    fi
    
    # 检查响应时间
    RESPONSE_TIME=$(curl -o /dev/null -s -w '%{time_total}' http://localhost:3000/api/v1/health)
    if (( $(echo "$RESPONSE_TIME > 1.0" | bc -l) )); then
        echo "⚠️ 响应时间过长: ${RESPONSE_TIME}s"
    fi
    
    # 检查数据库连接
    if ! psql -h localhost -U smartalk_user -d smartalk_db -c "SELECT 1;" > /dev/null 2>&1; then
        echo "❌ 数据库连接失败"
        exit 1
    fi
    
    echo "✅ 检查通过"
    sleep 30
done

echo "🎉 回滚后监控完成，系统运行正常"
```

## 📞 回滚沟通模板

### 内部团队通知
```
主题: [紧急] SmarTalk MVP 系统回滚通知

团队成员，

由于 [具体问题描述]，我们已启动系统回滚程序。

回滚详情:
- 触发时间: [时间]
- 回滚版本: [版本号]
- 预计影响: [影响描述]
- 预计恢复时间: [时间]

当前状态: [进行中/已完成]

请相关团队成员待命，准备后续问题分析和修复工作。

技术负责人: [姓名]
```

### 用户沟通模板
```
SmarTalk 用户您好，

我们正在进行系统维护以优化您的学习体验。在此期间，您可能会遇到短暂的服务中断。

我们预计在 [时间] 内完成维护工作。

感谢您的耐心等待，我们会尽快恢复服务。

SmarTalk 团队
```

## 📈 回滚后改进流程

### 问题分析
1. **根因分析**: 确定导致回滚的根本原因
2. **影响评估**: 量化用户和业务影响
3. **流程检讨**: 识别预防和响应流程的改进点

### 预防措施
1. **增强测试**: 加强自动化测试覆盖
2. **监控优化**: 改进告警和监控系统
3. **发布流程**: 优化发布和部署流程
4. **团队培训**: 提升团队应急响应能力

### 文档更新
- 更新回滚程序文档
- 完善监控告警规则
- 优化应急响应流程
- 加强团队培训材料

---

**重要提醒**:
1. 回滚是最后手段，优先考虑快速修复
2. 回滚决策需要技术和产品负责人共同确认
3. 执行回滚时必须严格按照检查清单操作
4. 回滚后必须进行全面的问题分析和流程改进