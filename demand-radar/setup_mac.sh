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
if [[ -f "$RADAR_HOME/keywords.txt" ]]; then
  ok "保留你已有的 keywords.txt"
else
  cp "$KIT_DIR/keywords.txt" "$RADAR_HOME/keywords.txt"
fi

say "自检"
if (cd "$MC_DIR" && RADAR_DRY_RUN=1 .venv/bin/python run_mc.py >/dev/null 2>&1); then ok "包装脚本正常"; else die "包装脚本自检失败"; fi
if (cd "$MC_DIR" && .venv/bin/python -c "import main" >/dev/null 2>&1); then ok "MediaCrawler 依赖齐全"; else die "MediaCrawler 导入失败，请在 $MC_DIR 里运行 .venv/bin/python -c 'import main' 查看报错"; fi

cat <<EOF

全部装好了。接下来：

  1. 按需修改关键词：open -e "$RADAR_HOME/keywords.txt"
  2. 先试一个平台：   "$RADAR_HOME/radar.sh" -p xhs -n 20 -c 10
     会弹出一个 Chrome 窗口，用手机上的小红书 App 扫码登录。登录只需一次，之后会记住。
  3. 跑全部平台：     "$RADAR_HOME/radar.sh"

结果在 $RADAR_HOME/runs/ 下按时间分文件夹，主要看 需求信号.xlsx 和 summary.md。
EOF
