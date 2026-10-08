const state = {
  route: window.location.hash.slice(1) || 'dashboard',
  metric: 'spo2',
  range: '7d',
};

const navItems = [
  ['dashboard', '工作台', '⌂'],
  ['patients', '患者管理', '♧'],
  ['questionnaire-design', '问卷设计', '▤'],
  ['questionnaire-fill', '问卷填写', '✓'],
  ['followups', '随访', '↻'],
  ['ring-monitoring', '指环监测', '◉'],
  ['reminders', '提醒事项', '☷'],
  ['alerts', '风险与异常', '⚠'],
  ['admin', '管理', '◇'],
  ['updates', '更新内容', '↗'],
];

const metrics = [
  { key: 'spo2', label: '血氧饱和度', value: '96', change: '+1.8%', unit: '%', color: '#0f766e' },
  { key: 'heart', label: '心率', value: '78', change: '−2.4%', unit: 'bpm', color: '#2563eb' },
  { key: 'resp', label: '呼吸频率', value: '17', change: '+0.6%', unit: '次/分', color: '#b7791f' },
  { key: 'hrv', label: '心率变异性', value: '42', change: '+4.2%', unit: 'ms', color: '#7c3aed' },
];

const patients = [
  { code: 'PT-001', center: '东城研究中心', status: '观察中', ring: '已绑定', update: '今天 09:40', risk: '需核实' },
  { code: 'PT-002', center: '滨江协作中心', status: '待首次随访', ring: '已绑定', update: '今天 08:20', risk: '稳定' },
  { code: 'PT-003', center: '北苑社区中心', status: '观察中', ring: '待绑定', update: '昨天 17:10', risk: '数据不足' },
  { code: 'PT-004', center: '西湖研究中心', status: '已完成基线', ring: '已绑定', update: '昨天 15:30', risk: '稳定' },
];

const reminders = [
  { tone: 'warn', title: '血氧波动，需核实', patient: 'PT-001', time: '今天 09:40', detail: '最近窗口出现 2 个偏低观测点', type: '风险提示' },
  { tone: 'info', title: '首次随访进入当前窗口', patient: 'PT-002', time: '今天', detail: '建议在窗口内完成随访记录', type: '随访任务' },
  { tone: 'muted', title: '采样覆盖率不足', patient: 'PT-003', time: '昨天 17:10', detail: '当前有效数据不足以判断趋势', type: '数据质量' },
];

const alerts = [
  { severity: '中', title: '血氧偏低，需核实', patient: 'PT-001', value: '89%', threshold: '<90%', time: '今天 09:40', status: '待确认' },
  { severity: '提示', title: '采样覆盖率不足', patient: 'PT-003', value: '62%', threshold: '≥80%', time: '昨天 17:10', status: '活动' },
];

const followups = [
  { patient: 'PT-002', window: '10 月 08 日—10 月 14 日', type: '首次随访', status: '当前窗口', owner: '研究协调员' },
  { patient: 'PT-004', window: '10 月 06 日—10 月 12 日', type: '随访记录', status: '待安排', owner: '随访团队' },
  { patient: 'PT-001', window: '10 月 01 日—10 月 07 日', type: '结果复核', status: '已完成', owner: '质控员' },
];

const updates = [
  { date: '2026-10-08', title: '提醒事项与协同展示', text: '风险、随访、转诊和数据质量事项统一进入工作区。' },
  { date: '2026-10-04', title: '趋势统计参考', text: '支持 24 小时、7 天和 1 个月窗口的均值与波动对比。' },
  { date: '2026-09-19', title: '指环趋势时间轴', text: '趋势图支持真实时间轴、断档提示和细节缩放。' },
];

function icon(name) {
  return `<span class="navIcon" aria-hidden="true">${name}</span>`;
}

