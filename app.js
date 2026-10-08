const state = {
  route: window.location.hash.slice(1) || 'overview',
  metric: 'spo2',
  range: '7d',
};

const metrics = [
  { key: 'spo2', label: '血氧饱和度', value: '96%', change: '+1.8%', unit: '%', color: '#0f766e', note: '较前置窗口稳定' },
  { key: 'heart', label: '心率', value: '78', change: '−2.4%', unit: 'bpm', color: '#2563eb', note: '处于个人观察范围' },
  { key: 'resp', label: '呼吸频率', value: '17', change: '+0.6%', unit: '次/分', color: '#b7791f', note: '近期波动较小' },
  { key: 'hrv', label: '心率变异性', value: '42', change: '+4.2%', unit: 'ms', color: '#7c3aed', note: '有效点 1,008 个' },
];

const patients = [
  { code: '示例-001', center: '示例研究中心', status: '观察中', ring: '已绑定', update: '今天 09:40', risk: '需核实' },
  { code: '示例-002', center: '城市社区中心', status: '待首次随访', ring: '已绑定', update: '今天 08:20', risk: '稳定' },
  { code: '示例-003', center: '示例研究中心', status: '观察中', ring: '待绑定', update: '昨天 17:10', risk: '数据不足' },
  { code: '示例-004', center: '基层协作中心', status: '已完成基线', ring: '已绑定', update: '昨天 15:30', risk: '稳定' },
];

const reminders = [
  { tone: 'warn', title: '血氧波动，需核实', patient: '示例-001', time: '今天 09:40', detail: '最近窗口出现 2 个偏低观测点' },
  { tone: 'info', title: '首次随访进入当前窗口', patient: '示例-002', time: '今天', detail: '请在窗口内完成随访记录' },
  { tone: 'muted', title: '采样覆盖率不足', patient: '示例-003', time: '昨天 17:10', detail: '当前窗口有效数据不足以判断趋势' },
];

const updates = [
  { date: '2026-10-08', title: '提醒事项与上下级协同展示', text: '新增风险、随访、转诊和数据质量事项的统一查看入口。' },
  { date: '2026-10-04', title: '趋势统计参考', text: '支持 24 小时、7 天和 1 个月窗口的均值与波动对比。' },
  { date: '2026-09-19', title: '指环趋势时间轴', text: '趋势图支持真实时间轴、断档提示和细节缩放。' },
];

function chartPoints(metric = state.metric) {
  const bases = { spo2: [95, 96, 96, 94, 97, 96, 96, 95, 97, 96, 96, 97], heart: [81, 78, 80, 76, 79, 77, 75, 78, 80, 77, 76, 78], resp: [17, 18, 16, 17, 18, 17, 16, 17, 16, 18, 17, 17], hrv: [38, 42, 40, 44, 41, 39, 43, 45, 42, 44, 41, 42] };
  return bases[metric].map((value, index) => ({ value, x: 24 + index * 42, y: 132 - (value - Math.min(...bases[metric]) + 1) * 13 }));
}

function chartSvg() {
  const points = chartPoints();
  const line = points.map((point) => `${point.x},${point.y}`).join(' ');
  const metric = metrics.find((item) => item.key === state.metric) || metrics[0];
  return `<svg class="trendSvg" viewBox="0 0 520 170" role="img" aria-label="${metric.label}最近七天趋势">
    <defs><linearGradient id="trendFill" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="${metric.color}" stop-opacity=".22"/><stop offset="1" stop-color="${metric.color}" stop-opacity="0"/></linearGradient></defs>
    <path class="trendArea" fill="url(#trendFill)" d="M ${points[0].x} 150 L ${line.replaceAll(' ', ' L ')} L ${points.at(-1).x} 150 Z"></path>
    <polyline class="trendLine" stroke="${metric.color}" points="${line}"></polyline>
    ${points.map((point) => `<circle cx="${point.x}" cy="${point.y}" r="3.5" fill="${metric.color}"></circle>`).join('')}
    <g class="trendAxis"><text x="24" y="164">10/02</text><text x="232" y="164">10/05</text><text x="440" y="164">10/08</text><text x="8" y="28">${metric.value}</text></g>
  </svg>`;
}

