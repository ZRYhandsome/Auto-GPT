// 桌签版式与字号。单位一律为毫米。
//
// 双面桌签的做法：一张纸上下两面，上面一面的字倒过来印，对折立起后两边都是正的。
// 这正是 Word 里最折腾人的一步（"文字旋转不过来""保存以后就没有翻转了"），这里直接画好。

export const A4 = { w: 210, h: 297 };

export const PRESETS = {
  'a4-fold2': { label: 'A4 横向对折（一页一人，最常用）', faceW: 297, faceH: 105, faces: 2 },
  'a4-fold3': { label: 'A4 三折三角立牌（一页一人）', faceW: 297, faceH: 70, faces: 3 },
  'card-200x100': { label: '台卡插页 200×100（一页一人）', faceW: 200, faceH: 100, faces: 2 },
  'card-180x70': { label: '小号台卡 180×70（一页两人）', faceW: 180, faceH: 70, faces: 2 },
};

/**
 * 计算一页纸怎么摆：每张桌签纸 sheet = faceW × (faceH × faces)，在 A4 竖放或横放里排尽量多张。
 * 返回 { page:{w,h,landscape}, sheet:{w,h}, slots:[{x,y}], faces:[{y,h,flip,blank}] }
 */
export function sheetLayout({ faceW, faceH, faces = 2 }) {
  const sheet = { w: faceW, h: faceH * faces };
  const fit = (pw, ph) => Math.floor(pw / sheet.w) * Math.floor(ph / sheet.h);
  const portrait = fit(A4.w, A4.h);
  const landscape = fit(A4.h, A4.w);
  if (!portrait && !landscape) throw new Error(`桌签 ${faceW}×${faceH * faces} 毫米放不进一张 A4 纸`);
  const useLandscape = landscape > portrait;
  const page = useLandscape ? { w: A4.h, h: A4.w, landscape: true } : { w: A4.w, h: A4.h, landscape: false };
  const cols = Math.floor(page.w / sheet.w);
  const rowsN = Math.floor(page.h / sheet.h);
  const offX = (page.w - cols * sheet.w) / 2;
  const offY = (page.h - rowsN * sheet.h) / 2;
  const slots = [];
  for (let r = 0; r < rowsN; r++) for (let c = 0; c < cols; c++) slots.push({ x: offX + c * sheet.w, y: offY + r * sheet.h });
  // 两面：上面倒印、下面正印；三折：第一面倒印、第二面正印、第三面留作底座
  const faceList = [];
  for (let i = 0; i < faces; i++) faceList.push({ y: i * faceH, h: faceH, flip: i === 0, blank: faces === 3 && i === 2 });
  return { page, sheet, slots, faces: faceList };
}

/** 把名单分页：每页放 slots.length 张。 */
export function paginate(people, perPage) {
  const pages = [];
  for (let i = 0; i < people.length; i += perPage) pages.push(people.slice(i, i + perPage));
  return pages;
}

/**
 * 名字字号：在宽 boxW、高 boxH 的框里尽量大。
 * measure(text) 返回字号为 1 时文字的宽度（不含字距）；spacing 为字距（em）。
 * 两字名默认加宽字距，看起来和三字名一样匀称；四字以上自动缩小，不会溢出。
 */
export function fitFontSize(text, { boxW, boxH, spacing = 0, measure = defaultMeasure }) {
  const n = [...text].length;
  const widthPerSize = measure(text) + spacing * Math.max(n - 1, 0);
  if (widthPerSize <= 0) return boxH;
  return Math.min(boxW / widthPerSize, boxH);
}

/** 没有浏览器时的近似：汉字和全角字符宽 1em，其余 0.55em。 */
export function defaultMeasure(text) {
  let w = 0;
  for (const ch of text) w += /[⺀-鿿＀-￯]/.test(ch) ? 1 : 0.55;
  return w;
}

export function nameSpacing(name, { widenTwo = true } = {}) {
  return widenTwo && [...name].length === 2 ? 0.8 : 0.08;
}

/** 一面桌签里名字和副标题（职务或单位）的位置和字号。 */
export function faceText(person, face, { faceW, sub = 'none', measure = defaultMeasure, widenTwo = true } = {}) {
  const subText = sub === 'title' ? person.title : sub === 'unit' ? person.unit : '';
  const marginX = faceW * 0.08;
  const boxW = faceW - marginX * 2;
  // 名字高度约占一面的一半（A4 对折时约 52 毫米，和常见教程里的 140 号字相当）
  const nameBoxH = face.h * (subText ? 0.42 : 0.5);
  const spacing = nameSpacing(person.name, { widenTwo });
  const nameSize = fitFontSize(person.name, { boxW, boxH: nameBoxH, spacing, measure });
  const out = { name: person.name, nameSize, spacing, sub: subText || '', subSize: 0 };
  if (subText) out.subSize = fitFontSize(subText, { boxW, boxH: face.h * 0.13, spacing: 0.05, measure });
  // 竖直方向：名字和副标题作为一组居中，略微下沉（立起来时视线略高于桌面）
  const gap = subText ? face.h * 0.06 : 0;
  const blockH = nameSize + (subText ? gap + out.subSize : 0);
  const top = (face.h - blockH) / 2 + face.h * 0.02;
  out.nameBaseline = top + nameSize * 0.88;
  out.subBaseline = subText ? top + nameSize + gap + out.subSize * 0.88 : 0;
  return out;
}