function appShell(content, active = state.route) {
  return `<div class="platformShell">
    <aside class="platformSidebar">
      <div class="platformBrand"><div class="platformBrandMark">✚</div><div><strong>COPD EDC</strong><span>课题数据采集平台</span></div></div>
      <div class="platformNavTitle">数据工作区</div>
      <nav class="platformNav">${navItems.map(([key, label, symbol]) => `<a class="platformNavItem ${active === key ? 'active' : ''}" href="#${key}">${icon(symbol)}<span>${label}</span>${key === 'reminders' ? '<b class="platformBadge">3</b>' : ''}</a>`).join('')}</nav>
    </aside>
    <main class="platformMain">
      <header class="platformTopbar"><div><span class="platformKicker">COPD · MULTI-CENTER RESEARCH</span><h1>${navItems.find(([key]) => key === active)?.[1] || '患者详情'}</h1></div><div class="platformUser"><span class="platformAvatar">研</span><div><strong>研究协调员</strong><small>东城研究中心 · 课题组</small></div><button class="platformGhost" type="button">退出</button></div></header>
      ${content}
    </main>
  </div>`;
}

function chartPoints(metric = state.metric) {
  const bases = { spo2: [95, 96, 96, 94, 97, 96, 96, 95, 97, 96, 96, 97], heart: [81, 78, 80, 76, 79, 77, 75, 78, 80, 77, 76, 78], resp: [17, 18, 16, 17, 18, 17, 16, 17, 16, 18, 17, 17], hrv: [38, 42, 40, 44, 41, 39, 43, 45, 42, 44, 41, 42] };
  const values = bases[metric] || bases.spo2;
  const min = Math.min(...values);
  return values.map((value, index) => ({ value, x: 24 + index * 42, y: 132 - (value - min + 1) * 13 }));
}

function chartSvg() {
  const points = chartPoints();
  const line = points.map((point) => `${point.x},${point.y}`).join(' ');
  const metric = metrics.find((item) => item.key === state.metric) || metrics[0];
  return `<svg class="platformChart" viewBox="0 0 520 170" role="img" aria-label="${metric.label}最近七天趋势"><defs><linearGradient id="trendFill" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="${metric.color}" stop-opacity=".22"/><stop offset="1" stop-color="${metric.color}" stop-opacity="0"/></linearGradient></defs><path fill="url(#trendFill)" d="M ${points[0].x} 150 L ${line.replaceAll(' ', ' L ')} L ${points.at(-1).x} 150 Z"></path><polyline fill="none" stroke="${metric.color}" stroke-width="3" stroke-linejoin="round" stroke-linecap="round" points="${line}"></polyline>${points.map((point) => `<circle cx="${point.x}" cy="${point.y}" r="3.5" fill="${metric.color}"></circle>`).join('')}<g class="platformChartAxis"><text x="24" y="164">10/02</text><text x="232" y="164">10/05</text><text x="440" y="164">10/08</text><text x="8" y="28">${metric.value}</text></g></svg>`;
}

function metricCards() {
  return `<div class="platformMetricGrid">${metrics.map((metric) => `<button class="platformMetricCard ${state.metric === metric.key ? 'selected' : ''}" data-metric="${metric.key}"><span class="metricDot" style="background:${metric.color}"></span><span>${metric.label}</span><strong>${metric.value}<small>${metric.unit}</small></strong><em>${metric.change}</em></button>`).join('')}</div>`;
}

function dashboardPage() {
  return appShell(`<section class="platformStack"><div class="platformWelcome"><div><span class="platformEyebrow">课题采集工作台</span><h2>患者入组、量表、随访与指环数据集中管理。</h2><p>从研究队列到数据质量，当前工作进度一目了然。</p></div><div class="platformWelcomeMark">COPD<br><small>EDC</small></div></div><div class="platformStatGrid">${[['总入组', '52', '本周 +4'], ['已完成基线', '38', '完成率 73%'], ['有效随访', '31', '本周 +6'], ['已绑定指环', '29', '数据持续更新']].map(([label, value, note]) => `<article class="platformStat"><span>${label}</span><strong>${value}</strong><small>${note}</small></article>`).join('')}</div><div class="platformTwoCol"><section class="platformPanel"><div class="platformPanelHead"><div><span class="platformEyebrow">Monitoring snapshot</span><h2>随访与指环运行概览</h2></div><a href="#ring-monitoring">查看详情 →</a></div>${metricCards()}</section><section class="platformPanel"><div class="platformPanelHead"><div><span class="platformEyebrow">Open items</span><h2>待处理事项</h2></div><a href="#reminders">查看全部 →</a></div><div class="platformMiniList">${reminders.map((item) => `<a href="#reminders"><i class="tone ${item.tone}"></i><span><strong>${item.title}</strong><small>${item.patient} · ${item.time}</small></span><b>›</b></a>`).join('')}</div></section></div><section class="platformPanel platformReadiness"><div><span class="platformEyebrow">Study readiness</span><h2>研究准备度</h2><p>从入组到数据完整，关键环节清晰可见。</p></div><div class="platformProgress">${[['基线问卷', 73], ['首次随访', 60], ['指环绑定', 56], ['数据完整', 48]].map(([label, value]) => `<div><span>${label}</span><strong>${value}%</strong><i><em style="width:${value}%"></em></i></div>`).join('')}</div></section></section>`, 'dashboard');
}

