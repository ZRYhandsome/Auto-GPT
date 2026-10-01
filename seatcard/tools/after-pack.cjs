// electron-builder 打完包以后执行。在 Linux、Mac 上打 Windows 包时，electron-builder 要靠 wine 才能改 exe 的
// 图标和版本信息；这里改用纯 JS 的 resedit 来改，这样任务栏、桌面快捷方式上显示的是座次桌签的图标。
// 在 Windows 上打包时 electron-builder 自己会改，这里就什么也不做。
const path = require('node:path');
const fs = require('node:fs');

module.exports = async function afterPack(context) {
  if (context.electronPlatformName !== 'win32' || process.platform === 'win32') return;
  const ResEdit = await import('resedit');
  const dir = context.appOutDir;
  const exes = fs.readdirSync(dir).filter((f) => f.toLowerCase().endsWith('.exe'));
  const exeName = exes.find((f) => f === 'SeatCard.exe') || exes.sort((a, b) => fs.statSync(path.join(dir, b)).size - fs.statSync(path.join(dir, a)).size)[0];
  const exePath = path.join(dir, exeName);
  const exe = ResEdit.NtExecutable.from(fs.readFileSync(exePath), { ignoreCert: true });
  const res = ResEdit.NtExecutableResource.from(exe);

  const iconFile = ResEdit.Data.IconFile.from(fs.readFileSync(path.join(context.packager.projectDir, 'build', 'icon.ico')));
  const groups = ResEdit.Resource.IconGroupEntry.fromEntries(res.entries);
  const target = groups[0] || { id: 1, lang: 1033 };
  ResEdit.Resource.IconGroupEntry.replaceIconsForResource(res.entries, target.id, target.lang, iconFile.icons.map((i) => i.data));

  const version = context.packager.appInfo.version;
  const [a = 0, b = 0, c = 0] = version.split('.').map((x) => parseInt(x, 10) || 0);
  const vis = ResEdit.Resource.VersionInfo.fromEntries(res.entries);
  const vi = vis[0] || ResEdit.Resource.VersionInfo.createEmpty();
  const langs = vi.getAllLanguagesForStringValues();
  const lang = langs[0] || { lang: 1033, codepage: 1200 };
  vi.setFileVersion(a, b, c, 0, lang.lang);
  vi.setProductVersion(a, b, c, 0, lang.lang);
  vi.setStringValues(lang, {
    FileDescription: '座次桌签',
    ProductName: '座次桌签',
    CompanyName: '座次桌签',
    LegalCopyright: '座次桌签',
    OriginalFilename: exeName,
    InternalName: 'SeatCard',
    FileVersion: version,
    ProductVersion: version,
  });
  vi.outputToResourceEntries(res.entries);
  res.outputResource(exe);
  fs.writeFileSync(exePath, Buffer.from(exe.generate()));
  console.log(`  • 已写入 ${exeName} 的图标和版本信息（图标组 ${target.id}）`);
};