function icon(name) {
  const icons = { grid: '⌂', people: '♧', ring: '◉', alert: '⚠', chart: '⌁', note: '▤' };
  return `<span class="icon" aria-hidden="true">${icons[name] || '•'}</span>`;
}

function appShell(content, active = 'overview') {
  const links = [
    ['overview', '工作台', 'grid'],
    ['patients', '患者管理', 'people'],
    ['trends', '指环趋势', 'ring'],
    ['reminders', '提醒事项', 'alert'],
    ['updates', '更新内容', 'note'],
  ];
  return `<div class="shell">
    <aside class="sidebar"><div class="brand"><div class="brandMark">✚</div><div><strong>COPD 研究管理</strong></div></div><div class="navTitle">研究工作区</div><nav>${links.map(([key, label, iconName]) => `<a class="navItem ${active === key ? 'active' : ''}" href="#${key}">${icon(iconName)}<span>${label}</span>${key === 'reminders' ? '<b class="badge">3</b>' : ''}</a>`).join('')}</nav></aside>
    <main class="main"><header class="topbar"><div><span class="eyebrow">COPD · MULTI-CENTER RESEARCH</span><h1>${links.find(([key]) => key === active)?.[1] || '工作台'}</h1></div></header>${content}</main>
  </div>`;
}

function overview() {
  return appShell(`<section class="pageStack">
    <div class="hero"><div><span class="eyebrow teal">研究进展概览</span><h2>让每一次随访，都有清晰的下一步。</h2><p>从患者纳管、基线评估到指环趋势和提醒事项，集中查看研究进展。</p></div><div class="heroMark">COPD<br><small>EDC</small></div></div>
    <div class="statGrid">${[['总入组', '52', '本周 +4'], ['已完成基线', '38', '完成率 73%'], ['有效随访', '31', '本周 +6'], ['已绑定指环', '29', '数据持续更新']].map(([label, value, note]) => `<article class="statCard"><span>${label}</span><strong>${value}</strong><small>${note}</small></article>`).join('')}</div>
    <div class="twoCol"><section class="panel"><div class="panelHead"><div><span class="eyebrow">Monitoring snapshot</span><h3>监测趋势总览</h3></div><a class="textLink" href="#trends">查看详情 →</a></div><div class="metricGrid">${metrics.map((metric) => `<button class="metricCard" data-metric="${metric.key}"><span class="metricDot" style="background:${metric.color}"></span><span>${metric.label}</span><strong>${metric.value}<small>${metric.unit}</small></strong><em>${metric.change}</em></button>`).join('')}</div></section><section class="panel"><div class="panelHead"><div><span class="eyebrow">Reminder queue</span><h3>待处理事项</h3></div><a class="textLink" href="#reminders">查看全部 →</a></div><div class="miniList">${reminders.map((item) => `<a href="#reminders" class="miniItem"><i class="tone ${item.tone}"></i><span><strong>${item.title}</strong><small>${item.patient} · ${item.time}</small></span><b>›</b></a>`).join('')}</div></section></div>
    <section class="panel readiness"><div><span class="eyebrow">Study readiness</span><h3>研究准备度</h3><p>从入组到数据完整，关键环节一目了然。</p></div><div class="progressBlocks">${[['基线问卷', 73], ['首次随访', 60], ['指环绑定', 56], ['数据完整', 48]].map(([label, value]) => `<div><span>${label}</span><strong>${value}%</strong><i><em style="width:${value}%"></em></i></div>`).join('')}</div></section>
  </section>`, 'overview');
}