function patientsPage() {
  return appShell(`<section class="platformStack"><div class="platformPageIntro"><div><span class="platformEyebrow">Patient registry</span><h2>患者管理</h2><p>患者入组、基线、随访和指环状态集中查看。</p></div><button type="button">＋ 新增患者</button></div><section class="platformPanel"><div class="platformFilter"><label>搜索患者<input placeholder="输入研究编号" /></label><label>所属中心<select><option>全部中心</option><option>东城研究中心</option><option>滨江协作中心</option></select></label><span>52 位患者</span></div><div class="platformTableWrap"><table><thead><tr><th>研究编号</th><th>所属中心</th><th>流程状态</th><th>指环状态</th><th>最近更新</th><th>风险提示</th></tr></thead><tbody>${patients.map((patient) => `<tr><td><a class="platformCode" href="#patient-detail"><strong>${patient.code}</strong></a></td><td>${patient.center}</td><td><span class="platformStatus neutral">${patient.status}</span></td><td>${patient.ring}</td><td>${patient.update}</td><td><span class="platformStatus ${patient.risk === '需核实' ? 'warn' : patient.risk === '稳定' ? 'ok' : 'neutral'}">${patient.risk}</span></td></tr>`).join('')}</tbody></table></div></section></section>`, 'patients');
}

function patientDetailPage() {
  const patient = patients[0];
  return appShell(`<section class="platformStack"><div class="platformPageIntro"><div><span class="platformEyebrow">Patient detail</span><h2>${patient.code}</h2><p>${patient.center} · ${patient.status} · ${patient.ring}</p></div><a class="platformGhostLink" href="#patients">← 返回患者管理</a></div><section class="platformDetailGrid"><article class="platformPanel"><span class="platformEyebrow">Overview</span><h2>观察中</h2><p>最近更新 ${patient.update}</p><div class="platformTags"><span class="platformStatus warn">需核实</span><span class="platformStatus ok">数据持续更新</span></div></article><article class="platformPanel"><span class="platformEyebrow">Current vitals</span>${metricCards()}</article></section><section class="platformPanel"><div class="platformPanelHead"><div><span class="platformEyebrow">Risk and reminders</span><h2>风险与异常</h2></div><a href="#alerts">查看风险队列 →</a></div><div class="platformAlertRow"><i class="tone warn"></i><div><strong>血氧波动，需核实</strong><p>最近窗口出现 2 个偏低观测点，建议人工复核。</p><small>观测值 89% · 阈值 &lt;90% · 今天 09:40</small></div><span class="platformStatus warn">活动</span></div></section><section class="platformPanel"><div class="platformPanelHead"><div><span class="platformEyebrow">Ring monitoring</span><h2>监测趋势</h2></div><a href="#ring-monitoring">打开完整趋势 →</a></div><div class="platformChartFrame">${chartSvg()}</div><div class="platformChartFoot">最近 7 天 · 采样间隔中位数 10 分钟</div></section></section>`, 'patients');
}

function questionnaireDesignPage() {
  const forms = [['基线临床调查', '已发布', '24 个字段', '用于确认入组前的基础资料'], ['CAT 量表', '已发布', '8 道题', '固定量表与自动计分'], ['首次随访评估', '草稿', '18 个字段', '随访窗口内填写']];
  return appShell(`<section class="platformStack"><div class="platformPageIntro"><div><span class="platformEyebrow">Questionnaire library</span><h2>问卷设计</h2><p>管理研究量表、填写阶段和版本状态。</p></div><button type="button">＋ 新建问卷</button></div><section class="platformPanel"><div class="platformPanelHead"><div><span class="platformEyebrow">Published forms</span><h2>问卷库</h2></div><span class="platformCount">3 份问卷</span></div><div class="formCardGrid">${forms.map(([title, status, fields, desc]) => `<article class="formCard"><div class="formCardTop"><span class="formIcon">▤</span><span class="platformStatus ${status === '草稿' ? 'neutral' : 'ok'}">${status}</span></div><h3>${title}</h3><p>${desc}</p><footer><span>${fields}</span><button class="platformGhost" type="button">查看结构</button></footer></article>`).join('')}</div></section></section>`, 'questionnaire-design');
}

