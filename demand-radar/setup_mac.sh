#!/usr/bin/env bash
# 需求雷达：在 macOS 上一键安装 MediaCrawler 和需求雷达脚本。
# 可以重复运行：已装好的部分会跳过，MediaCrawler 会更新到最新版。
# 安装位置默认是 ~/demand-radar，可用环境变量 RADAR_HOME 修改。
set -euo pipefail

RADAR_HOME="${RADAR_HOME:-$HOME/demand-radar}"
KIT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
MC_DIR="$RADAR_HOME/MediaCrawler"
MC_REPO="https://github.com/NanmiCoder/MediaCrawler.git"
export PATH="$HOME/.local/bin:/opt/homebrew/bin:/usr/local/bin:$PATH"

say()  { printf '\n\033[1;34m==> %s\033[0m\n' "$*"; }
ok()   { printf '\033[1;32m[完成]\033[0m %s\n' "$*"; }
warn() { printf '\033[1;33m[注意]\033[0m %s\n' "$*"; }
die()  { printf '\033[1;31m[失败]\033[0m %s\n' "$*"; exit 1; }

[[ "$(uname)" == "Darwin" ]] || warn "这个脚本按 macOS 写的。Linux 大多也能用，Windows 请看 README 手动安装。"

say "检查基础工具"
command -v git >/dev/null || die "没有 git。先在终端运行 xcode-select --install，装完再重跑本脚本。"
ok "git $(git --version | awk '{print $3}')"

if ! command -v uv >/dev/null; then
  say "安装 uv（Python 环境管理器，会自动下载需要的 Python 版本）"
  curl -LsSf https://astral.sh/uv/install.sh | sh
  export PATH="$HOME/.local/bin:$PATH"
fi
command -v uv >/dev/null || die "uv 安装失败，请手动安装：https://docs.astral.sh/uv/getting-started/installation/"
ok "uv $(uv --version | awk '{print $2}')"

node_ok=0
if command -v node >/dev/null; then
  major="$(node -p 'process.versions.node.split(".")[0]' 2>/dev/null || echo 0)"
  [[ "$major" -ge 16 ]] && node_ok=1
fi
if [[ $node_ok -eq 0 ]]; then
  if command -v brew >/dev/null; then
    say "安装 Node.js（抖音、知乎的请求签名需要它）"
    brew install node
  else
    die "需要 Node.js 16 以上。请到 https://nodejs.org 下载 LTS 版安装后重跑本脚本。"
  fi
fi
ok "node $(node --version)"

CHROME="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
if [[ "$(uname)" == "Darwin" && ! -x "$CHROME" ]]; then
  die "没找到 Google Chrome。请先安装 Chrome：https://www.google.com/chrome/"
fi
ok "Chrome 已安装"

mkdir -p "$RADAR_HOME/runs"
if [[ -d "$MC_DIR/.git" ]]; then
  say "更新 MediaCrawler"
  git -C "$MC_DIR" checkout -- uv.lock pyproject.toml 2>/dev/null || true
  git -C "$MC_DIR" pull --ff-only || warn "更新失败，继续使用现有版本"
else
  say "下载 MediaCrawler"
  git clone --depth 1 "$MC_REPO" "$MC_DIR"
fi
ok "MediaCrawler $(git -C "$MC_DIR" log -1 --format='%h %cd' --date=short)"

