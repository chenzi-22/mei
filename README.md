# LUMEN — Skin Beyond Borders

跨境电商美妆品牌站。纯白极简、未来感、单屏首屏 + **产品视差滚动**。

- 线上地址：<http://127.0.0.1:5273/>（由 `serve.mjs` 托管 `dist/`）
- 品牌主张：`SKIN / BEYOND / BORDERS`
- 视觉语言：纯黑纯白 + 灰阶，无紫、无米黄、无发光、无装饰卡片

> 纯电商业务：逛商品、看产地、看手记、加购、结算。
> 不含文档解析、成分分析、税率计算。

---

## 快速开始

```bash
cd G:\deepseek\liu\lumen

"C:\Program Files\nodejs\npm.cmd" run build      # 构建（走 build.mjs，见下方说明）
"C:\Program Files\nodejs\node.exe" serve.mjs     # 托管 dist/，端口 5273
"C:\Program Files\nodejs\node.exe" verify.mjs    # 60 项端到端验证 + 7 张截图

"C:\Program Files\nodejs\npm.cmd" run dev        # 开发模式（热更新）
python blend.py                                  # 重抠人像（改了素材才需要跑）
```

> npm 缓存要指到工作区内，否则沙箱会拦：
> `$env:npm_config_cache = 'G:\deepseek\liu\.npm-cache'`
>
> `build.mjs` 是构建包装：Windows 下 vite 会执行一次 `exec("net use")` 探测映射盘，
> 而受限沙箱不允许「用管道捕获子进程输出」（spawn 直接 EPERM）。
> 包装脚本把这一条命令的 stdio 改成 `ignore` 再调 `vite build`，功能完全等价；
> 在普通机器上直接 `npm run build:vite` 也行。

---

## 部署到 GitHub Pages

仓库里已经放好 `.github/workflows/deploy.yml`：**推到 `main` 就自动构建并发布**，不用手动传 `dist`。

1. 在 GitHub 新建一个 public 仓库，然后推上去：

   ```bash
   cd G:\deepseek\liu\lumen
   git init -b main
   git add .
   git commit -m "LUMEN"
   git remote add origin https://github.com/<用户名>/<仓库名>.git
   git push -u origin main
   ```

   不用命令行也行：GitHub 仓库页 → **Add file → Upload files**，把整个项目目录拖进去。
   这种上传方式容易漏掉隐藏目录，`.github/workflows/deploy.yml` 要确认真的传上去了；
   漏了就在网页上 **Add file → Create new file**，文件名填 `.github/workflows/deploy.yml`，内容照抄本地那份。

2. 仓库 **Settings → Pages → Build and deployment → Source** 选 **GitHub Actions**（只需设一次）。

3. 等 Actions 里 `Deploy to GitHub Pages` 跑完（约 1 分钟），网址是：

   ```
   https://<用户名>.github.io/<仓库名>/
   ```

4. 之后每次 `git push` 到 `main` 都会自动重新部署。

`vite.config.ts` 里设了 `base: './'`，素材路径也走 `import.meta.env.BASE_URL`，
所以站点挂在 `/<仓库名>/` 这种子路径下资源照样能取到；将来换自定义域名（根目录）也不用改配置。

> **不走 Actions 的备选**：`npm run build` 后把 `dist/` 里的文件放到仓库的 `docs/` 目录，
> Pages 的 Source 选 *Deploy from a branch* → `main` / `/docs`。
> 这种方式的代价是每次改完都要重新构建并提交一次 `docs/`。

---

## 技术栈

| 项 | 版本 |
|---|---|
| React | 19.3.1 |
| Vite | 8.3.5 |
| TypeScript | 7.0.2（`tsc -b` 零错误） |
| Tailwind CSS | 4.3.3（`@tailwindcss/vite` 插件） |
| lucide-react | 1.66.0 |
| 字体 | Orbitron 600–900 / Plus Jakarta Sans 400–700（Google Fonts） |

产物：`258 KB` JS（gzip 80 KB）+ `19 KB` CSS（gzip 4.9 KB）+ 人像 `2 × ~145 KB` webp（带 alpha）。

---

## 页面结构

```
Header（fixed，滚动后显白色毛玻璃 + 发丝线）
Hero          100svh ── 品牌标题 + 棋盘格 + 取景框（地球 + 标语）+ SCROLL 提示
Transformation ── 真人半身像，拖动分割线从素颜渐变到全妆
ProductScroll ── 四支配方，一屏一个，三层视差
Footer
```

### 四个产品条目