function questionnaireFillPage() {
  return appShell(`<section class="platformStack"><div class="platformPageIntro"><div><span class="platformEyebrow">Response workspace</span><h2>问卷填写</h2><p>选择患者和填报阶段，继续完成已发布量表。</p></div><span class="platformCount">待填写 6 份</span></div><section class="platformDetailGrid"><section class="platformPanel"><div class="platformPanelHead"><div><span class="platformEyebrow">Patient</span><h2>选择患者</h2></div></div><label class="platformField">患者<select><option>PT-001 · 东城研究中心</option><option>PT-002 · 滨江协作中心</option><option>PT-004 · 西湖研究中心</option></select></label><div class="formStageRow"><button type="button">基线评估</button><button type="button" class="platformGhost">首次随访</button></div></section><section class="platformPanel"><div class="platformPanelHead"><div><span class="platformEyebrow">Current batch</span><h2>当前填报批次</h2></div><span class="platformStatus warn">待完善</span></div><div class="batchProgress"><strong>3 / 5</strong><span>已完成量表</span><i><em style="width:60%"></em></i></div><ul class="checkList"><li><span>基线临床调查</span><b class="platformStatus ok">已提交</b></li><li><span>CAT 量表</span><b class="platformStatus ok">已提交</b></li><li><span>mMRC 量表</span><b class="platformStatus warn">待完善</b></li><li><span>用药与生活方式</span><b class="platformStatus neutral">未开始</b></li></ul><button type="button">继续填写</button></section></section></section>`, 'questionnaire-fill');
}

function followupsPage() {
  return appShell(`<section class="platformStack"><div class="platformPageIntro"><div><span class="platformEyebrow">Follow-up workflow</span><h2>随访</h2><p>按随访窗口管理待安排、临近和待复核事项。</p></div><button type="button">＋ 增加随访</button></div><div class="attentionGrid">${[['待安排', '4'], ['临近随访', '2'], ['当前窗口', '3'], ['待复核', '1']].map(([label, value]) => `<article><span>${label}</span><strong>${value}</strong><small>当前队列</small></article>`).join('')}</div><section class="platformPanel"><div class="platformPanelHead"><div><span class="platformEyebrow">Follow-up queue</span><h2>随访任务</h2></div><span class="platformCount">${followups.length} 项</span></div><div class="platformTableWrap"><table><thead><tr><th>患者</th><th>随访窗口</th><th>类型</th><th>状态</th><th>负责人</th><th>操作</th></tr></thead><tbody>${followups.map((item) => `<tr><td><a class="platformCode" href="#patient-detail">${item.patient}</a></td><td>${item.window}</td><td>${item.type}</td><td><span class="platformStatus ${item.status === '当前窗口' ? 'warn' : item.status === '已完成' ? 'ok' : 'neutral'}">${item.status}</span></td><td>${item.owner}</td><td><button class="platformGhost" type="button">查看</button></td></tr>`).join('')}</tbody></table></div></section></section>`, 'followups');
}

