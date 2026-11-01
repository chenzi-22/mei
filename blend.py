# -*- coding: utf-8 -*-
"""把人像从浅灰影棚背景里抠出来，导出带 alpha 的 RGBA（背景真透明）。

为什么不是一刀切
----------------
主体是「白针织衫 + 金发」，背景是「浅灰影棚」。两者明度只差 25 左右，
逐像素比色会同时踩到两个坑：衣服边缘被判成背景（白边）、
背景阴影被判成主体（灰晕）。所以分四步走：

1. 局部背景色场 B：布光有渐变，背景色不是常数。先把已确认的背景缩到 1/8，
   用扩散填充补出被主体挡住的位置，再放大模糊。
2. 轮廓先于颜色：`d = ‖C − B‖` 只用来判断「这是不是主体」，
   生成二值轮廓后做闭运算（补掉发丝间的小洞）再统一羽化。
   直接拿 d 当 alpha 的话，JPEG 的 1–2px 抖动会被放大成麻点。
3. 边缘去背景污染：F = (C − (1−a)·B) / a。不做这步，羽化带里留的是原图的灰背景色，
   贴到白底上就是一圈灰晕；做了这步又要注意 a 太小时除法会顶到 255。
4. 两张图共用同一张 alpha，保证渐变揭示时轮廓严丝合缝。

阈值是按这两张素材调出来的，换素材要重新看一眼边缘。
"""
import os
import sys
from collections import deque

import numpy as np
from PIL import Image, ImageFilter

sys.stdout.reconfigure(encoding="utf-8", errors="replace")

ROOT = r"G:\deepseek\liu\lumen"
SRC = os.path.join(ROOT, "_orig")
OUT = os.path.join(ROOT, "public")
NAMES = ("portrait-bare", "portrait-styled")

# ── 阈值 ──
SEED = 22.0       # 泛洪种子阈值：这么近的距离算「背景」
WARM_MAX = 5.0    # R-B 超过它算暖色主体（皮肤 / 头发 / 针织衫），泛洪在这里停步
SUBJ_D = 19.0     # 偏离背景色多少算主体。压低到 19：针织衫背光侧只比背景亮 25
SUBJ_WARM = 6.0   # 暖度辅助判据，用于低对比的发梢

# ── 轮廓锐度 ──
SHARP_AMOUNT = 0.9  # unsharp 强度：把 alpha 斜坡压陡，边更实


def load(name):
    return np.asarray(Image.open(os.path.join(SRC, name + ".jpg")).convert("RGB"), np.float32)


def flood(cand):
    """从四条边 BFS，返回与画面边缘连通的候选区域。"""
    H, W = cand.shape
    seen = np.zeros((H, W), bool)
    q = deque()

    def push(y, x):
        if cand[y, x] and not seen[y, x]:
            seen[y, x] = True
            q.append((y, x))

    for x in range(W):
        push(0, x)
        push(H - 1, x)
    for y in range(H):
        push(y, 0)
        push(y, W - 1)
    while q:
        y, x = q.popleft()
        if y > 0:
            push(y - 1, x)
        if y + 1 < H:
            push(y + 1, x)
        if x > 0:
            push(y, x - 1)
        if x + 1 < W:
            push(y, x + 1)
    return seen


def local_bg(img, known_mask, H, W):
    """扩散填充：已知背景处取原色，其余像素由邻域反复迭代推算，最后平滑放大。"""
    s = 8
    h, w = H // s, W // s
    small = np.asarray(Image.fromarray(img.astype(np.uint8)).resize((w, h), Image.BOX), np.float32)
    known = np.asarray(
        Image.fromarray((known_mask * 255).astype(np.uint8)).resize((w, h), Image.BOX), np.float32
    ) > 200

    field = np.where(known[..., None], small, np.nan)
    for _ in range(140):
        stack = np.stack(
            [np.roll(field, sh, axis=(0, 1)) for sh in ((1, 0), (-1, 0), (0, 1), (0, -1))]
        )
        # 用 nan 计数 + nansum 自己算平均，避免 np.nanmean 对全空邻域刷 RuntimeWarning
        cnt = (~np.isnan(stack[..., :1])).sum(axis=0)  # 只按一个通道计数即可
        avg = np.where(cnt > 0, np.nansum(stack, axis=0) / np.maximum(cnt, 1), np.nan)
        field = np.where(known[..., None], field, avg)

    bg_small = np.nan_to_num(field, nan=float(np.nanmedian(small)))
    bg_small_img = Image.fromarray(np.clip(bg_small, 0, 255).astype(np.uint8))
    bg_full = np.asarray(bg_small_img.resize((W, H), Image.BICUBIC), np.float32)
    return np.asarray(
        Image.fromarray(bg_full.astype(np.uint8)).filter(ImageFilter.GaussianBlur(6)), np.float32
    )


bare = load(NAMES[0])
H, W, _ = bare.shape
print(f"尺寸 {W}x{H}")

