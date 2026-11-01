/**
 * 构建包装：绕开 Windows 下 vite 探测网络驱动器时的 `exec("net use")`。
 *
 * 沙箱不允许「用管道捕获子进程输出」（spawn 直接 EPERM），
 * 而 vite 的 windowsSafeRealPathSync() 只是想知道有没有映射盘、并不需要 stdout。
 * 所以这里把这一条命令的 stdio 改成 ignore：不建管道，也就不会被拦。
 *
 *   node _build.mjs
 */
import { ChildProcess } from 'node:child_process'

const origSpawn = ChildProcess.prototype.spawn

ChildProcess.prototype.spawn = function spawn(options) {
  const args = options?.args || []
  if (Array.isArray(args) && args.some((a) => typeof a === 'string' && a.includes('net use'))) {
    options.stdio = ['ignore', 'ignore', 'ignore']
  }
  return origSpawn.call(this, options)
}

const { build } = await import('vite')
await build({ logLevel: 'info' })