function ringMonitoringPage() {
  return appShell(`<section class="platformStack"><div class="platformPageIntro"><div><span class="platformEyebrow">Ring monitoring</span><h2>指环监测</h2><p>查看绑定状态、同步任务和患者体征趋势。</p></div><button type="button">＋ 新建同步任务</button></div><div class="attentionGrid ringStats">${[['已绑定设备', '29'], ['今日更新', '26'], ['待处理任务', '2'], ['数据完整', '86%']].map(([label, value]) => `<article><span>${label}</span><strong>${value}</strong><small>当前工作区</small></article>`).join('')}</div><section class="platformPanel"><div class="platformPanelHead"><div><span class="platformEyebrow">Device activity</span><h2>最近同步任务</h2></div><span class="platformCount">最近 3 条</span></div><div class="platformTableWrap"><table><thead><tr><th>任务</th><th>患者</th><th>时间范围</th><th>状态</th><th>记录数</th><th>操作</th></tr></thead><tbody><tr><td>同步任务 #203</td><td><a class="platformCode" href="#patient-detail">PT-001</a></td><td>10 月 01 日—10 月 08 日</td><td><span class="platformStatus ok">已完成</span></td><td>1,008</td><td><button class="platformGhost" type="button">查看</button></td></tr><tr><td>同步任务 #202</td><td><a class="platformCode" href="#patient-detail">PT-002</a></td><td>10 月 01 日—10 月 08 日</td><td><span class="platformStatus warn">待复核</span></td><td>842</td><td><button class="platformGhost" type="button">查看</button></td></tr><tr><td>同步任务 #201</td><td><a class="platformCode" href="#patient-detail">PT-004</a></td><td>09 月 24 日—10 月 01 日</td><td><span class="platformStatus ok">已完成</span></td><td>936</td><td><button class="platformGhost" type="button">查看</button></td></tr></tbody></table></div></section><section class="platformPanel"><div class="platformPanelHead"><div><span class="platformEyebrow">Trend overview</span><h2>PT-001 体征趋势</h2></div><a href="#trends">查看详情 →</a></div>${metricCards()}</section></section>`, 'ring-monitoring');
}

function trendsPage() {
  const selected = metrics.find((metric) => metric.key === state.metric) || metrics[0];
  return appShell(`<section class="platformStack"><div class="platformPageIntro"><div><span class="platformEyebrow">Patient monitoring</span><h2>指环趋势</h2><p>按真实时间窗口查看 PT-001 的体征变化。</p></div><span class="platformPill">PT-001 · ${selected.label}</span></div>${metricCards()}<section class="platformPanel"><div class="platformPanelHead"><div><span class="platformEyebrow">${selected.label}</span><h2>最近 ${state.range === '24h' ? '24 小时' : state.range === '30d' ? '30 天' : '7 天'}趋势</h2></div><div class="rangeTabs">${[['24h', '24小时'], ['7d', '7天'], ['30d', '30天']].map(([key, label]) => `<button class="${state.range === key ? 'active' : ''}" data-range="${key}">${label}</button>`).join('')}</div></div><div class="trendMeta"><span><i style="background:${selected.color}"></i>${selected.label}</span><span>采样间隔中位数 10 分钟</span><span>当前均值 <b>${selected.value} ${selected.unit}</b></span></div><div class="platformChartFrame">${chartSvg()}</div><div class="platformChartFoot"><span>10 月 02 日</span><span>10 月 05 日</span><span>10 月 08 日</span></div></section><div class="platformStatStrip">${[['当前均值', `${selected.value} ${selected.unit}`], ['前置基线', selected.key === 'spo2' ? '94%' : selected.key === 'heart' ? '80 bpm' : selected.key === 'resp' ? '17 次/分' : '40 ms'], ['波动幅度', selected.key === 'spo2' ? '4 个百分点' : selected.key === 'heart' ? '12 bpm' : selected.key === 'resp' ? '5 次/分' : '11 ms'], ['有效点数', '1,008']].map(([label, value]) => `<div><span>${label}</span><strong>${value}</strong></div>`).join('')}</div></section>`, 'trends');
}

function remindersPage() {
  return appShell(`<section class="platformStack"><div class="platformPageIntro"><div><span class="platformEyebrow">Reminder queue</span><h2>提醒事项</h2><p>风险、随访和数据质量事项集中展示。</p></div><button class="platformGhost" type="button">刷新队列</button></div><div class="attentionGrid">${[['全部事项', '3'], ['风险预警', '1'], ['随访事项', '1'], ['数据质量', '1']].map(([label, value]) => `<article><span>${label}</span><strong>${value}</strong><small>当前队列</small></article>`).join('')}</div><section class="platformPanel"><div class="platformPanelHead"><div><span class="platformEyebrow">Open items</span><h2>最近提醒</h2></div><span class="platformCount">3 条待处理</span></div><div class="platformReminderList">${reminders.map((item) => `<article><i class="tone ${item.tone}"></i><div><strong>${item.title}</strong><p>${item.detail}</p><small>${item.patient} · ${item.time} · ${item.type}</small></div><button class="platformGhost" type="button">查看 →</button></article>`).join('')}</div></section></section>`, 'reminders');
}

