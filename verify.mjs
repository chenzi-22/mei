/**
 * LUMEN 端到端验证 + 截图（纯电商 + 产品视差滚动）
 *   node verify.mjs
 */
import fs from 'node:fs'
import path from 'node:path'
import os from 'node:os'
import { spawn } from 'node:child_process'

const EDGE = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe'
const DBG = 9335
const URL = 'http://127.0.0.1:5273/'
const SHOTS = path.join(process.cwd(), 'shots')

fs.mkdirSync(SHOTS, { recursive: true })

let pass = 0
let fail = 0
const ok = (name, cond, extra = '') => {
  if (cond) {
    pass++
    console.log(`  PASS  ${name}${extra ? '  ' + extra : ''}`)
  } else {
    fail++
    console.log(`  FAIL  ${name}${extra ? '  ' + extra : ''}`)
  }
}
const wait = (ms) => new Promise((r) => setTimeout(r, ms))

const userDataDir = path.join(os.tmpdir(), 'lumen-edge-' + Date.now())
const proc = spawn(
  EDGE,
  [
    '--headless=new',
    '--disable-gpu',
    '--no-first-run',
    '--mute-audio',
    '--hide-scrollbars',
    '--force-device-scale-factor=1',
    `--remote-debugging-port=${DBG}`,
    `--user-data-dir=${userDataDir}`,
    '--window-size=1440,900',
    URL,
  ],
  { stdio: 'ignore' },
)

async function wsUrl() {
  for (let i = 0; i < 60; i++) {
    try {
      const list = await (await fetch(`http://127.0.0.1:${DBG}/json/list`)).json()
      const pg = list.find((t) => t.type === 'page' && t.webSocketDebuggerUrl)
      if (pg) return pg.webSocketDebuggerUrl
    } catch {
      /* 还没起来 */
    }
    await wait(400)
  }
  throw new Error('CDP 未就绪')
}

let msgId = 0
const rpc = (ws, method, params = {}) =>
  new Promise((res, rej) => {
    const id = ++msgId
    const on = (ev) => {
      const m = JSON.parse(ev.data)
      if (m.id === id) {
        ws.removeEventListener('message', on)
        m.error ? rej(new Error(JSON.stringify(m.error))) : res(m.result)
      }
    }
    ws.addEventListener('message', on)
    ws.send(JSON.stringify({ id, method, params }))
  })

async function ev(ws, expression) {
  const r = await rpc(ws, 'Runtime.evaluate', {
    expression,
    awaitPromise: true,
    returnByValue: true,
  })
  if (r.exceptionDetails) {
    throw new Error(r.exceptionDetails.exception?.description || r.exceptionDetails.text)
  }
  return r.result.value
}

async function shot(ws, name) {
  const r = await rpc(ws, 'Page.captureScreenshot', { format: 'png', fromSurface: true })
  const p = path.join(SHOTS, name)
  fs.writeFileSync(p, Buffer.from(r.data, 'base64'))
  console.log(`         → shots/${name}  ${(fs.statSync(p).size / 1024).toFixed(1)} KB`)
}

/** 瞬时滚动（绕过 CSS smooth），并等一帧让视差写入 */
async function scrollTo(ws, top) {
  await ev(ws, `window.scrollTo({ top: ${top}, behavior: 'instant' }); 1`)
  await wait(320)
}

const clickNav = (label) =>
  `(()=>{const b=[...document.querySelectorAll('header nav button')].find(x=>x.textContent.trim()==='${label}');b.click();return 1})()`

/** 读取第一个产品三层视差的 translateY */
const READ_PARALLAX = `(() => {
  const art = document.querySelectorAll('#products article')[0];
  const ghost = art.querySelector('span[aria-hidden="true"]');
  const divs = art.querySelectorAll(':scope > div');
  const ty = (el) => {
    if (!el || !el.style.transform) return null;
    try { return Math.round(new DOMMatrix(el.style.transform).m42 * 100) / 100; } catch { return null; }
  };
  return JSON.stringify({ ghost: ty(ghost), vessel: ty(divs[0]), copy: ty(divs[1]) });
})()`