function patientsPage() {
  return appShell(`<section class="pageStack"><div class="pageIntro"><div><span class="eyebrow teal">Patient registry</span><h2>患者管理</h2><p>用统一的研究编号查看纳管、随访和设备状态。</p></div><button class="primaryButton" type="button">＋ 新增示例患者</button></div><section class="panel"><div class="filterBar"><label>搜索患者<input placeholder="输入研究编号" /></label><label>中心<select><option>全部中心</option><option>示例研究中心</option></select></label><span class="resultCount">52 位患者</span></div><div class="tableWrap"><table><thead><tr><th>研究编号</th><th>所属中心</th><th>流程状态</th><th>指环状态</th><th>最近更新</th><th>风险提示</th></tr></thead><tbody>${patients.map((patient) => `<tr><td><a class="tableCode" href="#patient-detail"><strong>${patient.code}</strong></a></td><td>${patient.center}</td><td><span class="status neutral">${patient.status}</span></td><td>${patient.ring}</td><td>${patient.update}</td><td><span class="status ${patient.risk === '需核实' ? 'warn' : patient.risk === '稳定' ? 'ok' : 'neutral'}">${patient.risk}</span></td></tr>`).join('')}</tbody></table></div></section></section>`, 'patients');
}

function patientDetailPage() {
  const patient = patients[0];
  return appShell(`<section class="pageStack"><div class="pageIntro"><div><span class="eyebrow teal">Patient detail</span><h2>${patient.code}</h2><p>${patient.center} · ${patient.status} · ${patient.ring}</p></div><a class="secondaryButton" href="#patients">← 返回患者管理</a></div><section class="detailSummary"><article class="panel detailIdentity"><span class="eyebrow">Overview</span><h3>观察中</h3><p>最近更新 ${patient.update}</p><div class="detailTags"><span class="status warn">需核实</span><span class="status ok">数据持续更新</span></div></article><article class="panel"><span class="eyebrow">Current vitals</span><div class="detailVitals">${metrics.map((metric) => `<div><span style="color:${metric.color}">${metric.label}</span><strong>${metric.value}<small>${metric.unit}</small></strong><em>${metric.change}</em></div>`).join('')}</div></article></section><section class="panel"><div class="panelHead"><div><span class="eyebrow">Risk and reminders</span><h3>风险与异常</h3></div><a class="textLink" href="#reminders">查看提醒队列 →</a></div><div class="detailAlert"><i class="tone warn"></i><div><strong>血氧波动，需核实</strong><p>最近窗口出现 2 个偏低观测点，建议人工复核观测质量。</p><small>观测值 89% · 阈值 &lt;90% · 今天 09:40</small></div><span class="status warn">活动</span></div></section><section class="panel"><div class="panelHead"><div><span class="eyebrow">Ring monitoring</span><h3>监测趋势</h3></div><a class="textLink" href="#trends">打开完整趋势 →</a></div><div class="detailTrendPreview">${chartSvg()}</div><div class="detailTrendFoot"><span>最近 7 天 · 采样间隔中位数 10 分钟</span><a class="textLink" href="#trends">查看缩放和统计</a></div></section></section>`, 'patients');
}