| 编号 | 商品 | 容器图形 | 产地 |
|---|---|---|---|
| 01 | H2O LATTICE SERUM | 滴管精华瓶 | KR · SEOUL |
| 02 | GEO-PEPTIDE AMPOULE | 安瓿 | CH · ZÜRICH |
| 03 | ORBITAL BARRIER CREAM | 面霜罐 | JP · KYOTO |
| 04 | MODULAR UV VEIL SPF50+ | 软管 | FR · LYON |

左右交替排布（偶数图左文右、奇数图右文左），给滚动节奏。

---

## 产品视差滚动

### 三层不同速度

每个产品条目里挂三个独立视差：

| 层 | 系数 | 效果 |
|---|---|---|
| 巨型编号 `01` | `+0.16` | 比滚动快，向上漂 |
| 容器线描图 | `-0.10`，叠 `0.012` 旋转 | **反向漂移** + 轻微转动 |
| 文案块 | `+0.06` | 几乎跟随滚动 |

三层速度不同，滚动时就会互相错开，产生纵深。

### 实现

`src/lib/parallax.ts` 是一个极小的共享调度器：

- **全站只挂一个 `scroll` 监听、一个 `rAF` 循环**，所有元素共享
- 位移 = `(视口中心 − 元素中心) × 系数`，所以任意位置的元素都能用同一套公式
- 元素中心在挂载时测一次（临时清空 transform 再量），
  并在 `resize`、`load`、`document.fonts.ready`、`ResizeObserver` 四个时机重测
- 位移变化小于 `0.1px` 时跳过写入，静止时不做任何 DOM 写入
- `prefers-reduced-motion` 下整个钩子直接不注册

实测数据（滚动 0 → 1400）：

```
ghost  -143.58 → 80.42      ← 编号
copy    -54.56 → 29.44      ← 文案（比编号慢）
vessel   90.94 → -49.06     ← 容器（反向）
```

### 滚动模式

页面已从「单屏不滚动」改成**文档滚动**：

- `html` / `body` 只保留 `overflow-x: hidden`，不再 `overflow: hidden`
- 这样 `window.scrollY` 才是真实滚动量，`position: fixed` 头部与视差都依赖它

---

## 素颜 → 全妆 揭示

真人半身像，同一人物、同一姿势、同一布光的两张图上下叠放：

- **底层**是素颜，常驻
- **上层**是全妆，被一条横向渐变遮罩切开
- 遮罩的过渡带半宽 `FEATHER = 0.13`，所以分割处是柔和羽化，不是硬切

### 交互：划动即变，不用按住

鼠标在图上**左右划动就跟着变**，不需要按下 —— 把 `onPointerMove` 直接接到
`setPos`，不再由「是否按下」控制：

- **桌面**：鼠标进入图片后 `pointermove` 持续触发 → 手柄和妆面实时跟随
- **触屏**：没有 hover，`pointermove` 只在手指按下时触发 → 自然退化成拖动
- **键盘**：手柄可聚焦，`← →` 每次走 4%
- 容器用 `touch-pan-y`：纵向滚动不抢，横向划动归组件

左侧露出全妆，右侧保持素颜，起始停在 12%（几乎是素颜）。

### 画面上什么都没有

分割线、手柄圆环、图片外框、状态角标、划动提示、百分比读数 —— 全部去掉，
鼠标划过时就是一张纯渐变的图：

- 分割线容器默认 `opacity: 0`，只有 `focus-within`（键盘 Tab 到滑块）才显形
- 图片容器不带 `border`，图上不再有任何文字
- 唯一的提示是光标形状 `cursor: ew-resize`
- 无障碍没有丢：滑块依然可聚焦、`role="slider"`、`aria-valuenow` 实时更新

### 右侧是产品介绍

图片右边不是操作说明，而是撑起这套妆底的四个配方：

| 列 | 内容 |
|---|---|
| 编号 | `01`–`04` |
| 品名 | Orbitron 之外的 Plus Jakarta 大写 |
| 状态 | `LIMITED EDITION` / `NEW DROP` / `IN STOCK` / `PRE-ORDER` |
| 价格 | `$68` / `$54` / `$46` / `$39` |

底部 `SHOP ALL FOUR` 打开目录抽屉。区块抬头右侧标的是 `SHOP THE LOOK`。

### 素材为什么能无缝叠

两张图是分别生成的，构图未必逐像素一致——不一致的话，渐变区会露出重影。
所以先用**相位相关 + 尺度微调**量了一遍四张候选图的偏差：

| 候选 | 偏移 | 尺度 | 平均绝对差 |
|---|---|---|---|
| bare2 | dx=+27 dy=+7 | 0.94 | 55.71 |
| **bare3** | **dx=0 dy=0** | **1.00** | **3.90** |
| bare4 | dx=0 dy=0 | 1.00 | 5.57 |