say "安装 Python 依赖（首次需要几分钟）"
# 项目默认用清华镜像；连不上时自动改用官方 PyPI
if ! (cd "$MC_DIR" && uv sync); then
  warn "清华镜像不可用，改用官方 PyPI 重试"
  (cd "$MC_DIR" && uv sync --default-index https://pypi.org/simple) || die "依赖安装失败，请把上面的报错发给我"
fi
ok "依赖安装完成"

say "安装需求雷达脚本到 $RADAR_HOME"
cp "$KIT_DIR/run_mc.py" "$MC_DIR/run_mc.py"
cp "$KIT_DIR/radar.sh" "$KIT_DIR/merge.py" "$KIT_DIR/README.md" "$RADAR_HOME/"
chmod +x "$RADAR_HOME/radar.sh"
# 关键词：没改过默认关键词就换成新版默认，改过就保留
KW="$RADAR_HOME/keywords.txt"
KW_DEFAULT="$RADAR_HOME/.keywords.default"
is_first_default() {
  cmp -s "$1" - <<'OLD'
# 需求雷达的搜索关键词：每行一个，井号开头的行会被忽略。
# 选词原则：像用户在求助、在抱怨、在问"为什么没有"的原话。
# 想聚焦某个领域时，在后面加一个领域词，例如：有没有app可以 记账
有没有app可以
有没有软件可以
求推荐一个软件
为什么没有人做
一直没找到好用的
谁能开发一个
OLD
}
if [[ ! -f "$KW" ]] || cmp -s "$KW" "$KW_DEFAULT" || is_first_default "$KW"; then
  cp "$KIT_DIR/keywords.txt" "$KW"
  ok "已装好默认关键词"
elif ! cmp -s "$KW" "$KIT_DIR/keywords.txt"; then
  ok "保留你改过的 keywords.txt（新版默认关键词在 $KIT_DIR/keywords.txt）"
fi
cp "$KIT_DIR/keywords.txt" "$KW_DEFAULT"

say "安装需求雷达软件"
# 软件本体整个替换；设置、关键词组存在 $RADAR_HOME/app_settings.json，不受影响
rm -rf "$RADAR_HOME/app"
cp -R "$KIT_DIR/app" "$RADAR_HOME/app"
find "$RADAR_HOME/app" -name "__pycache__" -type d -prune -exec rm -rf {} + 2>/dev/null || true
# pywebview：用独立窗口打开软件（装不上就用浏览器打开，功能一样）；trafilatura：抓任意网页时提取正文
if uv pip install --python "$MC_DIR/.venv/bin/python" pywebview trafilatura >/dev/null 2>&1 \
   || uv pip install --python "$MC_DIR/.venv/bin/python" --index-url https://pypi.org/simple pywebview trafilatura >/dev/null 2>&1; then
  ok "独立窗口组件已装好"
else
  warn "pywebview 没装上，软件会在浏览器里打开，功能不受影响"
fi
# anthropic：「线索与回复」里 AI 判断、写回复要用（装不上不影响采集）
if uv pip install --python "$MC_DIR/.venv/bin/python" anthropic >/dev/null 2>&1 \
   || uv pip install --python "$MC_DIR/.venv/bin/python" --index-url https://pypi.org/simple anthropic >/dev/null 2>&1; then
  ok "AI 组件（anthropic）已装好"
else
  warn "anthropic 没装上：「线索与回复」里的 AI 判断用不了，采集不受影响。可以稍后重跑本脚本"
fi

# 在"应用程序"里放一个能双击打开的 需求雷达.app（启动台、聚焦搜索都能找到）
if [[ "$(uname)" == "Darwin" ]]; then
  APP="$HOME/Applications/需求雷达.app"
  rm -rf "$APP"
  mkdir -p "$APP/Contents/MacOS" "$APP/Contents/Resources"
  cat > "$APP/Contents/Info.plist" <<PLIST
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0"><dict>
  <key>CFBundleName</key><string>需求雷达</string>
  <key>CFBundleDisplayName</key><string>需求雷达</string>
  <key>CFBundleIdentifier</key><string>cn.demandradar.app</string>
  <key>CFBundleExecutable</key><string>radar</string>
  <key>CFBundleIconFile</key><string>icon</string>
  <key>CFBundlePackageType</key><string>APPL</string>
  <key>CFBundleShortVersionString</key><string>0.4.1</string>
  <key>LSMinimumSystemVersion</key><string>11.0</string>
  <key>NSHighResolutionCapable</key><true/>
</dict></plist>
PLIST
  cat > "$APP/Contents/MacOS/radar" <<LAUNCH
#!/bin/bash
# 需求雷达启动器：用 MediaCrawler 的 Python 运行软件。从启动台打开时 PATH 很短，补上 Homebrew 的路径（抖音、知乎的签名要用 node）
export RADAR_HOME="$RADAR_HOME"
export PATH="\$HOME/.local/bin:/opt/homebrew/bin:/usr/local/bin:\$PATH"
cd "$RADAR_HOME/app" || exit 1
exec "$MC_DIR/.venv/bin/python" server.py >> "$RADAR_HOME/app.log" 2>&1
LAUNCH
  chmod +x "$APP/Contents/MacOS/radar"
  # 图标：用系统自带的 sips 和 iconutil 把 PNG 做成 icns
  ICONSET="$(mktemp -d)/icon.iconset"
  mkdir -p "$ICONSET"
  for sz in 16 32 128 256 512; do
    sips -z $sz $sz "$RADAR_HOME/app/icon.png" --out "$ICONSET/icon_${sz}x${sz}.png" >/dev/null 2>&1 || true
    sips -z $((sz * 2)) $((sz * 2)) "$RADAR_HOME/app/icon.png" --out "$ICONSET/icon_${sz}x${sz}@2x.png" >/dev/null 2>&1 || true
  done
  iconutil -c icns "$ICONSET" -o "$APP/Contents/Resources/icon.icns" 2>/dev/null || cp "$RADAR_HOME/app/icon.png" "$APP/Contents/Resources/icon.png"
  touch "$APP"
  ok "已放进「应用程序」：$APP"
fi

say "自检"
if (cd "$MC_DIR" && RADAR_DRY_RUN=1 .venv/bin/python run_mc.py >/dev/null 2>&1); then ok "包装脚本正常"; else die "包装脚本自检失败"; fi
if (cd "$MC_DIR" && .venv/bin/python -c "import main" >/dev/null 2>&1); then ok "MediaCrawler 依赖齐全"; else die "MediaCrawler 导入失败，请在 $MC_DIR 里运行 .venv/bin/python -c 'import main' 查看报错"; fi
if (cd "$RADAR_HOME/app" && "$MC_DIR/.venv/bin/python" -c "import server, run_source" >/dev/null 2>&1); then ok "需求雷达软件正常"; else die "需求雷达软件自检失败，请在 $RADAR_HOME/app 里运行 $MC_DIR/.venv/bin/python server.py 查看报错"; fi

cat <<EOF

全部装好了。

  打开软件：在启动台里点"需求雷达"，或者在终端运行  open ~/Applications/需求雷达.app
           选平台、填关键词、点"开始采集"就行。国内平台第一次会弹出 Chrome 窗口，用手机 App 扫码登录。
           想找需要你产品的人：在"设置 → 线索与回复"里填好 Anthropic API key 和产品资料，再打开"线索与回复"。

  也还可以用命令行：
    "$RADAR_HOME/radar.sh" -p xhs -n 20 -c 10

结果都在 $RADAR_HOME/runs/ 下按时间分文件夹，软件和命令行跑出来的都能在软件里看到。
EOF
if [[ "$(uname)" == "Darwin" && -d "$HOME/Applications/需求雷达.app" ]]; then open "$HOME/Applications/需求雷达.app"; fi
