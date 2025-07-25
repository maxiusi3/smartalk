# SmarTalk MVP 运维操作指南

## 📋 日常运维程序

### 每日检查清单 (Daily Operations Checklist)

#### 上午检查 (9:00 AM)
- [ ] 检查系统整体健康状态
- [ ] 查看过夜错误日志和告警
- [ ] 验证关键服务可用性
- [ ] 检查数据库性能指标
- [ ] 查看CDN缓存命中率
- [ ] 确认备份任务执行状态

#### 下午检查 (2:00 PM)
- [ ] 监控实时用户活跃度
- [ ] 检查API响应时间趋势
- [ ] 查看转化漏斗实时数据
- [ ] 分析用户反馈新增情况
- [ ] 检查服务器资源使用率

#### 晚间检查 (6:00 PM)
- [ ] 生成当日指标报告
- [ ] 检查异常用户行为模式
- [ ] 确认自动化任务调度正常
- [ ] 准备次日容量规划
- [ ] 更新运维日志

### 每周运维任务 (Weekly Tasks)

#### 周一：系统维护
- [ ] 检查系统更新和安全补丁
- [ ] 清理过期日志和临时文件
- [ ] 验证备份恢复流程
- [ ] 更新监控告警规则

#### 周三：性能优化
- [ ] 分析数据库查询性能
- [ ] 检查CDN缓存策略效果
- [ ] 优化API响应时间
- [ ] 分析移动应用性能数据

#### 周五：数据分析
- [ ] 生成周度指标报告
- [ ] 分析用户行为趋势
- [ ] 评估功能使用情况
- [ ] 准备产品团队周报

## 🔧 系统监控指南

### 关键监控指标

#### 系统性能指标
```bash
# CPU使用率监控
top -p $(pgrep -f "smartalk")

# 内存使用情况
free -h && ps aux --sort=-%mem | head -10

# 磁盘空间检查
df -h && du -sh /var/log/* | sort -hr

# 网络连接状态
netstat -tuln | grep :3000
```

#### 应用性能指标
```bash
# API响应时间检查
curl -w "@curl-format.txt" -o /dev/null -s "http://localhost:3000/api/v1/health"

# 数据库连接测试
psql -h localhost -U smartalk_user -d smartalk_db -c "SELECT 1;"

# Redis缓存状态
redis-cli ping && redis-cli info memory
```

#### 业务指标监控
- **实时用户数**: 当前活跃用户数量
- **激活率**: 每小时新用户激活情况
- **错误率**: API错误请求比例
- **响应时间**: 关键接口平均响应时间

### 告警配置

#### 紧急告警 (立即响应)
- 系统宕机或服务不可用
- 数据库连接失败
- API错误率 > 5%
- 用户激活率下降 > 50%

#### 警告告警 (1小时内响应)
- CPU使用率 > 80%
- 内存使用率 > 85%
- 磁盘空间 < 20%
- API响应时间 > 1秒

#### 信息告警 (4小时内响应)
- 用户反馈负面情绪增加
- 转化漏斗某环节下降 > 20%
- CDN缓存命中率 < 90%

## 🚨 故障排除指南

### 常见问题诊断

#### 问题1: 应用无法启动
**症状**: 用户无法访问应用，服务器返回502/503错误

**诊断步骤**:
```bash
# 1. 检查应用进程状态
ps aux | grep smartalk
systemctl status smartalk-backend

# 2. 查看应用日志
tail -f /var/log/smartalk/application.log
journalctl -u smartalk-backend -f

# 3. 检查端口占用
netstat -tuln | grep :3000
lsof -i :3000
```

**解决方案**:
```bash
# 重启应用服务
sudo systemctl restart smartalk-backend

# 如果端口被占用
sudo kill -9 $(lsof -t -i:3000)
sudo systemctl start smartalk-backend

# 检查配置文件
sudo nginx -t
sudo systemctl reload nginx
```

#### 问题2: 数据库连接失败
**症状**: API返回数据库连接错误，用户数据无法保存

**诊断步骤**:
```bash
# 1. 检查PostgreSQL服务状态
sudo systemctl status postgresql
sudo -u postgres psql -c "SELECT version();"

# 2. 检查数据库连接
psql -h localhost -U smartalk_user -d smartalk_db -c "\dt"

# 3. 查看数据库日志
sudo tail -f /var/log/postgresql/postgresql-*.log
```

**解决方案**:
```bash
# 重启PostgreSQL服务
sudo systemctl restart postgresql

# 检查连接配置
sudo -u postgres psql -c "SELECT * FROM pg_stat_activity;"

# 重置连接池
# 在应用配置中重启连接池或重启应用
```