# 第 1 遍：用粗略全局背景找种子区
rough = np.median(
    np.concatenate([bare[: H // 12, : W // 8].reshape(-1, 3), bare[: H // 12, -W // 8:].reshape(-1, 3)]),
    axis=0,
)
d0 = np.sqrt(((bare - rough) ** 2).sum(axis=2))
warm = bare[:, :, 0] - bare[:, :, 2]
seed_mask = flood((d0 < 70) & (warm < WARM_MAX))

B = local_bg(bare, seed_mask, H, W)
print(f"局部背景色场：{B[0, 0].round(1).tolist()} … {B[-1, -1].round(1).tolist()}")

# 第 2 遍：用局部背景色场判断主体
d = np.sqrt(((bare - B) ** 2).sum(axis=2))
background = flood((d < SEED) & (warm < WARM_MAX))
print(f"与边缘连通的背景 {background.mean() * 100:.1f}%")

# ── 轮廓优先 ──
solid = ((d > SUBJ_D) | ((warm > SUBJ_WARM) & (d > SUBJ_D * 0.5))).astype(np.uint8) * 255
solid_img = Image.fromarray(solid)

# 在 2 倍分辨率上做形态学与锐化，再降采样回原尺寸：
# 1x 上直接锐化会露出二值遮罩的 1px 台阶，放大一倍做就等于给边缘做了超采样，
# 既锐又不带锯齿。下面所有核尺寸都是 2x 下的，等于 1x 的一半。
SS = 2
big = solid_img.resize((W * SS, H * SS), Image.NEAREST)
# 闭运算：补掉轮廓里的小洞（发丝之间的碎缝）。核放太大或太小都不行：
# 大了把细发丝磨圆，小了缝补不上，边缘会碎。
big = big.filter(ImageFilter.MaxFilter(9)).filter(ImageFilter.MinFilter(9))
# 先给一点点羽化做抗锯齿，再用 unsharp 把斜坡压陡——是「把坡做陡」，不是「把边切硬」
big = big.filter(ImageFilter.GaussianBlur(2.0))
a_big = np.asarray(big, np.float32) / 255.0
soft_big = np.asarray(big.filter(ImageFilter.GaussianBlur(2.8)), np.float32) / 255.0
a_big = np.clip(a_big + SHARP_AMOUNT * (a_big - soft_big), 0.0, 1.0)

alpha = np.asarray(
    Image.fromarray((a_big * 255.0).astype(np.uint8)).resize((W, H), Image.LANCZOS), np.float32
) / 255.0
alpha[alpha < 0.06] = 0.0

# 轮廓内部的小缝隙按背景处理（透出页面底色）——那是照片本身的取景。
# 试过硬填成不透明，白底上会勾出一圈亮边，比留着更假。
print(f"alpha: 全透明 {(alpha < 0.02).mean() * 100:.1f}%  不透明 {(alpha > 0.98).mean() * 100:.1f}%"
      f"  过渡带 {((alpha >= 0.02) & (alpha <= 0.98)).mean() * 100:.1f}%")

for name in NAMES:
    src = load(name)
    a = alpha[..., None]
    safe = np.maximum(a, 0.35)
    fg = np.clip((src - (1.0 - a) * B) / safe, 0, 255)
    # a 越小越信原色：除法在低 alpha 处会把噪声和亮度一起放大
    w = np.clip(a / 0.35, 0.0, 1.0)
    w = w * w * (3.0 - 2.0 * w)
    fg = src * (1.0 - w) + fg * w
    out = np.dstack([np.clip(fg, 0, 255), alpha * 255.0]).astype(np.uint8)

    master = os.path.join(SRC, name + "-alpha.png")
    Image.fromarray(out, "RGBA").save(master, optimize=True)

    p = os.path.join(OUT, name + ".webp")
    Image.fromarray(out, "RGBA").save(
        p, format="WEBP", quality=92, method=6, alpha_quality=100, exact=True
    )
    print(f"  {name}.webp  {os.path.getsize(p) / 1024:.0f} KB")

# ── 预览：贴到淡色底上，看轮廓有没有台阶或亮边 ──
prev = Image.open(os.path.join(SRC, NAMES[0] + "-alpha.png"))
board = Image.new("RGB", prev.size, (227, 234, 242))
board.paste(prev, (0, 0), prev)
board.save(os.path.join(SRC, "preview-cutout.png"))

strips = [prev.crop(c) for c in ((0, 380, 300, 680), (300, 980, 760, 1319), (700, 900, 1100, 1319))]
sheet = Image.new("RGB", (max(s.width for s in strips), sum(s.height for s in strips) + 32), (198, 212, 228))
y = 0
for s in strips:
    sheet.paste(s, (0, y), s)
    y += s.height + 16
sheet.save(os.path.join(SRC, "preview-edge.png"))
print("  预览 _orig/preview-cutout.png · _orig/preview-edge.png")
