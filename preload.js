const { contextBridge, ipcRenderer } = require('electron');
contextBridge.exposeInMainWorld('silos', {
  settings: { get: () => ipcRenderer.invoke('settings:get'), set: (p) => ipcRenderer.invoke('settings:set', p), pickRoot: () => ipcRenderer.invoke('settings:pickRoot') },
  instances: { list: () => ipcRenderer.invoke('instances:list'), create: (d) => ipcRenderer.invoke('instances:create', d), delete: (id) => ipcRenderer.invoke('instances:delete', id), update: (id, p) => ipcRenderer.invoke('instances:update', id, p) },
  server: { start: (id) => ipcRenderer.invoke('server:start', id), stop: (id) => ipcRenderer.invoke('server:stop', id), kill: (id) => ipcRenderer.invoke('server:kill', id), command: (id, c) => ipcRenderer.invoke('server:command', id, c), isRunning: (id) => ipcRenderer.invoke('server:isRunning', id) },
  fs: { openFolder: (p) => ipcRenderer.invoke('fs:openFolder', p), pickFile: () => ipcRenderer.invoke('fs:pickFile') },
  app: { version: () => ipcRenderer.invoke('app:version'), openExternal: (u) => ipcRenderer.invoke('shell:openExternal', u) },
  on: (ch, cb) => { if (['console:line','instance:status'].includes(ch)) ipcRenderer.on(ch, (_e, d) => cb(d)); },
  off: (ch) => ipcRenderer.removeAllListeners(ch)
});
