/**
 * Toast 通知组合式函数
 * 全局单例，支持 success / error / warning / info 四种类型
 */
import { ref, readonly } from 'vue';

const toasts = ref([]);
let idCounter = 0;

function add(message, type = 'info', duration = 3000) {
  const id = ++idCounter;
  toasts.value.push({ id, message, type, duration });
  if (duration > 0) {
    setTimeout(() => remove(id), duration);
  }
  return id;
}

function remove(id) {
  const index = toasts.value.findIndex((t) => t.id === id);
  if (index > -1) {
    toasts.value.splice(index, 1);
  }
}

function success(message, duration) { return add(message, 'success', duration); }
function error(message, duration) { return add(message, 'error', duration || 4000); }
function warning(message, duration) { return add(message, 'warning', duration); }
function info(message, duration) { return add(message, 'info', duration); }

export function useToast() {
  return {
    toasts: readonly(toasts),
    show: add,
    success,
    error,
    warning,
    info,
    remove,
  };
}