function trendsPage() {
  const selected = metrics.find((metric) => metric.key === state.metric) || metrics[0];
  return appShell(`<section class="pageStack"><div class="pageIntro"><div><span class="eyebrow teal">Ring monitoring</span><h2>指环趋势</h2><p>按真实时间窗口查看示例患者的体征变化，断档会保留为空白。</p></div><span class="outlineTag">示例患者 · 示例-001</span></div><section class="metricOverview">${metrics.map((metric) => `<button class="metricCard ${metric.key === state.metric ? 'selected' : ''}" data-metric="${metric.key}"><span class="metricDot" style="background:${metric.color}"></span><span>${metric.label}</span><strong>${metric.value}<small>${metric.unit}</small></strong><em>${metric.change}</em></button>`).join('')}</section><section class="panel trendPanel"><div class="panelHead"><div><span class="eyebrow">${selected.label}</span><h3>最近 7 天趋势</h3></div><div class="rangeTabs">${[['24h','24小时'],['7d','7天'],['30d','30天']].map(([key, label]) => `<button class="${state.range === key ? 'active' : ''}" data-range="${key}">${label}</button>`).join('')}</div></div><div class="trendLegend"><span><i style="background:${selected.color}"></i>${selected.label}</span><span>采样间隔中位数 10 分钟</span><span>当前均值 <b>${selected.value} ${selected.unit}</b></span></div><div class="chartFrame">${chartSvg()}</div><div class="chartFoot"><span>10 月 02 日</span><span>10 月 05 日</span><span>10 月 08 日</span></div></section><section class="statStrip">${[['当前均值', selected.value + ' ' + selected.unit], ['前置基线', selected.key === 'spo2' ? '94%' : selected.key === 'heart' ? '80 bpm' : selected.key === 'resp' ? '17 次/分' : '40 ms'], ['波动幅度', selected.key === 'spo2' ? '4 个百分点' : selected.key === 'heart' ? '12 bpm' : selected.key === 'resp' ? '5 次/分' : '11 ms'], ['有效点数', '1,008']].map(([label, value]) => `<div><span>${label}</span><strong>${value}</strong></div>`).join('')}</section></section>`, 'trends');
}

function remindersPage() {
  return appShell(`<section class="pageStack"><div class="pageIntro"><div><span class="eyebrow teal">Reminder queue</span><h2>提醒事项</h2><p>风险、随访和数据质量事项集中展示，便于团队协作。</p></div><button class="secondaryButton">刷新队列</button></div><div class="queueGrid"><article class="queueCard active"><span>全部事项</span><strong>3</strong><small>当前需要关注</small></article><article class="queueCard"><span>风险预警</span><strong>1</strong><small>需人工核实</small></article><article class="queueCard"><span>随访事项</span><strong>1</strong><small>窗口内完成</small></article><article class="queueCard"><span>数据质量</span><strong>1</strong><small>覆盖率不足</small></article></div><section class="panel"><div class="panelHead"><div><span class="eyebrow">Open items</span><h3>最近提醒</h3></div><span class="resultCount">3 条待处理</span></div><div class="reminderList">${reminders.map((item) => `<article class="reminderRow"><i class="tone ${item.tone}"></i><div><strong>${item.title}</strong><p>${item.detail}</p><small>${item.patient} · ${item.time}</small></div><button class="rowAction">查看 →</button></article>`).join('')}</div></section></section>`, 'reminders');
}

function updatesPage() {
  return appShell(`<section class="pageStack"><div class="pageIntro"><div><span class="eyebrow teal">Release notes</span><h2>更新内容</h2><p>按时间查看产品体验和研究工作流的变化。</p></div></div><section class="panel timeline">${updates.map((item, index) => `<article class="updateItem"><div class="timelineDot ${index === 0 ? 'current' : ''}"></div><div><time>${item.date}</time><h3>${item.title}</h3><p>${item.text}</p></div></article>`).join('')}</section></section>`, 'updates');
}

function render() {
  const pages = { overview, patients: patientsPage, 'patient-detail': patientDetailPage, trends: trendsPage, reminders: remindersPage, updates: updatesPage };
  document.querySelector('#app').innerHTML = (pages[state.route] || overview)();
  document.querySelectorAll('[data-metric]').forEach((button) => button.addEventListener('click', () => { state.metric = button.dataset.metric; state.route = 'trends'; window.location.hash = 'trends'; render(); }));
  document.querySelectorAll('[data-range]').forEach((button) => button.addEventListener('click', () => { state.range = button.dataset.range; render(); }));
}

window.addEventListener('hashchange', () => { state.route = window.location.hash.slice(1) || 'overview'; render(); });
render();