选出了 `bare3`：偏移 0、尺度 1.0、MAD 3.9/255 —— 实际就是同一底稿的两次出图，
所以叠上去没有位移，渐变只是妆容浓度在变。

另外裁掉了原图底部 10%，去掉右下角的 AI 生成水印。

### 抠图：人物背景是透明的

原图是浅灰影棚背景，直接放上去会是一块灰色方框。`blend.py` 把它抠成带 alpha 的 PNG
（母版存 `_orig/*-alpha.png`），页面用的是同尺寸的 `webp`：

```bash
python blend.py     # 读 _orig/*.jpg → 写 _orig/*-alpha.png + public/*.webp
```

三步：

1. **局部背景色场**：影棚布光有渐变，背景色不是常数。先把已知背景做成 1/8 缩略图，
   用扩散填充补出主体位置，再放大模糊，得到一张平滑的 `B(x, y)`。
2. **轮廓先于颜色**：`d = ‖C − B‖` 只用来判断「是不是主体」，生成二值轮廓后做闭运算
   （补掉发丝间的小洞），再统一羽化。直接拿 `d` 当 alpha，JPEG 的 1–2px 抖动会被放大成麻点。
3. **去背景污染**：`F = (C − (1−a)·B) / a`，把羽化带里混进去的背景色减掉，
   否则边缘会挂一圈灰白光晕；`a` 越小越信原色，避免除法把噪声放大。

轮廓锐度由「2 倍分辨率上锐化再降采样」控制（`SHARP_AMOUNT`），
这样边缘既实又带抗锯齿，不会露出二值遮罩的 1px 台阶。

两张图共用**同一张 alpha**，所以渐变揭示的过渡带上轮廓严丝合缝。

### 换素材

`src/components/MakeupReveal.tsx` 顶部：

```ts
const BASE = import.meta.env.BASE_URL       // 跟随构建 base，子目录部署也能取到
const BARE_PHOTO = `${BASE}portrait-bare.webp`
const STYLED_PHOTO = `${BASE}portrait-styled.webp`
```

唯一要求：两张图**构图完全一致**（同机位、同姿势、同裁切）。
不一致就先对齐，否则过渡带会抖；再跑一次 `blend.py` 让两张共用同一张遮罩。

### 产品图与「渐变开盖」

产品区没有摄影素材，四支容器是按器型**用 SVG 现画**的（`ProductVessel.tsx`），
所以"产品图"其实是可缩放的矢量图，白底上带极浅的玻璃底色与液面填充。

开盖用的是和人物揭示同一套遮罩逻辑，但拆成了两层：

| 层 | 内容 | 行为 |
|---|---|---|
| 下层 | 开盖态瓶身（瓶口、罐口、液面） | 常驻 |
| 上层 | 只有盖子 | 被 `linear-gradient` 遮罩从左侧擦掉，并随开度抬起、微旋 |

拆层是为了让"拖到一半"看起来像**盖子被推开一半**，而不是整只瓶子被切一道；
罐装那种盖子比罐口宽的器型，如果整只叠着做，会剩下一条小残片。

新增产品只要在 `src/lib/data.ts` 里加一条，并指定器型：

```ts
{ id: 'x', title: 'XXX', price: 0, tag: '', vessel: 'jar', inc: [], originId: 'kyoto', climate: '' }
```

`vessel` 可选 `dropper`（滴管瓶）/ `ampoule`（安瓶）/ `jar`（罐）/ `tube`（软管）。
要加新器型，就在 `ProductVessel.tsx` 里补一组 `Body` + `Cap`，两者共用同一 viewBox 和基线。

---

## 交互

| 交互 | 行为 |
|---|---|
| 点 `SHOP THE PROTOCOL` | 平滑滚到产品区 |
| 点产品里的 `ADD TO BAG` | 加购 + 右上角提示 |
| 鼠标在人像上左右划动 | 素颜↔全妆渐变揭示（不用按住） |
| 拖住商品丢到页面任意位置 | 加购（浮出 `DROP TO BAG` 落区） |
| 拖文件进来 | 明确拒绝并提示 |
| 点导航 CATALOG / ORIGINS / JOURNAL | 打开对应抽屉 |
| 点购物袋图标 | 打开购物袋，可移除、结算 |
| 点 logo | 关抽屉 + 滚回顶部 |
| `Esc` | 关闭抽屉 |
| 滚动超过 12px | 头部变白色毛玻璃 + 发丝线 |

---

## 四个抽屉

