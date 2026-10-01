#!/usr/bin/env bash
# 需求雷达：用 MediaCrawler 按关键词抓多个平台的帖子和评论，再挑出需求信号。
#
# 用法：radar.sh [-p 平台列表] [-k 关键词] [-n 每个关键词的帖子数] [-c 每帖评论数] [-s] [-d 帖子链接] [-m 已有输出目录]
#   -p  平台，空格分隔，默认 "xhs zhihu dy bili wb tieba"
#       可选：xhs=小红书 dy=抖音 ks=快手 bili=B站 wb=微博 tieba=贴吧 zhihu=知乎
#   -k  关键词，英文逗号分隔；不给就读 keywords.txt
#   -n  每个关键词最多抓多少条帖子，默认 20（小红书最少 20）
#   -c  每条帖子最多抓多少条一级评论，默认 20
#   -s  同时抓楼中楼回复（更慢）
#   -d  深挖：不搜索，只把指定帖子的评论抓全。链接用英文逗号分隔，summary.md 末尾会给出现成命令。
#       只能指定一个平台（默认 xhs）；默认每帖 300 条一级评论，并抓楼中楼
#   -m  不抓取，只对已有的输出目录重新做合并和打分
# 例子：
#   radar.sh -p xhs -n 20 -c 10
#   radar.sh -p "xhs zhihu" -k "有没有app可以 记账,求推荐 记账软件"
#   radar.sh -p xhs -d "https://www.xiaohongshu.com/explore/帖子ID?xsec_token=..."
set -o pipefail

RADAR_HOME="${RADAR_HOME:-$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)}"
MC_DIR="$RADAR_HOME/MediaCrawler"
PY="$MC_DIR/.venv/bin/python"
PLATFORMS="xhs zhihu dy bili wb tieba"
KEYWORDS=""
NOTES=20
COMMENTS=20
SUB=no
MERGE_ONLY=""
DETAIL=""
P_SET=no
C_SET=no

while getopts "p:k:n:c:sd:m:h" opt; do
  case "$opt" in
    p) PLATFORMS="$OPTARG"; P_SET=yes ;;
    k) KEYWORDS="$OPTARG" ;;
    n) NOTES="$OPTARG" ;;
    c) COMMENTS="$OPTARG"; C_SET=yes ;;
    s) SUB=yes ;;
    d) DETAIL="$OPTARG" ;;
    m) MERGE_ONLY="$OPTARG" ;;
    *) sed -n '2,17p' "$0"; exit 0 ;;
  esac
done

[[ -x "$PY" ]] || { echo "没找到 MediaCrawler 的运行环境：$PY。请先运行 setup_mac.sh。"; exit 1; }

if [[ -n "$MERGE_ONLY" ]]; then
  "$PY" "$RADAR_HOME/merge.py" "$MERGE_ONLY"
  exit $?
fi

if [[ -n "$DETAIL" ]]; then
  [[ "$P_SET" == yes ]] || PLATFORMS="xhs"
  [[ "$(wc -w <<<"$PLATFORMS")" -eq 1 ]] || { echo "深挖模式一次只能指定一个平台，例如 -p xhs"; exit 1; }
  [[ "$C_SET" == yes ]] || COMMENTS=300
  SUB=yes
  MODE_ARGS=(--type detail --specified_id "$DETAIL")
  OUT="$RADAR_HOME/runs/$(date +%Y%m%d-%H%M%S)-deep"
  mkdir -p "$OUT"
  printf '%s\n' "$DETAIL" | tr ',' '\n' > "$OUT/posts_used.txt"
  echo "深挖帖子：$(wc -l < "$OUT/posts_used.txt" | tr -d ' ') 个，每帖最多 $COMMENTS 条一级评论，含楼中楼"
else
  if [[ -z "$KEYWORDS" ]]; then
    KW_FILE="$RADAR_HOME/keywords.txt"
    [[ -f "$KW_FILE" ]] || { echo "没有关键词：用 -k 指定，或在 $KW_FILE 里每行写一个。"; exit 1; }
    KEYWORDS="$(grep -v '^[[:space:]]*#' "$KW_FILE" | sed 's/^[[:space:]]*//;s/[[:space:]]*$//' | grep -v '^$' | paste -sd, -)"
  fi
  [[ -n "$KEYWORDS" ]] || { echo "关键词为空。"; exit 1; }
  MODE_ARGS=(--type search --keywords "$KEYWORDS")
  OUT="$RADAR_HOME/runs/$(date +%Y%m%d-%H%M%S)"
  mkdir -p "$OUT"
  printf '%s\n' "$KEYWORDS" | tr ',' '\n' > "$OUT/keywords_used.txt"
  echo "关键词：$KEYWORDS"
fi

echo "平台：  $PLATFORMS"
echo "输出：  $OUT"
echo "第一次跑某个平台时会弹出 Chrome 窗口，请用手机 App 扫码登录；遇到滑块验证就在窗口里手动拖一下。"

declare -a DONE=() FAILED=()
for p in $PLATFORMS; do
  echo
  echo "================ 开始：$p ================"
  if (cd "$MC_DIR" && "$PY" run_mc.py \
        --platform "$p" --lt qrcode "${MODE_ARGS[@]}" \
        --get_comment yes --get_sub_comment "$SUB" \
        --crawler_max_notes_count "$NOTES" \
        --max_comments_count_singlenotes "$COMMENTS" \
        --save_data_option jsonl --save_data_path "$OUT" \
        --headless no 2>&1 | tee -a "$OUT/crawl.log"); then
    DONE+=("$p")
  else
    FAILED+=("$p")
    echo "[$p] 出错了，跳过，继续下一个平台。日志在 $OUT/crawl.log"
  fi
done

echo
echo "================ 合并与打分 ================"
"$PY" "$RADAR_HOME/merge.py" "$OUT"
echo
echo "完成的平台：${DONE[*]:-无}"
[[ ${#FAILED[@]} -gt 0 ]] && echo "失败的平台：${FAILED[*]}（常见原因：没扫码登录、触发验证码、网络问题，重跑这个平台即可）"
[[ "$(uname)" == "Darwin" ]] && open "$OUT" 2>/dev/null
exit 0