function alertsPage() {
  return appShell(`<section class="platformStack"><div class="platformPageIntro"><div><span class="platformEyebrow">Risk queue</span><h2>风险与异常</h2><p>集中查看体征提示和数据质量异常。</p></div><button class="platformGhost" type="button">刷新</button></div><div class="attentionGrid">${[['活动提醒', '2'], ['需确认', '1'], ['已分派', '1'], ['数据质量', '1']].map(([label, value]) => `<article><span>${label}</span><strong>${value}</strong><small>当前队列</small></article>`).join('')}</div><section class="platformPanel"><div class="platformPanelHead"><div><span class="platformEyebrow">Alert queue</span><h2>活动提醒</h2></div><span class="platformCount">${alerts.length} 条</span></div><div class="platformTableWrap"><table><thead><tr><th>患者</th><th>提醒类型</th><th>严重级别</th><th>观测值</th><th>阈值</th><th>观测时间</th><th>状态</th></tr></thead><tbody>${alerts.map((item) => `<tr><td><a class="platformCode" href="#patient-detail">${item.patient}</a></td><td>${item.title}</td><td><span class="platformStatus ${item.severity === '中' ? 'warn' : 'neutral'}">${item.severity}</span></td><td>${item.value}</td><td>${item.threshold}</td><td>${item.time}</td><td><span class="platformStatus warn">${item.status}</span></td></tr>`).join('')}</tbody></table></div></section></section>`, 'alerts');
}

function adminPage() {
  return appShell(`<section class="platformStack"><div class="platformPageIntro"><div><span class="platformEyebrow">Workspace settings</span><h2>管理</h2><p>查看研究中心、人员角色和工作区状态。</p></div><button type="button">＋ 新增人员</button></div><div class="platformDetailGrid"><section class="platformPanel"><div class="platformPanelHead"><div><span class="platformEyebrow">Centers</span><h2>研究中心</h2></div><span class="platformCount">4 个中心</span></div><ul class="adminList"><li><span>东城研究中心</span><b>18 人员 · 24 患者</b></li><li><span>滨江协作中心</span><b>12 人员 · 16 患者</b></li><li><span>北苑社区中心</span><b>8 人员 · 7 患者</b></li><li><span>西湖研究中心</span><b>6 人员 · 5 患者</b></li></ul></section><section class="platformPanel"><div class="platformPanelHead"><div><span class="platformEyebrow">Roles</span><h2>人员与角色</h2></div><span class="platformCount">6 个账号</span></div><ul class="adminList"><li><span>研究协调员</span><b>患者管理 · 随访</b></li><li><span>质控员</span><b>风险队列 · 数据复核</b></li><li><span>中心管理员</span><b>中心范围管理</b></li><li><span>课题负责人</span><b>全局查看</b></li></ul></section></div></section>`, 'admin');
}

function updatesPage() {
  return appShell(`<section class="platformStack"><div class="platformPageIntro"><div><span class="platformEyebrow">Release notes</span><h2>更新内容</h2><p>按上线时间查看平台功能变化。</p></div><span class="platformPill">${updates.length} 条</span></div><section class="platformPanel platformTimeline">${updates.map((item, index) => `<article><div class="timelineDot ${index === 0 ? 'current' : ''}"></div><div><time>${item.date}</time><h3>${item.title}</h3><p>${item.text}</p></div></article>`).join('')}</section></section>`, 'updates');
}

function render() {
  const pages = { dashboard: dashboardPage, patients: patientsPage, 'patient-detail': patientDetailPage, 'questionnaire-design': questionnaireDesignPage, 'questionnaire-fill': questionnaireFillPage, followups: followupsPage, 'ring-monitoring': ringMonitoringPage, trends: trendsPage, reminders: remindersPage, alerts: alertsPage, admin: adminPage, updates: updatesPage };
  document.querySelector('#app').innerHTML = (pages[state.route] || dashboardPage)();
  document.querySelectorAll('[data-metric]').forEach((button) => button.addEventListener('click', () => { state.metric = button.dataset.metric; state.route = 'trends'; window.location.hash = 'trends'; render(); }));
  document.querySelectorAll('[data-range]').forEach((button) => button.addEventListener('click', () => { state.range = button.dataset.range; render(); }));
}

window.addEventListener('hashchange', () => { state.route = window.location.hash.slice(1) || 'dashboard'; render(); });
render();