try {
  const ws = new WebSocket(await wsUrl())
  await new Promise((res, rej) => {
    ws.addEventListener('open', res)
    ws.addEventListener('error', rej)
  })

  const problems = []
  ws.addEventListener('message', (e) => {
    const m = JSON.parse(e.data)
    if (m.method === 'Runtime.exceptionThrown') {
      problems.push('EXC ' + (m.params.exceptionDetails.exception?.description || '').split('\n')[0])
    }
    if (m.method === 'Runtime.consoleAPICalled' && m.params.type === 'error') {
      problems.push('CONSOLE ' + m.params.args.map((a) => a.value ?? a.description ?? '').join(' '))
    }
  })

  await rpc(ws, 'Runtime.enable')
  await rpc(ws, 'Page.enable')
  await rpc(ws, 'Emulation.setDeviceMetricsOverride', {
    width: 1440,
    height: 900,
    deviceScaleFactor: 1,
    mobile: false,
  })
  await rpc(ws, 'Page.reload', { ignoreCache: true })
  await wait(3200)
  await ev(ws, 'document.fonts.ready.then(() => true)')
  await wait(500)

  /* ── 1 基础 ── */
  console.log('\n[1] 页面基础')
  ok('标题', (await ev(ws, 'document.title')) === 'LUMEN — Skin Beyond Borders')
  ok('页面无中文',
     !/[\u4e00-\u9fff]/.test(await ev(ws, 'document.body.innerText')),
     await ev(ws, `(document.body.innerText.match(/[\u4e00-\u9fff]+/g) || []).slice(0, 5).join(' / ')`))
  ok('无 JS 异常', problems.length === 0, problems[0] ?? '')
  ok('Orbitron 已加载', await ev(ws, `document.fonts.check('900 40px Orbitron')`))
  ok('Plus Jakarta 已加载', await ev(ws, `document.fonts.check('500 14px "Plus Jakarta Sans"')`))
  ok('文档可滚动', (await ev(ws, 'document.documentElement.scrollHeight')) > 3000,
     'scrollHeight=' + (await ev(ws, 'document.documentElement.scrollHeight')))

  /* ── 2 首屏 ── */
  console.log('\n[2] 首屏构成')
  const h1 = await ev(ws, `document.querySelector('h1').innerText.replace(/\\s+/g,' ').trim()`)
  ok('标题三行', h1.includes('SKIN') && h1.includes('BEYOND') && h1.includes('BORDERS'), h1)
  ok('首屏恰好一屏',
     Math.abs((await ev(ws, `document.querySelector('main').getBoundingClientRect().height`)) - 900) < 6,
     '高 ' + Math.round(await ev(ws, `document.querySelector('main').getBoundingClientRect().height`)) + 'px')
  ok('棋盘格', await ev(ws, `document.querySelectorAll('h1 svg path').length`) === 1)
  ok('线框地球', await ev(ws, `document.querySelectorAll('main svg ellipse').length`) === 4)
  ok('滚动提示', (await ev(ws, `document.body.innerText.toUpperCase()`)).includes('SCROLL'))

  /* ── 3 分析已移除 ── */
  console.log('\n[3] 分析类功能已移除')
  const bodyText = await ev(ws, 'document.body.innerText.toUpperCase()')
  ok('无 INGEST', !bodyText.includes('INGEST'))
  ok('无税率读数', !bodyText.includes('DUTY') && !bodyText.includes('VAT'))
  ok('无到岸价', !bodyText.includes('示例费率') && !bodyText.includes('TRANSIT'))
  ok('无文件选择框', (await ev(ws, `document.querySelectorAll('input[type=file]').length`)) === 0)

  await shot(ws, '01-hero.png')

  /* ── 4 产品视差区 ── */
  console.log('\n[4] 产品视差区')
  ok('四个产品条目', (await ev(ws, `document.querySelectorAll('#products article').length`)) === 4)
  // 每支产品现在是两层 svg：开盖态瓶身 + 可揭示的盖子
  const vesselLayers = await ev(
    ws,
    `[...document.querySelectorAll('#products article')].map(a => a.querySelectorAll('svg[viewBox="0 0 120 200"]').length)`,
  )
  ok(
    '四支容器线描（瓶身 + 盖子各一层）',
    vesselLayers.length === 4 && vesselLayers.every((n) => n === 2),
    vesselLayers.join(','),
  )
  ok('四个巨型编号',
     (await ev(ws, `[...document.querySelectorAll('#products article > span[aria-hidden="true"]')].map(s=>s.textContent).join(',')`)) === '01,02,03,04')

  const p1 = JSON.parse(await ev(ws, READ_PARALLAX))
  ok('视差已写入 transform', p1.ghost !== null && p1.copy !== null,
     `ghost=${p1.ghost} vessel=${p1.vessel} copy=${p1.copy}`)

  await scrollTo(ws, 1400)
  const p2 = JSON.parse(await ev(ws, READ_PARALLAX))
  ok('滚动后视差位移改变', p2.ghost !== p1.ghost && p2.copy !== p1.copy,
     `${p1.ghost} → ${p2.ghost}`)
  ok('编号与文案速度不同', p2.ghost !== p2.copy,
     `ghost=${p2.ghost} copy=${p2.copy}`)
  ok('容器反向漂移', p2.vessel !== null && Math.sign(p2.vessel) !== Math.sign(p2.ghost),
     `vessel=${p2.vessel} / ghost=${p2.ghost}（异号 = 反向）`)
  ok('带微旋转', /rotate\(/.test(await ev(ws, `document.querySelectorAll('#products article')[0].querySelectorAll(':scope > div')[0].style.transform`)))

  /* ── 5 吸顶头部 ── */
  console.log('\n[5] 吸顶头部')
  await scrollTo(ws, 1600)
  const bgScrolled = await ev(ws, `getComputedStyle(document.querySelector('header')).backgroundColor`)
  ok('滚动后头部有底色', bgScrolled.startsWith('rgba(255, 255, 255'), bgScrolled)
  ok('头部固定在顶部', (await ev(ws, `Math.round(document.querySelector('header').getBoundingClientRect().top)`)) === 0)
  await scrollTo(ws, 0)
  await wait(200)
  const bgTop = await ev(ws, `getComputedStyle(document.querySelector('header')).backgroundColor`)
  ok('顶部时头部透明', bgTop === 'rgba(0, 0, 0, 0)', bgTop)

  /* ── 5.5 素颜 → 全妆 ── */
  console.log('\n[5.5] 素颜 → 全妆揭示')
  await ev(ws, `(() => { const s = document.getElementById('transformation'); window.scrollTo({ top: s.getBoundingClientRect().top + window.scrollY - 80, behavior: 'instant' }); return 1 })()`)
  await wait(500)

  ok('区块存在', await ev(ws, `!!document.getElementById('transformation')`))
  ok('两张人像已布局',
     (await ev(ws, `document.querySelectorAll('#transformation img').length`)) === 2)
  ok('素颜图已加载',
     (await ev(ws, `document.querySelectorAll('#transformation img')[0].naturalWidth`)) === 1100,
     '宽 ' + (await ev(ws, `document.querySelectorAll('#transformation img')[0].naturalWidth`)) + 'px')
  ok('全妆图已加载',
     (await ev(ws, `document.querySelectorAll('#transformation img')[1].naturalWidth`)) === 1100)
  ok('两张尺寸一致',
     (await ev(ws, `(() => { const i = document.querySelectorAll('#transformation img'); return i[0].naturalHeight === i[1].naturalHeight && i[0].naturalWidth === i[1].naturalWidth })()`)))

  const maskAtStart = await ev(ws, `document.querySelectorAll('#transformation img')[1].style.maskImage`)
  ok('初始是渐变遮罩', /linear-gradient/.test(maskAtStart) && /transparent/.test(maskAtStart),
     maskAtStart.slice(0, 68) + '…')

  const box = JSON.parse(await ev(ws, `(() => {
    const el = document.querySelector('#transformation div[class*="touch-pan-y"]');
    const r = el.getBoundingClientRect();
    return JSON.stringify({ x: r.left, y: r.top, w: r.width, h: r.height });
  })()`))
  const my = Math.round(box.y + box.h * 0.5)
  const xFrom = Math.round(box.x + box.w * 0.12)
  const xTo = Math.round(box.x + box.w * 0.72)

  // 只移动鼠标，全程不按下 —— 验证「划动即变」
  await rpc(ws, 'Input.dispatchMouseEvent', { type: 'mouseMoved', x: xFrom, y: my })
  await wait(220)
  await rpc(ws, 'Input.dispatchMouseEvent', { type: 'mouseMoved', x: xTo, y: my })
  await wait(320)

  const maskAfter = await ev(ws, `document.querySelectorAll('#transformation img')[1].style.maskImage`)
  ok('鼠标划动即改变（无需按下）', maskAfter !== maskAtStart, maskAfter.slice(0, 68) + '…')
  ok('手柄跟到 72%',
     (await ev(ws, `document.querySelector('#transformation [role=slider]').getAttribute('aria-valuenow')`)) === '72',
     'aria-valuenow=' + (await ev(ws, `document.querySelector('#transformation [role=slider]').getAttribute('aria-valuenow')`)))
  await shot(ws, '06-makeup-styled.png')
  const txText = await ev(ws, `document.getElementById('transformation').innerText.toUpperCase()`)
  ok('图上没有状态角标', !txText.includes('STYLED') && !txText.includes('BARE'))
  ok('没有划动提示', !txText.includes('MOVE ACROSS') && !txText.includes('DRAG THE'))
  ok('没有百分比读数', !/\d+\s*%/.test(txText))
  ok('产品介绍列出四项', (await ev(ws, `document.querySelectorAll('#transformation ol li').length`)) === 4)
  ok('四项都带价格', (await ev(ws, `(document.querySelectorAll('#transformation ol li').length === 4) && [...document.querySelectorAll('#transformation ol li')].every(li => /\\$\\d+/.test(li.innerText))`)))
  ok('有跳目录按钮', txText.includes('SHOP ALL FOUR'))

  // 键盘可调
  const beforeKeys = await ev(ws, `document.querySelectorAll('#transformation img')[1].style.maskImage`)
  await ev(ws, `(() => { const s = document.querySelector('#transformation [role=slider]'); s.focus(); s.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft', bubbles: true })); return 1 })()`)
  await wait(260)
  ok('键盘 ← 可调',
     (await ev(ws, `document.querySelectorAll('#transformation img')[1].style.maskImage`)) !== beforeKeys)
  ok('滑块带无障碍属性',
     (await ev(ws, `document.querySelector('#transformation [role=slider]').getAttribute('aria-valuenow')`)) !== null,
     'aria-valuenow=' + (await ev(ws, `document.querySelector('#transformation [role=slider]').getAttribute('aria-valuenow')`)))

  // 线条默认不可见（只在键盘聚焦时显形）—— 先失焦再测
  await ev(ws, `(() => { const a = document.activeElement; if (a && a.blur) a.blur(); return 1 })()`)
  await wait(260)
  ok('分割线默认透明',
     (await ev(ws, `getComputedStyle(document.querySelector('#transformation [role=slider]').parentElement).opacity`)) === '0',
     'opacity=' + (await ev(ws, `getComputedStyle(document.querySelector('#transformation [role=slider]').parentElement).opacity`)))
  await ev(ws, `document.querySelector('#transformation [role=slider]').focus(); 1`)
  await wait(340)
  ok('聚焦时才显形',
     (await ev(ws, `getComputedStyle(document.querySelector('#transformation [role=slider]').parentElement).opacity`)) === '1',
     '聚焦后 opacity=' + (await ev(ws, `getComputedStyle(document.querySelector('#transformation [role=slider]').parentElement).opacity`)))
  await ev(ws, `(() => { const a = document.activeElement; if (a && a.blur) a.blur(); return 1 })()`)
  await wait(200)
  ok('图片没有外框',
     !/border/.test(await ev(ws, `document.querySelector('#transformation div[class*="touch-pan-y"]').className`)),
     await ev(ws, `document.querySelector('#transformation div[class*="touch-pan-y"]').className`))

  /* ── 6 截图 ── */
  console.log('\n[6] 截图')
  await ev(ws, `window.scrollTo({ top: document.getElementById('products').getBoundingClientRect().top + window.scrollY - 110, behavior: 'instant' }); 1`)
  await wait(400)
  await shot(ws, '02-products.png')

  await ev(ws, `(() => { const a = document.querySelectorAll('#products article')[1]; window.scrollTo({ top: a.getBoundingClientRect().top + window.scrollY - 120, behavior: 'instant' }); return 1 })()`)
  await wait(400)
  await shot(ws, '03-product-closeup.png')

  /* ── 7 目录 + 加购 ── */
  console.log('\n[7] 目录 + 加购')
  await ev(ws, clickNav('CATALOG'))
  await wait(700)
  ok('抽屉滑入', (await ev(ws, `document.querySelector('aside').getBoundingClientRect().left`)) < 1340)
  ok('四个配方', (await ev(ws, `document.querySelectorAll('aside li').length`)) === 4)
  ok('目录抽屉无中文', !/[\u4e00-\u9fff]/.test(await ev(ws, `document.querySelector('aside').innerText`)),
     await ev(ws, `(document.querySelector('aside').innerText.match(/[\u4e00-\u9fff]+/g) || []).join(' / ')`))
  ok('商品可拖拽', (await ev(ws, `document.querySelectorAll('aside li[draggable="true"]').length`)) === 4)
  await shot(ws, '04-catalog.png')

  await ev(ws, `(()=>{document.querySelectorAll('aside li button')[0].click();return 1})()`)
  await wait(500)
  ok('角标=1', (await ev(ws, `document.querySelector('header nav button:last-child span')?.textContent`)) === '1')
  ok('加购提示', (await ev(ws, `document.querySelector('[role=status]')?.textContent ?? ''`)).includes('shopping bag'))

  /* ── 8 购物袋 + 结算 ── */
  console.log('\n[8] 购物袋 + 结算')
  await ev(ws, `(()=>{document.querySelector('header nav button:last-child').click();return 1})()`)
  await wait(700)
  ok('袋内有商品', (await ev(ws, `document.querySelector('aside').innerText`)).includes('H2O LATTICE SERUM'))
  await shot(ws, '05-bag.png')
  await ev(ws, `(()=>{const b=[...document.querySelectorAll('aside button')].find(x=>x.textContent.includes('Checkout'));b.click();return 1})()`)
  await wait(600)
  ok('结算提示', (await ev(ws, `document.querySelector('[role=status]')?.textContent ?? ''`)).includes('submitted'))
  ok('袋子清空', (await ev(ws, `document.querySelectorAll('header nav button:last-child span').length`)) === 0)

  /* ── 9 拖商品进袋 ── */
  console.log('\n[9] 拖商品进购物袋')
  await ev(ws, clickNav('CATALOG'))
  await wait(600)
  await ev(
    ws,
    `(() => {
      const dt = new DataTransfer();
      dt.setData('application/x-lumen-product', 'geo-peptide');
      window.__dt = dt;
      window.dispatchEvent(new DragEvent('dragenter', { dataTransfer: dt, bubbles: true }));
      return 1;
    })()`,
  )
  await wait(400)
  ok('落区出现', (await ev(
    ws,
    `getComputedStyle([...document.querySelectorAll('div')].find(d=>d.className.includes('z-50'))).opacity`,
  )) === '1')
  await ev(ws, `window.dispatchEvent(new DragEvent('drop',{dataTransfer:window.__dt,bubbles:true,cancelable:true}))`)
  await wait(700)
  ok('拖拽加购生效', (await ev(ws, `document.querySelector('header nav button:last-child span')?.textContent`)) === '1')

  await ev(
    ws,
    `(() => {
      const dt = new DataTransfer();
      dt.items.add(new File(['a,b,c'], 'sheet.csv', { type: 'text/csv' }));
      window.dispatchEvent(new DragEvent('drop', { dataTransfer: dt, bubbles: true, cancelable: true }));
      return 1;
    })()`,
  )
  await wait(700)
  ok('文件拖拽被拒', (await ev(ws, `document.querySelector('[role=status]')?.textContent ?? ''`)).includes('Only products'))

  /* ── 10 产地 / 手记 ── */
  console.log('\n[10] 产地 + 手记')
  await ev(ws, clickNav('ORIGINS'))
  await wait(600)
  ok('四个实验室', (await ev(ws, `document.querySelectorAll('aside li').length`)) === 4)
  ok('产地抽屉无中文', !/[\u4e00-\u9fff]/.test(await ev(ws, `document.querySelector('aside').innerText`)),
     await ev(ws, `(document.querySelector('aside').innerText.match(/[\u4e00-\u9fff]+/g) || []).join(' / ')`))
  await ev(ws, clickNav('JOURNAL'))
  await wait(600)
  ok('三条手记', (await ev(ws, `document.querySelectorAll('aside li').length`)) === 3)

  console.log(`\n结果：${pass} 通过 · ${fail} 失败`)
  if (problems.length) {
    console.log('\n页面问题:')
    problems.slice(0, 6).forEach((p) => console.log('  ' + p))
  }

  await rpc(ws, 'Browser.close').catch(() => {})
  ws.close()
} catch (e) {
  console.error('\n验证中断:', e.message)
  fail++
} finally {
  try {
    proc.kill()
  } catch {
    /* ignore */
  }
  setTimeout(() => process.exit(fail ? 1 : 0), 700)
}