| 编号 | 面板 | 内容 |
|---|---|---|
| 01 | Catalog | 四个配方 · INCI 成分 · 产地气候 · ADD / 可拖拽 |
| 02 | Origins | 四个实验室（首尔 / 京都 / 里昂 / 苏黎世）+ 认证 |
| 03 | Editorial | 三条手记 |
| 04 | Shopping Bag | 商品 / 移除 / 小计 / 结算 |

---

## 光标揭示背景（首屏）

首屏的背景是双图层：底层纯白 + 极淡点阵；揭示层是六边形分子骨架 + 细网格 + 深色点阵，
只被光标处的圆形遮罩露出。滚动离开首屏后它仍是 `fixed`，所以整页都能看到聚光跟随。

- 指针缓动：`smooth += (mouse − smooth) * 0.1`
- 聚光半径：`clamp(160, 16vw, 420)`
- 径向渐变断点：`0 / .4 / .6 / .75 / .88 / 1`
- 掩膜画布缩到 `0.45` 再拉伸（渐变平滑，肉眼看不出，`toDataURL` 成本降约 5 倍）
- 指针静止不重绘；`< lg` 或 `prefers-reduced-motion` 下停掉 rAF

---

## 语言

**页面文案全英文。** `<html lang="en">`，正文、抽屉、提示条、产地说明、产品介绍全部英文。

验证脚本用三条断言守住这件事（`document.body.innerText` 不含 `[\u4e00-\u9fff]`）：

- 页面无中文（首屏）
- 目录抽屉无中文
- 产地抽屉无中文

源码里的注释仍是中文（不在页面上），需要的话可以一并转英文。

---

## 视觉规范

| 约束 | 落实 |
|---|---|
| 纯白 + 纯黑 + 灰阶 | `#fff` / `#000` / gray-200…600 / slate `#64748b` / 水印 `#ededf0` |
| 无紫、无米黄、无发光 | 照办 |
| 无装饰卡片 | 取景框只用四角括号，无底色填充 |
| 字号与间距全 clamp | `:root` 里 24 个变量 |
| 产品图形 | 线描 SVG，和线框地球同一套语言，四角带技术刻度 |

字体分工：Orbitron 管 logo、主标题、产品名、面板标题；Plus Jakarta Sans 管正文、导航、按钮、价格。

---

## 验证结果

`verify.mjs` 用 CDP 驱动真实 Edge，**60 项全通过**：

```
[1]  页面基础     标题 / 无 JS 异常 / 两套字体 / 文档可滚动 4390px
[2]  首屏构成     三行标题 / 恰好一屏 900px / 棋盘格 / 线框地球 / SCROLL 提示
[3]  分析已移除   无 INGEST / 无税率 / 无到岸价 / 无文件选择框
[4]  产品视差区   4 条目 / 4 支线描容器 / 编号 01–04 / 视差写入 transform
                 滚动后位移改变 / 三层速度不同 / 容器反向 / 带微旋转
[5]  吸顶头部     滚动后有底色 rgba(255,255,255,.86) / 固定在 top:0 / 顶部透明
[1]  页面基础     标题 / **页面无中文** / 无 JS 异常 / 两套字体 / 可滚动
[5.5] 妆容揭示    区块存在 / 两图已加载且尺寸一致 / 初始渐变遮罩
                 鼠标划动即改变（无需按下）/ 手柄跟到 72% /
                 百分比读数 / 键盘可调 / aria 属性 /
                 分割线默认透明 / 聚焦才显形 / 图片无外框 /
                 无角标 / 无划动提示 / 无百分比 / 四项产品带价格
[6]  截图         hero / products / closeup / catalog / bag / makeup
[7]  目录 + 加购   抽屉滑入 / 四配方 / 可拖拽 / 角标 / 提示
[8]  购物袋 + 结算 袋内商品 / 结算提示 / 清空
[9]  拖拽加购     落区 / 加购生效 / 文件被拒
[10] 产地 + 手记   四个实验室 / 三条手记
```

截图：`shots/01-hero.png` `02-products.png` `03-product-closeup.png` `04-catalog.png` `05-bag.png`

---

## 已知限制

| 限制 | 说明 |
|---|---|
| 无后端 | 购物袋存在内存里，刷新即清空；结算是本地提示，不产生订单 |
| 商品数据写死 | 在 `src/lib/data.ts`，没有接口也没有后台 |
| 视差在移动端较弱 | 只按 `prefers-reduced-motion` 关闭，未做触屏专用优化 |
| 拖拽只在桌面有效 | 触屏没有 HTML5 拖放，靠 ADD 按钮 |
| 产品图是线描 | 换成真实产品图要替换 `ProductVessel` |
| 人像是 AI 生成图 | 已裁掉水印；商用前请自行确认素材授权 |
| 揭示用固定羽化 | `FEATHER` 是常量，不是随拖动速度动态变化的 |