#### 问题3: 视频加载缓慢
**症状**: 用户反馈视频加载时间过长，影响学习体验

**诊断步骤**:
```bash
# 1. 检查CDN状态
curl -I https://cdn.smartalk.com/videos/sample.mp4

# 2. 测试网络延迟
ping cdn.smartalk.com
traceroute cdn.smartalk.com

# 3. 检查服务器带宽
iftop -i eth0
```

**解决方案**:
```bash
# 清理CDN缓存
curl -X PURGE https://cdn.smartalk.com/videos/*

# 检查视频文件大小和格式
ls -lh /var/www/smartalk/videos/
ffprobe video_file.mp4

# 优化视频压缩设置
ffmpeg -i input.mp4 -c:v libx264 -crf 23 -preset medium output.mp4
```

#### 问题4: 用户激活率突然下降
**症状**: 监控显示用户激活率从40%下降到20%

**诊断步骤**:
```bash
# 1. 检查转化漏斗各环节
# 查看LaunchMetricsTracker数据
node -e "
const tracker = require('./services/LaunchMetricsTracker').LaunchMetricsTracker.getInstance();
console.log(tracker.getMetricsReport());
"

# 2. 分析用户反馈
# 查看LaunchFeedbackCollector数据
node -e "
const collector = require('./services/LaunchFeedbackCollector').LaunchFeedbackCollector.getInstance();
console.log(collector.generateFeedbackReport());
"
```

**解决方案**:
1. 分析具体下降环节
2. 检查是否有新的bug引入
3. 查看用户反馈中的负面情绪
4. 必要时回滚到稳定版本

### 性能优化指南

#### 数据库优化
```sql
-- 检查慢查询
SELECT query, mean_time, calls 
FROM pg_stat_statements 
ORDER BY mean_time DESC 
LIMIT 10;

-- 分析表大小
SELECT schemaname,tablename,attname,n_distinct,correlation 
FROM pg_stats 
WHERE tablename = 'analytics_events';

-- 优化索引
CREATE INDEX CONCURRENTLY idx_analytics_events_timestamp 
ON analytics_events(timestamp);
```

#### 应用性能优化
```javascript
// 启用响应压缩
app.use(compression());

// 设置适当的缓存头
app.use('/api', (req, res, next) => {
  res.set('Cache-Control', 'public, max-age=300');
  next();
});

// 连接池优化
const pool = new Pool({
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});
```

## 📊 监控仪表板设置

### Grafana仪表板配置

#### 系统监控面板
```json
{
  "dashboard": {
    "title": "SmarTalk System Monitoring",
    "panels": [
      {
        "title": "API Response Time",
        "type": "graph",
        "targets": [
          {
            "expr": "avg(http_request_duration_seconds)",
            "legendFormat": "Average Response Time"
          }
        ]
      },
      {
        "title": "User Activation Rate",
        "type": "stat",
        "targets": [
          {
            "expr": "rate(user_activated_total[5m]) * 100",
            "legendFormat": "Activation Rate %"
          }
        ]
      }
    ]
  }
}
```

#### 业务指标面板
- 实时用户数
- 转化漏斗可视化
- 用户反馈情绪分析
- 错误率趋势图

### 告警规则配置

#### Prometheus告警规则
```yaml
groups:
  - name: smartalk_alerts
    rules:
      - alert: HighErrorRate
        expr: rate(http_requests_total{status=~"5.."}[5m]) > 0.05
        for: 2m
        labels:
          severity: critical
        annotations:
          summary: "High error rate detected"
          
      - alert: LowActivationRate
        expr: rate(user_activated_total[1h]) < 0.4
        for: 10m
        labels:
          severity: warning
        annotations:
          summary: "User activation rate below target"
```

## 📞 应急联系流程

### 故障升级流程
1. **L1 - 运维工程师** (0-15分钟)
   - 初步诊断和常规修复
   - 联系方式: [运维值班电话]

2. **L2 - 高级工程师** (15-30分钟)
   - 复杂问题诊断和修复
   - 联系方式: [技术负责人电话]

3. **L3 - 架构师/CTO** (30分钟+)
   - 架构级问题和重大决策
   - 联系方式: [CTO电话]

### 外部服务联系方式
- **云服务商**: [AWS/阿里云客服]
- **CDN服务商**: [CDN技术支持]
- **数据库服务**: [RDS技术支持]

---

**使用说明**:
1. 严格按照检查清单执行日常运维
2. 遇到问题时按故障排除指南逐步诊断
3. 紧急情况立即启动应急联系流程
4. 定期更新和完善操作指南