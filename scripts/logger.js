'use strict';

/**
 * 日志记录系统
 * 支持控制台输出 + 文件滚动存储，记录资源同步、更新和替换全过程
 */

const fs = require('fs');
const path = require('path');

const LEVELS = { debug: 10, info: 20, warn: 30, error: 40 };
const LEVEL_NAMES = { 10: 'DEBUG', 20: 'INFO', 30: 'WARN', 40: 'ERROR' };

class Logger {
  constructor(options = {}) {
    this.level = LEVELS[options.level] || LEVELS.info;
    this.console = options.console !== false;
    this.file = options.file !== false;
    this.logDir = options.dir || 'logs';
    this.maxFiles = options.maxFiles || 14;
    this.component = options.component || 'app';

    if (this.file) {
      this._ensureLogDir();
    }
  }

  _ensureLogDir() {
    if (!fs.existsSync(this.logDir)) {
      fs.mkdirSync(this.logDir, { recursive: true });
    }
  }

  _logFile() {
    const today = new Date().toISOString().slice(0, 10);
    return path.join(this.logDir, `${today}.log`);
  }

  _rotateIfNeeded() {
    if (!this.file || this.maxFiles <= 0) return;
    try {
      const files = fs.readdirSync(this.logDir).filter(f => f.endsWith('.log'));
      if (files.length <= this.maxFiles) return;
      files.sort();
      const toDelete = files.slice(0, files.length - this.maxFiles);
      for (const f of toDelete) {
        fs.unlinkSync(path.join(this.logDir, f));
      }
    } catch (e) {
      // 旋转失败不影响主流程
    }
  }

  _write(level, message, meta) {
    if (LEVELS[level] < this.level) return;

    const timestamp = new Date().toISOString();
    const levelName = LEVEL_NAMES[LEVELS[level]];
    const metaStr = meta ? ' ' + JSON.stringify(meta) : '';
    const line = `[${timestamp}] [${levelName}] [${this.component}] ${message}${metaStr}`;

    if (this.console) {
      const stream = level === 'error' ? process.stderr : process.stdout;
      stream.write(line + '\n');
    }

    if (this.file) {
      try {
        fs.appendFileSync(this._logFile(), line + '\n', 'utf8');
      } catch (e) {
        // 文件写入失败时仅输出到控制台
        if (this.console) {
          process.stderr.write(`[LOGGER ERROR] 无法写入日志文件: ${e.message}\n`);
        }
      }
    }
  }

  debug(message, meta) { this._write('debug', message, meta); }
  info(message, meta) { this._write('info', message, meta); }
  warn(message, meta) { this._write('warn', message, meta); }
  error(message, meta) { this._write('error', message, meta); }

  /** 创建子日志记录器，自动附加 component 前缀 */
  child(component) {
    return new Logger({
      level: Object.keys(LEVELS).find(k => LEVELS[k] === this.level),
      console: this.console,
      file: this.file,
      dir: this.logDir,
      maxFiles: this.maxFiles,
      component: `${this.component}:${component}`,
    });
  }

  /** 清理超出保留数量的旧日志文件 */
  rotate() {
    this._rotateIfNeeded();
  }
}

/** 从配置文件创建 Logger 实例 */
function createFromConfig(configPath) {
  const cfg = JSON.parse(fs.readFileSync(configPath, 'utf8'));
  const logCfg = cfg.logging || {};
  return new Logger({
    level: logCfg.level || 'info',
    dir: logCfg.dir || 'logs',
    maxFiles: logCfg.maxFiles || 14,
    console: logCfg.console !== false,
    file: logCfg.file !== false,
    component: 'main',
  });
}

module.exports = { Logger, createFromConfig };
