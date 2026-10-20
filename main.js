const { app, BrowserWindow, ipcMain, dialog, shell } = require('electron');
const path = require('path');
const fs = require('fs');
const { spawn } = require('child_process');
const Store = require('electron-store');
const store = new Store({ defaults: { appRoot: '', theme: 'dark', javaPath: '', instances: [] } });
let mainWindow;
const running = new Map();
function createWindow() {
  mainWindow = new BrowserWindow({ width: 1280, height: 820, minWidth: 960, minHeight: 600, title: 'SilosMC', backgroundColor: '#0b1220', webPreferences: { preload: path.join(__dirname, 'preload.js'), contextIsolation: true, nodeIntegration: false } });
  mainWindow.loadFile(path.join(__dirname, 'src', 'renderer', 'index.html'));
  if (process.argv.includes('--dev')) mainWindow.webContents.openDevTools();
}
app.whenReady().then(createWindow);
app.on('window-all-closed', () => { for (const [, p] of running) try { p.kill(); } catch (e) {} if (process.platform !== 'darwin') app.quit(); });
app.on('activate', () => { if (BrowserWindow.getAllWindows().length === 0) createWindow(); });
function send(ch, payload) { if (mainWindow && !mainWindow.isDestroyed()) mainWindow.webContents.send(ch, payload); }
function getAppRoot() { return store.get('appRoot') || ''; }
function instanceDir(inst) { return path.join(getAppRoot(), 'instances', inst.id); }
ipcMain.handle('settings:get', () => ({ appRoot: store.get('appRoot'), theme: store.get('theme'), javaPath: store.get('javaPath') }));
ipcMain.handle('settings:set', (_e, patch) => { if (patch.appRoot !== undefined) store.set('appRoot', patch.appRoot); if (patch.theme !== undefined) store.set('theme', patch.theme); if (patch.javaPath !== undefined) store.set('javaPath', patch.javaPath); return true; });
ipcMain.handle('settings:pickRoot', async () => { const res = await dialog.showOpenDialog(mainWindow, { properties: ['openDirectory', 'createDirectory'] }); if (res.canceled || !res.filePaths.length) return null; const root = res.filePaths[0]; store.set('appRoot', root); for (const sub of ['instances','runtimes','backups','logs']) fs.mkdirSync(path.join(root, sub), { recursive: true }); return root; });
ipcMain.handle('instances:list', () => store.get('instances'));
ipcMain.handle('instances:create', (_e, data) => {
  const instances = store.get('instances');
  const id = 'inst_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
  const inst = { id, name: data.name || 'New Server', type: data.type || 'paper', version: data.version || 'latest', port: data.port || 25565, ram: data.ram || 2048, seed: data.seed || '', gamemode: data.gamemode || 'survival', difficulty: data.difficulty || 'normal', maxPlayers: data.maxPlayers || 20, eula: !!data.eula, autoStart: !!data.autoStart, createdAt: new Date().toISOString(), status: 'stopped' };
  instances.push(inst); store.set('instances', instances);
  const dir = instanceDir(inst); fs.mkdirSync(dir, { recursive: true }); fs.mkdirSync(path.join(dir, 'world'), { recursive: true }); fs.mkdirSync(path.join(dir, 'mods'), { recursive: true }); fs.mkdirSync(path.join(dir, 'plugins'), { recursive: true });
  fs.writeFileSync(path.join(dir, 'server.properties'), ['server-port=' + inst.port, 'gamemode=' + inst.gamemode, 'difficulty=' + inst.difficulty, 'max-players=' + inst.maxPlayers, 'level-seed=' + inst.seed, 'motd=' + inst.name, 'enable-rcon=true', 'rcon.port=' + (inst.port + 10), 'rcon.password=silosmc'].join('\n') + '\n');
  fs.writeFileSync(path.join(dir, 'eula.txt'), 'eula=' + (inst.eula ? 'TRUE' : 'FALSE') + '\n');
  return inst;
});
ipcMain.handle('instances:delete', (_e, id) => { store.set('instances', store.get('instances').filter(i => i.id !== id)); const dir = path.join(getAppRoot(), 'instances', id); if (fs.existsSync(dir)) fs.rmSync(dir, { recursive: true, force: true }); if (running.has(id)) { try { running.get(id).kill(); } catch (e) {} running.delete(id); } return true; });
ipcMain.handle('instances:update', (_e, id, patch) => { const instances = store.get('instances'); const idx = instances.findIndex(i => i.id === id); if (idx === -1) return null; Object.assign(instances[idx], patch); store.set('instances', instances); return instances[idx]; });
function javaCmd() { const j = store.get('javaPath'); return j && fs.existsSync(j) ? j : 'java'; }
ipcMain.handle('server:start', async (_e, id) => {
  const inst = store.get('instances').find(i => i.id === id); if (!inst) return { ok: false, error: 'Instance not found' }; if (running.has(id)) return { ok: false, error: 'Already running' };
  const dir = instanceDir(inst);
  const candidates = ['server.jar', 'paper.jar', 'fabric-server-launch.jar', 'forge-server.jar'];
  let jar = null; for (const c of candidates) { const p = path.join(dir, c); if (fs.existsSync(p)) { jar = p; break; } }
  if (!jar) { const jars = fs.readdirSync(dir).filter(f => f.endsWith('.jar')); if (jars.length) jar = path.join(dir, jars[0]); }
  if (!jar) { send('console:line', { id, line: '[SilosMC] No server jar found in ' + dir + '. Place a server.jar there.', level: 'warn' }); return { ok: false, error: 'No server jar' }; }
  const proc = spawn(javaCmd(), ['-Xmx' + inst.ram + 'M', '-Xms512M', '-jar', jar, 'nogui'], { cwd: dir, stdio: ['pipe', 'pipe', 'pipe'] });
  running.set(id, proc);
  const instances = store.get('instances'); const i = instances.find(x => x.id === id); if (i) { i.status = 'starting'; store.set('instances', instances); } send('instance:status', { id, status: 'starting' });
  proc.stdout.on('data', (d) => d.toString().split(/\r?\n/).filter(Boolean).forEach(line => send('console:line', { id, line, level: 'info' })));
  proc.stderr.on('data', (d) => d.toString().split(/\r?\n/).filter(Boolean).forEach(line => send('console:line', { id, line, level: 'error' })));
  proc.on('exit', (code) => { running.delete(id); const instances = store.get('instances'); const i = instances.find(x => x.id === id); if (i) { i.status = 'stopped'; store.set('instances', instances); } send('instance:status', { id, status: 'stopped' }); send('console:line', { id, line: '[SilosMC] Server exited with code ' + code, level: 'warn' }); });
  let readySent = false; proc.stdout.on('data', (d) => { if (!readySent && /Done \(/.test(d.toString())) { readySent = true; const instances = store.get('instances'); const i = instances.find(x => x.id === id); if (i) { i.status = 'running'; store.set('instances', instances); } send('instance:status', { id, status: 'running' }); } });
  return { ok: true };
});
ipcMain.handle('server:stop', async (_e, id) => { const proc = running.get(id); if (!proc) return { ok: false, error: 'Not running' }; try { proc.stdin.write('stop\n'); } catch (e) {} setTimeout(() => { try { proc.kill('SIGTERM'); } catch (e) {} }, 15000); return { ok: true }; });
ipcMain.handle('server:kill', async (_e, id) => { const proc = running.get(id); if (proc) { try { proc.kill('SIGKILL'); } catch (e) {} running.delete(id); } return { ok: true }; });
ipcMain.handle('server:command', async (_e, id, cmd) => { const proc = running.get(id); if (!proc) return { ok: false, error: 'Not running' }; try { proc.stdin.write(cmd + '\n'); return { ok: true }; } catch (e) { return { ok: false, error: e.message }; } });
ipcMain.handle('server:isRunning', (_e, id) => running.has(id));
ipcMain.handle('fs:openFolder', (_e, p) => { shell.openPath(p); return true; });
ipcMain.handle('fs:pickFile', async () => { const res = await dialog.showOpenDialog(mainWindow, { properties: ['openFile'] }); if (res.canceled) return null; return res.filePaths[0]; });
ipcMain.handle('app:version', () => app.getVersion());
ipcMain.handle('shell:openExternal', (_e, url) => { shell.openExternal(url); return true; });
